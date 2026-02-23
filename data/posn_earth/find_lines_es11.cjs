const fs = require('fs');

const data = fs.readFileSync('ES10-data.js', 'utf8');
const lines = data.split('\n');

const questions = [
  'Q13', 'Q36', 'Q38', 'Q47', 'Q54', 'Q57', 'Q58', 'Q61', 'Q62', 'Q75', 'Q94', 'Q102', 'Q107', 'Q108', 'Q110', 'Q112', 'Q113', 'Q114', 'Q115'
];

let currentIndex = 0;
let results = {};

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('number: ')) {
    const idMatch = lines[i].match(/number: (\d+),/);
    if (idMatch) {
      const qId = 'Q' + idMatch[1];
      if (questions.includes(qId)) {
        console.log(`${qId} starts around line ${i + 1}`);
      }
    }
  }
}
