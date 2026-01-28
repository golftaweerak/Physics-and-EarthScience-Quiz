/**
 * A reusable class to manage accessible modal dialogs with smooth animations.
 *
 * Features:
 * - Toggles visibility with CSS transitions.
 * - Traps focus within the modal.
 * - Closes on 'Escape' key press.
 * - Closes on backdrop click.
 * - Disables body scroll when open.
 * - Restores focus to the trigger element on close.
 * - Prevents state issues from rapid clicks.
 */
export class ModalHandler {
    /** @param {string} modalId The ID of the modal element. */
    constructor(modalId) {
        this.modalId = modalId;
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            console.error(`Modal with id "${modalId}" not found.`);
            return;
        }

        // Find the container that has the transition classes
        this.modalContainer = this.modal.querySelector('.modal-container');
        if (!this.modalContainer) {
            console.warn(`Modal with id "${modalId}" is missing a .modal-container child. Transitions might not work correctly.`);
            this.modalContainer = this.modal; // Fallback to the modal itself
        }

        this.isAnimating = false;
        this.isOpen = false;
        this.triggerElement = null; // The element that opened the modal

        // Bind methods to ensure 'this' context is correct
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);

        // Add event listeners
        const closeButtons = this.modal.querySelectorAll("[data-modal-close]");
        closeButtons.forEach((btn) => btn.addEventListener("click", this.close));
        // Updated to handle a separate overlay div for backdrop clicks
        this.modal.addEventListener("click", (e) => {
            // Close if the click is on the modal's immediate background (the flex container) or on a specific overlay element.
            if (e.target === this.modal || e.target.hasAttribute('data-modal-overlay')) {
                this.close();
            }
        });
    }

    /**
     * Opens the modal with a fade-in and scale-up animation.
     * @param {HTMLElement} [triggerElement] - The element that triggered the modal opening.
     */
    open(triggerElement = null) {
        // Fallback: If the modal wasn't found during construction (race condition), try fetching it now.
        if (!this.modal) {
            this.modal = document.getElementById(this.modalId);
            if (this.modal) {
                // Re-initialize relevant parts
                this.modalContainer = this.modal.querySelector('.modal-container') || this.modal;
                const closeButtons = this.modal.querySelectorAll("[data-modal-close]");
                closeButtons.forEach((btn) => btn.addEventListener("click", this.close));
                this.modal.addEventListener("click", (e) => {
                    if (e.target === this.modal || e.target.hasAttribute('data-modal-overlay')) {
                        this.close();
                    }
                });
            }
        }

        if (!this.modal || this.isOpen || this.isAnimating) return;

        this.isOpen = true;
        this.isAnimating = true;
        this.triggerElement = triggerElement || document.activeElement;

        document.body.style.overflow = "hidden";
        this.modal.classList.remove("hidden");

        // Force reflow to ensure the 'hidden' class removal is processed before adding 'is-open'
        void this.modal.offsetWidth;
        this.modal.classList.add("is-open");

        document.addEventListener("keydown", this.handleKeyDown);

        // Check if transitions are enabled
        const style = window.getComputedStyle(this.modalContainer || this.modal);
        const hasTransition = style.transitionDuration !== '0s' && style.transitionProperty !== 'none';

        let safetyTimeout = null;

        // Wait for the animation to finish before setting focus
        const onOpenEnd = () => {
            if (!this.isAnimating) return;
            this.isAnimating = false;
            this.setFocus();
            if (safetyTimeout) clearTimeout(safetyTimeout);
            this.modal.querySelector('.modal-container')?.removeEventListener('transitionend', onOpenEnd);
        };

        if (!hasTransition) {
            onOpenEnd();
        } else {
            safetyTimeout = setTimeout(onOpenEnd, 500); // Safety fallback
            this.modal.querySelector('.modal-container')?.addEventListener('transitionend', onOpenEnd, { once: true });
        }
    }

    /**
     * Closes the modal with a fade-out and scale-down animation.
     */
    close() {
        if (!this.isOpen || this.isAnimating) return;

        this.isAnimating = true;
        // Force reflow
        void this.modal.offsetWidth;
        this.modal.classList.remove("is-open");

        // Check if transitions are enabled
        const style = window.getComputedStyle(this.modalContainer || this.modal);
        const hasTransition = style.transitionDuration !== '0s' && style.transitionProperty !== 'none';

        let safetyTimeout = null;

        // Wait for the animation to finish before hiding the modal completely
        const onCloseEnd = () => {
            if (!this.isAnimating) return;
            this.modal.classList.add("hidden");
            document.body.style.overflow = "";
            document.removeEventListener("keydown", this.handleKeyDown);

            if (this.triggerElement) {
                this.triggerElement.focus();
            }

            this.isAnimating = false;
            this.isOpen = false;
            if (safetyTimeout) clearTimeout(safetyTimeout);
            this.modal.querySelector('.modal-container')?.removeEventListener('transitionend', onCloseEnd);
        };

        if (!hasTransition) {
            onCloseEnd();
            return;
        }

        safetyTimeout = setTimeout(onCloseEnd, 500); // Safety fallback
        this.modal.querySelector('.modal-container')?.addEventListener('transitionend', onCloseEnd, { once: true });
    }

    /**
     * Sets up and moves focus into the modal.
     */
    setFocus() {
        const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(this.modal.querySelectorAll(focusableSelector))
            .filter(el => el.offsetParent !== null); // Ensure elements are visible

        this.firstFocusableElement = focusableElements[0];
        this.lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (this.firstFocusableElement) {
            this.firstFocusableElement.focus();
        } else {
            // Make modal focusable if it has no focusable children
            this.modal.setAttribute("tabindex", "-1");
            this.modal.focus();
        }
    }

    /**
     * Handles keydown events for accessibility (Escape key and focus trapping).
     * @param {KeyboardEvent} e
     */
    handleKeyDown(e) {
        if (e.key === "Escape") {
            this.close();
            return;
        }

        if (e.key !== "Tab" || !this.firstFocusableElement) return;

        if (e.shiftKey) {
            if (document.activeElement === this.firstFocusableElement) {
                this.lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === this.lastFocusableElement) {
                this.firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
}
