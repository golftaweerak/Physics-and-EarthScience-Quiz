
export class QuizSessionManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      currentQuestionIndex: 0,
      shuffledQuestions: [],
      userAnswers: [],
      score: 0,
      timer: 0,
      timerInterval: null,
      lives: 1, // Default only, overwritten in init
      isSurvivalMode: false,
      isChallengeMode: false,
      startTime: null,
      correctStreak: 0,

      // Stats tracking
      theoryXP: 0,
      calculationXP: 0,
      itemsUsedCount: 0
    };

    // Bind context if needed
    // Bind context if needed
    // this.handleTick = this.handleTick.bind(this); // REMOVED: handleTick does not exist
  }

  init(questions, options = {}) {
    this.reset();
    this.state.shuffledQuestions = [...questions]; // Already shuffled by loader usually, or we can shuffle here
    this.state.isSurvivalMode = options.lives > 1 || options.mode === 'survival';
    this.state.lives = options.lives || 1;
    this.state.isChallengeMode = !!options.isChallenge;
    this.state.userAnswers = new Array(questions.length).fill(null);
    this.state.startTime = Date.now();

    // Set up timer
    if (options.timerMode === 'per_question') {
      this.state.timePerQuestion = options.timeLimit || 90;
      this.state.timer = this.state.timePerQuestion;
    } else {
      // Overall timer
      this.state.timeLimit = options.timeLimit || (questions.length * 75);
      this.state.timer = this.state.timeLimit;
    }

    this.state.timerMode = options.timerMode || 'overall';
  }

  startTimer(callback) {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);

    this.state.timerInterval = setInterval(() => {
      if (this.state.timer > 0) {
        this.state.timer--;
        if (callback) callback(this.state.timer);
      } else {
        this.stopTimer();
        if (callback) callback(0, true); // timeUp = true
      }
    }, 1000);
  }

  stopTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  }

  recordAnswer(questionIndex, answerText, isCorrect, questionData) {
    this.state.userAnswers[questionIndex] = {
      questionId: questionData.id,
      answer: answerText,
      isCorrect: isCorrect,
      timestamp: Date.now(),
      // Store data needed for XP calculation later
      subCategory: questionData.subCategory,
      sourceQuizCategory: questionData.sourceQuizCategory || questionData.category,
      type: questionData.type // theory vs calculation
    };

    if (isCorrect) {
      this.state.score++;
      this.state.correctStreak++;
    } else {
      this.state.correctStreak = 0;
      if (this.state.isSurvivalMode) {
        this.state.lives--;
      }
    }

    return {
      isCorrect,
      remainingLives: this.state.lives,
      isGameOver: this.state.isSurvivalMode && this.state.lives <= 0
    };
  }

  getResults() {
    const total = this.state.shuffledQuestions.length;
    const correct = this.state.score;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      percentage,
      userAnswers: this.state.userAnswers,
      timeElapsed: Math.floor((Date.now() - this.state.startTime) / 1000),
      isSurvival: this.state.isSurvivalMode,
      livesLeft: this.state.lives
    };
  }

  // Resume function to restore state from localStorage object
  restoreState(savedState) {
    if (!savedState) return false;

    // Deep merge or copy properties
    this.state = { ...this.state, ...savedState };

    // Important: Checking if timer needs handling? 
    // Usually resume logic in main app handles the UI timer restart
    return true;
  }
  freezeTime(seconds) {
    this.state.timer += seconds;
  }
}
