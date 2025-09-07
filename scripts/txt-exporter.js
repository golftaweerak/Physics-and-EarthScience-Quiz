import { EARTH_SCIENCE_BASIC_SYLLABUS, PHYSICS_SYLLABUS } from '../data/sub-category-data.js';

/**
 * Finds the short learning outcome code (e.g., "ว 3.1 ม.6/1") for a given question.
 * @param {object} question - The question object.
 * @param {string} categoryKey - The main category key of the quiz (e.g., 'PhysicsM4').
 * @returns {string} The formatted code in parentheses, or an empty string.
 */
function getIndicatorCode(question, categoryKey) {
    if (!question.subCategory || typeof question.subCategory !== 'object' || !categoryKey) {
        return '';
    }

    const { main: mainCat, specific: specificCat } = question.subCategory;
    let learningOutcome = '';

    if (categoryKey === 'EarthSpaceScienceBasic') {
        for (const unit of EARTH_SCIENCE_BASIC_SYLLABUS.units) {
            const chapter = unit.chapters.find(ch => ch.title === mainCat);
            if (chapter && (chapter.specificTopics || []).includes(specificCat)) {
                if (chapter.learningOutcomes && chapter.learningOutcomes.length > 0) {
                    learningOutcome = chapter.learningOutcomes[0]; // Assume first outcome is representative
                }
                break;
            }
        }
    } else if (categoryKey.startsWith('PhysicsM')) {
        const gradeKey = categoryKey.replace('PhysicsM', 'm');
        const gradeSyllabus = PHYSICS_SYLLABUS[gradeKey];
        if (gradeSyllabus) {
            const chapter = gradeSyllabus.chapters.find(ch => ch.title === mainCat);
            if (chapter && (chapter.learningOutcomes || []).includes(specificCat)) {
                learningOutcome = specificCat;
            }
        }
    }

    if (learningOutcome) {
        // Regex to find codes like "ว 3.1 ม.6/1" or "1."
        const match = learningOutcome.match(/^(ว\s[\d\.]+\sม\.[\d\/]+)|(^\d+)/);
        if (match) {
            const code = (match[1] || match[2]).trim();
            return ` (${code.replace(/\.$/, '')})`; // Remove trailing dot if it's just a number
        }
    }

    return '';
}

/**
 * Exports the provided quiz data to a plain .txt file.
 * Answers and explanations are explicitly excluded from the export.
 * @param {object} quizData - The quiz data to export.
 * @param {string} quizData.id - The ID of the quiz.
 * @param {string} quizData.title - The title of the quiz.
 * @param {Array<object>} quizData.questions - The array of question objects.
 */
export function exportQuizToTxt(quizData, includeKeyInFilename = false) {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        console.error("No quiz data available to export.");
        alert("ไม่มีข้อมูลสำหรับส่งออก หรือชุดข้อสอบที่เลือกว่างเปล่า");
        return;
    }

    try {
        const categoryKey = quizData.category;
        let textContent = "";
        textContent += `${quizData.title}\n`;
        textContent += `=====================================\n\n`;

        let lastScenarioTitle = null; // Initialize to null

        quizData.questions.forEach((question, index) => {
            if (!question) return; // Skip if question is null or undefined

            // Check if this question belongs to a new scenario
            if (question.scenarioTitle && question.scenarioTitle !== lastScenarioTitle) {
                textContent += `\n--- สถานการณ์: ${question.scenarioTitle} ---\n`;
                if (question.scenarioDescription) {
                    // Clean up HTML tags and extra newlines from description
                    const cleanDescription = question.scenarioDescription.replace(/<[^>]*>?/gm, '').replace(/\n\s*\n/g, '\n').trim();
                    textContent += `${cleanDescription}\n\n`;
                }
                lastScenarioTitle = question.scenarioTitle; // Update last printed scenario
            } else if (!question.scenarioTitle) {
                // Reset lastScenarioTitle if the current question is not part of any scenario
                lastScenarioTitle = null;
            }

            const indicatorCode = getIndicatorCode(question, categoryKey);
            const questionNumber = index + 1;
            textContent += `${questionNumber}.${indicatorCode ? indicatorCode + ' ' : ' '}${question.question || ''}\n`;

            const choices = question.choices || question.options;
            const thaiNumerals = ['ก', 'ข', 'ค', 'ง', 'จ'];
            if (choices && Array.isArray(choices)) {
                choices.forEach((choice, choiceIndex) => {
                    textContent += `   ${thaiNumerals[choiceIndex] || (choiceIndex + 1)}. ${choice || ''}\n`;
                });
            }

            // Include answer and explanation if includeKeyInFilename is true
            if (includeKeyInFilename) {
                if (question.answer) {
                    textContent += `เฉลย: ${question.answer}\n`;
                }
                if (question.explanation) {
                    // Clean up HTML tags and extra newlines from explanation
                    const cleanExplanation = question.explanation.replace(/<[^>]*>?/gm, '').replace(/\n\s*\n/g, '\n').trim();
                    textContent += `คำอธิบาย: ${cleanExplanation}\n`;
                }
            }

            textContent += `\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
                    const filename = `${quizData.id || 'quiz'}${includeKeyInFilename ? '-key' : ''}.txt`;
            a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error("Error creating TXT file:", error);
        alert("เกิดข้อผิดพลาดในการสร้างไฟล์ .txt");
    }
}