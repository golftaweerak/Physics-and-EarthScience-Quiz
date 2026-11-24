import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalHandler } from '../scripts/modal-handler.js';
import { bindConfirmModalAction, openCompletedQuizModal } from '../scripts/ui-utils.js';

describe('ModalHandler singleton & shared modal helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="confirm-action-modal" class="hidden">
        <div class="modal-container">
          <h3 id="confirm-modal-title"></h3>
          <p id="confirm-modal-description"></p>
          <button id="confirm-action-btn">Confirm</button>
          <button data-modal-close>Cancel</button>
        </div>
      </div>
      <div id="completed-quiz-modal" class="hidden">
        <div class="modal-container">
          <h3 id="completed-modal-title"></h3>
          <button id="completed-view-results-btn">View Results</button>
          <button id="completed-start-over-btn">Start Over</button>
          <button data-modal-close>Cancel</button>
        </div>
      </div>
    `;
  });

  it('returns the same ModalHandler instance for the same connected modal ID', () => {
    const first = new ModalHandler('confirm-action-modal');
    const second = new ModalHandler('confirm-action-modal');
    expect(second).toBe(first);
  });

  it('bindConfirmModalAction swaps callbacks cleanly without detaching the button node', () => {
    const originalBtn = document.getElementById('confirm-action-btn');
    const firstFn = vi.fn();
    const secondFn = vi.fn();
    const closeFn = vi.fn();

    bindConfirmModalAction(firstFn, closeFn);
    bindConfirmModalAction(secondFn, closeFn);

    expect(document.getElementById('confirm-action-btn')).toBe(originalBtn);
    originalBtn.click();

    expect(firstFn).not.toHaveBeenCalled();
    expect(secondFn).toHaveBeenCalledTimes(1);
    expect(closeFn).toHaveBeenCalledTimes(1);
  });

  it('openCompletedQuizModal updates context and invokes onStartOver once for the active quiz', async () => {
    const mockModal = { open: vi.fn(), close: vi.fn() };
    const startOverSpy = vi.fn().mockResolvedValue(undefined);

    // Replace window.location cleanly
    delete window.location;
    window.location = { href: '' };

    openCompletedQuizModal({
      title: 'Quiz A',
      url: './quiz/index.html?id=qA',
      storageKey: 'quizState-qA',
      modal: mockModal,
      onStartOver: startOverSpy,
    });

    openCompletedQuizModal({
      title: 'Quiz B',
      url: './quiz/index.html?id=qB',
      storageKey: 'quizState-qB',
      modal: mockModal,
      onStartOver: startOverSpy,
    });

    expect(document.getElementById('completed-modal-title').textContent).toBe('Quiz B');

    document.getElementById('completed-start-over-btn').click();
    await new Promise((r) => setTimeout(r, 0));

    expect(startOverSpy).toHaveBeenCalledTimes(1);
    expect(startOverSpy).toHaveBeenCalledWith('quizState-qB');
    expect(window.location.href).toBe('./quiz/index.html?id=qB');
  });
});
