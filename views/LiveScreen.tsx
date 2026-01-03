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

  if (!data) return <div className="h-screen bg-[#020408] flex items-center justify-center text-white">טוען...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  
  // הכפלת תרומות לגלילה חלקה
  const allDonations = [...donations, ...donations, ...donations, ...donations];

  return (
    <div className="live-container" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Rubik:wght@400;700;900&display=swap');

        :root {
          --bg-color: ${campaign.backgroundColor || '#020408'};
          --panel-bg: linear-gradient(180deg, #060d1f 0%, #020408 100%);
          --gold-shine: linear-gradient(110deg, #8a6e2f 20%, #f9d976 40%, #ffffff 50%, #f9d976 60%, #8a6e2f 80%);
          --neon-blue: #00f2ff;
          --theme-color: ${campaign.themeColor || '#d4af37'};
        }

        .live-container {
          margin: 0; padding: 0;
          background-color: var(--bg-color);
          background-image: radial-gradient(circle at 50% -20%, #152445 0%, #000000 70%);
          font-family: 'Frank Ruhl Libre', serif;
          height: 100vh; width: 100vw;
          overflow: hidden;
          color: white;
          position: relative;
          display: flex; justify-content: center; align-items: center;
        }

        .stage-container {
          width: 98%; height: 95%;
          display: flex; justify-content: space-between; align-items: stretch;
          gap: 20px; padding: 20px; box-sizing: border-box;
          z-index: 10;
        }

        /* --- צדדים --- */
        .side-frame { flex: 1.2; display: flex; flex-direction: column; position: relative; }
        
        .gold-border-box {
          flex-grow: 1; padding: 3px;
          background: var(--gold-shine);
          background-size: 200% auto;
          animation: shine-gold 4s linear infinite;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
        }

        .inner-screen {
          background: var(--panel-bg); width: 100%; height: 100%;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
          overflow: hidden; position: relative;
        }

        .header-title {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%); z-index: 20;
          background: var(--gold-shine); padding: 3px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
        }

        .header-inner {
          background: #2e1a04; padding: 5px 30px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
          color: #f9d976; font-weight: 700; font-size: 1.2rem; white-space: nowrap;
        }

        /* --- גלילה --- */
        .scrolling-wrapper {
          height: 100%; padding: 40px 10px; box-sizing: border-box;
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }

        .scroll-content {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          animation: scrollUp 50s linear infinite;
        }

        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes shine-gold { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

        .donor-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px; padding: 10px; text-align: center;
          display: flex; flex-direction: column; gap: 5px;
        }

        .d-name { font-weight: 700; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .d-amount { font-family: 'Rubik'; color: var(--neon-blue); font-weight: 700; }

        /* --- מרכז --- */
        .center-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-around; }
        
        .total-wrapper {
          padding: 3px; background: var(--gold-shine); background-size: 200% auto;
          animation: shine-gold 3s linear infinite; border-radius: 20px;
        }

        .total-inner {
          background: radial-gradient(circle, #0e1a35 0%, #000 100%);
          padding: 20px 40px; border-radius: 18px; text-align: center;
        }

        .total-val {
          font-family: 'Rubik'; font-size: 3.5rem; font-weight: 900;
          background: linear-gradient(to bottom, #ffffff, #a1a1a1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .logo-box {
          width: 260px; height: 260px; border-radius: 50%;
          border: 4px double #d4af37; background: #000;
          display: flex; justify-content: center; align-items: center; position: relative;
        }
        
        .logo-img { max-width: 80%; max-height: 80%; object-contain: contain; }

        .verse { font-size: 1.5rem; color: #d4af37; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.3); }

        /* אורות */
        .beam {
          position: absolute; top: -10%; width: 300px; height: 120%;
          background: radial-gradient(ellipse at center, rgba(0, 242, 255, 0.03) 0%, transparent 70%);
          filter: blur(60px); pointer-events: none;
        }
      `}</style>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />
      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={[campaign.themeColor, '#ffffff']} />}

      <div className="beam" style={{ left: '5%' }}></div>
      <div className="beam" style={{ right: '5%' }}></div>

      {/* התראות קופצות */}
      <div className="fixed right-8 top-24 z-[100] flex flex-col gap-4">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border-l-8 flex items-center gap-4 min-w-[320px]"
              style={{ borderLeftColor: campaign.themeColor }}
            >
              <Heart className="text-red-500 fill-red-500" size={24} />
              <div>
                <p className="text-xs font-bold opacity-50 uppercase">תרומה חדשה!</p>
                <h4 className="text-xl font-black">{notif.fullName}</h4>
                <p className="text-2xl font-black" style={{ color: '#1e3a8a' }}>₪{notif.amount.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="stage-container">
        {/* צד ימין */}
        <div className="side-frame">
          <div className="header-title"><div className="header-inner">תרומות אחרונות</div></div>
          <div className="gold-border-box">
            <div className="inner-screen">
              <div className="scrolling-wrapper">
                <div className="scroll-content">
                  {allDonations.map((d, i) => (
                    <div key={i} className="donor-card">
                      <span className="d-name">{d.fullName}</span>
                      <span className="d-amount">₪{d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* מרכז */}
        <div className="center-area">
          <div className="total-wrapper">
            <div className="total-inner">
              <div className="total-val">₪{totalRaised.toLocaleString()}</div>
              <div className="text-gold-400 text-sm tracking-widest mt-2 uppercase" style={{ color: '#d4af37' }}>
                סה"כ התחייבויות
              </div>
            </div>
          </div>

          <div className="logo-box">
            {campaign.logoUrl ? (
              <img src={campaign.logoUrl} className="logo-img" alt="logo" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{campaign.name}</div>
              </div>
            )}
          </div>

          <div className="verse">
            {campaign.subTitle || '"וְהֵבִיאוּ אֶת כָּל הַתְּרוּמָה"'}
          </div>
        </div>

        {/* צד שמאל */}
        <div className="side-frame">
          <div className="header-title"><div className="header-inner">השותפים שלנו</div></div>
          <div className="gold-border-box">
            <div className="inner-screen">
              <div className="scrolling-wrapper">
                <div className="scroll-content">
                  {/* גלילה זהה או שונה - כאן שמתי את אותו המערך למראה מלא */}
                  {allDonations.slice().reverse().map((d, i) => (
                    <div key={i} className="donor-card">
                      <span className="d-name">{d.fullName}</span>
                      <span className="d-amount">₪{d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;