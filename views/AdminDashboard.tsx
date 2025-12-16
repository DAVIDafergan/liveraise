import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, DollarSign, Settings, Plus, Trash2, 
  ExternalLink, LogOut, BarChart3, QrCode, Layout, History 
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
    const res = await fetch(`/api/data/${user.slug}`);
    const data = await res.json();
    setCampaign(data.campaign);
    setDonations(data.donations);
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

  const handleDeleteDonation = async (id: string) => {
    if (!window.confirm('בטוח שברצונך למחוק תרומה זו?')) return;
    const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('תרומה נמחקה');
      fetchData(); // רענון נתונים
    }
  };

  if (!campaign) return <div className="p-20 text-center font-bold">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Top Navbar */}
      <nav className="bg-white border-b p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Layout size={20}/></div>
            <h1 className="text-xl font-black">LiveRaise Control</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.open(`/screen/${user.slug}`, '_blank')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold flex gap-2 items-center">
              <ExternalLink size={18}/> שיגור מסך
            </button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-slate-400"><LogOut/></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* הגדרות */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-bold mb-4 flex gap-2"><Settings className="text-indigo-600"/> הגדרות קמפיין</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="שם הקמפיין" className="border p-2 rounded-lg" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
              <input type="number" placeholder="יעד" className="border p-2 rounded-lg" value={campaign.targetAmount} onChange={e => setCampaign({...campaign, targetAmount: Number(e.target.value)})} />
              <input type="number" placeholder="נאסף מראש" className="border p-2 rounded-lg bg-emerald-50" value={campaign.manualStartingAmount} onChange={e => setCampaign({...campaign, manualStartingAmount: Number(e.target.value)})} />
            </div>
            <button onClick={handleSaveSettings} className="w-full bg-indigo-600 text-white mt-4 p-3 rounded-xl font-bold">שמור הגדרות</button>
          </div>

          {/* היסטוריה */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-bold mb-4 flex gap-2"><History className="text-slate-600"/> היסטוריית תרומות</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">תורם</th>
                    <th className="p-2">סכום</th>
                    <th className="p-2">הקדשה</th>
                    <th className="p-2 text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d._id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-bold">{d.firstName} {d.lastName}</td>
                      <td className="p-2 text-emerald-600 font-bold">{d.amount} {campaign.currency}</td>
                      <td className="p-2 opacity-60">{d.dedication}</td>
                      <td className="p-2 text-left">
                        <button onClick={() => handleDeleteDonation(d._id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* הוספה וסטטיסטיקה */}
        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
            <p className="opacity-70 text-sm">סה"כ נאסף (לייב)</p>
            <p className="text-4xl font-black">{(campaign.currentAmount + campaign.manualStartingAmount).toLocaleString()} {campaign.currency}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-bold mb-4 flex gap-2"><Send className="text-emerald-500"/> הוספת תרומה</h2>
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              await fetch(`/api/donations/${campaign._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({...formData, amount: Number(formData.amount)})
              });
              setFormData({firstName: '', lastName: '', amount: '', dedication: ''});
              fetchData();
            }}>
              <input placeholder="שם" className="w-full border p-2 rounded-lg" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
              <input type="number" placeholder="סכום" className="w-full border p-2 rounded-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <textarea placeholder="הקדשה" className="w-full border p-2 rounded-lg" value={formData.dedication} onChange={e => setFormData({...formData, dedication: e.target.value})} />
              <button className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold">שגר למסך</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;