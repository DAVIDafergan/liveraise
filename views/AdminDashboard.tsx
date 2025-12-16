import React, { useState, useEffect } from 'react';
import { Send, DollarSign, User, MessageSquare, Settings, Save, Home, Monitor, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', amount: '', dedication: '' });
  const [campaignSettings, setCampaignSettings] = useState({
    name: '', subTitle: '', targetAmount: '', currentAmount: '', currency: '₪',
    qrCodeUrl: '', qrLabel: '', bottomText: '', scale: 1.0
  });

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(data => {
      if (data.campaign) {
        setCampaignSettings({
          ...data.campaign,
          targetAmount: data.campaign.targetAmount.toString(),
          currentAmount: data.campaign.currentAmount.toString(),
          qrCodeUrl: data.campaign.donationMethods?.qrCodeUrl || '',
          qrLabel: data.campaign.donationMethods?.qrLabel || '',
          bottomText: data.campaign.donationMethods?.bottomText || '',
          scale: data.campaign.displaySettings?.scale || 1.0
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: parseInt(formData.amount) })
    });
    if (res.ok) {
      const result = await res.json();
      setCampaignSettings(prev => ({ ...prev, currentAmount: result.campaignUpdate.currentAmount.toString() }));
      setFormData({ firstName: '', lastName: '', amount: '', dedication: '' });
      alert('תרומה נשמרה ב-DB!');
    }
    setLoading(false);
  };

  const handleSettingsSave = async () => {
    setLoading(true);
    const res = await fetch('/api/campaign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: campaignSettings.name,
        subTitle: campaignSettings.subTitle,
        targetAmount: parseInt(campaignSettings.targetAmount),
        currency: campaignSettings.currency,
        donationMethods: {
          qrCodeUrl: campaignSettings.qrCodeUrl,
          qrLabel: campaignSettings.qrLabel,
          bottomText: campaignSettings.bottomText
        },
        displaySettings: { scale: campaignSettings.scale }
      })
    });
    if (res.ok) alert('הגדרות נשמרו ב-DB!');
    setLoading(false);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen" dir="rtl">
      <nav className="flex justify-between mb-8 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-black text-indigo-600">LiveRaise Admin</h1>
        <div className="flex gap-4">
            <Link to="/screen/demo" target="_blank" className="flex items-center gap-2 text-indigo-600 font-bold"><Monitor size={20}/> מסך לייב</Link>
            <button onClick={() => navigate('/')}><LogOut/></button>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign/> הזנת תרומה</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="שם פרטי" className="w-full border p-3 rounded-lg" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <input placeholder="סכום" type="number" className="w-full border p-3 rounded-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <textarea placeholder="הקדשה" className="w-full border p-3 rounded-lg" value={formData.dedication} onChange={e => setFormData({...formData, dedication: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold">שלח ושמור ב-DB</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings/> הגדרות קמפיין</h2>
          <div className="space-y-4">
            <input placeholder="שם הקמפיין" className="w-full border p-2 rounded-lg" value={campaignSettings.name} onChange={e => setCampaignSettings({...campaignSettings, name: e.target.value})} />
            <input placeholder="יעד" type="number" className="w-full border p-2 rounded-lg" value={campaignSettings.targetAmount} onChange={e => setCampaignSettings({...campaignSettings, targetAmount: e.target.value})} />
            <textarea placeholder="פרטי תרומה/בנק" className="w-full border p-2 rounded-lg" value={campaignSettings.bottomText} onChange={e => setCampaignSettings({...campaignSettings, bottomText: e.target.value})} />
            <button onClick={handleSettingsSave} disabled={loading} className="w-full border-2 border-indigo-600 text-indigo-600 p-3 rounded-lg font-bold">עדכן הגדרות ב-DB</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;