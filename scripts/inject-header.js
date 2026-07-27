// scripts/inject-header.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. กำหนดไฟล์ Header ต้นฉบับ
const headerPath = path.join(__dirname, '../components/main_header.html');
const headerContent = fs.readFileSync(headerPath, 'utf8');

// 2. รายชื่อไฟล์ HTML ที่ต้องการอัปเดต
const filesToUpdate = [
    'index.html',

    'profile.html',
    'summary.html',
    'preview.html',
    'edit-scores.html',
    'about.html',
    'simulations.html',
    'simulation-viewer.html'
];

// 3. วนลูปอัปเดตทีละไฟล์
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, '../', file);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // ใช้ Regex ค้นหาจุดที่จะวาง Header
        // จะแทนที่เนื้อหาระหว่าง <!-- HEADER_START --> และ <!-- HEADER_END -->
        const regex = /<!-- HEADER_START -->[\s\S]*?<!-- HEADER_END -->/g;

        if (content.match(regex)) {
            const newContent = content.replace(regex, `<!-- HEADER_START -->\n${headerContent}\n    <!-- HEADER_END -->`);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ Updated: ${file}`);
        } else {
            console.warn(`⚠️  Skipped: ${file} (ไม่พบ Comment Marker)`);
        }
    } else {
        console.error(`❌ Not Found: ${file}`);
    }
});
