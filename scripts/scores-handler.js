import { studentScores } from '../data/scores-data.js';

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

export function initializeScoreSearch() {
    const studentIdInput = document.getElementById('student-id-input');
    const searchBtn = document.getElementById('search-btn');
    const resultContainer = document.getElementById('result-container');
    const clearBtn = document.getElementById('clear-btn');
    const defaultMessage = document.getElementById('default-message');

    // Modal elements
    const modal = document.getElementById('assignment-list-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-list-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    
    if (!studentIdInput || !searchBtn || !resultContainer || !clearBtn || !modal) {
        console.error("Required elements for score search are missing from the DOM.");
        return;
    }

    // --- Modal Logic ---
    if (modal && modalCloseBtn && modalTitle && modalContent) {
        const closeModal = () => {
            modal.classList.add('hidden');
        };

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            // Close if clicked on the backdrop
            if (event.target === modal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    function showAssignmentListModal(title, assignments) {
        if (!modal || !modalTitle || !modalContent) return;
        modalTitle.textContent = title;
        if (assignments.length === 0) {
            modalContent.innerHTML = `<p class="text-gray-500 dark:text-gray-400 text-center py-8">ไม่มีรายการ</p>`;
        } else {
            const listHtml = assignments.map(createAssignmentItemHTML).join('');
            modalContent.innerHTML = `<ul class="divide-y divide-gray-200 dark:divide-gray-700">${listHtml}</ul>`;
        }
        modal.classList.remove('hidden');
    }
    // Defensive check: Ensure student data is available before enabling search.
    if (!Array.isArray(studentScores) || studentScores.length === 0) {
        console.error("Student scores data is missing or empty.");
        studentIdInput.disabled = true;
        searchBtn.disabled = true;
        displayMessage('ไม่สามารถโหลดข้อมูลคะแนนได้ในขณะนี้', 'error');
        return;
    }

    const searchScores = () => {
        const query = studentIdInput.value.trim();
        if (query.length === 0) {
            displayMessage('กรุณากรอกรหัสนักเรียนหรือชื่อเพื่อค้นหา', 'error');
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const results = studentScores.filter(s => 
            s.id === query || 
            s.name.toLowerCase().includes(lowerCaseQuery)
        );

        if (results.length === 1) {
            displayResult(results[0]);
        } else if (results.length > 1) {
            const studentListHtml = results
                .map(s => `<li class="py-1 text-left">${s.name} (รหัส: ${s.id})</li>`)
                .join('');
            displayMessage(`พบนักเรียนหลายคน:<ul class="list-disc list-inside mt-2">${studentListHtml}</ul><p class="mt-2">กรุณาระบุรหัส 5 หลักให้ชัดเจน หรือใช้ชื่อ-สกุลที่เจาะจงมากขึ้น</p>`, 'info');
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
        if (!student.hasOwnProperty(scoreKey) || student[scoreKey] === null) return '';
        const score = Math.round(student[scoreKey]);
        return `
            <tr class="bg-gray-50 dark:bg-gray-800/50">
                <td class="py-2 px-4 pl-10 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg class="h-3 w-3 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                    <span class="italic">${label}</span>
                </td>
                <td class="py-2 px-4 text-right font-mono text-sm text-gray-700 dark:text-gray-300">${score}</td>
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
                
                let displayValue = (value !== null && value !== undefined) ? value : '-';
                // Round numeric scores to the nearest integer, but not the 'เกรด' field.
                if (typeof value === 'number' && !isGrade) {
                    displayValue = Math.round(value);
                }

                let retestStatusHtml = '';
                if (key === 'กลางภาค [20]' && student.ซ่อมมั้ย && student.ซ่อมมั้ย.trim() !== '-') {
                    const statusColor = student.ซ่อมมั้ย.includes('ไม่ต้อง') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
                    retestStatusHtml = `<div class="text-xs font-normal ${statusColor} pt-1">สถานะการสอบซ่อม: ${student.ซ่อมมั้ย}</div>`;
                }

                let mainRowHtml = `
                    <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${rowClass}">
                        <td class="py-3 px-4 ${labelClass}">${key}</td>
                        <td class="py-3 px-4 text-right">
                            <span class="${valueClass}">${displayValue}</span>
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
                    คะแนนสรุป
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
            <div class="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden anim-card-pop-in">
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
                </div>
                <div class="p-6 space-y-8">
                    ${summaryScoreSection}
                    ${summaryCardsHtml}
                    ${assignmentsSection}
                </div>
            </div>
        `;

        // Attach event listeners for the new modal buttons
        document.getElementById('show-submitted-btn')?.addEventListener('click', () => {
            const submittedAssignments = trackableAssignments.filter(a => a.score && a.score.toLowerCase() !== 'ยังไม่ส่ง');
            showAssignmentListModal(`งานที่ส่งแล้ว (${submittedAssignments.length} รายการ)`, submittedAssignments);
        });

        document.getElementById('show-missing-btn')?.addEventListener('click', () => {
            const missingAssignments = trackableAssignments.filter(a => !a.score || a.score.toLowerCase() === 'ยังไม่ส่ง');
            showAssignmentListModal(`งานที่ค้างส่ง (${missingAssignments.length} รายการ)`, missingAssignments);
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
