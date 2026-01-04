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
          --gold-text: linear-gradient(to bottom, #fceea6 0%, #d4af37 100%);
          --neon-blue: #00f2ff;
        }

        .live-container {
          background-image: radial-gradient(circle at 50% -20%, #152445 0%, #000000 70%);
          font-family: 'Frank Ruhl Libre', serif;
          color: white;
          position: relative;
        }

        .live-container::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            radial-gradient(1.5px 1.5px at 20px 30px, #f9d976, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 100px 150px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 200px 50px, #d4af37, rgba(0,0,0,0));
          background-size: 300px 300px;
          animation: sparkleAnim 15s linear infinite;
          opacity: 0.2;
          pointer-events: none;
        }

        @keyframes sparkleAnim {
          from { background-position: 0 0; }
          to { background-position: 0 1000px; }
        }

        .stage-container {
          width: 99%; height: 96%;
          display: flex; justify-content: space-between; gap: 30px; padding: 25px; box-sizing: border-box;
          z-index: 10;
        }

        .side-frame { flex: 2.4; display: flex; flex-direction: column; position: relative; }
        
        .gold-border-box {
          flex-grow: 1; padding: 2px;
          background: var(--gold-shine);
          background-size: 200% auto;
          animation: shine-gold 5s linear infinite;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
        }

        .inner-screen {
          background: rgba(6, 13, 31, 0.85); width: 100%; height: 100%;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
          overflow: hidden; position: relative;
        }

        .header-title {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%); z-index: 20;
          background: var(--gold-shine); padding: 1.5px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
        }

        .header-inner {
          background: #1a1005; padding: 10px 55px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
          color: #f9d976; font-weight: 900; font-size: 2.2rem; white-space: nowrap;
          letter-spacing: 2px;
        }

        .scrolling-wrapper {
          height: 100%; padding: 75px 15px; box-sizing: border-box;
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }

        .scroll-content {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          animation: scrollUp 75s linear infinite;
        }

        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes shine-gold { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

        .donor-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(249, 217, 118, 0.2);
          border-radius: 12px; padding: 25px 10px; text-align: center;
          display: flex; flex-direction: column; justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .d-name { 
          font-weight: 950; font-size: 2.8rem; 
          background: var(--gold-text);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 8px; 
          text-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
        .d-amount { font-family: 'Rubik'; color: #fff; font-weight: 800; font-size: 2.1rem; opacity: 1; }

        .center-area { 
          flex: 1.8; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: space-between; 
          padding: 40px 0; 
        }
        
        .total-container { text-align: center; position: relative; margin-top: 10px; }
        .total-val {
          font-family: 'Rubik'; font-size: 6.5rem; font-weight: 900;
          color: #fff; line-height: 1; margin: 0;
          filter: drop-shadow(0 0 25px rgba(255,255,255,0.25));
        }
        .total-label { 
          color: #d4af37; font-weight: 900; font-size: 1.6rem; letter-spacing: 5px; margin-top: 15px; 
          border-top: 2px solid rgba(212, 175, 55, 0.5); padding-top: 10px; display: inline-block;
        }

        .latest-donation-center {
          text-align: center; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          margin: 40px 0; /* מרווח מוגדל בין הסכום ללוגו ולסכום הכללי */
        }
        .latest-name { 
          font-size: 3.4rem; font-weight: 950; 
          background: var(--gold-text);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1.1; 
        }
        .latest-amount { font-family: 'Rubik'; font-size: 3rem; color: var(--neon-blue); font-weight: 900; margin-top: 6px; }
        
        .gold-sparkle-element {
          width: 280px; height: 4px;
          background: var(--gold-shine); background-size: 200% auto;
          animation: shine-gold 3s linear infinite;
          margin-top: 15px; border-radius: 10px; opacity: 0.9;
        }

        .logo-box { 
          width: 400px; /* לוגו מוגדל */
          flex-shrink: 0; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          margin-bottom: 20px;
        }
        .logo-img { max-width: 100%; max-height: 260px; object-fit: contain; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.5)); }

        .beam {
          position: absolute; top: 0; width: 450px; height: 100%;
          background: radial-gradient(ellipse at center, rgba(249, 217, 118, 0.02) 0%, transparent 70%);
          filter: blur(130px); pointer-events: none;
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
          {/* סכום כללי */}
          <div className="total-container">
             <div className="total-val">₪{totalRaised.toLocaleString()}</div>
             <div className="total-label">סה"כ התחייבויות</div>
          </div>

          {/* תרומה אחרונה - מורחקת וממורכזת */}
          <div className="latest-donation-center">
            <AnimatePresence mode="wait">
              {donations[0] && (
                <motion.div
                  key={donations[0].id || donations[0].fullName}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <span className="latest-name">{donations[0].fullName}</span>
                  <span className="latest-amount">₪{donations[0].amount.toLocaleString()}</span>
                  <div className="gold-sparkle-element"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* לוגו מוגדל */}
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