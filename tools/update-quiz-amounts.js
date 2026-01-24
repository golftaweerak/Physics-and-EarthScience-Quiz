import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

/**
 * A utility script to automatically count the number of questions in each data file
 * and update the `amount` property in `data/quizzes-list.js`.
 *
 * To run: `node tools/update-quiz-amounts.js`
 */

// Helper function to count questions in a quiz data file
function countQuestions(quizItems) {
  if (!quizItems || !Array.isArray(quizItems)) {
    return 0;
  }
  return quizItems.reduce((count, item) => {
    if ((item.type === "scenario" || item.type === "case-study") && Array.isArray(item.questions)) {
      return count + item.questions.length;
    }
    if (item.type === "question" || item.question) {
      return count + 1;
    }
    return count;
  }, 0);
}

async function loadQuizList(quizListPath) {
  // Dynamically import the quizList to get the array, bypassing the cache
  const quizListUrl = `${pathToFileURL(quizListPath).href}?v=${Date.now()}`;
  const { quizList } = await import(quizListUrl);
  return quizList;
}

async function getActualAmount(quiz, dataDir) {
  let relativePath = `${quiz.id}-data.js`;

  // If the ID doesn't contain a slash, try to determine the subfolder based on the ID prefix.
  if (!quiz.id.includes('/')) {
    let folder = "";
    if (quiz.id.startsWith("phy_m4")) folder = "phy_m4/";
    else if (quiz.id.startsWith("phy_m5")) folder = "phy_m5/";
    else if (quiz.id.startsWith("phy_m6")) folder = "phy_m6/";
    else if (quiz.id.startsWith("ess_basic")) folder = "ess_basic/";
    else if (quiz.id.startsWith("ess_adv")) folder = "ess_adv/";
    relativePath = `${folder}${quiz.id}-data.js`;
  }

  const pathSegments = relativePath.split('/');
  const dataFilePath = path.join(dataDir, ...pathSegments);
  try {
    const dataFileUrl = `${pathToFileURL(dataFilePath).href}?v=${Date.now()}`;
    const module = await import(dataFileUrl);
    let quizItems = module.quizItems || module.quizScenarios || module.quizData || module.default;

    // Handle case where quizData is an object with a questions property
    if (quizItems && !Array.isArray(quizItems) && Array.isArray(quizItems.questions)) {
      quizItems = quizItems.questions;
    }

    // Fallback for other potential exports
    if (!Array.isArray(quizItems)) {
      quizItems = Object.values(module).find(val => Array.isArray(val));
    }
    return countQuestions(quizItems || []);
  } catch (error) {
    // Gracefully handle missing data files, but log other critical errors.
    if (error.code !== "ERR_MODULE_NOT_FOUND") {
      console.error(`- ERROR processing ${quiz.id}:`, error.message);
    } else {
      // Add a specific warning for not found files to make debugging easier.
      console.warn(`- WARNING: Data file not found for quiz ID '${quiz.id}' at path: ${dataFilePath}`);
    }
    return null; // Return null to indicate the file couldn't be processed
  }
}

async function updateQuizAmounts() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataDir = path.resolve(__dirname, "..", "data");
  const quizListPath = path.resolve(dataDir, "quizzes-list.js");

  try {
    const quizList = await loadQuizList(quizListPath);
    let changesMade = false;

    console.log("Checking quiz amounts...");

    for (const quiz of quizList) {
      const actualAmount = await getActualAmount(quiz, dataDir);

      // Only process if the file was found and parsed successfully
      if (actualAmount !== null && quiz.amount !== actualAmount) {
        console.log(`- Updating '${quiz.id}': from ${quiz.amount} to ${actualAmount}`);
        quiz.amount = actualAmount;
        changesMade = true;
      }
    }

    if (changesMade) {
      const newFileContent = `export const quizList = ${JSON.stringify(quizList, null, 2)};\n`;
      await writeFile(quizListPath, newFileContent, "utf-8");
      console.log("\n✅ quizzes-list.js has been updated successfully.");
    } else {
      console.log("\n✅ All quiz amounts are up-to-date. No changes needed.");
    }
  } catch (error) {
    console.error("Failed to update quiz list:", error);
  }
}

updateQuizAmounts();