import fs from 'fs';

// 1. ess_adv_m6_ch14-3-data.js Q6
import { quizItems as ch14_3 } from '../data/ess_adv/ess_adv_m6_ch14-3-data.js';
const q14_3_6 = ch14_3.find(q => q.number === 6);
if (q14_3_6) {
  q14_3_6.options = [
    "ดาว B ตั้งอยู่ ณ ระยะทางที่ไกลจากโลกมากกว่าดาว A",
    "ดาว A ตั้งอยู่ ณ ระยะทางที่ไกลจากโลกมากกว่าดาว B",
    "ดาวทั้งสองดวงตั้งอยู่ ณ ระยะทางเท่ากันจากโลก",
    "ไม่สามารถสรุปเกี่ยวกับระยะทางได้จากข้อมูลโชติมาตร"
  ];
  q14_3_6.answer = "ดาว B ตั้งอยู่ ณ ระยะทางที่ไกลจากโลกมากกว่าดาว A";
}
fs.writeFileSync('data/ess_adv/ess_adv_m6_ch14-3-data.js', `export const quizItems = ` + JSON.stringify(ch14_3, null, 2) + `;\n`);

// 2. ess_adv_m6_ch14-4-data.js Q5
import { quizItems as ch14_4 } from '../data/ess_adv/ess_adv_m6_ch14-4-data.js';
const q14_4_5 = ch14_4.find(q => q.number === 5);
if (q14_4_5) {
  q14_4_5.options = [
    "ดาวประเภท O แผ่รังสีเข้มที่สุดในความยาวคลื่นสั้นกว่าดาวประเภท M",
    "ดาวประเภท M แผ่รังสีเข้มที่สุดในความยาวคลื่นสั้นกว่าดาวประเภท O",
    "ดาวทั้งสองประเภทแผ่รังสีเข้มที่สุด ณ ความยาวคลื่นเท่ากัน",
    "ดาวประเภท O มีความยาวคลื่นยอดแผ่รังสีอยู่ในช่วงคลื่นวิทยุเท่านั้น"
  ];
  q14_4_5.answer = "ดาวประเภท O แผ่รังสีเข้มที่สุดในความยาวคลื่นสั้นกว่าดาวประเภท M";
}
fs.writeFileSync('data/ess_adv/ess_adv_m6_ch14-4-data.js', `export const quizItems = ` + JSON.stringify(ch14_4, null, 2) + `;\n`);

// 3. phy_m4_ch4-5-data.js Q8
import { quizItems as phy_ch4_5 } from '../data/phy_m4/phy_m4_ch4-5-data.js';
const qphy4_5_8 = phy_ch4_5.find(q => q.number === 8);
if (qphy4_5_8) {
  qphy4_5_8.options = [
    "$\\Sigma F = 0$ เท่านั้น",
    "$\\Sigma \\tau = 0$ เท่านั้น",
    "$\\Sigma F = 0$ และ $\\Sigma \\tau = 0$",
    "วัตถุไม่มีพลังงานจลน์"
  ];
  qphy4_5_8.answer = "$\\Sigma F = 0$ และ $\\Sigma \\tau = 0$";
}
fs.writeFileSync('data/phy_m4/phy_m4_ch4-5-data.js', `export const quizItems = ` + JSON.stringify(phy_ch4_5, null, 2) + `;\n`);

// 4. phy_m4_ch7-4-data.js Q5
import { quizItems as phy_ch7_4 } from '../data/phy_m4/phy_m4_ch7-4-data.js';
const qphy7_4_5 = phy_ch7_4.find(q => q.number === 5);
if (qphy7_4_5) {
  qphy7_4_5.options = [
    "$t_{up} = t_{down}$",
    "$t_{up} > t_{down}$",
    "$t_{up} < t_{down}$",
    "ขึ้นอยู่กับมุมยิง"
  ];
  qphy7_4_5.answer = "$t_{up} = t_{down}$";
}
fs.writeFileSync('data/phy_m4/phy_m4_ch7-4-data.js', `export const quizItems = ` + JSON.stringify(phy_ch7_4, null, 2) + `;\n`);

// 5. phy_m5_final-exam-1-data.js Q7
import { quizItems as phy5_final1 } from '../data/phy_m5/phy_m5_final-exam-1-data.js';
const qphy5_f1_7 = phy5_final1.find(q => q.number === 7);
if (qphy5_f1_7) {
  qphy5_f1_7.options = [
    "7 เท่า",
    "120 เท่า",
    "$10^{12}$ เท่า",
    "$10^{6}$ เท่า"
  ];
  qphy5_f1_7.answer = "$10^{12}$ เท่า";
}
fs.writeFileSync('data/phy_m5/phy_m5_final-exam-1-data.js', `export const quizItems = ` + JSON.stringify(phy5_final1, null, 2) + `;\n`);

// 6. Astro5-data.js Q9
import { quizItems as astro5 } from '../data/posn_astro/Astro5-data.js';
const qastro5_9 = astro5.find(q => q.number === 9);
if (qastro5_9) {
  qastro5_9.options = [
    "$1.9 \\times 10^{27}\\text{ kg}$",
    "$19 \\times 10^{26}\\text{ kg}$",
    "$0.19 \\times 10^{28}\\text{ kg}$",
    "1.9E27 kg"
  ];
  qastro5_9.answer = "$1.9 \\times 10^{27}\\text{ kg}$";
}
fs.writeFileSync('data/posn_astro/Astro5-data.js', `export const quizItems = ` + JSON.stringify(astro5, null, 2) + `;\n`);

// 7. junior2-data.js Q11
import { quizItems as j2 } from '../data/posn_astro/junior2-data.js';
const qj2_11 = j2.find(q => q.number === 11);
if (qj2_11) {
  qj2_11.options = [
    "1/2",
    "$\\sqrt{3}/2$",
    "1",
    "2"
  ];
  qj2_11.answer = "1/2";
}
fs.writeFileSync('data/posn_astro/junior2-data.js', `export const quizItems = ` + JSON.stringify(j2, null, 2) + `;\n`);

// 8. junior2568-data.js Q25
import { quizItems as j2568 } from '../data/posn_astro/junior2568-data.js';
const qj2568_25 = j2568.find(q => q.number === 25);
if (qj2568_25) {
  qj2568_25.options = [
    "หยุดนิ่ง",
    "$v/3$",
    "$v/2$",
    "ไม่มีข้อใดถูก"
  ];
  qj2568_25.answer = "$v/3$";
}
fs.writeFileSync('data/posn_astro/junior2568-data.js', `export const quizItems = ` + JSON.stringify(j2568, null, 2) + `;\n`);

// 9. senior2568-data.js Q26
import { quizItems as s2568 } from '../data/posn_astro/senior2568-data.js';
const qs2568_26 = s2568.find(q => q.number === 26);
if (qs2568_26) {
  qs2568_26.options = [
    "วัตถุทั้งสองหยุดนิ่ง",
    "วัตถุทั้งสองเคลื่อนที่รวมกันด้วยความเร็ว $v/3$",
    "วัตถุทั้งสองเคลื่อนที่รวมกันด้วยความเร็ว $v/2$",
    "วัตถุทั้งสองเคลื่อนที่รวมกันด้วยความเร็ว $v/4$"
  ];
  qs2568_26.answer = "วัตถุทั้งสองเคลื่อนที่รวมกันด้วยความเร็ว $v/3$";
}
fs.writeFileSync('data/posn_astro/senior2568-data.js', `export const quizItems = ` + JSON.stringify(s2568, null, 2) + `;\n`);

// 10. ES9-data.js Q40
import { quizItems as es9 } from '../data/posn_earth/ES9-data.js';
const qes9_40 = es9.find(q => q.number === 40);
if (qes9_40) {
  qes9_40.options = [
    "$\\Delta V = (m/M)v$",
    "$\\Delta V = (M/m)v$",
    "$\\Delta V = mv$",
    "$\\Delta V = v^2$"
  ];
  qes9_40.answer = "$\\Delta V = (m/M)v$";
}
fs.writeFileSync('data/posn_earth/ES9-data.js', `export const quizItems = ` + JSON.stringify(es9, null, 2) + `;\n`);

// 11. senior7-data.js Q92
import { quizItems as s7 } from '../data/posn_astro/senior7-data.js';
function fixS7(items) {
  items.forEach(item => {
    if (item.number === 92) {
      item.options = [
        "เพราะตำแหน่งของขั้วฟ้าเหนือและเส้นขอบฟ้าขึ้นอยู่กับละติจูดของผู้สังเกต",
        "เพราะมุมชั่วโมงของวัตถุ ซึ่งจำเป็นต่อการคำนวณ ขึ้นอยู่กับเวลาท้องถิ่น",
        "เพราะการหักเหของแสงในบรรยากาศขึ้นอยู่กับละติจูดและเวลา"
      ];
      item.answer = [
        "เพราะตำแหน่งของขั้วฟ้าเหนือและเส้นขอบฟ้าขึ้นอยู่กับละติจูดของผู้สังเกต",
        "เพราะมุมชั่วโมงของวัตถุ ซึ่งจำเป็นต่อการคำนวณ ขึ้นอยู่กับเวลาท้องถิ่น"
      ];
    }
    if (item.questions) fixS7(item.questions);
  });
}
fixS7(s7);
fs.writeFileSync('data/posn_astro/senior7-data.js', `export const quizItems = ` + JSON.stringify(s7, null, 2) + `;\n`);

console.log('Fixed all 11 specific items!');
