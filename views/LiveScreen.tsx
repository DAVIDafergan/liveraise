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

  if (!data) return <div className="h-screen bg-[#040b1d] flex items-center justify-center text-white">טוען...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const targetAmount = campaign.targetAmount || 0;
  const progressPercent = Math.min(Math.round((totalRaised / targetAmount) * 100), 100) || 0;
  
  const allDonations = [...donations, ...donations, ...donations, ...donations, ...donations, ...donations];

  const screenStyles: any = {
    backgroundColor: '#040b1d', // כחול כהה יוקרתי כבסיס
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
          --bg-color: #040b1d;
          --gold-shine: linear-gradient(110deg, #8a6e2f 20%, #f9d976 40%, #ffffff 50%, #f9d976 60%, #8a6e2f 80%);
          --gold-solid: #f9d976;
          --neon-blue: #00f2ff;
          --deep-blue: #040b1d;
        }

        .live-container {
          background: linear-gradient(180deg, #061129 0%, #040b1d 100%);
          font-family: 'Frank Ruhl Libre', serif;
          color: white;
          position: relative;
          overflow: hidden;
        }

        /* אפקט יוקרתי של עומק ברקע */
        .live-container::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(10, 31, 71, 0.5) 0%, transparent 80%);
          pointer-events: none;
        }

        .live-container::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            radial-gradient(1px 1px at 10% 10%, rgba(249, 217, 118, 0.3), transparent),
            radial-gradient(1.5px 1.5px at 50% 40%, rgba(249, 217, 118, 0.2), transparent),
            radial-gradient(1px 1px at 80% 70%, rgba(255, 255, 255, 0.2), transparent);
          background-size: 400px 400px;
          animation: goldDustAnim 25s linear infinite;
          opacity: 0.3;
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
          gap: 25px; 
          padding: 40px; 
          box-sizing: border-box;
          z-index: 10;
          position: relative;
        }

        .side-frame { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          position: relative; 
          min-width: 0; 
          height: 100%;
        }
        
        .gold-border-box {
          height: 100%; padding: 2px;
          background: var(--gold-shine);
          background-size: 200% auto;
          animation: shine-gold 5s linear infinite;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
          display: flex;
          flex-direction: column;
        }

        .inner-screen {
          background: rgba(4, 11, 29, 0.95); width: 100%; height: 100%;
          clip-path: polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%);
          overflow: hidden; position: relative;
        }

        .header-title {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%); z-index: 20;
          background: var(--gold-shine); padding: 1.5px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
        }

        .header-inner {
          background: #0a1121; padding: 10px 45px;
          clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
          color: var(--gold-solid); font-weight: 900; font-size: 1.6rem; white-space: nowrap;
          letter-spacing: 2px;
        }

        .scrolling-wrapper {
          height: 100%; 
          padding: 70px 15px; 
          box-sizing: border-box;
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }

        .scroll-content {
          display: grid; 
          grid-template-columns: repeat(3, 1fr) !important; 
          gap: 12px;
          animation: scrollUp 120s linear infinite;
        }

        @keyframes scrollUp { 
          0% { transform: translateY(0); } 
          100% { transform: translateY(-50%); } 
        }
        
        @keyframes shine-gold { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

        .donor-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(249, 217, 118, 0.15);
          border-radius: 4px; 
          padding: 15px 5px;
          text-align: center;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          min-height: 120px; 
        }

        .d-name { 
          font-weight: 800; 
          font-size: 1.8rem; 
          color: #ffffff; 
          margin-bottom: 4px; 
          line-height: 1.1;
          word-break: break-word;
        }

        .d-amount { 
          font-family: 'Rubik'; 
          color: var(--gold-solid); 
          font-weight: 700; 
          font-size: 1.6rem; 
        }

        .center-area { 
          flex: 1.5; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: space-between; 
          padding: 10px 0; 
          height: 100%;
        }
        
        .total-container { 
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center; 
        }
        .total-val {
          font-family: 'Rubik'; font-size: clamp(3.5rem, 8vw, 7.5rem); font-weight: 950;
          color: #fff; line-height: 1; margin: 0;
          filter: drop-shadow(0 0 25px rgba(255,255,255,0.2));
        }
        .total-label { 
          color: var(--gold-solid); font-weight: 700; font-size: 1.8rem; letter-spacing: 4px; 
          margin-bottom: 5px; 
          text-transform: uppercase;
        }

        /* סרגל התקדמות */
        .progress-section {
          width: 90%;
          margin: 20px 0;
          text-align: center;
        }
        .progress-track {
          width: 100%;
          height: 25px;
          background: rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 3px;
          border: 1px solid rgba(249, 217, 118, 0.3);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--gold-shine);
          background-size: 200% auto;
          border-radius: 50px;
          box-shadow: 0 0 15px var(--gold-solid);
          transition: width 1s ease-in-out;
        }
        .goal-text {
          font-family: 'Rubik';
          font-size: 1.5rem;
          color: #ffffff;
          margin-top: 10px;
          font-weight: 400;
        }
        .goal-val {
          color: var(--gold-solid);
          font-weight: 900;
        }

        .latest-donation-center {
          text-align: center; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 100%; background: rgba(255,255,255,0.02); border-radius: 20px; padding: 10px;
        }

        .latest-name { 
          font-size: clamp(1.4rem, 2.5vw, 2rem); 
          font-weight: 900; 
          color: #ffffff; 
          margin-bottom: 2px;
        }

        .latest-amount { 
          font-family: 'Rubik'; 
          font-size: clamp(1.2rem, 2.2vw, 1.8rem); 
          color: var(--neon-blue); 
          font-weight: 800; 
        }
        
        .logo-box { 
          width: 100%; height: 180px;
          display: flex; justify-content: center; align-items: center; 
        }
        .logo-img { 
          max-width: 80%; 
          max-height: 100%; 
          object-fit: contain; 
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.5)); 
        }

        .beam {
          position: absolute; top: 0; width: 40%; height: 100%;
          background: radial-gradient(ellipse at center, rgba(10, 31, 71, 0.3) 0%, transparent 70%);
          filter: blur(80px); pointer-events: none;
        }
      `}</style>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />
      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={['#f9d976', '#ffffff', '#00f2ff']} />}

      <div className="beam" style={{ left: '-10%' }}></div>
      <div className="beam" style={{ right: '-10%' }}></div>

      <div className="stage-container">
        {/* צד ימין */}
        <div className="side-frame">
          <div className="header-title"><div className="header-inner">השותפים שלנו</div></div>
          <div className="gold-border-box">
            <div className="inner-screen">
              <div className="scrolling-wrapper">
                <div className="scroll-content">
                  {allDonations.map((d, i) => (
                    <div key={`right-${i}`} className="donor-card">
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
          {/* סכום כולל */}
          <div className="total-container">
              <div className="total-label">סה"כ גויס</div>
              <div className="total-val">₪{totalRaised.toLocaleString()}</div>
          </div>

          {/* סרגל התקדמות ויעד */}
          <div className="progress-section">
            <div className="progress-track">
              <motion.div 
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="goal-text">
              יעד הקמפיין: <span className="goal-val">₪{targetAmount.toLocaleString()}</span> ({progressPercent}%)
            </div>
          </div>

          {/* תרומה אחרונה */}
          <div className="latest-donation-center">
            <div className="text-xs text-blue-300 mb-1 opacity-70">תרומה אחרונה</div>
            <AnimatePresence mode="wait">
              {donations[0] && (
                <motion.div
                  key={donations[0].id || donations[0].fullName}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center w-full"
                >
                  <span className="latest-name">{donations[0].fullName}</span>
                  <span className="latest-amount">₪{donations[0].amount.toLocaleString()}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* לוגו */}
          <div className="logo-box">
            {campaign.logoUrl && (
              <img src={campaign.logoUrl} className="logo-img" alt="logo" />
            )}
          </div>
        </div>

        {/* צד שמאל */}
        <div className="side-frame">
          <div className="header-title"><div className="header-inner">השותפים שלנו</div></div>
          <div className="gold-border-box">
            <div className="inner-screen">
              <div className="scrolling-wrapper">
                <div className="scroll-content">
                  {allDonations.slice().reverse().map((d, i) => (
                    <div key={`left-${i}`} className="donor-card">
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