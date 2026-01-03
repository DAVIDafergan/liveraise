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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/data/${slug}`);
      const json = await res.json();

      setData((prevData: any) => {
        if (
          prevData &&
          json.campaign.currentAmount > prevData.campaign.currentAmount
        ) {
          setShowConfetti(true);

          const newDonationId = Date.now();
          const newDonation = { ...json.donations[0], id: newDonationId };
          setNotifications((prev) => [...prev, newDonation]);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }

          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(() => {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== newDonationId)
            );
          }, 8000);
        }

        return json;
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  if (!data) return null;

  const { campaign, donations } = data;

  const totalRaised =
    (campaign.currentAmount || 0) +
    (campaign.manualStartingAmount || 0);

  const lastDonation = donations[0];

  const screenStyles: any = {
    background:
      'radial-gradient(circle at center, #0b1430 0%, #020617 100%)',
    '--primary': campaign.themeColor,
    zoom: campaign.displaySettings?.scale || 1,
    width: campaign.displaySettings?.width
      ? `${campaign.displaySettings.width}px`
      : '100vw',
    height: campaign.displaySettings?.height
      ? `${campaign.displaySettings.height}px`
      : '100vh',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div dir="rtl" style={screenStyles} className="text-white font-sans antialiased">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      />

      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% 50% }
          100% { background-position: 200% 50% }
        }

        .gold-text {
          background: linear-gradient(
            120deg,
            #d4af37 0%,
            #fff3b0 25%,
            #d4af37 50%,
            #fff3b0 75%,
            #d4af37 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 4s linear infinite;
        }

        .gold-border {
          border: 2px solid transparent;
          border-image: linear-gradient(
            120deg,
            #d4af37,
            #fff3b0,
            #d4af37
          ) 1;
        }

        .gold-line-anim {
          height: 4px;
          width: 100%;
          background: linear-gradient(90deg, transparent, #d4af37, #fff3b0, #d4af37, transparent);
          background-size: 200% auto;
          animation: goldShimmer 3s linear infinite;
        }
      `}</style>

      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          colors={['#d4af37', '#fff', '#fcd34d']}
        />
      )}

      {/* ===== נברשת תאורה מרכזית ===== */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-60 pointer-events-none">
        <div className="w-[800px] h-[300px] bg-gradient-to-b from-yellow-500/20 to-transparent blur-3xl rounded-full" />
      </div>

      {/* ===== סכום כללי - כותרת עליונה ===== */}
      <div className="absolute top-12 w-full text-center z-20">
        <div className="text-2xl opacity-70 mb-2 font-light tracking-widest uppercase">עד כה נאסף</div>
        <div className="text-8xl font-black gold-text drop-shadow-2xl">
          ₪{totalRaised.toLocaleString()}
        </div>
      </div>

      {/* ===== תוכן מרכזי: תרומה אחרונה ולוגו ===== */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
        {lastDonation && (
          <motion.div
            key={lastDonation.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
            <div className="text-[80px] font-black gold-text text-center leading-tight drop-shadow-lg">
              {lastDonation.fullName}
            </div>
            
            {/* שורת הזהב הנוצצת מתחת לשם */}
            <div className="w-full max-w-2xl mt-4 mb-4">
               <div className="gold-line-anim" />
            </div>

            <div className="text-[120px] font-black gold-text leading-none">
              ₪{lastDonation.amount.toLocaleString()}
            </div>

            {campaign.logoUrl && (
              <motion.img
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                src={campaign.logoUrl}
                className="mt-16 h-64 object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                alt="logo"
              />
            )}
          </motion.div>
        )}
      </div>

      {/* ===== שותפים - עמודות ממלאות מסך ===== */}
      <div className="absolute inset-0 flex justify-between px-20 pt-[280px] pb-10 pointer-events-none">
        <SidePartners side="left" donations={donations} />
        <SidePartners side="right" donations={donations} />
      </div>
    </div>
  );
};

const SidePartners = ({ side, donations }: any) => {
  // סינון תרומות לצדדים (מציג עד 12 תורמים בכל צד)
  const filtered = donations.slice(1, 25).filter(
    (_: any, i: number) => (side === 'left' ? i % 2 === 0 : i % 2 === 1)
  );

  return (
    <div
      className={`
        w-[450px]
        grid grid-cols-2
        gap-x-12 gap-y-16
        text-center
        items-start
      `}
    >
      {filtered.map((d: any, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center"
        >
          <div className="text-4xl font-bold mb-4 whitespace-nowrap overflow-hidden text-ellipsis w-full">
            {d.fullName}
          </div>
          <div className="gold-border w-full py-3 bg-white/5 backdrop-blur-sm shadow-lg">
            <div className="text-3xl font-black gold-text">
              ₪{d.amount.toLocaleString()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LiveScreen;