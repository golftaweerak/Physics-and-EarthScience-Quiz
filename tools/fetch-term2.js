/**
 * สคริปต์สำหรับดาวน์โหลดไฟล์ Excel ภาคเรียนที่ 2 จาก SharePoint (แบบ Public Link)
 * วิธีใช้: รันคำสั่ง 'node tools/fetch-term2.js' ใน Terminal
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { convertTerm2Scores } from './convert-scores-term2.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ลิงก์ SharePoint (เติม &download=1 เพื่อบังคับดาวน์โหลด)
const googleSheetLink = "https://prommaacth-my.sharepoint.com/:x:/g/personal/taweerak_t_promma_ac_th/IQAFBGdGpXSPTo7eli_ghxWmAQWeBF5CLhSO3DbgO7ojVWM?e=Bk4o42&download=1";

// เปลี่ยนตำแหน่งบันทึกเป็นโฟลเดอร์ xlsx และนามสกุล .xlsx
const outputDir = path.join(__dirname, '../xlsx');
const outputPath = path.join(outputDir, '68-EarthScience-Term2.xlsx');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`กำลังดาวน์โหลดไฟล์ Excel จาก SharePoint...`);
console.log(`URL: ${googleSheetLink}`);

const downloadFile = (url, dest, cookies = []) => {
    const fileStream = fs.createWriteStream(dest);
    let isRedirected = false;

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    if (cookies.length > 0) {
        options.headers['Cookie'] = cookies.map(c => c.split(';')[0]).join('; ');
    }

    https.get(url, options, (response) => {
        // Handle Redirects (301, 302, 307, etc.)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            isRedirected = true;
            fileStream.close();
            fs.unlink(dest, () => { }); // Delete partial file
            const newCookies = response.headers['set-cookie'] || [];
            const nextCookies = [...cookies, ...newCookies];
            const redirectUrl = new URL(response.headers.location, url).href;
            console.log(`Redirecting (Status: ${response.statusCode}) to: ${redirectUrl}`);
            downloadFile(redirectUrl, dest, nextCookies); // Recursive call
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`ดาวน์โหลดไม่สำเร็จ Status Code: ${response.statusCode}`);
            fileStream.close();
            fs.unlink(dest, () => { }); // ลบไฟล์ที่ว่างเปล่า
            return;
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log('✅ ดาวน์โหลดเสร็จสิ้น!');
            console.log(`บันทึกไฟล์ไว้ที่: ${dest}`);
            console.log('\n--- ขั้นตอนที่ 2: เริ่มการแปลงข้อมูลเป็นไฟล์ JavaScript ---');
            convertTerm2Scores();
            console.log('\n--- ขั้นตอนที่ 3: อัปโหลดข้อมูลขึ้น Firestore ---');
            try {
                execSync('node tools/upload-scores-firestore.js --semester 2-2568', { stdio: 'inherit' });
                console.log('✅ อัปโหลดคะแนนขึ้น Firestore สำเร็จ!');
            } catch (err) {
                console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดขึ้น Firestore (ตรวจสอบสิทธิ์การเขียนบน Rules):', err);
            }
            // Explicitly exit to ensure all network connections are closed
            setTimeout(() => process.exit(0), 500);
        });
    }).on('error', (e) => {
        if (isRedirected) return; // Ignore errors from the redirected request
        console.error(`เกิดข้อผิดพลาดในการดาวน์โหลด: ${e.message}`);
        fileStream.close();
        fs.unlink(dest, () => { });
    });
};

downloadFile(googleSheetLink, outputPath);
