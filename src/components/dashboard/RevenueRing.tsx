import React from 'react';

interface RevenueRingProps {
  goal: number;
  current: number;
  percentage: number;
}

export const RevenueRing: React.FC<RevenueRingProps> = ({ goal, current, percentage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-4 border-neo-black bg-white shadow-neo">
      <span className="text-xs font-black text-neo-black uppercase tracking-[0.3em] mb-12 border-b-2 border-neo-black">
        Annual Revenue Goal
      </span>
      <div className="relative w-40 h-20 mb-8">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
          <defs>
            <linearGradient id="brutalGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <filter height="200%" id="brutalGlow" width="200%" x="-50%" y="-50%">
              <feDropShadow dx="0" dy="0" floodColor="#DC2626" stdDeviation="2" />
            </filter>
          </defs>
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#000000" 
            strokeDasharray="2,2" 
            strokeWidth="2" 
          />
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="url(#brutalGradient)" 
            strokeLinecap="square" 
            strokeWidth="3"
            strokeDasharray={125.6} // Semi-circle circumference (approx)
            strokeDashoffset={125.6 * (1 - percentage / 100)}
            className="transition-all duration-1000 ease-out"
          />
          <circle 
            cx={50 + 40 * Math.cos(Math.PI - (percentage / 100) * Math.PI)} 
            cy={50 - 40 * Math.sin((percentage / 100) * Math.PI)} 
            fill="#000000" 
            r="4" 
            style={{ filter: 'url(#brutalGlow)' }} 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pt-4">
          <span className="text-4xl font-black brutal-text-shadow text-primary-yellow">
            ${(current / 1000000).toFixed(1)}M
          </span>
          <span className="text-[10px] font-black bg-neo-black text-white px-2 mt-2 uppercase tracking-tighter">
            {percentage}% Collected
          </span>
        </div>
      </div>
    </div>
  );
};
