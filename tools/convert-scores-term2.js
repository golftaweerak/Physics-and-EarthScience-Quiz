import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
      'mid [35]': 'กลางภาคข้อกา',
      'mid [5]': 'กลางภาคข้อเขียน',
      // Assignments will be handled automatically
    };

    // Columns that are part of the student's base info or summary scores, NOT individual assignments.
    const nonAssignmentColumns = new Set(Object.keys(columnMapping).map(k => k.toLowerCase()));
    // --- End Configuration ---

    const csvFilePath = path.join(__dirname, '..', 'csv', '68-EarthScience-Term2.csv');
    const outputJsFilePath = path.join(__dirname, '..', 'data', 'scores-data-2-2568.js');

    console.log('Starting Term 2 score conversion script from CSV...');
    console.log(`Looking for input file at: ${csvFilePath}`);

    try {
      // 1. Read CSV file
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`Input file not found. Please run 'node tools/fetch-term2.js' first.`);
      }
      const csvData = fs.readFileSync(csvFilePath, 'utf-8');

      // 2. Parse CSV
      const lines = csvData.trim().replace(/\r/g, '').split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file is empty or contains only a header.');
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const jsonData = lines.slice(1).map(line => {
          const values = line.split(',');
          const rowObject = {};
          headers.forEach((header, index) => {
              rowObject[header] = values[index] ? values[index].trim() : '';
          });
          return rowObject;
      });

      const scores = [];
      const allHeaders = headers;

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