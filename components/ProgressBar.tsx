cat > components/ProgressBar.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  target: number;
  currency: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, currency, color = '#10b981' }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const safeTarget = target > 0 ? target : 1;
    const p = Math.min(100, Math.max(0, (current / safeTarget) * 100));
    setPercentage(p);
  }, [current, target]);

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end text-white px-1">
        <div className="flex items-center gap-3">
           <div className="text-3xl font-bold bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5 tabular-nums">
             {percentage.toFixed(1)}%
           </div>
           <span className="text-white/50 text-sm font-light uppercase tracking-wider mb-1">הושלמו מהיעד</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-white/50 block mb-1 uppercase tracking-wider">יעד סופי</span>
          <span className="text-2xl font-bold font-display tracking-wider text-white/90">
            {target.toLocaleString()} {currency}
          </span>
        </div>
      </div>
      
      <div className="relative p-1 bg-slate-900/50 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="relative h-10 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
          <motion.div 
            className="absolute top-0 right-0 h-full rounded-full relative overflow-hidden"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, type: "spring", bounce: 0, damping: 20 }}
          >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-[140%] bg-white/50 blur-md"></div>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-[shimmer_2.5s_infinite]"></div>
              <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/30 to-transparent opacity-50"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
EOF