'use client';

import React from 'react';
import { TrendingUp, Edit2, Landmark } from 'lucide-react';
import { WeeklyFinance } from '@/types/dashboard';

interface FinanceCardProps {
  data: WeeklyFinance;
  editMode?: boolean;
  onEdit?: () => void;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ 
  data,
  editMode,
  onEdit
}) => {
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
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
          <Landmark size={20} />
        </div>
        <div className="text-[18px] font-black text-slate-900">Finance</div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-[12px] font-bold text-slate-400 mb-1">Loan disbursement value</div>
          <div className="text-[24px] font-black text-slate-900 leading-none">
            ${data.loanDisbursementValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[12px] font-bold text-mint-dark mt-2">
            <TrendingUp size={14} />
            +{data.loanDisbursementTrend}% vs last week
          </div>
        </div>

        <div className="h-px bg-slate-50 w-full" />

        <div>
          <div className="text-[12px] font-bold text-slate-400 mb-1">Loans disbursed</div>
          <div className="text-[24px] font-black text-slate-900 leading-none">
            {data.loansDisbursed}
          </div>
          <div className="flex items-center gap-1 text-[12px] font-bold text-mint-dark mt-2">
            <TrendingUp size={14} />
            +{data.loansDisbursedTrend}% vs last week
          </div>
        </div>

        <div className="h-px bg-slate-50 w-full" />

        <div>
          <div className="text-[12px] font-bold text-slate-400 mb-1">Default rate</div>
          <div className="text-[24px] font-black text-slate-900 leading-none">
            {data.defaultRate}%
          </div>
          <div className="flex items-center gap-1 text-[12px] font-bold text-mint-dark mt-2">
            <TrendingUp size={14} />
            +{data.defaultRateTrend}% vs last week
          </div>
        </div>
      </div>
    </div>
  );
};
