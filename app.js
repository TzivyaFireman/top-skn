const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
const fs = require('fs');
const path = require('path');

function findInvalidLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const invalidLines = [];
  const invalidNumberPattern = /\d+\s+\d+/;

  for (const line of lines) {
    if (invalidNumberPattern.test(line)) {
      invalidLines.push(line);
    }
  }

  return invalidLines;
}

const filesDir = './files';
const reportPath = './report.txt';

const files = fs.readdirSync(filesDir);

let reportContent = '';

for (const file of files) {
  const fullPath = path.join(filesDir, file);

  if (!fs.statSync(fullPath).isFile()) continue;

  reportContent += `קובץ: ${file}\n`;
  reportContent += '----------------\n';

  const invalidLines = findInvalidLines(fullPath);

  if (invalidLines.length === 0) {
    reportContent += 'אין סעיפים לא תקינים\n';
  } else {
    invalidLines.forEach(line => {
      reportContent += line + '\n';
    });
  }

  reportContent += '\n';
}

fs.writeFileSync(reportPath, reportContent, 'utf8');