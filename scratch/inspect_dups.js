import fs from 'fs';

const filesToInspect = [
  { path: 'data/ess_adv/ess_adv_m6_ch14-3-data.js', q: 6 },
  { path: 'data/ess_adv/ess_adv_m6_ch14-4-data.js', q: 5 },
  { path: 'data/phy_m4/phy_m4_ch4-5-data.js', q: 8 },
  { path: 'data/phy_m4/phy_m4_ch7-4-data.js', q: 5 },
  { path: 'data/phy_m5/phy_m5_final-exam-1-data.js', q: 7 },
  { path: 'data/posn_astro/Astro5-data.js', q: 9 },
  { path: 'data/posn_astro/junior2-data.js', q: 11 },
  { path: 'data/posn_astro/junior2568-data.js', q: 25 },
  { path: 'data/posn_astro/senior2568-data.js', q: 26 },
  { path: 'data/posn_earth/ES9-data.js', q: 40 }
];

async function inspect() {
  for (const item of filesToInspect) {
    try {
      const module = await import('file://' + process.cwd() + '/' + item.path);
      const quizItems = module.quizItems || module.default || module.questions || module.quizData;
      const qObj = quizItems.find(q => q.number === item.q);
      console.log(`\n========================================`);
      console.log(`File: ${item.path} | Q${item.q}`);
      console.log(`Question: ${qObj.question}`);
      console.log(`Options:`, qObj.options);
      console.log(`Answer:`, qObj.answer);
      console.log(`Explanation:`, qObj.explanation);
    } catch (e) {
      console.error(e.message);
    }
  }
}

inspect();
