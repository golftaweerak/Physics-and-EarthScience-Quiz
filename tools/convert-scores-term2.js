import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx'; // เพิ่มการ import xlsx

export function convertTerm2Scores() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // --- Configuration ---
  // Mapping from CSV header to the desired JSON key.
  const columnMapping = {
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
    // Assignments will be handled automatically
  };

  // Columns that are part of the student's base info or summary scores, NOT individual assignments.
  const nonAssignmentColumns = new Set(Object.keys(columnMapping).map(k => k.toLowerCase()));
  // --- End Configuration ---

  // เปลี่ยน path ไปอ่านไฟล์ .xlsx แทน
  const xlsxFilePath = path.join(__dirname, '..', 'xlsx', '68-EarthScience-Term2.xlsx');
  const outputJsFilePath = path.join(__dirname, '..', 'data', 'scores-data-2-2568.js');

  console.log('Starting Term 2 score conversion script from Excel...');
  console.log(`Looking for input file at: ${xlsxFilePath}`);

  try {
    // 1. Read Excel file
    if (!fs.existsSync(xlsxFilePath)) {
      throw new Error(`Input file not found. Please run 'node tools/fetch-term2.js' first.`);
    }

    // ใช้ xlsx library อ่านไฟล์
    const workbook = xlsx.readFile(xlsxFilePath);
    const sheetName = "SUMMARY"; // ระบุชื่อ Sheet ที่ต้องการอ่าน
    if (!workbook.Sheets[sheetName]) {
      throw new Error(`Sheet "${sheetName}" not found in the Excel file.`);
    }
    const worksheet = workbook.Sheets[sheetName];

    // แปลงเป็น JSON (array of objects)
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      throw new Error('Excel file is empty.');
    }

    const scores = [];
    // ดึง Header จาก key ของ object แถวแรก
    const allHeaders = Object.keys(jsonData[0]);

    // Determine which headers are for assignments
    const assignmentHeaders = allHeaders.filter(h => {
      const lowerH = h.toLowerCase().trim();
      return lowerH !== '' && !nonAssignmentColumns.has(lowerH);
    });

    for (const row of jsonData) {
      const studentId = row['id'] ? String(row['id']).trim() : '';
      if (!/^\d{5}$/.test(studentId)) continue; // Skip invalid IDs

      const finalStudent = { assignments: [] };

      // Process mapped columns (summary scores, base info)
      for (const csvHeader in columnMapping) {
        const jsonKey = columnMapping[csvHeader];
        const rawValue = row[csvHeader] !== undefined ? String(row[csvHeader]).trim() : null;

        if (['เกรด', 'room', 'ordinal', 'ซ่อมมั้ย'].includes(jsonKey)) {
          finalStudent[jsonKey] = rawValue;
        } else if (!['id', 'title', 'firstName', 'lastName'].includes(jsonKey)) {
          const numValue = parseFloat(rawValue);
          finalStudent[jsonKey] = isNaN(numValue) ? rawValue : numValue; // Keep text like 'ขาดสอบ'
        }
      }

      // Combine name fields
      const title = row['title'] || '';
      const firstName = row['names'] || '';
      const lastName = row['surname'] || '';
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
    const timestamp = new Date().toISOString();
    const fileContent = `export const lastUpdated = "${timestamp}";\nexport const studentScores = ${JSON.stringify(scores, null, 2)};\n`;

    fs.writeFileSync(outputJsFilePath, fileContent, 'utf8');
    console.log(`\n✅ Success! Converted ${scores.length} student records to ${outputJsFilePath}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

export function convertTerm2_2569Scores() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const summaryColumnMapping = {
    'id': 'id',
    'room': 'room',
    'ordinal': 'ordinal',
    'title': 'title',
    'names': 'firstName',
    'surname': 'lastName',
    'บท 6 [10]': 'บท 6 [10]',
    'บท 7 [10]': 'บท 7 [10]',
    'บท 7 นำเสนอ [5]': 'บท 7 นำเสนอ [5]',
    'ก่อนกลางภาค [25]': 'ก่อนกลางภาค [25]',
    'กลางภาค [20]': 'กลางภาค [20]',
    'บท 8 [10]': 'บท 8 [10]',
    'บทที่ 9 [5]': 'บทที่ 9 [5]',
    'บท 10 [10]': 'บท 10 [10]',
    'หลังกลางภาค [25]': 'หลังกลางภาค [25]',
    'ก่อนปลายภาค [70]': 'ก่อนปลายภาค [70]',
    'ปลายภาค [30]': 'ปลายภาค [30]',
    'ปลายภาค': 'ปลายภาค [30]',
    'รวม [100]': 'รวม [100]',
    'Grade': 'เกรด',
    'ซ่อมมั้ย': 'ซ่อมมั้ย',
  };

  const baseInfoColumns = [
    'sorder', 'room', 'ordinal', 'id', 'title', 'names', 'surname', 'email', 'ซ่อมมั้ย',
    'ห้อง', 'n', 'ข้อกา [30]', 'ข้อเขียน [10]', 'ตก (คน)', 'ผ่าน (คน)',
  ];

  const xlsxFilePath = path.join(__dirname, '..', 'xlsx', '69-EarthScience-Term2.xlsx');
  const outputJsFilePath = path.join(__dirname, '..', 'data', 'scores-data-2-2569.js');

  console.log('Starting Term 2 2569 score conversion script...');
  console.log(`Looking for input file at: ${xlsxFilePath}`);

  try {
    if (!fs.existsSync(xlsxFilePath)) {
      throw new Error(`Input file not found. Please ensure '${path.basename(xlsxFilePath)}' is inside the 'xlsx' folder.`);
    }
    const workbook = xlsx.readFile(xlsxFilePath);

    const candidateSheets = ['summary', 'sheet1'];
    let actualSheetName = null;
    for (const candidate of candidateSheets) {
      actualSheetName = workbook.SheetNames.find(name => name.toLowerCase() === candidate);
      if (actualSheetName) break;
    }

    if (!actualSheetName) {
      throw new Error(`Sheet 'SUMMARY' or 'Sheet1' not found in the Excel file.`);
    }
    const worksheet = workbook.Sheets[actualSheetName];

    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    if (rows.length === 0) {
      throw new Error(`The sheet '${actualSheetName}' in the Excel file is empty.`);
    }

    const scores = [];
    const allHeaders = Object.keys(rows[0]);

    const headerMap = {};
    allHeaders.forEach(h => {
      const key = h.toLowerCase().trim();
      if (!Object.prototype.hasOwnProperty.call(headerMap, key)) headerMap[key] = h;
    });

    const lowerCaseSummaryMappingKeys = new Set(Object.keys(summaryColumnMapping).map(k => k.toLowerCase()));

    const assignmentHeaders = allHeaders.filter(h => {
      const lowerH = h.toLowerCase().trim();
      return (
        lowerH !== '' &&
        !lowerH.startsWith('__empty') &&
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
        continue;
      }

      const finalStudent = { assignments: [] };

      for (const csvHeader in summaryColumnMapping) {
        const jsonKey = summaryColumnMapping[csvHeader];
        const actualHeader = headerMap[csvHeader.toLowerCase().trim()];
        if (!actualHeader) continue;

        const rawValue = row[actualHeader] !== undefined ? String(row[actualHeader]).trim() : null;

        if (['เกรด', 'room', 'ordinal', 'ซ่อมมั้ย'].includes(jsonKey)) {
          finalStudent[jsonKey] = rawValue;
        } else if (!['id', 'title', 'firstName', 'lastName'].includes(jsonKey)) {
          const numValue = parseFloat(rawValue);
          finalStudent[jsonKey] = isNaN(numValue) ? rawValue : numValue;
        }
      }

      const title = String(row[headerMap['title']] ?? '').trim();
      const firstName = String(row[headerMap['names']] ?? '').trim();
      const lastName = String(row[headerMap['surname']] || row[headerMap['surmane']] || '').trim();
      finalStudent.id = studentId;
      finalStudent.name = `${title}${firstName} ${lastName}`.trim().replace(/\s+/g, ' ');

      assignmentHeaders.forEach(assignmentHeader => {
        const value = row[assignmentHeader] !== undefined ? String(row[assignmentHeader]).trim() : '-';
        finalStudent.assignments.push({ name: assignmentHeader, score: value });
      });

      scores.push(finalStudent);
    }

    const timestamp = new Date().toISOString();
    const fileContent = `/**
 * @fileoverview ข้อมูลคะแนนเก็บของนักเรียน (สร้างโดยสคริปต์อัตโนมัติ)
 * @description This file is auto-generated. Do not edit directly.
 *              Modify xlsx/${path.basename(xlsxFilePath)} and run 'node tools/fetch-term2-2569.js' instead.
 */
export const lastUpdated = "${timestamp}";
export const studentScores = ${JSON.stringify(scores, null, 2)};
`;

    fs.writeFileSync(outputJsFilePath, fileContent, 'utf8');

    console.log(`\n✅ Success! Converted ${scores.length} student records.`);
    console.log(`   Input:  ${path.relative(path.join(__dirname, '..'), xlsxFilePath).replace(/\\/g, '/')}`);
    console.log(`   Output: ${path.relative(path.join(__dirname, '..'), outputJsFilePath).replace(/\\/g, '/')}`);

  } catch (error) {
    console.error('\n❌ Error during conversion:');
    console.error(error.message);
    console.error(`\nPlease ensure that \`xlsx/${path.basename(xlsxFilePath)}\` exists and is formatted correctly.`);
  }
}
