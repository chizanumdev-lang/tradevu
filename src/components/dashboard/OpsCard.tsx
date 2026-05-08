import React from 'react';
import { Users, CreditCard, TrendingUp, Edit2, ShoppingCart } from 'lucide-react';

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
  const Icon = isOps ? ShoppingCart : CreditCard;
  const title = isOps ? 'Tradevu sale' : 'Tradevu Pay';
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
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOps ? 'bg-purple-50 text-purple-600' : 'bg-purple-50 text-purple-600'}`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[18px] font-black text-slate-900 leading-none">{title}</span>
          {isOps && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              operations
            </span>
          )}
        </div>
      </div>

      {/* Main metric */}
      <div className="mb-6">
        <div className="text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">{mainMetric.label}</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[32px] font-black text-slate-900 leading-none">{mainMetric.current}</span>
          <span className="text-[18px] font-bold text-slate-300">/ {mainMetric.goal}</span>
        </div>
        <div className="progress-track h-2 bg-slate-100">
          <div className="progress-fill h-full bg-[#7C3AED]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto space-y-6 pt-4 border-t border-slate-50">
        {/* Sub metric (Conversions for OPS) */}
        {subMetric && (
          <div>
            <div className="text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">{subMetric.label}</div>
            <div className="flex items-end justify-between">
              <span className="text-[28px] font-black text-slate-900 leading-none">{subMetric.value}</span>
              <div className="flex items-center gap-1 text-[12px] font-bold text-mint-dark mb-1">
                <TrendingUp size={14} />
                +{subMetric.trend}% vs last week
              </div>
            </div>
          </div>
        )}

        {/* List metrics (LCY/FCY for PAY) */}
        {listMetrics && listMetrics.length > 0 && (
          <div className="space-y-4">
            {listMetrics.map((item) => (
              <div key={item.label} className="flex justify-between items-baseline">
                <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <span className="text-[18px] font-black text-slate-900">
                  {item.current} <span className="text-[14px] font-bold text-slate-300">/ {item.goal}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Conversion rate */}
        <div>
          <div className="text-[12px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{conversion.label}</div>
          <div className="text-[28px] font-black text-primary leading-none">{conversion.value}%</div>
        </div>
      </div>
    </div>
  );
};
