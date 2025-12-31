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
  themeColor: { type: String, default: '#10b981' }, 
  backgroundColor: { type: String, default: '#020617' }, // התווסף: שמירת צבע רקע
  logoUrl: { type: String, default: '' }, 
  bannerUrl: { type: String, default: '' }, 
  
  donationMethods: [{
    methodType: String,
    qrCodeUrl: String,
    label: String
  }],
  // התווסף: תמיכה במידות רוחב וגובה עבור מסכי לדים (4K)
  displaySettings: { 
    scale: { type: Number, default: 1.0 },
    width: { type: Number },
    height: { type: Number }
  },
});

const DonationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  fullName: { type: String, required: true }, 
  phone: { type: String, default: '' }, // הוספת שדה טלפון למסד הנתונים
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