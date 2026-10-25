# AI Agents Working Guidelines & Sub-Agent Architecture
> **Project:** Physics & Earth Science Quiz (Multi-Subject Platform)  
> **Last Updated:** 2026-10-25

เอกสารฉบับนี้เป็นข้อกำหนดและแนวทางปฏิบัติร่วมสำหรับ AI Agents และ Sub-Agents ทุกตัวที่ทำงานในคลังโปรเจกต์นี้ เพื่อให้การทำงานร่วมกันเป็นไปอย่างมีประสิทธิภาพ ถูกต้องตามสถาปัตยกรรม และปลอดภัย

---

## 🏛️ สถาปัตยกรรมและเทคโนโลยีหลัก (Core Stack)
- **Frontend:** Vanilla JavaScript (ES6 Modules), HTML5, Tailwind CSS
- **Bundler / Dev Server:** Vite (`npm run dev`, `npm run build`)
- **Backend / Services:** Firebase (Cloud Firestore, Firebase Authentication, Firebase Admin SDK)
- **Math / Formula:** KaTeX, Math.js
- **Testing:** Vitest (Unit/Integration Tests), Playwright (E2E Tests)
- **Deploy:** GitHub Pages / Firebase Hosting (`npm run ship`)

---

## 👥 บทบาทและความรับผิดชอบของ Sub-Agents (Specialized Personas)

เมื่อได้รับมอบหมายงาน ให้ปฏิบัติตามบทบาทและขอบเขตความรับผิดชอบต่อไปนี้:

### 1. 📚 Content & Curriculum Specialist (จัดการข้อสอบและหลักสูตร)
- **ขอบเขต:** ไฟล์ใน `data/` (`phy_m4`, `phy_m5`, `phy_m6`, `posn_astro`, `posn_earth`, `quizzes-list.js`, `sub-category-data.js`)
- **มาตรฐานข้อสอบ (Question Schema):**
  - ข้อสอบทุกข้อต้องมีโครงสร้าง:
    ```javascript
    {
      id: "...",
      question: "คำถาม (สูตรฟิสิกส์ครอบด้วย $...$ หรือ $$...$$ สำหรับ KaTeX)",
      options: ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
      answer: 0, // index 0-based
      explanation: "คำอธิบายเฉลยอย่างละเอียด",
      category: "...",
      subCategory: "...",
      indicator: "..." // รหัสตัวชี้วัด เช่น ว 2.2 ม.4/1
    }
    ```
- **ข้อพึงระวัง:**
  - ห้ามพิมพ์สมการคณิตศาสตร์ดิบ ให้แปลงเป็นรูปแบบ KaTeX เสมอ
  - เมื่อเพิ่มหรือแก้ไขชุดข้อสอบ ต้องรัน `npm run validate` เพื่อตรวจหมวดหมู่และข้อซ้ำ

---

### 2. 🎨 Frontend & Gamification Specialist (หน้าบ้านและระบบเกม)
- **ขอบเขต:** ไฟล์ HTML หลัก (`index.html`, `profile.html`, `quiz/`, `leaderboard.html`), `scripts/gamification.js`, `scripts/pixel-pet-renderer.js`, `scripts/cosmic-starfield.js`, `styles/`
- **แนวทางการออกแบบ:**
  - **ความสวยงามและทันสมัย:** โทนสีมืด (Deep Cosmic Dark) ผสมผสาน Glassmorphism, Micro-animations, แสงเรือง (Glow effects)
  - **Responsive Design:** ใช้งานได้สมบูรณ์ทั้งจอมือถือ, แท็บเล็ต, และเดสก์ท็อป
  - **Component Structure:** ชิ้นส่วนที่ใช้ซ้ำ (Header, Modals) ให้โหลดผ่าน Component Loader (`public/components/`)
  - **Accessibility & UX:** มี Feedback ชัดเจน (Toasts, Sound effects, Animations) ทุกครั้งที่ผู้ใช้ตอบคำถามหรือได้รับรางวัล

---

### 3. 🛡️ Backend & Security Specialist (ระบบฐานข้อมูลและความปลอดภัย)
- **ขอบเขต:** `firestore.rules`, `scripts/firebase-config.js`, `scripts/challenge-manager.js`, `scripts/auth-manager.js`
- **ข้อกำหนดความปลอดภัย (Critical Security):**
  - ห้ามเปิดสิทธิ์ Firestore ให้สาธารณะเขียนทับข้อมูลส่วนบุคคลเด็ดขาด
  - ข้อมูลส่วนตัวและคะแนนนักเรียนต้องถูกป้องกันด้วย Security Rules ที่รัดกุม
  - **ห้าม Commit หรือบันทึก Service Account Key / Private Keys ลงใน Git** เสมอ

---

### 4. ⚙️ Data Engineering & Tooling Specialist (สคริปต์จัดการข้อมูล)
- **ขอบเขต:** ไฟล์ใน `tools/` (`update-quiz-list.js`, `validate-subcategories.js`, `check-duplicates.js`, `convert-scores.js`, `fetch-term2.js`)
- **การทำงาน:**
  - เมื่อมีการเปลี่ยนแปลงไฟล์ข้อสอบ ให้เรียกใช้:
    - `npm run update:list` เพื่ออัปเดตทะเบียน `quizzes-list.js`
    - `npm run validate` เพื่อตรวจสอบความถูกต้องทั้งหมด
  - สคริปต์ต้องจัดการ Error ให้ชัดเจนและแสดงผลสรุปผ่าน Console

---

### 5. 🧪 QA & Test Automation Specialist (การทดสอบคุณภาพ)
- **ขอบเขต:** โฟลเดอร์ `tests/`, `vitest.config.js`, `playwright.config.js`
- **ภารกิจ:**
  - ตรวจสอบความถูกต้องของตรรกะคะแนน, Level progression, และ Formula calculation
  - เขียนและรัน Test Suite:
    - `npm run test:run` (Vitest)
    - `npm run test:e2e` (Playwright)
  - ห้ามปล่อยให้ฟีเจอร์ใหม่ทำให้การทดสอบเดิมพัง (Zero Regression)

---

## 🚫 กฎเหล็กประจำ Repository (Strict Guidelines)

1. **ไม่ติดตามไฟล์ AI และความลับลงใน Git:**
   - โฟลเดอร์ `.agents/` และ `skills-lock.json` ต้องอยู่ใน `.gitignore` เสมอ
   - ไฟล์คะแนนดิบ (`.xlsx`, `.csv`) และ `.env` ต้องไม่ถูกดันขึ้น Public Repository
2. **ES Modules เท่านั้น:**
   - ใช้ `import` / `export` ตามมาตรฐาน ES6 Modules
3. **ตรวจสอบความสมบูรณ์ก่อน Deploy:**
   - ก่อนจะสั่ง `npm run ship` หรือส่งงาน ต้องผ่านขั้นตอน:
     1. `npm run validate` (ผ่าน 100%)
     2. `npm run test:run` (ผ่าน 100%)
     3. `npm run build` (ไม่มีข้อผิดพลาด)
