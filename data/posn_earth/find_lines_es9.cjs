const fs = require('fs');
const data = fs.readFileSync('ES9-data.js', 'utf8');
const lines = data.split('\n');

const qs = [5, 20, 25, 26, 29, 30, 31, 37, 38, 41, 42, 43, 44, 48, 53, 55, 56, 58, 61, 62, 63, 64, 65, 66, 69, 70, 71, 72, 73, 80, 87, 88, 89, 90, 93, 97, 102, 103, 104, 105, 106, 107, 108, 109, 110, 112, 114, 115];

qs.forEach(q => {
  let idx = lines.findIndex(l => l.includes(`number: ${q},`));
  if (idx !== -1) {
    console.log(`Q${q}: line ${idx + 1}`);
  }
});
