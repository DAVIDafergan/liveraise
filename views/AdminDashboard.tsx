import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Settings, Trash2, ExternalLink, LogOut, QrCode, Layout, History, Save, Download, Palette, Image as ImageIcon, LayoutTemplate } from 'lucide-react';

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
    } catch (e) {}
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
    setLoading(true);
    const res = await fetch(`/api/donations/${campaign._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: Number(formData.amount) })
    });
    if (res.ok) {
      setFormData({ firstName: '', lastName: '', amount: '', dedication: '' });
      fetchData();
    }
    setLoading(false);
  };

  const exportToCSV = async () => {
    const res = await fetch(`/api/export/${user.slug}`);
    const data = await res.json();
    const csvContent = "data:text/csv;charset=utf-8," + "Name,Amount,Dedication,Date\n" + data.map((d: any) => `${d.firstName} ${d.lastName},${d.amount},${d.dedication},${new Date(d.timestamp).toLocaleDateString()}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `donations_${user.slug}.csv`;
    link.click();
  };

  if (!campaign) return <div className="p-20 text-center">טוען...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
      <nav className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Layout size={20}/></div>
          <h1 className="text-xl font-bold">LiveRaise Admin</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.open(`/screen/${user.slug}`, '_blank')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold flex gap-2 items-center shadow-emerald-200 shadow-lg">
            <ExternalLink size={18}/> שיגור מסך
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-slate-400"><LogOut/></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-bold mb-6 border-b pb-2 flex gap-2"><Settings className="text-indigo-600"/> הגדרות קמפיין</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500">שם הקמפיין</label>
                 <input className="w-full border p-2 rounded-lg" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500">יעד גיוס</label>
                 <input type="number" className="w-full border p-2 rounded-lg" value={campaign.targetAmount} onChange={e => setCampaign({...campaign, targetAmount: Number(e.target.value)})} />
               </div>
            </div>
            
            {/* מיתוג אישי */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-4">
               <h3 className="font-bold text-sm flex gap-2 items-center text-slate-600"><Palette size={16}/> עיצוב ומיתוג</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold block mb-1">צבע ראשי</label>
                   <div className="flex gap-2">
                     <input type="color" className="h-10 w-10 cursor-pointer rounded" value={campaign.themeColor || '#10b981'} onChange={e => setCampaign({...campaign, themeColor: e.target.value})} />
                     <input className="border p-2 rounded-lg flex-1 text-left" value={campaign.themeColor || '#10b981'} onChange={e => setCampaign({...campaign, themeColor: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-bold block mb-1">קישור ללוגו (URL)</label>
                   <div className="flex gap-2 items-center">
                     <ImageIcon size={18} className="text-slate-400"/>
                     <input className="border p-2 rounded-lg w-full text-left" placeholder="https://..." value={campaign.logoUrl || ''} onChange={e => setCampaign({...campaign, logoUrl: e.target.value})} />
                   </div>
                 </div>
                 <div className="col-span-2">
                   <label className="text-xs font-bold block mb-1">קישור לבאנר עליון (URL)</label>
                   <div className="flex gap-2 items-center">
                     <LayoutTemplate size={18} className="text-slate-400"/>
                     <input className="border p-2 rounded-lg w-full text-left" placeholder="https://..." value={campaign.bannerUrl || ''} onChange={e => setCampaign({...campaign, bannerUrl: e.target.value})} />
                   </div>
                   <p className="text-xs text-slate-400 mt-1">אופציונלי: באנר שיופיע בראש מסך הלייב לכל רוחבו.</p>
                 </div>
               </div>
            </div>

            {/* ניהול QR */}
            <h3 className="font-bold text-sm mb-2 flex gap-2"><QrCode size={16}/> דרכי תרומה</h3>
            <div className="space-y-2 mb-6">
              {campaign.donationMethods?.map((m: any, i: number) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="סוג (Bit)" className="w-1/3 border p-2 rounded" value={m.methodType} onChange={e => {
                    const methods = [...campaign.donationMethods]; methods[i].methodType = e.target.value; setCampaign({...campaign, donationMethods: methods});
                  }} />
                  <input placeholder="URL לתמונה" className="w-full border p-2 rounded" value={m.qrCodeUrl} onChange={e => {
                    const methods = [...campaign.donationMethods]; methods[i].qrCodeUrl = e.target.value; setCampaign({...campaign, donationMethods: methods});
                  }} />
                  <button onClick={() => setCampaign({...campaign, donationMethods: campaign.donationMethods.filter((_:any, idx:number) => idx !== i)})} className="text-red-400"><Trash2/></button>
                </div>
              ))}
              <button onClick={() => setCampaign({...campaign, donationMethods: [...(campaign.donationMethods||[]), {methodType:'', qrCodeUrl:''}]})} className="text-indigo-600 text-sm font-bold">+ הוסף דרך תרומה</button>
            </div>
            
            <button onClick={handleSaveSettings} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold flex justify-center gap-2 shadow-indigo-100 shadow-lg"><Save size={18}/> שמור שינויים</button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold flex gap-2"><History/> היסטוריה</h2>
               <button onClick={exportToCSV} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold flex gap-2"><Download size={16}/> ייצוא לאקסל</button>
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 sticky top-0"><tr><th className="p-2">שם</th><th className="p-2">סכום</th><th className="p-2">מחיקה</th></tr></thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d._id} className="border-b">
                      <td className="p-2">{d.firstName} {d.lastName}</td>
                      <td className="p-2 font-bold text-emerald-600">{d.amount}</td>
                      <td className="p-2"><button onClick={async()=>{ if(confirm('למחוק?')) { await fetch(`/api/donations/${d._id}`, {method:'DELETE'}); fetchData(); }}} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl text-center">
            <p className="opacity-70 text-sm">סה"כ נאסף (כולל ידני)</p>
            <p className="text-5xl font-black">{(campaign.currentAmount + campaign.manualStartingAmount).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
             <h2 className="font-bold mb-4 flex gap-2"><Send className="text-emerald-500"/> הוספת תרומה</h2>
             <form onSubmit={handleAddDonation} className="space-y-3">
               <input placeholder="שם" className="w-full border p-3 rounded-xl" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
               <input placeholder="משפחה" className="w-full border p-3 rounded-xl" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
               <input type="number" placeholder="סכום" className="w-full border p-3 rounded-xl font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
               <textarea placeholder="הקדשה" className="w-full border p-3 rounded-xl" value={formData.dedication} onChange={e => setFormData({...formData, dedication: e.target.value})} />
               <button disabled={loading} className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-emerald-100">שגר למסך</button>
             </form>
             <div className="mt-4 pt-4 border-t">
                <label className="text-xs font-bold block mb-1">נאסף מראש (ידני)</label>
                <input type="number" className="w-full border p-2 rounded-lg bg-slate-50" value={campaign.manualStartingAmount} onChange={e => setCampaign({...campaign, manualStartingAmount: Number(e.target.value)})} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
