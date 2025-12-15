import mongoose from 'mongoose';

// ------------------------------------
// 1. הגדרת הסכמות (Schemas)
// ------------------------------------

// סכמה לתרומה
const DonationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  dedication: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

// סכמה לקמפיין
const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subTitle: { type: String, default: '' },
  targetAmount: { type: Number, default: 0 },
  currentAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'ILS' },
  donationMethods: {
    qrCodeUrl: String,
    qrLabel: String,
    bottomText: String,
  },
  displaySettings: {
    scale: { type: Number, default: 1.0 },
  },
});

// ------------------------------------
// 2. הגדרת המודלים
// ------------------------------------
const Donation = mongoose.model('Donation', DonationSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);

// ------------------------------------
// 3. פונקציית החיבור ל-DB
// ------------------------------------
async function connectDB() {
  const url = process.env.MONGO_URL;

  if (!url) {
    console.error('CRITICAL ERROR: MONGO_URL not found in environment variables. Database connection skipped.');
    return;
  }

  try {
    await mongoose.connect(url);
    console.log('✅ MongoDB connected successfully!');
    
    // יצירת קמפיין ברירת מחדל אם אין
    await initializeDefaultCampaign();

  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
  }
}

// פונקציה ליצירת קמפיין ברירת מחדל
async function initializeDefaultCampaign() {
  const existingCampaign = await Campaign.findOne({});
  if (!existingCampaign) {
    const defaultCampaign = new Campaign({
      name: 'קמפיין התרמה חי',
      subTitle: 'עזרו לנו להגיע ליעד!',
      targetAmount: 100000,
      currentAmount: 0,
    });
    await defaultCampaign.save();
    console.log('✨ Default campaign created successfully.');
  }
}

// ------------------------------------
// 4. ייצוא
// ------------------------------------
export { connectDB, Donation, Campaign };