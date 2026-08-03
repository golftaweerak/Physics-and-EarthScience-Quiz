import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/correctness_report.json', 'utf8'));

const optionContradictions = report.filter(r => r.type === 'OPTION_INDEX_CONTRADICTION');
console.log(`\n================ OPTION INDEX CONTRADICTIONS (${optionContradictions.length}) ================`);
optionContradictions.forEach((item, idx) => {
  console.log(`\n[${idx + 1}] File: ${item.file} | Q${item.qNum}`);
  console.log(`    Issue: ${item.issue}`);
  console.log(`    Question: ${item.question}`);
  console.log(`    Answer: ${item.answer}`);
  console.log(`    Explanation: ${item.explanation}`);
});

const numMismatches = report.filter(r => r.type === 'NUMERICAL_MISMATCH');
console.log(`\n================ NUMERICAL MISMATCHES (${numMismatches.length}) ================`);
numMismatches.forEach((item, idx) => {
  console.log(`\n[${idx + 1}] File: ${item.file} | Q${item.qNum}`);
  console.log(`    Issue: ${item.issue}`);
  console.log(`    Question: ${item.question}`);
  console.log(`    Answer: ${item.answer}`);
  console.log(`    Explanation: ${item.explanation}`);
});
