import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { connectDB, User, Campaign, Donation } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

connectDB();
app.use(cors());
app.use(express.json());

// --- מערכת אימות (Auth) ---

// הרשמה
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    
    // יצירת קמפיין ברירת מחדל למשתמש החדש
    const campaign = new Campaign({
      owner: user._id,
      slug: username.toLowerCase(), // ה-slug יהיה שם המשתמש
      name: `הקמפיין של ${username}`,
      targetAmount: 100000
    });
    await campaign.save();
    
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "שם משתמש כבר קיים" });
  }
});

// כניסה
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    const campaign = await Campaign.findOne({ owner: user._id });
    res.json({ userId: user._id, slug: campaign.slug, username: user.username });
  } else {
    res.status(401).json({ error: "פרטים שגויים" });
  }
});

// --- API לניהול קמפיין ---

// קבלת נתונים לפי SLUG (למסך הלייב ולדשבורד)
app.get('/api/data/:slug', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug });
    if (!campaign) return res.status(404).json({ error: "קמפיין לא נמצא" });
    
    const donations = await Donation.find({ campaignId: campaign._id }).sort({ timestamp: -1 }).limit(50);
    res.json({ campaign, donations });
  } catch (err) {
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// הוספת תרומה לקמפיין ספציפי
app.post('/api/donations/:campaignId', async (req, res) => {
  try {
    const { firstName, lastName, amount, dedication } = req.body;
    const donation = new Donation({ campaignId: req.params.campaignId, firstName, lastName, amount, dedication });
    await donation.save();
    
    const campaign = await Campaign.findByIdAndUpdate(req.params.campaignId, { $inc: { currentAmount: amount } }, { new: true });
    res.json({ donation, campaignUpdate: campaign });
  } catch (err) {
    res.status(500).json({ error: "שגיאה בשמירת התרומה" });
  }
});

// עדכון הגדרות קמפיין
app.patch('/api/campaign/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: "שגיאה בעדכון" });
  }
});
// מחיקת תרומה ועדכון הסכום בקמפיין
app.delete('/api/donations/:donationId', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ error: "תרומה לא נמצאה" });

    const campaignId = donation.campaignId;
    const amountToSubtract = donation.amount;

    await Donation.findByIdAndDelete(req.params.donationId);
    
    // עדכון הסכום בקמפיין (חיסור)
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId, 
      { $inc: { currentAmount: -amountToSubtract } }, 
      { new: true }
    );

    res.json({ success: true, campaignUpdate: campaign });
  } catch (err) {
    res.status(500).json({ error: "שגיאה במחיקה" });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, '0.0.0.0', () => console.log(`Server on ${port}`));