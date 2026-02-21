/**
 * @fileoverview ชุดข้อสอบวิชาฟิสิกส์ ม.5
 * @id phy_m5_ch8-3
 * @description บทที่ 8: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (ชุดที่ 3 - การประยุกต์และโจทย์ปัญหาขั้นสูง)
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
    question: "ในการเคลื่อนที่แบบ SHM ถ้าเพิ่มมวลของวัตถุติดสปริงเป็น 2 เท่า โดยที่ค่าคงที่สปริงเท่าเดิม พลังงานกลรวมของระบบจะเปลี่ยนแปลงอย่างไร (ถ้าแอมพลิจูดคงที่)",
    options: [
      "เพิ่มขึ้น 2 เท่า",
      "ลดลงครึ่งหนึ่ง",
      "เท่าเดิมไม่เปลี่ยนแปลง",
      "เพิ่มขึ้น 4 เท่า"
    ],
    answer: "เท่าเดิมไม่เปลี่ยนแปลง",
    explanation: "พลังงานกลรวม \\(E = \\frac{1}{2}kA^2\\) ขึ้นอยู่กับค่าคงที่สปริง (\\(k\\)) และแอมพลิจูด (\\(A\\)) เท่านั้น ไม่ขึ้นกับมวล (\\(m\\))",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 2,
    type: "question",
    question: "กราฟระหว่างพลังงานจลน์ (\\(E_k\\)) กับเวลา (\\(t\\)) ของวัตถุที่เคลื่อนที่แบบ SHM มีลักษณะเป็นอย่างไร",
    options: [
      "เส้นตรงขนานกับแกนเวลา",
      "เส้นตรงผ่านจุดกำเนิด",
      "รูปคลื่นไซน์ยกกำลังสอง",
      "รูปพาราโบลาคว่ำ"
    ],
    answer: "รูปคลื่นไซน์ยกกำลังสอง",
    explanation: "เนื่องจาก \\(v = -\\omega A \\sin(\\omega t)\\) และ \\(E_k = \\frac{1}{2}mv^2\\) ดังนั้น \\(E_k \\propto \\sin^2(\\omega t)\\) ซึ่งเป็นกราฟรูปคลื่นไซน์ยกกำลังสอง (มีค่าเป็นบวกเสมอ)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 3,
    type: "question",
    question: "ถ้าความยาวเชือกของลูกตุ้มอย่างง่ายลดลงเหลือ 1/4 ของความยาวเดิม ความถี่ของการแกว่งจะเปลี่ยนแปลงอย่างไร",
    options: [
      "ลดลงเหลือครึ่งหนึ่ง",
      "เพิ่มขึ้นเป็น 2 เท่า",
      "เพิ่มขึ้นเป็น 4 เท่า",
      "เท่าเดิมไม่เปลี่ยนแปลง"
    ],
    answer: "เพิ่มขึ้นเป็น 2 เท่า",
    explanation: "ความถี่ \\(f = \\frac{1}{2\\pi}\\sqrt{\\frac{g}{L}}\\) ดังนั้น \\(f \\propto \\frac{1}{\\sqrt{L}}\\) เมื่อ \\(L\\) ลดลงเหลือ \\(1/4\\) ความถี่จะเพิ่มขึ้นเป็น \\(\\frac{1}{\\sqrt{1/4}} = 2\\) เท่า",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 4,
    type: "question",
    question: "เฟสเริ่มต้น (Initial Phase) ของการเคลื่อนที่แบบ SHM บอกให้เราทราบถึงสิ่งใด",
    options: [
      "ความถี่ของการสั่น",
      "แอมพลิจูดของการสั่น",
      "ตำแหน่งและความเร็วเริ่มต้น",
      "พลังงานรวมของระบบ"
    ],
    answer: "ตำแหน่งและความเร็วเริ่มต้น",
    explanation: "เฟสเริ่มต้น (\\(\\phi\\)) ในสมการ \\(x = A\\cos(\\omega t + \\phi)\\) บอกสถานะเริ่มต้น (ที่ \\(t=0\\)) ว่าวัตถุอยู่ที่ตำแหน่งใดและกำลังเคลื่อนที่ไปทางทิศใด",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 5,
    type: "question",
    question: "เมื่อวัตถุเคลื่อนที่แบบ SHM ผ่านตำแหน่งสมดุล แรงลัพธ์ที่กระทำต่อวัตถุมีค่าเป็นเท่าใด",
    options: [
      "มีค่าสูงสุด",
      "มีค่าเป็นศูนย์",
      "มีค่าเท่ากับน้ำหนักวัตถุ",
      "มีค่าคงที่ตลอดการเคลื่อนที่"
    ],
    answer: "มีค่าเป็นศูนย์",
    explanation: "ที่ตำแหน่งสมดุล (\\(x=0\\)) แรงดึงกลับ \\(F = -kx\\) จะมีค่าเป็นศูนย์ (แต่ความเร็วจะมีค่าสูงสุด)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 6,
    type: "question",
    question: "ถ้าต้องการให้คาบการสั่นของมวลติดสปริงเพิ่มขึ้นเป็น 3 เท่า จะต้องเปลี่ยนมวลเป็นกี่เท่าของเดิม",
    options: [
      "3 เท่า",
      "6 เท่า",
      "9 เท่า",
      "\\(\\sqrt{3}\\) เท่า"
    ],
    answer: "9 เท่า",
    explanation: "คาบ \\(T = 2\\pi\\sqrt{\\frac{m}{k}}\\) ดังนั้น \\(T \\propto \\sqrt{m}\\) หรือ \\(m \\propto T^2\\) ถ้าต้องการให้ \\(T\\) เพิ่ม 3 เท่า มวลต้องเพิ่มเป็น \\(3^2 = 9\\) เท่า",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 7,
    type: "question",
    question: "ในการแกว่งของลูกตุ้มนาฬิกา แรงดึงเชือกจะมีค่าสูงสุดที่ตำแหน่งใด",
    options: [
      "ตำแหน่งสูงสุดของการแกว่ง",
      "ตำแหน่งต่ำสุด (สมดุล)",
      "ตำแหน่งกึ่งกลางความสูง",
      "เท่ากันทุกตำแหน่ง"
    ],
    answer: "ตำแหน่งต่ำสุด (สมดุล)",
    explanation: "ที่ตำแหน่งต่ำสุด แรงตึงเชือกต้องรับน้ำหนักวัตถุและทำหน้าที่เป็นแรงสู่ศูนย์กลาง (\\(T = mg + mv^2/L\\)) ซึ่งความเร็วสูงสุดที่จุดนี้ ทำให้แรงตึงเชือกมากที่สุด",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 8,
    type: "question",
    question: "ถ้าโลกหมุนรอบตัวเองเร็วขึ้นจนน้ำหนักปรากฏของวัตถุที่เส้นศูนย์สูตรเป็นศูนย์ คาบการหมุนของโลกจะเป็นเท่าใด (ในแง่ของ \\(R\\) และ \\(g\\))",
    options: [
      "\\(2\\pi\\sqrt{R/g}\\)",
      "\\(2\\pi\\sqrt{g/R}\\)",
      "\\(\\sqrt{R/g}\\)",
      "\\(\\sqrt{g/R}\\)"
    ],
    answer: "\\(2\\pi\\sqrt{R/g}\\)",
    explanation: "เมื่อน้ำหนักปรากฏเป็นศูนย์ แรงโน้มถ่วงทำหน้าที่เป็นแรงสู่ศูนย์กลางพอดี \\(mg = m\\omega^2 R\\) จะได้ \\(\\omega = \\sqrt{g/R}\\) และ \\(T = 2\\pi/\\omega = 2\\pi\\sqrt{R/g}\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 9,
    type: "question",
    question: "การสั่นพ้อง (Resonance) จะเกิดขึ้นรุนแรงที่สุดเมื่อใด",
    options: [
      "แรงภายนอกมีความถี่เท่ากับความถี่ธรรมชาติ",
      "แรงภายนอกมีแอมพลิจูดมากที่สุด",
      "วัตถุมีมวลน้อยที่สุด",
      "ไม่มีแรงต้านทานอากาศเลย"
    ],
    answer: "แรงภายนอกมีความถี่เท่ากับความถี่ธรรมชาติ",
    explanation: "การสั่นพ้องเกิดเมื่อความถี่ของแรงกระตุ้นภายนอกตรงกับความถี่ธรรมชาติของระบบ ทำให้ระบบรับพลังงานได้ดีที่สุดและสั่นด้วยแอมพลิจูดสูงสุด",
    subCategory: { main: MAIN_CATEGORY, specific: LO_2 }
  },
  {
    number: 10,
    type: "question",
    question: "กราฟระหว่างพลังงานศักย์ (\\(E_p\\)) กับการกระจัด (\\(x\\)) ของ SHM เป็นรูปอะไร",
    options: [
      "เส้นตรงผ่านจุดกำเนิด",
      "พาราโบลาหงาย",
      "พาราโบลาคว่ำ",
      "วงรี"
    ],
    answer: "พาราโบลาหงาย",
    explanation: "พลังงานศักย์ \\(E_p = \\frac{1}{2}kx^2\\) ซึ่งเป็นสมการพาราโบลาหงายที่มีจุดยอดอยู่ที่จุดกำเนิด (\\(x=0, E_p=0\\))",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },

  // --- Calculation Questions ---
  {
    number: 11,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM ด้วยความถี่ 2 Hz และมีแอมพลิจูด 5 cm จงหาความเร็วสูงสุด (ตอบเป็นทศนิยม 1 ตำแหน่งในหน่วย cm/s โดยให้ \\(\\pi \\approx 3.14\\))",
    answer: 62.8,
    unit: "cm/s",
    tolerance: 0.1,
    hint: "\\(v_{max} = \\omega A = 2\\pi f A\\)",
    explanation: "จากสูตร \\(v_{max} = 2\\pi f A\\). แทนค่า \\(v_{max} = 2\\pi(2)(5) = 20\\pi \\approx 20(3.14) = 62.8\\) cm/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 12,
    type: "fill-in-number",
    question: "สปริงตัวหนึ่งยืดออก 10 cm เมื่อแขวนมวล 2 kg ถ้าดึงมวลลงมาอีกเล็กน้อยแล้วปล่อย คาบการสั่นจะเป็นเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14, g=10\\))",
    answer: 0.63,
    unit: "s",
    tolerance: 0.01,
    hint: "หา \\(k\\) จาก \\(mg = kx\\) ก่อน แล้วหา \\(T\\)",
    explanation: "หาค่า k จาก \\(k = mg/x\\). แทนค่า \\(k = 2(10)/0.1 = 200\\) N/m. หาคาบจาก \\(T = 2\\pi\\sqrt{m/k}\\). แทนค่า \\(T = 2(3.14)\\sqrt{2/200} = 6.28(0.1) = 0.628 \\approx 0.63\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 13,
    type: "fill-in-number",
    question: "ลูกตุ้มยาว 1 เมตร แกว่งบนโลก (g=10) จะมีคาบการแกว่งกี่วินาที (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.16\\))",
    answer: 2.00,
    unit: "s",
    tolerance: 0.05,
    hint: "\\(T = 2\\pi\\sqrt{L/g}\\)",
    explanation: "จากสูตร \\(T = 2\\pi\\sqrt{L/g}\\). แทนค่า \\(T = 2(3.16)\\sqrt{1/10} = 6.32(0.316) \\approx 1.997 \\approx 2.00\\) s (หรือใช้ \\(\\pi^2 \\approx g\\) จะได้ \\(T \\approx 2\\) s พอดี)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 14,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีสมการ \\(x = 4\\cos(10t)\\) (cm) จงหาขนาดความเร่งสูงสุด (ตอบเป็นจำนวนเต็มในหน่วย cm/s²)",
    answer: 400,
    unit: "cm/s²",
    hint: "\\(a_{max} = \\omega^2 A\\)",
    explanation: "จากสมการ \\(x = 4\\cos(10t)\\) จะได้ \\(\\omega = 10\\) rad/s และ \\(A = 4\\) cm. จากสูตร \\(a_{max} = \\omega^2 A\\). แทนค่า \\(a_{max} = (10)^2(4) = 100(4) = 400\\) cm/s²",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 15,
    type: "fill-in-number",
    question: "พลังงานกลรวมของวัตถุติดสปริงเป็น 0.5 J ถ้าค่าคงที่สปริงคือ 100 N/m แอมพลิจูดของการสั่นเป็นกี่เซนติเมตร (ตอบเป็นจำนวนเต็ม)",
    answer: 10,
    unit: "cm",
    hint: "\\(E = \\frac{1}{2}kA^2\\)",
    explanation: "จากสูตร \\(E = \\frac{1}{2}kA^2\\). แทนค่า \\(0.5 = \\frac{1}{2}(100)A^2 \\Rightarrow 1 = 100A^2 \\Rightarrow A^2 = 0.01 \\Rightarrow A = 0.1\\) m = 10 cm",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 16,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM ด้วยคาบ 4 วินาที เวลาที่น้อยที่สุดที่วัตถุใช้ในการเคลื่อนที่จากตำแหน่งสมดุลไปถึงตำแหน่งที่มีการกระจัดเป็นครึ่งหนึ่งของแอมพลิจูดคือเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่ง)",
    answer: 0.33,
    unit: "s",
    tolerance: 0.01,
    hint: "ใช้สมการ \\(x = A\\sin(\\frac{2\\pi}{T}t)\\) แทนค่า \\(x=A/2\\)",
    explanation: "จากสมการ \\(x = A\\sin(\\frac{2\\pi}{T}t)\\). แทนค่า \\(x=A/2\\) และ \\(T=4\\) จะได้ \\(A/2 = A\\sin(\\frac{2\\pi}{4}t) \\Rightarrow 0.5 = \\sin(\\frac{\\pi}{2}t)\\). มุมคือ \\(\\pi/6\\). ดังนั้น \\(\\frac{\\pi}{2}t = \\frac{\\pi}{6} \\Rightarrow t = 1/3 \\approx 0.33\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 17,
    type: "fill-in-number",
    question: "สปริงตัวหนึ่งเมื่อแขวนมวล 4 kg จะสั่นด้วยความถี่ 2 Hz ถ้าต้องการให้สั่นด้วยความถี่ 4 Hz ต้องเปลี่ยนมวลเป็นกี่กิโลกรัม (ตอบเป็นจำนวนเต็ม)",
    answer: 1,
    unit: "kg",
    hint: "\\(f \\propto 1/\\sqrt{m}\\) หรือ \\(f_1/f_2 = \\sqrt{m_2/m_1}\\)",
    explanation: "จาก \\(f_1/f_2 = \\sqrt{m_2/m_1}\\). แทนค่า \\(2/4 = \\sqrt{m_2/4} \\Rightarrow 1/2 = \\sqrt{m_2}/2 \\Rightarrow 1 = \\sqrt{m_2} \\Rightarrow m_2 = 1\\) kg",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 18,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีความเร็วสูงสุด 10 m/s และความเร่งสูงสุด 40 m/s² ความถี่เชิงมุมของการเคลื่อนที่นี้เป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย rad/s)",
    answer: 4,
    unit: "rad/s",
    hint: "\\(v_{max} = \\omega A\\) และ \\(a_{max} = \\omega^2 A\\) นำมาหารกัน",
    explanation: "จาก \\(a_{max}/v_{max} = (\\omega^2 A)/(\\omega A) = \\omega\\). แทนค่า \\(\\omega = 40/10 = 4\\) rad/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 19,
    type: "fill-in-number",
    question: "ลูกตุ้มนาฬิกาแกว่งด้วยคาบ 2 วินาที บนโลก (g=10) ถ้านำไปแกว่งบนดาวเคราะห์ที่มี g=2.5 m/s² คาบจะเป็นกี่วินาที (ตอบเป็นจำนวนเต็ม)",
    answer: 4,
    unit: "s",
    hint: "\\(T \\propto 1/\\sqrt{g}\\)",
    explanation: "จาก \\(T \\propto 1/\\sqrt{g}\\) จะได้ \\(T_2/T_1 = \\sqrt{g_1/g_2}\\). แทนค่า \\(T_2/2 = \\sqrt{10/2.5} = \\sqrt{4} = 2\\). ดังนั้น \\(T_2 = 2(2) = 4\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 20,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีแอมพลิจูด 10 cm ที่ตำแหน่ง x = 6 cm ความเร็วของวัตถุจะเป็นกี่เท่าของความเร็วสูงสุด (ตอบเป็นทศนิยม 1 ตำแหน่ง)",
    answer: 0.8,
    unit: "เท่า",
    hint: "\\(v = \\omega\\sqrt{A^2-x^2}\\) และ \\(v_{max} = \\omega A\\)",
    explanation: "จาก \\(v/v_{max} = \\frac{\\omega\\sqrt{A^2-x^2}}{\\omega A} = \\sqrt{1 - (x/A)^2}\\). แทนค่า \\(v/v_{max} = \\sqrt{1 - (6/10)^2} = \\sqrt{1 - 0.36} = \\sqrt{0.64} = 0.8\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 21,
    type: "fill-in-number",
    question: "สปริงสองตัวต่ออนุกรมกัน มีค่าคงที่ 100 N/m และ 100 N/m แขวนมวล 2 kg คาบการสั่นจะเป็นเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14\\))",
    answer: 1.26,
    unit: "s",
    tolerance: 0.02,
    hint: "หา \\(k_{eq}\\) แบบอนุกรมก่อน (\\(1/k_{eq} = 1/k_1 + 1/k_2\\))",
    explanation: "หาค่า k รวมแบบอนุกรม: \\(1/k_{eq} = 1/100 + 1/100 = 2/100 \\Rightarrow k_{eq} = 50\\) N/m. หาคาบจาก \\(T = 2\\pi\\sqrt{m/k_{eq}}\\). แทนค่า \\(T = 2(3.14)\\sqrt{2/50} = 2(3.14)\\sqrt{0.04} = 6.28(0.2) = 1.256 \\approx 1.26\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 22,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีพลังงานจลน์เป็น 3 เท่าของพลังงานศักย์ที่ตำแหน่งใด (ตอบในรูปเศษส่วนของ A เช่น 0.5)",
    answer: 0.5,
    unit: "A",
    hint: "\\(E_k = 3E_p \\Rightarrow E_{total} = 4E_p\\)",
    explanation: "จาก \\(E_{total} = E_k + E_p = 3E_p + E_p = 4E_p\\). แทนค่า \\(\\frac{1}{2}kA^2 = 4(\\frac{1}{2}kx^2) \\Rightarrow A^2 = 4x^2 \\Rightarrow x = A/2 = 0.5A\\)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 23,
    type: "fill-in-number",
    question: "ลูกตุ้มนาฬิกาแกว่งทำมุมกว้าง 60 องศา (แอมพลิจูดเชิงมุม) ความเร็วที่จุดต่ำสุดจะเป็นกี่ m/s ถ้าเชือกยาว 1 m (g=10) (ตอบเป็นทศนิยม 2 ตำแหน่ง)",
    answer: 3.16,
    unit: "m/s",
    tolerance: 0.1,
    hint: "ใช้กฎอนุรักษ์พลังงาน \\(mgh = \\frac{1}{2}mv^2\\) โดย \\(h = L(1-\\cos\\theta)\\)",
    explanation: "หาความสูง h จาก \\(h = L(1-\\cos\\theta) = 1(1-\\cos60) = 1(0.5) = 0.5\\) m. หาความเร็วจาก \\(v = \\sqrt{2gh}\\). แทนค่า \\(v = \\sqrt{2(10)(0.5)} = \\sqrt{10} \\approx 3.16\\) m/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 24,
    type: "fill-in-number",
    question: "วัตถุสั่น 240 รอบใน 1 นาที ความถี่เชิงมุมเป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย rad/s โดยให้ \\(\\pi \\approx 3\\))",
    answer: 24,
    unit: "rad/s",
    hint: "หา \\(f\\) ก่อน (รอบ/วินาที)",
    explanation: "หาความถี่ \\(f = 240/60 = 4\\) Hz. หาความถี่เชิงมุม \\(\\omega = 2\\pi f\\). แทนค่า \\(\\omega = 2(3)(4) = 24\\) rad/s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 25,
    type: "fill-in-number",
    question: "ถ้าสมการความเร่งคือ \\(a = -16x\\) คาบการเคลื่อนที่คือเท่าใด (ตอบเป็นทศนิยม 2 ตำแหน่ง โดยให้ \\(\\pi \\approx 3.14\\))",
    answer: 1.57,
    unit: "s",
    tolerance: 0.01,
    hint: "เทียบกับ \\(a = -\\omega^2 x\\)",
    explanation: "จากสมการ \\(a = -\\omega^2 x\\) เทียบกับ \\(a = -16x\\) จะได้ \\(\\omega^2 = 16 \\Rightarrow \\omega = 4\\) rad/s. หาคาบจาก \\(T = 2\\pi/\\omega\\). แทนค่า \\(T = 2(3.14)/4 = 1.57\\) s",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 26,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีแอมพลิจูด 10 cm ความเร็วสูงสุด 20 cm/s ความเร่งสูงสุดเป็นเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย cm/s²)",
    answer: 40,
    unit: "cm/s²",
    hint: "\\(v_{max} = \\omega A\\), \\(a_{max} = \\omega^2 A = \\omega v_{max}\\)",
    explanation: "หา \\(\\omega\\) จาก \\(v_{max} = \\omega A \\Rightarrow \\omega = 20/10 = 2\\) rad/s. หา \\(a_{max}\\) จาก \\(a_{max} = \\omega v_{max}\\). แทนค่า \\(a_{max} = (2)(20) = 40\\) cm/s²",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 27,
    type: "fill-in-number",
    question: "สปริงถูกตัดออกเป็น 3 ส่วนเท่าๆ กัน ค่าคงที่สปริงของแต่ละส่วนจะเป็นกี่เท่าของสปริงเดิม (ตอบเป็นจำนวนเต็ม)",
    answer: 3,
    unit: "เท่า",
    hint: "\\(k \\propto 1/L\\)",
    explanation: "ค่าคงที่สปริงแปรผกผันกับความยาว (\\(k \\propto 1/L\\)). เมื่อความยาวลดลง 3 เท่า (เหลือ L/3) ค่า k จะเพิ่มขึ้นเป็น 3 เท่า",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 28,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM ครบ 10 รอบ ใช้เวลา 20 วินาที ความถี่เป็นกี่ Hz (ตอบเป็นทศนิยม 1 ตำแหน่ง)",
    answer: 0.5,
    unit: "Hz",
    hint: "\\(f = N/t\\)",
    explanation: "จากสูตรความถี่ \\(f = \\frac{\\text{จำนวนรอบ}}{\\text{เวลา}}\\). แทนค่า \\(f = 10/20 = 0.5\\) Hz",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 29,
    type: "fill-in-number",
    question: "ลูกตุ้มนาฬิกาแกว่งด้วยแอมพลิจูดเล็กๆ ถ้าเพิ่มแอมพลิจูดเป็น 2 เท่า (ยังคงเล็กอยู่) คาบการแกว่งจะเปลี่ยนไปกี่เท่า (ตอบเป็นจำนวนเต็ม)",
    answer: 1,
    unit: "เท่า",
    hint: "คาบของลูกตุ้มอย่างง่ายขึ้นอยู่กับแอมพลิจูดหรือไม่ (สำหรับมุมเล็กๆ)?",
    explanation: "คาบ \\(T = 2\\pi\\sqrt{L/g}\\) ไม่ขึ้นกับแอมพลิจูด (สำหรับมุมเล็กๆ) ดังนั้นคาบเท่าเดิม (1 เท่า)",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  },
  {
    number: 30,
    type: "fill-in-number",
    question: "วัตถุเคลื่อนที่แบบ SHM มีพลังงานกลรวม 50 J ที่ตำแหน่งสมดุล พลังงานจลน์มีค่าเท่าใด (ตอบเป็นจำนวนเต็มในหน่วย J)",
    answer: 50,
    unit: "J",
    hint: "ที่สมดุล พลังงานศักย์เป็นศูนย์",
    explanation: "พลังงานกลรวม \\(E_{total} = E_k + E_p\\). ที่ตำแหน่งสมดุล \\(E_p = 0\\). ดังนั้น \\(E_k = E_{total} = 50\\) J",
    subCategory: { main: MAIN_CATEGORY, specific: LO_1 }
  }
];