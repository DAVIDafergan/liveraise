import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, DollarSign, Settings, Plus, Trash2, 
  ExternalLink, LogOut, BarChart3, QrCode, Layout, History, Save 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [campaign, setCampaign] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', amount: '', dedication: '' });

  const fetchData = async () => {
    if (!user.slug) { navigate('/'); return; }
    try {
      const res = await fetch(`/api/data/${user.slug}`);
      const data = await res.json();
      setCampaign(data.campaign);
      setDonations(data.donations || []);
    } catch (e) { console.error("Error fetching", e); }
  };

  useEffect(() => { fetchData(); }, [user.slug]);

  const handleSaveSettings = async () => {
    setLoading(true);
    await fetch(`/api/campaign/${campaign._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    });
    setLoading(false);
    alert('הגדרות נשמרו!');
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.firstName) return;
    setLoading(true);
    const res = await fetch(`/api/donations/${campaign._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: Number(formData.amount) })
    });
    if (res.ok) {
      setFormData({ firstName: '', lastName: '', amount: '', dedication: '' });
      fetchData(); // רענון היסטוריה וסכומים
    }
    setLoading(false);
  };

  const addQR = () => {
    const methods = [...(campaign.donationMethods || []), { methodType: '', qrCodeUrl: '' }];
    setCampaign({ ...campaign, donationMethods: methods });
  };

  if (!campaign) return <div className="p-20 text-center">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white border-b p-4 sticky top-0 z-50 shadow-sm flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Layout size={20}/></div>
          <h1 className="text-xl font-bold">ניהול LiveRaise</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.open(`/screen/${user.slug}`, '_blank')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold flex gap-2 items-center">
            <ExternalLink size={18}/> שיגור מסך
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-slate-400"><LogOut/></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* הגדרות קמפיין ודרכי תרומה */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-bold mb-6 flex gap-2 items-center border-b pb-2">
              <Settings className="text-indigo-600" size={20}/> הגדרות ותשלומים
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold opacity-50">שם הקמפיין</label>
                <input className="w-full border p-2 rounded-lg" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold opacity-50">יעד גיוס</label>
                <input type="number" className="w-full border p-2 rounded-lg" value={campaign.targetAmount} onChange={e => setCampaign({...campaign, targetAmount: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-600">סכום ידני שנאסף</label>
                <input type="number" className="w-full border p-2 rounded-lg bg-emerald-50" value={campaign.manualStartingAmount} onChange={e => setCampaign({...campaign, manualStartingAmount: Number(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><QrCode size={16}/> ניהול דרכי תרומה (QR)</h3>
              {campaign.donationMethods?.map((m: any, i: number) => (
                <div key={i} className="flex gap-3 bg-slate-50 p-2 rounded-xl border">
                  <input placeholder="סוג (Bit)" className="w-1/3 border p-2 rounded-lg bg-white" value={m.methodType} onChange={e => {
                    const methods = [...campaign.donationMethods];
                    methods[i].methodType = e.target.value;
                    setCampaign({...campaign, donationMethods: methods});
                  }} />
                  <input placeholder="URL ל-QR" className="w-full border p-2 rounded-lg bg-white" value={m.qrCodeUrl} onChange={e => {
                    const methods = [...campaign.donationMethods];
                    methods[i].qrCodeUrl = e.target.value;
                    setCampaign({...campaign, donationMethods: methods});
                  }} />
                  <button onClick={() => {
                    const methods = campaign.donationMethods.filter((_:any,idx:number)=>idx!==i);
                    setCampaign({...campaign, donationMethods: methods});
                  }} className="text-red-400 p-2"><Trash2 size={20}/></button>
                </div>
              ))}
              <button onClick={addQR} className="text-indigo-600 text-sm font-bold">+ הוסף אפשרות תרומה</button>
            </div>
            <button onClick={handleSaveSettings} className="w-full bg-indigo-600 text-white mt-6 p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
              <Save size={20}/> שמור את כל ההגדרות
            </button>
          </div>

          {/* היסטוריה */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-bold mb-4 flex gap-2 items-center"><History size={20}/> היסטוריית תרומות</h2>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="p-3">תורם</th>
                    <th className="p-3">סכום</th>
                    <th className="p-3">הקדשה</th>
                    <th className="p-3 text-left">מחיקה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold">{d.firstName} {d.lastName}</td>
                      <td className="p-3 text-emerald-600 font-bold">{d.amount} {campaign.currency}</td>
                      <td className="p-3 text-slate-400 text-xs">{d.dedication}</td>
                      <td className="p-3 text-left">
                        <button onClick={async () => {
                          if(confirm('למחוק?')) {
                            await fetch(`/api/donations/${d._id}`, {method: 'DELETE'});
                            fetchData();
                          }
                        }} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* צד שמאל: שליחה וסטטוס */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-xl">
            <p className="opacity-70 text-sm font-bold mb-1">סה"כ גויס (כולל ידני)</p>
            <p className="text-4xl font-black">{(campaign.currentAmount + campaign.manualStartingAmount).toLocaleString()} {campaign.currency}</p>
            <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
               <div className="bg-white h-full" style={{width: `${Math.min(((campaign.currentAmount + campaign.manualStartingAmount)/campaign.targetAmount)*100, 100)}%`}}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-bold mb-4 flex gap-2 items-center"><Send className="text-emerald-500" size={20}/> הוספת תרומה לייב</h2>
            <form className="space-y-4" onSubmit={handleAddDonation}>
              <input placeholder="שם פרטי" className="w-full border p-3 rounded-xl bg-slate-50" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
              <input placeholder="שם משפחה" className="w-full border p-3 rounded-xl bg-slate-50" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              <input type="number" placeholder="סכום תרומה" className="w-full border p-3 rounded-xl bg-slate-50 font-bold text-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <textarea placeholder="הקדשה למסך..." className="w-full border p-3 rounded-xl bg-slate-50" value={formData.dedication} onChange={e => setFormData({...formData, dedication: e.target.value})} />
              <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2">
                <Send size={18}/> {loading ? 'שולח...' : 'שגר למסך הלייב'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;