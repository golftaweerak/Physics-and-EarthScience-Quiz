import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/all_quizzes_report.json', 'utf8'));

console.log('=== DUPLICATE OPTIONS DETAILS ===');

for (const [filePath, issues] of Object.entries(report)) {
  const dups = issues.filter(i => i.type === 'DUPLICATE_OPTIONS');
  if (dups.length > 0) {
    console.log(`\n📄 ${filePath}`);
    dups.forEach(d => console.log(`   Q${d.qNum}: ${d.msg}`));
  }
}
