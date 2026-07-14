import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { quizPrefixInfo } from '../data/sub-category-data.js';
import { categoryDetails } from '../scripts/data-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const quizListPath = path.join(dataDir, 'quizzes-list.js');

/**
 * Recursively finds all files in a directory.
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

/**
 * Counts the number of questions in a given file content.
 * @param {string} content - The content of the data file.
 * @returns {number} The number of questions found.
 */
function countQuestionsInContent(content) {
    // This regex is a more robust heuristic to count questions.
    // It matches both `question:` (unquoted) and `"question":` (quoted) keys.
    const matches = content.match(/(?:"question"|question)\s*:/g);
    return matches ? matches.length : 0;
}

/**
 * Extracts details like title, description, and subCategory from file content.
 * @param {string} content - The content of the data file.
 * @param {string} id - The ID of the quiz, used for default values.
 * @returns {{title: string, description: string, subCategory: string}}
 */
function extractDetailsAndSubCategory(content, id) {
    const defaults = {
        title: `ชุดข้อสอบ: ${id} (โปรดแก้ไข)`,
        description: "คำอธิบายสำหรับชุดข้อสอบนี้",
        subCategory: "Uncategorized" // Default subCategory
    };

    // Use JSDoc @description for title as it's more consistent and descriptive
    const titleMatch = content.match(/@description\s+(.*)/);
    if (titleMatch && titleMatch[1]) {
        defaults.title = titleMatch[1].trim();
    } else {
        // Fallback to @fileoverview if @description is missing
        const fileoverviewMatch = content.match(/@fileoverview\s+(.*)/);
        if (fileoverviewMatch && fileoverviewMatch[1]) {
            defaults.title = fileoverviewMatch[1].trim();
        }
    }

    // Use a more specific JSDoc tag for description if available, otherwise fallback
    const descMatch = content.match(/@desc\s+(.*)/) || content.match(/@description\s+(.*)/);
    if (descMatch && descMatch[1]) {
        defaults.description = descMatch[1].trim();
    }

    // Regex for the first subCategory.main to determine the chapter
    const subCatMatch = content.match(/main:\s*"([^"]+)"/);
    if (subCatMatch && subCatMatch[1]) {
        defaults.subCategory = subCatMatch[1].trim();
    } else {
        // Fallback for files that might not have the object structure yet
        // A simple heuristic: if the title contains "บทที่", use it.
        if (defaults.title.includes('บทที่')) {
            defaults.subCategory = defaults.title;
        }
    }

    return defaults;
}

/**
 * Guesses the category and icon for a new quiz based on its ID.
 * @param {string} id - The ID of the new quiz.
 * @returns {{category: string, icon: string}}
 */
function guessCategoryAndIcon(id) {
    // If id contains a slash, extract the basename for guessing prefix
    const basename = id.includes('/') ? id.substring(id.lastIndexOf('/') + 1) : id;
    const lowerId = basename.toLowerCase();
    // Find the longest matching prefix to handle cases like 'ess_adv_m4' vs 'ess_adv_m'.
    const matchingPrefix = Object.keys(quizPrefixInfo)
        .filter(p => lowerId.startsWith(p))
        .sort((a, b) => b.length - a.length)[0]; // Sort by length descending and take the first

    const info = quizPrefixInfo[matchingPrefix] || { mainCategory: 'Uncategorized', icon: './assets/icons/study.png' }; // Provide a default
    return { category: info.mainCategory, icon: info.icon };
}

/**
 * Main function to update the quiz list.
 */
async function updateQuizList() {
    console.log('🚀 Checking for new and existing quiz data files...');

    // Dynamically import the list to work with the actual JS array
    try {
        const quizListUrl = `${pathToFileURL(quizListPath).href}?v=${Date.now()}`;
        const { quizList } = await import(quizListUrl);

        // Use a case-insensitive map to prevent duplicates from different casing
        const quizMap = new Map(quizList.map(q => [q.id.toLowerCase(), q]));
        const existingIds = new Set(quizMap.keys()); // This set now contains lowercase IDs

        const allFiles = getAllFiles(dataDir);
        const dataFiles = allFiles.filter(filePath => {
            const fileName = path.basename(filePath);
            return fileName.endsWith('-data.js') &&
                !fileName.startsWith('template-') &&
                !fileName.startsWith('sub-category-') &&
                !fileName.startsWith('scores-data') &&
                !fileName.startsWith('tempCodeRunnerFile');
        });

        let quizzesAdded = 0;
        const addedQuizSummaries = [];
        let quizzesUpdated = 0;
        const updatedQuizSummaries = [];

        for (const filePath of dataFiles) {
            const relativePath = path.relative(dataDir, filePath).replace(/\\/g, '/');
            const id = relativePath.replace('-data.js', '');
            const lowerId = id.toLowerCase();
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const actualCount = countQuestionsInContent(content);

                if (actualCount === 0) {
                    console.warn(`  - ⚠️ Skipping "${id}" because no questions were found.`);
                    continue;
                }

                const details = extractDetailsAndSubCategory(content, id);
                const { category, icon } = guessCategoryAndIcon(id);

                if (existingIds.has(lowerId)) {
                    // UPDATE logic for existing quizzes
                    const existingQuiz = quizMap.get(lowerId);

                    if (existingQuiz.id !== id) {
                        console.warn(`  - ⚠️  Case mismatch found for ID "${id}". Matching with existing ID "${existingQuiz.id}". Please ensure consistent casing.`);
                    }

                    const changes = [];

                    if (existingQuiz.amount !== actualCount) {
                        changes.push(`amount (${existingQuiz.amount} -> ${actualCount})`);
                        existingQuiz.amount = actualCount;
                    }

                    if (changes.length > 0) {
                        quizzesUpdated++;
                        updatedQuizSummaries.push({ id: id, changes: changes.join(', ') });
                    }
                } else {
                    // ADD logic for new quizzes
                    const newEntry = {
                        id: id,
                        title: details.title,
                        amount: actualCount,
                        description: details.description,
                        url: `./quiz/index.html?id=${id}`,
                        storageKey: `quizState-${id}`,
                        icon: icon,
                        altText: `ไอคอนสำหรับ ${id}`,
                        category: category,
                        subCategory: details.subCategory
                    };
                    quizList.push(newEntry);
                    quizzesAdded++;
                    addedQuizSummaries.push({ id, title: details.title, amount: actualCount });
                }
            } catch (error) {
                console.error(`  - ❌ Error processing ${file}:`, error);
            }
        }

        const changesMade = quizzesAdded > 0 || quizzesUpdated > 0;

        if (changesMade) {
            // Sort the final list by category order and then by title
            quizList.sort((a, b) => {
                const orderA = categoryDetails[a.category]?.order || 99;
                const orderB = categoryDetails[b.category]?.order || 99;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                return a.title.localeCompare(b.title, 'th');
            });

            const newFileContent = `\nexport const quizList = ${JSON.stringify(quizList, null, 2)};\n`;
            fs.writeFileSync(quizListPath, newFileContent, 'utf8');

            console.log(`\n✅ Successfully updated quizzes-list.js.`);
            if (quizzesAdded > 0) {
                console.log(`   - Added: ${quizzesAdded} new quiz(zes).`);
                addedQuizSummaries.forEach(summary => {
                    console.log(`     - "${summary.title}" (${summary.id}): ${summary.amount} questions.`);
                });
            }

            if (quizzesUpdated > 0) {
                console.log(`   - Updated: ${quizzesUpdated} quiz(zes).`);
                updatedQuizSummaries.forEach(summary => {
                    console.log(`     - "${summary.id}": [${summary.changes}]`);
                });
            }

            if (quizzesAdded > 0) {
                console.log('   🔔 Please review the new entries in the file.');
            }
        } else {
            console.log('\n👍 No new quizzes to add or update. Your list is up to date.');
        }

    } catch (error) {
        console.error(`❌ A critical error occurred: Could not load or process ${quizListPath}.`, error);
    }
}

updateQuizList();