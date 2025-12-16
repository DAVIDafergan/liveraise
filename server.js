import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { connectDB, Donation, Campaign } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
const host = '0.0.0.0'; 
const distPath = path.join(__dirname, 'dist');

connectDB();

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// 1. קבלת כל הנתונים (קמפיין ותרומות)
app.get('/api/data', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ timestamp: -1 }).limit(50);
        const campaign = await Campaign.findOne({});
        res.json({ campaign, donations });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// 2. שמירת תרומה חדשה ועדכון הסכום בקמפיין
app.post('/api/donations', async (req, res) => {
    try {
        const { firstName, lastName, amount, dedication } = req.body;
        const newDonation = new Donation({ firstName, lastName, amount, dedication });
        await newDonation.save();

        const campaign = await Campaign.findOneAndUpdate({}, { $inc: { currentAmount: amount } }, { new: true });
        res.status(201).json({ donation: newDonation, campaignUpdate: campaign });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save donation' });
    }
});

// 3. עדכון הגדרות קמפיין (כותרות, יעד, דרכי תרומה)
app.patch('/api/campaign', async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// --- הגשת קבצים סטטיים ---
app.use(express.static(distPath));
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    fs.existsSync(indexPath) ? res.sendFile(indexPath) : res.status(404).send('Not Found');
});

app.listen(port, host, () => {
    console.log(`✅ Server running on http://${host}:${port}`);
});