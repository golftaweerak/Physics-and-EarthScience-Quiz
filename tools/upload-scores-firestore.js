/**
 * @fileoverview CLI Script to parse student score Excel sheets and upload them to Cloud Firestore.
 * Usage:
 *   node tools/upload-scores-firestore.js --semester 1-2569
 *   node tools/upload-scores-firestore.js --semester 2-2568
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import xlsx from 'xlsx';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Configuration (from scripts/firebase-config.js)
const firebaseConfig = {
    apiKey: "AIzaSyBwfM8-ksMj17-K5fWMjn83U9MRO0ZvL2Y",
    authDomain: "physics-and-earthscience-quiz.firebaseapp.com",
    projectId: "physics-and-earthscience-quiz",
    storageBucket: "physics-and-earthscience-quiz.firebasestorage.app",
    messagingSenderId: "306857385894",
    appId: "1:306857385894:web:b4179e9f8818d80b53f967",
    measurementId: "G-QWQGBGNPDJ"
};

// Initialize Firebase Client (runs unauthenticated — requires open Firestore rules during upload)
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Retrieve command-line arguments
const args = process.argv.slice(2);
let semesterArg = '';
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--semester' && args[i + 1]) {
        semesterArg = args[i + 1].trim();
        break;
    }
}

// Map the command line semester format to different configuration parameters
const CONFIG = {
    '1-2569': {
        inputFile: '69-EarthScience-Term1.xlsx',
        collectionName: 'student_scores',
        semesterKey: '1/2569',
        sheetName: 'SUMMARY',
        columnMapping: {
            'id': 'id',
            'room': 'room',
            'ordinal': 'ordinal',
            'title': 'title',
            'names': 'firstName',
            'surname': 'lastName',
            'ก่อนกลางภาค [25]': 'ก่อนกลางภาค [25]',
            'กลางภาค [20]': 'กลางภาค [20]',
            'หลังกลางภาค [25]': 'หลังกลางภาค [25]',
            'ปลายภาค': 'ปลายภาค [30]',
            'Grade': 'เกรด',
            'ซ่อมมั้ย': 'ซ่อมมั้ย',
            'ก่อนปลายภาค [70]': 'ก่อนปลายภาค [70]',
            'รวม [100]': 'รวม [100]',
            'บท 1 [10]': 'บท 1 [10]',
            'บท 2 [10]': 'บท 2 [10]',
            'บท 3 [5]': 'บท 3 [5]',
            'บท 4 [10]': 'บท 4 [10]',
            'นำเสนอ [5]': 'นำเสนอ [5]',
            'บท 5 [10]': 'บท 5 [10]',
        },
        baseInfoColumns: [
            'sorder', 'room', 'ordinal', 'id', 'title', 'names', 'surname', 'email', 'ซ่อมมั้ย',
            'ห้อง', 'n', 'ข้อกา [30]', 'ข้อเขียน [10]', 'ตก (คน)', 'ผ่าน (คน)',
        ]
    },
    '2-2568': {
        inputFile: '68-EarthScience-Term2.xlsx',
        collectionName: 'student_scores',
        semesterKey: '2/2568',
        sheetName: 'SUMMARY',
        columnMapping: {
            'id': 'id',
            'room': 'room',
            'ordinal': 'ordinal',
            'title': 'title',
            'names': 'firstName',
            'surname': 'lastName',
            'กลางภาค [20]': 'กลางภาค',
            'mid [35]': 'กลางภาคข้อกา',
            'mid [5]': 'กลางภาคข้อเขียน',
            'ปลายภาค [30]': 'ปลายภาค',
            'Grade': 'เกรด',
            'ซ่อมมั้ย': 'ซ่อมกลางภาค',
        },
        baseInfoColumns: [
            'id', 'room', 'ordinal', 'title', 'names', 'surname',
        ]
    }
};



// Helper to determine if an assignment is submitted
function isSubmitted(score) {
    if (score === null || score === undefined) return false;
    const scoreStr = String(score).trim().toLowerCase();
    return scoreStr !== '' && scoreStr !== '-' && scoreStr !== 'ยังไม่ส่ง';
}

// Helper to calculate student completion
function calculateStudentCompletion(student) {
    const TRACKABLE_KEYWORDS = ['กิจกรรม', 'แบบฝึก', 'quiz', 'ท้ายบท', 'ใบงาน'];
    if (!student.assignments || !Array.isArray(student.assignments)) {
        return { submitted: 0, total: 0, percentage: '0', missing: 0 };
    }

    const trackableAssignments = student.assignments.filter(assignment =>
        assignment && typeof assignment.name === 'string' && TRACKABLE_KEYWORDS.some(keyword => assignment.name.toLowerCase().includes(keyword))
    );

    const submittedCount = trackableAssignments.filter(a => isSubmitted(a.score)).length;
    const totalCount = trackableAssignments.length;
    const percentage = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
    const missingCount = totalCount - submittedCount;

    return {
        submitted: submittedCount,
        total: totalCount,
        percentage: percentage.toFixed(0),
        missing: missingCount
    };
}

// Local implementation of calculateOverallSummary
function calculateOverallSummary(scores, currentSemester) {
    const totalStudents = scores.length;
    let totalScoreSum = 0;
    let validScoresCount = 0;
    const gradeDistribution = {};
    const summaryByRoom = {};

    let highestScore = -Infinity;
    let lowestScore = Infinity;
    let highestMidtermScore = -Infinity;
    let lowestMidtermScore = Infinity;
    let totalMidtermScoreSum = 0, validMidtermScoresCount = 0, totalPassCount = 0, totalFailCount = 0;
    const allMidtermScores = [];

    let totalTrackableAssignments = 0;
    let totalSubmittedAssignments = 0;
    let studentsWithNoMissing = 0, studentsWithMissing = 0;

    const DATA_KEYS = {
        TOTAL_SCORE: currentSemester === '2/2568' ? 'คะแนนรวม' : 'รวม [100]',
        GRADE: 'เกรด',
        ROOM: 'room',
        ORDINAL: 'ordinal'
    };

    scores.forEach(student => {
        // Normalization
        if (currentSemester === '2/2568') {
            const findScore = (keywords) => {
                if (!Array.isArray(keywords)) keywords = [keywords];
                if (!student.assignments) return '-';
                const assignment = student.assignments.find(a => a && a.name && keywords.some(k => a.name.toLowerCase().includes(k.toLowerCase())));
                return assignment ? assignment.score : '-';
            };

            let totalScoreValue = student[DATA_KEYS.TOTAL_SCORE];
            const col1 = findScore(['Column1', 'รวม [100]']);
            if (col1 !== '-') totalScoreValue = parseFloat(col1);

            student['คะแนนรวม'] = totalScoreValue;
            student[DATA_KEYS.TOTAL_SCORE] = totalScoreValue;

            let midScore = findScore(['MID', 'รวมกลางภาค']);
            if (midScore === '-' || midScore === '') {
                const p1 = parseFloat(student['กลางภาคข้อกา']);
                const p2 = parseFloat(student['กลางภาคข้อเขียน']);
                if (!isNaN(p1) || !isNaN(p2)) {
                    midScore = ((isNaN(p1) ? 0 : p1) + (isNaN(p2) ? 0 : p2));
                }
            }
            student['คะแนนกลางภาค'] = midScore;

            let remedial = findScore(['ซ่อมแล้ว', 'ซ่อมกลางภาค']);
            if (remedial === '-' || remedial === '') remedial = findScore('ซ่อมมั้ย');
            student['การซ่อมกลางภาค'] = remedial;
            student['คะแนนปลายภาค'] = findScore(['ปลายภาค', 'Final']);
        } else {
            if (student['กลางภาค [20]'] !== undefined) {
                student['คะแนนกลางภาค'] = student['กลางภาค [20]'];
            }
        }

        // Calculation
        const totalScore = student[DATA_KEYS.TOTAL_SCORE];
        if (typeof totalScore === 'number') {
            totalScoreSum += totalScore;
            validScoresCount++;
            if (totalScore > highestScore) highestScore = totalScore;
            if (totalScore < lowestScore) lowestScore = totalScore;
        }

        const grade = student[DATA_KEYS.GRADE] ?? 'N/A';
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        const numericGrade = parseFloat(grade);

        const room = student[DATA_KEYS.ROOM] || 'N/A';
        if (!summaryByRoom[room]) {
            summaryByRoom[room] = {
                studentCount: 0,
                totalScoreSum: 0,
                validScoresCount: 0,
                totalGradeSum: 0,
                validGradesCount: 0,
                totalTrackable: 0,
                totalSubmitted: 0,
                totalMidtermScoreTerm2: 0,
                validMidtermScoresCountTerm2: 0,
                highestMidtermScore: -Infinity,
                lowestMidtermScore: Infinity,
                passCountTerm2: 0,
                failCountTerm2: 0,
                midtermScoresList: [],
                gradeDistribution: {}
            };
        }
        summaryByRoom[room].studentCount++;

        // Calculate room grade distribution
        summaryByRoom[room].gradeDistribution[grade] = (summaryByRoom[room].gradeDistribution[grade] || 0) + 1;

        if (typeof totalScore === 'number') {
            summaryByRoom[room].totalScoreSum += totalScore;
            summaryByRoom[room].validScoresCount++;
        }
        if (!isNaN(numericGrade)) {
            summaryByRoom[room].totalGradeSum += numericGrade;
            summaryByRoom[room].validGradesCount++;
        }

        const completion = calculateStudentCompletion(student);
        summaryByRoom[room].totalTrackable += completion.total;
        summaryByRoom[room].totalSubmitted += completion.submitted;

        const midtermScore = parseFloat(student['คะแนนกลางภาค']);
        if (!isNaN(midtermScore)) {
            summaryByRoom[room].totalMidtermScoreTerm2 += midtermScore;
            summaryByRoom[room].validMidtermScoresCountTerm2++;
            summaryByRoom[room].midtermScoresList.push(midtermScore);

            if (midtermScore > summaryByRoom[room].highestMidtermScore) {
                summaryByRoom[room].highestMidtermScore = midtermScore;
            }
            if (midtermScore < summaryByRoom[room].lowestMidtermScore) {
                summaryByRoom[room].lowestMidtermScore = midtermScore;
            }

            if (midtermScore >= 12) {
                summaryByRoom[room].passCountTerm2++;
            } else {
                summaryByRoom[room].failCountTerm2++;
            }

            totalMidtermScoreSum += midtermScore;
            validMidtermScoresCount++;
            allMidtermScores.push(midtermScore);
            if (midtermScore > highestMidtermScore) highestMidtermScore = midtermScore;
            if (midtermScore < lowestMidtermScore) lowestMidtermScore = midtermScore;

            if (midtermScore >= 12) totalPassCount++;
            else totalFailCount++;
        }

        totalTrackableAssignments += completion.total;
        totalSubmittedAssignments += completion.submitted;

        if (completion.missing > 0) {
            studentsWithMissing++;
        } else if (completion.total > 0) {
            studentsWithNoMissing++;
        }
    });

    // Calculate room averages and SDs
    for (const room in summaryByRoom) {
        const roomData = summaryByRoom[room];
        roomData.averageScore = roomData.validScoresCount > 0
            ? parseFloat((roomData.totalScoreSum / roomData.validScoresCount).toFixed(2))
            : 'N/A';
        roomData.averageGrade = roomData.validGradesCount > 0
            ? parseFloat((roomData.totalGradeSum / roomData.validGradesCount).toFixed(2))
            : 'N/A';
        roomData.completionPercentage = roomData.totalTrackable > 0
            ? parseFloat(((roomData.totalSubmitted / roomData.totalTrackable) * 100).toFixed(0))
            : 0;
        roomData.averageMidtermTerm2 = roomData.validMidtermScoresCountTerm2 > 0
            ? parseFloat((roomData.totalMidtermScoreTerm2 / roomData.validMidtermScoresCountTerm2).toFixed(2))
            : 'N/A';

        if (roomData.validMidtermScoresCountTerm2 > 0) {
            const avgMidterm = roomData.totalMidtermScoreTerm2 / roomData.validMidtermScoresCountTerm2;
            const sumOfSquares = roomData.midtermScoresList.reduce((sum, val) => sum + Math.pow(val - avgMidterm, 2), 0);
            roomData.midtermSD = parseFloat(Math.sqrt(sumOfSquares / roomData.validMidtermScoresCountTerm2).toFixed(2));
        } else {
            roomData.midtermSD = 'N/A';
        }

        roomData.highestMidtermScore = roomData.highestMidtermScore === -Infinity ? 'N/A' : roomData.highestMidtermScore;
        roomData.lowestMidtermScore = roomData.lowestMidtermScore === Infinity ? 'N/A' : roomData.lowestMidtermScore;

        // Clean up list and internal sums to save space in summary document
        delete roomData.midtermScoresList;
    }

    const overallAverageScore = validScoresCount > 0 ? parseFloat((totalScoreSum / validScoresCount).toFixed(2)) : 0;
    const overallAverageMidtermScore = validMidtermScoresCount > 0 ? parseFloat((totalMidtermScoreSum / validMidtermScoresCount).toFixed(2)) : 'N/A';
    const overallMidtermPassPercentage = (totalPassCount + totalFailCount) > 0 ? parseFloat(((totalPassCount / (totalPassCount + totalFailCount)) * 100).toFixed(0)) : 'N/A';

    let overallMidtermSD = 'N/A';
    if (validMidtermScoresCount > 0) {
        const avgMidterm = totalMidtermScoreSum / validMidtermScoresCount;
        const sumOfSquares = allMidtermScores.reduce((sum, val) => sum + Math.pow(val - avgMidterm, 2), 0);
        overallMidtermSD = parseFloat(Math.sqrt(sumOfSquares / validMidtermScoresCount).toFixed(2));
    }

    const completionPercentage = totalTrackableAssignments > 0
        ? parseFloat(((totalSubmittedAssignments / totalTrackableAssignments) * 100).toFixed(0))
        : 0;

    return {
        totalStudents,
        averageScore: overallAverageScore,
        completionPercentage,
        highestScore: highestScore === -Infinity ? 0 : highestScore,
        lowestScore: lowestScore === Infinity ? 0 : lowestScore,
        highestMidtermScore: highestMidtermScore === -Infinity ? 0 : highestMidtermScore,
        lowestMidtermScore: lowestMidtermScore === Infinity ? 0 : lowestMidtermScore,
        gradeDistribution,
        averageMidtermScore: overallAverageMidtermScore,
        midtermPassPercentage: overallMidtermPassPercentage,
        midtermSD: overallMidtermSD,
        midtermPassCount: totalPassCount,
        midtermFailCount: totalFailCount,
        studentsWithMissing,
        studentsWithNoMissing,
        summaryByRoom
    };
}

async function uploadSemester(semesterKey) {
    const semConfig = CONFIG[semesterKey];
    if (!semConfig) {
        throw new Error(`Unsupported semester "${semesterKey}".`);
    }

    const xlsxFilePath = path.join(__dirname, '..', 'xlsx', semConfig.inputFile);
    console.log(`\n🚀 Starting Firestore uploader for Semester ${semConfig.semesterKey}...`);
    console.log(`📂 Excel File: ${xlsxFilePath}`);

    if (!fs.existsSync(xlsxFilePath)) {
        throw new Error(`File not found at path: ${xlsxFilePath}`);
    }

    const workbook = xlsx.readFile(xlsxFilePath);
    const actualSheetName = workbook.SheetNames.find(name => name.toLowerCase() === semConfig.sheetName.toLowerCase());

    if (!actualSheetName) {
        throw new Error(`Sheet "${semConfig.sheetName}" not found in Excel workbook.`);
    }

    const worksheet = workbook.Sheets[actualSheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
        throw new Error('Workbook sheet is empty.');
    }

    console.log(`📊 Loaded ${rows.length} rows from Excel sheet.`);

    const allHeaders = Object.keys(rows[0]);
    const headerMap = {};
    allHeaders.forEach(h => {
        headerMap[h.toLowerCase().trim()] = h;
    });

    const lowerCaseSummaryKeys = new Set(Object.keys(semConfig.columnMapping).map(k => k.toLowerCase()));
    const assignmentHeaders = allHeaders.filter(h => {
        const lowerH = h.toLowerCase().trim();
        return (
            lowerH !== '' &&
            !semConfig.baseInfoColumns.includes(lowerH) &&
            !lowerCaseSummaryKeys.has(lowerH)
        );
    });

    if (!headerMap['id']) {
        throw new Error("Crucial 'id' column not found in Excel sheet.");
    }

    const studentsList = [];
    for (const row of rows) {
        const studentId = row[headerMap['id']] ? String(row[headerMap['id']]).trim() : '';
        if (!/^\d{5}$/.test(studentId)) {
            continue; // Skip non-student rows
        }

        const finalStudent = { assignments: [] };

        // Map columns
        for (const csvHeader in semConfig.columnMapping) {
            const jsonKey = semConfig.columnMapping[csvHeader];
            const actualHeader = headerMap[csvHeader.toLowerCase().trim()];
            if (!actualHeader) continue;

            const rawValue = row[actualHeader] !== undefined ? String(row[actualHeader]).trim() : null;

            if (['เกรด', 'room', 'ordinal', 'ซ่อมมั้ย', 'ซ่อมกลางภาค'].includes(jsonKey)) {
                finalStudent[jsonKey] = rawValue;
            } else if (!['id', 'title', 'firstName', 'lastName'].includes(jsonKey)) {
                const numValue = parseFloat(rawValue);
                finalStudent[jsonKey] = isNaN(numValue) ? rawValue : numValue;
            }
        }

        const title = String(row[headerMap['title']] || '').trim();
        const firstName = String(row[headerMap['names']] || '').trim();
        const lastName = String(row[headerMap['surname']] || row[headerMap['surmane']] || '').trim();

        finalStudent.id = studentId;
        finalStudent.name = `${title}${firstName} ${lastName}`.trim().replace(/\s+/g, ' ');
        finalStudent.firstName = firstName;
        finalStudent.lastName = lastName;

        assignmentHeaders.forEach(assignmentHeader => {
            const value = row[assignmentHeader] !== undefined ? String(row[assignmentHeader]).trim() : '-';
            finalStudent.assignments.push({ name: assignmentHeader, score: value });
        });

        studentsList.push(finalStudent);
    }

    console.log(`✅ Parsed ${studentsList.length} valid student records.`);
    console.log('📈 Calculating summary statistics...');
    const summaries = calculateOverallSummary(studentsList, semConfig.semesterKey);

    console.log('☁️ Uploading student records to Firestore...');
    let batch = writeBatch(db);
    let count = 0;
    let batchIndex = 1;

    for (const student of studentsList) {
        const studentDocRef = doc(db, 'student_scores', student.id);

        const semesterPayload = {};
        for (const key in student) {
            if (!['id', 'name', 'firstName', 'lastName', 'room', 'ordinal', 'assignments'].includes(key)) {
                if (student[key] !== undefined) {
                    semesterPayload[key] = student[key];
                }
            }
        }
        student.assignments.forEach(a => {
            if (a.score !== undefined) {
                semesterPayload[a.name] = a.score;
            }
        });

        // Clean up any undefined values to satisfy Firestore payload constraints
        for (const k in semesterPayload) {
            if (semesterPayload[k] === undefined) {
                delete semesterPayload[k];
            }
        }

        const docData = {
            id: student.id || null,
            name: student.name || null,
            firstName: student.firstName || null,
            lastName: student.lastName || null,
            room: student.room || null,
            ordinal: student.ordinal || null,
            semesters: {
                [semConfig.semesterKey]: semesterPayload
            }
        };

        // Using setDoc(merge: true) to avoid overwriting other semesters if they exist in the DB!
        batch.set(studentDocRef, docData, { merge: true });
        count++;

        if (count === 500) {
            console.log(`   Committing batch #${batchIndex}...`);
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
            batchIndex++;
        }
    }

    if (count > 0) {
        console.log(`   Committing batch #${batchIndex}...`);
        await batch.commit();
    }
    console.log(`✅ Uploaded all student records successfully.`);

    // Upload statistical summaries document
    console.log('☁️ Uploading pre-computed statistics summaries to Firestore...');
    const summaryDocRef = doc(db, 'scores_summaries', semesterKey);
    const summaryPayload = {
        lastUpdated: new Date().toISOString(),
        ...summaries
    };

    await setDoc(summaryDocRef, summaryPayload);
    console.log(`✅ Uploaded statistical summary for Semester ${semesterKey} successfully.`);
}

const rulesPath = path.join(__dirname, '..', 'firestore.rules');
let originalRules = '';

function openRules() {
    try {
        if (!fs.existsSync(rulesPath)) {
            console.log('⚠️ firestore.rules file not found. Skipping auto rules deployment.');
            return false;
        }
        originalRules = fs.readFileSync(rulesPath, 'utf8');

        console.log('🔓 Automatically opening Firestore Rules for write access...');
        const openedRules = originalRules
            .replace(/match\s*\/student_scores\/\{studentId\}\s*\{\s*allow\s*read\s*:\s*if\s*true\s*;\s*allow\s*write\s*:\s*if\s*false\s*;\s*\}/i,
                `match /student_scores/{studentId} {
      allow read: if true;
      allow write: if true;
    }`)
            .replace(/match\s*\/scores_summaries\/\{semesterId\}\s*\{\s*allow\s*read\s*:\s*if\s*true\s*;\s*allow\s*write\s*:\s*if\s*false\s*;\s*\}/i,
                `match /scores_summaries/{semesterId} {
      allow read: if true;
      allow write: if true;
    }`);

        fs.writeFileSync(rulesPath, openedRules, 'utf8');
        execSync('npx firebase deploy --only firestore:rules', { stdio: 'inherit' });
        console.log('✅ Firestore Rules deployed (Open).');
        return true;
    } catch (err) {
        console.error('❌ Failed to deploy open rules. Please verify Firebase CLI is logged in and configured.', err);
        if (originalRules) {
            fs.writeFileSync(rulesPath, originalRules, 'utf8');
        }
        return false;
    }
}

function closeRules() {
    try {
        if (!originalRules) return;
        console.log('🔒 Restoring and deploying secure Firestore Rules...');
        fs.writeFileSync(rulesPath, originalRules, 'utf8');
        execSync('npx firebase deploy --only firestore:rules', { stdio: 'inherit' });
        console.log('✅ Firestore Rules deployed (Locked).');
    } catch (err) {
        console.error('❌ Failed to restore rules. Please restore firestore.rules manually and run "npx firebase deploy --only firestore:rules"!', err);
    }
}

async function run() {
    let rulesOpened = false;
    try {
        rulesOpened = openRules();

        if (semesterArg) {
            await uploadSemester(semesterArg);
        } else {
            console.log('ℹ️ No semester specified via --semester. Automatically uploading all configured semesters...');
            for (const sem of Object.keys(CONFIG)) {
                await uploadSemester(sem);
            }
        }
        console.log('\n🎉 All Firestore Migrations Completed Successfully!');
    } catch (err) {
        console.error('❌ Error uploading scores:', err);
        process.exit(1);
    } finally {
        if (rulesOpened) {
            closeRules();
        }
        process.exit(0);
    }
}

run();
