import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Heart } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const LiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width, height } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/data/${slug}`);
      const json = await res.json();
      
      if (data && json.campaign.currentAmount > data.campaign.currentAmount) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [slug, data]);

  if (!data) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">טוען נתונים...</div>;

  const { campaign, donations } = data;
  const totalRaised = campaign.currentAmount + campaign.manualStartingAmount;
  const progress = Math.min((totalRaised / campaign.targetAmount) * 100, 100);

  // מציג את 5 התרומות האחרונות כדי למנוע גלילה
  const latestDonations = donations.slice(0, 5);

  return (
    <div 
      className="h-screen w-full bg-slate-950 text-white overflow-hidden flex flex-col font-sans" 
      dir="rtl" 
      style={{ 
        '--primary': campaign.themeColor,
        // התיקון המרכזי: שליטה ברזולוציה ובגודל התצוגה מרחוק
        zoom: campaign.displaySettings?.scale || 1.0 
      } as any}
    >
      {showConfetti && <Confetti width={width} height={height} colors={[campaign.themeColor, '#ffffff']} />}

      {campaign.bannerUrl && (
        <div className="w-full h-32 overflow-hidden shadow-2xl">
          <img src={campaign.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full p-8 flex flex-col gap-8">
        
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-5xl font-black mb-2">{campaign.name}</h1>
            <p className="text-2xl opacity-60 italic">{campaign.subTitle}</p>
          </div>
          <div className="text-left">
            <p className="text-xl opacity-60">יעד הגיוס: {campaign.targetAmount.toLocaleString()} {campaign.currency}</p>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-white/10 text-white"><Target size={32}/></div>
                <span className="text-3xl font-bold">התקדמות הקמפיין</span>
             </div>
             <div className="text-6xl font-black" style={{ color: campaign.themeColor }}>
                {totalRaised.toLocaleString()} {campaign.currency}
             </div>
          </div>
          <div className="w-full h-12 bg-white/10 rounded-full overflow-hidden border-4 border-white/5 p-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full shadow-lg relative"
              style={{ backgroundColor: campaign.themeColor }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-4 text-2xl font-bold opacity-80">
            <span>{progress.toFixed(1)}% מהיעד</span>
            <span>{campaign.targetAmount.toLocaleString()} {campaign.currency}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="text-red-500 fill-red-500" />
              <h2 className="text-3xl font-bold">תרומות אחרונות</h2>
            </div>
            
            <div className="flex flex-col gap-4 flex-1 overflow-hidden relative">
              <AnimatePresence mode="popLayout">
                {latestDonations.map((donation: any) => (
                  <motion.div
                    key={donation._id}
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="bg-white/10 p-6 rounded-2xl border-r-8 flex justify-between items-center shadow-xl backdrop-blur-sm"
                    style={{ borderRightColor: campaign.themeColor }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-bold">{donation.fullName}</span>
                      {donation.dedication && (
                        <span className="text-xl italic opacity-70">"{donation.dedication}"</span>
                      )}
                    </div>
                    <div className="text-4xl font-black px-6 py-2 rounded-xl bg-white/5 border border-white/10">
                      {donation.amount.toLocaleString()} {campaign.currency}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white text-slate-900 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-8">סרקו לתרומה</h3>
            <div className="grid grid-cols-1 gap-8 w-full">
              {campaign.donationMethods?.map((method: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border-4 border-slate-100 shadow-inner">
                    <img src={method.qrCodeUrl} alt={method.methodType} className="w-48 h-48 object-contain" />
                  </div>
                  <span className="text-2xl font-bold bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                    {method.methodType}
                  </span>
                </div>
              ))}
            </div>
            {campaign.logoUrl && (
               <img src={campaign.logoUrl} alt="Logo" className="mt-auto h-20 object-contain pt-8" />
            )}
          </div>

        </div>
      </div>

      <div className="bg-white/5 py-3 border-t border-white/10 text-xl font-medium">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
           {[...Array(10)].map((_, i) => (
             <span key={i} className="flex items-center gap-2">
               <Users size={20} style={{ color: campaign.themeColor }}/> תרומה חדשה מקפיצה את המד!
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;