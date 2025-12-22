import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Since this is an ES module, __dirname is not available.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Main Configuration ---
const DATA_DIR = path.join(__dirname, "../data");

/**
 * Recursively extracts all individual question objects from the data,
 * handling nested structures like scenarios or case studies.
 * @param {Array} data The array of quiz items from a data file.
 * @returns {Array} A flat array of all question objects.
 */
function flattenQuestions(data) {
  const allQuestions = [];
  for (const item of data) {
    if (
      (item.type === "scenario" || item.type === "case-study") &&
      Array.isArray(item.questions)
    ) {
      // If it's a container, recursively process its inner questions
      allQuestions.push(...flattenQuestions(item.questions));
    } else if (item.question) {
      // If it's a standalone question, add it to the list
      allQuestions.push(item);
    }
  }
  return allQuestions;
}

/**
 * Recursively finds all files in a directory.
 * @param {string} dirPath - The directory to search.
 * @param {Array} arrayOfFiles - Accumulator for file paths.
 * @returns {Array} List of full file paths.
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function main() {
  console.log("--- Starting Category Summary Script ---");

  // 1. Get all quiz data files
  const allFilePaths = getAllFiles(DATA_DIR);
  const quizFiles = allFilePaths.filter(
    (filePath) => {
      const fileName = path.basename(filePath);
      return fileName.endsWith("-data.js") && !["sub-category-data.js", "template-data.js"].includes(fileName);
    }
  );

  // Structure to hold questions: Map<MainCategory, Map<SpecificCategory, Array<Question>>>
  const categoryData = new Map();
  let totalQuestions = 0;
  let uncategorizedCount = 0;

  // 2. Iterate over each quiz file to count questions
  for (const filePath of quizFiles) {
    const fileName = path.basename(filePath);

    try {
      const quizDataModule = await import(pathToFileURL(filePath).href);
      let quizData = quizDataModule.quizItems || quizDataModule.quizScenarios || quizDataModule.quizData || quizDataModule.default;

      // Handle case where quizData is an object with a questions property (from generator)
      if (quizData && !Array.isArray(quizData) && Array.isArray(quizData.questions)) {
        quizData = quizData.questions;
      }

      if (!Array.isArray(quizData)) {
        quizData = Object.values(quizDataModule).find((val) => Array.isArray(val));
      }

      if (!Array.isArray(quizData)) {
        console.warn(`\n- ⚠️ WARNING: Skipping ${fileName}. Could not find an iterable quizData array.`);
        continue;
      }

      const allQuestions = flattenQuestions(quizData);
      totalQuestions += allQuestions.length;

      for (const question of allQuestions) {
        const subCat = question.subCategory || {};
        const main = subCat.main;
        const specific = subCat.specific;

        if (main && specific) {
          if (!categoryData.has(main)) {
            categoryData.set(main, new Map());
          }
          const specificData = categoryData.get(main);
          if (Array.isArray(specific)) {
            specific.forEach(specCat => {
              if (!specificData.has(specCat)) {
                specificData.set(specCat, []);
              }
              specificData.get(specCat).push(question);
            });
          } else if (typeof specific === 'string') {
            if (!specificData.has(specific)) {
              specificData.set(specific, []);
            }
            specificData.get(specific).push(question);
          }
        } else {
          uncategorizedCount++;
        }
      }
    } catch (error) {
      console.error(`\n- ❌ ERROR: Failed to process ${fileName}.`, error);
    }
  }

  // 3. Report the final summary
  console.log("\n--- Question Category Summary (Markdown) ---");

  let markdownOutput = "## 📊 สรุปหมวดหมู่คำถาม\n\n";
  markdownOutput += "| หมวดหมู่หลัก (Main) | หมวดหมู่ย่อย (Specific) | จำนวนข้อ |\n";
  markdownOutput += "|:-------------------|:-------------------------|:---------|\n";
  
  const sortedMainCategories = [...categoryData.keys()].sort((a, b) => a.localeCompare(b, 'th'));

  for (const mainCat of sortedMainCategories) {
    const specificData = categoryData.get(mainCat);
    const sortedSpecifics = [...specificData.keys()].sort((a, b) => a.localeCompare(b, 'th'));
    
    // To get the unique total for the main category, flatten all question arrays and use a Set.
    const allQuestionsInMain = [...specificData.values()].flat();
    const uniqueQuestions = new Set(allQuestionsInMain);
    const mainTotal = uniqueQuestions.size;

    // Add a header row for the main category with its total
    markdownOutput += `| **${mainCat}** | | **${mainTotal}** |\n`;

    for (const specificCat of sortedSpecifics) {
      const questionCount = specificData.get(specificCat).length;
      markdownOutput += `| | ${specificCat} | ${questionCount} |\n`;
    }
  }

  markdownOutput += `| **รวมทั้งหมด** | | **${totalQuestions}** |\n`;
  if (uncategorizedCount > 0) {
    markdownOutput += `\n**⚠️ หมายเหตุ:** มีคำถามที่ไม่ได้ระบุหมวดหมู่ ${uncategorizedCount} ข้อ\n`;
  }
  console.log(markdownOutput);
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});