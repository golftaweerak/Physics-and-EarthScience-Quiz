import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.resolve(__dirname, '../temp_merger_analysis/data');
const TARGET_EARTH_DIR = path.resolve(__dirname, '../data/posn_earth');
const TARGET_ASTRO_DIR = path.resolve(__dirname, '../data/posn_astro');

// Mapping Definitions
const PREFIX_MAP = {
  'junior': {
    targetDir: TARGET_ASTRO_DIR,
    category: 'PosnAstroJunior',
    subCategoryMain: 'POSN_Astronomy',
    variableName: 'quizItems'
  },
  'senior': {
    targetDir: TARGET_ASTRO_DIR,
    category: 'PosnAstroSenior',
    subCategoryMain: 'POSN_Astronomy',
    variableName: 'quizItems'
  },
  'Astro': {
    targetDir: TARGET_ASTRO_DIR,
    category: 'AstronomyReview',
    subCategoryMain: 'POSN_Astronomy',
    variableName: 'quizItems'
  },
  'ES': {
    targetDir: TARGET_EARTH_DIR,
    category: 'PosnEarthScience',
    subCategoryMain: 'POSN_Earth',
    variableName: 'quizItems'
  },
  'adv_astro': {
    targetDir: TARGET_ASTRO_DIR,
    category: 'ChallengePOSN',
    subCategoryMain: 'POSN_Astronomy',
    variableName: 'quizItems'
  },
  'adv_geology': {
    targetDir: TARGET_EARTH_DIR,
    category: 'ChallengePOSN',
    subCategoryMain: 'POSN_Earth',
    variableName: 'quizItems'
  },
  'adv_meteorology': {
    targetDir: TARGET_EARTH_DIR,
    category: 'ChallengePOSN',
    subCategoryMain: 'POSN_Earth',
    variableName: 'quizItems'
  },
  'adv_oceanography': {
    targetDir: TARGET_EARTH_DIR,
    category: 'ChallengePOSN',
    subCategoryMain: 'POSN_Earth',
    variableName: 'quizItems'
  }
};

if (!fs.existsSync(TARGET_EARTH_DIR)) fs.mkdirSync(TARGET_EARTH_DIR, { recursive: true });
if (!fs.existsSync(TARGET_ASTRO_DIR)) fs.mkdirSync(TARGET_ASTRO_DIR, { recursive: true });

function processFile(filename) {
  // Determine mapping based on prefix
  let mapping = null;
  // Sort keys by length desc to match 'adv_astro' before 'Astro' if needed (though existing map order usually preserves insertion order, better to be safe or rely on specific check)
  // Actually, 'adv_astro' doesn't start with 'Astro', it starts with 'adv_astro'.
  // But 'ES' and 'ESr' might overlap? 'ESr' is not in map explicitly but 'ES' covers it.
  // 'ESr' -> 'ES' prefix matches.

  // Check specific prefixes first
  const prefixes = Object.keys(PREFIX_MAP).sort((a, b) => b.length - a.length);

  for (const prefix of prefixes) {
    if (filename.startsWith(prefix)) {
      mapping = PREFIX_MAP[prefix];
      break;
    }
  }

  if (!mapping) {
    console.log(`Skipping ${filename} (No matching prefix)`);
    return;
  }

  const sourcePath = path.join(SOURCE_DIR, filename);
  const content = fs.readFileSync(sourcePath, 'utf8');

  // Regex to match "export const variable = [ ... ]" with optional semicolon
  const match = content.match(/export const (\w+) = (\[[\s\S]*\]);?/);
  if (!match) {
    console.warn(`Could not parse data in ${filename}`);
    return;
  }

  let variableName = match[1];
  let jsonString = match[2];

  // Fix trailing commas for JSON.parse (simple heuristic)
  // Note: The source is JS object literal, NOT strict JSON.
  // It's safer to use eval or Function to parse JS object literal if trusted,
  // or string replacements. Given this is a dev tool, string replace is safest.

  // Actually, since we want to WRITE back JS, we can just do string replacements on the content directly!
  // This preserves formatting and avoids parsing issues.

  let newContent = content;

  // 1. Rewrite SubCategory Main
  // subCategory: { main: "Astronomy" -> subCategory: { main: "POSN_Astronomy"
  // subCategory: { main: "Geology" -> subCategory: { main: "POSN_Earth"

  if (mapping.subCategoryMain === 'POSN_Astronomy') {
    newContent = newContent.replace(/main:\s*"Astronomy"/g, `main: "POSN_Astronomy"`);
  } else if (mapping.subCategoryMain === 'POSN_Earth') {
    // Earth Science files might have "Geology", "Meteorology", "Oceanography", "Astronomy" (if ES covers basic Space)
    // Goal: Prefix them individually.

    const validMainCats = ['Geology', 'Meteorology', 'Oceanography', 'Astronomy'];

    newContent = newContent.replace(/main:\s*"(\w+)"/g, (match, p1) => {
      if (p1 === 'Astronomy') return `main: "POSN_Astronomy"`; // ES files relating to Astro -> POSN_Astronomy? 
      // Actually, if it's Earth Science track, it should probably be POSN_Astronomy if it's astronomy content, 
      // BUT user might want it under "POSN Earth Science" umbrella?
      // However, namespaces are global. "POSN_Astronomy" is the track.
      // If ES quiz has Astro content, mapping it to POSN_Astronomy makes sense so it appears in that filter if filtering by main.
      // Or if filtering by "POSN Earth Science", we need to know what that includes.
      // Let's assume namespaces: POSN_Geology, POSN_Meteorology, POSN_Oceanography.

      if (validMainCats.includes(p1)) {
        return `main: "POSN_${p1}"`;
      }
      return match;
    });
  }

  // 2. Add/Rewrite Category (if it exists in the file, though usually it's in quizList)
  // The data files usually don't have the top-level category... wait, let's check ES1-data.js again.
  // Viewed file ES1-data.js -> It ONLY has `subCategory` inside items. It does NOT have top-level category.
  // The category is defined in `quizzes-list.js`.

  // So the data file changes are mostly about `subCategory`.

  // 3. Write to new location
  const targetPath = path.join(mapping.targetDir, filename);
  fs.writeFileSync(targetPath, newContent);
  console.log(`Migrated ${filename} -> ${targetPath}`);
}

// Main Execution
const files = fs.readdirSync(SOURCE_DIR);
files.forEach(file => {
  if (file.endsWith('-data.js')) {
    processFile(file);
  }
});
