import fs from 'fs';
import { quizItems as phy12_2 } from '../data/phy_m5/phy_m5_ch12-2-data.js';

const q22 = phy12_2.find(q => q.number === 22);
if (q22) {
  console.log('Old q22 answer:', q22.answer);
  q22.answer = 10800;
  console.log('Updated q22 answer:', q22.answer);
}

fs.writeFileSync('data/phy_m5/phy_m5_ch12-2-data.js', `export const quizItems = ` + JSON.stringify(phy12_2, null, 2) + `;\n`);
console.log('Successfully updated phy_m5_ch12-2-data.js Q22!');
