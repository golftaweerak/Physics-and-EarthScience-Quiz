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

const parenRegex = /\s*\([^)]*[A-Za-z0-9]+[^)]*\)/g;

let fixedCount = 0;

async function fixParens() {
  for (const filePath of allFiles) {
    const relPath = path.relative(process.cwd(), filePath);
    try {
      const module = await import('file://' + filePath);
      let quizItems = module.quizItems || module.default || module.questions || module.quizData;

      if (!Array.isArray(quizItems)) continue;

      let modified = false;

      quizItems.forEach((q) => {
        if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) return;

        const parensInOpts = q.options.map(o => /\([^)]*[A-Za-z0-9]+[^)]*\)/.test(o));
        const trueCount = parensInOpts.filter(Boolean).length;

        // If inconsistent
        if (trueCount > 0 && trueCount < 4) {
          // If 1 or 2 options have parens, remove parens to make all 4 clean Thai
          if (trueCount <= 2) {
            q.options = q.options.map((opt, i) => {
              if (parensInOpts[i]) {
                const cleaned = opt.replace(parenRegex, '').trim();
                // Update answer if it matched the original option
                if (q.answer === opt) {
                  q.answer = cleaned;
                } else if (Array.isArray(q.answer)) {
                  q.answer = q.answer.map(ans => ans === opt ? cleaned : ans);
                }
                return cleaned;
              }
              return opt;
            });
            modified = true;
            fixedCount++;
          }
          // If 3 options have parens, remove parens from the 3 so all 4 are clean Thai
          else if (trueCount === 3) {
            q.options = q.options.map((opt, i) => {
              if (parensInOpts[i]) {
                const cleaned = opt.replace(parenRegex, '').trim();
                if (q.answer === opt) {
                  q.answer = cleaned;
                } else if (Array.isArray(q.answer)) {
                  q.answer = q.answer.map(ans => ans === opt ? cleaned : ans);
                }
                return cleaned;
              }
              return opt;
            });
            modified = true;
            fixedCount++;
          }
        }
      });

      if (modified) {
        const exportName = module.quizItems ? 'quizItems' : (module.questions ? 'questions' : (module.quizData ? 'quizData' : 'default'));
        const newCode = `export const ${exportName} = ` + JSON.stringify(quizItems, null, 2) + `;\n`;
        fs.writeFileSync(filePath, newCode, 'utf8');
      }

    } catch (err) {
      console.error(`Error processing ${relPath}: ${err.message}`);
    }
  }

  console.log(`\nTotal questions fixed for paren consistency: ${fixedCount}`);
}

fixParens();
