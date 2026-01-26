/**
 * scripts/quiz-session-manager.js
 * 
 * Manages the state, progression, and data processing of a quiz session.
 * This is the "Model/Controller" part of the quiz logic.
 */

import { shuffleArray } from './utils.js';

export class QuizSessionManager {
  constructor(quizData, storageKey, options = {}) {
    this.quizData = quizData;
    this.storageKey = storageKey;
    this.options = {
      isChallenge: false,
      initialLives: 1,
      mode: 'classic',
      ...options
    };

    this.state = {
      currentQuestionIndex: 0,
      score: 0,
      shuffledQuestions: [],
      userAnswers: [],
      lives: this.options.initialLives,
      isEliminated: false,
      hasWon: false,
      xpMultiplier: 1,
      hintUsed: false,
      startTime: Date.now(),
      endTime: null
    };
  }

  /**
   * Initializes or resumes a session.
   */
  start(savedState = null) {
    if (savedState) {
      this.state = { ...this.state, ...savedState };
    } else {
      this.state.shuffledQuestions = shuffleArray([...this.quizData]);
      this.state.userAnswers = new Array(this.state.shuffledQuestions.length).fill(null);
    }
  }

  /**
   * Records an answer for the current question.
   */
  submitAnswer(answerData) {
    const { currentQuestionIndex, shuffledQuestions } = this.state;
    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    const record = {
      question: currentQuestion.question,
      selectedAnswer: answerData.selected,
      correctAnswer: currentQuestion.answer,
      isCorrect: answerData.isCorrect,
      explanation: currentQuestion.explanation || "",
      subCategory: currentQuestion.subCategory || 'ไม่มีหมวดหมู่',
      sourceQuizTitle: currentQuestion.sourceQuizTitle,
      sourceQuizCategory: currentQuestion.sourceQuizCategory,
      timestamp: Date.now()
    };

    this.state.userAnswers[currentQuestionIndex] = record;
    if (answerData.isCorrect) {
      this.state.score++;
    } else {
      if (this.options.mode === 'survival') {
        this.state.lives--;
        if (this.state.lives <= 0) {
          this.state.isEliminated = true;
        }
      }
    }

    return record;
  }

  /**
   * Moves to the next available question.
   */
  nextQuestion() {
    if (this.state.currentQuestionIndex < this.state.shuffledQuestions.length - 1) {
      this.state.currentQuestionIndex++;
      return true;
    }
    return false;
  }

  /**
   * Calculates final results and XP.
   */
  calculateResults() {
    const total = this.state.shuffledQuestions.length;
    const percentage = (this.state.score / total) * 100;

    // XP Calculation Logic
    let baseXP = 0;
    this.state.userAnswers.forEach(ans => {
      if (ans && ans.isCorrect) {
        // Points based on question complexity (placeholder logic)
        baseXP += 4;
      }
    });

    const bonusXP = percentage === 100 ? 50 : (percentage >= 80 ? 20 : 0);
    const finalXP = Math.round((baseXP + bonusXP) * this.state.xpMultiplier);

    return {
      score: this.state.score,
      total,
      percentage,
      xpEarned: finalXP,
      isPerfect: percentage === 100
    };
  }

  /**
   * Persists current state to localStorage.
   */
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }
}
