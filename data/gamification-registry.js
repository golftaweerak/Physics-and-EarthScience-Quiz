/**
 * data/gamification-registry.js
 * 
 * Central registry for all gamification-related static data.
 * Separating this from the logic in gamification.js improves maintainability.
 */

export const BADGES = [
  { id: 'first_quiz', icon: '🥇', name: 'ก้าวแรก', desc: 'ทำแบบทดสอบจบครั้งแรก', tier: 'bronze' },
  { id: 'perfect_score', icon: '💯', name: 'สมบูรณ์แบบ', desc: 'ทำคะแนนเต็ม 100% ในแบบทดสอบใดก็ได้ (ที่มี 20 ข้อขึ้นไป)', tier: 'gold' },
  { id: 'high_scorer_3', icon: '⭐', name: 'ยอดเยี่ยม', desc: 'ได้คะแนนเกิน 80% จำนวน 3 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'bronze' },
  { id: 'high_scorer_5', icon: '🌟', name: 'ดาวเด่น', desc: 'ได้คะแนนเกิน 80% จำนวน 5 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'silver' },
  { id: 'high_scorer_10', icon: '🌠', name: 'ดาวจรัสฟ้า', desc: 'ได้คะแนนเกิน 80% จำนวน 10 ครั้งในแบบทดสอบที่เข้าเกณฑ์', tier: 'gold' },
  { id: 'perfect_scorer_3', icon: '🏅', name: 'แชมป์ไร้พ่าย', desc: 'ทำคะแนนเต็ม 100% ครบ 3 ครั้ง', tier: 'gold' },
  { id: 'perfect_scorer_5', icon: '👑', name: 'ราชาสนามสอบ', desc: 'ทำคะแนนเต็ม 100% ครบ 5 ครั้ง', tier: 'gold' },
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

  { id: 'earth_lover', icon: '🌍', name: 'รักษ์โลก', desc: 'ถึงเลเวล 3 ในสายวิทย์โลก', tier: 'silver' },
  { id: 'earth_expert', icon: '🌋', name: 'ผู้เชี่ยวชาญวิทย์โลก', desc: 'ถึงเลเวล 5 ในสายวิทย์โลก', tier: 'gold' },
  { id: 'earth_master', icon: '🏔️', name: 'จ้าวแห่งธรณี', desc: 'ถึงเลเวล 10 ในสายวิทย์โลก', tier: 'gold' },
  { id: 'physics_lover', icon: '⚛️', name: 'รักฟิสิกส์', desc: 'ถึงเลเวล 3 ในสายฟิสิกส์', tier: 'silver' },
  { id: 'physics_expert', icon: '⚡', name: 'ผู้เชี่ยวชาญฟิสิกส์', desc: 'ถึงเลเวล 5 ในสายฟิสิกส์', tier: 'gold' },
  { id: 'physics_master', icon: '🌌', name: 'ปรมาจารย์ฟิสิกส์', desc: 'ถึงเลเวล 10 ในสายฟิสิกส์', tier: 'gold' },

  // POSN Badges
  { id: 'posn_earth_lover', icon: '🌍', name: 'รักษ์ สอวน. วิทย์โลก', desc: 'ถึงเลเวล 3 ในสาย สอวน. วิทย์โลก', tier: 'silver' },
  { id: 'posn_earth_expert', icon: '🌋', name: 'ผู้เชี่ยวชาญ สอวน. วิทย์โลก', desc: 'ถึงเลเวล 5 ในสาย สอวน. วิทย์โลก', tier: 'gold' },
  { id: 'posn_astro_lover', icon: '🔭', name: 'รักษ์ สอวน. ดาราศาสตร์', desc: 'ถึงเลเวล 3 ในสาย สอวน. ดาราศาสตร์', tier: 'silver' },
  { id: 'posn_astro_expert', icon: '🌌', name: 'ผู้เชี่ยวชาญ สอวน. ดาราศาสตร์', desc: 'ถึงเลเวล 5 ในสาย สอวน. ดาราศาสตร์', tier: 'gold' },

  { id: 'xp_5k', icon: '💵', name: 'เศรษฐีฝึกหัด', desc: 'มี XP รวมสะสมครบ 5,000', tier: 'silver' },
  { id: 'xp_10k', icon: '💰', name: 'ผู้สั่งสมประสบการณ์', desc: 'มี XP รวมสะสมครบ 10,000', tier: 'gold' },
  { id: 'dual_expert', icon: '⚖️', name: 'ผู้รอบรู้แบบวิทย์ฯ', desc: 'ถึงเลเวล 5 ทั้งสายฟิสิกส์และวิทย์โลก', tier: 'gold' },
  { id: 'shop_spender', icon: '🛍️', name: 'นักช้อป', desc: 'ซื้อสินค้าในร้านค้าครบ 5 ชิ้น', tier: 'silver' },
  { id: 'weekend_learner_3', icon: '🏖️', name: 'นักเรียนวันหยุด', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 3 ครั้ง', tier: 'bronze' },
  { id: 'weekend_learner_5', icon: '🏕️', name: 'ขยันสุดสัปดาห์', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 5 ครั้ง', tier: 'silver' },
  { id: 'weekend_learner_10', icon: '🏝️', name: 'เจ้าแห่งวันหยุด', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 10 ครั้ง', tier: 'gold' },
  { id: 'weekend_learner_15', icon: '🎉', name: 'ตำนานสุดสัปดาห์', desc: 'ทำแบบทดสอบในวันหยุดสุดสัปดาห์ครบ 15 ครั้ง', tier: 'gold' },
  // Proficiency Badges
  { id: 'astronomy_expert', icon: '🔭', name: 'ผู้เชี่ยวชาญดาราศาสตร์', desc: 'มี XP สายดาราศาสตร์ครบ 1,000', tier: 'silver' },
  { id: 'geology_expert', icon: '🪨', name: 'ผู้เชี่ยวชาญธรณี', desc: 'มี XP สายธรณีวิทยาครบ 1,000', tier: 'silver' },
  { id: 'meteorology_expert', icon: '⛈️', name: 'ผู้เชี่ยวชาญอุตุฯ', desc: 'มี XP สายอุตุนิยมวิทยาครบ 1,000', tier: 'silver' },
  { id: 'oceanography_expert', icon: '🌊', name: 'ผู้เชี่ยวชาญสมุทรฯ', desc: 'มี XP สายสมุทรศาสตร์ครบ 1,000', tier: 'silver' },
  { id: 'mechanics_expert', icon: '⚙️', name: 'ผู้เชี่ยวชาญกลศาสตร์', desc: 'มี XP สายกลศาสตร์ครบ 1,000', tier: 'silver' },
  { id: 'electromagnetism_expert', icon: '⚡', name: 'ผู้เชี่ยวชาญไฟฟ้าแม่เหล็ก', desc: 'มี XP สายไฟฟ้าและแม่เหล็กครบ 1,000', tier: 'silver' },
  { id: 'waves_expert', icon: '🔊', name: 'ผู้เชี่ยวชาญคลื่น', desc: 'มี XP สายคลื่นและแสงครบ 1,000', tier: 'silver' },
  { id: 'modern_physics_expert', icon: '☢️', name: 'ผู้เชี่ยวชาญฟิสิกส์ใหม่', desc: 'มี XP สายฟิสิกส์อะตอม/นิวเคลียร์ครบ 1,000', tier: 'silver' },

  // NEW Badges
  { id: 'theory_master', icon: '📜', name: 'นักทฤษฎี', desc: 'มี XP สายทฤษฎีสะสมครบ 1,000', tier: 'gold' },
  { id: 'calculation_expert', icon: '🧮', name: 'นักคำนวณ', desc: 'มี XP สายคำนวณสะสมครบ 1,000', tier: 'gold' },
  { id: 'night_owl', icon: '🦉', name: 'นกฮูกราตรี', desc: 'ทำแบบทดสอบในช่วงเวลา 00:00 - 05:00', tier: 'silver' },
  { id: 'early_bird', icon: '🌅', name: 'นกเช้าตรู่', desc: 'ทำแบบทดสอบในช่วงเวลา 05:00 - 08:00', tier: 'silver' },
  { id: 'speed_runner', icon: '⚡', name: 'เสือปืนไว', desc: 'ตอบถูก 5 ข้อติดต่อกันโดยใช้เวลาน้อยกว่า 30 วินาที', tier: 'gold' },
  { id: 'item_user_10', icon: '🧪', name: 'นักทดลองไอเทม', desc: 'ใช้ไอเทมช่วยเหลือครบ 10 ครั้ง', tier: 'silver' },

  // Exam Prep Badges
  { id: 'midterm_prep', icon: '📝', name: 'เตรียมสอบกลางภาค', desc: 'ทำแบบทดสอบ "แนวข้อสอบ" ในช่วงเตรียมสอบกลางภาค (ธ.ค.-ม.ค. หรือ ก.ค.-ส.ค.)', tier: 'bronze' },
  { id: 'final_prep', icon: '🏁', name: 'เตรียมสอบปลายภาค', desc: 'ทำแบบทดสอบ "แนวข้อสอบ" ในช่วงเตรียมสอบปลายภาค (ก.พ.-มี.ค. หรือ ก.ย.-ต.ค.)', tier: 'silver' },

  // New Badges
  { id: 'exam_ace', icon: '🎓', name: 'เซียนสนามสอบ', desc: 'ได้คะแนน 80% ขึ้นไปในชุด "แนวข้อสอบ"', tier: 'gold' },
  { id: 'hard_worker', icon: '🔥', name: 'ขยันหมั่นเพียร', desc: 'ทำแบบทดสอบครบ 5 ชุดใน 1 วัน', tier: 'silver' }
];

export const DAILY_QUESTS = [
  { id: 'quiz_1', desc: 'ทำแบบทดสอบให้จบ 1 ครั้ง', target: 1, type: 'quiz_complete', xp: 50 },
  { id: 'quiz_2', desc: 'ทำแบบทดสอบให้จบ 2 ครั้ง', target: 2, type: 'quiz_complete', xp: 100 },
  { id: 'correct_10', desc: 'ตอบถูกให้ได้ 10 ข้อ', target: 10, type: 'correct_answers', xp: 80 },
  { id: 'correct_15', desc: 'ตอบถูกให้ได้ 15 ข้อ', target: 15, type: 'correct_answers', xp: 120 },
  { id: 'astro_5', desc: 'ทำโจทย์ดาราศาสตร์ 5 ข้อ', target: 5, type: 'questions_category', category: 'Astronomy', xp: 100 },
  { id: 'earth_5', desc: 'ทำโจทย์วิทย์โลก 5 ข้อ', target: 5, type: 'questions_category', category: 'Earth', xp: 100 },
  { id: 'physics_5', desc: 'ทำโจทย์ฟิสิกส์ 5 ข้อ', target: 5, type: 'questions_category', category: 'Physics', xp: 100 },
  { id: 'score_80', desc: 'ทำคะแนนให้ได้ 80% ขึ้นไป 1 ครั้ง', target: 1, type: 'high_score', threshold: 80, xp: 150 },
  { id: 'score_100', desc: 'ทำคะแนนเต็ม (100%) 1 ครั้ง', target: 1, type: 'high_score', threshold: 100, xp: 300 },
  // NEW QUEST TYPES
  { id: 'theory_10', desc: 'ตอบคำถามทฤษฎีให้ถูก 10 ข้อ', target: 10, type: 'correct_answers_type', questionType: 'theory', xp: 120 },
  { id: 'earth_quiz_1', desc: 'ทำแบบทดสอบหมวดวิทย์โลก 1 ครั้ง', target: 1, type: 'quiz_category', category: 'Earth', xp: 80 },
  { id: 'physics_quiz_1', desc: 'ทำแบบทดสอบหมวดฟิสิกส์ 1 ครั้ง', target: 1, type: 'quiz_category', category: 'Physics', xp: 80 },
  // More quests for variety
  { id: 'quiz_5', desc: 'ทำแบบทดสอบให้จบ 5 ครั้ง', target: 5, type: 'quiz_complete', xp: 250 },
  { id: 'correct_50', desc: 'ตอบถูกให้ได้ 50 ข้อ', target: 50, type: 'correct_answers', xp: 400 },
  { id: 'earth_10', desc: 'ทำโจทย์วิทย์โลก 10 ข้อ', target: 10, type: 'questions_category', category: 'Earth', xp: 150 },
  // NEW Daily Quests
  { id: 'item_use_1', desc: 'ใช้ไอเทมช่วยเหลือในแบบทดสอบ 1 ครั้ง', target: 1, type: 'use_item', xp: 100 },
  { id: 'theory_20', desc: 'ตอบคำถามทฤษฎีให้ถูก 20 ข้อ', target: 20, type: 'correct_answers_type', questionType: 'theory', xp: 200 },
  { id: 'calc_10', desc: 'ตอบข้อเขียนตัวเลขให้ถูก 10 ข้อ', target: 10, type: 'correct_answers_type', questionType: 'calculation', xp: 250 },
  { id: 'custom_quiz_size_30', desc: 'ทำแบบทดสอบที่สร้างเอง (30 ข้อขึ้นไป) ให้จบ', target: 1, type: 'custom_quiz_size', minQuestions: 30, xp: 300 },
  { id: 'posn_quiz_1', desc: 'ทำแบบทดสอบ สอวน. 1 ครั้ง', target: 1, type: 'quiz_starts_with', prefix: 'posn', xp: 200 },
  { id: 'login_morning', desc: 'เข้าใช้งานช่วงเช้า (6:00 - 9:00)', target: 1, type: 'login_time', startHour: 6, endHour: 9, xp: 50 },
  { id: 'login_night', desc: 'เข้าใช้งานช่วงค่ำ (20:00 - 23:00)', target: 1, type: 'login_time', startHour: 20, endHour: 23, xp: 50 }
];

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
  { id: 'perfectionist_5', title: 'ไร้ที่ติ', desc: 'ทำคะแนนเต็ม 100% ได้ 5 ครั้ง', icon: '👑', target: 5, type: 'perfect_scores', rewardTitle: 'ผู้ไร้ที่ติ' },
  { id: 'collector_5', title: 'นักสะสมมือใหม่', desc: 'มีไอเทมในครอบครอง 5 ชิ้น', icon: '🎒', target: 5, type: 'total_items', rewardTitle: 'นักสะสม' },
  { id: 'collector_10', title: 'นักสะสมตัวยง', desc: 'มีไอเทมในครอบครอง 10 ชิ้น', icon: '📦', target: 10, type: 'total_items', rewardTitle: 'คลังสมบัติ' },
  { id: 'avatar_5', title: 'แฟชั่นนิสต้า', desc: 'มีอวตารครอบครอง 5 แบบ', icon: '🎭', target: 5, type: 'total_avatars', rewardTitle: 'แฟชั่นนิสต้า' },
  // NEW Achievements (Titles)
  { id: 'theory_master_ach', title: 'ปราชญ์ทฤษฎี', desc: 'สะสม XP สายทฤษฎีครบ 1,000', icon: '📜', target: 1000, type: 'theory_xp', rewardTitle: 'นักทฤษฎี' },
  { id: 'calc_expert_ach', title: 'จอมโจทย์คำนวณ', desc: 'สะสม XP สายคำนวณครบ 1,000', icon: '🧮', target: 1000, type: 'calculation_xp', rewardTitle: 'นักคำนวณ' },
  { id: 'night_owl_ach', title: 'ผู้พิทักษ์ราตรี', desc: 'ได้รับเหรียญนกฮูกราตรี', icon: '🦉', target: 1, type: 'has_badge', badgeId: 'night_owl', rewardTitle: 'นกฮูกราตรี' },
  { id: 'early_bird_ach', title: 'ผู้เบิกอรุณ', desc: 'ได้รับเหรียญนกเช้าตรู่', icon: '🌅', target: 1, type: 'has_badge', badgeId: 'early_bird', rewardTitle: 'นกเช้าตรู่' },
  { id: 'item_user_ach', title: 'ปรมาจารย์อุปกรณ์ช่วย', desc: 'ใช้ไอเทมช่วยเหลือครบ 10 ครั้ง', icon: '🧪', target: 10, type: 'item_usage', rewardTitle: 'นักใช้ไอเทม' },
  // Long-term Achievements
  { id: 'level_30', title: 'ปราชญ์อาวุโส', desc: 'เลเวลถึง 30', icon: '🔱', target: 30, type: 'level', rewardTitle: 'ปราชญ์อาวุโส' },
  { id: 'level_50', title: 'อมตะแห่งปัญญา', desc: 'เลเวลถึง 50', icon: '♾️', target: 50, type: 'level', rewardTitle: 'อมตะแห่งปัญญา' },
  { id: 'item_usage_50', title: 'ผู้เชี่ยวชาญอุปกรณ์', desc: 'ใช้ไอเทมช่วยเหลือครบ 50 ครั้ง', icon: '🛠️', target: 50, type: 'item_usage', rewardTitle: 'นักประดิษฐ์' },
  { id: 'xp_50k_ach', title: 'เศรษฐีผู้ร่ำรวย', desc: 'มี XP รวมสะสมครบ 50,000', icon: '💎', target: 50000, type: 'total_xp', rewardTitle: 'มหาเศรษฐี' },
  { id: 'posn_mastery', title: 'เทพเจ้า สอวน.', desc: 'เลเวลถึง 10 ทั้งสาย สอวน. วิทย์โลกและดาราศาสตร์', icon: '🪐', target: 10, type: 'dual_level', track1: 'posn_earth', track2: 'posn_astro', rewardTitle: 'เทพเจ้า สอวน.' },
  { id: 'quest_champion', title: 'ผู้พิชิตภารกิจ', desc: 'ทำภารกิจรายวันสำเร็จครบ 50 ภารกิจ', icon: '📜', target: 50, type: 'total_quests', rewardTitle: 'ผู้พิชิตภารกิจ' },
  { id: 'badge_collector', title: 'นักสะสมเหรียญ', desc: 'ได้รับเหรียญรางวัลครบ 20 เหรียญ', icon: '🎖️', target: 20, type: 'total_badges', rewardTitle: 'นักสะสมเหรียญ' }
];

export const SHOP_ITEMS = [
  // 50 XP
  { id: 'item_cut_1', type: 'consumable', name: 'ตัดช้อยส์ (25%)', icon: '🔪', cost: 50, value: 'cut_1', desc: 'ตัดตัวเลือกที่ผิดออก 1 ตัวเลือก' },
  { id: 'item_range_hint', type: 'consumable', name: 'สโคปคำตอบ', icon: '🎯', cost: 50, value: 'range_hint', desc: 'บอกช่วงของคำตอบที่ถูกต้อง (สำหรับข้อเขียนตัวเลข)' },
  { id: 'item_tolerance', type: 'consumable', name: 'ขยายเป้า', icon: '⭕', cost: 50, value: 'tolerance', desc: 'เพิ่มค่าความคลาดเคลื่อนที่ยอมรับได้ +/- 20% (สำหรับข้อเขียนตัวเลข)' },

  // 100 XP
  { id: 'item_5050', type: 'consumable', name: 'ตัวช่วย 50/50', icon: '✂️', cost: 100, value: '5050', desc: 'ตัดตัวเลือกที่ผิดออก 2 ตัวเลือก' },

  // 120 XP
  { id: 'item_streak_freeze', type: 'consumable', name: 'Streak Freeze', icon: '🧊', cost: 120, value: 'streak_freeze', desc: 'ป้องกัน Streak หายเมื่อไม่ได้เข้าใช้งาน 1 วัน (ใช้รักษาสถิติ)' },

  // 150 XP
  { id: 'avatar_earth', type: 'avatar', name: 'โลก', icon: '🌍', cost: 150, value: '🌍', desc: 'อวตารโลกสีคราม' },
  { id: 'avatar_newmoon', type: 'avatar', name: 'จันทร์ดับ', icon: '🌑', cost: 150, value: '🌑', desc: 'อวตารดวงจันทร์ในคืนเดือนมืด' },
  { id: 'avatar_star', type: 'avatar', name: 'ดาว', icon: '⭐', cost: 150, value: '⭐', desc: 'อวตารดวงดาวเปล่งประกาย' },
  { id: 'avatar_frog', type: 'avatar', name: 'กบ', icon: '🐸', cost: 150, value: '🐸', desc: 'อวตารกบ' },
  { id: 'avatar_hamster', type: 'avatar', name: 'แฮมสเตอร์', icon: '🐹', cost: 150, value: '🐹', desc: 'อวตารหนูแฮมสเตอร์' },
  { id: 'avatar_bunny', type: 'avatar', name: 'กระต่าย', icon: '🐰', cost: 150, value: '🐰', desc: 'อวตารกระต่ายน้อย' },
  { id: 'item_time_freeze', type: 'consumable', name: 'หยุดเวลา', icon: '❄️', cost: 150, value: 'time_freeze', desc: 'หยุดเวลาชั่วคราว 30 วินาที' },

  // 200 XP
  { id: 'avatar_saturn', type: 'avatar', name: 'ดาวเสาร์', icon: '🪐', cost: 200, value: '🪐', desc: 'อวตารดาวเคราะห์มีวงแหวน' },
  { id: 'avatar_comet', type: 'avatar', name: 'ดาวหาง', icon: '☄️', cost: 200, value: '☄️', desc: 'อวตารดาวหางผู้มาเยือน' },
  { id: 'avatar_pinata', type: 'avatar', name: 'pinata', icon: '🪅', cost: 200, value: '🪅', desc: 'อวตารปีนตา' },

  // 250 XP
  { id: 'avatar_sun', type: 'avatar', name: 'ดวงอาทิตย์', icon: '☀️', cost: 250, value: '☀️', desc: 'อวตารดาวฤกษ์ศูนย์กลาง' },
  { id: 'avatar_dog', type: 'avatar', name: 'สุนัข', icon: '🐶', cost: 250, value: '🐶', desc: 'อวตารเพื่อนผู้ซื่อสัตย์' },
  { id: 'avatar_cat', type: 'avatar', name: 'แมว', icon: '😺', cost: 250, value: '😺', desc: 'อวตารแมวเหมียว' },
  { id: 'avatar_monkey', type: 'avatar', name: 'ลิง', icon: '🐵', cost: 250, value: '🐵', desc: 'อวตารลิง' },
  { id: 'avatar_koala', type: 'avatar', name: 'โคอาลา', icon: '🐨', cost: 250, value: '🐨', desc: 'อวตารโคอาลา' },
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
  { id: 'avatar_trex', type: 'avatar', name: 'T-rex', icon: '🦖', cost: 800, value: '🦖', desc: 'อวตารT-rex' },
  { id: 'theme_sunset', type: 'theme', name: 'พระอาทิตย์ตก (Sunset)', icon: '🌅', cost: 800, value: 'theme-sunset', desc: 'ธีมสีส้มอบอุ่น' },
  { id: 'theme_ocean', type: 'theme', name: 'มหาสมุทร (Ocean)', icon: '🌊', cost: 800, value: 'theme-ocean', desc: 'ธีมสีฟ้าน้ำทะเล' },

  // 1000 XP
  { id: 'avatar_dragon', type: 'avatar', name: 'มังกร', icon: '🐉', cost: 1000, value: '🐉', desc: 'อวตารมังกรในตำนาน' },
  { id: 'theme_berry', type: 'theme', name: 'เบอร์รี่ (Berry)', icon: '🍇', cost: 1000, value: 'theme-berry', desc: 'ธีมสีม่วงสดใส' },

  // 1200 XP
  { id: 'avatar_unicorn', type: 'avatar', name: 'ยูนิคอร์น', icon: '🦄', cost: 1200, value: '🦄', desc: 'สัตว์วิเศษหายาก' },


  // 2000 XP
  { id: 'title_master', type: 'title', name: 'ปรมาจารย์', icon: '🎓', cost: 2000, value: 'ปรมาจารย์', desc: 'ฉายาขั้นสูง' },
  { id: 'theme_sakura', type: 'theme', name: 'ซากุระ (Sakura)', icon: '🌸', cost: 2000, value: 'theme-sakura', desc: 'ธีมสีชมพูอ่อนหวาน' },

  // 5000 XP
  { id: 'title_rich', type: 'title', name: 'เศรษฐี XP', icon: '💰', cost: 5000, value: 'เศรษฐี XP', desc: 'ฉายาสำหรับผู้มั่งคั่ง' },
  { id: 'theme_dark', type: 'theme', name: 'รัตติกาล (Midnight)', icon: '🌑', cost: 5000, value: 'theme-midnight', desc: 'ธีมสีมืดลึกลับ' },
];

export const THEME_DEFINITIONS = {
  forest: {
    main: '#16a34a',     // green-600
    hover: '#15803d',    // green-700
    secondary: '#4ade80', // green-400
    light_bg: '#f0fdf4', // green-50
    dark_bg: 'rgba(20, 83, 45, 0.5)', // green-900 (dark)
    ring: '#86efac',     // green-300
    dark_text: '#4ade80'
  },
  sunset: {
    main: '#ea580c',     // orange-600
    hover: '#c2410c',    // orange-700
    secondary: '#fb923c', // orange-400
    light_bg: '#fff7ed', // orange-50
    dark_bg: 'rgba(124, 45, 18, 0.5)', // orange-900 (dark)
    ring: '#fdba74',     // orange-300
    dark_text: '#fb923c'
  },
  ocean: {
    main: '#0284c7',     // sky-600
    hover: '#0369a1',    // sky-700
    secondary: '#38bdf8', // sky-400
    light_bg: '#f0f9ff', // sky-50
    dark_bg: 'rgba(12, 74, 110, 0.5)', // sky-900 (dark)
    ring: '#7dd3fc',     // sky-300
    dark_text: '#38bdf8'
  },
  berry: {
    main: '#c026d3',     // fuchsia-600
    hover: '#a21caf',    // fuchsia-700
    secondary: '#e879f9', // fuchsia-400
    light_bg: '#fdf4ff', // fuchsia-50
    dark_bg: 'rgba(74, 4, 78, 0.5)', // fuchsia-900 (dark)
    ring: '#f5d0fe',     // fuchsia-300
    dark_text: '#e879f9'
  },
  midnight: {
    main: '#4f46e5',     // indigo-600
    hover: '#4338ca',    // indigo-700
    secondary: '#818cf8', // indigo-400
    light_bg: '#eef2ff', // indigo-50
    dark_bg: 'rgba(30, 27, 75, 0.5)', // indigo-900 (dark)
    ring: '#a5b4fc',     // indigo-300
    dark_text: '#818cf8'
  },
  sakura: {
    main: '#db2777',     // pink-600
    hover: '#be185d',    // pink-700
    secondary: '#f472b6', // pink-400
    light_bg: '#fdf2f8', // pink-50
    dark_bg: 'rgba(80, 7, 36, 0.5)', // pink-900 (dark)
    ring: '#f9a8d4',     // pink-300
    dark_text: '#f472b6'
  }
};

export const XP_THRESHOLDS = [
  { level: 1, xp: 0, quest: null }, // No quest to reach level 1
  { level: 2, xp: 100, quest: { type: 'correct_streak', target: 5, desc: 'ตอบคำถามถูกติดต่อกัน 5 ข้อ' } },
  { level: 3, xp: 300, quest: { type: 'quizzes_completed', target: 3, desc: 'ทำแบบทดสอบให้ครบ 3 ครั้ง' } },
  { level: 4, xp: 600, quest: { type: 'perfect_scores', target: 1, desc: 'ทำคะแนนเต็ม 100% ให้ได้ 1 ครั้ง' } },
  { level: 5, xp: 1000, quest: { type: 'high_scores_80', target: 3, desc: 'ทำคะแนนได้ 80% ขึ้นไป 3 ครั้ง' } },
  { level: 6, xp: 1500, quest: { type: 'quizzes_completed', target: 10, desc: 'ทำแบบทดสอบให้ครบ 10 ครั้ง' } },
  { level: 7, xp: 2200, quest: { type: 'correct_streak', target: 15, desc: 'ตอบคำถามถูกติดต่อกัน 15 ข้อ' } },
  { level: 8, xp: 3000, quest: { type: 'physics_level', target: 5, desc: 'ไปให้ถึงเลเวล 5 ในสายฟิสิกส์' } },
  { level: 9, xp: 4000, quest: { type: 'earth_level', target: 5, desc: 'ไปให้ถึงเลเวล 5 ในสายวิทย์โลก' } },
  { level: 10, xp: 5500, quest: { type: 'quizzes_completed', target: 20, desc: 'ทำแบบทดสอบให้ครบ 20 ครั้ง' } },
  { level: 11, xp: 7500, quest: { type: 'high_scores_80', target: 10, desc: 'ทำคะแนนได้ 80% ขึ้นไป 10 ครั้ง' } },
  { level: 12, xp: 10000, quest: { type: 'correct_streak', target: 25, desc: 'ตอบคำถามถูกติดต่อกัน 25 ข้อ' } },
  { level: 13, xp: 13000, quest: { type: 'quizzes_completed', target: 40, desc: 'ทำแบบทดสอบให้ครบ 40 ครั้ง' } },
  { level: 14, xp: 16500, quest: { type: 'perfect_scores', target: 5, desc: 'ทำคะแนนเต็ม 100% ให้ได้ 5 ครั้ง' } },
  { level: 15, xp: 20500, quest: { type: 'physics_level', target: 10, desc: 'ไปให้ถึงเลเวล 10 ในสายฟิสิกส์' } },
  { level: 16, xp: 25000, quest: { type: 'earth_level', target: 10, desc: 'ไปให้ถึงเลเวล 10 ในสายวิทย์โลก' } },
  { level: 17, xp: 30000, quest: { type: 'high_scores_80', target: 20, desc: 'ทำคะแนนได้ 80% ขึ้นไป 20 ครั้ง' } },
  { level: 18, xp: 36000, quest: { type: 'quizzes_completed', target: 80, desc: 'ทำแบบทดสอบให้ครบ 80 ครั้ง' } },
  { level: 19, xp: 43000, quest: { type: 'correct_streak', target: 40, desc: 'ตอบคำถามถูกติดต่อกัน 40 ข้อ' } },
  { level: 20, xp: 50000, quest: { type: 'perfect_scores', target: 10, desc: 'ทำคะแนนเต็ม 100% ให้ได้ 1 ครั้ง' } }
];

export const WEEKLY_BOSSES = [
  { id: 'geo_titan', name: 'มหาบอสธรณีพิบัติภัย (Geo-Titan)', icon: '🌋', maxHp: 500, category: 'earth', bonusXp: 500, badgeId: 'boss_slayer_geo' },
  { id: 'quantum_overlord', name: 'จอมเวทย์กลศาสตร์ควอนตัม (Quantum-Overlord)', icon: '⚛️', maxHp: 600, category: 'physics', bonusXp: 600, badgeId: 'boss_slayer_quantum' },
  { id: 'astro_behemoth', name: 'อสูรร้ายแห่งหลุมดำ (Astro-Behemoth)', icon: '🌌', maxHp: 550, category: 'astronomy', bonusXp: 550, badgeId: 'boss_slayer_astro' }
];

export const MYSTERY_CHEST_REWARDS = [
  { type: 'xp', value: 150, name: 'โบนัส 150 XP', icon: '✨' },
  { type: 'xp', value: 300, name: 'แจ็กพอต 300 XP!', icon: '💎' },
  { type: 'item', itemId: 'item_5050', name: 'ตัวช่วย 50/50 (1 ชิ้น)', icon: '✂️' },
  { type: 'item', itemId: 'item_cut_1', name: 'ตัวช่วยตัดช้อยส์ (1 ชิ้น)', icon: '🔪' },
  { type: 'item', itemId: 'item_time_freeze', name: 'ตัวช่วยหยุดเวลา (1 ชิ้น)', icon: '❄️' },
  { type: 'item', itemId: 'item_range_hint', name: 'ตัวช่วยสโคปคำตอบ (1 ชิ้น)', icon: '🎯' },
  { type: 'item', itemId: 'item_streak_freeze', name: 'Streak Freeze (1 ชิ้น)', icon: '🧊' }
];

export const SKILL_TREE_PERKS = [
  { id: 'discount_shop', name: 'นักต่อรองราคา', desc: 'ลดราคาซื้อไอเทมในร้านค้าลง 20%', icon: '🏷️', costSP: 1, category: 'utility' },
  { id: 'theory_scholar', name: 'นักทฤษฎีรอบรู้', desc: 'ได้รับ XP เพิ่มขึ้น 15% สำหรับโจทย์หมวดทฤษฎี', icon: '📖', costSP: 1, category: 'general' },
  { id: 'fever_boost', name: 'สายเลือดฟีเวอร์', desc: 'เพิ่มตัวคูณ Combo Fever Mode จาก x2.0 เป็น x2.5', icon: '🔥', costSP: 2, category: 'combat' },
  { id: 'calc_master', name: 'จอมคำนวณแม่นยำ', desc: 'ได้รับ XP เพิ่มขึ้น 20% สำหรับโจทย์คำนวณตัวเลข', icon: '🔢', costSP: 2, category: 'physics' }
];
