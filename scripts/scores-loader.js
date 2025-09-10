async function main() {
    try {
        const { loadComponent } = await import('./component-loader.js');
        // Load shared HTML components
        await Promise.all([
            loadComponent('#main_header-placeholder', './components/main_header.html'),
            loadComponent('#footer-placeholder', './components/footer.html'),
            loadComponent('#modals-placeholder', './components/modals_common.html')
        ]);

        const { initializeCommonComponents } = await import('./common-init.js');
        // Initialize common functionalities
        initializeCommonComponents();

        const { initializeScoreSearch } = await import('./scores-handler.js');
        // Initialize the score search functionality specific to this page
        initializeScoreSearch();

    } catch (error) {
        console.error("Failed to initialize scores page:", error);
        const container = document.getElementById('result-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-16 px-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60">
                    <h3 class="text-xl font-semibold text-red-500 dark:text-red-400 font-kanit">เกิดข้อผิดพลาด</h3>
                    <p class="mt-2 text-base text-gray-500 dark:text-gray-400">ไม่สามารถโหลดหน้าค้นหาคะแนนได้<br>กรุณาลองรีเฟรชหน้าอีกครั้ง</p>
                    <a href="./index.html" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 no-transition">กลับไปหน้าหลัก</a>
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);