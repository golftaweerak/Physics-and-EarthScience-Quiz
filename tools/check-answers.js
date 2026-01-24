import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

// ฟังก์ชันสำหรับค้นหาไฟล์ทั้งหมดในโฟลเดอร์แบบ Recursive
async function getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return files.flat();
}

async function checkAnswers() {
    console.log("🔍 กำลังตรวจสอบความถูกต้องของเฉลย (Answer Mismatch Check)...");
    const files = await getFiles(dataDir);
    // กรองเฉพาะไฟล์ข้อมูลข้อสอบ
    const dataFiles = files.filter(f => f.endsWith('-data.js') && !f.endsWith('sub-category-data.js') && !f.endsWith('scores-data.js'));

    let mismatchCount = 0;

    for (const file of dataFiles) {
        try {
            // ใช้ query string เพื่อป้องกันการ cache ของ import
            const fileUrl = `${pathToFileURL(file).href}?v=${Date.now()}`;
            const module = await import(fileUrl);
            // รองรับชื่อตัวแปร export หลายแบบ
            const quizItems = module.quizItems || module.quizScenarios || module.quizData || module.default;

            if (!quizItems) continue;

            const items = [];
            // แปลงโครงสร้างข้อมูลให้เป็นรายการคำถามแบบแบน (Flat list)
            if (Array.isArray(quizItems)) {
                quizItems.forEach(item => {
                    if (item.type === 'scenario' && Array.isArray(item.questions)) {
                        item.questions.forEach(q => items.push({ ...q, _context: `Scenario: ${item.title}` }));
                    } else {
                        items.push(item);
                    }
                });
            } else if (quizItems.questions) {
                 // กรณีโครงสร้างแบบใหม่ที่มี key questions
                 items.push(...quizItems.questions);
            }

            items.forEach(item => {
                // ตรวจสอบเฉพาะข้อสอบปรนัยที่มีตัวเลือก
                if ((item.type === 'question' || item.type === 'multiple-select') && Array.isArray(item.options)) {
                    const answers = Array.isArray(item.answer) ? item.answer : [item.answer];
                    
                    answers.forEach(ans => {
                        if (typeof ans === 'string') {
                            // ตรวจสอบว่าเฉลยมีอยู่ในตัวเลือกหรือไม่ (ตัดช่องว่างหน้าหลังออก)
                            const match = item.options.some(opt => String(opt).trim() === ans.trim());
                            
                            if (!match) {
                                const relativePath = path.relative(dataDir, file);
                                console.log(`\n❌ พบข้อผิดพลาดในไฟล์: ${relativePath}`);
                                console.log(`   ข้อที่: ${item.number} ${item._context ? `(${item._context})` : ''}`);
                                console.log(`   คำถาม: "${item.question.substring(0, 60)}..."`);
                                console.log(`   เฉลย (Answer):   "${ans}"`);
                                console.log(`   ตัวเลือก (Options): ${JSON.stringify(item.options)}`);
                                mismatchCount++;
                            }
                        }
                    });
                }
            });

        } catch (err) {
            console.error(`⚠️ ไม่สามารถอ่านไฟล์ ${path.basename(file)}: ${err.message}`);
        }
    }

    console.log(`\n✅ ตรวจสอบเสร็จสิ้น พบข้อผิดพลาดทั้งหมด ${mismatchCount} รายการ`);
}

checkAnswers();

