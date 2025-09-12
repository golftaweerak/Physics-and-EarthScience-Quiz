import { getStudentScores } from './data-manager.js';
import { ModalHandler } from './modal-handler.js';

let originalScoresData = [];
let studentScores = [];
let scoreKeys = [];

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
    const tablePlaceholder = document.getElementById('table-placeholder');

    // Modals for code generation
    const overrideCodeModal = new ModalHandler('override-code-modal');
    const overrideCodeContent = document.getElementById('override-code-content');
    const logDataContent = document.getElementById('log-data-content');
    const copyOverrideCodeBtn = document.getElementById('copy-override-code-btn');
    const copyLogDataBtn = document.getElementById('copy-log-data-btn');

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
            } else {
                tableContainer.innerHTML = '';
                tableContainer.appendChild(tablePlaceholder);
                actionContainer.classList.add('hidden');
            }
        });

        generateBtn.addEventListener('click', handleGenerateOverrides);

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

        const preferredOrder = ['id', 'name', 'ordinal', 'รวม [100]', 'เกรด', 'ก่อนกลางภาค [25]', 'กลางภาค [20]', 'หลังกลางภาค [25]'];
        const allKeys = new Set();
        studentsInRoom.forEach(student => {
            Object.keys(student).forEach(key => {
                if (key !== 'assignments' && !preferredOrder.includes(key)) {
                    allKeys.add(key);
                }
            });
        });

        scoreKeys = [...preferredOrder, ...Array.from(allKeys).sort()];

        const headHtml = `<tr>${scoreKeys.map(key => `<th class="sticky top-0 px-2 py-2 bg-gray-100 dark:bg-gray-900 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider z-10">${key}</th>`).join('')}</tr>`;

        const bodyHtml = studentsInRoom.map(student => {
            return `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50" data-student-id="${student.id}">
                ${scoreKeys.map(key => {
                const value = student[key] ?? '';
                const isReadonly = ['id', 'name', 'ordinal'].includes(key);
                const inputType = (typeof value === 'number' && !isReadonly && key !== 'เกรด') ? 'number' : 'text';
                const step = (typeof value === 'number' && !Number.isInteger(value)) ? 'any' : '1';
                return `<td class="border-r dark:border-gray-600 p-0">
                        <input 
                            type="${inputType}" 
                            ${inputType === 'number' ? `step="${step}"` : ''}
                            data-key="${key}" 
                            value="${value}" 
                            class="w-full h-full p-2 bg-transparent focus:bg-blue-50 dark:focus:bg-blue-900/50 outline-none focus:ring-1 focus:ring-blue-500 text-center text-sm ${isReadonly ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200'}"
                            ${isReadonly ? 'readonly' : ''}
                        >
                    </td>`;
            }).join('')}
            </tr>`;
        }).join('');

        tableContainer.innerHTML = `
            <div class="overflow-auto modern-scrollbar border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-h-[70vh]">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="sticky top-0 z-10">${headHtml}</thead>
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