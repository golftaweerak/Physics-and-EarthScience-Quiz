import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/all_quizzes_report.json', 'utf8'));

console.log('=== FILES WITH ANSWER MISMATCHES ===');

for (const [filePath, issues] of Object.entries(report)) {
  const mismatches = issues.filter(i => i.type === 'ANSWER_MISMATCH');
  if (mismatches.length > 0) {
    console.log(`\n📄 ${filePath} (${mismatches.length} mismatches):`);
    mismatches.forEach(m => console.log(`   Q${m.qNum}: ${m.msg}`));
  }
}
