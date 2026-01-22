import { ModalHandler } from './modal-handler.js';
import { shuffleArray } from './utils.js';
import { Gamification, SHOP_ITEMS, PROFICIENCY_GROUPS } from './gamification.js';
import { showToast } from './toast.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { authManager } from './auth-manager.js';

// state: Stores all dynamic data of the quiz
let state = {};
// elements: Caches all DOM elements for quick access
let elements = {};
// handler: A dedicated handler for the resume modal
let resumeModalHandler;
// handler: For power-up buy modal
let powerupBuyModalHandler;
// config: Stores all static configuration and constants
const config = {
  soundOnIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`,
  soundOffIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l-2-2m0 0l-2-2m2 2l-2 2m2-2l2-2" /></svg>`,
  resultMessages: {
    perfect: {
      title: "สุดยอดไปเลย!",
      message: "ทำคะแนนเต็มได้แบบนี้ ความเข้าใจเป็นเลิศ!",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
      colorClass: "text-yellow-400",
    },
    great: {
      title: "เก่งมาก!",
      message: "เก่งมาก! ความรู้แน่นจริงๆ",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`,
      colorClass: "text-blue-500",
    },
    good: {
      title: "ทำได้ดี!",
      message: "ทำได้ดี! ทบทวนอีกนิดหน่อยจะสมบูรณ์แบบเลย",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085c-.5 0-.975.335-1.175.808l-2 5m7 5h2.833l3.5-7A2 2 0 0017.263 5h-4.017c-.163 0-.326-.02-.485-.06L7 6" /></svg>`,
      colorClass: "text-green-500",
    },
    effort: {
      title: "พยายามได้ดีมาก!",
      message: "ไม่เป็นไรนะ สู้ๆ แล้วลองพยายามอีกครั้ง!",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22l-.648-1.437a3.375 3.375 0 00-2.456-2.456L12 18.25l1.438-.648a3.375 3.375 0 002.456-2.456L16.25 14l.648 1.437a3.375 3.375 0 002.456 2.456L20.75 18.25l-1.438.648a3.375 3.375 0 00-2.456 2.456z" /></svg>`,
      colorClass: "text-gray-500",
    },
  },
  icons: {
    next: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>`,
    prev: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>`,
    submit: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`,
  },
  timerDefaults: {
    perQuestion: 90, // 90 วินาทีต่อข้อ
    overallMultiplier: 75, // 75 วินาที * จำนวนข้อ สำหรับเวลาทั้งชุด
  },
};

/**
 * Parses the subCategory property from a question object and returns a standardized format.
 * This centralizes the logic for handling both old (string) and new (object) formats.
 * @param {object|string} subCategory - The subCategory property from a question.
 * @returns {{main: string, specific: string|null}} An object with main and specific category names.
 */
function getCategoryNames(subCategory) {
  if (!subCategory) {
    return { main: 'ไม่มีหมวดหมู่', specific: null };
  }
  if (typeof subCategory === 'object' && subCategory.main) {
    return {
      main: subCategory.main,
      specific: subCategory.specific || null // Return null if not present
    };
  }
  if (typeof subCategory === 'string') {
    // Legacy format or simple string
    return { main: subCategory, specific: null };
  }
  return { main: 'ไม่มีหมวดหมู่', specific: null };
}

/**
 * Splits a long string into an array of strings for multiline display in Chart.js.
 * @param {string} str - The string to wrap.
 * @param {number} maxLen - Maximum length of each line.
 * @returns {string[]} An array of strings.
 */
function wrapLabel(str, maxLen = 30) {
  if (!str) return '';
  if (str.length <= maxLen) return str;

  const words = str.split(' ');
  const lines = [];
  let currentLine = '';

  // For Thai text which might not have spaces, we need a smarter approach
  if (words.length === 1 && str.length > maxLen) {
    // Split by length for Thai/unspaced text
    for (let i = 0; i < str.length; i += maxLen) {
      lines.push(str.substring(i, i + maxLen));
    }
    return lines;
  }

  words.forEach(word => {
    if ((currentLine + word).length <= maxLen) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function ensurePowerUpModalExists() {
  if (document.getElementById('powerup-buy-modal')) return;
  const modalHTML = `
    <div id="powerup-buy-modal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" role="dialog" aria-modal="true">
        <div class="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 relative">
            <button data-modal-close class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div class="flex flex-col items-center text-center">
                <div id="powerup-modal-icon" class="text-6xl mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                <h3 id="powerup-modal-title" class="text-2xl font-bold text-gray-900 dark:text-white font-kanit mb-2"></h3>
                <p id="powerup-modal-desc" class="text-gray-600 dark:text-gray-300 mb-4 text-sm"></p>
                
                <div class="flex items-center gap-4 mb-6 text-sm">
                    <div class="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300 font-bold">
                        มี: <span id="powerup-user-xp">0 XP</span>
                    </div>
                    <div class="text-gray-400">→</div>
                    <div class="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full text-red-700 dark:text-red-300 font-bold">
                        จ่าย: <span id="powerup-item-cost">0 XP</span>
                    </div>
                </div>

                <div class="w-full flex gap-3">
                    <button data-modal-close class="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition">ยกเลิก</button>
                    <button id="powerup-confirm-buy-btn" class="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md">ยืนยัน</button>
                </div>
            </div>
        </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Initializes the entire quiz application.
 * This function is the main entry point for the quiz logic, called by quiz-loader.js.
 * @param {Array} quizData - The array of question objects for the quiz.
 * @param {string} storageKey - The key for storing progress in localStorage.
 * @param {string} quizTitle - The title of the current quiz.
 * @param {number|null} customTime - Custom time in seconds, if provided.
 * @param {string} action - Action from URL (e.g. 'view_results')
 * @param {boolean} isChallenge - Whether this is a challenge/multiplayer session
 * @param {number} lives - Initial lives for Survival mode
 * @param {string} timerMode - Timer mode from custom quiz settings (optional)
 */
export function init(quizData, storageKey, quizTitle, customTime, action, isChallenge = false, lives = 1, timerMode = null) {
  // Ensure the power-up modal exists in the DOM
  ensurePowerUpModalExists();

  // --- 1. Element Caching ---
  elements = {
    // Screens
    startScreen: document.getElementById("start-screen"),
    quizScreen: document.getElementById("quiz-screen"),
    resultScreen: document.getElementById("result-screen"),
    reviewScreen: document.getElementById("review-screen"),
    quizNav: document.getElementById("quiz-nav"),
    // Buttons
    startBtn: document.getElementById("start-btn"),
    skipBtn: document.getElementById("skip-btn"),
    nextBtn: document.getElementById("next-btn"),
    prevBtn: document.getElementById("prev-btn"),
    restartBtn: document.getElementById("restart-btn"),
    reviewBtn: document.getElementById("review-btn"),
    backToResultBtn: document.getElementById("back-to-result-btn"),
    // Quiz UI
    questionCounter: document.getElementById("question-counter"),
    scoreCounter: document.getElementById("score-counter"),
    question: document.getElementById("question"),
    options: document.getElementById("options"),
    feedback: document.getElementById("feedback"),
    feedbackContent: document.querySelector("#feedback .feedback-content"),
    progressBar: document.getElementById("progress-bar"),
    // Result & Review UI
    reviewContainer: document.getElementById("review-container"),
    // Modal & Sound
    resumeModal: document.getElementById("resume-modal"),
    resumeConfirmBtn: document.getElementById("resume-confirm-btn"),
    resumeRejectBtn: document.getElementById("resume-reject-btn"),
    soundToggleBtn: document.getElementById("sound-toggle-btn"),
    timerDisplay: document.getElementById("timer-display"),
    timerValue: document.getElementById("timer-value"),
    // Cache the container for the main action buttons (Next/Prev)
    // Cache the container for the main action buttons (Next/Prev)
    actionContainer: document.getElementById("next-btn")?.parentElement,
    quizTitleDisplay: document.getElementById("quiz-title-display"),
    // New hint elements
    hintBtn: document.getElementById("hint-btn"),
    hintContainer: document.getElementById("hint-container"),
    hintSection: document.getElementById("hint-section"),
    // Power-up container (will be created dynamically)
    powerUpContainer: null,
    // Power-up Modal Elements
    powerupModalIcon: document.getElementById("powerup-modal-icon"),
    powerupModalTitle: document.getElementById("powerup-modal-title"),
    powerupModalDesc: document.getElementById("powerup-modal-desc"),
    powerupUserXp: document.getElementById("powerup-user-xp"),
    powerupItemCost: document.getElementById("powerup-item-cost"),
    powerupConfirmBtn: document.getElementById("powerup-confirm-buy-btn"),
  };
  // --- 2. State Initialization ---
  state = {
    quizData: quizData, // Use data passed from the loader
    storageKey: storageKey, // Use key passed from the loader
    quizTitle: quizTitle || "แบบทดสอบ",
    customTime: customTime, // Store custom time
    currentQuestionIndex: 0,
    score: 0,
    shuffledQuestions: [],
    userAnswers: [],
    isSoundEnabled: true, // This will be initialized properly later
    correctSound: new Audio("../assets/audio/correct.mp3"),
    incorrectSound: new Audio("../assets/audio/incorrect.mp3"),
    levelUpSound: new Audio("../assets/audio/level-up.mp3"), // Added missing sound
    badgeSound: new Audio("../assets/audio/badge-unlock.mp3"), // Added missing sound
    timerMode: timerMode || "none", // Initialize with passed mode or default
    timeLeft: 0,
    timerId: null,
    initialTime: 0,
    activeScreen: null,
    isFloatingNav: false, // To track the nav state
    game: new Gamification(), // Initialize game instance
    xpMultiplier: 1, // Default multiplier
    used5050: false,
    usedCut1: false,
    usedRangeHint: false,
    usedTolerance: false,
    isCustomQuiz: false,
    questionCount: 0,
    // --- NEW: Multiplayer/Challenge State ---
    isChallenge: isChallenge,
    lobbyId: null,
    mode: 'classic',
    initialLives: lives,
    lives: lives,
    currentTeamScore: 0,
    lobbyUnsubscribe: null,
    isEliminated: false,
    hasWon: false
  };

  // --- 3. Initial Setup ---
  resumeModalHandler = new ModalHandler('resume-modal');
  powerupBuyModalHandler = new ModalHandler('powerup-buy-modal');
  bindEventListeners();
  initializeSound();
  // NEW: Set quiz metadata
  state.isCustomQuiz = storageKey.startsWith('quizState-custom_');
  state.questionCount = quizData.length;

  // --- NEW: Parse Challenge Params ---
  const urlParams = new URLSearchParams(window.location.search);
  state.lobbyId = urlParams.get('lobbyId');
  state.mode = urlParams.get('mode') || 'classic';

  if (state.isChallenge && state.lobbyId) {
    setupMultiplayerUI();
  }

  checkForSavedQuiz(action); // This will check localStorage and either show the start screen or a resume prompt.
  setupPowerUpUI(); // Setup the power-up bar
  showQuestionCountWarning();
}

/**
 * Shows a warning on the start screen if the quiz has fewer than 20 questions,
 * as it won't count for certain daily quests.
 */
function showQuestionCountWarning() {
  if (state.questionCount > 0 && state.questionCount < 20) {
    const startScreen = elements.startScreen;
    const startBtn = elements.startBtn;

    if (startScreen && startBtn) {
      // Check if warning already exists to avoid duplication
      if (document.getElementById('quest-requirement-warning')) return;

      const warningDiv = document.createElement('div');
      warningDiv.id = 'quest-requirement-warning';
      warningDiv.className = 'mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg text-sm text-amber-800 dark:text-amber-200 text-left max-w-md mx-auto anim-fade-in shadow-sm';
      warningDiv.innerHTML = `
        <div class="flex gap-3">
          <span class="text-xl flex-shrink-0">📜</span>
          <div>
            <p class="font-bold mb-1">ข้อแนะนำสำหรับภารกิจ</p>
            <p>แบบทดสอบนี้มี <span class="font-bold underline">${state.questionCount} ข้อ</span> ซึ่งไม่ถึงเกณฑ์ 20 ข้อ จึงจะไม่ถูกนับในภารกิจประจำวันบางประเภท (เช่น ภารกิจทำคะแนนเต็ม หรือภารกิจจบชุดชุดแบบทดสอบ)</p>
          </div>
        </div>
      `;
      startBtn.parentNode.insertBefore(warningDiv, startBtn);
    }
  }
}

/**
 * Updates the appearance of the "Next" button (icon and title) based on its required action.
 * @param {'next' | 'submit'} action - The action the button should perform.
 */
function updateNextButtonAppearance(action) {
  if (!elements.nextBtn) return;

  const isLastQuestion = state.currentQuestionIndex === state.shuffledQuestions.length - 1;
  const isAnswered = state.userAnswers[state.currentQuestionIndex] !== null;

  let buttonText = 'ข้อต่อไป';
  let buttonIcon = config.icons.next;
  let buttonTitle = 'ข้อต่อไป';

  if (action === 'submit') {
    buttonText = 'ส่งคำตอบ';
    buttonIcon = config.icons.submit;
    buttonTitle = 'ส่งคำตอบ';
  } else if (isLastQuestion && isAnswered) {
    buttonText = 'ดูผลสรุป';
    buttonIcon = config.icons.submit; // Using the submit icon for "finish" is fine.
    buttonTitle = 'ดูผลสรุป';
  }

  if (state.isFloatingNav) {
    elements.nextBtn.innerHTML = buttonIcon;
    elements.nextBtn.title = buttonTitle;
  } else {
    elements.nextBtn.innerHTML = ''; // Clear icons
    elements.nextBtn.textContent = buttonText;
  }
}

/**
 * Toggles the floating state for the main quiz action buttons.
 * This changes the Next/Previous buttons from standard text buttons to floating
 * circular icon buttons in the bottom-right corner of the screen.
 * @param {boolean} active - Whether to activate or deactivate the floating navigation.
 */
function setFloatingNav(active) {
  if (!elements.actionContainer || !elements.nextBtn || !elements.prevBtn) return;

  state.isFloatingNav = active;

  const containerFloatingClasses = ['fixed', 'bottom-4', 'right-4', 'z-20', 'gap-3'];
  const buttonFloatingClasses = ['w-16', 'h-16', 'rounded-full', 'flex', 'items-center', 'justify-center', 'shadow-lg', 'hover:shadow-xl', 'transition', 'p-0', 'border-0'];

  if (active) {
    // --- 1. Configure Container ---
    elements.actionContainer.classList.remove('justify-between', 'mt-8');
    elements.actionContainer.classList.add(...containerFloatingClasses);

    // --- 2. Configure Buttons ---
    elements.prevBtn.classList.add(...buttonFloatingClasses);
    elements.prevBtn.innerHTML = config.icons.prev;
    elements.prevBtn.title = "ข้อก่อนหน้า";

    elements.nextBtn.classList.add(...buttonFloatingClasses);
    updateNextButtonAppearance('next'); // Set default icon

    // Add padding to the bottom of the quiz screen to prevent content overlap
    if (elements.quizScreen) {
      elements.quizScreen.style.paddingBottom = '6rem'; // 96px
    }
  } else {
    // --- 1. Revert Container ---
    elements.actionContainer.classList.remove(...containerFloatingClasses);
    elements.actionContainer.classList.add('justify-between', 'mt-8');

    // --- 2. Revert Buttons ---
    elements.prevBtn.classList.remove(...buttonFloatingClasses);
    elements.prevBtn.innerHTML = "ข้อก่อนหน้า";
    elements.prevBtn.title = "";

    elements.nextBtn.classList.remove(...buttonFloatingClasses);
    updateNextButtonAppearance('next'); // Revert to text

    // Reset padding
    if (elements.quizScreen) {
      elements.quizScreen.style.paddingBottom = '';
    }
  }
}

// --- UI / Rendering Functions ---

/**
 * Handles smooth transitions between different screens (e.g., start, quiz, results).
 * @param {HTMLElement} toScreen The screen to show.
 */
function switchScreen(toScreen) {
  const transitionDuration = 300; // ms, should match CSS animation duration
  const fromScreen = state.activeScreen;

  if (fromScreen && fromScreen !== toScreen) {
    fromScreen.classList.add("anim-fade-out");
    setTimeout(() => {
      fromScreen.classList.add("hidden");
      fromScreen.classList.remove("anim-fade-out");
    }, transitionDuration);
  }

  if (toScreen) {
    toScreen.classList.remove("hidden");
    toScreen.classList.add("anim-fade-in");
    state.activeScreen = toScreen;
  }
}

/**
 * Renders mathematical formulas in a specific element using KaTeX.
 * @param {HTMLElement} element The element to render math in.
 */
function renderMath(element) {
  if (window.renderMathInElement && element) {
    window.renderMathInElement(element, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      throwOnError: false,
    });
  }
}

function updateProgressBar() {
  if (!elements.progressBar) return; // ป้องกัน error หากไม่มี element นี้ในหน้า
  // คำนวณ % ความคืบหน้าจากข้อปัจจุบัน
  const progressPercentage =
    ((state.currentQuestionIndex + 1) / state.shuffledQuestions.length) * 100;
  elements.progressBar.style.width = `${progressPercentage}%`;
  if (elements.quizNav) elements.quizNav.classList.remove("hidden");
}

/**
 * Creates a single option button element.
 * @param {string} optionText - The text content for the option.
 * @param {object|null} previousAnswer - The user's previously recorded answer for this question, if any.
 * @returns {HTMLElement} The created button element.
 */
function createOptionButton(optionText, previousAnswer) {
  const button = document.createElement("button");
  button.innerHTML = optionText.replace(/\n/g, "<br>");
  button.dataset.optionValue = optionText; // Store raw value
  button.className = "option-btn w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500";

  if (previousAnswer) {
    // This is a revisited question, so we disable the button and show its state.
    button.disabled = true;
    const isCorrectOption = optionText.trim() === previousAnswer.correctAnswer.trim();
    const wasSelected = optionText.trim() === previousAnswer.selectedAnswer.trim();

    if (isCorrectOption) {
      button.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-500', 'dark:border-green-600', 'text-green-800', 'dark:text-green-300');
    } else if (wasSelected) {
      // Only mark as incorrect if it was selected and is not the correct answer.
      button.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'dark:border-red-600', 'text-red-800', 'dark:text-red-400');
    } else {
      button.classList.add('opacity-60');
    }
  } else {
    // This is a new, unanswered question.
    button.addEventListener("click", selectAnswer);
  }

  return button;
}

/**
 * Creates a single checkbox option element for multiple-select questions.
 * The entire element is a label, making it fully clickable for better UX.
 * @param {string} optionText - The text content for the option.
 * @param {object|null} previousAnswer - The user's previously recorded answer.
 * @returns {HTMLElement} The created label element which acts as a fully clickable wrapper.
 */
function createCheckboxOption(optionText, previousAnswer) {
  const wrapperLabel = document.createElement('label');
  // The entire element is now a label, making it fully clickable.
  // Added cursor-pointer to the wrapper itself and a smooth transition.
  wrapperLabel.className = 'option-checkbox-wrapper flex items-center w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors duration-150';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = optionText.trim();
  // The checkbox itself doesn't need a pointer cursor and we prevent double-toggling.
  checkbox.className = 'h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none';

  const textSpan = document.createElement('span');
  textSpan.innerHTML = optionText.replace(/\n/g, "<br>");
  // The text span doesn't need a pointer cursor either.
  textSpan.className = 'ml-3 text-gray-800 dark:text-gray-200 w-full';

  wrapperLabel.appendChild(checkbox);
  wrapperLabel.appendChild(textSpan);

  if (previousAnswer) {
    checkbox.disabled = true;
    // When disabled, the wrapper should not look clickable.
    wrapperLabel.classList.remove('cursor-pointer', 'hover:bg-gray-100', 'dark:hover:bg-gray-700', 'hover:border-blue-500', 'dark:hover:border-blue-500');
    wrapperLabel.classList.add('cursor-default');

    const selectedAnswers = new Set(previousAnswer.selectedAnswer || []);
    const correctAnswersSet = new Set(previousAnswer.correctAnswer || []);
    if (selectedAnswers.has(optionText.trim())) {
      checkbox.checked = true;
    }

    if (correctAnswersSet.has(optionText.trim())) {
      wrapperLabel.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-500', 'dark:border-green-600', 'anim-correct-pop');
    } else if (selectedAnswers.has(optionText.trim())) {
      wrapperLabel.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'dark:border-red-600', 'anim-shake');
    } else {
      wrapperLabel.classList.add('opacity-60');
    }
  }
  return wrapperLabel;
}

/**
 * Sets up the Power-up UI elements.
 */
function setupPowerUpUI() {
  // Create container if it doesn't exist
  if (!document.getElementById('power-up-bar')) {
    const container = document.createElement('div');
    container.id = 'power-up-bar';
    container.className = 'flex flex-wrap justify-center gap-3 mb-6 px-2';

    // Insert before the question container
    const questionContainer = document.getElementById('question');
    if (questionContainer && questionContainer.parentNode) {
      questionContainer.parentNode.insertBefore(container, questionContainer);
    }
    elements.powerUpContainer = container;
  }
}

/**
 * Renders the power-up buttons based on current inventory.
 */
function renderPowerUps(animateItemId = null) {
  if (!elements.powerUpContainer) return;

  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  const isNumberQuestion = currentQuestion && currentQuestion.type === 'fill-in-number';
  const hasOptions = currentQuestion && (currentQuestion.options || currentQuestion.choices);

  const consumables = SHOP_ITEMS.filter(i => i.type === 'consumable');

  elements.powerUpContainer.innerHTML = consumables.map(item => {
    // Filter items based on question type
    if (item.id === 'item_5050' || item.id === 'item_cut_1') {
      if (!hasOptions) return '';
    }
    if (item.id === 'item_range_hint' || item.id === 'item_tolerance') {
      if (!isNumberQuestion) return '';
    }

    // NEW: Filter items based on Quiz Mode
    if (item.id === 'item_time_freeze' && state.timerMode === 'none') {
      return ''; // Hide time freeze if no timer
    }
    if (item.id === 'item_streak_freeze') {
      return ''; // Never show streak freeze in quiz (it's for profile)
    }

    const count = state.game.getItemCount(item.id);
    let isUsed = false;
    if (item.id === 'item_xp_2x') isUsed = state.xpMultiplier > 1;
    else if (item.id === 'item_5050') isUsed = state.used5050;
    else if (item.id === 'item_cut_1') isUsed = state.usedCut1;
    else if (item.id === 'item_range_hint') isUsed = state.usedRangeHint;
    else if (item.id === 'item_tolerance') isUsed = state.usedTolerance;
    // item_undo and item_time_freeze are instant effects, not toggle states

    // Check if item should be disabled (e.g., Time Freeze when no timer)
    const isTimeFreeze = item.id === 'item_time_freeze';
    const isTimerDisabled = state.timerMode === 'none';
    const isDisabled = isUsed || (isTimeFreeze && isTimerDisabled);

    let btnClass = "relative group flex items-center justify-center lg:justify-start gap-0 lg:gap-2 p-2 lg:px-3 lg:py-1.5 rounded-xl lg:rounded-full transition-all shadow-sm border-2 ";

    if (item.id === animateItemId) {
      btnClass += "anim-item-pop ";
    }

    if (isUsed) {
      btnClass += "bg-green-100 text-green-700 border-green-500 cursor-default opacity-80";
    } else if (isTimeFreeze && isTimerDisabled) {
      // Style for unavailable item
      btnClass += "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60 grayscale";
    } else if (count > 0) {
      btnClass += "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-400 cursor-pointer transform hover:scale-105";
    } else {
      btnClass += "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200";
    }

    return `
            <button class="power-up-btn ${btnClass}" data-id="${item.id}" ${isDisabled ? 'disabled' : ''} title="${item.name}">
                <span class="text-xl lg:text-base leading-none">${item.icon}</span>
                <span class="hidden lg:inline text-sm font-bold">${item.name}</span>
                <span class="absolute -top-2 -right-2 lg:static lg:top-auto lg:right-auto bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded-full text-[10px] lg:text-xs font-bold min-w-[1.25rem] text-center border border-gray-200 dark:border-gray-500 shadow-sm z-10">
                    ${isUsed ? '✓' : count}
                </span>
            </button>
        `;
  }).join('');

  // Bind events
  elements.powerUpContainer.querySelectorAll('.power-up-btn').forEach(btn => {
    btn.addEventListener('click', (e) => handlePowerUpClick(e.currentTarget.dataset.id));
  });
}

function handlePowerUpClick(itemId) {
  const count = state.game.getItemCount(itemId);

  if (count <= 0) {
    // Show buy modal
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    // Populate Modal Data
    if (elements.powerupModalIcon) elements.powerupModalIcon.textContent = item.icon;
    if (elements.powerupModalTitle) elements.powerupModalTitle.textContent = item.name;
    if (elements.powerupModalDesc) elements.powerupModalDesc.textContent = item.desc;
    if (elements.powerupUserXp) elements.powerupUserXp.textContent = `${state.game.state.xp.toLocaleString()} XP`;
    if (elements.powerupItemCost) elements.powerupItemCost.textContent = `${item.cost} XP`;

    // Setup Confirm Button
    if (elements.powerupConfirmBtn) {
      // Clone to remove old listeners
      const newBtn = elements.powerupConfirmBtn.cloneNode(true);
      elements.powerupConfirmBtn.parentNode.replaceChild(newBtn, elements.powerupConfirmBtn);
      elements.powerupConfirmBtn = newBtn;

      elements.powerupConfirmBtn.onclick = () => {
        const result = state.game.buyItem(itemId);
        if (result.success) {
          showToast('ซื้อสำเร็จ', result.message, '🛒');
          renderPowerUps(itemId);
          powerupBuyModalHandler.close();
        } else {
          showToast('ซื้อไม่สำเร็จ', result.message, '❌', 'error');
          powerupBuyModalHandler.close();
        }
      };
    }

    powerupBuyModalHandler.open();
    return;
  }

  // Use Item Logic
  if (itemId === 'item_5050') {
    if (state.used5050) return;
    if (state.userAnswers[state.currentQuestionIndex]) return; // Cannot use if already answered
    if (state.game.useItem(itemId)) {
      apply5050();
      state.used5050 = true;
      renderPowerUps(itemId);
      showToast('ใช้ตัวช่วยสำเร็จ', 'ตัดตัวเลือกผิดออก 2 ข้อ', '✂️');
    }
  } else if (itemId === 'item_xp_2x') {
    if (state.xpMultiplier > 1) return;
    if (state.game.useItem(itemId)) {
      state.xpMultiplier = 2;
      renderPowerUps(itemId);
      showToast('ใช้ตัวช่วยสำเร็จ', 'XP คูณ 2 สำหรับการสอบครั้งนี้!', '✨', 'gold');
    }
  } else if (itemId === 'item_cut_1') {
    if (state.usedCut1 || state.used5050) return; // Don't stack with 50/50 easily
    if (state.userAnswers[state.currentQuestionIndex]) return;
    if (state.game.useItem(itemId)) {
      applyCut1();
      state.usedCut1 = true;
      renderPowerUps(itemId);
      showToast('ใช้ตัวช่วยสำเร็จ', 'ตัดตัวเลือกผิดออก 1 ข้อ', '🔪');
    }
  } else if (itemId === 'item_undo') {
    const currentAns = state.userAnswers[state.currentQuestionIndex];
    if (currentAns && !currentAns.isCorrect) {
      if (state.game.useItem(itemId)) {
        undoLastAnswer();
        renderPowerUps(itemId);
        showToast('ใช้ตัวช่วยสำเร็จ', 'เริ่มตอบข้อนี้ใหม่ได้เลย!', '↩️');
      }
    } else {
      showToast('ไม่สามารถใช้ได้', 'ใช้ได้เฉพาะเมื่อตอบผิดเท่านั้น', '⚠️', 'error');
    }
  } else if (itemId === 'item_time_freeze') {
    if (state.timerMode === 'none' || state.isTimeFrozen) {
      // This case should be handled by the disabled button, but keep as fallback
      return;
    }
    if (state.game.useItem(itemId)) {
      freezeTime();
      renderPowerUps(itemId);
      showToast('ใช้ตัวช่วยสำเร็จ', 'หยุดเวลา 30 วินาที!', '❄️', 'info');
    }
  } else if (itemId === 'item_range_hint') {
    if (state.usedRangeHint) return;
    if (state.userAnswers[state.currentQuestionIndex]) return;
    if (state.game.useItem(itemId)) {
      applyRangeHint();
      state.usedRangeHint = true;
      renderPowerUps(itemId);
      // Toast handled in applyRangeHint to show the range
    }
  } else if (itemId === 'item_tolerance') {
    if (state.usedTolerance) return;
    if (state.userAnswers[state.currentQuestionIndex]) return;
    if (state.game.useItem(itemId)) {
      state.usedTolerance = true;
      renderPowerUps(itemId);
      showToast('ใช้ตัวช่วยสำเร็จ', 'ขยายเป้าคำตอบให้กว้างขึ้น +/- 20%', '⭕', 'success');
    }
  }
}

function showQuestion() {
  // Only stop the timer if it's a per-question timer.
  // The overall timer should continue running across questions.
  if (state.timerMode === "perQuestion") {
    stopTimer();
  }
  resetState();
  state.used5050 = false; // Reset 50/50 flag for new question
  state.usedCut1 = false; // Reset Cut 1 flag
  state.usedRangeHint = false;
  state.usedTolerance = false;
  renderPowerUps(); // Update UI

  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  if (!currentQuestion) {
    console.error("Invalid question index:", state.currentQuestionIndex);
    showResults(); // Or handle error appropriately
    return;
  }
  // Safely replace newlines, guarding against undefined/null questions
  const questionHtml = (currentQuestion?.question || "").replace(/\n/g, "<br>");

  elements.questionCounter.textContent = `ข้อที่ ${state.currentQuestionIndex + 1
    } / ${state.shuffledQuestions.length}`;
  elements.question.innerHTML = questionHtml;

  // Show the hint section container (which contains the button) if a hint exists.
  if (currentQuestion.hint && elements.hintSection) {
    elements.hintSection.classList.remove('hidden');
  }

  const previousAnswer = state.userAnswers?.[state.currentQuestionIndex];
  // Ensure options is an array before spreading
  const shuffledOptions = shuffleArray([...(currentQuestion?.options || [])]);

  // Check the question type to render the correct input
  if (currentQuestion.type === 'multiple-select') {
    shuffledOptions.forEach((option) => {
      elements.options.appendChild(createCheckboxOption(option, previousAnswer));
    });
    // For multi-select, show a "Submit" button immediately
    if (!previousAnswer) {
      updateNextButtonAppearance('submit');
      elements.nextBtn.classList.remove('hidden');
    }
  } else if (currentQuestion.type === 'fill-in') {
    const inputHtml = `
        <div class="mt-4">
            <label for="fill-in-answer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">กรุณาพิมพ์คำตอบของคุณ:</label>
            <input type="text" id="fill-in-answer" class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="พิมพ์คำตอบที่นี่...">
        </div>
      `;
    elements.options.innerHTML = inputHtml;
    if (!previousAnswer) {
      updateNextButtonAppearance('submit');
      elements.nextBtn.classList.remove('hidden');
    }
  } else if (currentQuestion.type === 'fill-in-number') {
    const placeholderText = currentQuestion.decimalPlaces ? `ทศนิยม ${currentQuestion.decimalPlaces} ตำแหน่ง` : 'กรอกคำตอบตัวเลข';
    const unitDisplay = currentQuestion.unit ? `<span class="ml-2 text-gray-600 dark:text-gray-400">${currentQuestion.unit}</span>` : '';
    const inputHtml = `
        <div class="mt-4 flex items-center">
            <input type="number" id="fill-in-number-answer" step="any" class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="${placeholderText}">
            ${unitDisplay}
        </div>
      `;
    elements.options.innerHTML = inputHtml;
    if (!previousAnswer) {
      updateNextButtonAppearance('submit');
      elements.nextBtn.classList.remove('hidden');
    }
  } else {
    // Default single-choice button behavior
    shuffledOptions.forEach((option) => {
      elements.options.appendChild(createOptionButton(option, previousAnswer));
    });
  }

  if (previousAnswer) {
    // If we are revisiting a question, show the feedback panel without altering the score.
    showFeedback(previousAnswer.isCorrect, previousAnswer.explanation, previousAnswer.correctAnswer);
    updateNextButtonAppearance('next'); // Ensure button is in 'next' state
    elements.nextBtn.classList.remove("hidden");
  } else {
    // Only show the skip button for new, unanswered questions
    if (elements.skipBtn) {
      elements.skipBtn.classList.remove("hidden");
    }
  }

  if (state.currentQuestionIndex > 0) {
    elements.prevBtn.classList.remove("hidden");
  }

  updateProgressBar();

  // Start per-question timer if the mode is selected
  if (state.timerMode === "perQuestion" && !previousAnswer) {
    startTimer();
  }

  renderMath(elements.quizScreen); // Render math only within the quiz screen
}

function apply5050() {
  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  const correctAnswer = String(currentQuestion.answer).trim();

  // Get all option buttons/checkboxes
  const optionElements = Array.from(elements.options.children);
  const wrongOptions = optionElements.filter(el => {
    const val = el.tagName === 'BUTTON' ? el.dataset.optionValue : el.querySelector('input').value;
    return val.trim() !== correctAnswer;
  });

  // Shuffle and pick 2 to hide
  shuffleArray(wrongOptions);
  const toHide = wrongOptions.slice(0, 2);

  toHide.forEach(el => {
    el.style.opacity = '0.3';
    el.style.pointerEvents = 'none';
    if (el.tagName === 'BUTTON') el.disabled = true;
    else el.querySelector('input').disabled = true;
  });
}

function applyCut1() {
  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  const correctAnswer = String(currentQuestion.answer).trim();

  const optionElements = Array.from(elements.options.children);
  const wrongOptions = optionElements.filter(el => {
    const val = el.tagName === 'BUTTON' ? el.dataset.optionValue : el.querySelector('input').value;
    return val.trim() !== correctAnswer && el.style.opacity !== '0.3';
  });

  if (wrongOptions.length > 0) {
    shuffleArray(wrongOptions);
    const toHide = wrongOptions[0];

    toHide.style.opacity = '0.3';
    toHide.style.pointerEvents = 'none';
    if (toHide.tagName === 'BUTTON') toHide.disabled = true;
    else toHide.querySelector('input').disabled = true;
  }
}

function applyRangeHint() {
  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  const correctAnswer = parseFloat(currentQuestion.answer);

  if (isNaN(correctAnswer)) return;

  // Generate a range that includes the answer
  // Range width approx 40-60% of value
  const rangeWidth = Math.abs(correctAnswer * 0.5) || 10;
  const offset = (Math.random() - 0.5) * (rangeWidth * 0.5); // Random offset so answer isn't always center

  let min = correctAnswer - (rangeWidth / 2) + offset;
  let max = correctAnswer + (rangeWidth / 2) + offset;

  // Round for cleaner display
  const decimals = currentQuestion.decimalPlaces || 0;
  showToast('สโคปคำตอบ', `คำตอบอยู่ระหว่าง ${min.toFixed(decimals)} ถึง ${max.toFixed(decimals)}`, '🎯', 'info');
}

function undoLastAnswer() {
  // --- Animation ---
  const quizScreen = elements.quizScreen;
  if (quizScreen) {
    quizScreen.classList.remove('anim-rewind');
    // Force reflow to allow re-triggering the animation
    void quizScreen.offsetWidth;
    quizScreen.classList.add('anim-rewind');
  }
  // Reset answer state
  state.userAnswers[state.currentQuestionIndex] = null;
  // Note: Score was not incremented for wrong answer, so no need to decrement.

  // --- NEW: Restore life in Survival Mode ---
  if (state.mode === 'survival' && !state.isEliminated) {
    state.lives = Math.min(state.initialLives || 1, state.lives + 1);
    showToast('แก้ตัวใหม่!', `ได้รับชีวิตคืน! (เหลือ ${state.lives} ❤️)`, '💖', 'success');
  }

  saveQuizState();

  // Reset UI
  elements.feedback.classList.add("hidden");
  elements.nextBtn.classList.add("hidden");

  // Re-enable buttons and remove classes
  Array.from(elements.options.children).forEach((child) => {
    const button = child.tagName === 'BUTTON' ? child : child.querySelector('input');
    const wrapper = child.tagName === 'BUTTON' ? child : child;

    if (button) button.disabled = false;
    wrapper.classList.remove("correct", "incorrect");
    // Keep 50/50 or Cut1 effects if they were used
    if (wrapper.style.opacity !== '0.3') {
      wrapper.style.pointerEvents = "auto";
    }
  });

  // Handle text inputs
  const textInput = document.getElementById('fill-in-answer') || document.getElementById('fill-in-number-answer');
  if (textInput) {
    textInput.disabled = false;
    textInput.value = '';
    textInput.classList.remove("correct", "incorrect");
    textInput.focus();
  }

  // If per-question timer, maybe restart it? 
  // For simplicity, we don't restart the timer to avoid exploiting time.
}

/**
 * Skips the current question by moving it to the end of the quiz array.
 * The user will encounter the question again later.
 */
function skipQuestion() {
  // Prevent skipping if it's the last unanswered question or if it's already answered.
  const unansweredQuestions = state.shuffledQuestions.length - state.userAnswers.filter(a => a).length;
  if (unansweredQuestions <= 1) {
    return;
  }

  const questionToSkip = state.shuffledQuestions[state.currentQuestionIndex];
  const answerSlotToSkip = state.userAnswers[state.currentQuestionIndex];

  // Remove from current position
  state.shuffledQuestions.splice(state.currentQuestionIndex, 1);
  state.userAnswers.splice(state.currentQuestionIndex, 1);

  // Add to the end
  state.shuffledQuestions.push(questionToSkip);
  state.userAnswers.push(answerSlotToSkip); // This should be null

  // UX Fix: หากอยู่ที่ข้อสุดท้าย การย้ายไปต่อท้ายจะทำให้เจอข้อเดิม
  // ให้วนกลับไปที่ข้อแรกแทนเพื่อให้เจอข้ออื่น
  if (state.currentQuestionIndex >= state.shuffledQuestions.length - 1) {
    state.currentQuestionIndex = 0;
  }

  // Re-render the new question at the same index
  showQuestion();
  saveQuizState(); // Save the new order
}
/**
 * Displays the hint for the current question.
 */
function showHint() {
  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  if (!currentQuestion || !currentQuestion.hint || !elements.hintContainer || !elements.hintBtn) return;

  elements.hintContainer.innerHTML = currentQuestion.hint;
  renderMath(elements.hintContainer);
  elements.hintContainer.classList.remove('hidden');
  elements.hintBtn.classList.add('hidden'); // Hide the button after it's clicked
}
/**
 * Evaluates the answer for a multiple-select question.
 */
function evaluateMultipleAnswer() {
  if (elements.skipBtn) elements.skipBtn.classList.add("hidden");
  if (state.timerMode === "perQuestion") {
    stopTimer();
  }

  const selectedCheckboxes = elements.options.querySelectorAll('input[type="checkbox"]:checked');
  const selectedValues = Array.from(selectedCheckboxes).map(cb => cb.value.trim());

  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  // Ensure the answer is an array, default to empty array if not defined
  const correctAnswers = Array.isArray(currentQuestion.answer)
    ? currentQuestion.answer.map(a => String(a).trim())
    : [String(currentQuestion.answer).trim()];

  // Use Sets for robust comparison (order doesn't matter)
  const selectedSet = new Set(selectedValues);
  const correctSet = new Set(correctAnswers);

  const isCorrect = selectedSet.size === correctSet.size &&
    [...selectedSet].every(value => correctSet.has(value));

  // Store answer
  state.userAnswers[state.currentQuestionIndex] = {
    question: currentQuestion.question,
    selectedAnswer: selectedValues, // Store as array
    correctAnswer: correctAnswers, // Store as array
    isCorrect: isCorrect,
    explanation: currentQuestion.explanation || "",
    subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
    sourceQuizTitle: currentQuestion.sourceQuizTitle,
    sourceQuizCategory: currentQuestion.sourceQuizCategory
  };
  saveQuizState();

  if (isCorrect) {
    state.score++;
    elements.scoreCounter.textContent = `คะแนน: ${state.score}`;
    state.game.incrementCorrectStreak();
    if (state.isSoundEnabled) state.correctSound.play().catch(e => console.error("Error playing sound:", e));
  } else {
    state.game.resetCorrectStreak();
    if (state.isSoundEnabled) state.incorrectSound.play().catch(e => console.error("Error playing sound:", e));

    // --- NEW: Survival Mode Lives ---
    if (state.mode === 'survival' && !state.isEliminated) {
      state.lives--;
      showToast('ระวัง!', `เหลืออีก ${state.lives} ❤️`, '⚠️', 'error');
      if (state.lives <= 0) {
        state.isEliminated = true;
        showToast('Game Over', 'คุณเลือกใช้ชีวิตหมดแล้ว รอสรุปผลการแข่งขัน', '💀', 'error');
        setTimeout(() => showResults(), 1500);
      }
    }
  }

  // --- NEW: Update Lobby Score ---
  updateLobbyScore();

  // Show feedback and disable options
  showFeedback(isCorrect, currentQuestion.explanation, correctAnswers);

  Array.from(elements.options.querySelectorAll('.option-checkbox-wrapper')).forEach(wrapper => {
    const checkbox = wrapper.querySelector('input');
    const optionValue = checkbox.value.trim();
    checkbox.disabled = true;
    // Remove hover effects
    wrapper.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700', 'hover:border-blue-500', 'dark:hover:border-blue-500', 'cursor-pointer');
    wrapper.classList.add('cursor-default');

    if (correctSet.has(optionValue)) {
      // Add a class to highlight all correct answers
      wrapper.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-500', 'dark:border-green-600', 'anim-correct-pop');
    } else if (selectedSet.has(optionValue)) {
      // Add a class to highlight incorrectly selected answers
      wrapper.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'dark:border-red-600', 'anim-shake');
    } else {
      // For other incorrect, unselected options, make them faded
      wrapper.classList.add('opacity-60');
    }
  });

  updateNextButtonAppearance('next');
  renderMath(elements.feedback);
}

/**
 * Evaluates the answer for a fill-in-the-blank question.
 */
function evaluateFillInAnswer() {
  if (elements.skipBtn) elements.skipBtn.classList.add("hidden");
  if (state.timerMode === "perQuestion") {
    stopTimer();
  }

  const answerInput = document.getElementById('fill-in-answer');
  if (!answerInput) return;

  const userAnswer = answerInput.value.trim().toLowerCase();
  answerInput.disabled = true; // Disable input after submission

  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  const correctAnswers = currentQuestion.answer.map(ans => ans.trim().toLowerCase());

  const isCorrect = correctAnswers.includes(userAnswer);

  // Store answer
  state.userAnswers[state.currentQuestionIndex] = {
    question: currentQuestion.question,
    selectedAnswer: answerInput.value, // Store the original typed answer
    correctAnswer: currentQuestion.answer, // Store the array of correct answers
    isCorrect: isCorrect,
    explanation: currentQuestion.explanation || "",
    subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
    sourceQuizTitle: currentQuestion.sourceQuizTitle,
    sourceQuizCategory: currentQuestion.sourceQuizCategory
  };
  saveQuizState();

  if (isCorrect) {
    state.score++;
    elements.scoreCounter.textContent = `คะแนน: ${state.score}`;
    state.game.incrementCorrectStreak();
    if (state.isSoundEnabled) state.correctSound.play().catch(e => console.error("Error playing sound:", e));
  } else {
    state.game.resetCorrectStreak();
    if (state.isSoundEnabled) state.incorrectSound.play().catch(e => console.error("Error playing sound:", e));

    // --- NEW: Survival Mode Lives ---
    if (state.mode === 'survival' && !state.isEliminated) {
      state.lives--;
      showToast('ระวัง!', `เหลืออีก ${state.lives} ❤️`, '⚠️', 'error');
      if (state.lives <= 0) {
        state.isEliminated = true;
        showToast('Game Over', 'คุณเลือกใช้ชีวิตหมดแล้ว รอสรุปผลการแข่งขัน', '💀', 'error');
        setTimeout(() => showResults(), 1500);
      }
    }
  }

  // --- NEW: Update Lobby Score ---
  updateLobbyScore();

  // Show feedback
  showFeedback(isCorrect, currentQuestion.explanation, currentQuestion.answer.join(' หรือ '));

  // Visually indicate correctness on the input field
  if (isCorrect) {
    answerInput.classList.remove('border-gray-300', 'dark:border-gray-600');
    answerInput.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-500', 'dark:border-green-600', 'text-green-800', 'dark:text-green-300', 'anim-correct-pop');
  } else {
    answerInput.classList.remove('border-gray-300', 'dark:border-gray-600');
    answerInput.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'dark:border-red-600', 'text-red-800', 'dark:text-red-400', 'anim-shake');
  }

  updateNextButtonAppearance('next');
  renderMath(elements.feedback);
}

/**
 * Evaluates the answer for a fill-in-the-blank question with a numerical answer.
 */
function evaluateFillInNumberAnswer() {
  if (elements.skipBtn) elements.skipBtn.classList.add("hidden");
  if (state.timerMode === "perQuestion") {
    stopTimer();
  }

  const answerInput = document.getElementById('fill-in-number-answer');
  if (!answerInput) return;

  const userAnswer = parseFloat(answerInput.value);
  answerInput.disabled = true;

  const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
  const correctAnswer = parseFloat(currentQuestion.answer);

  // Calculate tolerance: Base tolerance OR Boosted tolerance (20% of answer)
  let tolerance = currentQuestion.tolerance || 0;
  if (state.usedTolerance) {
    const boostedTolerance = Math.abs(correctAnswer * 0.2); // 20%
    tolerance = Math.max(tolerance, boostedTolerance);
  }

  let isCorrect = false;
  if (!isNaN(userAnswer)) {
    isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
  }

  const formattedCorrectAnswer = `${correctAnswer} ${currentQuestion.unit || ''}`.trim();

  state.userAnswers[state.currentQuestionIndex] = {
    question: currentQuestion.question,
    selectedAnswer: isNaN(userAnswer) ? "ไม่ได้ตอบ" : answerInput.value,
    correctAnswer: formattedCorrectAnswer,
    isCorrect: isCorrect,
    explanation: currentQuestion.explanation || "",
    subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
    sourceQuizTitle: currentQuestion.sourceQuizTitle,
    sourceQuizCategory: currentQuestion.sourceQuizCategory
  };
  saveQuizState();

  if (isCorrect) {
    state.score++;
    elements.scoreCounter.textContent = `คะแนน: ${state.score}`;
    answerInput.classList.remove('border-gray-300', 'dark:border-gray-600');
    answerInput.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-500', 'dark:border-green-600', 'text-green-800', 'dark:text-green-300', 'anim-correct-pop');
    state.game.incrementCorrectStreak();
    if (state.isSoundEnabled) state.correctSound.play().catch(e => console.error("Error playing sound:", e));
  } else {
    answerInput.classList.remove('border-gray-300', 'dark:border-gray-600');
    answerInput.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'dark:border-red-600', 'text-red-800', 'dark:text-red-400', 'anim-shake');
    state.game.resetCorrectStreak();
    if (state.isSoundEnabled) state.incorrectSound.play().catch(e => console.error("Error playing sound:", e));

    // --- NEW: Survival Mode Lives ---
    if (state.mode === 'survival' && !state.isEliminated) {
      state.lives--;
      showToast('ระวัง!', `เหลืออีก ${state.lives} ❤️`, '⚠️', 'error');
      if (state.lives <= 0) {
        state.isEliminated = true;
        showToast('Game Over', 'คุณเลือกใช้ชีวิตหมดแล้ว รอสรุปผลการแข่งขัน', '💀', 'error');
        setTimeout(() => showResults(), 1500);
      }
    }
  }

  // --- NEW: Update Lobby Score ---
  updateLobbyScore();

  showFeedback(isCorrect, currentQuestion.explanation, formattedCorrectAnswer);
  updateNextButtonAppearance('next');
  renderMath(elements.feedback);
}

function resetState() {
  elements.nextBtn.classList.add("hidden");
  elements.skipBtn.classList.add("hidden");
  elements.feedback.classList.add("hidden");
  elements.feedbackContent.innerHTML = "";
  elements.feedback.className = "hidden mt-6 p-4 rounded-lg";
  elements.prevBtn.classList.add("hidden");
  while (elements.options.firstChild) {
    elements.options.removeChild(elements.options.firstChild);
  }
  // New: Hide hint section on reset
  if (elements.hintSection) elements.hintSection.classList.add("hidden");
  if (elements.hintContainer) elements.hintContainer.classList.add("hidden");
  if (elements.hintBtn) elements.hintBtn.classList.remove("hidden");
}

function selectAnswer(e) {
  if (elements.skipBtn) elements.skipBtn.classList.add("hidden");
  // Only stop the timer if it's a per-question timer.
  // The overall timer should keep running.
  if (state.timerMode === "perQuestion") {
    stopTimer();
  }
  const selectedBtn = e.currentTarget;
  const selectedValue = selectedBtn.dataset.optionValue.trim();
  // Safely get and trim the correct answer to prevent errors if it's not a string (e.g., null, undefined, number)
  const correctAnswerValue =
    state.shuffledQuestions[state.currentQuestionIndex]?.answer;
  const correctAnswer = (correctAnswerValue || "").toString().trim();
  const correct = selectedValue === correctAnswer;

  // Store the user's answer. This is the only time an answer is recorded for a question.
  state.userAnswers[state.currentQuestionIndex] = {
    question: state.shuffledQuestions[state.currentQuestionIndex]?.question,
    selectedAnswer: selectedValue,
    correctAnswer: correctAnswer,
    isCorrect: correct,
    explanation: state.shuffledQuestions[state.currentQuestionIndex]?.explanation || "",
    subCategory: state.shuffledQuestions[state.currentQuestionIndex]?.subCategory || 'ไม่มีหมวดหมู่',
    sourceQuizTitle: state.shuffledQuestions[state.currentQuestionIndex]?.sourceQuizTitle,
    sourceQuizCategory: state.shuffledQuestions[state.currentQuestionIndex]?.sourceQuizCategory
  };

  // Save state immediately after an answer is recorded for better data persistence.
  saveQuizState();

  if (correct) {
    state.score++;
    elements.scoreCounter.textContent = `คะแนน: ${state.score}`;
    state.game.incrementCorrectStreak();
    if (state.isSoundEnabled)
      state.correctSound
        .play()
        .catch((e) => console.error("Error playing sound:", e));
  } else {
    state.game.resetCorrectStreak();
    if (state.isSoundEnabled)
      state.incorrectSound
        .play()
        .catch((e) => console.error("Error playing sound:", e));

    // --- NEW: Survival Mode Lives ---
    if (state.mode === 'survival' && !state.isEliminated) {
      state.lives--;
      showToast('ระวัง!', `เหลืออีก ${state.lives} ❤️`, '⚠️', 'error');
      if (state.lives <= 0) {
        state.isEliminated = true;
        showToast('Game Over', 'คุณเลือกใช้ชีวิตหมดแล้ว รอสรุปผลการแข่งขัน', '💀', 'error');
        setTimeout(() => showResults(), 1500);
      }
    }
  }

  // --- NEW: Update Lobby Score ---
  updateLobbyScore();

  // Show feedback and disable all options
  showFeedback(
    correct,
    state.shuffledQuestions[state.currentQuestionIndex]?.explanation,
    correctAnswer
  );

  Array.from(elements.options.children).forEach((button) => {
    const isCorrectAnswer = button.dataset.optionValue.trim() === correctAnswer;
    const wasSelected = button === selectedBtn;

    // Remove hover effects since it's disabled
    button.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700', 'hover:border-blue-500', 'dark:hover:border-blue-500');

    if (isCorrectAnswer) {
      // Always highlight the correct answer in green
      button.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-500', 'dark:border-green-600', 'text-green-800', 'dark:text-green-300', 'anim-correct-pop');
    } else if (wasSelected) {
      // If this button was selected and it's not the correct one, highlight in red
      button.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-500', 'dark:border-red-600', 'text-red-800', 'dark:text-red-400', 'anim-shake');
    } else {
      // For other incorrect, unselected options, make them faded
      button.classList.add('opacity-60');
    }
    button.disabled = true;
  });

  elements.nextBtn.classList.remove("hidden");
  updateNextButtonAppearance('next');
  renderMath(elements.feedback); // Render math only in the new feedback element
}

function showFeedback(isCorrect, explanation, correctAnswer) {
  const explanationHtml = explanation
    ? explanation.replace(/\n/g, "<br>")
    : "";

  // Handle both string and array for correct answer display
  const correctAnswerDisplay = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer;

  if (isCorrect) {
    elements.feedbackContent.innerHTML = `<h3 class="font-bold text-lg text-green-800 dark:text-green-300">ถูกต้อง!</h3><p class="text-green-700 dark:text-green-400 mt-2">${explanationHtml}</p>`;
    elements.feedback.classList.add(
      "bg-green-100",
      "dark:bg-green-900/50",
      "border",
      "border-green-300",
      "dark:border-green-700"
    );
  } else {
    elements.feedbackContent.innerHTML = `<h3 class="font-bold text-lg text-red-800 dark:text-red-300">ผิดครับ!</h3><p class="text-red-700 dark:text-red-400 mt-1">คำตอบที่ถูกต้องคือ: <strong>${correctAnswerDisplay}</strong></p><p class="text-red-700 dark:text-red-400 mt-2">${explanationHtml}</p>`;
    elements.feedback.classList.add(
      "bg-red-100",
      "dark:bg-red-900/50",
      "border",
      "border-red-300",
      "dark:border-red-700"
    );
  }
  elements.feedback.classList.remove("hidden");
  elements.feedback.classList.add("anim-feedback-in");
}

function showNextQuestion() {
  // This function is now only called when we are certain there IS a next question.
  state.currentQuestionIndex++;
  showQuestion();
}

/**
 * Central handler for the main action button (Next/Submit).
 */
function handleNextButtonClick() {
  const isAnswered = state.userAnswers[state.currentQuestionIndex] !== null;

  // If the current question is not answered, it must be a 'submit' action.
  if (!isAnswered) {
    const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];
    if (!currentQuestion) {
      showResults(); // Fallback
      return;
    }
    // Evaluate the answer based on type
    switch (currentQuestion.type) {
      case 'multiple-select':
        evaluateMultipleAnswer();
        break;
      case 'fill-in':
        evaluateFillInAnswer();
        break;
      case 'fill-in-number':
        evaluateFillInNumberAnswer();
        break;
      default:
        // This case should not be reached for a 'submit' button.
        // As a safe fallback, we'll just move on.
        console.warn(`handleNextButtonClick called for an unanswered question of unhandled type: ${currentQuestion.type}`);
        showNextQuestion();
        break;
    }
    return;
  }

  // If we reach here, the question has been answered.
  const isLastQuestion = state.currentQuestionIndex === state.shuffledQuestions.length - 1;

  if (isLastQuestion) {
    showResults();
  } else {
    showNextQuestion();
  }
}

// --- New Previous Question Function ---
function showPreviousQuestion() {
  if (state.currentQuestionIndex > 0) {
    // We don't change the score here. The score is final once answered.
    state.currentQuestionIndex--;
    showQuestion();
    saveQuizState();
  }
}

// --- NEW: Function to display the final results screen ---
function showResults() {
  stopTimer(); // Stop any running timers.

  // --- NEW: Cleanup Lobby Listener ---
  if (state.lobbyUnsubscribe) {
    state.lobbyUnsubscribe();
    state.lobbyUnsubscribe = null;
  }

  setFloatingNav(false); // Deactivate the floating navigation bar

  const totalQuestions = state.shuffledQuestions.length;
  const correctAnswers = state.score;
  const incorrectAnswersCount = totalQuestions - correctAnswers;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // --- REVISED Time Calculation ---
  // This new logic accurately tracks time spent, even across browser sessions.
  let timeTakenInSeconds;

  if (state.timerMode === 'overall' && state.initialTime > 0) {
    // For 'overall' mode, this is the most accurate measure.
    timeTakenInSeconds = state.initialTime - state.timeLeft;
  } else {
    // For other modes, use the accumulated time.
    const lastSessionDuration = state.sessionStartTime ? (Date.now() - state.sessionStartTime) / 1000 : 0;
    timeTakenInSeconds = (state.totalTimeSpent || 0) + lastSessionDuration;
  }

  timeTakenInSeconds = Math.max(0, timeTakenInSeconds); // Ensure no negative time

  const minutes = Math.floor(timeTakenInSeconds / 60);
  const seconds = Math.floor(timeTakenInSeconds % 60);
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const averageTimePerQuestion = totalQuestions > 0 ? (timeTakenInSeconds / totalQuestions).toFixed(1) : 0;
  const formattedAverageTime = `${averageTimePerQuestion} วิ/ข้อ`;

  // Calculate score by subcategory
  const categoryStats = state.userAnswers.reduce((acc, answer) => {
    if (!answer) return acc;
    const { main: mainCategory, specific: specificName } = getCategoryNames(answer.subCategory);

    // Ensure main category exists
    if (!acc[mainCategory]) {
      acc[mainCategory] = { correct: 0, total: 0, subcategories: {} };
    }

    // Increment total for the main category
    acc[mainCategory].total++;
    if (answer.isCorrect) {
      acc[mainCategory].correct++;
    }

    // Handle specific learning outcomes
    if (specificName) {
      if (!acc[mainCategory].subcategories[specificName]) {
        acc[mainCategory].subcategories[specificName] = { correct: 0, total: 0 };
      }
      acc[mainCategory].subcategories[specificName].total++;
      if (answer.isCorrect) {
        acc[mainCategory].subcategories[specificName].correct++;
      }
    } else {
      // Fallback for when there is no specific name
      const fallback = '—';
      if (!acc[mainCategory].subcategories[fallback]) {
        acc[mainCategory].subcategories[fallback] = { correct: 0, total: 0 };
      }
      acc[mainCategory].subcategories[fallback].total++;
      if (answer.isCorrect) {
        acc[mainCategory].subcategories[fallback].correct++;
      }
    }

    return acc;
  }, {});

  // --- Performance Analysis ---
  const performanceSummary = { best: null, worst: null };
  // Create a flat list of all specific subcategories with their stats.
  const allSubcategories = [];
  Object.values(categoryStats).forEach(mainCatData => {
    Object.entries(mainCatData.subcategories).forEach(([subName, subData]) => {
      // We only want to analyze specific, named subcategories.
      // The '—' is a placeholder for questions that only had a main category.
      if (subName !== '—' && subData.total > 0) {
        allSubcategories.push({
          name: subName,
          correct: subData.correct,
          total: subData.total,
        });
      }
    });
  });

  if (allSubcategories.length > 1) {
    // Calculate scores and sort subcategories by performance.
    const scoredSubcategories = allSubcategories.map(subCat => ({
      name: subCat.name,
      score: (subCat.correct / subCat.total) * 100,
    })).sort((a, b) => a.score - b.score);

    // Only populate the summary if the scores are actually different.
    if (scoredSubcategories[scoredSubcategories.length - 1].score > scoredSubcategories[0].score) {
      performanceSummary.best = scoredSubcategories[scoredSubcategories.length - 1].name;
      performanceSummary.worst = scoredSubcategories[0].name;
    }
  }

  // Get the appropriate message and icon based on the score
  const resultInfo = getResultInfo(percentage);

  // --- GAMIFICATION: Calculate XP and Check Badges ---
  let xpEarned = 0;
  let levelResult = null;



  let newBadges = [];
  let completedQuests = [];
  let newAchievements = [];
  let physicsXP = 0;
  let earthXP = 0;
  const topicXPs = {};

  // NEW: Calculate correct answer types for quests
  let correctTheory = 0;
  let correctCalculation = 0;
  state.userAnswers.forEach((ans, index) => {
    if (ans && ans.isCorrect) {
      const question = state.shuffledQuestions[index];
      if (question) {
        if (question.type === 'fill-in-number') correctCalculation++;
        else correctTheory++;
      }
    }
  });

  try {
    const game = state.game; // Use the instance from state

    state.userAnswers.forEach((ans, index) => {
      if (ans && ans.isCorrect) {
        const question = state.shuffledQuestions[index];
        let points = 4; // Default for standard questions

        if (question && (question.type === 'multiple-select' || question.type === 'fill-in-number')) {
          points = 5;
        }
        xpEarned += points;

        // Calculate Topic XP
        let subCatStr = '';
        if (ans.subCategory) {
          if (typeof ans.subCategory === 'string') subCatStr = ans.subCategory;
          else if (ans.subCategory.main) {
            // Combine main and specific for keyword matching
            subCatStr = ans.subCategory.main + ' ' + (ans.subCategory.specific || '');
          }
        }

        // Normalize for case-insensitive matching
        subCatStr = subCatStr.toLowerCase();

        let isPhysics = false;
        let isEarth = false;

        for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
          // Check against normalized keywords
          const keywords = groupDef.keywords || [];
          if (keywords.some(k => subCatStr.includes(k.toLowerCase()))) {
            topicXPs[groupDef.field] = (topicXPs[groupDef.field] || 0) + points;

            // Check track from proficiency group
            if (groupDef.track === 'physics') isPhysics = true;
            if (groupDef.track === 'earth') isEarth = true;

            break;
          }
        }

        // ตรวจสอบหมวดวิชาของข้อนี้
        let qCategory = 'General';
        if (ans.sourceQuizCategory) {
          qCategory = ans.sourceQuizCategory;
        } else if (ans.subCategory) {
          qCategory = typeof ans.subCategory === 'object' ? ans.subCategory.main : ans.subCategory;
        }

        const lowerCat = String(qCategory).toLowerCase();

        // Fallback check using category name or ID prefix
        if (!isPhysics && (lowerCat.includes('physics') || lowerCat.includes('ฟิสิกส์') || lowerCat.includes('phy_') || lowerCat.includes('กลศาสตร์') || lowerCat.includes('ไฟฟ้า'))) {
          isPhysics = true;
        }

        if (!isEarth && (lowerCat.includes('earth') || lowerCat.includes('astronomy') || lowerCat.includes('space') || lowerCat.includes('โลก') || lowerCat.includes('ดาราศาสตร์') || lowerCat.includes('วิทย์โลก') || lowerCat.includes('ess_') || lowerCat.includes('ดารา'))) {
          isEarth = true;
        }

        if (isPhysics) {
          physicsXP += points;
        } else if (isEarth) {
          earthXP += points;
        }
      }
    });

    // Apply XP Multiplier
    xpEarned *= state.xpMultiplier;
    physicsXP *= state.xpMultiplier;
    earthXP *= state.xpMultiplier;

    // --- NEW: Prepare quest stats object ---
    const firstAnswer = state.userAnswers.find(a => a);
    let questCategory = 'General';
    if (firstAnswer) {
      if (firstAnswer.sourceQuizCategory) {
        questCategory = firstAnswer.sourceQuizCategory;
      } else if (firstAnswer.subCategory) {
        questCategory = typeof firstAnswer.subCategory === 'object' ? firstAnswer.subCategory.main : firstAnswer.subCategory;
      }
    }
    const questStats = {
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      category: questCategory,
      percentage: percentage,
      correctTheory: correctTheory,
      correctCalculation: correctCalculation,
      questionCount: state.questionCount,
      isCustomQuiz: state.isCustomQuiz
    };

    const result = game.submitQuizResult(xpEarned, percentage, state.questionCount, state.isCustomQuiz, topicXPs, questStats);
    levelResult = { overall: result.overall, physics: result.physics, earth: result.earth };
    newBadges = result.newBadges || [];
    newAchievements = result.newAchievements || [];
    completedQuests = result.completedQuests || [];

    // Play Sounds for Gamification
    if (state.isSoundEnabled && levelResult) {
      if (levelResult.overall?.leveledUp || levelResult.physics?.leveledUp || levelResult.earth?.leveledUp) {
        if (state.levelUpSound) {
          state.levelUpSound.currentTime = 0;
          state.levelUpSound.play().catch(e => console.warn("Could not play level up sound", e));
        }
      } else if (newBadges.length > 0) {
        if (state.badgeSound) {
          state.badgeSound.currentTime = 0;
          state.badgeSound.play().catch(e => console.warn("Could not play badge sound", e));
        }
      }
    }
  } catch (error) {
    console.error("Gamification error:", error);
  }

  // --- Show Toast Notifications ---
  if (levelResult?.overall?.leveledUp) {
    showToast('Level Up!', `ยินดีด้วย! เลเวลรวมของคุณคือ ${levelResult.overall.info.level}: ${levelResult.overall.info.title}`, '🎉', 'gold');
  }

  if (completedQuests.length > 0) {
    completedQuests.forEach(res => {
      showToast('ภารกิจประจำวันสำเร็จ!', `${res.quest.desc} (+${res.quest.xp} XP)`, '📜', 'gold');
    });
  }

  if (newAchievements.length > 0) {
    newAchievements.forEach(ach => {
      showToast('ปลดล็อกความสำเร็จ!', `${ach.title}: ${ach.desc}`, ach.icon, 'success');
    });
  }

  if (newBadges.length > 0) {
    newBadges.forEach(badge => {
      showToast('ได้รับเหรียญรางวัลใหม่', `${badge.name}`, badge.icon, 'success');
    });
  }

  // Prepare stats object for the layout builder
  const stats = {
    totalQuestions,
    totalScore: state.quizData.length,
    correctAnswers,
    incorrectAnswersCount,
    percentage,
    formattedTime,
    formattedAverageTime,
    performanceSummary,
    categoryStats,
    xpEarned,
    levelResult,
    newBadges,
    physicsXP,
    earthXP
  };

  // Clean up old results and build the new layout
  cleanupResultsScreen();
  buildResultsLayout(resultInfo, stats);

  // Switch to the result screen
  switchScreen(elements.resultScreen);

  // It's celebration time!
  triggerConfetti();

  // Save the final state. This is important for the 'view results' feature.
  saveQuizState();

  // Update timestamp to invalidate profile chart cache
  localStorage.setItem('last_quiz_completed_timestamp', new Date().getTime());
}

/**
 * Triggers a celebratory confetti effect for 3 seconds.
 * This creates a festive explosion of confetti from both sides of the screen.
 */
function triggerConfetti() {
  // Ensure the confetti library is loaded and available
  if (typeof confetti !== 'function') {
    console.error("Confetti library is not loaded.");
    return;
  }

  const duration = 3 * 1000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // shoot from the left and right
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

// --- Result Screen Helpers ---

/**
 * Determines the appropriate result message object based on the score percentage.
 * @param {number} percentage The user's score percentage.
 * @returns {object} The result message object from the config.
 */
function getResultInfo(percentage) {
  if (percentage >= 90) {
    return config.resultMessages.perfect;
  } else if (percentage >= 75) {
    return config.resultMessages.great;
  } else if (percentage >= 50) {
    return config.resultMessages.good;
  }
  return config.resultMessages.effort;
}

/**
 * Cleans up the result screen by hiding static elements and removing old dynamic layouts.
 * This prevents element duplication when restarting a quiz.
 */
function cleanupResultsScreen() {
  // Remove any previously generated layouts to prevent duplication.
  document.getElementById("modern-results-layout")?.remove();
}

/**
 * Creates a compact, icon-based stat item for the results screen.
 * @param {string|number} value The main value to display.
 * @param {string} label The text label for the stat.
 * @param {string} icon SVG string for the icon.
 * @param {string} theme The color theme ('green', 'red', 'blue', 'gray').
 * @returns {HTMLElement} The stat item element.
 */
function createStatItem(value, label, icon, theme) {
  const themeClasses = {
    green: {
      bg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-700 dark:text-green-300",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-400",
    },
    gray: {
      bg: "bg-gray-100 dark:bg-gray-700/60",
      text: "text-gray-700 dark:text-gray-300",
    },
  };
  const classes = themeClasses[theme] || themeClasses.gray;

  const item = document.createElement("div");
  item.className = "flex items-center gap-3";
  item.innerHTML = `
        <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${classes.bg} ${classes.text} shadow-inner">
            ${icon}
        </div>
        <div>
            <p class="text-lg font-bold text-gray-800 dark:text-gray-200">${value}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">${label}</p>
        </div>
    `;
  return item;
}

/**
 * Renders a horizontal bar chart showing the score for each main category in the results.
 * @param {object} categoryStats - The stats object grouped by category.
 */
function renderResultCategoryChart(categoryStats) {
  const chartCanvas = document.getElementById('result-category-chart');
  if (!chartCanvas) return;

  // Check if Chart.js is loaded to prevent crash
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js is not loaded. Skipping chart rendering.");
    return;
  }

  try {
    const ctx = chartCanvas.getContext('2d');

    const chartData = [];
    Object.entries(categoryStats).forEach(([mainName, mainData]) => {
      // Use Main Category (Chapter) stats directly
      chartData.push({ label: mainName, correct: mainData.correct, total: mainData.total });
    });

    const sortedData = chartData.sort((a, b) => a.label.localeCompare(b.label, 'th'));

    // Wrap labels for better display
    const labels = sortedData.map(d => wrapLabel(d.label, 35));
    const scores = sortedData.map(d => d.total > 0 ? (d.correct / d.total) * 100 : 0);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'คะแนน (%)',
          data: scores,
          backgroundColor: scores.map(score => score >= 75 ? 'rgba(34, 197, 94, 0.7)' : score >= 50 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
          borderColor: scores.map(score => score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'),
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
              callback: value => value + '%'
            }
          },
          y: {
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
              font: { family: "'Kanit', sans-serif", size: 11 },
              autoSkip: false,
              maxRotation: 0,
              padding: 5
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => {
                const data = sortedData[context.dataIndex];
                return `คะแนน: ${context.raw.toFixed(1)}% (${data.correct}/${data.total} ข้อ)`;
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error rendering chart:", error);
  }
}

/**
 * Builds the modern, responsive layout for the result screen.
 * @param {object} resultInfo The object containing the title, message, and icon for the result.
 * @param {object} stats An object with all calculated statistics (scores, percentage, time).
 */
function buildResultsLayout(resultInfo, stats) {
  const layoutContainer = document.createElement("div");
  layoutContainer.id = "modern-results-layout";
  layoutContainer.className =
    "w-full max-w-4xl mx-auto flex flex-col items-center gap-8 mt-8 mb-6 px-4";

  // --- 1. Message Area (Icon, Title, Message) ---
  const messageContainer = document.createElement("div");
  messageContainer.className = "text-center";
  messageContainer.innerHTML = `
        <div class="w-16 h-16 mx-auto mb-3 ${resultInfo.colorClass}">${resultInfo.icon}</div>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100">${resultInfo.title}</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">จากชุดข้อสอบ: <span class="font-semibold">${state.quizTitle}</span></p>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">${resultInfo.message}</p>
    `;
  layoutContainer.appendChild(messageContainer);

  // --- 2. Data Container (for Circle + Stats) ---
  const dataContainer = document.createElement("div");
  dataContainer.className =
    "w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700";

  // --- 2a. Progress Circle ---
  const progressContainer = document.createElement("div");
  progressContainer.className = "relative w-40 h-40 mx-auto flex-shrink-0";
  progressContainer.innerHTML = `
        <svg class="w-full h-full" viewBox="0 0 36 36">
            <path class="text-gray-200 dark:text-gray-700"
                stroke="currentColor" stroke-width="2.5" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="text-blue-500"
                stroke="currentColor" stroke-width="2.5" fill="none"
                stroke-linecap="round"
                stroke-dasharray="0, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-4xl font-bold text-gray-700 dark:text-gray-200">${stats.percentage}%</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">คะแนนรวม</span>
        </div>
    `;
  dataContainer.appendChild(progressContainer);

  // Animate the circle
  setTimeout(() => {
    const circlePath = progressContainer.querySelector("path.text-blue-500");
    if (circlePath) {
      circlePath.style.transition = "stroke-dasharray 1s ease-out";
      circlePath.style.strokeDasharray = `${stats.percentage}, 100`;
    }
  }, 100);

  // --- 2b. Stats List ---
  const statsContainer = document.createElement("div");
  statsContainer.className = "grid grid-cols-2 gap-x-4 gap-y-5 w-full";

  // Define icons for stats
  const icons = {
    correct: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`,
    incorrect: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`,
    time: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>`,
    total: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 100 2h16a1 1 0 100-2H2zM5 15a1 1 0 110 2h10a1 1 0 110-2H5z" /></svg>`,
  };

  // Programmatically create and append stat items
  statsContainer.appendChild(
    createStatItem(stats.correctAnswers, "คำตอบถูก", icons.correct, "green")
  );
  statsContainer.appendChild(
    createStatItem(
      stats.incorrectAnswersCount,
      "คำตอบผิด",
      icons.incorrect,
      "red"
    )
  );

  statsContainer.appendChild(
    createStatItem(stats.formattedTime, "เวลาที่ใช้", icons.time, "blue")
  );
  statsContainer.appendChild(
    createStatItem(stats.formattedAverageTime, "เฉลี่ยต่อข้อ", icons.time, "purple")
  );

  dataContainer.appendChild(statsContainer);
  layoutContainer.appendChild(dataContainer);

  // --- 3. Category Performance Chart ---
  if (stats.categoryStats && Object.keys(stats.categoryStats).length > 0) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'w-full p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700';
    chartContainer.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 font-kanit text-center">คะแนนตามบท</h3>
            <div class="relative h-96">
                <canvas id="result-category-chart"></canvas>
            </div>
        `;
    layoutContainer.appendChild(chartContainer);
  }

  // --- NEW: XP Breakdown Section with Animation ---
  if (stats.xpEarned > 0) {
    const xpSection = document.createElement('div');
    xpSection.className = "w-full max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm overflow-hidden";
    xpSection.innerHTML = `<h3 class="text-center text-gray-500 dark:text-gray-400 font-kanit mb-4 text-sm">ค่าประสบการณ์ที่ได้รับ (XP)</h3>`;

    const xpGrid = document.createElement('div');
    xpGrid.className = "flex justify-center items-start gap-4 sm:gap-8";

    const items = [
      {
        label: 'รวม',
        value: stats.xpEarned,
        color: 'text-blue-600 dark:text-blue-400',
        progress: stats.levelResult?.overall?.info,
        progressColor: 'bg-blue-500',
        delay: 0
      },
    ];

    if (stats.physicsXP > 0) items.push({
      label: 'สายฟิสิกส์',
      value: stats.physicsXP,
      color: 'text-purple-600 dark:text-purple-400',
      progress: stats.levelResult?.physics?.info || stats.levelResult?.physics, // Robustness check
      progressColor: 'bg-purple-500',
      delay: 150
    });
    if (stats.earthXP > 0) items.push({
      label: 'สายวิทย์โลก',
      value: stats.earthXP,
      color: 'text-teal-600 dark:text-teal-400',
      progress: stats.levelResult?.earth?.info || stats.levelResult?.earth,
      progressColor: 'bg-teal-500',
      delay: 300
    });

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = "flex flex-col items-center transform scale-0 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) w-28";

      let progressBarHtml = '';
      if (item.progress && item.progress.nextLevelXP) {
        const xpNeeded = item.progress.nextLevelXP - item.progress.currentXP;
        progressBarHtml = `
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div class="${item.progressColor} h-1.5 rounded-full" style="width: ${item.progress.progressPercent}%"></div>
                </div>
                <span class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">อีก ${xpNeeded.toLocaleString()} XP</span>
            `;
      } else if (item.progress) { // Max level case
        progressBarHtml = `
                <div class="w-full bg-yellow-400 rounded-full h-1.5 mt-2"></div>
                <span class="text-[10px] text-yellow-500 mt-1 font-bold">MAX LEVEL</span>
            `;
      }

      el.innerHTML = `
            <span class="text-3xl font-bold ${item.color}">+${item.value}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">${item.label}</span>
            ${progressBarHtml}
        `;
      xpGrid.appendChild(el);

      // Trigger animation
      setTimeout(() => el.classList.remove('scale-0'), 100 + item.delay);
    });

    xpSection.appendChild(xpGrid);
    layoutContainer.appendChild(xpSection);
  }

  // --- NEW: Granular Syllabus Breakdown ---
  if (stats.categoryStats && Object.keys(stats.categoryStats).length > 0) {
    const breakdownContainer = document.createElement('div');
    breakdownContainer.className = 'w-full p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700';
    breakdownContainer.innerHTML = `<h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 font-kanit text-center">รายละเอียดตามจุดประสงค์การเรียนรู้</h3>`;

    const categoryList = document.createElement('div');
    categoryList.className = 'space-y-6';

    Object.entries(stats.categoryStats).forEach(([mainCat, data]) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'border-l-4 border-blue-500 pl-4 py-1';

      const mainCatTitle = document.createElement('h4');
      mainCatTitle.className = 'text-lg font-bold text-gray-700 dark:text-gray-300 flex justify-between items-center';
      mainCatTitle.innerHTML = `
        <span>${mainCat}</span>
        <span class="text-sm font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">เฉลี่ย ${((data.correct / data.total) * 100).toFixed(0)}%</span>
      `;
      catDiv.appendChild(mainCatTitle);

      const subList = document.createElement('div');
      subList.className = 'mt-3 space-y-3';

      Object.entries(data.subcategories).forEach(([subName, subData]) => {
        const subItem = document.createElement('div');
        subItem.className = 'bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg flex flex-col gap-2';

        const percent = (subData.correct / subData.total) * 100;
        const color = percent >= 75 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500';

        subItem.innerHTML = `
          <div class="flex justify-between items-start gap-4">
            <span class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">${subName}</span>
            <span class="text-xs font-bold whitespace-nowrap ${percent >= 75 ? 'text-green-600' : percent >= 50 ? 'text-yellow-600' : 'text-red-600'}">${subData.correct} / ${subData.total}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
            <div class="${color} h-1.5 rounded-full" style="width: ${percent}%"></div>
          </div>
        `;
        subList.appendChild(subItem);
      });

      catDiv.appendChild(subList);
      categoryList.appendChild(catDiv);
    });

    breakdownContainer.appendChild(categoryList);
    layoutContainer.appendChild(breakdownContainer);
  }

  // --- 4. Performance Summary ---
  if (stats.performanceSummary && (stats.performanceSummary.best || stats.performanceSummary.worst)) {
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'w-full max-w-2xl mx-auto mt-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm';
    summaryContainer.innerHTML = `<h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 font-kanit">สรุปผลการทำแบบทดสอบ</h3>`;

    const summaryList = document.createElement('ul');
    summaryList.className = 'space-y-2 text-sm';

    if (stats.performanceSummary.best) {
      const bestItem = document.createElement('li');
      bestItem.className = 'flex items-start gap-3';
      bestItem.innerHTML = `
                <svg class="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                <span class="text-gray-700 dark:text-gray-300">ทำได้ดีมากในหมวดหมู่: <strong class="font-semibold text-green-600 dark:text-green-400">${stats.performanceSummary.best}</strong></span>
            `;
      summaryList.appendChild(bestItem);
    }

    if (stats.performanceSummary.worst) {
      const worstItem = document.createElement('li');
      worstItem.className = 'flex items-start gap-3';
      worstItem.innerHTML = `
                <svg class="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                <span class="text-gray-700 dark:text-gray-300">หมวดหมู่ที่ควรทบทวนเพิ่มเติม: <strong class="font-semibold text-yellow-600 dark:text-yellow-500">${stats.performanceSummary.worst}</strong></span>
            `;
      summaryList.appendChild(worstItem);
    }

    summaryContainer.appendChild(summaryList);
    layoutContainer.appendChild(summaryContainer);
  }

  // --- 6. Assemble and Inject ---
  // Prepend to the result screen so it appears before the buttons
  elements.resultScreen.prepend(layoutContainer);

  // --- 7. Render Chart ---
  renderResultCategoryChart(stats.categoryStats);

  // --- 8. Final UI Updates ---
  // Show or hide the review button based on incorrect answers
  const incorrectAnswers = getIncorrectAnswers();
  if (incorrectAnswers.length > 0) {
    elements.reviewBtn.classList.remove("hidden");
  } else {
    elements.reviewBtn.classList.add("hidden");
  }

  renderMath(layoutContainer); // Render math only in the new results layout
}
function getIncorrectAnswers() {
  // Add a check for `answer` to prevent errors if some questions were not answered
  return state.userAnswers.filter((answer) => answer && !answer.isCorrect);
}
// --- Core Quiz Logic ---

function startQuiz() {
  stopTimer();
  setFloatingNav(true); // Activate the floating navigation bar
  clearSavedState();
  state.sessionStartTime = Date.now(); // Record start time for the session
  state.totalTimeSpent = 0; // Reset total time spent for a new quiz

  // Only read timer mode if the controls are visible (i.e., on the start screen).
  // On restart, it will reuse the previously selected mode.
  const timerModeSelector = document.querySelector(
    'input[name="timer-mode"]:checked'
  );
  if (timerModeSelector && state.activeScreen === elements.startScreen) {
    state.timerMode = timerModeSelector.value;
  }
  // Else: keep the existing state.timerMode (which might have been passed in init)

  // Filter out any potential null or undefined questions from the source data
  // to prevent errors during the quiz, especially in the results analysis.
  const validQuizData = state.quizData.filter(q => q);
  state.shuffledQuestions = shuffleArray([...validQuizData]);

  switchScreen(elements.quizScreen);
  elements.quizTitleDisplay.textContent = state.quizTitle;
  // Initialize and start timer based on mode
  if (state.timerMode === "overall") {
    // Use custom time if provided, otherwise calculate based on defaults
    state.initialTime = (state.customTime && state.customTime > 0)
      ? state.customTime
      : state.shuffledQuestions.length * config.timerDefaults.overallMultiplier;
    state.timeLeft = state.initialTime;
    startTimer();
  } else if (state.timerMode === "perQuestion") {
    // Timer will be started in showQuestion(), which calls startTimer() to set initial values.
  }

  state.score = 0;
  state.currentQuestionIndex = 0;
  state.userAnswers = new Array(state.shuffledQuestions.length).fill(null); // Pre-allocate array for answers
  elements.scoreCounter.textContent = `คะแนน: ${state.score}`;

  showQuestion();
  saveQuizState();
}

// --- New Review Functions ---
function showReview() {
  switchScreen(elements.reviewScreen);
  elements.reviewContainer.innerHTML = ""; // Clear previous review

  // Get both incorrect and all answers to allow for toggling
  const allUserAnswers = state.userAnswers.filter(answer => answer); // Filter out any null entries
  const incorrectAnswers = allUserAnswers.filter(answer => !answer.isCorrect);

  const reviewScreenHeader = elements.reviewScreen.querySelector('h2');

  if (reviewScreenHeader) {
    const headerContainer = reviewScreenHeader.parentElement;
    // Clear previous dynamic elements to prevent duplication
    headerContainer.querySelectorAll('.dynamic-review-element').forEach(el => el.remove());

    const subtitle = document.createElement('p');
    subtitle.className = 'quiz-subtitle text-md text-gray-600 dark:text-gray-400 mt-1 dynamic-review-element font-kanit';
    subtitle.innerHTML = `จากชุดข้อสอบ: <span class="font-semibold text-gray-700 dark:text-gray-300">${state.quizTitle}</span>`;
    reviewScreenHeader.after(subtitle);

    // --- Filter UI ---
    // Build category filter based on the incorrect answers to start with relevant filters
    const subCategories = [...new Set(incorrectAnswers.map(a => getCategoryNames(a.subCategory).main))];
    if (subCategories.length > 1) {
      // Create category dropdown
      const filterContainer = document.createElement('div');
      filterContainer.className = 'mt-4 dynamic-review-element';

      let optionsHTML = '<option value="all">ทุกหมวดหมู่</option>';
      subCategories.sort().forEach(cat => {
        optionsHTML += `<option value="${cat}">${cat}</option>`;
      });

      filterContainer.innerHTML = `
                <label for="review-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">กรองตามหมวดหมู่:</label>
                <select id="review-filter" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    ${optionsHTML}
                </select>
            `;
      subtitle.after(filterContainer);

    }

    // --- "Show All" Toggle ---
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'mt-3 dynamic-review-element flex items-center';
    toggleContainer.innerHTML = `
            <input type="checkbox" id="show-all-toggle" class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500">
            <label for="show-all-toggle" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">แสดงข้อสอบทั้งหมด (รวมข้อที่ตอบถูก)</label>
        `;
    const lastDynamicElement = headerContainer.querySelector('.dynamic-review-element:last-of-type') || subtitle;
    lastDynamicElement.after(toggleContainer);

    const countDisplay = document.createElement('p');
    countDisplay.id = 'review-count-display';
    countDisplay.className = 'text-sm text-gray-500 dark:text-gray-400 mt-3 dynamic-review-element';
    headerContainer.appendChild(countDisplay);

    // --- Event Listeners for Filters ---
    const filterSelect = document.getElementById('review-filter');
    const showAllToggle = document.getElementById('show-all-toggle');

    const updateReviewDisplay = () => {
      const category = filterSelect ? filterSelect.value : 'all';
      const showAll = showAllToggle.checked;
      const sourceData = showAll ? allUserAnswers : incorrectAnswers;
      renderReviewItems(sourceData, category, incorrectAnswers.length);
    };

    if (filterSelect) filterSelect.addEventListener('change', updateReviewDisplay);
    if (showAllToggle) showAllToggle.addEventListener('change', updateReviewDisplay);

    // Initial render
    updateReviewDisplay();
  }

  renderMath(elements.reviewContainer); // Render math only in the review container
}

/**
 * Renders the list of incorrect answers, optionally filtered by category.
 * @param {Array} sourceAnswers - The array of answers to display (can be all or just incorrect).
 * @param {string} filterCategory - The category to filter by, or 'all' to show all.
 */
function renderReviewItems(sourceAnswers, filterCategory, totalIncorrect) {
  elements.reviewContainer.innerHTML = ""; // Clear previous items

  const filteredAnswers = sourceAnswers.filter(answer => {
    if (filterCategory === 'all') return true;
    return getCategoryNames(answer.subCategory).main === filterCategory;
  });

  const countDisplay = document.getElementById('review-count-display');
  if (countDisplay) {
    countDisplay.textContent = `แสดง ${filteredAnswers.length} ข้อ (จากทั้งหมด ${totalIncorrect} ข้อที่ตอบผิด)`;
  }

  if (filteredAnswers.length === 0) {
    elements.reviewContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">ไม่พบข้อที่ตรงตามเงื่อนไขในหมวดหมู่นี้</p>`;
    return;
  }

  filteredAnswers.forEach((answer, index) => {
    const reviewItem = document.createElement("div");
    reviewItem.className = "bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 mb-6 border border-gray-200 dark:border-gray-700";

    // Add a visual indicator for correct answers when "Show All" is active
    if (answer.isCorrect) {
      reviewItem.classList.add('border-l-4', 'border-green-500');
    } else {
      reviewItem.classList.add('border-l-4', 'border-red-500');
    }
    const questionHtml = (answer.question || "").replace(/\n/g, "<br>");
    const explanationHtml = answer.explanation ? answer.explanation.replace(/\n/g, "<br>") : "";

    // --- Improved Tag Generation ---
    const { main: mainCategory, specific: specificName } = getCategoryNames(answer.subCategory);
    const tags = [];
    if (mainCategory && mainCategory !== 'ไม่มีหมวดหมู่') {
      if (specificName) {
        tags.push(`${mainCategory} &gt; ${specificName}`);
      } else {
        tags.push(mainCategory);
      }
    }

    const tagsHtml = tags
      .map(tag => `<span class="inline-block mt-2 px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-semibold rounded-full">${tag}</span>`)
      .join('');

    reviewItem.innerHTML = `
            <div class="flex items-start gap-4">
                <span class="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 font-bold">${index + 1}</span>
                <div class="flex-grow min-w-0">
                    <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 break-words">${questionHtml}</div>
                    ${tagsHtml ? `<div class="mt-1">${tagsHtml}</div>` : ''}
                </div>
            </div>
            <div class="mt-4 space-y-3">
                ${!answer.isCorrect ? `
                    <div class="flex items-start gap-3 p-3 rounded-md bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700/60">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                        <div>
                            <p class="text-sm font-medium text-red-800 dark:text-red-300">คำตอบของคุณ</p>
                            <p class="text-red-700 dark:text-red-400 font-mono break-words whitespace-pre-wrap">${answer.selectedAnswer || ""}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700/60">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    <div>
                        <p class="text-sm font-medium text-green-800 dark:text-green-300">คำตอบที่ถูกต้อง</p>
                        <p class="text-green-700 dark:text-green-400 font-mono break-words whitespace-pre-wrap">${answer.correctAnswer || ""}</p>
                    </div>
                </div>
            </div>
            ${explanationHtml ? `
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" /></svg>
                    <div>
                        <p class="text-sm font-medium text-blue-800 dark:text-blue-300">คำอธิบาย</p>
                        <p class="text-gray-600 dark:text-gray-400 mt-1 break-words">${explanationHtml}</p>
                    </div>
                </div>
            </div>` : ""}
        `;
    elements.reviewContainer.appendChild(reviewItem);
  });

  renderMath(elements.reviewContainer);
}

function backToResult() {
  switchScreen(elements.resultScreen);
}

// --- State Management (LocalStorage) ---

function loadStateFromSave(savedState) {
  state.currentQuestionIndex = savedState.currentQuestionIndex || 0;
  state.score = savedState.score || 0;
  // Filter the loaded questions to ensure data integrity, in case the saved state is from an older version or has corrupt data.
  state.shuffledQuestions = Array.isArray(savedState.shuffledQuestions)
    ? savedState.shuffledQuestions.filter(q => q)
    : [];
  state.userAnswers = savedState.userAnswers || [];
  state.timerMode = savedState.timerMode || "none";
  state.timeLeft = savedState.timeLeft || 0;
  state.initialTime = savedState.initialTime || 0;
  state.totalTimeSpent = savedState.totalTimeSpent || 0; // Load accumulated time

  // Update the score display on the UI to reflect the loaded score.
  elements.scoreCounter.textContent = `คะแนน: ${state.score}`;
}

function saveQuizState() {
  // Only save the necessary parts of the state to avoid saving large objects like audio elements
  // --- Update total time spent before saving ---
  if (state.sessionStartTime) {
    const sessionDurationInSeconds = (Date.now() - state.sessionStartTime) / 1000;
    // Ensure totalTimeSpent is a number before adding to it
    state.totalTimeSpent = (state.totalTimeSpent || 0) + sessionDurationInSeconds;
    state.sessionStartTime = Date.now(); // Reset session start time for the next interval
  }

  // This is more explicit and safer than spreading the whole state object.
  const stateToSave = {
    currentQuestionIndex: state.currentQuestionIndex,
    score: state.score,
    shuffledQuestions: state.shuffledQuestions,
    userAnswers: state.userAnswers,
    timerMode: state.timerMode,
    timeLeft: state.timeLeft,
    initialTime: state.initialTime,
    totalTimeSpent: state.totalTimeSpent,
    lastAttemptTimestamp: Date.now(), // Add timestamp for recency tracking
  };
  try {
    localStorage.setItem(state.storageKey, JSON.stringify(stateToSave));
  } catch (e) {
    console.error("Error saving quiz state to local storage:", e);
  }

  // NEW: Sync to Cloud if logged in
  if (state.game && state.game.authManager) {
    state.game.authManager.saveQuizHistoryItem(state.storageKey, stateToSave);
  }
}

function clearSavedState() {
  // NEW: Use AuthManager to delete from both local and cloud
  if (state.game && state.game.authManager) {
    state.game.authManager.deleteQuizHistoryItem(state.storageKey);
  } else {
    // Fallback for when authManager is not available
    localStorage.removeItem(state.storageKey);
  }
}

// --- NEW: Multiplayer/Challenge Utility Functions ---

function setupMultiplayerUI() {
  const scoreCounter = elements.scoreCounter;
  if (!scoreCounter) return;

  // Create Team Score Element (Only for Co-op)
  if (state.mode === 'coop') {
    const teamScoreEl = document.createElement('div');
    teamScoreEl.id = 'team-score-counter';
    teamScoreEl.className = "font-kanit text-sm sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 ml-2 flex-shrink-0 animate-fade-in";
    teamScoreEl.innerHTML = `🤝 ทีม: 0`;
    if (scoreCounter.parentNode) {
      scoreCounter.parentNode.insertBefore(teamScoreEl, scoreCounter.nextSibling);
    }
    elements.teamScoreDisplay = teamScoreEl;
  }

  // Create Players List Container
  if (!document.getElementById('quiz-players-list')) {
    const playersListEl = document.createElement('div');
    playersListEl.id = 'quiz-players-list';
    playersListEl.className = "fixed top-24 right-4 z-30 flex flex-col gap-2 max-w-[200px] pointer-events-none transition-all duration-300";
    document.body.appendChild(playersListEl);
  }

  // Create Team Progress Bar
  if (!document.getElementById('team-progress-container')) {
    const container = document.createElement('div');
    container.id = 'team-progress-container';
    container.className = "fixed top-0 left-0 w-full h-1 z-[60] bg-gray-200 dark:bg-gray-800";
    const bar = document.createElement('div');
    bar.id = 'team-progress-bar';
    const gradient = state.mode === 'coop' ? "bg-gradient-to-r from-green-400 to-blue-500" : "bg-gradient-to-r from-orange-400 to-red-500";
    bar.className = `h-full ${gradient} transition-all duration-700 ease-out`;
    bar.style.width = '0%';
    container.appendChild(bar);
    document.body.appendChild(container);
    elements.teamProgressBar = bar;
  }

  const lobbyRef = doc(db, 'lobbies', state.lobbyId);
  state.lobbyUnsubscribe = onSnapshot(lobbyRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.status === 'finished') {
        if (state.lobbyUnsubscribe) {
          state.lobbyUnsubscribe();
          state.lobbyUnsubscribe = null;
        }
        if (state.activeScreen !== elements.resultScreen) {
          const winnerName = data.winnerName || 'ผู้เล่นอื่น';
          showToast('จบเกม!', data.mode === 'time-attack' ? `${winnerName} เข้าเส้นชัยแล้ว!` : 'การแข่งขันสิ้นสุดลงแล้ว', '🏁');
          setTimeout(() => showResults(), 1000);
        }
        return;
      }

      const players = data.players || [];
      const totalScore = players.reduce((sum, p) => sum + (p.score || 0), 0);
      state.currentTeamScore = totalScore;

      if (state.mode === 'coop' && elements.teamScoreDisplay) {
        animateValue(elements.teamScoreDisplay, parseInt(elements.teamScoreDisplay.dataset.score || 0), totalScore, 1000, '🤝 ทีม: ');
        elements.teamScoreDisplay.dataset.score = totalScore;
      }

      if (elements.teamProgressBar) {
        let progressPercent = 0;
        const totalQ = state.questionCount || 1;
        if (state.mode === 'coop') {
          const totalProgress = players.reduce((sum, p) => sum + (p.progress || 0), 0);
          progressPercent = (totalProgress / (totalQ * players.length)) * 100;
        } else if (state.mode === 'time-attack') {
          const maxScore = Math.max(...players.map(p => p.score || 0));
          progressPercent = (maxScore / 10) * 100;
        } else {
          const maxProgress = Math.max(...players.map(p => p.progress || 0));
          progressPercent = (maxProgress / totalQ) * 100;
        }
        elements.teamProgressBar.style.width = `${Math.min(100, progressPercent)}%`;
      }

      updatePlayersListUI(players);
    }
  });
}

function updatePlayersListUI(players) {
  const container = document.getElementById('quiz-players-list');
  if (!container) return;

  const myUid = authManager.currentUser?.uid;
  container.innerHTML = players
    .filter(p => p.uid !== myUid)
    .map(p => {
      const isEliminated = p.eliminated;
      const progress = Math.min(100, (p.progress / state.questionCount) * 100);
      return `
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 anim-slide-in-right ${isEliminated ? 'opacity-50 grayscale' : ''}">
          <div class="relative">
            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
               ${p.avatar && (p.avatar.includes('/') || p.avatar.includes('.')) ? `<img src="${p.avatar}" class="w-full h-full object-cover">` : (p.avatar || '🧑‍🎓')}
            </div>
            ${isEliminated ? '<span class="absolute -top-1 -right-1 text-[10px]">💀</span>' : ''}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[10px] font-bold truncate dark:text-gray-300">${p.name}</div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full mt-0.5">
              <div class="bg-blue-500 h-full rounded-full transition-all duration-500" style="width: ${progress}%"></div>
            </div>
          </div>
          <div class="text-[10px] font-bold text-blue-600 dark:text-blue-400">${p.score}</div>
        </div>
      `;
    }).join('');
}

async function updateLobbyScore() {
  if (!state.isChallenge || !state.lobbyId || !authManager.currentUser) return;
  const myUid = authManager.currentUser.uid;

  try {
    const lobbyRef = doc(db, 'lobbies', state.lobbyId);
    // Note: This matches the structure in ChallengeManager
    const updateData = {};

    // FETCH LATEST DATA FIRST TO UPDATE ARRAY (Simpler than transaction for this specific UI sync)
    // In a real optimized system, we'd use a transaction, but for progress sync during quiz, 
    // we'll update based on the last known players list.
    const urlParams = new URLSearchParams(window.location.search);

    // We already have state.lobbyUnsubscribe which updates playerPresences in CM, 
    // but here we just need to update OUR entry in the players array.
    // However, quiz-logic doesn't have the full players list in state, it gets it from the listener.
    // So we'll use a transaction to be safe.

    // BUT updateDoc is simpler for a single field update if Firestore provided array-level targeting. 
    // Since it doesn't, we'll fetch and update.
    const { runTransaction } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    await runTransaction(db, async (transaction) => {
      const lobbySnap = await transaction.get(lobbyRef);
      if (!lobbySnap.exists()) return;

      const data = lobbySnap.data();
      const players = data.players || [];
      const updatedPlayers = players.map(p => {
        if (p.uid === myUid) {
          return {
            ...p,
            score: state.score,
            progress: state.currentQuestionIndex + 1,
            eliminated: state.isEliminated
          };
        }
        return p;
      });

      transaction.update(lobbyRef, { players: updatedPlayers });

      // Check for winner in Time Attack
      if (state.mode === 'time-attack' && state.score >= 10 && !data.winnerName) {
        transaction.update(lobbyRef, {
          status: 'finished',
          winnerName: authManager.currentUser.displayName || 'Anonymous'
        });
      }
    });

  } catch (e) {
    console.error("Error updating score to lobby:", e);
  }
}

function animateValue(element, start, end, duration, prefix = '') {
  if (start === end) return;
  const range = end - start;
  let current = start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  const timer = setInterval(() => {
    current += increment;
    element.innerHTML = `${prefix}${current}`;
    if (current === end) {
      clearInterval(timer);
    }
  }, stepTime);
}

async function endChallengeEarly() {
  if (!state.isChallenge || !state.lobbyId) return;
  try {
    await updateDoc(doc(db, 'lobbies', state.lobbyId), {
      status: 'finished',
      winnerName: authManager.currentUser?.displayName || 'Unknown'
    });
  } catch (e) {
    console.error("Failed to end challenge early:", e);
  }
}

function resumeQuiz(savedState) {
  loadStateFromSave(savedState);
  setFloatingNav(true); // Activate the floating navigation bar for the resumed session
  state.sessionStartTime = Date.now(); // Start tracking time for the new session

  switchScreen(elements.quizScreen);
  elements.quizTitleDisplay.textContent = state.quizTitle; // FIX: Set the title when resuming
  showQuestion();

  // If resuming a quiz with an overall timer, restart the countdown
  if (state.timerMode === "overall" && state.timeLeft > 0) {
    startTimer();
  }
}

function checkForSavedQuiz(action) {
  const urlParams = new URLSearchParams(window.location.search);
  const savedStateJSON = localStorage.getItem(state.storageKey);

  // Case 1: Viewing results directly. This has the highest priority.
  if (action === 'view_results' && savedStateJSON) {
    try {
      const savedState = JSON.parse(savedStateJSON);
      // Validate state before using it
      if (typeof savedState.currentQuestionIndex === 'number' && Array.isArray(savedState.shuffledQuestions)) {
        loadStateFromSave(savedState);
        showResults(); // This will also call switchScreen to the result screen
        return; // Done.
      }
    } catch (e) {
      console.error("Error parsing saved state for viewing results:", e);
      clearSavedState();
      // Fall through to show start screen on error
    }
  }

  // Case 2: Resuming a quiz in progress.
  if (savedStateJSON) {
    try {
      const savedState = JSON.parse(savedStateJSON);

      // --- NEW VALIDATION LOGIC ---
      // Check if the saved state is from an older version (lacking the 'type' property in questions)
      const isStateValid = savedState &&
        typeof savedState.currentQuestionIndex === 'number' &&
        Array.isArray(savedState.shuffledQuestions) &&
        savedState.shuffledQuestions.length > 0 &&
        // Check if every question object has a 'type' property.
        savedState.shuffledQuestions.every(q => q && typeof q.type === 'string');

      if (isStateValid) {
        // State is valid and modern, show the resume prompt.
        if (savedState.userAnswers.filter(a => a !== null).length < savedState.shuffledQuestions.length) {
          switchScreen(elements.startScreen);
          if (elements.resumeModal && resumeModalHandler) {
            resumeModalHandler.open();
            elements.resumeRejectBtn.onclick = () => {
              clearSavedState();
              resumeModalHandler.close();
            };
            elements.resumeConfirmBtn.onclick = () => {
              resumeQuiz(savedState);
              resumeModalHandler.close();
            };
          }
          return; // Done.
        }
      } else {
        // State is old or invalid, clear it and notify the user.
        console.warn("Invalid or outdated quiz state found in localStorage. Clearing it to start fresh.");
        clearSavedState();
      }
    } catch (e) {
      console.error("Error parsing saved quiz state for resume:", e);
      clearSavedState();
    }
  }

  // Case 3: Default case - no valid saved state or not resuming.
  // If it's a custom quiz, we auto-start to skip redundant checks.
  if (state.isCustomQuiz) {
    // Explicitly hide start screen to prevent overlap since switchScreen won't hide it
    // if activeScreen is null (initial load).
    if (elements.startScreen) {
      elements.startScreen.classList.add('hidden');
    }
    startQuiz();
  } else {
    // Standard quiz flow -> show start screen
    switchScreen(elements.startScreen);
  }
}

// --- Timer Functions ---

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerDisplay() {
  if (!elements.timerDisplay || !elements.timerValue) return;
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  elements.timerValue.textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // --- New: Update color based on time left ---
  if (state.timerMode === "none" || state.initialTime <= 0) return;

  const percentage = (state.timeLeft / state.initialTime) * 100;
  const timerClasses = elements.timerDisplay.classList;

  // Remove all potential color classes to reset
  timerClasses.remove(
    "text-green-600",
    "dark:text-green-500",
    "text-orange-500",
    "dark:text-orange-400",
    "text-red-600",
    "dark:text-red-400"
  );

  // Add the appropriate color class based on the percentage of time remaining
  if (percentage > 50) {
    timerClasses.add("text-green-600", "dark:text-green-500"); // Plenty of time
  } else if (percentage > 25) {
    timerClasses.add("text-orange-500", "dark:text-orange-400"); // Getting low
  } else {
    timerClasses.add("text-red-600", "dark:text-red-400"); // Critically low
  }

  // Add a pulsing animation when time is very low
  if (state.timeLeft <= 10 && state.timeLeft > 0) {
    timerClasses.add("anim-pulse-warning");
  } else {
    timerClasses.remove("anim-pulse-warning");
  }
}

function tick() {
  state.timeLeft--;
  updateTimerDisplay();
  if (state.timeLeft <= 0) {
    stopTimer();
    handleTimeUp();
  }
}

function startTimer() {
  if (state.timerMode === "none") {
    elements.timerDisplay.classList.add("hidden");
    return;
  }
  if (state.timerMode === "perQuestion") {
    // Use custom time if provided, otherwise use default
    state.timeLeft = (state.customTime && state.customTime > 0)
      ? state.customTime
      : config.timerDefaults.perQuestion;
    state.initialTime = state.timeLeft;
  }

  elements.timerDisplay.classList.remove("hidden");
  updateTimerDisplay();
  state.timerId = setInterval(tick, 1000);
}

function freezeTime() {
  stopTimer();
  state.isTimeFrozen = true;
  if (elements.timerDisplay) elements.timerDisplay.classList.add('text-blue-500', 'animate-pulse');

  setTimeout(() => {
    state.isTimeFrozen = false;
    if (elements.timerDisplay) elements.timerDisplay.classList.remove('text-blue-500', 'animate-pulse');
    state.timerId = setInterval(tick, 1000); // Resume timer
  }, 30000);
}

function handleTimeUp() {
  if (state.timerMode === "perQuestion") {
    // Ensure we don't proceed if the question index is out of bounds
    if (state.currentQuestionIndex >= state.shuffledQuestions.length) {
      showResults(); // The quiz is over, just show results
      return;
    }
    const currentQuestion = state.shuffledQuestions[state.currentQuestionIndex];

    // Handle multi-select timeout
    if (currentQuestion.type === 'multiple-select') {
      const correctAnswers = (currentQuestion.answer || []).map(a => String(a).trim());
      state.userAnswers[state.currentQuestionIndex] = {
        question: currentQuestion.question,
        selectedAnswer: [], // Record as empty selection
        correctAnswer: correctAnswers,
        isCorrect: false,
        explanation: currentQuestion.explanation,
        subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
        sourceQuizTitle: currentQuestion.sourceQuizTitle,
        sourceQuizCategory: currentQuestion.sourceQuizCategory
      };
      showFeedback(false, "หมดเวลา! " + (currentQuestion.explanation || ""), correctAnswers);
      Array.from(elements.options.querySelectorAll('input[type="checkbox"]')).forEach(cb => cb.disabled = true);
    } else if (currentQuestion.type === 'fill-in') {
      const correctAnswers = currentQuestion.answer.map(a => String(a).trim());
      state.userAnswers[state.currentQuestionIndex] = {
        question: currentQuestion.question,
        selectedAnswer: "ไม่ได้ตอบ (หมดเวลา)",
        correctAnswer: correctAnswers,
        isCorrect: false,
        explanation: currentQuestion.explanation,
        subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
        sourceQuizTitle: currentQuestion.sourceQuizTitle,
        sourceQuizCategory: currentQuestion.sourceQuizCategory
      };
      showFeedback(false, "หมดเวลา! " + (currentQuestion.explanation || ""), correctAnswers.join(' หรือ '));
      const answerInput = document.getElementById('fill-in-answer');
      if (answerInput) answerInput.disabled = true;
    } else if (currentQuestion.type === 'fill-in-number') {
      const correctAnswer = `${currentQuestion.answer} ${currentQuestion.unit || ''}`.trim();
      state.userAnswers[state.currentQuestionIndex] = {
        question: currentQuestion.question,
        selectedAnswer: "ไม่ได้ตอบ (หมดเวลา)",
        correctAnswer: correctAnswer,
        isCorrect: false,
        explanation: currentQuestion.explanation,
        subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
        sourceQuizTitle: currentQuestion.sourceQuizTitle,
        sourceQuizCategory: currentQuestion.sourceQuizCategory
      };
      showFeedback(false, "หมดเวลา! " + (currentQuestion.explanation || ""), correctAnswer);
      const answerInput = document.getElementById('fill-in-number-answer');
      if (answerInput) answerInput.disabled = true;
    } else {
      // Default single-choice timeout
      const correctAnswerValue = currentQuestion.answer;
      const correctAnswer = (correctAnswerValue || "").toString().trim();
      state.userAnswers[state.currentQuestionIndex] = {
        question: currentQuestion.question,
        selectedAnswer: "ไม่ได้ตอบ (หมดเวลา)",
        correctAnswer: correctAnswer,
        isCorrect: false,
        explanation: currentQuestion.explanation,
        subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
        sourceQuizTitle: currentQuestion.sourceQuizTitle,
        sourceQuizCategory: currentQuestion.sourceQuizCategory
      };
      const feedbackExplanation = "หมดเวลา! " + (currentQuestion.explanation || "");
      showFeedback(false, feedbackExplanation, correctAnswer);
      Array.from(elements.options.children).forEach((button) => (button.disabled = true));
    }

    // Common actions for any per-question timeout
    saveQuizState();
    elements.nextBtn.classList.remove("hidden");
    updateNextButtonAppearance('next');
  } else if (state.timerMode === "overall") {
    showResults();
  }
}

// --- Sound Management ---

// --- Sound Functions ---
function updateSoundButton() {
  if (!elements.soundToggleBtn) return;
  elements.soundToggleBtn.innerHTML = state.isSoundEnabled
    ? config.soundOnIcon
    : config.soundOffIcon;
}

function toggleSound() {
  state.isSoundEnabled = !state.isSoundEnabled;
  localStorage.setItem("quizSoundEnabled", state.isSoundEnabled);
  updateSoundButton();
}

function initializeSound() {
  const savedSoundSetting = localStorage.getItem("quizSoundEnabled");
  // Default to true if not set, otherwise use the saved setting
  state.isSoundEnabled = savedSoundSetting !== "false";
  updateSoundButton();
}

// --- Event Binding ---

function bindEventListeners() {
  // The main action button now has a central handler.
  if (elements.skipBtn) {
    elements.skipBtn.addEventListener("click", skipQuestion);
  }
  elements.nextBtn.addEventListener("click", handleNextButtonClick);
  if (elements.nextBtn) elements.nextBtn.addEventListener("click", handleNextButtonClick);

  // Keep other listeners as they are.
  elements.startBtn.addEventListener("click", startQuiz);
  elements.prevBtn.addEventListener("click", showPreviousQuestion);
  elements.restartBtn.addEventListener("click", startQuiz);
  elements.reviewBtn.addEventListener("click", showReview);
  elements.backToResultBtn.addEventListener("click", backToResult);
  if (elements.startBtn) elements.startBtn.addEventListener("click", startQuiz);
  if (elements.prevBtn) elements.prevBtn.addEventListener("click", showPreviousQuestion);
  if (elements.restartBtn) elements.restartBtn.addEventListener("click", startQuiz);
  if (elements.reviewBtn) elements.reviewBtn.addEventListener("click", showReview);
  if (elements.backToResultBtn) elements.backToResultBtn.addEventListener("click", backToResult);
  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener("click", toggleSound);
  }
  // New: Add listener for the hint button
  if (elements.hintBtn) {
    elements.hintBtn.addEventListener("click", showHint);
  }
}
