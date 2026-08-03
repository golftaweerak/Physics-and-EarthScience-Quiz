import fs from 'fs';
import { quizItems } from '../data/phy_m4/phy_m4_ch3-5-data.js';

const q2 = quizItems.find(q => q.number === 2);
if (q2) {
  q2.answer = "เกิดจากความเฉื่อยของผู้โดยสารที่พยายามรักษาสภาพการเคลื่อนที่เดิมไปข้างหน้า";
}

fs.writeFileSync('data/phy_m4/phy_m4_ch3-5-data.js', `export const quizItems = ` + JSON.stringify(quizItems, null, 2) + `;\n`);
console.log('Fixed Q2 in phy_m4_ch3-5-data.js!');
