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
  const [centerDonation, setCenterDonation] = useState<any | null>(null);
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
          setCenterDonation(newDonation);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }

          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newDonationId));
          }, 7000);

          setTimeout(() => {
            setCenterDonation(null);
          }, 3000);
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

  if (!data) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center text-white">
        טוען נתונים...
      </div>
    );
  }

  const { campaign, donations } = data;

  const totalRaised =
    (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);

  const progress = Math.min(
    (totalRaised / (campaign.targetAmount || 1)) * 100,
    100
  );

  const allDonations = [...donations, ...donations, ...donations, ...donations];

  const screenStyles: any = {
    backgroundColor: campaign.backgroundColor || '#020617',
    '--primary': campaign.themeColor,
    zoom: campaign.displaySettings?.scale || 1.0,
    width: campaign.displaySettings?.width
      ? `${campaign.displaySettings.width}px`
      : '1920px',
    height: campaign.displaySettings?.height
      ? `${campaign.displaySettings.height}px`
      : '1080px',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div dir="rtl" style={screenStyles} className="font-sans text-white relative">

      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      />

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scroll-marquee { animation: scrollUp 45s linear infinite; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee { animation: marquee 20s linear infinite; }

        @keyframes goldGlow {
          0% { box-shadow: 0 0 20px #d4af3740; }
          50% { box-shadow: 0 0 60px #d4af37aa; }
          100% { box-shadow: 0 0 20px #d4af3740; }
        }
        .gold-glow { animation: goldGlow 3s ease-in-out infinite; }
      `}</style>

      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          colors={[campaign.themeColor, '#ffffff', '#d4af37']}
        />
      )}

      {/* תרומה חיה במרכז */}
      <AnimatePresence>
        {centerDonation && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 600, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="
              absolute top-[220px] left-1/2 -translate-x-1/2 z-50
              bg-gradient-to-br from-[#1a233f] to-[#0b1225]
              border-4 border-[#d4af37]
              rounded-[2rem]
              px-20 py-12
              text-center gold-glow
            "
          >
            <div className="text-4xl font-black">{centerDonation.fullName}</div>
            <div className="text-6xl font-black text-[#d4af37] mt-4">
              ₪{centerDonation.amount.toLocaleString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* פריסה ראשית */}
      <div className="flex h-full">

        {/* צד שמאל – שותפים */}
        <div className="w-[420px] p-8 flex flex-col gap-6">
          <h2 className="text-3xl font-black text-[#d4af37] text-center">שותפים</h2>
          {campaign.partners?.map((p: any, i: number) => (
            <div key={i} className="bg-[#0b1225] border border-[#d4af3740] rounded-xl p-4 text-center">
              <div className="text-xl font-black">{p.name}</div>
              <div className="text-3xl font-black text-[#d4af37]">
                ₪{p.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* מרכז */}
        <div className="flex-1 flex flex-col items-center pt-8">
          <div className="text-sm tracking-[0.4em] uppercase opacity-50">
            סה"כ נאסף
          </div>
          <div className="text-[72px] font-black text-[#d4af37]">
            ₪{totalRaised.toLocaleString()}
          </div>

          {/* מד התקדמות – הקוד המקורי שלך נשאר */}
          <div className="w-[80%] mt-6 bg-white/5 p-4 rounded-2xl">
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5 }}
                className="h-full"
                style={{ backgroundColor: campaign.themeColor }}
              />
            </div>
          </div>
        </div>

        {/* צד ימין – שותפים */}
        <div className="w-[420px] p-8 flex flex-col gap-6">
          <h2 className="text-3xl font-black text-[#d4af37] text-center">שותפים</h2>
          {campaign.partners?.map((p: any, i: number) => (
            <div key={i} className="bg-[#0b1225] border border-[#d4af3740] rounded-xl p-4 text-center">
              <div className="text-xl font-black">{p.name}</div>
              <div className="text-3xl font-black text-[#d4af37]">
                ₪{p.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default LiveScreen;
