import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Heart, TrendingUp } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const LiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastDonation, setLastDonation] = useState<any>(null); // לתצוגה המרכזית הגדולה
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
          
          setLastDonation(donationWithId); // מציג באמצע
          setShowConfetti(true);
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play blocked"));
          }

          setTimeout(() => setShowConfetti(false), 5000);
          // אחרי 3 שניות מנקה את המרכז ומכניס לרשימת הצד
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

  if (!data) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white font-sans">טוען נתונים...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const progress = Math.min((totalRaised / (campaign.targetAmount || 1)) * 100, 100);

  // חלוקת תרומות לצדדים (לפי התמונה)
  const leftDonations = donations.slice(0, 4);
  const rightDonations = donations.slice(4, 8);

  const screenStyles: any = {
    backgroundColor: campaign.backgroundColor || '#020308',
    backgroundImage: `radial-gradient(circle at center, ${campaign.themeColor}22 0%, transparent 70%)`,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative'
  };

  // קומפוננטת כרטיס תורם בסגנון התמונה
  const DonorCard = ({ donation, side }: { donation: any, side: string }) => (
    <motion.div 
      initial={{ opacity: 0, x: side === 'right' ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative mb-4 w-full"
    >
      <div className="bg-[#1a2b4b]/80 border-2 border-orange-400/50 rounded-lg p-3 shadow-[0_0_15px_rgba(251,146,60,0.2)] backdrop-blur-md overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-orange-400/10 to-transparent pointer-events-none" />
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white drop-shadow-md mb-1">{donation.fullName}</span>
          <span className="text-3xl font-black text-orange-400 tabular-nums">₪{donation.amount.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="text-white font-sans overflow-hidden" dir="rtl" style={screenStyles}>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />

      <style>{`
        @keyframes pulse-gold { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .gold-glow { text-shadow: 0 0 20px rgba(251, 146, 60, 0.8); }
        .bg-panel { background: linear-gradient(180deg, rgba(26,43,75,0.9) 0%, rgba(10,15,30,0.95) 100%); }
      `}</style>

      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={[campaign.themeColor, '#fb923c', '#ffffff']} />}

      {/* שכבת התראה מרכזית גדולה */}
      <AnimatePresence>
        {lastDonation && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, x: 500 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#1e3a8a] border-4 border-orange-400 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(251,146,60,0.5)] text-center min-w-[600px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Heart className="text-orange-400 mx-auto mb-4 fill-orange-400" size={80} />
                </motion.div>
                <h2 className="text-4xl font-black mb-2 opacity-80 uppercase tracking-widest text-orange-200">תרומה חדשה!</h2>
                <h3 className="text-7xl font-black mb-6 text-white">{lastDonation.fullName}</h3>
                <div className="text-8xl font-black text-orange-400 gold-glow">
                   ₪{lastDonation.amount.toLocaleString()}
                </div>
                {lastDonation.dedication && <p className="text-3xl italic mt-6 text-orange-100/80">"{lastDonation.dedication}"</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full flex p-8 gap-8 relative z-10">
        
        {/* פאנל ימין - השותפים */}
        <div className="w-1/4 flex flex-col">
          <div className="bg-orange-500 text-black text-center py-2 rounded-t-xl font-black text-3xl shadow-lg">השותפים</div>
          <div className="bg-panel flex-1 rounded-b-xl p-6 border-x-2 border-b-2 border-orange-500/30 shadow-2xl overflow-hidden">
            {rightDonations.map((d: any, i: number) => <DonorCard key={i} donation={d} side="right" />)}
          </div>
        </div>

        {/* פאנל מרכזי - קמפיין וסכום */}
        <div className="flex-1 flex flex-col gap-6">
            {/* סכום כללי עליון */}
            <div className="relative text-center">
                <div className="bg-[#1a2b4b] inline-block px-16 py-6 rounded-3xl border-2 border-orange-400/50 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <p className="text-2xl font-bold text-orange-400 mb-2 uppercase tracking-widest">עד כה התחייבו</p>
                    <div className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
                        ₪{totalRaised.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* לוגו/גרפיקה מרכזית */}
            <div className="flex-1 flex items-center justify-center relative">
                {campaign.logoUrl && (
                    <motion.img 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        src={campaign.logoUrl} 
                        className="max-h-[500px] w-auto drop-shadow-[0_0_50px_rgba(251,146,60,0.3)]"
                        alt="Campaign Logo"
                    />
                )}
            </div>

            {/* מד התקדמות */}
            <div className="w-full bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div className="flex justify-between mb-4 font-black text-2xl">
                    <span className="text-orange-400">{progress.toFixed(1)}%</span>
                    <span>יעד: ₪{campaign.targetAmount.toLocaleString()}</span>
                </div>
                <div className="h-8 bg-black/40 rounded-full overflow-hidden border border-white/10 p-1">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        transition={{ duration: 2 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 shadow-[0_0_20px_rgba(251,146,60,0.5)]"
                    />
                </div>
            </div>
        </div>

        {/* פאנל שמאל - השותפים */}
        <div className="w-1/4 flex flex-col">
          <div className="bg-orange-500 text-black text-center py-2 rounded-t-xl font-black text-3xl shadow-lg">השותפים</div>
          <div className="bg-panel flex-1 rounded-b-xl p-6 border-x-2 border-b-2 border-orange-500/30 shadow-2xl overflow-hidden">
            {leftDonations.map((d: any, i: number) => <DonorCard key={i} donation={d} side="left" />)}
          </div>
        </div>
      </div>

      {/* פס גלילה תחתון (קיים בקוד המקורי) */}
      <div className="fixed bottom-0 w-full bg-black/80 py-4 border-t-2 border-orange-500/50 text-2xl font-black overflow-hidden backdrop-blur-md z-50">
        <div className="flex gap-12 whitespace-nowrap animate-marquee">
           {donations.concat(donations).map((d: any, i: number) => (
             <span key={i} className="flex items-center gap-6 text-white/90">
               <Heart size={22} className="text-orange-400 fill-current"/> 
               <span>{d.fullName}</span>
               <span className="px-4 py-1 rounded-full bg-orange-500/20 text-orange-400">₪{d.amount.toLocaleString()}</span>
               <span className="opacity-20 mx-4">|</span>
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;