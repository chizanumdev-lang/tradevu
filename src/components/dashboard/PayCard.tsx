'use client';

import React, { useState } from 'react';
import { CreditCard, Edit2 } from 'lucide-react';
import { PayData } from '@/types/dashboard';

interface PayCardProps {
  data: PayData;
  editMode?: boolean;
  onEdit?: () => void;
}

export const PayCard: React.FC<PayCardProps> = ({
  data,
  editMode,
  onEdit,
}) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');

  const metric = data.metrics.find(m => m.period === timeFilter) || {
    period: timeFilter,
    weeklyGoal: 0,
    conversations: 0,
    usersConverted: 0,
    lcyTransfers: 0,
    lcyGoal: 0,
    fcyTransfers: 0,
    fcyGoal: 0
  };

  const progress = metric.weeklyGoal > 0 
    ? Math.min(Math.round((metric.conversations / metric.weeklyGoal) * 100), 100) 
    : 0;

  const conversionRate = metric.conversations > 0 
    ? Math.round((metric.usersConverted / metric.conversations) * 100) 
    : 0;

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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
          <CreditCard size={20} />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[18px] font-black text-slate-900 leading-none">Tradevu Pay</span>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex bg-slate-100 p-1 rounded-lg self-start mb-6">
        <button 
          onClick={() => setTimeFilter('week')}
          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${timeFilter === 'week' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          This Week
        </button>
        <button 
          onClick={() => setTimeFilter('month')}
          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${timeFilter === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          This Month
        </button>
      </div>

      {/* Main metric */}
      <div className="mb-6">
        <div className="text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Conversations</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[32px] font-black text-slate-900 leading-none">{metric.conversations}</span>
          <span className="text-[18px] font-bold text-slate-300">/ {metric.weeklyGoal}</span>
        </div>
        <div className="progress-track h-2 bg-slate-100">
          <div className="progress-fill h-full bg-[#7C3AED]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto space-y-6 pt-4 border-t border-slate-50">
        {/* Transfers */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">LCY transfers</span>
            <span className="text-[18px] font-black text-slate-900">
              {metric.lcyTransfers} <span className="text-[14px] font-bold text-slate-300">/ {metric.lcyGoal}</span>
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">FCY transfers</span>
            <span className="text-[18px] font-black text-slate-900">
              {metric.fcyTransfers} <span className="text-[14px] font-bold text-slate-300">/ {metric.fcyGoal}</span>
            </span>
          </div>
        </div>

        {/* Conversion rate */}
        <div>
          <div className="text-[12px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Conversation → Conversion Rate</div>
          <div className="text-[28px] font-black text-primary leading-none">{conversionRate}%</div>
        </div>
      </div>
    </div>
  );
};
