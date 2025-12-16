import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, Play, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import AnimatedCounter from '../components/AnimatedCounter';
import ProgressBar from '../components/ProgressBar';
import DonationCard from '../components/DonationCard';
import HeroDonation from '../components/HeroDonation';

const INITIAL_CAMPAIGN = { name: 'טוען...', targetAmount: 1, currentAmount: 0, manualStartingAmount: 0, currency: '₪', themeColor: '#10b981', logoUrl: '', bannerUrl: '' };

const LiveScreen: React.FC = () => {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState<any>(INITIAL_CAMPAIGN);
  const [donations, setDonations] = useState<any[]>([]);
  const [heroDonation, setHeroDonation] = useState<any>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevCount = useRef(0);
  const { width, height } = useWindowSize();

  const total = (campaign.currentAmount || 0) + (campaign.manualStartingAmount || 0);
  const progress = Math.min((total / (campaign.targetAmount || 1)) * 100, 100);

  const fetchUpdates = async () => {
    try {
      if (!slug) return;
      const res = await fetch(`/api/data/${slug}`);
      const data = await res.json();
      if (data.campaign) setCampaign(data.campaign);
      if (data.donations) {
        if (data.donations.length > prevCount.current && prevCount.current !== 0) {
          handleNewDonation(data.donations[0]);
        }
        prevCount.current = data.donations.length;
        setDonations(data.donations);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUpdates();
    const interval = setInterval(fetchUpdates, 4000);
    return () => clearInterval(interval);
  }, [slug]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const handleNewDonation = (d: any) => {
    setHeroDonation(d);
    if (audioRef.current && isAudioReady) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setTimeout(() => setHeroDonation(null), 10000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative font-sans flex flex-col" dir="rtl">
      {/* קונפטי בניצחון */}
      {progress >= 100 && <Confetti width={width} height={height} numberOfPieces={200} recycle={true} />}
      
      {/* באנר עליון (אם קיים) */}
      {campaign.bannerUrl && (
        <div className="w-full h-32 md:h-48 shrink-0 relative">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 z-10"></div>
           <img src={campaign.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      <AnimatePresence>
        {!isAudioReady && (
          <motion.button onClick={() => setIsAudioReady(true)} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center">
            <div className="bg-emerald-500 p-8 rounded-full shadow-2xl mb-4"><Play size={48} fill="white"/></div>
            <h2 className="text-3xl font-bold">לחץ להפעלת מסך</h2>
          </motion.button>
        )}
      </AnimatePresence>

      <HeroDonation donation={heroDonation} onComplete={() => setHeroDonation(null)} currency={campaign.currency} />

      <div className={`relative z-10 p-8 flex flex-col gap-6 flex-grow min-h-0 ${!campaign.bannerUrl ? 'pt-12' : ''}`}>
        <header className="flex flex-col gap-6 shrink-0">
          <div className="flex justify-between items-start">
             <div className="space-y-2 flex items-center gap-6">
                {campaign.logoUrl && <img src={campaign.logoUrl} alt="Logo" className="h-24 w-24 object-contain bg-white/10 rounded-2xl p-2 backdrop-blur-sm" />}
                <div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight" style={{ color: campaign.themeColor }}>{campaign.name}</h1>
                    <p className="text-2xl opacity-70">{campaign.subTitle}</p>
                </div>
             </div>
             <div className="text-left">
                <div className="text-8xl md:text-9xl font-black"><AnimatedCounter value={total} currency={campaign.currency} /></div>
                <div className="text-emerald-400 font-bold flex items-center justify-end gap-2 text-2xl"><TrendingUp /> נאסף בהצלחה</div>
             </div>
          </div>
          <ProgressBar current={total} target={campaign.targetAmount} currency={campaign.currency} color={campaign.themeColor} />
        </header>

        <div className="flex-grow grid grid-cols-12 gap-8 min-h-0">
          <div className="col-span-8 bg-slate-800/50 rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col">
             <h2 className="text-2xl font-bold mb-4 flex gap-2"><Award className="text-yellow-400"/> תרומות אחרונות</h2>
             <div className="flex-grow overflow-hidden relative">
               <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-slate-800/80 via-transparent to-slate-800/80"></div>
               <div className="animate-scroll-vertical space-y-3 px-4" style={{ '--scroll-duration': '40s' } as any}>
                  {[...donations, ...donations, ...donations].map((d, i) => (
                    <DonationCard key={i} donation={d} currency={campaign.currency} />
                  ))}
               </div>
             </div>
          </div>

          <div className="col-span-4 bg-slate-800/50 rounded-3xl p-6 border border-white/10 flex flex-col">
            <h3 className="text-xl font-bold mb-6" style={{ color: campaign.themeColor }}>דרכי תרומה</h3>
            <div className="space-y-4 overflow-y-auto flex-grow custom-scrollbar pr-2">
               {campaign.donationMethods?.map((m: any, i: number) => (
                 <div key={i} className="bg-white p-4 rounded-xl text-slate-900 text-center shadow-lg">
                    {m.qrCodeUrl && <img src={m.qrCodeUrl} className="w-32 h-32 mx-auto mb-2 object-contain" />}
                    <p className="font-black text-xl">{m.methodType}</p>
                 </div>
               ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center opacity-50 text-sm font-bold">פותח ע"י DA ניהול פרויקטים ויזמות</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;