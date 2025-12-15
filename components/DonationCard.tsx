import React from 'react';
import { Donation } from '../types';
import { motion } from 'framer-motion';
import { Heart, User } from 'lucide-react';

interface DonationCardProps {
  donation: Donation;
  currency: string;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, currency }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 rounded-2xl p-4 flex items-center gap-5 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
          <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 p-3.5 rounded-full shrink-0 shadow-lg border border-white/10">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="text-white font-bold text-xl truncate font-display tracking-tight group-hover:text-indigo-200 transition-colors">
            {donation.firstName} {donation.lastName}
          </h3>
          {donation.dedication && (
            <p className="text-white/60 text-sm truncate pr-3 mt-0.5 border-r-2 border-indigo-500/30 mr-1 italic">
               {donation.dedication}
            </p>
          )}
        </div>

        <div className="text-right shrink-0 relative">
          <div className="flex items-baseline gap-1 justify-end text-white font-bold text-2xl font-display drop-shadow-md">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
               {donation.amount.toLocaleString()}
             </span>
             <span className="text-sm text-white/50 font-normal">{currency}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-white/40 mt-1 uppercase tracking-wider font-medium">
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            <span>תרומה</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationCard;