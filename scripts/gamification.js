// scripts/gamification.js

import { authManager } from './auth-manager.js';

// กำหนดเกณฑ์ XP สำหรับทุกสาย (ใช้เกณฑ์เดียวกันเพื่อความง่าย)
// แต่ละเลเวลจะมีเงื่อนไข (Quest) ที่ต้องทำให้สำเร็จก่อนจึงจะเลื่อนระดับได้
export const XP_THRESHOLDS = [
    { level: 1, xp: 0, quest: null }, // No quest to reach level 1
    { level: 2, xp: 100, quest: { type: 'correct_streak', target: 10, desc: 'ตอบคำถามถูกติดต่อกัน 10 ข้อ' } },
    { level: 3, xp: 300, quest: { type: 'quizzes_completed', target: 5, desc: 'ทำแบบทดสอบให้ครบ 5 ครั้ง' } },
    { level: 4, xp: 600, quest: { type: 'perfect_scores', target: 1, desc: 'ทำคะแนนเต็ม 100% ให้ได้ 1 ครั้ง' } },
    { level: 5, xp: 1000, quest: { type: 'high_scores_80', target: 3, desc: 'ทำคะแนนได้ 80% ขึ้นไป 3 ครั้ง' } },
    { level: 6, xp: 1500, quest: { type: 'quizzes_completed', target: 15, desc: 'ทำแบบทดสอบให้ครบ 15 ครั้ง' } },
    { level: 7, xp: 2200, quest: { type: 'correct_streak', target: 20, desc: 'ตอบคำถามถูกติดต่อกัน 20 ข้อ' } },
    { level: 8, xp: 3000, quest: { type: 'physics_level', target: 5, desc: 'ไปให้ถึงเลเวล 5 ในสายฟิสิกส์' } },
    { level: 9, xp: 4000, quest: { type: 'earth_level', target: 5, desc: 'ไปให้ถึงเลเวล 5 ในสายวิทย์โลก' } },
    { level: 10, xp: 5500, quest: { type: 'quizzes_completed', target: 30, desc: 'ทำแบบทดสอบให้ครบ 30 ครั้ง' } },
    { level: 11, xp: 7500, quest: { type: 'high_scores_80', target: 10, desc: 'ทำคะแนนได้ 80% ขึ้นไป 10 ครั้ง' } },
    { level: 12, xp: 10000, quest: { type: 'correct_streak', target: 30, desc: 'ตอบคำถามถูกติดต่อกัน 30 ข้อ' } },
    { level: 13, xp: 13000, quest: { type: 'quizzes_completed', target: 50, desc: 'ทำแบบทดสอบให้ครบ 50 ครั้ง' } },
    { level: 14, xp: 16500, quest: { type: 'perfect_scores', target: 5, desc: 'ทำคะแนนเต็ม 100% ให้ได้ 5 ครั้ง' } },
    { level: 15, xp: 20500, quest: { type: 'physics_level', target: 10, desc: 'ไปให้ถึงเลเวล 10 ในสายฟิสิกส์' } },
    { level: 16, xp: 25000, quest: { type: 'earth_level', target: 10, desc: 'ไปให้ถึงเลเวล 10 ในสายวิทย์โลก' } },
    { level: 17, xp: 30000, quest: { type: 'high_scores_80', target: 20, desc: 'ทำคะแนนได้ 80% ขึ้นไป 20 ครั้ง' } },
    { level: 18, xp: 36000, quest: { type: 'quizzes_completed', target: 100, desc: 'ทำแบบทดสอบให้ครบ 100 ครั้ง' } },
    { level: 19, xp: 43000, quest: { type: 'correct_streak', target: 50, desc: 'ตอบคำถามถูกติดต่อกัน 50 ข้อ' } },
    { level: 20, xp: 50000, quest: { type: 'perfect_scores', target: 10, desc: 'ทำคะแนนเต็ม 100% ให้ได้ 10 ครั้ง' } }
];

// ชื่อยศสำหรับแต่ละสาย (Titles)
// ผู้เล่นจะได้รับฉายาตามเลเวลที่ทำได้ในแต่ละสาย (Overall, Physics, Earth Science)
// โดยระบบจะเลือกฉายาจาก Array นี้ตามลำดับเลเวล (Level 1 = Index 0)
// หากเลเวลเกินจำนวนฉายาที่มี จะใช้ฉายาสูงสุดที่มีอยู่
export const TRACK_TITLES = {
    overall: [
        "ผู้เริ่มต้น (Novice)", "นักสำรวจ (Explorer)", "ผู้รอบรู้ (Scholar)", 
        "ผู้เชี่ยวชาญ (Expert)", "ปราชญ์ (Sage)", "ปรมาจารย์ (Master)", 
        "ตำนาน (Legend)", "ผู้พิทักษ์ความรู้ (Guardian)", "มหาปราชญ์ (Grand Sage)", "เทพเจ้าแห่งปัญญา (God of Wisdom)",
        "ผู้หยั่งรู้ (The Seer)", "ผู้บรรลุ (The Enlightened)", "ผู้รอบรู้จักรวาล (Cosmic Scholar)",
        "ผู้พิทักษ์ดวงดาว (Stellar Guardian)", "ปรมาจารย์แห่งเอกภพ (Celestial Master)", "ผู้ถอดรหัสจักรวาล (Cosmic Decoder)",
        "ผู้บัญชาการดวงดาว (Star Commander)", "ตำนานแห่งกาแล็กซี (Galactic Legend)", "ผู้สร้างเอกภพ (Universe Crafter)", "หนึ่งเดียวกับจักรวาล (The One with the Cosmos)"
    ],
    physics: [
        "นักฟิสิกส์ฝึกหัด", "ผู้สนใจกลศาสตร์", "นักทดลอง", 
        "ผู้เชี่ยวชาญทฤษฎี", "ปรมาจารย์ฟิสิกส์", "นิวตันกลับชาติมาเกิด", 
        "ผู้ควบคุมแรง", "จ้าวแห่งควอนตัม", "ผู้บิดเบือนมิติ", "ผู้สร้างกฎจักรวาล",
        "ผู้เชี่ยวชาญแรงโน้มถ่วง", "นักเดินทางข้ามเวลา", "ผู้ควบคุมปฏิสสาร",
        "จ้าวแห่งสัมพัทธภาพ", "ผู้สร้างหลุมดำ", "ปรมาจารย์แห่งสตริง",
        "ผู้ควบคุมเอกภพคู่ขนาน", "ผู้เขียนกฎฟิสิกส์ใหม่", "ผู้หลอมรวมพลังงาน", "ไอน์สไตน์กลับชาติมาเกิด"
    ],
    earth: [
        "นักสำรวจหิน", "ผู้เชี่ยวชาญธรณี", "นักอุตุนิยมวิทยา", 
        "ผู้หยั่งรู้ดินฟ้า", "นักดาราศาสตร์", "ผู้พิทักษ์ไกอา", 
        "ผู้ท่องอวกาศ", "ผู้หยั่งรู้จักรวาล", "หนึ่งเดียวกับธรรมชาติ", "ผู้สร้างดวงดาว",
        "นักธรณีฟิสิกส์", "ผู้ควบคุมแผ่นเปลือกโลก", "ผู้บัญชาการลมฟ้า",
        "ผู้สร้างระบบดาวเคราะห์", "นักสำรวจดาราจักร", "ผู้ค้นพบเนบิวลา",
        "ผู้ควบคุมแก่นโลก", "ผู้พิทักษ์ชีวมณฑล", "ผู้สร้างโลก", "เทพเจ้าแห่งดวงดาว"
    ]
};

// คงไว้เพื่อความเข้ากันได้ (Backward Compatibility) และใช้อ้างอิง
export const LEVELS = XP_THRESHOLDS.map((t, i) => ({
    level: t.level,
    xp: t.xp,
    title: TRACK_TITLES.overall[i] || "Unknown"
}));

// NEW: Proficiency Groups (Shared definition)
export const PROFICIENCY_GROUPS = {
    'Mechanics': { 
        label: 'กลศาสตร์', 
        field: 'mechanicsXP',
        track: 'physics',
        keywords: ['บทที่ 1:', 'บทที่ 2:', 'บทที่ 3:', 'บทที่ 4:', 'บทที่ 5:', 'บทที่ 6:', 'บทที่ 7:', 'บทที่ 8:', 'บทที่ 15:', 'ธรรมชาติทางฟิสิกส์', 'การเคลื่อนที่', 'แรง', 'สมดุล', 'งาน', 'โมเมนตัม', 'ของแข็ง'] 
    },
    'Electricity': { 
        label: 'ไฟฟ้าและแม่เหล็ก', 
        field: 'electricityXP',
        track: 'physics',
        keywords: ['บทที่ 12:', 'บทที่ 13:', 'บทที่ 14:', 'ไฟฟ้า', 'แม่เหล็ก'] 
    },
    'WavesLight': { 
        label: 'คลื่นและแสง', 
        field: 'wavesLightXP',
        track: 'physics',
        keywords: ['บทที่ 9:', 'บทที่ 10:', 'บทที่ 11:', 'บทที่ 17:', 'คลื่น', 'เสียง', 'แสง'] 
    },
    'ModernHeat': { 
        label: 'สสารและฟิสิกส์ยุคใหม่', 
        field: 'modernHeatXP',
        track: 'physics',
        keywords: ['บทที่ 16:', 'บทที่ 18:', 'บทที่ 19:', 'ความร้อน', 'อะตอม', 'นิวเคลียร์'] 
    },
    'Astronomy': { 
        label: 'ดาราศาสตร์', 
        field: 'astronomyXP',
        track: 'earth',
        keywords: ['เอกภพ', 'กาแล็กซี', 'ดาวฤกษ์', 'ระบบสุริยะ', 'เทคโนโลยีอวกาศ', 'ทรงกลมฟ้า', 'ดาวเคราะห์', 'ดาราศาสตร์'] 
    },
    'Geology': { 
        label: 'ธรณีวิทยา', 
        field: 'geologyXP',
        track: 'earth',
        keywords: ['โครงสร้างโลก', 'แปรสัณฐาน', 'ธรณี', 'หิน', 'แร่', 'แผนที่', 'ดิน', 'ทรัพยากรธรณี'] 
    },
    'Meteorology': { 
        label: 'อุตุนิยมวิทยา', 
        field: 'meteorologyXP',
        track: 'earth',
        keywords: ['ลมฟ้าอากาศ', 'ภูมิอากาศ', 'อากาศ', 'หมุนเวียน', 'เมฆ', 'พยากรณ์', 'สมุทร', 'บรรยากาศ', 'อุตุนิยมวิทยา'] 
    }
};

// กำหนดเหรียญรางวัล (Badges)
export const BADGES = [
    { id: 'first_quiz', icon: '🎯', name: 'จุดเริ่มต้น', desc: 'ทำแบบทดสอบครั้งแรกสำเร็จ', tier: 'bronze' },
    { id: 'perfect_score', icon: '🏆', name: 'คะแนนเต็ม', desc: 'ได้คะแนน 100% ในแบบทดสอบที่เข้าเกณฑ์', tier: 'silver' },
    { id: 'perfect_scorer_3', icon: '🏅', name: 'ผู้สมบูรณ์แบบ', desc: 'ได้คะแนน 100% จำนวน 3 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'gold' },
    { id: 'perfect_scorer_5', icon: '🎖️', name: 'เจ้าแห่งความสมบูรณ์', desc: 'ได้คะแนน 100% จำนวน 5 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'gold' },
    { id: 'high_scorer_3', icon: '⭐', name: 'ยอดเยี่ยม', desc: 'ได้คะแนนเกิน 80% จำนวน 3 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'bronze' },
    { id: 'high_scorer_5', icon: '🌟', name: 'ดาวเด่น', desc: 'ได้คะแนนเกิน 80% จำนวน 5 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'silver' },
    { id: 'high_scorer_10', icon: '🌠', name: 'ดาวจรัสฟ้า', desc: 'ได้คะแนนเกิน 80% จำนวน 10 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'gold' },
    { id: 'marathon_runner', icon: '🏃‍♂️', name: 'นักวิ่งมาราธอน', desc: 'ทำแบบทดสอบที่มี 50 ข้อขึ้นไปจนสำเร็จ', tier: 'silver' },
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
    { id: 'physics_lover', icon: '⚛️', name: 'รักฟิสิกส์', desc: 'ถึงเลเวล 3 ในสายฟิสิกส์', tier: 'silver' },
    { id: 'physics_expert', icon: '🌌', name: 'ผู้เชี่ยวชาญฟิสิกส์', desc: 'ถึงเลเวล 5 ในสายฟิสิกส์', tier: 'gold' },
    { id: 'physics_master', icon: '🪐', name: 'ปรมาจารย์ฟิสิกส์', desc: 'ถึงเลเวล 10 ในสายฟิสิกส์', tier: 'gold' },
    { id: 'earth_lover', icon: '🌍', name: 'รักษ์โลก', desc: 'ถึงเลเวล 3 ในสายวิทย์โลก', tier: 'silver' },
    { id: 'earth_expert', icon: '🌋', name: 'ผู้เชี่ยวชาญวิทย์โลก', desc: 'ถึงเลเวล 5 ในสายวิทย์โลก', tier: 'gold' },
    { id: 'earth_master', icon: '🏔️', name: 'จ้าวแห่งธรณี', desc: 'ถึงเลเวล 10 ในสายวิทย์โลก', tier: 'gold' },
    { id: 'xp_5k', icon: '💵', name: 'เศรษฐีฝึกหัด', desc: 'มี XP รวมสะสมครบ 5,000', tier: 'silver' },
    { id: 'xp_10k', icon: '💰', name: 'ผู้สั่งสมประสบการณ์', desc: 'มี XP รวมสะสมครบ 10,000', tier: 'gold' },
    { id: 'dual_expert', icon: '⚖️', name: 'ผู้รอบรู้สองศาสตร์', desc: 'ถึงเลเวล 5 ทั้งสายฟิสิกส์และวิทย์โลก', tier: 'gold' },
    { id: 'shop_spender', icon: '🛍️', name: 'นักช้อป', desc: 'ซื้อสินค้าในร้านค้าครบ 5 ชิ้น', tier: 'silver' },
    { id: 'weekend_learner_3', icon: '🏖️', name: 'นักเรียนวันหยุด', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 3 ครั้ง', tier: 'bronze' },
    { id: 'weekend_learner_5', icon: '🏕️', name: 'ขยันสุดสัปดาห์', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 5 ครั้ง', tier: 'silver' },
    { id: 'weekend_learner_10', icon: '🏝️', name: 'เจ้าแห่งวันหยุด', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 10 ครั้ง', tier: 'gold' },
    { id: 'weekend_learner_15', icon: '🎉', name: 'ตำนานสุดสัปดาห์', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 15 ครั้ง', tier: 'gold' }
];

// กำหนดภารกิจประจำวัน (Daily Quests)
export const DAILY_QUESTS = [
    { id: 'quiz_1', desc: 'ทำแบบทดสอบให้จบ 1 ครั้ง', target: 1, type: 'quiz_complete', xp: 50 },
    { id: 'quiz_2', desc: 'ทำแบบทดสอบให้จบ 2 ครั้ง', target: 2, type: 'quiz_complete', xp: 100 },
    { id: 'correct_10', desc: 'ตอบถูกให้ได้ 10 ข้อ', target: 10, type: 'correct_answers', xp: 80 },
    { id: 'correct_15', desc: 'ตอบถูกให้ได้ 15 ข้อ', target: 15, type: 'correct_answers', xp: 120 },
    { id: 'physics_5', desc: 'ทำโจทย์ฟิสิกส์ 5 ข้อ', target: 5, type: 'questions_category', category: 'Physics', xp: 100 },
    { id: 'earth_5', desc: 'ทำโจทย์วิทย์โลก 5 ข้อ', target: 5, type: 'questions_category', category: 'Earth', xp: 100 },
    { id: 'score_80', desc: 'ทำคะแนนให้ได้ 80% ขึ้นไป 1 ครั้ง', target: 1, type: 'high_score', threshold: 80, xp: 150 },
    { id: 'score_100', desc: 'ทำคะแนนเต็ม (100%) 1 ครั้ง', target: 1, type: 'high_score', threshold: 100, xp: 300 },
    // NEW QUEST TYPES
    { id: 'theory_10', desc: 'ตอบคำถามทฤษฎีให้ถูก 10 ข้อ', target: 10, type: 'correct_answers_type', questionType: 'theory', xp: 120 },
    { id: 'calc_5', desc: 'ตอบคำถามคำนวณให้ถูก 5 ข้อ', target: 5, type: 'correct_answers_type', questionType: 'calculation', xp: 150 },
    { id: 'physics_quiz_1', desc: 'ทำแบบทดสอบหมวดฟิสิกส์ 1 ครั้ง', target: 1, type: 'quiz_category', category: 'Physics', xp: 80 },
    { id: 'earth_quiz_1', desc: 'ทำแบบทดสอบหมวดวิทย์โลก 1 ครั้ง', target: 1, type: 'quiz_category', category: 'Earth', xp: 80 },
    // More quests for variety
    { id: 'quiz_5', desc: 'ทำแบบทดสอบให้จบ 5 ครั้ง', target: 5, type: 'quiz_complete', xp: 250 },
    { id: 'correct_50', desc: 'ตอบถูกให้ได้ 50 ข้อ', target: 50, type: 'correct_answers', xp: 400 },
    { id: 'physics_10', desc: 'ทำโจทย์ฟิสิกส์ 10 ข้อ', target: 10, type: 'questions_category', category: 'Physics', xp: 150 },
    { id: 'earth_10', desc: 'ทำโจทย์วิทย์โลก 10 ข้อ', target: 10, type: 'questions_category', category: 'Earth', xp: 150 }
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
    { id: 'quiz_200', title: 'ตำนานเดินดิน', desc: 'ทำแบบทดสอบครบ 200 ครั้ง', icon: '🏛️', target: 200, type: 'total_quizzes', rewardTitle: 'ตำนานเดินดิน' },
    { id: 'high_achiever_5', title: 'ผลงานโดดเด่น', desc: 'ทำคะแนนได้ 80% ขึ้นไป 5 ครั้ง', icon: '🌟', target: 5, type: 'high_scores_80', rewardTitle: 'ผู้มีผลงานโดดเด่น' },
    { id: 'perfectionist_3', title: 'ผู้รักความสมบูรณ์แบบ', desc: 'ทำคะแนนเต็ม 100% ได้ 3 ครั้ง', icon: '🏅', target: 3, type: 'perfect_scores', rewardTitle: 'ผู้รักความสมบูรณ์แบบ' },
    { id: 'collector_5', title: 'นักสะสมมือใหม่', desc: 'มีไอเทมในครอบครอง 5 ชิ้น', icon: '🎒', target: 5, type: 'total_items', rewardTitle: 'นักสะสม' },
    { id: 'collector_10', title: 'นักสะสมตัวยง', desc: 'มีไอเทมในครอบครอง 10 ชิ้น', icon: '📦', target: 10, type: 'total_items', rewardTitle: 'คลังสมบัติ' },
    { id: 'avatar_5', title: 'แฟชั่นนิสต้า', desc: 'มีอวตารครอบครอง 5 แบบ', icon: '🎭', target: 5, type: 'total_avatars', rewardTitle: 'แฟชั่นนิสต้า' }
];

// กำหนดสินค้าในร้านค้า (Shop Items)
export const SHOP_ITEMS = [
    // 50 XP
    { id: 'item_cut_1', type: 'consumable', name: 'ตัดช้อยส์ (25%)', icon: '🔪', cost: 50, value: 'cut_1', desc: 'ตัดตัวเลือกที่ผิดออก 1 ตัวเลือก' },
    { id: 'item_range_hint', type: 'consumable', name: 'สโคปคำตอบ', icon: '🎯', cost: 50, value: 'range_hint', desc: 'บอกช่วงของคำตอบที่ถูกต้อง (สำหรับข้อเขียนตัวเลข)' },
    { id: 'item_tolerance', type: 'consumable', name: 'ขยายเป้า', icon: '⭕', cost: 50, value: 'tolerance', desc: 'เพิ่มค่าความคลาดเคลื่อนที่ยอมรับได้ +/- 20% (สำหรับข้อเขียนตัวเลข)' },
    
    // 100 XP
    { id: 'item_5050', type: 'consumable', name: 'ตัวช่วย 50/50', icon: '✂️', cost: 100, value: '5050', desc: 'ตัดตัวเลือกที่ผิดออก 2 ตัวเลือก' },
    
    // 150 XP
    { id: 'avatar_earth', type: 'avatar', name: 'โลก', icon: '🌍', cost: 150, value: '🌍', desc: 'อวตารโลกสีคราม' },
    { id: 'avatar_newmoon', type: 'avatar', name: 'จันทร์ดับ', icon: '🌑', cost: 150, value: '🌑', desc: 'อวตารดวงจันทร์ในคืนเดือนมืด' },
    { id: 'avatar_star', type: 'avatar', name: 'ดาว', icon: '⭐', cost: 150, value: '⭐', desc: 'อวตารดวงดาวเปล่งประกาย' },
    { id: 'item_time_freeze', type: 'consumable', name: 'หยุดเวลา', icon: '❄️', cost: 150, value: 'time_freeze', desc: 'หยุดเวลาชั่วคราว 30 วินาที' },
    
    // 200 XP
    { id: 'avatar_saturn', type: 'avatar', name: 'ดาวเสาร์', icon: '🪐', cost: 200, value: '🪐', desc: 'อวตารดาวเคราะห์มีวงแหวน' },
    { id: 'avatar_comet', type: 'avatar', name: 'ดาวหาง', icon: '☄️', cost: 200, value: '☄️', desc: 'อวตารดาวหางผู้มาเยือน' },
    
    // 250 XP
    { id: 'avatar_sun', type: 'avatar', name: 'ดวงอาทิตย์', icon: '☀️', cost: 250, value: '☀️', desc: 'อวตารดาวฤกษ์ศูนย์กลาง' },
    { id: 'avatar_dog', type: 'avatar', name: 'สุนัข', icon: '🐶', cost: 250, value: '🐶', desc: 'อวตารเพื่อนผู้ซื่อสัตย์' },
    { id: 'avatar_cat', type: 'avatar', name: 'แมว', icon: '😺', cost: 250, value: '😺', desc: 'อวตารแมวเหมียว' },
    { id: 'item_xp_2x', type: 'consumable', name: 'คูณ XP x2', icon: '✨', cost: 250, value: 'xp_2x', desc: 'ได้รับ XP 2 เท่าเมื่อทำแบบทดสอบจบ' },
    { id: 'item_undo', type: 'consumable', name: 'แก้ตัวใหม่', icon: '↩️', cost: 250, value: 'undo', desc: 'กลับไปตอบข้อที่เพิ่งตอบผิดได้อีกครั้ง' },
    
    // 300 XP
    { id: 'avatar_rocket', type: 'avatar', name: 'จรวด', icon: '🚀', cost: 300, value: '🚀', desc: 'อวตารจรวดทะยานฟ้า' },
    { id: 'avatar_microbe', type: 'avatar', name: 'จุลินทรีย์', icon: '🦠', cost: 300, value: '🦠', desc: 'อวตารสิ่งมีชีวิตขนาดเล็ก' },
    { id: 'title_scholar', type: 'title', name: 'ผู้ใฝ่รู้', icon: '📚', cost: 300, value: 'ผู้ใฝ่รู้', desc: 'ฉายาสำหรับผู้รักการเรียน' },
    
    // 350 XP
    { id: 'avatar_satellite', type: 'avatar', name: 'ดาวเทียม', icon: '🛰️', cost: 350, value: '🛰️', desc: 'อวตารดาวเทียมสำรวจ' },
    { id: 'avatar_telescope', type: 'avatar', name: 'กล้องโทรทรรศน์', icon: '🔭', cost: 350, value: '🔭', desc: 'อวตารนักส่องดาว' },
    
    // 400 XP
    { id: 'avatar_atom', type: 'avatar', name: 'อะตอม', icon: '⚛️', cost: 400, value: '⚛️', desc: 'อวตารโครงสร้างอะตอม' },
    { id: 'avatar_dna', type: 'avatar', name: 'ดีเอ็นเอ', icon: '🧬', cost: 400, value: '🧬', desc: 'อวตารเกลียวคู่' },
    
    // 450 XP
    { id: 'avatar_owl', type: 'avatar', name: 'นกฮูก', icon: '🦉', cost: 450, value: '🦉', desc: 'อวตารนกฮูกผู้รอบรู้' },
    { id: 'avatar_fox', type: 'avatar', name: 'สุนัขจิ้งจอก', icon: '🦊', cost: 450, value: '🦊', desc: 'อวตารสุนัขจิ้งจอกเจ้าเล่ห์' },
    
    // 500 XP
    { id: 'avatar_brain', type: 'avatar', name: 'สมอง', icon: '🧠', cost: 500, value: '🧠', desc: 'อวตารคลังปัญญา' },
    { id: 'avatar_wizard', type: 'avatar', name: 'พ่อมด', icon: '🧙', cost: 500, value: '🧙', desc: 'อวตารพ่อมดผู้ทรงพลัง' },
    { id: 'theme_forest', type: 'theme', name: 'ป่าไม้ (Forest)', icon: '🌲', cost: 500, value: 'theme-forest', desc: 'ธีมสีเขียวธรรมชาติ' },
    
    // 600 XP
    { id: 'avatar_lion', type: 'avatar', name: 'สิงโต', icon: '🦁', cost: 600, value: '🦁', desc: 'อวตารเจ้าป่า' },
    { id: 'avatar_tiger', type: 'avatar', name: 'เสือ', icon: '🐯', cost: 600, value: '🐯', desc: 'อวตารพยัคฆ์' },
    
    // 800 XP
    { id: 'avatar_ninja', type: 'avatar', name: 'นินจา', icon: '🥷', cost: 800, value: '🥷', desc: 'นักรบเงา' },
    { id: 'theme_sunset', type: 'theme', name: 'พระอาทิตย์ตก (Sunset)', icon: '🌅', cost: 800, value: 'theme-sunset', desc: 'ธีมสีส้มอบอุ่น' },
    { id: 'theme_ocean', type: 'theme', name: 'มหาสมุทร (Ocean)', icon: '🌊', cost: 800, value: 'theme-ocean', desc: 'ธีมสีฟ้าน้ำทะเล' },
    
    // 1000 XP
    { id: 'avatar_dragon', type: 'avatar', name: 'มังกร', icon: '🐉', cost: 1000, value: '🐉', desc: 'อวตารมังกรในตำนาน' },
    { id: 'theme_berry', type: 'theme', name: 'เบอร์รี่ (Berry)', icon: '🍇', cost: 1000, value: 'theme-berry', desc: 'ธีมสีม่วงสดใส' },
    
    // 1200 XP
    { id: 'avatar_unicorn', type: 'avatar', name: 'ยูนิคอร์น', icon: '🦄', cost: 1200, value: '🦄', desc: 'สัตว์วิเศษหายาก' },
    
    // 2000 XP
    { id: 'title_master', type: 'title', name: 'ปรมาจารย์', icon: '🎓', cost: 2000, value: 'ปรมาจารย์', desc: 'ฉายาขั้นสูง' },
    
    // 5000 XP
    { id: 'title_rich', type: 'title', name: 'เศรษฐี XP', icon: '💰', cost: 5000, value: 'เศรษฐี XP', desc: 'ฉายาสำหรับผู้มั่งคั่ง' },
    { id: 'theme_dark', type: 'theme', name: 'รัตติกาล (Midnight)', icon: '🌑', cost: 5000, value: 'theme-midnight', desc: 'ธีมสีมืดลึกลับ' },
];

function getAvatarFrameClass(avatar) {
    const shopItem = SHOP_ITEMS.find(i => i.value === avatar && i.type === 'avatar');
    if (!shopItem) return 'ring-2 ring-gray-200 dark:ring-gray-700'; // Default

    // Use ring-2 for the smaller header icon
    if (shopItem.cost >= 1000) return 'ring-2 ring-yellow-400 legendary-frame';
    if (shopItem.cost >= 500) return 'ring-2 ring-purple-500';
    return 'ring-2 ring-green-500';
}

export function getLevelBorderClass(level) {
    if (level >= 20) return 'bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 animate-pulse'; // Rainbow
    if (level >= 15) return 'bg-gradient-to-br from-cyan-300 to-blue-500'; // Diamond
    if (level >= 10) return 'bg-gradient-to-br from-yellow-300 to-amber-500'; // Gold
    if (level >= 5) return 'bg-gradient-to-br from-blue-400 to-cyan-500'; // Sapphire
    return 'bg-gray-300 dark:bg-gray-600'; // Bronze/Gray
}

export class Gamification {
    constructor() {
        this.storageKey = 'app_gamification_data';
        this.authManager = authManager;

        const isNewToGamification = !localStorage.getItem(this.storageKey);
        
        this.state = this.loadState();
        
        // NEW: ตรวจสอบความถูกต้องของข้อมูลทันทีที่โหลดจาก LocalStorage
        if (this.ensureConsistency()) {
            this.saveState();
        }
        
        const today = new Date().toDateString();
        if (this.state.lastQuestDate !== today) {
            this.state.activeQuests = this.generateDailyQuests();
            this.state.rerolls = 3;
            this.state.lastQuestDate = today;
            this.state.dailyQuest = null; // Clear legacy quest data if any
        }

        // Initial level up check in case quests were completed offline
        // and the user just came back online.
        this.updateLevel();
        this.saveState();
        
        if (isNewToGamification) {
            this.syncProgress();
        }

        this.updateStreak();
        this.applyTheme(this.state.selectedTheme);
        this.updateHeaderAvatar();

        // IMPROVEMENT: Cross-tab synchronization
        // เมื่อมีการเปลี่ยนแปลงข้อมูลใน Tab อื่น ให้โหลดข้อมูลใหม่และอัปเดตหน้าจอนี้ทันที
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.state = this.loadState();
                this.onStateUpdated();
            }
        });

        // เชื่อมต่อกับ AuthManager เพื่อโหลดข้อมูลเมื่อสถานะ Login เปลี่ยนแปลง
        this.authManager.onUserChange(async (user) => {
            // โหลดข้อมูลล่าสุด (จะจัดการให้เองว่ามาจาก Cloud หรือ Local)
            try {
                const data = await this.authManager.loadUserData();
                if (data) {
                    // Merge data from Cloud with Default State for completeness
                    this.state = { ...this.getDefaultState(), ...data };

                    // --- Data Consistency Check & Correction ---
                    // เรียกใช้ฟังก์ชันตรวจสอบความถูกต้องที่สร้างขึ้นใหม่
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

    // เพิ่มฟังก์ชันใหม่สำหรับตรวจสอบความถูกต้องของข้อมูล XP
    ensureConsistency() {
        let needsSave = false;
        let calculatedPhysicsXP = 0;
        let calculatedEarthXP = 0;

        // 1. ตรวจสอบว่าค่า XP หลักเป็นตัวเลข
        if (typeof this.state.xp !== 'number') { this.state.xp = Number(this.state.xp) || 0; needsSave = true; }
        if (typeof this.state.physicsXP !== 'number') { this.state.physicsXP = Number(this.state.physicsXP) || 0; needsSave = true; }
        if (typeof this.state.earthXP !== 'number') { this.state.earthXP = Number(this.state.earthXP) || 0; needsSave = true; }

        // 2. คำนวณผลรวม XP จากหมวดย่อย (Proficiency Groups)
        for (const group of Object.values(PROFICIENCY_GROUPS)) {
            const groupXP = Number(this.state[group.field]) || 0;
            
            // แก้ไขค่าใน state ให้เป็นตัวเลขถ้าจำเป็น
            if (this.state[group.field] !== groupXP && this.state[group.field] !== undefined) {
                this.state[group.field] = groupXP;
                needsSave = true;
            }

            if (group.track === 'physics') {
                calculatedPhysicsXP += groupXP;
            } else if (group.track === 'earth') {
                calculatedEarthXP += groupXP;
            }
        }

        // 3. แก้ไข XP ของสายวิชาหลักหากน้อยกว่าผลรวมของหมวดย่อย
        // (XP หลักอาจจะมากกว่าได้ หากได้จากโจทย์ทั่วไป แต่ห้ามน้อยกว่า)
        if (this.state.physicsXP < calculatedPhysicsXP) {
            console.log(`Correcting physicsXP from ${this.state.physicsXP} to ${calculatedPhysicsXP}`);
            this.state.physicsXP = calculatedPhysicsXP;
            needsSave = true;
        }
        if (this.state.earthXP < calculatedEarthXP) {
            console.log(`Correcting earthXP from ${this.state.earthXP} to ${calculatedEarthXP}`);
            this.state.earthXP = calculatedEarthXP;
            needsSave = true;
        }

        return needsSave;
    }

    getDefaultState() {
        return {
            level: 1,
            xp: 0,
            physicsXP: 0,
            earthXP: 0,
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
            // Proficiency XPs
            mechanicsXP: 0,
            electricityXP: 0,
            wavesLightXP: 0,
            modernHeatXP: 0,
            astronomyXP: 0,
            geologyXP: 0,
            meteorologyXP: 0,
            freeNameChangeAvailable: true,
        };
    }

    updateLevel() {
        let leveledUp = false;
        // Loop to handle multiple level-ups in one go, but sequentially.
        while (true) {
            const currentLevel = this.state.level || 1;
            const nextLevelThreshold = XP_THRESHOLDS.find(t => t.level === currentLevel + 1);

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
        const stored = localStorage.getItem(this.storageKey);
        let state = null;
        try {
            if (stored) {
                state = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error loading gamification state:", e);
        }

        // IMPROVEMENT: Define Default State clearly
        // Merge loaded state with defaults to ensure all keys exist (Robustness)
        state = { ...this.getDefaultState(), ...(state || {}) };
        
        return state;
    }

    // ฟังก์ชันสำหรับดึงข้อมูลการทำโจทย์เก่าๆ มาคำนวณเป็น XP เริ่มต้น
    syncProgress() {
        let totalXP = 0;
        let physicsXP = 0;
        let earthXP = 0;
        let completed = 0;
        let totalCorrect = 0;
        const topicXPs = {};

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
                        let quizPhysicsXP = 0;
                        let quizEarthXP = 0;

                        data.userAnswers.forEach((ans, index) => {
                            if (ans && ans.isCorrect) {
                                const question = data.shuffledQuestions[index];
                                // Award 5 XP for complex questions, 4 for others
                                if (question && (question.type === 'multiple-select' || question.type === 'fill-in-number')) {
                                    calculatedXp += 5;
                                } else {
                                    calculatedXp += 4;
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
                        if (totalQ > 0 && answered >= totalQ) {
                            completed++;
                        }

                        // Calculate Topic XP
                        data.userAnswers.forEach((ans, index) => {
                            if (ans && ans.isCorrect) {
                                const question = data.shuffledQuestions[index];
                                const points = (question && (question.type === 'multiple-select' || question.type === 'fill-in-number')) ? 5 : 4;
                                
                                let subCatStr = '';
                                if (ans.subCategory) {
                                    if (typeof ans.subCategory === 'string') subCatStr = ans.subCategory;
                                    else if (ans.subCategory.main) subCatStr = ans.subCategory.main;
                                }
                                for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                                    if (groupDef.keywords.some(k => subCatStr.includes(k))) {
                                        topicXPs[groupDef.field] = (topicXPs[groupDef.field] || 0) + points;
                                        
                                        // NEW: Accumulate track XP based on proficiency group
                                        if (groupDef.track === 'physics') quizPhysicsXP += points;
                                        if (groupDef.track === 'earth') quizEarthXP += points;
                                        
                                        break;
                                    }
                                }
                            }
                        });

                        // ถ้ายังระบุสายวิชาไม่ได้จาก Proficiency Group ให้ลองดูจากหมวดหมู่หรือชื่อไฟล์
                        if (quizPhysicsXP === 0 && quizEarthXP === 0) {
                            let category = 'General';
                            const firstAns = data.userAnswers.find(a => a);
                            if (firstAns) {
                                if (firstAns.sourceQuizCategory) category = firstAns.sourceQuizCategory;
                                else if (firstAns.subCategory) {
                                    category = typeof firstAns.subCategory === 'object' ? firstAns.subCategory.main : firstAns.subCategory;
                                }
                            }
                            
                            const lowerCat = String(category).toLowerCase();
                            if (lowerCat.includes('physics') || lowerCat.includes('ฟิสิกส์') || key.includes('phy_')) {
                                quizPhysicsXP = calculatedXp;
                            } else if (lowerCat.includes('earth') || lowerCat.includes('astronomy') || lowerCat.includes('space') || lowerCat.includes('โลก') || lowerCat.includes('ดาราศาสตร์') || lowerCat.includes('วิทย์โลก') || key.includes('ess_')) {
                                quizEarthXP = calculatedXp;
                            }
                        }

                        physicsXP += quizPhysicsXP;
                        earthXP += quizEarthXP;
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
            
            // Apply calculated topic XPs
            for (const [field, xp] of Object.entries(topicXPs)) {
                this.state[field] = xp;
            }

            // ตรวจสอบและปลดล็อกเหรียญรางวัลจากข้อมูลเก่าทันที
            this.checkBadges(0); 
            this.saveState();
            console.log(`Synced old progress: ${totalXP} XP, ${completed} Quizzes`);
        }
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

    buyItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: "ไม่พบสินค้า" };
        if (this.state.xp < item.cost) return { success: false, message: "XP ไม่เพียงพอ" };

        if (item.type === 'consumable') {
            this.state.xp -= item.cost;
            this.state.consumables[itemId] = (this.state.consumables[itemId] || 0) + 1;
            this.saveState();
            return { success: true, message: `ซื้อ ${item.name} สำเร็จ! (มี: ${this.state.consumables[itemId]})`, item };
        } else {
            if (this.state.inventory.includes(itemId)) return { success: false, message: "คุณมีสินค้านี้แล้ว" };
            this.state.xp -= item.cost;
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
        
        // Update Header Email
        const headerEmailEl = document.getElementById('user-hub-email');
        if (headerEmailEl) {
            const user = this.authManager.currentUser;
            if (user && user.email) {
                headerEmailEl.textContent = user.email;
                headerEmailEl.classList.remove('hidden');
            } else {
                headerEmailEl.classList.add('hidden');
            }
        }

        if (profileLink) {
            const avatar = this.state.avatar || '🧑‍🎓';
            const level = this.getCurrentLevel().level;

            // Ensure the container is round and clean
            profileLink.classList.add('rounded-full');
            const classesToRemove = [
                'ring-2', 'ring-4', 'ring-gray-200', 'dark:ring-gray-700',
                'ring-green-500', 'ring-purple-500', 'ring-yellow-400',
                'legendary-frame', 'p-0.5'
            ];
            profileLink.classList.remove(...classesToRemove);

            // ตรวจสอบว่าเป็น URL รูปภาพหรือไม่ (มีจุดหรือเครื่องหมาย /)
            const isImage = avatar.includes('/') || avatar.includes('.');
            let contentHtml = '';
            
            if (isImage) {
                contentHtml = `<img src="${avatar}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
            } else {
                contentHtml = `<span class="text-xl leading-none flex items-center justify-center h-full w-full select-none">${avatar}</span>`;
            }

            const levelBorderClass = getLevelBorderClass(level);
            const avatarFrameClass = getAvatarFrameClass(avatar);

            // Create nested structure: Level Border (Outer) -> Avatar Frame (Inner) -> Content
            profileLink.innerHTML = `
                <div class="w-full h-full rounded-full p-[3px] ${levelBorderClass} shadow-sm transition-all duration-300">
                    <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${avatarFrameClass.replace('ring-2', 'ring-1')}">
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
        this.authManager.resetGamificationData();
        this.state = this.loadState(); // Reloads defaults
        // No need to save state, as the goal is to wipe it.
        // The page reload in profile.js will handle getting a fresh state.
    }

    incrementCorrectStreak() {
        this.state.correctStreak = (this.state.correctStreak || 0) + 1;
        this.saveState();
    }

    resetCorrectStreak() {
        this.state.correctStreak = 0;
        this.saveState();
    }

    updateEndQuizStats(percentage) {
        if (percentage === 100) {
            this.state.perfectScores = (this.state.perfectScores || 0) + 1;
        }
        if (percentage >= 80) {
            this.state.highScores80 = (this.state.highScores80 || 0) + 1;
        }
        this.saveState();
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
            case 'physics_level':
                return this.getPhysicsLevel().level >= quest.target;
            case 'earth_level':
                return this.getEarthLevel().level >= quest.target;
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
            case 'physics_level':
                return this.getPhysicsLevel().level;
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
        this.updateLevel(); // Check if streak quest completion triggers level up
        this.saveState();
    }

    // ฟังก์ชันเพิ่ม XP (เรียกใช้เมื่อทำข้อสอบเสร็จ)
    addXP(amount, category = '', percentage = 0, questionCount = 0, isCustomQuiz = false) {
        const oldLevel = this.state.level || 1;
        const oldPhysics = this.getPhysicsLevel();
        const oldEarth = this.getEarthLevel();

        this.state.xp += amount;

        // NEW: Update score-based stats based on eligibility
        const isEligibleForStats = !isCustomQuiz || (isCustomQuiz && questionCount >= 20);
        if (isEligibleForStats) {
            if (percentage === 100) {
                this.state.perfectScores = (this.state.perfectScores || 0) + 1;
            }
            if (percentage >= 80) {
                this.state.highScores80 = (this.state.highScores80 || 0) + 1;
            }
        }
        
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

        this.updateLevel();

        this.checkBadges(percentage, questionCount, isCustomQuiz);

        const newLevelInfo = this.getCurrentLevel();
        const newPhysics = this.getPhysicsLevel();
        const newEarth = this.getEarthLevel();

        return {
            leveledUp: newLevelInfo.level > oldLevel, // For backward compatibility
            newLevel: newLevelInfo, // For backward compatibility
            // Detailed results
            overall: { leveledUp: newLevel.level > oldLevel.level, info: newLevel },
            physics: { leveledUp: isPhysics && newPhysics.level > oldPhysics.level, info: newPhysics },
            earth: { leveledUp: isEarth && newEarth.level > oldEarth.level, info: newEarth }
        };
    }

    // ฟังก์ชันใหม่: บันทึกผลการทำข้อสอบโดยรับค่า XP แยกตามสายวิชา
    submitQuizResult(totalXP, physicsXP, earthXP, percentage, questionCount, isCustomQuiz, topicXPs = {}) {
        const oldLevel = this.state.level || 1;
        const oldPhysics = this.getPhysicsLevel();
        const oldEarth = this.getEarthLevel();

        this.state.xp += totalXP;
        this.state.physicsXP += physicsXP;
        this.state.earthXP += earthXP;
        this.state.quizzesCompleted += 1;

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

        this.updateLevel();

        // Check for new badges and achievements. This also saves the state.
        const newBadges = this.checkBadges(percentage, questionCount, isCustomQuiz);
        const newAchievements = this.checkAchievements();
        
        const newLevelInfo = this.getCurrentLevel();
        const newPhysics = this.getPhysicsLevel();
        const newEarth = this.getEarthLevel();

        return {
            overall: { leveledUp: newLevelInfo.level > oldLevel, info: newLevelInfo },
            physics: { leveledUp: newPhysics.level > oldPhysics.level, info: newPhysics },
            earth: { leveledUp: newEarth.level > oldEarth.level, info: newEarth },
            newBadges: newBadges,
            newAchievements: newAchievements
        };
    }

    // ฟังก์ชันอัปเดตความคืบหน้าภารกิจ
    updateQuest(stats) {
        if (!this.state.activeQuests) return { completed: [], newAchievements: [] };

        // อัปเดตสถิติรวม (Total Stats)
        if (stats.correctAnswers) {
            this.state.totalCorrectAnswers += stats.correctAnswers;
        }

        // ตรวจสอบความสำเร็จ (Achievements) ทันทีที่มีการอัปเดตสถิติ
        const newAchievements = this.checkAchievements();
        
        const completedQuests = [];

        // NEW: Check eligibility for quests that depend on score
        const isEligibleForStats = !stats.isCustomQuiz || (stats.isCustomQuiz && stats.questionCount >= 20);

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
                if (this.checkCategoryMatch(stats.category, q.category)) {
                    progressMade = 1;
                }
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
        
        const leveledUp = this.updateLevel();

        if (completedQuests.length > 0 || newAchievements.length > 0 || leveledUp) {
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
            // New Achievement Types
            else if (ach.type === 'high_scores_80') {
                if ((this.state.highScores80 || 0) >= ach.target) achieved = true;
            }
            else if (ach.type === 'perfect_scores') {
                if ((this.state.perfectScores || 0) >= ach.target) achieved = true;
            }
            else if (ach.type === 'total_items') {
                if (this.state.inventory.length >= ach.target) achieved = true;
            } else if (ach.type === 'total_avatars') {
                const avatarCount = this.state.inventory.filter(id => {
                    const item = SHOP_ITEMS.find(i => i.id === id);
                    return item && item.type === 'avatar';
                }).length;
                if (avatarCount >= ach.target) achieved = true;
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
    checkBadges(lastQuizScorePercent, questionCount = 0, isCustomQuiz = false) {
        const newBadges = [];
        
        // Helper เพื่อปลดล็อก
        const unlock = (badgeId) => {
            if (!this.state.badges.includes(badgeId)) {
                this.state.badges.push(badgeId);
                newBadges.push(BADGES.find(b => b.id === badgeId));
            }
        };

        const isEligibleForStats = !isCustomQuiz || (isCustomQuiz && questionCount >= 20);

        // 1. First Quiz
        if (this.state.quizzesCompleted >= 1) unlock('first_quiz');

        // 2. Score based badges
        if (isEligibleForStats) {
            if (lastQuizScorePercent === 100) unlock('perfect_score');
        }
        
        if ((this.state.highScores80 || 0) >= 3) unlock('high_scorer_3');
        if ((this.state.highScores80 || 0) >= 5) unlock('high_scorer_5');
        if ((this.state.highScores80 || 0) >= 10) unlock('high_scorer_10');
        
        if ((this.state.perfectScores || 0) >= 3) unlock('perfect_scorer_3');
        if ((this.state.perfectScores || 0) >= 5) unlock('perfect_scorer_5');

        // 3. Marathon runner
        if (questionCount >= 50) unlock('marathon_runner');

        // 4. Quiz Master (5 Quizzes)
        if (this.state.quizzesCompleted >= 5) unlock('quiz_master_5');
        if (this.state.quizzesCompleted >= 10) unlock('quiz_master_10');
        if (this.state.quizzesCompleted >= 25) unlock('quiz_master_25');
        if (this.state.quizzesCompleted >= 50) unlock('quiz_master_50');
        if (this.state.quizzesCompleted >= 100) unlock('quiz_master_100');

        // 5. Streak 3 Days (ไฟแรง)
        if (this.state.streak >= 3) unlock('streak_3');
        if (this.state.streak >= 7) unlock('streak_7');
        if (this.state.streak >= 14) unlock('streak_14');
        if (this.state.streak >= 30) unlock('streak_30');
        if (this.state.streak >= 60) unlock('streak_60');

        // 6. Level based badges
        if (this.getPhysicsLevel().level >= 3) unlock('physics_lover');
        if (this.getPhysicsLevel().level >= 5) unlock('physics_expert');
        if (this.getPhysicsLevel().level >= 10) unlock('physics_master');
        if (this.getEarthLevel().level >= 3) unlock('earth_lover');
        if (this.getEarthLevel().level >= 5) unlock('earth_expert');
        if (this.getEarthLevel().level >= 10) unlock('earth_master');

        // 7. XP based badges
        if (this.state.xp >= 5000) unlock('xp_5k');
        if (this.state.xp >= 10000) unlock('xp_10k');
        
        // 8. Dual Expert
        if (this.getPhysicsLevel().level >= 5 && this.getEarthLevel().level >= 5) unlock('dual_expert');

        // 9. Weekend Learner
        if ((this.state.weekendQuizzesCompleted || 0) >= 3) unlock('weekend_learner_3');
        if ((this.state.weekendQuizzesCompleted || 0) >= 5) unlock('weekend_learner_5');
        if ((this.state.weekendQuizzesCompleted || 0) >= 10) unlock('weekend_learner_10');
        if ((this.state.weekendQuizzesCompleted || 0) >= 15) unlock('weekend_learner_15');

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