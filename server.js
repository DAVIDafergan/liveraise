import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// תיקון נתיבים
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// קריטי ל-Railway: שימוש בפורט מהסביבה והאזנה לכל הכתובות
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // <--- השורה הזו היא הקסם שחסר לך

const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// שינוי קריטי בפקודה למטה: הוספת host
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});