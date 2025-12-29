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

  if (!data) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-sans">טוען נתונים...</div>;

  const { campaign, donations } = data;
  const totalRaised = campaign.currentAmount + campaign.manualStartingAmount;
  const progress = Math.min((totalRaised / campaign.targetAmount) * 100, 100);

  // שימוש בכל התרומות עבור הגלילה האינסופית
  const allDonations = [...donations, ...donations]; 

  return (
    <div 
      className="h-screen w-full bg-[#020617] text-white overflow-hidden flex flex-col font-sans relative" 
      dir="rtl" 
      style={{ 
        '--primary': campaign.themeColor,
        zoom: campaign.displaySettings?.scale || 1.0 
      } as any}
    >
      {/* CSS לאנימציית גלילה יוקרתית */}
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scroll-marquee {
          animation: scrollUp 30s linear infinite;
        }
        .scroll-marquee:hover {
          animation-play-state: paused;
        }
        .mask-fade {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {showConfetti && <Confetti width={width} height={height} colors={[campaign.themeColor, '#ffffff']} />}

      {/* באנר עליון דינמי */}
      {campaign.bannerUrl ? (
        <div className="w-full h-[15vh] overflow-hidden shadow-2xl relative shrink-0">
          <img src={campaign.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent opacity-60" />
          {campaign.logoUrl && (
            <div className="absolute bottom-4 right-12 bg-white p-2 rounded-xl shadow-2xl">
              <img src={campaign.logoUrl} alt="Logo" className="h-12 object-contain" />
            </div>
          )}
        </div>
      ) : (
        campaign.logoUrl && (
          <div className="absolute top-8 right-12 z-20 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
            <img src={campaign.logoUrl} alt="Logo" className="h-20 object-contain" />
          </div>
        )
      )}

      <div className={`flex-1 max-w-[95%] mx-auto w-full p-8 flex flex-col gap-6 min-h-0 ${!campaign.bannerUrl ? 'pt-24' : ''}`}>
        
        <div className="flex justify-between items-end border-b border-white/10 pb-4 relative z-10">
          <div>
            <h1 className="text-6xl font-black mb-2 tracking-tighter">{campaign.name}</h1>
            <p className="text-2xl opacity-60 italic font-medium">{campaign.subTitle}</p>
          </div>
          <div className="text-left bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
            <p className="text-sm opacity-50 uppercase tracking-widest">יעד הגיוס</p>
            <p className="text-3xl font-bold">{campaign.targetAmount.toLocaleString()} {campaign.currency}</p>
          </div>
        </div>

        {/* מד התקדמות יוקרתי */}
        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full" />
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-white/10 text-white shadow-inner"><Target size={32}/></div>
                <span className="text-3xl font-bold">התקדמות הקמפיין</span>
             </div>
             <div className="text-7xl font-black drop-shadow-lg" style={{ color: campaign.themeColor }}>
                {totalRaised.toLocaleString()} {campaign.currency}
             </div>
          </div>
          <div className="w-full h-14 bg-white/5 rounded-full overflow-hidden border-4 border-white/5 p-1.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full shadow-[0_0_25px_rgba(0,0,0,0.3)] relative"
              style={{ backgroundColor: campaign.themeColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-4 text-2xl font-bold opacity-80 px-2">
            <span>{progress.toFixed(1)}% מהיעד</span>
            <span className="opacity-50 tracking-widest">יחד ננצח!</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          
          {/* גלילה אינסופית של תרומות */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-red-500 fill-red-500 animate-pulse" />
              <h2 className="text-3xl font-bold tracking-tight">תרומות אחרונות</h2>
            </div>
            
            <div className="flex-1 overflow-hidden relative mask-fade">
              <div className="scroll-marquee flex flex-col gap-4 pt-4 pb-20">
                {allDonations.map((donation: any, idx: number) => (
                  <div
                    key={`${donation._id}-${idx}`}
                    className="bg-white/10 p-6 rounded-[1.5rem] border-r-8 flex justify-between items-center shadow-xl backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors"
                    style={{ borderRightColor: campaign.themeColor }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-bold tracking-tight">{donation.fullName}</span>
                      {donation.dedication && (
                        <span className="text-xl italic opacity-70 font-medium">"{donation.dedication}"</span>
                      )}
                    </div>
                    <div className="text-4xl font-black px-8 py-3 rounded-2xl bg-black/20 border border-white/10 text-white shadow-inner">
                      {donation.amount.toLocaleString()} {campaign.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* אזור ה-QR */}
          <div className="bg-white text-slate-900 p-8 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-primary" style={{ backgroundColor: campaign.themeColor }} />
            <h3 className="text-3xl font-black mb-8 text-slate-800">סרקו לתרומה</h3>
            <div className="grid grid-cols-1 gap-8 w-full">
              {campaign.donationMethods?.map((method: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-4 group">
                  <div className="p-4 bg-slate-50 rounded-[2.5rem] border-4 border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <img src={method.qrCodeUrl} alt={method.methodType} className="w-52 h-52 object-contain" />
                  </div>
                  <span className="text-2xl font-bold bg-slate-100 px-8 py-2 rounded-full border border-slate-200 text-slate-700">
                    {method.methodType}
                  </span>
                </div>
              ))}
            </div>
            {campaign.logoUrl && !campaign.bannerUrl && (
               <img src={campaign.logoUrl} alt="Logo" className="mt-auto h-24 object-contain pt-8 animate-bounce-slow" />
            )}
          </div>

        </div>
      </div>

      {/* Marquee תחתון */}
      <div className="bg-white/5 py-4 border-t border-white/10 text-2xl font-bold overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
           {[...Array(15)].map((_, i) => (
             <span key={i} className="flex items-center gap-3">
               <Users size={24} style={{ color: campaign.themeColor }} className="drop-shadow-[0_0_8px_var(--primary)]"/> 
               <span>תרומה חדשה מקפיצה את המד!</span>
               <span className="opacity-20 mx-4">|</span>
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;