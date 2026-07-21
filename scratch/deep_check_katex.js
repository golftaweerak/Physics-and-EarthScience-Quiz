import fs from 'fs';

function findBareNumbersAndVars(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    // Strip KaTeX blocks
    let cleaned = line.replace(/\\\\\([\s\S]*?\\\\\)/g, '___MATH___');
    
    // Search for numbers, variables, or chemical formulas outside KaTeX
    const regex = /\b\d+(\.\d+)?\b|\b[mMLRdTpcE]\b|\b(TiO|CNO|P-P|Ia|Triple-Alpha)\b/g;
    let match;
    const matches = [];
    while ((match = regex.exec(cleaned)) !== null) {
      // Ignore property keys like "number: 1", "type: 'question'", "answer:", "specific:"
      const idx = match.index;
      const keyContext = cleaned.slice(Math.max(0, idx - 15), idx);
      if (/number:\s*$|LO_\d+$|specific:\s*$|version:\s*$/i.test(keyContext)) {
        continue;
      }
      matches.push(match[0]);
    }

    if (matches.length > 0) {
      results.push({ lineNum: index + 1, text: line.trim(), matches });
    }
  });

  return results;
}

console.log('=== Bare numbers/vars in CH14-3 ===');
console.log(JSON.stringify(findBareNumbersAndVars('data/ess_adv/ess_adv_m6_ch14-3-data.js'), null, 2));

console.log('=== Bare numbers/vars in CH14-2 ===');
console.log(JSON.stringify(findBareNumbersAndVars('data/ess_adv/ess_adv_m6_ch14-2-data.js'), null, 2));
