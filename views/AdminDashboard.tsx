import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Send } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
  const [campaign, setCampaign] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', amount: '', dedication: '' });

  useEffect(() => {
    fetch(`/api/data/${user.slug}`).then(res => res.json()).then(data => setCampaign(data.campaign));
  }, [user.slug]);

  const addMethod = () => {
    const updatedMethods = [...(campaign.donationMethods || []), { methodType: '', qrCodeUrl: '', label: '' }];
    setCampaign({ ...campaign, donationMethods: updatedMethods });
  };

  const updateMethod = (index: number, field: string, value: string) => {
    const updatedMethods = [...campaign.donationMethods];
    updatedMethods[index] = { ...updatedMethods[index], [field]: value };
    setCampaign({ ...campaign, donationMethods: updatedMethods });
  };

  const removeMethod = (index: number) => {
    const updatedMethods = campaign.donationMethods.filter((_: any, i: number) => i !== index);
    setCampaign({ ...campaign, donationMethods: updatedMethods });
  };

  const saveSettings = async () => {
    setLoading(true);
    await fetch(`/api/campaign/${campaign._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    });
    setLoading(false);
    alert('נשמר בהצלחה!');
  };

  if (!campaign) return <div className="p-8 text-center">טוען...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8" dir="rtl">
      <h1 className="text-3xl font-bold border-b pb-4">ניהול קמפיין: {campaign.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* הגדרות קמפיין */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-indigo-600">הגדרות תצוגה ויעדים</h2>
          <input label="שם הקמפיין" className="w-full border p-2 rounded" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="יעד" className="border p-2 rounded" value={campaign.targetAmount} onChange={e => setCampaign({...campaign, targetAmount: Number(e.target.value)})} />
            <input type="number" placeholder="כמה נאסף ידנית" className="border p-2 rounded bg-emerald-50" value={campaign.manualStartingAmount} onChange={e => setCampaign({...campaign, manualStartingAmount: Number(e.target.value)})} />
          </div>
          
          <h3 className="font-bold pt-4">דרכי תרומה (יופיעו במסך הלייב)</h3>
          {campaign.donationMethods?.map((m: any, i: number) => (
            <div key={i} className="flex gap-2 items-center border-b pb-2">
              <input placeholder="סוג (Bit)" className="w-1/4 border p-1 rounded text-sm" value={m.methodType} onChange={e => updateMethod(i, 'methodType', e.target.value)} />
              <input placeholder="URL ל-QR" className="w-2/4 border p-1 rounded text-sm" value={m.qrCodeUrl} onChange={e => updateMethod(i, 'qrCodeUrl', e.target.value)} />
              <button onClick={() => removeMethod(i)} className="text-red-500"><Trash2 size={18}/></button>
            </div>
          ))}
          <button onClick={addMethod} className="flex items-center gap-2 text-indigo-600 text-sm font-bold"><Plus size={16}/> הוסף דרך תרומה</button>
          
          <button onClick={saveSettings} disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2">
            <Save size={20}/> {loading ? 'שומר...' : 'עדכן הגדרות קמפיין'}
          </button>
        </div>

        {/* הזנת תרומה */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-emerald-600 mb-4">הזנת תרומה חדשה</h2>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch(`/api/donations/${campaign._id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            if (res.ok) { 
              alert('תרומה התקבלה!'); 
              setFormData({firstName: '', lastName: '', amount: '', dedication: ''});
            }
          }}>
            <input placeholder="שם" className="w-full border p-2 rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <input type="number" placeholder="סכום" className="w-full border p-2 rounded" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <textarea placeholder="הקדשה" className="w-full border p-2 rounded" value={formData.dedication} onChange={e => setFormData({...formData, dedication: e.target.value})} />
            <button className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold">שלח למסך</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;