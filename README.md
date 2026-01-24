# Physics & Earth Science Quiz (Multi-Subject Platform)

<div align="center">
  <!-- Badges for professionalism -->
  <img src="https://img.shields.io/github/license/golftaweerak/Physics-and-EarthScience-Quiz" alt="License">
  <img src="https://img.shields.io/github/deployments/golftaweerak/Physics-and-EarthScience-Quiz/github-pages?label=GitHub%20Pages" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase" alt="Firebase">
</div>
<br>
<div align="center">
  <img src="public/assets/images/screenshot.png" alt="Earth Science Quiz Screenshot" width="80%">
  <p><i>ภาพหน้าจอของแอปพลิเคชัน</i></p>
</div>

เว็บแอปพลิเคชันสำหรับฝึกทำแบบทดสอบออนไลน์เพื่อเตรียมตัวสอบคัดเลือกเข้าค่ายโอลิมปิกวิชาการ (สอวน.) ในสาขาวิชา **ฟิสิกส์**, **ดาราศาสตร์** และ **วิทยาศาสตร์โลกและอวกาศ** มาพร้อมกับระบบ Gamification ที่ช่วยกระตุ้นการเรียนรู้ โหมดท้าทายแบบเรียลไทม์ และเครื่องมือวิเคราะห์ผลการเรียนรู้อย่างละเอียด

<div align="center">

**[🚀 เข้าสู่เว็บไซต์ (Live Demo) 🚀](https://golftaweerak.github.io/Physics-and-EarthScience-Quiz/)**

</div>

## ✨ คุณสมบัติเด่น (Features)

- **ระบบ Gamification:** สะสม XP, เลื่อนระดับ (Levels), รับฉายา (Titles) และปลดล็อกความสำเร็จ (Achievements)
- **โหมดท้าทาย (Multiplayer & Challenge):** แข่งขันกับเพื่อนแบบเรียลไทม์ในโหมด Classic, Time Attack, Co-op และ Survival
- **ภารกิจประจำวัน (Daily Quests):** รับรางวัลพิเศษจากการทำภารกิจที่ได้รับมอบหมายในแต่ละวัน
- **วิเคราะห์แยกตามตัวชี้วัด:** แสดงผลการทำข้อสอบแยกตามเนื้อหา/ตัวชี้วัด (Learning Outcomes) พร้อมกราฟวิเคราะห์จุดแข็ง-จุดอ่อน
- **เครื่องมือสำหรับผู้พัฒนา:**
  - **Auto-Correction:** ระบบตรวจสอบและแก้ไขหมวดหมู่ข้อสอบอัตโนมัติ
  - **Docx Importer:** นำเข้าข้อสอบจากไฟล์ Word (.docx) ได้โดยตรง

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend Framework:** Vanilla JavaScript (ES6 Modules)
- **Build Tool:** [Vite](https://vitejs.dev/) - เพื่อประสิทธิภาพการโหลดและการจัดการ Assets ที่รวดเร็ว
- **Styling:** CSS3 (Tailwind CSS)
- **Backend / Database:** Firebase (Firestore & Authentication)
- **Icons:** Heroicons
- **Libraries:**
  - KaTeX - สำหรับแสดงผลสูตรคณิตศาสตร์
  - Mammoth.js - สำหรับแปลงไฟล์ .docx เป็น HTML

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
/
├── 📂 public/               # Static assets ที่จะถูก copy ไปยัง dist/ เมื่อ build
│   ├── 📂 assets/           # เก็บรูปภาพ, ไอคอน, และไฟล์เสียง
│   └── 📂 components/       # เก็บส่วนประกอบ HTML ที่ใช้ซ้ำ (Header, Footer, Modals)
├── 📂 data/                 # เก็บไฟล์ข้อมูลข้อสอบทั้งหมด (.js)
│   ├── quizzes-list.js      # ไฟล์หลักที่รวมรายการข้อสอบทั้งหมด
│   └── ... (ไฟล์ข้อมูลแต่ละชุด)
├── 📂 quiz/                 # หน้าสำหรับทำแบบทดสอบ (index.html)
├── 📂 scripts/              # เก็บไฟล์ JavaScript Modules ทั้งหมด
│   ├── app-loader.js        # ตัวโหลดหลัก (Main Entry Point)
│   ├── firebase-config.js   # การตั้งค่า Firebase
│   ├── challenge-manager.js # ระบบ Multiplayer/Challenge
│   └── ... (โมดูลอื่นๆ)
├── 📂 styles/               # เก็บไฟล์ CSS
├── 📂 tools/                # Node.js Scripts สำหรับจัดการข้อมูล (หลังบ้าน)
├── index.html               # หน้าหลัก
├── vite.config.js           # การตั้งค่า Vite
├── firebase.json            # การตั้งค่า Firebase Hosting
└── package.json             # จัดการ Dependencies และ Scripts
```

---

## 🚀 การติดตั้งและใช้งาน (Installation & Usage)

### 1. ติดตั้ง (Setup)

ต้องการ **Node.js** (รุ่น LTS แนะนำ)

```bash
# 1. Clone repository
git clone https://github.com/golftaweerak/Physics-and-EarthScience-Quiz.git

# 2. เข้าสู่โฟลเดอร์
cd Physics-and-EarthScience-Quiz

# 3. ติดตั้ง Dependencies
npm install
```

### 2. รันในเครื่อง (Local Development)

ใช้คำสั่งนี้เพื่อเปิดเซิร์ฟเวอร์จำลอง (Hot Reload):

```bash
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:5173` (หรือตามที่ terminal แจ้ง)

### 3. สร้างเวอร์ชันสำหรับใช้งานจริง (Build)

```bash
npm run build
```

คำสั่งนี้จะสร้างโฟลเดอร์ `dist/` ที่ประกอบด้วยไฟล์ที่ผ่านการปรับปรุง (Optimize) แล้ว พร้อมสำหรับการอัปโหลดขึ้นเซิร์ฟเวอร์

### 4. ทดสอบเวอร์ชัน Build (Preview)

```bash
npm run preview
```

---

## 🌐 การอัปเดตเว็บไซต์ (Deployment)

โปรเจกต์นี้ตั้งค่าให้ Deploy ไปยัง **GitHub Pages** ได้ง่ายๆ ผ่านคำสั่ง NPM:

```bash
npm run deploy
```

**คำสั่งนี้จะทำหน้าที่:**

1. รัน `npm run build` เพื่อสร้างไฟล์เวอร์ชันล่าสุดใน `dist/`
2. อัปโหลดโฟลเดอร์ `dist/` ไปยัง branch `gh-pages` บน GitHub โดยอัตโนมัติ

**หมายเหตุ:** ให้มั่นใจว่าในหน้า Settings > Pages ของ GitHub Repository ได้เลือก Source เป็น **Deploy from a branch** และเลือก branch เป็น `gh-pages`

---

## � เครื่องมือจัดการข้อมูล (Data Management Tools)

โปรเจกต์นี้มี Script สำหรับตรวจสอบและจัดการข้อมูลข้อสอบที่อยู่ในโฟลเดอร์ `tools/`

- **อัปเดตรายการข้อสอบ:**

  ```bash
  npm run update:list
  ```

  สแกนไฟล์ใน `data/` และอัปเดต `quizzes-list.js` ให้อัตโนมัติ

- **ตรวจสอบความถูกต้อง:**

  ```bash
  npm run validate
  ```

  ค้นหาข้อสอบซ้ำ (Duplicates) และตรวจสอบหมวดหมู่ย่อย (Subcategories)

- **จัดการทั้งหมด (แนะนำ):**
  ```bash
  npm run manage
  ```
  รวมการอัปเดตและตรวจสอบไว้ในคำสั่งเดียว

---

## 🤝 การมีส่วนร่วม (Contributing)

1. Fork โปรเจกต์นี้
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การแก้ไข (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

### 🧑‍💻 ผู้จัดทำ

- **นายทวีรักษ์ ทูลพุทธา**
- โรงเรียนพรหมานุสรณ์จังหวัดเพชรบุรี

---

## 📄 สัญญาอนุญาต (License)

โปรเจกต์นี้อยู่ภายใต้สัญญาอนุญาตแบบ MIT ดูรายละเอียดเพิ่มเติมได้ที่ไฟล์ [LICENSE](LICENSE)
