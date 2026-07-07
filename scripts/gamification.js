// scripts/gamification.js

import { authManager } from './auth-manager.js';
import { showToast } from './toast.js';
import { escapeHtml } from './utils.js';
import { SiteConfig } from './site-config.js';
import {
    BADGES,
    DAILY_QUESTS,
    ACHIEVEMENTS,
    SHOP_ITEMS,
    XP_THRESHOLDS,
    THEME_DEFINITIONS
} from '../data/gamification-registry.js';
import { quizList } from '../data/quizzes-list.js'; // Import quizList for metadata lookup
export { BADGES, DAILY_QUESTS, ACHIEVEMENTS, SHOP_ITEMS, XP_THRESHOLDS, THEME_DEFINITIONS };

// ชื่อยศสำหรับแต่ละสาย (Titles)
// ผู้เล่นจะได้รับฉายาตามเลเวลที่ทำได้ในแต่ละสาย (Overall, Physics, Earth Science)
// โดยระบบจะเลือกฉายาจาก Array นี้ตามลำดับเลเวล (Level 1 = Index 0)
// หากเลเวลเกินจำนวนฉายาที่มี จะใช้ฉายาสูงสุดที่มีอยู่
export const TRACK_TITLES = SiteConfig.trackTitles;

// คงไว้เพื่อความเข้ากันได้ (Backward Compatibility) และใช้อ้างอิง
export const LEVELS = XP_THRESHOLDS.map((t, i) => ({
    level: t.level,
    xp: t.xp,
    title: TRACK_TITLES.overall[i] || "Unknown"
}));

// NEW: Proficiency Groups (Shared definition)
export const PROFICIENCY_GROUPS = SiteConfig.proficiencyGroups;

// Data moved to gamification-registry.js

// Theme definitions correctly imported from registry.js


export function getAvatarFrameClass(avatar, size = 'default') { // 'default' or 'small'
    const shopItem = SHOP_ITEMS.find(i => i.value === avatar && i.type === 'avatar');
    if (!shopItem) return 'ring-2 ring-gray-200 dark:ring-gray-700'; // Default

    const ringWidth = size === 'small' ? 'ring-1' : 'ring-2';

    if (shopItem.cost >= 1000) return `${ringWidth} ring-yellow-400 legendary-frame`;
    if (shopItem.cost >= 500) return `${ringWidth} ring-purple-500`;
    return `${ringWidth} ring-green-500`;
}

export function getLevelBorderClass(level) {
    if (level >= 20) return 'bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 animate-pulse'; // Rainbow
    if (level >= 15) return 'bg-gradient-to-br from-cyan-300 to-blue-500'; // Diamond
    if (level >= 10) return 'bg-gradient-to-br from-yellow-300 to-amber-500'; // Gold
    if (level >= 5) return 'bg-gradient-to-br from-blue-400 to-cyan-500'; // Sapphire
    return 'bg-gray-300 dark:bg-gray-600'; // Bronze/Gray
}

let instance = null;

export class Gamification {
    constructor() {
        if (instance) return instance;
        instance = this;

        this.storageKey = 'app_gamification_data';
        this.authManager = authManager;

        // NEW: ตัวแปรสำหรับป้องกันการส่งคะแนนซ้ำ (ไม่บันทึกลง Storage)
        this.lastProcessedQuiz = {
            id: null,
            timestamp: 0
        };

        const isNewToGamification = !localStorage.getItem(this.storageKey);

        this.state = this.loadState();

        // NEW: ตรวจสอบความถูกต้องของข้อมูลทันทีที่โหลดจาก LocalStorage
        // ฟังก์ชันนี้จะช่วยแก้ปัญหา Data Inconsistency เช่น XP รวมน้อยกว่า XP ย่อย
        // ซึ่งอาจเกิดจากการซิงค์ข้อมูลผิดพลาดในเวอร์ชันก่อนหน้า
        if (this.ensureConsistency()) {
            this.saveState();
        }

        // ใช้ ISO string (YYYY-MM-DD) ที่อ้างอิงตาม local time เพื่อความเสถียรข้ามเบราว์เซอร์
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const today = (new Date(now - offset)).toISOString().split('T')[0];
        
        if (this.state.lastQuestDate !== today || !this.state.activeQuests || this.state.activeQuests.length === 0) {
            this.state.activeQuests = this.generateDailyQuests();
            this.state.rerolls = 3;
            this.state.lastQuestDate = today;
            this.state.dailyQuizCount = 0; // Reset daily quiz count
            this.state.dailyQuest = null; // Clear legacy quest data if any
        }

        // Initial level up check in case quests were completed offline
        // and the user just came back online.
        this.updateLevel();
        this.saveState();

        if (isNewToGamification) {
            // Defer heavy recalculation to keep startup smooth
            setTimeout(() => this.recalculateFromHistory(), 500);
        }

        this.updateStreak();
        this.applyTheme(this.state.selectedTheme);
        this.updateHeaderAvatar();

        // IMPROVEMENT: Cross-tab synchronization
        // เมื่อมีการเปลี่ยนแปลงข้อมูลใน Tab อื่น ให้โหลดข้อมูลใหม่และอัปเดตหน้าจอนี้ทันที
        this.storageListener = (e) => {
            if (e.key === this.storageKey) {
                this.state = this.loadState();
                this.onStateUpdated();
            }
        };
        window.addEventListener('storage', this.storageListener);

        // เชื่อมต่อกับ AuthManager เพื่อโหลดข้อมูลเมื่อสถานะ Login เปลี่ยนแปลง
        this.unsubscribeAuth = this.authManager.onUserChange(async (user) => {
            // โหลดข้อมูลล่าสุด (จะจัดการให้เองว่ามาจาก Cloud หรือ Local)
            try {
                const data = await this.authManager.loadUserData();
                if (data) {
                    // Merge data from Cloud with Default State for completeness
                    this.state = { ...this.getDefaultState(), ...data };

                    // NEW: Defer recalculation on login
                    setTimeout(() => this.recalculateFromHistory(), 200);

                    // --- Data Consistency Check & Correction ---
                    // เรียกใช้ฟังก์ชันตรวจสอบความถูกต้องที่สร้างขึ้นใหม่
                    // เพื่อให้มั่นใจว่าข้อมูลจาก Cloud ถูกต้องก่อนนำไปใช้งาน
                    let needsSave = this.ensureConsistency();

                    // Auto-update name from Google account on first login (if still default)
                    if (user) {
                        const isDefaultName = this.state.displayName === 'ผู้เรียน (Guest)' || !this.state.displayName;
                        if (isDefaultName) {
                            this.state.displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'ผู้เรียน');
                            needsSave = true;
                        }
                    }

                    if (needsSave) {
                        this.saveState(); // Save corrected data back to the cloud
                    }

                    // Check Streak and update UI
                    this.updateStreak();
                    this.onStateUpdated();
                }
            } catch (error) {
                console.error("Failed to load user data on auth change (client might be offline):", error);
                // Even if cloud fails, we can still proceed with local data.
                // The state is already loaded from localStorage in the constructor.
                // We can just trigger a UI update to be safe.
                this.onStateUpdated();
            }
        });
    }

    // NEW: ฟังก์ชันสำหรับทำลาย Instance และล้าง Listeners เพื่อป้องกัน Memory Leak
    destroy() {
        if (this.storageListener) {
            window.removeEventListener('storage', this.storageListener);
        }
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
        if (this.headerObserver) {
            this.headerObserver.disconnect();
            this.headerObserver = null;
        }
        instance = null;
    }

    // เพิ่มฟังก์ชันใหม่สำหรับตรวจสอบความถูกต้องของข้อมูล XP
    // Logic: วนลูปหาผลรวม XP ของแต่ละหมวดย่อย (Proficiency) แล้วเทียบกับ XP หลัก (Physics/Earth)
    // หาก XP หลักน้อยกว่าผลรวม (ซึ่งเป็นไปไม่ได้ในทางทฤษฎี) ระบบจะปรับค่า XP หลักให้เท่ากับผลรวมทันที
    ensureConsistency() {
        let needsSave = false;

        // 1. ตรวจสอบค่าพื้นฐาน
        if (typeof this.state.xp !== 'number') { this.state.xp = Number(this.state.xp) || 0; needsSave = true; }
        if (typeof this.state.level !== 'number') { this.state.level = Number(this.state.level) || 1; needsSave = true; }

        // 2. เตรียมตัวแปรสำหรับคำนวณผลรวมของแต่ละ Track
        const calculatedTrackXPs = {};
        SiteConfig.categories.forEach(cat => {
            if (typeof this.state[cat.id] !== 'number') {
                this.state[cat.id] = Number(this.state[cat.id]) || 0;
                needsSave = true;
            }
            calculatedTrackXPs[cat.track] = 0;
        });

        // 3. คำนวณผลรวม XP จากหมวดย่อย (Proficiency Groups)
        for (const group of Object.values(PROFICIENCY_GROUPS)) {
            const groupXP = Number(this.state[group.field]) || 0;

            if (this.state[group.field] !== groupXP && this.state[group.field] !== undefined) {
                this.state[group.field] = groupXP;
                needsSave = true;
            }

            if (calculatedTrackXPs[group.track] !== undefined) {
                calculatedTrackXPs[group.track] += groupXP;
            }
        }

        // 4. แก้ไข XP ของสายวิชาหลักหากน้อยกว่าผลรวมของหมวดย่อย
        // (XP หลักอาจจะมากกว่าได้ หากได้จากโจทย์ทั่วไป แต่ห้ามน้อยกว่า)
        SiteConfig.categories.forEach(cat => {
            const calculated = calculatedTrackXPs[cat.track];
            if (this.state[cat.id] < calculated) {
                console.log(`Correcting ${cat.id} from ${this.state[cat.id]} to ${calculated}`);
                this.state[cat.id] = calculated;
                needsSave = true;
            }
        });

        // 5. Ensure theory and calculation XP exist
        if (typeof this.state.theoryXP !== 'number') { this.state.theoryXP = 0; needsSave = true; }
        if (typeof this.state.calculationXP !== 'number') { this.state.calculationXP = 0; needsSave = true; }
        if (typeof this.state.itemUsageCount !== 'number') { this.state.itemUsageCount = 0; needsSave = true; }

        // 6. Reconcile Total XP with the sum of its parts
        // This ensures that data from older versions (without generalXP) is corrected.
        let sumOfParts = (this.state.generalXP || 0);
        SiteConfig.categories.forEach(cat => {
            sumOfParts += (this.state[cat.id] || 0);
        });

        if (this.state.xp > sumOfParts) {
            const difference = this.state.xp - sumOfParts;
            if (this.state.generalXP === 0 || difference < 5000) {
                this.state.generalXP = (this.state.generalXP || 0) + difference;
                needsSave = true;
            } else {
                this.state.xp = sumOfParts;
                needsSave = true;
            }
        }

        // --- NEW: Migrate legacy XP to Level ---
        // Fixes the issue where existing users with high XP were stuck at Level 1
        // because they didn't complete newly introduced quest requirements.
        if (!this.state.legacyMigrated && this.state.xp >= 100) {
            let migratedLevel = 1;
            for (const threshold of XP_THRESHOLDS) {
                if (this.state.xp >= threshold.xp) {
                    migratedLevel = threshold.level;
                } else {
                    break;
                }
            }
            if (migratedLevel > this.state.level) {
                console.log(`Migrating legacy user from Level ${this.state.level} to Level ${migratedLevel} based on ${this.state.xp} XP.`);
                this.state.level = migratedLevel;
            }
            this.state.legacyMigrated = true;
            needsSave = true;
        }

        // --- NEW: Perform global achievement and badge check ---
        // This catches any missed unlocks from bugs or sync issues
        const newAchievements = this.checkAchievements();
        if (newAchievements.length > 0) needsSave = true;

        if (needsSave) {
            this.saveState();
        }
    }

    getDefaultState() {
        const state = {
            level: 1,
            xp: 0,
            badges: [],
            quizzesCompleted: 0,
            lastLogin: null,
            streak: 0,
            activeQuests: [],
            rerolls: 3,
            lastQuestDate: null,
            avatar: '🧑‍🎓',
            displayName: 'ผู้เรียน (Guest)',
            totalCorrectAnswers: 0,
            questHistory: [],
            unlockedAchievements: [],
            selectedTitle: null,
            inventory: [],
            consumables: {},
            selectedTheme: null,
            correctStreak: 0,
            perfectScores: 0,
            highScores80: 0,
            weekendQuizzesCompleted: 0,
            freeNameChangeAvailable: true, generalXP: 0, accumulatedQuestionsForBonus: 0,
            totalSpentXP: 0, // NEW: ติดตามยอด XP ที่ใช้ไปทั้งหมด (ป้องกันการคืน XP จากไอเทมที่ใช้แล้ว)
            theoryXP: 0, // NEW: สะสม XP จากข้อทฤษฎี
            calculationXP: 0, // NEW: สะสม XP จากข้อคำนวณ
            itemUsageCount: 0, // NEW: จำนวนครั้งที่ใช้ไอเทม
            theoryXP: 0, // NEW: สะสม XP จากข้อทฤษฎี
            calculationXP: 0, // NEW: สะสม XP จากข้อคำนวณ
            itemUsageCount: 0, // NEW: จำนวนครั้งที่ใช้ไอเทม
            lastQuizTime: null, // NEW: เก็บเวลาที่ทำชุดโจทย์ล่าสุด
            totalQuestionsAnswered: 0 // NEW: Track total questions for accuracy calc
        };

        // Dynamic Categories
        SiteConfig.categories.forEach(cat => {
            state[cat.id] = 0;
        });

        // Dynamic Proficiency Fields
        Object.values(PROFICIENCY_GROUPS).forEach(group => {
            state[group.field] = 0;
        });

        return state;
    }

    // ฟังก์ชันสำหรับลบ XP ที่เฟ้อเกินจริง (เรียกใช้เมื่อต้องการล้างค่าที่ผิดปกติ)
    fixInflatedXP() {
        let sumOfParts = (this.state.generalXP || 0);
        SiteConfig.categories.forEach(cat => {
            sumOfParts += (this.state[cat.id] || 0);
        });

        if (this.state.xp > sumOfParts) {
            const difference = this.state.xp - sumOfParts;
            console.log(`Removing inflated XP: ${difference}. Resetting total XP from ${this.state.xp} to ${sumOfParts}.`);
            this.state.xp = sumOfParts;
            this.saveState();
            return true;
        }
        return false;
    }

    updateLevel() {
        let leveledUp = false;
        let safetyCounter = 0; // NEW: Safety counter to prevent infinite loops
        // Loop to handle multiple level-ups in one go, but sequentially.
        while (true) {
            if (safetyCounter++ > 50) {
                console.warn("Possible infinite loop detected in updateLevel. Breaking.");
                break;
            }
            const currentLevel = parseInt(this.state.level) || 1;
            // OPTIMIZATION: Direct array access is faster than find() since thresholds are sorted
            // XP_THRESHOLDS[0] is Level 1. XP_THRESHOLDS[currentLevel] is the threshold for Level (currentLevel + 1)
            const nextLevelThreshold = XP_THRESHOLDS[currentLevel];

            if (!nextLevelThreshold) {
                break; // Max level reached
            }

            // Check if XP and quest conditions are met for the *next* level
            if (this.state.xp >= nextLevelThreshold.xp && this.isQuestCompleted(nextLevelThreshold.quest)) {
                this.state.level = currentLevel + 1;
                leveledUp = true;
            } else {
                break; // Cannot level up further
            }
        }
        return leveledUp;
    }

    loadState() {
        let state = null;
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                state = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error loading gamification state from storage:", e);
        }

        // IMPROVEMENT: Define Default State clearly
        // Merge loaded state with defaults to ensure all keys exist (Robustness)
        state = { ...this.getDefaultState(), ...(state || {}) };

        return state;
    }

    // ฟังก์ชันสำหรับดึงข้อมูลการทำโจทย์เก่าๆ มาคำนวณเป็น XP เริ่มต้น
    // Logic: สแกน LocalStorage หา key ที่ขึ้นต้นด้วย 'quizState-'
    // แล้วคำนวณ XP ย้อนหลังให้ผู้ใช้ที่เคยเล่นก่อนมีระบบ Gamification
    recalculateFromHistory() { // Renamed from syncProgress to be a general purpose recalculation tool
        let totalXP = 0;
        const accumulatedTrackXPs = {};
        SiteConfig.categories.forEach(c => accumulatedTrackXPs[c.id] = 0);

        let completed = 0;
        let totalCorrect = 0;
        let perfectScores = 0;
        let highScores80 = 0;
        const topicXPs = {};
        let weekendQuizzes = 0;
        let generalQuizXP = 0;
        let totalQuestionsAnswered = 0; // NEW: นับจำนวนข้อที่ตอบทั้งหมดเพื่อคำนวณ Bonus
        let totalTheoryXP = 0;
        let totalCalculationXP = 0;

        // OPTIMIZATION: Cache subcategory string matching to avoid repeated loops and string includes
        const subCategoryCache = new Map();
        const proficiencyEntries = Object.entries(PROFICIENCY_GROUPS);

        // วนลูปดูข้อมูลทั้งหมดใน LocalStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // ถ้าเจอคีย์ที่เป็นข้อมูลการทำโจทย์ (quizState-...)
            if (key && key.startsWith('quizState-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    // NEW: Check for shuffledQuestions to ensure we can calculate XP accurately
                    if (data && data.userAnswers && data.shuffledQuestions) {
                        let calculatedXp = 0;
                        const quizTrackXPs = {};
                        SiteConfig.categories.forEach(c => quizTrackXPs[c.track] = 0);

                        data.userAnswers.forEach((ans, index) => {
                            if (ans && ans.isCorrect) {
                                const question = data.shuffledQuestions[index];
                                // Award 6 XP for complex questions, 4 for others
                                if (question && (question.type === 'multiple-select' || question.type === 'fill-in-number')) {
                                    calculatedXp += 6;
                                    totalCalculationXP += 6;
                                } else {
                                    calculatedXp += 4;
                                    totalTheoryXP += 4;
                                }
                            }
                        });

                        const xp = calculatedXp;
                        const correctCount = data.score || 0;

                        totalXP += xp;
                        totalCorrect += correctCount;
                        // นับจำนวนชุดที่ทำเสร็จ (ดูจากจำนวนข้อที่ตอบเทียบกับจำนวนข้อทั้งหมด)
                        const totalQ = data.shuffledQuestions ? data.shuffledQuestions.length : 0;
                        const answered = data.userAnswers.filter(a => a).length;
                        totalQuestionsAnswered += answered; // สะสมจำนวนข้อที่ตอบ

                        if (totalQ > 0 && answered >= totalQ) {
                            completed++;

                            // คำนวณสถิติย้อนหลัง
                            const percentage = Math.round((correctCount / totalQ) * 100);
                            const isCustom = key.includes('custom');
                            if (!isCustom || (isCustom && totalQ >= 20)) {
                                if (percentage === 100) perfectScores++;
                                if (percentage >= 80) highScores80++;
                            }

                            // Check for weekend completion based on timestamp
                            if (data.lastAttemptTimestamp) {
                                const date = new Date(data.lastAttemptTimestamp);
                                const day = date.getDay();
                                if (day === 0 || day === 6) {
                                    weekendQuizzes++;
                                }
                            }
                        }

                        // Calculate Topic XP
                        data.userAnswers.forEach((ans, index) => {
                            if (ans && ans.isCorrect) {
                                const question = data.shuffledQuestions[index];
                                const points = (question && (question.type === 'multiple-select' || question.type === 'fill-in-number')) ? 6 : 4;

                                let subCatStr = '';
                                if (ans.subCategory) {
                                    if (typeof ans.subCategory === 'string') {
                                        subCatStr = ans.subCategory;
                                    } else {
                                        // Include BOTH main and specific contexts for better matching
                                        subCatStr = (ans.subCategory.main || '') + ' ' + (ans.subCategory.specific || '');
                                    }
                                }
                                subCatStr = subCatStr.toLowerCase();

                                // Multi-group matching: A question can contribute to multiple fields (e.g. Meteorology AND Oceanography)
                                const tracksForThisQuestion = new Set();

                                for (const [groupKey, groupDef] of proficiencyEntries) {
                                    // Keywords matching
                                    const matches = groupDef.keywords.some(k => subCatStr.includes(k.toLowerCase()));

                                    if (matches) {
                                        topicXPs[groupDef.field] = (topicXPs[groupDef.field] || 0) + points;
                                        tracksForThisQuestion.add(groupDef.track);
                                    }
                                }

                                // Update track XPs based on all matched groups (preventing double counting)
                                tracksForThisQuestion.forEach(track => {
                                    if (quizTrackXPs[track] !== undefined) {
                                        quizTrackXPs[track] += points;
                                    }
                                });
                            }
                        });

                        // Check if any track XP was added
                        let allTracksZero = true;
                        for (const t in quizTrackXPs) {
                            if (quizTrackXPs[t] > 0) allTracksZero = false;
                        }

                        // ถ้ายังระบุสายวิชาไม่ได้จาก Proficiency Group ให้ลองดูจากหมวดหมู่หรือชื่อไฟล์ (Fallback)
                        if (allTracksZero) {
                            let category = 'General';
                            const firstAns = data.userAnswers.find(a => a);
                            if (firstAns) {
                                if (firstAns.sourceQuizCategory) category = firstAns.sourceQuizCategory;
                                else if (firstAns.subCategory) {
                                    category = typeof firstAns.subCategory === 'object' ? firstAns.subCategory.main : firstAns.subCategory;
                                }
                            }

                            const track = this.identifyTrack(category, key);
                            if (track !== 'general' && quizTrackXPs[track] !== undefined) {
                                quizTrackXPs[track] = calculatedXp;
                            }
                        }

                        // Sum up and calculate General XP
                        let sumQuizTracks = 0;
                        for (const [track, xp] of Object.entries(quizTrackXPs)) {
                            sumQuizTracks += xp;
                            const catConfig = SiteConfig.categories.find(c => c.track === track);
                            if (catConfig) accumulatedTrackXPs[catConfig.id] += xp;
                        }

                        generalQuizXP += (calculatedXp - sumQuizTracks);
                    }
                } catch (e) {
                    console.warn("Skipping invalid quiz state during sync:", key);
                }
            }
        }

        // NEW: คำนวณ Bonus XP ย้อนหลัง (ทุก 20 ข้อ ได้ 20 XP)
        const bonusXP = Math.floor(totalQuestionsAnswered / 20) * 20;
        totalXP += bonusXP;
        this.state.accumulatedQuestionsForBonus = totalQuestionsAnswered % 20;

        // NEW: รวม XP จากประวัติภารกิจ (Quest History) เพื่อไม่ให้คะแนนหาย
        if (this.state.questHistory) {
            this.state.questHistory.forEach(item => {
                if (item.xp) totalXP += item.xp;
            });
        }

        // NEW: ใช้ค่า totalSpentXP ที่บันทึกไว้เป็นหลัก (เพื่อความถูกต้องของไอเทมที่ใช้ไปแล้ว)
        // หากไม่มี (ข้อมูลเก่า) ให้คำนวณจากของที่มีอยู่เป็นค่าเริ่มต้น (Fallback)
        let spentXP = this.state.totalSpentXP || 0;

        if (spentXP === 0) {
            if (this.state.inventory) {
                this.state.inventory.forEach(itemId => {
                    const item = SHOP_ITEMS.find(i => i.id === itemId);
                    if (item) spentXP += item.cost;
                });
            }
            if (this.state.consumables) {
                Object.entries(this.state.consumables).forEach(([itemId, count]) => {
                    const item = SHOP_ITEMS.find(i => i.id === itemId);
                    if (item) spentXP += (item.cost * count);
                });
            }
            // บันทึกค่าเริ่มต้นกลับไปเพื่อใช้ในอนาคต
            this.state.totalSpentXP = spentXP;
        }

        // ถ้าพบข้อมูลเก่า ให้อัปเดตสถานะเริ่มต้นทันที
        // FIX: Use Math.max to prevent overwriting Cloud Data with empty Local History
        // If local history is empty (new device), we should preserve the loaded state.

        const currentXP = Number(this.state.xp) || 0;
        const calculatedXP = Math.max(0, totalXP - spentXP);
        this.state.xp = Math.max(currentXP, calculatedXP);

        // Apply accumulated track XPs (Math.max)
        for (const [id, xp] of Object.entries(accumulatedTrackXPs)) {
            this.state[id] = Math.max(this.state[id] || 0, xp);
        }

        this.state.quizzesCompleted = Math.max(this.state.quizzesCompleted || 0, completed);
        this.state.theoryXP = Math.max(this.state.theoryXP || 0, totalTheoryXP);
        this.state.calculationXP = Math.max(this.state.calculationXP || 0, totalCalculationXP);
        this.state.totalCorrectAnswers = Math.max(this.state.totalCorrectAnswers || 0, totalCorrect);
        this.state.perfectScores = Math.max(this.state.perfectScores || 0, perfectScores);
        this.state.highScores80 = Math.max(this.state.highScores80 || 0, highScores80);
        this.state.weekendQuizzesCompleted = Math.max(this.state.weekendQuizzesCompleted || 0, weekendQuizzes);

        // General XP: If we have valid local calculation, and it's greater, take it.
        // Otherwise keep existing.
        this.state.generalXP = Math.max(this.state.generalXP || 0, generalQuizXP);


        // Apply calculated topic XPs (Math.max)
        for (const [field, xp] of Object.entries(topicXPs)) {
            this.state[field] = Math.max(this.state[field] || 0, xp);
        }

        // Save calculated total questions
        this.state.totalQuestionsAnswered = Math.max(this.state.totalQuestionsAnswered || 0, totalQuestionsAnswered);

        // ตรวจสอบและปลดล็อกเหรียญรางวัลจากข้อมูลเก่าทันที
        this.checkBadges(0);
        this.checkAchievements();
        this.saveState();
        console.log(`Recalculated progress: ${totalXP} XP, ${completed} Quizzes`);

        return { totalXP, completed };
    }

    saveState() {
        // ใช้ AuthManager บันทึกข้อมูล (จะลงทั้ง LocalStorage และ Firestore ถ้าล็อกอิน)
        this.authManager.saveUserData(this.state).catch(e => {
            console.error("Error saving gamification state via AuthManager:", e);
        });
        this.onStateUpdated(); // Trigger UI updates ทันทีเพื่อให้ลื่นไหล
    }

    async forceCloudSync() {
        if (!this.authManager.currentUser) return false;
        try {
            const data = await this.authManager.loadUserData();
            if (data) {
                this.state = { ...this.getDefaultState(), ...data };
                this.updateStreak();
                this.onStateUpdated();
                return true;
            }
        } catch (e) {
            console.error("Force sync failed:", e);
        }
        return false;
    }

    // IMPROVEMENT: Centralized UI Update Trigger
    onStateUpdated() {
        this.updateHeaderAvatar();
        this.applyTheme(this.state.selectedTheme);
        // Dispatch event for other components (e.g. profile page charts) to react
        window.dispatchEvent(new CustomEvent('gamification-updated', { detail: this.state }));
    }

    setAvatar(avatar) {
        this.state.avatar = avatar;
        this.saveState();
    }

    setDisplayName(name) {
        this.state.displayName = name;
        this.saveState();
    }

    equipTitle(title) {
        this.state.selectedTitle = title;
        this.saveState();
    }

    equipTheme(themeValue) {
        this.state.selectedTheme = themeValue;
        this.saveState();
    }

    // NEW: ฟังก์ชันกลางสำหรับหัก XP (ใช้แทนการลบตรงๆ เพื่อบันทึกยอดใช้จ่าย)
    spendXP(amount) {
        if (this.state.xp >= amount) {
            this.state.xp -= amount;
            this.state.totalSpentXP = (this.state.totalSpentXP || 0) + amount;
            this.saveState();
            return true;
        }
        return false;
    }

    buyItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: "ไม่พบสินค้า" };
        if (this.state.xp < item.cost) return { success: false, message: "XP ไม่เพียงพอ" };

        if (item.type === 'consumable') {
            this.state.xp -= item.cost;
            this.state.totalSpentXP = (this.state.totalSpentXP || 0) + item.cost; // Track spending
            this.state.consumables[itemId] = (this.state.consumables[itemId] || 0) + 1;
            this.saveState();
            return { success: true, message: `ซื้อ ${item.name} สำเร็จ! (มี: ${this.state.consumables[itemId]})`, item };
        } else {
            if (this.state.inventory.includes(itemId)) return { success: false, message: "คุณมีสินค้านี้แล้ว" };
            this.state.xp -= item.cost;
            this.state.totalSpentXP = (this.state.totalSpentXP || 0) + item.cost; // Track spending
            this.state.inventory.push(itemId);

            // Check Shop Badges
            if (this.state.inventory.length >= 5 && !this.state.badges.includes('shop_spender')) {
                this.state.badges.push('shop_spender');
            }

            this.checkAchievements();
            this.saveState();
            return { success: true, message: `ซื้อ ${item.name} สำเร็จ!`, item };
        }
    }

    useItem(itemId) {
        if (this.state.consumables[itemId] > 0) {
            this.state.consumables[itemId]--;
            this.saveState();
            return true;
        }
        return false;
    }

    getInventory() {
        return this.state.inventory || [];
    }

    getItemCount(itemId) {
        return this.state.consumables ? (this.state.consumables[itemId] || 0) : 0;
    }

    updateHeaderAvatar() {
        const profileLink = document.getElementById('main-header-profile-link');
        const user = this.authManager.currentUser;

        // Update Header Email
        const headerEmailEl = document.getElementById('user-hub-email');
        if (headerEmailEl) {
            if (user && user.email) {
                headerEmailEl.textContent = user.email;
                headerEmailEl.classList.remove('hidden');
            } else {
                headerEmailEl.classList.add('hidden');
            }
        }

        if (profileLink) {
            // ถ้าไม่ได้ล็อกอิน ให้แสดงไอคอน Guest (SVG) แทนอวตาร
            if (!user) {
                profileLink.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                `;
                profileLink.className = "flex items-center justify-center h-full w-full";
                return;
            }

            const avatar = this.state.avatar || '🧑‍🎓';
            const level = this.getCurrentLevel().level;

            // Ensure the container is round and clean
            profileLink.classList.add('rounded-full');
            const classesToRemove = [
                'ring-2', 'ring-4', 'ring-gray-200', 'dark:ring-gray-700',
                'ring-green-500', 'ring-purple-500', 'ring-yellow-400',
                'legendary-frame'
            ];
            profileLink.classList.remove(...classesToRemove);

            // ตรวจสอบว่าเป็น URL รูปภาพหรือไม่ (มีจุดหรือเครื่องหมาย /)
            const isImage = avatar.includes('/') || avatar.includes('.');
            let contentHtml = '';

            if (isImage) {
                contentHtml = `<img src="${escapeHtml(avatar)}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
            } else {
                contentHtml = `<span class="text-xl leading-none flex items-center justify-center h-full w-full select-none">${escapeHtml(avatar)}</span>`;
            }

            const levelBorderClass = getLevelBorderClass(level);
            const avatarFrameClass = getAvatarFrameClass(avatar, 'small');

            // Create nested structure: Level Border (Outer) -> Avatar Frame (Inner) -> Content
            profileLink.innerHTML = `
                <div class="w-full h-full rounded-full p-0.5 ${levelBorderClass} shadow-sm transition-all duration-300">
                    <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${avatarFrameClass}">
                        ${contentHtml}
                    </div>
                </div>
            `;

            // Trigger Animation on the link itself
            profileLink.classList.remove('anim-avatar-pop');
            void profileLink.offsetWidth; // Force reflow
            profileLink.classList.add('anim-avatar-pop');
        } else {
            // ถ้ายังไม่พบ Element (เช่น Header กำลังโหลดอยู่) ให้รอจับตาดูการเปลี่ยนแปลงใน placeholder
            if (this.headerObserver) return; // ป้องกันการสร้าง Observer ซ้ำ

            const placeholder = document.getElementById('main_header-placeholder');
            if (placeholder) {
                this.headerObserver = new MutationObserver(() => {
                    // ลองเรียกตัวเองใหม่เมื่อมีการเปลี่ยนแปลงใน DOM
                    if (document.getElementById('main-header-profile-link')) {
                        this.updateHeaderAvatar();
                        this.headerObserver.disconnect(); // หยุดดูเมื่อเจอแล้ว
                        this.headerObserver = null;
                    }
                });
                this.headerObserver.observe(placeholder, { childList: true, subtree: true });
            }
        }
    }

    applyTheme(theme) {
        // Remove existing theme classes
        document.documentElement.classList.remove('theme-forest', 'theme-sunset', 'theme-ocean', 'theme-berry', 'theme-midnight');

        if (theme) {
            document.documentElement.classList.add(theme);

            // OPTIMIZATION: Set CSS Variables instead of generating full CSS rules
            const themeName = theme.replace('theme-', '');
            const colors = THEME_DEFINITIONS[themeName];

            if (colors) {
                const root = document.documentElement;
                root.style.setProperty('--theme-main', colors.main);
                root.style.setProperty('--theme-hover', colors.hover);
                root.style.setProperty('--theme-secondary', colors.secondary);
                root.style.setProperty('--theme-light-bg', colors.light_bg);
                root.style.setProperty('--theme-dark-bg', colors.dark_bg);
                root.style.setProperty('--theme-ring', colors.ring);
                root.style.setProperty('--theme-dark-text', colors.dark_text || colors.main);
            }

            this.injectThemeStyles();
        } else {
            // Reset variables if needed (optional, as removing class usually suffices)
            const root = document.documentElement;
            root.style.removeProperty('--theme-main');
            root.style.removeProperty('--theme-hover');
            root.style.removeProperty('--theme-secondary');
            root.style.removeProperty('--theme-light-bg');
            root.style.removeProperty('--theme-dark-bg');
            root.style.removeProperty('--theme-ring');
            root.style.removeProperty('--theme-dark-text');
        }
    }

    injectThemeStyles() {
        if (document.getElementById('gamification-theme-styles')) return;

        const style = document.createElement('style');
        style.id = 'gamification-theme-styles';

        // OPTIMIZATION: Use CSS Variables in a single set of rules
        const allStyles = `
            @keyframes avatarPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.25); }
                100% { transform: scale(1); }
            }
            .anim-avatar-pop {
                animation: avatarPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            /* NEW: Rewind Animation for Undo Power-up */
            @keyframes rewind-flash {
              0% { filter: brightness(1) blur(0); }
              50% { 
                filter: brightness(1.5) blur(1px) saturate(0.5);
                transform: scale(1.01);
              }
              100% { filter: brightness(1) blur(0); }
            }
            .anim-rewind {
              animation: rewind-flash 0.4s ease-in-out;
            }

            /* NEW: Item Pop Animation */
            @keyframes itemPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            .anim-item-pop {
                animation: itemPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            /* NEW: Legendary Frame Shimmer */
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            .legendary-frame {
                position: relative;
                overflow: hidden;
            }
            .legendary-frame::after {
                content: "";
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%);
                background-size: 200% 100%;
                animation: shimmer 3s infinite linear;
                border-radius: 9999px;
                pointer-events: none;
            }

            /* --- DYNAMIC THEME OVERRIDES USING VARIABLES --- */
            /* Only apply when a theme class is present on html/body */
            
            :root {
                /* Default fallback values to prevent breakage if vars aren't set */
                --theme-main: #3b82f6; 
                --theme-hover: #2563eb;
                --theme-secondary: #60a5fa;
                --theme-light-bg: #eff6ff;
                --theme-dark-bg: rgba(30, 58, 138, 0.5);
                --theme-ring: #60a5fa;
                --theme-dark-text: #60a5fa;
            }

            [class*="theme-"] ::selection {
                background-color: var(--theme-main);
                color: white;
            }

            [class*="theme-"] ::-webkit-scrollbar-thumb {
                background-color: var(--theme-secondary);
                border-radius: 10px;
            }

            /* Main UI & Quiz Page Accent */
            [class*="theme-"] .bg-blue-500,
            [class*="theme-"] .bg-blue-600,
            [class*="theme-"] .dark\\:bg-blue-600,
            [class*="theme-"] .bg-indigo-500,
            [class*="theme-"] .bg-indigo-600,
            [class*="theme-"] input[type="radio"]:checked,
            [class*="theme-"] input[type="checkbox"]:checked {
                background-color: var(--theme-main) !important;
                border-color: var(--theme-main) !important;
            }

            [class*="theme-"] .hover\\:bg-blue-600:hover,
            [class*="theme-"] .hover\\:bg-blue-700:hover,
            [class*="theme-"] .dark\\:hover\\:bg-blue-700:hover,
            [class*="theme-"] .hover\\:bg-indigo-600:hover,
            [class*="theme-"] .hover\\:bg-indigo-700:hover {
                background-color: var(--theme-hover) !important;
            }

            /* Text colors */
            [class*="theme-"] .text-blue-500,
            [class*="theme-"] .text-blue-600,
            [class*="theme-"] .text-blue-700,
            [class*="theme-"] .text-indigo-600,
            [class*="theme-"] .text-indigo-700 {
                color: var(--theme-main) !important;
            }

            /* Dark mode text */
            [class*="theme-"] .dark .text-blue-500,
            [class*="theme-"] .dark .text-blue-600,
            [class*="theme-"] .dark .text-blue-700,
            [class*="theme-"] .dark .text-indigo-600,
            [class*="theme-"] .dark .text-indigo-700,
            [class*="theme-"] .dark\\:text-blue-400,
            [class*="theme-"] .dark\\:text-blue-300 {
                color: var(--theme-dark-text) !important;
            }

            [class*="theme-"] .border-blue-500,
            [class*="theme-"] .border-blue-600,
            [class*="theme-"] .border-indigo-500,
            [class*="theme-"] .has-\\[\\:checked\\]\\:border-blue-500:checked,
            [class*="theme-"] .hover\\:border-blue-500:hover {
                border-color: var(--theme-main) !important;
            }

            [class*="theme-"] .focus\\:ring-blue-500:focus,
            [class*="theme-"] .focus\\:ring-indigo-500:focus {
                --tw-ring-color: var(--theme-ring) !important;
            }

            [class*="theme-"] .bg-blue-100,
            [class*="theme-"] .bg-blue-50,
            [class*="theme-"] .bg-indigo-50,
            [class*="theme-"] .bg-indigo-100,
            [class*="theme-"] .dark\\:bg-blue-900\\/30,
            [class*="theme-"] .dark\\:bg-indigo-900\\/30 {
                background-color: var(--theme-light-bg) !important;
            }
            
            [class*="theme-"] .dark .bg-blue-100, 
            [class*="theme-"] .dark .bg-blue-50,
            [class*="theme-"] .dark\\:bg-blue-900\\/50 {
                background-color: var(--theme-dark-bg) !important;
            }
            
            [class*="theme-"] .hover\\:bg-blue-200:hover { background-color: var(--theme-main) !important; opacity: 0.2; }
            [class*="theme-"] .dark\\:hover\\:bg-blue-800:hover { background-color: var(--theme-hover) !important; opacity: 0.4; }

            /* Gradients */
            [class*="theme-"] .from-blue-500,
            [class*="theme-"] .from-blue-600,
            [class*="theme-"] .from-indigo-500 {
                --tw-gradient-from: var(--theme-main) !important;
                --tw-gradient-to: var(--theme-secondary) !important;
                --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
            }

            [class*="theme-"] .to-purple-600,
            [class*="theme-"] .to-indigo-500,
            [class*="theme-"] .to-blue-600 {
                --tw-gradient-to: var(--theme-secondary) !important;
            }

            /* Quiz Card Hovers */
            [class*="theme-"] .quiz-card:hover {
                border-color: var(--theme-main) !important;
                --tw-shadow-color: var(--theme-main) !important;
                box-shadow: 0 10px 15px -3px var(--theme-light-bg), 0 4px 6px -2px var(--theme-light-bg) !important;
            }
            [class*="theme-"] .dark .quiz-card:hover {
                box-shadow: 0 10px 15px -3px var(--theme-dark-bg), 0 4px 6px -2px var(--theme-dark-bg) !important;
            }

            [class*="theme-"] .quiz-card:hover h3 {
                color: var(--theme-main) !important;
            }
            [class*="theme-"] .quiz-card:hover .section-icon-container {
                background-color: var(--theme-light-bg) !important;
            }
            [class*="theme-"] .dark .quiz-card:hover .section-icon-container {
                background-color: var(--theme-dark-bg) !important;
            }

            /* Quiz Page Buttons */
            [class*="theme-"] #next-btn,
            [class*="theme-"] #review-btn,
            [class*="theme-"] #back-to-result-btn,
            [class*="theme-"] #restart-btn,
            [class*="theme-"] #start-btn {
                background-color: var(--theme-main) !important;
                color: white !important;
                border-color: transparent !important;
            }
            [class*="theme-"] #next-btn:hover,
            [class*="theme-"] #review-btn:hover,
            [class*="theme-"] #back-to-result-btn:hover,
            [class*="theme-"] #restart-btn:hover,
            [class*="theme-"] #start-btn:hover {
                background-color: var(--theme-hover) !important;
                box-shadow: 0 4px 12px var(--theme-dark-bg) !important;
            }

            [class*="theme-"] #prev-btn,
            [class*="theme-"] #skip-btn {
                background-color: var(--theme-light-bg) !important;
                color: var(--theme-main) !important;
                border: 1px solid var(--theme-main) !important;
            }
            [class*="theme-"] #prev-btn:hover,
            [class*="theme-"] #skip-btn:hover {
                background-color: var(--theme-main) !important;
                color: white !important;
            }

            [class*="theme-"] .option-btn:hover:not(:disabled) {
                border-color: var(--theme-main) !important;
                background-color: var(--theme-light-bg) !important;
                color: var(--theme-main) !important;
            }
        `;

        style.textContent = allStyles;
        document.head.appendChild(style);
    }

    resetProgress() {
        const defaultState = this.getDefaultState();
        // Preserve displayName, avatar, and theme on reset
        defaultState.displayName = this.state.displayName;
        defaultState.avatar = this.state.avatar;
        defaultState.selectedTheme = this.state.selectedTheme;

        this.state = defaultState;
        this.saveState();
    }

    incrementCorrectStreak() {
        this.state.correctStreak = (this.state.correctStreak || 0) + 1;
        this.saveState();
    }

    resetCorrectStreak() {
        this.state.correctStreak = 0;
        this.saveState();
    }

    updateEndQuizStats(percentage, questionCount = 0, isCustomQuiz = false) {
        // Logic: ตรวจสอบเงื่อนไขก่อนบันทึกสถิติ Perfect Score หรือ High Score
        // หากเป็น Custom Quiz ต้องมีอย่างน้อย 20 ข้อจึงจะนับสถิติ (ป้องกันการปั๊มสถิติด้วยโจทย์ 1 ข้อ)
        // Check eligibility: Custom quizzes need at least 20 questions
        const isEligible = !isCustomQuiz || (isCustomQuiz && questionCount >= 20);

        if (isEligible) {
            if (percentage === 100) {
                this.state.perfectScores = (this.state.perfectScores || 0) + 1;
            }
            if (percentage >= 80) {
                this.state.highScores80 = (this.state.highScores80 || 0) + 1;
            }
            // No need to call saveState() here as it will be called later in the flow (e.g., by checkBadges)
        }
    }

    isQuestCompleted(quest) {
        if (!quest) return true; // No quest for this level, so it's "completed".

        switch (quest.type) {
            case 'correct_streak':
                return (this.state.correctStreak || 0) >= quest.target;
            case 'quizzes_completed':
                return (this.state.quizzesCompleted || 0) >= quest.target;
            case 'perfect_scores':
                return (this.state.perfectScores || 0) >= quest.target;
            case 'high_scores_80':
                return (this.state.highScores80 || 0) >= quest.target;
            case 'astronomy_level':
                return this.getAstronomyTrackLevel().level >= quest.target;
            case 'earth_level':
                return this.getEarthLevel().level >= quest.target;
            case 'physics_level':
                return this.getPhysicsLevel().level >= quest.target;
            default:
                return false; // Unknown quest type
        }
    }

    // ฟังก์ชันช่วยคำนวณเลเวลจาก XP และสายที่ระบุ
    getLevelInfo(xp, track = 'overall') {
        if (track !== 'overall') {
            // Original logic for other tracks
            let level = 0;
            for (const threshold of XP_THRESHOLDS) {
                if (xp >= threshold.xp) {
                    level = threshold.level;
                } else {
                    break;
                }
            }
            if (level === 0) level = 1;
            const currentLevelData = XP_THRESHOLDS[level - 1];
            const nextLevelData = XP_THRESHOLDS[level] || null;
            const titles = TRACK_TITLES[track] || TRACK_TITLES.overall;
            const titleIndex = Math.min(level - 1, titles.length - 1);
            let progressPercent = 100;
            if (nextLevelData) {
                const range = nextLevelData.xp - currentLevelData.xp;
                const gained = xp - currentLevelData.xp;
                progressPercent = range > 0 ? Math.min(100, Math.max(0, (gained / range) * 100)) : 100;
            }
            return { level, title: titles[titleIndex], currentXP: xp, nextLevelXP: nextLevelData ? nextLevelData.xp : null, progressPercent };
        }

        // --- REVISED LOGIC FOR OVERALL LEVEL ---
        // The level is now stored in the state. We just calculate progress towards the next one.
        const currentLevel = this.state.level || 1;

        const currentLevelData = XP_THRESHOLDS.find(t => t.level === currentLevel);
        const nextLevelData = XP_THRESHOLDS.find(t => t.level === currentLevel + 1);

        const titles = TRACK_TITLES.overall;
        const titleIndex = Math.min(currentLevel - 1, titles.length - 1);

        let xpProgressPercent = 100;
        let questProgressPercent = 100;
        let overallProgressPercent = 100;

        if (nextLevelData && currentLevelData) {
            // Calculate XP progress
            const xpRange = nextLevelData.xp - currentLevelData.xp;
            if (xpRange > 0) {
                xpProgressPercent = Math.min(100, Math.max(0, ((xp - currentLevelData.xp) / xpRange) * 100));
            }

            // Calculate Quest progress
            if (nextLevelData.quest) questProgressPercent = this.getQuestProgressPercent(nextLevelData.quest);

            // Overall progress is the minimum of the two
            overallProgressPercent = Math.min(xpProgressPercent, questProgressPercent);
        }

        return { level: currentLevel, title: titles[titleIndex], currentXP: xp, nextLevelXP: nextLevelData ? nextLevelData.xp : null, progressPercent: overallProgressPercent, nextLevelQuest: nextLevelData ? nextLevelData.quest : null };
    }

    getCurrentLevel() {
        return this.getLevelInfo(this.state.xp, 'overall');
    }

    getPhysicsLevel() {
        return this.getLevelInfo(this.state.physicsTrackXP || 0, 'physics');
    }

    getAstronomyTrackLevel() {
        return this.getEarthLevel();
    }

    getEarthLevel() {
        return this.getLevelInfo(this.state.earthTrackXP || 0, 'earth');
    }

    getPosnEarthLevel() {
        return this.getLevelInfo(this.state.posnEarthTrackXP || 0, 'posn_earth');
    }

    getPosnAstroLevel() {
        return this.getLevelInfo(this.state.posnAstroTrackXP || 0, 'posn_astro');
    }

    // Legacy support (เพื่อให้โค้ดเก่าไม่พัง)
    getNextLevel() {
        const info = this.getCurrentLevel();
        if (!info.nextLevelXP) return null;
        return { level: info.level + 1, xp: info.nextLevelXP };
    }

    getQuestProgressValue(quest) {
        if (!quest) return 0;
        switch (quest.type) {
            case 'correct_streak':
                return this.state.correctStreak || 0;
            case 'quizzes_completed':
                return this.state.quizzesCompleted || 0;
            case 'perfect_scores':
                return this.state.perfectScores || 0;
            case 'high_scores_80':
                return this.state.highScores80 || 0;
            case 'astronomy_level':
                return this.getAstronomyTrackLevel().level;
            case 'earth_level':
                return this.getEarthLevel().level;
            default:
                return 0;
        }
    }

    getQuestProgressPercent(quest) {
        if (!quest || this.isQuestCompleted(quest)) return 100;

        const currentProgress = this.getQuestProgressValue(quest);
        let baseValue = 0;

        // For level-based quests, progress starts from the base level (e.g., level 1)
        if (quest.type.endsWith('_level')) {
            baseValue = 1; // Assuming level quests start counting from level 1
        }

        const range = quest.target - baseValue;
        const gained = currentProgress - baseValue;

        return range > 0 ? Math.min(100, Math.max(0, (gained / range) * 100)) : 0;
    }

    // สุ่มภารกิจใหม่
    generateDailyQuests() {
        // สุ่มมา 3 งานไม่ซ้ำกัน
        const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).map(q => ({
            ...q,
            progress: 0,
            completed: false,
            date: new Date().toISOString().split('T')[0]
        }));
    }

    // เปลี่ยนภารกิจ (Reroll)
    rerollQuest(index) {
        if (this.state.rerolls <= 0) return { success: false, message: "หมดสิทธิ์เปลี่ยนภารกิจแล้ว" };
        if (index < 0 || index >= this.state.activeQuests.length) return { success: false, message: "ไม่พบภารกิจ" };
        if (this.state.activeQuests[index].completed) return { success: false, message: "ไม่สามารถเปลี่ยนภารกิจที่ทำเสร็จแล้วได้" };

        // หาภารกิจใหม่ที่ไม่ซ้ำกับที่มีอยู่
        const currentIds = this.state.activeQuests.map(q => q.id);
        const available = DAILY_QUESTS.filter(q => !currentIds.includes(q.id));

        if (available.length === 0) return { success: false, message: "ไม่มีภารกิจอื่นให้เปลี่ยนแล้ว" };

        const newQuest = available[Math.floor(Math.random() * available.length)];
        this.state.activeQuests[index] = {
            ...newQuest,
            progress: 0,
            completed: false,
            date: new Date().toISOString().split('T')[0]
        };
        this.state.rerolls--;
        this.saveState();
        return { success: true, quest: this.state.activeQuests[index], rerollsLeft: this.state.rerolls };
    }

    // ฟังก์ชันอัปเดต Streak (เรียกใช้ใน constructor)
    updateStreak() {
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;
        const todayStr = (new Date(today - offset)).toISOString().split('T')[0];
        
        const lastLoginStr = this.state.lastLogin;

        // ถ้าเข้าใช้งานวันนี้ไปแล้ว หรือเป็นผู้ใช้ใหม่
        if (lastLoginStr === todayStr) {
            if (this.state.streak === 0) {
                this.state.streak = 1;
                this.saveState();
            }
            return;
        }

        // คำนวณระยะห่างของวัน (Difference in days)
        const lastLoginDate = lastLoginStr ? new Date(lastLoginStr) : new Date();
        // Reset time part for accurate day calculation
        const t1 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const t2 = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate()).getTime();
        const diffDays = Math.floor((t1 - t2) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // เข้าใช้งานต่อเนื่อง (เมื่อวานเข้า วันนี้เข้า)
            this.state.streak = (this.state.streak || 0) + 1;
        } else if (diffDays > 1) {
            // ขาดช่วงไป (Missed days) -> ตรวจสอบ Streak Freeze
            const freezeCount = this.state.consumables['item_streak_freeze'] || 0;

            if (freezeCount > 0) {
                // ใช้ไอเทมเพื่อรักษาสถิติ
                this.state.consumables['item_streak_freeze']--;
                // ไม่เพิ่ม Streak แต่ไม่รีเซ็ต (Maintain current streak)
                console.log("Streak Freeze used! Streak maintained at:", this.state.streak);
                // Optional: แจ้งเตือนผู้ใช้ว่ามีการใช้ไอเทม (อาจต้องใช้ Event Dispatch หากไม่มี UI library ในนี้)
            } else {
                // ไม่มีไอเทม -> รีเซ็ต Streak
                this.state.streak = 1;
            }
        } else {
            // กรณีอื่นๆ (เช่น diffDays <= 0 ซึ่งไม่ควรเกิด หรือครั้งแรกจริงๆ)
            this.state.streak = 1;
        }

        this.state.lastLogin = todayStr;
        this.updateLevel(); // Check if streak quest completion triggers level up
        this.saveState();
    }

    // ฟังก์ชันเพิ่ม XP (เรียกใช้เมื่อทำข้อสอบเสร็จ)
    // OPTIMIZATION: Added options parameter to control saving.
    // This prevents redundant saves when called from a larger transaction like submitQuizResult.
    addXP(amount, category = '', options = { shouldSave: true }) {
        if (amount < 0 || isNaN(amount)) return; // ป้องกันการส่งค่าติดลบ หรือไม่ใช่ตัวเลข
        
        this.state.xp += amount;

        const track = this.identifyTrack(category);
        const catConfig = SiteConfig.categories.find(c => c.track === track);

        if (catConfig) {
            this.state[catConfig.id] = (this.state[catConfig.id] || 0) + amount;
        } else {
            // XP ที่ไม่มีหมวดหมู่ชัดเจน (เช่น จากเควส) จะถูกนับเป็น General XP
            this.state.generalXP = (this.state.generalXP || 0) + amount;
        }

        this.updateLevel();

        // ตรวจสอบ Badge ที่เกี่ยวกับ XP สะสม (ส่ง 0 ไปเพราะไม่ได้มาจากการทำข้อสอบ)
        this.checkBadges(0, 0, false);

        // Save state only if explicitly told to.
        if (options.shouldSave) {
            this.saveState();
        }
    }

    // ฟังก์ชันใหม่: บันทึกผลการทำข้อสอบโดยรับค่า XP แยกตามสายวิชา
    // นี่คือฟังก์ชันหลักที่ quiz-logic.js เรียกใช้เมื่อส่งคำตอบ
    // จัดการทั้ง XP, สถิติรายข้อ, และการปลดล็อก Badge/Achievement ในที่เดียว
    submitQuizResult(totalXP, percentage, questionCount, isCustomQuiz, topicXPs = {}, questStats = {}) {
        // Increment daily quiz count
        this.state.dailyQuizCount = (this.state.dailyQuizCount || 0) + 1;

        // FIX: ป้องกันการส่งคะแนนซ้ำ (Debounce / Idempotency Check)
        // ตรวจสอบว่า Quiz ID นี้เพิ่งถูกประมวลผลไปเมื่อไม่นานมานี้หรือไม่ (< 5 วินาที)
        const now = Date.now();
        if (this.lastProcessedQuiz.id === questStats.quizId && (now - this.lastProcessedQuiz.timestamp < 5000)) {
            console.warn("Duplicate quiz submission detected. Skipping XP update.");
            return {
                overall: { leveledUp: false, info: this.getCurrentLevel() },
                physics: { leveledUp: false, info: this.getPhysicsLevel() },
                earth: { leveledUp: false, info: this.getEarthLevel() },
                astronomy: { leveledUp: false, info: this.getEarthLevel() },
                newBadges: [],
                newAchievements: []
            };
        }
        this.lastProcessedQuiz = { id: questStats.quizId, timestamp: now };

        const oldLevelInfo = this.getCurrentLevel();

        // Dynamic: Capture old levels for all configured tracks
        const oldTrackLevels = {};
        SiteConfig.categories.forEach(cat => {
            oldTrackLevels[cat.track] = this.getLevelInfo(this.state[cat.id] || 0, cat.track);
        });

        const newTrackXPs = {};
        SiteConfig.categories.forEach(cat => newTrackXPs[cat.track] = 0);

        // --- NEW: Anti-Farming & Diminishing Returns System ---

        // 1. Limit Custom Quiz XP (Max 5 per day)
        const dateObj = new Date();
        const offset = dateObj.getTimezoneOffset() * 60000;
        const todayStr = (new Date(dateObj - offset)).toISOString().split('T')[0];
        
        if (!this.state.customQuizDailyCounts) this.state.customQuizDailyCounts = {};
        if (this.state.customQuizDailyCounts.date !== todayStr) {
            this.state.customQuizDailyCounts = { date: todayStr, count: 0 };
        }

        if (isCustomQuiz) {
            this.state.customQuizDailyCounts.count++;
            if (this.state.customQuizDailyCounts.count > 5) {
                console.warn("Daily custom quiz limit reached. Zero XP awarded.");
                totalXP = 0;
                topicXPs = {};
                questStats.theoryXP = 0;
                questStats.calculationXP = 0;
            }
        }

        // 2. Diminishing Returns for Replaying the SAME Quiz on the same day
        if (!this.state.quizPlayHistory) this.state.quizPlayHistory = {};
        if (this.state.quizPlayHistory.date !== todayStr) {
            this.state.quizPlayHistory = { date: todayStr, plays: {} }; // Reset daily
        }

        let xpMultiplier = 1;
        if (!isCustomQuiz && questStats.quizId) {
            const playCount = this.state.quizPlayHistory.plays[questStats.quizId] || 0;

            if (playCount === 1) {
                xpMultiplier = 0.5; // 2nd play: 50% XP
                showToast('แจ้งเตือน', 'เล่นซ้ำข้อสอบเดิมได้ XP 50%', '⚠️', 'yellow');
            } else if (playCount >= 2) {
                xpMultiplier = 0; // 3rd play+: 0 XP
                showToast('แจ้งเตือน', 'เล่นซ้ำข้อสอบเดิมเกินโควต้า (0 XP)', '⛔', 'red');
            }

            this.state.quizPlayHistory.plays[questStats.quizId] = playCount + 1;

            // Apply multiplier
            totalXP = Math.round(totalXP * xpMultiplier);
            questStats.theoryXP = Math.round((questStats.theoryXP || 0) * xpMultiplier);
            questStats.calculationXP = Math.round((questStats.calculationXP || 0) * xpMultiplier);
            for (const key in topicXPs) {
                if (typeof topicXPs[key] === 'number') {
                    topicXPs[key] = Math.round(topicXPs[key] * xpMultiplier);
                }
            }
        }
        // -----------------------------------------------------

        // Calculate track XP from the detailed topicXPs
        for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
            const xpForTopic = (topicXPs[groupDef.field] || 0);
            if (newTrackXPs[groupDef.track] !== undefined) {
                newTrackXPs[groupDef.track] += xpForTopic;
            }
        }

        // FIX: Fallback logic if topicXPs didn't capture the category (e.g. keywords mismatch)
        // This ensures XP is assigned to the correct track based on Quiz Category/ID
        let remainingXP = totalXP;
        Object.values(newTrackXPs).forEach(val => remainingXP -= val);

        if (remainingXP > 0) {
            const track = this.identifyTrack(questStats.category, questStats.quizId);

            if (newTrackXPs[track] !== undefined) {
                newTrackXPs[track] += remainingXP;
                remainingXP = 0;
            }
        }

        this.state.xp += totalXP;

        // Dynamic: Update state for each category
        SiteConfig.categories.forEach(cat => {
            if (newTrackXPs[cat.track] > 0) {
                this.state[cat.id] = (this.state[cat.id] || 0) + newTrackXPs[cat.track];
            }
        });

        this.state.generalXP = (this.state.generalXP || 0) + remainingXP;
        this.state.quizzesCompleted += 1;

        // --- NEW: Bonus XP for every 20 questions answered ---
        const qCount = questionCount || 0;
        this.state.totalQuestionsAnswered = (this.state.totalQuestionsAnswered || 0) + qCount; // Track total questions
        this.state.accumulatedQuestionsForBonus = (this.state.accumulatedQuestionsForBonus || 0) + qCount;
        const bonusStep = 20;
        const bonusXPPerStep = 20; // แจก 20 XP ทุกๆ 20 ข้อ

        const stepsCompleted = Math.floor(this.state.accumulatedQuestionsForBonus / bonusStep);

        if (stepsCompleted > 0) {
            const bonusXP = stepsCompleted * bonusXPPerStep;
            this.state.accumulatedQuestionsForBonus %= bonusStep; // เก็บเศษไว้รอบหน้า

            // Only add bonus if the quiz itself was worth XP
            if (totalXP > 0) {
                this.state.xp += bonusXP;
                this.state.generalXP = (this.state.generalXP || 0) + bonusXP;

                setTimeout(() => {
                    showToast('โบนัสความขยัน! 🔥', `สะสมครบ ${stepsCompleted * bonusStep} ข้อ รับเพิ่ม ${bonusXP} XP`, '🎁');
                }, 1500);
            }
        }
        // -----------------------------------------------------

        // Update Topic XPs
        for (const [field, xp] of Object.entries(topicXPs)) {
            if (this.state[field] === undefined) this.state[field] = 0;
            this.state[field] += xp;
        }

        // NEW: Check for weekend quiz completion
        const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
        if (day === 0 || day === 6) {
            this.state.weekendQuizzesCompleted = (this.state.weekendQuizzesCompleted || 0) + 1;
        }

        // NEW: Call the stats update function here
        this.updateEndQuizStats(percentage, questionCount, isCustomQuiz);

        // NEW: Track Theory and Calculation XP specifically
        if (questStats.theoryXP) this.state.theoryXP = (this.state.theoryXP || 0) + questStats.theoryXP;
        if (questStats.calculationXP) this.state.calculationXP = (this.state.calculationXP || 0) + questStats.calculationXP;

        // Track item usage in this quiz
        if (questStats.itemsUsedCount) {
            this.state.itemUsageCount = (this.state.itemUsageCount || 0) + questStats.itemsUsedCount;
        }

        // Store last quiz timestamp for time-based badges
        this.state.lastQuizTime = now;

        // FIX: Update last processed quiz to prevent duplicates (was missing before)
        this.lastProcessedQuiz = { id: questStats.quizId, timestamp: now };

        this.updateLevel();

        // Check Badges & Achievements
        // Pass quizId from questStats to checkBadges
        const newBadges = this.checkBadges(percentage, questionCount, isCustomQuiz, questStats.quizId);
        const newAchievements = this.checkAchievements();

        // DEBUG: Debug Quest Update
        console.log("Updating Quests with stats:", questStats);
        // showToast('Debug', `QC: ${questionCount}, S.QC: ${questStats.questionCount}`, '🔧', 'blue'); 

        const questResult = this.updateQuest(questStats);

        // NEW: Save state ONCE at the end of all calculations
        this.saveState();

        // FIX: Update timestamp for charts in profile.js to detect changes
        localStorage.setItem('last_quiz_completed_timestamp', Date.now().toString());

        const newLevelInfo = this.getCurrentLevel();

        const resultTracks = {};
        SiteConfig.categories.forEach(cat => {
            const newInfo = this.getLevelInfo(this.state[cat.id] || 0, cat.track);
            const oldInfo = oldTrackLevels[cat.track];
            resultTracks[cat.track] = { leveledUp: newInfo.level > oldInfo.level, info: newInfo };
        });

        return {
            overall: { leveledUp: newLevelInfo.level > oldLevelInfo.level, info: newLevelInfo },
            tracks: resultTracks,
            physics: resultTracks.physics,
            earth: resultTracks.earth,
            astronomy: resultTracks.earth,
            newBadges: newBadges,
            newAchievements: newAchievements
        };
    }

    // ฟังก์ชันอัปเดตความคืบหน้าภารกิจ
    // Logic: รับ stats จากการทำข้อสอบ แล้ววนลูปตรวจสอบกับ Active Quests ของผู้ใช้
    updateQuest(stats) {
        if (!this.state.activeQuests) return { completed: [], newAchievements: [] };

        // 1. อัปเดตสถิติรวม (Total Stats)
        if (stats.correctAnswers) {
            this.state.totalCorrectAnswers += stats.correctAnswers;
        }

        const completedQuests = [];

        // NEW: Check eligibility for quests that depend on score
        const isEligibleForStats = !stats.isCustomQuiz || (stats.isCustomQuiz && stats.questionCount >= 20);

        this.state.activeQuests.forEach(q => {
            if (q.completed) return;

            let progressMade = 0;

            if (q.type === 'quiz_complete') {
                if (stats.questionCount >= 20) progressMade = 1;
            } else if (q.type === 'correct_answers') {
                progressMade = stats.correctAnswers || 0;
            } else if (q.type === 'questions_category') {
                if (this.checkCategoryMatch(stats.category, q.category, stats.quizId)) {
                    progressMade = stats.totalQuestions || 0;
                } else if (stats.groupCounts && stats.groupCounts[q.category]) {
                    // NEW: Fallback to granular counts if the main category doesn't match
                    // This supports mixed quizzes (e.g. Earth Science quiz with Astronomy questions)
                    progressMade = stats.groupCounts[q.category];
                }
            } else if (q.type === 'high_score') {
                if (isEligibleForStats) {
                    const threshold = q.threshold || 80;
                    if (stats.percentage >= threshold) progressMade = 1;
                }
            } else if (q.type === 'correct_answers_type') {
                if (q.questionType === 'theory') {
                    progressMade = stats.correctTheory || 0;
                } else if (q.questionType === 'calculation') {
                    progressMade = stats.correctCalculation || 0;
                }
            } else if (q.type === 'quiz_category') {
                if (stats.questionCount >= 20 && this.checkCategoryMatch(stats.category, q.category, stats.quizId)) {
                    progressMade = 1;
                }
            } else if (q.type === 'use_item') {
                // Tracking total items used in the session
                progressMade = stats.itemsUsedCount || 0;
            } else if (q.type === 'custom_quiz_size') {
                if (stats.isCustomQuiz && stats.questionCount >= (q.minQuestions || 20)) {
                    progressMade = 1;
                }
            } else if (q.type === 'quiz_starts_with') {
                if (stats.quizId && stats.quizId.toLowerCase().startsWith(q.prefix.toLowerCase())) {
                    progressMade = 1;
                }
            } else if (q.type === 'login_time') {
                const now = new Date();
                const hour = now.getHours();
                if (hour >= q.startHour && hour < q.endHour) {
                    progressMade = 1;
                }
            }

            if (progressMade > 0) {
                console.log(`Quest ${q.id} progress: ${q.progress} + ${progressMade} / ${q.target}`);
                q.progress += progressMade;
                // ตรวจสอบว่าทำสำเร็จหรือไม่
                if (q.progress >= q.target) {
                    q.progress = q.target;
                    q.completed = true;
                    this.state.totalQuestsCompleted = (this.state.totalQuestsCompleted || 0) + 1; // NEW: Track total completed
                    // Use the quest's category for XP, fallback to 'General'
                    // OPTIMIZATION: Tell addXP not to save state, as submitQuizResult will handle it.
                    this.addXP(q.xp, q.category || 'General', { shouldSave: false });
                    completedQuests.push({ completed: true, quest: q });

                    // บันทึกลงประวัติ (History)
                    this.state.questHistory.unshift({
                        id: q.id,
                        desc: q.desc,
                        date: new Date().toISOString().split('T')[0],
                        xp: q.xp
                    });
                    // เก็บประวัติล่าสุด 50 รายการ
                    if (this.state.questHistory.length > 50) this.state.questHistory.pop();
                }
            }
        });

        this.updateLevel();
        const newAchievements = this.checkAchievements();

        // ส่งคืนทั้งภารกิจที่เสร็จและความสำเร็จใหม่
        return { completed: completedQuests, newAchievements };
    }

    // ตรวจสอบความสำเร็จระยะยาว (Achievements) เช่น เลเวล 20, ตอบถูกครบ 1000 ข้อ
    checkAchievements() {
        const newUnlocks = [];
        ACHIEVEMENTS.forEach(ach => {
            if (this.state.unlockedAchievements.includes(ach.id)) return;

            let achieved = false;
            if (ach.type === 'level') {
                if (this.getCurrentLevel().level >= ach.target) achieved = true;
            } else if (ach.type === 'total_correct') {
                if (this.state.totalCorrectAnswers >= ach.target) achieved = true;
            } else if (ach.type === 'total_quizzes') {
                if (this.state.quizzesCompleted >= ach.target) achieved = true;
            }
            // New Achievement Types
            else if (ach.type === 'high_scores_80') {
                if ((this.state.highScores80 || 0) >= ach.target) achieved = true;
            }
            else if (ach.type === 'perfect_scores') {
                if ((this.state.perfectScores || 0) >= ach.target) achieved = true;
            }
            else if (ach.type === 'total_avatars') {
                const avatarCount = this.state.inventory.filter(id => {
                    const item = SHOP_ITEMS.find(i => i.id === id);
                    return item && item.type === 'avatar';
                }).length;
                if (avatarCount >= ach.target) achieved = true;
            } else if (ach.type === 'item_usage') {
                if ((this.state.itemUsageCount || 0) >= ach.target) achieved = true;
            } else if (ach.type === 'total_xp') {
                if (this.state.xp >= ach.target) achieved = true;
            } else if (ach.type === 'theory_xp') {
                if ((this.state.theoryXP || 0) >= ach.target) achieved = true;
            } else if (ach.type === 'calculation_xp') {
                if ((this.state.calculationXP || 0) >= ach.target) achieved = true;
            } else if (ach.type === 'has_badge') {
                if (this.state.badges.includes(ach.badgeId)) achieved = true;
            } else if (ach.type === 'dual_level') {
                const level1 = this.getLevelInfo(this.state[ach.track1 + 'TrackXP'] || 0, ach.track1).level;
                const level2 = this.getLevelInfo(this.state[ach.track2 + 'TrackXP'] || 0, ach.track2).level;
                if (level1 >= ach.target && level2 >= ach.target) achieved = true;
            } else if (ach.type === 'total_quests') {
                // Approximate total quests by checking history length (since we don't store a counter yet, or we could add one)
                // For now, let's use questHistory.length as a proxy or just rely on manual increment elsewhere?
                // Better: Use `this.state.questHistory` length if it persisted all history, but it's capped at 50.
                // Alternative: Add a `totalQuestsCompleted` counter to state. For now, let's assume valid state has this if we add it.
                // Fallback: Check if we can count differently.
                // Let's implement a simple counter for future. For now, maybe just check history length (limited).
                // Actually, let's add `totalQuestsCompleted` to state in `submitQuizResult` or `updateQuest`
                if ((this.state.totalQuestsCompleted || 0) >= ach.target) achieved = true;
            } else if (ach.type === 'total_badges') {
                if (this.state.badges.length >= ach.target) achieved = true;
            }

            if (achieved) {
                this.state.unlockedAchievements.push(ach.id);
                newUnlocks.push(ach);

                // บันทึกลงประวัติ (History) เพื่อให้ผู้ใช้เห็นว่าทำสำเร็จแล้ว
                this.state.questHistory.unshift({
                    id: ach.id,
                    desc: `ปลดล็อกความสำเร็จ: ${ach.title}`,
                    date: new Date().toISOString().split('T')[0],
                    xp: 0
                });
                if (this.state.questHistory.length > 50) this.state.questHistory.pop();
            }
        });
        return newUnlocks;
    }

    // Helper function to identify track from category/quizId
    identifyTrack(category, quizId = '') {
        const catString = (typeof category === 'string') ? category : (category?.main || String(category || ''));
        const lowerCat = catString.toLowerCase();
        const lowerId = String(quizId).toLowerCase();

        const textToSearch = lowerCat + ' ' + lowerId;

        for (const cat of SiteConfig.categories) {
            if (cat.keywords && cat.keywords.some(k => textToSearch.includes(k.toLowerCase()))) {
                return cat.track;
            }
        }

        return 'general';
    }

    checkCategoryMatch(quizCat, questCat, quizId = '') {
        if (!quizCat && !quizId) return false;

        const lowerQuestCat = questCat.toLowerCase();
        const quizTrack = this.identifyTrack(quizCat, quizId);
        const lowerQuizId = String(quizId).toLowerCase();

        if (lowerQuestCat === 'physics') {
            return quizTrack === 'physics';
        }
        if (lowerQuestCat === 'astronomy') {
            // Astronomy is part of the Earth track, but we distinguish it by keywords or ID
            if (lowerQuizId.startsWith('es')) return false; // Exclude pure Earth Science
            if (lowerQuizId.startsWith('astro')) return true;

            const catString = (typeof quizCat === 'string') ? quizCat : (quizCat?.main || String(quizCat || ''));
            const lowerQuizCat = catString.toLowerCase();
            return lowerQuizCat.includes('astro') || lowerQuizCat.includes('ดาราศาสตร์') || quizTrack === 'astronomy';
        }
        if (lowerQuestCat === 'earth') {
            // Match Earth track but exclude pure Astronomy if needed? 
            // Usually "Earth Science" quests in this app include both unless specified.
            // But let's stay consistent with identifyTrack.
            return quizTrack === 'earth';
        }
        if (lowerQuestCat === 'review') {
            const catString = (typeof quizCat === 'string') ? quizCat : (quizCat?.main || String(quizCat || ''));
            const lowerQuizCat = catString.toLowerCase();
            return lowerQuizCat.includes('review') || lowerQuizCat.includes('ทบทวน') || lowerQuizId.startsWith('esr') || (lowerQuizId.startsWith('astro') && !lowerQuizId.includes('posn'));
        }
        return false;
    }

    // ฟังก์ชันตรวจสอบและปลดล็อก Badge
    // Logic: ตรวจสอบเงื่อนไขต่างๆ และมอบเหรียญรางวัลหากยังไม่เคยได้รับ
    async checkBadges(lastQuizScorePercent, questionCount = 0, isCustomQuiz = false, quizId = null) {
        const newBadges = [];

        // Lookup Quiz Metadata
        const { getQuizzesList } = await import('./data-manager.js');
        const quizList = await getQuizzesList();
        const quiz = quizId ? quizList.find(q => q.id === quizId) : null;
        // Check if it's an "Exam" type quiz (Practice Exam)
        const isExam = quiz && (
            (quiz.subCategory && quiz.subCategory.includes('แนวข้อสอบ')) ||
            (quiz.title && quiz.title.includes('แนวข้อสอบ')) ||
            (quiz.category && quiz.category.includes('Exam'))
        );

        const unlock = (badgeId) => {
            if (!this.state.badges.includes(badgeId)) {
                this.state.badges.push(badgeId);
                newBadges.push(BADGES.find(b => b.id === badgeId));
            }
        };

        const isEligibleForStats = !isCustomQuiz || (isCustomQuiz && questionCount >= 20);

        // OPTIMIZATION: Calculate levels once and reuse
        const physicsLevel = this.getPhysicsLevel().level;

        const earthLevel = this.getEarthLevel().level;

        if (this.state.quizzesCompleted >= 1) unlock('first_quiz');

        if (isEligibleForStats) {
            if (lastQuizScorePercent === 100) unlock('perfect_score');
        }

        if ((this.state.highScores80 || 0) >= 3) unlock('high_scorer_3');
        if ((this.state.highScores80 || 0) >= 5) unlock('high_scorer_5');
        if ((this.state.highScores80 || 0) >= 10) unlock('high_scorer_10');

        if ((this.state.perfectScores || 0) >= 3) unlock('perfect_scorer_3');
        if ((this.state.perfectScores || 0) >= 5) unlock('perfect_scorer_5');

        if (questionCount >= 50) unlock('marathon_runner');

        if (this.state.quizzesCompleted >= 5) unlock('quiz_master_5');
        if (this.state.quizzesCompleted >= 10) unlock('quiz_master_10');
        if (this.state.quizzesCompleted >= 25) unlock('quiz_master_25');
        if (this.state.quizzesCompleted >= 50) unlock('quiz_master_50');
        if (this.state.quizzesCompleted >= 100) unlock('quiz_master_100');

        if (this.state.streak >= 3) unlock('streak_3');
        if (this.state.streak >= 7) unlock('streak_7');
        if (this.state.streak >= 14) unlock('streak_14');
        if (this.state.streak >= 30) unlock('streak_30');
        if (this.state.streak >= 60) unlock('streak_60');


        if (earthLevel >= 3) unlock('earth_lover');
        if (earthLevel >= 5) unlock('earth_expert');
        if (earthLevel >= 10) unlock('earth_master');
        if (physicsLevel >= 3) unlock('physics_lover');
        if (physicsLevel >= 5) unlock('physics_expert');
        if (physicsLevel >= 10) unlock('physics_master');

        const posnEarthLevel = this.getPosnEarthLevel().level;
        const posnAstroLevel = this.getPosnAstroLevel().level;

        if (posnEarthLevel >= 3) unlock('posn_earth_lover');
        if (posnEarthLevel >= 5) unlock('posn_earth_expert');
        if (posnEarthLevel >= 10) unlock('posn_earth_master'); // Added

        if (posnAstroLevel >= 3) unlock('posn_astro_lover');
        if (posnAstroLevel >= 5) unlock('posn_astro_expert');
        if (posnAstroLevel >= 10) unlock('posn_astro_master'); // Added

        if (this.state.xp >= 5000) unlock('xp_5k');
        if (this.state.xp >= 10000) unlock('xp_10k');

        if (physicsLevel >= 5 && earthLevel >= 5) unlock('dual_expert');

        if ((this.state.weekendQuizzesCompleted || 0) >= 3) unlock('weekend_learner_3');
        if ((this.state.weekendQuizzesCompleted || 0) >= 5) unlock('weekend_learner_5');
        if ((this.state.weekendQuizzesCompleted || 0) >= 10) unlock('weekend_learner_10');
        if ((this.state.weekendQuizzesCompleted || 0) >= 15) unlock('weekend_learner_15');

        if ((this.state.astronomyXP || 0) >= 1000) unlock('astronomy_expert');
        if ((this.state.geologyXP || 0) >= 1000) unlock('geology_expert');
        if ((this.state.meteorologyXP || 0) >= 1000) unlock('meteorology_expert');
        if ((this.state.oceanographyXP || 0) >= 1000) unlock('oceanography_expert');

        if ((this.state.mechanicsXP || 0) >= 1000) unlock('mechanics_expert');
        if ((this.state.electromagnetismXP || 0) >= 1000) unlock('electromagnetism_expert');
        if ((this.state.wavesXP || 0) >= 1000) unlock('waves_expert');
        if ((this.state.modern_physicsXP || 0) >= 1000) unlock('modern_physics_expert');

        // NEW Badges
        if ((this.state.theoryXP || 0) >= 1000) unlock('theory_master');
        if ((this.state.calculationXP || 0) >= 1000) unlock('calculation_expert');
        if ((this.state.itemUsageCount || 0) >= 10) unlock('item_user_10');

        // Time-based badges
        if (this.state.lastQuizTime) {
            const date = new Date(this.state.lastQuizTime);
            const hour = date.getHours();
            if (hour >= 0 && hour < 5) unlock('night_owl');
            if (hour >= 5 && hour < 8) unlock('early_bird');
        }

        // Exam Prep Badges (Based on current month AND isExam flag)
        const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec

        if (isExam) {
            // Midterm: July(6), Aug(7), Dec(11), Jan(0)
            if ([0, 6, 7, 11].includes(currentMonth)) {
                unlock('midterm_prep');
            }

            // Final: Feb(1), Mar(2), Sep(8), Oct(9)
            if ([1, 2, 8, 9].includes(currentMonth)) {
                unlock('final_prep');
            }

            // Exam Ace: Score >= 80% on Exam
            if (lastQuizScorePercent >= 80) {
                unlock('exam_ace');
            }
        }

        // Hard Worker: 5 quizzes in a day
        if ((this.state.dailyQuizCount || 0) >= 5) {
            unlock('hard_worker');
        }

        // Speed Badge (Simplified check: if perfect score on non-custom quiz with sufficient questions, assume speed if we had data,
        // but since we lack duration data here, we might need to rely on the user to IMPLEMENT specific speed tracking later.
        // For now, let's leave speed_runner logic for a future update or if we can pass duration.)



        return newBadges;
    }

    getEarnedBadges() {
        return BADGES.filter(b => this.state.badges.includes(b.id));
    }

    getUnlockedAchievements() {
        return ACHIEVEMENTS.filter(a => this.state.unlockedAchievements.includes(a.id));
    }

    // คำนวณ % ความคืบหน้าไปยังเลเวลถัดไป
    getLevelProgressPercent() {
        return this.getCurrentLevel().progressPercent;
    }
}


export function initializeGamification() {
    return new Gamification();
}
