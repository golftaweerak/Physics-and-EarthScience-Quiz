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

// --- Auto-correction Mapping ---
const correctionMap = {
  EarthSpaceScienceBasic: {
    "ธรณีวิทยาโครงสร้าง และธรณีพิบัติภัย": "ธรณีพิบัติภัย",
    "สมดุลพลังงานของโลก และดวงอาทิตย์": "สมดุลพลังงานของโลกและรังสี",
    "ดาวฤกษ์ คุณสมบัติและวิวัฒนาการ": "สมบัติและวิวัฒนาการของดาวฤกษ์",
    "แผนที่อากาศ และการพยากรณ์อากาศ": "แผนที่อากาศและการพยากรณ์อากาศ",
    "ภาวะเรือนกระจก": "สมดุลพลังงานของโลกและรังสี",
    "ธรณีวิทยาโครงสร้าง": "ธรณีสัณฐานและกระบวนการบนพื้นผิวโลก"
  },
  EarthSpaceScienceAdvance: {
    "ปรากฏการณ์บนท้องฟ้า": "ปฏิสัมพันธ์ในระบบโลก-ดวงจันทร์-ดวงอาทิตย์",
    "พิกัดและการเคลื่อนที่ของวัตถุท้องฟ้าเบื้องต้น": "ทรงกลมท้องฟ้าและระบบพิกัด",
    "สมบัติของดาวฤกษ์": "สมบัติและวิวัฒนาการของดาวฤกษ์",
    "ส่วนประกอบของกาแล็กซีและเอกภพ": "กาแล็กซีและเอกภพวิทยา",
    "ตำแหน่งและลักษณะของดาวเคราะห์ในระบบสุริยะ": "ระบบสุริยะและองค์ประกอบ",
    "ส่วนประกอบของระบบสุริยะ": "ระบบสุริยะและองค์ประกอบ",
    "ระบบสุริยะ": "ระบบสุริยะและองค์ประกอบ",
    "ข่าวสารทางดาราศาสตร์สมัยใหม่": "ข่าวสารและความก้าวหน้าทางดาราศาสตร์",
    "ประวัติศาสตร์ดาราศาสตร์": "ข่าวสารและความก้าวหน้าทางดาราศาสตร์",
    "ปฏิสัมพันธ์ภายในและผลกระทบต่อสิ่งแวดล้อมและสิ่งมีชีวิตบนโลก": "ปฏิสัมพันธ์ในระบบโลก-ดวงจันทร์-ดวงอาทิตย์",
    "ดาวฤกษ์ คุณสมบัติและวิวัฒนาการ": "สมบัติและวิวัฒนาการของดาวฤกษ์",
    "ลุ่มดาวฤกษ์และการใช้ประโยชน์": "กลุ่มดาวฤกษ์และการใช้ประโยชน์",
    "พลังงานและโมเมนตัม": "กลศาสตร์พื้นฐาน (กฎของนิวตัน, งานและพลังงาน)",
    "การเคลื่อนที่เป็นเส้นตรงและเส้นโค้ง": "กลศาสตร์พื้นฐาน (กฎของนิวตัน, งานและพลังงาน)",
    "ฟังก์ชันตรีโกณมิติ": "คณิตศาสตร์สำหรับดาราศาสตร์ (พีชคณิต, เรขาคณิต, ตรีโกณมิติ)",
    "กฎของ นิวตัน แรงและการเคลื่อนที่เบื้องต้น": "กลศาสตร์พื้นฐาน (กฎของนิวตัน, งานและพลังงาน)",
    "ปฏิสัมพันธ์ในระบบโลก-ดวงจันทร์-ดวงอาทิตย์": "ปรากฏการณ์ในระบบสุริยะ (อุปราคา, น้ำขึ้นน้ำลง)",
    "ทฤษฎีคลื่นแม่เหล็กไฟฟ้าเบื้องต้น": "คุณสมบัติของคลื่นแม่เหล็กไฟฟ้าและสเปกตรัม",
    "พีชคณิตเบื้องต้น": "คณิตศาสตร์สำหรับดาราศาสตร์ (พีชคณิต, เรขาคณิต, ตรีโกณมิติ)",
    "เรขาคณิตวงกลม วงรี": "คณิตศาสตร์สำหรับดาราศาสตร์ (พีชคณิต, เรขาคณิต, ตรีโกณมิติ)",
    "ทรงกลมท้องฟ้าและระบบพิกัด": "ทรงกลมท้องฟ้าและระบบพิกัด",
    "การคำนวณทางดาราศาสตร์": "การวิเคราะห์ข้อมูลและการคำนวณทางดาราศาสตร์",
    "กลศาสตร์พื้นฐาน": "กลศาสตร์พื้นฐาน (กฎของนิวตัน, งานและพลังงาน)",
    "คณิตศาสตร์สำหรับดาราศาสตร์": "คณิตศาสตร์สำหรับดาราศาสตร์ (พีชคณิต, เรขาคณิต, ตรีโกณมิติ)",
  },
};

/**
 * Escapes special characters in a string for use in a regular expression.
 */
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
      return fileName.endsWith("-data.js") &&
        !fileName.startsWith("template-") &&
        !fileName.startsWith("sub-category-") &&
        !fileName.startsWith("scores-data");
    }
  );

  // 3. Process all files in parallel
  const processingPromises = quizFiles.map(async (filePath) => {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(DATA_DIR, filePath);
    const prefix = sortedPrefixKeys.find(key => fileName.toLowerCase().startsWith(key));
    const info = quizPrefixInfo[prefix];
    const fileErrors = [];
    const fileCorrections = [];
    let fileContent = null;
    let fileModified = false;

    if (!info || !info.mainCategory) {
      console.log(`\n- Skipping validation for ${relativePath} (no mainCategory defined in quizPrefixInfo).`);
      return { fileName: relativePath, errors: fileErrors, corrections: fileCorrections, fileModified };
    }

    const mainCategoryKey = info.mainCategory;
    const validChapters = validationData.get(mainCategoryKey);

    if (!validChapters) {
      fileErrors.push({ File: relativePath, ID: 'N/A', Error: `Main category "${mainCategoryKey}" not found in syllabus data.` });
      return { fileName: relativePath, errors: fileErrors, corrections: fileCorrections, fileModified };
    }

    const quizDataModule = await import(pathToFileURL(filePath).href + `?v=${Date.now()}`);
    const quizData = findQuizArrayInModule(quizDataModule);

    if (!quizData) {
      fileErrors.push({ File: relativePath, ID: 'N/A', Error: `Could not find an iterable quizData array. Please check the file's export structure.` });
      return { fileName: relativePath, errors: fileErrors, corrections: fileCorrections, fileModified };
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

          // Check for auto-correction
          const rawSpecific = question.subCategory.specific;
          const correction = correctionMap[mainCategoryKey]?.[rawSpecific];

          if (correction) {
            if (!fileContent) fileContent = fs.readFileSync(filePath, "utf-8");
            const escapedOldCat = escapeRegExp(rawSpecific);
            const oldCategoryRegex = new RegExp(`(['"])${escapedOldCat}(['"])`);

            if (oldCategoryRegex.test(fileContent)) {
              fileContent = fileContent.replace(oldCategoryRegex, `$1${correction}$2`);
              fileModified = true;
              fileCorrections.push({ File: relativePath, ID: questionIdForTable, Change: `"${rawSpecific}" -> "${correction}"` });
            } else {
              fileErrors.push({ File: relativePath, ID: questionIdForTable, Error: `Invalid Topic (specific): "${specificTopic}"`, Details: 'Auto-correction target found in data but replacement failed (check escaping).' });
            }
          } else {
            fileErrors.push({ File: relativePath, ID: questionIdForTable, Error: `Invalid Topic (specific): "${specificTopic}" for chapter "${chapterTitle}"` });
          }
        }
      }
    }
    return { fileName: relativePath, errors: fileErrors, corrections: fileCorrections, fileModified, newContent: fileContent, filePath };
  });

  const results = await Promise.all(processingPromises);

  // 4. Aggregate results and perform file writes
  const allErrors = results.flatMap(result => result.errors);
  const allCorrections = results.flatMap(result => result.corrections);

  for (const result of results) {
    if (result.fileModified) {
      fs.writeFileSync(result.filePath, result.newContent, "utf-8");
    }
  }

  // 5. Report final results
  console.log("\n--- ✅ Validation Complete ---");

  if (allCorrections.length > 0) {
    console.log(`\n--- 🔧 Auto-corrections Applyed (${allCorrections.length}) ---`);
    console.table(allCorrections);
  }

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