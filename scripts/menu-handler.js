import { ModalHandler } from './modal-handler.js';
import { getQuizProgress, categoryDetails as allCategoryDetails } from './data-manager.js';
import { quizList } from '../data/quizzes-list.js';
import { getSavedCustomQuizzes } from './custom-quiz-handler.js';
import { getSyllabusForCategory } from './syllabus-manager.js';

/**
 * Creates the HTML string for a single quiz menu item, including progress.
 * @param {object} quiz - The quiz data object (standard or custom).
 * @param {function} getQuizUrl - Function to generate the correct URL for the quiz.
 * @param {string|null} currentQuizId - The ID of the quiz currently being viewed, if any.
 * @param {string} basePath - The base path for resolving assets (e.g., './' or '../').
 * @returns {string} The HTML string for the menu item.
 */
function createMenuItemHTML(quiz, getQuizUrl, currentQuizId, basePath = './') {
    const totalQuestions = quiz.amount || quiz.questions?.length || 0;
    if (totalQuestions === 0) return ''; // Don't render items with no questions

    const storageKey = quiz.storageKey || `quizState-${quiz.id || quiz.customId}`;
    const quizId = quiz.id || quiz.customId;
    const linkUrl = getQuizUrl(quizId); // This will be relative
    const iconUrl = (quiz.icon || './assets/icons/dices.png').replace(/^\.\//, basePath);
    const iconAlt = quiz.altText || 'ไอคอนแบบทดสอบ';

    const progress = getQuizProgress(storageKey, totalQuestions);
    let progressHtml = '';
    let activeClass = '';
    let titlePrefix = '';
    let titleFontClass = 'font-medium';
    let iconContainerExtraClass = ''; // New variable for extra classes

    if (progress.isFinished) {
        progressHtml = `
            <div class="text-[11px] font-medium text-green-600 dark:text-green-400 mt-0.5">
                ทำเสร็จแล้ว (${progress.score}/${progress.totalQuestions})
            </div>`;
    } else if (progress.hasProgress && progress.answeredCount > 0) {
        progressHtml = `
            <div class="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                ทำต่อ (${progress.answeredCount}/${progress.totalQuestions} ข้อ)
            </div>`;
    }

    // Check if this is the currently active quiz
    if (quizId === currentQuizId) {
        activeClass = 'bg-blue-100 dark:bg-blue-900/50 border-blue-500';
        titlePrefix = '<span class="inline-block h-2 w-2 mr-2 bg-blue-500 rounded-full" aria-hidden="true"></span>';
        titleFontClass = 'font-bold';
        // Add classes for glow and scale
        iconContainerExtraClass = 'scale-110 shadow-lg shadow-blue-500/40';
    }

    return `
        <a href="${linkUrl}" data-storage-key="${storageKey}" data-total-questions="${totalQuestions}" data-quiz-title="${quiz.title}" class="quiz-menu-item group block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 border-l-2 border-transparent hover:border-blue-400 ${activeClass}">
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-gray-200 p-1 transition-all duration-300 group-hover:scale-110 ${iconContainerExtraClass}">
                    <img src="${iconUrl}" alt="${iconAlt}" class="h-full w-full object-contain">
                </div>
                <div class="flex-grow min-w-0">
                    <span class="${titleFontClass} whitespace-normal group-hover:text-blue-600 dark:group-hover:text-blue-400">${titlePrefix}${quiz.title}</span>
                    ${progressHtml}
                </div>
            </div>
        </a>
    `;
}
/**
 * Initializes the main navigation menu.
 * - Populates it with standard and custom quizzes.
 * - Shows progress for each quiz.
 * - Highlights the currently active quiz.
 * - Handles clicks on completed quizzes to show a modal.
 */
export function initializeMenu() {
    const menuDropdown = document.getElementById('main-menu-dropdown');
    const menuQuizListContainer = document.getElementById('menu-quiz-list');

    if (!menuDropdown || !menuQuizListContainer) {
        return;
    }

    // --- Modal Setup & State ---
    const completedModal = new ModalHandler('completed-quiz-modal');
    const viewResultsBtn = document.getElementById('completed-view-results-btn');
    const startOverBtn = document.getElementById('completed-start-over-btn');
    let activeQuizUrl = '';
    let activeStorageKey = '';
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuizId = urlParams.get('id');

    // --- Pathing Logic ---
    const isSubdirectory = window.location.pathname.includes('/quiz/');
    const basePath = isSubdirectory ? '../' : './';
    const getQuizUrl = (id) => `${isSubdirectory ? '.' : './quiz'}/index.html?id=${id}`;

    // --- Get All Quizzes and Progress ---
    const allQuizzes = [...quizList, ...getSavedCustomQuizzes()];
    const quizzesWithProgress = allQuizzes.map(quiz => {
        const totalQuestions = quiz.amount || quiz.questions?.length || 0;
        if (totalQuestions === 0) return null;
        const storageKey = quiz.storageKey || `quizState-${quiz.id || quiz.customId}`;
        const progress = getQuizProgress(storageKey, totalQuestions);
        return { ...quiz, ...progress, storageKey };
    }).filter(Boolean);

    // --- Identify and sort recent quizzes ---
    const recentQuizzes = quizzesWithProgress
        .filter(q => q.hasProgress && q.answeredCount > 0)
        .sort((a, b) => b.lastAttemptTimestamp - a.lastAttemptTimestamp)
        .slice(0, 3);
    const recentQuizIds = new Set(recentQuizzes.map(q => q.id || q.customId));

    // --- Get ALL custom quizzes, regardless of recency ---
    const customQuizzes = quizzesWithProgress.filter(q => q.customId);
    // --- Get standard quizzes that are NOT recent ---
    const standardQuizzes = quizzesWithProgress.filter(q => q.id && !recentQuizIds.has(q.id));

    // --- Group Standard Quizzes by Category ---
    const groupedByCategory = standardQuizzes.reduce((acc, quiz) => {
        const category = quiz.category || "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(quiz);
        return acc;
    }, {});

    const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
        const orderA = allCategoryDetails[a]?.order || 99;
        const orderB = allCategoryDetails[b]?.order || 99;
        return orderA - orderB;
    });

    // --- Build Menu HTML ---
    let menuHTML = '';

    // 1. Recent Quizzes Section
    if (recentQuizzes.length > 0) {
        menuHTML += `
            <div class="px-4 pt-2 pb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ทำล่าสุด</h4>
            </div>
        `;
        recentQuizzes.forEach(quiz => {
            menuHTML += createMenuItemHTML(quiz, getQuizUrl, currentQuizId, basePath);
        });
        menuHTML += `<hr class="my-2 border-gray-200 dark:border-gray-600">`;
    }

    // 2. Standard Quizzes (with new chapter grouping)
    sortedCategories.forEach(categoryKey => {
        const quizzesInCategory = groupedByCategory[categoryKey];
        const details = allCategoryDetails[categoryKey];
        if (!details || !quizzesInCategory || quizzesInCategory.length === 0) return;

        const categoryIconUrl = (details.icon || './assets/icons/study.png').replace(/^\.\//, basePath);
        
        // Start of <details> element for the main category
        menuHTML += `
            <details class="group menu-category-item">
                <summary class="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex items-center gap-2">
                        <img src="${categoryIconUrl}" alt="${details.title}" class="h-5 w-5">
                        <span class="font-semibold text-sm text-gray-800 dark:text-gray-200">${details.title}</span>
                    </div>
                    <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                </summary>
                <div class="pl-4 pt-1 pb-2 space-y-1">
        `;

        const syllabus = getSyllabusForCategory(categoryKey);
        const chapters = syllabus?.units 
            ? syllabus.units.flatMap(unit => unit.chapters) 
            : syllabus?.chapters;

        if (Array.isArray(chapters)) {
            chapters.forEach(chapter => {
                const chapterTitleFromSyllabus = chapter.title;
                const chapterQuizzes = quizzesInCategory.filter(quiz => quiz.subCategory === chapterTitleFromSyllabus);

                if (chapterQuizzes.length > 0) {
                    let displayTitle = chapterTitleFromSyllabus;
                    if (categoryKey === 'EarthSpaceScienceBasic') {
                        displayTitle = `บทที่ ${chapter.chapterId}: ${chapterTitleFromSyllabus}`;
                    } else if (categoryKey === 'EarthSpaceScienceAdvance') {
                        const firstQuiz = chapterQuizzes[0];
                        if (firstQuiz?.description) {
                            const match = firstQuiz.description.match(/บทที่\s*(\d+)/);
                            if (match?.[1]) {
                                displayTitle = `บทที่ ${match[1]}: ${chapterTitleFromSyllabus}`;
                            }
                        }
                    }
                    menuHTML += `<p class="px-2 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${displayTitle}</p>`;
                    const quizLinksContainerHTML = chapterQuizzes.map(quiz => createMenuItemHTML(quiz, getQuizUrl, currentQuizId, basePath)).join('');
                    menuHTML += `<div class="space-y-px pl-2">${quizLinksContainerHTML}</div>`;
                }
            });
        } else { // Fallback for non-syllabus categories
            quizzesInCategory.forEach(quiz => {
                menuHTML += createMenuItemHTML(quiz, getQuizUrl, currentQuizId, basePath);
            });
        }

        // End of <details> element
        menuHTML += `
                </div>
            </details>
        `;
    });

    // 3. Custom Quizzes
    if (customQuizzes.length > 0) {
        menuHTML += `<hr class="my-2 border-gray-200 dark:border-gray-600">`;
        menuHTML += `
            <div class="px-4 pt-2 pb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">แบบทดสอบที่สร้างเอง</h4>
            </div>
        `;
        customQuizzes.sort((a, b) => (b.lastAttemptTimestamp || 0) - (a.lastAttemptTimestamp || 0)).forEach(quiz => {
            menuHTML += createMenuItemHTML(quiz, getQuizUrl, currentQuizId, basePath);
        });
    }

    menuQuizListContainer.innerHTML = menuHTML;

    // --- Event Delegation for Menu Items ---
    menuDropdown.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;

        if (link.classList.contains('quiz-menu-item')) {
            const storageKey = link.dataset.storageKey;
            const totalQuestions = parseInt(link.dataset.totalQuestions, 10) || 0;
            if (!storageKey || totalQuestions === 0) return;

            const progress = getQuizProgress(storageKey, totalQuestions);

            if (progress.isFinished) {
                event.preventDefault();
                const quizTitle = link.dataset.quizTitle || 'แบบทดสอบ';
                const modalTitleEl = document.getElementById('completed-modal-title');
                if (modalTitleEl) {
                    modalTitleEl.textContent = quizTitle;
                }
                activeQuizUrl = link.href;
                activeStorageKey = storageKey;
                completedModal.open(link);
            }
        }
    });

    // --- Modal Button Listeners ---
    if (viewResultsBtn) {
        viewResultsBtn.addEventListener('click', () => {
            if (activeQuizUrl) {
                const separator = activeQuizUrl.includes('?') ? '&' : '?';
                window.location.href = `${activeQuizUrl}${separator}action=view_results`;
            }
            completedModal.close();
        });
    }
    if (startOverBtn) {
        startOverBtn.addEventListener('click', () => {
            if (activeStorageKey) localStorage.removeItem(activeStorageKey);
            if (activeQuizUrl) window.location.href = activeQuizUrl;
            completedModal.close();
        });
    }
}
