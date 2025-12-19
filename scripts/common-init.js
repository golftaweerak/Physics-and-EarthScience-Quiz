import { initializeDarkMode } from './dark-mode.js';
import { initializeDropdown } from './dropdown.js';
import { initializeMenu } from './menu-handler.js';
import { initializeDevTools } from './dev-tools-handler.js';
import { authManager } from './auth-manager.js';

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
 * Initializes the authentication UI elements in the header.
 * Handles login/logout buttons and user avatar display.
 */
function initializeAuthUI() {
    const loginBtn = document.getElementById('user-hub-login-btn');
    const logoutBtn = document.getElementById('user-hub-logout-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => authManager.login().catch(err => alert("Login failed: " + err.message)));
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => authManager.logout());
    }

    authManager.onUserChange(user => {
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
 * Updates the text and icon of the dark mode toggle button in the user hub.
 */
function updateDarkModeButton() {
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (!darkModeBtn) return;

    const isDark = document.documentElement.classList.contains('dark');
    const icon = isDark 
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clip-rule="evenodd" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>`;
    const text = isDark ? 'โหมดสว่าง' : 'โหมดมืด';
    darkModeBtn.innerHTML = `${icon} <span>${text}</span>`;
}

/**
 * Initializes all components and functionalities that are common across multiple pages.
 * This includes dark mode, the main navigation menu, and the copyright year.
 */
export async function initializeCommonComponents() {
    initializeDarkMode();
    updateDarkModeButton(); // Set initial text/icon

    // Assumes the main menu button and dropdown have these IDs on all pages where this is called.
    initializeDropdown('main-menu-btn', 'main-menu-dropdown');
    initializeDropdown('user-hub-btn', 'user-hub-dropdown');
    await initializeMenu();
    initializeDevTools(); // Initialize dev tools access on all pages
    initializeAuthUI(); // Initialize authentication UI globally

    // Setup header height adjustment globally for all pages
    setupHeaderHeightAdjustment();

    // Set copyright year in the footer
    const yearSpan = document.getElementById("copyright-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Add listener to update dark mode button text on click
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        // The main click logic is in dark-mode.js, we just update the text after it runs.
        darkModeBtn.addEventListener('click', () => setTimeout(updateDarkModeButton, 50));
    }
}