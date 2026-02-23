const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

let currentQuestion = -1;
let currentOptions = [];
let captureOptions = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const qMatch = line.match(/number:\s*(\d+)/);
  if (qMatch) {
    currentQuestion = parseInt(qMatch[1], 10);
  }

  if (line.includes('options: [')) {
    captureOptions = true;
    currentOptions = [];
    continue;
  }

  if (captureOptions) {
    if (line.includes('],')) {
      captureOptions = false;

      const lengths = currentOptions.map(opt => opt.length);
      const maxLength = Math.max(...lengths);
      const minLength = Math.min(...lengths);

      if (maxLength - minLength > 20) {
        console.log(`Q${currentQuestion}: Lengths - ${lengths.join(', ')}`);
        currentOptions.forEach((opt, idx) => console.log(`  Option ${idx + 1} (${opt.length} chars): ${opt}`));
        console.log('---');
      }
    } else {
      const match = line.match(/"(.*)"/);
      if (match) {
        currentOptions.push(match[1]);
      }
    }
  }
}
