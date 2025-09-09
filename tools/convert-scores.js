import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

// --- Configuration ---
const TARGET_SHEET_NAME = 'SUMMARY'; // The name of the sheet to read data from

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
// Define which columns are the main summary scores. You can add or remove lines here.
const summaryColumnMapping = {
  'id': 'id',
  'room': 'room',
  'ordinal': 'ordinal',
  'title': 'title', // temporary, will be combined
  'names': 'firstName', // temporary, will be combined
  'surname': 'lastName', // temporary, will be combined
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
};

// Columns that are NOT assignments and should be completely ignored during processing.
const baseInfoColumns = [
  'sorder', 'room', 'ordinal', 'id', 'title', 'names', 'surname', 'email', 'ซ่อมมั้ย',
  // Add metadata columns from the end of the CSV that are not real assignments
  'ห้อง', 'n', 'ข้อกา [30]', 'ข้อเขียน [10]', 'ตก (คน)', 'ผ่าน (คน)',
];
// --- End Configuration ---

const xlsxFilePath = path.join(__dirname, '..', 'xlsx', '68-EarthScience.xlsx');
const outputJsFilePath = path.join(__dirname, '..', 'data', 'scores-data.js');

console.log('Starting score conversion script...');
console.log(`Looking for input file at: ${xlsxFilePath}`);

try {
  // 1. Read XLSX file
  if (!fs.existsSync(xlsxFilePath)) {
    throw new Error(`Input file not found. Please ensure '68-EarthScience.xlsx' is inside the 'xlsx' folder.`);
  }
  const workbook = xlsx.readFile(xlsxFilePath);

  // Case-insensitive sheet name lookup
  const targetSheetLower = TARGET_SHEET_NAME.toLowerCase();
  const actualSheetName = workbook.SheetNames.find(name => name.toLowerCase() === targetSheetLower);

  if (!actualSheetName) {
    throw new Error(`Sheet named '${TARGET_SHEET_NAME}' not found in the Excel file. Please make sure a sheet with that name exists (case-insensitive).`);
  }
  const worksheet = workbook.Sheets[actualSheetName];

  // 2. Convert sheet to JSON. This library handles parsing automatically.
  const rows = xlsx.utils.sheet_to_json(worksheet);
  if (rows.length === 0) {
    throw new Error(`The sheet '${actualSheetName}' in the Excel file is empty.`);
  }

  const scores = [];
  const allHeaders = Object.keys(rows[0]);

  // Create a case-insensitive map for headers: { lowercase_header: Original_Header }
  const headerMap = {};
  allHeaders.forEach(h => {
    const key = h.toLowerCase().trim();
    // Only map the first occurrence to avoid conflicts with summary columns at the end
    if (!headerMap.hasOwnProperty(key)) headerMap[key] = h;
  });

  // Create a lowercase set of summary mapping keys for efficient filtering
  const lowerCaseSummaryMappingKeys = new Set(Object.keys(summaryColumnMapping).map(k => k.toLowerCase()));

  // Determine which headers are for assignments
  const assignmentHeaders = allHeaders.filter(h => {
    const lowerH = h.toLowerCase().trim();
    return (
      lowerH !== '' &&
      !baseInfoColumns.includes(lowerH) &&
      !lowerCaseSummaryMappingKeys.has(lowerH)
    );
  });

  if (!headerMap['id']) {
    throw new Error("Crucial 'id' column not found in Excel file.");
  }

  for (const row of rows) {
    const studentId = row[headerMap['id']] ? String(row[headerMap['id']]).trim() : '';

    if (!/^\d{5}$/.test(studentId)) {
      console.log(`Skipping non-student row (ID: "${studentId}")`);
      continue;
    }

    const finalStudent = { assignments: [] };

    // Process summary columns
    for (const csvHeader in summaryColumnMapping) {
      const jsonKey = summaryColumnMapping[csvHeader];
      const actualHeader = headerMap[csvHeader.toLowerCase().trim()];
      if (!actualHeader) continue; // Skip if this header doesn't exist in the file

      const rawValue = row[actualHeader] !== undefined ? String(row[actualHeader]).trim() : null;

      if (['เกรด', 'room', 'ordinal', 'ซ่อมมั้ย'].includes(jsonKey)) {
        finalStudent[jsonKey] = rawValue;
      } else if (!['id', 'title', 'firstName', 'lastName'].includes(jsonKey)) {
        const numValue = parseFloat(rawValue);
        finalStudent[jsonKey] = isNaN(numValue) ? null : numValue;
      }
    }

    // Combine name fields
    const title = row[headerMap['title']] ? String(row[headerMap['title']]).trim() : '';
    const firstName = row[headerMap['names']] ? String(row[headerMap['names']]).trim() : '';
    const lastName = row[headerMap['surname']] ? String(row[headerMap['surname']]).trim() : '';
    finalStudent.id = studentId;
    finalStudent.name = `${title}${firstName} ${lastName}`.trim();

    // Process assignment columns
    assignmentHeaders.forEach(assignmentHeader => {
      const value = row[assignmentHeader] !== undefined ? String(row[assignmentHeader]).trim() : '-';
      finalStudent.assignments.push({ name: assignmentHeader, score: value });
    });

    scores.push(finalStudent);
  }

  // 3. Generate JS file content
  const fileContent = `/**
 * @fileoverview ข้อมูลคะแนนเก็บของนักเรียน (สร้างโดยสคริปต์อัตโนมัติ)
 * @description This file is auto-generated. Do not edit directly.
 *              Modify xlsx/68-EarthScience.xlsx and run 'node tools/convert-scores.js' instead.
 */
export const studentScores = ${JSON.stringify(scores, null, 2)};
`;

  // 4. Write to JS file
  fs.writeFileSync(outputJsFilePath, fileContent, 'utf8');

  console.log(`\n✅ Success! Converted ${scores.length} student records.`);
  console.log(`   Input:  ${path.relative(path.join(__dirname, '..'), xlsxFilePath).replace(/\\/g, '/')}`);
  console.log(`   Output: ${path.relative(path.join(__dirname, '..'), outputJsFilePath).replace(/\\/g, '/')}`);

} catch (error) {
  console.error('\n❌ Error during conversion:');
  console.error(error.message);
  console.error('\nPlease ensure that `xlsx/68-EarthScience.xlsx` exists and is formatted correctly.');
}