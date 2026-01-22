
import { quizList } from './data/quizzes-list.js';
import { getSyllabusForCategory } from './scripts/syllabus-manager.js';
import { categoryDetails } from './scripts/data-manager.js';

console.log("🚀 Starting Grouping Logic Verification...");

// --- Copied Logic from main.js ---
function groupQuizzesForCategory(quizzes, categoryKey) {
  const syllabus = getSyllabusForCategory(categoryKey);

  // Determine if the syllabus is structured with units or a flat chapter list
  // This flattens the structure for unified processing but preserves unit-specific data.
  const chapters = (syllabus && syllabus.units)
    ? syllabus.units.flatMap(unit =>
      unit.chapters.map(ch => ({ ...ch, standard: unit.standard }))
    )
    : (syllabus && syllabus.chapters);

  if (Array.isArray(chapters)) {
    // 1. Separate special categories like "Final Review" from regular chapter quizzes.
    const specialCategoryName = "แนวข้อสอบ";
    const specialQuizzes = quizzes.filter(quiz => quiz.subCategory === specialCategoryName);
    const regularQuizzes = quizzes.filter(quiz => quiz.subCategory !== specialCategoryName);

    // 2. Group the regular quizzes based on the syllabus structure.
    const chapterGroups = chapters.map(chapter => {
      const chapterQuizzes = regularQuizzes.filter(quiz => quiz.subCategory === chapter.title);
      if (chapterQuizzes.length === 0) return null;

      let displayTitle = chapter.title;
      if (categoryKey === 'EarthSpaceScienceBasic') {
        displayTitle = `บทที่ ${chapter.chapterId}: ${chapter.title}`;
      } else if (categoryKey === 'EarthSpaceScienceAdvance') {
        const firstQuiz = chapterQuizzes[0];
        if (firstQuiz && firstQuiz.description) {
          const match = firstQuiz.description.match(/บทที่\s*(\d+)/);
          if (match && match[1]) {
            displayTitle = `บทที่ ${match[1]}: ${chapter.title}`;
          }
        }
      }

      return {
        title: displayTitle,
        quizzes: chapterQuizzes,
        level: 1,
        shortTitle: chapter.shortTitle || chapter.title.substring(0, 6)
      };
    }).filter(Boolean);

    // 3. Create a separate group for the final review quizzes if they exist.
    let specialGroup = null;
    if (specialQuizzes.length > 0) {
      // Custom sorting logic for review quizzes to order them by term and type
      const getSortKey = (quiz) => {
        const title = quiz.title;
        let term = 99;
        let examType = 99; // 1 for midterm, 2 for final
        let set = 99;

        // Extract term number (e.g., from "เทอม 1" or "ปลายภาค 1")
        if (title.includes('เทอม 1') || title.includes('ภาค 1')) {
          term = 1;
        } else if (title.includes('เทอม 2') || title.includes('ภาค 2')) {
          term = 2;
        }

        // Extract exam type
        if (title.includes('กลางภาค')) {
          examType = 1;
        } else if (title.includes('ปลายภาค')) {
          examType = 2;
        }

        // Extract set number
        const setMatch = title.match(/ชุดที่\s*(\d+)/);
        if (setMatch) {
          set = parseInt(setMatch[1], 10);
        }
        // Create a sortable string: term-examType-set
        return `${String(term).padStart(2, '0')}-${String(examType).padStart(2, '0')}-${String(set).padStart(2, '0')}`;
      };

      specialQuizzes.sort((a, b) => {
        const keyA = getSortKey(a);
        const keyB = getSortKey(b);
        return keyA.localeCompare(keyB);
      });

      specialGroup = {
        title: "แนวข้อสอบ",
        description: "รวมแนวข้อสอบสำหรับทบทวนทั้งกลางภาคและปลายภาค",
        quizzes: specialQuizzes,
        level: 1,
        shortTitle: "แนวข้อสอบ"
      };
    }

    // 4. Combine the chapter groups and the special group, with the special group at the end.
    return specialGroup ? [...chapterGroups, specialGroup] : chapterGroups;
  }

  // --- Fallback grouping logic for categories without a defined syllabus structure ---
  const fallbackGroups = [];
  const groupedBySubCategory = quizzes.reduce((acc, quiz) => {
    // Use the quiz.subCategory as the grouping key.
    const groupTitle = quiz.subCategory || 'บทเรียนทั่วไป';
    if (!acc[groupTitle]) {
      acc[groupTitle] = [];
    }
    acc[groupTitle].push(quiz);
    return acc;
  }, {});

  Object.keys(groupedBySubCategory).sort((a, b) => a.localeCompare(b, 'th')).forEach(groupTitle => {
    fallbackGroups.push({ title: groupTitle, quizzes: groupedBySubCategory[groupTitle], level: 1, shortTitle: groupTitle.substring(0, 6) });
  });

  return fallbackGroups;
}
// --- End Copied Logic ---

// --- Test Execution ---
try {
  const groupedQuizzes = quizList.reduce((acc, quiz) => {
    const category = quiz.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(quiz);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedQuizzes).sort((a, b) => {
    const orderA = (categoryDetails[a] && categoryDetails[a].order) || 99;
    const orderB = (categoryDetails[b] && categoryDetails[b].order) || 99;
    return orderA - orderB;
  });

  console.log("Categories to process:", sortedCategories);

  sortedCategories.forEach(categoryKey => {
    console.log(`Processing ${categoryKey}...`);
    const quizzes = groupedQuizzes[categoryKey];
    const result = groupQuizzesForCategory(quizzes, categoryKey);
    console.log(`  - Result groups: ${result.length}`);
  });

  console.log("✅ Verification Passed: No infinite loops in grouping logic.");

} catch (error) {
  console.error("❌ Logic Failed:", error);
}
