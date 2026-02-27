/**
 * A centralized module for managing shared data like category details,
 * quiz progress, and fetching quiz question data.
 */

import { getDataModules } from './quiz-data-loader.js';
import { db } from './firebase-config.js';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// Single source of truth for all category metadata.
export const categoryDetails = {
  // Main categories for the index page accordion

  // --- Physics Categories by Grade ---
  PhysicsM4: {
    title: "ฟิสิกส์ ม.4",
    displayName: "ฟิสิกส์ ม.4",
    icon: "./assets/icons/physicsm4.png", // Assuming a physics icon exists or will be added
    order: 6,
    color: "border-red-500",
    cardGlow: "hover:shadow-red-500/30",
    logoGlow: "group-hover:shadow-red-500/40",
  },
  PhysicsM5: {
    title: "ฟิสิกส์ ม.5",
    displayName: "ฟิสิกส์ ม.5",
    icon: "./assets/icons/electromagnetic.png",
    order: 7,
    color: "border-orange-500",
    cardGlow: "hover:shadow-orange-500/30",
    logoGlow: "group-hover:shadow-orange-500/40",
  },
  PhysicsM6: {
    title: "ฟิสิกส์ ม.6",
    displayName: "ฟิสิกส์ ม.6",
    icon: "./assets/icons/physics.png",
    order: 8,
    color: "border-amber-500",
    cardGlow: "hover:shadow-amber-500/30",
    logoGlow: "group-hover:shadow-amber-500/40",
  },
  // --- End Physics ---

  // สีเขียวอ่อน (Light Green): สื่อถึงโลกและธรรมชาติ (พื้นฐาน)
  EarthSpaceScienceBasic: {
    title: "วิทยาศาสตร์โลกและอวกาศ (พื้นฐาน)",
    displayName: "วิทย์โลก (พื้นฐาน)",
    icon: "./assets/icons/earth.png", // Reusing earth icon
    order: 9,
    color: "border-green-400",
    cardGlow: "hover:shadow-green-400/30",
    logoGlow: "group-hover:shadow-green-400/40",
  },
  // สีน้ำเงินเข้ม (Dark Blue): สื่อถึงความลึกซึ้งและอวกาศ (เพิ่มเติม)
  EarthSpaceScienceAdvance: {
    title: "โลก ดาราศาสตร์และอวกาศ (เพิ่มเติม)",
    displayName: "วิทย์โลก (เพิ่มเติม)",
    icon: "./assets/icons/space.png", // Reusing space icon
    order: 10,
    color: "border-indigo-600",
    cardGlow: "hover:shadow-indigo-600/30",
    logoGlow: "group-hover:shadow-indigo-600/40",
  },

  // --- POSN Earth Science ---
  POSNEarthScience: {
    title: "สอวน. วิทยาศาสตร์โลก",
    displayName: "สอวน. วิทย์โลก",
    icon: "./assets/icons/earth.png",
    order: 20,
    color: "border-teal-500",
    cardGlow: "hover:shadow-teal-500/30",
    logoGlow: "group-hover:shadow-teal-500/40",
  },
  PosnEarthScience: { // Mapping mismatch coverage
    title: "สอวน. วิทยาศาสตร์โลกและอวกาศ",
    displayName: "สอวน. วิทย์โลก",
    icon: "./assets/icons/earth.png",
    order: 21,
    color: "border-teal-600",
    cardGlow: "hover:shadow-teal-600/30",
    logoGlow: "group-hover:shadow-teal-600/40",
  },

  // --- POSN Astronomy ---
  AstronomyPOSN: {
    title: "สอวน. ดาราศาสตร์",
    displayName: "สอวน. ดาราศาสตร์",
    icon: "./assets/icons/space.png",
    order: 30,
    color: "border-purple-600",
    cardGlow: "hover:shadow-purple-600/30",
    logoGlow: "group-hover:shadow-purple-600/40",
  },
  PosnAstroJunior: {
    title: "สอวน. ดาราศาสตร์ (ม.ต้น)",
    displayName: "สอวน. ดาราศาสตร์ (ม.ต้น)",
    icon: "./assets/icons/space.png",
    order: 31,
    color: "border-purple-400",
    cardGlow: "hover:shadow-purple-400/30",
    logoGlow: "group-hover:shadow-purple-400/40",
  },
  PosnAstroSenior: {
    title: "สอวน. ดาราศาสตร์ (ม.ปลาย)",
    displayName: "สอวน. ดาราศาสตร์ (ม.ปลาย)",
    icon: "./assets/icons/space.png",
    order: 32,
    color: "border-purple-700",
    cardGlow: "hover:shadow-purple-700/30",
    logoGlow: "group-hover:shadow-purple-700/40",
  },
  AstronomyReview: {
    title: "ทบทวน",
    displayName: "ทบทวน",
    icon: "./assets/icons/study.png",
    order: 33,
    color: "border-pink-500",
    cardGlow: "hover:shadow-pink-500/30",
    logoGlow: "group-hover:shadow-pink-500/40",
  },
  ChallengePOSN: {
    title: "แบบทดสอบท้าทาย (POSN)",
    displayName: "POSN Challenge",
    icon: "./assets/icons/trophy-star.png",
    order: 34,
    color: "border-yellow-500",
    cardGlow: "hover:shadow-yellow-500/30",
    logoGlow: "group-hover:shadow-yellow-500/40",
  },

  // This is a special category for the custom quiz creator.
  General: {
    title: "ทุกหมวดหมู่",
    displayName: "ทุกหมวดหมู่",
    icon: "./assets/icons/study.png",
  },
  // A special category for user-created quizzes that mix subjects.
  Custom: {
    title: "แบบทดสอบที่สร้างเอง",
    displayName: "แบบทดสอบที่สร้างเอง",
    icon: "./assets/icons/dices.png",
    order: 99, // Ensure it appears last in sorted lists
    color: "border-purple-500",
    cardGlow: "hover:shadow-purple-500/30",
    logoGlow: "group-hover:shadow-purple-500/40",
  },
};

/**
 * Gets the display-friendly name for a category.
 * Falls back to the title if displayName is not specified.
 * @param {string} categoryKey - The key of the category.
 * @returns {string} The display name.
 */
export function getCategoryDisplayName(categoryKey) {
  const details = categoryDetails[categoryKey];
  if (!details) return categoryKey; // Fallback to the key itself
  // Use displayName if it exists, otherwise use title.
  return details.displayName || details.title;
}


const SEMESTER_STORAGE_KEY = 'current_semester';
const DEFAULT_SEMESTER = '1/2568';

/**
 * Gets the current active semester from localStorage.
 * @returns {string} The semester string (e.g., '1/2568', '2/2568').
 */
export function getCurrentSemester() {
  return localStorage.getItem(SEMESTER_STORAGE_KEY) || DEFAULT_SEMESTER;
}

/**
 * Sets the current active semester and clears the cache to force a reload.
 * @param {string} semester - The semester string to set.
 */
export function setCurrentSemester(semester) {
  if (semester !== getCurrentSemester()) {
    localStorage.setItem(SEMESTER_STORAGE_KEY, semester);
    mergedScoresCache = null; // Clear cache to reload data for the new semester
  }
}

let mergedScoresCache = null;
let currentLoadedSemester = null;

/**
 * Fetches base scores and manual overrides, merges them, and caches the result.
 * This ensures that overrides are applied consistently across the application.
 * @returns {Promise<Array<object>>} A promise that resolves to the merged student scores.
 */
export async function getStudentScores() {
  const semester = getCurrentSemester();

  // Return cache if it exists and matches the requested semester
  if (mergedScoresCache && currentLoadedSemester === semester) {
    return mergedScoresCache;
  }

  // --- Start Firestore Migration Logic ---
  try {
    const scoresRef = collection(db, "student_scores");
    const snapshot = await getDocs(scoresRef);

    if (snapshot.empty) {
      console.warn("No student scores found on Firestore. Fallback to []");
      return [];
    }

    // We will still format it as a list of students, focusing on the requested semester
    const baseScores = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      // Ensure the student has data for this semester
      if (data.semesters && data.semesters[semester]) {
        // Transform the nested Firestore map back into the legacy "assignments" array array expected by the UI
        const assignmentMap = data.semesters[semester];
        const assignmentsArray = Object.keys(assignmentMap).map(key => ({
          name: key,
          score: assignmentMap[key]
        }));

        // Also ensure "รวม [100]" and "เกรด" are correctly passed or derived if present
        baseScores.push({
          id: data.id,
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          room: data.room,
          ordinal: data.ordinal,
          assignments: assignmentsArray
        });
      }
    });

    mergedScoresCache = baseScores;
    currentLoadedSemester = semester;
    return baseScores;
  } catch (error) {
    console.error(`Failed to load student scores for ${semester} from Firestore:`, error);
    return []; // Return an empty array on failure.
  }
}

/**
 * Retrieves a single student's score from Firestore directly.
 * Useful for the student login search where we don't need to load the whole school.
 * @param {string} studentId - The student ID to look up.
 * @returns {Promise<object|null>} The student data or null if not found.
 */
export async function getSingleStudentScoreFromCloud(studentId) {
  const semester = getCurrentSemester();
  try {
    const docRef = doc(db, "student_scores", studentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    if (data.semesters && data.semesters[semester]) {
      const assignmentMap = data.semesters[semester];
      const assignmentsArray = Object.keys(assignmentMap).map(key => ({
        name: key,
        score: assignmentMap[key]
      }));

      return {
        id: data.id,
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        room: data.room,
        ordinal: data.ordinal,
        assignments: assignmentsArray
      };
    }
    return null;
  } catch (err) {
    console.error("Error fetching single student score from cloud:", err);
    return null;
  }
}

/**
 * Retrieves the progress state of a quiz from localStorage.
 * @param {string} storageKey - The key for the quiz in localStorage.
 * @param {number} totalQuestions - The total number of questions in the quiz.
 * @returns {object} An object containing progress details.
 */
export function getQuizProgress(storageKey, totalQuestions) {
  const defaultState = {
    score: 0,
    percentage: 0,
    hasProgress: false,
    isFinished: false,
    answeredCount: 0,
    totalQuestions: totalQuestions,
    lastAttemptTimestamp: 0, // Add timestamp for sorting by recency
  };
  if (totalQuestions <= 0) return defaultState;

  try {
    const savedStateJSON = localStorage.getItem(storageKey);
    if (!savedStateJSON) return defaultState;

    const savedState = JSON.parse(savedStateJSON);
    if (!savedState || typeof savedState.currentQuestionIndex !== "number")
      return defaultState;
    // Use the length from the saved state if available, as it's the most accurate count
    // for the session the user was in. Fallback to the static totalQuestions.
    const actualTotalQuestions = (savedState.shuffledQuestions && savedState.shuffledQuestions.length) || totalQuestions;

    // A more robust way to count answered questions is to check the userAnswers array.
    // This avoids ambiguity with currentQuestionIndex, which points to the *next* question to be shown.
    const answeredCount = Array.isArray(savedState.userAnswers)
      ? savedState.userAnswers.filter((answer) => answer !== null).length
      : 0;

    const score = savedState.score || 0;
    const isFinished = answeredCount >= actualTotalQuestions;
    const percentage = actualTotalQuestions > 0 ? Math.round((answeredCount / actualTotalQuestions) * 100) : 0;
    const lastAttemptTimestamp = savedState.lastAttemptTimestamp || 0; // Get timestamp from saved state

    return {
      score,
      percentage,
      isFinished,
      hasProgress: true,
      answeredCount,
      totalQuestions: actualTotalQuestions,
      lastAttemptTimestamp,
    };
  } catch (e) {
    console.error(`Could not parse saved state for ${storageKey}:`, e);
    return defaultState;
  }
}

/**
 * Loads the entire saved state object for a quiz from localStorage.
 * @param {string} storageKey - The key for the quiz in localStorage.
 * @returns {object|null} The parsed state object, or null if not found or corrupt.
 */
export function loadQuizState(storageKey) {
  const savedStateJSON = localStorage.getItem(storageKey);
  if (!savedStateJSON) return null;
  try {
    const parsed = JSON.parse(savedStateJSON);
    // Basic validation to ensure it's a plausible state object
    if (
      parsed &&
      typeof parsed.currentQuestionIndex === "number" &&
      Array.isArray(parsed.userAnswers)
    ) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error(`Could not parse saved state for ${storageKey}:`, e);
    return null;
  }
}

/**
 * Retrieves detailed progress for all quizzes, including the userAnswers array.
 * @returns {Promise<Array<object>>} An array of detailed progress objects.
 */
export async function getDetailedProgressForAllQuizzes() {
  const { quizList } = await import("../data/quizzes-list.js");
  const { getSavedCustomQuizzes } = await import("./custom-quiz-handler.js");

  // Add timeout to prevent hanging
  const customQuizzesPromise = getSavedCustomQuizzes();
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve([]), 3000));
  const customQuizzes = await Promise.race([customQuizzesPromise, timeoutPromise]);

  const allQuizzes = [...quizList, ...customQuizzes];
  const allDetailedProgress = allQuizzes
    .map((quiz) => {
      const storageKey =
        quiz.storageKey || `quizState-${quiz.id || quiz.customId}`;
      const savedState = loadQuizState(storageKey); // Use the existing function that returns the full state object

      if (
        !savedState ||
        !savedState.userAnswers ||
        savedState.userAnswers.filter((a) => a !== null).length === 0
      ) {
        return null; // No progress or no answers yet
      }

      return { ...quiz, ...savedState }; // Return full quiz info and its saved state
    })
    .filter((p) => p !== null);

  return allDetailedProgress;
}
/**
 * Retrieves progress for all known quizzes (standard and custom).
 * @returns {Promise<Array<object>>} An array of progress objects for all quizzes.
 */
export async function getAllQuizProgress() {
  const { quizList } = await import("../data/quizzes-list.js");
  const { getSavedCustomQuizzes } = await import("./custom-quiz-handler.js");

  // Add timeout to prevent hanging
  const customQuizzesPromise = getSavedCustomQuizzes();
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve([]), 3000));
  const customQuizzes = await Promise.race([customQuizzesPromise, timeoutPromise]);

  const allQuizzes = [...quizList, ...customQuizzes];
  const allProgress = allQuizzes
    .map((quiz) => {
      const totalQuestions = quiz.amount || quiz.questions?.length || 0;
      if (totalQuestions === 0) return null;

      const storageKey =
        quiz.storageKey || `quizState-${quiz.id || quiz.customId}`;
      const progress = getQuizProgress(storageKey, totalQuestions);

      return {
        ...progress,
        title: quiz.title,
        category:
          (categoryDetails[quiz.category] && categoryDetails[quiz.category].title) || quiz.category || "ไม่ระบุ",
        storageKey: storageKey,
      };
    })
    .filter((p) => p !== null); // Filter out quizzes with no questions
  return allProgress;
}

let allQuestionsCache = null;
let questionsBySubCategoryCache = {};
let scenariosCache = new Map();

/**
 * Safely loads the quizList dynamically.
 * @returns {Promise<Array<object>>} The quiz list array.
 */
export async function getQuizzesList() {
  try {
    const module = await import("../data/quizzes-list.js");
    return module.quizList || [];
  } catch (error) {
    console.error(`Failed to load quizzes-list.js:`, error);
    return [];
  }
}

/**
 * Fetches and processes all questions from all quiz data files.
 * Caches the result for subsequent calls.
 * @returns {Promise<{allQuestions: Array, byCategory: object}>}
 */
export async function fetchAllQuizData() {
  // Check if all caches are populated
  if (
    allQuestionsCache &&
    Object.keys(questionsBySubCategoryCache).length > 0 &&
    scenariosCache.size > 0
  ) {
    return {
      allQuestions: allQuestionsCache,
      byCategory: questionsBySubCategoryCache,
      scenarios: scenariosCache,
    };
  }

  let quizList;
  try {
    const module = await import("../data/quizzes-list.js");
    quizList = module.quizList;
    console.log(`[DEBUG] fetchAllQuizData: Loaded quizList with ${quizList?.length} items`);
  } catch (error) {
    // Make the error more specific if the main list fails to load.
    throw new Error(`Failed to load or parse quizzes-list.js: ${error.message}`);
  }

  // Filter out any potential empty/falsy entries from the list to prevent errors.
  const validQuizList = Array.isArray(quizList) ? quizList.filter((quiz) => quiz) : [];
  // Use import.meta.glob to allow Vite to bundle these files
  const dataModules = import.meta.glob('../data/**/*.js');

  const promises = validQuizList.map(async (quiz) => {
    // Fix for missing path prefixes:
    let scriptPath;
    if (quiz.id.includes('/')) {
      scriptPath = `/Physics-and-EarthScience-Quiz/data/${quiz.id}-data.js`;
    } else {
      // Auto-detect folder based on ID prefix
      let folder = '';
      if (quiz.id.startsWith('phy_m4')) folder = 'phy_m4/';
      else if (quiz.id.startsWith('phy_m5')) folder = 'phy_m5/';
      else if (quiz.id.startsWith('phy_m6')) folder = 'phy_m6/';
      else if (quiz.id.startsWith('ess_basic')) folder = 'ess_basic/';
      else if (quiz.id.startsWith('ess_adv')) folder = 'ess_adv/';
      // POSN / Advanced Folders
      else if (quiz.id.startsWith('adv_astro')) folder = 'posn_astro/';
      else if (quiz.id.startsWith('adv_geology')) folder = 'posn_earth/';
      else if (quiz.id.startsWith('adv_meteorology')) folder = 'posn_earth/';
      else if (quiz.id.startsWith('adv_oceanography')) folder = 'posn_earth/';

      scriptPath = `/Physics-and-EarthScience-Quiz/data/${folder}${quiz.id}-data.js`;
    }

    if (!dataModules[scriptPath]) {
      console.warn(`[DEBUG] fetchAllQuizData: Data module not found for ${scriptPath}`);
      return [];
    }

    try {
      const module = await dataModules[scriptPath]();
      const data = module.quizItems || module.quizScenarios || module.quizData || [];

      if (!Array.isArray(data)) {
        console.warn(`Data for quiz ID "${quiz.id}" is not an array. Skipping.`);
        return [];
      }

      return data.flatMap((item) => {
        if (!item) return [];

        if (item.type === "scenario" && Array.isArray(item.questions)) {
          const scenarioId = `${quiz.id}_${item.title.replace(/\s/g, "_")}`;
          if (!scenariosCache.has(scenarioId)) {
            scenariosCache.set(scenarioId, { title: item.title, description: item.description });
          }
          return item.questions.filter(q => q).map(q => ({
            ...q,
            subCategory: q.subCategory || item.subCategory || quiz.category,
            sourceQuizCategory: quiz.category,
            sourceQuizTitle: quiz.title,
            scenarioId: scenarioId,
          }));
        }
        return {
          ...item,
          subCategory: item.subCategory || quiz.category,
          sourceQuizCategory: quiz.category,
          sourceQuizTitle: quiz.title,
        };
      });
    } catch (error) {
      // Instead of throwing, log the error and return an empty array.
      // This allows Promise.all to complete successfully even if some files are missing.
      console.warn(`Could not load or parse data for quiz ID "${quiz.id}" from ${scriptPath}. Skipping. Error: ${error.message}`);
      return []; // Return an empty array for this failed import
    }
  });

  // Wrap Promise.all in a try-catch to handle any re-thrown errors from the map.
  try {
    const results = await Promise.all(promises);
    allQuestionsCache = results.flat();
    console.log(`[DEBUG] fetchAllQuizData: allQuestionsCache total: ${allQuestionsCache.length}`);
  } catch (error) {
    // The error from a failing import will be caught here.
    // We re-throw it so the UI layer (e.g., preview.js) can display a meaningful message.
    console.error("A critical error occurred while loading all quiz data:", error);
    throw error;
  }

  // Pre-process each question to create a single, lowercase, searchable text field.
  // This is done only once when the data is first loaded, making subsequent searches much faster.
  allQuestionsCache.forEach(q => {
    const searchableParts = [
      q.question,
      q.explanation,
      q.scenarioTitle,
      q.scenarioDescription,
      q.sourceQuizTitle,
      ...(q.options || q.choices || []),
    ];
    // Handle both object and string formats for subCategory
    if (q.subCategory) {
      if (typeof q.subCategory === 'object' && q.subCategory.main) {
        searchableParts.push(q.subCategory.main);
        const specifics = Array.isArray(q.subCategory.specific) ? q.subCategory.specific : [q.subCategory.specific];
        searchableParts.push(...specifics);
      } else if (typeof q.subCategory === 'string') {
        searchableParts.push(q.subCategory);
      }
    }
    q.searchableText = searchableParts.filter(Boolean).join(' ').toLowerCase();
  });

  // This logic creates a nested structure for easier filtering by specific sub-categories.
  // e.g., { Geology: { "หัวข้อ 1": [q1, q2], "หัวข้อ 2": [q3] } }
  questionsBySubCategoryCache = allQuestionsCache.reduce((acc, question) => {
    const subCat = question.subCategory;
    if (typeof subCat === "object" && subCat.main && subCat.specific) {
      const mainKey = subCat.main;
      const specificKey = subCat.specific;

      if (!acc[mainKey]) acc[mainKey] = {};
      if (!acc[mainKey][specificKey]) acc[mainKey][specificKey] = [];
      acc[mainKey][specificKey].push(question);
    } else if (typeof subCat === "string") {
      // Handle legacy string-based subcategories by grouping them under a main key.
      const mainKey = subCat;
      const specificKey = "Uncategorized";
      if (!acc[mainKey]) acc[mainKey] = {};
      if (!acc[mainKey][specificKey]) acc[mainKey][specificKey] = [];
      acc[mainKey][specificKey].push(question);
    }
    return acc;
  }, {});

  return {
    allQuestions: allQuestionsCache,
    byCategory: questionsBySubCategoryCache,
    scenarios: scenariosCache,
  };
}

/**
 * Calculates the learner's strengths and weaknesses based on aggregated quiz data.
 * Analyzes performance across different sub-categories (topics).
 * @returns {Promise<{strengths: Array<{name: string, percentage: number, total: number}>, weaknesses: Array<{name: string, percentage: number, total: number}>}>}
 */
export async function calculateStrengthsAndWeaknesses() {
  const allProgress = await getDetailedProgressForAllQuizzes();
  const topicStats = {};

  allProgress.forEach((quiz) => {
    if (!quiz.userAnswers) return;

    quiz.userAnswers.forEach((answer) => {
      if (!answer) return;

      // Determine the topic name(s)
      // Prioritize specific sub-category to align with sub-category-data.js structure
      let topics = [];

      if (answer.subCategory) {
        if (typeof answer.subCategory === "object") {
          if (answer.subCategory.specific) {
            if (Array.isArray(answer.subCategory.specific)) {
              topics = answer.subCategory.specific;
            } else {
              topics = [answer.subCategory.specific];
            }
          } else if (answer.subCategory.main) {
            topics = [answer.subCategory.main];
          }
        } else if (typeof answer.subCategory === "string") {
          topics = [answer.subCategory];
        }
      } else if (quiz.subCategory) {
        // Fallback to quiz level subCategory
        topics = [quiz.subCategory];
      }

      if (topics.length === 0) topics = ["General"];

      topics.forEach(topicName => {
        // Clean up topic name (remove prefixes like "บทที่ 1: ")
        const cleanName = topicName.replace(/^บทที่\s*\d+:\s*/, "").trim();

        if (!topicStats[cleanName]) {
          topicStats[cleanName] = { correct: 0, total: 0 };
        }

        topicStats[cleanName].total++;
        if (answer.isCorrect) {
          topicStats[cleanName].correct++;
        }
      });
    });
  });

  // Convert to array and calculate percentages
  const topics = Object.entries(topicStats).map(([name, stats]) => ({
    name,
    correct: stats.correct,
    total: stats.total,
    percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
  }));

  // Filter out topics with too few questions to be significant (e.g., < 3 questions)
  const significantTopics = topics.filter((t) => t.total >= 3);

  // Sort by percentage descending
  significantTopics.sort((a, b) => b.percentage - a.percentage);

  // Top 3 Strengths (Best 3)
  const strengths = significantTopics.slice(0, 3);

  // Bottom 3 Weaknesses (Worst 3, sorted ascending)
  // We take the whole list, sort ascending, then take top 3
  const weaknesses = [...significantTopics]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  return { strengths, weaknesses };
}

/**
 * Returns the correct course code for the current semester.
 * @returns {string} The course code ('ว30161' or 'ว30162').
 */
export function getCurrentCourseCode() {
  return getCurrentSemester() === '2/2568' ? 'ว30162' : 'ว30161';
}
