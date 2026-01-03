import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Heart, TrendingUp, Layout, Crown } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const LiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'modern' | 'royalty'>('royalty'); // ברירת מחדל מלכותי
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
            audioRef.current.play().catch(e => console.log("Audio play blocked"));
          }

          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newDonationId));
          }, 7000);
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

  if (!data) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white">טוען נתונים...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const progress = Math.min((totalRaised / (campaign.targetAmount || 1)) * 100, 100);

  // חלוקת תרומות לצדדים עבור מצב מלכותי
  const middleIndex = Math.ceil(donations.length / 2);
  const leftDonations = donations.slice(0, middleIndex);
  const rightDonations = donations.slice(middleIndex);
  const lastDonation = donations[0]; // התרומה האחרונה ביותר

  return (
    <div className="relative w-full h-screen overflow-hidden" dir="rtl">
      {/* כפתור החלפת מצבים צף - מוסתר בהקרנה, נראה רק במעבר עכבר */}
      <button 
        onClick={() => setViewMode(prev => prev === 'modern' ? 'royalty' : 'modern')}
        className="fixed bottom-4 left-4 z-[500] bg-white/10 hover:bg-white/20 p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
      >
        {viewMode === 'modern' ? <Crown size={20} /> : <Layout size={20} />}
      </button>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />

      {/* CSS גלובלי לאפקטים המלכותיים */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&display=swap');
        
        :root {
          --gold-grad: linear-gradient(135deg, #46331a 0%, #d4af37 25%, #fff9e6 50%, #d4af37 75%, #46331a 100%);
          --cyan-glow: #00f2ff;
        }

        .royalty-bg { background: radial-gradient(circle at center, #102040 0%, #05080f 100%); }
        
        .gold-panel {
          position: relative;
          background: radial-gradient(circle, #1a2a44 0%, #0d1525 100%);
          clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
          border: 2px solid transparent;
        }

        .gold-border {
          position: absolute; inset: 0;
          border: 4px solid;
          border-image: var(--gold-grad) 1;
          pointer-events: none;
        }

        .neon-text {
          color: var(--cyan-glow);
          text-shadow: 0 0 10px rgba(0, 242, 255, 0.7);
        }

        .scroll-v { animation: scrollUp 40s linear infinite; }
        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }

        .shine {
          position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-25deg); animation: shine 8s infinite;
        }
        @keyframes shine { 0% { left: -100%; } 20%, 100% { left: 150%; } }
      `}</style>

      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={[campaign.themeColor, '#ffffff', '#d4af37']} />}

      {/* --- מצב מודרני (הקוד המקורי שלך) --- */}
      {viewMode === 'modern' && (
        <div className="flex flex-col w-full h-full text-white font-sans" style={{ backgroundColor: campaign.backgroundColor }}>
            {/* ... כאן נכנס כל הקוד המודרני המקורי שלך (הבאנר, המד התקדמות והתרומות) ... */}
            <div className="p-10 text-center">מצב מודרני פעיל - לחץ על הכפתור למטה למצב מלכותי</div>
        </div>
      )}

      {/* --- מצב מלכותי (העיצוב החדש) --- */}
      {viewMode === 'royalty' && (
        <div className="royalty-bg w-full h-full flex flex-col p-6 font-sans overflow-hidden">
          
          {/* תאורת במה רקע */}
          <div className="absolute top-[-10%] left-[10%] w-[400px] h-[120%] bg-blue-500/10 blur-[100px] rotate-12 pointer-events-none" />
          <div className="absolute top-[-10%] right-[10%] w-[400px] h-[120%] bg-blue-500/10 blur-[100px] -rotate-12 pointer-events-none" />

          <div className="grid grid-cols-3 gap-8 h-full relative z-10">
            
            {/* פאנל ימין - תורמים */}
            <div className="gold-panel p-8 flex flex-col">
              <div className="gold-border" />
              <div className="shine" />
              <div className="bg-[var(--gold-grad)] text-[#2c1e0a] px-8 py-1 font-bold text-center self-center mb-6" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' }}>השותפים</div>
              <div className="flex-1 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
                <div className="scroll-v flex flex-col gap-4">
                  {[...rightDonations, ...rightDonations].map((d, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2 px-2">
                      <span className="font-['Frank_Ruhl_Libre'] text-xl">{d.fullName}</span>
                      <span className="neon-text font-bold text-lg">₪{d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* פאנל מרכזי - הירו, לוגו ותרומה אחרונה */}
            <div className="flex flex-col justify-between items-center py-4">
              {/* לוגו */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <img src={campaign.logoUrl} className="h-48 w-auto object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]" />
              </motion.div>

              {/* תרומה אחרונה (Hero) */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={lastDonation?.id || 'empty'}
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center bg-white/5 p-8 rounded-full border-2 border-[#d4af37]/30 backdrop-blur-md relative"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--gold-grad)] text-black text-xs px-4 py-1 rounded-full font-bold">תרומה אחרונה</div>
                  <h2 className="text-4xl font-['Frank_Ruhl_Libre'] text-white mb-2">{lastDonation?.fullName || 'ממתינים לתרומה...'}</h2>
                  <div className="text-6xl font-black neon-text">₪{lastDonation?.amount.toLocaleString() || '0'}</div>
                </motion.div>
              </AnimatePresence>

              {/* סכום כולל */}
              <div className="text-center">
                <p className="text-[#f3e5ab] text-xl font-bold mb-2">סה"כ נתרם לקמפיין:</p>
                <div className="text-8xl font-black bg-[var(--gold-grad)] bg-clip-text text-fill-transparent filter drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" style={{ WebkitTextFillColor: 'transparent' }}>
                   {totalRaised.toLocaleString()} ₪
                </div>
                {/* מד התקדמות יוקרתי */}
                <div className="w-96 h-3 bg-white/10 rounded-full mt-6 border border-white/20 overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} 
                    className="h-full bg-[var(--gold-grad)] shadow-[0_0_20px_#d4af37]"
                   />
                </div>
                <div className="text-[#f3e5ab] mt-2 font-bold">{progress.toFixed(1)}% מהיעד</div>
              </div>
            </div>

            {/* פאנל שמאל - תורמים */}
            <div className="gold-panel p-8 flex flex-col">
              <div className="gold-border" />
              <div className="shine" style={{ animationDelay: '3s' }} />
              <div className="bg-[var(--gold-grad)] text-[#2c1e0a] px-8 py-1 font-bold text-center self-center mb-6" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' }}>השותפים</div>
              <div className="flex-1 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
                <div className="scroll-v flex flex-col gap-4" style={{ animationDirection: 'reverse' }}>
                   {[...leftDonations, ...leftDonations].map((d, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2 px-2">
                      <span className="font-['Frank_Ruhl_Libre'] text-xl">{d.fullName}</span>
                      <span className="neon-text font-bold text-lg">₪{d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* פס תחתון (Marquee) - קיים גם במלכותי אבל בעיצוב מותאם */}
          <div className="fixed bottom-0 left-0 w-full bg-black/40 border-t border-[#d4af37]/30 py-2 backdrop-blur-md">
             <div className="flex animate-marquee whitespace-nowrap gap-12 text-2xl font-['Frank_Ruhl_Libre']">
                {donations.concat(donations).map((d: any, i: number) => (
                  <span key={i} className="flex items-center gap-4">
                    <span className="text-[#d4af37]">♦</span>
                    <span>{d.fullName}</span>
                    <span className="neon-text">₪{d.amount.toLocaleString()}</span>
                  </span>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* התראות קופצות (Notifications) - נשמרות בשני המצבים */}
      <div className="fixed right-8 top-24 z-[100] flex flex-col gap-4">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border-l-8 flex items-center gap-4 min-w-[320px]"
              style={{ borderLeftColor: campaign.themeColor }}
            >
              <Heart className="text-red-500 fill-red-500" size={24} />
              <div className="flex-1">
                <p className="text-xs font-bold opacity-50">תרומה חדשה!</p>
                <h4 className="text-xl font-black">{notif.fullName}</h4>
                <p className="text-2xl font-black text-blue-900">₪{notif.amount.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveScreen;