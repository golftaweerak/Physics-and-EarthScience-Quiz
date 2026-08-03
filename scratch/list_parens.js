import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/all_quizzes_report.json', 'utf8'));

let count = 0;
for (const [filePath, issues] of Object.entries(report)) {
  const parens = issues.filter(i => i.type === 'PAREN_INCONSISTENCY');
  if (parens.length > 0) {
    console.log(`📄 ${filePath} (${parens.length} paren issues)`);
    count += parens.length;
  }
}

console.log(`Total paren issues across all files: ${count}`);
