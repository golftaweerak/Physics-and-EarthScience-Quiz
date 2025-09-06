// --- Dark Mode Toggle Script ---

export function initializeDarkMode() { 
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) {
        // console.error('Dark mode toggle button not found!');
        return;
    }

    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            toggleButton.innerHTML = sunIcon;
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            toggleButton.innerHTML = moonIcon;
            localStorage.theme = 'light';
        }
    }

    toggleButton.addEventListener('click', () => {
        applyTheme(!document.documentElement.classList.contains('dark'));
    });

    // Apply theme on initial load
    const isInitialDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(isInitialDark);
}