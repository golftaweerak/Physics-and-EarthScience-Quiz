import { Gamification, BADGES, ACHIEVEMENTS, SHOP_ITEMS, XP_THRESHOLDS, TRACK_TITLES } from './gamification.js';
import { getDetailedProgressForAllQuizzes, calculateStrengthsAndWeaknesses } from './data-manager.js';
import { renderDailyQuests } from './daily-quests-renderer.js';
import { ModalHandler } from './modal-handler.js';
import { showToast } from './toast.js';
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from './firebase-config.js';

const AVATARS = [
    '🧑‍🎓', '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '👨‍🚀', '👩‍🚀', '👽', '🤖'
];

// NEW: Proficiency Group Definitions for Radar Chart
const PROFICIENCY_GROUPS = {
    'Mechanics': { 
        label: 'กลศาสตร์', 
        keywords: ['บทที่ 1:', 'บทที่ 2:', 'บทที่ 3:', 'บทที่ 4:', 'บทที่ 5:', 'บทที่ 6:', 'บทที่ 7:', 'บทที่ 8:', 'บทที่ 15:', 'ธรรมชาติทางฟิสิกส์', 'การเคลื่อนที่', 'แรง', 'สมดุล', 'งาน', 'โมเมนตัม', 'ของแข็ง'] 
    },
    'Electricity': { 
        label: 'ไฟฟ้าและแม่เหล็ก', 
        keywords: ['บทที่ 12:', 'บทที่ 13:', 'บทที่ 14:', 'ไฟฟ้า', 'แม่เหล็ก'] 
    },
    'WavesLight': { 
        label: 'คลื่นและแสง', 
        keywords: ['บทที่ 9:', 'บทที่ 10:', 'บทที่ 11:', 'บทที่ 17:', 'คลื่น', 'เสียง', 'แสง'] 
    },
    'ModernHeat': { 
        label: 'สสารและฟิสิกส์ยุคใหม่', 
        keywords: ['บทที่ 16:', 'บทที่ 18:', 'บทที่ 19:', 'ความร้อน', 'อะตอม', 'นิวเคลียร์'] 
    },
    'Astronomy': { 
        label: 'ดาราศาสตร์', 
        keywords: ['เอกภพ', 'กาแล็กซี', 'ดาวฤกษ์', 'ระบบสุริยะ', 'เทคโนโลยีอวกาศ', 'ทรงกลมฟ้า', 'ดาวเคราะห์', 'ดาราศาสตร์'] 
    },
    'Geology': { 
        label: 'ธรณีวิทยา', 
        keywords: ['โครงสร้างโลก', 'แปรสัณฐาน', 'ธรณี', 'หิน', 'แร่', 'แผนที่', 'ดิน', 'ทรัพยากรธรณี'] 
    },
    'Meteorology': { 
        label: 'อุตุนิยมวิทยา', 
        keywords: ['ลมฟ้าอากาศ', 'ภูมิอากาศ', 'อากาศ', 'หมุนเวียน', 'เมฆ', 'พยากรณ์', 'สมุทร', 'บรรยากาศ', 'อุตุนิยมวิทยา'] 
    }
};

// Theme colors for Radar Chart
const THEME_COLORS = {
    'theme-forest': { border: '#059669', background: 'rgba(5, 150, 105, 0.2)', point: '#059669' },
    'theme-sunset': { border: '#ea580c', background: 'rgba(234, 88, 12, 0.2)', point: '#ea580c' },
    'theme-ocean': { border: '#0891b2', background: 'rgba(8, 145, 178, 0.2)', point: '#0891b2' },
    'theme-berry': { border: '#db2777', background: 'rgba(219, 39, 119, 0.2)', point: '#db2777' },
    'theme-midnight': { border: '#475569', background: 'rgba(71, 85, 105, 0.2)', point: '#475569' },
    'default': { border: 'rgba(59, 130, 246, 1)', background: 'rgba(59, 130, 246, 0.2)', point: 'rgba(59, 130, 246, 1)' }
};

// Base Hues for History Chart Lines based on Theme
const THEME_HUES = {
    'theme-forest': 160, // Green
    'theme-sunset': 25,  // Orange
    'theme-ocean': 190,  // Cyan
    'theme-berry': 330,  // Pink
    'theme-midnight': 220 // Slate/Blue-ish
};

let lastSyncTime = null;
let previousXP = null;
let previousAvatar = null;

function getTitleFromXP(xp, type) {
    let track = 'overall';
    if (type === 'physicsXP') track = 'physics';
    if (type === 'earthXP') track = 'earth';
    
    let level = 1;
    for (const threshold of XP_THRESHOLDS) {
        if (xp >= threshold.xp) {
            level = threshold.level;
        } else {
            break;
        }
    }
    
    const titles = TRACK_TITLES[track] || TRACK_TITLES.overall;
    const titleIndex = Math.min(level - 1, titles.length - 1);
    return titles[titleIndex];
}

function getLevelBorderClass(level) {
    if (level >= 20) return 'bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 animate-pulse'; // Rainbow
    if (level >= 15) return 'bg-gradient-to-br from-cyan-300 to-blue-500'; // Diamond
    if (level >= 10) return 'bg-gradient-to-br from-yellow-300 to-amber-500'; // Gold
    if (level >= 5) return 'bg-gradient-to-br from-gray-300 to-blue-300'; // Silver/Blue
    return 'bg-gray-300 dark:bg-gray-600'; // Bronze/Gray
}

function getAvatarFrameClass(avatar) {
    const shopItem = SHOP_ITEMS.find(i => i.value === avatar && i.type === 'avatar');
    if (!shopItem) return 'ring-2 ring-gray-200 dark:ring-gray-700'; // Default

    if (shopItem.cost >= 1000) return 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50 legendary-frame';
    if (shopItem.cost >= 500) return 'ring-4 ring-purple-500 shadow-md shadow-purple-500/30';
    return 'ring-4 ring-green-500';
}

export async function initializeProfile() {
    const game = new Gamification();
    
    // 1. เรนเดอร์ UI ทั่วไปทันที (รวดเร็ว)
    renderUserInfo(game);
    renderTrackProgress(game);
    renderBadges(game);
    renderAchievements(game);
    renderQuestHistory(game);
    renderShop(game);
    renderDailyQuests('profile-daily-quests-container');
    renderSyncStatus(game);

    // 2. ติดตั้งระบบต่างๆ
    setupShopSystem(game);
    setupAvatarSystem(game);
    setupNameEditSystem(game);
    setupTitleSystem(game);
    setupThemeSystem(game);
    setupResetSystem(game);
    setupCollapsibleSections();
    setupManualSync(game);
    setupLeaderboardSystem(game);
    setupShopAccordion(game);

    // 3. เรนเดอร์กราฟ (Asynchronous/ช้ากว่า)
    document.getElementById('radar-chart-loader')?.classList.remove('hidden');
    document.getElementById('history-chart-loader')?.classList.remove('hidden');
    document.getElementById('strengths-weaknesses-loader')?.classList.remove('hidden');
    
    setupRefreshChartsSystem(game); // Setup once
    const chartsRendered = await Promise.all([
        renderRadarChart(game),
        renderProficiencyHistoryChart(game),
        renderStrengthsWeaknesses()
    ]);
    if (chartsRendered.every(Boolean)) {
        document.getElementById('refresh-charts-btn')?.classList.add('hidden');
    }

    // 4. NEW: Auto-refresh when data changes (e.g., after login/sync)
    window.addEventListener('gamification-updated', async () => {
        // Update UI elements
        renderUserInfo(game);
        renderTrackProgress(game);
        renderBadges(game);
        renderAchievements(game);
        renderQuestHistory(game);
        renderShop(game);
        renderSyncStatus(game);

        // Re-render charts to reflect merged data
        await Promise.all([
            renderRadarChart(game),
            renderProficiencyHistoryChart(game),
            renderStrengthsWeaknesses()
        ]);
        setupRefreshChartsSystem(game); // Re-setup in case elements were re-rendered
    });
}

function renderUserInfo(game) {
    const overall = game.getCurrentLevel();
    const rankTitleEl = document.getElementById('user-rank-title');
    if (rankTitleEl) rankTitleEl.textContent = `${overall.title} (Lv.${overall.level})`;

    const levelEl = document.getElementById('user-level');
    if (levelEl) levelEl.textContent = overall.level;

    const currentXP = game.state.xp;
    const totalXpEl = document.getElementById('current-xp');
    
    if (totalXpEl) {
        if (previousXP !== null && previousXP !== currentXP) {
            animateValue(totalXpEl, previousXP, currentXP, 1000);
            const isDecrease = currentXP < previousXP;
            const colorClass = isDecrease ? 'text-red-500' : 'text-green-500';
            totalXpEl.classList.add(colorClass, 'scale-125', 'inline-block', 'transition-transform');
            setTimeout(() => totalXpEl.classList.remove(colorClass, 'scale-125'), 500);
        } else {
            totalXpEl.textContent = currentXP.toLocaleString();
        }
    }

    // Update Level Progress Bar & Quest
    // const nextLevelNumEl = document.getElementById('next-level-number'); // Removed in new design
    // const currentLevelXpDisplayEl = document.getElementById('current-level-xp-display'); // Removed
    const nextLevelTargetXpEl = document.getElementById('next-level-xp');
    const progressBarEl = document.getElementById('xp-progress-bar');
    const questContainerEl = document.getElementById('next-level-quest-container');
    const questDescEl = document.getElementById('next-level-quest-desc');
    const questProgressEl = document.getElementById('next-level-quest-progress');
    
    // Calculate XP Progress relative to current level
    const currentThreshold = XP_THRESHOLDS[overall.level - 1];
    const nextThreshold = XP_THRESHOLDS[overall.level]; // level is 1-based, array is 0-based
    
    if (nextThreshold) {
        const xpRange = nextThreshold.xp - currentThreshold.xp;
        const xpGained = game.state.xp - currentThreshold.xp;
        const xpPercent = Math.min(100, Math.max(0, (xpGained / xpRange) * 100));
        
        if (progressBarEl) progressBarEl.style.width = `${xpPercent}%`;
        if (nextLevelTargetXpEl) nextLevelTargetXpEl.textContent = xpRange.toLocaleString();
    } else {
        if (progressBarEl) progressBarEl.style.width = '100%';
        if (nextLevelTargetXpEl) nextLevelTargetXpEl.textContent = 'MAX';
    }

    if (questContainerEl) {
        if (overall.nextLevelQuest) {
            questContainerEl.classList.remove('hidden');
            if (questDescEl) questDescEl.textContent = overall.nextLevelQuest.desc;
            
            const questProgress = game.getQuestProgressValue(overall.nextLevelQuest);
            const questTarget = overall.nextLevelQuest.target;
            if (questProgressEl) questProgressEl.textContent = `(${questProgress}/${questTarget})`;
        } else {
            questContainerEl.classList.add('hidden');
        }
    }

    // Quizzes count removed from header in new design
    
    // Update display name
    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) nameEl.textContent = game.state.displayName || 'ผู้เรียน (Guest)';
    
    // Update avatar display
    const avatarEl = document.getElementById('profile-avatar-display');
    const levelFrameEl = document.getElementById('level-frame-container');

    if (avatarEl && levelFrameEl) {
        const avatar = game.state.avatar || '🧑‍🎓';
        if (previousAvatar !== avatar) {
            const isImage = avatar.includes('/') || avatar.includes('.');
            if (isImage) {
                avatarEl.innerHTML = `<img src="${avatar}" alt="Profile Avatar" class="w-full h-full rounded-full object-cover">`;
            } else {
                avatarEl.innerHTML = avatar;
            }
            avatarEl.classList.remove('anim-avatar-pop');
            void avatarEl.offsetWidth; // Force reflow
            avatarEl.classList.add('anim-avatar-pop');
            previousAvatar = avatar;
        }

        // Update border class based on price/rarity
        const frameClass = getAvatarFrameClass(avatar);
        avatarEl.className = `w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl cursor-pointer transition-transform transform group-hover:scale-105 ${frameClass}`;

        // NEW: Update level border (outer ring)
        const levelBorderClass = getLevelBorderClass(overall.level);
        levelFrameEl.className = 'w-full h-full rounded-full p-2 transition-all duration-300'; // Reset and use p-2 for visibility
        levelFrameEl.classList.add(...levelBorderClass.split(' '));
    }

    // Update Title
    const titleEl = document.getElementById('profile-title-display');
    if (titleEl) {
        titleEl.textContent = game.state.selectedTitle ? `《 ${game.state.selectedTitle} 》` : '';
        titleEl.classList.toggle('hidden', !game.state.selectedTitle);
    }

    // Update Shop XP
    const shopXpEl = document.getElementById('shop-user-xp');
    if (shopXpEl) {
        if (previousXP !== null && previousXP !== currentXP) {
            animateValue(shopXpEl, previousXP, currentXP, 1000);
            const isDecrease = currentXP < previousXP;
            const colorClass = isDecrease ? 'text-red-500' : 'text-green-500';
            shopXpEl.classList.add(colorClass, 'scale-125', 'inline-block', 'transition-transform');
            setTimeout(() => shopXpEl.classList.remove(colorClass, 'scale-125'), 500);
        } else {
            shopXpEl.textContent = currentXP.toLocaleString();
        }
    }

    // Update Theme Display (Optional, maybe just a text or icon)
    const themeEl = document.getElementById('profile-theme-display');
    if (themeEl) {
        themeEl.textContent = game.state.selectedTheme ? '🎨 ธีม: กำหนดเอง' : '🎨 ธีม: มาตรฐาน';
    }

    renderRecentBadges(game);
    previousXP = currentXP;
}

function renderSyncStatus(game) {
    const wrapper = document.getElementById('sync-status-wrapper');
    const statusEl = document.getElementById('connection-status');
    const lastSyncEl = document.getElementById('last-sync-display');
    
    if (!wrapper || !statusEl) return;

    wrapper.classList.remove('hidden');

    // Access authManager from game instance if available
    const user = game.authManager?.currentUser; 
    const isOnline = navigator.onLine;

    if (!user) {
        // Guest Mode
         statusEl.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
            <span class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">Guest (Local)</span>
        `;
        statusEl.className = "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600";
        if (lastSyncEl) lastSyncEl.textContent = "";
    } else {
        if (isOnline) {
             statusEl.innerHTML = `
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span class="text-green-700 dark:text-green-300 text-[10px] sm:text-xs">Cloud Synced</span>
            `;
            statusEl.className = "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800";
        } else {
             statusEl.innerHTML = `
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span class="text-yellow-700 dark:text-yellow-300 text-[10px] sm:text-xs">Offline</span>
            `;
            statusEl.className = "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800";
        }

        if (lastSyncEl && lastSyncTime) {
            const timeStr = lastSyncTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            lastSyncEl.textContent = `ล่าสุด: ${timeStr}`;
        }
    }
}

function renderRecentBadges(game) {
    const container = document.getElementById('recent-badges');
    if (!container) return;
    
    const recentBadges = game.getEarnedBadges().slice(-3).reverse();
    
    if (recentBadges.length === 0) {
            container.innerHTML = '<span class="text-sm text-gray-400">ยังไม่มีเหรียญรางวัล</span>';
    } else {
        container.innerHTML = recentBadges.map(b => `
            <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xl shadow-sm border border-yellow-200 dark:border-yellow-700/50 transition-transform hover:scale-110 cursor-help" title="${b.name}: ${b.desc}">
                ${b.icon}
            </div>
        `).join('');
    }
}

function setupNameEditSystem(game) {
    const nameModal = new ModalHandler('name-edit-modal');
    const editBtn = document.getElementById('edit-name-btn');
    const saveBtn = document.getElementById('save-name-btn');
    const nameInput = document.getElementById('new-display-name');
    const currentXpEl = document.getElementById('name-change-current-xp');
    const NAME_CHANGE_COST = 50;

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (nameInput) nameInput.value = game.state.displayName || '';
            if (currentXpEl) currentXpEl.textContent = game.state.xp.toLocaleString();

            // Disable save button if not enough XP
            if (saveBtn) {
                if (game.state.xp < NAME_CHANGE_COST) {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = `<span>ต้องการ ${NAME_CHANGE_COST} XP</span>`;
                    saveBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
                    saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                } else {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<span>บันทึก (ใช้ ${NAME_CHANGE_COST} XP)</span>`;
                    saveBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
                    saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                }
            }

            nameModal.open();
            // Focus input after modal opens
            setTimeout(() => nameInput?.focus(), 100);
        });
    }

    if (saveBtn && nameInput) {
        const saveName = () => {
            if (game.state.xp < NAME_CHANGE_COST) {
                showToast('XP ไม่พอ', `คุณต้องการ ${NAME_CHANGE_COST} XP เพื่อเปลี่ยนชื่อ`, '⚠️', 'error');
                return;
            }

            const newName = nameInput.value.trim();
            if (newName) {
                game.state.xp -= NAME_CHANGE_COST;
                game.setDisplayName(newName);
                renderUserInfo(game);
                nameModal.close();
                showToast('บันทึกสำเร็จ', `เปลี่ยนชื่อเรียบร้อยแล้ว (-${NAME_CHANGE_COST} XP)`, '✏️');
            } else {
                showToast('ข้อผิดพลาด', 'กรุณาระบุชื่อ', '⚠️', 'error');
            }
        };

        saveBtn.addEventListener('click', saveName);
        
        // Allow Enter key to save
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveName();
        });
    }
}

function setupResetSystem(game) {
    const resetBtn = document.getElementById('reset-gamification-btn');
    if (!resetBtn) return;

    // Reuse the common confirmation modal
    const confirmModal = new ModalHandler('confirm-action-modal');
    const confirmBtn = document.getElementById('confirm-action-btn');
    const titleEl = document.getElementById('confirm-modal-title');
    const descEl = document.getElementById('confirm-modal-description');

    resetBtn.addEventListener('click', () => {
        if (titleEl) titleEl.textContent = 'รีเซ็ตข้อมูลความคืบหน้า?';
        if (descEl) descEl.innerHTML = 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลเลเวล, XP, และเหรียญรางวัลทั้งหมด? <br><strong class="text-red-600 dark:text-red-500">การกระทำนี้ไม่สามารถย้อนกลับได้</strong>';
        
        // Clone button to remove old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            game.resetProgress();
            confirmModal.close();
            window.location.reload(); // Reload to reflect changes
        });
        
        confirmModal.open();
    });
}

function setupRefreshChartsSystem(game) {
    const refreshBtn = document.getElementById('refresh-charts-btn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', async () => {
        // Add rotation animation class
        const icon = refreshBtn.querySelector('svg');
        if (icon) icon.classList.add('animate-spin');

        // Show loaders
        document.getElementById('radar-chart-loader')?.classList.remove('hidden');
        document.getElementById('history-chart-loader')?.classList.remove('hidden');
        document.getElementById('strengths-weaknesses-loader')?.classList.remove('hidden');

        const [r1, r2, r3] = await Promise.all([
            renderRadarChart(game),
            renderProficiencyHistoryChart(game),
            renderStrengthsWeaknesses()
        ]);

        if (r1 && r2 && r3) {
            refreshBtn.classList.add('hidden');
        }

        // Remove animation
        if (icon) icon.classList.remove('animate-spin');
        
        showToast('อัปเดตข้อมูล', 'โหลดข้อมูลกราฟล่าสุดเรียบร้อยแล้ว', '🔄');
    });
}

function setupManualSync(game) {
    const btn = document.getElementById('manual-sync-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const icon = btn.querySelector('svg');
        if (icon) icon.classList.add('animate-spin');
        
        // Disable button
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');

        try {
            const success = await game.forceCloudSync();
            if (success) {
                lastSyncTime = new Date();
                renderSyncStatus(game);
                showToast('ซิงค์ข้อมูลสำเร็จ', 'ข้อมูลล่าสุดถูกโหลดเรียบร้อยแล้ว', '☁️');
            } else {
                if (!game.authManager.currentUser) {
                     showToast('ไม่ได้เข้าสู่ระบบ', 'ระบบบันทึกข้อมูลในเครื่อง (Local) เท่านั้น', '💻');
                } else {
                     showToast('ซิงค์ไม่สำเร็จ', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', '⚠️', 'error');
                }
            }
        } catch (e) {
            console.error(e);
            showToast('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการซิงค์', '❌', 'error');
        } finally {
            if (icon) icon.classList.remove('animate-spin');
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

function setupLeaderboardSystem(game) {
    const listContainer = document.getElementById('leaderboard-list');
    const tabs = document.querySelectorAll('.leaderboard-tab');
    
    if (!listContainer || tabs.length === 0) return;

    const renderList = async (type) => {
        // Show loading
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-40 text-gray-500">
                <svg class="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>กำลังโหลดอันดับ...</span>
            </div>
        `;

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy(type, 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            
            const leaderboard = [];
            querySnapshot.forEach((doc) => {
                leaderboard.push({ id: doc.id, ...doc.data() });
            });

            if (leaderboard.length === 0) {
                listContainer.innerHTML = `<div class="text-center py-8 text-gray-500">ยังไม่มีข้อมูลการจัดอันดับ</div>`;
                return;
            }

            const currentUser = game.authManager?.currentUser;
            const currentUserId = currentUser ? currentUser.uid : null;

            // Check if user is in top 10
            const userInTop10 = leaderboard.some(u => u.id === currentUserId);
            let userRankData = null;

            // If user not in top 10 and logged in, fetch their rank
            if (!userInTop10 && currentUserId) {
                try {
                    const userScore = game.state[type] || 0;
                    // Count users with higher score
                    const rankQuery = query(usersRef, where(type, '>', userScore));
                    const snapshot = await getCountFromServer(rankQuery);
                    const rank = snapshot.data().count + 1;

                    userRankData = {
                        rank: rank,
                        id: currentUserId,
                        displayName: game.state.displayName,
                        avatar: game.state.avatar,
                        selectedTitle: game.state.selectedTitle,
                        score: userScore,
                        isMe: true
                    };
                } catch (err) {
                    console.warn("Failed to fetch user rank:", err);
                }
            }

            const renderRow = (user, rank, isMe) => {
                
                let rankDisplay = `<span class="font-bold text-gray-500 w-6 text-center text-sm sm:text-base">${rank}</span>`;
                if (rank === 1) rankDisplay = `<span class="text-xl sm:text-2xl">🥇</span>`;
                if (rank === 2) rankDisplay = `<span class="text-xl sm:text-2xl">🥈</span>`;
                if (rank === 3) rankDisplay = `<span class="text-xl sm:text-2xl">🥉</span>`;

                const avatar = user.avatar || '🧑‍🎓';
                const isImage = avatar.includes('/') || avatar.includes('.');
                const avatarHtml = isImage 
                    ? `<img src="${avatar}" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200">`
                    : `<span class="text-2xl sm:text-3xl">${avatar}</span>`;

                const score = isMe && user.score !== undefined ? user.score : (user[type] || 0);
                const scoreFormatted = score.toLocaleString();
                const rankTitle = getTitleFromXP(score, type);

                return `
                    <div class="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg ${isMe ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md hover:scale-[1.02] z-10 relative' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'} transition-all duration-200">
                        <div class="flex items-center justify-center w-6 sm:w-8 flex-shrink-0">
                            ${rankDisplay}
                        </div>
                        <div class="flex-shrink-0">
                            ${avatarHtml}
                        </div>
                        <div class="flex-grow min-w-0 flex flex-col justify-center">
                            <div class="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">
                                ${user.displayName || 'ผู้เรียน'} ${isMe ? '<span class="text-xs text-blue-600 dark:text-blue-400 ml-1">(คุณ)</span>' : ''}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
                                <span class="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">${rankTitle}</span>
                                ${user.selectedTitle ? `<span class="hidden sm:inline text-gray-300 dark:text-gray-600">•</span> <span class="truncate max-w-[100px] sm:max-w-none">《 ${user.selectedTitle} 》</span>` : ''}
                            </div>
                        </div>
                        <div class="flex-shrink-0 text-right">
                            <div class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                                ${scoreFormatted}
                            </div>
                            <div class="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">XP</div>
                        </div>
                    </div>
                `;
            };

            let listHtml = leaderboard.map((user, index) => renderRow(user, index + 1, user.id === currentUserId)).join('');

            if (userRankData) {
                listHtml += `
                    <div class="flex items-center justify-center py-1 opacity-50">
                        <div class="h-1 w-1 bg-gray-400 rounded-full mx-0.5"></div>
                        <div class="h-1 w-1 bg-gray-400 rounded-full mx-0.5"></div>
                        <div class="h-1 w-1 bg-gray-400 rounded-full mx-0.5"></div>
                    </div>
                    ${renderRow(userRankData, userRankData.rank, true)}
                `;
            }

            listContainer.innerHTML = listHtml;

        } catch (error) {
            console.error("Leaderboard error:", error);
            listContainer.innerHTML = `<div class="text-center py-8 text-red-500 text-sm">ไม่สามารถโหลดข้อมูลได้<br>(ต้องเชื่อมต่ออินเทอร์เน็ต)</div>`;
        }
    };

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.className = "leaderboard-tab flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200");
            tab.className = "leaderboard-tab flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300";
            renderList(tab.dataset.type);
        });
    });

    // Initial load
    renderList('xp');
}

function setupCollapsibleSections() {
    const headers = document.querySelectorAll('.collapsible-header');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');

    // Function to toggle a single section
    const toggleSection = (header, forceExpand = null) => {
        const targetId = header.dataset.target;
        const content = document.getElementById(targetId); // This is the outer container
        const icon = header.querySelector('.chevron-icon');
        
        if (!content || !icon) return;

        // Check current state (if max-height is 0, it's collapsed)
        const isCollapsed = content.style.maxHeight === '0px';
        const shouldExpand = forceExpand !== null ? forceExpand : isCollapsed;

        if (shouldExpand) {
            // Expand
            // content.classList.remove('hidden'); // No longer using hidden class for animation
            content.style.maxHeight = content.scrollHeight + "px";
            content.style.opacity = "1";
            icon.classList.remove('-rotate-90'); // Point down
        } else {
            // Collapse
            // content.style.maxHeight = content.scrollHeight + "px"; // No longer needed if max-height is not initially 0
            // Force reflow - might not be needed depending on initial state
            content.offsetHeight; 
            content.style.maxHeight = "0px";
            content.style.opacity = "0";
            icon.classList.add('-rotate-90'); // Point right
        }
    };

    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            // Prevent triggering if clicking on interactive elements inside header
            if (e.target.closest('button') || e.target.closest('a')) return;
            toggleSection(header);
        });
    });

    // Global controls
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
            headers.forEach(header => toggleSection(header, true));
        });
    }

    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
            headers.forEach(header => toggleSection(header, false));
        });
    }
}

function setupAvatarSystem(game) {
    const avatarModal = new ModalHandler('avatar-modal');
    const editBtn = document.getElementById('edit-avatar-btn');
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const grid = document.getElementById('avatar-grid');

    const openAvatarModal = () => {
        if (grid) renderAvatarGrid(game, grid);
        avatarModal.open();
    };

    // Open modal handlers
    if (editBtn) editBtn.addEventListener('click', openAvatarModal);
    if (avatarDisplay) avatarDisplay.addEventListener('click', openAvatarModal);

    // Render avatar grid
    if (grid) {
        renderAvatarGrid(game, grid);

        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.avatar-option');
            if (btn) {
                const newAvatar = btn.dataset.avatar;
                
                game.setAvatar(newAvatar);
                renderUserInfo(game); // Update UI immediately

                // Play success sound
                const audio = new Audio('./assets/audio/correct.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {}); // Ignore potential auto-play errors

                avatarModal.close();
                showToast('บันทึกสำเร็จ', 'เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว', '😎');
                
                // Update selection highlight visually
                grid.querySelectorAll('.avatar-option').forEach(b => {
                    b.classList.remove('bg-blue-100', 'dark:bg-blue-900/50', 'ring-2', 'ring-blue-500');
                });
                btn.classList.add('bg-blue-100', 'dark:bg-blue-900/50', 'ring-2', 'ring-blue-500');
            }
        });
    }
}

function renderAvatarGrid(game, grid) {
    // Combine default avatars with purchased ones
    const inventory = game.getInventory ? (game.getInventory() || []) : [];
    const purchasedAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && inventory.includes(i.id)).map(i => i.value);
    const allAvatars = [...AVATARS, ...purchasedAvatars];
    const uniqueAvatars = [...new Set(allAvatars)];

    grid.innerHTML = uniqueAvatars.map(avatar => {
        const isImage = avatar.includes('/') || avatar.includes('.');
        const content = isImage 
            ? `<img src="${avatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover mx-auto">` 
            : avatar;

        // Determine frame class based on price
        const shopItem = SHOP_ITEMS.find(i => i.value === avatar && i.type === 'avatar');
        const isSelected = game.state.avatar === avatar;
        const frameClass = getAvatarFrameClass(avatar);

        let classes = `avatar-option text-3xl p-2 rounded-full transition-all relative group ${frameClass}`;

        if (isSelected) {
            classes += " bg-blue-100 dark:bg-blue-900/50 scale-110 z-10";
        } else {
            classes += " hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700";
        }

        return `
        <button class="${classes}" data-avatar="${avatar}" title="${shopItem ? shopItem.name : ''}">
            ${content}
        </button>
    `}).join('');
}

function setupTitleSystem(game) {
    const titleModal = new ModalHandler('title-modal');
    const editBtn = document.getElementById('edit-title-btn');
    const grid = document.getElementById('title-grid');

    if (editBtn) editBtn.addEventListener('click', () => {
        renderTitleGrid(game, grid, titleModal);
        titleModal.open();
    });
}

function renderTitleGrid(game, grid, modal) {
    if (!grid) return;
    const unlockedIds = game.state.unlockedAchievements || [];
    const unlockedTitles = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id) && a.rewardTitle).map(a => a.rewardTitle);

    // Add purchased titles
    const inventory = game.getInventory();
    const purchasedTitles = SHOP_ITEMS.filter(i => i.type === 'title' && inventory.includes(i.id)).map(i => i.value);
    
    const allTitles = [...new Set([...unlockedTitles, ...purchasedTitles])];

    // Add "No Title" option
    let html = `
        <button class="title-option w-full text-left p-3 rounded-lg border transition-colors ${!game.state.selectedTitle ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}" data-title="">
            <span class="font-bold text-gray-600 dark:text-gray-400">ไม่ใส่ฉายา</span>
        </button>
    `;

    allTitles.forEach(title => {
        const isSelected = game.state.selectedTitle === title;
        const activeClass = isSelected ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
        html += `
            <button class="title-option w-full text-left p-3 rounded-lg border transition-colors ${activeClass}" data-title="${title}">
                <span class="font-bold text-gray-800 dark:text-gray-200">《 ${title} 》</span>
            </button>
        `;
    });

    if (allTitles.length === 0) {
        html += `<p class="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">ปลดล็อกความสำเร็จเพื่อรับฉายาใหม่!</p>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.title-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.dataset.title;
            game.equipTitle(title || null);
            renderUserInfo(game);
            modal.close();
            showToast('บันทึกสำเร็จ', title ? `เลือกฉายา "${title}" แล้ว` : 'ลบฉายาแล้ว', '🏷️');
        });
    });
}

function setupThemeSystem(game) {
    const themeModal = new ModalHandler('theme-modal');
    const editBtn = document.getElementById('edit-theme-btn');
    const grid = document.getElementById('theme-grid');

    if (editBtn) editBtn.addEventListener('click', () => {
        renderThemeGrid(game, grid, themeModal);
        themeModal.open();
    });
}

function renderThemeGrid(game, grid, modal) {
    if (!grid) return;
    const inventory = game.getInventory();
    const purchasedThemes = SHOP_ITEMS.filter(i => i.type === 'theme' && inventory.includes(i.id));
    
    let html = `
        <button class="theme-option w-full text-left p-3 rounded-lg border transition-colors ${!game.state.selectedTheme ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}" data-theme="">
            <span class="font-bold text-gray-800 dark:text-gray-200">🎨 ค่าเริ่มต้น (Default)</span>
        </button>
    `;

    purchasedThemes.forEach(item => {
        const isSelected = game.state.selectedTheme === item.value;
        const activeClass = isSelected ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
        html += `
            <button class="theme-option w-full text-left p-3 rounded-lg border transition-colors ${activeClass}" data-theme="${item.value}">
                <span class="font-bold text-gray-800 dark:text-gray-200">${item.icon} ${item.name}</span>
            </button>
        `;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            game.equipTheme(theme || null);
            renderUserInfo(game);
            modal.close();
            showToast('บันทึกสำเร็จ', 'เปลี่ยนธีมเรียบร้อยแล้ว', '🎨');
        });
    });
}

function setupShopSystem(game) {
    const shopModal = new ModalHandler('shop-details-modal');
    const container = document.getElementById('shop-items-grid');
    const buyBtn = document.getElementById('shop-modal-buy-btn');
    
    // Elements in modal to update
    const iconEl = document.getElementById('shop-modal-icon');
    const titleEl = document.getElementById('shop-modal-title');
    const typeEl = document.getElementById('shop-modal-type');
    const descEl = document.getElementById('shop-modal-desc');
    const statusEl = document.getElementById('shop-modal-status');

    let currentItemId = null;

    if (container) {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.shop-item-card');
            if (card) {
                const itemId = card.dataset.id;
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (item) {
                    currentItemId = itemId;
                    
                    // Populate Modal
                    if (iconEl) iconEl.textContent = item.icon;
                    if (titleEl) titleEl.textContent = item.name;
                    if (typeEl) typeEl.textContent = item.type === 'avatar' ? 'Avatar' : (item.type === 'theme' ? 'Theme' : 'Title');
                    if (descEl) descEl.textContent = item.desc;
                    
                    const inventory = game.getInventory();
                    const isOwned = inventory.includes(item.id);
                    const canBuy = game.state.xp >= item.cost;
                    const isConsumable = item.type === 'consumable';
                    const quantity = isConsumable ? game.getItemCount(item.id) : 0;

                    if (isOwned && !isConsumable) {
                        buyBtn.disabled = true;
                        buyBtn.className = 'w-full py-3 rounded-xl text-white font-bold text-lg shadow-md bg-gray-400 cursor-not-allowed';
                        buyBtn.innerHTML = '<span>เป็นเจ้าของแล้ว</span>';
                        statusEl.textContent = 'คุณมีสินค้านี้แล้ว';
                        statusEl.className = 'mt-2 text-sm font-medium text-green-600 dark:text-green-400';
                        statusEl.classList.remove('hidden');
                    } else if (!canBuy) {
                        buyBtn.disabled = true;
                        buyBtn.className = 'w-full py-3 rounded-xl text-white font-bold text-lg shadow-md bg-gray-400 cursor-not-allowed';
                        buyBtn.innerHTML = `<span>XP ไม่พอ (${item.cost} XP)</span>`;
                        statusEl.textContent = `ต้องการอีก ${item.cost - game.state.xp} XP`;
                        statusEl.className = 'mt-2 text-sm font-medium text-red-500';
                        statusEl.classList.remove('hidden');
                    } else {
                        buyBtn.disabled = false;
                        buyBtn.className = 'w-full py-3 rounded-xl text-white font-bold text-lg shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700';
                        buyBtn.innerHTML = `<span>ยืนยันการแลก</span> <span class="bg-white/20 px-2 py-0.5 rounded text-sm">${item.cost} XP</span>`;
                        
                        if (isConsumable) {
                            statusEl.textContent = `คุณมีอยู่แล้ว: ${quantity} ชิ้น`;
                            statusEl.className = 'mt-2 text-sm font-medium text-blue-600 dark:text-blue-400';
                            statusEl.classList.remove('hidden');
                        } else {
                            statusEl.classList.add('hidden');
                        }
                    }

                    shopModal.open();
                }
            }
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            if (!currentItemId) return;
            
            const result = game.buyItem(currentItemId);
            if (result.success) {
                showToast('ซื้อสำเร็จ', result.message, '🛒');

                const audio = new Audio('./assets/audio/badge-unlock.mp3');
                audio.volume = 0.7;
                audio.play().catch(() => {});

                renderUserInfo(game);
                renderShop(game); // Re-render grid to update status
                shopModal.close();
            } else {
                showToast('ซื้อไม่สำเร็จ', result.message, '❌', 'error');
            }
        });
    }
}

function renderShop(game) {
    const container = document.getElementById('shop-items-grid');
    if (!container) return;
    
    // Change layout to vertical stack for categories
    container.className = 'space-y-8';

    const inventory = game.getInventory();

    const categories = [
        { type: 'consumable', label: 'ไอเทมตัวช่วย (Consumables)', icon: '⚡' },
        { type: 'avatar', label: 'อวตาร (Avatars)', icon: '👤' },
        { type: 'theme', label: 'ธีม (Themes)', icon: '🎨' },
        { type: 'title', label: 'ฉายา (Titles)', icon: '🏷️' }
    ];

    container.innerHTML = categories.map(cat => {
        const items = SHOP_ITEMS.filter(item => item.type === cat.type);
        if (items.length === 0) return '';

        const itemsHtml = items.map(item => {
            const isOwned = inventory.includes(item.id);
            const canBuy = game.state.xp >= item.cost;
            const isConsumable = item.type === 'consumable';
            const quantity = isConsumable ? game.getItemCount(item.id) : 0;

            let statusClass = '';
            let statusText = `${item.cost} XP`;

            const quantityBadge = isConsumable
                ? `<div class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800 shadow-md">${quantity}</div>`
                : '';

            if (isOwned && !isConsumable) {
                statusClass = 'text-green-600 dark:text-green-400';
                statusText = '✓ เป็นเจ้าของแล้ว';
            } else if (isConsumable && quantity > 0) {
                statusClass = 'text-blue-600 dark:text-blue-400';
                // The quantity is now shown in a badge, so we just show the cost here.
                statusText = `${item.cost} XP`;
            } else if (!canBuy) {
                statusClass = 'text-red-500';
            } else {
                statusClass = 'text-blue-600 dark:text-blue-400';
            }

        return `
            <div class="shop-item-card relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transition-all hover:shadow-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 group" data-id="${item.id}">
                ${quantityBadge}
                <div class="text-4xl mb-2 lg:mb-3 transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 group-hover:drop-shadow-md">${item.icon}</div>
                <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1 text-sm hidden lg:block w-full truncate px-1">${item.name}</h4>
                <p class="text-xs font-bold ${statusClass}">${statusText}</p>
            </div>
        `;
        }).join('');

        // Accordion Structure
        return `
            <div class="shop-category border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button class="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shop-category-header" data-target="shop-cat-${cat.type}">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">${cat.icon}</span>
                        <span class="font-bold text-gray-700 dark:text-gray-300">${cat.label}</span>
                    </div>
                    <svg class="w-5 h-5 transform transition-transform duration-200 chevron-icon text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div id="shop-cat-${cat.type}" class="collapsible-content" style="max-height: 2000px; opacity: 1;">
                    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupShopAccordion(game) {
    const container = document.getElementById('shop-items-grid');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const header = e.target.closest('.shop-category-header');
        if (!header) return;

        const targetId = header.dataset.target;
        const content = document.getElementById(targetId);
        const icon = header.querySelector('.chevron-icon');

        if (content && icon) {
            // Check if currently collapsed (maxHeight is 0 or close to it)
            const isCollapsed = content.style.maxHeight === '0px';
            
            if (isCollapsed) {
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.opacity = "1";
                icon.classList.remove('-rotate-90');
            } else {
                content.style.maxHeight = "0px";
                content.style.opacity = "0";
                icon.classList.add('-rotate-90');
            }
        }
    });
}

function renderTrackProgress(game) {
    const container = document.getElementById('track-progress-container');
    const physics = game.getPhysicsLevel();
    const earth = game.getEarthLevel();

    const createTrackHTML = (name, data, colorClass, icon) => `
        <div>
            <div class="flex justify-between items-end mb-1">
                <span class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    ${icon} ${name} <span class="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Lv.${data.level}</span>
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${data.currentXP} XP</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                <div class="${colorClass} h-4 rounded-full transition-all duration-1000 relative" style="width: ${data.progressPercent}%">
                    <div class="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </div>
            </div>
            <p class="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">${data.title}</p>
        </div>
    `;

    container.innerHTML = 
        createTrackHTML('Physics Track', physics, 'bg-purple-500', '⚛️') +
        createTrackHTML('Earth Science Track', earth, 'bg-teal-500', '🌍');
}

function renderBadges(game) {
    const container = document.getElementById('profile-badges-grid');
    const earnedBadgeIds = game.state.badges;

    container.innerHTML = BADGES.map(badge => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        const opacityClass = isEarned ? 'opacity-100' : 'opacity-40 grayscale';
        const borderClass = isEarned 
            ? (badge.tier === 'gold' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                : badge.tier === 'silver' ? 'border-gray-400 bg-gray-50 dark:bg-gray-800' 
                : 'border-orange-400 bg-orange-50 dark:bg-orange-900/20')
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800';

        return `
            <div class="flex flex-col items-center p-3 rounded-xl border-2 ${borderClass} ${opacityClass} transition-all duration-300 hover:scale-105 relative group">
                <div class="text-3xl mb-2">${badge.icon}</div>
                <div class="text-xs font-bold text-center truncate w-full hidden lg:block">${badge.name}</div>
                ${!isEarned ? '<div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold text-gray-500 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">Locked</span></div>' : ''}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-2 hidden group-hover:block w-32 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20 text-center pointer-events-none">
                    ${badge.desc}
                </div>
            </div>
        `;
    }).join('');
}

function renderAchievements(game) {
    const container = document.getElementById('profile-achievements-list');
    if (!container) return;

    const unlockedIds = game.state.unlockedAchievements || [];

    container.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlockedIds.includes(ach.id);
        const containerClass = isUnlocked 
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 opacity-100' 
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 grayscale';
        
        const titleClass = isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500';
        const descClass = isUnlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600';

        // Calculate Progress
        let currentProgress = 0;
        if (ach.type === 'level') {
            currentProgress = game.getCurrentLevel().level;
        } else if (ach.type === 'total_correct') {
            currentProgress = game.state.totalCorrectAnswers || 0;
        } else if (ach.type === 'total_quizzes') {
            currentProgress = game.state.quizzesCompleted || 0;
        }

        const percent = Math.min(100, Math.max(0, (currentProgress / ach.target) * 100));
        const displayProgress = Math.min(currentProgress, ach.target);
        const barColor = isUnlocked ? 'bg-green-500' : 'bg-blue-500';

        return `
            <div class="p-3 rounded-lg border ${containerClass} transition-all">
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-2xl flex-shrink-0">${ach.icon}</div>
                    <div class="flex-grow min-w-0">
                        <h4 class="text-sm font-bold ${titleClass} truncate">${ach.title}</h4>
                        <p class="text-xs ${descClass} truncate">${ach.desc}</p>
                    </div>
                    ${isUnlocked ? '<span class="text-green-500 text-lg">✓</span>' : '<span class="text-xs text-gray-400">Locked</span>'}
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div class="${barColor} h-1.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                </div>
                <div class="text-[10px] text-right mt-1 ${descClass}">${displayProgress} / ${ach.target}</div>
            </div>
        `;
    }).join('');
}

function renderQuestHistory(game) {
    const container = document.getElementById('profile-quest-history');
    if (!container) return;

    const history = game.state.questHistory || [];

    if (history.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 text-sm py-4">ยังไม่มีประวัติการทำภารกิจ</p>`;
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700">
            <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${item.desc}</span>
                <span class="text-[10px] text-gray-400">${item.date}</span>
            </div>
            <span class="text-xs font-bold text-green-600 dark:text-green-400">+${item.xp} XP</span>
        </div>
    `).join('');
}

async function renderRadarChart(game) {
    const ctx = document.getElementById('skills-radar-chart')?.getContext('2d');
    const loader = document.getElementById('radar-chart-loader');
    if (!ctx) {
        if (loader) loader.classList.add('hidden');
        return false;
    }
    const chartContainer = ctx.canvas.parentElement;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js is not loaded. Skipping radar chart rendering.");
        if (loader) loader.classList.add('hidden');
        return false;
    }

    try {
        // 1. Fetch and Aggregate Data
        const allProgress = await getDetailedProgressForAllQuizzes();
    
        // Initialize stats based on new groups
        const stats = {};
        Object.keys(PROFICIENCY_GROUPS).forEach(key => {
            stats[key] = { correct: 0, total: 0, quizzes: new Set() };
        });
        stats['General'] = { correct: 0, total: 0, quizzes: new Set() }; // Fallback
    
        allProgress.forEach(quiz => {
            if (!quiz.userAnswers) return;

            quiz.userAnswers.forEach(ans => { 
                if (ans) {
                    // Determine sub-category string
                    let subCatStr = '';
                    if (ans.subCategory) {
                        if (typeof ans.subCategory === 'string') subCatStr = ans.subCategory;
                        else if (ans.subCategory.main) subCatStr = ans.subCategory.main;
                    }
                    
                    // Find matching group
                    let matchedGroup = 'General';
                    const matches = (text, keywords) => keywords.some(k => text.includes(k));

                    for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                        if (matches(subCatStr, groupDef.keywords)) {
                            matchedGroup = groupKey;
                            break;
                        }
                    }

                    stats[matchedGroup].total++;
                    if (ans.isCorrect) stats[matchedGroup].correct++;
                    stats[matchedGroup].quizzes.add(quiz);
                }
            });
        });

        // 2. Calculate Percentages 
        const labels = Object.values(PROFICIENCY_GROUPS).map(g => g.label);
        const dataPoints = Object.keys(PROFICIENCY_GROUPS).map(key => {
            const s = stats[key];
            return s.total > 0 ? (s.correct / s.total) * 100 : 0;
        });
        
        // 3. Render Chart 
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#e5e7eb' : '#374151';

        const currentTheme = game?.state?.selectedTheme;
        const themeColors = THEME_COLORS[currentTheme] || THEME_COLORS['default'];

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        new Chart(ctx, { 
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ความถนัดของคุณ',
                    data: dataPoints,
                    fill: true,
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    pointBackgroundColor: themeColors.point,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: themeColors.border
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: {
                            color: textColor,
                            font: { family: "'Kanit', sans-serif", size: 11 }
                        },
                        ticks: {
                            display: false, // Hide scale numbers for cleaner look
                            backdropColor: 'transparent'
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const key = Object.keys(PROFICIENCY_GROUPS)[context.dataIndex];
                                const s = stats[key];
                                return `${context.label}: ${context.raw.toFixed(1)}% (${s.correct}/${s.total} ข้อ)`;
                            }
                        }
                    }
                }
            }
        });
        return true;    
    } catch (error) {
        console.error("Failed to render radar chart:", error);
        if (chartContainer) {
            chartContainer.innerHTML = `<p class="text-center text-sm text-red-500">ไม่สามารถโหลดข้อมูลสำหรับแผนภูมิได้</p>`;
        }
        return false;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

function animateValue(obj, start, end, duration) {
    if (!obj) return;
    if (obj.animationId) cancelAnimationFrame(obj.animationId);
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // Ease out quart
        const value = Math.floor(ease * (end - start) + start);
        obj.textContent = value.toLocaleString();
        if (progress < 1) {
            obj.animationId = window.requestAnimationFrame(step);
        } else {
            obj.textContent = end.toLocaleString();
            obj.animationId = null;
        }
    };
    obj.animationId = window.requestAnimationFrame(step);
}

function showProficiencyDetails(label, data) {
    const modal = new ModalHandler('proficiency-modal');
    const titleEl = document.getElementById('proficiency-modal-title');
    const contentEl = document.getElementById('proficiency-modal-content');
    
    if (titleEl) titleEl.textContent = `รายการข้อสอบ: ${label}`;
    
    if (contentEl) {
        if (data.quizzes.size === 0) {
            contentEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">ยังไม่มีประวัติการทำข้อสอบในหมวดหมู่นี้</p>';
        } else {
            const quizzes = Array.from(data.quizzes).sort((a, b) => (b.lastAttemptTimestamp || 0) - (a.lastAttemptTimestamp || 0));
            contentEl.innerHTML = quizzes.map(quiz => {
                // Calculate score for this specific quiz
                const score = quiz.score || 0;
                const total = quiz.shuffledQuestions ? quiz.shuffledQuestions.length : (quiz.amount || 0);
                const percent = total > 0 ? Math.round((score / total) * 100) : 0;
                const date = quiz.lastAttemptTimestamp ? new Date(quiz.lastAttemptTimestamp).toLocaleDateString('th-TH') : 'ไม่ระบุ';
                
                // Determine URL
                let quizUrl = quiz.url;
                if (!quizUrl && (quiz.id || quiz.customId)) {
                    quizUrl = `./quiz/index.html?id=${quiz.id || quiz.customId}`;
                }

                let scoreClass = 'text-red-500';
                if (percent >= 80) scoreClass = 'text-green-500';
                else if (percent >= 50) scoreClass = 'text-yellow-500';

                return `
                    <a href="${quizUrl || '#'}" class="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">${quiz.title}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${date}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-xs text-gray-500 dark:text-gray-400">${quiz.category || 'ทั่วไป'}</span>
                            <span class="text-sm font-bold ${scoreClass}">${score}/${total} (${percent}%)</span>
                        </div>
                    </a>
                `;
            }).join('');
        }
    }
    
    modal.open();
}

async function renderProficiencyHistoryChart(game) {
    const ctx = document.getElementById('proficiency-history-chart')?.getContext('2d');
    const loader = document.getElementById('history-chart-loader');
    if (!ctx) {
        if (loader) loader.classList.add('hidden');
        return false;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js is not loaded. Skipping history chart rendering.");
        if (loader) loader.classList.add('hidden');
        return false;
    }

    try {
        const allProgress = await getDetailedProgressForAllQuizzes();
        
        // Prepare data structure: { 'Mechanics': [{date, score}, ...], ... }
        const historyData = {};
        Object.keys(PROFICIENCY_GROUPS).forEach(key => {
            historyData[key] = [];
        });

        // Process all quizzes
        allProgress.forEach(quiz => {
            if (!quiz.userAnswers || !quiz.lastAttemptTimestamp) return;

            // Determine which group this quiz belongs to
            // We use the first answer's subcategory or quiz category to match keywords
            let matchedGroup = null;
            const firstAnswer = quiz.userAnswers.find(a => a);
            
            let searchString = quiz.category || '';
            if (firstAnswer && firstAnswer.subCategory) {
                if (typeof firstAnswer.subCategory === 'string') searchString += ' ' + firstAnswer.subCategory;
                else if (firstAnswer.subCategory.main) searchString += ' ' + firstAnswer.subCategory.main;
            }

            const matches = (text, keywords) => keywords.some(k => text.includes(k));

            for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                if (matches(searchString, groupDef.keywords)) {
                    matchedGroup = groupKey;
                    break;
                }
            }

            if (matchedGroup) {
                const score = quiz.score || 0;
                const total = quiz.shuffledQuestions ? quiz.shuffledQuestions.length : (quiz.amount || 0);
                const percentage = total > 0 ? (score / total) * 100 : 0;
                
                historyData[matchedGroup].push({
                    x: new Date(quiz.lastAttemptTimestamp),
                    y: percentage,
                    title: quiz.title
                });
            }
        });

        // Sort data by date
        Object.keys(historyData).forEach(key => {
            historyData[key].sort((a, b) => a.x - b.x);
        });

        // Create Datasets
        const datasets = Object.keys(PROFICIENCY_GROUPS).map((key, index) => {
            const group = PROFICIENCY_GROUPS[key];
            const data = historyData[key];
            
            // Generate a color for this line (using HSL for distinct colors)
            const hue = (index * 360 / Object.keys(PROFICIENCY_GROUPS).length) % 360;
            const color = `hsla(${hue}, 70%, 50%, 1)`;
            const bg = `hsla(${hue}, 70%, 50%, 0.1)`;

            return {
                label: group.label,
                data: data,
                borderColor: color,
                backgroundColor: bg,
                borderWidth: 2,
                tension: 0.3, // Smooth lines
                pointRadius: 3,
                pointHoverRadius: 5,
                hidden: data.length === 0 // Hide empty datasets by default
            };
        }).filter(ds => ds.data.length > 0); // Only show groups with data

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // Destroy existing chart if it exists to prevent canvas reuse errors
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: { day: 'd MMM' },
                            tooltipFormat: 'd MMM yyyy HH:mm'
                        },
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: { color: textColor, callback: v => v + '%' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: textColor, font: { family: "'Kanit', sans-serif" } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.y.toFixed(1)}% (${ctx.raw.title})`
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        return true;
    } catch (error) {
        console.error("Failed to render history chart:", error);
        return false;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

async function renderStrengthsWeaknesses() {
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');
    const loader = document.getElementById('strengths-weaknesses-loader');

    if (!strengthsList || !weaknessesList) {
        if (loader) loader.classList.add('hidden');
        return false;
    }

    try {
        const { strengths, weaknesses } = await calculateStrengthsAndWeaknesses();

        if (strengths.length > 0) {
            strengthsList.innerHTML = strengths.map(s => `
                <li class="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800/30 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title="${s.name}">${s.name}</span>
                    <span class="text-xs font-bold text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">${s.percentage.toFixed(0)}%</span>
                </li>
            `).join('');
        } else {
            strengthsList.innerHTML = `<li class="text-sm text-gray-500 dark:text-gray-400 italic">ยังไม่มีข้อมูลเพียงพอ</li>`;
        }

        if (weaknesses.length > 0) { 
            weaknessesList.innerHTML = weaknesses.map(w => `
                <li class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-800/30 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title="${w.name}">${w.name}</span>
                    <span class="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">${w.percentage.toFixed(0)}%</span>
                </li>
            `).join('');
        } else {
            weaknessesList.innerHTML = `<li class="text-sm text-gray-500 dark:text-gray-400 italic">ยังไม่มีข้อมูลเพียงพอ</li>`;
        }
        return true;
    } catch (error) {
        console.error("Failed to render strengths and weaknesses:", error);
        if (strengthsList) strengthsList.innerHTML = `<li class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</li>`;
        if (weaknessesList) weaknessesList.innerHTML = `<li class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</li>`;
        return false;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}