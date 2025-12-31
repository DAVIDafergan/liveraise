import express from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { connectDB, User, Campaign, Donation } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

connectDB();
app.use(cors());
app.use(express.json());

// --- Auth ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    
    const campaign = new Campaign({
      owner: user._id,
      slug: username.toLowerCase(),
      name: `הקמפיין של ${username}`,
      targetAmount: 100000,
      donationMethods: []
    });
    await campaign.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "שם משתמש תפוס" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "משתמש לא נמצא" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    const campaign = await Campaign.findOne({ owner: user._id });
    res.json({ userId: user._id, slug: campaign.slug, username: user.username });
  } else {
    res.status(401).json({ error: "סיסמה שגויה" });
  }
});

// --- API ---
app.get('/api/data/:slug', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug });
    if (!campaign) return res.status(404).json({ error: "לא נמצא" });
    const donations = await Donation.find({ campaignId: campaign._id }).sort({ timestamp: -1 }).limit(50);
    res.json({ campaign, donations });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

app.get('/api/export/:slug', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug });
    const donations = await Donation.find({ campaignId: campaign._id }).sort({ timestamp: -1 });
    res.json(donations);
  } catch (err) { res.status(500).json({ error: "Export Error" }); }
});

app.post('/api/donations/:campaignId', async (req, res) => {
  try {
    const { fullName, amount, dedication, phone } = req.body; // הוספת phone לקבלה מהבקשה
    const donation = new Donation({ campaignId: req.params.campaignId, fullName, amount, dedication, phone }); // הוספת phone ליצירת התרומה
    await donation.save();
    const campaign = await Campaign.findByIdAndUpdate(req.params.campaignId, { $inc: { currentAmount: amount } }, { new: true });
    res.json({ donation, campaignUpdate: campaign });
  } catch (err) { res.status(500).json({ error: "Save Error" }); }
});

app.patch('/api/campaign/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(campaign);
  } catch (err) { res.status(500).json({ error: "Update Error" }); }
});

// --- נתיב איפוס קמפיין חדש ---
app.post('/api/campaign/:id/reset', async (req, res) => {
  try {
    const campaignId = req.params.id;
    // מחיקת כל התרומות המשויכות לקמפיין
    await Donation.deleteMany({ campaignId });
    // איפוס סכום נוכחי וסכום ידני בבסיס הנתונים
    const campaign = await Campaign.findByIdAndUpdate(campaignId, { 
      currentAmount: 0, 
      manualStartingAmount: 0 
    }, { new: true });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ error: "Reset Error" });
  }
});

app.delete('/api/donations/:donationId', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ error: "Not Found" });
    await Donation.findByIdAndDelete(req.params.donationId);
    await Campaign.findByIdAndUpdate(donation.campaignId, { $inc: { currentAmount: -donation.amount } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Delete Error" }); }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, '0.0.0.0', () => console.log(`🚀 Server running on port ${port}`));