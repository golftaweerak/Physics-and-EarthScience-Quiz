/**
 * Calculates the assignment completion percentage for a single student.
 * @param {object} student - The student object.
 * @returns {{submitted: number, total: number, percentage: string, missing: number}} An object with completion stats.
 */
export function calculateStudentCompletion(student) {
    const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท'];
    if (!student.assignments || !Array.isArray(student.assignments)) {
        return { submitted: 0, total: 0, percentage: '0', missing: 0 };
    }

    const trackableAssignments = student.assignments.filter(assignment =>
        assignment && typeof assignment.name === 'string' && TRACKABLE_KEYWORDS.some(keyword => assignment.name.toLowerCase().includes(keyword))
    );

    /**
     * Determines if a score represents a submitted assignment.
     * A score is "not submitted" if it is null, undefined, an empty string, a hyphen, or the specific text 'ยังไม่ส่ง'.
     * @param {any} score The score value to check.
     * @returns {boolean} True if the assignment is considered submitted.
     */
    const isSubmitted = (score) => {
        if (score === null || score === undefined) return false;
        const scoreStr = String(score).trim().toLowerCase();
        // Any other value (including '0') is considered submitted.
        return scoreStr !== '' && scoreStr !== '-' && scoreStr !== 'ยังไม่ส่ง';
    };
    const submittedCount = trackableAssignments.filter(a => isSubmitted(a.score)).length;
    const totalCount = trackableAssignments.length;
    const percentage = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
    const missingCount = totalCount - submittedCount;

    return {
        submitted: submittedCount,
        total: totalCount,
        percentage: percentage.toFixed(0),
        missing: missingCount
    };
}

/**
 * Renders a list of student results into a container as clickable cards.
 * @param {Array<object>} results - The array of student objects to display.
 * @param {HTMLElement} container - The container element to render results into.
 * @param {object} options - Configuration options.
 * @param {'link' | 'button'} options.cardType - The type of card to render ('link' for navigation, 'button' for in-page action).
 * @param {string} [options.basePath='./'] - The base path for the link URL (used when cardType is 'link').
 * @param {Array<{label: string, key: string, valueClass?: string}>} [options.customFields] - Optional custom fields to display instead of default stats.
 * @param {boolean} [options.isClickable=true] - Determines if the rendered card is clickable.
 */
export function renderStudentSearchResultCards(results, container, options) {
    const { cardType, basePath = './', customFields, isClickable = true } = options;

    if (!results || results.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">ไม่พบนักเรียนที่ตรงกับคำค้นหา</p>`;
        return;
    }

    const resultsHtml = results.map(student => {
        let rightSideHtml = '';

        if (customFields && customFields.length > 0) {
            // Render custom fields provided in options
            const fieldsHtml = customFields.map(field => {
                const rawValue = student[field.key];
                const value = rawValue !== undefined && rawValue !== null && rawValue !== '' ? rawValue : '-';

                const valueHtml = typeof field.formatter === 'function'
                    ? field.formatter(value, student)
                    : `<p class="font-bold text-base sm:text-lg ${field.valueClass || 'text-gray-800 dark:text-gray-200'}">${value}</p>`;

                return `
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">${field.label}</p>
                        ${valueHtml}
                    </div>
                `;
            }).join('');
            rightSideHtml = `<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-center w-full sm:flex-1 sm:ml-4 mt-2 sm:mt-0">${fieldsHtml}</div>`;
        } else {
            // Default rendering (Total, Missing, Completion, Grade)
            const totalScore = student['รวม [100]'] !== undefined ? student['รวม [100]'] : null;
            const grade = student['เกรด'] ?? 'N/A';
            let gradeColorClass = 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200';
            if (grade >= 4) gradeColorClass = 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300';
            else if (grade >= 3) gradeColorClass = 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300';
            else if (grade >= 2) gradeColorClass = 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
            else if (grade >= 1) gradeColorClass = 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300';
            else if (grade >= 0) gradeColorClass = 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';

            const completion = calculateStudentCompletion(student);
            let completionColorClass = 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200';
            if (completion.percentage >= 90) completionColorClass = 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300';
            else if (completion.percentage >= 75) completionColorClass = 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300';
            else if (completion.percentage >= 50) completionColorClass = 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
            else completionColorClass = 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';

            const missingColorClass = completion.missing > 0 ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';

            const scoreHtml = totalScore !== null ? `
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">คะแนนรวม</p>
                        <p class="font-bold text-base sm:text-lg">${Number(totalScore).toFixed(2)}</p>
                    </div>
            ` : '';

            rightSideHtml = `
                <div class="flex items-center justify-start sm:justify-end gap-2 sm:gap-3 text-center w-full sm:w-auto mt-2 sm:mt-0">
                    ${scoreHtml}
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">ค้างส่ง</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${missingColorClass}">${completion.missing}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">ส่งงาน</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${completionColorClass}">${completion.percentage}%</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">เกรด</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${gradeColorClass}">${grade}</p>
                    </div>
                </div>
            `;
        }

        const cardInnerHtml = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center ${cardType === 'button' ? 'pointer-events-none' : ''}">
                <div class="w-full sm:w-auto">
                    <p class="font-bold text-gray-800 dark:text-gray-100 truncate">${student.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        รหัส: <span class="font-mono">${student.id}</span> | 
                        ห้อง: <span class="font-semibold">${student.room || 'N/A'}</span> |
                        เลขที่: <span class="font-semibold">${student.ordinal || 'N/A'}</span>
                    </p>
                </div>
                ${rightSideHtml}
            </div>
        `;

        const baseClasses = "block w-full text-left p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm";
        const clickableClasses = "hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer";
        const commonClasses = `${baseClasses} ${isClickable ? clickableClasses : 'cursor-default'}`;

        if (!isClickable) {
            return `<div class="${commonClasses}">${cardInnerHtml}</div>`;
        } else if (cardType === 'link') {
            return `<a href="${basePath}scores.html?id=${student.id}" class="${commonClasses}">${cardInnerHtml}</a>`;
        } else { // 'button'
            return `<button data-student-id="${student.id}" class="student-card-btn ${commonClasses}">${cardInnerHtml}</button>`;
        }
    }).join('');

    container.innerHTML = `<div class="space-y-2">${resultsHtml}</div>`;
}