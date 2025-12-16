import React, { useEffect, useState, useRef } from 'react';
import { Campaign, Donation } from '../types';
import ProgressBar from '../components/ProgressBar';
import DonationCard from '../components/DonationCard';
import HeroDonation from '../components/HeroDonation';
import AnimatedCounter from '../components/AnimatedCounter';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, Play, Volume2 } from 'lucide-react';

const INITIAL_CAMPAIGN: Campaign = {
  id: 'cmp_1',
  name: 'טוען נתונים...',
  subTitle: 'מתחבר למסד הנתונים',
  targetAmount: 0,
  currentAmount: 0,
  currency: '₪',
  donationMethods: {
    qrCodeUrl: '',
    qrLabel: '',
    bottomText: ''
  },
  displaySettings: {
    scale: 1.0
  }
};

const LiveScreen: React.FC = () => {
  const [campaign, setCampaign] = useState<Campaign>(INITIAL_CAMPAIGN);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [heroDonation, setHeroDonation] = useState<Donation | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDonationIdRef = useRef<string | null>(null);

  // פונקציה מרכזית למשיכת נתונים מה-API
  const fetchLiveUpdates = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // 1. עדכון הגדרות קמפיין
      if (data.campaign) {
        setCampaign(prev => ({
          ...prev,
          ...data.campaign,
          displaySettings: data.campaign.displaySettings || prev.displaySettings
        }));
      }

      // 2. בדיקה אם יש תרומה חדשה (בשביל ה-HeroDonation והסאונד)
      if (data.donations && data.donations.length > 0) {
        const latestDonation = data.donations[0];
        
        // אם ה-ID של התרומה האחרונה שונה ממה ששמור אצלנו - זו תרומה חדשה!
        if (lastDonationIdRef.current !== null && latestDonation._id !== lastDonationIdRef.current) {
          handleNewDonation(latestDonation);
        }
        
        lastDonationIdRef.current = latestDonation._id;
        setDonations(data.donations);
      }
    } catch (error) {
      console.error("Failed to sync with database:", error);
    }
  };

  // אתחול ראשוני ו-Polling (רענון כל 4 שניות)
  useEffect(() => {
    fetchLiveUpdates(); // משיכה ראשונית מיד
    
    const interval = setInterval(fetchLiveUpdates, 4000); 
    return () => clearInterval(interval);
  }, [isAudioReady]);

  // Apply scaling (Zoom)
  useEffect(() => {
    if (campaign.displaySettings?.scale) {
      const baseSize = 16;
      const newSize = baseSize * campaign.displaySettings.scale;
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  }, [campaign.displaySettings?.scale]);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); 
    audioRef.current.volume = 0.5;
  }, []);

  const handleNewDonation = (donation: Donation) => {
    // הפעלת ה-Hero והסאונד
    setHeroDonation(donation);

    if (audioRef.current && isAudioReady) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn("Audio play failed:", e));
    }
  };

  const handleStartInteraction = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        setIsAudioReady(true);
      }).catch(e => console.error("Could not unlock audio", e));
    } else {
        setIsAudioReady(true);
    }
  };

  const donationList = donations.length > 0 ? donations : [];
  const loopedDonations = [...donationList, ...donationList, ...donationList]; 
  const scrollDuration = Math.max(20, donations.length * 5) + 's';

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-hidden relative font-sans selection:bg-indigo-500/30">
      
      {/* Click to Start Overlay */}
      <AnimatePresence>
        {!isAudioReady && (
          <motion.button
            onClick={handleStartInteraction}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity rounded-full"></div>
              <div className="relative bg-emerald-500 p-8 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform duration-300 border border-emerald-400/50">
                 <Play size={48} className="fill-white ml-2 text-white" />
              </div>
            </div>
            <h2 className="mt-8 text-3xl font-bold text-white tracking-tight">לחץ כדי להפעיל את המסך</h2>
            <div className="mt-2 flex items-center gap-2 text-white/60">
              <Volume2 size={20} />
              <span>נדרשת לחיצה כדי לאפשר שמע וחיבור חי</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/0 blur-[120px] mix-blend-screen"
        />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-900/30 via-cyan-900/30 to-slate-900/0 blur-[100px] mix-blend-screen"
        />
      </div>

      <HeroDonation 
        donation={heroDonation} 
        onComplete={() => setHeroDonation(null)} 
        currency={campaign.currency}
      />

      <div className="relative z-10 h-screen p-6 md:p-10 flex flex-col gap-6 lg:gap-8">
        
        {/* Header */}
        <header className="flex flex-col gap-6 shrink-0">
          <div className="flex justify-between items-start" dir="rtl">
             <div className="space-y-2 text-right">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight font-display drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    {campaign.name}
                  </h1>
                </motion.div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-xl md:text-2xl font-light tracking-wide">
                  {campaign.subTitle}
                </motion.p>
             </div>
             
             <div className="text-left">
                <div className="text-7xl md:text-9xl font-black font-display tracking-tight leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <AnimatedCounter 
                    value={campaign.currentAmount} 
                    currency={campaign.currency} 
                  />
                </div>
                <motion.div 
                  className="text-emerald-400 font-bold flex items-center justify-start gap-2 text-xl mt-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <TrendingUp size={24} />
                  <span>גויסו בהצלחה</span>
                </motion.div>
             </div>
          </div>

          <ProgressBar 
            current={campaign.currentAmount} 
            target={campaign.targetAmount} 
            currency={campaign.currency} 
          />
        </header>

        {/* Content Columns */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0">
          
          {/* Donations Ticker */}
          <div className="lg:col-span-8 bg-slate-900/30 rounded-[2rem] p-1 border border-white/10 flex flex-col backdrop-blur-md shadow-2xl overflow-hidden relative group">
             <div className="bg-slate-950/40 rounded-[1.8rem] h-full flex flex-col overflow-hidden relative">
                <div className="flex items-center justify-end gap-3 p-6 pb-4 border-b border-white/5 shrink-0 z-10 bg-inherit" dir="rtl">
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                      <Award className="text-yellow-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">תרומות אחרונות</h2>
                </div>
                
                <div className="flex-grow relative overflow-hidden">
                  <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80" />
                  
                  {donations.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-white/30 text-xl font-light">
                        <span className="animate-pulse">ממתינים לתרומה הראשונה...</span>
                      </div>
                  ) : (
                    <div 
                      className="animate-scroll-vertical space-y-3 px-6 py-4"
                      style={{ '--scroll-duration': scrollDuration } as React.CSSProperties}
                    >
                        {loopedDonations.map((donation, index) => (
                          <DonationCard 
                            key={`${donation._id || donation.id}-${index}`} 
                            donation={donation} 
                            currency={campaign.currency}
                          />
                        ))}
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-4 flex flex-col gap-6" dir="rtl">
            <div className="flex-grow bg-gradient-to-b from-indigo-900/30 to-slate-900/30 rounded-[2rem] p-6 border border-white/10 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div>
                <h3 className="text-xl font-bold mb-6 text-indigo-200 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block"></span>
                  דרכים לתרום
                </h3>
                <div className="space-y-6">
                   {campaign.donationMethods?.qrCodeUrl && (
                     <div className="bg-white/95 p-5 rounded-2xl shadow-xl transform transition-transform hover:scale-[1.02] duration-500">
                        <img 
                          src={campaign.donationMethods.qrCodeUrl} 
                          alt="QR Code" 
                          className="w-full h-auto rounded-xl mix-blend-multiply" 
                        />
                        {campaign.donationMethods.qrLabel && (
                          <p className="text-slate-900 text-center font-bold mt-3 font-display text-lg">
                            {campaign.donationMethods.qrLabel}
                          </p>
                        )}
                     </div>
                   )}
                   
                   {campaign.donationMethods?.bottomText && (
                     <div className="text-center bg-slate-950/50 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className="text-indigo-100 whitespace-pre-line font-mono text-base leading-relaxed">
                          {campaign.donationMethods.bottomText}
                        </p>
                     </div>
                   )}
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                 <p className="text-white/30 text-xs uppercase tracking-widest">Powered by LiveRaise & MongoDB</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveScreen;