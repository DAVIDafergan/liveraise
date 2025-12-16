import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const CampaignSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subTitle: { type: String, default: '' },
  targetAmount: { type: Number, default: 0 },
  manualStartingAmount: { type: Number, default: 0 }, // כמה אספו עד עכשיו ידנית
  currentAmount: { type: Number, default: 0 }, // תרומות מהמערכת
  currency: { type: String, default: '₪' },
  donationMethods: [{ // רשימת דרכי תרומה
    methodType: String, // Bit, העברה, וכו'
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
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
  }
}

export { connectDB, User, Campaign, Donation };