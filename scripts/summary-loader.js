import { authManager } from './auth-manager.js';

async function main() {
    try {
        // 1. โหลด Component ที่จำเป็นสำหรับทุกหน้าเสมอ (Header, Footer, Modals)
        // เพื่อให้ Modal 'access-denied' พร้อมใช้งานทันที
        const { loadComponent } = await import('./component-loader.js');
        await Promise.all([
            loadComponent('#main_header-placeholder', './components/main_header.html'),
            loadComponent('#footer-placeholder', './components/footer.html'),
            loadComponent('#modals-placeholder', './components/modals_common.html')
        ]);

        // 2. เริ่มการทำงานของ Component ทั่วไป (เช่น Dark mode, Dropdown)
        const { initializeCommonComponents } = await import('./common-init.js');
        await initializeCommonComponents();

        // 3. รอตรวจสอบสถานะล็อกอินและสิทธิ์
        const user = await authManager.waitForAuthReady();
        
        // 4. ถ้าไม่ใช่เมลโรงเรียน ให้หยุดการทำงานที่นี่ (สคริปต์ใน summary.html จะแสดง Modal เอง)
        if (!user || !user.email || !user.email.endsWith('@promma.ac.th')) {
            // ซ่อน Spinner ที่กำลังโหลด เพราะเราจะไม่โหลดข้อมูลต่อ
            const loadingSpinner = document.getElementById('loading-spinner');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            return; 
        }

        // 5. ถ้ามีสิทธิ์ ให้โหลดข้อมูลสรุปผลต่อ
        const { initializeSummaryPage } = await import('./summary-handler.js');
        // Build the summary page content
        await initializeSummaryPage();

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