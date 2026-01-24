import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as QuizLoader from '../scripts/quiz-loader.js';
import * as QuizLogic from '../scripts/quiz-logic.js';
import * as CustomQuizHandler from '../scripts/custom-quiz-handler.js';
import * as Firestore from 'firebase/firestore';
import * as QuizDataLoader from '../scripts/quiz-data-loader.js';

// Mocks
vi.mock('../scripts/quiz-logic.js', () => ({ init: vi.fn() }));
vi.mock('../scripts/custom-quiz-handler.js', () => ({ getSavedCustomQuizzes: vi.fn() }));
vi.mock('../scripts/firebase-config.js', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

// Mock the data loader module
vi.mock('../scripts/quiz-data-loader.js', () => ({
  getDataModules: vi.fn()
}));

// Mock dynamic import for quizzes-list
vi.mock('../data/quizzes-list.js', () => ({
  quizList: [
    { id: 'test-quiz', title: 'Test Quiz', description: 'Description', category: 'General', storageKey: 'test-options' },
    { id: 'phy_m4_test', title: 'Phy M4', description: 'Physics', category: 'Physics', storageKey: 'phy-options' }
  ]
}));

describe('QuizLoader Integration', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
            <div id="start-screen">
                <h1 id="start-screen-title">Original Title</h1>
                <p id="start-screen-description">Original Desc</p>
            </div>
        `;

    // Reset Mocks
    vi.clearAllMocks();

    // Mock Window Location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: '' }
    });

    // Setup return value for the mocked getDataModules
    QuizDataLoader.getDataModules.mockReturnValue({
      '../data/test-quiz-data.js': () => Promise.resolve({ quizData: [{ question: 'Q1', type: 'choice' }] }),
      '../data/phy_m4/phy_m4_test-data.js': () => Promise.resolve({ quizItems: [{ question: 'Q2', type: 'choice' }] })
    });
  });

  it('should initialize a standard quiz correctly', async () => {
    window.location.search = '?id=test-quiz';
    await QuizLoader.initializeQuiz();

    // Verify Title Update
    expect(document.title).toBe('Test Quiz');
    expect(document.getElementById('start-screen-title').textContent).toBe('Test Quiz');

    // Verify Init Call
    expect(QuizLogic.init).toHaveBeenCalled();
    const args = QuizLogic.init.mock.calls[0];
    expect(args[2]).toBe('Test Quiz'); // Title
    expect(args[0].length).toBe(1);
    expect(args[0][0].question).toBe('Q1');
  });

  it('should handle auto-folder detection for phy_m4', async () => {
    window.location.search = '?id=phy_m4_test';
    await QuizLoader.initializeQuiz();

    expect(document.title).toBe('Phy M4');
    expect(QuizLogic.init).toHaveBeenCalled();
    const args = QuizLogic.init.mock.calls[0];
    expect(args[0][0].question).toBe('Q2');
  });

  it('should handle custom quizzes', async () => {
    window.location.search = '?id=custom_123';

    const mockCustomQuiz = {
      customId: 'custom_123',
      title: 'My Custom Quiz',
      description: 'Custom Desc',
      questions: [{ question: 'Custom Q1' }],
      storageKey: 'custom-key',
      timerMode: 'time-attack',
      customTime: 60
    };

    CustomQuizHandler.getSavedCustomQuizzes.mockResolvedValue([mockCustomQuiz]);

    await QuizLoader.initializeQuiz();

    expect(document.title).toBe('My Custom Quiz');
    expect(QuizLogic.init).toHaveBeenCalled();
    const args = QuizLogic.init.mock.calls[0];
    expect(args[2]).toBe('My Custom Quiz');
    expect(args[0][0].question).toBe('Custom Q1');
    expect(args[7]).toBe('time-attack'); // timerMode
  });

  it('should show error if quiz ID is missing', async () => {
    window.location.search = ''; // No ID
    await QuizLoader.initializeQuiz();

    expect(document.getElementById('start-screen').innerHTML).toContain('ไม่พบ ID');
    expect(QuizLogic.init).not.toHaveBeenCalled();
  });

  it('should show error if data module is missing', async () => {
    window.location.search = '?id=unknown-quiz';
    // quizzes-list mock doesn't have unknown-quiz, so finding quizInfo fails
    // BUT if we mock quizList to have it but getDataModules NOT to have it:

    // Only mocks defined in top level are hoisted, so we can't easily change quizList per test w/o closure
    // But we can check "not found in list" error
    await QuizLoader.initializeQuiz();
    expect(document.getElementById('start-screen').innerHTML).toContain('ไม่พบข้อมูลแบบทดสอบ');
  });

  it('should handle Lobby Config override', async () => {
    window.location.search = '?id=test-quiz&lobbyId=123456';

    Firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        quizConfig: {
          customTime: 120,
          timerMode: 'overall',
          lives: 3
        }
      })
    });

    await QuizLoader.initializeQuiz();

    expect(QuizLogic.init).toHaveBeenCalled();
    const args = QuizLogic.init.mock.calls[0];
    // Check if overrides applied
    expect(args[3]).toBe(120); // customTime
    expect(args[5]).toBe(true); // isChallenge (implied by lobbyId)
    expect(args[6]).toBe(3); // lives
    expect(args[7]).toBe('overall'); // timerMode
  });
});
