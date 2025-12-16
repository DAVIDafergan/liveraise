import React, { useState, useEffect } from 'react';
import { EventType } from '../types';
import { Send, DollarSign, User, MessageSquare, RefreshCw, Monitor, LogOut, Settings, Save, Home, Image as ImageIcon, AlignLeft, Type, Maximize, AlertTriangle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    amount: '',
    dedication: ''
  });

  const [campaignSettings, setCampaignSettings] = useState({
    name: '',
    subTitle: '',
    targetAmount: '',
    currentAmount: '',
    currency: '₪',
    qrCodeUrl: '',
    qrLabel: '',
    bottomText: '',
    scale: 1.0
  });

  // --- 1. משיכת נתונים ראשונית מה-MongoDB ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        if (data.campaign) {
          setCampaignSettings({
            name: data.campaign.name,
            subTitle: data.campaign.subTitle,
            targetAmount: data.campaign.targetAmount.toString(),
            currentAmount: data.campaign.currentAmount.toString(),
            currency: data.campaign.currency,
            qrCodeUrl: data.campaign.donationMethods?.qrCodeUrl || '',
            qrLabel: data.campaign.donationMethods?.qrLabel || '',
            bottomText: data.campaign.donationMethods?.bottomText || '',
            scale: data.campaign.displaySettings?.scale || 1.0
          });
        }
      } catch (error) {
        console.error("שגיאה במשיכת נתונים:", error);
      }
    };
    fetchData();
  }, []);

  // --- 2. שמירת תרומה חדשה ל-MongoDB ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.amount) return;

    setLoading(true);

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          amount: parseInt(formData.amount),
          dedication: formData.dedication
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // עדכון הסכום הנוכחי בתצוגה מהערך שחזר מהשרת
        setCampaignSettings(prev => ({
          ...prev,
          currentAmount: result.campaignUpdate.currentAmount.toString()
        }));
        setFormData({ firstName: '', lastName: '', amount: '', dedication: '' });
        alert('התרומה נשמרה בהצלחה ב-Database!');
      }
    } catch (error) {
      alert('שגיאה בשמירת התרומה');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. עדכון הגדרות קמפיין (אופציונלי - דורש Endpoint נוסף בשרת) ---
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // כרגע השרת שלך תומך רק בהוספת תרומות. 
    // כדי לשמור הגדרות קמפיין ב-DB, תצטרך להוסיף app.patch('/api/campaign') ב-server.js
    alert('הגדרות התצוגה נשמרו מקומית. לשמירה קבועה ב-DB יש להוסיף נתיב עדכון בשרת.');
  };

  const setScalePreset = (scale: number) => {
    setCampaignSettings(prev => ({ ...prev, scale }));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-lg"
              >
                <Home size={20} />
              </button>
              <span className="text-2xl font-black text-indigo-600 tracking-tighter pr-4 border-r border-slate-200">LiveRaise Admin</span>
            </div>
            <div className="flex items-center gap-4">
               <Link 
                 to="/screen/demo" 
                 target="_blank" 
                 className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-bold"
               >
                 <Monitor size={18} />
                 פתח מסך תצוגה
               </Link>
               <button onClick={() => navigate('/')} className="text-slate-400 hover:text-red-500">
                 <LogOut size={20} />
               </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  הזנת תרומה למסד הנתונים
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">שם פרטי</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="block w-full border-slate-300 rounded-lg p-3 bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">שם משפחה</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="block w-full border-slate-300 rounded-lg p-3 bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">סכום (₪)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="block w-full border-slate-300 rounded-lg p-3 text-lg font-bold bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">הקדשה</label>
                  <textarea
                    rows={3}
                    value={formData.dedication}
                    onChange={(e) => setFormData({...formData, dedication: e.target.value})}
                    className="block w-full border-slate-300 rounded-lg p-3 bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'שומר במסד הנתונים...' : 'שלח ושמור לצמיתות'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600">
                <Settings size={20} />
                מצב נוכחי ב-DB
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-bold uppercase">סכום שנאסף (מעודכן)</p>
                  <p className="text-2xl font-black text-emerald-700">
                    {Number(campaignSettings.currentAmount).toLocaleString()} {campaignSettings.currency}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">יעד</label>
                  <p className="font-bold">{Number(campaignSettings.targetAmount).toLocaleString()} {campaignSettings.currency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;