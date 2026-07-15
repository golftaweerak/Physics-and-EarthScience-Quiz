import { getCurrentSemester, setCurrentSemester, getCurrentCourseCode, getSemesterSummary } from './data-manager.js';
import { calculateStudentCompletion } from './student-card-renderer.js';

// Define data keys mapping
const DATA_KEYS = {
    ID: 'id',
    NAME: 'name',
    ROOM: 'room',
    ORDINAL: 'ordinal',
    TOTAL_SCORE: 'รวม [100]',
    GRADE: 'เกรด'
};

let currentSemester = getCurrentSemester();
// Module-level state for summary data and sorting configuration
let summaryDataStore = null;
let roomSortConfig = {
    key: 'room', // 'room' or 'averageScore'
    direction: 'asc' // 'asc' or 'desc'
};
let selectedRoomForDetails = null;
let currentStudentScores = [];
let displayMode = 'overall'; // 'overall' or 'midterm'

// Centralized theme for grades to ensure consistency between chart and chips
const GRADE_THEME = {
    '4': { chart: 'rgba(20, 184, 166, 0.7)', border: '#0d9488', chip: 'bg-teal-500/20 text-teal-800 dark:text-teal-200 border-teal-500/30' },
    '3.5': { chart: 'rgba(6, 182, 212, 0.7)', border: '#0891b2', chip: 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-500/30' },
    '3': { chart: 'rgba(14, 165, 233, 0.7)', border: '#0284c7', chip: 'bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-500/30' },
    '2.5': { chart: 'rgba(250, 204, 21, 0.7)', border: '#eab308', chip: 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-200 border-yellow-400/30' },
    '2': { chart: 'rgba(245, 158, 11, 0.7)', border: '#d97706', chip: 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30' },
    '1.5': { chart: 'rgba(249, 115, 22, 0.7)', border: '#ea580c', chip: 'bg-orange-500/20 text-orange-800 dark:text-orange-200 border-orange-500/30' },
    '1': { chart: 'rgba(239, 68, 68, 0.7)', border: '#dc2626', chip: 'bg-red-500/20 text-red-800 dark:text-red-200 border-red-500/30' },
    '0': { chart: 'rgba(185, 28, 28, 0.7)', border: '#991b1b', chip: 'bg-red-700/20 text-red-800 dark:text-red-200 border-red-700/30' },
    'รอ': { chart: 'rgba(168, 85, 247, 0.7)', border: '#9333ea', chip: 'bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-500/30' },
    'มส': { chart: 'rgba(236, 72, 153, 0.7)', border: '#db2777', chip: 'bg-pink-500/20 text-pink-800 dark:text-pink-200 border-pink-500/30' },
    'N/A': { chart: 'rgba(107, 114, 128, 0.7)', border: '#4b5563', chip: 'bg-gray-500/20 text-gray-800 dark:text-gray-200 border-gray-500/30' }
};

/**
 * Calculates summary statistics for all students.
 * @param {Array<object>} scores - The array of all student score objects.
 * @returns {object} An object containing various summary statistics.
 */
export function calculateOverallSummary(scores) {
    currentSemester = getCurrentSemester();
    if (!scores || scores.length === 0) {
        return {
            totalStudents: 0,
            averageScore: 0,
            completionPercentage: 0,
            highestScore: 0,
            lowestScore: 0,
            highestMidtermScore: 0,
            lowestMidtermScore: 0,
            gradeDistribution: {},
            averageMidtermScore: 0,
            midtermPassPercentage: 0,
            midtermSD: 0,
            midtermPassCount: 0,
            midtermFailCount: 0,
            summaryByRoom: {}
        };
    }

    const totalStudents = scores.length;
    let totalScoreSum = 0;
    let validScoresCount = 0;
    const gradeDistribution = {};
    const summaryByRoom = {};

    let highestScore = -Infinity;
    let lowestScore = Infinity;
    let highestMidtermScore = -Infinity;
    let lowestMidtermScore = Infinity;
    let totalMidtermScoreSum = 0, validMidtermScoresCount = 0, totalPassCount = 0, totalFailCount = 0;
    const allMidtermScores = [];

    // For overall completion percentage
    let totalTrackableAssignments = 0;
    let totalSubmittedAssignments = 0;
    let studentsWithNoMissing = 0, studentsWithMissing = 0;

    scores.forEach(student => {
        // --- Normalization Phase ---
        if (currentSemester === '2/2568') {
            // Helper to find score by partial name
            const findScore = (keywords) => {
                if (!Array.isArray(keywords)) keywords = [keywords];
                if (!student.assignments) return '-';
                const assignment = student.assignments.find(a => a && a.name && keywords.some(k => a.name.toLowerCase().includes(k.toLowerCase())));
                return assignment ? assignment.score : '-';
            };

            let totalScoreValue = student[DATA_KEYS.TOTAL_SCORE];

            const col1 = findScore(['Column1', 'รวม [100]']);
            if (col1 !== '-') totalScoreValue = parseFloat(col1);

            student['คะแนนรวม'] = totalScoreValue;
            if (!isNaN(totalScoreValue)) {
                student[DATA_KEYS.TOTAL_SCORE] = totalScoreValue;
            }

            let midScore = findScore(['MID', 'รวมกลางภาค']);
            if (midScore === '-' || midScore === '') {
                const p1 = parseFloat(student['กลางภาคข้อกา']);
                const p2 = parseFloat(student['กลางภาคข้อเขียน']);
                if (!isNaN(p1) || !isNaN(p2)) {
                    midScore = ((isNaN(p1) ? 0 : p1) + (isNaN(p2) ? 0 : p2));
                }
            }
            student['คะแนนกลางภาค'] = midScore;

            let remedial = findScore(['ซ่อมแล้ว', 'ซ่อมกลางภาค']);
            if (remedial === '-' || remedial === '') remedial = findScore('ซ่อมมั้ย');
            student['การซ่อมกลางภาค'] = remedial;

            let quizCount = 0;
            const quizTargets = [['Quiz 6'], ['Quiz 7'], ['Quiz 8', 'Qzuiz 8'], ['Quiz 9'], ['Quiz 10']];

            quizTargets.forEach(keys => {
                const score = findScore(keys);
                if (score && score !== '-' && score !== 'ยังไม่ส่ง') {
                    quizCount++;
                }
            });
            student['จำนวน Quiz'] = `${quizCount}/${quizTargets.length}`;

            student['คะแนนปลายภาค'] = findScore(['ปลายภาค', 'Final']);
        } else {
            // Normalize midterm for other semesters (1/2568, 1/2569)
            if (student['กลางภาค [20]'] !== undefined) {
                student['คะแนนกลางภาค'] = student['กลางภาค [20]'];
            }
        }

        // --- Calculation Phase ---
        const totalScore = student[DATA_KEYS.TOTAL_SCORE];
        if (typeof totalScore === 'number') {
            totalScoreSum += totalScore;
            validScoresCount++;
            if (totalScore > highestScore) highestScore = totalScore;
            if (totalScore < lowestScore) lowestScore = totalScore;
        }

        const grade = student[DATA_KEYS.GRADE] ?? 'N/A';
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        const numericGrade = parseFloat(grade);

        const room = student[DATA_KEYS.ROOM] || 'N/A';
        if (!summaryByRoom[room]) {
            summaryByRoom[room] = {
                studentCount: 0,
                totalScoreSum: 0,
                validScoresCount: 0,
                totalGradeSum: 0,
                validGradesCount: 0,
                totalTrackable: 0,
                totalSubmitted: 0,
                totalMidtermScoreTerm2: 0,
                validMidtermScoresCountTerm2: 0,
                passCountTerm2: 0,
                failCountTerm2: 0,
                midtermScoresList: []
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

        const completion = calculateStudentCompletion(student);
        summaryByRoom[room].totalTrackable += completion.total;
        summaryByRoom[room].totalSubmitted += completion.submitted;

        // Add logic for midterm scores
        const midtermScore = parseFloat(student['คะแนนกลางภาค']);
        if (!isNaN(midtermScore)) {
            // Per-room midterm stats
            summaryByRoom[room].totalMidtermScoreTerm2 += midtermScore;
            summaryByRoom[room].validMidtermScoresCountTerm2++;
            summaryByRoom[room].midtermScoresList.push(midtermScore);

            // Room-specific midterm pass/fail (threshold >= 12)
            if (midtermScore >= 12) {
                summaryByRoom[room].passCountTerm2++;
            } else {
                summaryByRoom[room].failCountTerm2++;
            }

            // Overall midterm stats
            totalMidtermScoreSum += midtermScore;
            validMidtermScoresCount++;
            allMidtermScores.push(midtermScore);
            if (midtermScore > highestMidtermScore) highestMidtermScore = midtermScore;
            if (midtermScore < lowestMidtermScore) lowestMidtermScore = midtermScore;

            // Overall midterm pass/fail
            if (midtermScore >= 12) totalPassCount++;
            else totalFailCount++;
        }

        totalTrackableAssignments += completion.total;
        totalSubmittedAssignments += completion.submitted;

        if (completion.missing > 0) {
            studentsWithMissing++;
        } else if (completion.total > 0) {
            studentsWithNoMissing++;
        }
    });

    // Calculate averages and SD for each room
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
        roomData.averageMidtermTerm2 = roomData.validMidtermScoresCountTerm2 > 0
            ? (roomData.totalMidtermScoreTerm2 / roomData.validMidtermScoresCountTerm2).toFixed(2)
            : 'N/A';

        // Calculate Midterm SD
        if (roomData.validMidtermScoresCountTerm2 > 0) {
            const avgMidterm = roomData.totalMidtermScoreTerm2 / roomData.validMidtermScoresCountTerm2;
            const sumOfSquares = roomData.midtermScoresList.reduce((sum, val) => sum + Math.pow(val - avgMidterm, 2), 0);
            roomData.midtermSD = Math.sqrt(sumOfSquares / roomData.validMidtermScoresCountTerm2).toFixed(2);
        } else {
            roomData.midtermSD = 'N/A';
        }
    }

    const overallAverageScore = validScoresCount > 0 ? (totalScoreSum / validScoresCount).toFixed(2) : 0;
    const overallAverageMidtermScore = validMidtermScoresCount > 0 ? (totalMidtermScoreSum / validMidtermScoresCount).toFixed(2) : 'N/A';
    const overallMidtermPassPercentage = (totalPassCount + totalFailCount) > 0 ? ((totalPassCount / (totalPassCount + totalFailCount)) * 100).toFixed(0) : 'N/A';

    // Calculate Overall Midterm SD
    let overallMidtermSD = 'N/A';
    if (validMidtermScoresCount > 0) {
        const avgMidterm = totalMidtermScoreSum / validMidtermScoresCount;
        const sumOfSquares = allMidtermScores.reduce((sum, val) => sum + Math.pow(val - avgMidterm, 2), 0);
        overallMidtermSD = Math.sqrt(sumOfSquares / validMidtermScoresCount).toFixed(2);
    }

    const completionPercentage = totalTrackableAssignments > 0
        ? ((totalSubmittedAssignments / totalTrackableAssignments) * 100).toFixed(0)
        : 0;

    const finalHighestScore = highestScore === -Infinity ? 'N/A' : highestScore;
    const finalLowestScore = lowestScore === Infinity ? 'N/A' : lowestScore;
    const finalHighestMidtermScore = highestMidtermScore === -Infinity ? 'N/A' : highestMidtermScore;
    const finalLowestMidtermScore = lowestMidtermScore === Infinity ? 'N/A' : lowestMidtermScore;

    return {
        totalStudents,
        averageScore: overallAverageScore,
        gradeDistribution,
        completionPercentage,
        highestScore: finalHighestScore,
        lowestScore: finalLowestScore,
        averageMidtermScore: overallAverageMidtermScore,
        midtermPassPercentage: overallMidtermPassPercentage,
        highestMidtermScore: finalHighestMidtermScore,
        lowestMidtermScore: finalLowestMidtermScore,
        midtermSD: overallMidtermSD,
        midtermPassCount: totalPassCount,
        midtermFailCount: totalFailCount,
        studentsWithMissing,
        studentsWithNoMissing,
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
    const gradeOrder = ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'รอ', 'มส', 'N/A'];

    const labels = [];
    const data = [];
    const chartColors = [];
    const chartBorderColors = [];

    gradeOrder.forEach(grade => {
        if (gradeDistribution[grade] !== undefined && gradeDistribution[grade] > 0) {
            labels.push(`เกรด ${grade}`);
            data.push(gradeDistribution[grade]);
            const theme = GRADE_THEME[grade] || GRADE_THEME['N/A'];
            chartColors.push(theme.chart);
            chartBorderColors.push(theme.border);
        }
    });

    const isDarkMode = document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(173, 173, 173, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937'; // gray-200 for dark, gray-800 for light

    // Destroy previous chart instance if it exists to prevent conflicts
    if (Chart.getChart(ctx)) {
        Chart.getChart(ctx).destroy();
    }

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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += `${context.parsed.y} คน`;
                            }
                            return label;
                        }
                    }
                }
            },
            // Disable click events on the chart bars as per the new design with summary cards.
            onClick: null,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true, text: 'จำนวนนักเรียน (คน)', color: textColor,
                        font: { family: "'Kanit', sans-serif", weight: '600' }
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
                },
            },
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
        },
    });
}

/**
 * Filters grade distribution by room using pre-computed summary data and re-renders the chart.
 * @param {string} selectedRoom - The room to filter by, or 'all'.
 */
function updateAndRenderGradeChart(selectedRoom) {
    if (!summaryDataStore) return;

    const chartTitleEl = document.getElementById('grade-chart-title');
    if (chartTitleEl) {
        chartTitleEl.textContent = selectedRoom === 'all'
            ? 'การกระจายของเกรดนักเรียนทั้งหมด'
            : `การกระจายของเกรด (ห้อง ${selectedRoom})`;
    }

    let gradeDistribution;
    if (selectedRoom === 'all') {
        gradeDistribution = summaryDataStore.gradeDistribution || {};
    } else {
        const roomData = summaryDataStore.summaryByRoom?.[selectedRoom];
        gradeDistribution = roomData?.gradeDistribution || {};
    }

    createGradeDistributionChart(gradeDistribution);
}

/**
 * Creates and displays a modal with a filterable, sortable list of students.
 * @param {string} modalIdentifier - A unique string for the modal ID (e.g., 'grade-4', 'missing-work').
 * @param {string} title - The title to display in the modal header.
 * @param {Array<object>} students - The list of students to display.
 */
function createStudentListModal(modalIdentifier, title, students) {
    const modalId = `student-list-modal-${modalIdentifier}`;

    // Remove old modal if it exists to prevent duplicates
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Get unique rooms for the filter dropdown
    const rooms = [...new Set(students.map(s => s[DATA_KEYS.ROOM]).filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    let roomOptionsHtml = `<option value="all">ทุกห้อง</option>`;
    rooms.forEach(room => {
        roomOptionsHtml += `<option value="${room}">ห้อง ${room}</option>`;
    });

    const modalContentContainerId = `student-list-content-container-${modalIdentifier}`;

    const controlsHtml = `
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">เรียงตาม:</span>
                <button data-sort-key="room" data-sort-label="ห้อง" class="sort-btn text-sm font-semibold py-1.5 px-3 rounded-full transition-colors duration-200 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">ห้อง</button>                
                <button data-sort-key="name" data-sort-label="ชื่อ" class="sort-btn text-sm font-semibold py-1.5 px-3 rounded-full transition-colors duration-200 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">ชื่อ</button>
                <button data-sort-key="score" data-sort-label="คะแนน" class="sort-btn text-sm font-semibold py-1.5 px-3 rounded-full transition-colors duration-200 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">คะแนน</button>
                <button data-sort-key="missing" data-sort-label="งานค้างส่ง" class="sort-btn text-sm font-semibold py-1.5 px-3 rounded-full transition-colors duration-200 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">งานค้างส่ง</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                    </div>
                    <input type="text" id="modal-search-input-${modalIdentifier}" placeholder="ค้นหาจากชื่อ หรือรหัสนักเรียน..." class="w-full p-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                </div>
                <div class="relative">
                    <select id="modal-room-filter-${modalIdentifier}" class="appearance-none w-full p-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer">
                        ${roomOptionsHtml}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></div>
                </div>
            </div>
        </div>
    `;

    const modalHtml = `
        <div id="${modalId}" class="modal fixed inset-0 flex items-center justify-center z-[9999] hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title-${modalId}">
            <div data-modal-overlay class="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm" aria-hidden="true"></div>
            <div class="modal-container relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="modal-title-${modalId}" class="text-xl font-bold text-gray-900 dark:text-white font-kanit">${title}</h2>
                    <button data-modal-close class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" aria-label="Close modal">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                ${controlsHtml}
                <div id="${modalContentContainerId}" class="p-4 sm:p-6 flex-grow overflow-y-auto modern-scrollbar">
                    <!-- Student cards will be rendered here -->
                </div>
        </div>
    `;

    document.getElementById('modals-placeholder').insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById(modalId);
    const contentElement = document.getElementById(modalContentContainerId);
    const sortButtons = modalElement.querySelectorAll('.sort-btn');
    const searchInput = document.getElementById(`modal-search-input-${modalIdentifier}`);
    const roomFilterSelect = document.getElementById(`modal-room-filter-${modalIdentifier}`);

    let currentSort = { key: 'name', direction: 'asc' };
    let currentFilter = '';
    let currentRoomFilter = 'all';

    const filterAndSortAndRender = () => {
        const filteredStudents = students.filter(student => {
            const roomMatch = currentRoomFilter === 'all' || String(student[DATA_KEYS.ROOM]) === currentRoomFilter;
            if (!roomMatch) return false;

            if (!currentFilter) {
                return true; // Pass room filter and no text filter
            }

            const query = currentFilter.toLowerCase();
            const nameMatch = student[DATA_KEYS.NAME] && student[DATA_KEYS.NAME].toLowerCase().includes(query);
            const idMatch = student[DATA_KEYS.ID] && student[DATA_KEYS.ID].toLowerCase().includes(query);
            return nameMatch || idMatch;
        });

        const sortedStudents = [...filteredStudents].sort((a, b) => {
            const completionA = calculateStudentCompletion(a);
            const completionB = calculateStudentCompletion(b);
            let valA, valB;
            switch (currentSort.key) {
                case 'name': {
                    const nameA = a[DATA_KEYS.NAME] || '';
                    const nameB = b[DATA_KEYS.NAME] || '';
                    return currentSort.direction === 'asc' ? nameA.localeCompare(nameB, 'th') : nameB.localeCompare(nameA, 'th');
                }
                case 'room': {
                    const roomA = String(a[DATA_KEYS.ROOM] || '999'); // Treat missing rooms as last
                    const roomB = String(b[DATA_KEYS.ROOM] || '999');
                    return currentSort.direction === 'asc' ? roomA.localeCompare(roomB, undefined, { numeric: true }) : roomB.localeCompare(roomA, undefined, { numeric: true });
                }
                case 'score': valA = a[DATA_KEYS.TOTAL_SCORE] ?? -1; valB = b[DATA_KEYS.TOTAL_SCORE] ?? -1; return currentSort.direction === 'asc' ? valA - valB : valB - valA;
                case 'missing': valA = completionA.missing; valB = completionB.missing; return currentSort.direction === 'asc' ? valA - valB : valB - valA;
                default: return 0;
            }
        });

        renderStudentSearchResultCards(sortedStudents, contentElement, { cardType: 'link', basePath: './' });

        sortButtons.forEach(btn => {
            const key = btn.dataset.sortKey;
            const label = btn.dataset.sortLabel;
            if (key === currentSort.key) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                btn.innerHTML = `${label} <span class="ml-1">${currentSort.direction === 'asc' ? '▲' : '▼'}</span>`;
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                btn.textContent = label;
            }
        });
    };

    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sortKey = button.dataset.sortKey;
            if (currentSort.key === sortKey) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = sortKey;
                currentSort.direction = (sortKey === 'name' || sortKey === 'room') ? 'asc' : 'desc';
            }
            filterAndSortAndRender();
        });
    });

    searchInput.addEventListener('input', () => {
        currentFilter = searchInput.value;
        filterAndSortAndRender();
    });

    roomFilterSelect.addEventListener('change', () => {
        currentRoomFilter = roomFilterSelect.value;
        filterAndSortAndRender();
    });

    filterAndSortAndRender();
    new ModalHandler(modalId).open();
}

/**
 * A generic function to get a Tailwind CSS text color class based on a value and a set of thresholds.
 * @param {number} value - The value to evaluate.
 * @param {Array<{limit: number, colorClass: string}>} thresholds - An array of threshold objects, sorted from highest to lowest limit.
 * @returns {string} The Tailwind CSS class string.
 */
function getDynamicTextColor(value, thresholds) {
    if (isNaN(value)) return 'text-gray-500 dark:text-gray-400';
    for (const { limit, colorClass } of thresholds) {
        if (value >= limit) {
            return colorClass;
        }
    }
    return 'text-red-500 dark:text-red-400';
}

const SCORE_THRESHOLDS = [
    { limit: 80, colorClass: 'text-teal-500 dark:text-teal-400' },
    { limit: 70, colorClass: 'text-sky-500 dark:text-sky-400' },
    { limit: 60, colorClass: 'text-green-500 dark:text-green-400' },
    { limit: 50, colorClass: 'text-amber-500 dark:text-amber-400' },
];

// Thresholds for Term 2 Midterm average score (out of 40)
const MIDTERM_TERM2_THRESHOLDS = [
    { limit: 32, colorClass: 'text-teal-500 dark:text-teal-400' },    // >= 80%
    { limit: 28, colorClass: 'text-sky-500 dark:text-sky-400' },      // >= 70%
    { limit: 24, colorClass: 'text-green-500 dark:text-green-400' },  // >= 60%
    { limit: 20, colorClass: 'text-amber-500 dark:text-amber-400' },  // >= 50%
];

const COMPLETION_THRESHOLDS = [
    { limit: 90, colorClass: 'text-teal-500 dark:text-teal-400' },
    { limit: 75, colorClass: 'text-sky-500 dark:text-sky-400' },
    { limit: 50, colorClass: 'text-amber-500 dark:text-amber-400' },
];

function getScoreTextColor(score) {
    return getDynamicTextColor(score, SCORE_THRESHOLDS);
}

// New function for Term 2 Midterm score color
function getMidtermTerm2ScoreTextColor(score) {
    return getDynamicTextColor(score, MIDTERM_TERM2_THRESHOLDS);
}

/**
 * Determines the Tailwind CSS text color class for a completion percentage.
 * @param {number} percentage - The completion percentage (0-100).
 * @returns {string} The Tailwind CSS class string for text color.
 */
function getCompletionTextColor(percentage) {
    return getDynamicTextColor(percentage, COMPLETION_THRESHOLDS);
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
    const sortIndicatorMidterm = document.getElementById('sort-indicator-midterm');
    if (!tbody || !summaryDataStore) return;

    // Sort the room keys based on the current sortConfig
    const sortedRooms = Object.keys(summaryDataStore.summaryByRoom).sort((a, b) => {
        if (roomSortConfig.key === 'room') {
            // Use localeCompare with numeric option for natural sorting (e.g., '2' before '10')
            return roomSortConfig.direction === 'asc'
                ? a.localeCompare(b, undefined, { numeric: true })
                : b.localeCompare(a, undefined, { numeric: true });
        } else { // Sort by other numeric keys
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

    if (displayMode === 'midterm') {
        tbody.innerHTML = sortedRooms.map(room => {
            const roomData = summaryDataStore.summaryByRoom[room];
            const avgMidterm = parseFloat(roomData.averageMidtermTerm2);
            const scoreTextColorClass = getMidtermTerm2ScoreTextColor(avgMidterm);
            const passPercentage = roomData.passCountTerm2 + roomData.failCountTerm2 > 0
                ? ((roomData.passCountTerm2 / (roomData.passCountTerm2 + roomData.failCountTerm2)) * 100).toFixed(0)
                : 'N/A';
            const passBarColorClass = passPercentage >= 80 ? 'bg-teal-500' :
                passPercentage >= 60 ? 'bg-sky-500' :
                    passPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500';

            return `
                <tr data-room="${room}" class="border-b dark:border-gray-700 last:border-b-0">
                    <td class="px-4 py-3 align-middle">
                        <div class="font-bold text-lg text-gray-900 dark:text-white">ห้อง ${room}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${roomData.studentCount} คน</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${scoreTextColorClass}">${roomData.averageMidtermTerm2}</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl text-gray-800 dark:text-gray-100">${roomData.midtermSD || 'N/A'}</div>
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="font-semibold text-gray-600 dark:text-gray-300">ผ่าน ${passPercentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="${passBarColorClass} h-2.5 rounded-full" style="width: ${passPercentage}%"></div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="text-sm"><span class="font-bold text-green-500">${roomData.passCountTerm2}</span> ผ่าน / <span class="font-bold text-red-500">${roomData.failCountTerm2}</span> ไม่ผ่าน</div>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        // Generate and inject the table rows for 'overall' mode
        tbody.innerHTML = sortedRooms.map(room => {
            const roomData = summaryDataStore.summaryByRoom[room];

            const avgScore = parseFloat(roomData.averageScore);
            const scoreTextColorClass = getScoreTextColor(avgScore);

            const completionPercentage = parseFloat(roomData.completionPercentage);
            const completionTextColorClass = getCompletionTextColor(completionPercentage);
            const completionBarColorClass = completionPercentage >= 90 ? 'bg-teal-500' :
                completionPercentage >= 75 ? 'bg-sky-500' :
                    completionPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500';

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
                <tr data-room="${room}" class="border-b dark:border-gray-700 last:border-b-0">
                    <td class="px-4 py-3 align-middle">
                        <div class="font-bold text-lg text-gray-900 dark:text-white">ห้อง ${room}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${roomData.studentCount} คน</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${scoreTextColorClass}">${roomData.averageScore}</div>
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <div class="flex items-center justify-between text-xs mb-1">
                            
                            <span class="font-semibold ${completionTextColorClass}">${roomData.completionPercentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="${completionBarColorClass} h-2.5 rounded-full" style="width: ${roomData.completionPercentage}%"></div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${gradeColorClass}">${roomData.averageGrade}</div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Attach click listeners to rows to open detailed rendering (only in midterm mode)
    tbody.querySelectorAll('tr[data-room]').forEach(row => {
        if (displayMode === 'midterm') {
            row.style.cursor = 'pointer';
            row.classList.add('hover:bg-gray-50', 'dark:hover:bg-gray-700/30', 'transition-colors');
            row.addEventListener('click', () => {
                const room = row.getAttribute('data-room');
                selectedRoomForDetails = room;
                renderStudentTableForRoom(room, currentStudentScores);
            });
        } else {
            row.style.cursor = 'default';
        }
    });

    // Update the sort indicator icons
    const downArrow = `<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
    const upArrow = `<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>`;
    const sortArrow = roomSortConfig.direction === 'desc' ? downArrow : upArrow;

    // Clear indicators safely (only if they exist in the current DOM)
    if (sortIndicatorRoom) sortIndicatorRoom.innerHTML = '';
    if (sortIndicatorScore) sortIndicatorScore.innerHTML = '';
    if (sortIndicatorGrade) sortIndicatorGrade.innerHTML = '';
    if (sortIndicatorCompletion) sortIndicatorCompletion.innerHTML = '';
    if (sortIndicatorMidterm) sortIndicatorMidterm.innerHTML = '';

    // Set the indicator on the active column
    if (roomSortConfig.key === 'room' && sortIndicatorRoom) {
        sortIndicatorRoom.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'averageScore' && sortIndicatorScore) {
        sortIndicatorScore.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'averageGrade' && sortIndicatorGrade) {
        sortIndicatorGrade.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'completionPercentage' && sortIndicatorCompletion) {
        sortIndicatorCompletion.innerHTML = sortArrow;
    } else if (roomSortConfig.key === 'averageMidtermTerm2' && sortIndicatorMidterm) {
        sortIndicatorMidterm.innerHTML = sortArrow;
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
    const sortMidtermBtn = document.getElementById('sort-avg-midterm-btn');

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

    if (sortMidtermBtn) {
        sortMidtermBtn.addEventListener('click', () => {
            if (roomSortConfig.key === 'averageMidtermTerm2') {
                roomSortConfig.direction = roomSortConfig.direction === 'desc' ? 'asc' : 'desc';
            } else {
                roomSortConfig.key = 'averageMidtermTerm2';
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
function renderSummary(summaryData, studentScores, lastUpdatedTimestamp) {
    const container = document.getElementById('summary-container');
    if (!container) return;

    // Cache studentScores globally
    currentStudentScores = studentScores;

    const lastUpdatedDate = new Date(lastUpdatedTimestamp);
    const formattedDate = lastUpdatedDate.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
    });

    // Get unique rooms for the filter dropdown
    const rooms = summaryData.summaryByRoom ? Object.keys(summaryData.summaryByRoom).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
    const roomOptions = `<option value="all">นักเรียนทั้งหมด</option>` + rooms.map(r => `<option value="${r}">ห้อง ${r}</option>`).join('');

    const overallTableHeader = `
        <tr>
            <th scope="col" class="px-4 py-3 text-left">
                <button id="sort-room-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>ห้องเรียน</span>
                    <span id="sort-indicator-room" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-score-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>คะแนนรวมเฉลี่ย</span>
                    <span id="sort-indicator-score" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center w-1/4">
                <button id="sort-completion-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>การส่งงาน</span>
                    <span id="sort-indicator-completion" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-grade-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>เกรดเฉลี่ย</span>
                    <span id="sort-indicator-grade" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
        </tr>
    `;

    const midtermTableHeader = `
        <tr>
            <th scope="col" class="px-4 py-3 text-left">
                <button id="sort-room-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>ห้องเรียน</span>
                    <span id="sort-indicator-room" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-midterm-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>คะแนนกลางภาคเฉลี่ย</span>
                    <span id="sort-indicator-midterm" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <span>ส่วนเบี่ยงเบนมาตรฐาน (SD)</span>
            </th>
            <th scope="col" class="px-4 py-3 text-center w-1/4">
                <span>อัตราการผ่าน</span>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <span>จำนวนคน (ผ่าน/ไม่ผ่าน)</span>
            </th>
        </tr>
    `;

    const tableHeaderHtml = (displayMode === 'midterm') ? midtermTableHeader : overallTableHeader;

    const summaryHtml = `
        <!-- Student Search Section -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4">อัปเดตข้อมูลล่าสุด: ${formattedDate} น.</div>

        <!-- Student Search Banner -->
        <div class="mb-8 p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="p-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div class="text-left">
                    <h4 class="font-bold text-gray-800 dark:text-white font-kanit">ต้องการค้นหาคะแนนรายบุคคล?</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ค้นหาผลคะแนนรายวิชาด้วยรหัสประจำตัวนักเรียน 5 หลัก</p>
                </div>
            </div>
            <a href="./scores.html" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-blue-500/20 flex items-center justify-center gap-2 transform active:scale-95 shrink-0">
                <span>ไปที่หน้าค้นหาคะแนน</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
        </div>

        <!-- Mode Toggle Segmented Control -->
        <div class="flex justify-center mb-8">
            <div class="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                <button id="btn-mode-overall" class="px-5 py-2 rounded-lg font-kanit font-bold text-sm transition-all duration-200 flex items-center gap-2 ${displayMode === 'overall' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <span>สรุปผลรวม</span>
                </button>
                <button id="btn-mode-midterm" class="px-5 py-2 rounded-lg font-kanit font-bold text-sm transition-all duration-200 flex items-center gap-2 ${displayMode === 'midterm' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>สถิติกลางภาค</span>
                </button>
            </div>
        </div>

        <!-- Overall Stats Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <!-- Student Counts Box -->
            <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col col-span-1">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">ภาพรวมนักเรียน</h3>
                <div class="grid grid-cols-3 gap-4 flex-grow">
                    <div id="card-all-students" class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                        <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 font-kanit">${summaryData.totalStudents}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">นักเรียนทั้งหมด</div>
                    </div>
                    <div id="card-complete-students" class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                        <div class="text-4xl font-bold text-green-600 dark:text-green-400 font-kanit">${summaryData.studentsWithNoMissing}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">ส่งงานครบ</div>
                    </div>
                    <div id="card-missing-students" class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                        <div class="text-4xl font-bold text-red-600 dark:text-red-400 font-kanit">${summaryData.studentsWithMissing}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">ยังส่งงานไม่ครบ</div>
                    </div>
                </div>
            </div>

            <!-- Other Stats Box -->
            <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 col-span-2">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">${displayMode === 'midterm' ? 'ภาพรวมคะแนนสอบกลางภาค' : 'ภาพรวมคะแนนและงาน'}</h3>
                <div class="grid ${displayMode === 'midterm' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-4">
                    ${(displayMode === 'midterm') ? `
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.averageMidtermScore}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนเฉลี่ย</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.midtermSD}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">ส่วนเบี่ยงเบนมาตรฐาน (SD)</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400 font-kanit">${summaryData.highestMidtermScore}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนสูงสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600 dark:text-red-400 font-kanit">${summaryData.lowestMidtermScore}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนต่ำสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-teal-600 dark:text-teal-400 font-kanit">${summaryData.midtermPassCount} คน</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">จำนวนคนผ่าน (>= 12)</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 font-kanit">${summaryData.midtermFailCount} คน</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">จำนวนคนตก (< 12)</div>
                        </div>
                    ` : `
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.averageScore}</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนเฉลี่ย</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${summaryData.completionPercentage}%</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">การส่งงาน</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400 font-kanit">${summaryData.highestScore}</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนสูงสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600 dark:text-red-400 font-kanit">${summaryData.lowestScore}</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนต่ำสุด</div>
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- Grade Distribution Chart -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 ${displayMode === 'midterm' ? 'hidden' : ''}">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 id="grade-chart-title" class="text-lg font-bold text-gray-800 dark:text-white font-kanit">การกระจายของเกรด</h3>
                <div class="relative">
                    <select id="grade-chart-room-filter" class="appearance-none mt-1 p-2 pr-10 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm cursor-pointer">
                        ${roomOptions}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-hover:text-blue-500 transition-colors"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></div>
                </div>
            </div>
            <div class="relative h-96">
                <canvas id="grade-chart"></canvas>
            </div>
            <!-- Grade Summary Chips Section (moved inside) -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">สรุปตามเกรด</h3>
                <div id="grade-summary-cards-container" class="flex flex-wrap gap-3 items-center">
                    <!-- Grade summary cards will be injected here by the script -->
                </div>
            </div>
        </div>

        <!-- Per-Room Summary Table -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden">
            <h3 class="p-4 text-lg font-bold text-gray-800 dark:text-white font-kanit border-b border-gray-200 dark:border-gray-700">สรุปรายห้องเรียน</h3>
            <div class="overflow-x-auto modern-scrollbar">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-400 uppercase">
                        ${tableHeaderHtml}
                    </thead>
                    <tbody id="room-summary-tbody">
                        <!-- Table rows will be rendered by updateRoomSummaryTable() -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Container for detailed student table per room -->
        <div id="room-detail-container" class="mt-8">
            <!-- Detailed table will be rendered here -->
        </div>
    `;

    // Clear loading spinner and render the new content
    container.innerHTML = summaryHtml;

    // Perform the initial render of the sortable table
    updateRoomSummaryTable();

    const setupEventListeners = (summary, scores, lastUpdated) => {
        initializeTableSorting();

        // --- Toggle Mode Event Listeners ---
        const btnOverall = document.getElementById('btn-mode-overall');
        const btnMidterm = document.getElementById('btn-mode-midterm');
        if (btnOverall && btnMidterm) {
            btnOverall.addEventListener('click', () => {
                if (displayMode !== 'overall') {
                    displayMode = 'overall';
                    selectedRoomForDetails = null;
                    renderSummary(summary, scores, lastUpdated);
                }
            });
            btnMidterm.addEventListener('click', () => {
                if (displayMode !== 'midterm') {
                    displayMode = 'midterm';
                    renderSummary(summary, scores, lastUpdated);
                }
            });
        }

        // --- Grade Chart Filtering Logic ---
        const gradeChartFilter = document.getElementById('grade-chart-room-filter');
        if (gradeChartFilter) {
            gradeChartFilter.addEventListener('change', (e) => {
                updateAndRenderGradeChart(e.target.value);
            });
        }
        // Initial render of the chart for all students
        if (displayMode !== 'midterm') {
            updateAndRenderGradeChart('all');
        }
    };

    setupEventListeners(summaryData, studentScores, lastUpdatedTimestamp);
}

/**
 * Main function to initialize the summary page.
 */
export async function initializeSummaryPage() {
    try {
        // Initial semester from global state
        currentSemester = getCurrentSemester();

        // Update course code display
        const courseCode = getCurrentCourseCode();
        const courseDisplay = document.getElementById('course-code-display');
        const titleCourseDisplay = document.getElementById('title-course-code');
        if (courseDisplay) courseDisplay.textContent = courseCode;
        if (titleCourseDisplay) titleCourseDisplay.textContent = courseCode;

        // ฟังก์ชันสำหรับ Render หน้าเว็บตามภาคเรียนที่เลือก
        const renderSemester = async (semester) => {
            currentSemester = semester;
            const container = document.getElementById('summary-container');
            if (!container) return;

            // Update selector to match state
            const semesterSelector = document.getElementById('semester-selector');
            if (semesterSelector) semesterSelector.value = semester;

            // This key is used to remember the user's choice within the same browser tab session.
            const SESSION_KEY = 'summary_session_semester_selected';


            const validSemesters = ['1/2568', '2/2568', '1/2569'];
            if (validSemesters.includes(semester)) {
                sessionStorage.setItem(SESSION_KEY, semester);

                // Show loading spinner
                container.innerHTML = `
                    <div id="loading-spinner" class="text-center py-16">
                        <svg class="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <p class="mt-4 text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูลสรุป...</p>
                    </div>
                `;

                let loaded = false;
                try {
                    const summaryData = await getSemesterSummary(semester);
                    if (summaryData) {
                        try {
                            summaryDataStore = summaryData;
                            renderSummary(summaryDataStore, [], summaryData.lastUpdated);
                            loaded = true;
                        } catch (err) {
                            console.error("Error during rendering:", err);
                            container.innerHTML = `
                                <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                                    <div class="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-900 max-w-2xl text-left">
                                        <h3 class="text-xl font-bold text-red-800 dark:text-red-400 font-kanit mb-4">เกิดข้อผิดพลาดในการแสดงผลข้อมูล</h3>
                                        <pre class="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap overflow-auto max-h-64 font-mono">${err.stack || err.message}</pre>
                                    </div>
                                </div>
                            `;
                            return;
                        }
                    }
                } catch (e) {
                    console.warn(`Semester ${semester} summary data not found or error loading:`, e);
                }

                if (!loaded) {
                    container.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                            <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
                                <div class="bg-blue-50 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white font-kanit mb-2">ยังไม่เปิดภาคเรียน</h3>
                                <p class="text-gray-600 dark:text-gray-400">ข้อมูลสำหรับภาคเรียนที่ ${semester} จะแสดงที่นี่เมื่อเริ่มภาคเรียน</p>
                            </div>
                        </div>
                    `;
                }
            } else {
                // Return to original empty state
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[50vh]">
                        <div class="bg-blue-900/40 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-400 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 class="text-3xl font-bold text-gray-800 dark:text-white font-kanit mb-4 tracking-wide">เริ่มต้นดูคะแนน</h3>
                        <p class="text-gray-500 dark:text-gray-400 font-sarabun text-lg max-w-md leading-relaxed">กรุณาเลือกภาคเรียนที่ต้องการจากเมนูด้านบน<br/>เพื่อแสดงข้อมูลสรุปและสถิติคะแนน</p>
                    </div>
                `;
                // Hide the toggle when no semester is selected
                const displayModeToggle = document.getElementById('display-mode-toggle');
                const toggleContainer = displayModeToggle?.closest('div.w-full');
                if (toggleContainer) {
                    toggleContainer.classList.add('hidden');
                }
            }
        };

        // Use sessionStorage to check if a semester was explicitly chosen in THIS session/tab.
        // This allows a "Landing State" (Select Semester first) on new visits,
        // but keeps the choice while the user is working.
        const SESSION_KEY = 'summary_session_semester_selected';

        // เริ่มต้นแสดงผล: แสดงหน้าว่างเสมอเมื่อเปิดหน้าเว็บ
        const semesterSelector = document.getElementById('semester-selector');
        if (semesterSelector) {
            semesterSelector.value = '';
            semesterSelector.addEventListener('change', (e) => {
                const newSemester = e.target.value;
                if (newSemester) {
                    setCurrentSemester(newSemester);
                    renderSemester(newSemester);
                } else {
                    renderSemester('');
                }
            });
        }

        renderSemester('');

    } catch (error) {
        console.error("Failed to initialize summary page:", error);
        const container = document.getElementById('summary-container');
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                    <div class="bg-red-50 dark:bg-red-900/20 p-5 rounded-full mb-6 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl md:text-3xl font-bold font-kanit text-gray-800 dark:text-white mb-3">ขออภัย ไม่สามารถโหลดข้อมูลได้</h3>
                    <p class="text-gray-600 dark:text-gray-300 max-w-md mb-8 text-base md:text-lg leading-relaxed">
                        ระบบไม่สามารถดึงข้อมูลสรุปคะแนนได้ในขณะนี้<br>อาจเกิดจากปัญหาการเชื่อมต่อหรือเซิร์ฟเวอร์ขัดข้อง
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                        <button onclick="window.location.reload()" class="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            ลองใหม่อีกครั้ง
                        </button>
                        <a href="./index.html" class="inline-flex items-center justify-center px-6 py-3.5 border border-gray-200 dark:border-gray-700 text-base font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            กลับสู่หน้าหลัก
                        </a>
                    </div>
                </div>`;
        }
    }
}

/**
 * Creates and appends grade summary cards to a container.
 * @param {object} gradeDistribution - An object with grades as keys and counts as values for the current scope.
 * @param {Array<object>} studentsInScope - The list of students for the current scope (all or a specific room).
 */
function createGradeSummaryCards(gradeDistribution, studentsInScope) {
    const container = document.getElementById('grade-summary-cards-container');
    if (!container) {
        return; // Silently fail if container is not on the page
    }

    container.innerHTML = ''; // Clear existing cards

    const gradeOrder = ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'รอ', 'มส', 'N/A'];

    gradeOrder.forEach(grade => {
        const gradeCount = gradeDistribution[grade] || 0;

        if (gradeCount > 0) {
            const filteredStudents = studentsInScope.filter(student => {
                if (grade === 'N/A') {
                    return student[DATA_KEYS.GRADE] == null || String(student[DATA_KEYS.GRADE]) === 'N/A';
                }
                return String(student[DATA_KEYS.GRADE]) === grade;
            });

            const chip = document.createElement('div');
            const theme = GRADE_THEME[grade] || GRADE_THEME['N/A'];
            // Reverted to a single-line chip with a circular icon for the grade number for a clean, iconic look.
            // Made the chip even more compact by reducing padding, font size, and removing the "คน" unit.
            chip.className = `inline-flex items-center gap-x-2 py-1.5 px-3 rounded-full text-xs font-medium border cursor-pointer transition-transform transform hover:scale-105 ${theme.chip}`;
            chip.innerHTML = `<span class="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/80 dark:bg-black/30 font-kanit font-bold text-sm">${grade}</span><span class="font-semibold">${gradeCount}</span>`;

            chip.addEventListener('click', () => {
                const title = `นักเรียนที่ได้เกรด ${grade} (${filteredStudents.length} คน)`;
                const identifier = `grade-${String(grade).replace(/[.\s]/g, '-')}`;
                createStudentListModal(identifier, title, filteredStudents);
            });
            container.appendChild(chip);
        }
    });
}


/**
 * Initializes the student search functionality.
 * @param {Array<object>} studentScores The array of all student score objects.
 */
function initializeStudentSearch(studentScores) {
    const searchInput = document.getElementById('student-search-input');
    const searchBtn = document.getElementById('student-search-btn');
    const clearBtn = document.getElementById('student-search-clear-btn');
    const resultsContainer = document.getElementById('student-search-results');

    if (!searchInput || !resultsContainer || !searchBtn || !clearBtn) {
        // console.error('Student search elements not found.'); // Comment out to reduce console noise if elements are optional
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
        const idMatch = studentScores.find(s => s[DATA_KEYS.ID].toLowerCase() === query);
        if (idMatch) {
            results = [idMatch];
        } else {
            // Priority 2: Exact Room match
            const roomMatches = studentScores.filter(s => s[DATA_KEYS.ROOM] && String(s[DATA_KEYS.ROOM]).toLowerCase() === query);
            if (roomMatches.length > 0) {
                // Sort by ordinal number for room searches
                results = roomMatches.sort((a, b) => {
                    const ordinalA = parseInt(a[DATA_KEYS.ORDINAL], 10) || 999;
                    const ordinalB = parseInt(b[DATA_KEYS.ORDINAL], 10) || 999;
                    return ordinalA - ordinalB;
                });
            } else {
                // Priority 3: Partial Name match
                const nameMatches = studentScores.filter(student =>
                    student[DATA_KEYS.NAME] && student[DATA_KEYS.NAME].toLowerCase().includes(query)
                );
                // Sort by ID for name searches
                results = nameMatches.sort((a, b) => a[DATA_KEYS.ID].localeCompare(b[DATA_KEYS.ID]));
            }
        }

        // Configure display options based on semester
        const options = { cardType: 'link', basePath: './', isClickable: true };
        if (currentSemester === '2/2568') {
            const redColor = 'text-red-500 dark:text-red-400';
            options.customFields = [
                {
                    label: 'จำนวน Quiz',
                    key: 'จำนวน Quiz',
                    formatter: (value) => {
                        const defaultColor = 'text-purple-600 dark:text-purple-400';
                        return `<p class="font-bold text-base sm:text-lg ${defaultColor}">${value ?? '-'}</p>`;
                    }
                },
                {
                    label: 'ปลายภาค',
                    key: 'ปลายภาค',
                    formatter: (value) => {
                        const score = parseFloat(value);
                        const defaultColor = 'text-blue-600 dark:text-blue-400';
                        const colorClass = (!isNaN(score) && score < 15) ? redColor : defaultColor;
                        return `<p class="font-bold text-base sm:text-lg ${colorClass}">${value ?? '-'}</p>`;
                    }
                },
                {
                    label: 'คะแนนรวม',
                    key: 'คะแนนรวม',
                    formatter: (value) => {
                        const score = parseFloat(value);
                        const defaultColor = 'text-green-600 dark:text-green-400';
                        const colorClass = (!isNaN(score) && score < 50) ? redColor : defaultColor;
                        return `<p class="font-bold text-base sm:text-lg ${colorClass}">${value ?? '-'}</p>`;
                    }
                },
                {
                    label: 'เกรด',
                    key: 'เกรด',
                    formatter: (value) => {
                        const gradeNum = parseFloat(value);
                        let gradeColorClass = 'text-gray-700 dark:text-gray-200';
                        if (!isNaN(gradeNum)) {
                            if (gradeNum >= 4) gradeColorClass = 'text-teal-600 dark:text-teal-400';
                            else if (gradeNum >= 3) gradeColorClass = 'text-sky-600 dark:text-sky-400';
                            else if (gradeNum >= 2) gradeColorClass = 'text-amber-600 dark:text-amber-400';
                            else if (gradeNum >= 1) gradeColorClass = 'text-orange-600 dark:text-orange-400';
                            else gradeColorClass = redColor;
                        } else if (value && value !== '-' && value !== 'N/A') {
                            gradeColorClass = redColor; // For "ร", "มส", etc.
                        }
                        return `<p class="font-bold text-base sm:text-lg px-2 rounded-md ${gradeColorClass} bg-gray-100 dark:bg-gray-800">${value ?? 'N/A'}</p>`;
                    }
                }
            ];
            // Remove 'options.isClickable = false;' so they can click the card to go to the scores page
        }

        renderStudentSearchResultCards(results, resultsContainer, options);
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

/**
 * Extracts the first name from a full Thai name string.
 * @param {string} fullName The full name (e.g., "นายนันทิวรรธน์ ปิ่นทอง").
 * @returns {string} The extracted first name.
 */
export function getFirstName(fullName) {
    if (!fullName) return '';
    const titles = ['นาย', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'];
    let nameWithoutTitle = fullName.trim();
    for (const title of titles) {
        if (nameWithoutTitle.startsWith(title)) {
            nameWithoutTitle = nameWithoutTitle.substring(title.length);
            break;
        }
    }
    const parts = nameWithoutTitle.trim().split(' ');
    return parts[0] || fullName; // Return the first part, or the original name if split fails
}

/**
 * Renders a read-only table of students for a specific room.
 * @param {string} room The room number to render.
 * @param {Array<object>} studentScores The full list of student scores.
 */
function renderStudentTableForRoom(room, studentScores) {
    const container = document.getElementById('room-detail-container');
    if (!container) return;

    if (!room || displayMode !== 'midterm') {
        container.innerHTML = '';
        return;
    }

    const studentsInRoom = studentScores.filter(s => String(s[DATA_KEYS.ROOM]) === room);

    if (studentsInRoom.length === 0) {
        container.innerHTML = ''; // Clear if no students
        return;
    }

    // --- Calculate Room-Specific Statistics ---
    const roomStudentsCount = studentsInRoom.length;

    // Midterm score stats
    const midtermScores = studentsInRoom.map(s => parseFloat(s['คะแนนกลางภาค'])).filter(v => !isNaN(v));
    const roomAvgMidterm = midtermScores.length > 0 ? (midtermScores.reduce((a, b) => a + b, 0) / midtermScores.length).toFixed(2) : 'N/A';

    let roomSDMidterm = 'N/A';
    if (midtermScores.length > 0) {
        const avg = midtermScores.reduce((a, b) => a + b, 0) / midtermScores.length;
        const sumSquares = midtermScores.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0);
        roomSDMidterm = Math.sqrt(sumSquares / midtermScores.length).toFixed(2);
    }

    const roomMaxMidterm = midtermScores.length > 0 ? Math.max(...midtermScores) : 'N/A';
    const roomMinMidterm = midtermScores.length > 0 ? Math.min(...midtermScores) : 'N/A';
    const roomPassMidterm = midtermScores.filter(v => v >= 12).length;
    const roomFailMidterm = midtermScores.filter(v => v < 12).length;
    const roomPassPercentage = midtermScores.length > 0 ? ((roomPassMidterm / midtermScores.length) * 100).toFixed(0) : '0';

    const statsHtml = `
        <div class="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white font-kanit">สถิติการสอบกลางภาค ห้อง ${room}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">จำนวนนักเรียนที่เข้าสอบ: ${midtermScores.length} จาก ${roomStudentsCount} คน</p>
                </div>
                <button id="close-room-detail-btn" class="self-start sm:self-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-sm transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span>ปิดกล่องนี้</span>
                </button>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div class="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-blue-600 dark:text-blue-400 font-kanit">${roomAvgMidterm}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">คะแนนเฉลี่ย</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/40 rounded-xl text-center">
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${roomSDMidterm}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">ส่วนเบี่ยงเบนมาตรฐาน (SD)</div>
                </div>
                <div class="p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-green-600 dark:text-green-400 font-kanit">${roomMaxMidterm}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">คะแนนสูงสุด</div>
                </div>
                <div class="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-red-600 dark:text-red-400 font-kanit">${roomMinMidterm}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">คะแนนต่ำสุด</div>
                </div>
                <div class="p-3 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-teal-600 dark:text-teal-400 font-kanit">${roomPassMidterm} คน (${roomPassPercentage}%)</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">จำนวนคนผ่าน (>= 12)</div>
                </div>
                <div class="p-3 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-rose-600 dark:text-rose-400 font-kanit">${roomFailMidterm} คน</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">จำนวนคนตก (< 12)</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = statsHtml;

    // Bind event listeners
    const closeBtn = container.querySelector('#close-room-detail-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            selectedRoomForDetails = null;
            container.innerHTML = '';
        });
    }

    // Scroll to the newly created stats card deck
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Scroll to the newly created table
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** 
 * Handles exporting the current room's data to a CSV file.
 * @param {Array<object>} studentScores The full list of student scores.
 */
function handleExportCSV(studentScores) {
    const selectedRoom = selectedRoomForDetails;
    if (!selectedRoom) {
        alert('กรุณาเลือกห้องเรียนก่อนทำการ Export');
        return;
    }

    const studentsInRoom = studentScores.filter(s => String(s[DATA_KEYS.ROOM]) === selectedRoom).sort((a, b) => (parseInt(a[DATA_KEYS.ORDINAL], 10) || 999) - (parseInt(b[DATA_KEYS.ORDINAL], 10) || 999));
    if (studentsInRoom.length === 0) {
        alert('ไม่พบข้อมูลนักเรียนในห้องที่เลือก');
        return;
    }

    let exportHeaderMap = {};

    if (currentSemester === '2/2568') {
        exportHeaderMap = {
            [DATA_KEYS.ROOM]: 'ห้อง', [DATA_KEYS.ID]: 'เลขประจำตัว', [DATA_KEYS.ORDINAL]: 'เลขที่', [DATA_KEYS.NAME]: 'ชื่อ-นามสกุล',
            'บทที่ 6 [10]': 'บทที่ 6', 'บทที่ 7 [10]': 'บทที่ 7', 'กิจกรรม [5]': 'กิจกรรม',
            'ก่อนกลางภาค [25]': 'ก่อนกลางภาค', 'กลางภาค [20]': 'กลางภาค',
            'บทที่ 8 [10]': 'บทที่ 8', 'บทที่ 9 [5]': 'บทที่ 9', 'บทที่ 10 [10]': 'บทที่ 10',
            'หลังกลางภาค [25]': 'หลังกลางภาค', 'การซ่อมกลางภาค': 'การซ่อมกลางภาค', 'ก่อนปลายภาค [70]': 'ก่อนปลายภาค', 'ปลายภาค [30]': 'ปลายภาค',
            [DATA_KEYS.TOTAL_SCORE]: 'รวม', [DATA_KEYS.GRADE]: 'เกรด',
            'จำนวน Quiz': 'จำนวน Quiz',
            'คะแนนปลายภาค': 'คะแนนปลายภาค'
        };
    } else {
        exportHeaderMap = {
            [DATA_KEYS.ROOM]: 'ห้อง', [DATA_KEYS.ID]: 'เลขประจำตัว', [DATA_KEYS.ORDINAL]: 'เลขที่', [DATA_KEYS.NAME]: 'ชื่อ-นามสกุล',
            'บท 1 [10]': 'บทที่ 1', 'บท 2 [10]': 'บทที่ 2', 'บท 3 [5]': 'บทที่ 3',
            'ก่อนกลางภาค [25]': 'ก่อนกลางภาค', 'กลางภาค [20]': 'กลางภาค',
            'บท 4 [10]': 'บทที่ 4', 'นำเสนอ [5]': 'นำเสนอ', 'บท 5 [10]': 'บทที่ 5',
            'หลังกลางภาค [25]': 'หลังกลางภาค', 'ก่อนปลายภาค [70]': 'ก่อนปลายภาค', 'ปลายภาค [30]': 'ปลายภาค',
            [DATA_KEYS.TOTAL_SCORE]: 'รวม', [DATA_KEYS.GRADE]: 'เกรด'
        };
    }

    const exportKeys = Object.keys(exportHeaderMap);
    const csvHeaders = Object.values(exportHeaderMap);

    const rows = studentsInRoom.map(student => {
        return exportKeys.map(key => student[key] ?? '');
    });

    const escapeCsvCell = (cell) => {
        const strCell = String(cell ?? '');
        if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    };

    const csvContent = [
        csvHeaders.map(escapeCsvCell).join(','),
        ...rows.map(row => row.map(escapeCsvCell).join(','))
    ].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `scores-summary-room-${selectedRoom}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
