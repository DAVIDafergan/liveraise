import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowSize } from 'react-use';

const RoyalLiveScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [data, setData] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/data/${slug}`);
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-gold-500">טוען...</div>;

  const { campaign, donations } = data;
  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  
  // פיצול התרומות ל-2 עמודות (כמו ב-2 המסכים בצדדים)
  const leftColumn = donations.filter((_: any, i: number) => i % 2 === 0);
  const rightColumn = donations.filter((_: any, i: number) => i % 2 !== 0);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#00050a] text-white flex flex-col font-serif" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700;800&display=swap');
        
        body { font-family: 'Assistant', sans-serif; background: #000; }

        /* אפקט ה-Art Deco לרקע */
        .royal-bg {
          background-color: #000a16;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30H15L30 0zM0 30l30 15V15L0 30zm60 0L30 45V15l30 15zM30 60L15 30h30L30 60z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E");
        }

        /* מסגרת מוזהבת מלכותית */
        .gold-panel {
          border: 4px solid #c5a059;
          background: linear-gradient(135deg, rgba(0,25,50,0.9) 0%, rgba(0,10,20,1) 100%);
          box-shadow: inset 0 0 30px rgba(197, 160, 89, 0.3), 0 0 20px rgba(0,0,0,0.5);
          position: relative;
          clip-path: polygon(5% 0%, 95% 0%, 100% 10%, 100% 90%, 95% 100%, 5% 100%, 0% 90%, 0% 10%);
        }

        .gold-text {
          background: linear-gradient(to bottom, #f9e69a 0%, #d4af37 50%, #a67c00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }

        .cyan-glow {
          color: #4feaff;
          text-shadow: 0 0 15px rgba(79, 234, 255, 0.7);
        }

        /* אנימציית גלילה יוקרתית ואיטית */
        @keyframes slowScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-royal-scroll {
          animation: slowScroll 60s linear infinite;
        }

        .mask-fade-v {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
      `}</style>

      {/* תאורה עליונה (Spotlights) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[20%] w-[30%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[-10%] right-[20%] w-[30%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="royal-bg h-full w-full flex p-8 gap-8 items-center justify-between relative z-10">
        
        {/* פאנל ימני - תורמים */}
        <div className="w-[28%] h-[85vh] gold-panel flex flex-col">
          <div className="bg-[#c5a059] text-black text-center py-2 font-bold text-xl tracking-tighter">השותפים</div>
          <div className="flex-1 overflow-hidden mask-fade-v mt-4">
            <div className="animate-royal-scroll space-y-4 px-4">
              {[...rightColumn, ...rightColumn].map((d: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center h-20">
                  <span className="text-2xl font-bold truncate max-w-[60%]">{d.fullName}</span>
                  <span className="cyan-glow text-3xl font-black italic">₪{d.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* פאנל מרכזי - המונה הגדול והלוגו */}
        <div className="flex-1 h-full flex flex-col items-center justify-around py-10">
          
          {/* לוגו מרכזי */}
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />
            {campaign.logoUrl && (
              <img src={campaign.logoUrl} className="h-64 w-auto object-contain relative z-10 drop-shadow-2xl" />
            )}
          </div>

          {/* המונה המרכזי בעיצוב "אבן" */}
          <div className="relative text-center">
            <div className="absolute inset-0 border-[6px] border-double border-[#c5a059] rotate-45 scale-110 opacity-30" />
            <div className="bg-black/60 backdrop-blur-md border-y-4 border-[#c5a059] px-20 py-12 relative">
                <p className="gold-text text-2xl font-bold tracking-[0.4em] uppercase mb-4">עד כה התחייבו</p>
                <div className="text-[12rem] font-black leading-none tracking-tighter text-white drop-shadow-2xl">
                    {totalRaised.toLocaleString()}
                </div>
                <p className="text-4xl text-[#c5a059] mt-4 font-bold tracking-widest">{campaign.currency}</p>
            </div>
          </div>

          {/* מד התקדמות (Bar) */}
          <div className="w-full max-w-3xl px-10">
            <div className="flex justify-between text-2xl font-bold mb-4">
               <span className="gold-text italic">{progress.toFixed(1)}% הושלמו</span>
               <span className="opacity-50 tracking-widest">היעד: {campaign.targetAmount?.toLocaleString()}</span>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full border border-[#c5a059]/30 overflow-hidden p-[2px]">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${progress}%` }} 
                 transition={{ duration: 2 }}
                 className="h-full bg-gradient-to-r from-[#8e6b2e] via-[#f9e69a] to-[#8e6b2e] rounded-full shadow-[0_0_15px_#f9e69a]"
               />
            </div>
          </div>
        </div>

        {/* פאנל שמאלי - תורמים */}
        <div className="w-[28%] h-[85vh] gold-panel flex flex-col">
          <div className="bg-[#c5a059] text-black text-center py-2 font-bold text-xl tracking-tighter">השותפים</div>
          <div className="flex-1 overflow-hidden mask-fade-v mt-4">
            <div className="animate-royal-scroll space-y-4 px-4">
              {[...leftColumn, ...leftColumn].map((d: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center h-20">
                  <span className="text-2xl font-bold truncate max-w-[60%]">{d.fullName}</span>
                  <span className="cyan-glow text-3xl font-black italic">₪{d.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* באנר תחתון - גלילה אופקית */}
      <div className="h-24 bg-[#c5a059] flex items-center overflow-hidden border-t-4 border-black/20">
        <div className="flex whitespace-nowrap animate-marquee-fast items-center gap-16">
          {donations.concat(donations).map((d: any, i: number) => (
            <div key={i} className="flex items-center gap-4 text-black">
              <span className="text-4xl font-black tracking-tighter">{d.fullName}</span>
              <span className="text-3xl font-light bg-black/10 px-4 py-1 rounded-full border border-black/20">₪{d.amount.toLocaleString()}</span>
              <span className="text-2xl opacity-30">★</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoyalLiveScreen;