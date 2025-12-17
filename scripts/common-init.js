import { initializeDarkMode } from './dark-mode.js';
import { initializeDropdown } from './dropdown.js';
import { initializeMenu } from './menu-handler.js';
import { initializeDevTools } from './dev-tools-handler.js';

/**
 * Sets up the dynamic header height adjustment.
 * This ensures the content padding matches the fixed header height on all devices.
 */
function setupHeaderHeightAdjustment() {
    const hardcodedHeader = document.getElementById("main-header");
    const dynamicPlaceholder = document.getElementById("main_header-placeholder");

    const updateHeight = (element) => {
        if (element) {
            const headerHeight = element.offsetHeight;
            document.documentElement.style.setProperty(
                "--header-height-offset",
                `${headerHeight + 16}px` // Add 16px buffer
            );
        }
    };

    if (hardcodedHeader) {
        // Case 1: Hardcoded Header (index.html)
        const resizeObserver = new ResizeObserver(() => updateHeight(hardcodedHeader));
        resizeObserver.observe(hardcodedHeader);
        updateHeight(hardcodedHeader); // Initial set
    } else if (dynamicPlaceholder) {
        // Case 2: Dynamic Header (other pages)
        const setHeaderHeightProperty = () => {
            const headerNode = dynamicPlaceholder.firstElementChild;
            if (headerNode) {
                updateHeight(headerNode);
            }
        };

        const resizeObserver = new ResizeObserver(setHeaderHeightProperty);

        const attachObserver = () => {
            const headerNode = dynamicPlaceholder.firstElementChild;
            if (headerNode) {
                setHeaderHeightProperty();
                resizeObserver.observe(headerNode);
            }
        };

        // 1. Try to attach immediately
        attachObserver();

        // Use MutationObserver to detect when the header content is loaded into the placeholder.
        const mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    // If new content is added, re-attach observer
                    resizeObserver.disconnect();
                    attachObserver();
                }
            }
        });
        // Start observing the placeholder.
        mutationObserver.observe(dynamicPlaceholder, { childList: true });
    }
}

/**
 * Initializes all components and functionalities that are common across multiple pages.
 * This includes dark mode, the main navigation menu, and the copyright year.
 */
export function initializeCommonComponents() {
    initializeDarkMode();
    // Assumes the main menu button and dropdown have these IDs on all pages where this is called.
    initializeDropdown('main-menu-btn', 'main-menu-dropdown');
    initializeMenu();
    initializeDevTools(); // Initialize dev tools access on all pages

    // Setup header height adjustment globally for all pages
    setupHeaderHeightAdjustment();

    // Set copyright year in the footer
    const yearSpan = document.getElementById("copyright-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}