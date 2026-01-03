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
  const [lastDonation, setLastDonation] = useState<any>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/data/${slug}`);
      const json = await res.json();
      
      setData((prevData: any) => {
        if (prevData && json.campaign.currentAmount > prevData.campaign.currentAmount) {
          const newDonation = json.donations[0];
          const newDonationId = Date.now();
          const donationWithId = { ...newDonation, id: newDonationId };
          
          setLastDonation(donationWithId);
          setShowConfetti(true);
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play blocked"));
          }

          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(() => {
            setLastDonation(null);
            setNotifications(prev => [donationWithId, ...prev].slice(0, 16));
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

  if (!data) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white font-bold text-2xl">טוען נתונים...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const progress = Math.min((totalRaised / (campaign.targetAmount || 1)) * 100, 100);

  // חלוקת תרומות ל-2 עמודות בכל צד (8 תרומות לכל פאנל צדדי)
  const rightSideDonations = donations.slice(0, 12);
  const leftSideDonations = donations.slice(12, 24);

  const screenStyles: any = {
    backgroundColor: '#050a18',
    backgroundImage: `radial-gradient(circle at center, #1e3a8a 0%, #050a18 100%)`,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    color: '#f8fafc'
  };

  // עיצוב "עיטור" מכובד לתורם
  const DonorEntry = ({ donation, index }: { donation: any, index: number }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative group"
    >
      <div className="bg-blue-900/30 border-b border-amber-500/30 py-3 px-4 flex flex-col items-center transition-all hover:bg-amber-500/10">
        <span className="text-xl font-medium text-blue-100/90 mb-1 truncate w-full text-center">
          {donation.fullName}
        </span>
        <span className="text-3xl font-black text-amber-400 drop-shadow-sm">
          ₪{donation.amount.toLocaleString()}
        </span>
      </div>
      {/* עיטור פינתי קטן בסגנון קלאסי */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/50" />
    </motion.div>
  );

  return (
    <div className="font-sans antialiased" dir="rtl" style={screenStyles}>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />

      {/* שכבת טקסטורה יוקרתית */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <style>{`
        @font-face { font-family: 'Assistant'; src: url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700;800&display=swap'); }
        body { font-family: 'Assistant', sans-serif; }
        .gold-border { border: 2px solid transparent; border-image: linear-gradient(to bottom, #d4af37, #996515) 1; }
        .glass-panel { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); }
        .text-gold { color: #d4af37; background: linear-gradient(to bottom, #fde68a, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={['#d4af37', '#f59e0b', '#ffffff']} opacity={0.6} />}

      {/* התראה מרכזית ענקית בעיצוב מלכותי */}
      <AnimatePresence>
        {lastDonation && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-[#0f172a] border-[6px] border-amber-500 p-16 rounded-none shadow-[0_0_100px_rgba(217,119,6,0.4)] text-center min-w-[800px] relative">
                <div className="absolute top-4 left-4 right-4 bottom-4 border border-amber-500/20" />
                <Award className="text-amber-500 mx-auto mb-6" size={100} />
                <h2 className="text-4xl font-bold mb-4 text-amber-200 tracking-[0.2em] uppercase">תרומה חדשה נכנסה</h2>
                <h3 className="text-8xl font-black mb-8 text-white drop-shadow-lg">{lastDonation.fullName}</h3>
                <div className="text-9xl font-black text-amber-500">
                   ₪{lastDonation.amount.toLocaleString()}
                </div>
                {lastDonation.dedication && <p className="text-4xl italic mt-10 text-blue-100 opacity-80">"{lastDonation.dedication}"</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full flex flex-col relative z-10 p-6">
        
        {/* כותרת וסכום מרכזי עליון */}
        <div className="flex justify-center mb-10">
          <div className="glass-panel border-2 border-amber-500/40 p-8 rounded-none text-center shadow-2xl relative min-w-[600px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 px-6 py-1 text-black font-bold text-xl">
              עד כה נאסף
            </div>
            <div className="text-9xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              ₪{totalRaised.toLocaleString()}
            </div>
          </div>
        </div>

        {/* גוף המסך - 3 חלקים */}
        <div className="flex-1 flex gap-8 overflow-hidden">
          
          {/* פאנל ימין - השותפים (2 עמודות) */}
          <div className="w-[30%] flex flex-col glass-panel border border-white/10">
            <div className="bg-amber-600 text-black text-center py-3 font-black text-3xl">השותפים</div>
            <div className="flex-1 p-4 grid grid-cols-2 gap-x-4 gap-y-2 overflow-hidden items-start content-start">
              {rightSideDonations.map((d: any, i: number) => <DonorEntry key={i} donation={d} index={i} />)}
            </div>
          </div>

          {/* מרכז - גרפיקה ומד התקדמות */}
          <div className="flex-1 flex flex-col justify-between py-4">
            <div className="flex-1 flex items-center justify-center">
                {campaign.logoUrl && (
                    <motion.img 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        src={campaign.logoUrl} 
                        className="max-h-[450px] w-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                        alt="Logo"
                    />
                )}
            </div>

            {/* מד התקדמות יוקרתי */}
            <div className="px-10">
                <div className="flex justify-between mb-4 font-bold text-3xl text-amber-100">
                    <span>{progress.toFixed(1)}% הושלמו</span>
                    <span className="opacity-70">יעד הקמפיין: ₪{campaign.targetAmount.toLocaleString()}</span>
                </div>
                <div className="h-10 bg-black/50 rounded-none border border-amber-500/30 p-1 relative shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 shadow-[0_0_30px_rgba(217,119,6,0.6)] relative"
                    >
                        {/* אפקט ברק על המד */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    </motion.div>
                </div>
            </div>
          </div>

          {/* פאנל שמאל - השותפים (2 עמודות) */}
          <div className="w-[30%] flex flex-col glass-panel border border-white/10">
            <div className="bg-amber-600 text-black text-center py-3 font-black text-3xl">השותפים</div>
            <div className="flex-1 p-4 grid grid-cols-2 gap-x-4 gap-y-2 overflow-hidden items-start content-start">
              {leftSideDonations.map((d: any, i: number) => <DonorEntry key={i} donation={d} index={i} />)}
            </div>
          </div>

        </div>

        {/* קרדיט/סגירה בחלק התחתון במקום הסרגל */}
        <div className="mt-6 flex justify-between items-center px-10 opacity-50 text-sm tracking-widest uppercase">
            <span>{campaign.name} • שידור חי</span>
            <div className="flex gap-4">
                <Target size={14} />
                <span>זמן אמת</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;