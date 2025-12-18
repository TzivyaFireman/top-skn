
// const http = require('http');
// const fs = require('fs');
// const path = require('path');

// function isInvalidSectionLine(line) {
//   // ארבע קבוצות של 1–3 ספרות:
//   // - שלוש הראשונות מופרדות ברווח אחד או יותר
//   // - הרביעית מופרדת ברווח או בסוף שורה
//   const invalidPattern = /^\s*\d{1,3}\s+\d{1,3}\s+\d{1,3}\s+\d{1,3}(\s|$)/;
//   return invalidPattern.test(line);
// }

// function findInvalidLines(filePath) {
//   return fs.readFileSync(filePath, 'utf8')
//     .split(/\r?\n/)
//     .filter(isInvalidSectionLine);
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



const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable'); // ספרייה לטיפול בהעלאות קבצים

function isInvalidSectionLine(line) {
  const invalidPattern = /^\s*\d{1,3}\s+\d{1,3}\s+\d{1,3}\s+\d{1,3}(\s|$)/;
  return invalidPattern.test(line);
}

function findInvalidLines(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(isInvalidSectionLine);
}

const filesDir = './files';
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir);

const server = http.createServer((req, res) => {
  if (req.method.toLowerCase() === 'get') {
    // דף HTML להעלאת קובץ
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <form action="/" method="post" enctype="multipart/form-data">
        <input type="file" name="uploadedFile"><br><br>
        <button type="submit">Upload</button>
      </form>
    `);
  } else if (req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm({ uploadDir: filesDir, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Error uploading file');
        return;
      }

      const uploadedFile = files.uploadedFile;
      if (!uploadedFile) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('No file uploaded');
        return;
      }

      const report = generateReport(uploadedFile.path, uploadedFile.name);
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(report);
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
  }
});

function generateReport(filePath, fileName) {
  const invalidLines = findInvalidLines(filePath);
  return `קובץ: ${fileName}\n----------------\n` +
    (invalidLines.length ? invalidLines.join('\n') : 'אין סעיפים לא תקינים') + '\n';
}

server.listen(3000, () => console.log('Server running on port 3000'));
