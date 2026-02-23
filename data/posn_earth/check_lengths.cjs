const fs = require('fs');
const path = require('path');

const files = [
    'ES7-data.js',
    'ES8-data.js',
    'ES9-data.js',
    'ES10-data.js',
    'ES11-data.js',
    'ES12-data.js'
];

let report = "";

for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        report += `File not found: ${filePath}\n`;
        continue;
    }
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace "export const XXX = [" with "module.exports = ["
    content = content.replace(/export const \w+\s*=\s*\[/, 'module.exports = [');

    // Use .cjs to force Node to treat it as CommonJS
    const tempPath = path.join(__dirname, 'temp_' + file.replace('.js', '.cjs'));
    fs.writeFileSync(tempPath, content);

    try {
        const data = require(tempPath);
        report += `\n--- ${file} ---\n`;
        let count = 0;

        function checkQ(q) {
            if (!q.options || q.options.length < 2) return;
            const lengths = q.options.map(o => o.length);
            const max = Math.max(...lengths);
            const min = Math.min(...lengths);

            // Check if max/min ratio is too high
            if (max / min > 1.8 && max > 50) {
                report += `\nQ${q.number}: lengths = ${lengths.join(', ')}\n`;
                q.options.forEach(o => {
                    const isAns = (o === q.answer) ? '(ANS)' : '(   )';
                    report += `  ${isAns} [${o.length}] ${o}\n`;
                });
                count++;
            }
        }

        for (const item of data) {
            if (item.type === 'scenario') {
                if (item.questions) item.questions.forEach(checkQ);
            } else {
                checkQ(item);
            }
        }
        if (count === 0) report += "All good!\n";
    } catch (e) {
        report += `Error in ${file}: ${e.message}\n`;
    }

    fs.unlinkSync(tempPath);
}

fs.writeFileSync(path.join(__dirname, 'report.txt'), report, 'utf-8');
