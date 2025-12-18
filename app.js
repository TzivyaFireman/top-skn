const http = require('http');
const fs = require('fs');
const path = require('path');

function normalize(num) {
  return num.replace(/^0+/, '');
}

function isValidSectionNumber(token) {
  return /^\d{7,}$/.test(token);
}

function extractSpacedGroups(line) {
  const match = line.match(/(?:^|\s)((\d+\s+){2,}\d+)(?=\s|$)/);
  return match ? match[1] : null;
}

function findInvalidLines(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  const knownSections = new Set();
  const invalidLines = [];

  for (const line of lines) {
    const tokens = line.split(/\s+/);

    for (const t of tokens) {
      if (isValidSectionNumber(t)) {
        knownSections.add(normalize(t));
      }
    }

    const spaced = extractSpacedGroups(line);
    if (spaced) {
      const recomposed = normalize(spaced.replace(/\s+/g, ''));
      if (knownSections.has(recomposed)) {
        invalidLines.push(line);
      }
    }
  }

  return invalidLines;
}

const filesDir = './files';

const server = http.createServer((req, res) => {
  let report = '';
  for (const file of fs.readdirSync(filesDir)) {
    const fullPath = path.join(filesDir, file);
    if (!fs.statSync(fullPath).isFile()) continue;
    report += `קובץ: ${file}\n----------------\n`;
    const invalidLines = findInvalidLines(fullPath);
    report += (invalidLines.length ? invalidLines.join('\n') : 'אין סעיפים לא תקינים') + '\n\n';
  }
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(report);
});

server.listen(3000, () => console.log('Server running on port 3000'));


// const http = require('http');
// const fs = require('fs');
// const path = require('path');

// function findInvalidLines(filePath) {
//   return fs.readFileSync(filePath, 'utf8')
//     .split(/\r?\n/)
//     .filter(line => /\d+\s+\d+/.test(line));
// }

// const filesDir = './files';

// const server = http.createServer((req, res) => {
//   let report = '';
//   for (const file of fs.readdirSync(filesDir)) {
//     const fullPath = path.join(filesDir, file);
//     if (!fs.statSync(fullPath).isFile()) continue;
//     report += `קובץ: ${file}\n----------------\n`;
//     const invalidLines = findInvalidLines(fullPath);
//     report += (invalidLines.length ? invalidLines.join('\n') : 'אין סעיפים לא תקינים') + '\n\n';
//   }
//   res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
//   res.end(report);
// });

// server.listen(3000, () => console.log('Server running on port 3000'));
