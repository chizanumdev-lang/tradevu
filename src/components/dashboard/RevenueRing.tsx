import React from 'react';
import { Edit2 } from 'lucide-react';

interface RevenueRingProps {
  goal: number;
  current: number;
  percentage: number;
  editMode?: boolean;
  onEdit?: () => void;
}

export const RevenueRing: React.FC<RevenueRingProps> = ({ 
  goal, 
  current, 
  percentage,
  editMode,
  onEdit
}) => {
  // Arc math: half-circle from left to right
  const radius = 40;
  const circumference = Math.PI * radius; // half circumference
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="card h-full flex flex-col relative group">
      {editMode && onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-10 animate-in zoom-in"
        >
          <Edit2 size={14} />
        </button>
      )}
      
      <div className="section-label mb-8 uppercase tracking-widest text-[10px] font-bold text-slate-400 whitespace-nowrap">FY Revenue Goal</div>

      <div className="flex-1 flex flex-col items-center justify-center pt-2">
        <div className="relative" style={{ width: 240, height: 124 }}>
          <svg width="240" height="124" viewBox="0 0 100 52" overflow="visible">
            {/* Track */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fill */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-[42px] font-black text-slate-900 leading-none">{percentage}%</span>
            <span className="text-[14px] font-bold text-slate-400 mt-1 uppercase tracking-tight">achieved</span>
          </div>
        </div>
      </div>

      <div className={`flex ${editMode ? 'justify-between' : 'justify-center'} pt-8 border-t border-slate-50 mt-8`}>
        <div className={editMode ? '' : 'text-center'}>
          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider whitespace-nowrap">Revenue target</div>
          <div className="text-[22px] font-black text-slate-900">${(goal / 1000000).toFixed(0)}m</div>
        </div>
        {editMode && (
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider whitespace-nowrap">Current YTD</div>
            <div className="text-[22px] font-black text-slate-900">${(current / 1000).toFixed(0)}k</div>
          </div>
        )}
      </div>
    </div>
  );
};
