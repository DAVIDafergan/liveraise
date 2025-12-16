import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, DollarSign, Settings, Plus, Trash2, 
  ExternalLink, LogOut, BarChart3, QrCode, Layout 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [campaign, setCampaign] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', amount: '', dedication: '' });

  useEffect(() => {
    if (!user.slug) {
      navigate('/');
      return;
    }
    fetch(`/api/data/${user.slug}`)
      .then(res => res.json())
      .then(data => setCampaign(data.campaign));
  }, [user.slug, navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaign/${campaign._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      });
      if (res.ok) alert('ההגדרות נשמרו בהצלחה!');
    } catch (e) {
      alert('שגיאה בשמירה');
    } finally {
      setLoading(false);
    }
  };

  const addQRMethod = () => {
    const methods = [...(campaign.donationMethods || []), { methodType: '', qrCodeUrl: '', label: '' }];
    setCampaign({ ...campaign, donationMethods: methods });
  };

  if (!campaign) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      {/* Navbar המשופר */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">LiveRaise <span className="text-slate-400 font-light">| Dashboard</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open(`/screen/${user.slug}`, '_blank')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
            >
              <ExternalLink size={18} />
              שיגור מסך לייב
            </button>
            <button 
              onClick={() => { localStorage.clear(); navigate('/'); }}
              className="text-slate-400 hover:text-red-500 p-2"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* עמודה ימנית: הגדרות קמפיין */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <Settings className="text-indigo-600" />
              <h2 className="text-xl font-bold">הגדרות קמפיין ותצוגה</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">שם הקמפיין</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={campaign.name} 
                  onChange={e => setCampaign({...campaign, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">יעד גיוס ({campaign.currency})</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={campaign.targetAmount} 
                  onChange={e => setCampaign({...campaign, targetAmount: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-600">סכום שנאסף מראש (ידני)</label>
                <input 
                  type="number"
                  className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700"
                  value={campaign.manualStartingAmount} 
                  onChange={e => setCampaign({...campaign, manualStartingAmount: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2"><QrCode size={18}/> דרכי תרומה (QR)</h3>
                <button onClick={addQRMethod} className="text-indigo-600 text-sm font-bold hover:underline">+ הוסף דרך חדשה</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {campaign.donationMethods?.map((m: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <input 
                      placeholder="סוג (Bit)" 
                      className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-sm"
                      value={m.methodType} 
                      onChange={e => {
                        const newMethods = [...campaign.donationMethods];
                        newMethods[i].methodType = e.target.value;
                        setCampaign({...campaign, donationMethods: newMethods});
                      }}
                    />
                    <input 
                      placeholder="URL לתמונת QR" 
                      className="flex-[2] bg-white border border-slate-200 p-2 rounded-lg text-sm"
                      value={m.qrCodeUrl}
                      onChange={e => {
                        const newMethods = [...campaign.donationMethods];
                        newMethods[i].qrCodeUrl = e.target.value;
                        setCampaign({...campaign, donationMethods: newMethods});
                      }}
                    />
                    <button onClick={() => {
                      const newMethods = campaign.donationMethods.filter((_:any, idx:number) => idx !== i);
                      setCampaign({...campaign, donationMethods: newMethods});
                    }} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
            >
              <Save size={20} />
              {loading ? 'שומר שינויים...' : 'שמור את כל ההגדרות'}
            </button>
          </div>
        </div>

        {/* עמודה שמאלית: הזנת תרומות וסטטיסטיקה */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <BarChart3 size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">סטטוס נוכחי</span>
            </div>
            <div className="text-4xl font-black mb-1">
              {((campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0)).toLocaleString()} {campaign.currency}
            </div>
            <p className="text-indigo-100 text-sm">מתוך יעד של {campaign.targetAmount.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-emerald-500" />
              <h2 className="text-xl font-bold">הוספת תרומה לייב</h2>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const res = await fetch(`/api/donations/${campaign._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...formData, amount: Number(formData.amount)})
              });
              if (res.ok) {
                const result = await res.json();
                setCampaign({...campaign, currentAmount: result.campaignUpdate.currentAmount});
                setFormData({firstName: '', lastName: '', amount: '', dedication: ''});
                alert('התרומה נשלחה למסך!');
              }
              setLoading(false);
            }}>
              <input 
                placeholder="שם התורם" 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <input 
                type="number" 
                placeholder="סכום" 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
              <textarea 
                placeholder="הקדשה למסך" 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.dedication}
                onChange={e => setFormData({...formData, dedication: e.target.value})}
              />
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100">
                <Send size={20} />
                שגר למסך הלייב
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;