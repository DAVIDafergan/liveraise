import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// הגדרת תיקיית ה־dist כסטטית
app.use(express.static(path.join(__dirname, 'dist')));

// כל הבקשות יחזירו index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
