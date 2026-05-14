import React, { useState } from 'react';
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
  const [filter, setFilter] = useState<'all' | 'mom'>('all');
  const progress = Math.min(Math.round((total / goal) * 100), 100);

  return (
    <div className="card h-full flex flex-col relative group">
      <div className="flex justify-between items-center mb-8">
        <div className="section-label uppercase tracking-widest text-[12px] font-bold text-slate-400">Customers</div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('mom')}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${filter === 'mom' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            MoM
          </button>
        </div>
      </div>

      <div className="mb-10">
        <div className="text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
          {filter === 'mom' ? 'Monthly Growth' : 'Total Customers'}
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[32px] font-black text-slate-900 leading-none">
            {filter === 'mom' ? `+${trend}%` : total.toLocaleString()}
          </span>
          {filter === 'all' && (
            <span className="text-[20px] font-bold text-slate-300">/ {goal.toLocaleString()}</span>
          )}
        </div>
        <div className="progress-track h-2 bg-slate-100">
          <div className="progress-fill h-full bg-[#7C3AED]" style={{ width: filter === 'mom' ? `${Math.min(trend, 100)}%` : `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-50">
        <div className="text-[12px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Monthly Active Customers</div>
        <div className="flex items-end justify-between">
          <span className="text-[32px] font-black text-slate-900 leading-none">{activeMonthly.toLocaleString()}</span>
          {filter === 'all' && (
            <div className="flex items-center gap-1 text-[13px] font-bold text-mint-dark mb-1">
              <TrendingUp size={16} />
              +{trend}% vs last mo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
