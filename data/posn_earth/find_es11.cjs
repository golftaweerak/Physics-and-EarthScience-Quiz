const fs = require('fs');

const lines = fs.readFileSync('ES11-data.js', 'utf-8').split('\n');

const qs = ['Q13', 'Q25', 'Q28', 'Q34', 'Q44', 'Q45', 'Q47', 'Q51', 'Q56', 'Q57', 'Q58', 'Q59', 'Q65', 'Q67', 'Q70', 'Q74', 'Q76', 'Q77', 'Q78', 'Q80', 'Q82', 'Q83', 'Q86', 'Q88', 'Q93', 'Q95', 'Q96', 'Q98', 'Q101', 'Q102', 'Q104', 'Q105', 'Q106', 'Q107', 'Q108', 'Q109', 'Q110'];

for (let i = 0; i < lines.length; i++) {
  const idMatch = lines[i].match(/number: (\d+),/);
  if (idMatch) {
    const qId = 'Q' + idMatch[1];
    if (qs.includes(qId)) console.log(qId + ' starts around line ' + (i + 1));
  }
}
