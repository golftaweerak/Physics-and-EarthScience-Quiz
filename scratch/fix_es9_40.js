import fs from 'fs';
import { quizItems as es9 } from '../data/posn_earth/ES9-data.js';

const q40 = es9.find(q => q.number === 40);
if (q40) {
  q40.options = [
    "\\Delta V = \\frac{m}{M}v",
    "\\Delta V = \\frac{M}{m}v",
    "\\Delta V = mv",
    "\\Delta V = v^2"
  ];
  q40.answer = "\\Delta V = \\frac{m}{M}v";
}
fs.writeFileSync('data/posn_earth/ES9-data.js', `export const quizItems = ` + JSON.stringify(es9, null, 2) + `;\n`);
console.log('Fixed ES9 Q40 formatting!');
