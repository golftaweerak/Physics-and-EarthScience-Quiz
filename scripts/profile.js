import { Gamification, BADGES, ACHIEVEMENTS, SHOP_ITEMS, XP_THRESHOLDS, TRACK_TITLES, PROFICIENCY_GROUPS, getLevelBorderClass, getAvatarFrameClass } from './gamification.js';
import { getDetailedProgressForAllQuizzes, calculateStrengthsAndWeaknesses } from './data-manager.js';
import { renderDailyQuests } from './daily-quests-renderer.js';
import { ModalHandler } from './modal-handler.js';
import { showToast } from './toast.js';
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore";
import { db } from './firebase-config.js';
import { escapeHtml } from './utils.js';
import { SiteConfig } from './site-config.js';
import { subCategoryData } from '../data/sub-category-data.js';
import {
    getAllStats, calculateSummary, renderSummaryCards,
    calculateScoreTrend, renderScoreTrendChart,
    calculateSubjectPerformance, renderSubjectPerformanceChart,
    calculateGroupedPerformance, renderPerformanceAccordions,
    renderDetailedList, setupActionListeners, renderInDepthStats,
    calculateScoreDistribution, renderScoreDistributionChart
} from './stats.js';
import { quizList } from '../data/quizzes-list.js';
import { getSavedCustomQuizzes } from './custom-quiz-handler.js';

const AVATARS = [
    '🧑‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '👨‍🚀', '👩‍🚀', '👽', '🤖', '👻', '💩'
];

// Theme colors for Radar Chart
const THEME_COLORS = {
    'theme-forest': { border: '#059669', background: 'rgba(5, 150, 105, 0.2)', point: '#059669' },
    'theme-sunset': { border: '#ea580c', background: 'rgba(234, 88, 12, 0.2)', point: '#ea580c' },
    'theme-ocean': { border: '#0891b2', background: 'rgba(8, 145, 178, 0.2)', point: '#0891b2' },
    'theme-berry': { border: '#db2777', background: 'rgba(219, 39, 119, 0.2)', point: '#db2777' },
    'theme-sakura': { border: '#e11d48', background: 'rgba(225, 29, 72, 0.2)', point: '#e11d48' },
    'theme-midnight': { border: '#475569', background: 'rgba(71, 85, 105, 0.2)', point: '#475569' },
    'default': { border: 'rgba(59, 130, 246, 1)', background: 'rgba(59, 130, 246, 0.2)', point: 'rgba(59, 130, 246, 1)' }
};

/**
 * Centralized function to get theme colors for Chart.js based on the current theme.
 * @param {Gamification} game - The gamification instance.
 * @returns {{gridColor: string, textColor: string, themeColors: object}}
 */
function getChartJsTheme(game) {
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const currentThemeName = game?.state?.selectedTheme;
    const themeColors = THEME_COLORS[currentThemeName] || THEME_COLORS['default'];

    return { gridColor, textColor, themeColors };
}


let lastSyncTime = null;
let previousXP = null;
let previousAvatar = null;
let previousTitle = null;
let gamificationUpdateHandler = null;
let activeShopTab = 'consumable';
let activeHistoryRange = 'all';
let activeProficiencyMode = 'overall';
let historySearchQuery = ''; // Track search in History panel
let activeAnalysisSyllabus = 'overall';
let activeReportTrendRange = '7'; // Default for Analysis tab
let chartsInitialized = { dashboard: false, analysis: false };

export async function initializeProfile(gameInstance) {
    const game = gameInstance || new Gamification();

    // 1. เรนเดอร์ UI ทั่วไปทันที (รวดเร็ว)
    renderUserInfo(game);
    renderTrackProgress(game);
    renderBadges(game);
    renderAchievements(game);
    renderQuestHistory(game);
    renderShop(game);
    renderDailyQuests(game, 'profile-daily-quests-container');
    renderSyncStatus(game);

    // 2. ติดตั้งระบบต่างๆ
    setupShopSystem(game);
    setupAvatarSystem(game);
    setupNameEditSystem(game);
    setupTitleSystem(game);
    setupThemeSystem(game);
    setupResetSystem(game);
    setupRecalculateSystem(game); // NEW: Add recalculate button setup
    setupCollapsibleSections();
    setupManualSync(game);
    setupLeaderboardSystem(game);
    setupShopShortcut();
    setupBadgeInteractions(game);
    setupAchievementInteractions(game); // NEW: Achievement modal
    setupHubTabs(game); // NEW: Hub navigation logic

    // 3. เรนเดอร์กราฟ (Asynchronous/ช้ากว่า)
    document.getElementById('radar-chart-loader')?.classList.remove('hidden');
    document.getElementById('history-chart-loader')?.classList.remove('hidden');
    document.getElementById('strengths-weaknesses-loader')?.classList.remove('hidden');

    setupRefreshChartsSystem(game); // Setup once

    const allProgress = await getDetailedProgressForAllQuizzes();
    setupHistoryRangeSystem(game, allProgress); // NEW: Add history range selector setup
    setupProficiencyModeSystem(game, allProgress); // NEW: Add proficiency mode selector setup

    const chartsRendered = await Promise.all([
        renderRadarChart(game, allProgress),
        renderProficiencyHistoryChart(game, allProgress),
        renderStrengthsWeaknesses(allProgress)
    ]);
    if (chartsRendered.every(Boolean)) {
        document.getElementById('refresh-charts-btn')?.classList.add('hidden');
    }

    // 4. NEW: Auto-refresh when data changes (e.g., after login/sync)
    // FIX: Remove existing listener to prevent duplicates/memory leaks
    if (gamificationUpdateHandler) {
        window.removeEventListener('gamification-updated', gamificationUpdateHandler);
    }

    gamificationUpdateHandler = async () => {
        // Update UI elements
        renderUserInfo(game);
        renderTrackProgress(game);
        renderBadges(game);
        renderAchievements(game);
        renderQuestHistory(game);
        renderShop(game);
        renderDailyQuests(game, 'profile-daily-quests-container');
        renderSyncStatus(game);

        // Re-render charts to reflect merged data
        const updatedProgress = await getDetailedProgressForAllQuizzes();
        await Promise.all([
            renderRadarChart(game, updatedProgress),
            renderProficiencyHistoryChart(game, updatedProgress),
            renderStrengthsWeaknesses(updatedProgress)
        ]);
    };

    window.addEventListener('gamification-updated', gamificationUpdateHandler);
}

/**
 * Handles Tab Switching for the Main Hub
 */
function setupHubTabs(game) {
    const tabs = document.querySelectorAll('.primary-tab-btn');
    const panels = document.querySelectorAll('.hub-panel');
    const indicator = document.getElementById('tab-sliding-indicator');

    const updateIndicator = (activeTab) => {
        if (!indicator || !activeTab) return;

        const rect = activeTab.getBoundingClientRect();
        const parentRect = activeTab.parentElement.getBoundingClientRect();

        indicator.style.display = 'block';
        indicator.style.width = `${rect.width}px`;
        indicator.style.left = `${rect.left - parentRect.left}px`;

        // Ensure opacity is set after first position
        setTimeout(() => {
            indicator.style.opacity = '1';
        }, 50);
    };

    // Initial update
    const initialActive = document.querySelector('.primary-tab-btn.active');
    if (initialActive) {
        setTimeout(() => updateIndicator(initialActive), 100);
    }

    window.addEventListener('resize', () => {
        const active = document.querySelector('.primary-tab-btn.active');
        if (active) updateIndicator(active);
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            const target = tab.dataset.tabTarget;

            // UI Update: Buttons
            tabs.forEach(t => {
                t.classList.remove('active', 'text-blue-600', 'dark:text-blue-400');
                t.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-100');
            });
            tab.classList.add('active', 'text-blue-600', 'dark:text-blue-400');
            tab.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-100');

            updateIndicator(tab);

            // UI Update: Panels
            panels.forEach(p => p.classList.add('hidden'));
            const activePanel = document.getElementById(`panel-${target}`);
            if (activePanel) {
                activePanel.classList.remove('hidden');
                activePanel.classList.add('animate-fade-in');
            }

            // Lazy Load / Trigger Specific Logic
            if (target === 'analysis' && !chartsInitialized.analysis) {
                await renderAnalysisTab(game);
            } else if (target === 'history') {
                await renderHistoryTab(game);
            }
        });
    });
}

async function renderAnalysisTab(game) {
    const container = document.getElementById('panel-analysis');
    if (!container) return;

    const customQuizzes = await getSavedCustomQuizzes();
    const allStats = getAllStats(customQuizzes);

    if (allStats.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-gray-500">ไม่มีสถิติสำหรับวิเคราะห์</div>`;
        return;
    }

    const summary = calculateSummary(allStats, quizList.length + customQuizzes.length);
    renderSummaryCards(summary);

    const trendData = calculateScoreTrend(allStats, activeReportTrendRange);
    renderScoreTrendChart(trendData);

    const subjectData = calculateSubjectPerformance(allStats);
    renderSubjectPerformanceChart(subjectData);

    const groupedData = calculateGroupedPerformance(allStats, activeAnalysisSyllabus);
    renderPerformanceAccordions(groupedData);

    renderInDepthStats(allStats);

    // Setup local filters for analysis tab
    setupAnalysisFilters(game, allStats);

    chartsInitialized.analysis = true;
}

async function renderHistoryTab(game) {
    const customQuizzes = await getSavedCustomQuizzes();
    const allStats = getAllStats(customQuizzes);

    // Filter history based on search
    const filteredHistory = allStats.filter(s =>
        s.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        getCategoryDisplayName(s.category).toLowerCase().includes(historySearchQuery.toLowerCase())
    );

    renderDetailedList(filteredHistory);
    setupActionListeners();

    // Setup history search listener
    const searchInput = document.getElementById('history-search-input');
    if (searchInput && !searchInput.dataset.initialized) {
        searchInput.addEventListener('input', (e) => {
            historySearchQuery = e.target.value;
            renderHistoryTab(game);
        });
        searchInput.dataset.initialized = "true";
    }
}

function setupAnalysisFilters(game, allStats) {
    // Trend filter
    const trendBtns = document.querySelectorAll('.trend-range-btn');
    trendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeReportTrendRange = btn.dataset.range;
            trendBtns.forEach(b => b.classList.remove('active', 'bg-blue-100', 'text-blue-700'));
            btn.classList.add('active', 'bg-blue-100', 'text-blue-700');
            const trendData = calculateScoreTrend(allStats, activeReportTrendRange);
            renderScoreTrendChart(trendData);
        });
    });

    // Syllabus filter
    const topicSelect = document.getElementById('topic-syllabus-select');
    if (topicSelect) {
        topicSelect.addEventListener('change', (e) => {
            activeAnalysisSyllabus = e.target.value;
            const groupedData = calculateGroupedPerformance(allStats, activeAnalysisSyllabus);
            renderPerformanceAccordions(groupedData);
        });
    }
}

function getCategoryDisplayName(catId) {
    const details = {
        'physics': 'ฟิสิกส์',
        'earth_science': 'วิทย์โลกและดาราศาสตร์',
        'general_science': 'วิทยาศาสตร์ทั่วไป'
    };
    return details[catId] || catId;
}

/**
 * Animates a numeric value in a specified element and applies a temporary color flash.
 * @param {string} elementId - The ID of the element to update.
 * @param {number|null} startValue - The starting value for the animation.
* @param {number} endValue - The final value.
 */
function animateXpDisplay(elementId, startValue, endValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (startValue !== null && startValue !== endValue) {
        animateValue(el, startValue, endValue, 1000);
        const isDecrease = endValue < startValue;
        const colorClass = isDecrease ? 'text-red-500' : 'text-green-500';
        el.classList.add(colorClass, 'scale-125', 'inline-block', 'transition-transform');
        setTimeout(() => el.classList.remove(colorClass, 'scale-125'), 500);
    } else {
        el.textContent = endValue.toLocaleString();
    }
}

function renderUserInfo(game) {
    const overall = game.getCurrentLevel();
    const currentTitle = overall.title;

    // NEW: Check for title change and show toast
    if (previousTitle !== null && previousTitle !== currentTitle) {
        showToast('ปลดล็อกฉายาใหม่!', `คุณได้รับฉายา: "${currentTitle}"`, '🌟', 'gold');
    }

    const rankTitleEl = document.getElementById('user-rank-title');
    if (rankTitleEl) rankTitleEl.textContent = `${currentTitle} (Lv.${overall.level})`;

    const levelEl = document.getElementById('user-level');
    if (levelEl) levelEl.textContent = overall.level;

    const currentXP = game.state.xp;
    animateXpDisplay('current-xp', previousXP, currentXP);

    // Update Level Progress Bar & Quest
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

        if (progressBarEl) {
            // Animate from 0 to target
            progressBarEl.style.width = '0%';
            setTimeout(() => {
                progressBarEl.style.width = `${xpPercent}%`;
            }, 100);
        }
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

    // Update display name
    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) nameEl.textContent = game.state.displayName || 'ผู้เรียน (Guest)';

    // Update email
    const emailEl = document.getElementById('profile-email-display');
    if (emailEl) {
        const user = game.authManager.currentUser;
        if (user && user.email) {
            emailEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>${escapeHtml(user.email)}
            `;
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
                avatarEl.innerHTML = `<img src="${escapeHtml(avatar)}" alt="Profile Avatar" class="w-full h-full rounded-full object-cover">`;
            } else {
                avatarEl.innerHTML = escapeHtml(avatar);
            }
            avatarEl.classList.remove('anim-avatar-pop');
            void avatarEl.offsetWidth; // Force reflow
            avatarEl.classList.add('anim-avatar-pop');
            previousAvatar = avatar;
        }

        // Update border class based on price/rarity
        const frameClass = getAvatarFrameClass(avatar);
        avatarEl.className = `w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl cursor-pointer transition-transform transform ${frameClass}`;

        // NEW: Update level border (outer ring)
        const levelBorderClass = getLevelBorderClass(overall.level);
        levelFrameEl.className = 'w-full h-full rounded-full p-1 transition-all duration-300'; // Reset and use p-1 for visibility
        levelFrameEl.classList.add(...levelBorderClass.split(' '));
    }

    // Update Title
    const titleBtn = document.getElementById('edit-title-btn');
    if (titleBtn) {
        if (game.state.selectedTitle) {
            titleBtn.innerHTML = `<span class="text-purple-600 dark:text-purple-400 font-bold">《 ${escapeHtml(game.state.selectedTitle)} 》</span>`;
        } else {
            titleBtn.innerHTML = `🏷️ เปลี่ยนฉายา`;
        }
    }

    // Update Shop XP
    animateXpDisplay('shop-user-xp', previousXP, currentXP);

    // Update Theme Display (Optional, maybe just a text or icon)
    const themeBtn = document.getElementById('edit-theme-btn');
    if (themeBtn) {
        themeBtn.textContent = game.state.selectedTheme ? '🎨 ธีม: กำหนดเอง' : '🎨 ธีม: มาตรฐาน';
    }

    renderRecentBadges(game);
    previousTitle = currentTitle;
    previousXP = currentXP;

    // FIX: Force update header avatar to ensure it matches profile
    game.updateHeaderAvatar();
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
            <div class="recent-badge-item w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xl shadow-sm border border-yellow-200 dark:border-yellow-700/50 transition-transform hover:scale-110 cursor-pointer" title="${b.name}: ${b.desc}" data-id="${b.id}">
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
                    game.setDisplayName(newName);
                    renderUserInfo(game);
                    nameModal.close();
                    showToast('บันทึกสำเร็จ', toastMsg, '✏️');
                } else {
                    // FIX: ใช้ spendXP เพื่อบันทึกประวัติการใช้จ่าย (ป้องกัน XP เด้งคืนตอนคำนวณใหม่)
                    if (game.spendXP(NAME_CHANGE_COST)) {
                        toastMsg = `เปลี่ยนชื่อเรียบร้อยแล้ว (-${NAME_CHANGE_COST} XP)`;
                        game.setDisplayName(newName);
                        renderUserInfo(game);
                        nameModal.close();
                        showToast('บันทึกสำเร็จ', toastMsg, '✏️');
                    } else {
                        showToast('ข้อผิดพลาด', 'XP ไม่เพียงพอ', '❌', 'error');
                    }
                }
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

            // NEW: Clear all quiz history from localStorage for a complete reset
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('quizState-')) {
                    localStorage.removeItem(key);
                }
            });

            confirmModal.close();
            window.location.reload(); // Reload to reflect changes
        });

        confirmModal.open();
    });
}

function setupRecalculateSystem(game) {
    const recalcBtn = document.getElementById('recalculate-xp-btn');
    if (!recalcBtn) return;

    recalcBtn.addEventListener('click', () => {
        // Add loading animation
        const icon = recalcBtn.querySelector('svg');
        if (icon) icon.classList.add('animate-spin');
        recalcBtn.disabled = true;
        recalcBtn.classList.add('opacity-75', 'cursor-not-allowed');

        setTimeout(() => {
            try {
                const result = game.recalculateFromHistory();
                renderUserInfo(game);
                renderTrackProgress(game);
                showToast('คำนวณใหม่สำเร็จ', `คะแนนของคุณคือ ${result.totalXP.toLocaleString()} XP จาก ${result.completed} แบบทดสอบ`, '✅');
            } catch (e) {
                console.error(e);
                showToast('เกิดข้อผิดพลาด', 'ไม่สามารถคำนวณคะแนนใหม่ได้', '❌', 'error');
            } finally {
                if (icon) icon.classList.remove('animate-spin');
                recalcBtn.disabled = false;
                recalcBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        }, 500); // Fake delay for UX
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

        const allProgress = await getDetailedProgressForAllQuizzes();
        const [r1, r2, r3] = await Promise.all([
            renderRadarChart(game, allProgress),
            renderProficiencyHistoryChart(game, allProgress),
            renderStrengthsWeaknesses(allProgress)
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

/**
 * Calculates the level and rank title for a given XP score and leaderboard type.
 * This is a helper for leaderboard rendering.
 * @param {number} xp The XP score.
 * @param {string} type The type of leaderboard (e.g., 'xp', 'astronomyTrackXP').
 * @returns {{level: number, title: string}}
 */
function getLevelInfoForLeaderboard(xp, type) {
    let track = 'overall';

    const configCat = SiteConfig.categories.find(c => c.id === type);
    if (configCat && configCat.track) track = configCat.track;

    // Map specific proficiency fields to their main tracks
    for (const group of Object.values(PROFICIENCY_GROUPS)) {
        if (group.field === type) {
            track = group.track;
            break;
        }
    }

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
    const title = titles[titleIndex];
    return { level, title };
}

function setupLeaderboardSystem(game) {
    const listContainer = document.getElementById('leaderboard-list');
    const tabs = document.querySelectorAll('.leaderboard-tab');

    if (!listContainer) return;

    const renderList = async (type) => {
        // Show loading
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-40 text-gray-500">
                <svg class="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>กำลังโหลดอันดับ...</span>
            </div>
        `;

        try {
            // OPTIMIZATION: Don't wait for Auth to fetch Top 10. 
            // Rules are public (read: if true). If user logs in later, 
            // the 'gamification-updated' event will trigger a re-render to highlight 'Me'.
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
                        isMe: true,
                        level: game.state.level // เพิ่ม level เพื่อให้ renderRow ใช้งานได้
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

                const score = isMe && user.score !== undefined ? user.score : (user[type] || 0);
                const scoreFormatted = score.toLocaleString();

                let track = 'overall';

                const configCat = SiteConfig.categories.find(c => c.id === type);
                if (configCat && configCat.track) track = configCat.track;

                let level = 1;
                let rankTitle = 'ผู้เริ่มต้น';

                if (track === 'overall') {
                    // FIX: สำหรับ Overall ให้ใช้ level ของ user นั้นๆ โดยตรง (เพราะ level ไม่ได้ขึ้นกับ XP อย่างเดียวแล้ว)
                    level = user.level || 1;
                    const titles = TRACK_TITLES.overall;
                    const titleIndex = Math.min(Math.max(0, level - 1), titles.length - 1);
                    rankTitle = titles[titleIndex];
                } else {
                    // สำหรับสายวิชาอื่น คำนวณจาก XP ได้เลย
                    const levelInfo = game.getLevelInfo(score, track);
                    level = levelInfo.level;
                    rankTitle = levelInfo.title;
                }

                const avatar = user.avatar || '🧑‍🎓';
                const isImage = avatar.includes('/') || avatar.includes('.');
                const avatarContent = isImage
                    ? `<img src="${avatar}" class="w-full h-full rounded-full object-cover">`
                    : `<span class="text-2xl sm:text-3xl">${avatar}</span>`;

                const levelBorderClass = getLevelBorderClass(level);
                const avatarFrameClass = getAvatarFrameClass(avatar, 'small');
                const avatarHtml = `
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 shadow-md ${levelBorderClass}">
                        <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${avatarFrameClass}">
                            ${avatarContent}
                        </div>
                    </div>
                `;

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

            // FIX: เพิ่ม listener เพื่อรอให้ animation เปิดจบก่อน
            // แล้วจึงปลดล็อกความสูง (max-height: none) เพื่อให้ accordion ย่อยขยายตัวได้
            const onTransitionEnd = () => {
                if (shopContent.style.opacity === "1") { // ตรวจสอบว่ายังเปิดอยู่
                    shopContent.style.maxHeight = "none";
                    shopContent.style.overflow = "visible";
                }
                shopContent.removeEventListener('transitionend', onTransitionEnd);
            };
            shopContent.addEventListener('transitionend', onTransitionEnd);
        }

        // หน่วงเวลาเล็กน้อยเพื่อให้ browser ได้ render layout ใหม่ก่อนเลื่อนจอ
        setTimeout(() => {
            shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Highlight effect: เพิ่มขอบสีเหลืองและขยายขนาดเล็กน้อยชั่วคราว
            shopSection.classList.add('ring-4', 'ring-yellow-400', 'scale-[1.02]', 'z-10');
            setTimeout(() => {
                shopSection.classList.remove('ring-4', 'ring-yellow-400', 'scale-[1.02]', 'z-10');
            }, 1500);
        }, 50);
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
                audio.play().catch(() => { }); // Ignore potential auto-play errors

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
            ? `<img src="${escapeHtml(avatar)}" alt="Avatar" class="w-8 h-8 rounded-full object-cover mx-auto">`
            : escapeHtml(avatar);

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

                    if (descEl) {
                        if (item.type === 'theme') {
                            descEl.innerHTML = `<span>${item.desc}</span>
                            <div class="mt-4 text-left text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                <span class="font-bold block mb-1 text-gray-700 dark:text-gray-200">สิ่งที่เปลี่ยนแปลง:</span>
                                <ul class="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                                    <li>สีหลักของปุ่มและไอคอน</li>
                                    <li>สีพื้นหลังและส่วนหัว (Header)</li>
                                    <li>สีไฮไลท์ข้อความและ Scrollbar</li>
                                    <li>เอฟเฟกต์เงาและการไล่ระดับสี</li>
                                </ul>
                            </div>`;
                        } else {
                            descEl.textContent = item.desc;
                        }
                    }

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
                audio.play().catch(() => { });

                // NEW: Play item flying animation
                const item = SHOP_ITEMS.find(i => i.id === currentItemId);
                const startEl = document.getElementById('shop-modal-icon');
                if (item && startEl) {
                    const rect = startEl.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    createPurchaseParticles(centerX, centerY);
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

    // Reset container classes
    container.className = 'flex flex-col gap-4';

    const inventory = game.getInventory();

    const categories = [
        { type: 'consumable', label: 'ไอเทม', icon: '⚡', desc: 'ตัวช่วยในการทำข้อสอบ' },
        { type: 'avatar', label: 'อวตาร', icon: '👤', desc: 'รูปโปรไฟล์แสดงตัวตน' },
        { type: 'theme', label: 'ธีม', icon: '🎨', desc: 'เปลี่ยนสีสันของแอป' },
        { type: 'title', label: 'ฉายา', icon: '🏷️', desc: 'ยศต่อท้ายชื่อ' }
    ];

    // 1. Render Tabs
    const tabsHtml = `
        <div class="flex space-x-2 overflow-x-auto pb-2 modern-scrollbar select-none" role="tablist">
            ${categories.map(cat => {
        const isActive = cat.type === activeShopTab;
        const activeClass = isActive
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md ring-2 ring-blue-200 dark:ring-blue-900 transform scale-105'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700';

        return `
                    <button 
                        class="shop-tab-btn flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 ${activeClass}"
                        data-type="${cat.type}"
                        role="tab"
                        aria-selected="${isActive}"
                    >
                        <span class="text-xl">${cat.icon}</span>
                        <span class="font-bold text-sm whitespace-nowrap">${cat.label}</span>
                    </button>
                `;
    }).join('')}
        </div>
    `;

    // 2. Render Active Category Content
    const activeCat = categories.find(c => c.type === activeShopTab) || categories[0];
    const items = SHOP_ITEMS.filter(item => item.type === activeCat.type);

    let contentHtml = '';

    if (items.length === 0) {
        contentHtml = `
            <div class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
                <p>ไม่มีสินค้าในหมวดหมู่นี้</p>
            </div>`;
    } else {
        const itemsGridHtml = items.map(item => {
            const isOwned = inventory.includes(item.id);
            const canBuy = game.state.xp >= item.cost;
            const isConsumable = item.type === 'consumable';
            const quantity = isConsumable ? game.getItemCount(item.id) : 0;

            let statusBadge = '';
            let cardOpacity = '';

            if (isOwned && !isConsumable) {
                statusBadge = `<span class="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 shadow-sm">ครอบครอง</span>`;
            } else if (isConsumable && quantity > 0) {
                statusBadge = `<span class="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 shadow-sm">มี ${quantity}</span>`;
            }

            const priceDisplay = (isOwned && !isConsumable)
                ? `<span class="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg> ซื้อแล้ว</span>`
                : `<div class="flex items-center gap-1 ${canBuy ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'} font-bold text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                     <span>${item.cost}</span> <span class="text-[10px] opacity-80">XP</span>
                   </div>`;

            return `
                <div class="shop-item-card relative bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center h-full ${cardOpacity}" data-id="${item.id}">
                    ${statusBadge}
                    <div class="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                        <div class="text-4xl transform group-hover:rotate-12 transition-transform duration-300 filter drop-shadow-sm relative z-10">${item.icon}</div>
                        <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h4 class="font-bold text-gray-800 dark:text-gray-100 text-sm w-full truncate px-1 mb-1 font-kanit">${item.name}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8 leading-tight w-full">${item.desc}</p>
                    <div class="mt-auto w-full flex justify-center">
                        ${priceDisplay}
                    </div>
                </div>
            `;
        }).join('');

        contentHtml = `
            <div class="anim-fade-in">
                <div class="mb-4 px-1 flex items-center justify-between">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 font-kanit">
                        ${activeCat.label}
                    </h3>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${activeCat.desc}</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-2">
                    ${itemsGridHtml}
                </div>
            </div>
        `;
    }

    container.innerHTML = tabsHtml + contentHtml;

    // Add Event Listeners for Tabs
    container.querySelectorAll('.shop-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeShopTab = btn.dataset.type;
            renderShop(game); // Re-render with new tab
        });
    });
}

function renderTrackProgress(game) {
    const container = document.getElementById('track-progress-container');
    if (!container) return;

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
                <span>${data.currentXP.toLocaleString()} / ${data.nextLevelXP ? data.nextLevelXP.toLocaleString() : 'MAX'} XP</span>
            </div>
        </div>
    `;

    // Dynamic rendering based on SiteConfig
    const colors = ['bg-purple-500', 'bg-teal-500', 'bg-blue-500', 'bg-orange-500', 'bg-pink-500'];
    const icons = ['🔭', '🌍', '⚛️', '🧪', '🧬'];

    container.innerHTML = SiteConfig.categories.map((cat, index) => {
        const xp = game.state[cat.id] || 0;
        const data = game.getLevelInfo(xp, cat.track);
        const color = colors[index % colors.length];
        const icon = icons[index % icons.length];
        return createTrackHTML(cat.label, data, color, icon);
    }).join('');
}

function renderBadges(game) {
    const container = document.getElementById('profile-badges-grid');
    if (!container) return;

    const earnedBadgeIds = game.state.badges;

    container.innerHTML = BADGES.map(badge => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        const progress = !isEarned ? getBadgeProgress(game, badge.id) : null;

        // Base classes
        let cardClasses = "badge-card relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group cursor-pointer overflow-hidden aspect-square";
        let iconClasses = "text-4xl sm:text-5xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3";
        let nameClasses = "text-[9px] sm:text-xs font-bold text-center w-full px-1 z-10 transition-colors leading-tight break-words";

        // Tier-specific styles
        let bgStyle = "";
        let borderStyle = "";
        let shadowStyle = "";
        let textStyle = "text-gray-700 dark:text-gray-300";

        if (isEarned) {
            if (badge.tier === 'gold') {
                bgStyle = "bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/10";
                borderStyle = "border-2 border-yellow-400 dark:border-yellow-600";
                shadowStyle = "shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40";
                textStyle = "text-yellow-800 dark:text-yellow-200";
            } else if (badge.tier === 'silver') {
                bgStyle = "bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800";
                borderStyle = "border-2 border-slate-300 dark:border-slate-500";
                shadowStyle = "shadow-lg shadow-slate-500/20 hover:shadow-slate-500/40";
                textStyle = "text-slate-700 dark:text-slate-300";
            } else { // bronze
                bgStyle = "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10";
                borderStyle = "border-2 border-orange-300 dark:border-orange-600";
                shadowStyle = "shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40";
                textStyle = "text-orange-800 dark:text-orange-200";
            }
            cardClasses += ` ${bgStyle} ${borderStyle} ${shadowStyle} hover:-translate-y-1`;
        } else {
            // Locked state
            cardClasses += " bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100";
            iconClasses += " grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70";
            textStyle = "text-gray-400 dark:text-gray-500";
        }

        // Progress Overlay / Shine Effect
        let overlayHtml = '';
        if (!isEarned) {
            if (progress) {
                const percent = Math.min(100, Math.max(0, (progress.current / progress.target) * 100));
                overlayHtml = `
                    <div class="absolute inset-x-0 bottom-0 h-1 bg-gray-200 dark:bg-gray-700">
                        <div class="h-full bg-blue-500 transition-all duration-500" style="width: ${percent}%"></div>
                    </div>
                `;
            } else {
                // Lock icon for untracked badges
                overlayHtml = `
                    <div class="absolute top-2 right-2 text-gray-300 dark:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                `;
            }
        } else {
            // Earned badge shine effect
            overlayHtml = `
                <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform ease-in-out" style="transition-duration: 0.7s;"></div>
            `;
        }

        return `
            <div class="${cardClasses}" data-id="${badge.id}">
                <div class="${iconClasses}">${badge.icon}</div>
                <div class="${nameClasses} ${textStyle}">${badge.name}</div>
                ${overlayHtml}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-3 hidden group-hover:block w-48 p-3 bg-gray-900/95 dark:bg-gray-800/95 text-white text-xs rounded-xl shadow-xl z-50 text-center pointer-events-none backdrop-blur-sm border border-gray-700 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <div class="font-bold text-${badge.tier === 'gold' ? 'yellow-400' : (badge.tier === 'silver' ? 'slate-300' : 'orange-300')} mb-1 text-sm">${badge.name}</div>
                    <div class="text-gray-300 leading-relaxed mb-2">${badge.desc}</div>
                    ${progress && !isEarned ? `
                        <div class="pt-2 border-t border-gray-700/50">
                            <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>ความคืบหน้า</span>
                                <span class="font-mono">${progress.current}/${progress.target} ${progress.label}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${(progress.current / progress.target) * 100}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    ${isEarned ? `<div class="mt-1 text-[10px] text-green-400 font-bold">✓ ได้รับแล้ว</div>` : ''}
                    <!-- Arrow -->
                    <div class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-gray-800/95 rotate-45 border-r border-b border-gray-700"></div>
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

        case 'earth_lover': return { current: game.getEarthLevel().level, target: 3, label: 'Lv' };
        case 'earth_expert': return { current: game.getEarthLevel().level, target: 5, label: 'Lv' };
        case 'earth_master': return { current: game.getEarthLevel().level, target: 10, label: 'Lv' };
        case 'physics_lover': return { current: game.getPhysicsLevel().level, target: 3, label: 'Lv' };
        case 'physics_expert': return { current: game.getPhysicsLevel().level, target: 5, label: 'Lv' };
        case 'physics_master': return { current: game.getPhysicsLevel().level, target: 10, label: 'Lv' };
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
    const recentContainer = document.getElementById('recent-badges');
    const modal = new ModalHandler('badge-details-modal');

    const handleBadgeClick = (e) => {
        const card = e.target.closest('.badge-card, .recent-badge-item');
        if (card && card.dataset.id) {
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

                    // Add pop animation for smoother feel
                    iconEl.classList.remove('anim-item-pop');
                    void iconEl.offsetWidth; // Force reflow
                    iconEl.classList.add('anim-item-pop');
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
    };

    if (container) container.addEventListener('click', handleBadgeClick);
    if (recentContainer) recentContainer.addEventListener('click', handleBadgeClick);
}

function renderAchievements(game) {
    const container = document.getElementById('profile-achievements-list');
    if (!container) return;

    const unlockedIds = game.state.unlockedAchievements || [];

    container.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlockedIds.includes(ach.id);

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
        } else if (ach.type === 'theory_xp') {
            currentProgress = game.state.theoryXP || 0;
        } else if (ach.type === 'calculation_xp') {
            currentProgress = game.state.calculationXP || 0;
        } else if (ach.type === 'item_usage') {
            currentProgress = game.state.itemUsageCount || 0;
        } else if (ach.type === 'total_xp') {
            currentProgress = game.state.xp || 0;
        }

        const percent = Math.min(100, Math.max(0, (currentProgress / ach.target) * 100));

        // Base classes
        let cardClasses = "achievement-card relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group cursor-pointer overflow-hidden aspect-square";
        let iconClasses = "text-4xl sm:text-5xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3";
        let nameClasses = "text-[9px] sm:text-xs font-bold text-center w-full px-1 z-10 transition-colors leading-tight break-words";

        // Styles
        let bgStyle = "";
        let borderStyle = "";
        let shadowStyle = "";
        let textStyle = "text-gray-700 dark:text-gray-300";

        if (isUnlocked) {
            bgStyle = "bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/10";
            borderStyle = "border-2 border-purple-300 dark:border-purple-600";
            shadowStyle = "shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40";
            textStyle = "text-purple-800 dark:text-purple-200";
            cardClasses += ` ${bgStyle} ${borderStyle} ${shadowStyle} hover:-translate-y-1`;
        } else {
            cardClasses += " bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100";
            iconClasses += " grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70";
            textStyle = "text-gray-400 dark:text-gray-500";
        }

        // Progress Overlay / Shine Effect
        let overlayHtml = '';
        if (!isUnlocked) {
            overlayHtml = `
                <div class="absolute inset-x-0 bottom-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div class="h-full bg-blue-500 transition-all duration-500" style="width: ${percent}%"></div>
                </div>
            `;
        } else {
            overlayHtml = `
                <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform ease-in-out" style="transition-duration: 0.7s;"></div>
            `;
        }

        return `
            <div class="${cardClasses}" data-id="${ach.id}" title="${ach.title}">
                <div class="${iconClasses}">${ach.icon}</div>
                <div class="${nameClasses} ${textStyle}">${ach.title}</div>
                ${overlayHtml}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-3 hidden group-hover:block w-48 p-3 bg-gray-900/95 dark:bg-gray-800/95 text-white text-xs rounded-xl shadow-xl z-50 text-center pointer-events-none backdrop-blur-sm border border-gray-700 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <div class="font-bold text-purple-300 mb-1 text-sm">${ach.title}</div>
                    <div class="text-gray-300 leading-relaxed mb-2">${ach.desc}</div>
                    ${!isUnlocked ? `
                        <div class="pt-2 border-t border-gray-700/50">
                            <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>ความคืบหน้า</span>
                                <span class="font-mono">${currentProgress}/${ach.target}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${percent}%"></div>
                            </div>
                        </div>
                    ` : `<div class="mt-1 text-[10px] text-green-400 font-bold">✓ ปลดล็อกแล้ว</div>`}
                    ${ach.rewardTitle ? `<div class="mt-2 pt-2 border-t border-gray-700/50 text-[10px] text-yellow-400">🎁 รางวัล: ${ach.rewardTitle}</div>` : ''}
                    <!-- Arrow -->
                    <div class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-gray-800/95 rotate-45 border-r border-b border-gray-700"></div>
                </div>
            </div>
        `;
    }).join('');
}

function setupAchievementInteractions(game) {
    const container = document.getElementById('profile-achievements-list');
    const modal = new ModalHandler('achievement-details-modal');

    if (!container) return;

    container.addEventListener('click', (e) => {
        const card = e.target.closest('.achievement-card');
        if (card && card.dataset.id) {
            const achId = card.dataset.id;
            const ach = ACHIEVEMENTS.find(a => a.id === achId);
            if (ach) {
                const unlockedIds = game.state.unlockedAchievements || [];
                const isUnlocked = unlockedIds.includes(achId);

                const iconEl = document.getElementById('achievement-modal-icon');
                const nameEl = document.getElementById('achievement-modal-name');
                const descEl = document.getElementById('achievement-modal-desc');
                const statusEl = document.getElementById('achievement-modal-status');

                // Calculate Progress (Dry-run logic from renderAchievements)
                let currentProgress = 0;
                if (ach.type === 'level') currentProgress = game.getCurrentLevel().level;
                else if (ach.type === 'total_correct') currentProgress = game.state.totalCorrectAnswers || 0;
                else if (ach.type === 'total_quizzes') currentProgress = game.state.quizzesCompleted || 0;
                else if (ach.type === 'total_items') currentProgress = game.getInventory().length;
                else if (ach.type === 'total_avatars') {
                    currentProgress = game.getInventory().filter(id => {
                        const item = SHOP_ITEMS.find(i => i.id === id);
                        return item && item.type === 'avatar';
                    }).length;
                } else if (ach.type === 'high_scores_80') currentProgress = game.state.highScores80 || 0;
                else if (ach.type === 'perfect_scores') currentProgress = game.state.perfectScores || 0;
                else if (ach.type === 'theory_xp') currentProgress = game.state.theoryXP || 0;
                else if (ach.type === 'calculation_xp') currentProgress = game.state.calculationXP || 0;
                else if (ach.type === 'item_usage') currentProgress = game.state.itemUsageCount || 0;
                else if (ach.type === 'total_xp') currentProgress = game.state.xp || 0;

                const percent = Math.min(100, Math.max(0, (currentProgress / ach.target) * 100));

                if (iconEl) {
                    iconEl.textContent = ach.icon;
                    if (isUnlocked) iconEl.classList.remove('grayscale', 'opacity-50');
                    else iconEl.classList.add('grayscale', 'opacity-50');
                }

                if (nameEl) nameEl.textContent = ach.title;

                if (descEl) {
                    let descHtml = `<div class="mb-4">${ach.desc}</div>`;
                    if (!isUnlocked) {
                        descHtml += `
                            <div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-bold">
                                    <span>ความคืบหน้า</span>
                                    <span>${currentProgress.toLocaleString()} / ${ach.target.toLocaleString()}</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                                    <div class="bg-blue-500 h-full transition-all duration-700" style="width: ${percent}%"></div>
                                </div>
                            </div>
                        `;
                    }
                    descEl.innerHTML = descHtml;
                }

                if (statusEl) {
                    if (isUnlocked) {
                        let statusHtml = '<div class="space-y-2">';
                        statusHtml += '<span class="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-bold block w-fit mx-auto">✓ ปลดล็อกแล้ว</span>';
                        if (ach.rewardTitle) {
                            statusHtml += `<div class="text-xs text-yellow-600 dark:text-yellow-400 font-bold">🎁 รางวัล: ฉายา "《 ${ach.rewardTitle} 》"</div>`;
                        }
                        statusHtml += '</div>';
                        statusEl.innerHTML = statusHtml;
                    } else {
                        statusEl.innerHTML = '<span class="px-3 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-sm font-bold">ยังไม่ปลดล็อก</span>';
                    }
                }

                modal.open();
            }
        }
    });
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

async function renderRadarChart(game, allProgress = null, mode = 'overall') {
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
        const CACHE_KEY = `radar_chart_data_v2_${mode}`; // Use mode-specific cache
        const LAST_COMPLETED_KEY = 'last_quiz_completed_timestamp'; // This key should be updated when a quiz is finished

        const lastCompletionTime = localStorage.getItem(LAST_COMPLETED_KEY) || '0';
        let cachedData = null;
        const cachedItem = localStorage.getItem(CACHE_KEY);
        //const cachedData = cachedItem ? JSON.parse(cachedItem) : null;
        if (cachedItem) {
            try {
                cachedData = JSON.parse(cachedItem);
            } catch (e) {
                console.warn('Could not parse radar chart cache. Recalculating...', e);
                localStorage.removeItem(CACHE_KEY); // Clear corrupted cache
            }
        }

        // Cleanup old cache
        localStorage.removeItem('radar_chart_data_cache');

        let stats;

        if (cachedData && cachedData.timestamp >= lastCompletionTime) {
            // Use cached data
            console.log(`Using cached radar chart data for ${mode}.`);
            stats = cachedData.stats;
        } else {
            // Recalculate data
            console.log(`Recalculating radar chart data for mode: ${mode}`);
            if (!allProgress) allProgress = await getDetailedProgressForAllQuizzes();

            const newStats = {};

            // Define Groups based on Mode
            let groupsToUse = {};
            if (mode === 'overall') {
                groupsToUse = PROFICIENCY_GROUPS;
            } else if (mode.startsWith('physics_')) {
                const grade = mode.split('_')[1]; // m4, m5, m6
                const syllabus = subCategoryData.Physics[grade];
                if (syllabus && syllabus.chapters) {
                    syllabus.chapters.forEach((ch, idx) => {
                        const title = ch.shortTitle || ch.title.split(':')[0];
                        groupsToUse[title] = { label: title, keywords: [ch.title] };
                    });
                }
            } else if (mode === 'earth_basic') {
                const syllabus = subCategoryData.EarthSpaceScienceBasic;
                if (syllabus && syllabus.units) {
                    syllabus.units.forEach(unit => {
                        unit.chapters.forEach(ch => {
                            const title = ch.shortTitle || ch.title;
                            groupsToUse[title] = { label: title, keywords: [ch.title] };
                        });
                    });
                }
            } else if (mode === 'earth_adv') {
                const syllabus = subCategoryData.EarthSpaceScienceAdvance;
                if (syllabus && syllabus.chapters) {
                    syllabus.chapters.forEach(ch => {
                        const title = ch.shortTitle || ch.title;
                        groupsToUse[title] = { label: title, keywords: [ch.title] };
                    });
                }
            } else if (mode === 'physics') {
                // Legacy fallback if needed
                groupsToUse = PROFICIENCY_GROUPS;
            } else if (mode === 'earth') {
                groupsToUse = PROFICIENCY_GROUPS;
            }

            Object.keys(groupsToUse).forEach(key => {
                newStats[key] = { correct: 0, total: 0, label: groupsToUse[key].label };
            });

            allProgress.forEach(quiz => {
                if (!quiz.userAnswers) return;

                quiz.userAnswers.forEach(ans => {
                    if (ans) {
                        let subCatStr = '';
                        if (ans.subCategory) {
                            if (typeof ans.subCategory === 'string') subCatStr = ans.subCategory;
                            else if (ans.subCategory.main) {
                                subCatStr = ans.subCategory.main;
                                if (ans.subCategory.specific) {
                                    const specific = Array.isArray(ans.subCategory.specific) ? ans.subCategory.specific.join(' ') : ans.subCategory.specific;
                                    subCatStr += ' ' + specific;
                                }
                            }
                        }
                        subCatStr += ' ' + (ans.sourceQuizCategory || quiz.category || '');
                        subCatStr = subCatStr.toLowerCase();

                        const matches = (text, keywords) => keywords.some(k => text.includes(k.toLowerCase()));

                        for (const [groupKey, groupDef] of Object.entries(groupsToUse)) {
                            if (matches(subCatStr, groupDef.keywords)) {
                                newStats[groupKey].total++;
                                if (ans.isCorrect) newStats[groupKey].correct++;
                            }
                        }
                    }
                });
            });

            stats = newStats;

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: new Date().getTime(),
                stats: stats
            }));
        }

        // 2. Calculate Percentages 
        const labels = Object.values(stats).map(s => s.label);
        const dataPoints = Object.values(stats).map(s => {
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
                            label: function (context) {
                                const key = Object.keys(stats)[context.dataIndex];
                                const s = stats[key] || { correct: 0, total: 0 };
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

function setupHistoryRangeSystem(game, allProgress) {
    const buttons = document.querySelectorAll('.history-range-btn');
    if (buttons.length === 0) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const range = btn.dataset.range;
            if (range === activeHistoryRange) return;

            // UI Update
            buttons.forEach(b => {
                b.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow', 'text-blue-600', 'dark:text-blue-300');
                b.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200');
            });
            btn.classList.add('bg-white', 'dark:bg-gray-600', 'shadow', 'text-blue-600', 'dark:text-blue-300');
            btn.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200');

            activeHistoryRange = range;
            const loader = document.getElementById('history-chart-loader');
            if (loader) loader.classList.remove('hidden');

            await renderProficiencyHistoryChart(game, allProgress, activeHistoryRange);
            if (loader) loader.classList.add('hidden');
        });
    });
}

function setupProficiencyModeSystem(game, allProgress) {
    const select = document.getElementById('proficiency-mode-select');
    if (!select) return;

    select.addEventListener('change', async (e) => {
        const mode = e.target.value;
        if (mode === activeProficiencyMode) return;

        activeProficiencyMode = mode;
        const loader = document.getElementById('radar-chart-loader');
        if (loader) loader.classList.remove('hidden');

        await renderRadarChart(game, allProgress, activeProficiencyMode);
        if (loader) loader.classList.add('hidden');
    });
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
    flyer.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)';

    const startRect = startElement.getBoundingClientRect();

    // Center of start element
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    flyer.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
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
        flyer.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(720deg)'; // Shrink and spin
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

function createPurchaseParticles(x, y) {
    const colors = ['#FBBF24', '#F59E0B', '#3B82F6', '#60A5FA', '#FFFFFF'];
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'fixed z-[10001] rounded-full pointer-events-none';
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.boxShadow = `0 0 10px ${particle.style.backgroundColor}`;

        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        const animation = particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        });

        animation.onfinish = () => particle.remove();
    }
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

async function renderProficiencyHistoryChart(game, allProgress = null, range = 'all') {
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
        if (!allProgress) allProgress = await getDetailedProgressForAllQuizzes();

        // Prepare data structure: { 'Mechanics': [{date, score}, ...], ... }
        const historyData = {};
        Object.keys(PROFICIENCY_GROUPS).forEach(key => {
            historyData[key] = [];
        });

        // Calculate cutoff date if range is not 'all'
        let cutoffDate = null;
        if (range !== 'all') {
            const days = parseInt(range);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
        }

        // Process all quizzes
        allProgress.forEach(quiz => {
            if (!quiz.userAnswers || !quiz.lastAttemptTimestamp) return;

            const quizDate = new Date(quiz.lastAttemptTimestamp);
            if (cutoffDate && quizDate < cutoffDate) return; // Skip if out of range

            // Determine which group this quiz belongs to
            // We use the first answer's subcategory or quiz category to match keywords
            let matchedGroup = null;
            const firstAnswer = quiz.userAnswers.find(a => a);

            let searchString = (quiz.category || '').toLowerCase();
            if (firstAnswer && firstAnswer.subCategory) {
                if (typeof firstAnswer.subCategory === 'string') {
                    searchString += ' ' + firstAnswer.subCategory.toLowerCase();
                } else {
                    searchString += ' ' + (firstAnswer.subCategory.main || '').toLowerCase() + ' ' + (firstAnswer.subCategory.specific || '').toLowerCase();
                }
            }

            const matches = (text, keywords) => {
                if (!text) return false;
                const lowerText = text.toLowerCase();
                return keywords.some(k => lowerText.includes(k.toLowerCase()));
            };
            const matchedGroups = [];

            for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                if (matches(searchString, groupDef.keywords)) {
                    matchedGroups.push(groupKey);
                    // No break here. A quiz can appear in multiple history lines if it spans topics.
                }
            }

            matchedGroups.forEach(matchedGroup => {
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
                            unit: range === '7' ? 'day' : (range === '14' ? 'day' : (range === '30' ? 'week' : 'month')),
                            displayFormats: {
                                day: 'd MMM',
                                week: 'd MMM',
                                month: 'MMM yyyy'
                            },
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

async function renderStrengthsWeaknesses(allProgress = null) {
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');
    const loader = document.getElementById('strengths-weaknesses-loader');

    if (!strengthsList || !weaknessesList) {
        if (loader) loader.classList.add('hidden');
        return false;
    }

    try {
        const CACHE_KEY = 'strengths_weaknesses_cache_v3'; // Bump version to force refresh
        const LAST_COMPLETED_KEY = 'last_quiz_completed_timestamp';

        const lastCompletionTime = localStorage.getItem(LAST_COMPLETED_KEY) || '0';
        let cachedData = null;
        const cachedItem = localStorage.getItem(CACHE_KEY);
        if (cachedItem) {
            try {
                cachedData = JSON.parse(cachedItem);
            } catch (e) {
                console.warn('Could not parse strengths/weaknesses cache. Recalculating...', e);
                localStorage.removeItem(CACHE_KEY);
            }
        }

        // Cleanup old cache keys
        localStorage.removeItem('strengths_weaknesses_cache');
        localStorage.removeItem('strengths_weaknesses_cache_v2');

        let analysis;
        if (cachedData && cachedData.timestamp >= lastCompletionTime) {
            analysis = cachedData.analysis;
        } else {
            analysis = await calculateStrengthsAndWeaknesses(allProgress);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: new Date().getTime(), analysis: analysis }));
        }

        const { strengths, weaknesses } = analysis;

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