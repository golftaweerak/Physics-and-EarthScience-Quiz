// scripts/gamification-controller.js
import { Gamification, LEVELS, BADGES } from './gamification.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Gamification();
    renderGamificationDashboard(game);
});

function renderGamificationDashboard(game) {
    const overall = game.getCurrentLevel();
    const physics = game.getPhysicsLevel();
    const earth = game.getEarthLevel();
    const earnedBadges = game.getEarnedBadges();

    // 1. Update Level & Title
    const levelEl = document.getElementById('user-level');
    const titleEl = document.getElementById('user-rank-title');
    
    if (levelEl) levelEl.textContent = overall.level;
    if (titleEl) titleEl.textContent = overall.title;

    // 2. Update XP Bar
    const currentXpEl = document.getElementById('current-xp');
    const nextXpEl = document.getElementById('next-level-xp');
    const progressBar = document.getElementById('xp-progress-bar');

    if (currentXpEl) currentXpEl.textContent = overall.currentXP;
    
    if (overall.nextLevelXP) {
        if (nextXpEl) nextXpEl.textContent = overall.nextLevelXP;
        if (progressBar) progressBar.style.width = `${overall.progressPercent}%`;
    } else {
        if (nextXpEl) nextXpEl.textContent = "MAX";
        if (progressBar) progressBar.style.width = "100%";
    }

    // 3. Render Track Specific Bars (Physics & Earth)
    renderTrackBars(physics, earth);

    // 4. Render Daily Quest
    renderDailyQuest(game);

    // 5. Update Badges
    const badgeContainer = document.getElementById('recent-badges');
    if (badgeContainer) {
        badgeContainer.innerHTML = '';
        if (earnedBadges.length === 0) {
            badgeContainer.innerHTML = `<span class="text-sm text-gray-400 italic">ยังไม่มีเหรียญรางวัล เริ่มทำแบบทดสอบเลย!</span>`;
        } else {
            // Show up to 3 recent badges
            const recent = earnedBadges.slice(-3).reverse();
            recent.forEach(badge => {
                let tierClasses = "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50"; // Gold (Default)
                
                if (badge.tier === 'silver') {
                    tierClasses = "bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600";
                } else if (badge.tier === 'bronze') {
                    tierClasses = "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700/50";
                }

                const badgeEl = document.createElement('div');
                badgeEl.className = `flex flex-col items-center justify-center w-12 h-12 rounded-full border shadow-sm tooltip-trigger relative group cursor-help shimmer-effect ${tierClasses}`;
                badgeEl.innerHTML = `
                    <span class="text-xl">${badge.icon}</span>
                    <!-- Tooltip -->
                    <div class="absolute bottom-full mb-2 hidden group-hover:block w-32 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-20 text-center">
                        <div class="font-bold text-yellow-400">${badge.name}</div>
                        <div>${badge.desc}</div>
                    </div>
                `;
                badgeContainer.appendChild(badgeEl);
            });
        }
    }
}

function renderTrackBars(physics, earth) {
    const dashboard = document.getElementById('gamification-dashboard');
    if (!dashboard) return;

    let trackContainer = document.getElementById('track-stats-container');
    if (!trackContainer) {
        trackContainer = document.createElement('div');
        trackContainer.id = 'track-stats-container';
        trackContainer.className = "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10";
        
        // Append to the dashboard content
        const contentGrid = dashboard.querySelector('.relative.z-10');
        if (contentGrid) {
            contentGrid.appendChild(trackContainer);
            // Adjust grid layout to span full width
            trackContainer.classList.add('col-span-1', 'md:col-span-3');
        }
    }

    trackContainer.innerHTML = `
        <!-- Physics Track -->
        <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">Physics Lv.${physics.level}</span>
                <span class="text-xs text-purple-600 dark:text-purple-400">${physics.currentXP} XP</span>
            </div>
            <div class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 truncate">${physics.title}</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="bg-purple-500 h-2 rounded-full transition-all duration-1000" style="width: ${physics.progressPercent}%"></div>
            </div>
        </div>

        <!-- Earth Science Track -->
        <div class="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">Earth Lv.${earth.level}</span>
                <span class="text-xs text-teal-600 dark:text-teal-400">${earth.currentXP} XP</span>
            </div>
            <div class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 truncate">${earth.title}</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="bg-teal-500 h-2 rounded-full transition-all duration-1000" style="width: ${earth.progressPercent}%"></div>
            </div>
        </div>
    `;
}

function renderDailyQuest(game) {
    const dashboard = document.getElementById('gamification-dashboard');
    if (!dashboard) return;
    
    let questContainer = document.getElementById('daily-quest-container');
    if (!questContainer) {
        questContainer = document.createElement('div');
        questContainer.id = 'daily-quest-container';
        questContainer.className = "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 relative z-10";
        // Append to content grid
        const contentGrid = dashboard.querySelector('.relative.z-10');
        if (contentGrid) {
            contentGrid.appendChild(questContainer);
            questContainer.classList.add('col-span-1', 'md:col-span-3');
        }
    }

    const quests = game.state.activeQuests || [];
    if (quests.length === 0) {
        questContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm text-center py-4">ไม่มีภารกิจในขณะนี้</p>';
        return;
    }

    let html = `<div class="flex justify-between items-center mb-3 px-1">
        <h4 class="font-bold text-gray-800 dark:text-gray-100 font-kanit">ภารกิจประจำวัน</h4>
        <span class="text-xs text-gray-500 dark:text-gray-400">รีเซ็ตทุกเที่ยงคืน</span>
    </div>`;
    
    html += `<div class="grid grid-cols-1 gap-3">`;

    quests.forEach((q, index) => {
        const percent = Math.min(100, (q.progress / q.target) * 100);
        const statusColor = q.completed ? 'bg-green-500' : 'bg-blue-500';
        const statusText = q.completed ? 'สำเร็จแล้ว!' : `${q.progress} / ${q.target}`;
        const canReroll = !q.completed && game.state.rerolls > 0;

        html += `
        <div class="bg-white dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2 transition-all hover:border-blue-300 dark:hover:border-blue-600">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-2">
                    <span class="text-xl">📜</span>
                    <span class="text-sm font-bold text-gray-800 dark:text-gray-200">${q.desc}</span>
                </div>
                ${canReroll ? 
                    `<button class="reroll-quest-btn text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30" data-index="${index}" title="เปลี่ยนภารกิจ">
                        <svg class="h-4 w-4 flex-shrink-0 pointer-events-none" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>` : ''}
            </div>
            
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="${statusColor} h-2 rounded-full transition-all duration-500 relative" style="width: ${percent}%">
                        ${!q.completed ? '<div class="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>' : ''}
                </div>
            </div>
            
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span>${statusText}</span>
                <span class="font-bold text-yellow-600 dark:text-yellow-400">+${q.xp} XP</span>
            </div>
        </div>
        `;
    });
    html += `</div>`;

    if (game.state.rerolls > 0) {
        html += `<div class="text-right mt-2 text-xs text-gray-400 dark:text-gray-500">เปลี่ยนภารกิจได้อีก ${game.state.rerolls} ครั้ง</div>`;
    }

    questContainer.innerHTML = html;

    // Bind events for reroll buttons
    questContainer.querySelectorAll('.reroll-quest-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.dataset.index);
            
            setTimeout(() => {
                if (confirm("ต้องการเปลี่ยนภารกิจนี้ใช่หรือไม่?")) {
                    const icon = btn.querySelector('svg');
                    if (icon) icon.classList.add('animate-spin');
                    btn.disabled = true;

                    setTimeout(() => {
                        const res = game.rerollQuest(idx);
                        if (res.success) {
                            renderDailyQuest(game);
                        } else {
                            if (icon) icon.classList.remove('animate-spin');
                            btn.disabled = false;
                            alert(res.message);
                        }
                    }, 500);
                }
            }, 50);
        });
    });
}

// Expose helper for testing in console
window.debugAddXP = (amount) => {
    const game = new Gamification();
    const result = game.addXP(amount);
    console.log("XP Added:", result);
    renderGamificationDashboard(game);
};