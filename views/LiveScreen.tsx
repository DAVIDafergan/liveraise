import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Heart, TrendingUp, Award } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const LiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [spotlightDonation, setSpotlightDonation] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/data/${slug}`);
      const json = await res.json();
      
      setData((prevData: any) => {
        if (prevData && json.campaign.currentAmount > prevData.campaign.currentAmount) {
          setShowConfetti(true);
          const newDonationId = Date.now();
          const newDonation = { ...json.donations[0], id: newDonationId };
          
          // הפעלת Spotlight מרכזי
          setSpotlightDonation(newDonation);
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play blocked"));
          }

          setTimeout(() => setShowConfetti(false), 5000);
          
          // אחרי 3 שניות - הזזה מהמרכז לרשימת ההתראות בצד
          setTimeout(() => {
            setSpotlightDonation(null);
            setNotifications(prev => [newDonation, ...prev].slice(0, 5));
          }, 4000);
        }
        return json;
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  if (!data) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white font-sans text-2xl">טוען נתוני יוקרה...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const progress = Math.min((totalRaised / (campaign.targetAmount || 1)) * 100, 100);

  // חלוקת תרומות לצדדים (לפי התמונה)
  const leftPartners = donations.filter((_, i) => i % 2 === 0).slice(0, 6);
  const rightPartners = donations.filter((_, i) => i % 2 !== 0).slice(0, 6);

  const screenStyles: any = {
    backgroundColor: campaign.backgroundColor || '#020626',
    backgroundImage: `radial-gradient(circle at center, #1e3a8a 0%, #020626 100%)`,
    '--primary': campaign.themeColor,
    zoom: campaign.displaySettings?.scale || 1.0,
    width: campaign.displaySettings?.width ? `${campaign.displaySettings.width}px` : '100vw',
    height: campaign.displaySettings?.height ? `${campaign.displaySettings.height}px` : '100vh',
    margin: '0 auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  return (
    <div className="text-white font-sans" dir="rtl" style={screenStyles}>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />

      <style>{`
        @keyframes gold-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-text {
          background: linear-gradient(90deg, #d4af37, #fde68a, #d4af37);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shine 4s linear infinite;
        }
        .gold-border {
          border: 2px solid #d4af37;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }
        .partner-box {
          background: rgba(30, 58, 138, 0.4);
          backdrop-filter: blur(10px);
          border-bottom: 3px solid #d4af37;
        }
        .animate-marquee { display: flex; animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(100%); } }
      `}</style>

      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={['#d4af37', '#ffffff', campaign.themeColor]} />}

      {/* Spotlight מרכזי - תרומה ענקית */}
      <AnimatePresence>
        {spotlightDonation && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, x: windowWidth / 3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white text-slate-900 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(212,175,55,0.8)] border-[8px] border-[#d4af37] flex flex-col items-center gap-6 min-w-[600px] pointer-events-auto">
              <Award className="text-[#d4af37]" size={80} />
              <div className="text-center">
                <p className="text-2xl font-black opacity-50 uppercase tracking-widest mb-2">תרומה חדשה בשידור חי!</p>
                <h4 className="text-7xl font-black mb-4">{spotlightDonation.fullName}</h4>
                <div className="text-8xl font-black text-[#1e3a8a] bg-slate-100 px-10 py-4 rounded-2xl inline-block">
                  ₪{spotlightDonation.amount.toLocaleString()}
                </div>
                {spotlightDonation.dedication && (
                  <p className="text-3xl italic text-slate-600 font-medium mt-6">"{spotlightDonation.dedication}"</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* פריסה ראשית - 3 עמודות */}
      <div className="flex-1 flex p-6 gap-6 relative z-10 overflow-hidden">
        
        {/* עמודה ימנית - שותפים */}
        <div className="w-1/4 flex flex-col gap-4">
          <h2 className="text-3xl font-black text-center mb-2 gold-text uppercase">השותפים שלנו</h2>
          <div className="flex flex-col gap-3 overflow-hidden">
            {rightPartners.map((p: any, i) => (
              <motion.div 
                initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                key={i} className="partner-box p-4 flex flex-col items-center gold-border rounded-xl"
              >
                <span className="text-2xl font-bold truncate w-full text-center">{p.fullName}</span>
                <span className="text-4xl font-black gold-text">₪{p.amount.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* עמודה מרכזית - תוכן הקמפיין */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* סכום כללי - למעלה באמצע */}
          <div className="text-center relative">
            <div className="inline-block bg-black/40 backdrop-blur-md px-16 py-8 rounded-[2.5rem] border-2 border-[#d4af37]/30 shadow-2xl">
              <p className="text-xl font-bold opacity-70 uppercase tracking-[0.5em] mb-2">סה"כ נאסף עד כה</p>
              <div className="text-[10rem] font-black leading-none gold-text tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                {totalRaised.toLocaleString()}
              </div>
              <div className="text-4xl font-bold opacity-80 mt-2">{campaign.currency}</div>
            </div>
          </div>

          {/* לוגו מרכזי */}
          <div className="flex-1 flex items-center justify-center relative">
            {campaign.logoUrl && (
              <motion.img 
                animate={{ 
                  y: [0, -20, 0],
                  filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.2))", "drop-shadow(0 0 50px rgba(212,175,55,0.6))", "drop-shadow(0 0 20px rgba(212,175,55,0.2))"]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src={campaign.logoUrl} 
                className="max-h-[50vh] w-auto object-contain z-20" 
              />
            )}
            {/* הילה נוצצת מאחורי הלוגו */}
            <div className="absolute w-[500px] h-[500px] bg-[#d4af37]/10 blur-[150px] rounded-full z-10" />
          </div>

          {/* מד התקדמות יוקרתי */}
          <div className="px-12 mb-8">
            <div className="flex justify-between mb-4 text-2xl font-bold gold-text">
              <span>{progress.toFixed(1)}% הושלמו</span>
              <div className="flex items-center gap-3">
                <Target size={24} />
                <span>יעד: {campaign.targetAmount.toLocaleString()} {campaign.currency}</span>
              </div>
            </div>
            <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden border border-white/20 p-1">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progress}%` }} 
                transition={{ duration: 2 }} 
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: `linear-gradient(90deg, ${campaign.themeColor}, #d4af37)` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[gold-shine_2s_linear_infinite]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* עמודה שמאלית - שותפים */}
        <div className="w-1/4 flex flex-col gap-4">
          <h2 className="text-3xl font-black text-center mb-2 gold-text uppercase">שותפים לדרך</h2>
          <div className="flex flex-col gap-3 overflow-hidden">
            {leftPartners.map((p: any, i) => (
              <motion.div 
                initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                key={i} className="partner-box p-4 flex flex-col items-center gold-border rounded-xl"
              >
                <span className="text-2xl font-bold truncate w-full text-center">{p.fullName}</span>
                <span className="text-4xl font-black gold-text">₪{p.amount.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* פס גלילה תחתון יוקרתי */}
      <div className="bg-black/60 py-6 border-t border-[#d4af37]/30 text-3xl font-black overflow-hidden backdrop-blur-xl">
        <div className="animate-marquee whitespace-nowrap flex gap-16">
           {donations.concat(donations).map((d: any, i: number) => (
             <span key={i} className="flex items-center gap-8">
               <Heart size={30} className="text-[#d4af37] fill-current shadow-lg"/> 
               <span className="gold-text uppercase tracking-tight">{d.fullName}</span>
               <span className="bg-[#d4af37]/20 px-6 py-2 rounded-full border border-[#d4af37]/40">₪{d.amount.toLocaleString()}</span>
               <span className="opacity-20 mx-4">|</span>
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;