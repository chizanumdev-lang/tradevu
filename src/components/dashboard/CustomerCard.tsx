'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface CustomerCardProps {
  total: number;
  goal: number;
  activeMonthly: number;
  trend: number;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ total, goal, activeMonthly, trend }) => {
  const progress = Math.min(Math.round((total / goal) * 100), 100);

  return (
    <div className="card h-full flex flex-col">
      <div className="section-label mb-6">Customers</div>

      <div className="mb-8">
        <div className="text-[13px] font-bold text-slate-400 mb-2">Total Customers</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[32px] font-black text-slate-900 leading-none">{total.toLocaleString()}</span>
          <span className="text-[20px] font-bold text-slate-300">/ {goal.toLocaleString()}</span>
        </div>
        <div className="progress-track h-2.5">
          <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="text-[13px] font-bold text-slate-400 mb-3">Monthly Active Customers</div>
        <div className="flex items-end justify-between">
          <span className="text-[32px] font-black text-slate-900 leading-none">{activeMonthly.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[14px] font-bold text-mint-dark mb-1">
            <TrendingUp size={15} />
            +{trend}% vs last mo
          </div>
        </div>
      </div>
    </div>
  );
};
