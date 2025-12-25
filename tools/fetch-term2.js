/**
 * สคริปต์สำหรับดาวน์โหลดไฟล์ Excel ภาคเรียนที่ 2 จาก SharePoint (แบบ Public Link)
 * วิธีใช้: รันคำสั่ง 'node tools/fetch-term2.js' ใน Terminal
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertTerm2Scores } from './convert-scores-term2.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ลิงก์ที่คุณให้มา (เติม ?download=1 เพื่อขอไฟล์โดยตรง)
const googleSheetLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTZ_j7TUPhcOcoex1eRgWCiurCx1ieLFJeWPH0ej81-QUKWoRQY8vlBwt4c_Uy2N-jwuUT0zWnj99c/pub?gid=0&single=true&output=csv";

// ตำแหน่งที่จะบันทึกไฟล์ (โฟลเดอร์ xlsx ต้องมีอยู่แล้ว)
const outputDir = path.join(__dirname, '../csv');
const outputPath = path.join(outputDir, '68-EarthScience-Term2.csv');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`กำลังดาวน์โหลดไฟล์ CSV จาก Google Sheets...`);
console.log(`URL: ${googleSheetLink}`);

const downloadFile = (url, dest) => {
    const fileStream = fs.createWriteStream(dest);

    https.get(url, (response) => {
        // Handle Redirects (301, 302, 307, etc.)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            fileStream.close();
            fs.unlink(dest, () => {}); // Delete partial file
            const redirectUrl = new URL(response.headers.location, url).href;
            console.log(`Redirecting (Status: ${response.statusCode}) to: ${redirectUrl}`);
            downloadFile(redirectUrl, dest); // Recursive call
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`ดาวน์โหลดไม่สำเร็จ Status Code: ${response.statusCode}`);
            fileStream.close();
            fs.unlink(dest, () => {}); // ลบไฟล์ที่ว่างเปล่า
            return;
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log('✅ ดาวน์โหลดเสร็จสิ้น!');
            console.log(`บันทึกไฟล์ไว้ที่: ${dest}`);
            console.log('\n--- ขั้นตอนที่ 2: เริ่มการแปลงข้อมูลเป็นไฟล์ JavaScript ---');
            convertTerm2Scores();
        });
    }).on('error', (e) => {
        console.error(`เกิดข้อผิดพลาดในการดาวน์โหลด: ${e.message}`);
        fileStream.close();
        fs.unlink(dest, () => {});
    });
};

downloadFile(googleSheetLink, outputPath);
