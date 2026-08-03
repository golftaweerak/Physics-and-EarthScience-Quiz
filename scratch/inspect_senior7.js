import fs from 'fs';
import { quizItems as s7 } from '../data/posn_astro/senior7-data.js';

const report = JSON.parse(fs.readFileSync('scratch/all_quizzes_report.json', 'utf8'));

const s7Issues = report['data\\posn_astro\\senior7-data.js'];
console.log('senior7 issues:', s7Issues);
