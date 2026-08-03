import fs from 'fs';
import { quizItems as es1Items } from '../data/posn_earth/ES1-data.js';
import { quizItems as esr1Items } from '../data/posn_earth/ESr1-data.js';

// Fix ES1 Q10
const q10 = es1Items.find(q => q.number === 10);
if (q10) {
  q10.answer = "การเปลี่ยนแปลงปริมาตรน้ำจากการขยายหรือหดตัวของธารน้ำแข็ง (Glacial volume change)";
}
fs.writeFileSync('data/posn_earth/ES1-data.js', `export const quizItems = ` + JSON.stringify(es1Items, null, 2) + `;\n`);

// Fix ESr1 Q9 & Q24
const q9 = esr1Items.find(q => q.number === 9);
if (q9) {
  q9.answer = "รอยชั้นไม่ต่อเนื่องที่คั่นกลาง เกิดช่วงปลายของมหายุคพาลีโอโซอิก (Paleozoic)";
}
const q24 = esr1Items.find(q => q.number === 24);
if (q24) {
  q24.answer = "เสี่ยงต่อภาวะฝนทิ้งช่วงและภัยแล้งที่รุนแรงกว่าปกติ";
}
fs.writeFileSync('data/posn_earth/ESr1-data.js', `export const quizItems = ` + JSON.stringify(esr1Items, null, 2) + `;\n`);

console.log('Fixed remaining 3 mismatches!');
