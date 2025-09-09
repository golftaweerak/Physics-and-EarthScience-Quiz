import { loadComponent } from './component-loader.js';
import { initializeCommonComponents } from './common-init.js';
import { initializeSummaryPage } from './summary-handler.js';

async function main() {
    try {
        // Load shared HTML components
        await Promise.all([
            loadComponent('#main_header-placeholder', './components/main_header.html'),
            loadComponent('#footer-placeholder', './components/footer.html'),
            loadComponent('#modals-placeholder', './components/modals_common.html')
        ]);

        // Initialize common functionalities
        initializeCommonComponents();

        // Build the summary page content
        initializeSummaryPage();

    } catch (error) {
        console.error("Failed to initialize summary page:", error);
        const container = document.getElementById('summary-container');
        if (container) {
            container.innerHTML = `<p class="text-center text-red-500">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);