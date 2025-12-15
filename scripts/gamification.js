// scripts/gamification.js

// กำหนดเกณฑ์ XP สำหรับทุกสาย (ใช้เกณฑ์เดียวกันเพื่อความง่าย)
export const XP_THRESHOLDS = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 300 },
    { level: 4, xp: 600 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 1500 },
    { level: 7, xp: 2200 },
    { level: 8, xp: 3000 },
    { level: 9, xp: 4000 },
    { level: 10, xp: 5500 },
    { level: 11, xp: 7500 },
    { level: 12, xp: 10000 },
    { level: 13, xp: 13000 },
    { level: 14, xp: 16500 },
    { level: 15, xp: 20500 },
    { level: 16, xp: 25000 },
    { level: 17, xp: 30000 },
    { level: 18, xp: 36000 },
    { level: 19, xp: 43000 },
    { level: 20, xp: 50000 }
];

// ชื่อยศสำหรับแต่ละสาย
export const TRACK_TITLES = {
    overall: [
        "ผู้เริ่มต้น (Novice)", "นักสำรวจ (Explorer)", "ผู้รอบรู้ (Scholar)", 
        "ผู้เชี่ยวชาญ (Expert)", "ปราชญ์ (Sage)", "ปรมาจารย์ (Master)", 
        "ตำนาน (Legend)", "ผู้พิทักษ์ความรู้ (Guardian)", "มหาปราชญ์ (Grand Sage)", "เทพเจ้าแห่งปัญญา (God of Wisdom)"
    ],
    physics: [
        "นักฟิสิกส์ฝึกหัด", "ผู้สนใจกลศาสตร์", "นักทดลอง", 
        "ผู้เชี่ยวชาญทฤษฎี", "ปรมาจารย์ฟิสิกส์", "นิวตันกลับชาติมาเกิด", 
        "ผู้ควบคุมแรง", "จ้าวแห่งควอนตัม", "ผู้บิดเบือนมิติ", "ผู้สร้างกฎจักรวาล"
    ],
    earth: [
        "นักสำรวจหิน", "ผู้เชี่ยวชาญธรณี", "นักอุตุนิยมวิทยา", 
        "ผู้หยั่งรู้ดินฟ้า", "นักดาราศาสตร์", "ผู้พิทักษ์ไกอา", 
        "ผู้ท่องอวกาศ", "ผู้หยั่งรู้จักรวาล", "หนึ่งเดียวกับธรรมชาติ", "ผู้สร้างดวงดาว"
    ]
};

// คงไว้เพื่อความเข้ากันได้ (Backward Compatibility) และใช้อ้างอิง
export const LEVELS = XP_THRESHOLDS.map((t, i) => ({
    level: t.level,
    xp: t.xp,
    title: TRACK_TITLES.overall[i] || "Unknown"
}));

// กำหนดเหรียญรางวัล (Badges)
export const BADGES = [
    { id: 'first_quiz', icon: '🎯', name: 'จุดเริ่มต้น', desc: 'ทำแบบทดสอบครั้งแรกสำเร็จ', tier: 'bronze' },
    { id: 'perfect_score', icon: '🏆', name: 'คะแนนเต็ม', desc: 'ได้คะแนน 100% ในแบบทดสอบใดก็ได้', tier: 'gold' },
    { id: 'streak_3', icon: '🔥', name: 'ไฟแรง', desc: 'เข้าใช้งานต่อเนื่อง 3 วัน', tier: 'silver' },
    { id: 'streak_7', icon: '❤️‍🔥', name: 'ไฟลุกโชน', desc: 'เข้าใช้งานต่อเนื่อง 7 วัน', tier: 'gold' },
    { id: 'streak_14', icon: '📅', name: 'วินัยดีเยี่ยม', desc: 'เข้าใช้งานต่อเนื่อง 14 วัน', tier: 'gold' },
    { id: 'streak_30', icon: '🗓️', name: 'ตำนานความขยัน', desc: 'เข้าใช้งานต่อเนื่อง 30 วัน', tier: 'gold' },
    { id: 'streak_60', icon: '💎', name: 'ความเพียรเป็นเลิศ', desc: 'เข้าใช้งานต่อเนื่อง 60 วัน', tier: 'gold' },
    { id: 'quiz_master_5', icon: '🧠', name: 'คลังความรู้', desc: 'ทำแบบทดสอบครบ 5 ครั้ง', tier: 'silver' },
    { id: 'quiz_master_10', icon: '📚', name: 'ห้องสมุดเดินได้', desc: 'ทำแบบทดสอบครบ 10 ครั้ง', tier: 'gold' },
    { id: 'quiz_master_25', icon: '🎓', name: 'บัณฑิตน้อย', desc: 'ทำแบบทดสอบครบ 25 ครั้ง', tier: 'gold' },
    { id: 'quiz_master_50', icon: '🧙‍♂️', name: 'จอมเวทย์ความรู้', desc: 'ทำแบบทดสอบครบ 50 ครั้ง', tier: 'gold' },
    { id: 'quiz_master_100', icon: '👑', name: 'เทพเจ้าแห่งการสอบ', desc: 'ทำแบบทดสอบครบ 100 ครั้ง', tier: 'gold' },
    { id: 'high_scorer', icon: '⭐', name: 'ยอดเยี่ยม', desc: 'ได้คะแนนเกิน 80% จำนวน 3 ครั้ง', tier: 'gold' },
    { id: 'physics_lover', icon: '⚛️', name: 'รักฟิสิกส์', desc: 'ถึงเลเวล 3 ในสายฟิสิกส์', tier: 'silver' },
    { id: 'physics_expert', icon: '🌌', name: 'ผู้เชี่ยวชาญฟิสิกส์', desc: 'ถึงเลเวล 5 ในสายฟิสิกส์', tier: 'gold' },
    { id: 'physics_master', icon: '🪐', name: 'ปรมาจารย์ฟิสิกส์', desc: 'ถึงเลเวล 10 ในสายฟิสิกส์', tier: 'gold' },
    { id: 'earth_lover', icon: '🌍', name: 'รักษ์โลก', desc: 'ถึงเลเวล 3 ในสายวิทย์โลก', tier: 'silver' },
    { id: 'earth_expert', icon: '🌋', name: 'ผู้เชี่ยวชาญวิทย์โลก', desc: 'ถึงเลเวล 5 ในสายวิทย์โลก', tier: 'gold' },
    { id: 'earth_master', icon: '🏔️', name: 'จ้าวแห่งธรณี', desc: 'ถึงเลเวล 10 ในสายวิทย์โลก', tier: 'gold' },
    { id: 'xp_10k', icon: '💰', name: 'ผู้สั่งสมประสบการณ์', desc: 'มี XP รวมสะสมครบ 10,000', tier: 'gold' }
];

// กำหนดภารกิจประจำวัน (Daily Quests)
export const DAILY_QUESTS = [
    { id: 'quiz_1', desc: 'ทำแบบทดสอบให้จบ 1 ครั้ง', target: 1, type: 'quiz_complete', xp: 100 },
    { id: 'quiz_3', desc: 'ทำแบบทดสอบให้จบ 3 ครั้ง', target: 3, type: 'quiz_complete', xp: 250 },
    { id: 'correct_5', desc: 'ตอบถูกให้ได้ 5 ข้อ', target: 5, type: 'correct_answers', xp: 150 },
    { id: 'correct_10', desc: 'ตอบถูกให้ได้ 10 ข้อ', target: 10, type: 'correct_answers', xp: 250 },
    { id: 'correct_20', desc: 'ตอบถูกให้ได้ 20 ข้อ', target: 20, type: 'correct_answers', xp: 400 },
    { id: 'physics_3', desc: 'ทำโจทย์ฟิสิกส์ 3 ข้อ', target: 3, type: 'questions_category', category: 'Physics', xp: 200 },
    { id: 'physics_5', desc: 'ทำโจทย์ฟิสิกส์ 5 ข้อ', target: 5, type: 'questions_category', category: 'Physics', xp: 300 },
    { id: 'earth_3', desc: 'ทำโจทย์วิทย์โลก 3 ข้อ', target: 3, type: 'questions_category', category: 'Earth', xp: 200 },
    { id: 'earth_5', desc: 'ทำโจทย์วิทย์โลก 5 ข้อ', target: 5, type: 'questions_category', category: 'Earth', xp: 300 },
    { id: 'score_80', desc: 'ได้คะแนน 80% ขึ้นไป 1 ครั้ง', target: 1, type: 'high_score', threshold: 80, xp: 300 },
    { id: 'score_100', desc: 'ได้คะแนนเต็ม (100%) 1 ครั้ง', target: 1, type: 'high_score', threshold: 100, xp: 500 },
    { id: 'quiz_5', desc: 'ทำแบบทดสอบให้จบ 5 ครั้ง', target: 5, type: 'quiz_complete', xp: 400 },
    { id: 'correct_50', desc: 'ตอบถูกให้ได้ 50 ข้อ', target: 50, type: 'correct_answers', xp: 800 },
    { id: 'physics_10', desc: 'ทำโจทย์ฟิสิกส์ 10 ข้อ', target: 10, type: 'questions_category', category: 'Physics', xp: 500 },
    { id: 'earth_10', desc: 'ทำโจทย์วิทย์โลก 10 ข้อ', target: 10, type: 'questions_category', category: 'Earth', xp: 500 }
];

// กำหนดความสำเร็จ (Achievements)
export const ACHIEVEMENTS = [
    { id: 'level_5', title: 'นักเรียนดีเด่น', desc: 'เลเวลถึง 5', icon: '⭐', target: 5, type: 'level', rewardTitle: 'นักเรียนดีเด่น' },
    { id: 'level_10', title: 'สุดยอดปัญญา', desc: 'เลเวลถึง 10', icon: '👑', target: 10, type: 'level', rewardTitle: 'สุดยอดปัญญา' },
    { id: 'level_15', title: 'ผู้ทรงภูมิ', desc: 'เลเวลถึง 15', icon: '🔮', target: 15, type: 'level', rewardTitle: 'ผู้ทรงภูมิ' },
    { id: 'level_20', title: 'เหนือมนุษย์', desc: 'เลเวลถึง 20', icon: '🌟', target: 20, type: 'level', rewardTitle: 'เหนือมนุษย์' },
    { id: 'correct_100', title: 'แม่นยำดั่งจับวาง', desc: 'ตอบถูกครบ 100 ข้อ', icon: '🎯', target: 100, type: 'total_correct', rewardTitle: 'ผู้แม่นยำ' },
    { id: 'correct_500', title: 'คลังสมองเคลื่อนที่', desc: 'ตอบถูกครบ 500 ข้อ', icon: '🧠', target: 500, type: 'total_correct', rewardTitle: 'คลังสมอง' },
    { id: 'correct_1000', title: 'สารานุกรมเดินได้', desc: 'ตอบถูกครบ 1,000 ข้อ', icon: '📖', target: 1000, type: 'total_correct', rewardTitle: 'อัจฉริยะ' },
    { id: 'correct_2000', title: 'คอมพิวเตอร์มนุษย์', desc: 'ตอบถูกครบ 2,000 ข้อ', icon: '🤖', target: 2000, type: 'total_correct', rewardTitle: 'คอมพิวเตอร์มนุษย์' },
    { id: 'quiz_50', title: 'ผู้เจนจัดสนามสอบ', desc: 'ทำแบบทดสอบครบ 50 ครั้ง', icon: '📝', target: 50, type: 'total_quizzes', rewardTitle: 'เซียนข้อสอบ' },
    { id: 'quiz_100', title: 'ผู้พิชิตแบบทดสอบ', desc: 'ทำแบบทดสอบครบ 100 ครั้ง', icon: '💯', target: 100, type: 'total_quizzes', rewardTitle: 'ผู้พิชิต' },
    { id: 'quiz_200', title: 'ตำนานเดินดิน', desc: 'ทำแบบทดสอบครบ 200 ครั้ง', icon: '🏛️', target: 200, type: 'total_quizzes', rewardTitle: 'ตำนานเดินดิน' }
];

// กำหนดสินค้าในร้านค้า (Shop Items)
export const SHOP_ITEMS = [
    { id: 'avatar_wizard', type: 'avatar', name: 'พ่อมด', icon: '🧙', cost: 500, value: '🧙', desc: 'อวตารพ่อมดผู้ทรงพลัง' },
    { id: 'avatar_dragon', type: 'avatar', name: 'มังกร', icon: '🐉', cost: 1000, value: '🐉', desc: 'อวตารมังกรในตำนาน' },
    { id: 'avatar_unicorn', type: 'avatar', name: 'ยูนิคอร์น', icon: '🦄', cost: 1200, value: '🦄', desc: 'สัตว์วิเศษหายาก' },
    { id: 'avatar_ninja', type: 'avatar', name: 'นินจา', icon: '🥷', cost: 800, value: '🥷', desc: 'นักรบเงา' },
    { id: 'title_scholar', type: 'title', name: 'ผู้ใฝ่รู้', icon: '📚', cost: 300, value: 'ผู้ใฝ่รู้', desc: 'ฉายาสำหรับผู้รักการเรียน' },
    { id: 'title_master', type: 'title', name: 'ปรมาจารย์', icon: '🎓', cost: 2000, value: 'ปรมาจารย์', desc: 'ฉายาขั้นสูง' },
    { id: 'title_rich', type: 'title', name: 'เศรษฐี XP', icon: '💰', cost: 5000, value: 'เศรษฐี XP', desc: 'ฉายาสำหรับผู้มั่งคั่ง' },
    { id: 'theme_forest', type: 'theme', name: 'ป่าไม้ (Forest)', icon: '🌲', cost: 500, value: 'theme-forest', desc: 'ธีมสีเขียวธรรมชาติ' },
    { id: 'theme_sunset', type: 'theme', name: 'พระอาทิตย์ตก (Sunset)', icon: '🌅', cost: 800, value: 'theme-sunset', desc: 'ธีมสีส้มอบอุ่น' },
    { id: 'theme_ocean', type: 'theme', name: 'มหาสมุทร (Ocean)', icon: '🌊', cost: 800, value: 'theme-ocean', desc: 'ธีมสีฟ้าน้ำทะเล' },
    { id: 'theme_berry', type: 'theme', name: 'เบอร์รี่ (Berry)', icon: '🍇', cost: 1000, value: 'theme-berry', desc: 'ธีมสีม่วงสดใส' },
    { id: 'theme_dark', type: 'theme', name: 'รัตติกาล (Midnight)', icon: '🌑', cost: 1200, value: 'theme-midnight', desc: 'ธีมสีมืดลึกลับ' }
];

export class Gamification {
    constructor() {
        this.storageKey = 'app_gamification_data';
        
        // ตรวจสอบว่าเป็นผู้ใช้ใหม่สำหรับระบบเกมหรือไม่ (ยังไม่มีข้อมูล Gamification)
        const isNewToGamification = !localStorage.getItem(this.storageKey);
        
        this.state = this.loadState();
        
        // ถ้าเป็นผู้ใช้ใหม่ของระบบเกม ให้ลองดึงข้อมูลเก่ามาคำนวณ
        if (isNewToGamification) {
            this.syncProgress();
        }

        this.updateStreak();
        this.applyTheme(this.state.selectedTheme);
        this.updateHeaderAvatar();
    }

    loadState() {
        const stored = localStorage.getItem(this.storageKey);
        let state = null;
        try {
            if (stored) {
                state = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error loading gamification state:", e);
        }

        if (!state || typeof state !== 'object') {
            state = {
                xp: 0,
                physicsXP: 0,
                earthXP: 0,
                badges: [], // เก็บ badge id
                quizzesCompleted: 0,
                lastLogin: null,
                streak: 0,
                activeQuests: [], // เก็บรายการภารกิจ 3 งาน
                rerolls: 3, // จำนวนครั้งที่เปลี่ยนภารกิจได้
                lastQuestDate: null,
                avatar: '🧑‍🎓', // Default avatar
                displayName: 'ผู้เรียน (Guest)', // Default name
                totalCorrectAnswers: 0, // สะสมจำนวนข้อที่ตอบถูกทั้งหมด
                questHistory: [], // ประวัติการทำภารกิจ
                unlockedAchievements: [], // ความสำเร็จที่ปลดล็อกแล้ว
                selectedTitle: null, // ฉายาที่เลือก
                inventory: [], // รายการไอเทมที่ซื้อแล้ว
                selectedTheme: null // ธีมที่เลือก
            };
        }

        // ตรวจสอบและรีเซ็ตภารกิจถ้าเป็นวันใหม่
        const today = new Date().toDateString();
        if (state.lastQuestDate !== today) {
            state.activeQuests = this.generateDailyQuests();
            state.rerolls = 3; // รีเซ็ตสิทธิ์การเปลี่ยนภารกิจ
            state.lastQuestDate = today;
            state.dailyQuest = null; // ล้างข้อมูลเก่า (ถ้ามี)
            if (stored) this.saveState(); // บันทึกทันทีถ้ามีการเปลี่ยนภารกิจ
        }

        // Ensure avatar exists for existing users
        if (!state.avatar) state.avatar = '🧑‍🎓';
        if (!state.displayName) state.displayName = 'ผู้เรียน (Guest)';

        // Ensure XP tracks exist for existing users (fix for NaN issues)
        if (state.physicsXP === undefined) state.physicsXP = 0;
        if (state.earthXP === undefined) state.earthXP = 0;
        
        // Ensure new fields exist for existing users
        if (state.totalCorrectAnswers === undefined) state.totalCorrectAnswers = 0;
        if (!state.questHistory) state.questHistory = [];
        if (!state.unlockedAchievements) state.unlockedAchievements = [];
        if (state.selectedTitle === undefined) state.selectedTitle = null;
        if (!state.inventory) state.inventory = [];
        if (state.selectedTheme === undefined) state.selectedTheme = null;
        
        return state;
    }

    // ฟังก์ชันสำหรับดึงข้อมูลการทำโจทย์เก่าๆ มาคำนวณเป็น XP เริ่มต้น
    syncProgress() {
        let totalXP = 0;
        let physicsXP = 0;
        let earthXP = 0;
        let completed = 0;
        let totalCorrect = 0;

        // วนลูปดูข้อมูลทั้งหมดใน LocalStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // ถ้าเจอคีย์ที่เป็นข้อมูลการทำโจทย์ (quizState-...)
            if (key && key.startsWith('quizState-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.userAnswers) {
                        const correctCount = data.score || 0;
                        const xp = correctCount * 2; // ให้ 2 XP ต่อ 1 ข้อที่ถูก (ตามเกณฑ์ปัจจุบัน)
                        
                        totalXP += xp;
                        totalCorrect += correctCount;
                        
                        // นับจำนวนชุดที่ทำเสร็จ (ดูจากจำนวนข้อที่ตอบเทียบกับจำนวนข้อทั้งหมด)
                        const totalQ = data.shuffledQuestions ? data.shuffledQuestions.length : 0;
                        const answered = data.userAnswers.filter(a => a).length;
                        if (totalQ > 0 && answered >= totalQ) {
                            completed++;
                        }

                        // แยกสายวิชา (พยายามเดาจากข้อมูลที่มี)
                        let category = 'General';
                        const firstAns = data.userAnswers.find(a => a);
                        if (firstAns) {
                            if (firstAns.sourceQuizCategory) category = firstAns.sourceQuizCategory;
                            else if (firstAns.subCategory) {
                                category = typeof firstAns.subCategory === 'object' ? firstAns.subCategory.main : firstAns.subCategory;
                            }
                        }
                        
                        const lowerCat = String(category).toLowerCase();
                        if (lowerCat.includes('physics') || lowerCat.includes('ฟิสิกส์')) {
                            physicsXP += xp;
                        } else if (lowerCat.includes('earth') || lowerCat.includes('astronomy') || lowerCat.includes('space') || lowerCat.includes('โลก') || lowerCat.includes('ดาราศาสตร์') || lowerCat.includes('วิทย์โลก')) {
                            earthXP += xp;
                        }
                    }
                } catch (e) {
                    console.warn("Skipping invalid quiz state during sync:", key);
                }
            }
        }

        // ถ้าพบข้อมูลเก่า ให้อัปเดตสถานะเริ่มต้นทันที
        if (totalXP > 0) {
            this.state.xp = totalXP;
            this.state.physicsXP = physicsXP;
            this.state.earthXP = earthXP;
            this.state.quizzesCompleted = completed;
            this.state.totalCorrectAnswers = totalCorrect;
            
            // ตรวจสอบและปลดล็อกเหรียญรางวัลจากข้อมูลเก่าทันที
            this.checkBadges(0); 
            this.saveState();
            console.log(`Synced old progress: ${totalXP} XP, ${completed} Quizzes`);
        }
    }

    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error("Error saving gamification state:", e);
        }
    }

    setAvatar(avatar) {
        this.state.avatar = avatar;
        this.saveState();
        this.updateHeaderAvatar();
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
        this.applyTheme(themeValue);
    }

    buyItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: "ไม่พบสินค้า" };
        if (this.state.inventory.includes(itemId)) return { success: false, message: "คุณมีสินค้านี้แล้ว" };
        if (this.state.xp < item.cost) return { success: false, message: "XP ไม่เพียงพอ" };

        this.state.xp -= item.cost;
        this.state.inventory.push(itemId);
        this.saveState();
        return { success: true, message: `ซื้อ ${item.name} สำเร็จ!`, item };
    }

    getInventory() {
        return this.state.inventory || [];
    }

    updateHeaderAvatar() {
        const profileLink = document.getElementById('main-header-profile-link');
        if (profileLink) {
            const avatar = this.state.avatar || '🧑‍🎓';
            // ตรวจสอบว่าเป็น URL รูปภาพหรือไม่ (มีจุดหรือเครื่องหมาย /)
            const isImage = avatar.includes('/') || avatar.includes('.');
            
            if (isImage) {
                profileLink.innerHTML = `<img src="${avatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover">`;
            } else {
                profileLink.innerHTML = `<span class="text-xl leading-none">${avatar}</span>`;
            }

            // Trigger Animation
            profileLink.classList.remove('anim-avatar-pop');
            void profileLink.offsetWidth; // Force reflow to restart animation
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
            this.injectThemeStyles();
        }
    }

    injectThemeStyles() {
        if (document.getElementById('gamification-theme-styles')) return;

        const style = document.createElement('style');
        style.id = 'gamification-theme-styles';
        
        const themes = {
            'forest': { main: '#059669', hover: '#047857', light_bg: '#d1fae5', dark_bg: 'rgba(6, 78, 59, 0.5)' },
            'sunset': { main: '#ea580c', hover: '#c2410c', light_bg: '#ffedd5', dark_bg: 'rgba(124, 45, 18, 0.5)' },
            'ocean': { main: '#0891b2', hover: '#0e7490', light_bg: '#cffafe', dark_bg: 'rgba(22, 78, 99, 0.5)' },
            'berry': { main: '#db2777', hover: '#be185d', light_bg: '#fce7f3', dark_bg: 'rgba(131, 24, 67, 0.5)' },
            'midnight': { main: '#475569', hover: '#334155', light_bg: '#f1f5f9', dark_bg: 'rgba(30, 41, 59, 0.8)' }
        };

        // เพิ่ม Animation Styles
        let allStyles = `
            @keyframes avatarPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.25); }
                100% { transform: scale(1); }
            }
            .anim-avatar-pop {
                animation: avatarPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
        `;

        for (const [themeName, colors] of Object.entries(themes)) {
            allStyles += `
                /* --- ${themeName.toUpperCase()} THEME OVERRIDES --- */

                /* === 1. Main UI & Quiz Page Accent (replaces blue) === */
                .theme-${themeName} .bg-blue-500,
                .theme-${themeName} .bg-blue-600,
                .theme-${themeName} .dark\\:bg-blue-600,
                .theme-${themeName} input[type="radio"]:checked,
                .theme-${themeName} input[type="checkbox"]:checked {
                    background-color: ${colors.main} !important;
                    border-color: ${colors.main} !important;
                }

                .theme-${themeName} .hover\\:bg-blue-600:hover,
                .theme-${themeName} .hover\\:bg-blue-700:hover,
                .theme-${themeName} .dark\\:hover\\:bg-blue-700:hover {
                    background-color: ${colors.hover} !important;
                }

                .theme-${themeName} .text-blue-500,
                .theme-${themeName} .text-blue-600,
                .theme-${themeName} .dark\\:text-blue-400,
                .theme-${themeName} .dark\\:text-blue-300 {
                    color: ${colors.main} !important;
                }

                .theme-${themeName} .border-blue-500,
                .theme-${themeName} .has-\\[\\:checked\\]\\:border-blue-500:checked {
                    border-color: ${colors.main} !important;
                }
                
                .theme-${themeName} .hover\\:border-blue-500:hover {
                     border-color: ${colors.main} !important;
                }

                .theme-${themeName} .focus\\:ring-blue-500:focus {
                    --tw-ring-color: ${colors.main} !important;
                }

                .theme-${themeName} .bg-blue-100,
                .theme-${themeName} .dark\\:bg-blue-900\\/30 {
                    background-color: ${colors.light_bg} !important;
                }
                .theme-${themeName} .dark .bg-blue-100, 
                .theme-${themeName} .dark\\:bg-blue-900\\/50 {
                    background-color: ${colors.dark_bg} !important;
                }
                
                .theme-${themeName} .hover\\:bg-blue-200:hover { background-color: ${colors.main} !important; opacity: 0.2; }
                .theme-${themeName} .dark\\:hover\\:bg-blue-800:hover { background-color: ${colors.hover} !important; opacity: 0.4; }

                /* === 2. Index Page Card Hovers === */
                .theme-${themeName} .quiz-card:hover {
                    border-color: ${colors.main} !important;
                    --tw-shadow-color: ${colors.main} !important;
                }
                .theme-${themeName} .quiz-card:hover h3 {
                    color: ${colors.main} !important;
                }
                .theme-${themeName} .quiz-card:hover .section-icon-container {
                    background-color: ${colors.light_bg} !important;
                }
                .theme-${themeName} .dark .quiz-card:hover .section-icon-container {
                    background-color: ${colors.dark_bg} !important;
                }
            `;
        }

        style.textContent = allStyles;
        document.head.appendChild(style);
    }

    resetProgress() {
        localStorage.removeItem(this.storageKey);
        this.state = this.loadState(); // Reloads defaults
        // Force save to ensure clean state exists
        this.saveState();
    }

    // ฟังก์ชันช่วยคำนวณเลเวลจาก XP และสายที่ระบุ
    getLevelInfo(xp, track = 'overall') {
        let level = 1;
        let nextLevelXP = XP_THRESHOLDS[1].xp;
        
        for (let i = 0; i < XP_THRESHOLDS.length; i++) {
            if (xp >= XP_THRESHOLDS[i].xp) {
                level = XP_THRESHOLDS[i].level;
                if (i < XP_THRESHOLDS.length - 1) {
                    nextLevelXP = XP_THRESHOLDS[i+1].xp;
                } else {
                    nextLevelXP = null; // Max level
                }
            }
        }

        const titles = TRACK_TITLES[track] || TRACK_TITLES['overall'];
        const titleIndex = Math.min(level - 1, titles.length - 1);
        
        // คำนวณ % ความคืบหน้า
        let progressPercent = 100;
        if (nextLevelXP) {
            const currentLevelBaseXP = XP_THRESHOLDS[level - 1].xp;
            const range = nextLevelXP - currentLevelBaseXP;
            const gained = xp - currentLevelBaseXP;
            progressPercent = Math.min(100, Math.max(0, (gained / range) * 100));
        }

        return {
            level: level,
            title: titles[titleIndex],
            currentXP: xp,
            nextLevelXP: nextLevelXP,
            progressPercent: progressPercent
        };
    }

    getCurrentLevel() {
        return this.getLevelInfo(this.state.xp, 'overall');
    }

    getPhysicsLevel() {
        return this.getLevelInfo(this.state.physicsXP, 'physics');
    }

    getEarthLevel() {
        return this.getLevelInfo(this.state.earthXP, 'earth');
    }

    // Legacy support (เพื่อให้โค้ดเก่าไม่พัง)
    getNextLevel() {
        const info = this.getCurrentLevel();
        if (!info.nextLevelXP) return null;
        return { level: info.level + 1, xp: info.nextLevelXP };
    }

    // สุ่มภารกิจใหม่
    generateDailyQuests() {
        // สุ่มมา 3 งานไม่ซ้ำกัน
        const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).map(q => ({
            ...q,
            progress: 0,
            completed: false,
            date: new Date().toDateString()
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
            date: new Date().toDateString()
        };
        this.state.rerolls--;
        this.saveState();
        return { success: true, quest: this.state.activeQuests[index], rerollsLeft: this.state.rerolls };
    }

    // ฟังก์ชันอัปเดต Streak (เรียกใช้ใน constructor)
    updateStreak() {
        const today = new Date().toDateString();
        const lastLogin = this.state.lastLogin;

        // ถ้าเข้าใช้งานวันนี้ไปแล้ว
        if (lastLogin === today) {
            // กรณีเป็นผู้ใช้ใหม่หรือเพิ่งเริ่มระบบ streak ให้ตั้งค่าเริ่มต้นเป็น 1
            if (this.state.streak === 0) {
                this.state.streak = 1;
                this.saveState();
            }
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // เช็คว่าเข้าใช้งานเมื่อวานหรือไม่
        if (lastLogin === yesterday.toDateString()) {
            this.state.streak = (this.state.streak || 0) + 1;
        } else {
            // ถ้าขาดช่วง หรือเพิ่งเริ่มใหม่
            this.state.streak = 1;
        }

        this.state.lastLogin = today;
        this.saveState();
    }

    // ฟังก์ชันเพิ่ม XP (เรียกใช้เมื่อทำข้อสอบเสร็จ)
    addXP(amount, category = '') {
        const oldLevel = this.getCurrentLevel();
        const oldPhysics = this.getPhysicsLevel();
        const oldEarth = this.getEarthLevel();

        this.state.xp += amount;
        
        // ตรวจสอบสายวิชาจาก category
        let isPhysics = false;
        let isEarth = false;
        const catString = (typeof category === 'string') ? category : (category?.main || String(category || ''));
        const lowerCat = catString.toLowerCase();

        if (lowerCat.includes('physics') || lowerCat.includes('ฟิสิกส์')) {
            this.state.physicsXP += amount;
            isPhysics = true;
        } else if (lowerCat.includes('earth') || lowerCat.includes('astronomy') || lowerCat.includes('space') || lowerCat.includes('โลก') || lowerCat.includes('ดาราศาสตร์') || lowerCat.includes('วิทย์โลก')) {
            this.state.earthXP += amount;
            isEarth = true;
        }

        this.state.quizzesCompleted += 1;
        this.saveState();

        const newLevel = this.getCurrentLevel();
        const newPhysics = this.getPhysicsLevel();
        const newEarth = this.getEarthLevel();

        return {
            leveledUp: newLevel.level > oldLevel.level, // For backward compatibility
            newLevel: newLevel, // For backward compatibility
            
            // Detailed results
            overall: { leveledUp: newLevel.level > oldLevel.level, info: newLevel },
            physics: { leveledUp: isPhysics && newPhysics.level > oldPhysics.level, info: newPhysics },
            earth: { leveledUp: isEarth && newEarth.level > oldEarth.level, info: newEarth }
        };
    }

    // ฟังก์ชันใหม่: บันทึกผลการทำข้อสอบโดยรับค่า XP แยกตามสายวิชา
    submitQuizResult(totalXP, physicsXP, earthXP) {
        const oldLevel = this.getCurrentLevel();
        const oldPhysics = this.getPhysicsLevel();
        const oldEarth = this.getEarthLevel();

        this.state.xp += totalXP;
        this.state.physicsXP += physicsXP;
        this.state.earthXP += earthXP;
        this.state.quizzesCompleted += 1;
        
        this.saveState();

        const newLevel = this.getCurrentLevel();
        const newPhysics = this.getPhysicsLevel();
        const newEarth = this.getEarthLevel();

        return {
            overall: { leveledUp: newLevel.level > oldLevel.level, info: newLevel },
            physics: { leveledUp: newPhysics.level > oldPhysics.level, info: newPhysics },
            earth: { leveledUp: newEarth.level > oldEarth.level, info: newEarth }
        };
    }

    // ฟังก์ชันอัปเดตความคืบหน้าภารกิจ
    updateQuest(stats) {
        if (!this.state.activeQuests) return [];

        // อัปเดตสถิติรวม (Total Stats)
        if (stats.correctAnswers) {
            this.state.totalCorrectAnswers += stats.correctAnswers;
        }

        // ตรวจสอบความสำเร็จ (Achievements) ทันทีที่มีการอัปเดตสถิติ
        const newAchievements = this.checkAchievements();
        
        const completedQuests = [];

        this.state.activeQuests.forEach(q => {
            if (q.completed) return;

            let progressMade = 0;

            if (q.type === 'quiz_complete') {
                progressMade = 1;
            } else if (q.type === 'correct_answers') {
                progressMade = stats.correctAnswers || 0;
            } else if (q.type === 'questions_category') {
                if (this.checkCategoryMatch(stats.category, q.category)) {
                    progressMade = stats.totalQuestions || 0;
                }
            } else if (q.type === 'high_score') {
                const threshold = q.threshold || 80;
                if (stats.percentage >= threshold) progressMade = 1;
            }

            if (progressMade > 0) {
                q.progress += progressMade;
                // ตรวจสอบว่าทำสำเร็จหรือไม่
                if (q.progress >= q.target) {
                    q.progress = q.target;
                    q.completed = true;
                    this.addXP(q.xp, 'General'); // ให้รางวัล XP
                    completedQuests.push({ completed: true, quest: q });

                    // บันทึกลงประวัติ (History)
                    this.state.questHistory.unshift({
                        id: q.id,
                        desc: q.desc,
                        date: new Date().toLocaleDateString('th-TH'),
                        xp: q.xp
                    });
                    // เก็บประวัติล่าสุด 50 รายการ
                    if (this.state.questHistory.length > 50) this.state.questHistory.pop();
                }
            }
        });
        
        if (completedQuests.length > 0 || newAchievements.length > 0) {
            this.saveState();
        }
        
        // ส่งคืนทั้งภารกิจที่เสร็จและความสำเร็จใหม่
        return { completed: completedQuests, newAchievements };
    }

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

            if (achieved) {
                this.state.unlockedAchievements.push(ach.id);
                newUnlocks.push(ach);

                // บันทึกลงประวัติ (History) เพื่อให้ผู้ใช้เห็นว่าทำสำเร็จแล้ว
                this.state.questHistory.unshift({
                    id: ach.id,
                    desc: `ปลดล็อกความสำเร็จ: ${ach.title}`,
                    date: new Date().toLocaleDateString('th-TH'),
                    xp: 0
                });
                if (this.state.questHistory.length > 50) this.state.questHistory.pop();
            }
        });
        return newUnlocks;
    }

    checkCategoryMatch(quizCat, questCat) {
        if (!quizCat) return false;
        const catString = (typeof quizCat === 'string') ? quizCat : (quizCat?.main || String(quizCat || ''));
        const lowerQuiz = catString.toLowerCase();
        const lowerQuest = questCat.toLowerCase();
        if (lowerQuest === 'physics') return lowerQuiz.includes('physics') || lowerQuiz.includes('ฟิสิกส์');
        if (lowerQuest === 'earth') return lowerQuiz.includes('earth') || lowerQuiz.includes('astronomy') || lowerQuiz.includes('space') || lowerQuiz.includes('โลก') || lowerQuiz.includes('ดาราศาสตร์') || lowerQuiz.includes('วิทย์โลก');
        return false;
    }

    // ฟังก์ชันตรวจสอบและปลดล็อก Badge
    checkBadges(lastQuizScorePercent) {
        const newBadges = [];
        
        // Helper เพื่อปลดล็อก
        const unlock = (badgeId) => {
            if (!this.state.badges.includes(badgeId)) {
                this.state.badges.push(badgeId);
                newBadges.push(BADGES.find(b => b.id === badgeId));
            }
        };

        // 1. First Quiz
        if (this.state.quizzesCompleted >= 1) unlock('first_quiz');

        // 2. Perfect Score
        if (lastQuizScorePercent === 100) unlock('perfect_score');

        // 3. Quiz Master (5 Quizzes)
        if (this.state.quizzesCompleted >= 5) unlock('quiz_master_5');
        if (this.state.quizzesCompleted >= 10) unlock('quiz_master_10');
        if (this.state.quizzesCompleted >= 25) unlock('quiz_master_25');
        if (this.state.quizzesCompleted >= 50) unlock('quiz_master_50');
        if (this.state.quizzesCompleted >= 100) unlock('quiz_master_100');

        // 4. Streak 3 Days (ไฟแรง)
        if (this.state.streak >= 3) unlock('streak_3');
        if (this.state.streak >= 7) unlock('streak_7');
        if (this.state.streak >= 14) unlock('streak_14');
        if (this.state.streak >= 30) unlock('streak_30');
        if (this.state.streak >= 60) unlock('streak_60');

        // 5. Level based badges
        if (this.getPhysicsLevel().level >= 3) unlock('physics_lover');
        if (this.getPhysicsLevel().level >= 5) unlock('physics_expert');
        if (this.getPhysicsLevel().level >= 10) unlock('physics_master');
        if (this.getEarthLevel().level >= 3) unlock('earth_lover');
        if (this.getEarthLevel().level >= 5) unlock('earth_expert');
        if (this.getEarthLevel().level >= 10) unlock('earth_master');

        // 6. XP based badges
        if (this.state.xp >= 10000) unlock('xp_10k');

        this.saveState();
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