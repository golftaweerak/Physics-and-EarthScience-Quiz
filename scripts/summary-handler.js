import { studentScores } from '../data/scores-data.js';

// Module-level state for summary data and sorting configuration
let summaryDataStore = null;
let roomSortConfig = {
    key: 'room', // 'room' or 'averageScore'
    direction: 'asc' // 'asc' or 'desc'
};

/**
 * Calculates the assignment completion percentage for a single student.
 * @param {object} student - The student object.
 * @returns {{submitted: number, total: number, percentage: string}} An object with completion stats.
 */
function calculateStudentCompletion(student) {
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
 * Calculates summary statistics for all students.
 * @param {Array<object>} scores - The array of all student score objects.
 * @returns {object} An object containing various summary statistics.
 */
function calculateOverallSummary(scores) {
    if (!scores || scores.length === 0) {
        return {
            totalStudents: 0,
            averageScore: 0,
            completionPercentage: 0,
            highestScore: 0,
            lowestScore: 0,
            gradeDistribution: {},
            summaryByRoom: {}
        };
    }

    const totalStudents = scores.length;
    let totalScoreSum = 0;
    const gradeDistribution = {};
    const summaryByRoom = {};

    let highestScore = -Infinity;
    let lowestScore = Infinity;

    // For overall completion percentage
    let totalTrackableAssignments = 0;
    let totalSubmittedAssignments = 0;
    // const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท']; // This is now defined inside calculateStudentCompletion

    scores.forEach(student => {
        // Overall average score
        const totalScore = student['รวม [100]'];
        if (typeof totalScore === 'number') {
            totalScoreSum += totalScore;
            // Update highest and lowest scores
            if (totalScore > highestScore) {
                highestScore = totalScore;
            }
            if (totalScore < lowestScore) {
                lowestScore = totalScore;
            }
        }

        // Grade distribution
        const grade = student['เกรด'] || 'N/A';
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        const numericGrade = parseFloat(grade);

        // Per-room stats
        const room = student.room || 'N/A';
        if (!summaryByRoom[room]) {
            summaryByRoom[room] = {
                studentCount: 0,
                totalScoreSum: 0,
                validScoresCount: 0,
                totalGradeSum: 0,
                validGradesCount: 0,
                totalTrackable: 0,
                totalSubmitted: 0
            };
        }
        summaryByRoom[room].studentCount++;
        if (typeof totalScore === 'number') {
            summaryByRoom[room].totalScoreSum += totalScore;
            summaryByRoom[room].validScoresCount++;
        }
        if (!isNaN(numericGrade)) {
            summaryByRoom[room].totalGradeSum += numericGrade;
            summaryByRoom[room].validGradesCount++;
        }

        // Per-room completion stats
        const completion = calculateStudentCompletion(student);
        summaryByRoom[room].totalTrackable += completion.total;
        summaryByRoom[room].totalSubmitted += completion.submitted;

        // Update overall completion stats
        totalTrackableAssignments += completion.total;
        totalSubmittedAssignments += completion.submitted;
    });

    // Calculate averages for each room
    for (const room in summaryByRoom) {
        const roomData = summaryByRoom[room];
        roomData.averageScore = roomData.validScoresCount > 0 
            ? (roomData.totalScoreSum / roomData.validScoresCount).toFixed(2) 
            : 'N/A';
        roomData.averageGrade = roomData.validGradesCount > 0
            ? (roomData.totalGradeSum / roomData.validGradesCount).toFixed(2)
            : 'N/A';
        roomData.completionPercentage = roomData.totalTrackable > 0
            ? ((roomData.totalSubmitted / roomData.totalTrackable) * 100).toFixed(0)
            : '0';
    }

    const overallAverageScore = totalStudents > 0 ? (totalScoreSum / scores.filter(s => typeof s['รวม [100]'] === 'number').length).toFixed(2) : 0;

    const completionPercentage = totalTrackableAssignments > 0 
        ? ((totalSubmittedAssignments / totalTrackableAssignments) * 100).toFixed(0) 
        : 0;
    
    // Final check for highest/lowest scores
    const finalHighestScore = highestScore === -Infinity ? 'N/A' : highestScore;
    const finalLowestScore = lowestScore === Infinity ? 'N/A' : lowestScore;

    return {
        totalStudents,
        averageScore: overallAverageScore,
        gradeDistribution,
        completionPercentage,
        highestScore: finalHighestScore,
        lowestScore: finalLowestScore,
        summaryByRoom
    };
}

/**
 * Creates and renders the grade distribution bar chart.
 * @param {object} gradeDistribution - An object with grades as keys and counts as values.
 */
function createGradeDistributionChart(gradeDistribution) {
    const ctx = document.getElementById('grade-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Chart canvas element not found');
        return;
    }

    // Define a logical order for grades and a color palette that matches the site's theme.
    const gradeOrder = ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'N/A'];
    const backgroundColors = [
        '#14b8a6', // teal-500
        '#06b6d4', // cyan-500
        '#0ea5e9', // sky-500
        '#facc15', // yellow-400
        '#f59e0b', // amber-500
        '#f97316', // orange-500
        '#ef4444', // red-500
        '#b91c1c', // red-700
        '#6b7280'  // gray-500
    ];
    const borderColors = [
        '#0d9488', // teal-600
        '#0891b2', // cyan-600
        '#0284c7', // sky-600
        '#eab308', // yellow-500
        '#d97706', // amber-600
        '#ea580c', // orange-600
        '#dc2626', // red-600
        '#991b1b', // red-800
        '#4b5563'  // gray-600
    ];

    const labels = [];
    const data = [];
    const chartColors = [];
    const chartBorderColors = [];

    gradeOrder.forEach((grade, index) => {
        if (gradeDistribution[grade] !== undefined && gradeDistribution[grade] > 0) {
            labels.push(`เกรด ${grade}`);
            data.push(gradeDistribution[grade]);
            chartColors.push(backgroundColors[index]);
            chartBorderColors.push(borderColors[index]);
        }
    });

    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(173, 173, 173, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#787878ff' : '#010203ff'; // Use gray-100 for dark and gray-900 for light for max contrast

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนนักเรียน',
                data: data,
                backgroundColor: chartColors,
                borderColor: chartBorderColors,
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'การกระจายของเกรดนักเรียนทั้งหมด',
                    color: textColor,
                    font: {
                        size: 18,
                        family: "'Kanit', sans-serif",
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'จำนวนนักเรียน (คน)',
                        color: textColor,
                        font: {
                            family: "'Kanit', sans-serif",
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: textColor,
                        precision: 0, // Ensure y-axis ticks are integers
                        font: {
                            weight: '500'
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Kanit', sans-serif",
                            weight: '500'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Returns a Tailwind CSS text color class based on the score.
 * @param {number} score - The score to evaluate.
 * @returns {string} The Tailwind CSS class string.
 */
function getScoreTextColor(score) {
    if (isNaN(score)) return 'text-gray-500 dark:text-gray-400';
    if (score >= 80) return 'text-teal-500 dark:text-teal-400';
    if (score >= 70) return 'text-sky-500 dark:text-sky-400';
    if (score >= 60) return 'text-green-500 dark:text-green-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
}
/**
 * Sorts and renders the rows for the per-room summary table.
 * Also updates the sort indicator icon in the table header.
 */
function updateRoomSummaryTable() {
    const tbody = document.getElementById('room-summary-tbody');
    const sortIndicatorRoom = document.getElementById('sort-indicator-room');
    const sortIndicatorScore = document.getElementById('sort-indicator-score');
    const sortIndicatorGrade = document.getElementById('sort-indicator-grade');
    const sortIndicatorCompletion = document.getElementById('sort-indicator-completion');
    if (!tbody || !sortIndicatorRoom || !sortIndicatorScore || !sortIndicatorGrade || !summaryDataStore) return;

    // Sort the room keys based on the current sortConfig
    const sortedRooms = Object.keys(summaryDataStore.summaryByRoom).sort((a, b) => {
        if (roomSortConfig.key === 'room') {
            // Use localeCompare with numeric option for natural sorting (e.g., '2' before '10')
            return roomSortConfig.direction === 'asc' 
                ? a.localeCompare(b, undefined, { numeric: true }) 
                : b.localeCompare(a, undefined, { numeric: true });
        } else { // Sort by averageScore
            const roomA = summaryDataStore.summaryByRoom[a];
            const roomB = summaryDataStore.summaryByRoom[b];

            const valA = roomA[roomSortConfig.key];
            const valB = roomB[roomSortConfig.key];

            // Always place rooms with 'N/A' scores at the bottom
            if (valA === 'N/A') return 1;
            if (valB === 'N/A') return -1;

            const numA = parseFloat(valA);
            const numB = parseFloat(valB);

            return roomSortConfig.direction === 'desc' ? numB - numA : numA - numB;
        }
    });

    // Generate and inject the table rows
    tbody.innerHTML = sortedRooms.map(room => {
        const roomData = summaryDataStore.summaryByRoom[room];

        const avgScore = parseFloat(roomData.averageScore);
        const scoreTextColorClass = getScoreTextColor(avgScore);

        // For Completion Percentage Progress Bar
        const completionPercentage = parseFloat(roomData.completionPercentage);
        let completionBarColor = 'bg-gray-300 dark:bg-gray-600';
        if (!isNaN(completionPercentage)) {
            if (completionPercentage >= 90) completionBarColor = 'bg-gradient-to-r from-teal-400 to-teal-500';
            else if (completionPercentage >= 75) completionBarColor = 'bg-gradient-to-r from-sky-400 to-sky-500';
            else if (completionPercentage >= 50) completionBarColor = 'bg-gradient-to-r from-amber-400 to-amber-500';
            else completionBarColor = 'bg-gradient-to-r from-red-500 to-rose-500';
        }
        const completionBarHtml = !isNaN(completionPercentage) ? `
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div class="${completionBarColor} h-2.5 rounded-full transition-all duration-500" style="width: ${completionPercentage}%"></div>
            </div>
        ` : '<span class="text-xs text-gray-400">N/A</span>';

        // For Average Grade Color
        const avgGrade = parseFloat(roomData.averageGrade);
        let gradeColorClass = 'text-gray-800 dark:text-gray-200';
        if (!isNaN(avgGrade)) {
            if (avgGrade >= 3.5) gradeColorClass = 'text-teal-500';
            else if (avgGrade >= 2.5) gradeColorClass = 'text-sky-500';
            else if (avgGrade >= 1.5) gradeColorClass = 'text-amber-500';
            else gradeColorClass = 'text-red-500';
        }

        return `
            <tr class="border-b dark:border-gray-700 last:border-b-0 odd:bg-white even:bg-gray-50/50 dark:odd:bg-gray-800/50 dark:even:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors duration-150">
                <th scope="row" class="px-4 py-2 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    ห้อง ${room}
                    <span class="ml-2 font-mono font-normal text-gray-500 dark:text-gray-400">(${roomData.studentCount} คน)</span>
                </th>
                <td class="px-4 py-2 text-center">
                    <span class="font-bold text-base ${scoreTextColorClass}">${roomData.averageScore}</span>
                </td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-3 justify-center">
                        <span class="font-semibold font-mono w-12 text-right">${roomData.completionPercentage}%</span>
                        <div class="w-full max-w-[100px]">
                           ${completionBarHtml}
                        </div>
                    </div>
                </td>
                <td class="px-4 py-2 text-center font-bold text-sm ${gradeColorClass}">${roomData.averageGrade}</td>
            </tr>
        `;
    }).join('');

    // Update the sort indicator icons
    const downArrow = `<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
    const upArrow = `<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>`;
    const sortArrow = roomSortConfig.direction === 'desc' ? downArrow : upArrow;

    // Clear both indicators first
    sortIndicatorRoom.innerHTML = '';
    sortIndicatorScore.innerHTML = '';
    sortIndicatorGrade.innerHTML = '';
    sortIndicatorCompletion.innerHTML = '';

    // Set the indicator on the active column
    if (roomSortConfig.key === 'room') {
        sortIndicatorRoom.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'averageScore') {
        sortIndicatorScore.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'averageGrade') {
        sortIndicatorGrade.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'completionPercentage') {
        sortIndicatorCompletion.innerHTML = sortArrow;
    }
}

/**
 * Adds a click event listener to the table header to enable sorting.
 */
function initializeTableSorting() {
    const sortScoreBtn = document.getElementById('sort-avg-score-btn');
    const sortRoomBtn = document.getElementById('sort-room-btn');
    const sortGradeBtn = document.getElementById('sort-avg-grade-btn');
    const sortCompletionBtn = document.getElementById('sort-completion-btn');

    if (sortScoreBtn) {
        sortScoreBtn.addEventListener('click', () => {
            if (roomSortConfig.key === 'averageScore') {
                roomSortConfig.direction = roomSortConfig.direction === 'desc' ? 'asc' : 'desc';
            } else {
                roomSortConfig.key = 'averageScore';
                roomSortConfig.direction = 'desc'; // Default to descending for scores
            }
            updateRoomSummaryTable();
        });
    }

    if (sortRoomBtn) {
        sortRoomBtn.addEventListener('click', () => {
            if (roomSortConfig.key === 'room') {
                roomSortConfig.direction = roomSortConfig.direction === 'desc' ? 'asc' : 'desc';
            } else {
                roomSortConfig.key = 'room';
                roomSortConfig.direction = 'asc'; // Default to ascending for rooms
            }
            updateRoomSummaryTable();
        });
    }

    if (sortGradeBtn) {
        sortGradeBtn.addEventListener('click', () => {
            if (roomSortConfig.key === 'averageGrade') {
                roomSortConfig.direction = roomSortConfig.direction === 'desc' ? 'asc' : 'desc';
            } else {
                roomSortConfig.key = 'averageGrade';
                roomSortConfig.direction = 'desc'; // Default to descending for grades
            }
            updateRoomSummaryTable();
        });
    }

    if (sortCompletionBtn) {
        sortCompletionBtn.addEventListener('click', () => {
            if (roomSortConfig.key === 'completionPercentage') {
                roomSortConfig.direction = roomSortConfig.direction === 'desc' ? 'asc' : 'desc';
            } else {
                roomSortConfig.key = 'completionPercentage';
                roomSortConfig.direction = 'desc'; // Default to descending
            }
            updateRoomSummaryTable();
        });
    }
}

/**
 * Renders the summary data into HTML and injects it into the page.
 * @param {object} summaryData - The calculated summary data.
 */
function renderSummary(summaryData) {
    const container = document.getElementById('summary-container');
    if (!container) return;

    const summaryHtml = `
        <!-- Student Search Section -->
        <div class="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden">
            <h3 class="p-4 text-lg font-bold text-gray-800 dark:text-white font-kanit border-b border-gray-200 dark:border-gray-700">ค้นหานักเรียน</h3>
            <div class="p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row gap-3 items-center">
                    <div class="relative flex-grow w-full">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                        </div>
                        <input type="text" id="student-search-input" placeholder="พิมพ์ชื่อ, รหัส, หรือห้องเรียน..." class="w-full p-3 pl-10 pr-10 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
                        <button id="student-search-clear-btn" class="absolute inset-y-0 right-0 pr-3 flex items-center hidden" aria-label="ล้างการค้นหา">
                            <svg class="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                        </button>
                    </div>
                    <button id="student-search-btn" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-transform transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                        <span>ค้นหา</span>
                    </button>
                </div>
            </div>
            <div id="student-search-results" class="px-4 sm:px-6 pb-4 space-y-2 max-h-96 overflow-y-auto modern-scrollbar">
                <!-- Search results will be injected here -->
            </div>
        </div>

        <!-- Overall Stats Cards -->
        <div class="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div class="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a2 2 0 002-2V9m-6 6v-6m-6 6v-6" /></svg>
                </div>
                <div>
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.totalStudents}</div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">จำนวนนักเรียนทั้งหมด</div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/50 text-green-500 dark:text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                </div>
                <div>
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.averageScore}</div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">คะแนนเฉลี่ยรวม</div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div>
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.completionPercentage}%</div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">เปอร์เซ็นต์การส่งงาน</div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/50 text-yellow-500 dark:text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.highestScore}</div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">คะแนนสูงสุด</div>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                </div>
                <div>
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.lowestScore}</div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">คะแนนต่ำสุด</div>
                </div>
            </div>
        </div>

        <!-- Grade Distribution Chart -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60">
            <div class="relative h-96">
                <canvas id="grade-chart"></canvas>
            </div>
        </div>

        <!-- Per-Room Summary Table -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden">
            <h3 class="p-4 text-lg font-bold text-gray-800 dark:text-white font-kanit border-b border-gray-200 dark:border-gray-700">สรุปรายห้องเรียน</h3>
            <div class="overflow-x-auto modern-scrollbar">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-300 uppercase">
                        <tr>
                            <th scope="col" class="px-4 py-2">
                                <button id="sort-room-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                                    <span>ห้องเรียน</span>
                                    <span id="sort-indicator-room" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                                </button>
                            </th>
                            <th scope="col" class="px-4 py-2 text-center">
                                <button id="sort-avg-score-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                                    <span>คะแนนเฉลี่ย</span>
                                    <span id="sort-indicator-score" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                                </button>
                            </th>
                            <th scope="col" class="px-4 py-2 text-center">
                                <button id="sort-completion-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                                    <span>การส่งงาน</span>
                                    <span id="sort-indicator-completion" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                                </button>
                            </th>
                            <th scope="col" class="px-4 py-2 text-center">
                                <button id="sort-avg-grade-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                                    <span>เกรดเฉลี่ย</span>
                                    <span id="sort-indicator-grade" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="room-summary-tbody">
                        <!-- Table rows will be rendered by updateRoomSummaryTable() -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Clear loading spinner and render the new content
    container.innerHTML = summaryHtml;

    // Perform the initial render of the sortable table
    updateRoomSummaryTable();

    // Now that the canvas element exists in the DOM, create the chart
    createGradeDistributionChart(summaryData.gradeDistribution);
    initializeStudentSearch();
}

/**
 * Main function to initialize the summary page.
 */
export function initializeSummaryPage() {
    summaryDataStore = calculateOverallSummary(studentScores);
    renderSummary(summaryDataStore);
    initializeTableSorting();
}

/**
 * Renders the search results into the DOM.
 * @param {Array<object>} results - The array of student objects to display.
 * @param {HTMLElement} container - The container element to render results into.
 */
function renderSearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">ไม่พบนักเรียนที่ตรงกับคำค้นหา</p>`;
        return;
    }

    container.innerHTML = results.sort((a, b) => a.id.localeCompare(b.id)).map(student => {
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

        return `
            <a href="./scores.html?id=${student.id}" class="block p-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-bold text-gray-800 dark:text-gray-100">${student.name}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            รหัส: <span class="font-mono">${student.id}</span> | 
                            ห้อง: <span class="font-semibold">${student.room || 'N/A'}</span>
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
            </a>
        `;
    }).join('');
}

/**
 * Initializes the student search functionality.
 */
function initializeStudentSearch() {
    const searchInput = document.getElementById('student-search-input');
    const searchBtn = document.getElementById('student-search-btn');
    const clearBtn = document.getElementById('student-search-clear-btn');
    const resultsContainer = document.getElementById('student-search-results');

    if (!searchInput || !resultsContainer || !searchBtn || !clearBtn) {
        console.error('Student search elements not found.');
        return;
    }

    // Set initial message
    resultsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">กรุณาพิมพ์คำค้นหาแล้วกด Enter หรือปุ่มค้นหา</p>`;

    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length === 0) {
            resultsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">กรุณาพิมพ์คำค้นหา</p>`;
            return;
        }

        // New hierarchical search logic
        let results = [];
        
        // Priority 1: Exact ID match
        const idMatch = studentScores.find(s => s.id.toLowerCase() === query);
        if (idMatch) {
            results = [idMatch];
        } else {
            // Priority 2: Exact Room match
            const roomMatches = studentScores.filter(s => s.room && s.room.toLowerCase() === query);
            if (roomMatches.length > 0) {
                results = roomMatches;
            } else {
                // Priority 3: Partial Name match
                results = studentScores.filter(student =>
                    student.name.toLowerCase().includes(query)
                );
            }
        }

        renderSearchResults(results, resultsContainer);
    };

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">กรุณาพิมพ์คำค้นหาแล้วกด Enter หรือปุ่มค้นหา</p>`;
        clearBtn.classList.add('hidden');
        searchInput.focus();
    });

    searchInput.addEventListener('input', () => {
        clearBtn.classList.toggle('hidden', searchInput.value.length === 0);
    });

    clearBtn.classList.toggle('hidden', searchInput.value.length === 0);

    searchBtn.addEventListener('click', performSearch);

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if it's inside a form
            performSearch();
        }
    });
}