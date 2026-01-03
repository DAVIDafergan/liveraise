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

  if (!data)
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center text-white">
        טוען נתונים...
      </div>
    );

  const { campaign, donations } = data;

  const totalRaised =
    (campaign.currentAmount || 0) +
    (campaign.manualStartingAmount || 0);

  const progress = Math.min(
    (totalRaised / (campaign.targetAmount || 1)) * 100,
    100
  );

  const lastDonation = donations[0];
  const partnersLeft = donations.slice(0, 3);
  const partnersRight = donations.slice(3, 6);

  const screenStyles: any = {
    background:
      'radial-gradient(circle at top, #0c1535, #020617 70%)',
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
          colors={[campaign.themeColor, '#d4af37']}
        />
      )}

      {/* ===== סכום כללי למעלה ===== */}
      <div className="absolute top-8 w-full text-center z-20">
        <div className="text-sm opacity-60">סה״כ נאסף</div>
        <div className="text-6xl font-black gold-text">
          ₪{totalRaised.toLocaleString()}
        </div>
      </div>

      {/* ===== תרומה אחרונה – מרכז ===== */}
      {lastDonation && (
        <motion.div
          key={lastDonation.id}
          initial={{ scale: 0.85, opacity: 0 }}
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
        </motion.div>
      )}

      {/* ===== שותפים שמאל ===== */}
      <SidePartners side="left" list={partnersLeft} />

      {/* ===== שותפים ימין ===== */}
      <SidePartners side="right" list={partnersRight} />
    </div>
  );
};

const SidePartners = ({ side, list }: any) => (
  <div
    className={`
      absolute top-[260px]
      ${side === 'left' ? 'left-12' : 'right-12'}
      w-[520px]
      grid grid-cols-3 gap-y-20 text-center
    `}
  >
    {list.map((p: any, i: number) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.25 }}
      >
        <div className="text-3xl font-black">{p.fullName}</div>
        <div className="mt-3 px-4 py-2 gold-border">
          <div className="text-2xl font-black gold-text">
            ₪{p.amount.toLocaleString()}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default LiveScreen;
