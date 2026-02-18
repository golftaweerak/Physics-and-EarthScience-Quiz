
import { getLevelBorderClass, getAvatarFrameClass, BADGES, TRACK_TITLES, PROFICIENCY_GROUPS, ACHIEVEMENTS } from './gamification.js';

export function openProfileModal(user) {
  // Create Modal Backdrop
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = "fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in font-sarabun";
  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) closeModal();
  };

  // Modal Content
  const modalContent = document.createElement('div');
  modalContent.className = "bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl border border-white/10 dark:border-gray-700 overflow-hidden transform transition-all scale-95 opacity-0 flex flex-col max-h-[85vh]";

  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);

  // Calculate Data
  const level = user.level || 1;
  const levelBorder = getLevelBorderClass(level);
  const avatarFrame = getAvatarFrameClass(user.avatar);
  const avatar = user.avatar || '🧑‍🎓';
  const isImage = avatar.includes('/') || avatar.includes('.');
  const avatarHtml = isImage
    ? `<img src="${avatar}" class="w-full h-full rounded-full object-cover">`
    : `<span class="text-4xl sm:text-5xl">${avatar}</span>`;

  // Title
  const titles = TRACK_TITLES.overall;
  const titleIndex = Math.min(Math.max(0, level - 1), titles.length - 1);
  const rankTitle = titles[titleIndex];

  // Stats
  const estimatedTotalQuestions = user.totalQuestionsAnswered || (user.quizzesCompleted * 20) || 0;
  const totalCorrect = user.totalCorrectAnswers || 0;
  let accuracy = estimatedTotalQuestions > 0 ? ((totalCorrect / estimatedTotalQuestions) * 100) : 0;
  accuracy = Math.min(100, Math.max(0, accuracy)).toFixed(0);

  // Badges & Achievements
  const userBadges = user.badges || [];
  const earnedBadges = BADGES.filter(b => userBadges.includes(b.id));
  const userAchievements = user.unlockedAchievements || [];
  const earnedAchievements = ACHIEVEMENTS.filter(a => userAchievements.includes(a.id));

  // Dynamic Header Gradient
  let headerGradient = "from-cyan-500 to-blue-600";
  if (level >= 10) headerGradient = "from-amber-400 to-orange-500";
  if (level >= 20) headerGradient = "from-fuchsia-500 to-purple-600";
  if (level >= 30) headerGradient = "from-rose-500 to-red-600";

  modalContent.innerHTML = `
        <!-- Sticky Header with Avatar Inside -->
        <div class="relative shrink-0 z-0">
             <!-- Increased height to accommodate avatar (h-48) -->
             <div class="h-48 bg-gradient-to-br ${headerGradient} relative overflow-hidden flex flex-col items-center justify-center pt-4">
                <div class="absolute inset-0 bg-white/10 pattern-dots"></div>
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                
                <!-- Avatar Container (Centered in Header) -->
                <div class="relative z-20 transform translate-y-2">
                     <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 shadow-xl ${levelBorder} bg-white/20 backdrop-blur-sm ring-2 ring-white/50 transition-transform hover:scale-105 duration-300">
                        <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${avatarFrame}">
                            ${avatarHtml}
                        </div>
                    </div>
                    <!-- Level Badge -->
                    <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full border-2 border-white/50 shadow-lg whitespace-nowrap z-30">
                        Lv.${level}
                    </div>
                </div>
            </div>
            
            <!-- Close Button -->
            <button id="close-profile-modal" class="absolute top-4 right-4 text-white hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-2 transition-all shadow-lg hover:scale-110 z-50 group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Scrollable Content with Flow Layout -->
        <div class="flex-grow overflow-y-auto modern-scrollbar bg-white dark:bg-gray-900 relative z-10 flex flex-col">
            
            <!-- Content Container -->
            <div class="px-5 sm:px-8 pb-8 text-center flex-grow flex flex-col pt-6">
                
                <!-- Name & Title -->
                <div class="mb-8 animate-slide-up" style="animation-delay: 0.1s;">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white font-kanit tracking-tight leading-tight px-1 break-words">
                        ${user.displayName || 'ผู้เรียน'}
                    </h2>
                    <div class="flex items-center justify-center gap-2 mt-2 flex-wrap">
                        <span class="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">${rankTitle}</span>
                        ${user.selectedTitle ? `
                            <span class="text-gray-300">•</span>
                            <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-700/50">
                                👑 ${user.selectedTitle}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-3 mb-8 animate-slide-up" style="animation-delay: 0.2s;">
                    ${renderStatCard('Total XP', (user.xp || 0).toLocaleString(), 'blue', 'M13 10V3L4 14h7v7l9-11h-7z')}
                    ${renderStatCard('Completed', (user.quizzesCompleted || 0).toLocaleString(), 'green', 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4')}
                    ${renderStatCard('Accuracy', `${accuracy}%`, 'orange', 'M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z')}
                </div>

                <!-- Accordion Sections -->
                <div class="space-y-4 animate-slide-up flex-grow" style="animation-delay: 0.3s;">
                    
                    <!-- Badges -->
                    ${renderAccordion(
    'badges',
    `🏅 เหรียญรางวัล <span class="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">${earnedBadges.length}</span>`,
    earnedBadges.length > 0 ? `
                            <div class="grid grid-cols-4 sm:grid-cols-5 gap-3 p-1">
                                ${earnedBadges.map(b => `
                                    <div class="flex flex-col items-center gap-1 group relative cursor-help">
                                        <div class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            ${b.icon}
                                        </div>
                                        <span class="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight line-clamp-2 w-full px-1 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">${b.name}</span>
                                        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-40 bg-gray-900 text-white text-xs rounded-xl py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl">
                                            <div class="font-bold mb-0.5 text-amber-400">${b.name}</div>
                                            <div class="opacity-90 leading-relaxed">${b.desc}</div>
                                            <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `<div class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm italic">ยังไม่มีเหรียญรางวัล</div>`,
    false
  )}

                    <!-- Achievements -->
                    ${renderAccordion(
    'achievements',
    `🏆 ความสำเร็จ <span class="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">${earnedAchievements.length}</span>`,
    earnedAchievements.length > 0 ? `
                            <div class="grid grid-cols-1 gap-2">
                                ${earnedAchievements.map(a => `
                                    <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200">
                                        <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0 ring-4 ring-white dark:ring-gray-900">
                                            ${a.icon}
                                        </div>
                                        <div class="min-w-0 flex-grow text-left">
                                            <div class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">${a.title}</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">${a.desc}</div>
                                        </div>
                                        ${a.rewardTitle ? `<div class="text-[10px] px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-mono">Title: ${a.rewardTitle}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `<div class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm italic">ยังไม่มีความสำเร็จ</div>`,
    false
  )}
                </div>
            </div>
        </div>
    `;

  modalBackdrop.appendChild(modalContent);
  document.body.appendChild(modalBackdrop);
  setupAccordions(modalContent);

  function closeModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modalBackdrop.remove(), 200);
  }
  modalContent.querySelector('#close-profile-modal').onclick = closeModal;
}

// Reuse helper functions...
function renderStatCard(label, value, color, iconPath) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
  };
  const colorClass = colors[color] || colors.blue;

  return `
        <div class="flex flex-col items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300 group">
            <div class="${colorClass} w-8 h-8 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="${iconPath}" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="text-lg font-bold text-gray-800 dark:text-white font-mono leading-none mb-1">${value}</div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${label}</div>
        </div>
    `;
}

function renderAccordion(id, titleHtml, contentHtml, isOpen) {
  return `
        <div class="accordion-item bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-blue-100 dark:ring-blue-900/30' : ''}" id="accordion-${id}">
            <button class="accordion-header w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                <div class="font-bold text-gray-700 dark:text-gray-200 flex items-center">
                    ${titleHtml}
                </div>
                <div class="transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </div>
            </button>
            <div class="accordion-content transition-all duration-300 ease-in-out overflow-hidden" style="${isOpen ? 'max-height: 1000px; opacity: 1;' : 'max-height: 0px; opacity: 0;'}">
                <div class="p-4 pt-0 border-t border-gray-100 dark:border-gray-700/50">
                    ${contentHtml}
                </div>
            </div>
        </div>
    `;
}

function setupAccordions(container) {
  container.querySelectorAll('.accordion-header').forEach(header => {
    header.onclick = () => {
      const item = header.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const icon = header.querySelector('div:last-child');
      const isClosed = content.style.maxHeight === '0px' || !content.style.maxHeight;

      if (isClosed) {
        content.style.maxHeight = content.scrollHeight + 50 + "px";
        content.style.opacity = '1';
        icon.classList.add('rotate-180');
        item.classList.add('ring-2', 'ring-blue-100', 'dark:ring-blue-900/30', 'bg-white', 'dark:bg-gray-800');
        item.classList.remove('bg-gray-50', 'dark:bg-gray-800/30');
      } else {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        icon.classList.remove('rotate-180');
        item.classList.remove('ring-2', 'ring-blue-100', 'dark:ring-blue-900/30', 'bg-white', 'dark:bg-gray-800');
        item.classList.add('bg-gray-50', 'dark:bg-gray-800/30');
      }
    };
  });
}
