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

let flagCount = 0;
let detailedReport = [];

async function checkCorrectness() {
  for (const filePath of allFiles) {
    const relPath = path.relative(process.cwd(), filePath);
    try {
      const module = await import('file://' + filePath);
      const quizItems = module.quizItems || module.default || module.questions || module.quizData;

      if (!Array.isArray(quizItems)) continue;

      quizItems.forEach((q, idx) => {
        const qNum = q.number || (idx + 1);
        const explanation = q.explanation || '';
        const answer = q.answer;
        const question = q.question || '';

        // 1. Check for numerical inconsistency in fill-in-number
        if (q.type === 'fill-in-number' && typeof answer === 'number') {
          // Look for numbers in explanation after "=" or "จะได้" or "เท่ากับ"
          const numberInAns = answer;
          // Check if explanation contains a contradictory final number (e.g. "= 25" when answer is 50)
          // Simple heuristic: if explanation ends with or contains "= <num>" that doesn't equal answer
          const equalsMatches = [...explanation.matchAll(/=\s*([0-9]+(?:\.[0-9]+)?)/g)];
          if (equalsMatches.length > 0) {
            const lastNumStr = equalsMatches[equalsMatches.length - 1][1];
            const lastNum = parseFloat(lastNumStr);
            if (!isNaN(lastNum) && Math.abs(lastNum - numberInAns) > 0.05 && lastNum !== 0 && lastNum !== 100) {
              detailedReport.push({
                file: relPath,
                qNum,
                type: 'NUMERICAL_MISMATCH',
                issue: `Answer is ${numberInAns}, but explanation ends with = ${lastNumStr}`,
                question,
                answer,
                explanation
              });
              flagCount++;
            }
          }
        }

        // 2. Check if explanation references a specific option choice (e.g. "ก.", "ข.", "ข้อ 1", "ข้อ 2") that contradicts answer position
        if (typeof answer === 'string' && Array.isArray(q.options)) {
          const ansIdx = q.options.indexOf(answer);
          if (ansIdx !== -1) {
            const expectedChoiceNum = ansIdx + 1; // 1-indexed
            // Look for "ข้อ 1", "ข้อ 2", "ข้อ 3", "ข้อ 4" or "ตัวเลือก 1", etc. in explanation
            const choiceMatch = explanation.match(/(?:ข้อ|ตัวเลือก|ตอบ)\s*([1-4ก-งA-D])/);
            if (choiceMatch) {
              const matchedChar = choiceMatch[1];
              let matchedNum = -1;
              if (['1', 'ก', 'A', 'a'].includes(matchedChar)) matchedNum = 1;
              if (['2', 'ข', 'B', 'b'].includes(matchedChar)) matchedNum = 2;
              if (['3', 'ค', 'C', 'c'].includes(matchedChar)) matchedNum = 3;
              if (['4', 'ง', 'D', 'd'].includes(matchedChar)) matchedNum = 4;

              if (matchedNum !== -1 && matchedNum !== expectedChoiceNum) {
                detailedReport.push({
                  file: relPath,
                  qNum,
                  type: 'OPTION_INDEX_CONTRADICTION',
                  issue: `Answer text is option ${expectedChoiceNum} ("${answer}"), but explanation says "${choiceMatch[0]}"`,
                  question,
                  answer,
                  explanation
                });
                flagCount++;
              }
            }
          }
        }

        // 3. Check for obvious contradictions in text
        if (typeof answer === 'string' && typeof explanation === 'string') {
          // If answer says "เพิ่มขึ้น" but explanation says "ลดลง" without mentioning "เพิ่มขึ้น"
          if (answer.includes('เพิ่มขึ้น') && explanation.includes('ลดลง') && !explanation.includes('เพิ่มขึ้น')) {
            detailedReport.push({
              file: relPath,
              qNum,
              type: 'DIRECTION_CONTRADICTION',
              issue: `Answer says "เพิ่มขึ้น" but explanation says "ลดลง"`,
              question,
              answer,
              explanation
            });
            flagCount++;
          }
          if (answer.includes('ลดลง') && explanation.includes('เพิ่มขึ้น') && !explanation.includes('ลดลง')) {
            detailedReport.push({
              file: relPath,
              qNum,
              type: 'DIRECTION_CONTRADICTION',
              issue: `Answer says "ลดลง" but explanation says "เพิ่มขึ้น"`,
              question,
              answer,
              explanation
            });
            flagCount++;
          }
        }

      });

    } catch (err) {
      console.error(`Error loading ${relPath}: ${err.message}`);
    }
  }

  fs.writeFileSync('scratch/correctness_report.json', JSON.stringify(detailedReport, null, 2));
  console.log(`Finished correctness scan. Found ${flagCount} potential issues.`);
}

checkCorrectness();
