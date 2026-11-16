/**
 * Initializes all scripts required for the quiz page.
 * This acts as the main entry point after the DOM is loaded.
 */
async function main() {
    if (window.QUIZ_PAGE_LOADER_INITIALIZED) {
        console.warn("Quiz page loader already initialized. Skipping.");
        return;
    }
    window.QUIZ_PAGE_LOADER_INITIALIZED = true;

    // Create and inject loading spinner immediately
    const spinner = document.createElement('div');
    spinner.id = 'quiz-loading-spinner';
    spinner.className = 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500';
    spinner.innerHTML = `
        <div class="relative w-20 h-20">
            <div class="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-3xl animate-bounce">🌍</span>
            </div>
        </div>
        <p class="mt-6 text-lg font-bold text-gray-700 dark:text-gray-300 font-kanit animate-pulse">กำลังเตรียมความพร้อม...</p>
    `;
    document.body.appendChild(spinner);

    try {
        // Optimization: Start importing modules in parallel to reduce load time
        const componentLoaderPromise = import('./component-loader.js');
        const commonInitPromise = import('./common-init.js');
        const quizLoaderPromise = import('./quiz-loader.js');

        // Load shared components first (bundled via Vite ?raw, zero network fetch)
        const { loadComponent } = await componentLoaderPromise;
        await Promise.all([
            loadComponent('#main_header-placeholder', '../components/main_header.html'),
            loadComponent('#footer-placeholder', '../components/footer.html'),
            loadComponent('#modals-placeholder', '../components/modals_common.html')
        ]);

        const { initializeCommonComponents } = await commonInitPromise;
        // Initialize common UI components like header, menu, and footer scripts.
        // This must run BEFORE fixing paths, as it populates the menu with links.
        await initializeCommonComponents();

        // --- FIX COMPONENT PATHS FOR QUIZ PAGE (which is in a subdirectory) ---
        if (window.location.pathname.includes('/quiz/')) {
            // This function is ONLY for pages inside a subdirectory like /quiz/
            const fixComponentPathsForSubdirectory = (containerId) => {
                const container = document.getElementById(containerId);
                if (!container) return;

                // Fix <a> links: changes './' to '../'
                container.querySelectorAll('a[href^="./"]').forEach(link => {
                    const currentHref = link.getAttribute('href');
                    link.setAttribute('href', `..${currentHref.substring(1)}`);
                });

                // Fix <img> sources: changes './' to '../'
                container.querySelectorAll('img[src^="./"]').forEach(img => {
                    const currentSrc = img.getAttribute('src');
                    img.setAttribute('src', `..${currentSrc.substring(1)}`);
                });
            };
            fixComponentPathsForSubdirectory('main_header-placeholder');
            fixComponentPathsForSubdirectory('footer-placeholder');
        }

        // Initialize the core quiz functionality.
        // This function will handle loading data and setting up the quiz logic.
        const { initializeQuiz } = await quizLoaderPromise;
        await initializeQuiz();

        // --- Scientific Calculator: On-Demand Lazy Loader (avoids 772 kB mathjs load on startup) ---
        let calculatorLoadPromise = null;
        const ensureCalculatorLoaded = () => {
            if (window.scientificCalculator) return Promise.resolve(window.scientificCalculator);
            if (!calculatorLoadPromise) {
                calculatorLoadPromise = (async () => {
                    if (window.customElements && !customElements.get('math-field')) {
                        if (!document.querySelector('script[data-mathlive-loader="true"]')) {
                            const script = document.createElement('script');
                            script.type = 'module';
                            script.src = 'https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive.min.js';
                            script.dataset.mathliveLoader = 'true';
                            document.head.appendChild(script);
                        }
                    }
                    const { ScientificCalculator } = await import('./calculator.js');
                    if (window.scientificCalculator && typeof window.scientificCalculator.destroy === 'function') {
                        window.scientificCalculator.destroy();
                    }
                    window.scientificCalculator = new ScientificCalculator();
                    console.log("⚡ Scientific Calculator loaded on demand.");
                    return window.scientificCalculator;
                })();
            }
            return calculatorLoadPromise;
        };

        const calcToggleBtn = document.getElementById('calculator-toggle-btn');
        if (calcToggleBtn) {
            const preloadCalc = () => { ensureCalculatorLoaded().catch(() => {}); };
            calcToggleBtn.addEventListener('mouseenter', preloadCalc, { once: true, passive: true });
            calcToggleBtn.addEventListener('focus', preloadCalc, { once: true, passive: true });
            calcToggleBtn.addEventListener('click', async () => {
                if (window.scientificCalculator) return;
                calcToggleBtn.disabled = true;
                try {
                    const calc = await ensureCalculatorLoaded();
                    if (calc && !calc.isOpen) {
                        calc.open();
                    }
                } catch (calcError) {
                    console.error("Failed to initialize calculator:", calcError);
                } finally {
                    calcToggleBtn.disabled = false;
                }
            });
        }

        document.body.dataset.appInitialized = 'true';
        console.log("🚀 Quiz Page fully initialized");
    } catch (error) {
        console.error("A critical error occurred on the quiz page:", error);
        document.body.dataset.appInitialized = 'error';
        // A simple, dependency-free error message.
        const body = document.body;
        if (body) {
            body.innerHTML = `<div style="text-align: center; padding: 40px; font-family: sans-serif; color: #ef4444;">
                <h1 style="font-size: 24px; font-weight: bold;">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h1>
                <p style="margin-top: 8px;">ไม่สามารถโหลดแบบทดสอบได้ (${error.message})</p>
                <a href="../index.html" style="display: inline-block; margin-top: 24px; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">กลับไปหน้าหลัก</a>
            </div>`;
        }
    } finally {
        // Hide and remove spinner
        spinner.style.opacity = '0';
        setTimeout(() => spinner.remove(), 500);
    }
}

document.addEventListener('DOMContentLoaded', main);