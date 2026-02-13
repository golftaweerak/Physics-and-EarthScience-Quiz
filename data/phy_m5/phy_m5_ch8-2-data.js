/**
 * @fileoverview ชุดข้อสอบวิชาฟิสิกส์ ม.5
 * @id phy_m5_ch8-2
 * @description บทที่ 8: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (ชุดที่ 2 - การวิเคราะห์กราฟ พลังงาน และการประยุกต์)
 * @version 1.0.0
 */

const MAIN_CATEGORY = "บทที่ 8: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย";
const LO_1 = "1. ทดลอง และอธิบายการเคลื่อนที่แบบฮาร์มอนิกอย่างง่ายของวัตถุติดปลายสปริงและลูกตุ้มอย่างง่าย";
const LO_2 = "2. อธิบายความถี่ธรรมชาติของวัตถุและการเกิดการสั่นพ้อง";

export const quizItems = [
  // --- Conceptual & Analysis Questions ---
  {
    number: 1,
    type: "question",
    question: "ในการเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย ความเร็ว (\\(v\\)) และการกระจัด (\\(x\\)) มีเฟสต่างกันเท่าใด",
    options: [
      "เฟสตรงกัน (ต่างกัน 0 องศา)",
      "เฟสต่างกัน 90 องศา (\\(\\pi/2\\) เรเดียน)",
      "เฟสต่างกัน 180 องศา (\\(\\pi\\) เรเดียน)",
      "เฟสต่างกัน 270 องศา (\\(3\\pi/2\\) เรเดียน)"
    ],
    answer: "เฟสต่างกัน 90 องศา (\\(\\pi/2\\) เรเดียน)",
    explanation: "ความเร็วจะมีค่าสูงสุดเมื่อการกระจัดเป็นศูนย์ และเป็นศูนย์เมื่อการกระจัดสูงสุด ซึ่งแสดงถึงความต่างเฟส 90 องศา หรือ \\(\\pi/2\\) เรเดียน โดยความเร็วนำหน้าการกระจัด",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 2,
    type: "question",
    question: "กราฟความสัมพันธ์ระหว่างความเร่ง (\\(a\\)) กับการกระจัด (\\(x\\)) ของวัตถุที่เคลื่อนที่แบบ SHM มีลักษณะเป็นอย่างไร",
    options: [
      "เส้นตรงผ่านจุดกำเนิด ความชันเป็นบวก",
      "เส้นตรงผ่านจุดกำเนิด ความชันเป็นลบ",
      "เส้นโค้งพาราโบลาหงาย",
      "รูปวงรีหรือวงกลม"
    ],
    answer: "เส้นตรงผ่านจุดกำเนิด ความชันเป็นลบ",
    explanation: "จากสมการ \\(a = -\\omega^2 x\\) จะเห็นว่า \\(a\\) แปรผันตรงกับ \\(x\\) แต่มีทิศตรงข้าม (เครื่องหมายลบ) ดังนั้นกราฟจึงเป็นเส้นตรงผ่านจุดกำเนิดที่มีความชันเป็นลบ (\\(-\\omega^2\\))",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 3,
    type: "question",
    question: "พลังงานกลรวม (Total Mechanical Energy) ของวัตถุที่เคลื่อนที่แบบ SHM จะแปรผันตรงกับปริมาณใด",
    options: [
      "แอมพลิจูด (\\(A\\))",
      "กำลังสองของแอมพลิจูด (\\(A^2\\))",
      "การกระจัด (\\(x\\))",
      "ความเร็ว (\\(v\\))"
    ],
    answer: "กำลังสองของแอมพลิจูด (\\(A^2\\))",
    explanation: "พลังงานกลรวม \\(E = \\frac{1}{2}kA^2\\) หรือ \\(E = \\frac{1}{2}m\\omega^2 A^2\\) ซึ่งแปรผันตรงกับกำลังสองของแอมพลิจูด",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 4,
    type: "question",
    question: "ณ ตำแหน่งใดของการเคลื่อนที่แบบ SHM ที่พลังงานจลน์มีค่าเท่ากับพลังงานศักย์",
    options: [
      "ที่ตำแหน่ง \\(x = \\pm A/2\\)",
      "ที่ตำแหน่ง \\(x = \\pm A/\\sqrt{2}\\)",
      "ที่ตำแหน่ง \\(x = \\pm A/4\\)",
      "ที่ตำแหน่งสมดุล \\(x = 0\\)"
    ],
    answer: "ที่ตำแหน่ง \\(x = \\pm A/\\sqrt{2}\\)",
    explanation: "เมื่อ \\(E_k = E_p\\) จะได้ \\(E_{total} = 2E_p\\) ดังนั้น \\(\\frac{1}{2}kA^2 = 2(\\frac{1}{2}kx^2)\\) ซึ่งแก้สมการได้ \\(x = \\pm A/\\sqrt{2}\\) หรือประมาณ \\(0.707A\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 5,
    type: "question",
    question: "ถ้านำลูกตุ้มนาฬิกาที่แกว่งบนโลกไปแกว่งบนดวงจันทร์ซึ่งมีแรงโน้มถ่วงน้อยกว่าโลก คาบการแกว่งจะเป็นอย่างไร",
    options: [
      "คาบจะยาวขึ้น (แกว่งช้าลง)",
      "คาบจะสั้นลง (แกว่งเร็วขึ้น)",
      "คาบจะเท่าเดิมไม่เปลี่ยนแปลง",
      "ลูกตุ้มจะหยุดแกว่งทันที"
    ],
    answer: "คาบจะยาวขึ้น (แกว่งช้าลง)",
    explanation: "คาบของลูกตุ้ม \\(T = 2\\pi\\sqrt{L/g}\\) เมื่อ \\(g\\) ลดลง ตัวหารลดลง ทำให้ค่า \\(T\\) เพิ่มขึ้น คือใช้เวลาแกว่งต่อรอบนานขึ้น",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 6,
    type: "question",
    question: "หากตัดสปริงที่มีค่าคงที่ \\(k\\) ออกเป็น 2 ส่วนเท่าๆ กัน ค่าคงที่สปริงของแต่ละส่วนจะเป็นเท่าใด",
    options: [
      "เท่าเดิม (\\(k\\))",
      "ลดลงครึ่งหนึ่ง (\\(k/2\\))",
      "เพิ่มขึ้นเป็นสองเท่า (\\(2k\\))",
      "เพิ่มขึ้นเป็นสี่เท่า (\\(4k\\))"
    ],
    answer: "เพิ่มขึ้นเป็นสองเท่า (\\(2k\\))",
    explanation: "ค่าคงที่สปริงแปรผกผันกับความยาวสปริง (ยิ่งสั้นยิ่งแข็ง) เมื่อความยาวลดลงเหลือครึ่งหนึ่ง ค่า \\(k\\) จะเพิ่มขึ้นเป็น 2 เท่า",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 7,
    type: "question",
    question: "วัตถุที่เคลื่อนที่แบบ SHM จะมีความเร็วเป็นครึ่งหนึ่งของความเร็วสูงสุด (\\(v_{max}/2\\)) ที่ตำแหน่งใด",
    options: [
      "ที่ตำแหน่ง \\(x = \\pm A/2\\)",
      "ที่ตำแหน่ง \\(x = \\pm A\\sqrt{3}/2\\)",
      "ที่ตำแหน่ง \\(x = \\pm A/\\sqrt{2}\\)",
      "ที่ตำแหน่งสมดุล \\(x = 0\\)"
    ],
    answer: "ที่ตำแหน่ง \\(x = \\pm A\\sqrt{3}/2\\)",
    explanation: "จาก \\(v = \\omega\\sqrt{A^2-x^2}\\) ให้ \\(v = \\frac{1}{2}\\omega A\\) จะได้ \\(\\frac{1}{4}A^2 = A^2 - x^2\\) ดังนั้น \\(x^2 = \\frac{3}{4}A^2\\) หรือ \\(x = \\pm \\frac{\\sqrt{3}}{2}A\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 8,
    type: "question",
    question: "เมื่อนำสปริงสองตัวที่มีค่าคงที่ \\(k_1\\) และ \\(k_2\\) มาต่อกันแบบขนาน ค่าคงที่สปริงรวม (\\(k_{eq}\\)) จะเป็นเท่าใด",
    options: [
      "\\(k_{eq} = k_1 + k_2\\)",
      "\\(k_{eq} = |k_1 - k_2|\\)",
      "\\(1/k_{eq} = 1/k_1 + 1/k_2\\)",
      "\\(k_{eq} = \\sqrt{k_1 k_2}\\)"
    ],
    answer: "\\(k_{eq} = k_1 + k_2\\)",
    explanation: "การต่อสปริงแบบขนาน แรงดึงรวมจะเท่ากับผลรวมของแรงดึงแต่ละตัวที่ยืดเท่ากัน ทำให้เสมือนมีสปริงที่แข็งขึ้น ค่าคงที่รวมจึงนำมาบวกกัน",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 9,
    type: "question",
    question: "ถ้าลูกตุ้มนาฬิกาอยู่ในลิฟต์ที่กำลังเคลื่อนที่ขึ้นด้วยความเร่ง \\(a\\) คาบการแกว่งจะเป็นอย่างไรเทียบกับขณะอยู่นิ่ง",
    options: [
      "คาบจะยาวขึ้น",
      "คาบจะสั้นลง",
      "คาบจะเท่าเดิม",
      "ลูกตุ้มจะหยุดแกว่ง"
    ],
    answer: "คาบจะสั้นลง",
    explanation: "ในกรอบอ้างอิงของลิฟต์ที่เร่งขึ้น ความเร่งโน้มถ่วงปรากฏ (Effective g) จะเป็น \\(g' = g + a\\) เมื่อตัวหารในสูตร \\(T = 2\\pi\\sqrt{L/g'}\\) เพิ่มขึ้น คาบ \\(T\\) จะลดลง",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 10,
    type: "question",
    question: "เวลาที่วัตถุใช้ในการเคลื่อนที่จากตำแหน่งสมดุล (\\(x=0\\)) ไปยังตำแหน่ง \\(x=A/2\\) เป็นเศษส่วนเท่าใดของคาบ (\\(T\\))",
    options: [
      "\\(T/4\\)",
      "\\(T/6\\)",
      "\\(T/8\\)",
      "\\(T/12\\)"
    ],
    answer: "\\(T/12\\)",
    explanation: "จาก \\(x = A\\sin(\\frac{2\\pi}{T}t)\\) ให้ \\(x = A/2\\) จะได้ \\(\\sin(\\frac{2\\pi}{T}t) = 0.5\\) มุมคือ \\(\\pi/6\\) ดังนั้น \\(\\frac{2\\pi}{T}t = \\frac{\\pi}{6} \\Rightarrow t = T/12\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },

  // --- Calculation Questions ---
  {
    number: 11,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM ด้วยความถี่ 5 Hz จงหาความถี่เชิงมุม (\\(\\omega\\)) (ตอบเป็นจำนวนเต็มในหน่วย rad/s โดยให้ \\(\\pi \\approx 3\\))",
    answer: 30,
    unit: "rad/s",
    hint: "ใช้สูตร \\(\\omega = 2\\pi f\\)",
    explanation: "\\(\\omega = 2\\pi f = 2(3)(5) = 30\\) rad/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 12,
    type: "fill-in-number",
    question: "สปริงเบาค่าคงที่ 100 N/m ผูกติดกับมวล 1 kg วางบนพื้นราบลื่น เมื่อดึงมวลออกแล้วปล่อย คาบการสั่นจะเป็นเท่าใด (ตอบเป็นทศนิยม 1 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14\\))",
    answer: 0.6,
    unit: "s",
    tolerance: 0.1,
    hint: "ใช้สูตร \\(T = 2\\pi\\sqrt{m/k}\\)",
    explanation: "\\(T = 2\\pi\\sqrt{1/100} = 2(3.14)(0.1) = 0.628 \\approx 0.6\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    type: "scenario",
    title: "สถานการณ์: การคำนวณ SHM พื้นฐาน",
    description: "วัตถุเคลื่อนที่แบบ SHM มีแอมพลิจูด 0.5 m และความถี่เชิงมุม 4 rad/s",
    questions: [
      {
        number: 13,
        type: "fill-in-number",
        question: "จงหาอัตราเร็วสูงสุด (ตอบเป็นจำนวนเต็มในหน่วย m/s)",
        answer: 2,
        unit: "m/s",
        hint: "อัตราเร็วสูงสุด \\(v_{max} = \\omega A\\)",
        explanation: "\\(v_{max} = \\omega A = 4 \\times 0.5 = 2\\) m/s",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      },
      {
        number: 14,
        type: "fill-in-number",
        question: "จงหาขนาดความเร่งสูงสุด (ตอบเป็นจำนวนเต็มในหน่วย m/s²)",
        answer: 8,
        unit: "m/s²",
        hint: "ความเร่งสูงสุด \\(a_{max} = \\omega^2 A\\)",
        explanation: "\\(a_{max} = \\omega^2 A = 4^2 \\times 0.5 = 16 \\times 0.5 = 8\\) m/s²",
        subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
      }
    ]
  },
  {
    number: 15,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีสมการการกระจัด \\(x = 10 \\sin(2t)\\) (หน่วย cm) จงหาความเร็วของวัตถุเมื่อเวลา \\(t = \\pi/2\\) วินาที (ตอบเป็นจำนวนเต็มในหน่วย cm/s)",
    answer: -20,
    unit: "cm/s",
    hint: "หาอนุพันธ์ของ x เทียบกับ t จะได้สมการความเร็ว \\(v = \\omega A \\cos(\\omega t)\\) หรือแทนค่าในสูตร",
    explanation: "\\(v = \\frac{dx}{dt} = 10(2)\\cos(2t) = 20\\cos(2t)\\). เมื่อ \\(t = \\pi/2\\), \\(v = 20\\cos(\\pi) = 20(-1) = -20\\) cm/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 16,
    type: "fill-in-number",
    question: "ลูกตุ้มอย่างง่ายยาว 1.6 เมตร แกว่งบนดาวเคราะห์ดวงหนึ่งที่มีความเร่งโน้มถ่วง 4 m/s² คาบการแกว่งจะเป็นกี่วินาที (ตอบเป็นทศนิยม 1 ตำแหน่ง โดยให้ \\(\\pi \\approx 3\\))",
    answer: 3.8,
    unit: "s",
    tolerance: 0.1,
    hint: "ใช้สูตร \\(T = 2\\pi\\sqrt{L/g}\\)",
    explanation: "\\(T = 2(3)\\sqrt{1.6/4} = 6\\sqrt{0.4} \\approx 6(0.632) \\approx 3.79\\) s. (ถ้าใช้ \\(\\pi=3.14\\) จะได้ \\(3.97\\) s). ตอบประมาณ 3.8 s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 17,
    type: "fill-in-number",
    question: "สปริงตัวหนึ่งเมื่อแขวนมวล 2 kg จะยืดออก 10 cm จงหาค่าคงที่ของสปริง (ตอบเป็นจำนวนเต็มในหน่วย N/m)",
    answer: 200,
    unit: "N/m",
    hint: "ใช้กฎของฮุค \\(F = kx\\) โดย \\(F = mg\\) และเปลี่ยนหน่วย cm เป็น m",
    explanation: "\\(mg = kx \\Rightarrow 2(10) = k(0.1) \\Rightarrow 20 = 0.1k \\Rightarrow k = 200\\) N/m",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 18,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีพลังงานกลรวม 100 J ถ้าที่ตำแหน่งหนึ่งวัตถุมีพลังงานศักย์ 60 J วัตถุจะมีพลังงานจลน์เท่าใด (ตอบเป็นจำนวนเต็มในหน่วย J)",
    answer: 40,
    unit: "J",
    hint: "พลังงานกลรวม = พลังงานจลน์ + พลังงานศักย์",
    explanation: "\\(E = E_k + E_p \\Rightarrow 100 = E_k + 60 \\Rightarrow E_k = 40\\) J",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 19,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM ด้วยความถี่เชิงมุม 10 rad/s และมีแอมพลิจูด 0.5 m จงหาขนาดของความเร็วเมื่อวัตถุอยู่ที่ตำแหน่ง \\(x = 0.3\\) m (ตอบเป็นจำนวนเต็มในหน่วย m/s)",
    answer: 4,
    unit: "m/s",
    hint: "ใช้สูตร \\(v = \\omega\\sqrt{A^2 - x^2}\\)",
    explanation: "\\(v = 10\\sqrt{0.5^2 - 0.3^2} = 10\\sqrt{0.25 - 0.09} = 10\\sqrt{0.16} = 10(0.4) = 4\\) m/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 20,
    type: "fill-in-number",
    question: "สปริงสองตัวมีค่าคงที่ 100 N/m และ 300 N/m นำมาต่อกันแบบขนาน แล้วแขวนมวล 4 kg คาบการสั่นจะเป็นเท่าใด (ตอบเป็นทศนิยม 1 ตำแหน่ง โดยให้ \\(\\pi \\approx 3\\))",
    answer: 0.6,
    unit: "s",
    hint: "หา \\(k_{eq}\\) แบบขนานก่อน (\\(k_1+k_2\\)) แล้วหา \\(T\\)",
    explanation: "\\(k_{eq} = 100 + 300 = 400\\) N/m. \\(T = 2\\pi\\sqrt{m/k} = 2(3)\\sqrt{4/400} = 6\\sqrt{0.01} = 6(0.1) = 0.6\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 21,
    type: "fill-in-number",
    question: "ลูกตุ้มอย่างง่ายมีความยาวเชือก 1 เมตร แกว่งด้วยคาบ 2 วินาที ถ้าต้องการให้คาบเป็น 1 วินาที ต้องเปลี่ยนความยาวเชือกเป็นกี่เมตร (ตอบเป็นทศนิยม 2 ตำแหน่ง)",
    answer: 0.25,
    unit: "m",
    hint: "\\(T \\propto \\sqrt{L}\\) หรือ \\(T_1/T_2 = \\sqrt{L_1/L_2}\\)",
    explanation: "\\(2/1 = \\sqrt{1/L_2} \\Rightarrow 4 = 1/L_2 \\Rightarrow L_2 = 1/4 = 0.25\\) m",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 22,
    type: "fill-in-number",
    question: "วัตถุหนึ่งสั่น 120 รอบ ในเวลา 1 นาที ความถี่ของการสั่นเป็นกี่ Hz (ตอบเป็นจำนวนเต็ม)",
    answer: 2,
    unit: "Hz",
    hint: "ความถี่ = จำนวนรอบ / เวลา (วินาที)",
    explanation: "\\(f = 120 / 60 = 2\\) Hz",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 23,
    type: "fill-in-number",
    question: "กราฟระหว่างความเร่ง (\\(a\\)) กับการกระจัด (\\(x\\)) ของ SHM เป็นเส้นตรงที่มีความชันเท่ากับ -16 ความถี่เชิงมุมของการเคลื่อนที่นี้เป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย rad/s)",
    answer: 4,
    unit: "rad/s",
    hint: "ความชันของกราฟ a-x คือ \\(-\\omega^2\\)",
    explanation: "ความชัน \\(= -\\omega^2 = -16 \\Rightarrow \\omega^2 = 16 \\Rightarrow \\omega = 4\\) rad/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 24,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีพลังงานจลน์สูงสุด 50 J ถ้าวัตถุมีมวล 4 kg อัตราเร็วสูงสุดจะเป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย m/s)",
    answer: 5,
    unit: "m/s",
    hint: "\\(E_{k,max} = \\frac{1}{2}mv_{max}^2\\)",
    explanation: "\\(50 = \\frac{1}{2}(4)v_{max}^2 \\Rightarrow 50 = 2v_{max}^2 \\Rightarrow v_{max}^2 = 25 \\Rightarrow v_{max} = 5\\) m/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 25,
    type: "fill-in-number",
    question: "ถ้าสมการความเร็วของวัตถุคือ \\(v = 10 \\cos(2t)\\) การกระจัดสูงสุด (แอมพลิจูด) เป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย m)",
    answer: 5,
    unit: "m",
    hint: "จากสมการ \\(v_{max} = \\omega A\\) เทียบสัมประสิทธิ์หน้า cos",
    explanation: "\\(v_{max} = 10\\) และ \\(\\omega = 2\\). จาก \\(v_{max} = \\omega A \\Rightarrow 10 = 2A \\Rightarrow A = 5\\) m",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 26,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM จากตำแหน่งสมดุลไปยังตำแหน่งที่มีการกระจัดสูงสุด ใช้เวลา 0.5 วินาที คาบของการเคลื่อนที่นี้เป็นกี่วินาที (ตอบเป็นจำนวนเต็ม)",
    answer: 2,
    unit: "s",
    hint: "เวลาจากสมดุลถึงจุดปลายคือ \\(T/4\\)",
    explanation: "\\(t = T/4 = 0.5 \\Rightarrow T = 0.5 \\times 4 = 2\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 27,
    type: "fill-in-number",
    question: "สปริงตัวหนึ่งเมื่อแขวนมวล 1 kg จะสั่นด้วยความถี่ 2 Hz ถ้าเปลี่ยนมวลเป็น 4 kg จะสั่นด้วยความถี่กี่ Hz (ตอบเป็นจำนวนเต็ม)",
    answer: 1,
    unit: "Hz",
    hint: "\\(f \\propto 1/\\sqrt{m}\\)",
    explanation: "\\(f_2/f_1 = \\sqrt{m_1/m_2} = \\sqrt{1/4} = 1/2\\). ดังนั้น \\(f_2 = f_1/2 = 2/2 = 1\\) Hz",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 28,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีแอมพลิจูด 4 cm ที่ตำแหน่ง \\(x = 2\\) cm อัตราส่วนระหว่างพลังงานศักย์ต่อพลังงานกลรวมเป็นเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่ง)",
    answer: 0.25,
    unit: "",
    hint: "\\(E_p / E_{total} = (\\frac{1}{2}kx^2) / (\\frac{1}{2}kA^2) = (x/A)^2\\)",
    explanation: "\\(E_p / E_{total} = (2/4)^2 = (0.5)^2 = 0.25\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 29,
    type: "fill-in-number",
    question: "ลูกตุ้มนาฬิกาแกว่งบนโลกด้วยคาบ 2 วินาที ถ้านำไปแกว่งบนดาวเคราะห์ที่มีค่า g เป็น 4 เท่าของโลก คาบจะเป็นกี่วินาที (ตอบเป็นจำนวนเต็ม)",
    answer: 1,
    unit: "s",
    hint: "\\(T \\propto 1/\\sqrt{g}\\)",
    explanation: "\\(T_{new} = T_{earth} \\sqrt{g_{earth}/g_{new}} = 2 \\sqrt{1/4} = 2(1/2) = 1\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 30,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีความเร่งสูงสุด 20 m/s² และอัตราเร็วสูงสุด 4 m/s ความถี่เชิงมุมของการเคลื่อนที่นี้เป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย rad/s)",
    answer: 5,
    unit: "rad/s",
    hint: "\\(a_{max} = \\omega^2 A\\) และ \\(v_{max} = \\omega A\\) นำมาหารกัน",
    explanation: "\\(a_{max}/v_{max} = (\\omega^2 A) / (\\omega A) = \\omega\\). ดังนั้น \\(\\omega = 20/4 = 5\\) rad/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  }
];