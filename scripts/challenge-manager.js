import { db } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion, serverTimestamp, collection, addDoc, query, orderBy, limit, deleteDoc, runTransaction } from "firebase/firestore";
import { authManager } from './auth-manager.js';
import { showToast } from './toast.js';
import { ModalHandler } from './modal-handler.js';
import { categoryDetails } from './data-manager.js';
import { getSavedCustomQuizzes } from './custom-quiz-handler.js';
import { escapeHtml } from './utils.js';

export class ChallengeManager {
  constructor() {
    this.currentLobbyId = null;
    this.unsubscribe = null;
    this.chatUnsubscribe = null;
    this.isHost = false;
    this.isStarting = false; // สถานะกำลังเริ่มเกม (นับถอยหลัง)
    this.isTransitioning = false; // สถานะกำลังเปลี่ยนหน้า (เพื่อไม่ให้ลบออกจากห้อง)
    this.lastStatus = null; // NEW: Track previous status to prevent redirect loops
    this.countdownTimer = null; // ตัวเก็บ timer
    this.transitionTimeout = null; // NEW: Track transition timeout to clear on leave
    this.lobbyModal = null; // Will be initialized after injection
    this.dom = {}; // Object to hold cached DOM elements
    this.isInitialized = false; // NEW: Prevent double initialization
    this.typingTimeout = null;
    this.typingUnsubscribe = null;
    this.presenceUnsubscribe = null; // NEW: Listener for player presence
    this.presenceInterval = null; // NEW: Interval for sending heartbeat
    this.playerPresences = {}; // NEW: Store presence data
    this.lastLobbyData = null; // NEW: Store last lobby data for re-rendering
    this.lastTypingUpdateTime = 0;
    this.currentQuizConfig = null; // Store current quiz config
    this.currentMode = null; // Store current mode
    this.selectedLives = 1; // Default lives

    // NEW: Store references for cleanup
    this.modalObserver = null;
    this.onOffline = null;
    this.onOnline = null;

    const basePath = window.location.pathname.includes('/quiz/') ? '../' : './';
    this.notificationSound = new Audio('./assets/audio/notification.mp3');
  }

  init() {
    // 1. Global Initialization (Run Once)
    if (!this.isInitialized) {
      this.isInitialized = true;
      delete window.challengeContext;
      this.lobbyModal = new ModalHandler('lobby-modal');
      this.checkPendingLobby();
    }

    // 2. UI Initialization (Can be run multiple times to refresh bindings)
    this._refreshUIBindings();
  }

  _refreshUIBindings() {
    this._cacheDomElements();
    this._ensureReadyButton();
    this._attachEventListeners();
  }

  /**
   * Caches frequently accessed DOM elements.
   * @private
   */
  _cacheDomElements() {
    this.dom.menuBtn = document.getElementById('open-challenge-menu-btn');
    this.dom.headerMenuBtn = document.getElementById('header-challenge-menu-btn');

    if (!this.dom.headerMenuBtn) {
      console.warn('ChallengeManager: Header menu button not found in DOM.');
    } else {
      // console.log('ChallengeManager: Header menu button found.');
    }

    this.dom.createBtn = document.getElementById('challenge-create-btn');
    this.dom.joinBtn = document.getElementById('challenge-join-btn');
    this.dom.startBtn = document.getElementById('lobby-start-btn');
    this.dom.leaveBtn = document.getElementById('lobby-leave-btn');
    this.dom.copyBtn = document.getElementById('lobby-room-id-display') || document.getElementById('copy-lobby-link-btn');
    this.dom.chatInput = document.getElementById('lobby-chat-input');
    this.dom.chatSendBtn = document.getElementById('lobby-chat-send-btn');
    this.dom.kickAckBtn = document.getElementById('kick-ack-btn');
    this.dom.kickTitle = document.getElementById('kick-notification-title');
    this.dom.kickDesc = document.getElementById('kick-notification-desc');
    this.dom.kickIcon = document.getElementById('kick-notification-icon');
    this.dom.kickIconContainer = document.getElementById('kick-notification-icon-container');

    this.dom.confirmActionBtn = document.getElementById('confirm-action-btn');
    this.dom.joinInput = document.getElementById('join-room-code-input');
    this.dom.confirmJoinBtn = document.getElementById('confirm-join-btn');
    this.dom.modeSelectButtons = document.querySelectorAll('.mode-select-btn');
    this.dom.randomQuizBtn = document.getElementById('quiz-select-random');
    this.dom.quizListContainer = document.getElementById('challenge-quiz-list');
    this.dom.playersListContainer = document.getElementById('lobby-players-list');
    this.dom.playerCount = document.getElementById('lobby-player-count');
    this.dom.roomIdDisplay = document.getElementById('lobby-room-id-display') || document.getElementById('lobby-room-id');
    this.dom.lobbyTitle = document.querySelector('#lobby-modal h3');
    this.dom.quizName = document.getElementById('lobby-quiz-name');
    this.dom.modeDisplay = document.getElementById('lobby-mode-display');
    this.dom.waitingMsg = document.getElementById('lobby-waiting-msg');
    this.dom.chatContainer = document.getElementById('lobby-chat-messages');
    this.dom.confirmModalTitle = document.getElementById('confirm-modal-title');
    this.dom.confirmModalDesc = document.getElementById('confirm-modal-description');
    this.dom.challengeTimerModes = document.querySelectorAll('input[name="challenge-timer-mode"]');
    this.dom.challengeTimerInputContainer = document.getElementById('challenge-timer-input-container');
    this.dom.challengeTimerInput = document.getElementById('challenge-timer-input');
    this.dom.challengeTimerUnit = document.getElementById('challenge-timer-unit');
    this.dom.challengeTimerUnit = document.getElementById('challenge-timer-unit');
    this.dom.createCustomQuizBtn = document.getElementById('quiz-select-create-custom');

    // NEW: Edit Buttons
    this.dom.editQuizBtn = document.getElementById('lobby-edit-quiz-btn');
    this.dom.editModeBtn = document.getElementById('lobby-edit-mode-btn');

    // Modals (Re-initializing these is cheap and ensures they bind to current DOM)
    if (!this.kickModal) this.kickModal = new ModalHandler('kick-notification-modal');
    if (!this.confirmModal) this.confirmModal = new ModalHandler('confirm-action-modal');
    if (!this.mainMenuModal) this.mainMenuModal = new ModalHandler('challenge-menu-modal');
    if (!this.joinModal) this.joinModal = new ModalHandler('join-lobby-modal');
    if (!this.modeModal) this.modeModal = new ModalHandler('mode-select-modal');
    if (!this.quizModal) this.quizModal = new ModalHandler('quiz-select-modal');
  }

  _ensureReadyButton() {
    // FIX: Check DOM first to avoid duplicates if re-initialized
    let btn = document.getElementById('lobby-ready-btn');

    if (!btn && this.dom.startBtn && this.dom.startBtn.parentNode) {
      btn = document.createElement('button');
      btn.id = 'lobby-ready-btn';
      // Default styling matches other buttons (flex-1 py-3)
      btn.className = 'flex-1 py-3 rounded-lg font-bold shadow-md transition-all transform hover:scale-102 hidden bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      // Insert before start button
      this.dom.startBtn.parentNode.insertBefore(btn, this.dom.startBtn);
    }

    if (btn) {
      this.dom.readyBtn = btn;
      this._safeBind(btn, 'click', () => this.toggleReady());
    }
  }

  /**
   * Helper to safely bind events once using dataset flags.
   */
  _safeBind(element, event, handler) {
    if (!element) return;
    // Use a unique property based on event type to allow multiple different events
    const flag = `has${event}Listener`;
    if (element.dataset[flag]) return;

    element.addEventListener(event, handler);
    element.dataset[flag] = 'true';
  }

  /**
   * Attaches all necessary event listeners for the challenge UI.
   * Uses event delegation for dynamic lists.
   * @private
   */
  _attachEventListeners() {
    this._safeBind(this.dom.menuBtn, 'click', () => this.openMainMenu());
    this._safeBind(this.dom.headerMenuBtn, 'click', () => this.openMainMenu());

    this._safeBind(this.dom.createBtn, 'click', () => {
      this.mainMenuModal.close();
      this.openModeSelection();
    });

    this._safeBind(this.dom.joinBtn, 'click', () => {
      this.mainMenuModal.close();
      this.openJoinModal();
    });

    this._safeBind(this.dom.startBtn, 'click', () => this.startGame());
    this._safeBind(this.dom.leaveBtn, 'click', () => this.leaveLobby());

    this._safeBind(this.dom.copyBtn, 'click', () => {
      if (this.currentLobbyId) {
        navigator.clipboard.writeText(this.currentLobbyId).then(() => {
          showToast('คัดลอกรหัสแล้ว', `รหัสห้อง: ${this.currentLobbyId}`, '📋');
        });
      }
    });

    if (this.dom.chatInput && this.dom.chatSendBtn) {
      this._safeBind(this.dom.chatSendBtn, 'click', () => {
        this.sendChatMessage();
        this.updateTypingStatus(false);
      });
      this._safeBind(this.dom.chatInput, 'keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendChatMessage();
          this.updateTypingStatus(false);
        }
      });
      this._safeBind(this.dom.chatInput, 'input', () => this.handleTyping());
    }

    this._safeBind(this.dom.kickAckBtn, 'click', () => this.kickModal.close());

    if (this.dom.confirmJoinBtn && this.dom.joinInput) {
      this._safeBind(this.dom.confirmJoinBtn, 'click', () => this.handleJoinSubmit());
      this._safeBind(this.dom.joinInput, 'keydown', (e) => {
        if (e.key === 'Enter') this.handleJoinSubmit();
      });
      this._safeBind(this.dom.joinInput, 'input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
    }

    // Timer mode toggle logic
    this.dom.challengeTimerModes.forEach(radio => {
      this._safeBind(radio, 'change', (e) => {
        const mode = e.target.value;
        if (mode === 'none') {
          this.dom.challengeTimerInputContainer.classList.add('hidden');
        } else {
          this.dom.challengeTimerInputContainer.classList.remove('hidden');
          if (mode === 'overall') {
            this.dom.challengeTimerInput.value = 20;
            this.dom.challengeTimerUnit.textContent = 'นาที';
          } else {
            this.dom.challengeTimerInput.value = 60;
            this.dom.challengeTimerUnit.textContent = 'วินาที';
          }
        }
      });
    });

    this.dom.modeSelectButtons.forEach(btn => {
      this._safeBind(btn, 'click', () => {
        const mode = btn.dataset.mode;
        const lives = parseInt(btn.dataset.lives || '1');
        this.modeModal.close();

        if (this.currentLobbyId && this.isHost && this.currentQuizConfig) {
          this.updateLobbySettings(mode, this.currentQuizConfig.id, this.currentQuizConfig.title, this.currentQuizConfig.description, this.currentQuizConfig.totalQuestions, this.currentQuizConfig.timerMode, this.currentQuizConfig.customTime, lives);
        } else {
          this.openQuizSelection(mode, lives);
        }
      });
    });

    this._safeBind(this.dom.randomQuizBtn, 'click', () => {
      this.quizModal.close();
      const { timerMode, customTime } = this.getTimerSettings();
      if (this.currentLobbyId && this.isHost) {
        this.updateLobbySettings(this.selectedMode, 'random', 'แบบทดสอบสุ่ม (Random)', 'สุ่มโจทย์จากคลังข้อสอบทั้งหมด', 20, timerMode, customTime, this.selectedLives);
      } else {
        this.createLobby(this.selectedMode, 'random', 'แบบทดสอบสุ่ม (Random)', 'สุ่มโจทย์จากคลังข้อสอบทั้งหมด', 20, timerMode, customTime, this.selectedLives);
      }
    });

    this.dom.createCustomQuizBtn?.addEventListener('click', () => {
      this.quizModal.close();

      // Setup context for custom quiz handler to intercept the creation
      window.challengeContext = {
        onQuizCreated: (quiz) => {
          try {
            if (this.currentLobbyId && this.isHost) {
              this.updateLobbySettings(this.selectedMode, quiz.customId, quiz.title, quiz.description, quiz.questions.length, quiz.timerMode, quiz.customTime, this.selectedLives);
            } else {
              this.createLobby(this.selectedMode, quiz.customId, quiz.title, quiz.description, quiz.questions.length, quiz.timerMode, quiz.customTime, this.selectedLives);
            }
          } finally {
            delete window.challengeContext; // Ensure cleanup happens even if error occurs
          }
        }
      };

      // Trigger the custom quiz creation modal
      const openBtn = document.getElementById('open-create-quiz-modal-btn');
      if (openBtn) openBtn.click();
    });

    // NEW: Edit Button Listeners
    this.dom.editQuizBtn?.addEventListener('click', () => {
      this.openQuizSelection(this.currentMode || 'classic', this.selectedLives);
    });

    this.dom.editModeBtn?.addEventListener('click', () => {
      this.openModeSelection();
    });

    // Event delegation for the players list to handle kick buttons
    this.dom.playersListContainer?.addEventListener('click', (e) => {
      const kickBtn = e.target.closest('.kick-player-btn');
      if (this.isHost && kickBtn && this.dom.confirmActionBtn) {
        e.stopPropagation();
        const targetUid = kickBtn.dataset.uid;
        const playerName = kickBtn.dataset.name;

        if (this.dom.confirmModalTitle) this.dom.confirmModalTitle.textContent = 'ยืนยันการเชิญออก';
        if (this.dom.confirmModalDesc) this.dom.confirmModalDesc.innerHTML = `คุณต้องการเชิญ "<strong>${playerName}</strong>" ออกจากห้องใช่หรือไม่?`;

        // Clone button to remove old listeners
        const newConfirmBtn = this.dom.confirmActionBtn.cloneNode(true);
        this.dom.confirmActionBtn.parentNode.replaceChild(newConfirmBtn, this.dom.confirmActionBtn);
        this.dom.confirmActionBtn = newConfirmBtn;

        this.dom.confirmActionBtn.addEventListener('click', () => {
          this.kickPlayer(targetUid);
          this.confirmModal.close();
        });

        this.confirmModal.open();
      }
    });

    // Handle network status changes
    this.onOffline = () => {
      if (this.currentLobbyId && !this.isTransitioning) {
        showToast('ขาดการเชื่อมต่อ', 'คุณกำลังออฟไลน์ ระบบอาจไม่ทำงาน', '⚠️', 'error');
        if (this.dom.startBtn) this.dom.startBtn.disabled = true;
      }
    };
    this.onOnline = () => {
      if (this.currentLobbyId) {
        showToast('เชื่อมต่อสำเร็จ', 'กลับมาออนไลน์แล้ว', '✅', 'success');
        if (this.dom.startBtn) this.dom.startBtn.disabled = false;
      }
    };

    window.addEventListener('offline', this.onOffline);
    window.addEventListener('online', this.onOnline);

    // NEW: Watch for lobby modal closing to ensure we leave the lobby if the user closes it manually (e.g. backdrop click)
    if (this.lobbyModal && this.lobbyModal.modal) {
      this.modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isHidden = this.lobbyModal.modal.classList.contains('hidden');
            // Only leave if hidden, we have a lobby, we are NOT transitioning to quiz, and NOT starting (countdown)
            // AND we are not manually keeping it open (e.g. reopenLobby)
            if (isHidden && this.currentLobbyId && !this.isTransitioning && !this.isStarting && !this.isReopening) {
              this.leaveLobby();
            }
          }
        });
      });
      this.modalObserver.observe(this.lobbyModal.modal, { attributes: true });
    }
  }

  getTimerSettings() {
    const timerMode = document.querySelector('input[name="challenge-timer-mode"]:checked')?.value || 'none';
    let customTime = null;
    if (timerMode !== 'none') {
      const val = parseInt(this.dom.challengeTimerInput.value, 10);
      if (timerMode === 'overall') customTime = val * 60; // minutes to seconds
      else customTime = val; // seconds
    }
    return { timerMode, customTime };
  }

  openMainMenu() {
    this.mainMenuModal.open();
  }

  openModeSelection() {
    this.modeModal.open();
  }

  async openQuizSelection(mode, lives = 1) {
    this.selectedMode = mode;
    this.selectedLives = lives;
    delete window.challengeContext; // Clear any stale context before starting selection

    let quizList = [];
    try {
      const module = await import(`../data/quizzes-list.js`);
      quizList = module.quizList || [];
    } catch (e) {
      console.error("Failed to load quiz list", e);
      this.createLobby(mode, 'random', 'แบบทดสอบสุ่ม');
      return;
    }

    // Fetch custom quizzes with a timeout to prevent UI freeze
    let customQuizzes = [];
    try {
      const fetchPromise = getSavedCustomQuizzes();
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve([]), 3000)); // 3s fallback
      customQuizzes = await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      console.warn("Failed to load custom quizzes, proceeding with built-in only:", e);
    }

    // Merge lists
    const allQuizzes = [...quizList, ...customQuizzes];

    // Group quizzes by category
    const groupedQuizzes = allQuizzes.reduce((acc, quiz) => {
      const category = quiz.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(quiz);
      return acc;
    }, {});

    // Sort categories
    const sortedCategories = Object.keys(groupedQuizzes).sort((a, b) => {
      const orderA = (categoryDetails && categoryDetails[a]?.order) || 99;
      const orderB = (categoryDetails && categoryDetails[b]?.order) || 99;
      return orderA - orderB;
    });

    const container = document.getElementById('challenge-quiz-list');
    if (container) {
      container.innerHTML = `
                        ${sortedCategories.map(catKey => {
        const quizzes = groupedQuizzes[catKey];
        const catDetail = (categoryDetails && categoryDetails[catKey]) || { title: catKey, icon: './assets/icons/study.png' };

        // Sort quizzes by title
        quizzes.sort((a, b) => a.title.localeCompare(b.title, 'th', { numeric: true }));

        const quizzesHtml = quizzes.map(q => {
          const iconSrc = q.icon || './assets/icons/study.png';
          const isImage = iconSrc.includes('/') || iconSrc.includes('.');
          const iconDisplay = isImage
            ? `<img src="${iconSrc}" class="w-full h-full object-contain">`
            : `<span class="text-xl">${iconSrc}</span>`;

          return `
                                    <button data-quiz-id="${q.id}" data-quiz-title="${q.title}" data-quiz-desc="${q.description || ''}" data-quiz-amount="${q.amount || ''}" class="quiz-select-item w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all text-left group bg-white dark:bg-gray-800">
                                        <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors overflow-hidden p-1">
                                            ${iconDisplay}
                                        </div>
                                        <div class="min-w-0">
                                            <div class="font-bold text-gray-800 dark:text-gray-100 truncate text-sm">${q.title}</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">${q.description || q.category}</div>
                                        </div>
                                    </button>
                                `;
        }).join('');

        return `
                                <div class="accordion-item border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-2">
                                    <button class="accordion-header w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm p-1">
                                                <img src="${catDetail.icon}" class="w-full h-full object-contain">
                                            </div>
                                            <div>
                                                <div class="font-bold text-gray-700 dark:text-gray-200 text-sm">${catDetail.title}</div>
                                                <div class="text-[10px] text-gray-500 dark:text-gray-400">${quizzes.length} ชุด</div>
                                            </div>
                                        </div>
                                        <svg class="chevron w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    <div class="accordion-content hidden p-2 space-y-2 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                        ${quizzesHtml}
                                    </div>
                                </div>
                            `;
      }).join('')}`;

      // Accordion Logic
      container.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = () => {
          const content = header.nextElementSibling;
          const chevron = header.querySelector('.chevron');
          content.classList.toggle('hidden');
          chevron.classList.toggle('rotate-180');
        };
      });

      container.querySelectorAll('.quiz-select-item').forEach(btn => {
        btn.onclick = () => {
          const quizId = btn.dataset.quizId;
          const quizTitle = btn.dataset.quizTitle;
          const quizDesc = btn.dataset.quizDesc;
          const quizAmount = btn.dataset.quizAmount;
          this.quizModal.close();
          const { timerMode, customTime } = this.getTimerSettings();
          if (this.currentLobbyId && this.isHost) {
            this.updateLobbySettings(this.selectedMode, quizId, quizTitle, quizDesc, quizAmount, timerMode, customTime, this.selectedLives);
          } else {
            this.createLobby(this.selectedMode, quizId, quizTitle, quizDesc, quizAmount, timerMode, customTime, this.selectedLives);
          }
        };
      });
    }

    this.quizModal.open();
  }

  openJoinModal() {
    this.joinModal.open();
    setTimeout(() => this.dom.joinInput?.focus(), 100);
  }

  async handleJoinSubmit() {
    const input = document.getElementById('join-room-code-input');
    if (!input) return;
    const code = input.value.trim();
    if (code.length === 6) {
      const btn = document.getElementById('confirm-join-btn');
      if (!btn) return;
      const originalText = btn.innerHTML;

      // Set loading state
      btn.disabled = true;
      btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> กำลังเข้า...`;
      btn.classList.add('opacity-75', 'cursor-not-allowed');

      const success = await this.joinLobby(code);
      if (success) {
        this.joinModal.close();
      }

      // Reset button state
      btn.disabled = false;
      btn.innerHTML = originalText;
      btn.classList.remove('opacity-75', 'cursor-not-allowed');
      if (!success) input.focus();

    } else {
      showToast('รหัสไม่ถูกต้อง', 'กรุณากรอกรหัส 6 หลัก', '⚠️', 'error');
    }
  }

  async checkPendingLobby() {
    // FIX: Do not auto-join lobby if we are already in the quiz page.
    if (window.location.pathname.includes('/quiz/')) return;

    // 1. Check for Reconnect (Highest Priority)
    const reconnectId = sessionStorage.getItem('reconnect_lobby_id');
    if (reconnectId) {
      const user = await authManager.waitForAuthReady();
      if (user) {
        console.log("Attempting to reconnect to lobby:", reconnectId);
        const success = await this.joinLobby(reconnectId);
        if (success) {
          showToast('กลับเข้าห้อง', 'ระบบพาคุณกลับเข้าห้องเดิมอัตโนมัติ', '🔄');
          return; // Stop processing other pending joins
        } else {
          sessionStorage.removeItem('reconnect_lobby_id');
        }
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const lobbyId = urlParams.get('lobby');

    // Check for pending lobby from session storage (persisted across login redirect)
    const pendingLobby = sessionStorage.getItem('pending_lobby_join');
    const targetLobbyId = lobbyId ? lobbyId.trim() : pendingLobby;

    if (targetLobbyId) {
      const user = await authManager.waitForAuthReady();
      if (user) {
        // Logged in, proceed to join
        sessionStorage.removeItem('pending_lobby_join'); // Clear pending
        this.joinLobby(targetLobbyId);
      } else {
        // Not logged in
        if (lobbyId) {
          // Save intent to join after login
          sessionStorage.setItem('pending_lobby_join', lobbyId.trim());
          showToast('กรุณาเข้าสู่ระบบ', 'ระบบจะพาเข้าห้องอัตโนมัติหลังล็อกอิน', '🔒');
        }
      }

      // Clean URL if param exists
      if (lobbyId) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }

  generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getUserAvatar() {
    try {
      const data = JSON.parse(localStorage.getItem('app_gamification_data') || '{}');
      return data.avatar || '🧑‍🎓';
    } catch (e) {
      return '🧑‍🎓';
    }
  }

  async createLobby(mode = 'challenge', quizId = 'random', quizTitle = 'แบบทดสอบสุ่ม', quizDesc = '', quizTotal = null, timerMode = 'none', customTime = null, lives = 1) {
    // FIX: Wait for auth to be fully initialized to prevent false negatives
    const user = await authManager.waitForAuthReady();
    if (!user) {
      showToast('ต้องเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบก่อนสร้างห้อง', '🔒', 'error');
      return;
    }

    // FIX: Ensure we leave any existing lobby before creating a new one to prevent ghost players
    if (this.currentLobbyId) {
      await this.leaveLobby();
    }

    const lobbyId = this.generateRoomId();
    this.currentLobbyId = lobbyId;
    sessionStorage.setItem('reconnect_lobby_id', lobbyId);
    this.isHost = true;

    // Determine question amount based on mode
    let questionAmount = null;
    let customQuestions = null;

    // Time Attack: Don't limit questions, allow full set so players can reach 10 correct answers.
    if (quizId === 'random') {
      questionAmount = 20; // Random: 20 questions
    } else if (quizId.startsWith('custom_')) {
      const customQuiz = (await getSavedCustomQuizzes()).find(q => q.customId === quizId);
      if (customQuiz) {
        customQuestions = customQuiz.questions;
        questionAmount = customQuiz.questions.length;
      }
    }

    const lobbyData = {
      hostId: user.uid,
      hostName: user.displayName || 'Host',
      status: 'waiting',
      mode: mode,
      createdAt: serverTimestamp(),
      players: [{
        uid: user.uid,
        name: user.displayName || 'Player',
        avatar: this.getUserAvatar(),
        ready: true,
        score: 0,
        progress: 0
      }],
      quizConfig: {
        id: quizId,
        title: quizTitle,
        description: quizDesc,
        totalQuestions: quizTotal,
        amount: questionAmount,
        seed: Date.now(),
        customQuestions: customQuestions,
        timerMode: timerMode,
        customTime: customTime,
        lives: lives
      }
    };

    try {
      await setDoc(doc(db, 'lobbies', lobbyId), lobbyData);
      this.openLobbyUI(lobbyId);
      this.listenToLobby(lobbyId);
      showToast('สร้างห้องสำเร็จ', `รหัสห้อง: ${lobbyId}`, '🎮');
    } catch (error) {
      console.error("Error creating lobby:", error);
      showToast('ข้อผิดพลาด', `ไม่สามารถสร้างห้องได้: ${error.message}`, '❌', 'error');
      // FIX: Reset state on failure
      this.currentLobbyId = null;
      this.isHost = false;
    }
  }

  async updateLobbySettings(mode, quizId, quizTitle, quizDesc, quizTotal, timerMode = 'none', customTime = null, lives = 1) {
    if (!this.currentLobbyId || !this.isHost) return;

    let questionAmount = null;
    let customQuestions = null;

    if (quizId === 'random') {
      questionAmount = 20;
    } else if (quizId.startsWith('custom_')) {
      const customQuiz = (await getSavedCustomQuizzes()).find(q => q.customId === quizId);
      if (customQuiz) {
        customQuestions = customQuiz.questions;
        questionAmount = customQuiz.questions.length;
      }
    }

    const updateData = {
      mode: mode,
      quizConfig: {
        id: quizId,
        title: quizTitle,
        description: quizDesc,
        totalQuestions: quizTotal,
        amount: questionAmount,
        seed: Date.now(),
        customQuestions: customQuestions,
        timerMode: timerMode,
        customTime: customTime,
        lives: lives
      }
    };

    try {
      await updateDoc(doc(db, 'lobbies', this.currentLobbyId), updateData);
      showToast('อัปเดตห้องสำเร็จ', 'เปลี่ยนการตั้งค่าเรียบร้อยแล้ว', '✅');
    } catch (error) {
      console.error("Error updating lobby:", error);
      showToast('ข้อผิดพลาด', `ไม่สามารถอัปเดตห้องได้: ${error.message}`, '❌', 'error');
    }
  }

  /**
   * Joins an existing lobby using a 6-digit code. Uses a Firestore transaction for atomicity.
   * @param {string} lobbyId The 6-digit lobby code.
   * @returns {Promise<boolean>} True if join was successful, false otherwise.
   */
  async joinLobby(lobbyId) {
    if (!navigator.onLine) {
      showToast('ไม่มีสัญญาณเน็ต', 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต', '📶', 'error');
      return false;
    }
    // FIX: Wait for auth to be ready to avoid null currentUser on quick actions
    const user = await authManager.waitForAuthReady();
    if (!user) {
      showToast('ไม่ได้เข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบก่อนเข้าร่วม', '🔒', 'error');
      return false;
    }

    // FIX: Validate lobbyId format to prevent NoSQL Injection / Path Traversal
    // Lobby ID must be a 6-digit number
    if (!lobbyId || typeof lobbyId !== 'string' || !/^\d{6}$/.test(lobbyId)) {
      showToast('รหัสห้องไม่ถูกต้อง', 'รหัสห้องต้องเป็นตัวเลข 6 หลัก', '⚠️', 'error');
      return false;
    }

    // FIX: Check if already in this lobby to prevent redundant joins
    if (this.currentLobbyId === lobbyId) {
      this.openLobbyUI(lobbyId);
      return true;
    }

    // FIX: Ensure we leave any existing lobby before joining a new one
    if (this.currentLobbyId) {
      await this.leaveLobby();
    }

    const lobbyRef = doc(db, 'lobbies', lobbyId);
    let hostIdFromTransaction = null; // NEW: Capture hostId from transaction

    try {
      // Use a transaction to atomically add the player.
      await runTransaction(db, async (transaction) => {
        const lobbySnap = await transaction.get(lobbyRef);
        if (!lobbySnap.exists()) {
          throw new Error("Lobby not found");
        }

        const data = lobbySnap.data();
        hostIdFromTransaction = data.hostId; // Capture hostId

        const players = data.players || [];
        const isAlreadyJoined = players.some(p => p.uid === user.uid);

        // Allow rejoining if the game has started, but prevent new players from joining a started game.
        if (data.status !== 'waiting' && !isAlreadyJoined) {
          throw new Error("Game has already started");
        }

        if (!isAlreadyJoined) {
          const playerData = { uid: user.uid, name: user.displayName || 'Player', avatar: this.getUserAvatar(), ready: true, score: 0, progress: 0 };
          transaction.update(lobbyRef, { players: arrayUnion(playerData) });
        }
      });

      // Transaction succeeded. User is in.

      // NEW: Try to get definitive state, but don't fail if network blips.
      let finalLobbyData = null;
      try {
        const finalLobbySnap = await getDoc(lobbyRef);
        if (finalLobbySnap.exists()) {
          finalLobbyData = finalLobbySnap.data();
        }
      } catch (e) {
        console.warn("Failed to fetch final lobby state immediately after join, relying on listener:", e);
      }

      // Set client state based on the definitive data or fallback.
      this.currentLobbyId = lobbyId;
      sessionStorage.setItem('reconnect_lobby_id', lobbyId);

      if (finalLobbyData) {
        this.isHost = (finalLobbyData.hostId === user.uid);
        this.updateLobbyUI(finalLobbyData); // Render initial state immediately.
      } else {
        // Fallback if getDoc failed but transaction succeeded
        this.isHost = (hostIdFromTransaction === user.uid);
      }

      // Open UI and start listening for updates.
      this.openLobbyUI(lobbyId);
      this.listenToLobby(lobbyId);
      return true;

    } catch (error) {
      console.error("Error joining lobby:", error);

      let title = 'ข้อผิดพลาด';
      let message = 'ไม่สามารถเข้าร่วมห้องได้';
      let icon = '❌';

      if (error.message === "Lobby not found") {
        title = 'ไม่พบห้อง';
        message = 'รหัสห้องไม่ถูกต้อง หรือห้องถูกปิดไปแล้ว';
      } else if (error.message === "Game has already started") {
        title = 'เข้าห้องไม่ได้';
        message = 'การแข่งขันได้เริ่มไปแล้ว ไม่สามารถเข้าร่วมกลางคันได้';
        icon = '⚠️';
      } else if (error.message === "Lobby disappeared immediately after joining.") {
        title = 'เกิดข้อผิดพลาด';
        message = 'ห้องถูกปิดขณะกำลังเข้าร่วม';
      } else if (error.code === 'permission-denied') {
        title = 'ไม่มีสิทธิ์เข้าร่วม';
        message = 'ห้องอาจเต็ม หรือคุณถูกจำกัดสิทธิ์การเข้าถึง';
      } else if (error.code === 'unavailable') {
        title = 'การเชื่อมต่อขัดข้อง';
        message = 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
        icon = '📶';
      } else {
        // General error fallback
        message = `เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ: ${error.message}`;
      }

      showToast(title, message, icon, 'error');
      return false;
    }
  }

  async kickPlayer(targetUid) {
    if (!this.currentLobbyId || !this.isHost) return;

    const success = await this.removePlayerFromLobby(this.currentLobbyId, targetUid);
    if (success) {
      showToast('เตะผู้เล่นสำเร็จ', 'ผู้เล่นถูกลบออกจากห้องแล้ว', '👋');
    } else {
      showToast('เกิดข้อผิดพลาด', 'ไม่สามารถเตะผู้เล่นได้ (ไม่มีสิทธิ์)', '❌', 'error');
    }
  }

  async toggleReady() {
    if (!this.currentLobbyId) return;
    const user = authManager.currentUser;
    if (!user) return;

    const lobbyRef = doc(db, 'lobbies', this.currentLobbyId);

    try {
      await runTransaction(db, async (transaction) => {
        const lobbySnap = await transaction.get(lobbyRef);
        if (!lobbySnap.exists()) return;

        const data = lobbySnap.data();
        const players = data.players || [];

        const updatedPlayers = players.map(p => {
          if (p.uid === user.uid) {
            return { ...p, ready: !p.ready };
          }
          return p;
        });

        transaction.update(lobbyRef, { players: updatedPlayers });
      });
    } catch (e) {
      console.error("Error toggling ready status:", e);
    }
  }

  /**
   * Removes a player from a lobby. If the host leaves, the lobby is deleted.
   * Uses a Firestore transaction for atomicity.
   * @param {string} lobbyId The ID of the lobby.
   * @param {string} uid The UID of the player to remove.
   */
  async removePlayerFromLobby(lobbyId, uid) {
    if (!lobbyId || !uid) return false;

    // FIX: IDOR Prevention - Verify requester permissions
    const currentUser = authManager.currentUser;
    if (!currentUser) return false;

    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      await runTransaction(db, async (transaction) => {
        const lobbySnap = await transaction.get(lobbyRef);
        if (!lobbySnap.exists()) {
          return;
        }

        const data = lobbySnap.data();

        // Check permissions: Must be self (leaving) or host (kicking)
        const isSelf = currentUser.uid === uid;
        const isHost = data.hostId === currentUser.uid;

        if (!isSelf && !isHost) {
          throw new Error("Unauthorized: You cannot remove this player.");
        }

        // If the host is the one being removed, delete the entire lobby.
        if (data.hostId === uid) {
          transaction.delete(lobbyRef);
          return;
        }

        const players = data.players || [];
        const updatedPlayers = players.filter(p => p.uid !== uid);

        // If the lobby becomes empty, delete it.
        if (updatedPlayers.length === 0) {
          transaction.delete(lobbyRef);
        }
        // Only update if a player was actually removed.
        else if (updatedPlayers.length < players.length) {
          transaction.update(lobbyRef, { players: updatedPlayers });
        }
      });
      return true;
    } catch (error) {
      console.error("Error in removePlayerFromLobby transaction:", error);
      // Non-critical error, so no toast is shown to the user.
      return false;
    }
  }

  async sendChatMessage() {
    if (!this.currentLobbyId) return;
    const user = authManager.currentUser;
    if (!user) return;

    const input = this.dom.chatInput;
    const messageText = input.value.trim();

    if (messageText === '') return;

    input.value = ''; // Clear input immediately

    try {
      const messagesCol = collection(db, 'lobbies', this.currentLobbyId, 'messages');
      await addDoc(messagesCol, {
        uid: user.uid,
        name: user.displayName || 'Player',
        avatar: this.getUserAvatar(),
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      showToast('ส่งข้อความไม่สำเร็จ', 'เกิดข้อผิดพลาดในการส่งข้อความ', '❌', 'error');
      input.value = messageText; // Restore text on failure
    }
  }

  listenToChat(lobbyId) {
    if (this.chatUnsubscribe) this.chatUnsubscribe();

    const messagesCol = collection(db, 'lobbies', lobbyId, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'desc'), limit(50));

    let isFirstLoad = true;

    this.chatUnsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];

      if (!isFirstLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const myUid = authManager.currentUser?.uid;
            if (data.uid !== myUid) {
              this.playNotificationSound();
            }
          }
        });
      }

      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      this.updateChatUI(messages.reverse()); // reverse to show oldest first
      isFirstLoad = false;
    }, (error) => {
      console.warn("Chat listener error (Permission/Network):", error);
    });
  }

  playNotificationSound() {
    try {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(() => { });
    } catch (e) {
      console.warn("Could not play notification sound", e);
    }
  }

  updateChatUI(messages) {
    const container = this.dom.chatContainer;
    if (!container) return;

    // Check if user is near bottom before updating (to prevent jumping while reading history)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    const myUid = authManager.currentUser?.uid;

    // Filter out messages that are already rendered
    const newMessages = messages.filter(msg => !container.querySelector(`[data-msg-id="${msg.id}"]`));

    if (newMessages.length === 0) return;

    const html = newMessages.map((msg) => {
      const isMe = msg.uid === myUid;
      const timestamp = msg.timestamp?.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) || '';

      const isImage = msg.avatar && (msg.avatar.includes('/') || msg.avatar.includes('.'));
      const avatarHtml = isImage
        ? `<img src="${escapeHtml(msg.avatar)}" class="w-full h-full object-cover rounded-full ring-2 ring-white dark:ring-gray-800">`
        : `<span class="text-xs font-bold">${escapeHtml(msg.avatar || '🧑‍🎓')}</span>`;

      const avatarElement = `<div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm self-end mb-1">${avatarHtml}</div>`;

      // Modern bubble styles
      const bubbleClass = isMe
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-none shadow-md'
        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700';

      const nameClass = isMe
        ? 'text-blue-100 text-[10px]'
        : 'text-gray-500 dark:text-gray-400 text-[10px]';

      const timeClass = isMe
        ? 'text-blue-200 text-[9px]'
        : 'text-gray-400 text-[9px]';

      const messageBubble = `
                <div class="flex flex-col max-w-[85%] ${bubbleClass} px-4 py-2 relative group">
                    <div class="flex items-baseline justify-between gap-3 mb-0.5">
                        <span class="font-bold ${nameClass}">${isMe ? 'คุณ' : escapeHtml(msg.name)}</span>
                        <span class="text="${timeClass}">${timestamp}</span>
                    </div>
                    <p class="text-sm leading-relaxed break-words">${escapeHtml(msg.text)}</p>
                </div>`;

      return `<div class="flex items-end gap-2 mb-3 ${isMe ? 'justify-end' : 'justify-start'} anim-fade-in" data-msg-id="${msg.id}">${!isMe ? avatarElement : ''}${messageBubble}${isMe ? avatarElement : ''}</div>`;
    }).join('');

    container.insertAdjacentHTML('beforeend', html);

    // Auto-scroll to bottom only if user was already near bottom
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }

  handleTyping() {
    const now = Date.now();
    // Update "start typing" immediately if not recently updated (throttle 2s)
    if (now - this.lastTypingUpdateTime > 2000) {
      this.updateTypingStatus(true);
      this.lastTypingUpdateTime = now;
    }

    if (this.typingTimeout) clearTimeout(this.typingTimeout);

    this.typingTimeout = setTimeout(() => {
      this.updateTypingStatus(false);
    }, 3000);
  }

  async updateTypingStatus(isTyping) {
    if (!this.currentLobbyId || !authManager.currentUser) return;
    const user = authManager.currentUser;
    const typingRef = doc(db, 'lobbies', this.currentLobbyId, 'typing', user.uid);

    try {
      if (isTyping) {
        await setDoc(typingRef, {
          name: user.displayName || 'Player',
          isTyping: true,
          timestamp: serverTimestamp()
        }, { merge: true });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (e) {
      // Ignore errors
    }
  }

  listenToTyping(lobbyId) {
    if (this.typingUnsubscribe) this.typingUnsubscribe();

    const typingCol = collection(db, 'lobbies', lobbyId, 'typing');

    this.typingUnsubscribe = onSnapshot(typingCol, (snapshot) => {
      const typingUsers = [];
      const myUid = authManager.currentUser?.uid;

      snapshot.forEach(doc => {
        if (doc.id !== myUid) {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate();
          const now = new Date();
          if (data.isTyping && timestamp && (now - timestamp < 10000)) {
            typingUsers.push(data.name);
          }
        }
      });
      this.renderTypingIndicator(typingUsers);
    }, (error) => {
      console.warn("Typing listener error:", error);
    });
  }

  renderTypingIndicator(users) {
    let indicator = document.getElementById('lobby-typing-indicator');

    if (!indicator && this.dom.chatContainer) {
      indicator = document.createElement('div');
      indicator.id = 'lobby-typing-indicator';
      indicator.className = 'text-[10px] text-gray-500 dark:text-gray-400 italic px-4 h-4 transition-opacity duration-300 min-h-[1rem] mt-1';
      this.dom.chatContainer.parentNode.insertBefore(indicator, this.dom.chatContainer.nextSibling);
    }

    if (!indicator) return;

    if (users.length === 0) {
      indicator.textContent = '';
      indicator.style.opacity = '0';
    } else {
      const escapedUsers = users.map(name => escapeHtml(name));
      const text = escapedUsers.length > 2
        ? 'หลายคนกำลังพิมพ์...'
        : `${escapedUsers.join(', ')} กำลังพิมพ์...`;

      indicator.innerHTML = `<span class="animate-pulse">✍️ ${text}</span>`;
      indicator.style.opacity = '1';
    }
  }

  // NEW: Heartbeat System for Online Status
  async startHeartbeat(lobbyId) {
    if (this.presenceInterval) clearInterval(this.presenceInterval);

    const user = authManager.currentUser;
    if (!user) return;

    const updatePresence = async () => {
      try {
        const presenceRef = doc(db, 'lobbies', lobbyId, 'presence', user.uid);
        await setDoc(presenceRef, {
          lastSeen: serverTimestamp(),
          isOnline: true,
          name: user.displayName || 'Player'
        }, { merge: true });
      } catch (e) {
        console.warn("Heartbeat failed", e);
      }
    };

    await updatePresence(); // Immediate update
    this.presenceInterval = setInterval(updatePresence, 10000); // Update every 10s
  }

  stopHeartbeat() {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
    // Optional: Mark as offline immediately when leaving cleanly
    if (this.currentLobbyId && authManager.currentUser) {
      const presenceRef = doc(db, 'lobbies', this.currentLobbyId, 'presence', authManager.currentUser.uid);
      deleteDoc(presenceRef).catch(() => { });
    }
  }

  listenToPresence(lobbyId) {
    if (this.presenceUnsubscribe) this.presenceUnsubscribe();

    const presenceCol = collection(db, 'lobbies', lobbyId, 'presence');
    this.presenceUnsubscribe = onSnapshot(presenceCol, (snapshot) => {
      const presences = {};
      const now = Date.now();

      snapshot.forEach(doc => {
        const data = doc.data();
        presences[doc.id] = data;

        // NEW: Direct DOM update for online status
        const row = this.dom.playersListContainer?.querySelector(`[data-uid="${doc.id}"]`);
        if (row) {
          const onlineDot = row.querySelector('.online-dot');
          if (onlineDot) {
            let isOnline = false;
            // Handle Firestore Timestamp
            const lastSeenTime = data.lastSeen?.toMillis ? data.lastSeen.toMillis() : (data.lastSeen?.toDate ? data.lastSeen.toDate().getTime() : 0);
            if (now - lastSeenTime < 25000) {
              isOnline = true;
            }

            const onlineClass = isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600';
            onlineDot.className = `online-dot absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm ${onlineClass}`;
          }
        }
      });
      this.playerPresences = presences;

      // Removed: updateLobbyUI(this.lastLobbyData) call to prevent full re-render loop
      // The direct DOM update above handles the visual change efficiently.
    }, (error) => {
      console.warn("Presence listener error:", error);
    });
  }

  showKickedModal() {
    if (this.dom.kickTitle) this.dom.kickTitle.textContent = 'คุณถูกเชิญออก';
    if (this.dom.kickDesc) this.dom.kickDesc.textContent = 'หัวหน้าห้องได้เชิญคุณออกจากห้องเตรียมตัว';
    if (this.dom.kickIcon) this.dom.kickIcon.textContent = '👢';
    if (this.dom.kickIconContainer) {
      this.dom.kickIconContainer.className = 'w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner';
    }
    if (this.kickModal) this.kickModal.open();
  }

  showLobbyClosedModal() {
    if (this.dom.kickTitle) this.dom.kickTitle.textContent = 'ห้องถูกปิดแล้ว';
    if (this.dom.kickDesc) this.dom.kickDesc.textContent = 'หัวหน้าห้องได้ปิดห้องการแข่งขันนี้แล้ว';
    if (this.dom.kickIcon) this.dom.kickIcon.textContent = '🔒';
    if (this.dom.kickIconContainer) {
      this.dom.kickIconContainer.className = 'w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner';
    }
    if (this.kickModal) this.kickModal.open();
  }

  listenToLobby(lobbyId) {
    if (this.unsubscribe) this.unsubscribe();

    // Reset status tracker when listening to a new lobby
    this.lastStatus = null;

    // NEW: Start heartbeat and listen to presence
    this.startHeartbeat(lobbyId);
    this.listenToPresence(lobbyId);

    this.unsubscribe = onSnapshot(doc(db, 'lobbies', lobbyId), (docSnapshot) => {
      if (!docSnapshot.exists()) {
        this.leaveLobby(false); // Don't try to remove from DB if doc is gone
        this.showLobbyClosedModal();
        return;
      }

      const data = docSnapshot.data();

      // ตรวจสอบว่าเราถูกเตะหรือไม่ (ถ้าไม่มีชื่อเราในรายการผู้เล่น)
      const myUid = authManager.currentUser?.uid;
      if (myUid && data.players) {
        const amIInList = data.players.some(p => p.uid === myUid);
        if (!amIInList) {
          this.leaveLobby(false); // Already removed from DB
          this.showKickedModal();
          return;
        }
      }

      this.updateLobbyUI(data);

      // FIX: Prevent infinite redirect loop and handle game start transition
      const isInQuiz = window.location.pathname.includes('/quiz/');
      if (data.status === 'started' && !isInQuiz) {
        // NEW: If status changes to 'started', begin the countdown for all players.
        if (this.lastStatus === 'waiting' && !this.isStarting) {
          this.startCountdownAndGo(data.quizConfig, data.mode);
        }
      }
      this.lastStatus = data.status;
    }, (error) => {
      console.error("Lobby listener error:", error);
      if (error.code === 'permission-denied') {
        showToast('ไม่สามารถเข้าถึงห้องได้', 'คุณอาจไม่มีสิทธิ์หรือห้องถูกจำกัดการเข้าถึง', '⚠️', 'error');
        this.leaveLobby(false);
      } else if (error.code === 'unavailable') {
        console.warn("Lobby listener unavailable, retrying...");
      }
    });

    this.listenToChat(lobbyId);
    this.listenToTyping(lobbyId);
  }

  updateLobbyUI(data) {
    this.lastLobbyData = data; // Save for presence updates
    const container = this.dom.playersListContainer;
    const countEl = this.dom.playerCount;
    const roomIdEl = this.dom.roomIdDisplay;
    const titleEl = this.dom.lobbyTitle;
    const quizNameEl = this.dom.quizName;
    const modeDisplayEl = this.dom.modeDisplay;

    // Store current state for quick updates
    this.currentQuizConfig = data.quizConfig;
    this.currentMode = data.mode;

    // Ensure ready button exists in DOM
    this._ensureReadyButton();

    if (roomIdEl) roomIdEl.textContent = this.currentLobbyId;
    if (countEl) countEl.textContent = data.players.length;
    if (quizNameEl) {
      const config = data.quizConfig || {};
      const countText = config.totalQuestions ? ` (${config.totalQuestions} ข้อ)` : (config.amount ? ` (${config.amount} ข้อ)` : '');

      const changeBtn = (this.isHost && data.status === 'waiting')
        ? `<button id="lobby-change-quiz-btn" class="mt-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full transition-colors border border-gray-200 dark:border-gray-600 flex items-center gap-1 mx-auto hover:scale-105 transform duration-200"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>เปลี่ยนชุดข้อสอบ</button>`
        : '';

      quizNameEl.innerHTML = `
                <div class="flex flex-col items-center">
                    <span class="text-lg font-bold text-gray-900 dark:text-white leading-tight text-center">${escapeHtml(config.title) || 'แบบทดสอบ'}</span>
                    ${config.description ? `<span class="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 line-clamp-1 text-center max-w-xs">${escapeHtml(config.description)}</span>` : ''}
                    ${countText ? `<span class="text-[10px] text-gray-400 mt-0.5 font-mono">${countText}</span>` : ''}
                    ${changeBtn}
                </div>
            `;

      if (this.isHost && data.status === 'waiting') {
        document.getElementById('lobby-change-quiz-btn')?.addEventListener('click', () => {
          this.openQuizSelection(this.currentMode, this.selectedLives);
        });
      }
    }

    if (modeDisplayEl) {
      const modeLabels = {
        'challenge': '⚔️ โหมดแข่งขัน (Classic)',
        'classic': '⚔️ โหมดแข่งขัน (Classic)',
        'time-attack': '⚡ โหมดความเร็ว (Time Attack)',
        'speedrun': '⚡ โหมดความเร็ว (Time Attack)',
        'speed': '⚡ โหมดความเร็ว (Time Attack)',
        'coop': '🤝 โหมดร่วมมือ (Co-op)',
        'survival': '💀 โหมดเอาชีวิตรอด (Survival)'
      };

      const currentMode = data.mode || 'challenge';
      const modeText = modeLabels[currentMode] || 'โหมดทั่วไป';
      const colorClass = (currentMode === 'coop' ? 'text-green-600 dark:text-green-400' :
        (currentMode === 'time-attack' || currentMode === 'speedrun' || currentMode === 'speed') ? 'text-orange-600 dark:text-orange-400' :
          (currentMode === 'survival') ? 'text-red-600 dark:text-red-400' :
            'text-blue-600 dark:text-blue-400');

      let livesText = '';
      if (currentMode === 'survival' && data.quizConfig?.lives) {
        livesText = ` (${data.quizConfig.lives} ❤️)`;
      }

      if (this.isHost && data.status === 'waiting') {
        modeDisplayEl.innerHTML = `
                    <button id="lobby-change-mode-btn" class="flex items-center gap-1 mx-auto hover:opacity-80 transition-opacity ${colorClass} text-xs font-bold mt-1">
                        <span>${modeText}${livesText}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                `;
        document.getElementById('lobby-change-mode-btn')?.addEventListener('click', () => {
          this.openModeSelection();
        });
      } else {
        modeDisplayEl.textContent = modeText + livesText;
        modeDisplayEl.className = `text-xs font-bold mt-1 ${colorClass}`;
      }
    }

    // จัดเรียงผู้เล่น: ถ้าเริ่มเกมแล้ว เรียงตามคะแนน, ถ้ายังไม่เริ่ม เรียงตามเวลาเข้า
    let players = [...data.players];
    if (data.status === 'started') {
      players.sort((a, b) => (b.score || 0) - (a.score || 0));
      if (data.mode === 'coop') {
        const totalScore = players.reduce((sum, p) => sum + (p.score || 0), 0);
        if (titleEl) titleEl.textContent = `🤝 คะแนนทีม: ${totalScore}`;
      } else {
        if (titleEl) titleEl.textContent = "🏆 กระดานคะแนนสด";
      }
    } else {
      if (titleEl) titleEl.textContent = "ห้องเตรียมตัว";
    }

    // FIX: Use cached user as fallback if auth isn't fully ready yet to ensure 'isMe' works
    const currentUser = authManager.currentUser || authManager.getCachedUser();

    if (container) {
      // 1. Mark all current rows for potential removal
      const rows = container.querySelectorAll('[data-uid]');
      const existingUids = new Set();
      rows.forEach(row => existingUids.add(row.dataset.uid));

      // 2. Process players from data
      players.forEach((p, index) => {
        existingUids.delete(p.uid); // Keep this player

        const isMe = p.uid === currentUser?.uid;
        const score = p.score || 0;
        const progress = p.progress || 0;
        const total = p.totalQuestions || 20;

        // Check Online Status
        const presence = this.playerPresences[p.uid];
        let isOnline = false;
        const now = Date.now();

        if (isMe) {
          isOnline = true;
        } else if (presence && presence.lastSeen) {
          const lastSeenTime = presence.lastSeen.toMillis ? presence.lastSeen.toMillis() : (presence.lastSeen.toDate ? presence.lastSeen.toDate().getTime() : 0);
          if (now - lastSeenTime < 25000) {
            isOnline = true;
          }
        }

        const onlineClass = isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600';

        let percent = 0;
        if (data.mode === 'time-attack' || data.mode === 'speed' || data.mode === 'speedrun') {
          percent = Math.min(100, Math.round((score / 10) * 100));
        } else {
          percent = Math.round((progress / total) * 100) || 0;
        }

        // --- Helper to generate status HTML ---
        const getStatusHtml = () => {
          if (data.status === 'started') {
            let scoreDisplay = '';
            if (data.mode === 'coop') scoreDisplay = `+${score}`;
            else if (p.eliminated) scoreDisplay = `<span class="text-red-500 font-bold">💀 OUT</span>`;
            else scoreDisplay = `${score} <span class="text-xs text-gray-400">pts</span>`;

            return `
                    <div class="flex flex-col items-end ml-auto min-w-[80px]">
                        <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${scoreDisplay}</span>
                        <span class="text-[10px] text-gray-500 dark:text-gray-400">ข้อที่ ${progress}/${total}</span>
                    </div>`;
          } else {
            if (p.uid === data.hostId) return '<span class="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full ml-auto font-bold">Host</span>';
            return p.ready
              ? '<span class="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full ml-auto font-bold">Ready</span>'
              : '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded-full ml-auto font-bold">Not Ready</span>';
          }
        };

        const getKickBtnHtml = () => {
          if (this.isHost && !isMe && data.status === 'waiting') {
            return `
                    <button class="kick-player-btn ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" data-uid="${p.uid}" data-name="${escapeHtml(p.name)}" title="เตะออกจากห้อง">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>`;
          }
          return '';
        };

        let row = container.querySelector(`[data-uid="${p.uid}"]`);

        if (row) {
          // --- UPDATE EXISTING ROW ---
          // Update Progress Bar
          const progressBar = row.querySelector('.progress-bar');
          if (progressBar) progressBar.style.width = `${percent}%`;

          // Update Rank (if started)
          const rankEl = row.querySelector('.rank-display');
          if (rankEl) rankEl.textContent = data.status === 'started' && data.mode !== 'coop' ? index + 1 : '';

          // Update Online Indicator
          const onlineDot = row.querySelector('.online-dot');
          if (onlineDot) {
            onlineDot.className = `online-dot absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm ${onlineClass}`;
          }

          // Update Status/Score (check if changed to avoid expensive innerHTML)
          const statusContainer = row.querySelector('.status-container');
          const newStatusHtml = getStatusHtml();
          if (statusContainer && statusContainer.innerHTML !== newStatusHtml) {
            statusContainer.innerHTML = newStatusHtml;
          }

          // Update Kick Button (visibility check)
          const kickContainer = row.querySelector('.kick-container');
          const newKickHtml = getKickBtnHtml();
          if (kickContainer && kickContainer.innerHTML.trim() !== newKickHtml.trim()) {
            kickContainer.innerHTML = newKickHtml;
          }

          // Move to correct position if order changed
          const currentIdx = Array.from(container.children).indexOf(row);
          if (currentIdx !== index) {
            if (index >= container.children.length) {
              container.appendChild(row);
            } else {
              container.insertBefore(row, container.children[index]);
            }
          }

        } else {
          // --- CREATE NEW ROW ---
          row = document.createElement('div');
          row.dataset.uid = p.uid;
          row.className = `flex items-center gap-3 p-3 ${isMe ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'} rounded-xl border anim-fade-in relative overflow-hidden transition-all duration-300`;

          const avatarSrc = p.avatar && (p.avatar.includes('/') || p.avatar.includes('.'))
            ? `<img src="${escapeHtml(p.avatar)}" class="w-full h-full rounded-full object-cover">`
            : escapeHtml(p.avatar || '🧑‍🎓');

          row.innerHTML = `
                <div class="progress-bar absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-500" style="width: ${percent}%"></div>
                
                <div class="rank-display font-bold text-gray-400 w-6 text-center">${data.status === 'started' && data.mode !== 'coop' ? index + 1 : ''}</div>
                
                <div class="relative text-3xl bg-white dark:bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-sm flex-shrink-0 animate-wiggle" style="animation-delay: ${index * 0.2}s">
                    ${avatarSrc}
                    <span class="online-dot absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm ${onlineClass}" title="Online"></span>
                </div>
                
                <div class="flex flex-col min-w-0">
                    <div class="font-bold text-gray-700 dark:text-gray-200 text-sm truncate">${escapeHtml(p.name)} ${isMe ? '(คุณ)' : ''}</div>
                </div>
                
                <div class="status-container flex ml-auto">
                    ${getStatusHtml()}
                </div>
                <div class="kick-container">
                    ${getKickBtnHtml()}
                </div>
            `;

          if (index >= container.children.length) {
            container.appendChild(row);
          } else {
            container.insertBefore(row, container.children[index]);
          }
        }
      });

      // 3. Remove players who left
      existingUids.forEach(uid => {
        const row = container.querySelector(`[data-uid="${uid}"]`);
        if (row) row.remove();
      });
    }

    // จัดการปุ่ม Start
    const startBtn = this.dom.startBtn;
    const waitingMsg = this.dom.waitingMsg;

    if (startBtn && waitingMsg) {
      if (data.status === 'started') {
        startBtn.classList.add('hidden');
        if (!this.isStarting) { // แสดงข้อความนี้เฉพาะตอนที่ยังไม่เริ่มนับถอยหลัง (เช่น เข้ามาทีหลัง)
          // FIX: Allow BOTH Host and Participants to manually join/re-join if the game is started
          waitingMsg.innerHTML = `
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-green-600 dark:text-green-400 font-bold">การแข่งขันกำลังดำเนินอยู่!</span>
                            <button id="manual-join-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-transform transform hover:scale-105">
                                ${this.isHost ? 'กลับสู่การแข่งขัน (Host)' : 'เข้าสู่การแข่งขัน'}
                            </button>
                        </div>
                    `;
          waitingMsg.classList.remove('hidden');
          document.getElementById('manual-join-btn')?.addEventListener('click', () => this.goToQuiz(data.quizConfig, data.mode));
        }
      } else {
        if (this.isHost) {
          startBtn.classList.remove('hidden');
          waitingMsg.classList.add('hidden');

          // ตรวจสอบว่าทุกคนพร้อมหรือยัง (Host จะ Ready เสมอโดยปริยาย)
          const allReady = data.players.every(p => p.ready);

          if (allReady) {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
            startBtn.innerHTML = '<span>เริ่มการแข่งขัน! 🚀</span>';
          } else {
            startBtn.disabled = true;
            startBtn.classList.add('opacity-50', 'cursor-not-allowed', 'grayscale');
            const notReadyCount = data.players.filter(p => !p.ready).length;
            startBtn.innerHTML = `<span>รอคนพร้อม (${notReadyCount}) ⏳</span>`;
          }

          // NEW: Add warning for host to prevent accidental room closure
          if (!document.getElementById('host-warning')) {
            const warning = document.createElement('div');
            warning.id = 'host-warning';
            warning.className = 'text-xs text-orange-500 text-center mt-2 font-medium animate-pulse';
            warning.textContent = '⚠️ ห้ามปิดหน้าจอหรือสลับแอป ห้องจะถูกปิดทันที';
            this.dom.lobbyTitle?.parentNode?.appendChild(warning);
          }
        } else {
          startBtn.classList.add('hidden');
          waitingMsg.textContent = 'รอหัวหน้าห้องเริ่มเกม...';
          waitingMsg.classList.remove('hidden', 'text-green-600', 'dark:text-green-400', 'font-bold');
          waitingMsg.classList.add('text-gray-500', 'dark:text-gray-400');
        }
      }
    }

    // Update Ready Button State
    if (this.dom.readyBtn) {
      if (data.status === 'started' || this.isHost) {
        this.dom.readyBtn.classList.add('hidden');
      } else {
        this.dom.readyBtn.classList.remove('hidden');
        const me = data.players.find(p => p.uid === authManager.currentUser?.uid);
        if (me) {
          if (me.ready) {
            this.dom.readyBtn.innerHTML = '<span>ยกเลิกพร้อม</span>';
            this.dom.readyBtn.className = 'px-4 py-2 rounded-lg font-bold shadow-sm transition-all transform hover:scale-105 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 mr-2';
          } else {
            this.dom.readyBtn.innerHTML = '<span>พร้อมแล้ว!</span>';
            this.dom.readyBtn.className = 'px-4 py-2 rounded-lg font-bold shadow-md transition-all transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white border border-transparent mr-2';
          }
        }
      }
    }
  }

  startCountdownAndGo(quizConfig, mode) {
    // FIX: Clear any existing timer before starting a new one to prevent overlap
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    if (!quizConfig) {
      console.error("Missing quiz config for countdown");
      return;
    }

    // Set a flag to indicate the game is starting, preventing other actions.
    this.isStarting = true;

    const waitingMsg = this.dom.waitingMsg;
    const startBtn = this.dom.startBtn;

    if (startBtn) startBtn.classList.add('hidden');

    if (waitingMsg) {
      waitingMsg.classList.remove('hidden');
      waitingMsg.classList.remove('text-gray-500');
      waitingMsg.classList.add('text-green-600', 'dark:text-green-400', 'font-bold', 'text-2xl', 'animate-pulse');
    }

    let count = 5;
    const updateCount = () => {
      if (waitingMsg) waitingMsg.textContent = `เริ่มเกมใน ${count}...`;
    };
    updateCount();

    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        updateCount();
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        if (waitingMsg) waitingMsg.textContent = "ไปลุยกันเลย! 🚀";
        this.transitionTimeout = setTimeout(() => {
          this.goToQuiz(quizConfig, mode);
        }, 1500);
      }
    }, 1000);
  }

  async startGame() {
    if (!this.isHost || !this.currentLobbyId) return;

    // FIX: Disable start button immediately to prevent double clicks/race conditions
    if (this.dom.startBtn) this.dom.startBtn.disabled = true;

    try {
      await updateDoc(doc(db, 'lobbies', this.currentLobbyId), {
        status: 'started'
      });
    } catch (e) {
      console.error("Start game failed:", e);
      if (this.dom.startBtn) this.dom.startBtn.disabled = false;
      showToast('เริ่มเกมไม่สำเร็จ', 'เกิดข้อผิดพลาดในการเริ่มเกม', '❌', 'error');
    }
  }

  goToQuiz(config, mode) {
    // ถ้าอยู่ในหน้า Quiz อยู่แล้ว ไม่ต้อง Redirect ซ้ำ
    if (window.location.pathname.includes('/quiz/')) return;

    // Safety check: If lobby ID is missing, we can't proceed correctly in multiplayer context
    if (!this.currentLobbyId) {
      console.error("Cannot go to quiz: Lobby ID is missing");
      return;
    }

    this.isTransitioning = true;
    this.lobbyModal.close();

    // Clean up URL parameters using URLSearchParams
    const params = new URLSearchParams();
    params.set('id', config.id);
    params.set('mode', mode || 'challenge');
    params.set('lobbyId', this.currentLobbyId);

    if (config.amount !== null && config.amount !== undefined) {
      params.set('amount', config.amount);
    }
    if (config.seed !== null && config.seed !== undefined) {
      params.set('seed', config.seed);
    }

    window.location.href = `./quiz/index.html?${params.toString()}`;
  }

  updateLobbyUI(data) {
    if (!this.dom.playersListContainer) return;

    // Title & Info
    if (this.dom.roomIdDisplay) this.dom.roomIdDisplay.textContent = this.currentLobbyId;
    if (this.dom.quizName) this.dom.quizName.textContent = data.quizConfig?.title || 'แบบทดสอบ';

    const modeNames = {
      'classic': 'Classic Mode',
      'time-attack': 'Speed Run',
      'survival': 'Survival Mode',
      'coop': 'Co-op Mode'
    };
    if (this.dom.modeDisplay) this.dom.modeDisplay.textContent = modeNames[data.mode] || data.mode;

    // NEW: Show/Hide Edit Buttons for Host
    if (this.isHost) {
      this.dom.editQuizBtn?.classList.remove('hidden');
      this.dom.editModeBtn?.classList.remove('hidden');
    } else {
      this.dom.editQuizBtn?.classList.add('hidden');
      this.dom.editModeBtn?.classList.add('hidden');
    }

    // Players List
    const players = data.players || [];
    if (this.dom.playerCount) this.dom.playerCount.textContent = players.length;

    this.dom.playersListContainer.innerHTML = players.map(p => {
      const isMe = p.uid === authManager.currentUser?.uid;
      const readyStatus = p.ready ? '<span class="text-green-500 font-bold">พร้อม!</span>' : '<span class="text-gray-400">รอ...</span>';
      const isHost = p.uid === data.hostId;

      let kickBtn = '';
      if (this.isHost && !isMe) {
        kickBtn = `
                    <button class="kick-player-btn p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-2" title="เชิญออก" data-uid="${p.uid}" data-name="${escapeHtml(p.name)}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                    </button>
                `;
      }

      return `
                <div class="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg border border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden">
                             ${p.avatar && (p.avatar.includes('/') || p.avatar.includes('.')) ? `<img src="${p.avatar}" class="w-full h-full object-cover">` : (p.avatar || '🧑‍🎓')}
                        </div>
                        <div class="min-w-0">
                            <div class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate flex items-center gap-1">
                                ${escapeHtml(p.name)}
                                ${isMe ? '<span class="text-xs text-blue-500">(ฉัน)</span>' : ''}
                                ${isHost ? '<span class="text-xs text-yellow-500">👑</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <div class="text-xs">${readyStatus}</div>
                        ${kickBtn}
                    </div>
                </div>
            `;
    }).join('');

    // Start Button Logic (Host only)
    if (this.isHost) {
      this.dom.readyBtn?.classList.add('hidden'); // Host doesn't need ready button
      this.dom.startBtn?.classList.remove('hidden');

      const allReady = players.length > 0 && players.every(p => p.ready || p.uid === data.hostId); // Host is implicitly ready
      // const allReady = players.length > 1; // Dev Testing

      if (allReady) {
        this.dom.startBtn.disabled = false;
        this.dom.startBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
        this.dom.startBtn.classList.add('animate-pulse');
        this.dom.waitingMsg?.classList.add('hidden');
      } else {
        this.dom.startBtn.disabled = true;
        this.dom.startBtn.classList.add('opacity-50', 'cursor-not-allowed', 'grayscale');
        this.dom.startBtn.classList.remove('animate-pulse');
        if (this.dom.waitingMsg) {
          this.dom.waitingMsg.classList.remove('hidden');
          this.dom.waitingMsg.classList.add('flex');
        }
      }
    } else {
      // Client View
      this.dom.startBtn?.classList.add('hidden');
      this.dom.readyBtn?.classList.remove('hidden');

      const me = players.find(p => p.uid === authManager.currentUser?.uid);
      if (me && me.ready) {
        this.dom.readyBtn.textContent = 'ยกเลิกพร้อม';
        this.dom.readyBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
        this.dom.readyBtn.classList.add('bg-green-500', 'text-white', 'ring-2', 'ring-green-300');
      } else {
        this.dom.readyBtn.textContent = 'พร้อม!';
        this.dom.readyBtn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
        this.dom.readyBtn.classList.remove('bg-green-500', 'text-white', 'ring-2', 'ring-green-300');
      }

      if (this.dom.waitingMsg) {
        this.dom.waitingMsg.classList.remove('hidden');
        this.dom.waitingMsg.classList.add('flex');
        this.dom.waitingMsg.querySelector('span:last-child').textContent = 'รอหัวหน้าห้องเริ่มเกม...';
      }
    }
  }

  // NEW: Method to specifically reopen the lobby from result screen
  async reopenLobby() {
    this.isReopening = true; // Flag to prevent auto-close logic
    this.isTransitioning = false;
    this.isStarting = false;

    // Use cached ID or fetch from storage
    const lobbyId = this.currentLobbyId || sessionStorage.getItem('reconnect_lobby_id');

    if (lobbyId) {
      // If we still have the listener, just show the modal
      this.lobbyModal.open();

      // If we lost the listener (e.g. page reload), re-join
      if (!this.unsubscribe) {
        await this.joinLobby(lobbyId);
      }
    } else {
      showToast('ไม่พบข้อมูลห้อง', 'กรุณาสร้างห้องใหม่หรือเข้าร่วมใหม่', '⚠️');
      this.openMainMenu();
    }

    // Reset flag after a short delay
    setTimeout(() => { this.isReopening = false; }, 1000);
  }

  async resetLobby() {
    if (!this.currentLobbyId || !this.isHost) return;

    try {
      // 1. Reset status to waiting
      // 2. Clear winnerName
      // 3. Reset players ready status and progress? (Optional, but good for clean slate)
      //    For now, let's keep players but reset their game state.

      const lobbyRef = doc(db, 'lobbies', this.currentLobbyId);

      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(lobbyRef);
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        const players = data.players || [];

        // Reset player stats
        const resetPlayers = players.map(p => ({
          ...p,
          score: 0,
          progress: 0,
          ready: p.uid === data.hostId, // Host is ready, others not
          eliminated: false
        }));

        transaction.update(lobbyRef, {
          status: 'waiting',
          winnerName: null,
          players: resetPlayers
        });
      });

      showToast('เริ่มใหม่', 'รีเซ็ตห้องเรียบร้อยแล้ว', '🔄');
      this.reopenLobby(); // Host goes back immediately

    } catch (e) {
      console.error("Failed to reset lobby:", e);
      showToast('ผิดพลาด', 'ไม่สามารถรีเซ็ตห้องได้', '❌', 'error');
    }
  }

  async leaveLobby(removeFromDb = true) {
    if (this.isTransitioning) return;

    const lobbyId = this.currentLobbyId;
    const user = authManager.currentUser;

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.chatUnsubscribe) {
      this.chatUnsubscribe();
      this.chatUnsubscribe = null;
    }
    if (this.typingUnsubscribe) {
      this.typingUnsubscribe();
      this.typingUnsubscribe = null;
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    if (this.currentLobbyId) this.updateTypingStatus(false).catch(() => { });

    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = null; // Reset reference

    // FIX: Clear transition timeout if user leaves during the final delay
    if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
    this.transitionTimeout = null;

    this.currentLobbyId = null;

    // NEW: Stop heartbeat and presence listener
    this.stopHeartbeat();
    if (this.presenceUnsubscribe) {
      this.presenceUnsubscribe();
      this.presenceUnsubscribe = null;
    }

    sessionStorage.removeItem('reconnect_lobby_id');
    this.isHost = false;
    this.isStarting = false;
    this.lobbyModal.close();

    // Cleanup
    delete window.challengeContext;

    // Remove from DB
    if (removeFromDb && lobbyId && user) {
      await this.removePlayerFromLobby(lobbyId, user.uid);
    }
  }

  openLobbyUI(lobbyId) {
    this.lobbyModal.open();
  }

  destroy() {
    this.leaveLobby(false);

    if (this.onOffline) window.removeEventListener('offline', this.onOffline);
    if (this.onOnline) window.removeEventListener('online', this.onOnline);
    if (this.modalObserver) this.modalObserver.disconnect();

    this.isInitialized = false;
  }
}

export const challengeManager = new ChallengeManager();
