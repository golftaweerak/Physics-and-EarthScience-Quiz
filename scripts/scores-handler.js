import { getStudentScores } from './data-manager.js';
import { renderStudentSearchResultCards } from './student-card-renderer.js';
import { ModalHandler } from './modal-handler.js';
import { lastUpdated as scoresLastUpdated } from '../data/scores-data.js';

/** A map of assignment names to their corresponding Microsoft Forms URL. */
const ASSIGNMENT_URL_MAP = {
    'กิจกรรม 1.1': 'https://forms.office.com/r/KFtWGZEb7S',
    'แบบฝึก 1.1': 'https://forms.office.com/r/abX7Vtwtww',
    'แบบฝึก 1.2': 'https://forms.office.com/r/Bsxg9Yx9JD',
    'ท้ายบท 1': 'https://forms.office.com/r/AFG3Ymt4Ni',
    'Quiz 1': 'https://forms.office.com/r/G4hdEDwbcX',
    'แบบฝึก 2.1': 'https://forms.office.com/r/tYmRtd438x',
    'แบบฝึก 2.2': 'https://forms.office.com/r/u785wcNf3X',
    'ท้ายบท 2': 'https://forms.office.com/r/MF4mget9mY',
    'Quiz 2': 'https://forms.office.com/r/a2AYEKGPPv',
    'แบบฝึก 3.1': 'https://forms.office.com/r/ubX306JhHy',
    'ท้ายบท 3': 'https://forms.office.com/r/VAic0B5szk',
    'Quiz 3': 'https://forms.office.com/r/2zMb0Xzrc9',
    'แบบฝึก 4.1': 'https://forms.office.com/r/ArkkdbnpXb',
    'ท้ายบท 4': 'https://forms.office.com/r/L8BwGLdh4V',
    'Quiz 4': 'https://forms.office.com/r/zfvAMhzHVq',
    'แบบฝึก 5.1': 'https://forms.office.com/r/afG0eGdjH5',
    'แบบฝึก 5.2': 'https://forms.office.com/r/mmB2LXmSNn',
    'ท้ายบท 5': 'https://forms.office.com/r/1uf2B3y7sM',
    'Quiz 5': 'https://forms.office.com/r/gMTxMUjiT6'
};

/** A map for renaming specific assignment names for display. */
const ASSIGNMENT_DISPLAY_NAME_MAP = {
    'mid [20]': 'คะแนนข้อกา (30)',
    'mid [10]': 'คะแนนข้อเขียน (10)',
    'mid [20]2': 'คะแนนกลางภาค (20)'
};

/** Regex patterns to identify assignments that are summaries and should not be in the detailed list. */
const SUMMARY_ASSIGNMENT_PATTERNS = [
    /^บท\s\d+\s\[\d+\]$/, // e.g., "บท 1 [10]"
    /ก่อนปลายภาค/,
    /นำเสนอ/
];

/** The desired display order for assignment groups. */
const CHAPTER_ORDER = ['บทที่ 1', 'บทที่ 2', 'บทที่ 3', 'กลางภาค', 'บทที่ 4', 'บทที่ 5', 'อื่นๆ'];

let isEditMode = false;
let originalScoresData = []; // To store the pristine data for comparison
let currentOverrides = {}; // To store unsaved changes

export async function initializeScoreSearch() {
    const studentIdInput = document.getElementById('student-id-input');
    const searchBtn = document.getElementById('search-btn');
    const resultContainer = document.getElementById('result-container');
    const clearBtn = document.getElementById('clear-btn');
    const defaultMessage = document.getElementById('default-message');

    // Edit Mode Elements
    const devPasswordModal = new ModalHandler('dev-password-modal');
    const devPasswordForm = document.getElementById('dev-password-form');
    const devPasswordInput = document.getElementById('dev-password-input');
    const devPasswordError = document.getElementById('dev-password-error');
    const overrideCodeModal = new ModalHandler('override-code-modal');
    const overrideCodeContent = document.getElementById('override-code-content');
    const copyOverrideCodeBtn = document.getElementById('copy-override-code-btn');
    const logDataContent = document.getElementById('log-data-content');
    const copyLogDataBtn = document.getElementById('copy-log-data-btn');
    const downloadOverrideFileBtn = document.getElementById('download-override-file-btn');

    // --- Render Last Updated Timestamp ---
    const mainContentContainer = document.querySelector('.max-w-3xl.mx-auto');
    const searchBoxContainer = document.querySelector('#student-id-input')?.closest('.bg-white');
    if (mainContentContainer && searchBoxContainer && scoresLastUpdated) {
        const lastUpdatedDate = new Date(scoresLastUpdated);
        const formattedDate = lastUpdatedDate.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        });
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'text-center text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-4';
        timestampDiv.textContent = `อัปเดตข้อมูลล่าสุด: ${formattedDate} น.`;
        mainContentContainer.insertBefore(timestampDiv, searchBoxContainer);
    }




    if (!studentIdInput || !searchBtn || !resultContainer || !clearBtn) {
        console.error("Required elements for score search are missing from the DOM.");
        return;
    }

    // Fetch both original and potentially merged scores
    const { studentScores: baseScores } = await import(`../data/scores-data.js?v=${Date.now()}`);
    originalScoresData = baseScores;
    const studentScores = await getStudentScores();

    // --- Edit Mode Logic ---
    function enableEditMode() {
        isEditMode = true;
        const currentStudentId = document.querySelector('.student-card-container')?.dataset.studentId;
        if (currentStudentId) {
            const student = studentScores.find(s => s.id === currentStudentId);
            if (student) displayResult(student); // Re-render the current student in edit mode
        }
        document.getElementById('edit-mode-btn')?.classList.add('bg-green-600', 'text-white');
        document.getElementById('edit-mode-btn')?.classList.remove('bg-gray-200', 'text-gray-700');
    }

    if (devPasswordForm) {
        devPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (devPasswordInput.value === "promma_dev") {
                devPasswordModal.close();
                enableEditMode();
            } else {
                if (devPasswordError) devPasswordError.textContent = "รหัสผ่านไม่ถูกต้อง";
            }
        });
    }

    if (copyOverrideCodeBtn) {
        copyOverrideCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(overrideCodeContent.value).then(() => {
                copyOverrideCodeBtn.textContent = 'คัดลอกแล้ว!';
                setTimeout(() => { copyOverrideCodeBtn.textContent = 'คัดลอกโค้ด'; }, 2000);
            });
        });
    }

    if (copyLogDataBtn) {
        copyLogDataBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(logDataContent.value).then(() => {
                copyLogDataBtn.textContent = 'คัดลอกแล้ว!';
                setTimeout(() => { copyLogDataBtn.textContent = 'คัดลอกข้อมูล Log'; }, 2000);
            });
        });
    }

    if (downloadOverrideFileBtn) {
        downloadOverrideFileBtn.addEventListener('click', () => {
            const content = overrideCodeContent.value;
            const blob = new Blob([content], { type: 'text/javascript;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "score-overrides.js";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Defensive check: Ensure student data is available before enabling search.
    if (!Array.isArray(studentScores) || studentScores.length === 0) {
        console.error("Student scores data is missing or empty.");
        studentIdInput.disabled = true;
        searchBtn.disabled = true;
        displayMessage('ไม่สามารถโหลดข้อมูลคะแนนได้ในขณะนี้', 'error');
        return;
    }

    resultContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.student-card-btn');
        if (!card) return;

        const studentId = card.dataset.studentId;
        if (!studentId) return;

        const student = studentScores.find(s => s.id === studentId);
        if (student) {
            displayResult(student);
        }
    });

    const searchScores = () => {
        const query = studentIdInput.value.trim();
        if (query.length === 0) {
            displayMessage('กรุณากรอกรหัสนักเรียน, ชื่อ, หรือห้องเรียนเพื่อค้นหา', 'error');
            return;
        }
        const lowerCaseQuery = query.toLowerCase();
        
        let results = [];
        
        // Priority 1: Exact ID match.
        const idMatch = studentScores.find(s => s.id.toLowerCase() === lowerCaseQuery);
        if (idMatch) {
            displayResult(idMatch);
            return;
        }

        // Priority 2: Exact Room match.
        const roomMatches = studentScores.filter(s => s.room && s.room.toLowerCase() === lowerCaseQuery);
        if (roomMatches.length > 0) {
            results = roomMatches.sort((a, b) => {
                const ordinalA = parseInt(a.ordinal, 10) || 999;
                const ordinalB = parseInt(b.ordinal, 10) || 999;
                return ordinalA - ordinalB;
            });
            renderStudentSearchResultCards(results, resultContainer, { cardType: 'button' });
            return;
        }

        // Priority 3: Partial Name match.
        const nameMatches = studentScores.filter(s => s.name.toLowerCase().includes(lowerCaseQuery));
        if (nameMatches.length > 1) {
            results = nameMatches.sort((a, b) => a.id.localeCompare(b.id));
            renderStudentSearchResultCards(results, resultContainer, { cardType: 'button' });
        } else if (nameMatches.length === 1) {
            displayResult(nameMatches[0]);
        } else {
            displayMessage(`ไม่พบข้อมูลสำหรับ "${query}"`, 'error');
        }
    };

    searchBtn.addEventListener('click', searchScores);

    studentIdInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchScores();
        }
    });

    // Check for student ID in URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdFromUrl = urlParams.get('id');
    if (studentIdFromUrl && /^\d{5}$/.test(studentIdFromUrl)) {
        studentIdInput.value = studentIdFromUrl;
        searchScores(); // Automatically trigger search
        clearBtn.classList.remove('hidden');
    }

    clearBtn.addEventListener('click', () => {
        studentIdInput.value = '';
        if (defaultMessage) {
            resultContainer.innerHTML = ''; // Clear previous results
            resultContainer.appendChild(defaultMessage);
            defaultMessage.classList.remove('hidden');
        }
        clearBtn.classList.add('hidden');
        studentIdInput.focus();
    });

    studentIdInput.addEventListener('input', () => {
        clearBtn.classList.toggle('hidden', studentIdInput.value.length === 0);
    });

    function displayMessage(message, type = 'info') {
        if (defaultMessage) defaultMessage.classList.add('hidden');
        const isError = type === 'error';
        
        const icon = isError 
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

        const bgColor = isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30';
        const borderColor = isError ? 'border-red-500' : 'border-blue-500';
        const textColor = isError ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300';
        const title = isError ? 'เกิดข้อผิดพลาด' : 'ข้อมูล';

        resultContainer.innerHTML = `
            <div class="anim-card-pop-in p-4 rounded-lg shadow-md border-l-4 ${bgColor} ${borderColor}" role="alert">
                <div class="flex">
                    <div class="flex-shrink-0 ${textColor}">
                        ${icon}
                    </div>
                    <div class="ml-3">
                        <p class="font-bold ${textColor}">${title}</p>
                        <p class="text-sm mt-1 ${textColor}">${message}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Creates the HTML for a score breakdown row.
     * @param {object} student - The student data object.
     * @param {string} label - The display label for the row.
     * @param {string} scoreKey - The key to access the score in the student object.
     * @returns {string} The HTML string for the table row.
     */
    function createBreakdownRow(student, label, scoreKey) {
        const scoreValue = student[scoreKey];
        if (!student.hasOwnProperty(scoreKey) || scoreValue === null) return '';

        let scoreDisplay;
        if (isEditMode) {
            scoreDisplay = `<input type="number" data-key="${scoreKey}" class="score-input w-20 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${scoreValue ?? ''}">`;
        } else {
            scoreDisplay = `<span class="font-mono text-sm text-gray-700 dark:text-gray-300">${Math.round(scoreValue)}</span>`;
        }

        return `
            <tr class="bg-gray-50 dark:bg-gray-800/50">
                <td class="py-2 px-4 pl-10 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg class="h-3 w-3 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                    <span class="italic">${label}</span>
                </td>
                <td class="py-2 px-4 text-right">
                    ${scoreDisplay}
                </td>
            </tr>
        `;
    }

    /**
     * Creates the HTML for a single assignment list item, making it a clickable link.
     * @param {object} assignment - The assignment object.
     * @returns {string} The HTML string for the list item.
     */
    function createAssignmentItemHTML(assignment) {
        const url = ASSIGNMENT_URL_MAP[assignment.name] || null;
        const lowerCaseName = assignment.name.toLowerCase();
        const displayName = ASSIGNMENT_DISPLAY_NAME_MAP[lowerCaseName] || assignment.name;
        const score = assignment.score;
        let statusHtml;

        if (isNaN(parseFloat(score))) {
            // Handle text-based scores like "ส่งแล้ว", "ยังไม่ส่ง"
            const isSubmitted = score && score.toLowerCase() !== 'ยังไม่ส่ง';
            const colorClass = isSubmitted 
                ? 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50' 
                : 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50';
            statusHtml = `<span class="px-2 py-1 text-xs font-semibold ${colorClass} rounded-full">${score || 'ยังไม่ส่ง'}</span>`;
        } else {
            // Handle numeric scores
            statusHtml = `<span class="font-mono font-bold text-gray-800 dark:text-gray-200">${score}</span>`;
        }

        const contentHtml = `
            <div class="flex-grow min-w-0 pr-4">
                <span class="text-gray-700 dark:text-gray-300 text-sm font-medium">${displayName}</span>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
                ${statusHtml}
                ${url ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>` : '<div class="w-4 h-4"></div>'}
            </div>
        `;
        if (url) {
            return `<li class="block"><a href="${url}" target="_blank" rel="noopener noreferrer" class="group flex justify-between items-center py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">${contentHtml}</a></li>`;
        } else {
            return `<li class="flex justify-between items-center py-3 px-4 opacity-75">${contentHtml}</li>`;
        }
    }

    function displayResult(student) {
        if (defaultMessage) defaultMessage.classList.add('hidden');

        // Promote final exam score from assignments to a top-level property if it doesn't exist.
        // This ensures it's available for the summary table rendering logic below.
        if (!student.hasOwnProperty('ปลายภาค [30]') && student.assignments) {
            const finalAssignment = student.assignments.find(a => a.name === 'ปลายภาค [30]');
            if (finalAssignment && finalAssignment.score !== null && finalAssignment.score !== undefined) {
                const score = parseFloat(finalAssignment.score);
                // Use the raw score (can be text like "ขาดสอบ") if it's not a valid number
                student['ปลายภาค [30]'] = isNaN(score) ? finalAssignment.score : score;
            }
        }

        const summaryOrder = [
            'ก่อนกลางภาค [25]',
            'กลางภาค [20]',
            'หลังกลางภาค [25]',
            'ก่อนปลายภาค [70]',
            'ปลายภาค [30]',
            'รวม [100]',
            'เกรด'
        ];


        const breakdownMap = {
            'ก่อนกลางภาค [25]': [
                { label: 'บทที่ 1', key: 'บท 1 [10]' },
                { label: 'บทที่ 2', key: 'บท 2 [10]' },
                { label: 'บทที่ 3', key: 'บท 3 [5]' }
            ],
            'หลังกลางภาค [25]': [
                { label: 'บทที่ 4', key: 'บท 4 [10]' },
                { label: 'บทที่ 5', key: 'บท 5 [10]' },
                { label: 'นำเสนอ', key: 'นำเสนอ [5]' }
            ]
        };

        const scoreRows = summaryOrder.map(key => {
            if (student.hasOwnProperty(key)) {
                const value = student[key];
                const isGrade = key === 'เกรด';
                const isTotal = key === 'รวม [100]';
                const isMidterm = key === 'กลางภาค [20]';
                const isFinal = key === 'ปลายภาค [30]';
                const isImportant = isGrade || isTotal || isMidterm || isFinal;

                // Define classes based on importance
                const rowClass = isImportant ? 'bg-blue-50 dark:bg-gray-800/60' : '';
                const labelClass = isImportant ? 'font-bold text-blue-900 dark:text-blue-300' : 'font-medium text-gray-700 dark:text-gray-300';
                let valueClass = isImportant ? 'font-bold' : 'font-semibold';
                if (isGrade) valueClass += ' text-2xl text-blue-600 dark:text-blue-400';
                else if (isTotal) valueClass += ' text-xl text-green-600 dark:text-green-400';
                else if (isMidterm || isFinal) valueClass += ' text-lg text-gray-900 dark:text-white';
                else valueClass += ' text-gray-900 dark:text-white';
                
                let valueDisplay;
                if (isEditMode) {
                    const inputType = (typeof value === 'number' && !isGrade) ? 'number' : 'text';
                    valueDisplay = `<input type="${inputType}" data-key="${key}" class="score-input w-24 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${value ?? ''}">`;
                } else {
                    let displayValue = (value !== null && value !== undefined) ? value : '-';
                    if (typeof value === 'number' && !isGrade) {
                        displayValue = Math.round(value);
                    }
                    valueDisplay = `<span class="${valueClass}">${displayValue}</span>`;
                }

                let retestStatusHtml = '';
                if (key === 'กลางภาค [20]' && student.ซ่อมมั้ย && student.ซ่อมมั้ย.trim() !== '-') {
                    const retestStatus = student.ซ่อมมั้ย.trim();
                    const isPositiveStatus = retestStatus.includes('ไม่ต้อง') || retestStatus.includes('ซ่อมแล้ว');
                    const statusColor = isPositiveStatus ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
                    retestStatusHtml = `<div class="text-xs font-normal ${statusColor} pt-1">สถานะการสอบซ่อม: ${retestStatus}</div>`;
                }

                let mainRowHtml = `
                    <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${rowClass}">
                        <td class="py-3 px-4 ${labelClass}">${key}</td>
                        <td class="py-3 px-4 text-right">
                            ${valueDisplay}
                            ${retestStatusHtml}
                        </td>
                    </tr>
                `;

                if (breakdownMap[key]) {
                    mainRowHtml += breakdownMap[key].map(item => createBreakdownRow(student, item.label, item.key)).join('');
                }

                return mainRowHtml;
            }
            return '';
        }).join('');

        const summaryScoreSection = `
            <figure class="mb-6">
                <figcaption class="p-3 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-lg border-x border-t border-gray-200 dark:border-gray-700">
                    สรุปคะแนน
                </figcaption>
                <div class="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                    <table class="w-full text-base">
                        <tbody>
                            ${scoreRows}
                        </tbody>
                    </table>
                </div>
            </figure>
        `;

        // 1. Filter out non-trackable assignments and calculate stats
        const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท'];
        const trackableAssignments = student.assignments.filter(assignment =>
            TRACKABLE_KEYWORDS.some(keyword => assignment.name.toLowerCase().includes(keyword))
        );

        const submittedCount = trackableAssignments.filter(a => a.score && a.score.toLowerCase() !== 'ยังไม่ส่ง').length;
        const missingCount = trackableAssignments.length - submittedCount;
        const completionPercentage = trackableAssignments.length > 0 ? (submittedCount / trackableAssignments.length) * 100 : 0;

        // 2. Group assignments for display
        const groupedAssignments = groupAssignments(trackableAssignments);

        // 3. Build the HTML
        const summaryCardsHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button id="show-submitted-btn" class="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center border border-green-200 dark:border-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <div class="text-4xl font-bold text-green-600 dark:text-green-400">${submittedCount}</div>
                    <div class="text-sm font-medium text-green-800 dark:text-green-300">งานที่ส่งแล้ว</div>
                </button>
                <button id="show-missing-btn" class="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg text-center border border-red-200 dark:border-red-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <div class="text-4xl font-bold text-red-600 dark:text-red-400">${missingCount}</div>
                    <div class="text-sm font-medium text-red-800 dark:text-red-300">งานที่ค้างส่ง</div>
                </button>
                <div class="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center border border-blue-200 dark:border-blue-700">
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">${completionPercentage.toFixed(0)}%</div>
                    <div class="text-sm font-medium text-blue-800 dark:text-blue-300">ความสมบูรณ์</div>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 mb-8 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" style="width: ${completionPercentage}%"></div>
            </div>
        `;

        const assignmentsSection = Object.keys(groupedAssignments).length > 0 ? `
            <figure>
                <figcaption class="p-4 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800">
                    รายการงานที่ต้องส่ง
                </figcaption>
                <div class="space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30">
                    ${Object.entries(groupedAssignments).map(([chapter, chapterAssignments]) => `
                        <details class="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 open:ring-2 open:ring-blue-500 open:shadow-lg">
                            <summary class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <h4 class="font-bold text-gray-800 dark:text-gray-200 font-kanit">${chapter}</h4>
                                <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                            </summary>
                            <div class="border-t border-gray-200 dark:border-gray-700">
                                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                                    ${chapterAssignments.map(createAssignmentItemHTML).join('')}
                                </ul>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </figure>
        ` : '';

        resultContainer.innerHTML = `
            <div class="student-card-container bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden anim-card-pop-in" data-student-id="${student.id}">
                <div class="p-6 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div class="flex-shrink-0 h-16 w-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-4 border-white dark:border-gray-800 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div class="min-w-0">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white font-kanit truncate">${student.name}</h2>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                            <span>รหัสนักเรียน: <strong class="font-semibold text-blue-600 dark:text-blue-400">${student.id}</strong></span>
                            ${student.room ? `<span class="border-l border-gray-300 dark:border-gray-600 pl-4">ห้อง: <strong class="font-semibold text-blue-600 dark:text-blue-400">${student.room}</strong></span>` : ''}
                            ${student.ordinal ? `<span class="border-l border-gray-300 dark:border-gray-600 pl-4">เลขที่: <strong class="font-semibold text-blue-600 dark:text-blue-400">${student.ordinal}</strong></span>` : ''}
                        </div>
                    </div>
                    <!-- <div class="ml-auto">
                        <button id="edit-mode-btn" class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                            แก้ไขคะแนน
                        </button>
                    </div> -->
                </div>
                <div class="p-6 space-y-8">
                    ${summaryScoreSection}
                    ${summaryCardsHtml}
                    ${assignmentsSection}
                </div>
                <div id="edit-controls-container" class="p-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 ${isEditMode ? '' : 'hidden'}">
                    <button id="save-overrides-btn" data-studentid="${student.id}" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        สร้างโค้ดสำหรับบันทึกการแก้ไข
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners for the new modal buttons
        document.getElementById('show-submitted-btn')?.addEventListener('click', () => {
            const submittedAssignments = trackableAssignments.filter(a => a.score && a.score.toLowerCase() !== 'ยังไม่ส่ง');
            createInteractiveAssignmentModal('submitted', `งานที่ส่งแล้ว (${submittedAssignments.length} รายการ)`, submittedAssignments);
        });
        document.getElementById('show-missing-btn')?.addEventListener('click', () => {
            const missingAssignments = trackableAssignments.filter(a => !a.score || a.score.toLowerCase() === 'ยังไม่ส่ง');
            createInteractiveAssignmentModal('missing', `งานที่ค้างส่ง (${missingAssignments.length} รายการ)`, missingAssignments);
        });

        document.getElementById('edit-mode-btn')?.addEventListener('click', () => {
            if (isEditMode) {
                isEditMode = false;
                displayResult(student); // Re-render in view mode
            } else {
                devPasswordModal.open();
            }
        });

        document.getElementById('save-overrides-btn')?.addEventListener('click', async (e) => {
            const studentId = e.target.dataset.studentid;
            const student = studentScores.find(s => s.id === studentId);
            const originalStudent = originalScoresData.find(s => s.id === studentId);
            if (!originalStudent || !student) {
                alert('Error: Could not find student data to compare.');
                return;
            }

            const studentOverrides = {};
            const logEntries = [];
            let hasChanges = false;

            document.querySelectorAll('.score-input').forEach(input => {
                const key = input.dataset.key;
                const originalValue = originalStudent[key];
                let newValue = input.value;

                // Coerce types for comparison
                if (typeof originalValue === 'number') {
                    // Allow empty string to become null
                    newValue = (newValue === '') ? null : parseFloat(newValue);
                    if (isNaN(newValue)) newValue = null;
                }

                // Check if the value has actually changed
                const originalExists = originalValue !== null && originalValue !== undefined;
                const newExists = newValue !== null && newValue !== undefined;

                if ((originalExists !== newExists) || (originalExists && newExists && newValue !== originalValue)) {
                    studentOverrides[key] = newValue;
                    hasChanges = true;

                    // Prepare data for the log entry
                    logEntries.push({
                        timestamp: new Date().toISOString(),
                        student_id: studentId,
                        student_name: student.name,
                        score_key: key,
                        original_value: originalValue ?? 'N/A',
                        new_value: newValue ?? 'N/A'
                    });
                }
            });

            if (hasChanges) {
                // 1. Generate JS override code
                let existingOverrides = {};
                try {
                    const overrideModule = await import(`../data/score-overrides.js?v=${Date.now()}`);
                    if (overrideModule.encryptedScoreOverrides && overrideModule.encryptedScoreOverrides.trim() !== "") {
                        existingOverrides = JSON.parse(atob(overrideModule.encryptedScoreOverrides));
                    }
                } catch (e) {
                    console.log("No existing score-overrides.js found or it's empty, creating new one.");
                }

                const newOverrides = { ...existingOverrides };
                newOverrides[studentId] = { ...(existingOverrides[studentId] || {}), ...studentOverrides };

                const encryptedString = btoa(JSON.stringify(newOverrides, null, 2));
                overrideCodeContent.value = `export const encryptedScoreOverrides = "${encryptedString}";`;

                // 2. Generate CSV log data
                const csvHeader = "timestamp,student_id,student_name,score_key,original_value,new_value\n";
                const csvRows = logEntries.map(entry => {
                    // Escape commas and quotes in values by wrapping in double quotes
                    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
                    return [
                        escape(entry.timestamp), escape(entry.student_id), escape(entry.student_name),
                        escape(entry.score_key), escape(entry.original_value), escape(entry.new_value)
                    ].join(',');
                }).join('\n');
                logDataContent.value = csvHeader + csvRows;

                // 3. Show the modal
                overrideCodeModal.open();
            } else {
                alert('ไม่มีการเปลี่ยนแปลงคะแนน');
            }
        });
    }

    /**
     * Groups and orders assignments by chapter for display.
     * @param {Array<object>} assignments - The list of assignment objects for a student.
     * @returns {object} An object with chapter names as keys and arrays of assignments as values.
     */
    function groupAssignments(assignments) {
        if (!assignments || assignments.length === 0) return {};

        const groups = assignments.reduce((acc, assignment) => {
            const name = assignment.name.toLowerCase();
            
            // Exclude summary-like assignments from being displayed in the detailed view
            if (SUMMARY_ASSIGNMENT_PATTERNS.some(pattern => pattern.test(name))) {
                return acc;
            }

            let chapterKey;
            if (name.includes('mid') || name.includes('ซ่อมแล้วกลางภาค')) {
                chapterKey = 'กลางภาค';
            } else {
                const match = name.match(/(\d+)/); // Find the first number
                chapterKey = match ? `บทที่ ${match[1]}` : 'อื่นๆ';
            }
            
            if (!acc[chapterKey]) {
                acc[chapterKey] = [];
            }
            acc[chapterKey].push(assignment);
            return acc;
        }, {});

        // Order the groups according to the predefined CHAPTER_ORDER
        const orderedGroups = {};
        CHAPTER_ORDER.forEach(key => {
            if (groups[key]) {
                orderedGroups[key] = groups[key];
            }
        });

        // Add any other groups that weren't in the predefined order
        Object.keys(groups).forEach(key => {
            if (!orderedGroups[key]) {
                orderedGroups[key] = groups[key];
            }
        });

        return orderedGroups;
    }
}

/**
 * Creates and displays a modal with a filterable list of assignments.
 * @param {string} modalIdentifier - A unique string for the modal ID.
 * @param {string} title - The title to display in the modal header.
 * @param {Array<object>} assignments - The list of assignments to display.
 */
function createInteractiveAssignmentModal(modalIdentifier, title, assignments) {
    const modalId = `interactive-assignment-modal-${modalIdentifier}`;

    // Remove old modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    const modalContentContainerId = `interactive-assignment-content-${modalIdentifier}`;

    const controlsHtml = `
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                </div>
                <input type="text" id="modal-search-input-${modalIdentifier}" placeholder="ค้นหาชื่องาน..." class="w-full p-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
            </div>
        </div>
    `;

    const modalHtml = `
        <div id="${modalId}" class="modal fixed inset-0 flex items-center justify-center z-[9999] hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title-${modalId}">
            <div data-modal-overlay class="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm" aria-hidden="true"></div>
            <div class="modal-container relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="modal-title-${modalId}" class="text-xl font-bold text-gray-900 dark:text-white font-kanit">${title}</h2>
                    <button data-modal-close class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" aria-label="Close modal">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                ${controlsHtml}
                <div id="${modalContentContainerId}" class="p-4 sm:p-6 flex-grow overflow-y-auto modern-scrollbar">
                    <!-- Assignment list will be rendered here -->
                </div>
            </div>
        </div>
    `;

    document.getElementById('modals-placeholder').insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById(modalId);
    const contentElement = document.getElementById(modalContentContainerId);
    const searchInput = document.getElementById(`modal-search-input-${modalIdentifier}`);

    const filterAndRender = () => {
        const query = searchInput.value.toLowerCase();
        const filteredAssignments = assignments.filter(assignment => !query || (assignment.name && assignment.name.toLowerCase().includes(query)));

        if (filteredAssignments.length === 0) {
            contentElement.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-8">ไม่พบรายการที่ตรงกับคำค้นหา</p>`;
        } else {
            const listHtml = filteredAssignments.map(createAssignmentItemHTML).join('');
            contentElement.innerHTML = `<ul class="divide-y divide-gray-200 dark:divide-gray-700">${listHtml}</ul>`;
        }
    };

    searchInput.addEventListener('input', filterAndRender);

    filterAndRender(); // Initial render
    new ModalHandler(modalId).open();
}
