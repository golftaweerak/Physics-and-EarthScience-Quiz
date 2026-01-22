/**
 * UI Utilities for Accordions and Scrolling
 * Extracted and refactored from main.js for modularity.
 */

/**
 * Toggles the state of an accordion section (expands or collapses it).
 * @param {HTMLElement} toggleElement The header element of the accordion section.
 * @param {'open'|'close'|undefined} forceState - Force the accordion to open, close, or toggle.
 */
export const toggleAccordion = (toggleElement, forceState) => {
  const content = toggleElement.nextElementSibling;
  const icon = toggleElement.querySelector(".chevron-icon");
  const innerContent = content?.querySelector(".inner-content-wrapper");
  const iconContainer = toggleElement.querySelector(".section-icon-container");
  const mainIcon = iconContainer?.querySelector(".section-main-icon");
  if (!content || !icon) return;

  const isCurrentlyOpen = toggleElement.getAttribute('aria-expanded') === 'true';
  // Determine the target state. If forceState is provided, use it. Otherwise, toggle.
  const shouldBeOpen = forceState !== undefined ? forceState === 'open' : !isCurrentlyOpen;

  // If the state is already what we want, do nothing.
  if (shouldBeOpen === isCurrentlyOpen) return;

  toggleElement.setAttribute("aria-expanded", shouldBeOpen);
  icon.classList.toggle("rotate-180", shouldBeOpen);

  if (iconContainer) {
    iconContainer.classList.toggle("scale-105", shouldBeOpen);
    iconContainer.classList.toggle("shadow-lg", shouldBeOpen);
  }
  if (mainIcon) {
    mainIcon.classList.toggle("rotate-12", shouldBeOpen);
  }

  // The grid-rows trick is a clever way to animate height with Tailwind.
  content.classList.toggle("grid-rows-[1fr]", shouldBeOpen);
  content.classList.toggle("grid-rows-[0fr]", !shouldBeOpen);

  // Animate inner content opacity and transform for a smoother "fade and slide in" effect.
  if (innerContent) {
    // The delay helps the fade-in feel more natural as the container expands.
    innerContent.style.transitionDelay = shouldBeOpen ? "150ms" : "0ms";
    innerContent.classList.toggle("opacity-100", shouldBeOpen);
    innerContent.classList.toggle("translate-y-0", shouldBeOpen);
    innerContent.classList.toggle("opacity-0", !shouldBeOpen);
    innerContent.classList.toggle("-translate-y-2", !shouldBeOpen);
  }
};

/**
 * A function to get all the toggles, so we don't expose the variable directly
 */
export const getSectionToggles = () =>
  document.querySelectorAll(".section-toggle");

/**
 * Initializes the anchor scroll fix.
 * Handles clicks on navigation links (e.g., in the header) that point to category sections.
 * This allows opening a specific accordion section from anywhere on the page.
 * @param {Function} toggleAccordionFn - The toggle function to use (optional, defaults to internal)
 * @param {Function} getTogglesFn - The getter for toggles (optional, defaults to internal)
 */
export function initializeAnchorScrollFix(toggleAccordionFn = toggleAccordion, getTogglesFn = getSectionToggles) {
  const ACCORDION_ANIMATION_DURATION = 500;
  const SCROLL_DELAY = ACCORDION_ANIMATION_DURATION + 50;

  /**
   * @param {HTMLElement} targetElement The element to scroll to.
   */
  function scrollToElement(targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCategoryNavigation(event) {
    const navLink = event.target.closest('a[href^="#category-"]');
    if (!navLink) return;

    event.preventDefault();
    const targetId = navLink.hash;
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    const targetToggle = targetSection.querySelector('.section-toggle');
    if (targetToggle) {
      const isAlreadyOpen = targetToggle.getAttribute('aria-expanded') === 'true';
      if (!isAlreadyOpen) {
        // Programmatically click the toggle if we have the function, else simulate click
        toggleAccordionFn(targetToggle, 'open');
      }

      // Use a longer timeout here as well to ensure any closing animation has finished
      setTimeout(() => scrollToElement(targetSection), SCROLL_DELAY);
    }
  }

  // Remove existing listener if any to avoid duplicates (though difficult without reference)
  document.removeEventListener('click', handleCategoryNavigation);
  document.addEventListener('click', handleCategoryNavigation);
}

/**
 * Initializes a simple scroll-to-top button functionality if one exists on the page.
 */
export function initializeScrollToTop() {
  const scrollToTopBtn = document.getElementById("scroll-to-top-btn");
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.remove("opacity-0", "pointer-events-none");
      } else {
        scrollToTopBtn.classList.add("opacity-0", "pointer-events-none");
      }
    });
  }
}
