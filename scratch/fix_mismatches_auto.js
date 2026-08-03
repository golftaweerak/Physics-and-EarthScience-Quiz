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

let fixedMismatchCount = 0;

async function fixMismatches() {
  for (const filePath of allFiles) {
    const relPath = path.relative(process.cwd(), filePath);
    try {
      const fileText = fs.readFileSync(filePath, 'utf8');
      const module = await import('file://' + filePath);
      let quizItems = module.quizItems || module.default || module.questions || module.quizData;

      if (!Array.isArray(quizItems)) continue;

      let modified = false;

      quizItems.forEach((q) => {
        if (!q.options || !Array.isArray(q.options) || q.answer === undefined) return;

        // If single choice string answer
        if (typeof q.answer === 'string' && !q.options.includes(q.answer)) {
          // Normalize clean Thai text
          const cleanAns = q.answer.replace(/\s*\([^)]*\)\s*/g, '').trim();
          
          // Find matching option
          const matchOpt = q.options.find(opt => {
            const cleanOpt = opt.replace(/\s*\([^)]*\)\s*/g, '').trim();
            return cleanOpt === cleanAns || opt.includes(cleanAns) || cleanAns.includes(cleanOpt);
          });

          if (matchOpt) {
            console.log(`[FIXED MISMATCH] In ${relPath} Q${q.number}: "${q.answer}" -> "${matchOpt}"`);
            q.answer = matchOpt;
            modified = true;
            fixedMismatchCount++;
          } else {
            console.warn(`[UNMATCHED] In ${relPath} Q${q.number}: "${q.answer}" could not be auto-matched to options ${JSON.stringify(q.options)}`);
          }
        }
      });

      if (modified) {
        // Rewrite file cleanly preserving export structure
        const exportName = module.quizItems ? 'quizItems' : (module.questions ? 'questions' : (module.quizData ? 'quizData' : 'default'));
        const newCode = `export const ${exportName} = ` + JSON.stringify(quizItems, null, 2) + `;\n`;
        fs.writeFileSync(filePath, newCode, 'utf8');
      }

    } catch (err) {
      console.error(`Error processing ${relPath}: ${err.message}`);
    }
  }

  console.log(`\nTotal answer mismatches auto-fixed: ${fixedMismatchCount}`);
}

fixMismatches();
