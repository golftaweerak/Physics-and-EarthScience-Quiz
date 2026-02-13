/**
 * @fileoverview ชุดข้อสอบวิชาฟิสิกส์ ม.5
 * @id phy_m5_ch8-5
 * @description บทที่ 8: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (ชุดที่ 5 - การวิเคราะห์กราฟ SHM)
 * @version 1.0.0
 */

const MAIN_CATEGORY = "บทที่ 8: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย";
const LO_1 = "1. ทดลอง และอธิบายการเคลื่อนที่แบบฮาร์มอนิกอย่างง่ายของวัตถุติดปลายสปริงและลูกตุ้มอย่างง่าย";

export const quizItems = [
  // --- Graph Analysis Questions ---
  {
    number: 1,
    type: "question",
    question: "กราฟความสัมพันธ์ระหว่างการกระจัด (x) กับเวลา (t) ของวัตถุที่เคลื่อนที่แบบ SHM เป็นรูปไซน์ (Sine wave) กราฟความเร็ว (v) กับเวลา (t) จะมีลักษณะอย่างไร",
    options: [
      "เป็นรูปไซน์ที่มีเฟสตรงกันกับกราฟการกระจัด",
      "เป็นรูปโคไซน์ที่มีเฟสนำหน้ากราฟการกระจัด 90 องศา",
      "เป็นรูปไซน์ที่มีเฟสตามหลังกราฟการกระจัด 90 องศา",
      "เป็นรูปโคไซน์ที่มีเฟสตรงข้ามกับกราฟการกระจัด"
    ],
    answer: "เป็นรูปโคไซน์ที่มีเฟสนำหน้ากราฟการกระจัด 90 องศา",
    explanation: "ความเร็วเป็นอนุพันธ์ของการกระจัดเทียบกับเวลา (\\(v = dx/dt\\)) ถ้า \\(x = A\\sin(\\omega t)\\) จะได้ \\(v = A\\omega\\cos(\\omega t)\\) ซึ่งเป็นฟังก์ชันโคไซน์และมีเฟสนำหน้าไซน์อยู่ 90 องศา",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 2,
    type: "question",
    question: "จากกราฟการกระจัด-เวลา (x-t) จุดใดบนกราฟที่วัตถุมีความเร็วเป็นศูนย์",
    options: [
      "จุดที่กราฟตัดแกนเวลา (x=0)",
      "จุดยอดและจุดต่ำสุดของกราฟ (x=A, x=-A)",
      "จุดกึ่งกลางระหว่างจุดยอดและแกนเวลา",
      "ทุกจุดบนกราฟมีความเร็วไม่เป็นศูนย์"
    ],
    answer: "จุดยอดและจุดต่ำสุดของกราฟ (x=A, x=-A)",
    explanation: "ความเร็วคือความชันของกราฟ x-t ที่จุดยอดและจุดต่ำสุด ความชันเป็นศูนย์ แสดงว่าวัตถุหยุดนิ่งชั่วขณะเพื่อกลับทิศทาง",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 3,
    type: "question",
    question: "กราฟความเร่ง (a) กับเวลา (t) มีความสัมพันธ์กับกราฟการกระจัด (x) กับเวลา (t) อย่างไร",
    options: [
      "มีรูปร่างเหมือนกันและเฟสตรงกัน",
      "มีรูปร่างเหมือนกันแต่เฟสต่างกัน 90 องศา",
      "มีรูปร่างเหมือนกันแต่เฟสต่างกัน 180 องศา (กลับเฟส)",
      "ไม่มีความสัมพันธ์กันที่แน่นอน"
    ],
    answer: "มีรูปร่างเหมือนกันแต่เฟสต่างกัน 180 องศา (กลับเฟส)",
    explanation: "จากสมการ \\(a = -\\omega^2 x\\) ความเร่งแปรผันตรงกับการกระจัดแต่มีทิศตรงข้ามเสมอ (เครื่องหมายลบ) ซึ่งหมายถึงเฟสต่างกัน 180 องศา",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 4,
    type: "question",
    question: "พื้นที่ใต้กราฟระหว่างความเร็ว (v) กับเวลา (t) ในช่วงเวลาหนึ่งๆ แทนปริมาณใด",
    options: [
      "ความเร่งเฉลี่ย",
      "การกระจัดที่เปลี่ยนไป",
      "งานที่ทำโดยแรงลัพธ์",
      "การดลที่กระทำต่อวัตถุ"
    ],
    answer: "การกระจัดที่เปลี่ยนไป",
    explanation: "พื้นที่ใต้กราฟ v-t คือผลอินทิเกรตของความเร็วเทียบกับเวลา (\\(\\int v dt\\)) ซึ่งเท่ากับการกระจัด (\\(\\Delta x\\))",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 5,
    type: "question",
    question: "ความชันของกราฟความเร็ว (v) กับเวลา (t) ณ จุดใดๆ แทนปริมาณใด",
    options: [
      "การกระจัด",
      "ความเร่ง",
      "แรงลัพธ์",
      "พลังงานจลน์"
    ],
    answer: "ความเร่ง",
    explanation: "ความเร่งคืออัตราการเปลี่ยนแปลงความเร็วเทียบกับเวลา (\\(a = dv/dt\\)) ซึ่งก็คือความชันของเส้นสัมผัสกราฟ v-t ณ จุดนั้นๆ",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },

  // --- Scenario: Displacement-Time Graph ---
  {
    type: "scenario",
    title: "สถานการณ์: กราฟการกระจัด-เวลา",
    description: "พิจารณากราฟการกระจัด (x) กับเวลา (t) ของวัตถุหนึ่งดังรูป <br><div class='flex justify-center'><img src='../assets/images/phy_m5_ch8-5_q6.png' alt='กราฟการกระจัดกับเวลา' class='max-w-sm'></div><br> (กราฟรูปไซน์ แอมพลิจูด 0.2 m คาบ 4 วินาที)",
    questions: [
      {
        number: 6,
        type: "fill-in-number",
        question: "แอมพลิจูดของการเคลื่อนที่นี้มีค่ากี่เมตร (ตอบเป็นทศนิยม 1 ตำแหน่ง)",
        answer: 0.2,
        unit: "m",
        hint: "ดูค่าสูงสุดของกราฟจากแกนตั้ง",
        explanation: "จากกราฟ ค่าสูงสุดของการกระจัดคือ 0.2 m ซึ่งคือแอมพลิจูด (A)",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 7,
        type: "fill-in-number",
        question: "คาบของการเคลื่อนที่นี้มีค่ากี่วินาที (ตอบเป็นจำนวนเต็ม)",
        answer: 4,
        unit: "s",
        hint: "ดูเวลาที่กราฟใช้ในการครบ 1 รอบ (เช่น จากจุดตัดแกนขึ้น ไปถึงจุดตัดแกนขึ้นถัดไป)",
        explanation: "จากกราฟ คลื่นครบ 1 รอบใช้เวลา 4 วินาที ดังนั้นคาบ (T) = 4 s",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 8,
        type: "fill-in-number",
        question: "ความถี่เชิงมุม (\\(\\omega\\)) ของการเคลื่อนที่นี้เป็นเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่งในหน่วย rad/s โดยให้ \\(\\pi \\approx 3.14\\))",
        answer: 1.57,
        unit: "rad/s",
        tolerance: 0.01,
        hint: "ใช้สูตร \\(\\omega = 2\\pi/T\\)",
        explanation: "\\(\\omega = 2\\pi/T = 2(3.14)/4 = 1.57\\) rad/s",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      }
    ]
  },

  // --- Scenario: Velocity-Time Graph ---
  {
    type: "scenario",
    title: "สถานการณ์: กราฟความเร็ว-เวลา",
    description: "วัตถุเคลื่อนที่แบบ SHM มีกราฟความเร็ว (v) กับเวลา (t) ดังรูป <br><div class='flex justify-center'><img src='../assets/images/phy_m5_ch8-5_q9.png' alt='กราฟความเร็วกับเวลา' class='max-w-sm'></div><br> (กราฟรูปโคไซน์ ความเร็วสูงสุด 4 m/s คาบ 2 วินาที)",
    questions: [
      {
        number: 9,
        type: "fill-in-number",
        question: "อัตราเร็วสูงสุดของวัตถุเป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย m/s)",
        answer: 4,
        unit: "m/s",
        hint: "ดูค่าสูงสุดของกราฟจากแกนตั้ง",
        explanation: "จากกราฟ ค่าสูงสุดของความเร็วคือ 4 m/s",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 10,
        type: "fill-in-number",
        question: "แอมพลิจูดของการเคลื่อนที่นี้เป็นกี่เมตร (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14\\))",
        answer: 1.27,
        unit: "m",
        tolerance: 0.02,
        hint: "หา \\(\\omega\\) จากคาบก่อน แล้วใช้ \\(v_{max} = \\omega A\\)",
        explanation: "จากกราฟ คาบ T = 2 s. \\(\\omega = 2\\pi/T = \\pi\\) rad/s. จาก \\(v_{max} = \\omega A \\Rightarrow 4 = \\pi A \\Rightarrow A = 4/3.14 \\approx 1.27\\) m",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 11,
        type: "fill-in-number",
        question: "ความเร่งสูงสุดของวัตถุเป็นเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่งในหน่วย m/s² โดยให้ \\(\\pi \\approx 3.14\\))",
        answer: 12.56,
        unit: "m/s²",
        tolerance: 0.1,
        hint: "\\(a_{max} = \\omega v_{max}\\) หรือ \\(a_{max} = \\omega^2 A\\)",
        explanation: "\\(a_{max} = \\omega v_{max} = \\pi(4) \\approx 3.14 \\times 4 = 12.56\\) m/s²",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      }
    ]
  },

  // --- Scenario: Acceleration-Displacement Graph ---
  {
    type: "scenario",
    title: "สถานการณ์: กราฟความเร่ง-การกระจัด",
    description: "กราฟความสัมพันธ์ระหว่างความเร่ง (a) กับการกระจัด (x) ของวัตถุ SHM เป็นเส้นตรงผ่านจุดกำเนิดที่มีความชันเป็นลบ <br><div class='flex justify-center'><img src='../assets/images/phy_m5_ch8-5_q12.png' alt='กราฟความเร่งกับการกระจัด' class='max-w-sm'></div><br> (กราฟเส้นตรงผ่าน (0,0) ผ่านจุด (0.1, -4) และ (-0.1, 4))",
    questions: [
      {
        number: 12,
        type: "fill-in-number",
        question: "ความชันของกราฟนี้มีค่าเท่าใด (ตอบเป็นจำนวนเต็ม)",
        answer: -40,
        unit: "",
        hint: "ความชัน = \\(\\Delta y / \\Delta x\\)",
        explanation: "ความชัน = \\((-4 - 0) / (0.1 - 0) = -40\\)",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 13,
        type: "fill-in-number",
        question: "ความถี่เชิงมุม (\\(\\omega\\)) ของการสั่นเป็นเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่งในหน่วย rad/s)",
        answer: 6.32,
        unit: "rad/s",
        tolerance: 0.05,
        hint: "ความชันของกราฟ a-x คือ \\(-\\omega^2\\)",
        explanation: "ความชัน = \\(-\\omega^2 = -40 \\Rightarrow \\omega = \\sqrt{40} \\approx 6.32\\) rad/s",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 14,
        type: "fill-in-number",
        question: "คาบของการสั่นเป็นกี่วินาที (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14\\))",
        answer: 0.99,
        unit: "s",
        tolerance: 0.02,
        hint: "\\(T = 2\\pi/\\omega\\)",
        explanation: "\\(T = 2(3.14)/6.32 \\approx 0.99\\) s",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      }
    ]
  },

  // --- Energy Graphs ---
  {
    number: 15,
    type: "question",
    question: "กราฟระหว่างพลังงานจลน์ (\\(E_k\\)) กับการกระจัด (x) ของวัตถุ SHM มีลักษณะเป็นรูปอะไร",
    options: [
      "เส้นตรงผ่านจุดกำเนิด",
      "พาราโบลาหงาย",
      "พาราโบลาคว่ำ",
      "วงรี"
    ],
    answer: "พาราโบลาคว่ำ",
    explanation: "จาก \\(E_k = E_{total} - E_p = E_{total} - \\frac{1}{2}kx^2\\) สมการนี้เป็นพาราโบลาคว่ำที่มีจุดยอดอยู่ที่ \\(E_{total}\\) เมื่อ x=0",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 16,
    type: "question",
    question: "กราฟระหว่างพลังงานศักย์ (\\(E_p\\)) กับเวลา (t) มีลักษณะเป็นรูปอะไร",
    options: [
      "เส้นตรงขนานแกนเวลา",
      "รูปคลื่นไซน์ (Sine wave)",
      "รูปคลื่นไซน์ยกกำลังสอง (Sine squared)",
      "รูปพาราโบลา"
    ],
    answer: "รูปคลื่นไซน์ยกกำลังสอง (Sine squared)",
    explanation: "จาก \\(x = A\\sin(\\omega t)\\) และ \\(E_p = \\frac{1}{2}kx^2\\) จะได้ \\(E_p = \\frac{1}{2}kA^2\\sin^2(\\omega t)\\) ซึ่งเป็นกราฟรูปคลื่นไซน์ยกกำลังสอง (มีค่าเป็นบวกเสมอ)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },

  // --- Mixed Graph Analysis ---
  {
    number: 17,
    type: "fill-in-number",
    question: "จากกราฟการกระจัด-เวลา ถ้าที่เวลา t=0 วัตถุอยู่ที่ x=0 และกำลังเคลื่อนที่ไปทางบวก เฟสเริ่มต้น (\\(\\phi\\)) เป็นกี่องศา (ตอบเป็นจำนวนเต็ม)",
    answer: 0,
    unit: "องศา",
    hint: "แทนค่า t=0, x=0 ในสมการ \\(x = A\\sin(\\omega t + \\phi)\\)",
    explanation: "\\(0 = A\\sin(\\phi) \\Rightarrow \\sin\\phi = 0\\). เนื่องจากกำลังไปทางบวก (ความชันเป็นบวก) ดังนั้น \\(\\phi = 0\\) องศา",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 18,
    type: "fill-in-number",
    question: "จากกราฟการกระจัด-เวลา ถ้าที่เวลา t=0 วัตถุอยู่ที่ x=A (จุดยอด) เฟสเริ่มต้น (\\(\\phi\\)) เป็นกี่องศา (ตอบเป็นจำนวนเต็ม)",
    answer: 90,
    unit: "องศา",
    hint: "แทนค่า t=0, x=A ในสมการ \\(x = A\\sin(\\omega t + \\phi)\\)",
    explanation: "\\(A = A\\sin(\\phi) \\Rightarrow \\sin\\phi = 1 \\Rightarrow \\phi = 90\\) องศา (หรือ \\(\\pi/2\\) เรเดียน)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 19,
    type: "fill-in-number",
    question: "วัตถุหนึ่งสั่นแบบ SHM โดยมีกราฟพลังงานศักย์สูงสุด 50 J และพลังงานจลน์สูงสุด 50 J พลังงานกลรวมของระบบเป็นกี่จูล (ตอบเป็นจำนวนเต็ม)",
    answer: 50,
    unit: "J",
    hint: "พลังงานกลรวมเท่ากับพลังงานศักย์สูงสุด หรือพลังงานจลน์สูงสุด",
    explanation: "พลังงานกลรวม \\(E = E_{p,max} = E_{k,max} = 50\\) J",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 20,
    type: "fill-in-number",
    question: "จากกราฟความเร็ว-เวลา ถ้าความเร็วสูงสุดคือ 10 m/s และคาบคือ 2 วินาที การกระจัดสูงสุด (แอมพลิจูด) เป็นกี่เมตร (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14\\))",
    answer: 3.18,
    unit: "m",
    tolerance: 0.02,
    hint: "\\(v_{max} = \\omega A = (2\\pi/T)A\\)",
    explanation: "\\(10 = (2\\pi/2)A = \\pi A \\Rightarrow A = 10/3.14 \\approx 3.18\\) m",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  }
];

