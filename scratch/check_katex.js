import fs from 'fs';

function findUnformattedMath(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  // Patterns to look for outside \\(...\\)
  // E.g., numbers with units like 10 pc, 2 AU, 100 ly, 10^10, m = 5, M = 2, m1, m2, m_total, b1/b2, d = 1/p, etc.
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    // Strip KaTeX blocks first to see what's left
    const stripped = line.replace(/\\\\\([^\\]+\\\\\)/g, '[MATH]').replace(/\$\$[^\$]+\$\$/g, '[MATH]');
    
    // Check for raw math formulas or bare numbers with units or variables
    const bareMathPatterns = [
      /\b\d+(\.\d+)?\s*(pc|ly|arcsec|AU|K|nm|W|g|kg|m\/s|J)\b/i,
      /\b[mMLRdTp]\s*=\s*[-+]?\d+/i,
      /\b\d+\s*=\s*[mMLRdTp]/i,
      /\b\d+\^[{]?\d+/i,
      /\b10\^\d+/i,
      /\b\d+\s*×\s*10\^/i,
      /\b\d+\s*เท่า\b/i, // E.g., 2 เท่า, 5 เท่า outside math
      /\b(P-P Chain|CNO Cycle|TiO|Sirius|Alpha)\b/i
    ];

    for (const pat of bareMathPatterns) {
      if (pat.test(stripped)) {
        issues.push({ lineNum, line: line.trim(), matched: line.match(pat)[0] });
        break;
      }
    }
  });

  return issues;
}

console.log('=== CH14-3 ISSUES ===');
console.log(findUnformattedMath('data/ess_adv/ess_adv_m6_ch14-3-data.js'));

console.log('=== CH14-2 ISSUES ===');
console.log(findUnformattedMath('data/ess_adv/ess_adv_m6_ch14-2-data.js'));
