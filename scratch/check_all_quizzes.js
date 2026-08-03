import fs from 'fs';
import path from 'path';

function getAllJsFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllJsFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js') && !file.includes('quizzes-list')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const dataDir = path.resolve('data');
const allFiles = getAllJsFiles(dataDir);

let overallReport = {};

async function runCheck() {
  for (const filePath of allFiles) {
    const relPath = path.relative(process.cwd(), filePath);
    try {
      const module = await import('file://' + filePath);
      const quizItems = module.quizItems || module.default || module.questions || module.quizData;

      if (!Array.isArray(quizItems)) {
        continue;
      }

      let fileIssues = [];

      quizItems.forEach((q, idx) => {
        const qNum = q.number || (idx + 1);

        if (!q.options || !Array.isArray(q.options) || q.answer === undefined) {
          return;
        }

        // 1. Answer match (handle string vs array)
        if (Array.isArray(q.answer)) {
          q.answer.forEach(ans => {
            if (!q.options.includes(ans)) {
              fileIssues.push({
                qNum,
                type: 'ANSWER_MISMATCH',
                msg: `Answer item "${ans}" is not in options: ${JSON.stringify(q.options)}`
              });
            }
          });
        } else if (typeof q.answer === 'string') {
          if (!q.options.includes(q.answer)) {
            fileIssues.push({
              qNum,
              type: 'ANSWER_MISMATCH',
              msg: `Answer "${q.answer}" is not in options: ${JSON.stringify(q.options)}`
            });
          }
        }

        // 2. Duplicate options
        const uniqueOpts = new Set(q.options);
        if (uniqueOpts.size !== q.options.length) {
          fileIssues.push({
            qNum,
            type: 'DUPLICATE_OPTIONS',
            msg: `Duplicate options: ${JSON.stringify(q.options)}`
          });
        }

        // 3. Parentheses inconsistency
        const parenRegex = /\([^)]*[A-Za-z0-9]+[^)]*\)/;
        const parensInOpts = q.options.map(o => parenRegex.test(o));
        const hasSomeParen = parensInOpts.some(Boolean);
        const hasAllParen = parensInOpts.every(Boolean);

        if (hasSomeParen && !hasAllParen) {
          fileIssues.push({
            qNum,
            type: 'PAREN_INCONSISTENCY',
            msg: `Parentheses inconsistency: ${JSON.stringify(parensInOpts)} -> ${JSON.stringify(q.options)}`
          });
        }

        // 4. Length disparity
        const lengths = q.options.map(o => o.length);
        const minL = Math.min(...lengths);
        const maxL = Math.max(...lengths);
        if (maxL > minL * 2.5 && (maxL - minL) > 25) {
          fileIssues.push({
            qNum,
            type: 'LENGTH_DISPARITY',
            msg: `Length disparity: min=${minL}, max=${maxL} (${lengths.join(', ')})`
          });
        }
      });

      if (fileIssues.length > 0) {
        overallReport[relPath] = fileIssues;
      }
    } catch (err) {
      console.error(`Error loading ${relPath}: ${err.message}`);
    }
  }

  fs.writeFileSync('scratch/all_quizzes_report.json', JSON.stringify(overallReport, null, 2));

  console.log('\n================ SUMMARY AUDIT REPORT ================');
  const fileKeys = Object.keys(overallReport);
  console.log(`Files with issues: ${fileKeys.length} / ${allFiles.length}\n`);

  fileKeys.forEach(f => {
    const issues = overallReport[f];
    const answerMismatchCount = issues.filter(i => i.type === 'ANSWER_MISMATCH').length;
    const dupCount = issues.filter(i => i.type === 'DUPLICATE_OPTIONS').length;
    const parenCount = issues.filter(i => i.type === 'PAREN_INCONSISTENCY').length;
    const lenCount = issues.filter(i => i.type === 'LENGTH_DISPARITY').length;

    console.log(`📄 ${f} (Total issues: ${issues.length})`);
    if (answerMismatchCount > 0) console.log(`   - ❌ Answer mismatch: ${answerMismatchCount}`);
    if (dupCount > 0) console.log(`   - ⚠️ Duplicate options: ${dupCount}`);
    if (parenCount > 0) console.log(`   - 🔤 Parentheses inconsistency: ${parenCount}`);
    if (lenCount > 0) console.log(`   - 📏 Length disparity: ${lenCount}`);
  });
}

runCheck();
