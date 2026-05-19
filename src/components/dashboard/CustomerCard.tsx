'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface CustomerCardProps {
  total: number;
  goal: number;
  activeMonthly: number;
  trend: number;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ 
  total, 
  goal, 
  activeMonthly, 
  trend,
}) => {
  const progress = Math.min(Math.round((total / goal) * 100), 100);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm flex flex-col relative group h-full justify-between">
      {/* Header Label */}
      <div className="mb-6">
        <span className="text-[13px] font-semibold text-[#64748B] tracking-wider uppercase">
          CUSTOMERS
        </span>
      </div>

      {/* Total Customers Section */}
      <div className="mb-6">
        <div className="text-[13px] font-medium text-[#64748B] mb-2">
          Total Customers
        </div>
        <div className="flex items-baseline gap-1.5 mb-3.5">
          <span className="text-[26px] font-semibold text-black leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[16px] font-medium text-[#94A3B8]">/ {goal.toLocaleString()}</span>
        </div>
        <div className="h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#7C3AED] rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F1F5F9] my-1" />

      {/* Monthly Active Customers Section */}
      <div className="pt-4">
        <div className="text-[13px] font-medium text-[#64748B] mb-2">
          Monthly Active Customers
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[26px] font-semibold text-black leading-none">
            {activeMonthly.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-[13px] whitespace-nowrap shrink-0">
            <TrendingUp size={16} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
            <span className="text-[#10B981] font-semibold">+{trend}%</span>
            <span className="text-[#64748B]">vs last mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
