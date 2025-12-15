import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors'; // ייבוא cors
import { fileURLToPath } from 'url';
import { connectDB, Donation, Campaign } from './db.js'; // ייבוא פונקציית החיבור והמודלים

// --- הגדרות בסיסיות ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; 
const distPath = path.join(__dirname, 'dist');

// --- חיבור ל-Database ---
connectDB();

// --- Middleware ---
app.use(cors()); // הפעלת CORS לטיפול בבקשות מהצד של הלקוח
app.use(express.json()); // מאפשר קריאת גוף בקשות בפורמט JSON

// --- נקודות קצה (API Endpoints) ---

// 1. שמירת תרומה חדשה
app.post('/api/donations', async (req, res) => {
  try {
    const { firstName, lastName, amount, dedication } = req.body;
    
    // ולידציה בסיסית
    if (!firstName || !lastName || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing required fields or invalid amount.' });
    }

    // יצירת אובייקט תרומה חדש
    const newDonation = new Donation({ firstName, lastName, amount, dedication });
    await newDonation.save();

    // עדכון סכום הקמפיין הנוכחי
    const campaign = await Campaign.findOneAndUpdate({}, { $inc: { currentAmount: amount } }, { new: true });

    // כאן תצטרך לשלוח עדכון ל-Frontend (דרך Websockets / Socket.io)

    res.status(201).json({ 
      donation: newDonation, 
      campaignUpdate: campaign 
    });

  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({ error: 'Failed to save donation.' });
  }
});

// 2. קבלת כל התרומות והקמפיין
app.get('/api/data', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ timestamp: -1 }).limit(100);
        const campaign = await Campaign.findOne({});

        res.json({ campaign, donations });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch campaign and donations.' });
    }
});


// --- הגשת קבצים סטטיים (לאחר ה-API) ---
// (החלק הזה נשאר זהה למה שעבד לך)
if (!fs.existsSync(distPath)) {
  console.error('CRITICAL ERROR: "dist" folder is missing! Serving fallback.');
}

app.use(express.static(distPath));

// נתיב ראשי (SPA Fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`<h1>Deployment Error</h1>...`);
  }
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});