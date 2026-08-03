import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/correctness_report.json', 'utf8'));
const optionContradictions = report.filter(r => r.type === 'OPTION_INDEX_CONTRADICTION');

console.log(`Checking ${optionContradictions.length} option contradiction candidates...\n`);

optionContradictions.forEach((item, idx) => {
  console.log(`[${idx + 1}] File: ${item.file} | Q${item.qNum}`);
  console.log(`    Question: ${item.question}`);
  console.log(`    Answer: ${item.answer}`);
  console.log(`    Explanation: ${item.explanation}`);
  console.log(`----------------------------------------------------------------`);
});
