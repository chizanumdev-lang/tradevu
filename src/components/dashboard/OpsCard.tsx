'use client';

import React from 'react';
import { Users, DollarSignIcon,TrendingUp, ChevronDown, Edit2 } from 'lucide-react';

interface OpsCardProps {
  type: 'OPS' | 'PAY';
  mainMetric: { label: string; current: number; goal: number };
  subMetric?: { label: string; value: number; trend: number };
  conversion: { label: string; value: number };
  listMetrics?: { label: string; current: number; goal: number }[];
  editMode?: boolean;
  onEdit?: () => void;
}

export const OpsCard: React.FC<OpsCardProps> = ({
  type,
  mainMetric,
  subMetric,
  conversion,
  listMetrics,
  editMode,
  onEdit,
}) => {
  const isOps = type === 'OPS';
  const Icon = isOps ? Users : DollarSignIcon;
  const title = isOps ? 'Operations' : 'Tradevu Pay';
  const progress = Math.min(Math.round((mainMetric.current / mainMetric.goal) * 100), 100);

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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon size={18} />
          </div>
          <span className="text-[17px] font-extrabold text-slate-800">{title}</span>
        </div>
      </div>

      {/* Main metric */}
      <div className="mb-6">
        <div className="text-[13px] font-bold text-slate-400 mb-2">{mainMetric.label}</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[32px] font-black text-slate-900 leading-none">{mainMetric.current}</span>
          <span className="text-[20px] font-bold text-slate-300">/ {mainMetric.goal}</span>
        </div>
        <div className="progress-track h-2.5">
          <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto space-y-5 pt-2">

        {/* Conversion rate */}
        <div className='pt-4 border-t border-slate-100'>
          <div className="text-[13px] font-bold text-slate-400 mb-1">{conversion.label}</div>
          <div className="text-[26px] font-black text-primary">{conversion.value}%</div>
        </div>

        {/* Sub metric (Conversions for OPS) */}
        {subMetric && (
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[13px] font-bold text-slate-400 mb-2">{subMetric.label}</div>
            <div className="flex items-end justify-between">
              <span className="text-[28px] font-black text-slate-900 leading-none">{subMetric.value}</span>
              <div className="flex items-center gap-1 text-[13px] font-bold text-mint-dark mb-1">
                <TrendingUp size={14} />
                +{subMetric.trend}% vs last week
              </div>
            </div>
          </div>
        )}

        

        {/* List metrics (LCY/FCY for PAY) */}
        {listMetrics && listMetrics.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {listMetrics.map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-[15px] font-semibold text-slate-500">{item.label}</span>
                <span className="text-[15px] font-black text-slate-800">
                  {item.current} <span className="font-semibold text-slate-400">/ {item.goal}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
