import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";
import { fileURLToPath, pathToFileURL } from "url";

// Import the new syllabus structures
import {
  quizPrefixInfo,
  PHYSICS_SYLLABUS,
  EARTH_SCIENCE_BASIC_SYLLABUS,
  EARTH_SCIENCE_ADVANCE_SYLLABUS,
} from "../data/sub-category-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Main Configuration ---
const DATA_DIR = path.join(__dirname, "../data");

/**
 * Pre-processes syllabus data into a structured Map for efficient validation.
 * The structure is: Map<CategoryKey, Map<ChapterTitle, Set<SpecificTopic>>>
 * e.g., 'PhysicsM4' -> Map{'บทที่ 4: สมดุลกล' -> Set{'สมดุลต่อการเลื่อนที่', ...}}
 * @returns {Map<string, Map<string, Set<string>>>} A map containing all valid categories.
 */
function preprocessValidationData() {
  const validationMap = new Map();

  // Process Physics Syllabus
  for (const gradeKey in PHYSICS_SYLLABUS) { // m4, m5, m6
    const categoryKey = `PhysicsM${gradeKey.substring(1)}`; // 'm4' -> 'PhysicsM4'
    const gradeSyllabus = PHYSICS_SYLLABUS[gradeKey];
    const chapterMap = new Map();
    gradeSyllabus.chapters.forEach(chapter => {
      const topics = new Set(chapter.learningOutcomes || []);
      chapterMap.set(chapter.title, topics);
    });
    validationMap.set(categoryKey, chapterMap);
  }

  // Process Basic Earth Science Syllabus
  const basicEarthMap = new Map();
  // The basic syllabus is nested under 'units', so we need to iterate through them first.
  EARTH_SCIENCE_BASIC_SYLLABUS.units.forEach(unit => {
    unit.chapters.forEach(chapter => {
      const topics = new Set(chapter.specificTopics || []);
      basicEarthMap.set(chapter.title, topics);
    });
  });
  validationMap.set('EarthSpaceScienceBasic', basicEarthMap);

  // Process Advanced Earth Science Syllabus
  const advanceEarthMap = new Map();
  EARTH_SCIENCE_ADVANCE_SYLLABUS.chapters.forEach(chapter => {
    const topics = new Set(chapter.specificTopics || []);
    advanceEarthMap.set(chapter.title, topics);
  });
  validationMap.set('EarthSpaceScienceAdvance', advanceEarthMap);

  return validationMap;
}

/** Helper function to normalize topic strings by removing potential leading numbers like "1. " */
function normalizeTopic(topic) {
    if (typeof topic !== 'string') return '';
    return topic.replace(/^\d+\.\s*/, '').trim();
}

/**
 * Finds the primary quiz data array within an imported module.
 * @param {object} quizModule - The imported module object.
 * @returns {Array|null} The quiz data array or null if not found.
 */
function findQuizArrayInModule(quizModule) {
  if (quizModule.quizItems && Array.isArray(quizModule.quizItems)) {
    return quizModule.quizItems;
  }
  // Add fallbacks for older formats if necessary
  return Object.values(quizModule).find(val => Array.isArray(val)) || null;
}

async function main() {
  console.log("--- 🚀 Starting Sub-category Validation Script ---");
  const startTime = performance.now();

  // 1. Load and preprocess the master sub-category data
  const validationData = preprocessValidationData();

  // Get and sort prefix keys by length (descending) to find the longest match first
  const sortedPrefixKeys = Object.keys(quizPrefixInfo).sort((a, b) => b.length - a.length);

  // 2. Get all quiz data files
  const allFiles = fs.readdirSync(DATA_DIR);
  const quizFiles = allFiles.filter(
    (file) => file.endsWith("-data.js") && !file.startsWith("template-") && !file.startsWith("sub-category-")
  );

  // 3. Process all files in parallel
  const processingPromises = quizFiles.map(async (fileName) => {
    const prefix = sortedPrefixKeys.find(key => fileName.toLowerCase().startsWith(key));
    const info = quizPrefixInfo[prefix];
    const fileErrors = [];

    if (!info || !info.mainCategory) {
      console.log(`\n- Skipping validation for ${fileName} (no mainCategory defined in quizPrefixInfo).`);
      return { fileName, errors: fileErrors };
    }

    const mainCategoryKey = info.mainCategory;
    const validChapters = validationData.get(mainCategoryKey);

    if (!validChapters) {
      fileErrors.push({ File: fileName, ID: 'N/A', Error: `Main category "${mainCategoryKey}" not found in syllabus data.` });
      return { fileName, errors: fileErrors };
    }

    const filePath = path.join(DATA_DIR, fileName);
    const quizDataModule = await import(pathToFileURL(filePath).href + `?v=${Date.now()}`);
    const quizData = findQuizArrayInModule(quizDataModule);

    if (!quizData) {
      fileErrors.push({ File: fileName, ID: 'N/A', Error: `Could not find an iterable quizData array. Please check the file's export structure.` });
      return { fileName, errors: fileErrors };
    }

    for (const item of quizData) {
      const questions = (item.type === "scenario") && Array.isArray(item.questions) ? item.questions : [item];

      for (const question of questions) {
        const questionIdForTable = question.number || 'N/A';
        const { subCategory } = question;

        if (!subCategory || typeof subCategory !== 'object' || !subCategory.main) {
          fileErrors.push({ File: fileName, ID: questionIdForTable, Error: 'Missing or invalid subCategory object (must have a `main` property).' });
          continue;
        }

        const chapterTitle = subCategory.main.trim();
        const specificTopic = normalizeTopic(subCategory.specific);

        // Step 1: Validate the chapter (subCategory.main)
        if (!validChapters.has(chapterTitle)) {
          fileErrors.push({ File: fileName, ID: questionIdForTable, Error: `Invalid Chapter (main): "${chapterTitle}"` });
          continue; // No point in checking specific topic if chapter is wrong
        }

        // Step 2: Validate the specific topic (subCategory.specific)
        const validTopicsRaw = validChapters.get(chapterTitle);
        const validTopicsNormalized = new Set(Array.from(validTopicsRaw).map(normalizeTopic));

        if (validTopicsNormalized.size > 0 && !validTopicsNormalized.has(specificTopic)) {
          // Only report error if there are specific topics defined for this chapter.
          // If validTopics is empty, it means any specific topic is acceptable (or not defined).
          fileErrors.push({ File: fileName, ID: questionIdForTable, Error: `Invalid Topic (specific): "${specificTopic}" for chapter "${chapterTitle}"` });
        }
      }
    }
    return { fileName, errors: fileErrors };
  });

  const results = await Promise.all(processingPromises);

  // 4. Aggregate results and perform file writes
  const allErrors = results.flatMap(result => result.errors);

  // 5. Report final results
  console.log("\n--- ✅ Validation Complete ---");

  if (allErrors.length > 0) {
    console.log(`\n--- ❗️ Found ${allErrors.length} Sub-category Error(s) ---`);
    console.table(allErrors);
    console.error(`\nPlease fix the errors listed above manually.`);
  } else {
    console.log("\n✨ All sub-categories are valid. No issues found.");
  }

  const endTime = performance.now();
  const duration = (endTime - startTime) / 1000; // in seconds
  console.log(`\n⏱️  Script finished in ${duration.toFixed(3)} seconds.`);

  if (allErrors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});