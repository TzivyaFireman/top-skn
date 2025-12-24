
const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const iconv = require('iconv-lite');
const PORT = process.env.PORT || 3000;

function isInvalidSectionLine(line) {
  // ארבע קבוצות של 1–3 ספרות:
  // - שלוש הראשונות מופרדות ברווח אחד או יותר
  // - הרביעית מופרדת ברווח או בסוף שורה
  // const invalidPattern = /^\s*\d{1,3}\s+\d{1,3}\s+\d{1,3}\s+\d{1,3}(\s|$)/;
  const invalidPattern = /(?:^|\s)\d{1,4}(?:\s+\d{1,4}){2,3}(?=\s|$)/;
  return invalidPattern.test(line);
}

function findInvalidLines(filePath) {
  const buffer = fs.readFileSync(filePath);
  const content = iconv.decode(buffer, 'windows-1255');

  return content

    .split(/\r?\n/)
    .filter(isInvalidSectionLine);
}

const filesDir = './files';

const server = http.createServer((req, res) => {
if (req.method === 'GET' && req.url === '/delete-all') {
  fs.readdirSync(filesDir).forEach(file => {
    const fullPath = path.join(filesDir, file);
    if (fs.statSync(fullPath).isFile()) {
      fs.unlinkSync(fullPath);
    }
  });
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('כל הקבצים נמחקו בהצלחה');
  return;
}

  const publicDir = path.join(__dirname, 'public');

  if (req.method === 'GET') {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(publicDir, filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      res.writeHead(200);
      res.end(data);
    });
    return;
  }

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

      let report = '';
      for (const file of fs.readdirSync(filesDir)) {
        const fullPath = path.join(filesDir, file);
        if (!fs.statSync(fullPath).isFile()) continue;
        const invalidLines = findInvalidLines(fullPath);
        // צבע אדום אם יש סעיפים לא תקינים, ירוק אם הכל תקין
        const color = invalidLines.length ? 'red' : 'green';
        report += `<div style="color:${color}; font-weight:bold;">קובץ: ${file}</div>\n`;
        report += `<pre>${invalidLines.length ? invalidLines.join('\n') : 'אין סעיפים לא תקינים'}</pre>\n`;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
<!DOCTYPE html>
<html lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      direction: rtl;
      font-family: Arial;
      padding: 10px;
    }
    pre {
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
<pre>${report}</pre>
</body>
</html>
`);
    });
    return;
  }
  // מחיקת כל הקבצים בתיקייה

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
