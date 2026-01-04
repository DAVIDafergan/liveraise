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
  const allDonations = [...donations, ...donations, ...donations, ...donations];

  const screenStyles: any = {
    backgroundColor: campaign.backgroundColor || '#020408',
    width: campaign.displaySettings?.width ? `${campaign.displaySettings.width}px` : '100vw',
    height: campaign.displaySettings?.height ? `${campaign.displaySettings.height}px` : '100vh',
    maxWidth: '100%',
    maxHeight: '100vh',
    zoom: campaign.displaySettings?.scale || 1.0,
    margin: '0 auto',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div className="live-container" dir="rtl" style={screenStyles}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Rubik:wght@400;700;900&display=swap');

        :root {
          --bg-color: ${campaign.backgroundColor || '#020408'};
          --gold-shine: linear-gradient(110deg, #8a6e2f 20%, #f9d976 40%, #ffffff 50%, #f9d976 60%, #8a6e2f 80%);
          --gold-solid: #f9d976;
          --neon-blue: #00f2ff;
        }

        .live-container {
          background-image: radial-gradient(circle at 50% -20%, #152445 0%, #000000 70%);
          font-family: 'Frank Ruhl Libre', serif;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .live-container::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            radial-gradient(1px 1px at 10% 10%, rgba(249, 217, 118, 0.4), transparent),
            radial-gradient(1.5px 1.5px at 50% 40%, rgba(249, 217, 118, 0.3), transparent),
            radial-gradient(1px 1px at 80% 70%, rgba(255, 255, 255, 0.3), transparent),
            radial-gradient(2px 2px at 30% 80%, rgba(212, 175, 55, 0.2), transparent);
          background-size: 400px 400px;
          animation: goldDustAnim 25s linear infinite;
          opacity: 0.4;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes goldDustAnim {
          from { background-position: 0 0; }
          to { background-position: 500px 1000px; }
        }

        .stage-container {
          width: 100%; height: 100%;
          display: flex; 
          flex-direction: row;
          justify-content: space-between; 
          gap: 20px; 
          padding: 25px; 
          box-sizing: border-box;
          z-index: 10;
          position: relative;
        }

        .side-frame { flex: 1.2; display: flex; flex-direction: column; position: relative; min-width: 0; }
        
        .gold-border-box {
          flex-grow: 1; padding: 2px;
          background: var(--gold-shine);
          background-size: 200% auto;
          animation: shine-gold 5s linear infinite;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
        }

        .inner-screen {
          background: rgba(6, 13, 31, 0.9); width: 100%; height: 100%;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
          overflow: hidden; position: relative;
        }

        .header-title {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%); z-index: 20;
          background: var(--gold-shine); padding: 1.5px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
        }

        .header-inner {
          background: #1a1005; padding: 10px 40px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
          color: var(--gold-solid); font-weight: 900; font-size: 1.8rem; white-space: nowrap;
          letter-spacing: 2px;
        }

        .scrolling-wrapper {
          height: 100%; padding: 60px 15px; box-sizing: border-box;
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }

        .scroll-content {
          display: grid; 
          grid-template-columns: repeat(3, 1fr); /* 3 עמודות קבועות בדיוק */
          gap: 15px;
          animation: scrollUp 100s linear infinite;
        }

        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes shine-gold { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

        .donor-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(249, 217, 118, 0.15);
          border-radius: 8px; 
          padding: 25px 5px; /* פדינג מוגדל לגובה */
          text-align: center;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          min-height: 120px;
        }

        /* שמות השותפים - ענקיים ונקיים */
        .d-name { 
          font-weight: 900; 
          font-size: 2.1rem; /* כתב ענק */
          color: #ffffff; 
          margin-bottom: 8px; 
          line-height: 1.1;
          text-shadow: none;
          white-space: normal; /* מאפשר ירידת שורה אם השם ארוך */
          display: block;
        }

        /* סכום השותפים - גדול מתחת לשם */
        .d-amount { 
          font-family: 'Rubik'; 
          color: var(--gold-solid); 
          font-weight: 800; 
          font-size: 1.8rem; /* סכום גדול */
          display: block;
        }

        .center-area { 
          flex: 1.8; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          padding: 20px; 
        }
        
        .total-container { text-align: center; position: relative; margin-bottom: 40px; }
        .total-val {
          font-family: 'Rubik'; font-size: clamp(4rem, 10vw, 8rem); font-weight: 950;
          color: #fff; line-height: 1; margin: 0;
          filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));
        }
        .total-label { 
          color: #d4af37; font-weight: 900; font-size: 2rem; letter-spacing: 5px; margin-top: 20px; 
          border-top: 2px solid rgba(212, 175, 55, 0.5); padding-top: 10px; display: inline-block;
        }

        .latest-donation-center {
          text-align: center; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          margin: 30px 0; width: 100%;
        }

        .latest-name { 
          font-size: clamp(3rem, 7vw, 5.5rem); 
          font-weight: 950; 
          color: #ffffff; 
          line-height: 1.1; 
          text-shadow: none;
        }

        .latest-amount { font-family: 'Rubik'; font-size: clamp(2.5rem, 5vw, 4rem); color: var(--neon-blue); font-weight: 900; margin-top: 10px; }
        
        .gold-sparkle-element {
          width: 80%; max-width: 400px; height: 5px;
          background: var(--gold-shine); background-size: 200% auto;
          animation: shine-gold 3s linear infinite;
          margin-top: 20px; border-radius: 10px; opacity: 1;
        }

        .logo-box { 
          width: 100%; max-width: 450px;
          display: flex; justify-content: center; align-items: center; 
          margin-top: 30px;
        }
        .logo-img { max-width: 100%; max-height: 220px; object-fit: contain; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.6)); }

        .beam {
          position: absolute; top: 0; width: 35%; height: 100%;
          background: radial-gradient(ellipse at center, rgba(249, 217, 118, 0.07) 0%, transparent 70%);
          filter: blur(100px); pointer-events: none;
        }

        @media (max-width: 1200px) {
          .d-name { font-size: 1.5rem; }
          .d-amount { font-size: 1.3rem; }
          .scroll-content { gap: 10px; }
        }
      `}</style>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />
      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={[campaign.themeColor, '#ffffff']} />}

      <div className="beam" style={{ left: '-5%' }}></div>
      <div className="beam" style={{ right: '-5%' }}></div>

      <div className="stage-container">
        {/* צד ימין */}
        <div className="side-frame">
          <div className="header-title"><div className="header-inner">השותפים</div></div>
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
          <div className="total-container">
              <div className="total-val">₪{totalRaised.toLocaleString()}</div>
              <div className="total-label">סה"כ התחייבויות</div>
          </div>

          <div className="latest-donation-center">
            <AnimatePresence mode="wait">
              {donations[0] && (
                <motion.div
                  key={donations[0].id || donations[0].fullName}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center w-full"
                >
                  <span className="latest-name">{donations[0].fullName}</span>
                  <span className="latest-amount">₪{donations[0].amount.toLocaleString()}</span>
                  <div className="gold-sparkle-element"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="logo-box">
            {campaign.logoUrl && (
              <img src={campaign.logoUrl} className="logo-img" alt="logo" />
            )}
          </div>
        </div>

        {/* צד שמאל */}
        <div className="side-frame">
          <div className="header-title"><div className="header-inner">השותפים</div></div>
          <div className="gold-border-box">
            <div className="inner-screen">
              <div className="scrolling-wrapper">
                <div className="scroll-content">
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