
const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

function isInvalidSectionLine(line) {
  // ארבע קבוצות של 1–3 ספרות:
  // - שלוש הראשונות מופרדות ברווח אחד או יותר
  // - הרביעית מופרדת ברווח או בסוף שורה
  // const invalidPattern = /^\s*\d{1,3}\s+\d{1,3}\s+\d{1,3}\s+\d{1,3}(\s|$)/;
const invalidPattern = /(?:^|\s)\d{1,4}(?:\s+\d{1,4}){2,3}(?=\s|$)/;
  return invalidPattern.test(line);
}

function findInvalidLines(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(isInvalidSectionLine);
}

const filesDir = './files';

const server = http.createServer((req, res) => {
  // העלאת קבצים
  if (req.method === 'POST' && req.url === '/upload') {
    const form = new formidable.IncomingForm({
      multiples: true,
      uploadDir: filesDir,
      keepExtensions: true
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('שגיאה בהעלאת הקובץ');
        return;
      }

      const uploaded = Array.isArray(files.files)
        ? files.files
        : [files.files];

      uploaded.forEach(file => {
        const targetPath = path.join(filesDir, file.originalFilename);
        fs.renameSync(file.filepath, targetPath);
      });

      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('הקבצים נשמרו בהצלחה');
    });

    return;
  }

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



