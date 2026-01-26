/**
 * scripts/quiz-ui-renderer.js
 * 
 * Handles all DOM updates, screen transitions, and UI-specific logic for the quiz.
 * This separates the "View" from the "Controller/Model" logic.
 */

export const UI_CONFIG = {
  icons: {
    next: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>`,
    prev: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>`,
    submit: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`,
  }
};

/**
 * Handles smooth transitions between different screens.
 * @param {HTMLElement} fromScreen - The current active screen.
 * @param {HTMLElement} toScreen - The target screen to show.
 * @returns {HTMLElement} The new active screen.
 */
export function switchScreen(fromScreen, toScreen) {
  const transitionDuration = 300;

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
    return toScreen;
  }
  return null;
}

/**
 * Updates the progress bar and counter.
 */
export function updateProgress(progressBar, counter, current, total) {
  if (progressBar) {
    const percentage = ((current + 1) / total) * 100;
    progressBar.style.width = `${percentage}%`;
  }
  if (counter) {
    counter.textContent = `${current + 1} / ${total}`;
  }
}

/**
 * Updates the appearance of the "Next" button.
 */
export function updateNextButton(btn, index, total, isAnswered, isFloating, icons) {
  if (!btn) return;

  const isLast = index === total - 1;
  let text = 'ข้อต่อไป';
  let icon = icons.next;
  let title = 'ข้อต่อไป';

  const baseClasses = ['w-full', 'sm:w-auto', 'px-10', 'py-4', 'text-white', 'font-black', 'rounded-2xl', 'shadow-xl', 'transition-all', 'transform', 'hover:-translate-y-1', 'active:scale-95', 'btn-quiz-next'];
  const submitClasses = ['theme-bg-gradient', 'shimmer-effect', 'hover:shadow-emerald-500/30'];

  btn.classList.remove(...submitClasses);
  if (!isFloating) btn.classList.add(...baseClasses);

  if (isLast && isAnswered) {
    text = 'ดูผลสรุป';
    icon = icons.submit;
    title = 'ดูผลสรุป';
    btn.classList.add(...submitClasses);
  }

  if (isFloating) {
    btn.innerHTML = icon;
    btn.title = title;
  } else {
    btn.innerHTML = '';
    btn.textContent = text;
  }
}

/**
 * Renders mathematical formulas using KaTeX.
 */
export function renderMath(element) {
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

/**
 * Updates lives display for survival mode.
 */
export function renderLives(container, lives, initialLives) {
  if (!container) return;
  let html = '';
  for (let i = 0; i < initialLives; i++) {
    if (i < lives) {
      html += '<span class="text-red-500 transform hover:scale-110 transition-transform cursor-default" title="ชีวิต">❤️</span>';
    } else {
      html += '<span class="text-gray-300 dark:text-gray-600 grayscale opacity-40 transform scale-90" title="เสียชีวิตแล้ว">❤️</span>';
    }
  }
  container.innerHTML = html;
}
