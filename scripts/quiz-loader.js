
import { init as initQuizApp } from './quiz-logic.js';
import { getSavedCustomQuizzes } from './custom-quiz-handler.js';
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Populates the common elements of the quiz page (titles, descriptions).
 * @param {string} title The main title for the quiz.
 * @param {string} description The description for the quiz.
 */
function populatePage(title, description) {
    document.title = title;
    const startScreenTitle = document.getElementById('start-screen-title');
    const startScreenDesc = document.getElementById('start-screen-description');
    if (startScreenTitle) startScreenTitle.textContent = title;
    if (startScreenDesc) startScreenDesc.textContent = description;
}

/**
 * Helper function to process raw quiz data (handling scenarios, etc.)
 */
function processQuizData(data, quizInfo) {
    const processed = [];
    for (const item of data) {
        if (!item) continue;

        if (item.type === 'scenario' && Array.isArray(item.questions)) {
            const title = item.title || '';
            const rawDescription = item.description || '';
            const description = rawDescription.replace(/(src\s*=\s*["'])\/?assets\//g, '$1../assets/').replace(/\n/g, '<br>');

            for (const question of item.questions) {
                if (question) {
                    processed.push({
                        ...question,
                        type: question.type || 'question',
                        question: `<div class="p-4 mb-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg"><p class="font-bold text-lg">${title}</p><div class="mt-2 text-gray-700 dark:text-gray-300">${description}</div></div>${question.question}`,
                        sourceQuizTitle: quizInfo.title,
                        sourceQuizCategory: quizInfo.category
                    });
                }
            }
        } else {
            processed.push({
                ...item,
                type: item.type || 'question',
                sourceQuizTitle: quizInfo.title,
                sourceQuizCategory: quizInfo.category
            });
        }
    }
    return processed;
}

// Simple seeded random number generator
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export async function initializeQuiz() {
    const { quizList } = await import(`../data/quizzes-list.js?v=${Date.now()}`);

    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    const quizId = urlParams.get('id');
    const lobbyId = urlParams.get('lobbyId');
    const action = urlParams.get('action');

    if (action === 'view_results') {
        const startScreen = document.getElementById('start-screen');
        if (startScreen) startScreen.classList.add('hidden');
    }

    // --- NEW: Fetch Lobby Config ---
    let lobbyConfig = null;
    if (lobbyId) {
        try {
            const lobbyRef = doc(db, 'lobbies', lobbyId);
            const lobbySnap = await getDoc(lobbyRef);
            if (lobbySnap.exists()) {
                lobbyConfig = lobbySnap.data().quizConfig;
            }
        } catch (e) {
            console.error("Error fetching lobby config:", e);
        }
    }

    // --- NEW: Handle Custom Quiz ---
    if (quizId && quizId.startsWith('custom_')) {
        let customQuizData = null;
        const allCustomQuizzes = await getSavedCustomQuizzes();
        customQuizData = allCustomQuizzes.find(q => q.customId === quizId);

        if (!customQuizData && lobbyConfig && lobbyConfig.customQuestions) {
            customQuizData = {
                customId: quizId,
                title: lobbyConfig.title,
                description: lobbyConfig.description,
                questions: lobbyConfig.customQuestions,
                timerMode: lobbyConfig.timerMode || 'none',
                customTime: lobbyConfig.customTime || null,
                storageKey: `quizState-${quizId}`
            };
        }

        if (!customQuizData) {
            handleQuizError("ไม่พบข้อมูลแบบทดสอบ", `ไม่พบข้อมูลแบบทดสอบที่สร้างเองสำหรับ ID: ${quizId}`);
            return;
        }

        populatePage(customQuizData.title, customQuizData.description);

        let finalCustomTime = customQuizData.customTime;
        let lives = 1;
        if (lobbyConfig) {
            finalCustomTime = lobbyConfig.customTime;
            lives = lobbyConfig.lives || 1;
        }

        initQuizApp(customQuizData.questions, customQuizData.storageKey, customQuizData.title, finalCustomTime, action, false, lives);
        return;
    }

    // --- NEW: Handle Random Quiz (for Challenge Mode) ---
    if (quizId === 'random') {
        try {
            const amount = parseInt(urlParams.get('amount')) || 20;
            const seed = parseInt(urlParams.get('seed')) || Date.now();
            populatePage("แบบทดสอบสุ่ม (Challenge)", "แบบทดสอบที่สุ่มจากคลังข้อสอบทั้งหมด");

            const promises = quizList.map(q => import(`../data/${q.id}-data.js?v=${Date.now()}`).then(m => ({ module: m, info: q })).catch(e => null));
            const results = await Promise.all(promises);

            let allQuestions = [];
            results.forEach(res => {
                if (res && res.module) {
                    const data = res.module.quizItems || res.module.quizData || [];
                    allQuestions = allQuestions.concat(processQuizData(data, res.info));
                }
            });

            const rng = mulberry32(seed);
            for (let i = allQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
            }
            const selectedQuestions = allQuestions.slice(0, amount);

            let customTime = null;
            let lives = 1;
            if (lobbyConfig) {
                customTime = lobbyConfig.customTime;
                lives = lobbyConfig.lives || 1;
            }

            initQuizApp(selectedQuestions, `quizState-challenge-${seed}`, "Challenge Mode", customTime, action, true, lives);
            return;
        } catch (error) {
            console.error("Error generating random quiz:", error);
            handleQuizError("เกิดข้อผิดพลาด", "ไม่สามารถสร้างแบบทดสอบสุ่มได้");
            return;
        }
    }

    if (!quizId) {
        handleQuizError("ไม่พบ ID ของแบบทดสอบ", "กรุณาตรวจสอบ URL หรือกลับไปที่หน้าหลักเพื่อเลือกแบบทดสอบ");
        return;
    }

    const quizInfo = quizList.filter(q => q).find(q => q.id === quizId);
    if (!quizInfo) {
        handleQuizError("ไม่พบข้อมูลแบบทดสอบ", `ไม่พบแบบทดสอบสำหรับ ID: ${quizId}`);
        return;
    }

    try {
        // Fix for missing path prefixes (matching logic in data-manager.js):
        let scriptPath;
        if (quizId.includes('/')) {
            scriptPath = `../data/${quizId}-data.js?v=${Date.now()}`;
        } else {
            // Auto-detect folder based on ID prefix
            let folder = '';
            if (quizId.startsWith('phy_m4')) folder = 'phy_m4/';
            else if (quizId.startsWith('phy_m5')) folder = 'phy_m5/';
            else if (quizId.startsWith('phy_m6')) folder = 'phy_m6/';
            else if (quizId.startsWith('ess_basic')) folder = 'ess_basic/';
            else if (quizId.startsWith('ess_adv')) folder = 'ess_adv/';

            scriptPath = `../data/${folder}${quizId}-data.js?v=${Date.now()}`;
        }
        const module = await import(scriptPath);
        const data = module.quizItems || module.quizData || [];

        if (!data || !Array.isArray(data)) {
            handleQuizError("เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม", `ไม่พบข้อมูลคำถามที่ถูกต้อง`);
            return;
        }

        let processedQuizData = processQuizData(data, quizInfo);

        if (seedParam) {
            const seed = parseInt(seedParam);
            const rng = mulberry32(seed);
            for (let i = processedQuizData.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [processedQuizData[i], processedQuizData[j]] = [processedQuizData[j], processedQuizData[i]];
            }
        }

        populatePage(quizInfo.title, quizInfo.description);

        let customTime = null;
        let lives = 1;
        if (lobbyConfig) {
            customTime = lobbyConfig.customTime;
            lives = lobbyConfig.lives || 1;
        }

        initQuizApp(processedQuizData, quizInfo.storageKey, quizInfo.title, customTime, action, !!seedParam, lives);

    } catch (error) {
        console.error(`Error loading quiz data for ID ${quizId}:`, error);
        handleQuizError("เกิดข้อผิดพลาดในการโหลดข้อมูล", `เกิดข้อผิดพลาดที่ไม่คาดคิด`);
    }
}

function handleQuizError(title, message) {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.innerHTML = `
            <h1 class="text-2xl sm:text-3xl font-bold text-center text-red-500 dark:text-red-400 mb-4">${title}</h1>
            <p class="text-center text-gray-600 dark:text-gray-400 mb-8">${message}</p>
            <a href="../index.html" class="w-full max-w-xs mx-auto block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300 text-center">
                กลับไปหน้าหลัก
            </a>
        `;
    }
    document.title = "เกิดข้อผิดพลาด";
}