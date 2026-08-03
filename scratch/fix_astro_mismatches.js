import fs from 'fs';
import { quizItems as j2 } from '../data/posn_astro/junior2-data.js';
import { quizItems as s1 } from '../data/posn_astro/senior1-data.js';
import { quizItems as s2 } from '../data/posn_astro/senior2-data.js';

// Junior2 Q54: "\(x = 12\)" vs "$x = 12$"
const q54 = j2.find(q => q.number === 54);
if (q54) {
  q54.answer = "$x = 12$";
}
fs.writeFileSync('data/posn_astro/junior2-data.js', `export const quizItems = ` + JSON.stringify(j2, null, 2) + `;\n`);

// Senior1 Q75 & Q76
const q75 = s1.find(q => q.number === 75);
if (q75) {
  q75.answer = "ฤดูกาลจะยาวนานมาก โดยแต่ละฤดูยาวนานหลายปี";
}
const q76 = s1.find(q => q.number === 76);
if (q76) {
  q76.answer = "Core Accretion เกิดช้ากว่า แต่ Gravitational Instability เกิดเร็วกว่า";
}
fs.writeFileSync('data/posn_astro/senior1-data.js', `export const quizItems = ` + JSON.stringify(s1, null, 2) + `;\n`);

// Senior2 Q40
const q40 = s2.find(q => q.number === 40);
if (q40) {
  q40.answer = "ดาว A เป็นดาวฤกษ์ที่มีอายุน้อยกว่าดาว B";
}
fs.writeFileSync('data/posn_astro/senior2-data.js', `export const quizItems = ` + JSON.stringify(s2, null, 2) + `;\n`);

console.log('Fixed all remaining Astro mismatches!');
