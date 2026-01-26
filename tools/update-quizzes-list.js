import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_LIST_PATH = path.join(__dirname, '../data/quizzes-list.js');
const REMOTE_LIST_PATH = path.join(__dirname, '../temp_merger_analysis/data/quizzes-list.js');

function mapCategory(item) {
  const id = item.id;
  const oldCat = item.category;

  if (id.startsWith('junior')) return 'PosnAstroJunior';
  if (id.startsWith('senior')) return 'PosnAstroSenior';
  if (id.startsWith('Astro')) return 'AstronomyReview';

  // Note: ESr prefix was also 'AstronomyReview' in remote, but likely matches review logic.
  // If id starts with ESr -> it's review for Earth Science? 
  // In remote list: ESr1 -> AstronomyReview.
  // Let's map ESr to PosnEarthScienceReview ? Or just PosnEarthScience.

  if (id.startsWith('ESr')) return 'PosnEarthScience'; // Keep simple or specific
  if (id.startsWith('ES')) return 'PosnEarthScience';

  if (id.startsWith('adv_astro')) return 'ChallengeAstro';
  if (id.startsWith('adv_')) return 'ChallengeEarth'; // geology, meteorology, oceanography

  // Default fallback
  return oldCat;
}

function updateQuizzesList() {
  console.log('Reading files...');
  const localContent = fs.readFileSync(LOCAL_LIST_PATH, 'utf8');
  const remoteContent = fs.readFileSync(REMOTE_LIST_PATH, 'utf8');

  // Extract the array content using regex
  const localMatch = localContent.match(/export const quizList = (\[[\s\S]*\]);?/);
  const remoteMatch = remoteContent.match(/export const quizList = (\[[\s\S]*\]);?/);

  if (!localMatch || !remoteMatch) {
    console.error('Failed to parse one of the quiz lists.');
    return;
  }

  // Use eval (safe in this dev context) to parse the array strings
  // because they are JS objects (keys might not be quoted), not strict JSON
  const localList = eval(localMatch[1]);
  const remoteList = eval(remoteMatch[1]);

  const existingIds = new Set(localList.map(q => q.id));
  const newItems = [];

  remoteList.forEach(item => {
    if (!existingIds.has(item.id)) {
      // Apply modifications
      const newItem = { ...item };

      // Map category
      newItem.category = mapCategory(item);

      // Update URL prefix (remote might follow different path? No, assuming standard structure)
      // Remote: "./quiz/index.html?id=..." - matches local structure.

      // Update Icon paths if necessary?
      // Local Structure: ./assets/icons/...
      // Remote Structure: ./assets/icons/...
      // If icons are missing, they wont show, but that's a separate asset migration task.
      // (I haven't migrated assets yet! I should note this.)

      newItems.push(newItem);
    }
  });

  console.log(`Found ${newItems.length} new quizzes to add.`);

  if (newItems.length > 0) {
    // Append new items to local list array
    const mergedList = [...localList, ...newItems];

    // Serialize back to JS string
    // We want to preserve reasonable formatting. JSON.stringify is easy but quotes keys.
    // It's acceptable for this project.
    const output = `export const quizList = ${JSON.stringify(mergedList, null, 2)};`;

    fs.writeFileSync(LOCAL_LIST_PATH, output);
    console.log(`Updated ${LOCAL_LIST_PATH}`);
  } else {
    console.log('No new quizzes to add.');
  }
}

updateQuizzesList();
