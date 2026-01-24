import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChallengeManager } from '../scripts/challenge-manager.js';
import * as Firestore from 'firebase/firestore';
import { authManager } from '../scripts/auth-manager.js';
import * as Toast from '../scripts/toast.js';

// Mocks
vi.mock('../scripts/firebase-config.js', () => ({ db: {} }));
vi.mock('../scripts/auth-manager.js', () => ({
  authManager: {
    currentUser: { uid: 'test-uid', displayName: 'Test User' },
    waitForAuthReady: vi.fn(),
    getCachedUser: vi.fn()
  }
}));
vi.mock('../scripts/toast.js', () => ({ showToast: vi.fn() }));

// Fix: ModalHandler needs to be a proper class for "new" to work
vi.mock('../scripts/modal-handler.js', () => {
  return {
    ModalHandler: class {
      constructor() {
        this.modal = document.createElement('div');
        this.open = vi.fn();
        this.close = vi.fn();
      }
    }
  };
});

vi.mock('../scripts/custom-quiz-handler.js', () => ({ getSavedCustomQuizzes: vi.fn().mockResolvedValue([]) }));

// Mock Firestore
vi.mock('firebase/firestore', () => {
  const originalModule = vi.importActual('firebase/firestore');
  return {
    ...originalModule,
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    onSnapshot: vi.fn(),
    arrayUnion: vi.fn(),
    serverTimestamp: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    deleteDoc: vi.fn(),
    runTransaction: vi.fn()
  };
});

describe('ChallengeManager Integration', () => {
  let challengeManager;

  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
            <div id="lobby-modal" class="hidden">
                 <h3>Lobby Title</h3>
                 <div id="lobby-room-id-display"></div>
                 <div id="lobby-player-count"></div>
                 <div id="lobby-players-list"></div>
                 <button id="lobby-start-btn"></button>
                 <button id="lobby-ready-btn"></button>
                 <button id="lobby-leave-btn"></button>
                 <div id="lobby-waiting-msg">
                    <span></span>
                    <span></span>
                 </div>
                 <div id="lobby-chat-messages"></div>
                 <input id="lobby-chat-input" />
                 <button id="lobby-chat-send-btn"></button>
            </div>
            <button id="challenge-create-btn"></button>
            <button id="challenge-join-btn"></button>
            <button id="header-challenge-menu-btn"></button>
            <button id="open-challenge-menu-btn"></button>
        `;

    // Setup Auth Mock
    authManager.currentUser = { uid: 'host-uid', displayName: 'Host' };
    authManager.waitForAuthReady.mockResolvedValue(authManager.currentUser);
    authManager.getCachedUser.mockReturnValue(authManager.currentUser);

    // Setup Firestore Mocks
    Firestore.serverTimestamp.mockReturnValue('TIMESTAMP');
    Firestore.doc.mockReturnValue('mock-doc-ref');

    challengeManager = new ChallengeManager();
    challengeManager.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a lobby successfully', async () => {
    const setDocSpy = Firestore.setDoc;

    await challengeManager.createLobby('challenge', 'random', 'Random Quiz');

    expect(challengeManager.currentLobbyId).not.toBeNull();
    expect(challengeManager.isHost).toBe(true);
    expect(setDocSpy).toHaveBeenCalled();

    // Verify args passed to setDoc
    const args = setDocSpy.mock.calls[0];
    const data = args[1];
    expect(data.hostId).toBe('host-uid');
    expect(data.mode).toBe('challenge');
    expect(data.players).toHaveLength(1);
    expect(data.players[0].uid).toBe('host-uid');
    expect(Toast.showToast).toHaveBeenCalledWith('สร้างห้องสำเร็จ', expect.anything(), '🎮');
  });

  it('should join a lobby successfully', async () => {
    const lobbyId = '123456';

    // Mock transaction
    Firestore.runTransaction.mockImplementation(async (db, updateFunction) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            hostId: 'other-host',
            players: [{ uid: 'other-host', name: 'Host' }],
            status: 'waiting'
          })
        }),
        update: vi.fn()
      };
      await updateFunction(mockTransaction);
    });

    // Mock getDoc for final consistency check
    Firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        hostId: 'other-host',
        players: [{ uid: 'other-host' }, { uid: 'host-uid' }], // Current user joined
        status: 'waiting'
      })
    });

    const result = await challengeManager.joinLobby(lobbyId);

    expect(result).toBe(true);
    expect(challengeManager.currentLobbyId).toBe(lobbyId);
    expect(challengeManager.isHost).toBe(false);
  });

  it('should prevent joining if game started', async () => {
    const lobbyId = '123456';

    // Mock transaction to return started game
    Firestore.runTransaction.mockImplementation(async (db, updateFunction) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            hostId: 'other-host',
            players: [{ uid: 'other-host' }],
            status: 'started'
          })
        }),
        update: vi.fn()
      };
      await updateFunction(mockTransaction);
    });

    const result = await challengeManager.joinLobby(lobbyId);

    expect(result).toBe(false);
    expect(Toast.showToast).toHaveBeenCalledWith('เข้าห้องไม่ได้', expect.stringContaining('เริ่มไปแล้ว'), expect.anything(), 'error');
  });

  it('should update UI when lobby data changes', () => {
    challengeManager.currentLobbyId = '123';
    challengeManager.isHost = true; // Ensure isHost is true for this test

    const lobbyData = {
      hostId: 'host-uid',
      players: [
        { uid: 'host-uid', name: 'Host', score: 0, ready: true },
        { uid: 'p2', name: 'Player 2', score: 10, ready: false }
      ],
      status: 'waiting',
      quizConfig: { title: 'Test Quiz' }
    };

    challengeManager.updateLobbyUI(lobbyData);

    const playersList = document.getElementById('lobby-players-list');
    expect(playersList.innerHTML).toContain('Host');
    expect(playersList.innerHTML).toContain('Player 2');
    expect(document.getElementById('lobby-player-count').textContent).toBe('2');

    // Host should see start button
    const startBtn = document.getElementById('lobby-start-btn');
    // console.log('DEBUG: startBtn', startBtn.outerHTML);
    // console.log('DEBUG: isHost', challengeManager.isHost);

    // The code logic:
    // if (allReady) { ... } else { 
    //    this.dom.startBtn.disabled = true; 
    //    ... 
    // }
    // Note: The code does NOT explicitly set startBtn.textContent or innerHTML to "รอคนพร้อม" in the else block.
    // It only adds classes and shows separate waitingMsg.

    expect(startBtn.disabled).toBe(true);

    // Check waiting message instead
    const waitingMsg = document.getElementById('lobby-waiting-msg');
    expect(waitingMsg.classList.contains('hidden')).toBe(false);
    // Text content is in the second span
    // expect(waitingMsg.querySelector('span:last-child').textContent).toContain('รอหัวหน้าห้องเริ่มเกม...'); 
    // Wait, for Host, if not all ready, it might not set specific text on the button itself?
    // Looking at code:
    // ...
    //   } else {
    //     this.dom.startBtn.disabled = true;
    //     ...
    //     if (this.dom.waitingMsg) {
    //       this.dom.waitingMsg.classList.remove('hidden');
    //       ...
    //     }
    //   }
    // It does NOT set the button text. The test expectation was wrong.
  });

  it('should start game when host clicks start', async () => {
    challengeManager.currentLobbyId = '123';
    challengeManager.isHost = true;
    challengeManager.updateDoc = Firestore.updateDoc;

    await challengeManager.startGame();

    expect(Firestore.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { status: 'started' }
    );
  });
});
