
// import { renderMathInElement } from "./utils.js"; // REMOVED: KaTeX is loaded globally

export class QuizUIRenderer {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Handles smooth transitions between different screens (e.g., start, quiz, results).
   * @param {HTMLElement} toScreen The screen to show.
   */
  switchScreen(toScreen) {
    // Hide all screens first
    [this.elements.startScreen, this.elements.quizScreen, this.elements.resultScreen].forEach(screen => {
      if (screen) {
        screen.classList.remove('active');
        screen.classList.add('hidden');
        screen.style.display = 'none';
      }
    });

    // Show the target screen
    if (toScreen) {
      toScreen.classList.remove('hidden');
      toScreen.style.display = 'block';
      // Use a small timeout to allow display:block to apply before adding opacity class
      setTimeout(() => toScreen.classList.add('active'), 50);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Shows feedback for an answer.
   * @param {boolean} isCorrect - Whether the answer was correct.
   * @param {string} correctText - The text of the correct answer.
   * @param {string} feedbackMessage - Additional feedback message (optional).
   */
  showFeedback(isCorrect, correctText, feedbackMessage = '') {
    const feedbackEl = this.elements.feedback || document.getElementById('feedback');
    if (!feedbackEl) return;

    const contentEl = feedbackEl.querySelector('.feedback-content');
    if (!contentEl) return;

    feedbackEl.classList.remove('hidden', 'bg-green-100', 'border-green-500', 'text-green-700', 'bg-red-100', 'border-red-500', 'text-red-700');

    if (isCorrect) {
      feedbackEl.classList.add('bg-green-100', 'border-green-500', 'text-green-700', 'visible');
      contentEl.innerHTML = `✨ ถูกต้อง! ${feedbackMessage}`;
    } else {
      feedbackEl.classList.add('bg-red-100', 'border-red-500', 'text-red-700', 'visible');
      contentEl.innerHTML = `❌ ยังไม่ถูก... คำตอบที่ถูกคือ: <span class="font-black text-lg underline">${correctText}</span><br>${feedbackMessage}`;
    }

    feedbackEl.classList.remove('hidden');
    // Ensure math in feedback is rendered if any
    this.renderMath(contentEl);
  }

  hideFeedback() {
    const feedbackEl = this.elements.feedback || document.getElementById('feedback');
    if (feedbackEl) {
      feedbackEl.classList.add('hidden');
    }
  }

  updateProgressBar(current, total) {
    if (!this.elements.progressBar) return;

    const percentage = ((current + 1) / total) * 100;
    this.elements.progressBar.style.width = `${percentage}%`;

    if (this.elements.progressText) {
      this.elements.progressText.textContent = `ข้อที่ ${current + 1} / ${total}`;
    }
  }

  updateHearts(lives) {
    if (!this.elements.heartContainer) return;
    this.elements.heartContainer.innerHTML = '❤️'.repeat(lives);
    this.elements.heartContainer.classList.add('pulse-anim');
    setTimeout(() => this.elements.heartContainer.classList.remove('pulse-anim'), 500);
  }

  createOptionButton(optionText, previousAnswer, onClickCallback) {
    const button = document.createElement('button');
    button.className = 'option-btn w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 text-lg font-medium text-gray-700 dark:text-gray-200 mb-3 flex items-center group';

    // Check for KaTeX formulas
    if (optionText.includes('$$') || optionText.includes('\\(')) {
      button.innerHTML = `<div class="flex-grow math-content">${optionText}</div>`;
    } else {
      button.textContent = optionText;
    }

    // Restore previous answer state if exists
    if (previousAnswer === optionText) {
      button.classList.add('selected', 'border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/30');
      // If we have proper checking logic, we could also show correct/incorrect here immediately 
      // but usually that happens after submission in this specific app logic.
    }

    button.onclick = () => {
      // Remove selected class from all other buttons
      const allBtns = button.parentElement.querySelectorAll('.option-btn');
      allBtns.forEach(btn => btn.classList.remove('selected', 'border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/30'));

      // Add to clicked
      button.classList.add('selected', 'border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/30');

      onClickCallback(optionText);
    };

    return button;
  }

  createInput(placeholder, previousAnswer, onInputCallback, unit = '') {
    const container = document.createElement('div');
    container.className = 'w-full mb-6'; // Increased margin

    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col sm:flex-row gap-3 items-stretch';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'flex-grow p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 transition-all duration-200';
    input.placeholder = placeholder || 'พิมพ์คำตอบของคุณที่นี่...';

    if (previousAnswer) {
      input.value = previousAnswer;
      input.disabled = true; // Disable if already answered
    }

    // Capture enter key to submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !input.disabled && input.value.trim() !== '') {
        submitBtn.click();
      }
    });

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'ส่งคำตอบ';
    submitBtn.className = 'px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

    if (previousAnswer) {
      submitBtn.style.display = 'none'; // Hide if already answered
    }

    submitBtn.onclick = () => {
      const val = input.value.trim();
      if (val) {
        input.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'ส่งแล้ว';
        onInputCallback(val);
      }
    };

    wrapper.appendChild(input);
    wrapper.appendChild(submitBtn);
    container.appendChild(wrapper);

    if (unit) {
      const unitEl = document.createElement('span');
      unitEl.className = 'block text-right text-sm text-gray-500 dark:text-gray-400 mt-2 mr-2';
      unitEl.textContent = `หน่วย: ${unit}`;
      container.appendChild(unitEl);
    }

    return container;
  }

  updateNextButtonAppearance(action) {
    const btn = this.elements.nextButton;
    const iconSpan = btn.querySelector('.btn-icon');
    const textSpan = btn.querySelector('.btn-text');

    // Remove existing specific classes
    btn.classList.remove('submit-mode', 'next-mode');

    if (action === 'submit') {
      btn.classList.add('submit-mode');
      if (iconSpan) iconSpan.textContent = '✨'; // Sparkles for submit
      if (textSpan) textSpan.textContent = 'ส่งคำตอบ';
      btn.classList.replace('bg-blue-600', 'bg-green-600');
      btn.classList.replace('hover:bg-blue-700', 'hover:bg-green-700');
    } else {
      btn.classList.add('next-mode');
      if (iconSpan) iconSpan.textContent = '➡️'; // Arrow for next
      if (textSpan) textSpan.textContent = 'ข้อถัดไป';
      btn.classList.replace('bg-green-600', 'bg-blue-600');
      btn.classList.replace('hover:bg-green-700', 'hover:bg-blue-700');
    }

    // Ensure the button is visible when its state is updated (answering a question)
    btn.classList.remove('hidden');
  }

  renderMath(element) {
    if (window.renderMathInElement) {
      window.renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
  }

  showQuestionCountWarning() {
    if (!this.elements.startScreen) return;

    let warning = this.elements.startScreen.querySelector('.quest-warning');
    if (!warning) {
      warning = document.createElement('div');
      warning.className = 'quest-warning p-3 mb-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm flex items-center gap-2 animate-fade-in';
      warning.innerHTML = `
                <span class="text-lg">⚠️</span>
                <span>จำนวนข้อสอบน้อยกว่า 20 ข้อ จะไม่ถูกนับในภารกิจประจำวันบางรายการ</span>
            `;
      // Insert after the description or total questions info
      const target = this.elements.startScreen.querySelector('p.text-gray-600') || this.elements.startScreen.querySelector('h2');
      if (target) target.parentNode.insertBefore(warning, target.nextSibling);
    }
    warning.style.display = 'flex';
  }

  setFloatingNav(active) {
    const container = document.querySelector('.quiz-navigation');
    if (!container) return;

    if (active) {
      container.classList.add('floating-nav');
      // Add specific floating styles if not controlled by CSS class entirely
      document.body.classList.add('has-floating-nav');
    } else {
      container.classList.remove('floating-nav');
      document.body.classList.remove('has-floating-nav');
    }
  }

  applyLocalTheme(themeValue) {
    // Implementation might depend on where themes are stored/defined
    // For now, assume it adds a class to body
    document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset', 'theme-dark_nebula');
    if (themeValue && themeValue !== 'default') {
      document.body.classList.add(`theme-${themeValue}`);
    }
  }
}
