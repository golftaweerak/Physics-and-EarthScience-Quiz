import { studentScores } from '../data/scores-data.js';

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
    const defaultMessage = document.getElementById('default-message');
    
    if (!studentIdInput || !searchBtn || !resultContainer) {
        console.error("Required elements for score search are missing.");
        return;
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
        const studentId = studentIdInput.value.trim();
        if (!/^\d{5}$/.test(studentId)) {
            displayMessage('กรุณากรอกรหัสนักเรียน 5 หลักให้ถูกต้อง', 'error');
            return;
        }

        const student = studentScores.find(s => s.id === studentId);

        if (student) {
            displayResult(student);
        } else {
            displayMessage(`ไม่พบข้อมูลสำหรับรหัสนักเรียน ${studentId}`, 'error');
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
    }

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

        const scoreRows = summaryOrder.map(key => {
            if (student.hasOwnProperty(key)) {
                const value = student[key];
                const isGrade = key === 'เกรด';
                const valueClass = isGrade ? 'text-xl text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white';

                let retestStatusHtml = '';
                if (key === 'กลางภาค [20]' && student.ซ่อมมั้ย && student.ซ่อมมั้ย.trim() !== '-') {
                    const statusColor = student.ซ่อมมั้ย.includes('ไม่ต้อง') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
                    retestStatusHtml = `<div class="text-xs font-normal ${statusColor} pt-1">สถานะการสอบซ่อม: ${student.ซ่อมมั้ย}</div>`;
                }

                return `
                    <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <td class="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">${key}</td>
                        <td class="py-3 px-4 text-right">
                            <span class="font-semibold ${valueClass}">${value !== null && value !== undefined ? value : '-'}</span>
                            ${retestStatusHtml}
                        </td>
                    </tr>
                `;
            }
            return '';
        }).join('');

        const groupedAssignments = groupAssignments(student.assignments);

        const assignmentsSection = Object.keys(groupedAssignments).length > 0 ? `
            <figure class="mt-6">
                <figcaption class="p-3 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-lg border-x border-t border-gray-200 dark:border-gray-700">
                    คะแนนเก็บรายบท
                </figcaption>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border border-gray-200 dark:border-gray-700">
                    ${Object.entries(groupedAssignments).map(([chapter, chapterAssignments]) => `
                        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <h4 class="p-3 font-bold text-gray-800 dark:text-gray-200 font-kanit bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">${chapter}</h4>
                            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${chapterAssignments.map(createAssignmentItemHTML).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </figure>
        ` : '';

        resultContainer.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden anim-card-pop-in">
                <div class="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900/70 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div class="min-w-0">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white font-kanit truncate">${student.name}</h2>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>รหัสนักเรียน: <strong class="font-semibold text-blue-600 dark:text-blue-400">${student.id}</strong></span>
                            ${student.room ? `<span class="border-l border-gray-300 dark:border-gray-600 pl-4">ห้อง: <strong class="font-semibold text-blue-600 dark:text-blue-400">${student.room}</strong></span>` : ''}
                            ${student.ordinal ? `<span class="border-l border-gray-300 dark:border-gray-600 pl-4">เลขที่: <strong class="font-semibold text-blue-600 dark:text-blue-400">${student.ordinal}</strong></span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="p-5">
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table class="w-full text-base">
                            <caption class="p-3 text-lg font-semibold text-left text-gray-900 bg-gray-50 dark:text-white dark:bg-gray-700/50">
                                คะแนนสรุป
                            </caption>
                            <tbody>
                                ${scoreRows}
                            </tbody>
                        </table>
                    </div>
                    ${assignmentsSection}
                </div>
            </div>
        `;
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

    /**
     * Creates the HTML for a single assignment list item.
     * @param {object} assignment - The assignment object.
     * @returns {string} The HTML string for the list item.
     */
    function createAssignmentItemHTML(assignment) {
        const lowerCaseName = assignment.name.toLowerCase();
        const displayName = ASSIGNMENT_DISPLAY_NAME_MAP[lowerCaseName] || assignment.name;

        const score = assignment.score;
        let scoreHtml;
        if (isNaN(parseFloat(score))) {
            const colorClass = score.includes('ไม่ส่ง') 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-green-600 dark:text-green-500';
            scoreHtml = `<span class="font-semibold ${colorClass}">${score}</span>`;
        } else {
            scoreHtml = `<span class="font-mono font-bold text-gray-800 dark:text-gray-200">${score}</span>`;
        }
        return `
            <li class="flex justify-between items-center py-2 px-3">
                <span class="text-gray-600 dark:text-gray-400 text-sm">${displayName}</span>
                ${scoreHtml}
            </li>
        `;
    }
}
