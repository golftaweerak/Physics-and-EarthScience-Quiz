import fs from 'fs';

import { quizItems as ch3_1 } from '../data/phy_m4/phy_m4_ch3-1-data.js';
import { quizItems as ch3_2 } from '../data/phy_m4/phy_m4_ch3-2-data.js';
import { quizItems as ch3_3 } from '../data/phy_m4/phy_m4_ch3-3-data.js';
import { quizItems as ch3_4 } from '../data/phy_m4/phy_m4_ch3-4-data.js';
import { quizItems as ch3_5 } from '../data/phy_m4/phy_m4_ch3-5-data.js';

function extractQuestions(items, list = []) {
  items.forEach(item => {
    if (item.question) list.push(item.question);
    if (item.questions) extractQuestions(item.questions, list);
  });
  return list;
}

function similarity(s1, s2) {
  const words1 = new Set(s1.split(''));
  const words2 = new Set(s2.split(''));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

const existingSets = [
  { name: 'ch3-1', questions: extractQuestions(ch3_1) },
  { name: 'ch3-2', questions: extractQuestions(ch3_2) },
  { name: 'ch3-3', questions: extractQuestions(ch3_3) },
  { name: 'ch3-4', questions: extractQuestions(ch3_4) }
];

const ch3_5_items = extractQuestions(ch3_5);

console.log('=== STRICT DUPLICATE QUESTION SCAN FOR CH3-5 ===\n');

let duplicateCount = 0;

ch3_5.forEach((q5, idx) => {
  if (!q5.question) return;
  const cleanQ5 = q5.question.replace(/<[^>]*>/g, '').replace(/[\s\(\)\\$]/g, '').toLowerCase();

  existingSets.forEach(set => {
    set.questions.forEach(qOtherStr => {
      const cleanOther = qOtherStr.replace(/<[^>]*>/g, '').replace(/[\s\(\)\\$]/g, '').toLowerCase();

      const sim = similarity(cleanQ5, cleanOther);
      if (cleanQ5 === cleanOther || (sim > 0.85 && Math.abs(cleanQ5.length - cleanOther.length) < 15)) {
        console.log(`⚠️ EXACT / HIGH DUPLICATE FOUND!`);
        console.log(`   Ch3-5 Q${q5.number}: ${q5.question}`);
        console.log(`   Matches ${set.name}: ${qOtherStr}\n`);
        duplicateCount++;
      }
    });
  });
});

if (duplicateCount === 0) {
  console.log('✅ Zero duplicate questions found between ch3-5 and previous sets (ch3-1 to ch3-4)!');
} else {
  console.log(`Found ${duplicateCount} duplicate questions.`);
}
