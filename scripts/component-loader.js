/**
 * Fetches HTML content from a file and injects it into a specified element.
 * Includes robust error handling for network issues or missing elements.
 * @param {string} selector - The CSS selector for the target placeholder element.
 * @param {string} filePath - The path to the HTML component file.
 * @returns {Promise<void>} A promise that resolves when the component is loaded or fails.
 */
export async function loadComponent(selector, filePath) {
    console.log(`⏳ ComponentLoader: Requesting ${filePath} into ${selector}...`);
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

    try {
        const controller = new AbortController();
        const timeoutDuration = 1500; // Reduced to 1.5 seconds for debugging
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
        element.innerHTML = html;
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