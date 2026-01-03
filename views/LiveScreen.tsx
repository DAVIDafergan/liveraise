import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Heart, Award } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const LiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
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
          setNotifications(prev => [...prev, newDonation]);
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio blocked"));
          }

          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newDonationId));
          }, 8000);
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

  if (!data) return <div className="h-screen bg-[#000814] flex items-center justify-center text-white font-serif italic text-2xl">טוען חוויה מלכותית...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const progress = Math.min((totalRaised / (campaign.targetAmount || 1)) * 100, 100);

  // חלוקת תרומות לשני הצדדים (ימין ושמאל)
  const leftDonations = donations.filter((_: any, i: number) => i % 2 === 0);
  const rightDonations = donations.filter((_: any, i: number) => i % 2 !== 0);

  const screenStyles: any = {
    background: `radial-gradient(circle at center, #001f3f 0%, #000814 100%)`,
    '--theme-color': campaign.themeColor || '#D4AF37',
    zoom: campaign.displaySettings?.scale || 1.0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div className="text-white font-sans selection:bg-yellow-500/30" dir="rtl" style={screenStyles}>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />

      {/* CSS לשכבות העיצוב המורכבות */}
      <style>{`
        @keyframes scrollList { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .scrolling-column { animation: scrollList 30s linear infinite; }
        .gold-border {
          border: 3px solid;
          border-image: linear-gradient(145deg, #a67c00, #ffbf00, #ffdc73, #ffbf00, #a67c00) 1;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 15px rgba(212, 175, 55, 0.2);
        }
        .text-glow { text-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 5px var(--theme-color); }
        .metal-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
            clip-path: polygon(10% 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0 85%, 0 15%);
        }
        .light-beam {
            position: absolute;
            width: 200px;
            height: 100%;
            background: linear-gradient(to top, rgba(0, 150, 255, 0.1), transparent);
            transform: rotate(15deg);
            filter: blur(50px);
            pointer-events: none;
        }
      `}</style>

      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={[campaign.themeColor, '#ffffff', '#D4AF37']} />}

      {/* תאורת במה רקעית */}
      <div className="light-beam left-[-50px] top-0" />
      <div className="light-beam right-[-50px] top-0" />

      {/* התראות קופצות - בעיצוב פרימיום */}
      <div className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1.1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#001f3f] gold-border p-10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center min-w-[500px]"
            >
              <Award className="mx-auto mb-4 text-yellow-400" size={60} />
              <p className="text-xl uppercase tracking-[0.3em] text-yellow-500 font-bold">תרומה חדשה ומרגשת!</p>
              <h4 className="text-6xl font-black my-4 text-glow">{notif.fullName}</h4>
              <p className="text-7xl font-black text-cyan-400">₪{notif.amount.toLocaleString()}</p>
              {notif.dedication && <p className="text-2xl mt-6 italic opacity-80 font-serif">"{notif.dedication}"</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* פריסת המסך הראשית - 3 עמודות */}
      <main className="h-screen w-full flex p-6 gap-6 relative z-10">
        
        {/* עמודה ימנית - תורמים */}
        <div className="w-1/4 h-full flex flex-col gap-4 overflow-hidden mask-fade relative">
            <h3 className="text-center text-yellow-500 font-bold tracking-widest uppercase py-2 bg-white/5 border-b border-yellow-500/30">שותפים לבניין</h3>
            <div className="scrolling-column flex flex-col gap-4">
                {[...rightDonations, ...rightDonations].map((d: any, i: number) => (
                    <div key={i} className="metal-card gold-border p-5 h-32 flex flex-col justify-center">
                        <span className="text-2xl font-bold block truncate">{d.fullName}</span>
                        <span className="text-3xl font-black text-cyan-400 mt-1">₪{d.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* עמודה מרכזית - היעד והלוגו */}
        <div className="w-2/4 h-full flex flex-col justify-between items-center py-4">
          
          {/* לוגו מהדשבורד */}
          <div className="flex flex-col items-center">
            {campaign.logoUrl && (
                <motion.img 
                  src={campaign.logoUrl} 
                  animate={{ y: [0, -10, 0], filter: ['drop-shadow(0 0 10px rgba(255,255,255,0))', 'drop-shadow(0 0 20px rgba(255,255,255,0.4))', 'drop-shadow(0 0 10px rgba(255,255,255,0))'] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="h-48 w-auto object-contain"
                />
            )}
            <h2 className="text-3xl font-serif italic text-yellow-200 mt-4">{campaign.subTitle}</h2>
          </div>

          {/* המדד המרכזי */}
          <div className="w-full text-center space-y-4">
            <div className="inline-block px-12 py-8 bg-black/40 gold-border rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <p className="text-xl uppercase tracking-widest text-white/70 mb-2">נאסף עד כה</p>
                <div className="text-[10rem] font-black leading-none text-glow tracking-tighter">
                    {totalRaised.toLocaleString()}
                </div>
                <div className="text-4xl font-bold text-yellow-500 mt-2">{campaign.currency}</div>
            </div>

            {/* מד התקדמות יוקרתי */}
            <div className="w-full max-w-2xl mx-auto mt-8">
                <div className="flex justify-between mb-3 text-2xl font-bold italic text-yellow-500">
                    <span>{progress.toFixed(1)}%</span>
                    <span>היעד: {campaign.targetAmount?.toLocaleString()}</span>
                </div>
                <div className="h-6 w-full bg-white/5 rounded-full border border-yellow-500/30 p-1 shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        className="h-full rounded-full bg-gradient-to-l from-yellow-600 via-yellow-300 to-yellow-600 shadow-[0_0_20px_rgba(212,175,55,0.6)]"
                    />
                </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-sm tracking-[0.5em] uppercase">
            <span>●</span><span>Live Fundraising Event</span><span>●</span>
          </div>
        </div>

        {/* עמודה שמאלית - תורמים */}
        <div className="w-1/4 h-full flex flex-col gap-4 overflow-hidden mask-fade relative">
            <h3 className="text-center text-yellow-500 font-bold tracking-widest uppercase py-2 bg-white/5 border-b border-yellow-500/30">נדיבי עם</h3>
            <div className="scrolling-column flex flex-col gap-4">
                {[...leftDonations, ...leftDonations].map((d: any, i: number) => (
                    <div key={i} className="metal-card gold-border p-5 h-32 flex flex-col justify-center">
                        <span className="text-2xl font-bold block truncate">{d.fullName}</span>
                        <span className="text-3xl font-black text-cyan-400 mt-1">₪{d.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>

      </main>

      {/* פס גלילה תחתון - רץ על כל המסך */}
      <div className="absolute bottom-0 w-full bg-black/80 border-t-2 border-yellow-600/50 py-4 z-50 overflow-hidden backdrop-blur-xl">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
           {donations.concat(donations).map((d: any, i: number) => (
             <span key={i} className="flex items-center gap-6">
               <Heart size={24} className="text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"/> 
               <span className="text-3xl font-bold tracking-tight">{d.fullName}</span>
               <span className="text-3xl font-black text-yellow-500 drop-shadow-sm">₪{d.amount.toLocaleString()}</span>
               <span className="opacity-30 mx-8 text-4xl">★</span>
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;