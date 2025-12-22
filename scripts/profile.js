import { Gamification, BADGES, ACHIEVEMENTS, SHOP_ITEMS, XP_THRESHOLDS, TRACK_TITLES, PROFICIENCY_GROUPS } from './gamification.js';
import { getDetailedProgressForAllQuizzes, calculateStrengthsAndWeaknesses } from './data-manager.js';
import { renderDailyQuests } from './daily-quests-renderer.js';
import { ModalHandler } from './modal-handler.js';
import { showToast } from './toast.js';
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from './firebase-config.js';

const AVATARS = [
    '🧑‍🎓', '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '👨‍🚀', '👩‍🚀', '👽', '🤖'
];

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
    setupShopShortcut();
    setupBadgeInteractions(game);

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

    // Update email
    const emailEl = document.getElementById('profile-email-display');
    if (emailEl) {
        const user = game.authManager.currentUser;
        if (user && user.email) {
            emailEl.textContent = user.email;
            emailEl.classList.remove('hidden');
        } else {
            emailEl.classList.add('hidden');
        }
    }
    
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
    const titleBtn = document.getElementById('edit-title-btn');
    if (titleBtn) {
        if (game.state.selectedTitle) {
            titleBtn.innerHTML = `<span class="text-purple-600 dark:text-purple-400 font-bold">《 ${game.state.selectedTitle} 》</span>`;
        } else {
            titleBtn.innerHTML = `🏷️ เปลี่ยนฉายา`;
        }
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
    const themeBtn = document.getElementById('edit-theme-btn');
    if (themeBtn) {
        themeBtn.textContent = game.state.selectedTheme ? '🎨 ธีม: กำหนดเอง' : '🎨 ธีม: มาตรฐาน';
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
                const isFree = game.state.freeNameChangeAvailable;

                if (isFree) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<span>บันทึก (ฟรี 1 ครั้ง)</span>`;
                    saveBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
                    saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                } else if (game.state.xp < NAME_CHANGE_COST) {
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
            const isFree = game.state.freeNameChangeAvailable;

            if (!isFree && game.state.xp < NAME_CHANGE_COST) {
                showToast('XP ไม่พอ', `คุณต้องการ ${NAME_CHANGE_COST} XP เพื่อเปลี่ยนชื่อ`, '⚠️', 'error');
                return;
            }

            const newName = nameInput.value.trim();
            if (newName) {
                let toastMsg = '';
                if (isFree) {
                    game.state.freeNameChangeAvailable = false;
                    toastMsg = `เปลี่ยนชื่อเรียบร้อยแล้ว (ฟรี)`;
                } else {
                    game.state.xp -= NAME_CHANGE_COST;
                    toastMsg = `เปลี่ยนชื่อเรียบร้อยแล้ว (-${NAME_CHANGE_COST} XP)`;
                }

                game.setDisplayName(newName);
                renderUserInfo(game);
                nameModal.close();
                showToast('บันทึกสำเร็จ', toastMsg, '✏️');
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
            const querySnapshot = await game.authManager.retryOperation(() => getDocs(q));
            
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
                    const snapshot = await game.authManager.retryOperation(() => getCountFromServer(rankQuery));
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
                    <div class="flex-shrink-0 relative">
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

            listHtml += `
                <div class="mt-3 text-center">
                    <a href="./leaderboard.html" class="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        ดูอันดับทั้งหมด &rarr;
                    </a>
                </div>
            `;
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

function setupShopShortcut() {
    const shortcutBtn = document.getElementById('goto-shop-btn');
    const shopSection = document.getElementById('shop-section');
    const shopContent = document.getElementById('shop-content');
    const shopHeader = shopContent?.previousElementSibling;

    if (!shortcutBtn || !shopSection || !shopContent || !shopHeader) return;

    shortcutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Expand the shop if it's collapsed
        const isCollapsed = shopContent.style.maxHeight === '0px';
        if (isCollapsed) {
            const icon = shopHeader.querySelector('.chevron-icon');
            shopContent.style.maxHeight = shopContent.scrollHeight + "px";
            shopContent.style.opacity = "1";
            if (icon) icon.classList.remove('-rotate-90');
        }

        shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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

            // NEW: ปลดล็อกความสูงหลังจาก Animation จบ เพื่อให้ Accordion ซ้อนข้างในขยายได้
            const onTransitionEnd = () => {
                if (content.style.opacity === "1") {
                    content.style.maxHeight = "none";
                    content.style.overflow = "visible";
                }
                content.removeEventListener('transitionend', onTransitionEnd);
            };
            content.addEventListener('transitionend', onTransitionEnd);
        } else {
            // Collapse
            // ถ้าความสูงเป็น none อยู่ (เปิดค้างไว้) ต้องกำหนดค่าเป็น pixel ก่อนเพื่อให้ Animation ทำงาน
            if (content.style.maxHeight === 'none') {
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.overflow = "hidden";
            }
            
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

                // NEW: Play item flying animation
                const item = SHOP_ITEMS.find(i => i.id === currentItemId);
                const startEl = document.getElementById('shop-modal-icon');
                if (item && startEl) {
                    animateItemToBag(item.icon, startEl);
                }

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
    container.className = 'space-y-6';

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
                ? `<div class="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800 shadow-md z-10">${quantity}</div>`
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
            <div class="shop-item-card relative bg-gray-50 dark:bg-gray-700/30 p-3 rounded-2xl border border-transparent hover:border-blue-300 dark:hover:border-blue-500 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group" data-id="${item.id}">
                ${quantityBadge}
                <div class="w-12 h-12 mb-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <div class="text-2xl transform group-hover:rotate-12 transition-transform duration-300">${item.icon}</div>
                </div>
                <h4 class="font-bold text-gray-800 dark:text-gray-100 mb-1 text-xs w-full truncate px-1">${item.name}</h4>
                <p class="text-[10px] font-bold ${statusClass} bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full mt-0.5">${statusText}</p>
            </div>
        `;
        }).join('');

        // Accordion Structure
        return `
            <div class="shop-category bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <button class="w-full flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700/50 hover:from-blue-50 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all shop-category-header group" data-target="shop-cat-${cat.type}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm text-xl group-hover:scale-110 transition-transform">${cat.icon}</div>
                        <span class="font-bold text-gray-700 dark:text-gray-200 text-lg">${cat.label}</span>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                        <svg class="w-5 h-5 transform transition-transform duration-300 chevron-icon -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                <div id="shop-cat-${cat.type}" class="collapsible-content" style="max-height: 0px; opacity: 0;">
                    <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-white dark:bg-gray-800">
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
        <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    ${icon} ${name}
                </span>
                <span class="text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">Lv.${data.level}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div class="${colorClass} h-2.5 rounded-full transition-all duration-1000 relative" style="width: ${data.progressPercent}%">
                </div>
            </div>
            <div class="flex justify-between text-xs mt-1.5 text-gray-500 dark:text-gray-400">
                <span class="font-medium">${data.title}</span>
                <span>${data.currentXP.toLocaleString()} XP</span>
            </div>
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
        const opacityClass = isEarned ? 'opacity-100' : 'opacity-70 grayscale';
        const borderClass = isEarned 
            ? (badge.tier === 'gold' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                : badge.tier === 'silver' ? 'border-gray-400 bg-gray-50 dark:bg-gray-800' 
                : 'border-orange-400 bg-orange-50 dark:bg-orange-900/20')
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800';

        let overlayHtml = '';
        const progress = !isEarned ? getBadgeProgress(game, badge.id) : null;

        if (!isEarned) {
            if (progress) {
                const percent = Math.min(100, Math.max(0, (progress.current / progress.target) * 100));
                overlayHtml = `
                    <div class="absolute inset-x-0 bottom-2 px-2 flex flex-col items-center z-10">
                        <div class="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden shadow-sm">
                            <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                        </div>
                        <div class="text-[10px] font-bold text-gray-800 dark:text-white mt-1 bg-white/95 dark:bg-gray-900/90 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm border border-gray-100 dark:border-gray-600">
                            ${progress.current}/${progress.target} ${progress.label}
                        </div>
                    </div>
                `;
            } else {
                overlayHtml = '<div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold text-gray-500 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">Locked</span></div>';
            }
        }

        return `
            <div class="badge-card flex flex-col items-center p-3 rounded-xl border-2 ${borderClass} ${opacityClass} transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:scale-102 hover:z-10 relative group cursor-pointer" data-id="${badge.id}">
                <div class="text-3xl mb-2">${badge.icon}</div>
                <div class="text-xs font-bold text-center truncate w-full hidden lg:block mb-3">${badge.name}</div>
                ${overlayHtml}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-2 hidden group-hover:block w-40 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20 text-center pointer-events-none">
                    <div class="font-bold text-yellow-400 mb-1">${badge.name}</div>
                    <div>${badge.desc}</div>
                    ${progress ? `<div class="mt-1 text-blue-300 pt-1 border-t border-gray-700">ความคืบหน้า: ${progress.current}/${progress.target} ${progress.label}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function getBadgeProgress(game, badgeId) {
    const state = game.state;
    switch (badgeId) {
        case 'first_quiz': return { current: state.quizzesCompleted, target: 1, label: '' };
        case 'perfect_score': return { current: state.perfectScores > 0 ? 1 : 0, target: 1, label: '' };
        case 'streak_3': return { current: state.streak, target: 3, label: 'วัน' };
        case 'streak_7': return { current: state.streak, target: 7, label: 'วัน' };
        case 'streak_14': return { current: state.streak, target: 14, label: 'วัน' };
        case 'streak_30': return { current: state.streak, target: 30, label: 'วัน' };
        case 'streak_60': return { current: state.streak, target: 60, label: 'วัน' };
        case 'quiz_master_5': return { current: state.quizzesCompleted, target: 5, label: 'ครั้ง' };
        case 'quiz_master_10': return { current: state.quizzesCompleted, target: 10, label: 'ครั้ง' };
        case 'quiz_master_25': return { current: state.quizzesCompleted, target: 25, label: 'ครั้ง' };
        case 'quiz_master_50': return { current: state.quizzesCompleted, target: 50, label: 'ครั้ง' };
        case 'quiz_master_100': return { current: state.quizzesCompleted, target: 100, label: 'ครั้ง' };
        case 'high_scorer_3': return { current: state.highScores80 || 0, target: 3, label: 'ครั้ง' };
        case 'high_scorer_5': return { current: state.highScores80 || 0, target: 5, label: 'ครั้ง' };
        case 'high_scorer_10': return { current: state.highScores80 || 0, target: 10, label: 'ครั้ง' };
        case 'perfect_scorer_3': return { current: state.perfectScores || 0, target: 3, label: 'ครั้ง' };
        case 'perfect_scorer_5': return { current: state.perfectScores || 0, target: 5, label: 'ครั้ง' };
        case 'physics_lover': return { current: game.getPhysicsLevel().level, target: 3, label: 'Lv' };
        case 'physics_expert': return { current: game.getPhysicsLevel().level, target: 5, label: 'Lv' };
        case 'physics_master': return { current: game.getPhysicsLevel().level, target: 10, label: 'Lv' };
        case 'earth_lover': return { current: game.getEarthLevel().level, target: 3, label: 'Lv' };
        case 'earth_expert': return { current: game.getEarthLevel().level, target: 5, label: 'Lv' };
        case 'earth_master': return { current: game.getEarthLevel().level, target: 10, label: 'Lv' };
        case 'xp_5k': return { current: state.xp, target: 5000, label: 'XP' };
        case 'xp_10k': return { current: state.xp, target: 10000, label: 'XP' };
        case 'shop_spender': return { current: game.getInventory().length, target: 5, label: 'ชิ้น' };
        case 'dual_expert': 
            const p = game.getPhysicsLevel().level;
            const e = game.getEarthLevel().level;
            return { current: Math.min(p, e), target: 5, label: 'Lv (Min)' };
        case 'weekend_learner_3': return { current: state.weekendQuizzesCompleted || 0, target: 3, label: 'ครั้ง' };
        case 'weekend_learner_5': return { current: state.weekendQuizzesCompleted || 0, target: 5, label: 'ครั้ง' };
        case 'weekend_learner_10': return { current: state.weekendQuizzesCompleted || 0, target: 10, label: 'ครั้ง' };
        case 'weekend_learner_15': return { current: state.weekendQuizzesCompleted || 0, target: 15, label: 'ครั้ง' };
        case 'marathon_runner':
            return { current: state.badges.includes('marathon_runner') ? 1 : 0, target: 1, label: '' };
        default: return null;
    }
}

function setupBadgeInteractions(game) {
    const container = document.getElementById('profile-badges-grid');
    const modal = new ModalHandler('badge-details-modal');
    
    if (!container) return;

    container.addEventListener('click', (e) => {
        const card = e.target.closest('.badge-card');
        if (card) {
            const badgeId = card.dataset.id;
            const badge = BADGES.find(b => b.id === badgeId);
            if (badge) {
                const isEarned = game.state.badges.includes(badgeId);
                
                const iconEl = document.getElementById('badge-modal-icon');
                const nameEl = document.getElementById('badge-modal-name');
                const descEl = document.getElementById('badge-modal-desc');
                const statusEl = document.getElementById('badge-modal-status');

                if (iconEl) {
                    iconEl.textContent = badge.icon;
                    // ปรับ Effect รูปภาพตามสถานะ
                    if (isEarned) {
                        iconEl.classList.remove('grayscale', 'opacity-50');
                    } else {
                        iconEl.classList.add('grayscale', 'opacity-50');
                    }
                }
                if (nameEl) nameEl.textContent = badge.name;
                if (descEl) descEl.textContent = badge.desc;
                
                if (statusEl) {
                    if (isEarned) {
                        statusEl.innerHTML = '<span class="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-bold">ได้รับแล้ว</span>';
                    } else {
                        statusEl.innerHTML = '<span class="px-3 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-sm font-bold">ยังไม่ได้รับ</span>';
                    }
                }
                
                modal.open();
            }
        }
    });
}

function renderAchievements(game) {
    const container = document.getElementById('profile-achievements-list');
    if (!container) return;

    const unlockedIds = game.state.unlockedAchievements || [];

    container.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlockedIds.includes(ach.id);
        const containerClass = isUnlocked 
            ? 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-900/50 shadow-sm' 
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-80';
        
        const titleClass = isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500';
        const descClass = isUnlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600';
        const iconBgClass = isUnlocked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 grayscale';

        // Calculate Progress
        let currentProgress = 0;
        if (ach.type === 'level') {
            currentProgress = game.getCurrentLevel().level;
        } else if (ach.type === 'total_correct') {
            currentProgress = game.state.totalCorrectAnswers || 0;
        } else if (ach.type === 'total_quizzes') {
            currentProgress = game.state.quizzesCompleted || 0;
        } else if (ach.type === 'total_items') {
            currentProgress = game.getInventory().length;
        } else if (ach.type === 'total_avatars') {
            const inventory = game.getInventory();
            currentProgress = inventory.filter(id => {
                const item = SHOP_ITEMS.find(i => i.id === id);
                return item && item.type === 'avatar';
            }).length;
        } else if (ach.type === 'high_scores_80') {
            currentProgress = game.state.highScores80 || 0;
        } else if (ach.type === 'perfect_scores') {
            currentProgress = game.state.perfectScores || 0;
        }

        const percent = Math.min(100, Math.max(0, (currentProgress / ach.target) * 100));
        const displayProgress = Math.min(currentProgress, ach.target);
        const barColor = isUnlocked ? 'bg-yellow-500' : 'bg-blue-500';

        return `
            <div class="relative p-3 rounded-xl border ${containerClass} transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${iconBgClass} shadow-sm">
                        ${ach.icon}
                    </div>
                    <div class="flex-grow min-w-0">
                        <div class="flex justify-between items-start">
                            <h4 class="text-sm font-bold ${titleClass} truncate pr-2">${ach.title}</h4>
                            ${isUnlocked 
                                ? '<span class="text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-green-200 dark:border-green-800">สำเร็จ</span>' 
                                : '<span class="text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 dark:border-gray-600">ล็อค</span>'}
                        </div>
                        <p class="text-xs ${descClass} mt-0.5 mb-2 line-clamp-1">${ach.desc}</p>
                        
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div class="${barColor} h-1.5 rounded-full transition-all duration-500 relative" style="width: ${percent}%">
                                ${isUnlocked ? '<div class="absolute inset-0 bg-white/20 animate-pulse"></div>' : ''}
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-1">
                            <span class="text-[10px] ${descClass} font-mono">${displayProgress} / ${ach.target}</span>
                            ${ach.rewardTitle ? `<span class="text-[10px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">🎁 ${ach.rewardTitle}</span>` : ''}
                        </div>
                    </div>
                </div>
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
        // --- Caching Logic ---
        const CACHE_KEY = 'radar_chart_data_cache';
        const LAST_COMPLETED_KEY = 'last_quiz_completed_timestamp'; // This key should be updated when a quiz is finished
        
        const lastCompletionTime = localStorage.getItem(LAST_COMPLETED_KEY) || '0';
        const cachedItem = localStorage.getItem(CACHE_KEY);
        const cachedData = cachedItem ? JSON.parse(cachedItem) : null;

        let stats;

        if (cachedData && cachedData.timestamp >= lastCompletionTime) {
            // Use cached data
            console.log("Using cached radar chart data.");
            stats = cachedData.stats;
        } else {
            // Recalculate data
            console.log("Recalculating radar chart data for caching.");
            const allProgress = await getDetailedProgressForAllQuizzes();
    
            const newStats = {};
            Object.keys(PROFICIENCY_GROUPS).forEach(key => {
                newStats[key] = { correct: 0, total: 0 };
            });
            newStats['General'] = { correct: 0, total: 0 };
    
            allProgress.forEach(quiz => {
                if (!quiz.userAnswers) return;

                quiz.userAnswers.forEach(ans => { 
                    if (ans) {
                        let subCatStr = '';
                        if (ans.subCategory) {
                            if (typeof ans.subCategory === 'string') subCatStr = ans.subCategory;
                            else if (ans.subCategory.main) subCatStr = ans.subCategory.main;
                        }
                        
                        let matchedGroup = 'General';
                        const matches = (text, keywords) => keywords.some(k => text.includes(k));

                        for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                            if (matches(subCatStr, groupDef.keywords)) {
                                matchedGroup = groupKey;
                                break;
                            }
                        }

                        newStats[matchedGroup].total++;
                        if (ans.isCorrect) newStats[matchedGroup].correct++;
                    }
                });
            });

            stats = newStats; // Assign for rendering

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: new Date().getTime(),
                stats: stats 
            }));
        }

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

function getOrCreateTooltip(chart) {
    let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'chartjs-tooltip bg-gray-900/95 dark:bg-gray-700/95 text-white text-xs rounded-lg shadow-xl pointer-events-auto absolute transition-all duration-150 z-50 backdrop-blur-sm border border-gray-700 dark:border-gray-600';
        tooltipEl.style.opacity = 0;
        tooltipEl.style.transition = 'opacity .3s';

        const table = document.createElement('table');
        table.style.margin = '0px';

        tooltipEl.appendChild(table);
        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
}

/**
 * Creates a flying animation of the item icon from the modal to the shop button/user hub.
 * @param {string} icon - The emoji/icon to animate.
 * @param {HTMLElement} startElement - The starting element (usually the icon in the modal).
 */
function animateItemToBag(icon, startElement) {
    // 1. Determine Target (Shop button or User Hub)
    const shopBtn = document.getElementById('goto-shop-btn');
    const userHubBtn = document.getElementById('user-hub-btn');
    
    // Prefer the shop button if it's visible in the viewport
    let target = userHubBtn;
    if (shopBtn) {
        const rect = shopBtn.getBoundingClientRect();
        if (rect.top >= 0 && rect.left >= 0 && 
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)) {
            target = shopBtn;
        }
    }

    if (!startElement || !target) return;

    // 2. Create Flying Element
    const flyer = document.createElement('div');
    flyer.textContent = icon;
    flyer.style.position = 'fixed';
    flyer.style.fontSize = '4rem'; // Large icon
    flyer.style.zIndex = '10000';
    flyer.style.pointerEvents = 'none';
    flyer.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    
    const startRect = startElement.getBoundingClientRect();
    
    // Center of start element
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    flyer.style.transform = 'translate(-50%, -50%) scale(1)';
    flyer.style.opacity = '1';

    document.body.appendChild(flyer);

    // 3. Animate
    // Force reflow to ensure start position is applied
    void flyer.offsetWidth;

    requestAnimationFrame(() => {
        const targetRect = target.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        flyer.style.left = `${targetX}px`;
        flyer.style.top = `${targetY}px`;
        flyer.style.transform = 'translate(-50%, -50%) scale(0.2)'; // Shrink
        flyer.style.opacity = '0'; // Fade out
    });

    // 4. Cleanup & Target Feedback
    flyer.addEventListener('transitionend', () => {
        flyer.remove();
        
        // Bounce effect on target
        if (target.animate) {
            target.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-out'
            });
        }
    });
}
function externalTooltipHandler(context) {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        tooltipEl.style.pointerEvents = 'none';
        return;
    } else {
        tooltipEl.style.pointerEvents = 'auto';
    }

    // Set Text
    if (tooltip.body) {
        const titleLines = tooltip.title || [];
        const bodyLines = tooltip.body.map(b => b.lines);

        const tableHead = document.createElement('thead');

        // Close button row
        const closeRow = document.createElement('tr');
        const closeCell = document.createElement('th');
        closeCell.colSpan = 2;
        closeCell.className = "text-right pb-1 border-b border-gray-600/50 mb-2";
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
        closeBtn.className = "p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer";
        closeBtn.type = "button";
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            tooltipEl.style.opacity = 0;
            tooltipEl.style.pointerEvents = 'none';
            chart.setActiveElements([], { x: 0, y: 0 });
            chart.update();
        };
        
        closeCell.appendChild(closeBtn);
        closeRow.appendChild(closeCell);
        tableHead.appendChild(closeRow);

        titleLines.forEach(title => {
            const tr = document.createElement('tr');
            tr.style.borderWidth = 0;

            const th = document.createElement('th');
            th.style.borderWidth = 0;
            th.className = "text-left font-bold py-2 font-kanit text-sm";
            const text = document.createTextNode(title);

            th.appendChild(text);
            tr.appendChild(th);
            tableHead.appendChild(tr);
        });

        const tableBody = document.createElement('tbody');
        bodyLines.forEach((body, i) => {
            const colors = tooltip.labelColors[i];

            const span = document.createElement('span');
            span.style.background = colors.backgroundColor;
            span.style.borderColor = colors.borderColor;
            span.style.borderWidth = '2px';
            span.style.marginRight = '8px';
            span.style.height = '10px';
            span.style.width = '10px';
            span.style.display = 'inline-block';
            span.style.borderRadius = '50%';

            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;

            const td = document.createElement('td');
            td.style.borderWidth = 0;
            td.className = "py-1 font-sarabun";

            const text = document.createTextNode(body);

            td.appendChild(span);
            td.appendChild(text);
            tr.appendChild(td);
            tableBody.appendChild(tr);
        });

        const tableRoot = tooltipEl.querySelector('table');

        // Remove old children
        while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
        }

        // Add new children
        tableRoot.appendChild(tableHead);
        tableRoot.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.padding = '12px';
    
    // Smart positioning
    let transformX = '-50%';
    let transformY = '-100%';
    let marginTop = '-10px';

    if (tooltip.yAlign === 'top') {
        transformY = '0';
        marginTop = '10px';
    } else if (tooltip.yAlign === 'center') {
        transformY = '-50%';
        marginTop = '0';
    }

    tooltipEl.style.transform = `translate(${transformX}, ${transformY})`;
    tooltipEl.style.marginTop = marginTop;
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
                        enabled: false,
                        external: externalTooltipHandler,
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