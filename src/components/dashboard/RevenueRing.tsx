'use client';

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
          className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-transform z-10 animate-in zoom-in"
        >
          <Edit2 size={14} />
        </button>
      )}
      
      <div className="section-label mb-6">FY Revenue Goal</div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="relative" style={{ width: 200, height: 104 }}>
          <svg width="200" height="104" viewBox="0 0 100 52" overflow="visible">
            {/* Track */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Fill */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-[28px] font-black text-slate-900 leading-none">{percentage}%</span>
            <span className="text-[13px] font-semibold text-slate-400 mt-1">achieved</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100 mt-4">
        <div>
          <div className="text-[13px] font-bold text-slate-400 mb-1">Revenue target</div>
          <div className="text-[18px] font-black text-slate-900">${(goal / 1000000).toFixed(0)}m</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-slate-400 mb-1">Current YTD</div>
          <div className="text-[18px] font-black text-slate-900">${(current / 1000).toFixed(0)}k</div>
        </div>
      </div>
    </div>
  );
};
