import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/all_quizzes_report.json', 'utf8'));
let output = [];

for (const [filePath, issues] of Object.entries(report)) {
  const mismatches = issues.filter(i => i.type === 'ANSWER_MISMATCH');
  if (mismatches.length > 0) {
    output.push(`========================================`);
    output.push(`FILE: ${filePath} (${mismatches.length} mismatches)`);
    output.push(`========================================`);
    mismatches.forEach(m => output.push(`Q${m.qNum}: ${m.msg}`));
  }
}

fs.writeFileSync('scratch/mismatches_detail.txt', output.join('\n'));
console.log(`Wrote ${output.length} lines of mismatch details.`);
