import { init as initQuizApp } from './quiz-logic.js';
import { getSavedCustomQuizzes } from './custom-quiz-handler.js';
import { db } from './firebase-config.js';
import { doc, getDoc } from "firebase/firestore";
import { getDataModules } from './quiz-data-loader.js';
import { fetchAllQuizData } from './data-manager.js';
import { SiteConfig } from './site-config.js';

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
    // Use import.meta.glob to allow water importing
    const dataModules = getDataModules();
    console.log('[DEBUG] quiz-loader: Available modules keys:', Object.keys(dataModules));

    // Find quizzes-list in the glob mapping
    const quizzesListKey = Object.keys(dataModules).find(k => k.endsWith('quizzes-list.js'));
    if (!quizzesListKey) throw new Error('quizzes-list.js not found in data modules.');

    const { quizList } = await dataModules[quizzesListKey]();

    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    const quizId = urlParams.get('id') || urlParams.get('mode');
    console.log('[DEBUG] quiz-loader: quizId=', quizId);
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
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection Timeout: โหลดข้อมูลห้องช้าเกินไป')), 10000);
            });
            const lobbySnap = await Promise.race([getDoc(lobbyRef), timeoutPromise]);
            if (lobbySnap.exists()) {
                lobbyConfig = lobbySnap.data().quizConfig;
            }
        } catch (e) {
            console.error("Error fetching lobby config:", e);
            handleQuizError("ข้อผิดพลาดการเชื่อมต่อ", "ไม่สามารถดึงข้อมูลห้องได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
            return;
        }
    }

    // --- NEW: Handle Custom Quiz ---
    if (quizId && quizId.startsWith('custom_')) {
        let customQuizData = null;
        const allCustomQuizzes = await getSavedCustomQuizzes();
        customQuizData = allCustomQuizzes.find(q => q.customId === quizId);

        // Ensure storageKey exists (crucial for init logic)
        if (customQuizData && !customQuizData.storageKey) {
            customQuizData.storageKey = `quizState-${customQuizData.customId}`;
        }

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
        // Default timer mode from custom data, fallback to 'none'
        let finalTimerMode = customQuizData.timerMode || 'none';
        let lives = 1;

        if (lobbyConfig) {
            finalCustomTime = lobbyConfig.customTime;
            // Lobby might override timer settings
            if (lobbyConfig.timerMode) finalTimerMode = lobbyConfig.timerMode;
            lives = lobbyConfig.lives || 1;
        }

        const isChallenge = !!seedParam || !!lobbyId;

        // Pass finalTimerMode and isChallenge to init
        initQuizApp(customQuizData.questions, customQuizData.storageKey, customQuizData.title, finalCustomTime, action, isChallenge, lives, finalTimerMode);
        return;
    }

    // --- NEW: Handle Smart Focus Mode ---
    const mode = urlParams.get('mode');
    if (mode === 'smart_focus' || (mode === 'custom' && urlParams.get('topic'))) {
        const topicKey = urlParams.get('topic');
        if (!topicKey) {
            handleQuizError("ไม่พบหัวข้อ", "ไม่พบข้อมูลหัวข้อสำหรับการฝึกฝน");
            return;
        }

        try {
            populatePage("Smart Focus", "กำลังค้นหาโจทย์ที่เหมาะกับคุณ...");

            // 1. Get Keywords for this Topic from SiteConfig
            let keywords = [];
            let topicLabel = topicKey;

            // Check if it's a proficiency group
            if (SiteConfig.proficiencyGroups && SiteConfig.proficiencyGroups[topicKey]) {
                const group = SiteConfig.proficiencyGroups[topicKey];
                keywords = group.keywords || [];
                topicLabel = group.label || topicKey;
            } else {
                // Fallback: Use the key itself as a keyword plus cleaned chapter name
                const cleanTitle = topicKey.replace(/^บทที่\s*\d+\s*/i, '').trim();
                keywords = Array.from(new Set([topicKey, cleanTitle].filter(Boolean)));
            }

            // 2. Fetch All Data
            // We use the data-manager's fetchAllQuizData which caches results
            const { allQuestions } = await fetchAllQuizData();

            // 3. Filter Questions
            // Logic similar to what might be used in a search, but stricter or broader as needed
            const filteredQuestions = allQuestions.filter(q => {
                if (!q || !q.searchableText) return false;
                // Check if ANY keyword matches
                return keywords.some(k => k && q.searchableText.includes(k.toLowerCase()));
            });

            console.log(`[Smart Focus] Topic: "${topicLabel}" (${topicKey})`);
            console.log(`[Smart Focus] Keywords:`, keywords);
            console.log(`[Smart Focus] Found ${filteredQuestions.length} matching questions.`);

            if (filteredQuestions.length === 0) {
                handleQuizError("ไม่พบโจทย์", `ไม่พบโจทย์ที่เกี่ยวกับ "${topicLabel}" ในขณะนี้`);
                return;
            }

            // 4. Randomize and Limit (Optional: limit to 20 or 30 questions)
            const rng = mulberry32(Date.now()); // Random seed
            for (let i = filteredQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
            }

            const selectedQuestions = filteredQuestions.slice(0, 30); // Limit to 30 items for focus

            populatePage(`Smart Focus: ${topicLabel}`, `แบบฝึกหัดเน้นจุดอ่อนของคุณในเรื่อง "${topicLabel}" จำนวน ${selectedQuestions.length} ข้อ`);

            initQuizApp(selectedQuestions, `quizState-smartfocus-${topicKey}`, `Smart Focus: ${topicLabel}`, null, action, true, 1, 'none');
            return;

        } catch (error) {
            console.error("Smart Focus Error:", error);
            handleQuizError("เกิดข้อผิดพลาด", "ไม่สามารถสร้างแบบฝึกฝน Smart Focus ได้");
            return;
        }
    }

    // --- NEW: Handle Random / Boss Raid Quiz ---
    if (quizId === 'random' || quizId === 'boss') {
        try {
            const amount = parseInt(urlParams.get('amount')) || 20;
            const seed = parseInt(urlParams.get('seed')) || Date.now();
            const categoryFilter = (urlParams.get('category') || 'all').toLowerCase();

            let titleText = "แบบทดสอบสุ่มท้าทาย (Boss Raid)";
            let subText = "แบบทดสอบที่สุ่มจากคลังข้อสอบเพื่อท้าทายบอสประจำสัปดาห์";

            if (categoryFilter === 'physics') {
                titleText = "⚔️ ท้าทายบอสควอนตัม (หมวดฟิสิกส์)";
                subText = "แบบทดสอบสุ่มในหมวดฟิสิกส์ ทุกคำตอบที่ถูกต้องจะลด HP ของบอสลง 5 HP!";
            } else if (categoryFilter === 'earth') {
                titleText = "⚔️ ท้าทายบอสธรณี (หมวดวิทย์โลก)";
                subText = "แบบทดสอบสุ่มในหมวดวิทย์โลก & ธรณีวิทยา ทุกคำตอบที่ถูกต้องจะลด HP ของบอสลง 5 HP!";
            } else if (categoryFilter === 'astronomy') {
                titleText = "⚔️ ท้าทายบอสหลุมดำ (หมวดดาราศาสตร์)";
                subText = "แบบทดสอบสุ่มในหมวดดาราศาสตร์ ทุกคำตอบที่ถูกต้องจะลด HP ของบอสลง 5 HP!";
            }

            populatePage(titleText, subText);

            const promises = quizList.map(async (q) => {
                if (!q) return null;
                // Category Filter
                if (categoryFilter !== 'all') {
                    const qCat = (q.category || '').toLowerCase();
                    const qSub = (q.subCategory || '').toLowerCase();
                    const qId = (q.id || '').toLowerCase();

                    let isMatch = false;
                    if (categoryFilter === 'physics' && (qCat.includes('physics') || qId.startsWith('phy_'))) isMatch = true;
                    else if (categoryFilter === 'earth' && (qCat.includes('earth') || qId.startsWith('ess_'))) isMatch = true;
                    else if (categoryFilter === 'astronomy' && (qCat.includes('astro') || qSub.includes('ดาราศาสตร์') || qId.includes('astro'))) isMatch = true;

                    if (!isMatch) return null;
                }

                // Fix for missing path prefixes (matching logic in data-manager.js):
                const targetQuizId = q.id;
                const expectedSuffix = `${targetQuizId}-data.js`;
                const path = Object.keys(dataModules).find(k => {
                    if (targetQuizId.includes('/')) {
                        return k.endsWith(`${targetQuizId}-data.js`);
                    } else {
                        const possibleFolders = ['phy_m4/', 'phy_m5/', 'phy_m6/', 'ess_basic/', 'ess_adv/'];
                        return k.endsWith(expectedSuffix) || possibleFolders.some(f => k.endsWith(`${f}${expectedSuffix}`));
                    }
                });

                if (!dataModules[path]) return null;

                try {
                    const m = await dataModules[path]();
                    return { module: m, info: q };
                } catch (e) {
                    return null;
                }
            });
            const results = await Promise.all(promises);

            let allQuestions = [];
            results.forEach(res => {
                if (res && res.module) {
                    const data = res.module.quizItems || res.module.quizData || [];
                    allQuestions = allQuestions.concat(processQuizData(data, res.info));
                }
            });

            if (allQuestions.length === 0) {
                // Fallback: If no category matches, load all questions
                const fallbackPromises = quizList.map(async (q) => {
                    if (!q) return null;
                    const path = Object.keys(dataModules).find(k => k.endsWith(`${q.id}-data.js`));
                    if (!dataModules[path]) return null;
                    try {
                        const m = await dataModules[path]();
                        return { module: m, info: q };
                    } catch (e) { return null; }
                });
                const fallbackResults = await Promise.all(fallbackPromises);
                fallbackResults.forEach(res => {
                    if (res && res.module) {
                        const data = res.module.quizItems || res.module.quizData || [];
                        allQuestions = allQuestions.concat(processQuizData(data, res.info));
                    }
                });
            }

            const rng = mulberry32(seed);
            for (let i = allQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
            }
            const selectedQuestions = allQuestions.slice(0, amount);

            let customTime = null;
            let timerMode = 'none';
            let lives = 1;

            if (lobbyConfig) {
                customTime = lobbyConfig.customTime;
                timerMode = lobbyConfig.timerMode || 'none';
                lives = lobbyConfig.lives || 1;
            }

            initQuizApp(selectedQuestions, `quizState-challenge-${seed}`, "Challenge Mode", customTime, action, true, lives, timerMode);
            return;
        } catch (error) {
            console.error("Error generating random quiz:", error);
            handleQuizError("เกิดข้อผิดพลาด", "ไม่สามารถสร้างแบบทดสอบสุ่มได้");
            return;
        }
    }

    try {
        if (!quizId) {
            handleQuizError("ไม่พบ ID ของแบบทดสอบ", "กรุณาตรวจสอบ URL หรือกลับไปที่หน้าหลักเพื่อเลือกแบบทดสอบ");
            return;
        }

        const quizInfo = quizList.filter(q => q).find(q => q.id === quizId);
        if (!quizInfo) {
            handleQuizError("ไม่พบข้อมูลแบบทดสอบ", `ไม่พบแบบทดสอบสำหรับ ID: ${quizId}`);
            return;
        }

        // Fix for missing path prefixes (matching logic in data-manager.js):
        const expectedSuffix = `${quizId}-data.js`;
        let scriptPath = Object.keys(dataModules).find(k => {
            if (quizId.includes('/')) {
                return k.endsWith(`${quizId}-data.js`);
            } else {
                // Check if it's in a suspected folder
                const possibleFolders = ['phy_m4/', 'phy_m5/', 'phy_m6/', 'ess_basic/', 'ess_adv/'];
                return k.endsWith(expectedSuffix) || possibleFolders.some(f => k.endsWith(`${f}${expectedSuffix}`));
            }
        });
        console.log('[DEBUG] quiz-loader: Resolved scriptPath=', scriptPath);

        if (!dataModules[scriptPath]) {
            console.error('[DEBUG] quiz-loader: Exact match failed for', scriptPath);
            // Try fallback: find key that ends with the expected filename
            // path normalization might be needed
            const expectedSuffix = `${quizId}-data.js`;
            const foundKey = Object.keys(dataModules).find(k => k.endsWith(expectedSuffix) || k.includes(quizId));

            if (foundKey) {
                console.log('[DEBUG] quiz-loader: Used fallback key:', foundKey);
                scriptPath = foundKey;
            } else {
                console.error('[DEBUG] quiz-loader: scriptPath not found in dataModules. Keys:', Object.keys(dataModules));
                // Pass debug info to error screen
                throw new Error(`Data module not found: ${scriptPath} (Keys: ${Object.keys(dataModules).length})`);
            }
        }

        const module = await dataModules[scriptPath]();
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
        let timerMode = 'none'; // Default to none

        if (lobbyConfig) {
            customTime = lobbyConfig.customTime;
            lives = lobbyConfig.lives || 1;
            timerMode = lobbyConfig.timerMode || 'none';
        }

        // Determine isChallenge based on seedParam OR lobbyId
        const isChallenge = !!seedParam || !!lobbyId;

        initQuizApp(processedQuizData, quizInfo.storageKey, quizInfo.title, customTime, action, isChallenge, lives, timerMode);

    } catch (error) {
        console.error(`Error loading quiz data for ID ${quizId}:`, error);
        handleQuizError("เกิดข้อผิดพลาดในการโหลดข้อมูล", error.message);
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
