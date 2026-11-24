import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = path.join(root, 'data');
const filterArg = process.argv[2]?.toLowerCase() || '';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const ignoreQuizFiles = new Set([
  'data/sub-category-data.js',
  'data/template-data.js',
  'data/quizzes-list.js',
  'data/gamification-registry.js',
  'data/score-overrides.js',
]);

const quizDataFiles = walk(dataDir)
  .map((f) => path.relative(root, f).replace(/\\/g, '/'))
  .filter(
    (f) =>
      f.endsWith('-data.js') &&
      !ignoreQuizFiles.has(f) &&
      !path.basename(f).startsWith('scores-data') &&
      (!filterArg || f.toLowerCase().includes(filterArg))
  );

function stripLatex(str) {
  return String(str).replace(/\\\(.*?\\\)/g, '').replace(/\$.*?\$/g, '').trim();
}

function hasEngParen(str) {
  const clean = stripLatex(str);
  return /\([^)]*[A-Za-z]{2,}[^)]*\)/.test(clean);
}

const latexParenRe = /(?<!\\)\\[()\[\]]/g;
const latexCmdRe =
  /(?<!\\)\\(rightarrow|Rightarrow|leftarrow|Leftarrow|leftrightarrow|frac|sqrt|times|theta|alpha|beta|gamma|delta|Delta|lambda|mu|pi|sigma|omega|Omega|approx|circ|cdot|pm|text|sin|cos|tan|implies|le|ge|leq|geq|neq|infty|vec|bar|hat|left|right)\b/g;

const engGiveaways = [];
const lengthBiases = [];
const lengthBiasByFolder = {};
const unescapedLatex = [];
const oddDollarMath = [];
const missingExplanations = [];
const duplicateNumbers = [];

function checkDollarCount(str, loc, field) {
  if (typeof str !== 'string') return;
  const cleaned = str.replace(/\\\$/g, '').replace(/\$\$/g, '');
  const count = (cleaned.match(/\$/g) || []).length;
  if (count % 2 !== 0) {
    oddDollarMath.push({ loc, field, count });
  }
}

function checkQuestion(q, file, folder) {
  const loc = `${file}#${q.number}`;
  if (!q.explanation || !String(q.explanation).trim()) {
    missingExplanations.push(loc);
  }

  checkDollarCount(q.question, loc, 'question');
  checkDollarCount(q.explanation, loc, 'explanation');
  if (Array.isArray(q.options)) {
    q.options.forEach((o, i) => checkDollarCount(o, loc, `option[${i}]`));
  }

  if (!Array.isArray(q.options) || q.options.length < 2 || q.type === 'multiple-select') return;
  const ans = String(q.answer ?? '');
  if (!q.options.includes(ans)) return;

  const dists = q.options.filter((o) => o !== ans);
  if (hasEngParen(ans)) {
    const allHaveSomeParen = q.options.every((o) => /\([^)]+\)/.test(String(o)));
    const distHasCount = dists.filter(hasEngParen).length;
    if (distHasCount < dists.length && !allHaveSomeParen) {
      engGiveaways.push({ loc, distHasCount, totalDist: dists.length, answer: ans });
    }
  }

  const ansLen = stripLatex(ans).length;
  const maxDistLen = Math.max(...dists.map((d) => stripLatex(d).length));
  if (ansLen >= 35 && ansLen > maxDistLen * 1.45 && ansLen - maxDistLen >= 20) {
    lengthBiases.push({ loc, ansLen, maxDistLen });
    lengthBiasByFolder[folder] = (lengthBiasByFolder[folder] || 0) + 1;
  }
}

for (const file of quizDataFiles) {
  const folder = file.split('/')[1] || '(root)';
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const lines = src.split(/\r?\n/);

  let parenHits = 0;
  let cmdHits = 0;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    const pMatches = line.match(latexParenRe);
    if (pMatches) parenHits += pMatches.length;
    const cMatches = line.match(latexCmdRe);
    if (cMatches) cmdHits += cMatches.length;
  });
  if (parenHits > 0 || cmdHits > 0) {
    unescapedLatex.push({ file, parenHits, cmdHits });
  }

  const mod = await import(`${pathToFileURL(path.join(root, file)).href}?v=${Date.now()}`);
  const items = mod.quizItems || mod.default;
  if (!Array.isArray(items)) continue;

  const nums = [];
  for (const item of items) {
    if (item && item.type === 'scenario' && Array.isArray(item.questions)) {
      checkDollarCount(item.description, `${file}#scenario`, 'description');
      for (const sq of item.questions) {
        if (sq.number !== undefined) nums.push(sq.number);
        checkQuestion(sq, file, folder);
      }
    } else if (item) {
      if (item.number !== undefined) nums.push(item.number);
      checkQuestion(item, file, folder);
    }
  }

  const seen = new Set();
  const dups = [];
  for (const n of nums) {
    if (seen.has(n)) dups.push(n);
    seen.add(n);
  }
  if (dups.length > 0) duplicateNumbers.push({ file, dups });
}

console.log(
  JSON.stringify(
    {
      filesChecked: quizDataFiles.length,
      engGiveawaysCount: engGiveaways.length,
      engGiveaways,
      unescapedLatexFilesCount: unescapedLatex.length,
      unescapedLatex,
      oddDollarMathCount: oddDollarMath.length,
      oddDollarMath,
      missingExplanationsCount: missingExplanations.length,
      missingExplanations,
      duplicateNumbersCount: duplicateNumbers.length,
      duplicateNumbers,
      lengthBiasesCount: lengthBiases.length,
      lengthBiasByFolder,
    },
    null,
    2
  )
);
