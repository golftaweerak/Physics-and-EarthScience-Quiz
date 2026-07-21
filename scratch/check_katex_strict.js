import fs from 'fs';

function inspectFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  // Load module or parse items
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    // Remove all \\(...\\) blocks
    let cleaned = line.replace(/\\\\\([\s\S]*?\\\\\)/g, '___MATH___');
    cleaned = cleaned.replace(/\\\\\([\s\S]*?$/g, '___MATH___'); // partial
    
    // Check for leftover numbers with units, fractions, exponents, or math symbols
    const match = cleaned.match(/\b\d+(\.\d+)?\s*(pc|ly|arcsec|AU|K|nm|W|g|kg|m\/s|J|M_{\\odot}|R_{\\odot}|L_{\\odot})\b|\b[mMLRdTp]\s*=\s*[-+]?\d+|\b\d+\^[{]?\d+|\b(P-P Chain|CNO Cycle|TiO)\b/i);
    
    if (match) {
      console.log(`File: ${filepath} | Line ${i+1}: ${line.trim()}`);
      console.log(`   Found un-katexed: "${match[0]}"`);
      console.log('---');
    }
  });
}

console.log('--- Scanning ch14-3 ---');
inspectFile('data/ess_adv/ess_adv_m6_ch14-3-data.js');

console.log('--- Scanning ch14-2 ---');
inspectFile('data/ess_adv/ess_adv_m6_ch14-2-data.js');
