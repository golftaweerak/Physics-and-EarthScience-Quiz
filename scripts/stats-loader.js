/**
 * Initializes the stats page.
 */
async function main() {
    try {
        const { loadComponent } = await import('./component-loader.js');
        // Load shared HTML components like header, footer, and modals
        await Promise.all([
            loadComponent('#main_header-placeholder', './components/main_header.html'),
            loadComponent('#footer-placeholder', './components/footer.html'),
            loadComponent('#modals-placeholder', './components/modals_common.html')
        ]);

        const { initializeCommonComponents } = await import('./common-init.js');
        // Initialize common functionalities like theme toggling
        initializeCommonComponents();

        const { buildStatsPage } = await import('./stats.js');
        // Build the stats dashboard using the new logic from stats.js
        buildStatsPage();

        const { ModalHandler } = await import('./modal-handler.js');
        const { quizList } = await import('../data/quizzes-list.js');
        const { getSavedCustomQuizzes } = await import('./custom-quiz-handler.js');

        // --- Event Listener for Clear Button ---
        const clearStatsBtn = document.getElementById('clear-stats-btn');
        const confirmModal = new ModalHandler('confirm-action-modal');
        const confirmActionBtn = document.getElementById('confirm-action-btn');
        const confirmModalTitle = document.getElementById('confirm-modal-title');
        const confirmModalDesc = document.getElementById('confirm-modal-description');

        if (clearStatsBtn) {
            clearStatsBtn.addEventListener('click', (e) => {
                // Don't open modal if the button is disabled
                if (e.currentTarget.disabled) return;

                if (confirmModalTitle) confirmModalTitle.textContent = 'ยืนยันการล้างข้อมูลทั้งหมด';
                if (confirmModalDesc) confirmModalDesc.innerHTML = 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลความคืบหน้าของแบบทดสอบทั้งหมด? <strong class="text-red-600 dark:text-red-500">การกระทำนี้ไม่สามารถย้อนกลับได้</strong>';
                confirmModal.open(e.currentTarget);
            });
        }

        if (confirmActionBtn) {
            confirmActionBtn.addEventListener('click', () => {
                // Clear standard quizzes from the static list
                quizList.forEach(quiz => {
                    if (quiz.storageKey) localStorage.removeItem(quiz.storageKey);
                });

                // Clear custom quizzes retrieved from localStorage
                const customQuizzes = getSavedCustomQuizzes();
                customQuizzes.forEach(quiz => {
                    if (quiz.storageKey) localStorage.removeItem(quiz.storageKey);
                });
                localStorage.removeItem('customQuizzesList'); // Also remove the list of custom quizzes

                confirmModal.close();
                // Reload the page to reflect the cleared stats
                window.location.reload();
            });
        }
    } catch (error) {
        console.error("Failed to initialize stats page:", error);
        const container = document.getElementById('stats-container');
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) loadingSpinner.remove();
        if (container) { // Fallback error display
            container.innerHTML = `
                <div class="text-center py-16 text-red-500 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 class="text-xl font-bold font-kanit">เกิดข้อผิดพลาด</h3>
                    <p class="mt-2">ไม่สามารถโหลดข้อมูลสถิติได้ในขณะนี้<br>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                    <a href="./index.html" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 no-transition">กลับไปหน้าหลัก</a>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);