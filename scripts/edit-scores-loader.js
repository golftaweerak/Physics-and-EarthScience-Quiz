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

        const { initializeScoreEditor } = await import('./edit-scores-handler.js');
        // Initialize the score editor functionality specific to this page
        await initializeScoreEditor();

    } catch (error) {
        console.error("Failed to initialize score editor page:", error);
        const container = document.getElementById('table-container');
        if (container) {
            container.innerHTML = `<div class="text-center py-16 text-red-500 dark:text-red-400"><h3 class="text-xl font-bold">เกิดข้อผิดพลาด</h3><p>ไม่สามารถโหลดหน้าแก้ไขคะแนนได้ กรุณาลองรีเฟรชหน้าอีกครั้ง</p></div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);