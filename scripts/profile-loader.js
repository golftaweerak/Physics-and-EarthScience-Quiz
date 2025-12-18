async function main() {
    try {
        const { loadComponent } = await import('./component-loader.js');
        await Promise.all([
            loadComponent('#main_header-placeholder', './components/main_header.html'),
            loadComponent('#footer-placeholder', './components/footer.html'),
            loadComponent('#modals-placeholder', './components/modals_common.html')
        ]);

        const { initializeCommonComponents } = await import('./common-init.js');
        initializeCommonComponents();

        // Load main profile logic
        const { initializeProfile } = await import('./profile.js');
        initializeProfile();

    } catch (error) {
        console.error("Failed to initialize profile page:", error);
    }
}

document.addEventListener('DOMContentLoaded', main);