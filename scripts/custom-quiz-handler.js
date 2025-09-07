
import { ModalHandler } from "./modal-handler.js";
import { fetchAllQuizData, getQuizProgress, categoryDetails as allCategoryDetails } from "./data-manager.js";
import { getSyllabusForCategory } from "./syllabus-manager.js";
import { quizList } from "../data/quizzes-list.js";


/**
 * Safely retrieves and parses the list of custom quizzes from localStorage.
 * @returns {Array} An array of custom quiz objects, or an empty array if none exist or data is corrupt.
 */
export function getSavedCustomQuizzes() {
    const savedQuizzesJSON = localStorage.getItem("customQuizzesList");
    if (!savedQuizzesJSON) return [];
    try {
        const parsed = JSON.parse(savedQuizzesJSON);
        return Array.isArray(parsed) ? parsed : [];
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
 * Initializes all functionality related to creating and managing custom quizzes.
 */
export function initializeCustomQuizHandler() {
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

    const createCustomQuizBtn = document.getElementById("create-custom-quiz-btn");
    const customQuizStartBtn = document.getElementById("custom-quiz-start-btn");
    const customQuizClearBtn = document.getElementById("custom-quiz-clear-btn");
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
            <svg class="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">กำลังโหลดรายการแบบทดสอบ...</p>
        `;
        customQuizListContainer.parentNode.insertBefore(listLoader, customQuizListContainer);
    }

    // --- UI Enhancements: Adjust padding for floating UI ---
    function adjustScrollableContentPadding() {
        const scrollableContent = customQuizModal.modal.querySelector('.overflow-y-auto');
        if (scrollableContent) {
            // Add enough padding at the bottom of the scrollable area to ensure
            // no content is hidden behind the floating controls and FAB.
            // A fixed value is simpler and sufficient here. 10rem should be plenty.
            scrollableContent.style.paddingBottom = '10rem';
        }
    }

    // --- State Management ---
    let activeQuizUrl = '';
    let activeStorageKey = '';
    let onConfirmAction = null;

    /**
     * Manages focus trapping within a modal to improve accessibility.
     * - Sets initial focus on the first focusable element.
     * - Traps Tab and Shift+Tab navigation within the modal.
     * - Allows closing the modal with the Escape key.
     */
    const focusTrap = {
        activeTrapElement: null,
        closeCallback: null,

        activate(modalElement, closeCallback) {
            if (this.activeTrapElement) this.deactivate(); // Deactivate any existing trap

            this.activeTrapElement = modalElement;
            this.closeCallback = closeCallback;

            this.handleKeyDown = this.handleKeyDown.bind(this);
            document.addEventListener('keydown', this.handleKeyDown, true); // Use capture phase

            // Defer focusing to allow for modal transitions and rendering.
            setTimeout(() => {
                if (!this.activeTrapElement) return;
                const focusableElements = this.getFocusableElements(this.activeTrapElement);
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 100);
        },

        deactivate() {
            if (!this.activeTrapElement) return;
            document.removeEventListener('keydown', this.handleKeyDown, true);
            this.activeTrapElement = null;
            this.closeCallback = null;
        },

        handleKeyDown(e) {
            if (!this.activeTrapElement) return;

            // If Escape key is pressed, call the close callback.
            if (e.key === 'Escape') {
                e.stopPropagation();
                if (this.closeCallback) this.closeCallback();
                return;
            }

            // If Tab key is not pressed, do nothing.
            if (e.key !== 'Tab') return;

            const focusableElements = this.getFocusableElements(this.activeTrapElement);
            if (focusableElements.length === 0) {
                e.preventDefault(); // Prevent tabbing out if no elements are focusable
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        },

        getFocusableElements(element) {
            const selector = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
            return Array.from(element.querySelectorAll(selector))
                .filter(el => el.offsetParent !== null); // Check for visibility
        }
    };

    /**
     * Sets up a MutationObserver to automatically manage the focus trap for a given modal.
     * @param {ModalHandler} modalHandler The modal handler instance.
     */
    function setupFocusTrapForModal(modalHandler) {
        if (!modalHandler || !modalHandler.modal) return;
        const modalElement = modalHandler.modal;

        const observer = new MutationObserver(() => {
            const isHidden = modalElement.classList.contains('hidden') || modalElement.getAttribute('aria-hidden') === 'true';
            isHidden ? focusTrap.activeTrapElement === modalElement && focusTrap.deactivate() : focusTrap.activate(modalElement, () => modalHandler.close());
        });

        observer.observe(modalElement, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    }

    // Apply the modern scrollbar class to the modal bodies.
    try {
        // We assume the scrollable container within the modal has a class like 'overflow-y-auto'.
        // This is a common pattern with Tailwind CSS modal components.
        document.querySelectorAll('#custom-quiz-modal .overflow-y-auto, #custom-quiz-hub-modal .overflow-y-auto')
            .forEach(el => el.classList.add('modern-scrollbar')); // Class is now defined in bundle.css
    } catch (error) {
        console.error("Could not apply modern scrollbar class to modals:", error);
    }

    // Automatically apply focus trap logic to all modals managed by ModalHandler.
    [customQuizModal, customQuizHubModal, completedModal, confirmModal].forEach(setupFocusTrapForModal);

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

    if (!createCustomQuizBtn || !customQuizModal.modal || !customQuizHubModal.modal) {
        return; // Exit if essential elements are missing
    }

    // --- 2. Core Logic Functions ---

    function deleteCustomQuiz(customId) {
        let savedQuizzes = getSavedCustomQuizzes();
        const quizToDelete = savedQuizzes.find((q) => q.customId === customId);
        if (quizToDelete?.storageKey) {
            localStorage.removeItem(quizToDelete.storageKey);
        }
        const updatedQuizzes = savedQuizzes.filter((q) => q.customId !== customId);
        localStorage.setItem("customQuizzesList", JSON.stringify(updatedQuizzes));
        renderCustomQuizList();
    }

    function updateCustomQuizTitle(customId, newTitle) {
        let savedQuizzes = getSavedCustomQuizzes();
        const quizIndex = savedQuizzes.findIndex((q) => q.customId === customId);
        if (quizIndex > -1) {
            savedQuizzes[quizIndex].title = newTitle.trim();
            localStorage.setItem("customQuizzesList", JSON.stringify(savedQuizzes));
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

    function renderCustomQuizList() {
        const savedQuizzes = getSavedCustomQuizzes();

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
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span class="truncate">${quiz.categoryDisplay || 'ทั่วไป'}</span>
                    </div>
                    <div class="flex items-center" title="รูปแบบการจับเวลา">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>${timerDescription}</span>
                    </div>
                    <div class="flex items-center" title="จำนวนคำถามทั้งหมด">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <span>${totalQuestions} ข้อ</span>
                    </div>
                    <div class="flex items-center" title="วันที่สร้าง">
                        <svg class="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                        <div class="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2">
                            <img src="${iconUrl}" alt="${iconAlt}" class="h-full w-full object-contain">
                        </div>
                        <div class="flex-grow min-w-0">
                            <div data-title-display class="flex justify-between items-start gap-2">
                                <div class="flex-grow min-w-0">
                                    <p class="font-bold text-gray-800 dark:text-gray-100 truncate">${quiz.title}</p>
                                </div>
                                <div data-view-controls class="flex items-center gap-1 flex-shrink-0">
                                    <button data-action="edit" aria-label="แก้ไขชื่อ" class="p-2 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/50 dark:hover:text-yellow-400 rounded-full transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                                    <button data-action="delete" aria-label="ลบแบบทดสอบ" class="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 rounded-full transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                                </div>
                            </div>
                            <div data-edit-controls class="hidden flex items-center gap-2 mt-1">
                                 <button data-action="save" aria-label="บันทึก" class="p-2 text-gray-500 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/50 dark:hover:text-green-400 rounded-full transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button>
                                 <button data-action="cancel" aria-label="ยกเลิก" class="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 rounded-full transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                            </div>
                            <div data-edit-container class="hidden mt-1"></div>
                            ${detailsHtml}
                        </div>
                    </div>
                </div>
                ${footerHtml}
            `;
            customQuizListContainer.appendChild(quizItemEl);
        });

        // Hide the loader after the list has been rendered.
        if (listLoader) listLoader.classList.add('hidden');
    }

    /**
     * Creates the HTML for a single specific topic/learning outcome control row.
     * @param {string} chapterTitle - The parent chapter title.
     * @param {string} specificTopic - The specific topic or learning outcome.
     * @param {number} maxCount - The number of questions available for this topic.
     * @returns {string} The HTML string for the control row.
     */
    function createSpecificTopicControlHTML(chapterTitle, specificTopic, maxCount) {
        const disabled = maxCount === 0;
        const cleanTopic = specificTopic.replace(/^ว\s[\d\.]+\sม\.[\d\/]+\s/, '').replace(/^\d+\.\s/, '').trim();

        return `
            <div class="specific-topic-control py-3 px-4 border-t border-gray-200 dark:border-gray-700/50 ${disabled ? 'opacity-50 pointer-events-none' : ''}">
                <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0">
                        <label class="font-medium text-gray-700 dark:text-gray-200 text-sm">${cleanTopic}</label>
                        <p class="text-xs text-gray-500 dark:text-gray-400">มี ${maxCount} ข้อ</p>
                    </div>
                    <input data-chapter="${chapterTitle}" data-specific="${specificTopic}" type="number" min="0" max="${maxCount}" value="0" class="w-16 py-1 px-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900/50 text-center font-semibold text-sm text-blue-600 dark:text-blue-400 focus:ring-blue-500 focus:border-blue-500 flex-shrink-0">
                </div>
                <div class="flex items-center gap-3 mt-2">
                    <input data-slider-chapter="${chapterTitle}" data-slider-specific="${specificTopic}" type="range" min="0" max="${maxCount}" value="0" class="flex-grow h-2 rounded-lg appearance-none cursor-pointer" ${disabled ? "disabled" : ""}>
                    <div class="flex items-center gap-2 flex-shrink-0 quick-select-buttons">
                        <button type="button" data-value="5" class="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${maxCount < 5 ? 'hidden' : ''}">5</button>
                        <button type="button" data-value="10" class="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${maxCount < 10 ? 'hidden' : ''}">10</button>
                        <button type="button" data-value="custom" class="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">อื่นๆ...</button>
                        <button type="button" data-value="${maxCount}" class="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">All</button>
                        <button type="button" data-value="0" class="px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors">ล้าง</button>
                    </div>
                </div>
            </div>`;
    }

    function updateTotalCount() {
        let total = 0;
        document.querySelectorAll('#custom-quiz-category-selection input[type="number"]').forEach(input => {
            total += parseInt(input.value, 10) || 0;
        });
        if (totalQuestionCountDisplay) totalQuestionCountDisplay.textContent = total;
    }

    function setupCustomQuizInputListeners() {
        const container = document.getElementById('custom-quiz-category-selection');
        if (!container) return;

        // Initialize all sliders with the correct track fill on load
        container.querySelectorAll('input[type="range"]').forEach(updateSliderTrack);

        // Use event delegation for better performance
        container.addEventListener('input', (e) => {
            const target = e.target;

            // Then, handle the value synchronization for the interacted control
            if (target.matches('input[type="range"]') || target.matches('input[type="number"]')) {
                const chapter = target.dataset.sliderChapter || target.dataset.chapter;
                const specific = target.dataset.sliderSpecific || target.dataset.specific;
                let value = target.value;
                const slider = document.querySelector(`input[data-slider-chapter="${chapter}"][data-slider-specific="${specific}"]`);
                const input = document.querySelector(`input[data-chapter="${chapter}"][data-specific="${specific}"]`);

                // Clamp value for number inputs
                if (target.type === 'number') {
                    const max = parseInt(target.max, 10);
                    const currentValue = parseInt(value, 10);
                    if (currentValue > max) {
                        value = max;
                        target.value = max;
                    }
                }

                const finalValue = value === "" ? 0 : value;
                if (slider) slider.value = finalValue;
                if (input) input.value = finalValue;

                // Update the visual track of the slider
                if (slider) updateSliderTrack(slider);

                updateTotalCount();
            }
        });

        container.addEventListener('click', (e) => {
            const target = e.target;

            // Handle subject-level quick select
            const subjectSelectBtn = target.closest('button[data-quick-select-subject]');
            if (subjectSelectBtn) {
                const subjectContainer = subjectSelectBtn.closest('.subject-container');
                const value = subjectSelectBtn.dataset.value;

                if (subjectContainer) {
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
                        // Distribute the targetTotal proportionally
                        let distributedCount = 0;
                        allInputs.forEach((input, index) => {
                            const max = parseInt(input.max, 10);
                            const proportion = max / totalMax;
                            let desiredCount = Math.round(targetTotal * proportion);

                            // Adjust for last item to match the exact total
                            if (index === allInputs.length - 1) {
                                desiredCount = targetTotal - distributedCount;
                            }

                            input.value = Math.min(max, desiredCount);
                            distributedCount += parseInt(input.value, 10);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        );
                    }
                }
            }

            // Handle quick select buttons
            const quickSelectButton = target.closest('.quick-select-buttons button');
            if (quickSelectButton) {
                const controlRow = quickSelectButton.closest('.specific-topic-control');
                if (!controlRow) return;
                const slider = controlRow.querySelector('input[type="range"]');
                const input = controlRow.querySelector('input[type="number"]');
                let value = quickSelectButton.dataset.value;

                if (value === 'custom') {
                    const max = parseInt(input.max, 10);
                    const customValue = prompt(`กรุณาระบุจำนวนข้อ (สูงสุด ${max} ข้อ):`, input.value);
                    if (customValue === null) return; // User cancelled

                    let parsedValue = parseInt(customValue, 10);
                    if (isNaN(parsedValue) || parsedValue < 0) {
                        parsedValue = 0;
                    } else if (parsedValue > max) {
                        parsedValue = max;
                    }
                    value = parsedValue;
                }

                if (slider) slider.value = value;
                if (input) input.value = value;
                if (slider) updateSliderTrack(slider);
                updateTotalCount();
            }

            // Handle accordion toggling
            const toggle = target.closest('.subject-accordion-toggle, .chapter-accordion-toggle');
            if (toggle) {
                // If a quick select button inside the subject header was clicked, do not toggle the accordion.
                if (target.closest('button[data-quick-select-subject]')) {
                    return;
                }

                const content = toggle.nextElementSibling;
                const icon = toggle.querySelector('.chevron-icon');
                const isOpen = content.classList.contains('grid-rows-[1fr]');
                content.classList.toggle('grid-rows-[1fr]', !isOpen);
                content.classList.toggle('grid-rows-[0fr]', isOpen);
                icon.classList.toggle('rotate-180', !isOpen);
            }
        });

        // Add listeners for timer mode radio buttons to show/hide custom time inputs
        const timerRadios = document.querySelectorAll('input[name="custom-timer-mode"]');
        const overallTimeInputContainer = document.getElementById('overall-time-input-container');
        const perQuestionTimeInputContainer = document.getElementById('per-question-time-input-container');

        function handleTimerModeChange() {
            const selectedMode = document.querySelector('input[name="custom-timer-mode"]:checked').value;
            if (overallTimeInputContainer) {
                overallTimeInputContainer.classList.toggle('hidden', selectedMode !== 'overall');
            }
            if (perQuestionTimeInputContainer) {
                perQuestionTimeInputContainer.classList.toggle('hidden', selectedMode !== 'perQuestion');
            }
        }

        timerRadios.forEach(radio => {
            radio.addEventListener('change', handleTimerModeChange);
        });

        // Set initial visibility based on the default checked radio
        handleTimerModeChange();
    }

    /**
     * Fetches data and builds the UI for the quiz creation modal.
     */
    async function buildAndShowCreationModal(triggerElement) {
        const originalText = triggerElement.innerHTML;
        triggerElement.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังโหลดข้อมูล...`;
        triggerElement.disabled = true;

        try {
            if (!quizDataCache) {
                quizDataCache = await fetchAllQuizData();
            }
            const { allQuestions } = quizDataCache;

            // Group questions by main category -> chapter -> specific topic
            const groupedQuestions = allQuestions.reduce((acc, q) => {
                if (q.subCategory && q.subCategory.main && q.subCategory.specific) {
                    const quizInfo = quizList.find(ql => ql.title === q.sourceQuizTitle);
                    const subjectKey = quizInfo ? quizInfo.category : 'Uncategorized';

                    if (!acc[subjectKey]) acc[subjectKey] = {};
                    if (!acc[subjectKey][q.subCategory.main]) acc[subjectKey][q.subCategory.main] = {};
                    if (!acc[subjectKey][q.subCategory.main][q.subCategory.specific]) {
                        acc[subjectKey][q.subCategory.main][q.subCategory.specific] = 0;
                    }
                    acc[subjectKey][q.subCategory.main][q.subCategory.specific]++;
                }
                return acc;
            }, {});

            let categoryHTML = '';
            const sortedSubjects = Object.keys(allCategoryDetails).sort((a, b) => (allCategoryDetails[a].order || 99) - (allCategoryDetails[b].order || 99));

            sortedSubjects.forEach(subjectKey => {
                const syllabus = getSyllabusForCategory(subjectKey);
                const subjectDetails = allCategoryDetails[subjectKey];
                if (!syllabus || !subjectDetails || !groupedQuestions[subjectKey]) return;

                const chapters = syllabus.units ? syllabus.units.flatMap(u => u.chapters) : syllabus.chapters;
                if (!chapters) return;

                let chapterAccordionsHTML = '';
                chapters.forEach(chapter => {
                    const topics = chapter.learningOutcomes || chapter.specificTopics || [];
                    const topicControlsHTML = topics.map(topic => {
                        const count = groupedQuestions[subjectKey]?.[chapter.title]?.[topic] || 0;
                        return createSpecificTopicControlHTML(chapter.title, topic, count);
                    }).join('');

                    if (topicControlsHTML) {
                        chapterAccordionsHTML += `
                            <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-2 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                                <div class="chapter-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                                    <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">${chapter.title}</h4>
                                    <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="specific-topics-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                    <div class="overflow-hidden">${topicControlsHTML}</div>
                                </div>
                            </div>`;
                    }
                });

                if (chapterAccordionsHTML) {
                    categoryHTML += `
                        <div class="subject-container bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="subject-accordion-toggle p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div class="flex justify-between items-center">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <img src="${subjectDetails.icon}" class="h-8 w-8 flex-shrink-0">
                                        <span class="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">${subjectDetails.displayName}</span>
                                    </div>
                                    <svg class="chevron-icon h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50 flex flex-wrap items-center gap-2">
                                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">เลือกด่วน:</span>
                                    <button type="button" data-quick-select-subject data-value="5" class="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">5</button>
                                    <button type="button" data-quick-select-subject data-value="10" class="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">10</button>
                                    <button type="button" data-quick-select-subject data-value="15" class="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">15</button>
                                    <button type="button" data-quick-select-subject data-value="20" class="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">20</button>
                                    <button type="button" data-quick-select-subject data-value="all" class="px-2.5 py-1 text-xs font-semibold text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">ทั้งหมด</button>
                                    <button type="button" data-quick-select-subject data-value="0" class="px-2.5 py-1 text-xs font-semibold text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors">ล้าง</button>
                                </div>
                            </div>
                            <div class="chapters-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                                <div class="overflow-hidden pt-2">${chapterAccordionsHTML}</div>
                            </div>
                        </div>`;
                }
            });

            if (categorySelectionContainer) {
                categorySelectionContainer.innerHTML = categoryHTML;
                categorySelectionContainer.className = "space-y-4"; // Use space-y for vertical stacking
                adjustScrollableContentPadding();
                setupCustomQuizInputListeners();
                updateTotalCount();
            }

            customQuizHubModal.close();
            customQuizModal.open(triggerElement);

        } catch (error) {
            console.error("Failed to fetch data for custom quiz creation:", error);
            // Optionally, show an error message to the user
        } finally {
            triggerElement.innerHTML = originalText;
            triggerElement.disabled = false;
        }
    }

    /**
     * Gathers user selections, creates a custom quiz object, and saves it.
     */
    async function handleStartCustomQuiz() {
        const counts = {};
        document.querySelectorAll('#custom-quiz-category-selection input[type="number"][data-chapter]').forEach(input => {
            const count = parseInt(input.value, 10) || 0;
            if (count > 0) {
                const chapter = input.dataset.chapter;
                const specific = input.dataset.specific;
                if (!counts[chapter]) counts[chapter] = {};
                counts[chapter][specific] = count;
            }
        });

        if (!quizDataCache) {
            console.error("Quiz data has not been loaded. Cannot start quiz.");
            return;
        }

        const { allQuestions, scenarios } = quizDataCache;
        let selectedQuestions = [];

        for (const [chapter, specifics] of Object.entries(counts)) {
            for (const [specific, count] of Object.entries(specifics)) {
                const sourcePool = allQuestions.filter(q => q.subCategory?.main === chapter && q.subCategory?.specific === specific);
                const shuffledPool = [...sourcePool].sort(() => 0.5 - Math.random());
                const chosen = shuffledPool.slice(0, count);
                const reconstructed = chosen.map(q => {
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

        selectedQuestions = Array.from(new Set(selectedQuestions.map(q => JSON.stringify(q)))).map(s => JSON.parse(s));

        if (selectedQuestions.length === 0) {
            return;
        }

        const timerMode = document.querySelector('input[name="custom-timer-mode"]:checked')?.value || 'none';
        let customTime = null;
        if (timerMode === 'overall') {
            customTime = parseInt(document.getElementById('custom-timer-overall-minutes').value, 10) * 60;
        } else if (timerMode === 'perQuestion') {
            customTime = parseInt(document.getElementById('custom-timer-per-question-seconds').value, 10);
        }

        const descriptionParts = Object.entries(counts).reduce((acc, [chapter, specifics]) => {
            const totalInChapter = Object.values(specifics).reduce((sum, count) => sum + count, 0);
            acc[chapter] = (acc[chapter] || 0) + totalInChapter;
            return acc;
        }, {});

        const detailedDescription = Object.entries(descriptionParts).map(([title, count]) => {
            return `${title}: ${count} ข้อ`;
        }).join(' | ');

        const timestamp = Date.now();
        const customQuiz = {
            customId: `custom_${timestamp}`,
            storageKey: `quizState-custom_${timestamp}`,
            title: `แบบทดสอบ (${new Date(timestamp).toLocaleString('th-TH')})`,
            description: detailedDescription,
            questions: selectedQuestions.sort(() => 0.5 - Math.random()),
            timerMode: timerMode,
            customTime: customTime,
            icon: "./assets/icons/dices.png",
        };

        const savedQuizzes = getSavedCustomQuizzes();
        savedQuizzes.unshift(customQuiz);
        localStorage.setItem("customQuizzesList", JSON.stringify(savedQuizzes));
        window.location.href = `./quiz/index.html?id=${customQuiz.customId}`;
    }

    // --- 3. Event Listeners Setup ---

    // Main button on the index page to open the custom quiz hub
    createCustomQuizBtn.addEventListener("click", (e) => {
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
    openCreateQuizModalBtn.addEventListener("click", (e) => buildAndShowCreationModal(e.currentTarget));

    // The final "Start" button in the creation modal
    customQuizStartBtn.addEventListener("click", handleStartCustomQuiz);

    // Event delegation for the list of custom quizzes (edit, delete, etc.)
    if (customQuizListContainer) {
        customQuizListContainer.addEventListener("click", (event) => {
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
                            updateCustomQuizTitle(customId, newTitle);
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
                const savedQuizzes = getSavedCustomQuizzes();
                const quiz = savedQuizzes.find(q => q.customId === customId);
                if (!quiz) return;

                const progress = getQuizProgress(quiz.storageKey, quiz.questions.length);

                if (progress.isFinished) {
                    event.preventDefault();
                    activeQuizUrl = startLink.href;
                    activeStorageKey = quiz.storageKey;
                    completedModal.open(startLink);
                }
                // If not finished, the default 'a' tag behavior will handle navigation.
            }
        });
    }

    // Listener for the "Clear All" button
    if (customQuizClearBtn) {
        customQuizClearBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('#custom-quiz-category-selection input[type="number"]');
            const sliders = document.querySelectorAll('#custom-quiz-category-selection input[type="range"]');
            inputs.forEach(input => { input.value = 0; });
            sliders.forEach(slider => {
                slider.value = 0;
                updateSliderTrack(slider);
            });
            updateTotalCount();
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
}
