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
      'radial-gradient(circle at top, #0b1430, #020617 75%)',
    '--primary': campaign.themeColor,
    zoom: campaign.displaySettings?.scale || 1,
    width: campaign.displaySettings?.width
      ? `${campaign.displaySettings.width}px`
      : '1920px',
    height: campaign.displaySettings?.height
      ? `${campaign.displaySettings.height}px`
      : '1080px',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div dir="rtl" style={screenStyles} className="text-white font-sans">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      />

      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% }
          100% { background-position: 200% }
        }

        .gold-text {
          background: linear-gradient(
            120deg,
            #d4af37,
            #fff3b0,
            #d4af37
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 5s linear infinite;
        }

        .gold-border {
          border: 3px solid transparent;
          border-radius: 14px;
          border-image: linear-gradient(
            120deg,
            #d4af37,
            #fff3b0,
            #d4af37
          ) 1;
          animation: goldShimmer 4s linear infinite;
        }
      `}</style>

      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          colors={['#d4af37', '#fff']}
        />
      )}

      {/* ===== נברשת ===== */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-40">
        <div className="w-[500px] h-[200px] bg-gradient-to-b from-yellow-300/30 to-transparent blur-2xl rounded-full" />
      </div>

      {/* ===== עיטורי צד ===== */}
      <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-yellow-400/10 to-transparent blur-xl" />
      <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-yellow-400/10 to-transparent blur-xl" />

      {/* ===== סכום כללי ===== */}
      <div className="absolute top-8 w-full text-center z-20">
        <div className="text-sm opacity-60">סה״כ נאסף</div>
        <div className="text-6xl font-black gold-text">
          ₪{totalRaised.toLocaleString()}
        </div>
      </div>

      {/* ===== תרומה אחרונה ===== */}
      {lastDonation && (
        <motion.div
          key={lastDonation.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-30"
        >
          <div className="text-[64px] font-black gold-text">
            {lastDonation.fullName}
          </div>
          <div className="text-[96px] font-black gold-text mt-4">
            ₪{lastDonation.amount.toLocaleString()}
          </div>

          {campaign.logoUrl && (
            <img
              src={campaign.logoUrl}
              className="mt-10 h-32 object-contain opacity-90"
              alt="logo"
            />
          )}
        </motion.div>
      )}

      {/* ===== שותפים ===== */}
      <SidePartners side="left" donations={donations} />
      <SidePartners side="right" donations={donations} />
    </div>
  );
};

const SidePartners = ({ side, donations }: any) => {
  const filtered = donations.filter(
    (_: any, i: number) => (side === 'left' ? i % 2 === 0 : i % 2 === 1)
  );

  return (
    <div
      className={`
        absolute top-[220px]
        ${side === 'left' ? 'left-12' : 'right-12'}
        w-[540px]
        grid grid-cols-3
        gap-x-6 gap-y-24
        text-center
      `}
    >
      {filtered.map((d: any, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="text-3xl font-black mb-3">
            {d.fullName}
          </div>
          <div className="gold-border px-4 py-2">
            <div className="text-2xl font-black gold-text">
              ₪{d.amount.toLocaleString()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LiveScreen;
