import { getStudentScores } from './data-manager.js';
import { ModalHandler } from './modal-handler.js';
import { renderStudentSearchResultCards } from './student-card-renderer.js';

let originalScoresData = [];
let studentScores = [];
let scoreKeys = [];

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

/**
 * Initializes the score editor page with password protection.
 */
export async function initializeScoreEditor() {
    // 1. Get all DOM elements
    const loginPrompt = document.getElementById('login-prompt');
    const editorContent = document.getElementById('editor-content');
    const enterEditModeBtn = document.getElementById('enter-edit-mode-btn');

    // Password Modal elements
    const devPasswordModal = new ModalHandler('dev-password-modal');
    const devPasswordForm = document.getElementById('dev-password-form');
    const devPasswordInput = document.getElementById('dev-password-input');
    const devPasswordError = document.getElementById('dev-password-error');

    // Main editor elements
    const roomSelector = document.getElementById('room-selector');
    const tableContainer = document.getElementById('table-container');
    const actionContainer = document.getElementById('action-buttons-container');
    const generateBtn = document.getElementById('generate-overrides-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const tablePlaceholder = document.getElementById('table-placeholder');

    // Modals for code generation
    const overrideCodeModal = new ModalHandler('override-code-modal');
    const overrideCodeContent = document.getElementById('override-code-content');
    const logDataContent = document.getElementById('log-data-content');
    const copyOverrideCodeBtn = document.getElementById('copy-override-code-btn');
    const copyLogDataBtn = document.getElementById('copy-log-data-btn');
    const downloadOverrideFileBtn = document.getElementById('download-override-file-btn');

    // 2. Setup Password Protection
    if (enterEditModeBtn) {
        enterEditModeBtn.addEventListener('click', () => {
            if (devPasswordInput) devPasswordInput.value = '';
            if (devPasswordError) devPasswordError.textContent = '';
            devPasswordModal.open(enterEditModeBtn);
        });
    }

    if (devPasswordForm) {
        devPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (devPasswordInput.value === "promma_dev") {
                devPasswordModal.close();
                enableEditor();
            } else {
                if (devPasswordError) devPasswordError.textContent = "รหัสผ่านไม่ถูกต้อง";
                const modalContent = devPasswordModal.modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('anim-shake');
                    setTimeout(() => modalContent.classList.remove('anim-shake'), 500);
                }
            }
        });
    }

    /**
     * Enables the main editor UI, fetches data, and sets up event listeners.
     */
    async function enableEditor() {
        // Show editor content
        if (loginPrompt) loginPrompt.classList.add('hidden');
        if (editorContent) editorContent.classList.remove('hidden');

        // Fetch data
        try {
            const { studentScores: baseScores } = await import(`../data/scores-data.js?v=${Date.now()}`);
            originalScoresData = baseScores;
            studentScores = await getStudentScores();
        } catch (error) {
            console.error("Failed to load student score data:", error);
            tableContainer.innerHTML = `<div class="text-center py-16 text-red-500"><h3>เกิดข้อผิดพลาดในการโหลดข้อมูลนักเรียน</h3></div>`;
            return;
        }

        // --- Modal Logic for Assignment List ---
        const assignmentModal = document.getElementById('assignment-list-modal');
        const assignmentModalCloseBtn = document.getElementById('modal-close-btn');

        if (assignmentModal && assignmentModalCloseBtn) {
            const closeModal = () => assignmentModal.classList.add('hidden');
            assignmentModalCloseBtn.addEventListener('click', closeModal);
            assignmentModal.addEventListener('click', (event) => {
                if (event.target === assignmentModal) closeModal();
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && !assignmentModal.classList.contains('hidden')) {
                    closeModal();
                }
            });
        }

        // Initialize the student search functionality
        initializeStudentSearch(studentScores);

        // Populate room selector
        const rooms = [...new Set(studentScores.map(s => s.room))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        rooms.forEach(room => {
            if (room) {
                const option = new Option(`ห้อง ${room}`, room);
                roomSelector.appendChild(option);
            }
        });

        // Add event listeners for the editor
        roomSelector.addEventListener('change', () => {
            const selectedRoom = roomSelector.value;
            if (selectedRoom) {
                renderScoreTable(selectedRoom);
                actionContainer.classList.remove('hidden');
                exportCsvBtn.classList.remove('hidden');
            } else {
                tableContainer.innerHTML = '';
                tableContainer.appendChild(tablePlaceholder);
                actionContainer.classList.add('hidden');
                exportCsvBtn.classList.add('hidden');
            }
        });

        generateBtn.addEventListener('click', handleGenerateOverrides);
        exportCsvBtn.addEventListener('click', handleExportCSV);

        copyOverrideCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(overrideCodeContent.value).then(() => {
                copyOverrideCodeBtn.textContent = 'คัดลอกแล้ว!';
                setTimeout(() => { copyOverrideCodeBtn.textContent = 'คัดลอกโค้ด'; }, 2000);
            });
        });

        copyLogDataBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(logDataContent.value).then(() => {
                copyLogDataBtn.textContent = 'คัดลอกแล้ว!';
                setTimeout(() => { copyLogDataBtn.textContent = 'คัดลอกข้อมูล Log'; }, 2000);
            });
        });

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

        // Check for URL param to pre-select a room
        const urlParams = new URLSearchParams(window.location.search);
        const roomFromUrl = urlParams.get('room');
        if (roomFromUrl && rooms.includes(roomFromUrl)) {
            roomSelector.value = roomFromUrl;
            roomSelector.dispatchEvent(new Event('change'));
        }
    }

    /**
    * Renders the editable score table for a given room.
    * @param {string} room The room number to render.
    */
    function renderScoreTable(room) {
        const studentsInRoom = studentScores.filter(s => s.room === room).sort((a, b) => (parseInt(a.ordinal, 10) || 999) - (parseInt(b.ordinal, 10) || 999));

        if (studentsInRoom.length === 0) {
            tableContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-8">ไม่พบข้อมูลนักเรียนในห้อง ${room}</p>`;
            return;
        }

        const desiredOrder = [
            'id',
            'ordinal',
            'name',
            'บท 1 [10]',
            'บท 2 [10]',
            'บท 3 [5]',
            'ก่อนกลางภาค [25]',
            'กลางภาค [20]',
            'บท 4 [10]',
            'นำเสนอ [5]',
            'บท 5 [10]',
            'หลังกลางภาค [25]',
            'ก่อนปลายภาค [70]',
            'ปลายภาค [30]',
            'รวม [100]',
            'เกรด'
        ];

        const allKeys = new Set();
        studentsInRoom.forEach(student => {
            Object.keys(student).forEach(key => allKeys.add(key));
        });

        const orderedKeys = desiredOrder.filter(key => allKeys.has(key));
        const remainingKeys = Array.from(allKeys).filter(key => !desiredOrder.includes(key) && key !== 'assignments' && key !== 'room').sort();
        scoreKeys = [...orderedKeys, ...remainingKeys];

        // เพิ่มเงาจางๆ ที่ขอบคอลัมน์สุดท้ายที่ถูก freeze เพื่อบ่งบอกว่าสามารถเลื่อนดูข้อมูลต่อได้
        // ลดขนาดคอลัมน์ id และปรับตำแหน่งคอลัมน์ที่ติดกัน
        const stickyColumnStyles = {
            'id': 'sticky left-0 z-10 w-16 min-w-[4rem]',
            'ordinal': 'sticky left-[4rem] z-10 w-16 min-w-[4rem]',
            'name': 'sticky left-[8rem] z-10 w-32 sm:w-48 min-w-[8rem] sm:min-w-[12rem] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]'
        };

        const headHtml = `<tr>${scoreKeys.map(key => {
            const isSticky = ['id', 'name', 'ordinal'].includes(key);
            const stickyClasses = isSticky ? stickyColumnStyles[key] : '';
            // Horizontally sticky header cells need a higher z-index to appear above other header cells.
            const zIndexClass = isSticky ? 'z-20' : 'z-10';
            const thClasses = `sticky top-0 px-2 py-2 bg-gray-100 dark:bg-gray-900 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${zIndexClass}`;
            
            return `<th class="${thClasses} ${stickyClasses}">${key}</th>`;
        }).join('')}</tr>`;

        const bodyHtml = studentsInRoom.map(student => {
            return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50" data-student-id="${student.id}">
                ${scoreKeys.map(key => {
                const isSticky = ['id', 'name', 'ordinal'].includes(key);
                const stickyClasses = isSticky ? stickyColumnStyles[key] : '';
                const tdClasses = `border-r dark:border-gray-600 p-0 ${isSticky ? 'bg-white dark:bg-gray-800' : ''}`;

                // Special handling for the 'name' column for responsiveness
                if (key === 'name') {
                    const fullName = student.name ?? '';
                    const firstName = getFirstName(fullName);
                    return `<td class="${tdClasses} ${stickyClasses} px-2 py-2 text-left text-sm text-gray-800 dark:text-gray-200 truncate" title="${fullName}">
                                <span class="hidden sm:inline">${fullName}</span>
                                <span class="sm:hidden">${firstName}</span>
                            </td>`;
                }

                // For all other keys, use an input field
                const value = student[key] ?? '';
                const isReadonly = ['id', 'ordinal'].includes(key);
                const inputType = (typeof value === 'number' && !isReadonly && key !== 'เกรด') ? 'number' : 'text';
                const step = (typeof value === 'number' && !Number.isInteger(value)) ? 'any' : '1';
                const inputClasses = `w-full h-full p-2 bg-transparent focus:bg-blue-50 dark:focus:bg-blue-900/50 outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm ${isReadonly ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200'} ${key === 'name' ? 'text-left' : 'text-center'}`;

                return `<td class="${tdClasses} ${stickyClasses}">
                        <input 
                            type="${inputType}" 
                            ${inputType === 'number' ? `step="${step}"` : ''}
                            data-key="${key}" 
                            value="${value}" 
                            class="${inputClasses}"
                            ${isReadonly ? 'readonly' : ''}
                        >
                    </td>`;
            }).join('')}
            </tr>`;
        }).join('');

        tableContainer.innerHTML = `
            <div class="overflow-auto modern-scrollbar border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-h-[70vh]">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-gray-100 dark:bg-gray-900">${headHtml}</thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${bodyHtml}</tbody>
                </table>
            </div>
        `;
    }

    /**
     * Handles the generation of override code and log data.
     */
    async function handleGenerateOverrides() {
        const allOverrides = {};
        const logEntries = [];
        let hasChanges = false;

        let existingOverrides = {};
        try {
            const overrideModule = await import(`../data/score-overrides.js?v=${Date.now()}`);
            if (overrideModule.encryptedScoreOverrides && overrideModule.encryptedScoreOverrides.trim() !== "") {
                existingOverrides = JSON.parse(atob(overrideModule.encryptedScoreOverrides));
            }
        } catch (e) {
            console.log("No existing score-overrides.js found or it's empty, creating new one.");
        }
        document.querySelectorAll('tbody tr[data-student-id]').forEach(row => {
            const studentId = row.dataset.studentId;
            const originalStudent = originalScoresData.find(s => s.id === studentId);
            if (!originalStudent) return;

            const studentOverrides = {};
            let studentHasChanges = false;

            row.querySelectorAll('input[data-key]').forEach(input => {
                const key = input.dataset.key;
                if (['id', 'name', 'ordinal'].includes(key)) return;

                const originalValue = originalStudent[key];
                let newValue = input.value;

                if (typeof originalValue === 'number' || (!originalValue && !isNaN(parseFloat(newValue)))) {
                    newValue = (newValue === '') ? null : parseFloat(newValue);
                    if (isNaN(newValue)) newValue = null;
                }

                const originalExists = originalValue !== null && originalValue !== undefined && originalValue !== '';
                const newExists = newValue !== null && newValue !== undefined && newValue !== '';

                if ((originalExists !== newExists) || (originalExists && newExists && newValue !== originalValue)) {
                    studentOverrides[key] = newValue;
                    studentHasChanges = true;
                    hasChanges = true;

                    logEntries.push({
                        timestamp: new Date().toISOString(),
                        student_id: studentId,
                        student_name: originalStudent.name,
                        score_key: key,
                        original_value: originalValue ?? 'N/A',
                        new_value: newValue ?? 'N/A'
                    });
                }
            });

            if (studentHasChanges) {
                allOverrides[studentId] = { ...(existingOverrides[studentId] || {}), ...studentOverrides };
            }
        });

        if (hasChanges) {
            const newOverrides = { ...existingOverrides, ...allOverrides };

            const encryptedString = btoa(JSON.stringify(newOverrides, null, 2));
            overrideCodeContent.value = `export const encryptedScoreOverrides = "${encryptedString}";`;

            const csvHeader = "timestamp,student_id,student_name,score_key,original_value,new_value\n";
            const csvRows = logEntries.map(entry => {
                const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
                return [
                    escape(entry.timestamp), escape(entry.student_id), escape(entry.student_name),
                    escape(entry.score_key), escape(entry.original_value), escape(entry.new_value)
                ].join(',');
            }).join('\n');
            logDataContent.value = csvHeader + csvRows;

            overrideCodeModal.open();
        } else {
            alert('ไม่มีการเปลี่ยนแปลงคะแนน');
        }
    }
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
 * Handles exporting the current room's data to a CSV file.
 */
function handleExportCSV() {
    const roomSelector = document.getElementById('room-selector');
    const selectedRoom = roomSelector.value;
    if (!selectedRoom) {
        alert('กรุณาเลือกห้องเรียนก่อนทำการ Export');
        return;
    }

    const studentsInRoom = studentScores.filter(s => s.room === selectedRoom).sort((a, b) => (parseInt(a.ordinal, 10) || 999) - (parseInt(b.ordinal, 10) || 999));
    if (studentsInRoom.length === 0) {
        alert('ไม่พบข้อมูลนักเรียนในห้องที่เลือก');
        return;
    }

    // Define the specific order and display names for the CSV export
    const exportHeaderMap = {
        'room': 'ห้อง',
        'id': 'เลขประจำตัว',
        'ordinal': 'เลขที่',
        'name': 'ชื่อ-นามสกุล',
        'บท 1 [10]': 'บทที่ 1',
        'บท 2 [10]': 'บทที่ 2',
        'บท 3 [5]': 'บทที่ 3',
        'ก่อนกลางภาค [25]': 'ก่อนกลางภาค',
        'กลางภาค [20]': 'กลางภาค',
        'บท 4 [10]': 'บทที่ 4',
        'นำเสนอ [5]': 'นำเสนอ',
        'บท 5 [10]': 'บทที่ 5',
        'หลังกลางภาค [25]': 'หลังกลางภาค',
        'ก่อนปลายภาค [70]': 'ก่อนปลายภาค',
        'ปลายภาค [30]': 'ปลายภาค',
        'รวม [100]': 'รวม',
        'เกรด': 'เกรด'
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
    link.download = `scores-room-${selectedRoom}-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Initializes the student search functionality.
 * @param {Array<object>} studentScores - The array of all student score objects.
 */
function initializeStudentSearch(studentScores) {
    const searchInput = document.getElementById('student-search-input');
    const searchBtn = document.getElementById('student-search-btn');
    const clearBtn = document.getElementById('student-search-clear-btn');
    const resultsContainer = document.getElementById('student-search-results');

    if (!searchInput || !resultsContainer || !searchBtn || !clearBtn) {
        console.error('Student search elements not found for teacher hub.');
        return;
    }

    resultsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">ค้นหานักเรียนเพื่อดูคะแนนรายบุคคล</p>`;

    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length === 0) {
            resultsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">กรุณาพิมพ์คำค้นหา</p>`;
            return;
        }

        // Priority 1: Exact ID match.
        const idMatch = studentScores.find(s => s.id.toLowerCase() === query);
        if (idMatch) {
            displayStudentDetails(idMatch, resultsContainer);
            return;
        }

        // Priority 2: Exact Room match.
        const roomMatches = studentScores.filter(s => s.room && s.room.toLowerCase() === query);
        if (roomMatches.length > 0) {
            const results = roomMatches.sort((a, b) => (parseInt(a.ordinal, 10) || 999) - (parseInt(b.ordinal, 10) || 999));
            renderStudentSearchResultCards(results, resultsContainer, { cardType: 'button' });
            return;
        }

        // Priority 3: Partial Name match.
        const nameMatches = studentScores.filter(student => student.name && student.name.toLowerCase().includes(query));
        if (nameMatches.length > 1) {
            const results = nameMatches.sort((a, b) => a.id.localeCompare(b.id));
            renderStudentSearchResultCards(results, resultsContainer, { cardType: 'button' });
        } else if (nameMatches.length === 1) {
            displayStudentDetails(nameMatches[0], resultsContainer);
        } else {
            // No results found, render the "not found" message.
            renderStudentSearchResultCards([], resultsContainer, { cardType: 'button' });
        }
    };

    resultsContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.student-card-btn');
        if (!card) return;

        const studentId = card.dataset.studentId;
        if (!studentId) return;

        const student = studentScores.find(s => s.id === studentId);
        if (student) {
            displayStudentDetails(student, resultsContainer);
        }

    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-4">ค้นหานักเรียนเพื่อดูคะแนนรายบุคคล</p>`;
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
            event.preventDefault();
            performSearch();
        }
    });
}

// --- Student Detail Display Logic (Adapted from scores-handler.js) ---

function showAssignmentListModal(title, assignments) {
    const modal = document.getElementById('assignment-list-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-list-content');
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

function createBreakdownRow(student, label, scoreKey) {
    const scoreValue = student[scoreKey];
    if (!student.hasOwnProperty(scoreKey) || scoreValue === null) return '';

    const scoreDisplay = `<input type="number" data-key="${scoreKey}" class="score-input w-20 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${scoreValue ?? ''}">`;

    return `
        <tr class="bg-gray-50 dark:bg-gray-800/50">
            <td class="py-2 px-4 pl-10 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <svg class="h-3 w-3 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                <span class="italic">${label}</span>
            </td>
            <td class="py-2 px-4 text-right">${scoreDisplay}</td>
        </tr>
    `;
}

function createAssignmentItemHTML(assignment) {
    const url = ASSIGNMENT_URL_MAP[assignment.name] || null;
    const lowerCaseName = assignment.name.toLowerCase();
    const displayName = ASSIGNMENT_DISPLAY_NAME_MAP[lowerCaseName] || assignment.name;
    const score = assignment.score;
    let statusHtml;

    statusHtml = `<input type="text" data-assignment-name="${assignment.name}" class="assignment-score-input w-24 text-center p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${score ?? ''}">`;

    const contentHtml = `
        <div class="flex-grow min-w-0 pr-4"><span class="text-gray-700 dark:text-gray-300 text-sm font-medium">${displayName}</span></div>
        <div class="flex items-center gap-3 flex-shrink-0">
            ${statusHtml}
            ${url ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>` : '<div class="w-4 h-4"></div>'}
        </div>`;

    return url ? `<li class="block"><a href="${url}" target="_blank" rel="noopener noreferrer" class="group flex justify-between items-center py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">${contentHtml}</a></li>` : `<li class="flex justify-between items-center py-3 px-4 opacity-75">${contentHtml}</li>`;
}

function groupAssignments(assignments) {
    if (!assignments || assignments.length === 0) return {};
    const groups = assignments.reduce((acc, assignment) => {
        const name = assignment.name.toLowerCase();
        if (SUMMARY_ASSIGNMENT_PATTERNS.some(pattern => pattern.test(name))) return acc;
        const match = name.match(/(\d+)/);
        const chapterKey = name.includes('mid') ? 'กลางภาค' : (match ? `บทที่ ${match[1]}` : 'อื่นๆ');
        if (!acc[chapterKey]) acc[chapterKey] = [];
        acc[chapterKey].push(assignment);
        return acc;
    }, {});

    const orderedGroups = {};
    CHAPTER_ORDER.forEach(key => { if (groups[key]) orderedGroups[key] = groups[key]; });
    Object.keys(groups).forEach(key => { if (!orderedGroups[key]) orderedGroups[key] = groups[key]; });
    return orderedGroups;
}

/**
 * Displays the detailed score result for a single student in a read-only view.
 * @param {object} student - The student data object.
 * @param {HTMLElement} container - The container element to render the result into.
 */
function displayStudentDetails(student, container) {
    const summaryOrder = ['ก่อนกลางภาค [25]', 'กลางภาค [20]', 'หลังกลางภาค [25]', 'ก่อนปลายภาค [70]', 'ปลายภาค [30]', 'รวม [100]', 'เกรด'];
    const breakdownMap = {
        'ก่อนกลางภาค [25]': [{ label: 'บทที่ 1', key: 'บท 1 [10]' }, { label: 'บทที่ 2', key: 'บท 2 [10]' }, { label: 'บทที่ 3', key: 'บท 3 [5]' }],
        'หลังกลางภาค [25]': [{ label: 'บทที่ 4', key: 'บท 4 [10]' }, { label: 'บทที่ 5', key: 'บท 5 [10]' }, { label: 'นำเสนอ', key: 'นำเสนอ [5]' }]
    };

    const scoreRows = summaryOrder.map(key => {
        if (!student.hasOwnProperty(key)) return '';
        const value = student[key];
        const isGrade = key === 'เกรด';
        const isTotal = key === 'รวม [100]';
        const isMidterm = key === 'กลางภาค [20]';
        const isFinal = key === 'ปลายภาค [30]';
        const isImportant = isGrade || isTotal || isMidterm || isFinal;

        const rowClass = isImportant ? 'bg-blue-50 dark:bg-gray-800/60' : '';
        const labelClass = isImportant ? 'font-bold text-blue-900 dark:text-blue-300' : 'font-medium text-gray-700 dark:text-gray-300';
        let valueClass = isImportant ? 'font-bold' : 'font-semibold';
        if (isGrade) valueClass += ' text-2xl text-blue-600 dark:text-blue-400';
        else if (isTotal) valueClass += ' text-xl text-green-600 dark:text-green-400';
        else if (isMidterm || isFinal) valueClass += ' text-lg text-gray-900 dark:text-white';
        else valueClass += ' text-gray-900 dark:text-white';

        let valueDisplay;
        const inputType = (typeof value === 'number' && !isGrade) ? 'number' : 'text';
        valueDisplay = `<input type="${inputType}" data-key="${key}" class="score-input w-24 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${value ?? ''}">`;


        let retestStatusHtml = '';
        if (key === 'กลางภาค [20]' && student.ซ่อมมั้ย && student.ซ่อมมั้ย.trim() !== '-') {
            const retestStatus = student.ซ่อมมั้ย.trim();
            const isPositiveStatus = retestStatus.includes('ไม่ต้อง') || retestStatus.includes('ซ่อมแล้ว');
            const statusColor = isPositiveStatus ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
            retestStatusHtml = `<div class="text-xs font-normal ${statusColor} pt-1">สถานะการสอบซ่อม: ${retestStatus}</div>`;
        }

        let mainRowHtml = `<tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${rowClass}"><td class="py-3 px-4 ${labelClass}">${key}</td><td class="py-3 px-4 text-right">${valueDisplay}${retestStatusHtml}</td></tr>`;
        if (breakdownMap[key]) mainRowHtml += breakdownMap[key].map(item => createBreakdownRow(student, item.label, item.key)).join('');
        return mainRowHtml;
    }).join('');

    const summaryScoreSection = `<figure class="mb-6"><figcaption class="p-3 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-lg border-x border-t border-gray-200 dark:border-gray-700">คะแนนสรุป</figcaption><div class="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden"><table class="w-full text-base"><tbody>${scoreRows}</tbody></table></div></figure>`;

    const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท'];
    const trackableAssignments = student.assignments.filter(a => TRACKABLE_KEYWORDS.some(k => a.name.toLowerCase().includes(k)));
    const submittedCount = trackableAssignments.filter(a => a.score && a.score.toLowerCase() !== 'ยังไม่ส่ง').length;
    const missingCount = trackableAssignments.length - submittedCount;
    const completionPercentage = trackableAssignments.length > 0 ? (submittedCount / trackableAssignments.length) * 100 : 0;

    const groupedAssignments = groupAssignments(trackableAssignments);

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
        </div>`;

    const assignmentsSection = Object.keys(groupedAssignments).length > 0 ? `
        <figure>
            <figcaption class="p-4 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800">รายการงานที่ต้องส่ง</figcaption>
            <div class="space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30">
                ${Object.entries(groupedAssignments).map(([chapter, chapterAssignments]) => `
                    <details class="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 open:ring-2 open:ring-blue-500 open:shadow-lg">
                        <summary class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <h4 class="font-bold text-gray-800 dark:text-gray-200 font-kanit">${chapter}</h4>
                            <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                        </summary>
                        <div class="border-t border-gray-200 dark:border-gray-700"><ul class="divide-y divide-gray-200 dark:divide-gray-700">${chapterAssignments.map(createAssignmentItemHTML).join('')}</ul></div>
                    </details>
                `).join('')}
            </div>
        </figure>` : '';

    container.innerHTML = `
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
            </div>
            <div class="p-6 space-y-8">
                ${summaryScoreSection}
                ${summaryCardsHtml}
                ${assignmentsSection}
            </div>
            <div id="individual-edit-controls-container" class="p-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <button id="save-individual-overrides-btn" data-studentid="${student.id}" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                    สร้างโค้ดสำหรับบันทึกการแก้ไข
                </button>
            </div>
        </div>`;

    // Attach event listeners for the new modal buttons
    document.getElementById('show-submitted-btn')?.addEventListener('click', () => {
        const submittedAssignments = trackableAssignments.filter(a => a.score && a.score.toLowerCase() !== 'ยังไม่ส่ง');
        showAssignmentListModal(`งานที่ส่งแล้ว (${submittedAssignments.length} รายการ)`, submittedAssignments);
    });

    document.getElementById('show-missing-btn')?.addEventListener('click', () => {
        const missingAssignments = trackableAssignments.filter(a => !a.score || a.score.toLowerCase() === 'ยังไม่ส่ง');
        showAssignmentListModal(`งานที่ค้างส่ง (${missingAssignments.length} รายการ)`, missingAssignments);
    });

    document.getElementById('save-individual-overrides-btn')?.addEventListener('click', handleSaveIndividualOverrides);
}

/**
 * Handles saving overrides for a single student view.
 * @param {Event} e The click event from the save button.
 */
async function handleSaveIndividualOverrides(e) {
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

    const cardContainer = document.querySelector(`.student-card-container[data-student-id="${studentId}"]`);
    if (!cardContainer) return;

    // 1. Handle summary score changes
    cardContainer.querySelectorAll('.score-input').forEach(input => {
        const key = input.dataset.key;
        const originalValue = originalStudent[key];
        let newValue = input.value;

        if (typeof originalValue === 'number' || (!originalValue && !isNaN(parseFloat(newValue)))) {
            newValue = (newValue === '') ? null : parseFloat(newValue);
            if (isNaN(newValue)) newValue = null;
        }

        const originalExists = originalValue !== null && originalValue !== undefined && originalValue !== '';
        const newExists = newValue !== null && newValue !== undefined && newValue !== '';

        if ((originalExists !== newExists) || (originalExists && newExists && newValue !== originalValue)) {
            studentOverrides[key] = newValue;
            hasChanges = true;
            logEntries.push({ timestamp: new Date().toISOString(), student_id: studentId, student_name: student.name, score_key: key, original_value: originalValue ?? 'N/A', new_value: newValue ?? 'N/A' });
        }
    });

    // 2. Handle assignment score changes
    const newAssignments = JSON.parse(JSON.stringify(student.assignments)); // Deep copy
    let assignmentsChanged = false;
    cardContainer.querySelectorAll('.assignment-score-input').forEach(input => {
        const assignmentName = input.dataset.assignmentName;
        const newValue = input.value.trim();
        const assignmentIndex = newAssignments.findIndex(a => a.name === assignmentName);
        if (assignmentIndex > -1) {
            const originalScore = student.assignments[assignmentIndex]?.score ?? '';
            if (String(originalScore).trim() !== newValue) {
                newAssignments[assignmentIndex].score = newValue;
                assignmentsChanged = true;
                hasChanges = true;
                logEntries.push({ timestamp: new Date().toISOString(), student_id: studentId, student_name: student.name, score_key: `assignments[${assignmentName}]`, original_value: originalScore, new_value: newValue });
            }
        }
    });

    if (assignmentsChanged) {
        studentOverrides.assignments = newAssignments;
    }

    if (hasChanges) {
        const overrideCodeModal = new ModalHandler('override-code-modal');
        const overrideCodeContent = document.getElementById('override-code-content');
        const logDataContent = document.getElementById('log-data-content');

        let existingOverrides = {};
        try {
            const overrideModule = await import(`../data/score-overrides.js?v=${Date.now()}`);
            if (overrideModule.encryptedScoreOverrides && overrideModule.encryptedScoreOverrides.trim() !== "") {
                existingOverrides = JSON.parse(atob(overrideModule.encryptedScoreOverrides));
            }
        } catch (e) { /* No existing overrides, continue */ }

        const newOverrides = { ...existingOverrides };
        newOverrides[studentId] = { ...(existingOverrides[studentId] || {}), ...studentOverrides };
        const encryptedString = btoa(JSON.stringify(newOverrides, null, 2));
        overrideCodeContent.value = `export const encryptedScoreOverrides = "${encryptedString}";`;

        const csvHeader = "timestamp,student_id,student_name,score_key,original_value,new_value\n";
        const csvRows = logEntries.map(entry => { const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`; return [escape(entry.timestamp), escape(entry.student_id), escape(entry.student_name), escape(entry.score_key), escape(entry.original_value), escape(entry.new_value)].join(','); }).join('\n');
        logDataContent.value = csvHeader + csvRows;
        overrideCodeModal.open();
    } else {
        alert('ไม่มีการเปลี่ยนแปลงคะแนน');
    }
}