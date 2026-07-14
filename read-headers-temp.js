import xlsx from 'xlsx';

const xlsxFilePath = './xlsx/69-EarthScience-Term1.xlsx';
const workbook = xlsx.readFile(xlsxFilePath);

console.log('--- All sheets and their headers ---');
workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    if (rawRows.length > 0) {
        console.log(`Sheet "${sheetName}":`);
        console.log(`  Headers (first 15 columns):`, rawRows[0].slice(0, 15));
        console.log(`  Total rows:`, rawRows.length);
    } else {
        console.log(`Sheet "${sheetName}" is empty`);
    }
});
