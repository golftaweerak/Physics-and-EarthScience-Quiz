import { Gamification } from './gamification.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Gamification();
    const levelInfo = game.getCurrentLevel();
    
    // Update Level & Rank UI
    setText('user-level', levelInfo.level);
    setText('user-rank-title', levelInfo.title);
    setText('current-xp', levelInfo.currentXP.toLocaleString());
    
    // Update Progress Bar
    if (levelInfo.nextLevelXP) {
        setText('next-level-xp', levelInfo.nextLevelXP.toLocaleString());
        const progress = levelInfo.progressPercent;
        const bar = document.getElementById('xp-progress-bar');
        if (bar) bar.style.width = `${progress}%`;
    } else {
        setText('next-level-xp', 'MAX');
        const bar = document.getElementById('xp-progress-bar');
        if (bar) bar.style.width = '100%';
    }

    // Update Recent Badges
    const recentBadges = game.getEarnedBadges().slice(-3).reverse(); // Get last 3 badges
    const badgesContainer = document.getElementById('recent-badges');
    if (badgesContainer) {
        if (recentBadges.length === 0) {
            badgesContainer.innerHTML = '<span class="text-sm text-gray-400">ยังไม่มีเหรียญรางวัล</span>';
        } else {
            badgesContainer.innerHTML = recentBadges.map(b => `
                <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xl shadow-sm border border-yellow-200 dark:border-yellow-700/50 transition-transform hover:scale-110 cursor-help" title="${b.name}: ${b.desc}">
                    ${b.icon}
                </div>
            `).join('');
        }
    }
});

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}