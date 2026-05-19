'use client';

import React, { useState } from 'react';
import { CreditCard, ChevronDown } from 'lucide-react';
import { PayMetric, PayData } from '@/types/dashboard';

interface PayCardProps {
  data: PayData;
  userRole?: string;
  editMode?: boolean;
  onEdit?: () => void;
}

export const PayCard: React.FC<PayCardProps> = ({
  data,
}) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Safe fallback if data or metrics are undefined
  const metricsList = data?.metrics || [];
  const activeMetric = metricsList.find(m => m.period === timeFilter) || {
    period: timeFilter,
    weeklyGoal: 10,
    conversations: 28,
    usersConverted: 2,
    lcyTransfers: 1,
    lcyGoal: 2,
    fcyTransfers: 5,
    fcyGoal: 2,
  };

  const progress = Math.min(Math.round((activeMetric.conversations / activeMetric.weeklyGoal) * 100), 100);
  const conversionRate = activeMetric.conversations > 0 
    ? (activeMetric.usersConverted / activeMetric.conversations) * 100 
    : 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm flex flex-col relative group h-full justify-between">
      {/* Header with inline dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-[#7C3AED] shrink-0">
            <CreditCard size={20} />
          </div>
          <span className="text-[14px] font-black text-slate-900 leading-none whitespace-nowrap">Tradevu Pay</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 transition-all focus:outline-none whitespace-nowrap shrink-0"
          >
            <span>{timeFilter === 'week' ? 'This week' : 'This month'}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => {
                    setTimeFilter('week');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${timeFilter === 'week' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This week
                </button>
                <button
                  onClick={() => {
                    setTimeFilter('month');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${timeFilter === 'month' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This month
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Conversations Section */}
      <div className="mb-5">
        <div className="text-[13px] font-medium text-[#64748B] mb-2">Conversations</div>
        <div className="flex items-baseline gap-1.5 mb-3.5">
          <span className="text-[26px] font-semibold text-black leading-none">{activeMetric.conversations}</span>
          <span className="text-[16px] font-medium text-[#94A3B8]">/ {activeMetric.weeklyGoal}</span>
        </div>
        <div className="h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full bg-[#7C3AED] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F1F5F9] my-1" />

      {/* Transfers breakdown list layout matching mockup */}
      <div className="py-4 space-y-3.5">
        <div className="flex justify-between items-center text-[13px] font-medium">
          <span className="text-[#64748B]">LCY transfers</span>
          <div className="flex items-baseline gap-1 font-semibold">
            <span className="text-black">{activeMetric.lcyTransfers}</span>
            <span className="text-[#94A3B8] font-medium">/ {activeMetric.lcyGoal}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-[13px] font-medium">
          <span className="text-[#64748B]">FCY transfers</span>
          <div className="flex items-baseline gap-1 font-semibold">
            <span className="text-black">{activeMetric.fcyTransfers}</span>
            <span className="text-[#94A3B8] font-medium">/ {activeMetric.fcyGoal}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F1F5F9] my-1" />

      {/* Conversion Rate at the bottom */}
      <div className="pt-4">
        <div className="text-[13px] font-medium text-[#64748B] mb-2">Conversion Rate</div>
        <div className="text-[26px] font-semibold text-[#7C3AED] leading-none">
          {conversionRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
