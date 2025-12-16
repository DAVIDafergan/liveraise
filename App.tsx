import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './views/AdminDashboard';
import LiveScreen from './views/LiveScreen';
import { Monitor, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="text-center max-w-2xl">
           <h1 className="text-6xl font-black mb-4 tracking-tight font-display">LiveRaise</h1>
           <p className="text-2xl opacity-70 mb-12">מערכת תצוגה חיה לאירועי התרמה</p>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mx-auto">
              <Link to="/admin" className="group relative bg-white/10 hover:bg-white/20 border border-white/20 p-8 rounded-2xl transition-all flex flex-col items-center gap-4">
                 <div className="bg-indigo-500 p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <Shield size={32} />
                 </div>
                 <h2 className="text-xl font-bold">כניסת מנהל</h2>
                 <p className="text-sm opacity-60">הוספת תרומות וניהול</p>
              </Link>

              <Link to="/screen/demo" className="group relative bg-white/10 hover:bg-white/20 border border-white/20 p-8 rounded-2xl transition-all flex flex-col items-center gap-4">
                 <div className="bg-emerald-500 p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <Monitor size={32} />
                 </div>
                 <h2 className="text-xl font-bold">מסך תצוגה</h2>
                 <p className="text-sm opacity-60">פתח את המסך לקהל</p>
              </Link>
           </div>

           <div className="mt-12 text-sm opacity-40">
             <p>הנתונים נשמרים כעת במסד הנתונים MongoDB ב-Railway.</p>
             <p>הנתונים מסונכרנים בזמן אמת דרך השרת.</p>
           </div>
        </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/screen/:campaignId" element={<LiveScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;