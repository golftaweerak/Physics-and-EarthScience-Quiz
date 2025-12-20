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
  Object.keys(PHYSICS_SYLLABUS).forEach(gradeKey => { // m4, m5, m6
    const categoryKey = `PhysicsM${gradeKey.substring(1)}`;
    const gradeData = PHYSICS_SYLLABUS[gradeKey];
    const syllabusMap = new Map();
    // Corrected: Physics syllabus has a direct 'chapters' array under each grade.
    if (gradeData && Array.isArray(gradeData.chapters)) {
      gradeData.chapters.forEach(chapter => {
        syllabusMap.set(chapter.title, new Set(chapter.learningOutcomes || []));
      });
    }
    validationMap.set(categoryKey, syllabusMap);
  });

  // Process Basic Earth Science Syllabus
  const basicEarthMap = new Map();
  // The basic syllabus is nested under a single grade key (e.g., 'm6') which contains 'units'.
  // Corrected: The structure has a 'units' array at the top level.
  if (EARTH_SCIENCE_BASIC_SYLLABUS && Array.isArray(EARTH_SCIENCE_BASIC_SYLLABUS.units)) {
      EARTH_SCIENCE_BASIC_SYLLABUS.units.forEach(unit => {
          unit.chapters.forEach(chapter => {
              basicEarthMap.set(chapter.title, new Set(chapter.learningOutcomes || []));
          });
      });
  }
  validationMap.set('EarthSpaceScienceBasic', basicEarthMap);

  // Process Advanced Earth Science Syllabus
  const advanceEarthMap = new Map();
  // The advanced syllabus has a direct 'chapters' array.
  if (EARTH_SCIENCE_ADVANCE_SYLLABUS && Array.isArray(EARTH_SCIENCE_ADVANCE_SYLLABUS.chapters)) {
    EARTH_SCIENCE_ADVANCE_SYLLABUS.chapters.forEach(chapter => {
      advanceEarthMap.set(chapter.title, new Set(chapter.specificTopics || []));
    });
  }
  validationMap.set('EarthSpaceScienceAdvance', advanceEarthMap);

  return validationMap;
}

/** Helper function to normalize topic strings by removing potential leading numbers like "1. " */
function normalizeTopic(topic) {
    if (typeof topic !== 'string') return '';
    // Normalize by removing extra whitespace, newlines, and standardizing spaces.
    // This handles both "1. Topic" and "ว 3.1 ม.6/1 Topic" formats by cleaning them up
    // for a more reliable comparison.
    return topic.replace(/\s+/g, ' ').trim();
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
  console.log("--- 🚀 Starting Sub-category Validation Script ---");
  const startTime = performance.now();

  // 1. Load and preprocess the master sub-category data
  const validationData = preprocessValidationData();

  // Get and sort prefix keys by length (descending) to find the longest match first
  const sortedPrefixKeys = Object.keys(quizPrefixInfo).sort((a, b) => b.length - a.length);

  // 2. Get all quiz data files
  const allFiles = getAllFiles(DATA_DIR);
  const quizFiles = allFiles.filter(
    (filePath) => {
      const fileName = path.basename(filePath);
      return fileName.endsWith("-data.js") && !fileName.startsWith("template-") && !fileName.startsWith("sub-category-");
    }
  );

  // 3. Process all files in parallel
  const processingPromises = quizFiles.map(async (filePath) => {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(DATA_DIR, filePath);
    const prefix = sortedPrefixKeys.find(key => fileName.toLowerCase().startsWith(key));
    const info = quizPrefixInfo[prefix];
    const fileErrors = [];

    if (!info || !info.mainCategory) {
      console.log(`\n- Skipping validation for ${relativePath} (no mainCategory defined in quizPrefixInfo).`);
      return { fileName: relativePath, errors: fileErrors };
    }

    const mainCategoryKey = info.mainCategory;
    const validChapters = validationData.get(mainCategoryKey);

    if (!validChapters) {
      fileErrors.push({ File: relativePath, ID: 'N/A', Error: `Main category "${mainCategoryKey}" not found in syllabus data.` });
      return { fileName: relativePath, errors: fileErrors };
    }

    const quizDataModule = await import(pathToFileURL(filePath).href + `?v=${Date.now()}`);
    const quizData = findQuizArrayInModule(quizDataModule);

    if (!quizData) {
      fileErrors.push({ File: relativePath, ID: 'N/A', Error: `Could not find an iterable quizData array. Please check the file's export structure.` });
      return { fileName: relativePath, errors: fileErrors };
    }

    for (const item of quizData) {
      const questions = (item.type === "scenario") && Array.isArray(item.questions) ? item.questions : [item];

      for (const question of questions) {
        const questionIdForTable = question.number || 'N/A';
        const { subCategory } = question;

        if (!subCategory || typeof subCategory !== 'object' || !subCategory.main) {
          fileErrors.push({ File: relativePath, ID: questionIdForTable, Error: 'Missing or invalid subCategory object (must have a `main` property).' });
          continue;
        }

        const chapterTitle = subCategory.main.trim();
        const specificTopic = normalizeTopic(subCategory.specific);

        // Step 1: Validate the chapter (subCategory.main)
        if (!validChapters.has(chapterTitle)) {
          fileErrors.push({ File: relativePath, ID: questionIdForTable, Error: `Invalid Chapter (main): "${chapterTitle}"` });
          continue; // No point in checking specific topic if chapter is wrong
        }

        // Step 2: Validate the specific topic (subCategory.specific)
        const validTopicsRaw = validChapters.get(chapterTitle);
        const validTopicsNormalized = new Set(Array.from(validTopicsRaw).map(normalizeTopic));

        if (validTopicsNormalized.size > 0 && !validTopicsNormalized.has(specificTopic)) {
          // Only report error if there are specific topics defined for this chapter.
          // If validTopics is empty, it means any specific topic is acceptable (or not defined).
          fileErrors.push({ File: relativePath, ID: questionIdForTable, Error: `Invalid Topic (specific): "${specificTopic}" for chapter "${chapterTitle}"` });
        }
      }
    }
    return { fileName: relativePath, errors: fileErrors };
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