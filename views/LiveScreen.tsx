import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Heart, TrendingUp } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const LiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width, height } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // מצב חדש למערך של כרטיסי תרומה שקופצים
  const [notifications, setNotifications] = useState<any[]>([]);
  // רפרנס לצליל
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/data/${slug}`);
      const json = await res.json();
      
      if (data && json.campaign.currentAmount > data.campaign.currentAmount) {
        setShowConfetti(true);
        
        // יצירת מזהה ייחודי לכל תרומה כדי שנוכל להסיר אותה בנפרד
        const newDonationId = Date.now();
        const newDonation = { ...json.donations[0], id: newDonationId };
        
        // הוספה למערך ההתראות
        setNotifications(prev => [...prev, newDonation]);
        
        // השמעת צליל תרומה
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log("Audio play blocked by browser"));
        }

        setTimeout(() => setShowConfetti(false), 5000);
        
        // העלמת הכרטיס הספציפי אחרי 7 שניות
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newDonationId));
        }, 7000);
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
      {/* אלמנט אודיו לצליל תרומה - הוחלף לצליל כסף נעים */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />

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
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {showConfetti && <Confetti width={width} height={height} colors={[campaign.themeColor, '#ffffff']} />}

      {/* מיכל לכרטיסי תרומה קופצים (Stack) */}
      <div className="fixed right-8 top-24 z-[100] flex flex-col gap-4">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border-l-8 flex items-center gap-4 min-w-[320px]"
              style={{ borderLeftColor: campaign.themeColor }}
            >
              <div className="bg-slate-100 p-3 rounded-full">
                <Heart className="text-red-500 fill-red-500" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold opacity-50 uppercase">תרומה חדשה!</p>
                <h4 className="text-xl font-black">{notif.fullName}</h4>
                {notif.dedication && (
                  <p className="text-md italic text-slate-600 font-medium mb-1">"{notif.dedication}"</p>
                )}
                <p className="text-2xl font-black" style={{ color: '#1e3a8a' }}>
                  ₪{notif.amount.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* באנר עליון דינמי - גובה שונה ל-300 פיקסל */}
      {campaign.bannerUrl ? (
        <div className="w-full h-[300px] overflow-hidden shadow-2xl relative shrink-0">
          <img src={campaign.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent opacity-60" />
          {campaign.logoUrl && (
            <div className="absolute bottom-4 right-12 bg-white p-2.5 rounded-2xl shadow-2xl">
              <img src={campaign.logoUrl} alt="Logo" className="h-24 object-contain" />
            </div>
          )}
        </div>
      ) : (
        campaign.logoUrl && (
          <div className="absolute top-8 right-12 z-20 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl">
            <img src={campaign.logoUrl} alt="Logo" className="h-48 object-contain" />
          </div>
        )
      )}

      <div className={`flex-1 max-w-[95%] mx-auto w-full p-6 flex flex-col gap-4 min-h-0 ${!campaign.bannerUrl ? 'pt-24' : ''}`}>
        
        <div className="flex justify-between items-end border-b border-white/10 pb-2 relative z-10">
          <div>
            <h1 className="text-4xl font-black mb-1 tracking-tighter">{campaign.name}</h1>
            <p className="text-xl opacity-60 italic font-medium">{campaign.subTitle}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] opacity-50 uppercase tracking-[0.3em] mb-1">סה"כ נאסף</p>
            <div className="text-5xl font-black" style={{ color: campaign.themeColor }}>
                {totalRaised.toLocaleString()} {campaign.currency}
            </div>
          </div>
        </div>

        {/* מד התקדמות יוקרתי - דק ואלגנטי בסגנון דאשבורד נתונים */}
        <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{ backgroundColor: campaign.themeColor }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              <div className="absolute right-0 top-0 h-full w-4 bg-white/30 blur-sm" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2 text-sm font-bold opacity-60 px-1 tracking-widest uppercase">
            <span>{progress.toFixed(1)}% הושלמו</span>
            <div className="flex items-center gap-2">
                <Target size={14} />
                <span>יעד: {campaign.targetAmount.toLocaleString()} {campaign.currency}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          
          {/* גלילה אינסופית של תרומות - מורחב למרכז המסך */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <h2 className="text-2xl font-bold tracking-tight opacity-80">זרם תרומות בזמן אמת</h2>
            </div>
            
            <div className="flex-1 overflow-hidden relative mask-fade">
              <div className="scroll-marquee flex flex-col gap-4 pt-4 pb-20">
                {allDonations.map((donation: any, idx: number) => (
                  <div
                    key={`${donation._id}-${idx}`}
                    className="bg-white/5 p-5 rounded-[1.5rem] border-r-4 flex justify-between items-center shadow-xl backdrop-blur-md border border-white/5 hover:bg-white/10 transition-colors"
                    style={{ borderRightColor: campaign.themeColor }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-bold tracking-tight">{donation.fullName}</span>
                      {donation.dedication && (
                        <span className="text-lg italic opacity-70 font-medium">"{donation.dedication}"</span>
                      )}
                    </div>
                    <div className="text-3xl font-black px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white shadow-inner">
                      {donation.amount.toLocaleString()} {campaign.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* אזור ה-QR - מוקטן מעט כדי לתת מקום לתרומות */}
          <div className="bg-white text-slate-900 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5" style={{ backgroundColor: campaign.themeColor }} />
            <h3 className="text-2xl font-black mb-6 text-slate-800 tracking-tighter">סרקו לתרומה</h3>
            <div className="grid grid-cols-1 gap-6 w-full">
              {campaign.donationMethods?.map((method: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-2 group">
                  <div className="p-3 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <img src={method.qrCodeUrl} alt={method.methodType} className="w-36 h-36 object-contain" />
                  </div>
                  <span className="text-xl font-bold bg-slate-100 px-6 py-1 rounded-full border border-slate-200 text-slate-500 uppercase text-xs">
                    {method.methodType}
                  </span>
                </div>
              ))}
            </div>
            {campaign.logoUrl && !campaign.bannerUrl && (
               <img src={campaign.logoUrl} alt="Logo" className="mt-auto h-32 object-contain pt-4" />
            )}
          </div>

        </div>
      </div>

      {/* Marquee תחתון - מעודכן להצגת תרומות אמיתיות (שם וסכום) */}
      <div className="bg-white/5 py-3 border-t border-white/10 text-xl font-bold overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
           {donations.concat(donations).map((d: any, i: number) => (
             <span key={i} className="flex items-center gap-4 text-white/90">
               <Heart size={18} style={{ color: campaign.themeColor }} className="fill-current"/> 
               <span className="font-bold">{d.fullName}</span>
               <span style={{ color: campaign.themeColor }}>₪{d.amount.toLocaleString()}</span>
               <span className="opacity-20 mx-4">|</span>
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;;