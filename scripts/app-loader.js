import { loadComponent } from './component-loader.js';
import { initializeCommonComponents } from './common-init.js';
import { Gamification } from './gamification.js';
import { initializeDarkMode } from './dark-mode.js';
import { challengeManager } from './challenge-manager.js';
import { SiteConfig } from './site-config.js';

let isAnchorScrollInitialized = false;

/**
 * Handles anchor link clicks from the page header to ensure smooth scrolling
 * after accordion animations complete.
 */
function initializeAnchorScrollFix(toggleAccordion, getSectionToggles) {
    if (isAnchorScrollInitialized) return;
    const headerPlaceholder = document.getElementById('main_header-placeholder'); // Updated ID
    if (!headerPlaceholder) return;

    // Use event delegation on the container for the links
    headerPlaceholder.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#category-"]');
        if (!link) return;

        event.preventDefault(); // Stop the browser's default immediate jump

        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const sectionToggles = getSectionToggles();
            const targetToggle = targetElement.querySelector('.section-toggle');

            if (targetToggle) {
                // Close all other accordions first for a cleaner UX
                sectionToggles.forEach(otherToggle => {
                    if (otherToggle !== targetToggle) {
                        toggleAccordion(otherToggle, 'close');
                    }
                });
                // Then, ensure the target accordion is open.
                toggleAccordion(targetToggle, 'open');
            }

            // We just need to wait for the collapse/expand animation to finish before scrolling.
            setTimeout(() => {
                targetElement.scrollIntoView(); // This respects the `scroll-padding-top` on <html>
            }, 550); // Adjust duration to be slightly longer than the CSS animation.
        }
    });
    isAnchorScrollInitialized = true;
}

/**
 * Initializes the application by loading shared components and then running page-specific scripts.
 */
async function main() {
    console.log("🚀 App Loader: Starting initialization...");

    // DEBUG: Heartbeat removed to reduce noise
    // const heartbeat = setInterval(...) 

    try {
        // 1. Initialize Critical Systems
        console.log("🚀 App Loader: Initializing systems...");

        // Update Meta Tags & Title dynamically
        document.title = SiteConfig.appTitle;
        document.querySelector('meta[name="description"]')?.setAttribute("content", SiteConfig.appDescription);
        document.querySelector('meta[name="keywords"]')?.setAttribute("content", SiteConfig.appKeywords);
        document.querySelector('meta[name="author"]')?.setAttribute("content", SiteConfig.author);

        initializeDarkMode();
        // Defer Gamification to after UI loads to prevent thread blocking

        // 2. Load Shared Components in Parallel
        console.log("🚀 App Loader: Loading components in parallel...");

        const components = [
            { id: '#main_header-placeholder', path: './components/main_header.html', name: 'Header' },
            { id: '#footer-placeholder', path: './components/footer.html', name: 'Footer' },
            { id: '#modals-placeholder', path: './components/modals_common.html', name: 'Modals' }
        ];

        // Load all components with a strict "Force Proceed" timeout.
        // If components take longer than 4s, we abandon them and start the app anyway.
        const componentsPromise = Promise.allSettled(
            components.map(comp => loadComponent(comp.id, comp.path).then(() => comp.name))
        );

        let timeoutId;
        const forceProceedPromise = new Promise(resolve => {
            timeoutId = setTimeout(() => {
                console.warn("⚠️ App Loader: Component loading took too long. Forcing start...");
                resolve('timeout');
            }, 4000);
        });

        const loadResults = await Promise.race([componentsPromise, forceProceedPromise]);
        clearTimeout(timeoutId); // Clear timeout if components load successfully

        if (Array.isArray(loadResults)) {
            loadResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    console.log(`✅ App Loader: ${result.value} loaded.`);
                } else {
                    console.error(`❌ App Loader: ${components[index].name} failed to load:`, result.reason);
                }
            });
        }

        console.log("✅ App Loader: Component loading phase complete.");

        // 3. Initialize UI Logic
        console.log("🚀 App Loader: Initializing UI...");
        await initializeCommonComponents();

        // Initialize Gamification LATE
        console.log("🚀 App Loader: Initializing Gamification...");
        new Gamification();

        console.log("✅ App Loader: UI Initialized.");

        // 4. Initialize Challenge Manager
        try {
            challengeManager.init();
        } catch (err) {
            console.error("🚀 App Loader: Challenge Manager init failed:", err);
        }

        // 5. Page-Specific Logic
        console.log("🚀 App Loader: Loading page scripts...");

        if (document.getElementById('landing-page-container')) {
            try {
                console.log("🚀 App Loader: Importing landing-page.js...");
                const landingMod = await import('./landing-page.js');
                if (landingMod && typeof landingMod.initializeLandingPage === 'function') {
                    await landingMod.initializeLandingPage();
                }
            } catch (err) {
                console.error("❌ App Loader: Failed to initialize landing page logic:", err);
            }
        }

        if (document.getElementById('quiz-categories-container')) {
            try {
                // Dynamic import for main page logic
                console.log("🚀 App Loader: Importing main.js...");

                const mainPromise = import('./main.js');
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout loading main.js")), 5000)
                );

                const mainMod = await Promise.race([mainPromise, timeoutPromise]);
                console.log("✅ App Loader: main.js imported. Initializing...");

                // Ensure DOM has caught up with component injections
                await new Promise(r => setTimeout(r, 50));

                if (mainMod && typeof mainMod.initializePage === 'function') {
                    mainMod.initializePage();
                    initializeAnchorScrollFix(mainMod.toggleAccordion, mainMod.getSectionToggles);
                } else {
                    console.error("❌ App Loader: main.js loaded but initializePage not found.");
                }
            } catch (err) {
                console.error("❌ App Loader: Failed to initialize main page logic:", err);
                // Try to clear loading state if possible
                const placeholder = document.getElementById('categories-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = `<div class="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดเนื้อหา: ${err.message}</div>`;
                }
            }
        }

        if (document.getElementById('create-custom-quiz-btn')) {
            try {
                const customMod = await import('./custom-quiz-handler.js');
                customMod.initializeCustomQuizHandler();
            } catch (err) {
                console.error("Failed to load custom quiz handler:", err);
            }
        }

        // 6. Sync Toast Listener
        const syncToast = document.getElementById('sync-toast');
        window.addEventListener('auth-synced', () => {
            if (syncToast) {
                syncToast.classList.remove('translate-y-24', 'opacity-0');
                setTimeout(() => syncToast.classList.add('translate-y-24', 'opacity-0'), 3000);
            }
        });

        console.log("✅ App Loader: Initialization complete!");

    } catch (error) {
        console.error("❌ App Loader: CRITICAL ERROR:", error);
        // Fallback UI
        const container = document.querySelector('main') || document.body;
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl m-4 border-2 border-red-100 dark:border-red-900/30">
                    <div class="text-6xl mb-4">🩺</div>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">ระบบขัดข้องชั่วคราว</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        ไม่สามารถเริ่มระบบได้เนื่องจาก: <br>
                        <span class="text-red-500 font-mono text-sm break-all">${error.message}</span>
                    </p>
                    <button onclick="window.location.reload()" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition-transform active:scale-95">
                        รีโหลดหน้าเว็บ
                    </button>
                    <p class="mt-6 text-xs text-gray-400 uppercase tracking-widest">Quiz App</p>
                </div>
             `;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);