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
