import express from 'express';
import path from 'path';

const app = express();

// השתמש ב־PORT שמגיע מ־Railway
const port = process.env.PORT || 3000;

// הגדרת תיקיית dist כסטטית
app.use(express.static(path.join(process.cwd(), 'dist')));

// כל הבקשות יחזירו index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
