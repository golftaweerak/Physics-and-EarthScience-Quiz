/**
 * สคริปต์สำหรับดาวน์โหลดไฟล์ Excel ภาคเรียนที่ 1 ปีการศึกษา 2569 จาก SharePoint (แบบ Public Link)
 * วิธีใช้: รันคำสั่ง 'node tools/fetch-term1-2569.js' ใน Terminal
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { convertTerm1Scores } from './convert-scores.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// โหลดค่า Environment จาก .env ถ้ามี
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (m) {
            let v = (m[2] || '').trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
            }
            process.env[m[1]] = v;
        }
    });
}

// ลิงก์ SharePoint สำหรับเทอม 1 ปี 2569 (ดึงจาก .env เพื่อความปลอดภัย)
const sharepointLink = process.env.SHAREPOINT_LINK_TERM1_2569 || "";

// ตำแหน่งที่จะบันทึกไฟล์
const outputDir = path.join(__dirname, '../xlsx');
const outputPath = path.join(outputDir, '69-EarthScience-Term1.xlsx');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// ตรวจสอบไฟล์ใน OneDrive เครื่องท้องถิ่นก่อน
const localOneDriveCandidates = [
    path.join(process.env.USERPROFILE || '', 'OneDrive - Prommanusorn Phetchaburi School/PB/ppt วิทย์โลก/69-EarthScience.xlsx'),
    path.join(process.env.USERPROFILE || '', 'OneDrive/PB/ppt วิทย์โลก/69-EarthScience.xlsx'),
];

const foundLocalPath = localOneDriveCandidates.find(p => fs.existsSync(p));

if (foundLocalPath) {
    console.log(`📁 พบไฟล์คะแนนในเครื่อง OneDrive: ${foundLocalPath}`);
    try {
        fs.copyFileSync(foundLocalPath, outputPath);
        console.log(`✅ คัดลอกไฟล์มายัง: ${outputPath} เรียบร้อยแล้ว`);
        console.log('\n--- ขั้นตอนที่ 2: เริ่มการแปลงข้อมูลเป็นไฟล์ JavaScript ---');
        convertTerm1Scores();
        console.log('\n--- ขั้นตอนที่ 3: อัปโหลดข้อมูลขึ้น Firestore ---');
        try {
            const forceFlag = process.argv.includes('--force') ? ' --force' : '';
            execSync(`node tools/upload-scores-firestore.js --semester 1-2569${forceFlag}`, { stdio: 'inherit' });
            console.log('✅ อัปโหลดคะแนนขึ้น Firestore สำเร็จ!');
        } catch (err) {
            console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดขึ้น Firestore (ตรวจสอบสิทธิ์การเขียนบน Rules):', err);
        }
        process.exit(0);
    } catch (err) {
        console.warn(`⚠️ ไม่สามารถคัดลอกไฟล์จากเครื่องได้ (${err.message}) จะพยายามดาวน์โหลดจาก SharePoint แทน...`);
    }
}

if (!sharepointLink) {
    console.error('❌ ไม่พบไฟล์คะแนนในเครื่อง และไม่มีการระบุ SHAREPOINT_LINK_TERM1_2569 ใน .env');
    process.exit(1);
}

console.log(`กำลังดาวน์โหลดไฟล์ Excel จาก SharePoint...`);
console.log(`URL: ${sharepointLink}`);

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
            console.log('✅ ดาวน์โหลดเสร็จสิ้น!');
            console.log(`บันทึกไฟล์ไว้ที่: ${dest}`);
            console.log('\n--- ขั้นตอนที่ 2: เริ่มการแปลงข้อมูลเป็นไฟล์ JavaScript ---');
            convertTerm1Scores();
            console.log('\n--- ขั้นตอนที่ 3: อัปโหลดข้อมูลขึ้น Firestore ---');
            try {
                const forceFlag = process.argv.includes('--force') ? ' --force' : '';
                execSync(`node tools/upload-scores-firestore.js --semester 1-2569${forceFlag}`, { stdio: 'inherit' });
                console.log('✅ อัปโหลดคะแนนขึ้น Firestore สำเร็จ!');
            } catch (err) {
                console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดขึ้น Firestore (ตรวจสอบสิทธิ์การเขียนบน Rules):', err);
            }
        });
    }).on('error', (e) => {
        if (isRedirected) return; // Ignore errors from the redirected request
        console.error(`เกิดข้อผิดพลาดในการดาวน์โหลด: ${e.message}`);
        fileStream.close();
        fs.unlink(dest, () => { });
    });
};

downloadFile(sharepointLink, outputPath);