import React, { useEffect } from 'react';
import { Donation } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, User, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroDonationProps {
  donation: Donation | null;
  onComplete: () => void;
  currency: string;
}

const HeroDonation: React.FC<HeroDonationProps> = ({ donation, onComplete, currency }) => {
  
  useEffect(() => {
    if (donation) {
      // Fire vibrant confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.8 },
          colors: ['#fbbf24', '#a855f7', '#3b82f6', '#10b981'],
          disableForReducedMotion: true
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.8 },
          colors: ['#fbbf24', '#a855f7', '#3b82f6', '#10b981'],
          disableForReducedMotion: true
        });
  
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      const timer = setTimeout(() => {
        onComplete();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [donation, onComplete]);

  return (
    <AnimatePresence>
      {donation && (
        <motion.div 
          className="fixed top-0 right-0 h-full z-50 flex items-center justify-end p-4 md:p-12 pointer-events-none perspective-1000"
          initial={{ x: '100%', opacity: 0, rotateY: -20 }}
          animate={{ x: 0, opacity: 1, rotateY: 0 }}
          exit={{ x: '100%', opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 120, mass: 0.8 }}
        >
          <div className="relative w-full max-w-lg pointer-events-auto">
             {/* Glow Effect behind card */}
             <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] animate-pulse rounded-full"></div>
             
             {/* Main Card */}
             <div className="relative bg-[#0f172a] border border-indigo-500/30 rounded-[2.5rem] p-1 overflow-hidden shadow-2xl shadow-indigo-500/20">
                {/* Rotating Border Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                <div className="relative bg-slate-950/90 rounded-[2.2rem] p-8 md:p-10 flex flex-col items-center text-center overflow-hidden">
                   
                   {/* Background Beams */}
                   <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                   <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>

                   {/* Close Button */}
                   <button 
                    onClick={onComplete}
                    className="absolute top-6 left-6 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                   >
                    <X size={24} />
                   </button>

                   {/* Content */}
                   <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="relative z-10 w-full flex flex-col items-center"
                   >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-5 py-1.5 rounded-full text-sm font-bold mb-8 shadow-lg shadow-amber-500/20 tracking-wide uppercase">
                        <Sparkles size={16} className="text-yellow-200" />
                        תרומה חדשה!
                      </div>
                      
                      <div className="relative mb-6">
                         <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150"></div>
                         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-full relative">
                            <div className="bg-slate-900 rounded-full p-6 border border-white/10">
                              <User size={64} className="text-white" />
                            </div>
                         </div>
                      </div>

                      <h3 className="text-3xl md:text-4xl text-white font-bold mb-2 font-display tracking-tight">
                        {donation.firstName} {donation.lastName}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-500/10 px-4 py-1 rounded-full mb-8 border border-emerald-500/20">
                        <Heart size={16} className="fill-current" />
                        <span>הצטרף/ה לנבחרת התורמים</span>
                      </div>

                      <div className="w-full bg-gradient-to-r from-transparent via-white/5 to-transparent p-6 mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-xl"></div>
                        <p className="relative text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-300 font-display tracking-tight drop-shadow-sm">
                          {donation.amount.toLocaleString()} 
                          <span className="text-3xl md:text-4xl mr-3 text-indigo-300/50 font-light">{currency}</span>
                        </p>
                      </div>

                      {donation.dedication && (
                        <div className="relative">
                           <span className="absolute -top-4 -right-2 text-4xl text-white/10 font-serif">"</span>
                           <p className="text-indigo-100/80 text-lg md:text-xl leading-relaxed px-6 font-light">
                             {donation.dedication}
                           </p>
                           <span className="absolute -bottom-4 -left-2 text-4xl text-white/10 font-serif">"</span>
                        </div>
                      )}
                   </motion.div>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroDonation;