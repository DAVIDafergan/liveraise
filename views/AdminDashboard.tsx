import React, { useState } from 'react';
import { broadcastService } from '../services/broadcastService';
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

  // Campaign Settings State - Initialized lazily to read from localStorage
  const [campaignSettings, setCampaignSettings] = useState(() => {
    let savedScale = 1.0;
    try {
      const saved = localStorage.getItem('liveraise_display_settings');
      if (saved) {
        savedScale = JSON.parse(saved).scale || 1.0;
      }
    } catch (e) {
      console.error("Error loading saved settings", e);
    }

    return {
      name: 'בונים עתיד ביחד',
      subTitle: 'ערב התרמה שנתי 2025',
      targetAmount: '5000000',
      currentAmount: '1245000',
      currency: '₪',
      qrCodeUrl: 'https://picsum.photos/300/300?grayscale',
      qrLabel: 'סרוק לתרומה ב-Bit',
      bottomText: 'להעברה בנקאית:\nבנק 12 | סניף 345 | ח-ן 123456',
      scale: savedScale
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.amount) return;

    setLoading(true);

    const newDonation = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      amount: parseInt(formData.amount),
      dedication: formData.dedication,
      timestamp: Date.now()
    };

    // Simulate API call
    setTimeout(() => {
      broadcastService.emit(EventType.NEW_DONATION, newDonation);
      setFormData({ firstName: '', lastName: '', amount: '', dedication: '' });
      setLoading(false);
      // Optional: Add visual success feedback
    }, 600);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist scale locally for the admin so it remembers the setting on reload
    localStorage.setItem('liveraise_display_settings', JSON.stringify({
      scale: campaignSettings.scale
    }));

    broadcastService.emit(EventType.UPDATE_SETTINGS, {
      name: campaignSettings.name,
      subTitle: campaignSettings.subTitle,
      targetAmount: parseInt(campaignSettings.targetAmount),
      currentAmount: parseInt(campaignSettings.currentAmount),
      currency: campaignSettings.currency,
      donationMethods: {
        qrCodeUrl: campaignSettings.qrCodeUrl,
        qrLabel: campaignSettings.qrLabel,
        bottomText: campaignSettings.bottomText
      },
      displaySettings: {
        scale: campaignSettings.scale
      }
    });
    alert('הגדרות עודכנו בהצלחה!');
  };

  const handleResetConfirm = () => {
    broadcastService.emit(EventType.RESET_CAMPAIGN, {});
    setShowResetModal(false);
  };

  const setScalePreset = (scale: number) => {
    setCampaignSettings(prev => ({ ...prev, scale }));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                title="חזרה לדף הבית"
              >
                <Home size={20} />
              </button>
              <span className="text-2xl font-black text-indigo-600 tracking-tighter border-r border-slate-200 pr-4 mr-2">LiveRaise Admin</span>
            </div>
            <div className="flex items-center gap-4">
               <Link 
                 to="/screen/demo" 
                 target="_blank" 
                 className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
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
          
          {/* Main Form */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4 border-b border-indigo-700">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  הזנת תרומה ידנית
                </h2>
                <p className="text-indigo-200 text-sm mt-1">התרומה תופיע מיידית על המסך הראשי</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">שם פרטי</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="block w-full pr-10 border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-slate-50 border"
                        placeholder="ישראל"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">שם משפחה</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-slate-50 border"
                      placeholder="ישראלי"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">סכום התרומה (₪)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3 text-lg font-bold bg-slate-50 border"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">הקדשה / הודעה (אופציונלי)</label>
                  <div className="relative">
                    <div className="absolute top-3 right-3 pointer-events-none text-slate-400">
                        <MessageSquare size={18} />
                    </div>
                    <textarea
                      rows={3}
                      value={formData.dedication}
                      onChange={(e) => setFormData({...formData, dedication: e.target.value})}
                      className="block w-full pr-10 border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-slate-50 border"
                      placeholder="להצלחת..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'שולח...' : (
                      <>
                        <Send size={20} />
                        שלח למסך
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <ImageIcon className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">התאמה אישית של דרכי תרומה</h3>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">קישור לתמונת QR (URL)</label>
                    <input 
                      type="text" 
                      value={campaignSettings.qrCodeUrl}
                      onChange={e => setCampaignSettings({...campaignSettings, qrCodeUrl: e.target.value})}
                      className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm text-left dir-ltr" 
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">טקסט תווית ל-QR</label>
                    <input 
                      type="text" 
                      value={campaignSettings.qrLabel}
                      onChange={e => setCampaignSettings({...campaignSettings, qrLabel: e.target.value})}
                      className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">טקסט תחתון / פרטי בנק (ניתן למחוק)</label>
                    <div className="relative">
                      <div className="absolute top-3 right-3 pointer-events-none text-slate-400">
                          <AlignLeft size={16} />
                      </div>
                      <textarea
                        rows={3}
                        value={campaignSettings.bottomText}
                        onChange={e => setCampaignSettings({...campaignSettings, bottomText: e.target.value})}
                        className="block w-full pr-8 border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm font-mono"
                        placeholder="פרטי חשבון בנק..."
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSettingsSave}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Save size={16} />
                    עדכן תצוגת מסך
                  </button>
               </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Settings className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">הגדרות קמפיין</h3>
              </div>
              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">שם הקמפיין</label>
                      <input 
                          type="text" 
                          required
                          value={campaignSettings.name}
                          onChange={e => setCampaignSettings({...campaignSettings, name: e.target.value})}
                          className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm" 
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                        <Type size={12} />
                        כותרת משנה
                      </label>
                      <input 
                          type="text" 
                          required
                          value={campaignSettings.subTitle}
                          onChange={e => setCampaignSettings({...campaignSettings, subTitle: e.target.value})}
                          className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm" 
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">יעד גיוס</label>
                          <input 
                              type="number" 
                              required
                              value={campaignSettings.targetAmount}
                              onChange={e => setCampaignSettings({...campaignSettings, targetAmount: e.target.value})}
                              className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">מטבע</label>
                          <select 
                              value={campaignSettings.currency}
                              onChange={e => setCampaignSettings({...campaignSettings, currency: e.target.value})}
                              className="block w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-slate-50 border text-sm"
                          >
                              <option value="₪">₪ (ILS)</option>
                              <option value="$">$ (USD)</option>
                              <option value="€">€ (EUR)</option>
                          </select>
                      </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">עדכון סכום שנאסף (ידני)</label>
                    <input 
                        type="number" 
                        required
                        value={campaignSettings.currentAmount}
                        onChange={e => setCampaignSettings({...campaignSettings, currentAmount: e.target.value})}
                        className="block w-full border-emerald-200 ring-1 ring-emerald-100 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2 bg-emerald-50 border text-sm font-bold text-emerald-800" 
                    />
                  </div>
              </div>
            </div>

            {/* Display Resolution Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <Maximize className="text-slate-400" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">גודל תצוגה (רזולוציה)</h3>
               </div>
               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">קנה מידה (Zoom)</label>
                       <span className="text-xs bg-slate-100 px-2 py-1 rounded font-mono font-bold">x{campaignSettings.scale}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3.0" 
                      step="0.1" 
                      value={campaignSettings.scale}
                      onChange={e => setCampaignSettings({...campaignSettings, scale: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                     <button 
                       type="button"
                       onClick={() => setScalePreset(1.0)}
                       className={`py-2 text-xs font-bold rounded-lg border ${campaignSettings.scale === 1.0 ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                     >
                       רגיל (HD)
                     </button>
                     <button 
                       type="button"
                       onClick={() => setScalePreset(1.5)}
                       className={`py-2 text-xs font-bold rounded-lg border ${campaignSettings.scale === 1.5 ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                     >
                       4K
                     </button>
                     <button 
                       type="button"
                       onClick={() => setScalePreset(2.5)}
                       className={`py-2 text-xs font-bold rounded-lg border ${campaignSettings.scale === 2.5 ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                     >
                       ענק (Max)
                     </button>
                  </div>

                  <button 
                    onClick={handleSettingsSave}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors mt-2"
                  >
                    <Save size={16} />
                    עדכן הגדרות
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-900 mb-4">פעולות מהירות</h3>
               <div className="space-y-3">
                  <button 
                    onClick={() => setShowResetModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                  >
                    <RefreshCw size={18} />
                    <div className="text-right">
                      <span className="block font-bold text-sm">איפוס מסך</span>
                      <span className="block text-xs opacity-70">נקה את כל התרומות מהמסך</span>
                    </div>
                  </button>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">סטטוס מערכת</h3>
                <div className="flex items-center gap-2 text-emerald-400 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span>Live Socket Active</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">איפוס מסך</h3>
                </div>
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-600 text-lg">
                  האם אתה בטוח שברצונך לאפס את המסך?
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  פעולה זו תמחק את כל התרומות מהתצוגה החיה ולא ניתן לבטל אותה.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  ביטול
                </button>
                <button 
                  onClick={handleResetConfirm}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                >
                  כן, אפס הכל
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;