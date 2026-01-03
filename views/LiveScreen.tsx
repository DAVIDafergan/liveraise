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

  /* ================= EXISTING LOGIC – UNTOUCHED ================= */

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
    background: 'radial-gradient(circle at top, #101a3a, #020617 60%)',
  };

  /* ================= UI ================= */

  return (
    <div dir="rtl" style={screenStyles} className="text-white font-sans">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      />

      <style>{`
        @keyframes goldGlow {
          0% { box-shadow: 0 0 20px #d4af3740; }
          50% { box-shadow: 0 0 80px #d4af37aa; }
          100% { box-shadow: 0 0 20px #d4af3740; }
        }
        .gold-glow { animation: goldGlow 4s ease-in-out infinite; }
      `}</style>

      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          colors={['#d4af37', '#ffffff']}
        />
      )}

      {/* ================= CENTER DONATION ================= */}
      <AnimatePresence>
        {centerDonation && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="
              absolute top-[260px] left-1/2 -translate-x-1/2 z-50
              bg-gradient-to-br from-[#1a233f] to-[#05070f]
              border-4 border-[#d4af37]
              rounded-[2rem]
              px-20 py-12
              text-center gold-glow
            "
          >
            <div className="text-4xl font-black">
              {centerDonation.fullName}
            </div>
            <div className="text-6xl font-black text-[#d4af37] mt-4">
              ₪{centerDonation.amount.toLocaleString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HEADER ================= */}
      <div className="h-[140px] flex flex-col items-center justify-center">
        <div className="tracking-[0.4em] text-sm opacity-60">
          סה״כ נאסף
        </div>
        <div className="text-[72px] font-black text-[#d4af37]">
          ₪{totalRaised.toLocaleString()}
        </div>
      </div>

      {/* ================= PANELS ================= */}
      <div className="absolute top-[180px] left-[40px] w-[380px]">
        <RoyalPanel title="השותפים" list={campaign.partners} />
      </div>

      <div className="absolute top-[180px] right-[40px] w-[380px]">
        <RoyalPanel title="השותפים" list={campaign.partners} />
      </div>

      {/* ================= BOTTOM NOTIFICATIONS ================= */}
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

/* ================= ROYAL PANEL COMPONENT ================= */

const RoyalPanel = ({ title, list }: any) => (
  <div
    className="
      bg-gradient-to-b from-[#1a233f] to-[#05070f]
      border-4 border-[#d4af37]
      rounded-[1.5rem]
      shadow-[0_0_60px_#d4af3740]
      overflow-hidden
    "
  >
    <div className="text-center py-4 text-3xl font-black text-[#d4af37]">
      {title}
    </div>

    <div className="divide-y divide-[#d4af3720]">
      {list?.map((p: any, i: number) => (
        <div key={i} className="px-6 py-4 text-center">
          <div className="text-xl font-black">{p.name}</div>
          <div className="text-2xl font-black text-[#d4af37]">
            ₪{p.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LiveScreen;
