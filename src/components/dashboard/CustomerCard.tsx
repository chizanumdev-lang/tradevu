import React from 'react';
import { TrendingUp, Edit2 } from 'lucide-react';

interface CustomerCardProps {
  total: number;
  goal: number;
  activeMonthly: number;
  trend: number;
  editMode?: boolean;
  onEdit?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ 
  total, 
  goal, 
  activeMonthly, 
  trend,
  editMode,
  onEdit
}) => {
  const progress = Math.min(Math.round((total / goal) * 100), 100);

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
      
      <div className="section-label mb-8 uppercase tracking-widest text-[12px] font-bold text-slate-400">Customers</div>

      <div className="mb-10">
        <div className="text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Total Customers</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[32px] font-black text-slate-900 leading-none">{total.toLocaleString()}</span>
          <span className="text-[20px] font-bold text-slate-300">/ {goal.toLocaleString()}</span>
        </div>
        <div className="progress-track h-2 bg-slate-100">
          <div className="progress-fill h-full bg-[#7C3AED]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-50">
        <div className="text-[12px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Monthly Active Customers</div>
        <div className="flex items-end justify-between">
          <span className="text-[32px] font-black text-slate-900 leading-none">{activeMonthly.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[13px] font-bold text-mint-dark mb-1">
            <TrendingUp size={16} />
            +{trend}% vs last mo
          </div>
        </div>
      </div>
    </div>
  );
};
