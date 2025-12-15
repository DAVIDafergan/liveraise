import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

const distPath = path.join(__dirname, 'dist');

// --- דיאגנוסטיקה (יודפס ללוגים בהפעלה) ---
console.log('--- Server Startup Diagnostics ---');
console.log('Current directory:', __dirname);
try {
  console.log('Root folder contents:', fs.readdirSync(__dirname));
} catch (e) { console.log('Cannot read root folder'); }

if (fs.existsSync(distPath)) {
  console.log('DIST folder exists!');
  console.log('DIST contents:', fs.readdirSync(distPath));
} else {
  console.error('CRITICAL ERROR: DIST folder is MISSING!');
  console.error('Make sure "npm run build" ran successfully in the Build Logs.');
}
console.log('----------------------------------');

// נתיב בדיקה פשוט - עוקף את כל קבצי האתר
app.get('/ping', (req, res) => {
  res.send('PONG! Server is reachable and working.');
});

// הגשת קבצים סטטיים
app.use(express.static(distPath));

// נתיב ראשי
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`
      <h1>Deployment Error</h1>
      <p>The site files are missing.</p>
      <p>Check the "Deploy Logs" in Railway to see the file listing.</p>
    `);
  }
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});