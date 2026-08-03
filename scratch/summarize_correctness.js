import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/correctness_report.json', 'utf8'));

console.log(`Total flagged items: ${report.length}\n`);

const byType = {};
report.forEach(item => {
  byType[item.type] = (byType[item.type] || 0) + 1;
});

console.log('Issues by type:', byType);

console.log('\n================ SAMPLE OPTION INDEX CONTRADICTIONS ================');
const optionContradictions = report.filter(r => r.type === 'OPTION_INDEX_CONTRADICTION');
optionContradictions.slice(0, 15).forEach((item, idx) => {
  console.log(`\n[${idx + 1}] File: ${item.file} | Q${item.qNum}`);
  console.log(`    Issue: ${item.issue}`);
  console.log(`    Question: ${item.question}`);
  console.log(`    Answer: ${item.answer}`);
  console.log(`    Explanation: ${item.explanation}`);
});

console.log('\n================ SAMPLE NUMERICAL MISMATCHES ================');
const numMismatches = report.filter(r => r.type === 'NUMERICAL_MISMATCH');
numMismatches.slice(0, 15).forEach((item, idx) => {
  console.log(`\n[${idx + 1}] File: ${item.file} | Q${item.qNum}`);
  console.log(`    Issue: ${item.issue}`);
  console.log(`    Question: ${item.question}`);
  console.log(`    Answer: ${item.answer}`);
  console.log(`    Explanation: ${item.explanation}`);
});

console.log('\n================ SAMPLE DIRECTION CONTRADICTIONS ================');
const dirMismatches = report.filter(r => r.type === 'DIRECTION_CONTRADICTION');
dirMismatches.slice(0, 15).forEach((item, idx) => {
  console.log(`\n[${idx + 1}] File: ${item.file} | Q${item.qNum}`);
  console.log(`    Issue: ${item.issue}`);
  console.log(`    Question: ${item.question}`);
  console.log(`    Answer: ${item.answer}`);
  console.log(`    Explanation: ${item.explanation}`);
});
