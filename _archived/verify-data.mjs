
import { quizList } from '../data/quizzes-list.js';

import { subCategoryData } from '../data/sub-category-data.js';
import { getSyllabusForCategory } from '../scripts/syllabus-manager.js';

console.log("🚀 Starting Offline Data Verification...");

try {
  console.log(`✅ Loaded quizList. Found ${quizList.length} quizzes.`);

  // Check for duplicate IDs
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

  // Verify Syllabus Data
  console.log("Checking Syllabus Data...");
  const testCategories = ['PhysicsM4', 'PhysicsM5', 'PhysicsM6', 'EarthSpaceScienceBasic', 'EarthSpaceScienceAdvance'];

  testCategories.forEach(cat => {
    const syllabus = getSyllabusForCategory(cat);
    if (syllabus) {
      console.log(`   - Category '${cat}': Syllabus found.`);
    } else {
      console.warn(`   - Category '${cat}': No syllabus found (might be expected for non-syllabus categories).`);
    }
  });

  // Simulate Grouping Logic (simplified from main.js)
  console.log("Simulating Grouping Logic...");
  const grouped = {};
  quizList.forEach(quiz => {
    if (!grouped[quiz.category]) grouped[quiz.category] = [];
    grouped[quiz.category].push(quiz);
  });

  console.log("✅ Grouping successful. Categories found:", Object.keys(grouped));

  console.log("✅ VERIFICATION COMPLETE: Data files are loadable and syntactically correct.");

} catch (error) {
  console.error("❌ FATAL ERROR During Verification:", error);
}
