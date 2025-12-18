document.getElementById('uploadBtn').addEventListener('click', async () => {
  const input = document.getElementById('filesInput');
  const result = document.getElementById('result');

  if (!input.files.length) {
    alert('יש לבחור לפחות קובץ אחד');
    return;
  }

  const formData = new FormData();
  for (const file of input.files) {
    formData.append('files', file);
  }

  result.textContent = 'מעלה קבצים ומבצע בדיקה...';

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('שגיאה מהשרת');
    }

    const text = await response.text();
result.innerHTML = text;
  } catch (err) {
    result.textContent = 'אירעה שגיאה בהעלאה או בעיבוד הקבצים';
    console.error(err);
  }
});