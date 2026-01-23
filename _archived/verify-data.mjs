
import { quizList } from '../data/quizzes-list.js';
import { subCategoryData } from '../data/sub-category-data.js';
import { getSyllabusForCategory } from '../scripts/syllabus-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

console.log("🚀 Starting Offline Data Verification...");

try {
  console.log(`✅ Loaded quizList. Found ${quizList.length} quizzes.`);

  // 1. Check for duplicate IDs
  const ids = new Set();
  const duplicates = [];
  quizList.forEach(q => {
    if (ids.has(q.id)) duplicates.push(q.id);
    ids.add(q.id);
  });

  if (duplicates.length > 0) {
    console.error("❌ ERROR: Duplicate Quiz IDs found:", duplicates);
  } else {
    console.log("✅ No duplicate Quiz IDs found.");
  }

  // 2. Verify File Existence
  console.log("\n🔍 Verifying File Existence...");
  const missingFiles = [];
  const foundFiles = new Set();

  quizList.forEach(quiz => {
    // Logic from quiz-loader.js to construct path
    let relativePath;
    if (quiz.id.includes('/')) {
      relativePath = `${quiz.id}-data.js`;
    } else {
      let folder = '';
      if (quiz.id.startsWith('phy_m4')) folder = 'phy_m4/';
      else if (quiz.id.startsWith('phy_m5')) folder = 'phy_m5/';
      else if (quiz.id.startsWith('phy_m6')) folder = 'phy_m6/';
      else if (quiz.id.startsWith('ess_basic')) folder = 'ess_basic/';
      else if (quiz.id.startsWith('ess_adv')) folder = 'ess_adv/';
      relativePath = `${folder}${quiz.id}-data.js`;
    }

    const fullPath = path.join(DATA_DIR, relativePath);
    if (fs.existsSync(fullPath)) {
      foundFiles.add(fullPath.toLowerCase()); // Normalize for case-insensitive check later if needed
    } else {
      missingFiles.push({ id: quiz.id, expectedPath: relativePath });
    }
  });

  if (missingFiles.length > 0) {
    console.error(`❌ Found ${missingFiles.length} quizzes with MISSING data files:`);
    missingFiles.forEach(m => console.error(`   - ID: ${m.id} -> Missing: ${m.expectedPath}`));
  } else {
    console.log("✅ All quiz entries have corresponding data files.");
  }

  // 3. Check for Orphaned Files (Files in data/* that are not in quizList)
  console.log("\n🔍 Checking for Orphaned Data Files...");

  function getAllFiles(dirPath, arrayOfFiles) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        // Skip node_modules or syllabus if needed, but scanning data/ subdirs is fine
        if (file !== 'syllabus') {
          arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        }
      } else {
        if (file.endsWith('-data.js')) {
          arrayOfFiles.push(path.join(dirPath, "/", file));
        }
      }
    });
    return arrayOfFiles;
  }

  const allDataFiles = getAllFiles(DATA_DIR);
  const orphanedFiles = [];

  allDataFiles.forEach(file => {
    // Ignore some root data files if they aren't quiz data
    if (file.endsWith('scores-data.js') || file.endsWith('template-data.js') || file.endsWith('sub-category-data.js') || file.includes('scores-data-2-2568.js') || file.includes('user-scores-data.js')) return;

    if (!foundFiles.has(file.toLowerCase())) {
      orphanedFiles.push(path.relative(DATA_DIR, file));
    }
  });

  if (orphanedFiles.length > 0) {
    console.warn(`⚠️ Found ${orphanedFiles.length} orphaned data files (not in quizList):`);
    orphanedFiles.forEach(f => console.warn(`   - ${f}`));
  } else {
    console.log("✅ No orphaned data files found.");
  }

  console.log("\n✅ VERIFICATION COMPLETE.");

} catch (error) {
  console.error("❌ FATAL ERROR During Verification:", error);
}
