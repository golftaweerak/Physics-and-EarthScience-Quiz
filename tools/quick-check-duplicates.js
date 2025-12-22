import fs from "fs/promises";
import path from "path";
import { performance } from "perf_hooks";
import { fileURLToPath, pathToFileURL } from "url";

/**
 * A fast utility script to check for EXACT duplicate questions across all data files.
 * It identifies questions with the exact same text and the exact same set of options (order-independent).
 * This script is a lightweight version of check-duplicates.js, omitting the slower similarity checks.
 *
 * To run:
 * 1. Make sure you have a package.json with "type": "module".
 * 2. Run `node tools/quick-check-duplicates.js` from the project root.
 */

/**
 * A generator function to flatten the quiz items structure.
 * @param {Array<Object>} items - The array of items from a data file.
 */
function* getAllQuestions(items) {
  for (const item of items) {
    if (!item) continue; // Safety check
    if ((item.type === "scenario" || item.type === "case-study") && Array.isArray(item.questions)) {
      yield* getAllQuestions(item.questions); // Recursive call
    } else if (item.question) {
      yield item;
    }
  }
}

/**
 * Extracts the text content from a quiz option.
 * @param {string|Object} opt - The option item.
 * @returns {string} The trimmed text of the option.
 */
function getOptionText(opt) {
  return (typeof opt === "object" && opt !== null && opt.text)
    ? opt.text.trim()
    : String(opt).trim();
}

async function quickCheckDuplicates() {
  const startTime = performance.now();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataDir = path.resolve(__dirname, "..", "data");

  // Helper to recursively get files
  async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return files.flat();
  }

  const allFiles = await getFiles(dataDir);
  const dataFiles = allFiles.filter(
    (file) => file.endsWith("-data.js") && !file.endsWith("sub-category-data.js")
  );

  const seenQuestions = new Map();
  let duplicateCount = 0;
  let totalQuestions = 0;

  console.log("\n🔍 Quick Check: Finding EXACT DUPLICATES...");

  for (const filePath of dataFiles) {
    const relativePath = path.relative(dataDir, filePath);
    const fileUrl = `${pathToFileURL(filePath).href}?v=${Date.now()}`;
    try {
      const module = await import(fileUrl);
      let quizItems = module.quizItems || module.quizScenarios || module.quizData || module.default;

      // Handle case where quizData is an object with a questions property (from generator)
      if (quizItems && !Array.isArray(quizItems) && Array.isArray(quizItems.questions)) {
        quizItems = quizItems.questions;
      }

      // Fallback: try to find any exported array if the named ones aren't found or aren't arrays
      if (!quizItems || !Array.isArray(quizItems)) {
        quizItems = Object.values(module).find((val) => Array.isArray(val));
      }

      if (!quizItems) continue;

      for (const q of getAllQuestions(quizItems)) {
        if (!q.question || !Array.isArray(q.options)) continue;
        totalQuestions++;

        const questionText = q.question.trim();
        const sortedOptions = q.options.map(getOptionText).sort().join("|");
        const uniqueKey = `${questionText}|${sortedOptions}`;

        if (seenQuestions.has(uniqueKey)) {
          duplicateCount++;
          const firstSeen = seenQuestions.get(uniqueKey);
          console.error(`\n❗️ DUPLICATE #${duplicateCount}: "${questionText.substring(0, 80)}..."`);
          console.error(`  - Found in: ${relativePath} (#${q.number})`);
          console.error(`  - First seen in: ${firstSeen.file} (#${firstSeen.number})`);
        } else {
          seenQuestions.set(uniqueKey, { file: relativePath, number: q.number });
        }
      }
    } catch (e) {
      console.error(`\n❌ Error importing file: ${relativePath}`, e);
    }
  }

  console.log("\n--- Check complete ---");
  console.log(`Checked ${totalQuestions} questions across ${dataFiles.length} files.`);
  duplicateCount > 0
    ? console.log(`❌ Found ${duplicateCount} duplicate question instances.`)
    : console.log("✅ No exact duplicates found.");

  const duration = (performance.now() - startTime) / 1000;
  console.log(`\n⏱️  Finished in ${duration.toFixed(3)} seconds.`);
}

quickCheckDuplicates().catch(console.error);