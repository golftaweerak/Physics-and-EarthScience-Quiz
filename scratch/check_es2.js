import { quizItems } from '../data/posn_earth/ES2-data.js';
import fs from 'fs';

let report = [];

quizItems.forEach((q, idx) => {
  const qNum = q.number || (idx + 1);
  let itemReport = {
    number: qNum,
    question: q.question,
    options: q.options,
    answer: q.answer,
    issues: []
  };

  // 1. Answer in options
  if (!q.options.includes(q.answer)) {
    itemReport.issues.push(`Answer mismatch: answer="${q.answer}" is not exactly in options`);
  }

  // 2. Duplicate options
  const uniqueOpts = new Set(q.options);
  if (uniqueOpts.size !== q.options.length) {
    itemReport.issues.push(`Duplicate options in question`);
  }

  // 3. Parentheses consistency - match any parens containing ASCII or English text
  const parenRegex = /\([^)]*[A-Za-z0-9]+[^)]*\)/;
  const parensInOpts = q.options.map(o => parenRegex.test(o));
  const hasSomeParen = parensInOpts.some(Boolean);
  const hasAllParen = parensInOpts.every(Boolean);

  if (hasSomeParen && !hasAllParen) {
    itemReport.issues.push(`Parentheses inconsistency: ${JSON.stringify(parensInOpts)} -> ${JSON.stringify(q.options)}`);
  }

  // 4. Length disparity
  const lengths = q.options.map(o => o.length);
  const minL = Math.min(...lengths);
  const maxL = Math.max(...lengths);
  if (maxL > minL * 2.2 && (maxL - minL) > 20) {
    itemReport.issues.push(`Length disparity: min=${minL}, max=${maxL} (${lengths.join(', ')})`);
  }

  if (itemReport.issues.length > 0) {
    report.push(itemReport);
  }
});

fs.writeFileSync('scratch/es2_report.json', JSON.stringify(report, null, 2));
console.log(`Total questions with potential issues: ${report.length}`);
