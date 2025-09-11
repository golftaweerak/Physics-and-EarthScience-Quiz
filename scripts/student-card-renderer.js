/**
 * Calculates the assignment completion percentage for a single student.
 * @param {object} student - The student object.
 * @returns {{submitted: number, total: number, percentage: string}} An object with completion stats.
 */
export function calculateStudentCompletion(student) {
    const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท'];
    if (!student.assignments || !Array.isArray(student.assignments)) {
        return { submitted: 0, total: 0, percentage: '0' };
    }

    const trackableAssignments = student.assignments.filter(assignment =>
        TRACKABLE_KEYWORDS.some(keyword => assignment.name.toLowerCase().includes(keyword))
    );

    const submittedCount = trackableAssignments.filter(a => a.score && String(a.score).toLowerCase() !== 'ยังไม่ส่ง').length;
    const totalCount = trackableAssignments.length;
    const percentage = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

    return {
        submitted: submittedCount,
        total: totalCount,
        percentage: percentage.toFixed(0)
    };
}

/**
 * Renders a list of student results into a container as clickable cards.
 * @param {Array<object>} results - The array of student objects to display.
 * @param {HTMLElement} container - The container element to render results into.
 * @param {object} options - Configuration options.
 * @param {'link' | 'button'} options.cardType - The type of card to render ('link' for navigation, 'button' for in-page action).
 * @param {string} [options.basePath='./'] - The base path for the link URL (used when cardType is 'link').
 */
export function renderStudentSearchResultCards(results, container, options) {
    const { cardType, basePath = './' } = options;

    if (!results || results.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">ไม่พบนักเรียนที่ตรงกับคำค้นหา</p>`;
        return;
    }

    const resultsHtml = results.map(student => {
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

        const cardInnerHtml = `
            <div class="flex justify-between items-center ${cardType === 'button' ? 'pointer-events-none' : ''}">
                <div>
                    <p class="font-bold text-gray-800 dark:text-gray-100">${student.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        รหัส: <span class="font-mono">${student.id}</span> | 
                        ห้อง: <span class="font-semibold">${student.room || 'N/A'}</span> |
                        เลขที่: <span class="font-semibold">${student.ordinal || 'N/A'}</span>
                    </p>
                </div>
                <div class="flex items-center gap-2 sm:gap-4">
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">ส่งงาน</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${completionColorClass}">${completion.percentage}%</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">เกรด</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${gradeColorClass}">${grade}</p>
                    </div>
                </div>
            </div>
        `;

        const commonClasses = "block w-full text-left p-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500";

        if (cardType === 'link') {
            return `<a href="${basePath}scores.html?id=${student.id}" class="${commonClasses}">${cardInnerHtml}</a>`;
        } else { // 'button'
            return `<button data-student-id="${student.id}" class="student-card-btn ${commonClasses}">${cardInnerHtml}</button>`;
        }
    }).join('');

    container.innerHTML = `<div class="space-y-2">${resultsHtml}</div>`;
}