const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clip-rule="evenodd" /></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>`;

/**
 * Updates any dark mode toggle buttons found in the document.
 */
function updateAllToggles() {
    const isDark = document.documentElement.classList.contains('dark');
    const icon = isDark ? sunIcon : moonIcon;
    const text = isDark ? 'โหมดสว่าง' : 'โหมดมืด';

    const buttons = document.querySelectorAll('.dark-mode-toggle, #dark-mode-toggle');
    console.log(`[DarkMode] updateAllToggles called. Found ${buttons.length} buttons.`);

    buttons.forEach(btn => {
        const displayStyle = btn.getAttribute('data-display') || 'full'; // 'full' (icon+text) or 'icon' (icon only)
        console.log(`[DarkMode] Updating button: style=${displayStyle}, isDark=${isDark}`);

        if (displayStyle === 'icon') {
            btn.innerHTML = icon;
            btn.setAttribute('aria-label', text);
            btn.title = text;
        } else {
            btn.innerHTML = `${icon} <span>${text}</span>`;
        }
    });
}

/**
 * Applies the theme and dispatches an event.
 */
export function applyTheme(isDark) {
    try {
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (document.body) document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            if (document.body) document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    } catch (e) {
        console.warn('Dark Mode: Storage access denied:', e);
    }
    updateAllToggles();
}

/**
 * Global click handler for dark mode toggle using delegation.
 * This handles buttons even if they are replaced by dynamic loaders.
 */
document.addEventListener('click', (event) => {
    const toggleBtn = event.target.closest('.dark-mode-toggle, #dark-mode-toggle');
    if (toggleBtn) {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!isCurrentlyDark);
    }
});

// 1. Initial application (Safe FOUC fix)
try {
    const storedTheme = localStorage.getItem('theme');
    const isInitialDark = storedTheme === 'dark' ||
        (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const themeClass = isInitialDark ? 'dark' : 'light'; // This variable is not used but logic is same

    if (isInitialDark) {
        document.documentElement.classList.add('dark');
        if (document.body) document.body.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
        if (document.body) document.body.classList.remove('dark');
    }
} catch (e) {
    console.warn('Dark Mode: Early theme init failed:', e);
}

// 2. Global singleton observer setup
let observer = null;
function startObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element
                        if (node.matches?.('.dark-mode-toggle, #dark-mode-toggle') || node.querySelector?.('.dark-mode-toggle, #dark-mode-toggle')) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
            }
            if (shouldUpdate) break;
        }

        if (shouldUpdate) {
            updateAllToggles();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    updateAllToggles();
}

// Try to start observer immediately (if body exists) or wait for it
if (document.body) {
    startObserver();
} else {
    document.addEventListener('DOMContentLoaded', startObserver);
}

export function initializeDarkMode() {
    // Determine current state safely
    let isDark = false;
    try {
        const storedTheme = localStorage.getItem('theme');
        isDark = storedTheme === 'dark' ||
            (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) {
        isDark = document.documentElement.classList.contains('dark');
    }

    applyTheme(isDark);
    startObserver();
}