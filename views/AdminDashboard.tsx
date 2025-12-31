import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Settings, Trash2, ExternalLink, LogOut, QrCode, Layout, History, Save, Download, Palette, Image as ImageIcon, LayoutTemplate, Monitor, RefreshCcw, Maximize } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [campaign, setCampaign] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [formData, setFormData] = useState({ fullName: '', amount: '', dedication: '' });

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
      setFormData({ fullName: '', amount: '', dedication: '' });
      fetchData();
    }
    setLoading(false);
  };

  // פונקציית איפוס קמפיין מעודכנת - מוחקת הכל מהמסך ומהשרת
  const handleResetCampaign = async () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל נתוני הקמפיין, לאפס את התרומות והסכום שנאסף? פעולה זו אינה ניתנת לביטול.')) {
      setLoading(true);
      try {
        const res = await fetch(`/api/campaign/${campaign._id}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          // עדכון ה-UI לאפס באופן מיידי
          setDonations([]);
          setCampaign((prev: any) => ({
            ...prev,
            currentAmount: 0,
            manualStartingAmount: 0
          }));
          alert('הקמפיין אופס בהצלחה! המסך כעת נקי.');
          fetchData();
        }
      } catch (e) {
        alert('שגיאה באיפוס הקמפיין');
      }
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    const res = await fetch(`/api/export/${user.slug}`);
    const data = await res.json();
    const csvContent = "data:text/csv;charset=utf-8," + "Name,Amount,Dedication,Date\n" + data.map((d: any) => `${d.fullName},${d.amount},${d.dedication},${new Date(d.timestamp).toLocaleDateString()}`).join("\n");
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
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleResetCampaign}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-colors text-sm"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''}/> איפוס קמפיין
          </button>
          
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
               <div className="space-y-1 col-span-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                 <label className="text-xs font-bold text-emerald-700">כמה אספו כבר מראש (מתוך היעד)</label>
                 <input type="number" className="w-full border p-2 rounded-lg" value={campaign.manualStartingAmount} onChange={e => setCampaign({...campaign, manualStartingAmount: Number(e.target.value)})} />
                 <p className="text-[10px] text-emerald-600 mt-1">סכום זה יתווסף אוטומטית למד ההתקדמות הכללי במסך.</p>
               </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-4">
               <h3 className="font-bold text-sm flex gap-2 items-center text-slate-600"><Palette size={16}/> עיצוב ומיתוג</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold block mb-1">צבע אלמנטים (Theme)</label>
                   <div className="flex gap-2">
                     <input type="color" className="h-10 w-10 cursor-pointer rounded" value={campaign.themeColor || '#10b981'} onChange={e => setCampaign({...campaign, themeColor: e.target.value})} />
                     <input className="border p-2 rounded-lg flex-1 text-left" value={campaign.themeColor || '#10b981'} onChange={e => setCampaign({...campaign, themeColor: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-bold block mb-1 text-indigo-600">צבע רקע מסך (Background)</label>
                   <div className="flex gap-2">
                     <input type="color" className="h-10 w-10 cursor-pointer rounded shadow-sm border" value={campaign.backgroundColor || '#020617'} onChange={e => setCampaign({...campaign, backgroundColor: e.target.value})} />
                     <input className="border p-2 rounded-lg flex-1 text-left" value={campaign.backgroundColor || '#020617'} onChange={e => setCampaign({...campaign, backgroundColor: e.target.value})} />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-bold block mb-1">קישור ללוגו (URL)</label>
                   <div className="flex gap-2 items-center">
                     <ImageIcon size={18} className="text-slate-400"/>
                     <input className="border p-2 rounded-lg w-full text-left" placeholder="מומלץ: PNG שקוף 500x500" value={campaign.logoUrl || ''} onChange={e => setCampaign({...campaign, logoUrl: e.target.value})} />
                   </div>
                   <p className="text-[10px] text-indigo-500 mt-1 font-medium">הנחיות: PNG שקוף, 500x500px.</p>
                 </div>
                 <div className="col-span-1">
                   <label className="text-xs font-bold block mb-1">קישור לבאנר עליון (URL)</label>
                   <div className="flex gap-2 items-center">
                     <LayoutTemplate size={18} className="text-slate-400"/>
                     <input className="border p-2 rounded-lg w-full text-left" placeholder="מומלץ: 1920x200" value={campaign.bannerUrl || ''} onChange={e => setCampaign({...campaign, bannerUrl: e.target.value})} />
                   </div>
                   <p className="text-[10px] text-indigo-500 mt-1 font-medium">הנחיות: פריסה מלאה 1920x200px.</p>
                 </div>
               </div>
            </div>

            {/* הגדרות תצוגה ורזולוציה עם מסכים ספציפיים */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
              <h3 className="font-bold text-sm flex gap-2 items-center text-indigo-700 mb-4"><Monitor size={16}/> הגדרות רזולוציה ומסך</h3>
              <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold mb-3 block">התאמה למסכי לדים (Presets):</label>
                   <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setCampaign({...campaign, displaySettings: { ...campaign.displaySettings, width: 2688, height: 768, scale: 1.0 }})}
                        className="bg-white border-2 border-indigo-200 hover:border-indigo-600 px-4 py-2 rounded-xl text-xs font-black transition-all"
                      >
                         מסך השכרה (2688x768)
                      </button>
                      <button 
                        onClick={() => setCampaign({...campaign, displaySettings: { ...campaign.displaySettings, width: 2720, height: 384, scale: 1.0 }})}
                        className="bg-white border-2 border-indigo-200 hover:border-indigo-600 px-4 py-2 rounded-xl text-xs font-black transition-all"
                      >
                         מסך אולם (2720x384)
                      </button>
                      <button 
                        onClick={() => setCampaign({...campaign, displaySettings: { ...campaign.displaySettings, width: undefined, height: undefined, scale: 1.0 }})}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex gap-2 items-center"
                      >
                         <Maximize size={14}/> מסך רגיל (Full)
                      </button>
                   </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold">קנה מידה (Zoom): {campaign.displaySettings?.scale || 1.0}x</label>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3.0" 
                    step="0.1" 
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                    value={campaign.displaySettings?.scale || 1.0} 
                    onChange={e => setCampaign({
                      ...campaign, 
                      displaySettings: { ...campaign.displaySettings, scale: Number(e.target.value) }
                    })} 
                  />
                </div>
              </div>
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
                      <td className="p-2">{d.fullName}</td>
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
               <input placeholder="שם מלא" className="w-full border p-3 rounded-xl" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
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