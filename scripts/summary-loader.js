import { authManager } from './auth-manager.js';

async function main() {
    try {
        // 0. เริ่มตรวจสอบ Auth ทันที (Background) เพื่อไม่ให้เสียเวลา
        const authPromise = authManager.waitForAuthReady();

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

        // 3. รอสถานะล็อกอินและสิทธิ์ (ซึ่งเริ่มทำงานไปแล้วตั้งแต่ต้น)
        const user = await authPromise;

        const urlParams = new URLSearchParams(window.location.search);
        const isDevMode = urlParams.get('dev') === 'true';
        const isSchoolEmail = (user && user.email && user.email.endsWith('@promma.ac.th')) || isDevMode;

        const mainContent = document.getElementById('main-content');
        const loadingSpinner = document.getElementById('loading-spinner');

        if (isSchoolEmail) {
            // อนุญาตให้เข้าถึง: แสดงเนื้อหาหลัก
            if (mainContent) mainContent.classList.remove('hidden');

            // 5. ถ้ามีสิทธิ์ ให้โหลดข้อมูลสรุปผลต่อ
            const { initializeSummaryPage } = await import('./summary-handler.js');
            await initializeSummaryPage();

            if (loadingSpinner) loadingSpinner.classList.add('hidden');
        } else {
            // ไม่มีสิทธิ์: แสดง Modal
            if (loadingSpinner) loadingSpinner.classList.add('hidden');

            const showAccessDenied = () => {
                const modal = document.getElementById('access-denied-modal');
                if (modal) {
                    modal.classList.remove('hidden');
                    const loginBtn = document.getElementById('access-denied-login-btn');
                    if (loginBtn) {
                        loginBtn.addEventListener('click', () => {
                            authManager.login().catch(console.error);
                        });
                    }

                    // Animation
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            modal.classList.remove('opacity-0');
                            const content = modal.querySelector('.transform');
                            if (content) content.classList.replace('scale-95', 'scale-100');
                        });
                    });
                } else {
                    // Fallback to insertion if modal component failed to load
                    document.body.insertAdjacentHTML('beforeend', `
                        <div class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md font-sarabun">
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-200 dark:border-gray-700">
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-kanit">สงวนสิทธิ์การเข้าถึง</h3>
                                <p class="text-gray-600 dark:text-gray-300 mb-8">ขออภัย หน้านี้สำหรับอีเมล <br><span class="font-bold text-blue-600 dark:text-blue-400">@promma.ac.th</span> เท่านั้น</p>
                                <div class="flex flex-col gap-3">
                                    <button onclick="location.reload()" class="inline-block w-full px-6 py-3.5 font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all">ลองใหม่อีกครั้ง</button>
                                    <a href="./index.html" class="inline-block w-full px-6 py-3.5 font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">กลับสู่หน้าหลัก</a>
                                </div>
                            </div>
                        </div>`);
                }
            };
            showAccessDenied();
        }

    } catch (error) {
        console.error("Failed to initialize summary page:", error);
        const container = document.getElementById('summary-container');
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                    <div class="bg-red-50 dark:bg-red-900/20 p-5 rounded-full mb-6 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl md:text-3xl font-bold font-kanit text-gray-800 dark:text-white mb-3">ขออภัย ไม่สามารถโหลดข้อมูลได้</h3>
                    <p class="text-gray-600 dark:text-gray-300 max-w-md mb-8 text-base md:text-lg leading-relaxed">
                        ระบบไม่สามารถดึงข้อมูลสรุปคะแนนได้ในขณะนี้<br>อาจเกิดจากปัญหาการเชื่อมต่อหรือเซิร์ฟเวอร์ขัดข้อง
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                        <button onclick="window.location.reload()" class="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            ลองใหม่อีกครั้ง
                        </button>
                        <a href="./index.html" class="inline-flex items-center justify-center px-6 py-3.5 border border-gray-200 dark:border-gray-700 text-base font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            กลับสู่หน้าหลัก
                        </a>
                    </div>
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', main);