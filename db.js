import mongoose from 'mongoose';

// סכמה למשתמש
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // בייצור כדאי להשתמש ב-bcrypt
});

// סכמה לקמפיין - מקושר למשתמש
const CampaignSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, required: true, unique: true }, // מזהה ייחודי לכתובת המסך
  name: { type: String, required: true },
  subTitle: { type: String, default: '' },
  targetAmount: { type: Number, default: 0 },
  currentAmount: { type: Number, default: 0 },
  currency: { type: String, default: '₪' },
  donationMethods: {
    qrCodeUrl: String,
    qrLabel: String,
    bottomText: String,
  },
  displaySettings: { scale: { type: Number, default: 1.0 } },
});

// סכמה לתרומה - מקושרת לקמפיין
const DonationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  amount: { type: Number, required: true },
  dedication: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);
const Donation = mongoose.model('Donation', DonationSchema);

async function connectDB() {
  const url = process.env.MONGO_URL;
  try {
    await mongoose.connect(url);
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
}

export { connectDB, User, Campaign, Donation };