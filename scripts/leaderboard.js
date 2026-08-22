import { authManager } from './auth-manager.js';
import { db } from './firebase-config.js';
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore";
import { XP_THRESHOLDS, TRACK_TITLES, PROFICIENCY_GROUPS, getLevelBorderClass, getAvatarFrameClass } from './gamification.js';
import { openProfileModal } from './profile-modal.js';

function getLevelInfoForLeaderboard(xp, type) {
    let track = 'overall';
    if (type === 'physicsTrackXP') track = 'physics';
    if (type === 'earthTrackXP') track = 'earth';

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

export async function initializeLeaderboard() {
    const listContainer = document.getElementById('leaderboard-list-full');
    const tabs = document.querySelectorAll('.leaderboard-tab');

    if (!listContainer || tabs.length === 0) return;

    const renderList = async (type) => {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg class="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>กำลังโหลดอันดับ...</span>
            </div>
        `;

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy(type, 'desc'), limit(50)); // Fetch top 50
            const querySnapshot = await authManager.retryOperation(() => getDocs(q));

            const leaderboard = [];
            querySnapshot.forEach((doc) => {
                leaderboard.push({ id: doc.id, ...doc.data() });
            });

            if (leaderboard.length === 0) {
                listContainer.innerHTML = `<div class="text-center py-16 text-gray-500">ยังไม่มีข้อมูลการจัดอันดับ</div>`;
                return;
            }

            const currentUser = authManager?.currentUser;
            const currentUserId = currentUser ? currentUser.uid : null;
            const localState = await authManager.loadUserData() || {};

            const userInTop50 = leaderboard.some(u => u.id === currentUserId);
            let userRankData = null;

            if (!userInTop50 && currentUserId) {
                try {
                    const userScore = localState[type] || 0;
                    const rankQuery = query(usersRef, where(type, '>', userScore));
                    const snapshot = await authManager.retryOperation(() => getCountFromServer(rankQuery));
                    const rank = snapshot.data().count + 1;

                    userRankData = {
                        rank: rank,
                        id: currentUserId,
                        displayName: localState.displayName,
                        avatar: localState.avatar,
                        selectedTitle: localState.selectedTitle,
                        score: userScore,
                        isMe: true
                    };
                } catch (err) {
                    console.warn("Failed to fetch user rank:", err);
                }
            }

            // --- Rank Change Logic (Local Tracking) ---
            let myRankChange = null;
            if (currentUserId) {
                let currentRank = null;
                if (userInTop50) {
                    currentRank = leaderboard.findIndex(u => u.id === currentUserId) + 1;
                } else if (userRankData) {
                    currentRank = userRankData.rank;
                }

                if (currentRank) {
                    const storageKey = `lb_last_rank_${type}_${currentUserId}`;
                    const lastData = JSON.parse(localStorage.getItem(storageKey));

                    if (lastData) {
                        // Calculate change: Old Rank - New Rank (e.g. 5 - 3 = +2 means Up 2)
                        myRankChange = lastData.rank - currentRank;
                    }

                    // Save current rank for next comparison
                    localStorage.setItem(storageKey, JSON.stringify({ rank: currentRank, timestamp: Date.now() }));
                }
            }

            const renderRow = (user, rank, isMe) => {
                // Rank Change UI
                let changeHtml = '';
                const change = isMe ? myRankChange : (user.rankChange || null); // Support future server-side data for others

                if (change !== null && change !== 0) {
                    const isUp = change > 0;
                    const colorClass = isUp ? 'text-green-500' : 'text-red-500';
                    const icon = isUp ? '▲' : '▼';
                    changeHtml = `<div class="text-[10px] font-bold ${colorClass} flex items-center justify-center -mt-1">${icon} ${Math.abs(change)}</div>`;
                } else if (change === 0) {
                    changeHtml = `<div class="text-[10px] font-bold text-gray-400 flex items-center justify-center -mt-1">-</div>`;
                }

                let rankIcon = rank;
                let rankClass = "text-gray-500 text-lg";

                if (rank === 1) { rankIcon = '🥇'; rankClass = "text-3xl"; }
                else if (rank === 2) { rankIcon = '🥈'; rankClass = "text-3xl"; }
                else if (rank === 3) { rankIcon = '🥉'; rankClass = "text-3xl"; }

                const rankDisplay = `
                    <div class="flex flex-col items-center justify-center w-8">
                        <span class="font-bold ${rankClass}">${rankIcon}</span>
                        ${changeHtml}
                    </div>
                `;

                let score;
                if (isMe && user.score !== undefined) {
                    score = user.score;
                } else {
                    score = user[type] || 0;
                    // On-the-fly calculation to fix display for stale data
                    if (type === 'physicsTrackXP') {
                        let calculatedPhysicsXP = 0;
                        for (const group of Object.values(PROFICIENCY_GROUPS)) {
                            if (group.track === 'physics') {
                                calculatedPhysicsXP += (user[group.field] || 0);
                            }
                        }
                        score = Math.max(score, calculatedPhysicsXP);
                    } else if (type === 'earthTrackXP') {
                        let calculatedEarthXP = 0;
                        for (const group of Object.values(PROFICIENCY_GROUPS)) {
                            if (group.track === 'earth') {
                                calculatedEarthXP += (user[group.field] || 0);
                            }
                        }
                        score = Math.max(score, calculatedEarthXP);
                    } else if (type === 'posnEarthTrackXP') {
                        let calculatedPosnEarthXP = 0;
                        for (const group of Object.values(PROFICIENCY_GROUPS)) {
                            if (group.track === 'posn_earth') {
                                calculatedPosnEarthXP += (user[group.field] || 0);
                            }
                        }
                        score = Math.max(score, calculatedPosnEarthXP);
                    } else if (type === 'posnAstroTrackXP') {
                        let calculatedPosnAstroXP = 0;
                        for (const group of Object.values(PROFICIENCY_GROUPS)) {
                            if (group.track === 'posn_astro') {
                                calculatedPosnAstroXP += (user[group.field] || 0);
                            }
                        }
                        score = Math.max(score, calculatedPosnAstroXP);
                    }
                }

                const scoreFormatted = score.toLocaleString();
                let level, rankTitle;

                if (type === 'xp') {
                    // For 'overall' XP, use the user's actual stored level, as it depends on quests.
                    level = user.level || 1;
                    const titles = TRACK_TITLES.overall;
                    const titleIndex = Math.min(level - 1, titles.length - 1);
                    rankTitle = titles[titleIndex];
                } else {
                    // For specific tracks, level is calculated purely from XP.
                    const levelInfo = getLevelInfoForLeaderboard(score, type);
                    level = levelInfo.level;
                    rankTitle = levelInfo.title;
                }

                const avatar = user.avatar || '🧑‍🎓';
                const isImage = avatar.includes('/') || avatar.includes('.');
                const avatarContent = isImage
                    ? `<img src="${avatar}" class="w-full h-full rounded-full object-cover">`
                    : `<span class="text-3xl">${avatar}</span>`;

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
                    <div onclick="window.openProfileModal(this)" data-user='${JSON.stringify(user).replace(/'/g, "&#39;")}' class="cursor-pointer flex items-center gap-4 p-3 rounded-xl ${isMe ? 'bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/50 dark:border-blue-700 shadow-lg scale-[1.01] z-10 relative' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'} transition-all duration-200">
                        <div class="flex-shrink-0">${rankDisplay}</div>
                        <div class="flex-shrink-0">${avatarHtml}</div>
                        <div class="flex-grow min-w-0 flex flex-col justify-center">
                            <div class="font-bold text-lg text-gray-800 dark:text-gray-200 truncate">
                                ${user.displayName || 'ผู้เรียน'} ${isMe ? '<span class="text-sm text-blue-600 dark:text-blue-400 ml-1">(คุณ)</span>' : ''}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2">
                                <span class="font-bold text-gray-600 dark:text-gray-300">(Lv.${level})</span>
                                <span class="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">${rankTitle}</span>
                                ${user.selectedTitle ? `<span class="hidden sm:inline text-gray-400 dark:text-gray-600">•</span> <span class="truncate max-w-[150px] sm:max-w-none">《 ${user.selectedTitle} 》</span>` : ''}
                            </div>
                        </div>
                        <div class="flex-shrink-0 text-right">
                            <div class="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
                                ${scoreFormatted}
                            </div>
                            <div class="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">XP</div>
                        </div>
                    </div>
                `;
            };

            // Expose function globally for the onclick handler
            window.openProfileModal = (element) => {
                try {
                    const userData = JSON.parse(element.dataset.user);
                    openProfileModal(userData);
                } catch (e) { console.error("Error opening profile", e); }
            };

            let listHtml = leaderboard.map((user, index) => renderRow(user, index + 1, user.id === currentUserId)).join('');

            if (userRankData) {
                listHtml += `
                    <div class="flex items-center justify-center py-2 opacity-60">
                        <div class="h-1.5 w-1.5 bg-gray-400 rounded-full mx-1"></div>
                        <div class="h-1.5 w-1.5 bg-gray-400 rounded-full mx-1"></div>
                        <div class="h-1.5 w-1.5 bg-gray-400 rounded-full mx-1"></div>
                    </div>
                    ${renderRow(userRankData, userRankData.rank, true)}
                `;
            }

            listContainer.innerHTML = listHtml;

        } catch (error) {
            console.error("Leaderboard error:", error);
            listContainer.innerHTML = `<div class="text-center py-16 text-red-500">ไม่สามารถโหลดข้อมูลได้<br>กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</div>`;
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.className = "leaderboard-tab whitespace-nowrap py-2 px-4 rounded-full text-sm font-bold transition-all bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600");
            tab.className = "leaderboard-tab whitespace-nowrap py-2 px-4 rounded-full text-sm font-bold transition-all bg-blue-600 text-white shadow-md";
            renderList(tab.dataset.type);
        });
    });

    renderList('xp');
}