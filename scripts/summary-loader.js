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

        const { initializeSummaryPage } = await import('./summary-handler.js');
        // Build the summary page content
        initializeSummaryPage();

    } catch (error) {
        console.error("Failed to initialize summary page:", error);
        const container = document.getElementById('summary-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-16 text-red-500 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 class="text-xl font-bold font-kanit">เกิดข้อผิดพลาด</h3>
                    <p class="mt-2">ไม่สามารถโหลดข้อมูลสรุปคะแนนได้<br>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                    <a href="./index.html" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 no-transition">กลับไปหน้าหลัก</a>
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);