import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
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

  /* ===== DASHBOARD LOGIC – נשאר כמו שהוא ===== */

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

          const donation = { ...json.donations[0], id: Date.now() };
          setNotifications((p) => [...p, donation]);
          setCenterDonation(donation);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }

          setTimeout(() => setShowConfetti(false), 5000);
          setTimeout(
            () =>
              setNotifications((p) =>
                p.filter((n) => n.id !== donation.id)
              ),
            7000
          );
          setTimeout(() => setCenterDonation(null), 3000);
        }
        return json;
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    const i = setInterval(fetchStats, 5000);
    return () => clearInterval(i);
  }, [slug]);

  if (!data) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        טוען נתונים...
      </div>
    );
  }

  const { campaign, donations } = data;

  const totalRaised =
    (campaign.currentAmount || 0) +
    (campaign.manualStartingAmount || 0);

  const topDonors = [...donations]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const screenStyles: any = {
    width: campaign.displaySettings?.width
      ? `${campaign.displaySettings.width}px`
      : '1920px',
    height: campaign.displaySettings?.height
      ? `${campaign.displaySettings.height}px`
      : '1080px',
    zoom: campaign.displaySettings?.scale || 1,
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at top, #0c1535, #020617 70%)',
  };

  return (
    <div dir="rtl" style={screenStyles} className="text-white font-sans">

      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      />

      {/* ===== STYLES ===== */}
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .gold-text {
          background: linear-gradient(
            120deg,
            #d4af37 0%,
            #fff3b0 20%,
            #d4af37 40%,
            #fff3b0 60%,
            #d4af37 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 5s linear infinite;
        }

        @keyframes glowPulse {
          0% { box-shadow: 0 0 20px #d4af3740; }
          50% { box-shadow: 0 0 90px #d4af37aa; }
          100% { box-shadow: 0 0 20px #d4af3740; }
        }
        .gold-glow { animation: glowPulse 4s ease-in-out infinite; }
      `}</style>

      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          colors={['#d4af37', '#ffffff']}
        />
      )}

      {/* ===== CHANDELIER ===== */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[120px]">
        <div className="w-full h-[4px] bg-[#d4af37] mx-auto" />
        <div className="mx-auto mt-4 w-[160px] h-[40px] rounded-full bg-[#d4af37]/30 blur-xl" />
      </div>

      {/* ===== CENTER DONATION ===== */}
      <AnimatePresence>
        {centerDonation && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 600, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="
              absolute top-[300px] left-1/2 -translate-x-1/2 z-50
              bg-gradient-to-br from-[#101a3a] to-[#05070f]
              border-[5px] border-[#d4af37]
              rounded-[2.5rem]
              px-24 py-14
              text-center gold-glow
            "
          >
            <div className="text-[52px] font-black gold-text">
              {centerDonation.fullName}
            </div>
            <div className="text-[72px] font-black gold-text mt-4">
              ₪{centerDonation.amount.toLocaleString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HEADER ===== */}
      <div className="h-[160px] flex flex-col items-center justify-center">
        <div className="tracking-[0.4em] text-sm opacity-60">
          סה״כ נאסף
        </div>
        <div className="text-[80px] font-black gold-text">
          ₪{totalRaised.toLocaleString()}
        </div>
      </div>

      {/* ===== CENTER BANNER ===== */}
      {campaign.bannerUrl && (
        <div className="absolute top-[190px] left-1/2 -translate-x-1/2">
          <img
            src={campaign.bannerUrl}
            alt="Banner"
            className="h-[200px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
          />
        </div>
      )}

      {/* ===== SIDE PANELS ===== */}
      <SidePanel title="השותפים" list={topDonors} side="left" />
      <SidePanel title="השותפים" list={topDonors} side="right" />

      {/* ===== FLOATING NOTIFICATIONS ===== */}
      <div className="absolute bottom-6 right-8 flex flex-col gap-4">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="
                bg-white text-black rounded-xl px-6 py-4
                flex items-center gap-4 shadow-2xl
              "
            >
              <Heart className="text-red-500 fill-red-500" />
              <div>
                <div className="font-black">{n.fullName}</div>
                <div className="font-black text-xl">
                  ₪{n.amount.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ===== SIDE PANEL ===== */

const SidePanel = ({ title, list, side }: any) => (
  <motion.div
    initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 1 }}
    className={`
      absolute top-[260px] ${side === 'left' ? 'left-10' : 'right-10'}
      w-[380px]
      bg-gradient-to-b from-[#101a3a] to-[#05070f]
      border-[4px] border-[#d4af37]
      rounded-[2rem]
      shadow-[0_0_80px_#d4af3740]
      overflow-hidden gold-glow
    `}
  >
    <div className="text-center py-5 text-4xl font-black gold-text">
      {title}
    </div>

    <div className="divide-y divide-[#d4af3720]">
      {list.map((p: any, i: number) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="px-8 py-5 text-center"
        >
          <div className="text-3xl font-black text-white">
            {p.fullName}
          </div>
          <div className="text-3xl font-black gold-text mt-1">
            ₪{p.amount.toLocaleString()}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default LiveScreen;
