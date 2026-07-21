import { initializeDarkMode } from './dark-mode.js';
import { initializeDropdown } from './dropdown.js';
import { initializeMenu } from './menu-handler.js';
import { initializeDevTools } from './dev-tools-handler.js';
import { authManager } from './auth-manager.js';

/**
 * Sets up the dynamic header height adjustment.
 * This ensures the content padding matches the fixed header height on all devices.
 */
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
            // Only update if significantly changed to avoid loops
            const currentOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height-offset")) || 0;
            if (Math.abs(headerHeight + 16 - currentOffset) > 1) {
                document.documentElement.style.setProperty(
                    "--header-height-offset",
                    `${headerHeight + 16}px` // Add 16px buffer
                );
            }
        }
    };

    if (hardcodedHeader) {
        // Case 1: Hardcoded Header (index.html)
        updateHeight(hardcodedHeader); // Initial set
    } else if (dynamicPlaceholder) {
        // Case 2: Dynamic Header
        const headerNode = dynamicPlaceholder.firstElementChild;
        if (headerNode) {
            updateHeight(headerNode);
        } else {
            // Check once more after a short delay (fallback)
            setTimeout(() => {
                const retryNode = dynamicPlaceholder.firstElementChild;
                if (retryNode) updateHeight(retryNode);
            }, 1000);
        }
    }
}

/**
 * Initializes the authentication UI elements in the header.
 * Handles login/logout buttons and user avatar display.
 */
function initializeAuthUI() {
    const handleAuthElements = () => {
        const loginBtn = document.getElementById('user-hub-login-btn');
        const logoutBtn = document.getElementById('user-hub-logout-btn');

        if (loginBtn && !loginBtn.dataset.authInitialized) {
            loginBtn.addEventListener('click', () => authManager.login().catch(e => {
                console.warn("Login handled error:", e);
                // Errors are already handled/toasted in auth-manager.js
            }));
            loginBtn.dataset.authInitialized = 'true';
        }
        if (logoutBtn && !logoutBtn.dataset.authInitialized) {
            logoutBtn.addEventListener('click', () => authManager.logout());
            logoutBtn.dataset.authInitialized = 'true';
        }

        // Update initial state
        const user = authManager.currentUser;
        if (user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    };

    // Run once. App-loader ensures header is loaded before calling this.
    handleAuthElements();

    // Subscribe to auth changes
    authManager.onUserChange(user => {
        const loginBtn = document.getElementById('user-hub-login-btn');
        const logoutBtn = document.getElementById('user-hub-logout-btn');
        if (user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    });
}



/**
 * Initializes all components and functionalities that are common across multiple pages.
 * This includes dark mode, the main navigation menu, and the copyright year.
 */
export async function initializeCommonComponents() {
    console.log("🔄 common-init: Starting initializeCommonComponents...");

    initializeDarkMode();
    console.log("🔄 common-init: DarkMode initialized.");

    // Assumes the main menu button and dropdown have these IDs on all pages where this is called.
    initializeDropdown('main-menu-btn', 'main-menu-dropdown');
    initializeDropdown('user-hub-btn', 'user-hub-dropdown');
    console.log("🔄 common-init: Dropdowns initialized. Calling initializeMenu...");

    initializeMenu(); // Initialize menu in the background to prevent blocking main UI loading
    console.log("🔄 common-init: Menu initialization started in background. Calling initializeAuthUI...");

    initializeDevTools(); // Initialize dev tools access on all pages
    initializeAuthUI(); // Initialize authentication UI globally
    console.log("🔄 common-init: AuthUI initialized.");

    // Setup header height adjustment globally for all pages
    setupHeaderHeightAdjustment();
    console.log("🔄 common-init: Header height adjustment set.");

    // Set copyright year in the footer
    const yearSpan = document.getElementById("copyright-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Set course code in navigation menu
    const { getCurrentCourseCode: getCode } = await import('./data-manager.js');
    const navCodeSpan = document.getElementById("nav-course-code");
    if (navCodeSpan) {
        navCodeSpan.textContent = getCode();
    }
    console.log("✅ common-init: initializeCommonComponents COMPLETE.");
}