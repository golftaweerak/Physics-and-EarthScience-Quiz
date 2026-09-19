import { getCurrentSemester, setCurrentSemester, getCurrentCourseCode, getSingleStudentScoreFromCloud, getSemesterSummary, getStudentsByRoomFromCloud } from './data-manager.js';
import { ModalHandler } from './modal-handler.js';
import { renderStudentSearchResultCards } from './student-card-renderer.js';
import { authManager } from './auth-manager.js';

/** รายชื่ออีเมลของคุณครูที่มีสิทธิ์เข้าถึงข้อมูลของนักเรียนทุกคน */
const TEACHER_EMAILS = [
    'taweerak.t@promma.ac.th', 'boonyaporn.kha@promma.ac.th', 'praewa.p@promma.ac.th', 'manthana.k@promma.ac.th'
];

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
    'แบบฝึก 5.1': 'https://forms.cloud.microsoft/r/vEjY1BajQQ',
    'แบบฝึก 5.2': 'https://forms.cloud.microsoft/r/mmB2LXmSNn',
    'ท้ายบท 5': 'https://forms.cloud.microsoft/r/1uf2B3y7sM',
    'Quiz 5': 'https://forms.cloud.microsoft/r/gMTxMUjiT6',
    'Quiz 6': 'https://forms.office.com/r/dAs6nwpZ9e',
    'Quiz 7': 'https://forms.office.com/r/x6XEYgXLMG',
    'Quiz 8': 'https://forms.office.com/r/LmJASCtdX2',
    'Quiz 9': 'https://forms.office.com/r/jiUCum58kV',
    'Quiz 10': 'https://forms.office.com/r/ZcvePkp98p'
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
const CHAPTER_ORDER = ['บทที่ 1', 'บทที่ 2', 'บทที่ 3', 'กลางภาค', 'บทที่ 4', 'บทที่ 5', 'บทที่ 6', 'บทที่ 7', 'บทที่ 8', 'บทที่ 9', 'บทที่ 10', 'อื่นๆ'];

let isEditMode = false;
let studentScores = []; // Stores the current semester's student data
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

    const semesterSelector = document.getElementById('semester-selector');
    if (semesterSelector) {
        semesterSelector.value = getCurrentSemester();
        semesterSelector.addEventListener('change', () => {
            setCurrentSemester(semesterSelector.value);
            // Refresh the page or just clear results and reload data
            window.location.reload();
        });
    }

    // --- Render Last Updated Timestamp ---
    const mainContentContainer = document.querySelector('.max-w-3xl.mx-auto');
    const searchBoxContainer = document.querySelector('#student-id-input')?.closest('.bg-white');

    const currentSemester = getCurrentSemester();
    const courseCode = getCurrentCourseCode();
    const courseDisplay = document.getElementById('course-code-display');
    const titleCourseDisplay = document.getElementById('title-course-code');
    if (courseDisplay) courseDisplay.textContent = courseCode;
    if (titleCourseDisplay) titleCourseDisplay.textContent = courseCode;

    // Fetch pre-computed summary to display lastUpdated timestamp
    try {
        const summaryData = await getSemesterSummary(currentSemester);
        if (summaryData && summaryData.lastUpdated && mainContentContainer && searchBoxContainer) {
            const lastUpdatedDate = new Date(summaryData.lastUpdated);
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
    } catch (e) {
        console.warn("Could not load lastUpdated for semester", currentSemester, e);
    }

    if (!studentIdInput || !searchBtn || !resultContainer || !clearBtn) {
        console.error("Required elements for score search are missing from the DOM.");
        return;
    }

    // --- Quick Student Shortcut for Logged-in Users ---
    const quickUserContainer = document.getElementById('quick-user-container');
    const updateQuickUserButton = (user) => {
        if (!quickUserContainer) return;
        if (!user || !user.email) {
            quickUserContainer.classList.add('hidden');
            quickUserContainer.innerHTML = '';
            return;
        }
        const match = user.email.trim().toLowerCase().match(/^(\d{5})@promma\.ac\.th$/);
        if (match) {
            const studentId = match[1];
            quickUserContainer.innerHTML = `
                <span class="text-xs text-gray-500 dark:text-gray-400">เข้าสู่ระบบด้วย:</span>
                <button type="button" id="quick-my-score-btn" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition shadow-sm cursor-pointer">
                    <span>👤 ดูคะแนนของฉัน (${studentId})</span>
                </button>
            `;
            quickUserContainer.classList.remove('hidden');
            const quickBtn = document.getElementById('quick-my-score-btn');
            quickBtn?.addEventListener('click', () => {
                studentIdInput.value = studentId;
                clearBtn.classList.remove('hidden');
                searchScores();
            });
        } else {
            quickUserContainer.classList.add('hidden');
            quickUserContainer.innerHTML = '';
        }
    };

    if (authManager.currentUser) {
        updateQuickUserButton(authManager.currentUser);
    }
    authManager.onUserChange(updateQuickUserButton);

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

    resultContainer.addEventListener('click', async (event) => {
        const card = event.target.closest('.student-card-btn');
        if (!card) return;

        const studentId = card.dataset.studentId;
        if (!studentId) return;

        displayMessage('กำลังโหลดข้อมูล...', 'info');

        // Priority 1: Search local studentScores first to avoid unnecessary cloud fetches
        const localStudent = studentScores.find(s => s.id === studentId);

        if (localStudent) {
            displayResult(localStudent);
            return;
        }

        // Priority 2: Fallback to Firestore if not found locally
        try {
            const student = await getSingleStudentScoreFromCloud(studentId);
            if (student) {
                displayResult(student);
            } else {
                displayMessage('ไม่พบข้อมูลนักเรียนนี้ในระบบ', 'error');
            }
        } catch (error) {
            console.warn("Cloud ID lookup failed on card click:", error);
            displayMessage('ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้แบบเรียลไทม์ กรุณาลองใหม่', 'error');
        }
    });

    function parseRoomQuery(queryVal) {
        const q = queryVal.trim().toLowerCase();
        // Case 1: "ห้อง 1" or "ห้อง1"
        const roomMatch = q.match(/^ห้อง\s*(\d{1,2})$/);
        if (roomMatch) {
            return roomMatch[1];
        }
        // Case 2: "4/1" or "4/12"
        const slashMatch = q.match(/\/(\d{1,2})$/);
        if (slashMatch) {
            return slashMatch[1];
        }
        // Case 3: Just a 1 or 2 digit number
        if (/^\d{1,2}$/.test(q)) {
            return q;
        }
        return null;
    }

    async function searchScores() {
        const queryVal = studentIdInput.value.trim();
        if (queryVal.length === 0) {
            displayMessage('กรุณากรอกรหัสนักเรียนหรือห้องเรียนเพื่อค้นหา', 'error');
            return;
        }

        const isStudentId = /^\d{5}$/.test(queryVal);
        const parsedRoom = parseRoomQuery(queryVal);

        if (!isStudentId && !parsedRoom) {
            displayMessage('กรุณากรอกรหัสนักเรียน 5 หลัก หรือเลขห้องเรียนให้ถูกต้อง (เช่น 42472, ห้อง 1, 4/1, 1)', 'error');
            return;
        }

        searchBtn.disabled = true;
        const originalBtnHtml = searchBtn.innerHTML;
        searchBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังค้นหา...
        `;

        try {
            if (isStudentId) {
                // Fetch directly from Firestore doc using 5-digit ID
                const student = await getSingleStudentScoreFromCloud(queryVal);
                if (student) {
                    studentScores = [student];
                    originalScoresData = JSON.parse(JSON.stringify(studentScores));
                    displayResult(student);
                } else {
                    displayMessage('ไม่พบข้อมูลนักเรียนนี้ในระบบ', 'error');
                }
            } else {
                // Search by room
                const students = await getStudentsByRoomFromCloud(parsedRoom);
                if (students && students.length > 0) {
                    studentScores = students;
                    originalScoresData = JSON.parse(JSON.stringify(studentScores));

                    // Clear previous result display if any
                    resultContainer.innerHTML = '';

                    // Options for search results cards - allow clicking in room view for Peer Assist Mode
                    const options = {
                        cardType: 'button',
                        isClickable: () => true
                    };

                    // Header for room listing
                    const headerHtml = document.createElement('div');
                    headerHtml.className = 'mb-4 text-left border-b border-gray-200 dark:border-gray-700 pb-2';
                    headerHtml.innerHTML = `
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit">รายชื่อนักเรียน ห้อง ม.4/${parsedRoom}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">พบนักเรียนทั้งหมด ${students.length} คน (คลิกที่ชื่อเพื่อดูคะแนนเก็บและสถานะการส่งงาน)</p>
                    `;
                    resultContainer.appendChild(headerHtml);

                    const cardsContainer = document.createElement('div');
                    resultContainer.appendChild(cardsContainer);
                    renderStudentSearchResultCards(students, cardsContainer, options);
                } else {
                    displayMessage(`ไม่พบข้อมูลนักเรียนสำหรับห้อง ม.4/${parsedRoom} ในภาคเรียนนี้`, 'error');
                }
            }
        } catch (error) {
            console.error("Search failed:", error);
            displayMessage('เกิดข้อผิดพลาดในการดึงข้อมูลจากเซิร์ฟเวอร์ กรุณาลองใหม่', 'error');
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = originalBtnHtml;
        }
    }


    searchBtn.addEventListener('click', searchScores);

    studentIdInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchScores();
        }
    });

    // Check for student ID in URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdFromUrl = urlParams.get('id');
    const autoSearch = urlParams.get('auto');

    if (studentIdFromUrl && /^\d{5}$/.test(studentIdFromUrl)) {
        studentIdInput.value = studentIdFromUrl;
        clearBtn.classList.remove('hidden');

        // Only auto-search if the 'auto=1' parameter is also present
        if (autoSearch === '1') {
            searchScores();
        }
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
     * Helper to get high-contrast grade visual styles (text color, hero gradient, chip).
     */
    function getGradeVisual(grade) {
        const num = parseFloat(grade);
        if (grade === '4' || grade === '4.0' || num === 4) {
            return { textClass: 'grade-text-4', heroClass: 'grade-hero-4', chipClass: 'chip-grade-4' };
        } else if (num >= 3) {
            return { textClass: 'grade-text-3', heroClass: 'grade-hero-3', chipClass: 'chip-grade-3' };
        } else if (num >= 2) {
            return { textClass: 'grade-text-2', heroClass: 'grade-hero-2', chipClass: 'chip-grade-2' };
        } else if (num >= 1) {
            return { textClass: 'grade-text-1', heroClass: 'grade-hero-1', chipClass: 'chip-grade-1' };
        } else {
            return { textClass: 'grade-text-0', heroClass: 'grade-hero-0', chipClass: 'chip-grade-0' };
        }
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
            <tr class="bg-gray-50/70 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-750/50">
                <td class="py-2 px-4 pl-8 sm:pl-10 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center gap-1.5">
                        <svg class="h-3 w-3 text-gray-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                        <span class="italic">${label}</span>
                    </div>
                </td>
                <td class="py-2 px-4 text-right">
                    ${scoreDisplay}
                </td>
            </tr>
        `;
    }



    function displayResult(student) {
        if (defaultMessage) defaultMessage.classList.add('hidden');

        // Check ownership & teacher privileges for Peer Assist Mode
        const currentUser = authManager.currentUser;
        const isTeacher = Boolean(currentUser && currentUser.email && TEACHER_EMAILS.includes(currentUser.email.trim().toLowerCase()));
        let loggedInStudentId = null;
        if (currentUser && currentUser.email) {
            const match = currentUser.email.trim().toLowerCase().match(/^(\d{5})@promma\.ac\.th$/);
            if (match) {
                loggedInStudentId = match[1];
            }
        }
        const isOwnerOrTeacher = Boolean(isTeacher || (loggedInStudentId && loggedInStudentId === student.id));

        // Promote all assignment scores to root properties of the student object unconditionally.
        // This ensures they are available for hasOwnProperty checks and rendering across all semesters.
        if (student.assignments) {
            student.assignments.forEach(a => {
                if (!student.hasOwnProperty(a.name) && a.score !== null && a.score !== undefined && a.score !== "") {
                    const score = parseFloat(a.score);
                    student[a.name] = isNaN(score) ? a.score : score;
                }
            });
        }

        // Map root properties that have different names in Term 2
        const isTerm2 = getCurrentSemester() === '2/2568';
        if (isTerm2) {
            if (student.hasOwnProperty('กลางภาค') && !student.hasOwnProperty('กลางภาค [20]')) {
                student['กลางภาค [20]'] = student['กลางภาค'];
            }
            if (student.hasOwnProperty('ปลายภาค') && !student.hasOwnProperty('ปลายภาค [30]')) {
                student['ปลายภาค [30]'] = student['ปลายภาค'];
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

        const breakdownMap = isTerm2 ? {
            'ก่อนกลางภาค [25]': [
                { label: 'บทที่ 6', key: 'บท 6 [10]' },
                { label: 'บทที่ 7', key: 'บท 7 [10]' },
                { label: 'กิจกรรม ธรณีพิบัติภัย', key: 'กิจกรรม [5]' }
            ],
            'หลังกลางภาค [25]': [
                { label: 'บทที่ 8', key: 'บท 8 [10]' },
                { label: 'บทที่ 9', key: 'บท 9 [5]' },
                { label: 'บทที่ 10', key: 'บท 10 [10]' },
            ]
        } : {
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
                const rowClass = isImportant ? 'bg-blue-50/70 dark:bg-gray-800/60' : '';
                const labelClass = isImportant ? 'font-bold text-blue-900 dark:text-blue-300' : 'font-medium text-gray-700 dark:text-gray-300';
                let valueClass = isImportant ? 'font-bold' : 'font-semibold';

                let valueDisplay = '';

                // Privacy check for Peer Assist View
                if (!isOwnerOrTeacher && (isGrade || isMidterm || isFinal)) {
                    if (isGrade) {
                        valueDisplay = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">🔒 เจ้าของบัญชีเท่านั้น</span>`;
                    } else {
                        valueDisplay = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">🔒 ข้อมูลส่วนบุคคล</span>`;
                    }
                } else if (isEditMode) {
                    const inputType = (typeof value === 'number' && !isGrade) ? 'number' : 'text';
                    valueDisplay = `<input type="${inputType}" data-key="${key}" class="score-input w-24 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${value ?? ''}">`;
                } else {
                    if (isGrade) {
                        valueClass += ' text-2xl ';
                        const gradeVisual = getGradeVisual(value);
                        valueClass += ` ${gradeVisual.textClass} `;
                    } else if (isTotal) {
                        valueClass += ' text-xl text-green-600 dark:text-green-400';
                    } else if (isMidterm) {
                        const numericVal = parseFloat(value);
                        if (!isNaN(numericVal)) {
                            valueClass += numericVal >= 12 ? ' text-lg text-green-600 dark:text-green-400' : ' text-lg text-red-600 dark:text-red-400';
                        } else {
                            valueClass += ' text-lg text-gray-900 dark:text-white';
                        }
                    } else if (isFinal) {
                        const numericVal = parseFloat(value);
                        if (!isNaN(numericVal)) {
                            valueClass += numericVal >= 15 ? ' text-lg text-green-600 dark:text-green-400' : ' text-lg text-red-600 dark:text-red-400';
                        } else {
                            valueClass += ' text-lg text-gray-900 dark:text-white';
                        }
                    } else {
                        valueClass += ' text-gray-900 dark:text-white';
                    }

                    let displayValue = (value !== null && value !== undefined) ? value : '-';
                    if (typeof value === 'number' && !isGrade) {
                        displayValue = Math.round(value);
                    }
                    valueDisplay = `<span class="${valueClass}">${displayValue}</span>`;
                }

                // Retest status is helpful for both the student and peers!
                let retestStatusHtml = '';
                const retestData = student.ซ่อมมั้ย || student.ซ่อมกลางภาค;
                if (key === 'กลางภาค [20]' && retestData && retestData.trim() !== '-') {
                    const retestStatus = retestData.trim();
                    const isPositiveStatus = retestStatus.includes('ไม่ต้อง') || retestStatus.includes('ซ่อมแล้ว');
                    const badgeColor = isPositiveStatus
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800';
                    retestStatusHtml = `<div class="mt-1"><span class="inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badgeColor}">ซ่อมมั้ย: ${retestStatus}</span></div>`;
                }

                let mainRowHtml = `
                    <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${rowClass}">
                        <td class="py-3 px-4 align-middle ${labelClass}">
                            <div>${key}</div>
                            ${retestStatusHtml}
                        </td>
                        <td class="py-3 px-4 text-right align-middle">
                            ${valueDisplay}
                        </td>
                    </tr>
                `;

                // If not owner/teacher, only show breakdown rows for coursework (before/after midterm)
                if (breakdownMap[key]) {
                    if (isOwnerOrTeacher || key.includes('กลางภาค') || key === 'รวม [100]') {
                        mainRowHtml += breakdownMap[key].map(item => {
                            // In peer view, hide exam sub-keys inside รวม [100]
                            if (!isOwnerOrTeacher && (item.key.includes('กลางภาค [20]') || item.key.includes('ปลายภาค [30]'))) {
                                return '';
                            }
                            return createBreakdownRow(student, item.label, item.key);
                        }).join('');
                    }
                }

                return mainRowHtml;
            }
            return '';
        }).join('');

        // Prepare Quick Header Summary Pills for Accordion
        const totalScoreVal = student['รวม [100]'] !== undefined && student['รวม [100]'] !== null ? Math.round(Number(student['รวม [100]'])) : '-';
        const gradeVal = student['เกรด'] !== undefined && student['เกรด'] !== null ? student['เกรด'] : '-';
        const gradeVisual = getGradeVisual(gradeVal);

        const quickSummaryPills = isOwnerOrTeacher ? `
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span class="summary-pill chip-total">
                    รวม: ${totalScoreVal}
                </span>
                <span class="summary-pill ${gradeVisual.chipClass}">
                    เกรด: ${gradeVal}
                </span>
            </div>
        ` : `
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span class="summary-pill chip-total">
                    รวม: ${totalScoreVal}
                </span>
                <span class="inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    🔒 เพื่อนดู
                </span>
            </div>
        `;

        const summaryScoreSection = `
            <details class="summary-score-accordion group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden my-6 transition-all duration-200">
                <summary class="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer list-none select-none">
                    <div class="flex items-center min-w-0 pr-1 sm:pr-2">
                        <div class="summary-header-icon shrink-0">
                            <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <span class="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-kanit block leading-tight">
                                <span class="sm:hidden">สรุปคะแนน</span>
                                <span class="hidden sm:inline">สรุปคะแนนรายวิชา</span>
                            </span>
                            <span class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 block leading-tight mt-0.5 truncate">แตะเพื่อดูรายละเอียด</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        ${quickSummaryPills}
                        <div class="p-1 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-open:rotate-180 shrink-0">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </summary>
                <div class="border-t border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800/40">
                    <table class="w-full text-sm sm:text-base">
                        <tbody>
                            ${scoreRows}
                        </tbody>
                    </table>
                </div>
            </details>
        `;

        // 1. Filter out non-trackable assignments and calculate stats
        const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท', 'ใบงาน'];
        const trackableAssignments = (student.assignments || []).filter(assignment =>
            assignment && assignment.name && TRACKABLE_KEYWORDS.some(keyword => assignment.name.toLowerCase().includes(keyword))
        );

        const submittedCount = trackableAssignments.filter(a => {
            const s = a.score;
            if (s === null || s === undefined) return false;
            const str = String(s).trim().toLowerCase();
            return str !== '' && str !== '-' && str !== 'ยังไม่ส่ง';
        }).length;
        const missingCount = trackableAssignments.length - submittedCount;
        const completionPercentage = trackableAssignments.length > 0 ? (submittedCount / trackableAssignments.length) * 100 : 0;

        // 2. Group assignments for display
        const groupedAssignments = groupAssignments(trackableAssignments);

        // 3. Build the KPI Summary Cards
        const summaryCardsHtml = `
            <div class="kpi-grid">
                <button type="button" id="show-submitted-btn" class="kpi-card bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-800 transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm hover:shadow">
                    <div class="text-2xl sm:text-4xl font-extrabold text-green-600 dark:text-green-400 font-kanit">${submittedCount}</div>
                    <div class="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300 mt-1">งานที่ส่งแล้ว</div>
                </button>
                <button type="button" id="show-missing-btn" class="kpi-card bg-red-50/80 dark:bg-red-950/30 border ${missingCount > 0 ? 'border-red-300 dark:border-red-700' : 'border-red-200 dark:border-red-800'} transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-sm hover:shadow">
                    <div class="text-2xl sm:text-4xl font-extrabold text-red-600 dark:text-red-400 font-kanit">${missingCount}</div>
                    <div class="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300 mt-1">งานที่ค้างส่ง</div>
                </button>
                <div class="kpi-card bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 shadow-sm">
                    <div class="text-2xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-kanit">${completionPercentage.toFixed(0)}%</div>
                    <div class="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 mt-1">ความสมบูรณ์</div>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6 overflow-hidden shadow-inner">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-700" style="width: ${completionPercentage}%"></div>
            </div>
        `;

        // 2.5 Build Quiz Shortcut Cards Section (sorted numerically by Quiz number)
        const quizAssignments = trackableAssignments.filter(a => a.name.toLowerCase().includes('quiz'));
        quizAssignments.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || 0, 10);
            const numB = parseInt(b.name.match(/\d+/)?.[0] || 0, 10);
            return numA - numB;
        });

        let quizCardsSection = '';
        if (quizAssignments.length > 0) {
            const quizCardsHtml = quizAssignments.map(quiz => {
                const url = ASSIGNMENT_URL_MAP[quiz.name] || '#';
                const score = quiz.score;
                const isSubmitted = score && score.toString().trim() !== '' && score.toString().trim() !== '-' && score.toString().toLowerCase() !== 'ยังไม่ส่ง' && !isNaN(parseFloat(score));
                const numScore = parseFloat(score);
                const isHighAchievement = isSubmitted && !isNaN(numScore) && numScore >= 8;

                let statusBadge;
                let cardStyle;
                let iconColor;
                let iconSvg;
                if (isSubmitted) {
                    if (isHighAchievement) {
                        const scoreText = isOwnerOrTeacher ? `⭐ ${score}` : '⭐ ดีเยี่ยม';
                        statusBadge = `<span class="quiz-score-badge quiz-badge-gold shadow-xs">${scoreText}</span>`;
                        cardStyle = 'quiz-card-gold hover:shadow-amber-500/10 hover:border-amber-400';
                        iconColor = 'quiz-text-gold';
                        iconSvg = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        `;
                    } else {
                        const scoreText = isOwnerOrTeacher ? `${score}` : 'ส่งแล้ว ✓';
                        statusBadge = `<span class="quiz-score-badge text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 border border-green-200 dark:border-green-800">${scoreText}</span>`;
                        cardStyle = 'border-green-200 dark:border-green-800/80 bg-green-50/40 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/30';
                        iconColor = 'text-green-600 dark:text-green-400';
                        iconSvg = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        `;
                    }
                } else {
                    statusBadge = `<span class="quiz-score-badge text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 border border-red-200 dark:border-red-800">ยังไม่ทำ</span>`;
                    cardStyle = 'border-red-200 dark:border-red-800/80 bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/30';
                    iconColor = 'text-red-600 dark:text-red-400';
                    iconSvg = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    `;
                }

                const subtextHtml = isSubmitted
                    ? (isHighAchievement ? '<span class="quiz-text-gold font-semibold">ยอดเยี่ยม!</span>' : 'คลิกดูแบบทดสอบ')
                    : '<span class="text-blue-600 dark:text-blue-400 font-bold">ทำแบบทดสอบ ↗</span>';

                return `
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="quiz-item-card group rounded-xl border ${cardStyle} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                        <div class="flex items-center gap-2 min-w-0 pr-1">
                            <div class="p-1 bg-white dark:bg-gray-800 rounded-lg shadow-2xs border border-gray-100 dark:border-gray-700 ${iconColor} shrink-0">
                                ${iconSvg}
                            </div>
                            <span class="font-bold text-gray-900 dark:text-white font-kanit group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs sm:text-sm truncate leading-tight">${quiz.name}</span>
                        </div>
                        <div class="shrink-0 ml-1">
                            ${statusBadge}
                        </div>
                    </a>
                `;
            }).join('');

            quizCardsSection = `
                <figure class="mb-8">
                    <figcaption class="quiz-section-header text-base sm:text-lg font-bold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-xl border-x border-t border-gray-200 dark:border-gray-700 font-kanit">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                        </svg>
                        <span>แบบทดสอบท้ายบท (Quiz)</span>
                    </figcaption>
                    <div class="p-4 sm:p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-b-xl shadow-sm">
                        <div class="quiz-grid">
                            ${quizCardsHtml}
                        </div>
                    </div>
                </figure>
            `;
        }

        let assignmentsSection = '';
        if (Object.keys(groupedAssignments).length > 0) {
            const chaptersHtml = Object.entries(groupedAssignments).map(([chapter, chapterAssignments]) => {
                const chapterMissingCount = chapterAssignments.filter(a => {
                    const score = a.score;
                    if (score === null || score === undefined) return true;
                    const str = String(score).trim().toLowerCase();
                    return str === '' || str === '-' || str === 'ยังไม่ส่ง';
                }).length;

                const chapterBadge = chapterMissingCount > 0
                    ? `<span class="chapter-badge px-2 py-0.5 text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800">ค้าง ${chapterMissingCount} งาน</span>`
                    : `<span class="chapter-badge px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">ครบแล้ว ✓</span>`;

                return `
                    <details class="chapter-details group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 open:ring-2 open:ring-blue-500/50 open:shadow-md" data-has-missing="${chapterMissingCount > 0}">
                        <summary class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="chapter-header-left">
                                <h4 class="font-bold text-gray-800 dark:text-gray-200 font-kanit text-sm sm:text-base">${chapter}</h4>
                                ${chapterBadge}
                            </div>
                            <svg class="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-90 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                        </summary>
                        <div class="border-t border-gray-200 dark:border-gray-700">
                            <ul class="divide-y divide-gray-200 dark:divide-gray-700/60">
                                ${chapterAssignments.map(createAssignmentItemHTML).join('')}
                            </ul>
                        </div>
                    </details>
                `;
            }).join('');

            assignmentsSection = `
                <figure class="mt-8">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <figcaption class="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-kanit flex items-center gap-2">
                            <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>รายการงานที่ต้องส่ง</span>
                        </figcaption>
                        <!-- Filter Tabs -->
                        <div class="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
                            <button type="button" class="assignment-filter-btn px-3 py-1.5 rounded-lg transition active bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm cursor-pointer" data-filter="all">
                                ทั้งหมด (${trackableAssignments.length})
                            </button>
                            <button type="button" class="assignment-filter-btn px-3 py-1.5 rounded-lg transition text-gray-600 dark:text-gray-400 hover:text-red-600 cursor-pointer" data-filter="missing">
                                ค้างส่ง (${missingCount})
                            </button>
                            <button type="button" class="assignment-filter-btn px-3 py-1.5 rounded-lg transition text-gray-600 dark:text-gray-400 hover:text-green-600 cursor-pointer" data-filter="submitted">
                                ส่งแล้ว (${submittedCount})
                            </button>
                        </div>
                    </div>
                    <div id="assignment-accordion-list" class="space-y-3">
                        ${chaptersHtml}
                    </div>
                </figure>
            `;
        }

        // GPA badge in metadata row (Owner / Teacher only)
        let gradeBadgeHtml = '';
        if (isOwnerOrTeacher && student.hasOwnProperty('เกรด')) {
            const gradeVal = student['เกรด'];
            const gradeInfo = getGradeVisual(gradeVal);
            gradeBadgeHtml = `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg ${gradeInfo.heroClass} text-white font-bold shadow-xs">
                    <span class="text-[11px] font-medium opacity-90">เกรดเฉลี่ย:</span>
                    <strong class="font-kanit text-sm sm:text-base leading-none">${gradeVal}</strong>
                </span>
            `;
        } else if (!isOwnerOrTeacher) {
            gradeBadgeHtml = `
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-600 shadow-2xs">
                    <span>🤝 โหมดเพื่อนดู</span>
                </span>
            `;
        }

        // Peer Assist Notice banner
        const peerAssistNoticeHtml = !isOwnerOrTeacher ? `
            <div class="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3 shadow-sm">
                <div class="text-2xl select-none">🤝</div>
                <div class="text-xs sm:text-sm">
                    <div class="font-bold flex items-center gap-2">
                        <span>โหมดเพื่อนช่วยเช็คงาน (Peer Assist View)</span>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">ปกป้องข้อมูลส่วนตัว</span>
                    </div>
                    <p class="text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                        ระบบแสดงคะแนนเก็บ รายการงานค้าง และสถานะการสอบซ่อม เพื่อให้เพื่อนช่วยเตือนกันได้สะดวก<br class="hidden sm:inline">
                        <span class="opacity-80">เกรดและคะแนนสอบทางการจะแสดงเมื่อเจ้าตัวเข้าสู่ระบบด้วยอีเมลโรงเรียน</span>
                    </p>
                </div>
            </div>
        ` : '';

        resultContainer.innerHTML = `
            <div class="student-card-container bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden anim-card-pop-in" data-student-id="${student.id}">
                <!-- Student Card Header -->
                <div class="student-card-header bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h2 class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-kanit break-words leading-tight">${student.name}</h2>
                        <div class="student-meta-row text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <span class="inline-flex items-center gap-1 bg-white dark:bg-gray-700 px-2.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-2xs">รหัส: <strong class="text-blue-600 dark:text-blue-400 font-mono">${student.id}</strong></span>
                            ${student.room ? `<span class="inline-flex items-center gap-1 bg-white dark:bg-gray-700 px-2.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-2xs">ห้อง: <strong class="text-blue-600 dark:text-blue-400">${student.room}</strong></span>` : ''}
                            ${student.ordinal ? `<span class="inline-flex items-center gap-1 bg-white dark:bg-gray-700 px-2.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-2xs">เลขที่: <strong class="text-blue-600 dark:text-blue-400">${student.ordinal}</strong></span>` : ''}
                            ${gradeBadgeHtml}
                        </div>
                    </div>
                </div>

                <div class="student-card-body space-y-6">
                    ${peerAssistNoticeHtml}
                    ${summaryCardsHtml}
                    ${summaryScoreSection}
                    ${quizCardsSection}
                    ${assignmentsSection}
                </div>

                <div id="edit-controls-container" class="p-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 ${isEditMode ? '' : 'hidden'}">
                    <button id="save-overrides-btn" data-studentid="${student.id}" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        สร้างโค้ดสำหรับบันทึกการแก้ไข
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners for the modal buttons
        document.getElementById('show-submitted-btn')?.addEventListener('click', () => {
            const submittedAssignments = trackableAssignments.filter(a => {
                const s = a.score;
                if (s === null || s === undefined) return false;
                const str = String(s).trim().toLowerCase();
                return str !== '' && str !== '-' && str !== 'ยังไม่ส่ง';
            });
            createInteractiveAssignmentModal('submitted', `งานที่ส่งแล้ว (${submittedAssignments.length} รายการ)`, submittedAssignments);
        });

        document.getElementById('show-missing-btn')?.addEventListener('click', () => {
            const missingAssignments = trackableAssignments.filter(a => {
                const s = a.score;
                if (s === null || s === undefined) return true;
                const str = String(s).trim().toLowerCase();
                return str === '' || str === '-' || str === 'ยังไม่ส่ง';
            });
            createInteractiveAssignmentModal('missing', `งานที่ค้างส่ง (${missingAssignments.length} รายการ)`, missingAssignments);
        });

        // Filter tabs logic
        const filterButtons = document.querySelectorAll('.assignment-filter-btn');
        const chapterDetails = document.querySelectorAll('.chapter-details');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                // Update active classes on buttons
                filterButtons.forEach(b => {
                    b.classList.remove('bg-white', 'dark:bg-gray-700', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');
                    b.classList.add('text-gray-600', 'dark:text-gray-400');
                });
                btn.classList.add('bg-white', 'dark:bg-gray-700', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');
                btn.classList.remove('text-gray-600', 'dark:text-gray-400');

                chapterDetails.forEach(details => {
                    const hasMissing = details.dataset.hasMissing === 'true';
                    const items = details.querySelectorAll('.assignment-item');

                    if (filter === 'missing') {
                        if (!hasMissing) {
                            details.classList.add('hidden');
                        } else {
                            details.classList.remove('hidden');
                            details.open = true; // Auto open chapters with missing work
                            items.forEach(item => {
                                item.classList.toggle('hidden', item.dataset.status !== 'missing');
                            });
                        }
                    } else if (filter === 'submitted') {
                        let visibleCount = 0;
                        items.forEach(item => {
                            const isSub = item.dataset.status === 'submitted';
                            item.classList.toggle('hidden', !isSub);
                            if (isSub) visibleCount++;
                        });
                        if (visibleCount === 0) {
                            details.classList.add('hidden');
                        } else {
                            details.classList.remove('hidden');
                        }
                    } else {
                        // 'all'
                        details.classList.remove('hidden');
                        items.forEach(item => item.classList.remove('hidden'));
                    }
                });
            });
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
                let existingOverrides = {};
                try {
                    const overrideModule = await import("../data/score-overrides.js");
                    if (overrideModule.encryptedScoreOverrides && overrideModule.encryptedScoreOverrides.trim() !== "") {
                        existingOverrides = JSON.parse(atob(overrideModule.encryptedScoreOverrides));
                    }
                } catch (e) {
                    console.log("No existing score-overrides.js found or it's empty, creating new one.");
                }

                const newOverrides = { ...existingOverrides };
                newOverrides[studentId] = { ...(existingOverrides[studentId] || {}), ...studentOverrides };

                const encryptedString = btoa(JSON.stringify(newOverrides, null, 2));
                overrideCodeContent.value = `export const encryptedScoreOverrides = "${encryptedString}"; `;

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
    let isSubmitted = false;

    if (isNaN(parseFloat(score))) {
        // Handle text-based scores like "ส่งแล้ว", "ยังไม่ส่ง"
        isSubmitted = Boolean(score && score.toString().trim() !== '' && score.toString().trim() !== '-' && score.toString().toLowerCase() !== 'ยังไม่ส่ง');
        const colorClass = isSubmitted
            ? 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 border border-green-200 dark:border-green-800'
            : 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 border border-red-200 dark:border-red-800';

        let displayScore = score || 'ยังไม่ส่ง';
        if (!isSubmitted && lowerCaseName.includes('quiz')) {
            displayScore = 'ขาด';
        }
        statusHtml = `<span class="px-2.5 py-0.5 text-xs font-semibold ${colorClass} rounded-full">${displayScore}</span>`;
    } else {
        // Handle numeric scores
        isSubmitted = true;
        const num = parseFloat(score);
        if (num >= 8 && lowerCaseName.includes('quiz')) {
            statusHtml = `<span class="inline-flex items-center gap-1 font-mono font-bold quiz-badge-gold px-2 py-0.5 rounded-full text-xs">⭐ ${score}</span>`;
        } else {
            statusHtml = `<span class="font-mono font-bold text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">${score}</span>`;
        }
    }

    const statusType = isSubmitted ? 'submitted' : 'missing';

    const contentHtml = `
    <div class="flex-grow min-w-0 pr-4">
        <span class="text-gray-800 dark:text-gray-200 text-sm font-medium">${displayName}</span>
    </div>
    <div class="flex items-center gap-2.5 flex-shrink-0">
        ${statusHtml}
        ${url ? `
            <span class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                ทำทันที ↗
            </span>
        ` : ''}
    </div>
    `;

    if (url) {
        return `<li class="assignment-item block" data-status="${statusType}"><a href="${url}" target="_blank" rel="noopener noreferrer" class="group flex justify-between items-center py-3 px-4 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">${contentHtml}</a></li>`;
    } else {
        return `<li class="assignment-item flex justify-between items-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200" data-status="${statusType}">${contentHtml}</li>`;
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


/**
 * Groups and orders assignments by chapter for display.
 * @param {Array<object>} assignments - The list of assignment objects for a student.
 * @returns {object} An object with chapter names as keys and arrays of assignments as values.
 */
export function groupAssignments(assignments) {
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
        } else if (name.includes('quiz')) {
            chapterKey = 'แบบทดสอบท้ายบท (Quiz)';
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

    // Specific request: Remove "บทที่ 5" (Term 2 only) and "แบบทดสอบท้ายบท (Quiz)" (always, as it's now in shortcuts)
    if (getCurrentSemester() === '2/2568') {
        delete orderedGroups['บทที่ 5'];
    }
    delete orderedGroups['แบบทดสอบท้ายบท (Quiz)'];

    return orderedGroups;
}
