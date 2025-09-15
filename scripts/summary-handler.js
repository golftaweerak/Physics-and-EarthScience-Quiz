import { getStudentScores } from './data-manager.js';
import { ModalHandler } from './modal-handler.js';
import { renderStudentSearchResultCards, calculateStudentCompletion } from './student-card-renderer.js';
import { lastUpdated as scoresLastUpdated } from '../data/scores-data.js';
import { DATA_KEYS } from './constants.js'; // สมมติว่าสร้างไฟล์ constants.js

// Module-level state for summary data and sorting configuration
let summaryDataStore = null;
let roomSortConfig = {
    key: 'room', // 'room' or 'averageScore'
    direction: 'asc' // 'asc' or 'desc'
};
let selectedRoomForDetails = null;

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
    let validScoresCount = 0;
    const gradeDistribution = {};
    const summaryByRoom = {};

    let highestScore = -Infinity;
    let lowestScore = Infinity;

    // For overall completion percentage
    let totalTrackableAssignments = 0;
    let totalSubmittedAssignments = 0;
    // const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท']; // This is now defined inside calculateStudentCompletion
    let studentsWithNoMissing = 0, studentsWithMissing = 0;

    scores.forEach(student => {
        // Overall average score
        const totalScore = student[DATA_KEYS.TOTAL_SCORE];
        if (typeof totalScore === 'number') {
            totalScoreSum += totalScore;
            validScoresCount++;
            // Update highest and lowest scores
            if (totalScore > highestScore) {
                highestScore = totalScore;
            }
            if (totalScore < lowestScore) {
                lowestScore = totalScore;
            }
        }

        // Grade distribution
        const grade = student[DATA_KEYS.GRADE] ?? 'N/A';
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        const numericGrade = parseFloat(grade);

        // Per-room stats
        const room = student[DATA_KEYS.ROOM] || 'N/A';
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

        // Count students with no missing assignments (and have at least one trackable assignment)
        if (completion.missing > 0) {
            studentsWithMissing++;
        } else if (completion.total > 0) { // Implies missing is 0
            studentsWithNoMissing++;
        }
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

    const overallAverageScore = validScoresCount > 0 ? (totalScoreSum / validScoresCount).toFixed(2) : 0;

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
        studentsWithMissing,
        studentsWithNoMissing,
        summaryByRoom
    };
}

/**
 * Creates and renders the grade distribution bar chart.
 * @param {object} gradeDistribution - An object with grades as keys and counts as values.
 */
function createGradeDistributionChart(gradeDistribution, allStudentScores) {
    const ctx = document.getElementById('grade-chart')?.getContext('2d');
    if (!ctx) {
        console.error('Chart canvas element not found');
        return;
    }

    // Unregister the datalabels plugin if it was registered, to prevent errors.
    if (window.ChartDataLabels) {
        Chart.unregister(window.ChartDataLabels);
    }

    // Define a logical order for grades and a color palette that matches the site's theme.
    const gradeOrder = ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'N/A'];
    const backgroundColors = [
        'rgba(20, 184, 166, 0.7)', // teal-500
        'rgba(6, 182, 212, 0.7)', // cyan-500
        'rgba(14, 165, 233, 0.7)', // sky-500
        'rgba(250, 204, 21, 0.7)', // yellow-400
        'rgba(245, 158, 11, 0.7)', // amber-500
        'rgba(249, 115, 22, 0.7)', // orange-500
        'rgba(239, 68, 68, 0.7)', // red-500
        'rgba(185, 28, 28, 0.7)', // red-700
        'rgba(107, 114, 128, 0.7)'  // gray-500
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
            onClick: (event, elements) => {
                if (elements.length === 0) return;
                const chart = elements[0].chart;
                const elementIndex = elements[0].index;
                const gradeLabel = chart.data.labels[elementIndex].replace('เกรด ', '');

                // Get the currently selected room from the dropdown to ensure context is correct
                const roomFilterEl = document.getElementById('grade-chart-room-filter');
                const selectedRoom = roomFilterEl ? roomFilterEl.value : 'all';

                // Filter the master list of students by the currently selected room
                const studentsInScope = selectedRoom === 'all'
                    ? allStudentScores
                    : allStudentScores.filter(student => String(student.room) === selectedRoom);

                // Now, filter that group by the clicked grade
                let filteredStudents;
                if (gradeLabel === 'N/A') {
                    // Handles null, undefined, or the literal string 'N/A'
                    filteredStudents = studentsInScope.filter(student => (student['เกรด'] == null || String(student['เกรด']) === 'N/A'));
                } else {
                    const gradeToFindNum = parseFloat(gradeLabel);
                    if (!isNaN(gradeToFindNum)) {
                        // It's a numeric grade, use float comparison for safety
                        filteredStudents = studentsInScope.filter(student => {
                            const studentGrade = parseFloat(student['เกรด']);
                            return !isNaN(studentGrade) && Math.abs(studentGrade - gradeToFindNum) < 0.01;
                        });
                    } else {
                        // It's a non-numeric string grade like "รอ" or "มส". Use direct string comparison.
                        filteredStudents = studentsInScope.filter(student => String(student['เกรด']) === gradeLabel);
                    }
                }

                if (filteredStudents.length > 0) {
                    createGradeDetailModal(gradeLabel, filteredStudents);
                }
            },
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
 * Filters student scores by room, recalculates grade distribution, and re-renders the chart.
 * @param {string} selectedRoom - The room to filter by, or 'all'.
 * @param {Array<object>} allStudentScores - The complete list of all student scores.
 */
function updateAndRenderGradeChart(selectedRoom, allStudentScores) {
    const chartTitleEl = document.getElementById('grade-chart-title');
    if (chartTitleEl) {
        chartTitleEl.textContent = selectedRoom === 'all'
            ? 'การกระจายของเกรดนักเรียนทั้งหมด'
            : `การกระจายของเกรด (ห้อง ${selectedRoom})`;
    }

    const filteredScores = selectedRoom === 'all'
        ? allStudentScores
        : allStudentScores.filter(s => String(s.room) === selectedRoom);

    const gradeDistribution = filteredScores.reduce((acc, student) => {
        const grade = student['เกรด'] ?? 'N/A'; // Use ?? to correctly handle grade 0
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
    }, {});

    createGradeDistributionChart(gradeDistribution, allStudentScores);
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
    const rooms = [...new Set(students.map(s => s.room).filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
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
                    <select id="modal-room-filter-${modalIdentifier}" class="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none pr-8 bg-no-repeat" style="background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;">
                        ${roomOptionsHtml}
                    </select>
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
            const roomMatch = currentRoomFilter === 'all' || student.room === currentRoomFilter;
            if (!roomMatch) return false;

            if (!currentFilter) {
                return true; // Pass room filter and no text filter
            }

            const query = currentFilter.toLowerCase();
            const nameMatch = student.name && student.name.toLowerCase().includes(query);
            const idMatch = student.id && student.id.toLowerCase().includes(query);
            return nameMatch || idMatch;
        });

        const sortedStudents = [...filteredStudents].sort((a, b) => {
            const completionA = calculateStudentCompletion(a);
            const completionB = calculateStudentCompletion(b);
            let valA, valB;
            switch (currentSort.key) {
                case 'name': {
                    const nameA = a.name || '';
                    const nameB = b.name || '';
                    return currentSort.direction === 'asc' ? nameA.localeCompare(nameB, 'th') : nameB.localeCompare(nameA, 'th');
                }
                case 'room': {
                    const roomA = String(a.room || '999'); // Treat missing rooms as last
                    const roomB = String(b.room || '999');
                    return currentSort.direction === 'asc' ? roomA.localeCompare(roomB, undefined, { numeric: true }) : roomB.localeCompare(roomA, undefined, { numeric: true });
                }
                case 'score': valA = a['รวม [100]'] ?? -1; valB = b['รวม [100]'] ?? -1; return currentSort.direction === 'asc' ? valA - valB : valB - valA;
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

const COMPLETION_THRESHOLDS = [
    { limit: 90, colorClass: 'text-teal-500 dark:text-teal-400' },
    { limit: 75, colorClass: 'text-sky-500 dark:text-sky-400' },
    { limit: 50, colorClass: 'text-amber-500 dark:text-amber-400' },
];

function getScoreTextColor(score) {
    return getDynamicTextColor(score, SCORE_THRESHOLDS);
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
 * Creates and displays a modal with a list of students for a specific grade.
 * @param {string} grade - The grade to display.
 * @param {Array<object>} students - The list of students who achieved that grade.
 */
function createGradeDetailModal(grade, students) {
    const title = `นักเรียนที่ได้เกรด ${grade} (${students.length} คน)`;
    const identifier = `grade-${String(grade).replace('.', '-')}`;
    createStudentListModal(identifier, title, students);
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

        const completionPercentage = parseFloat(roomData.completionPercentage);
        const completionTextColorClass = getCompletionTextColor(completionPercentage);

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
            <tr data-room="${room}" class="room-detail-trigger border-b dark:border-gray-700 last:border-b-0 odd:bg-white even:bg-gray-50/50 dark:odd:bg-gray-800/50 dark:even:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-150 cursor-pointer">
                <th scope="row" class="px-4 py-2 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    ห้อง ${room}
                    <span class="ml-2 font-mono font-normal text-gray-500 dark:text-gray-400">(${roomData.studentCount} คน)</span>
                </th>
                <td class="px-4 py-2 text-center">
                    <span class="font-bold text-base ${scoreTextColorClass}">${roomData.averageScore}</span>
                </td>
                <td class="px-4 py-2 text-center">
                    <span class="font-bold text-base ${completionTextColorClass}">${roomData.completionPercentage}%</span>
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
function renderSummary(summaryData, studentScores) {
    const container = document.getElementById('summary-container');
    if (!container) return;

    const lastUpdatedDate = new Date(scoresLastUpdated);
    const formattedDate = lastUpdatedDate.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
    });

    // Get unique rooms for the filter dropdown
    const rooms = [...new Set(studentScores.map(s => s.room).filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const roomOptions = `<option value="all">นักเรียนทั้งหมด</option>` + rooms.map(r => `<option value="${r}">ห้อง ${r}</option>`).join('');

    const summaryHtml = `
        <!-- Student Search Section -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4">อัปเดตข้อมูลล่าสุด: ${formattedDate} น.</div>

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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <!-- Student Counts Box -->
            <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">ภาพรวมนักเรียน</h3>
                <div class="grid grid-cols-3 gap-4 flex-grow">
                    <div id="card-all-students" class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                        <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 font-kanit">${summaryData.totalStudents}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">นักเรียนทั้งหมด</div>
                    </div>
                    <div id="card-complete-students" class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                        <div class="text-4xl font-bold text-green-600 dark:text-green-400 font-kanit">${summaryData.studentsWithNoMissing}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">ส่งงานครบ</div>
                    </div>
                    <div id="card-missing-students" class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                        <div class="text-4xl font-bold text-red-600 dark:text-red-400 font-kanit">${summaryData.studentsWithMissing}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">ยังส่งงานไม่ครบ</div>
                    </div>
                </div>
            </div>

            <!-- Other Stats Box -->
            <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">ภาพรวมคะแนนและงาน</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                </div>
            </div>
        </div>

        <!-- Grade Distribution Chart -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 id="grade-chart-title" class="text-lg font-bold text-gray-800 dark:text-white font-kanit">การกระจายของเกรด</h3>
                <div>
                    <select id="grade-chart-room-filter" class="mt-1 p-2 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm">
                        ${roomOptions}
                    </select>
                </div>
            </div>
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

        <!-- Container for detailed student table per room -->
        <div id="room-detail-container" class="mt-8">
            <!-- Detailed table will be rendered here -->
        </div>
    `;

    // Clear loading spinner and render the new content
    container.innerHTML = summaryHtml;

    // Perform the initial render of the sortable table
    updateRoomSummaryTable();

    initializeStudentSearch(studentScores);
}

/**
 * Main function to initialize the summary page.
 */
export async function initializeSummaryPage() {
    try {
        const studentScores = await getStudentScores();
        summaryDataStore = calculateOverallSummary(studentScores);
        renderSummary(summaryDataStore, studentScores);
        initializeTableSorting();

        // --- Grade Chart Filtering Logic ---
        const gradeChartFilter = document.getElementById('grade-chart-room-filter');
        if (gradeChartFilter) {
            gradeChartFilter.addEventListener('change', (e) => {
                updateAndRenderGradeChart(e.target.value, studentScores); // Pass master list
            });
        }
        // Initial render of the chart for all students
        updateAndRenderGradeChart('all', studentScores); // Pass master list

        // --- Event Listeners for Summary Cards ---
        const clickableCards = [
            { id: 'card-all-students', filter: () => true, title: count => `นักเรียนทั้งหมด (${count} คน)` },
            { id: 'card-complete-students', filter: student => calculateStudentCompletion(student).missing === 0 && calculateStudentCompletion(student).total > 0, title: count => `นักเรียนที่ส่งงานครบ (${count} คน)` },
            { id: 'card-missing-students', filter: student => calculateStudentCompletion(student).missing > 0, title: count => `นักเรียนที่ยังส่งงานไม่ครบ (${count} คน)` }
        ];

        clickableCards.forEach(cardInfo => {
            const cardElement = document.getElementById(cardInfo.id);
            if (cardElement) {
                cardElement.addEventListener('click', () => {
                    const filteredStudents = studentScores.filter(cardInfo.filter);
                    if (filteredStudents.length > 0) {
                        const modalTitle = cardInfo.title(filteredStudents.length);
                        createStudentListModal(cardInfo.id, modalTitle, filteredStudents);
                    }
                });
            }
        });

        // Add listener for room detail view and export button using event delegation
        const roomSummaryTbody = document.getElementById('room-summary-tbody');
        const roomDetailContainer = document.getElementById('room-detail-container');

        if (roomSummaryTbody) {
            roomSummaryTbody.addEventListener('click', (event) => {
                const row = event.target.closest('.room-detail-trigger');
                if (!row) return;

                const room = row.dataset.room;
                selectedRoomForDetails = room; // Set the selected room for CSV export
                renderStudentTableForRoom(room, studentScores);
            });
        }

        if (roomDetailContainer) {
            roomDetailContainer.addEventListener('click', event => {
                if (event.target.id === 'export-csv-btn') {
                    handleExportCSV(studentScores);
                }
            });
        }

    } catch (error) {
        console.error("Failed to initialize summary page:", error);
        const container = document.getElementById('summary-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-16 text-red-500 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 class="text-xl font-bold font-kanit">เกิดข้อผิดพลาด</h3>
                    <p class="mt-2">ไม่สามารถโหลดข้อมูลสรุปคะแนนได้<br>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                    <a href="./index.html" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 no-transition">กลับไปหน้าหลัก</a>
                </div>`;
        }
    }
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
                // Sort by ordinal number for room searches
                results = roomMatches.sort((a, b) => {
                    const ordinalA = parseInt(a.ordinal, 10) || 999;
                    const ordinalB = parseInt(b.ordinal, 10) || 999;
                    return ordinalA - ordinalB;
                });
            } else {
                // Priority 3: Partial Name match
                const nameMatches = studentScores.filter(student =>
                    student.name && student.name.toLowerCase().includes(query)
                );
                // Sort by ID for name searches
                results = nameMatches.sort((a, b) => a.id.localeCompare(b.id));
            }
        }

        renderStudentSearchResultCards(results, resultsContainer, { cardType: 'link', basePath: './' });
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
function getFirstName(fullName) {
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

    const studentsInRoom = studentScores.filter(s => s.room === room).sort((a, b) => (parseInt(a.ordinal, 10) || 999) - (parseInt(b.ordinal, 10) || 999));

    if (studentsInRoom.length === 0) {
        container.innerHTML = ''; // Clear if no students
        return;
    }

    const desiredOrder = [
        'id', 'ordinal', 'name', 'บท 1 [10]', 'บท 2 [10]', 'บท 3 [5]',
        'ก่อนกลางภาค [25]', 'กลางภาค [20]', 'บท 4 [10]', 'นำเสนอ [5]', 'บท 5 [10]',
        'หลังกลางภาค [25]', 'ก่อนปลายภาค [70]', 'ปลายภาค [30]', 'รวม [100]', 'เกรด'
    ];

    const allKeys = new Set();
    studentsInRoom.forEach(student => {
        Object.keys(student).forEach(key => allKeys.add(key));
    });

    const orderedKeys = desiredOrder.filter(key => allKeys.has(key));
    const remainingKeys = Array.from(allKeys).filter(key => !desiredOrder.includes(key) && key !== 'assignments' && key !== 'room').sort();
    const scoreKeys = [...orderedKeys, ...remainingKeys];

    const stickyColumnStyles = {
        'id': 'sticky left-0 z-10 w-16 min-w-[4rem]',
        'ordinal': 'sticky left-[4rem] z-10 w-16 min-w-[4rem]',
        'name': 'sticky left-[8rem] z-10 w-32 sm:w-48 min-w-[8rem] sm:min-w-[12rem] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]'
    };

    const headHtml = `<tr>${scoreKeys.map(key => {
        const isSticky = ['id', 'name', 'ordinal'].includes(key);
        const stickyClasses = isSticky ? stickyColumnStyles[key] : '';
        const zIndexClass = isSticky ? 'z-20' : 'z-10';
        const thClasses = `sticky top-0 px-2 py-2 bg-gray-100 dark:bg-gray-900 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${zIndexClass}`;
        return `<th class="${thClasses} ${stickyClasses}">${key}</th>`;
    }).join('')}</tr>`;

    const bodyHtml = studentsInRoom.map(student => {
        return `<tr>
            ${scoreKeys.map(key => {
            const isSticky = ['id', 'name', 'ordinal'].includes(key);
            const stickyClasses = isSticky ? stickyColumnStyles[key] : '';
            const tdClasses = `px-2 py-2 text-xs sm:text-sm whitespace-nowrap ${isSticky ? 'bg-white dark:bg-gray-800' : ''}`;
            const value = student[key] ?? '-';

            if (key === 'name') {
                const fullName = student.name ?? '';
                const firstName = getFirstName(fullName);
                return `<td class="${tdClasses} ${stickyClasses} text-left" title="${fullName}">
                            <span class="hidden sm:inline">${fullName}</span>
                            <span class="sm:hidden">${firstName}</span>
                        </td>`;
            }

            return `<td class="${tdClasses} ${stickyClasses} text-center">${value}</td>`;
        }).join('')}
        </tr>`;
    }).join('');

    container.innerHTML = `
        <div class="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden">
            <div class="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit">รายละเอียดคะแนนห้อง ${room}</h3>
                <button id="export-csv-btn" class="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    <span>Export to CSV</span>
                </button>
            </div>
            <div class="overflow-auto modern-scrollbar max-h-[70vh]">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-gray-100 dark:bg-gray-900">${headHtml}</thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${bodyHtml}</tbody>
                </table>
            </div>
        </div>
    `;

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

    const studentsInRoom = studentScores.filter(s => s.room === selectedRoom).sort((a, b) => (parseInt(a.ordinal, 10) || 999) - (parseInt(b.ordinal, 10) || 999));
    if (studentsInRoom.length === 0) {
        alert('ไม่พบข้อมูลนักเรียนในห้องที่เลือก');
        return;
    }

    const exportHeaderMap = {
        'room': 'ห้อง', 'id': 'เลขประจำตัว', 'ordinal': 'เลขที่', 'name': 'ชื่อ-นามสกุล',
        'บท 1 [10]': 'บทที่ 1', 'บท 2 [10]': 'บทที่ 2', 'บท 3 [5]': 'บทที่ 3',
        'ก่อนกลางภาค [25]': 'ก่อนกลางภาค', 'กลางภาค [20]': 'กลางภาค', 'บท 4 [10]': 'บทที่ 4',
        'นำเสนอ [5]': 'นำเสนอ', 'บท 5 [10]': 'บทที่ 5', 'หลังกลางภาค [25]': 'หลังกลางภาค',
        'ก่อนปลายภาค [70]': 'ก่อนปลายภาค', 'ปลายภาค [30]': 'ปลายภาค', 'รวม [100]': 'รวม', 'เกรด': 'เกรด'
    };

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
