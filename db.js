import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CampaignSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subTitle: { type: String, default: '' },
  targetAmount: { type: Number, default: 0 },
  manualStartingAmount: { type: Number, default: 0 },
  currentAmount: { type: Number, default: 0 },
  currency: { type: String, default: '₪' },
  
  // --- הגדרות עיצוב ומיתוג ---
  themeColor: { type: String, default: '#10b981' }, // צבע ראשי
  logoUrl: { type: String, default: '' }, // לוגו (אופציונלי)
  bannerUrl: { type: String, default: '' }, // באנר עליון (אופציונלי)
  
  donationMethods: [{
    methodType: String,
    qrCodeUrl: String,
    label: String
  }],
  displaySettings: { scale: { type: Number, default: 1.0 } },
});

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
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

export { connectDB, User, Campaign, Donation };