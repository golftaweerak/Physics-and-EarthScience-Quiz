
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUIZZES_LIST_PATH = path.join(__dirname, '../data/quizzes-list.js');

// Map of filenames (without extension) -> folder name
const fileMap = {};

const astroFiles = [
  "Astro1-data.js", "Astro2-data.js", "Astro3-data.js", "Astro4-data.js", "Astro5-data.js", "Astro6-data.js",
  "adv_astro1-data.js", "adv_astro10-data.js", "adv_astro2-data.js", "adv_astro3-data.js", "adv_astro4-data.js", "adv_astro5-data.js", "adv_astro6-data.js", "adv_astro7-data.js", "adv_astro8-data.js", "adv_astro9-data.js",
  "junior1-data.js", "junior2-data.js", "junior2568-data.js", "junior3-data.js", "junior4-data.js", "junior5-data.js", "junior6-data.js", "junior7-data.js", "juniorC1-data.js", "juniorC2-data.js",
  "senior1-data.js", "senior2-data.js", "senior2568-data.js", "senior3-data.js", "senior4-data.js", "senior5-data.js", "senior6-data.js", "senior7-data.js", "seniorC1-data.js", "seniorC2-data.js", "seniorC3-data.js", "seniorC4-data.js"
];

const earthFiles = [
  "ES1-data.js", "ES10-data.js", "ES11-data.js", "ES12-data.js", "ES2-data.js", "ES3-data.js", "ES4-data.js", "ES5-data.js", "ES6-data.js", "ES7-data.js", "ES8-data.js", "ES9-data.js",
  "ESr1-data.js", "ESr2-data.js", "ESr3-data.js", "ESr4-data.js", "ESr5-data.js", "ESr6-data.js",
  "adv_geology1-data.js", "adv_geology2-data.js", "adv_geology3-data.js", "adv_geology4-data.js", "adv_geology5-data.js", "adv_geology6-data.js",
  "adv_meteorology1-data.js", "adv_meteorology2-data.js", "adv_meteorology3-data.js", "adv_meteorology4-data.js",
  "adv_oceanography1-data.js", "adv_oceanography2-data.js", "adv_oceanography3-data.js", "adv_oceanography4-data.js", "adv_oceanography5-data.js", "adv_oceanography6-data.js"
];

astroFiles.forEach(f => fileMap[f.replace('-data.js', '')] = 'posn_astro');
earthFiles.forEach(f => fileMap[f.replace('-data.js', '')] = 'posn_earth');

try {
  let content = fs.readFileSync(QUIZZES_LIST_PATH, 'utf8');
  let updatedCount = 0;

  Object.keys(fileMap).forEach(baseName => {
    const folder = fileMap[baseName];

    // Replace ID: "id": "Astro1" -> "id": "posn_astro/Astro1"
    // Avoid double prefixing by ensuring the char before baseName is NOT a /
    const idRegex = new RegExp(`(["'])id(["'])\\s*:\\s*(["'])(?!${folder}\\/)${baseName}(["'])`, 'g');
    if (idRegex.test(content)) {
      content = content.replace(idRegex, `$1id$2: $3${folder}/${baseName}$4`);
      updatedCount++;
    }

    // Replace URL: "?id=Astro1" -> "?id=posn_astro/Astro1"
    const urlRegex = new RegExp(`[?]id=(?!${folder}\\/)${baseName}(["'])`, 'g');
    if (urlRegex.test(content)) {
      content = content.replace(urlRegex, `?id=${folder}/${baseName}$1`);
    }
  });

  fs.writeFileSync(QUIZZES_LIST_PATH, content, 'utf8');
  console.log(`✅ Fixed paths for ${updatedCount} quizzes in quizzes-list.js`);

} catch (err) {
  console.error("Error updating quizzes-list.js:", err);
}
