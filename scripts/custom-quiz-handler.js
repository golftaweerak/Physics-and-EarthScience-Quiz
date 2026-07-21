
import { ModalHandler } from "./modal-handler.js";
import { fetchAllQuizData, getQuizProgress, categoryDetails as allCategoryDetails } from "./data-manager.js";
import { getSyllabusForCategory } from "./syllabus-manager.js";
import { authManager } from './auth-manager.js'; // authManager now handles db operations
import { showToast } from './toast.js';

/**
 * Safely retrieves and parses the list of custom quizzes from localStorage.
 * If the user is logged in, it syncs the local list with Firestore.
 * @returns {Array} An array of custom quiz objects, or an empty array if none exist or data is corrupt.
 */
export async function getSavedCustomQuizzes() {
    // Wait for auth state to be determined
    await authManager.waitForAuthReady();

    const savedQuizzesJSON = localStorage.getItem("customQuizzesList");
    if (!savedQuizzesJSON) return [];
    try {
        const parsed = JSON.parse(savedQuizzesJSON);
        let localQuizzes = Array.isArray(parsed) ? parsed : [];

        // If logged in, perform sync
        if (authManager.currentUser) {
            // Delegate sync logic to AuthManager
            localQuizzes = await authManager.syncCustomQuizzes(localQuizzes);

            localStorage.setItem("customQuizzesList", JSON.stringify(localQuizzes));
        }

        return localQuizzes;
    } catch (error) {
        console.error("Could not parse customQuizzesList from localStorage. The data might be corrupted.", error);

        // Attempt to back up the corrupted data for recovery.
        try {
            const backupKey = `customQuizzesList_corrupted_backup_${Date.now()}`;
            localStorage.setItem(backupKey, savedQuizzesJSON);
            console.warn(`Backed up corrupted quiz list to localStorage with key: ${backupKey}`);
        } catch (backupError) {
            console.error("Failed to back up corrupted quiz list.", backupError);
        }

        // Remove the corrupted item to prevent future errors.
        localStorage.removeItem("customQuizzesList");
        return [];
    }
}

/**
 * Debounces a function to control the rate at which it fires.
 * @param {Function} func The function to debounce.
 * @param {number} wait The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Creates a custom quiz object and saves it to localStorage.
 * @param {object} quizData - Object containing quiz properties like title, questions, timerMode, customTime, category.
 * @returns {object} The newly created custom quiz object.
 */
async function createAndSaveCustomQuiz(quizData) {
    const customId = `custom_${Date.now()}`; // Unique ID for the custom quiz
    const newCustomQuiz = {
        customId: customId,
        title: quizData.title || `Custom Quiz ${new Date().toLocaleDateString('th-TH')}`,
        questions: quizData.questions,
        description: quizData.description || `แบบทดสอบที่สร้างเองจาก ${quizData.questions.length} ข้อ`,
        timerMode: quizData.timerMode || 'none',
        customTime: quizData.customTime || null,
        category: quizData.category || 'Custom', // Default to 'Custom' category
        categoryDisplay: quizData.categoryDisplay || 'แบบทดสอบที่สร้างเอง',
        isRemedial: quizData.isRemedial || false,
        passingScore: quizData.passingScore || null,
        storageKey: `quizState-${customId}`,
        icon: quizData.isRemedial ? './assets/icons/target.png' : './assets/icons/dices.png', // Default icon for custom quizzes
        altText: quizData.isRemedial ? 'ไอคอนสอบซ่อม' : 'ไอคอนแบบทดสอบที่สร้างเอง'
    };

    let savedQuizzes = await getSavedCustomQuizzes();
    savedQuizzes.push(newCustomQuiz);
    localStorage.setItem("customQuizzesList", JSON.stringify(savedQuizzes));

    // Sync to cloud if logged in
    if (authManager.currentUser) {
        try {
            await authManager.saveCustomQuiz(newCustomQuiz);
        } catch (error) {
            console.warn("Could not sync new custom quiz to Firestore. It will be available on this device only.", error);
        }
    }

    return newCustomQuiz;
}

/**
 * Initializes all functionality related to creating and managing custom quizzes.
 */
export function initializeCustomQuizHandler() {
    console.log('[DEBUG] custom-quiz-handler: initializeCustomQuizHandler called');
    // ... (existing code) ...
    let quizDataCache = null; // Cache for fetched quiz data

    // --- 1. Cache Elements & Initialize Modals ---
    const customQuizModal = new ModalHandler("custom-quiz-modal");
    const customQuizHubModal = new ModalHandler("custom-quiz-hub-modal");
    const completedModal = new ModalHandler('completed-quiz-modal');
    const confirmModal = new ModalHandler("confirm-action-modal");
    const confirmModalTitle = document.getElementById("confirm-modal-title");
    const confirmModalDescription = document.getElementById("confirm-modal-description");
    const confirmActionBtn = document.getElementById("confirm-action-btn");
    const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
    const confirmModalEl = document.getElementById("confirm-action-modal");
    const randomAllModal = new ModalHandler("random-all-modal");

    const numberInputModal = new ModalHandler("number-input-modal");
    const numberInputTitle = document.getElementById("number-input-modal-title");
    const numberInputDesc = document.getElementById("number-input-modal-desc");
    const genericNumberInput = document.getElementById("generic-number-input");
    const numberInputSlider = document.getElementById("number-input-slider");
    const numberInputConfirmBtn = document.getElementById("number-input-confirm-btn");
    const numberInputMaxDisplay = document.getElementById("number-input-max-display");

    const createCustomQuizBtn = document.getElementById("create-custom-quiz-btn");
    const categorySelectionContainer = document.getElementById("custom-quiz-category-selection");
    const totalQuestionCountDisplay = document.getElementById("total-question-count");
    const openCreateQuizModalBtn = document.getElementById("open-create-quiz-modal-btn");
    const customQuizListContainer = document.getElementById("custom-quiz-list-container");
    const noCustomQuizzesMsg = document.getElementById("no-custom-quizzes-msg");
    const viewResultsBtn = document.getElementById('completed-view-results-btn');
    const startOverBtn = document.getElementById('completed-start-over-btn');

    // Create and inject the loader for the custom quiz list
    let listLoader = null;
    if (customQuizListContainer) {
        listLoader = document.createElement('div');
        listLoader.id = 'custom-quiz-list-loader';
        listLoader.className = 'hidden w-full py-10 flex flex-col items-center justify-center text-center';
        listLoader.innerHTML = `
            <svg class="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" width="32" height="32" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">กำลังโหลดรายการแบบทดสอบ...</p>
        `;
        customQuizListContainer.parentNode.insertBefore(listLoader, customQuizListContainer);
    }

    // --- State Management ---
    let activeQuizUrl = '';
    let activeStorageKey = '';
    let onConfirmAction = null;
    let isBadgeDismissed = false;
    let hasShownSuccess = false;
    let isRemedialMode = false;

    // Apply the modern scrollbar class to the modal bodies.
    try {
        // We assume the scrollable container within the modal has a class like 'overflow-y-auto'.
        // This is a common pattern with Tailwind CSS modal components.
        document.querySelectorAll('#custom-quiz-modal .overflow-y-auto, #custom-quiz-hub-modal .overflow-y-auto')
            .forEach(el => el.classList.add('modern-scrollbar')); // Class is now defined in bundle.css
    } catch (error) {
        console.error("Could not apply modern scrollbar class to modals:", error);
    }

    /**
     * Updates a range slider's track to show a fill color up to the current value.
     * This provides a better visual feedback than the default browser styling.
     * @param {HTMLInputElement} slider The range input element to update.
     */
    function updateSliderTrack(slider) {
        if (!slider) return;
        const min = +slider.min || 0;
        const max = +slider.max || 100;
        const value = +slider.value || 0;
        // Calculate the percentage of the fill
        const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

        // Define colors for light and dark mode from the Tailwind palette.
        const trackColorLight = '#e5e7eb'; // Corresponds to gray-200
        const fillColorLight = '#3b82f6';   // Corresponds to blue-500
        const trackColorDark = '#4b5563';  // Corresponds to gray-600
        const fillColorDark = '#60a5fa';   // Corresponds to blue-400

        const isDarkMode = document.documentElement.classList.contains('dark');
        const trackColor = isDarkMode ? trackColorDark : trackColorLight;
        const fillColor = isDarkMode ? fillColorDark : fillColorLight;

        slider.style.background = `linear-gradient(to right, ${fillColor} ${percentage}%, ${trackColor} ${percentage}%)`;
    }

    // --- Random All Modal Logic ---
    const randomAllInput = document.getElementById('random-all-input');
    const randomAllSlider = document.getElementById('random-all-slider');
    const randomAllConfirmBtn = document.getElementById('random-all-confirm-btn');

    if (randomAllInput && randomAllSlider) {
        randomAllInput.addEventListener('input', () => {
            let val = parseInt(randomAllInput.value, 10);
            if (val > parseInt(randomAllInput.max)) val = parseInt(randomAllInput.max);
            if (val < parseInt(randomAllInput.min)) val = parseInt(randomAllInput.min);
            randomAllSlider.value = val;
            updateSliderTrack(randomAllSlider);
        });
        randomAllSlider.addEventListener('input', () => {
            randomAllInput.value = randomAllSlider.value;
            updateSliderTrack(randomAllSlider);
        });
    }

    if (randomAllConfirmBtn) {
        randomAllConfirmBtn.addEventListener('click', () => {
            const val = parseInt(document.getElementById('random-all-input').value, 10);
            executeRandomSelection(val);
            randomAllModal.close();
        });
    }

    /**
     * Shows a modal to get a number input from the user.
     * @param {string} title
     * @param {string} description
     * @param {number} defaultValue
     * @param {number} max
     * @returns {Promise<number|null>}
     */
    function showNumberInputModal(title, description, defaultValue, max) {
        return new Promise((resolve) => {
            if (numberInputTitle) numberInputTitle.textContent = title;
            if (numberInputDesc) numberInputDesc.textContent = description;
            if (genericNumberInput) {
                genericNumberInput.max = max;
                genericNumberInput.value = defaultValue;
            }
            if (numberInputSlider) {
                numberInputSlider.max = max;
                numberInputSlider.value = defaultValue;
                updateSliderTrack(numberInputSlider);
            }
            if (numberInputMaxDisplay) numberInputMaxDisplay.textContent = max;

            const onConfirm = () => {
                const value = parseInt(genericNumberInput.value, 10);
                cleanup();
                resolve(isNaN(value) ? 0 : value);
            };

            const onCancel = () => {
                cleanup();
                resolve(null);
            };

            const cleanup = () => {
                numberInputConfirmBtn.removeEventListener('click', onConfirm);
                numberInputModal.modal.querySelectorAll('[data-modal-close]').forEach(btn => btn.removeEventListener('click', onCancel));
                numberInputModal.close();
            };

            numberInputConfirmBtn.addEventListener('click', onConfirm);
            numberInputModal.modal.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', onCancel));

            numberInputModal.open();

            // Setup input sync for this modal specifically
            const syncInputs = (e) => {
                let val = parseInt(e.target.value, 10) || 0;
                if (val > max) val = max;
                if (val < 0) val = 0;

                genericNumberInput.value = val;
                numberInputSlider.value = val;
                updateSliderTrack(numberInputSlider);
            };

            genericNumberInput.addEventListener('input', syncInputs);
            numberInputSlider.addEventListener('input', syncInputs);

            // Overwrite cleanup to remove these as well
            const originalCleanup = cleanup;
            const newCleanup = () => {
                genericNumberInput.removeEventListener('input', syncInputs);
                numberInputSlider.removeEventListener('input', syncInputs);
                originalCleanup();
            };
            // Note: In a real app we'd need better object management, but this works for our scope.
        });
    }

    // Event delegation is used below in the Initial Setup section to handle these clicks robustly.

    // --- 2. Core Logic Functions ---

    async function deleteCustomQuiz(customId) {
        let savedQuizzes = await getSavedCustomQuizzes();
        const quizToDelete = savedQuizzes.find(q => q.customId === customId);
        if (!quizToDelete) return;

        // Local Deletion
        if (quizToDelete.storageKey) localStorage.removeItem(quizToDelete.storageKey);
        const updatedQuizzes = savedQuizzes.filter((q) => q.customId !== customId);
        localStorage.setItem("customQuizzesList", JSON.stringify(updatedQuizzes));

        // Sync deletion to cloud
        if (authManager.currentUser) {
            try {
                await authManager.deleteCustomQuiz(quizToDelete);
            } catch (error) {
                console.warn("Could not sync custom quiz deletion to Firestore.", error);
            }
        }
        await renderCustomQuizList();
    }

    async function updateCustomQuizTitle(customId, newTitle) {
        let savedQuizzes = await getSavedCustomQuizzes();
        const quizIndex = savedQuizzes.findIndex((q) => q.customId === customId);
        if (quizIndex > -1) {
            savedQuizzes[quizIndex].title = newTitle.trim();
            localStorage.setItem("customQuizzesList", JSON.stringify(savedQuizzes));

            // NEW: Sync title change to cloud
            if (authManager.currentUser) {
                try {
                    await authManager.updateCustomQuiz(customId, { title: newTitle.trim() });
                } catch (error) {
                    console.warn("Could not sync custom quiz title update to Firestore.", error);
                }
            }
        }
    }

    function toggleEditMode(quizItemEl, isEditing) {
        const titleDisplay = quizItemEl.querySelector("[data-title-display]");
        const editContainer = quizItemEl.querySelector("[data-edit-container]");
        const viewControls = quizItemEl.querySelector("[data-view-controls]");
        const editControls = quizItemEl.querySelector("[data-edit-controls]");
        if (!titleDisplay || !editContainer || !viewControls || !editControls) return;

        const shouldBeEditing = isEditing === undefined ? editContainer.classList.contains("hidden") : isEditing;

        titleDisplay.classList.toggle("hidden", shouldBeEditing);
        editContainer.classList.toggle("hidden", !shouldBeEditing);
        viewControls.classList.toggle("hidden", shouldBeEditing);
        editControls.classList.toggle("hidden", !shouldBeEditing);

        if (shouldBeEditing) {
            const currentTitle = titleDisplay.querySelector("p.font-bold").textContent;
            // Create and inject the input field for editing the title, using consistent styling
            editContainer.innerHTML = `<input type="text" value="${currentTitle}" class="w-full p-2 border border-gray-300 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">`;
            const input = editContainer.querySelector("input");
            input.focus();
            input.select();
        } else {
            editContainer.innerHTML = "";
        }
    }

    /**
     * Creates a user-friendly string for the quiz's timer settings.
     * @param {string} timerMode - The timer mode ('none', 'overall', 'perQuestion').
     * @param {number} customTime - The time value in seconds.
     * @returns {string} A descriptive string.
     */
    function getTimerDescription(timerMode, customTime) {
        if (timerMode === 'none' || !timerMode) {
            return 'ไม่จับเวลา';
        }
        if (timerMode === 'overall') {
            const minutes = Math.floor(customTime / 60);
            return `จับเวลารวม ${minutes} นาที`;
        }
        if (timerMode === 'perQuestion') {
            return `จับเวลาข้อละ ${customTime} วินาที`;
        }
        return 'ไม่ระบุ';
    }

    /**
     * Creates the HTML for the progress bar section of a custom quiz card.
     * @param {object} progress - The progress object from getQuizProgress.
     * @returns {string} The HTML string for the progress section, or an empty string if no progress.
     */
    function createCustomQuizProgressHTML(progress) {
        if (!progress.hasProgress) return '';

        const progressText = progress.isFinished
            ? `ทำเสร็จแล้ว (${progress.score}/${progress.totalQuestions})`
            : `ทำต่อ (${progress.answeredCount}/${progress.totalQuestions})`;

        const progressBarColor = progress.isFinished ? 'bg-green-500' : 'bg-blue-500';

        return `
            <div>
                <div class="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    <span>${progressText}</span>
                    <span>${progress.percentage}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div class="${progressBarColor} h-2 rounded-full" style="width: ${progress.percentage}%"></div>
                </div>
            </div>
        `;
    }

    async function renderCustomQuizList() {
        const savedQuizzes = await getSavedCustomQuizzes();

        // Sort quizzes by creation date (newest first)
        savedQuizzes.sort((a, b) => {
            const timestampA = parseInt((a.customId || 'custom_0').split('_')[1], 10) || 0;
            const timestampB = parseInt((b.customId || 'custom_0').split('_')[1], 10) || 0;
            return timestampB - timestampA;
        });


        // Ensure the container is a grid for proper alignment and equal-height cards.
        if (customQuizListContainer) {
            customQuizListContainer.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6";
        }

        noCustomQuizzesMsg.classList.toggle("hidden", savedQuizzes.length > 0);
        customQuizListContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        savedQuizzes.forEach((quiz, index) => {
            const totalQuestions = quiz.questions.length;
            const progress = getQuizProgress(quiz.storageKey, totalQuestions);
            const buttonText = progress.hasProgress ? "ทำต่อ" : "เริ่มทำ";
            const quizUrl = `./quiz/index.html?id=${quiz.customId}`;

            const timerDescription = getTimerDescription(quiz.timerMode, quiz.customTime);
            const timestamp = parseInt(quiz.customId.split('_')[1], 10);
            const creationDate = !isNaN(timestamp)
                ? new Date(timestamp).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })
                : 'ไม่ระบุวันที่';

            const detailsHtml = `
                <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div class="flex items-start" title="หมวดหมู่">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span class="truncate">${quiz.categoryDisplay || 'ทั่วไป'}</span>
                    </div>
                    <div class="flex items-center" title="รูปแบบการจับเวลา">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>${timerDescription}</span>
                    </div>
                    <div class="flex items-center" title="จำนวนคำถามทั้งหมด">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <span>${totalQuestions} ข้อ</span>
                    </div>
                    <div class="flex items-center" title="วันที่สร้าง">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>${creationDate}</span>
                    </div>
                </div>
                ${quiz.description ? `<p class="mt-2 text-xs text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-2">"${quiz.description}"</p>` : ''}
            `;

            let footerHtml;
            if (progress.hasProgress) {
                const progressHtml = createCustomQuizProgressHTML(progress);
                footerHtml = `
                <div class="mt-auto pt-4 flex items-center gap-4">
                    <a href="${quizUrl}" class="start-custom-quiz-btn flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold transition shadow-sm hover:shadow-md">${buttonText}</a>
                    <div class="flex-grow min-w-0">
                        ${progressHtml}
                    </div>
                </div>`;
            } else {
                footerHtml = `
                <div class="mt-auto pt-4">
                    <a href="${quizUrl}" class="start-custom-quiz-btn w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold transition shadow-sm hover:shadow-md">${buttonText}</a>
                </div>`;
            }

            const quizItemEl = document.createElement("div");
            quizItemEl.dataset.quizId = quiz.customId;
            // Add the animation class and a staggered delay for a nice effect.
            quizItemEl.className = "custom-quiz-item flex flex-col h-full min-h-72 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 quiz-card-appear";
            quizItemEl.style.animationDelay = `${index * 75}ms`;

            const iconUrl = quiz.icon || './assets/icons/dices.png';
            const iconAlt = quiz.altText || 'ไอคอนแบบทดสอบที่สร้างเอง';

            quizItemEl.innerHTML = `
                <div class="flex-grow">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2 overflow-hidden">
                            <img src="${iconUrl}" alt="${iconAlt}" ${index > 6 ? 'loading="lazy"' : ''} class="h-full w-full object-contain">
                        </div>
                        <div class="flex-grow min-w-0">
                            <div data-title-display class="flex justify-between items-start gap-2">
                                <div class="flex-grow min-w-0">
                                    <p class="font-bold text-gray-800 dark:text-gray-100 truncate">${quiz.title}</p>
                                </div>
                                <div data-view-controls class="flex items-center gap-1 flex-shrink-0">
                                    <button data-action="edit" aria-label="แก้ไขชื่อ" class="p-2 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/50 dark:hover:text-yellow-400 rounded-full transition"><svg class="h-5 w-5 pointer-events-none" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                                    <button data-action="delete" aria-label="ลบแบบทดสอบ" class="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 rounded-full transition"><svg class="h-5 w-5 pointer-events-none" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                                </div>
                            </div>
                            <div data-edit-controls class="hidden flex items-center gap-2 mt-1">
                                 <button data-action="save" aria-label="บันทึก" class="p-2 text-gray-500 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/50 dark:hover:text-green-400 rounded-full transition"><svg class="h-5 w-5 pointer-events-none" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button>
                                 <button data-action="cancel" aria-label="ยกเลิก" class="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 rounded-full transition"><svg class="h-5 w-5 pointer-events-none" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                            </div>
                            <div data-edit-container class="hidden mt-1"></div>
                            ${detailsHtml}
                        </div>
                    </div>
                </div>
                ${footerHtml}
            `;
            fragment.appendChild(quizItemEl);
        });
        customQuizListContainer.appendChild(fragment);

        // Hide the loader after the list has been rendered.
        if (listLoader) listLoader.classList.add('hidden');
    }

    /**
     * Creates the HTML for a single specific topic/learning outcome control row.
     * @param {string} chapterTitle - The parent chapter title.
     * @param {string} specificTopic - The specific topic or learning outcome.
     * @param {number} maxCount - The number of questions available for this topic.
     * @returns {string} The HTML string for the control row.
     * @param {object} counts - An object containing counts for 'theory', 'calculation', and 'total'.
     */
    function createSpecificTopicControlHTML(subjectKey, chapterTitle, specificTopic, counts, isLearningOutcome = false) {
        const totalCount = counts.total || 0;
        const theoryCount = counts.theory || 0;
        const calcCount = counts.calculation || 0;
        const disabled = totalCount === 0;

        const escapeAttr = (str) => String(str).replace(/"/g, '&quot;');
        const displayTopic = isLearningOutcome ? specificTopic : specificTopic.replace(/^\d+\.\s/, '').trim();

        if (isRemedialMode) {
            const remedialDisabled = calcCount === 0;
            return `
                <label class="specific-topic-control flex items-center justify-between py-2.5 px-4 border-t border-gray-200 dark:border-gray-700/50 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 cursor-pointer transition-colors ${remedialDisabled ? 'opacity-40 pointer-events-none' : ''}">
                    <div class="flex items-center gap-3 flex-grow min-w-0 pr-2">
                        <input type="checkbox" data-subject="${escapeAttr(subjectKey)}" data-chapter="${escapeAttr(chapterTitle)}" data-specific="${escapeAttr(specificTopic)}" class="remedial-topic-checkbox h-4 w-4 text-amber-600 rounded border-gray-300 dark:border-gray-600 focus:ring-amber-500 flex-shrink-0 cursor-pointer" ${remedialDisabled ? 'disabled' : ''}>
                        <span class="font-medium text-gray-700 dark:text-gray-200 text-sm truncate">${displayTopic}</span>
                    </div>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${calcCount > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'} flex-shrink-0">
                        ข้อเขียน ${calcCount} ข้อ
                    </span>
                </label>`;
        }

        return `
            <div class="specific-topic-control py-3 px-4 border-t border-gray-200 dark:border-gray-700/50 ${disabled ? 'opacity-50' : ''}">
                <div class="flex justify-between items-start">
                    <label class="font-medium text-gray-700 dark:text-gray-200 text-sm flex-grow">${displayTopic}</label>
                    <button type="button" data-action="clear-topic" class="px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors flex-shrink-0">
                        ล้าง
                    </button>
                </div>
                <div class="mt-2 space-y-2">
                    <!-- Theory Questions -->
                    <div class="flex items-center justify-between gap-2 ${theoryCount === 0 ? 'hidden' : ''}">
                        <span class="text-xs text-gray-500 dark:text-gray-400 w-16">ทฤษฎี <br>(${theoryCount} ข้อ)</span>
                        <input data-subject="${escapeAttr(subjectKey)}" data-chapter="${escapeAttr(chapterTitle)}" data-specific="${escapeAttr(specificTopic)}" data-type="theory" type="number" min="0" max="${theoryCount}" value="0" class="w-16 py-1 px-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900/50 text-center font-semibold text-sm text-blue-600 dark:text-blue-400 focus:ring-blue-500 focus:border-blue-500 flex-shrink-0" ${disabled ? 'disabled' : ''}>
                        <div class="flex-grow flex justify-end gap-1 quick-select-buttons">
                            <button type="button" data-value="5" data-type="theory" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${theoryCount < 5 ? 'hidden' : ''}">5</button>
                            <button type="button" data-value="10" data-type="theory" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${theoryCount < 10 ? 'hidden' : ''}">10</button>
                            <button type="button" data-value="${theoryCount}" data-type="theory" class="px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900">All</button>
                        </div>
                    </div>
                    <!-- Calculation Questions -->
                    <div class="flex items-center justify-between gap-2 ${calcCount === 0 ? 'hidden' : ''}">
                        <span class="text-xs text-gray-500 dark:text-gray-400 w-16">คำนวณ <br>(${calcCount} ข้อ)</span>
                        <input data-subject="${escapeAttr(subjectKey)}" data-chapter="${escapeAttr(chapterTitle)}" data-specific="${escapeAttr(specificTopic)}" data-type="calculation" type="number" min="0" max="${calcCount}" value="0" class="w-16 py-1 px-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900/50 text-center font-semibold text-sm text-green-600 dark:text-green-400 focus:ring-green-500 focus:border-green-500 flex-shrink-0" ${disabled ? 'disabled' : ''}>
                        <div class="flex-grow flex justify-end gap-1 quick-select-buttons">
                             <button type="button" data-value="5" data-type="calculation" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${calcCount < 5 ? 'hidden' : ''}">5</button>
                            <button type="button" data-value="10" data-type="calculation" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${calcCount < 10 ? 'hidden' : ''}">10</button>
                            <button type="button" data-value="${calcCount}" data-type="calculation" class="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 rounded-full hover:bg-green-200 dark:hover:bg-green-900">All</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    const debouncedUpdateTotalCount = debounce(updateTotalCount, 300);

    function updateTotalCount() {
        const totalCountDisplay = document.getElementById("total-question-count");
        const badgeConditionEl = document.getElementById("custom-quiz-badge-condition");

        if (isRemedialMode) {
            const checkedTopics = document.querySelectorAll('#custom-quiz-category-selection input.remedial-topic-checkbox:checked');
            const checkedChapters = document.querySelectorAll('#custom-quiz-category-selection input.remedial-chapter-checkbox:checked');
            const hasSelection = checkedTopics.length > 0 || checkedChapters.length > 0;
            if (totalCountDisplay) totalCountDisplay.textContent = hasSelection ? "5" : "0";
            if (badgeConditionEl) badgeConditionEl.classList.add('hidden');
            return;
        }

        let total = 0;
        document.querySelectorAll('#custom-quiz-category-selection input[type="number"][data-type]').forEach(input => {
            total += parseInt(input.value, 10) || 0;
        });
        if (totalCountDisplay) totalCountDisplay.textContent = total;

        if (badgeConditionEl) {
            if (isBadgeDismissed) {
                badgeConditionEl.classList.add('hidden');
                return;
            }

            const contentContainer = badgeConditionEl.querySelector('#badge-content-container') || badgeConditionEl.querySelector('div.flex');

            if (total === 0) {
                // Hide immediately if 0
                badgeConditionEl.classList.add('hidden');
                hasShownSuccess = false;
            } else if (total < 20) {
                // Warning State (Yellow)
                badgeConditionEl.classList.remove('hidden', 'opacity-0', 'translate-y-[-20px]');
                badgeConditionEl.classList.add('opacity-100', 'translate-y-0');

                // Reset styling to Yellow
                badgeConditionEl.classList.remove('bg-green-50/95', 'dark:bg-green-900/90', 'border-green-500');
                badgeConditionEl.classList.remove('bg-white/95', 'dark:bg-gray-800/95'); // Remove default white
                badgeConditionEl.classList.add('bg-yellow-50/95', 'dark:bg-yellow-900/80', 'border-yellow-400');

                if (contentContainer) {
                    contentContainer.innerHTML = `
                        <svg class="h-6 w-6 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p class="font-bold text-gray-800 dark:text-gray-100 text-sm">คำแนะนำ</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">ต้องมีอย่างน้อย 20 ข้อ เพื่อรับเหรียญรางวัลและบันทึกสถิติคะแนน</p>
                        </div>
                    `;
                }
                hasShownSuccess = false;
            } else {
                // Success State (Green) - Show only once when reaching target
                if (!hasShownSuccess) {
                    badgeConditionEl.classList.remove('hidden', 'opacity-0', 'translate-y-[-20px]');
                    badgeConditionEl.classList.add('opacity-100', 'translate-y-0');

                    // Change styling to Green
                    badgeConditionEl.classList.remove('bg-white/95', 'dark:bg-gray-800/95'); // Remove default white
                    badgeConditionEl.classList.remove('bg-yellow-50/95', 'dark:bg-yellow-900/80', 'border-yellow-400'); // Remove yellow
                    badgeConditionEl.classList.add('bg-green-50/95', 'dark:bg-green-900/90', 'border-green-500');

                    if (contentContainer) {
                        contentContainer.innerHTML = `
                            <svg class="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="font-bold text-gray-800 dark:text-gray-100 text-sm">ยอดเยี่ยม!</p>
                                <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">ครบ 20 ข้อแล้ว พร้อมรับเหรียญรางวัล</p>
                            </div>
                        `;
                    }
                    hasShownSuccess = true;

                    // Auto hide after 3 seconds
                    setTimeout(() => {
                        if (hasShownSuccess && !isBadgeDismissed) {
                            badgeConditionEl.classList.remove('opacity-100', 'translate-y-0');
                            badgeConditionEl.classList.add('opacity-0', 'translate-y-[-20px]');
                            setTimeout(() => {
                                if (hasShownSuccess) badgeConditionEl.classList.add('hidden');
                            }, 500); // Wait for transition
                        }
                    }, 3000);
                }
            }
        }
    }


    let areEventsBound = false;
    function bindCustomQuizModalEvents() {
        if (areEventsBound) return;

        const container = customQuizModal.modal; // Listen on the whole modal for delegated events
        if (!container) return;

        console.log('[DEBUG] custom-quiz-handler: Binding modal events');
        areEventsBound = true;

        // Use event delegation for better performance
        container.addEventListener('input', (e) => {
            const target = e.target;

            // Handle the value synchronization and clamping for numeric inputs
            if (target.matches('input[type="number"][data-chapter]')) {
                let value = target.value;

                // Clamp value for number inputs
                if (target.type === 'number') {
                    const max = parseInt(target.max, 10);
                    const currentValue = parseInt(value, 10);
                    if (currentValue > max) {
                        value = max;
                        target.value = max;
                    } else if (currentValue < 0) {
                        value = 0;
                        target.value = 0;
                    }
                }

                debouncedUpdateTotalCount();
            }
        });

        container.addEventListener('click', (e) => {
            const target = e.target;
            console.log(`[DEBUG] custom-quiz-modal click on:`, target.tagName || 'SVG', target.className?.baseVal || target.className || '');

            // Handle close badge button
            if (target.closest('#close-badge-condition-btn')) {
                console.log('[DEBUG] close-badge-condition-btn clicked');
                isBadgeDismissed = true;
                const badgeEl = document.getElementById("custom-quiz-badge-condition");
                if (badgeEl) badgeEl.classList.add('hidden');
                return;
            }

            // Handle subject-level quick select
            const subjectSelectBtn = target.closest('button[data-quick-select-subject]');
            const chapterSelectBtn = target.closest('button[data-quick-select-chapter]');

            if (subjectSelectBtn) {
                const subjectContainer = subjectSelectBtn.closest('.subject-container');
                const value = subjectSelectBtn.dataset.value;

                if (subjectContainer) {
                    // --- BUG FIX ---
                    // The previous logic was flawed because it collected all individual topic inputs,
                    // leading to incorrect proportional distribution.
                    // The correct approach is to sum up the totals for 'theory' and 'calculation'
                    // across the entire subject, and then distribute the target number proportionally
                    // to those two main inputs.

                    // This logic is now being replaced by the logic in the 'quick-select-buttons' handler
                    // which correctly targets the main theory/calculation inputs for the subject.
                    // The code below is now redundant and was causing the bug. We will rely on the
                    // more specific button handler.

                    const allInputs = Array.from(subjectContainer.querySelectorAll('input[type="number"][data-chapter]'));
                    const totalMax = allInputs.reduce((sum, input) => sum + parseInt(input.max, 10), 0);

                    // Prevent actions if a subject has no questions, except for 'clear'
                    if (totalMax === 0 && value !== '0') return;

                    let targetTotal;
                    if (value === 'all') {
                        targetTotal = totalMax;
                    } else {
                        targetTotal = parseInt(value, 10);
                        if (isNaN(targetTotal)) return; // Should not happen
                    }

                    // Cap at max available questions
                    if (targetTotal > totalMax) {
                        targetTotal = totalMax;
                    }

                    if (targetTotal === 0) {
                        allInputs.forEach(input => {
                            if (input.value !== '0') {
                                input.value = 0;
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        });
                        return; // Done
                    }

                    if (totalMax > 0) { // Check again to prevent division by zero
                        // A more robust proportional distribution using the Largest Remainder Method
                        const maxValues = allInputs.map(input => parseInt(input.max, 10));

                        // 1. Calculate ideal (float) values and their remainders
                        const idealValues = maxValues.map(max => targetTotal * (max / totalMax));
                        const remainders = [];
                        let currentSum = 0;
                        const flooredValues = idealValues.map((val, i) => {
                            const floored = Math.floor(val);
                            remainders.push({ index: i, remainder: val - floored });
                            currentSum += floored;
                            return floored;
                        });

                        // 2. Distribute the remaining difference based on largest remainders
                        let remainingDiff = targetTotal - currentSum;
                        remainders.sort((a, b) => b.remainder - a.remainder);

                        for (let i = 0; i < remainingDiff; i++) {
                            const itemToIncrement = remainders[i];
                            if (itemToIncrement) {
                                // Ensure we don't increment past the max value for that input
                                if (flooredValues[itemToIncrement.index] < maxValues[itemToIncrement.index]) {
                                    flooredValues[itemToIncrement.index]++;
                                } else {
                                    // If we can't increment the one with the highest remainder, try the next one.
                                    // This is a simple fallback; a more complex one would re-sort and try again.
                                    remainingDiff++;
                                }
                            }
                        }

                        // 3. Final assignment to the inputs
                        allInputs.forEach((input, index) => {
                            // Final cap just in case, though it should not be necessary with the check above.
                            const finalValue = Math.min(maxValues[index], flooredValues[index]);
                            input.value = finalValue;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        });
                    }
                }

            } else if (chapterSelectBtn) {
                const chapterContainer = chapterSelectBtn.closest('.chapter-accordion-toggle').nextElementSibling;
                const value = chapterSelectBtn.dataset.value;

                if (chapterContainer) {
                    // Correctly select inputs ONLY within the specific chapter accordion.
                    const chapterInputs = Array.from(chapterContainer.querySelectorAll('input[type="number"][data-specific]'));
                    const totalMaxInChapter = chapterInputs.reduce((sum, input) => sum + parseInt(input.max, 10), 0);

                    if (totalMaxInChapter === 0 && value !== '0') return;

                    let targetTotal;
                    if (value === 'all') {
                        targetTotal = totalMaxInChapter;
                    } else {
                        targetTotal = parseInt(value, 10);
                        if (isNaN(targetTotal)) return;
                    }

                    if (targetTotal > totalMaxInChapter) {
                        targetTotal = totalMaxInChapter;
                    }

                    if (targetTotal === 0) {
                        chapterInputs.forEach(input => {
                            if (input.value !== '0') {
                                input.value = 0;
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        });
                        return;
                    }

                    if (totalMaxInChapter > 0) {
                        const maxValues = chapterInputs.map(input => parseInt(input.max, 10));
                        const idealValues = maxValues.map(max => targetTotal * (max / totalMaxInChapter));
                        const remainders = [];
                        let currentSum = 0;
                        const flooredValues = idealValues.map((val, i) => {
                            const floored = Math.floor(val);
                            remainders.push({ index: i, remainder: val - floored });
                            currentSum += floored;
                            return floored;
                        });

                        let remainingDiff = targetTotal - currentSum;
                        remainders.sort((a, b) => b.remainder - a.remainder);

                        for (let i = 0; i < remainingDiff; i++) {
                            if (remainders[i]) flooredValues[remainders[i].index]++;
                        }

                        chapterInputs.forEach((input, index) => {
                            input.value = Math.min(maxValues[index], flooredValues[index]);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        });
                    }
                }
            }

            // Handle quick select buttons
            const quickSelectButton = target.closest('.quick-select-buttons button');
            if (quickSelectButton) {
                // This now correctly handles both subject-level and topic-level controls
                const controlRow = quickSelectButton.closest('.specific-topic-control, .subject-controls');
                const type = quickSelectButton.dataset.type;
                if (!controlRow) return;


                // Find the specific input and slider that match the button's type.
                // This was the source of the bug. It was just finding the first input/slider.
                const input = controlRow.querySelector(`input[type="number"][data-type="${type}"]`);

                let value = quickSelectButton.dataset.value;

                if (value === 'custom') {
                    const max = parseInt(input.max, 10);
                    showNumberInputModal(`ระบุจำนวนข้อ`, `สูงสุดสำหรับหัวข้อนี้คือ ${max} ข้อ`, input.value, max).then(result => {
                        if (result !== null) {
                            input.value = result;
                            updateTotalCount();
                        }
                    });
                    return;
                }

                if (input) input.value = value;
                updateTotalCount();
            }

            // Handle "Start Quiz" button
            if (target.id === 'custom-quiz-start-btn' || target.closest('#custom-quiz-start-btn')) {
                console.log('[DEBUG] custom-quiz-start-btn clicked');
                handleStartCustomQuiz();
            }

            // NEW: Handle subject-level random button
            const randomSubjectBtn = target.closest('[data-action="random-subject"]');
            if (randomSubjectBtn) {
                e.stopPropagation(); // Prevent accordion from toggling
                const subjectKey = randomSubjectBtn.dataset.subjectKey;
                handleRandomSelectionForSubject(subjectKey);
                return; // Stop further processing for this click
            }

            // NEW: Handle group random buttons
            const groupBtn = target.closest('button[data-action="random-group"]');
            if (groupBtn) {
                const groupType = groupBtn.dataset.group;
                // Find input in the same container
                const container = groupBtn.closest('div.flex');
                const input = container.querySelector('input.random-per-chapter-input');
                const count = input ? parseInt(input.value, 10) : null;

                handleSubjectGroupRandom(groupType, count, false); // false = per chapter mode
            }

            // Handle "Random Selection" button
            if (target.id === 'custom-quiz-random-btn' || target.closest('#custom-quiz-random-btn')) {
                handleRandomSelection();
            }

            // NEW: Handle the new "Random All" button inside the generator
            if (target.id === 'generator-random-all-btn' || target.closest('#generator-random-all-btn')) {
                console.log('[DEBUG] generator-random-all-btn clicked');
                handleRandomSelection();
            }

            // NEW: Handle quick select total buttons (5, 10, 15, 20)
            const quickGroupBtn = target.closest('button[data-action="random-group-quick"]');
            if (quickGroupBtn) {
                const groupType = quickGroupBtn.dataset.group;
                const totalCount = parseInt(quickGroupBtn.dataset.value, 10);
                handleSubjectGroupRandom(groupType, totalCount, true); // true = total count mode
            }

            // Handle "Clear All" button in the summary panel (this is the one at the bottom of the sidebar)
            if (target.id === 'custom-quiz-clear-btn' || target.closest('#custom-quiz-clear-btn')) {
                const allInputs = document.querySelectorAll('#custom-quiz-category-selection input[type="number"]');
                allInputs.forEach(input => {
                    if (input.value !== '0') {
                        input.value = 0;
                    }
                });
                updateTotalCount();
            }
            // Handle the new "Clear Topic" button
            if (target.matches('button[data-action="clear-topic"]')) {
                const topicControl = target.closest('.specific-topic-control');
                if (topicControl) {
                    topicControl.querySelectorAll('input[type="number"]').forEach(input => {
                        input.value = 0;
                    });
                    updateTotalCount();
                }
            }

            // Handle accordion toggling
            const toggle = target.closest('.subject-accordion-toggle, .chapter-accordion-toggle');
            if (toggle) {
                e.preventDefault();
                // e.stopImmediatePropagation(); // Try this if still seeing double clicks

                // Double check it's not a button inside the toggle
                if (target.closest('button[data-action]')) {
                    console.log('[DEBUG] clicked a button inside toggle, skipping accordion');
                    return;
                }

                const content = toggle.nextElementSibling;
                const icon = toggle.querySelector('.chevron-icon');

                // Use a more robust check for open state
                const isCurrentlyOpen = content.classList.contains('grid-rows-[1fr]');
                console.log(`[DEBUG] accordion state: currently open = ${isCurrentlyOpen}, toggling to ${!isCurrentlyOpen}`);

                if (isCurrentlyOpen) {
                    content.classList.remove('grid-rows-[1fr]');
                    content.classList.add('grid-rows-[0fr]');
                    if (icon) icon.classList.remove('rotate-180');
                    toggle.setAttribute('aria-expanded', 'false');
                } else {
                    content.classList.remove('grid-rows-[0fr]');
                    content.classList.add('grid-rows-[1fr]');
                    if (icon) icon.classList.add('rotate-180');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            }
        });

        // Add listeners for timer mode radio buttons and Remedial checkboxes
        container.addEventListener('change', (e) => {
            const target = e.target;

            if (target.matches('.remedial-chapter-checkbox')) {
                const isChecked = target.checked;
                const chapterAccordionToggle = target.closest('.chapter-accordion-toggle');
                const topicsContainer = chapterAccordionToggle?.nextElementSibling;
                if (topicsContainer) {
                    topicsContainer.querySelectorAll('.remedial-topic-checkbox:not(:disabled)').forEach(cb => {
                        cb.checked = isChecked;
                    });
                }
                debouncedUpdateTotalCount();
            }

            if (target.matches('.remedial-topic-checkbox')) {
                const topicsContainer = target.closest('.specific-topics-container');
                const chapterAccordionToggle = topicsContainer?.previousElementSibling;
                if (chapterAccordionToggle) {
                    const chapterCb = chapterAccordionToggle.querySelector('.remedial-chapter-checkbox');
                    const allTopics = Array.from(topicsContainer.querySelectorAll('.remedial-topic-checkbox:not(:disabled)'));
                    const checkedTopics = allTopics.filter(cb => cb.checked);
                    if (chapterCb) {
                        chapterCb.checked = allTopics.length > 0 && checkedTopics.length === allTopics.length;
                    }
                }
                debouncedUpdateTotalCount();
            }

            if (e.target.name === 'custom-timer-mode') {
                const overallTimeInputContainer = document.getElementById('overall-time-input-container');
                const perQuestionTimeInputContainer = document.getElementById('per-question-time-input-container');
                const selectedMode = e.target.value;

                if (overallTimeInputContainer) {
                    overallTimeInputContainer.classList.toggle('hidden', selectedMode !== 'overall');
                }
                if (perQuestionTimeInputContainer) {
                    perQuestionTimeInputContainer.classList.toggle('hidden', selectedMode !== 'perQuestion');
                }
            }
        });
    }

    /**
     * Fetches data and builds the UI for the quiz creation modal.
     * @param {HTMLElement} triggerElement
     * @param {boolean} isRemedial
     */
    async function buildAndShowCreationModal(triggerElement, isRemedial = false) {
        const originalText = triggerElement.innerHTML;
        triggerElement.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังโหลดข้อมูล...`;
        triggerElement.disabled = true;
        isBadgeDismissed = false; // Reset badge state
        hasShownSuccess = false; // Reset success state
        isRemedialMode = isRemedial;

        // Adjust UI for Remedial Mode vs Normal Mode
        const modalTitleEl = document.getElementById("custom-quiz-modal-title");
        const modalDescEl = modalTitleEl?.nextElementSibling;
        const startBtn = document.getElementById("custom-quiz-start-btn");
        const remedialStartBtn = document.getElementById("remedial-quiz-start-btn");
        const timerFieldset = document.querySelector("#custom-quiz-modal fieldset");

        if (isRemedial) {
            if (modalTitleEl) modalTitleEl.textContent = "โหมดสอบซ่อม (Remedial Mode)";
            if (modalDescEl) modalDescEl.textContent = "เลือกบทเรียนที่ต้องการสอบซ่อม ระบบจะสุ่มคำถามข้อเขียน 5 ข้อ (เกณฑ์ผ่าน 3/5 ข้อ ในเวลา 10 นาที)";
            if (startBtn) startBtn.classList.add("hidden");
            if (remedialStartBtn) remedialStartBtn.classList.remove("hidden");
            if (timerFieldset) timerFieldset.classList.add("hidden");
        } else {
            if (modalTitleEl) modalTitleEl.textContent = "สร้างแบบทดสอบเอง";
            if (modalDescEl) modalDescEl.textContent = "เลือกหมวดหมู่, จำนวนข้อ และรูปแบบการจับเวลาที่คุณต้องการ";
            if (startBtn) startBtn.classList.remove("hidden");
            if (remedialStartBtn) remedialStartBtn.classList.add("hidden");
            if (timerFieldset) timerFieldset.classList.remove("hidden");
        }

        customQuizHubModal.close();
        customQuizModal.open(triggerElement); // Open modal immediately to show loading inside

        try {
            if (!quizDataCache) {
                quizDataCache = await fetchAllQuizData();
            }
            const { allQuestions } = quizDataCache;

            // Group questions by subject, chapter, and specific topic, and count types
            // NEW: Optimized grouping logic ($O(N)$ instead of $O(N^2)$ for duplicate checks)
            const groupedQuestions = {};

            for (const q of allQuestions) {
                if (!q.subCategory) continue;

                let mainKey = 'Uncategorized';
                let topics = ['General'];

                if (typeof q.subCategory === 'string') {
                    mainKey = q.subCategory;
                } else if (q.subCategory.main) {
                    mainKey = q.subCategory.main;
                    if (q.subCategory.specific) {
                        topics = Array.isArray(q.subCategory.specific) ? q.subCategory.specific : [q.subCategory.specific];
                    }
                }

                const subjectKey = q.sourceQuizCategory || q.category || 'Uncategorized';
                const questionType = q.type === 'fill-in-number' || q.type === 'fill-in' || q.choiceType === 'calculation' ? 'calculation' : 'theory';

                if (!groupedQuestions[subjectKey]) groupedQuestions[subjectKey] = {};
                if (!groupedQuestions[subjectKey][mainKey]) groupedQuestions[subjectKey][mainKey] = {};

                for (const topic of topics) {
                    if (!groupedQuestions[subjectKey][mainKey][topic]) {
                        groupedQuestions[subjectKey][mainKey][topic] = { theory: [], calculation: [] };
                    }

                    const group = groupedQuestions[subjectKey][mainKey][topic][questionType];
                    const isDuplicate = group.length > 0 && group.some(existing => existing.question === q.question);
                    if (!isDuplicate) {
                        group.push(q);
                    }
                }
            }

            // --- FIX: Move "บทที่ 8" (Final Exam) from M.4 to M.5 ---
            if (groupedQuestions['PhysicsM4']) {
                const m4Root = groupedQuestions['PhysicsM4'];
                if (!groupedQuestions['PhysicsM5']) groupedQuestions['PhysicsM5'] = {};
                const m5Root = groupedQuestions['PhysicsM5'];

                Object.keys(m4Root).forEach(chapterKey => {
                    if (chapterKey.startsWith('บทที่ 8') || chapterKey.includes('ปลายภาค')) {
                        if (!m5Root[chapterKey]) {
                            m5Root[chapterKey] = m4Root[chapterKey];
                        } else {
                            const target = m5Root[chapterKey];
                            const source = m4Root[chapterKey];

                            Object.keys(source).forEach(topic => {
                                if (!target[topic]) {
                                    target[topic] = source[topic];
                                } else {
                                    target[topic].theory.push(...source[topic].theory);
                                    target[topic].calculation.push(...source[topic].calculation);
                                }
                            });
                        }
                        delete m4Root[chapterKey];
                    }
                });
            }

            let categoryHTML = '';
            const sortedSubjects = Object.keys(allCategoryDetails).sort((a, b) => (allCategoryDetails[a].order || 99) - (allCategoryDetails[b].order || 99));

            const highSchoolKeys = ['PhysicsM4', 'PhysicsM5', 'PhysicsM6', 'EarthSpaceScienceBasic', 'EarthSpaceScienceAdvance'];
            const highSchoolSubjects = sortedSubjects.filter(k => highSchoolKeys.includes(k));
            const posnSubjects = sortedSubjects.filter(k => !highSchoolKeys.includes(k) && k !== 'General' && k !== 'Custom');

            // Helper function to generate HTML for a group of subjects
            const generateSubjectGroupHTML = (subjectKeys, groupTitle, isOpen = false) => {
                if (subjectKeys.length === 0) return '';

                let innerHTML = '';
                let groupTotalCount = 0;

                subjectKeys.forEach(subjectKey => {
                    const syllabus = getSyllabusForCategory(subjectKey);
                    const subjectDetails = allCategoryDetails[subjectKey];

                    if (!subjectDetails || (!syllabus && !groupedQuestions[subjectKey])) {
                        return;
                    }

                    const isBasicSubject = subjectKey.includes('Basic') || subjectKey.startsWith('Physics');
                    const topicKey = isBasicSubject ? 'learningOutcomes' : 'specificTopics';

                    let chapters = [];
                    if (syllabus) {
                        chapters = syllabus.units ? syllabus.units.flatMap(u => u.chapters) : (syllabus.chapters || []);
                    } else if (groupedQuestions[subjectKey]) {
                        chapters = Object.keys(groupedQuestions[subjectKey])
                            .sort((a, b) => a.localeCompare(b, 'th'))
                            .map(title => ({ title }));
                    }

                    let chapterAccordionsHTML = '';
                    let subjectTotalCount = 0;
                    const handledChapters = new Set();
                    const escapeAttr = (str) => String(str).replace(/"/g, '&quot;');

                    // 1. Process chapters from syllabus
                    chapters.forEach(chapter => {
                        handledChapters.add(chapter.title);
                        let topics = [...(chapter[topicKey] || [])].sort((a, b) => a.localeCompare(b, 'th'));

                        const chapterData = groupedQuestions[subjectKey]?.[chapter.title];
                        if (chapterData) {
                            const knownTopics = new Set(topics);
                            Object.keys(chapterData).forEach(dataTopic => {
                                if (!knownTopics.has(dataTopic)) {
                                    topics.push(dataTopic);
                                }
                            });
                        }

                        let chapterTotalCount = 0;
                        let chapterTotalCalc = 0;
                        const topicControlsHTML = topics.map(topic => {
                            const counts = groupedQuestions[subjectKey]?.[chapter.title]?.[topic] || { theory: [], calculation: [] };
                            const topicTotal = counts.theory.length + counts.calculation.length;
                            chapterTotalCount += topicTotal;
                            chapterTotalCalc += counts.calculation.length;

                            return createSpecificTopicControlHTML(subjectKey, chapter.title, topic, {
                                theory: counts.theory.length,
                                calculation: counts.calculation.length,
                                total: topicTotal
                            }, isBasicSubject);
                        }).join('');

                        subjectTotalCount += chapterTotalCount;

                        if (topicControlsHTML) {
                            if (isRemedialMode) {
                                chapterAccordionsHTML += `
                                    <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                        <div class="chapter-accordion-toggle flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                            <div class="flex items-center gap-3 min-w-0 flex-grow cursor-pointer" data-chapter-header>
                                                <input type="checkbox" data-subject="${escapeAttr(subjectKey)}" data-chapter="${escapeAttr(chapter.title)}" class="remedial-chapter-checkbox h-5 w-5 text-amber-600 rounded border-gray-300 dark:border-gray-600 focus:ring-amber-500 cursor-pointer flex-shrink-0" ${chapterTotalCalc === 0 ? 'disabled' : ''}>
                                                <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">
                                                    ${chapter.title || 'บทเรียน'} 
                                                    <span class="text-sm font-normal text-amber-600 dark:text-amber-400 font-sans">(${chapterTotalCalc} ข้อเขียน)</span>
                                                </h4>
                                            </div>
                                            <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 cursor-pointer" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                        <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                            <div class="overflow-hidden">${topicControlsHTML}</div>
                                        </div>
                                    </div>`;
                            } else {
                                chapterAccordionsHTML += `
                                    <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                        <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                            <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">
                                                ${chapter.title || 'บทเรียน'} 
                                                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">(${chapterTotalCount} ข้อ)</span>
                                            </h4>
                                            <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                        <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                            <div class="overflow-hidden">${topicControlsHTML}</div>
                                        </div>
                                    </div>`;
                            }
                        }
                    });

                    // 2. Process extra chapters
                    const extraChapters = groupedQuestions[subjectKey] ? Object.keys(groupedQuestions[subjectKey]).filter(t => !handledChapters.has(t)) : [];
                    extraChapters.forEach(chapterTitle => {
                        const chapterData = groupedQuestions[subjectKey][chapterTitle];
                        const topics = Object.keys(chapterData).sort((a, b) => a.localeCompare(b, 'th'));

                        let chapterTotalCount = 0;
                        let chapterTotalCalc = 0;
                        const topicControlsHTML = topics.map(topic => {
                            const counts = chapterData[topic];
                            const topicTotal = counts.theory.length + counts.calculation.length;
                            chapterTotalCount += topicTotal;
                            chapterTotalCalc += counts.calculation.length;

                            return createSpecificTopicControlHTML(subjectKey, chapterTitle, topic, {
                                theory: counts.theory.length,
                                calculation: counts.calculation.length,
                                total: topicTotal
                            }, isBasicSubject);
                        }).join('');

                        subjectTotalCount += chapterTotalCount;

                        if (topicControlsHTML) {
                            if (isRemedialMode) {
                                chapterAccordionsHTML += `
                                    <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                        <div class="chapter-accordion-toggle flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                            <div class="flex items-center gap-3 min-w-0 flex-grow cursor-pointer" data-chapter-header>
                                                <input type="checkbox" data-subject="${escapeAttr(subjectKey)}" data-chapter="${escapeAttr(chapterTitle)}" class="remedial-chapter-checkbox h-5 w-5 text-amber-600 rounded border-gray-300 dark:border-gray-600 focus:ring-amber-500 cursor-pointer flex-shrink-0" ${chapterTotalCalc === 0 ? 'disabled' : ''}>
                                                <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">
                                                    ${chapterTitle} 
                                                    <span class="text-sm font-normal text-amber-600 dark:text-amber-400 font-sans">(${chapterTotalCalc} ข้อเขียน)</span>
                                                </h4>
                                            </div>
                                            <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 cursor-pointer" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                        <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                            <div class="overflow-hidden">${topicControlsHTML}</div>
                                        </div>
                                    </div>`;
                            } else {
                                chapterAccordionsHTML += `
                                    <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                        <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                            <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">
                                                ${chapterTitle} 
                                                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">(${chapterTotalCount} ข้อ)</span>
                                            </h4>
                                            <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                        <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                            <div class="overflow-hidden">${topicControlsHTML}</div>
                                        </div>
                                    </div>`;
                            }
                        }
                    });

                    if (chapterAccordionsHTML) {
                        groupTotalCount += subjectTotalCount;
                        innerHTML += `
                            <div class="subject-container bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" style="content-visibility: auto; contain-intrinsic-size: 0 100px;">
                                <div class="subject-accordion-toggle p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" role="button" aria-expanded="false">
                                    <div class="flex justify-between items-center">
                                        <div class="flex items-center gap-3 min-w-0">
                                            <img src="${subjectDetails.icon}" class="h-8 w-8 flex-shrink-0" alt="${subjectDetails.displayName} icon">
                                            <div class="flex flex-col">
                                                <span class="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">${subjectDetails.displayName}</span>
                                                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">รวม ${subjectTotalCount} ข้อ</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <button type="button" data-action="random-subject" data-subject-key="${subjectKey}" class="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full transition-all" title="สุ่มข้อสอบในวิชานี้ (แบบกระจายทุกบท)">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </button>
                                            <svg class="chevron-icon h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div class="chapters-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden pt-2">${chapterAccordionsHTML}</div>
                                </div>
                            </div>`;
                    }
                });

                if (!innerHTML) return '';

                // Wrap in master accordion with improved visual design
                return `
                    <div class="mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group-accordion" style="content-visibility: auto; contain-intrinsic-size: 0 500px;">
                        <div class="subject-accordion-toggle p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex justify-between items-center" data-group-toggle="${groupTitle}">
                            <div class="flex items-center gap-3">
                                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    ${groupTitle}
                                </h3>
                                <span class="px-2.5 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                                    รวม ${groupTotalCount} ข้อ
                                </span>
                            </div>
                            <svg class="chevron-icon h-6 w-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div class="grid ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} transition-[grid-template-rows] duration-300 ease-in-out">
                            <div class="overflow-hidden">
                                <div class="p-4 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                                    ${innerHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            };

            if (categorySelectionContainer) {
                categorySelectionContainer.innerHTML = ''; // Clear container
                categorySelectionContainer.className = "space-y-4";
            }

            const appendChunk = (html) => {
                if (categorySelectionContainer && html) {
                    categorySelectionContainer.insertAdjacentHTML('beforeend', html);
                }
            };

            // High School defaults to OPEN, POSN defaults to CLOSED
            appendChunk(generateSubjectGroupHTML(highSchoolSubjects, "มัธยมศึกษาตอนปลาย (High School)", true));

            // Allow UI to breathe before rendering the next heavy block
            await new Promise(r => setTimeout(r, 20));

            appendChunk(generateSubjectGroupHTML(posnSubjects, "สอวน. (POSN)", false));

            // Helper to calculate available questions for a group
            const getAvailableCount = (groupType) => {
                let count = 0;
                const mappings = getGroupMappings(groupType);

                if (mappings.subjects) {
                    mappings.subjects.forEach(subject => {
                        if (groupedQuestions[subject]) {
                            Object.values(groupedQuestions[subject]).forEach(chapter => {
                                Object.values(chapter).forEach(topic => {
                                    count += (topic.theory?.length || 0) + (topic.calculation?.length || 0);
                                });
                            });
                        }
                    });
                } else if (mappings.mappings) {
                    mappings.mappings.forEach(map => {
                        if (groupedQuestions[map.subject]) {
                            map.chapters.forEach(chapterTitle => {
                                if (groupedQuestions[map.subject][chapterTitle]) {
                                    Object.values(groupedQuestions[map.subject][chapterTitle]).forEach(topic => {
                                        count += (topic.theory?.length || 0) + (topic.calculation?.length || 0);
                                    });
                                }
                            });
                        }
                    });
                }
                return count;
            };

            // Helper to generate random control row
            const createRandomRow = (label, groupType, color) => {
                const available = getAvailableCount(groupType);
                const disabled = available === 0;

                return `
                <div class="specific-topic-control py-3 px-4 border-t border-gray-200 dark:border-gray-700/50 ${disabled ? 'opacity-50 pointer-events-none' : ''}">
                    <div class="flex justify-between items-center mb-2">
                        <label class="font-medium text-gray-700 dark:text-gray-200 text-sm flex-grow">
                            ${label} <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(มี ${available} ข้อ)</span>
                        </label>
                    </div>
                    <div class="mt-2 space-y-2">
                        <!-- Quick Select Row (Total) -->
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs text-gray-500 dark:text-gray-400 w-20">สุ่มด่วน<br>(รวม)</span>
                            <div class="flex-grow flex flex-wrap justify-end gap-1">
                                <button data-action="random-group-quick" data-group="${groupType}" data-value="5" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-${color}-100 hover:text-${color}-700 dark:hover:bg-${color}-900/50 dark:hover:text-${color}-300 transition-colors">5</button>
                                <button data-action="random-group-quick" data-group="${groupType}" data-value="10" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-${color}-100 hover:text-${color}-700 dark:hover:bg-${color}-900/50 dark:hover:text-${color}-300 transition-colors">10</button>
                                <button data-action="random-group-quick" data-group="${groupType}" data-value="20" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-${color}-100 hover:text-${color}-700 dark:hover:bg-${color}-900/50 dark:hover:text-${color}-300 transition-colors">20</button>
                                <button data-action="random-group-quick" data-group="${groupType}" data-value="30" class="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-${color}-100 hover:text-${color}-700 dark:hover:bg-${color}-900/50 dark:hover:text-${color}-300 transition-colors">30</button>
                            </div>
                        </div>
                        
                        <!-- Per Chapter Row -->
                        <div class="flex items-center justify-between gap-2">
                             <span class="text-xs text-gray-500 dark:text-gray-400 w-20">เฉลี่ย<br>(ต่อบท)</span>
                             <div class="flex items-center gap-2 justify-end flex-grow">
                                <input type="number" min="1" max="20" value="2" class="random-per-chapter-input w-14 py-1 px-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900/50 text-center font-semibold text-sm text-${color}-600 dark:text-${color}-400 focus:ring-${color}-500 focus:border-${color}-500" placeholder="ข้อ">
                                <button data-action="random-group" data-group="${groupType}" class="px-3 py-1 bg-${color}-100 text-${color}-700 dark:bg-${color}-900/50 dark:text-${color}-300 rounded-full text-xs font-bold hover:bg-${color}-200 dark:hover:bg-${color}-800 transition-colors">
                                    สุ่ม
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
                `;
            };

            // Add the "Subject Group Random" accordion at the end
            const randomControlsHTML = `
                <div id="test-generator-subject-container" class="subject-container bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div id="test-generator-subject-toggle" class="subject-accordion-toggle p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" role="button" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="h-8 w-8 flex-shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <span class="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">สร้างชุดข้อสอบ (Test Generator)</span>
                            </div>
                            <svg class="chevron-icon h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <div id="test-generator-chapters-container" class="chapters-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                        <div class="overflow-hidden pt-2">

                            <!-- NEW "Random All" Button -->
                            <div class="px-2 pb-4">
                                <button id="generator-random-all-btn" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/70 text-sm font-bold transition shadow-sm border border-purple-200 dark:border-purple-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-4.42 5.5 5.5 0 017.777-7.777 5.5 5.5 0 014.42 9.201l-1.586 1.586a.75.75 0 11-1.06-1.06l1.586-1.586a4 4 0 00-5.657-5.657 4 4 0 00-6.682 3.218 4 4 0 003.218 6.682l2.33-2.33a.75.75 0 011.06 1.06l-2.33 2.33a5.5 5.5 0 01-7.777-7.777 5.5 5.5 0 019.201 4.42l-1.586 1.586a.75.75 0 11-1.06 1.06l1.586-1.586z" clip-rule="evenodd" />
                                        <path fill-rule="evenodd" d="M4.688 8.576a5.5 5.5 0 019.201 4.42 5.5 5.5 0 01-7.777 7.777 5.5 5.5 0 01-4.42-9.201l1.586-1.586a.75.75 0 111.06 1.06l-1.586 1.586a4 4 0 005.657 5.657 4 4 0 006.682-3.218 4 4 0 00-3.218-6.682l-2.33 2.33a.75.75 0 01-1.06-1.06l2.33-2.33a5.5 5.5 0 017.777 7.777 5.5 5.5 0 01-9.201-4.42l1.586-1.586a.75.75 0 111.06-1.06l-1.586 1.586z" clip-rule="evenodd" />
                                    </svg>
                                    สุ่มจากทุกวิชา (Random All)
                                </button>
                            </div>
                            
                            <!-- Physics Group (Accordion) -->
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div id="test-generator-physics-toggle" class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit">ฟิสิกส์ (Physics)</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden bg-white dark:bg-gray-800/50">
                                        ${createRandomRow('ฟิสิกส์ (รวมทุกระดับชั้น)', 'physics', 'red')}
                                        ${createRandomRow('ฟิสิกส์ ม.4', 'physics-m4', 'red')}
                                        ${createRandomRow('ฟิสิกส์ ม.5', 'physics-m5', 'orange')}
                                        ${createRandomRow('ฟิสิกส์ ม.6', 'physics-m6', 'amber')}
                                    </div>
                                </div>
                            </div>

                            <!-- Earth Science Basic (Accordion) -->
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit">วิทย์โลก (พื้นฐาน)</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden bg-white dark:bg-gray-800/50">
                                        ${createRandomRow('วิทย์โลก (พื้นฐาน) ทั้งหมด', 'earth-basic', 'green')}
                                    </div>
                                </div>
                            </div>

                            <!-- Earth Science Advanced (Accordion) -->
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit">วิทย์โลก (เพิ่มเติม)</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden bg-white dark:bg-gray-800/50">
                                        ${createRandomRow('วิทย์โลก (เพิ่มเติม) ทั้งหมด', 'earth-advanced', 'indigo')}
                                    </div>
                                </div>
                            </div>

                            <!-- POSN Earth Science (Accordion) -->
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit">สอวน. วิทย์โลก</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden bg-white dark:bg-gray-800/50">
                                        ${createRandomRow('สอวน. วิทย์โลก ทั้งหมด', 'posn-earth', 'teal')}
                                    </div>
                                </div>
                            </div>

                            <!-- POSN Astronomy (Accordion) -->
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit">สอวน. ดาราศาสตร์</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden bg-white dark:bg-gray-800/50">
                                        ${createRandomRow('สอวน. ดาราศาสตร์ ทั้งหมด', 'posn-astro', 'purple')}
                                    </div>
                                </div>
                            </div>

                            <!-- Specific Topics (Accordion) -->
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit">หัวข้อเฉพาะ (Specific Topics)</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden bg-white dark:bg-gray-800/50">
                                        ${createRandomRow('ดาราศาสตร์ (Astronomy)', 'astronomy', 'purple')}
                                        ${createRandomRow('ธรณีวิทยา (Geology)', 'geology', 'amber')}
                                        ${createRandomRow('สมุทรศาสตร์ (Oceanography)', 'oceanography', 'teal')}
                                        ${createRandomRow('อุตุนิยมวิทยา (Meteorology)', 'meteorology', 'blue')}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;

            appendChunk(randomControlsHTML);
            updateTotalCount();
        } catch (error) {
            console.error("Failed to fetch data for custom quiz creation:", error);
            // Optionally, show an error message to the user
        } finally {
            // Re-enable the button and restore its text
            triggerElement.innerHTML = originalText;
            triggerElement.disabled = false;
            // Setup listeners after all content is loaded
            // Initialize sliders visual state
            if (customQuizModal.modal) {
                customQuizModal.modal.querySelectorAll('input[type="range"]').forEach(updateSliderTrack);
            }
            updateTotalCount();
        }
    }

    /**
     * Gathers user selections, creates a custom quiz object, and saves it.
     */
    async function handleStartCustomQuiz() {
        const startBtn = document.getElementById('custom-quiz-start-btn');
        const btnContent = startBtn?.querySelector('.btn-content');
        const btnLoader = startBtn?.querySelector('.btn-loader');

        if (startBtn) {
            startBtn.disabled = true;
            btnContent?.classList.add('hidden');
            btnLoader?.classList.remove('hidden');
        }

        try {
            const counts = {};
            const subjectsInQuiz = new Set();

            document.querySelectorAll('#custom-quiz-category-selection input[type="number"][data-specific]').forEach(input => {
                const count = parseInt(input.value, 10) || 0;
                if (count > 0) {
                    const subject = input.dataset.subject;
                    const chapter = input.dataset.chapter;
                    const specific = input.dataset.specific;
                    const type = input.dataset.type; // 'theory' or 'calculation'

                    if (!counts[subject]) counts[subject] = {};
                    if (!counts[subject][chapter]) counts[subject][chapter] = {};
                    if (!counts[subject][chapter][specific]) {
                        counts[subject][chapter][specific] = { theory: 0, calculation: 0 };
                    }
                    counts[subject][chapter][specific][type] = count;

                    subjectsInQuiz.add(subject);
                }
            });

            if (!quizDataCache) {
                console.error("Quiz data has not been loaded. Cannot start quiz.");
                if (startBtn) {
                    startBtn.disabled = false;
                    startBtn.innerHTML = 'เริ่มทำแบบทดสอบ';
                }
                return;
            }

            const { allQuestions, scenarios } = quizDataCache;
            let selectedQuestions = [];

            for (const [subject, chapters] of Object.entries(counts)) {
                for (const [chapter, specifics] of Object.entries(chapters)) {
                    for (const [specific, typeCounts] of Object.entries(specifics)) {
                        // Filter the pool for this specific topic
                        const topicPool = allQuestions.filter(q => {
                            if (!q.subCategory) return false;

                            // Ensure subject matches
                            const questionSubject = q.sourceQuizCategory || 'Uncategorized';
                            if (questionSubject !== subject) return false;

                            const mainCat = (typeof q.subCategory === 'object') ? q.subCategory.main : q.subCategory;
                            if (mainCat !== chapter) return false;

                            if (typeof q.subCategory === 'object' && q.subCategory.specific) {
                                const specificsInQuestion = Array.isArray(q.subCategory.specific) ? q.subCategory.specific : [q.subCategory.specific];
                                return specificsInQuestion.includes(specific);
                            }

                            return false;
                        });

                        // Separate the pool by question type
                        const theoryPool = topicPool.filter(q => q.type !== 'fill-in-number');
                        const calculationPool = topicPool.filter(q => q.type === 'fill-in-number');

                        // Shuffle and slice for each type
                        const chosenTheory = [...theoryPool].sort(() => 0.5 - Math.random()).slice(0, typeCounts.theory);
                        const chosenCalculation = [...calculationPool].sort(() => 0.5 - Math.random()).slice(0, typeCounts.calculation);

                        // Combine and reconstruct questions with scenario context
                        const allChosenForTopic = [...chosenTheory, ...chosenCalculation];
                        const reconstructed = allChosenForTopic.map(q => {
                            if (q.scenarioId && scenarios && scenarios.has(q.scenarioId)) {
                                const scenario = scenarios.get(q.scenarioId);
                                const description = (scenario.description || '').replace(/\n/g, '<br>');
                                return {
                                    ...q,
                                    question: `<div class="p-4 mb-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg"><p class="font-bold text-lg">${scenario.title}</p><div class="mt-2 text-gray-700 dark:text-gray-300">${description}</div></div>${q.question}`,
                                };
                            }
                            return q;
                        });
                        selectedQuestions.push(...reconstructed);
                    }
                }
            }

            // A more concise way to get unique questions if they are object references.
            // This avoids the stringify/parse overhead.
            const uniqueQuestions = [...new Map(selectedQuestions.map(item => [item.question, item])).values()];
            selectedQuestions = uniqueQuestions;

            if (selectedQuestions.length === 0) {
                showToast("ข้อผิดพลาด", "กรุณาเลือกคำถามอย่างน้อย 1 ข้อ", "⚠️", "error");
                if (startBtn) {
                    startBtn.disabled = false;
                    btnContent?.classList.remove('hidden');
                    btnLoader?.classList.add('hidden');
                }
                return;
            }

            const timerMode = document.querySelector('input[name="custom-timer-mode"]:checked')?.value || 'none';
            let customTime = null;
            if (timerMode === 'overall') {
                customTime = parseInt(document.getElementById('custom-timer-overall-minutes').value, 10) * 60;
            } else if (timerMode === 'perQuestion') {
                customTime = parseInt(document.getElementById('custom-timer-per-question-seconds').value, 10);
            }

            const descriptionParts = Object.values(counts).reduce((acc, chapters) => {
                for (const [chapterTitle, specifics] of Object.entries(chapters)) {
                    const totalInChapter = Object.values(specifics).reduce((sum, typeCounts) => sum + (typeCounts.theory || 0) + (typeCounts.calculation || 0), 0);
                    acc[chapterTitle] = (acc[chapterTitle] || 0) + totalInChapter;
                }
                return acc;
            }, {});

            const detailedDescription = Object.entries(descriptionParts).map(([title, count]) => {
                return `${title}: ${count} ข้อ`;
            }).join(' | ');

            const subjectArray = Array.from(subjectsInQuiz);
            const singleSubject = subjectArray.length === 1 ? subjectArray[0] : 'Custom';

            const customQuiz = await createAndSaveCustomQuiz({
                title: `แบบทดสอบ (${new Date().toLocaleString('th-TH')})`,
                questions: selectedQuestions,
                description: detailedDescription,
                timerMode: timerMode,
                customTime: customTime,
                category: singleSubject,
                categoryDisplay: allCategoryDetails[singleSubject]?.displayName || 'แบบทดสอบที่สร้างเอง'
            });

            // NEW: Check if we are in a lobby context (e.g., started from Challenge Mode)
            if (window.challengeContext && typeof window.challengeContext.onQuizCreated === 'function') {
                window.challengeContext.onQuizCreated(customQuiz);
                customQuizModal.close();
                showToast('สร้างสำเร็จ', 'เลือกแบบทดสอบเรียบร้อยแล้ว', '✅');
            } else {
                // Default behavior: Redirect to the quiz
                window.location.href = `./quiz/index.html?id=${customQuiz.customId}`;
            }
        } catch (error) {
            console.error("Error starting custom quiz:", error);
            showToast("เกิดข้อผิดพลาด", "ไม่สามารถเริ่มทำแบบทดสอบได้: " + error.message, "❌", "error");
            if (startBtn) {
                startBtn.disabled = false;
                btnContent?.classList.remove('hidden');
                btnLoader?.classList.add('hidden');
            }
        }
    }

    async function handleStartRemedialQuiz() {
        const remedialStartBtn = document.getElementById('remedial-quiz-start-btn');
        if (remedialStartBtn) remedialStartBtn.disabled = true;

        try {
            // Gather checked topics and chapters
            const checkedTopics = Array.from(document.querySelectorAll('#custom-quiz-category-selection input.remedial-topic-checkbox:checked'));
            const checkedChapters = Array.from(document.querySelectorAll('#custom-quiz-category-selection input.remedial-chapter-checkbox:checked'));

            if (checkedTopics.length === 0 && checkedChapters.length === 0) {
                showToast("ไม่พบการเลือกบทเรียน", "กรุณาติ๊กเลือกบทเรียนหรือจุดประสงค์ที่ต้องการสอบซ่อมอย่างน้อย 1 รายการ", "⚠️", "warning");
                if (remedialStartBtn) remedialStartBtn.disabled = false;
                return;
            }

            if (!quizDataCache) {
                console.error("Quiz data has not been loaded.");
                if (remedialStartBtn) remedialStartBtn.disabled = false;
                return;
            }

            const { allQuestions, scenarios } = quizDataCache;

            const selectedChapterKeys = new Set(checkedChapters.map(cb => `${cb.dataset.subject}___${cb.dataset.chapter}`));
            const selectedTopicKeys = new Set(checkedTopics.map(cb => `${cb.dataset.subject}___${cb.dataset.chapter}___${cb.dataset.specific}`));

            // Collect all fill-in / calculation questions for the selected chapters/topics
            const fillInPool = allQuestions.filter(q => {
                if (!q.subCategory) return false;
                const isFillIn = q.type === 'fill-in-number' || q.type === 'fill-in' || q.choiceType === 'calculation';
                if (!isFillIn) return false;

                const subject = q.sourceQuizCategory || 'Uncategorized';
                const mainCat = (typeof q.subCategory === 'object') ? q.subCategory.main : q.subCategory;
                const chapterKey = `${subject}___${mainCat}`;

                if (selectedChapterKeys.has(chapterKey)) return true;

                if (typeof q.subCategory === 'object' && q.subCategory.specific) {
                    const specifics = Array.isArray(q.subCategory.specific) ? q.subCategory.specific : [q.subCategory.specific];
                    return specifics.some(sp => selectedTopicKeys.has(`${subject}___${mainCat}___${sp}`));
                }

                return false;
            });

            if (fillInPool.length < 5) {
                showToast(
                    "ข้อสอบข้อเขียนไม่เพียงพอ",
                    `ในบทเรียนที่เลือกมีข้อสอบข้อเขียนเพียง ${fillInPool.length} ข้อ (ต้องการอย่างน้อย 5 ข้อ) กรุณาเลือกบทเรียนเพิ่มเติม`,
                    "⚠️",
                    "error"
                );
                if (remedialStartBtn) remedialStartBtn.disabled = false;
                return;
            }

            // Shuffle and pick 5 questions
            const shuffled = [...fillInPool].sort(() => 0.5 - Math.random());
            const chosen5 = shuffled.slice(0, 5);

            // Reconstruct scenario text if needed
            const reconstructed = chosen5.map(q => {
                if (q.scenarioId && scenarios && scenarios.has(q.scenarioId)) {
                    const scenario = scenarios.get(q.scenarioId);
                    const description = (scenario.description || '').replace(/\n/g, '<br>');
                    return {
                        ...q,
                        question: `<div class="p-4 mb-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-amber-500 rounded-r-lg"><p class="font-bold text-lg">${scenario.title}</p><div class="mt-2 text-gray-700 dark:text-gray-300">${description}</div></div>${q.question}`,
                    };
                }
                return q;
            });

            const remedialQuiz = await createAndSaveCustomQuiz({
                title: `สอบซ่อม (${new Date().toLocaleDateString('th-TH')})`,
                questions: reconstructed,
                description: `โหมดสอบซ่อม: สุ่มข้อเขียน 5 ข้อ (จับเวลารวม 10 นาที | ผ่านเกณฑ์ 3/5 ข้อ)`,
                timerMode: 'overall',
                customTime: 600, // 10 minutes
                category: 'Custom',
                categoryDisplay: 'แบบทดสอบสอบซ่อม',
                isRemedial: true,
                passingScore: 3
            });

            customQuizModal.close();
            window.location.href = `./quiz/index.html?id=${remedialQuiz.customId}`;
        } catch (error) {
            console.error("Error starting remedial quiz:", error);
            showToast("เกิดข้อผิดพลาด", "ไม่สามารถเริ่มสอบซ่อมได้: " + error.message, "❌", "error");
            if (remedialStartBtn) remedialStartBtn.disabled = false;
        }
    }

    function handleRandomSelection() {
        const allInputs = Array.from(document.querySelectorAll('#custom-quiz-category-selection input[type="number"][data-type]'));
        if (allInputs.length === 0) { return; }

        const maxQuestions = allInputs.reduce((sum, input) => sum + parseInt(input.max, 10), 0);

        if (maxQuestions === 0) {
            showToast("ไม่พบข้อมูล", "ไม่มีคำถามให้เลือกในหมวดหมู่นี้", "⚠️", "info");
            return;
        }

        const defaultVal = Math.min(20, maxQuestions);

        // Setup the specific Random All modal instead of generic number input
        if (randomAllInput && randomAllSlider) {
            randomAllInput.max = maxQuestions;
            randomAllSlider.max = maxQuestions;
            randomAllInput.value = defaultVal;
            randomAllSlider.value = defaultVal;
            updateSliderTrack(randomAllSlider);

            // Update range labels if they exist
            const labels = randomAllSlider.closest('.mb-8')?.querySelectorAll('.flex.justify-between.text-xs span');
            if (labels && labels.length >= 2) {
                labels[1].textContent = maxQuestions;
            }
        }

        randomAllModal.open();
    }

    function executeRandomSelection(targetCount) {
        const allInputs = Array.from(document.querySelectorAll('#custom-quiz-category-selection input[type="number"][data-type]'));
        const maxQuestions = allInputs.reduce((sum, input) => sum + parseInt(input.max, 10), 0);

        if (targetCount > maxQuestions) targetCount = maxQuestions;

        // Reset
        document.querySelectorAll('#custom-quiz-category-selection input[type="number"][data-type]').forEach(input => {
            if (input.value !== '0') { input.value = 0; }
        });

        let currentCount = 0;
        // Create a pool of available inputs (indices)
        let availableInputs = allInputs.map((input, index) => ({ index, max: parseInt(input.max, 10) })).filter(item => item.max > 0);

        while (currentCount < targetCount && availableInputs.length > 0) {
            const randIndex = Math.floor(Math.random() * availableInputs.length);
            const item = availableInputs[randIndex];
            const input = allInputs[item.index];

            const currentVal = parseInt(input.value, 10);
            input.value = currentVal + 1;
            currentCount++;

            if (parseInt(input.value, 10) >= item.max) {
                availableInputs.splice(randIndex, 1);
            }
        }

        updateTotalCount();
    }

    // --- 3. Event Listeners Setup ---

    // Main button on the index page to open the custom quiz hub
    createCustomQuizBtn.addEventListener("click", (e) => {
        console.log('[DEBUG] custom-quiz-handler: createCustomQuizBtn clicked');
        if (listLoader) listLoader.classList.remove('hidden');
        if (customQuizListContainer) customQuizListContainer.innerHTML = '';
        if (noCustomQuizzesMsg) noCustomQuizzesMsg.classList.add('hidden');

        customQuizHubModal.open(e.currentTarget);

        // Use a small timeout to ensure the loader is rendered before the synchronous,
        // potentially blocking renderCustomQuizList() call. This improves UX.
        setTimeout(() => {
            renderCustomQuizList();
        }, 50);
    });

    // Button inside the hub to open the creation modal
    // [FIX] Redundant listener removed: Handled by delegated listener below (approx line 2058)
    // openCreateQuizModalBtn.addEventListener("click", (e) => buildAndShowCreationModal(e.currentTarget));

    // Event delegation for the list of custom quizzes (edit, delete, etc.)
    if (customQuizListContainer) {
        customQuizListContainer.addEventListener("click", async (event) => {
            const target = event.target;
            const quizItemEl = target.closest(".custom-quiz-item");
            if (!quizItemEl) return;

            const customId = quizItemEl.dataset.quizId;

            // Case 1: Clicked on an action button (edit, delete, save, cancel)
            const actionButton = target.closest("button[data-action]");
            if (actionButton) {
                event.stopPropagation(); // Prevent other events like link navigation
                const action = actionButton.dataset.action;

                switch (action) {
                    case "delete": {
                        // Use the styled confirmation modal instead of the native browser confirm.
                        if (confirmModalTitle) confirmModalTitle.textContent = 'ยืนยันการลบแบบทดสอบ';
                        if (confirmModalDescription) confirmModalDescription.textContent = 'คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบนี้? ข้อมูลความคืบหน้าทั้งหมดที่เกี่ยวข้องจะถูกลบไปด้วยและไม่สามารถย้อนกลับได้';

                        onConfirmAction = () => deleteCustomQuiz(customId);
                        // Use inline style for z-index to ensure it's applied over other modals.
                        if (confirmModalEl) confirmModalEl.style.zIndex = '99';

                        confirmModal.open(actionButton);
                        break;
                    }
                    case "edit":
                        toggleEditMode(quizItemEl, true);
                        break;
                    case "cancel":
                        toggleEditMode(quizItemEl, false);
                        break;
                    case "save": {
                        const input = quizItemEl.querySelector("input[type='text']");
                        if (input && input.value.trim()) {
                            const newTitle = input.value.trim();
                            await updateCustomQuizTitle(customId, newTitle);
                            const titleDisplayP = quizItemEl.querySelector("[data-title-display] p.font-bold");
                            if (titleDisplayP) titleDisplayP.textContent = newTitle;
                            toggleEditMode(quizItemEl, false);
                        }
                        break;
                    }
                }
                return; // Action handled, no need to proceed.
            }

            // Case 2: Clicked on the start/continue link
            const startLink = target.closest("a.start-custom-quiz-btn");
            if (startLink) {
                const savedQuizzes = await getSavedCustomQuizzes();
                const quiz = savedQuizzes.find(q => q.customId === customId);
                if (!quiz) return;

                const progress = getQuizProgress(quiz.storageKey, quiz.questions.length);

                if (progress.isFinished) {
                    event.preventDefault();
                    activeQuizUrl = startLink.href;
                    activeStorageKey = quiz.storageKey;

                    // NEW: Set the modal title to provide context
                    const modalTitleEl = document.getElementById('completed-modal-title');
                    if (modalTitleEl) {
                        modalTitleEl.textContent = `แบบทดสอบ: "${quiz.title}"`;
                    }

                    completedModal.open(startLink);
                }
                // If not finished, the default 'a' tag behavior will handle navigation.
            }
        });
    }

    // --- Completed Quiz Modal Button Listeners ---
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

    // --- Confirmation Modal Action Listener ---
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', () => {
            if (typeof onConfirmAction === 'function') {
                onConfirmAction();
            }
            onConfirmAction = null; // Reset after use
            confirmModal.close();
        });
    }
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            onConfirmAction = null; // Clear action if user cancels
        });
    }

    // Robustly handle z-index for the confirmation modal.
    // This ensures it appears above the hub modal, even when closed via backdrop/ESC.
    if (confirmModalEl) {
        const observer = new MutationObserver(() => {
            // When the modal is hidden (closed), remove the inline z-index.
            if (confirmModalEl.classList.contains('hidden')) {
                confirmModalEl.style.zIndex = '';
            }
        });
        observer.observe(confirmModalEl, { attributes: true, attributeFilter: ['class'] });
    }

    // Initialize the delegated event listeners once
    bindCustomQuizModalEvents();

    /**
     * Handles random selection for a specific subject (all chapters).
     * @param {string} subjectKey - The key of the subject.
     */
    async function handleRandomSelectionForSubject(subjectKey) {
        const result = await showNumberInputModal(`ระบุจำนวนข้อ`, `ระบุจำนวนข้อที่ต้องการสุ่ม 'ต่อหนึ่งบท' สำหรับวิชานี้`, 2, 20);
        if (result === null) return;

        const numPerChapter = result;

        // Get all inputs for this subject
        const inputs = Array.from(document.querySelectorAll(`#custom-quiz-category-selection input[type="number"][data-subject="${subjectKey}"]`));

        if (inputs.length === 0) {
            showToast("ไม่พบข้อมูล", "ไม่พบหัวข้อสำหรับวิชานี้", "⚠️", "info");
            return;
        }

        // Reset inputs for this subject
        inputs.forEach(input => {
            if (input.value !== '0') { input.value = 0; }
        });

        // Group inputs by chapter to distribute per-chapter limit
        const inputsByChapter = inputs.reduce((acc, input) => {
            const chap = input.dataset.chapter;
            if (!acc[chap]) acc[chap] = [];
            acc[chap].push(input);
            return acc;
        }, {});

        let totalAdded = 0;

        Object.values(inputsByChapter).forEach(chapterInputs => {
            // Calculate total available questions in this chapter
            const availableInChapter = chapterInputs.map(input => ({
                input,
                max: parseInt(input.max, 10),
                current: 0
            })).filter(item => item.max > 0);

            const totalAvailable = availableInChapter.reduce((sum, item) => sum + item.max, 0);
            const targetForChapter = Math.min(numPerChapter, totalAvailable);

            let addedToChapter = 0;
            while (addedToChapter < targetForChapter && availableInChapter.length > 0) {
                const randIndex = Math.floor(Math.random() * availableInChapter.length);
                const item = availableInChapter[randIndex];

                if (item.current < item.max) {
                    item.current++;
                    item.input.value = item.current;
                    addedToChapter++;
                    totalAdded++;
                } else {
                    availableInChapter.splice(randIndex, 1);
                }
            }
        });

        updateTotalCount();
        showToast("สำเร็จ", `สุ่มเลือกคำถามเพิ่มให้วิชานี้เรียบร้อยแล้ว (${totalAdded} ข้อ)`, "✅", "success");
    }

    /**
     * Helper to define group mappings for random generation
     */
    function getGroupMappings(groupType) {
        const mappings = {
            'physics': { subjects: ['PhysicsM4', 'PhysicsM5', 'PhysicsM6'] },
            'physics-m4': { subjects: ['PhysicsM4'] },
            'physics-m5': { subjects: ['PhysicsM5'] },
            'physics-m6': { subjects: ['PhysicsM6'] },
            'earth-basic': { subjects: ['EarthSpaceScienceBasic'] },
            'earth-advanced': { subjects: ['EarthSpaceScienceAdvance'] },
            'astronomy': {
                mappings: [
                    { subject: 'EarthSpaceScienceBasic', chapters: ['เอกภพและกาแล็กซี', 'ดาวฤกษ์', 'ระบบสุริยะ', 'เทคโนโลยีอวกาศ'] },
                    { subject: 'EarthSpaceScienceAdvance', chapters: ['เอกภพและกาแล็กซี', 'ดาวฤกษ์', 'ระบบสุริยะ', 'ทรงกลมฟ้า', 'การเคลื่อนที่ปรากฏของดาวเคราะห์', 'เทคโนโลยีอวกาศและการประยุกต์ใช้'] }
                ]
            },
            'geology': {
                mappings: [
                    { subject: 'EarthSpaceScienceBasic', chapters: ['โครงสร้างโลก', 'การแปรสัณฐานของแผ่นธรณี', 'ธรณีพิบัติภัย'] },
                    { subject: 'EarthSpaceScienceAdvance', chapters: ['โครงสร้างโลก', 'ธรณีแปรสัณฐาน', 'ธรณีพิบัติภัย', 'ลำดับชั้นหิน', 'ทรัพยากรธรณี', 'แผนที่'] }
                ]
            },
            'meteorology': {
                mappings: [
                    { subject: 'EarthSpaceScienceBasic', chapters: ['ลมฟ้าอากาศและภูมิอากาศ', 'การเปลี่ยนแปลงภูมิอากาศ', 'ข้อมูลและสารสนเทศทางอุตุนิยมวิทยา'] },
                    { subject: 'EarthSpaceScienceAdvance', chapters: ['อากาศ', 'การหมุนเวียนของระบบลมของโลก', 'เสถียรภาพอากาศและแนวปะทะอากาศ', 'การเปลี่ยนแปลงภูมิอากาศของโลก', 'การพยากรณ์อากาศ'] }
                ]
            },
            'oceanography': {
                mappings: [
                    { subject: 'EarthSpaceScienceBasic', chapters: ['ลมฟ้าอากาศและภูมิอากาศ'] }, // Includes ocean circulation
                    { subject: 'EarthSpaceScienceAdvance', chapters: ['การหมุนเวียนของน้ำในมหาสมุทร'] }
                ]
            },
            'posn-earth': { subjects: ['POSNEarthScience', 'PosnEarthScience'] },
            'posn-astro': { subjects: ['POSNAstronomy', 'PosnAstroJunior', 'PosnAstroSenior', 'AstronomyReview'] }
        };
        return mappings[groupType] || {};
    }

    /**
     * NEW: Handles balanced random question selection for specific subject groups.
     * @param {string} groupType - The type of group ('physics', 'earth-basic', 'earth-advanced').
     * @param {number|null} countOverride - If provided, this is the target count.
     * @param {boolean} isTotalCount - If true, countOverride is the TOTAL questions for the group. If false, it's per chapter.
     */
    async function handleSubjectGroupRandom(groupType, countOverride = null, isTotalCount = false) {
        const groupMapping = getGroupMappings(groupType);
        const groupName = groupType; // Simplified for brevity, could map to display name

        let numPerChapter;
        if (countOverride !== null) {
            numPerChapter = countOverride;
        } else {
            const result = await showNumberInputModal(`ระบุจำนวนข้อ`, `ระบุจำนวนข้อที่ต้องการสุ่ม 'ต่อหนึ่งบท' จากกลุ่ม ${groupName}`, 2, 20);
            if (result === null) return;
            numPerChapter = result;
        }

        if (isNaN(numPerChapter) || numPerChapter < 0) {
            showToast("ข้อมูลไม่ถูกต้อง", "กรุณาระบุจำนวนตัวเลขที่ถูกต้อง", "⚠️", "error");
            return;
        }

        // Reset all inputs first to avoid confusion
        document.querySelectorAll('#custom-quiz-category-selection input[type="number"]').forEach(input => {
            if (input.value !== '0') { input.value = 0; }
        });

        let totalAdded = 0;

        // Collect all relevant inputs first
        let targetInputs = [];

        if (groupMapping.subjects) {
            groupMapping.subjects.forEach(subjectKey => {
                const inputs = Array.from(document.querySelectorAll(`#custom-quiz-category-selection input[type="number"][data-subject="${subjectKey}"]`));
                targetInputs.push(...inputs);
            });
        } else if (groupMapping.mappings) {
            groupMapping.mappings.forEach(map => {
                map.chapters.forEach(chapterTitle => {
                    const inputs = Array.from(document.querySelectorAll(`#custom-quiz-category-selection input[type="number"][data-subject="${map.subject}"][data-chapter="${chapterTitle}"]`));
                    targetInputs.push(...inputs);
                });
            });
        }

        // Filter inputs that have questions available
        let availableInputs = targetInputs.map(input => ({
            input,
            max: parseInt(input.max, 10),
            current: parseInt(input.value, 10) || 0
        })).filter(item => item.max > 0);

        if (availableInputs.length === 0) {
            showToast("ไม่พบข้อมูล", "ไม่มีคำถามในกลุ่มที่เลือก", "⚠️", "info");
            return;
        }

        if (isTotalCount) {
            // Mode: Total Random (Distribute numPerChapter across the whole group)
            let currentTotal = 0;
            const targetTotal = numPerChapter;

            // Reset inputs in this group first
            availableInputs.forEach(item => {
                item.input.value = 0;
                item.current = 0;
            });

            while (currentTotal < targetTotal && availableInputs.length > 0) {
                // Pick a random input from the available pool
                const randIndex = Math.floor(Math.random() * availableInputs.length);
                const item = availableInputs[randIndex];

                if (item.current < item.max) {
                    item.current++;
                    item.input.value = item.current;
                    currentTotal++;
                    totalAdded++;
                } else {
                    // This input is full, remove from pool
                    availableInputs.splice(randIndex, 1);
                }
            }
        } else {
            // Mode: Per Chapter (Original logic, but applied to the filtered inputs)
            // We need to group inputs by chapter to apply the limit per chapter
            // But since the inputs are specific topics (theory/calc), we distribute the 'per chapter' count among them.

            // Simplified approach: Distribute 'numPerChapter' to EACH chapter found in the inputs.
            // Since we flattened the inputs, we need to regroup them by chapter to do this accurately.
            // However, for simplicity and UX, let's treat 'Per Chapter' as 'Per Topic Input' limit or similar?
            // No, 'Per Chapter' implies we want X questions from Chapter 1, X from Chapter 2.

            // Re-implementing per-chapter logic using the gathered inputs:
            const inputsByChapter = availableInputs.reduce((acc, item) => {
                const key = `${item.input.dataset.subject}_${item.input.dataset.chapter}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            }, {});

            Object.values(inputsByChapter).forEach(chapterItems => {
                const totalAvailableInChapter = chapterItems.reduce((sum, item) => sum + item.max, 0);
                const targetForThisChapter = Math.min(numPerChapter, totalAvailableInChapter);
                let addedToChapter = 0;

                // Reset chapter inputs
                chapterItems.forEach(item => { item.input.value = 0; item.current = 0; });

                while (addedToChapter < targetForThisChapter) {
                    const validItems = chapterItems.filter(item => item.current < item.max);
                    if (validItems.length === 0) break;

                    const randIndex = Math.floor(Math.random() * validItems.length);
                    const item = validItems[randIndex];
                    item.current++;
                    item.input.value = item.current;
                    addedToChapter++;
                    totalAdded++;
                }
            });
        }

        updateTotalCount();
        showToast("สำเร็จ", `สุ่มเลือกคำถามเพิ่มมาทั้งหมด ${totalAdded} ข้อ`, "✅", "success");
    }

    // --- 3. Initial Setup ---
    bindCustomQuizModalEvents();

    // 1. Create Custom Quiz Button (Main Header) - Restore direct listener for stability
    if (createCustomQuizBtn) {
        createCustomQuizBtn.addEventListener('click', () => {
            console.log('[DEBUG] custom-quiz-handler: create-custom-quiz-btn clicked');
            customQuizHubModal.open();
        });
    }

    // Use a single delegated listener for all internal custom-quiz buttons (dynamic contents)
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 2. Open Generator Modal Button (Inside Hub)
        if (target.closest('#open-create-quiz-modal-btn')) {
            console.log('[DEBUG] custom-quiz-handler: openCreateQuizModalBtn clicked');
            if (typeof customQuizHubModal !== 'undefined') customQuizHubModal.close();
            buildAndShowCreationModal(target.closest('#open-create-quiz-modal-btn'), false);
            return;
        }

        // 2.1 Open Remedial Generator Modal Button (Inside Hub)
        if (target.closest('#open-remedial-quiz-modal-btn')) {
            console.log('[DEBUG] custom-quiz-handler: openRemedialQuizModalBtn clicked');
            if (typeof customQuizHubModal !== 'undefined') customQuizHubModal.close();
            buildAndShowCreationModal(target.closest('#open-remedial-quiz-modal-btn'), true);
            return;
        }

        // 2.2 Remedial Start Quiz Button
        if (target.closest('#remedial-quiz-start-btn')) {
            console.log('[DEBUG] custom-quiz-handler: remedialQuizStartBtn clicked');
            handleStartRemedialQuiz();
            return;
        }

        // 3. Completed Modal: View Results
        if (target.closest('#completed-view-results-btn')) {
            completedModal.close();
            // Handle results view if applicable
            return;
        }

        // 4. Completed Modal: Start Over
        if (target.closest('#completed-start-over-btn')) {
            completedModal.close();
            location.reload();
            return;
        }

        // 5. Completed Modal: Cancel
        if (target.closest('#completed-cancel-btn')) {
            completedModal.close();
            return;
        }
    });

    renderCustomQuizList().catch(err => {
        console.error("[DEBUG] custom-quiz-handler: Initial custom quiz list render failed:", err);
    });
}
