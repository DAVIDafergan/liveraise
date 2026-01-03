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

  // מצב חדש למערך של כרטיסי תרומה שקופצים

  const [notifications, setNotifications] = useState<any[]>([]);

  // רפרנס לצליל

  const audioRef = useRef<HTMLAudioElement | null>(null);



  const fetchStats = async () => {

    try {

      const res = await fetch(`/api/data/${slug}`);

      const json = await res.json();

      

      // השוואת נתונים בשביל התראות וקונפטי

      setData((prevData: any) => {

        if (prevData && json.campaign.currentAmount > prevData.campaign.currentAmount) {

          setShowConfetti(true);

          const newDonationId = Date.now();

          const newDonation = { ...json.donations[0], id: newDonationId };

          setNotifications(prev => [...prev, newDonation]);

          

          if (audioRef.current) {

            audioRef.current.currentTime = 0;

            audioRef.current.play().catch(e => console.log("Audio play blocked"));

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

  }, [slug]); // הסרת data מה-dependencies כדי למנוע לולאה אינסופית המונעת עדכון צבע



  if (!data) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white font-sans">טוען נתונים...</div>;



  const { campaign, donations } = data;

  

  // חישוב מדויק של כמה נאסף מתוך היעד: סכום המערכת + סכום שהוגדר מראש בניהול

  const totalRaised = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);

  const progress = Math.min((totalRaised / (campaign.targetAmount || 1)) * 100, 100);



  // שימוש בכל התרומות עבור הגלילה האינסופית - שכפול המערך ליצירת לולאה חלקה

  const allDonations = [...donations, ...donations, ...donations, ...donations]; 



  // חישוב והחלת מידות המסך והרקע בצורה דינמית (תומך 4K)

  const screenStyles: any = {

    backgroundColor: campaign.backgroundColor || '#020617', // צבע הרקע מופעל כאן

    '--primary': campaign.themeColor,

    zoom: campaign.displaySettings?.scale || 1.0,

    width: campaign.displaySettings?.width ? `${campaign.displaySettings.width}px` : '100vw',

    height: campaign.displaySettings?.height ? `${campaign.displaySettings.height}px` : '100vh',

    margin: '0 auto',

    position: 'relative',

    display: 'flex',

    flexDirection: 'column',

    overflow: 'hidden'

  };



  return (

    <div 

      className="text-white font-sans" 

      dir="rtl" 

      style={screenStyles}

    >

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" />



      <style>{`

        @keyframes scrollUp {

          0% { transform: translateY(0); }

          100% { transform: translateY(-50%); }

        }

        .scroll-marquee { animation: scrollUp 45s linear infinite; } /* מהירות גלילה הוגברה משמעותית ל-45 שניות */

        .mask-fade { mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent); }

        .animate-marquee { display: flex; animation: marquee 20s linear infinite; } /* מהירות סרגל תחתון הוגברה ל-20 שניות */

        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(100%); } }

      `}</style>



      {showConfetti && <Confetti width={windowWidth} height={windowHeight} colors={[campaign.themeColor, '#ffffff']} />}



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

              <div className="flex-1">

                <p className="text-sm font-bold opacity-50 uppercase">תרומה חדשה!</p>

                <h4 className="text-xl font-black">{notif.fullName}</h4>

                {notif.dedication && <p className="text-md italic text-slate-600 font-medium">"{notif.dedication}"</p>}

                <p className="text-2xl font-black" style={{ color: '#1e3a8a' }}>₪{notif.amount.toLocaleString()}</p>

              </div>

            </motion.div>

          ))}

        </AnimatePresence>

      </div>



      {/* באנר ולוגו ריחף - חזרה למבנה ריבועי/טבעי ללא מסגרת */}

      {campaign.bannerUrl && (

        <div className="w-full h-[200px] overflow-hidden shadow-2xl relative shrink-0 border-b border-white/5">

          <img src={campaign.bannerUrl} alt="Banner" className="w-full h-full object-cover" />

          <div className="absolute inset-0 opacity-40" style={{ background: `linear-gradient(to top, ${campaign.backgroundColor || '#020617'}, transparent)` }} />

          {campaign.logoUrl && (

            <motion.div 

              animate={{ y: [0, -10, 0] }}

              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}

              className="absolute bottom-4 right-12 z-30"

            >

              <img 

                src={campaign.logoUrl} 

                alt="Logo" 

                className="h-36 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]" 

              />

            </motion.div>

          )}

        </div>

      )}



      {/* תוכן מרכזי */}

      <div className={`flex-1 max-w-[98%] mx-auto w-full p-4 flex flex-col gap-4 min-h-0 ${!campaign.bannerUrl ? 'pt-24' : ''}`}>

        

        <div className="flex justify-between items-end border-b border-white/10 pb-2 relative z-10">

          <div>

            <h1 className="text-4xl font-black mb-1 tracking-tighter uppercase">{campaign.name}</h1>

            <p className="text-xl opacity-60 italic font-medium">{campaign.subTitle}</p>

          </div>

          <div className="text-left">

            <p className="text-[10px] opacity-50 uppercase tracking-[0.3em] mb-1">סה"כ נאסף</p>

            <div className="text-6xl font-black tracking-tighter" style={{ color: campaign.themeColor }}>

                {totalRaised.toLocaleString()} {campaign.currency}

            </div>

          </div>

        </div>



        {/* מד התקדמות */}

        <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10 shadow-2xl backdrop-blur-sm relative overflow-hidden">

          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">

            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5 }} className="h-full rounded-full relative" style={{ backgroundColor: campaign.themeColor }} />

          </div>

          <div className="flex justify-between mt-2 text-sm font-bold opacity-70 px-1 tracking-widest">

            <span>{progress.toFixed(1)}% הושלמו מהיעד</span>

            <div className="flex items-center gap-2">

                <Target size={16} />

                <span>יעד הקמפיין: {campaign.targetAmount.toLocaleString()} {campaign.currency}</span>

            </div>

          </div>

        </div>



        {/* זרם תרומות אחרונות */}

        <div className="flex-1 min-h-0 flex flex-col">

          <div className="flex items-center gap-3 mb-4">

            <TrendingUp size={24} className="text-emerald-400" />

            <h2 className="text-3xl font-black tracking-tighter opacity-90">תרומות אחרונות בזמן אמת</h2>

          </div>

          

          <div className="flex-1 overflow-hidden relative mask-fade">

            <div className="scroll-marquee">

              <div className="grid grid-cols-5 gap-4 py-4">

                {allDonations.map((donation: any, idx: number) => (

                  <motion.div

                    key={idx}

                    className="bg-white/5 backdrop-blur-lg p-5 rounded-[2rem] border border-white/10 flex flex-col justify-between shadow-2xl"

                    style={{ borderTop: `4px solid ${campaign.themeColor}` }}

                  >

                    <div className="flex flex-col gap-2">

                      <span className="text-xl font-black leading-tight tracking-tight text-white/90 truncate">{donation.fullName}</span>

                      {donation.dedication && (

                        <p className="text-sm italic opacity-60 font-medium line-clamp-2 h-10">"{donation.dedication}"</p>

                      )}

                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 text-2xl font-black" style={{ color: campaign.themeColor }}>

                      ₪{donation.amount.toLocaleString()}

                    </div>

                  </motion.div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* פס גלילה תחתון */}

      <div className="bg-white/5 py-4 border-t border-white/10 text-2xl font-black overflow-hidden backdrop-blur-md">

        <div className="animate-marquee whitespace-nowrap flex gap-12">

           {donations.concat(donations).map((d: any, i: number) => (

             <span key={i} className="flex items-center gap-6 text-white/90">

               <Heart size={22} style={{ color: campaign.themeColor }} className="fill-current"/> 

               <span className="font-black">{d.fullName}</span>

               <span className="px-4 py-1 rounded-full bg-white/5" style={{ color: campaign.themeColor }}>₪{d.amount.toLocaleString()}</span>

               <span className="opacity-20 mx-4">|</span>

             </span>

           ))}

        </div>

      </div>

    </div>

  );

};



export default LiveScreen;