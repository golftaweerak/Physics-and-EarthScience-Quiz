import { authManager } from './auth-manager.js';
import { Gamification } from './gamification.js';

// Use Vite's base path for assets
const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Initializes the landing page logic.
 * Handles profile summary display and authentication state transitions.
 */
export async function initializeLandingPage() {
    console.log("🚀 Landing Page: Initializing with BASE_URL:", BASE_URL);
    const profileCard = document.getElementById('quick-profile-card');
    if (!profileCard) return;

    const getAssetPath = (path) => {
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('./') ? path.substring(2) : (path.startsWith('/') ? path.substring(1) : path);
        // Ensure no double slashes
        const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
        return `${normalizedBase}${cleanPath}`;
    };

    const gamification = new Gamification();

    const updateProfileUI = (user) => {
        console.log("👤 Landing Page: Updating Profile UI for", user ? user.displayName : "Guest");
        if (user) {
            const state = gamification.state;
            const levelInfo = gamification.getCurrentLevel();

            const safeXP = typeof levelInfo.currentXP === 'number' ? levelInfo.currentXP : (Number(state.xp) || 0);
            const nextLevelXP = levelInfo.nextLevelXP || 0;
            const xpToNext = nextLevelXP > safeXP ? (nextLevelXP - safeXP) : 0;
            const progress = typeof levelInfo.progressPercent === 'number' ? levelInfo.progressPercent : 0;

            const avatar = state.avatar || '🧑‍🎓';
            const isEmoji = !avatar.includes('/') && !avatar.includes('.');

            profileCard.innerHTML = `
                <div class="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5 flex items-center gap-5 transition-all duration-500 hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800 group relative z-20">
                    <div class="relative">
                        <div class="w-16 h-16 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md transform transition-transform group-hover:scale-105 group-hover:rotate-3 flex items-center justify-center bg-gray-100 dark:bg-slate-800 overflow-hidden text-3xl">
                            ${isEmoji ? avatar : `<img src="${avatar}" class="w-full h-full object-cover">`}
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                            Lv.${levelInfo.level}
                        </div>
                    </div>
                    <div class="flex-grow min-w-0">
                        <div class="flex items-center gap-2">
                            <h3 class="font-kanit font-bold text-slate-900 dark:text-white truncate">${user.displayName || 'นักเรียน'}</h3>
                            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Lv.${levelInfo.level}</span>
                        </div>
                        <div class="flex items-center gap-3 mt-1.5">
                            <div class="flex-grow h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" style="width: ${progress}%"></div>
                            </div>
                            <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">${safeXP} XP</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-500 mt-1">อีก ${xpToNext} XP เพื่อเลเวลถัดไป</p>
                    </div>
                    <a href="${getAssetPath('profile.html')}" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    </a>
                </div>
            `;
            profileCard.classList.remove('opacity-0', 'translate-y-4');
        } else {
            // Logged out state
            profileCard.innerHTML = `
                <div class="bg-gradient-to-br from-blue-600/5 to-indigo-600/5 p-5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center gap-3 transition-all relative z-20">
                    <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">เข้าสู่ระบบเพื่อสะสมเลเวลและรับ Badge!</p>
                    <button id="landing-login-btn" class="px-6 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-4 h-4" alt="Google">
                        เข้าสู่ระบบด้วย Google
                    </button>
                </div>
            `;
            profileCard.classList.remove('opacity-0', 'translate-y-4');

            const loginBtn = document.getElementById('landing-login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => authManager.login().catch(e => console.error(e)));
            }
        }
    };

    // Listen for auth changes
    authManager.onUserChange(updateProfileUI);

    // Fallback if auth is already initialized but callback wasn't fired yet
    const currentUser = await authManager.waitForAuthReady();
    updateProfileUI(currentUser);
}
