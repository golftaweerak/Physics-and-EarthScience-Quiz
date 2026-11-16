const memoryCache = new Map();

/**
 * Fetches HTML content from a file (with in-memory caching) and injects it into a specified element.
 * Includes robust error handling and subdirectory path rewriting for /quiz/ pages.
 * @param {string} selector - The CSS selector for the target placeholder element.
 * @param {string} filePath - The path to the HTML component file.
 * @returns {Promise<void>} A promise that resolves when the component is loaded or fails.
 */
export async function loadComponent(selector, filePath) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`⚠️ ComponentLoader: Target element '${selector}' not found.`);
        return;
    }

    // Clear any legacy component cache from sessionStorage to ensure fresh HTML
    const cacheKey = `component_cache_${filePath}`;
    try {
        sessionStorage.removeItem(cacheKey);
    } catch (e) {
        // Ignore storage errors
    }

    const applyHtml = (rawHtml) => {
        let html = rawHtml;
        const isSubdirectory = filePath.startsWith('../') || window.location.pathname.includes('/quiz/');
        if (isSubdirectory) {
            html = html
                .replace(/src="\.\/assets\//g, 'src="../assets/')
                .replace(/href="\.\//g, 'href="../');
        }
        element.innerHTML = html;
    };

    if (memoryCache.has(filePath)) {
        applyHtml(memoryCache.get(filePath));
        return;
    }

    console.log(`⏳ ComponentLoader: Requesting ${filePath} into ${selector}...`);
    try {
        const controller = new AbortController();
        const timeoutDuration = 5000;
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => {
                controller.abort();
                reject(new Error(`Timeout after ${timeoutDuration}ms`));
            }, timeoutDuration)
        );

        const fetchPromise = fetch(filePath, { signal: controller.signal });

        // RACE: Whichever finishes first wins.
        // This guarantees we don't wait forever even if fetch hangs ignoring the signal.
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
            throw new Error(`Status ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        memoryCache.set(filePath, html);
        applyHtml(html);
        console.log(`✅ ComponentLoader: Successfully loaded ${filePath}`);
    } catch (error) {
        console.error(`❌ ComponentLoader: Error loading ${filePath}:`, error);
        // Provide user-facing feedback directly in the placeholder
        element.innerHTML = `<div class="p-4 text-center border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p class="text-red-600 dark:text-red-400 font-bold">Failed to load component</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${error.message}</p>
        </div>`;
    }
}