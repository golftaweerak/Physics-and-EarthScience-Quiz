import fs from 'fs';
import { quizItems } from '../data/phy_m4/phy_m4_ch3-6-data.js';

const q26 = quizItems.find(q => q.number === 26);
if (q26) {
  q26.question = "กล่องมวล m = 10 kg วางบนพื้นระดับที่มีสัมประสิทธิ์ความเสียดทานจลน์ \\(\\mu_k = 0.25\\) ถูกออกแรงกด F = 100 N ทำมุม 37° ลงกับแนวระดับ ดังรูป ความเร่งของกล่องมีค่ากี่ m/s²? (กำหนด \\(g = 10\\) m/s², \\(\\sin 37° = 0.6, \\cos 37° = 0.8\\))<br><br><div class='flex justify-center my-4'><img src='../assets/images/phy_m4_ch3-6_q26.png' alt='แรงผลักกดทำมุมลง' class='max-w-xs'></div>";
  q26.options = [
    "4.0 m/s²",
    "2.5 m/s²",
    "3.0 m/s²",
    "1.5 m/s²"
  ];
  q26.answer = "4.0 m/s²";
  q26.explanation = "1. แตกแรง F: \\(F_x = F\\cos 37° = 100(0.8) = 80\\) N, \\(F_y = F\\sin 37° = 100(0.6) = 60\\) N. <br>2. สมดุลแนวดิ่ง: \\(N = mg + F_y = 10(10) + 60 = 160\\) N. <br>3. แรงเสียดทานจลน์: \\(f_k = \\mu_k N = (0.25)(160) = 40\\) N. <br>4. แนวราบ: \\(\\Sigma F_x = ma \\implies F_x - f_k = ma \\implies 80 - 40 = 10a \\implies 40 = 10a \\implies a = 4.0\\) m/s².";
}

fs.writeFileSync('data/phy_m4/phy_m4_ch3-6-data.js', `export const quizItems = ` + JSON.stringify(quizItems, null, 2) + `;\n`);
console.log('Successfully updated Q26 in phy_m4_ch3-6-data.js!');
