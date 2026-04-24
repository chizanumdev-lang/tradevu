import React from 'react';
import { Settings, CreditCard } from 'lucide-react';

interface OpsCardProps {
  type: 'OPS' | 'PAY';
  weeklyGoal: number;
  units: number;
  secondaryLabel: string;
  secondaryValue: number;
  conversionRate: number;
}

export const OpsCard: React.FC<OpsCardProps> = ({ type, weeklyGoal, units, secondaryLabel, secondaryValue, conversionRate }) => {
  const isOps = type === 'OPS';
  
  return (
    <article className={`flex flex-col border-4 border-neo-black p-8 shadow-neo-sm relative ${isOps ? 'bg-white' : 'bg-white'}`}>
      <div className={`absolute -top-5 -right-5 border-4 border-neo-black p-3 ${isOps ? 'bg-primary-yellow' : 'bg-primary-blue text-white'} shadow-neo-sm`}>
        {isOps ? <Settings size={28} strokeWidth={3} /> : <CreditCard size={28} strokeWidth={3} />}
      </div>
      
      <div className="flex items-center gap-4 mb-10">
        <h3 className="font-h3 text-5xl text-neo-black font-black uppercase italic tracking-tighter">{isOps ? 'Ops' : 'Pay'}</h3>
      </div>

      <div className="mb-10 font-body">
        <div className="text-xs text-primary-crimson uppercase font-black tracking-[0.2em] mb-3">Weekly Goal</div>
        <div className="text-9xl font-h2 font-black text-neo-black brutal-text-shadow leading-none">{weeklyGoal}</div>
        <p className="text-[11px] font-black uppercase mt-6 text-primary-blue flex items-center gap-2">
          <span className="w-8 h-1 bg-primary-blue inline-block"></span>
          {isOps ? 'Units / Week' : 'Convs / Week'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className={`border-4 border-neo-black p-4 shadow-neo-sm ${isOps ? 'bg-primary-yellow' : 'bg-[#f0f0f0]'}`}>
          <div className="text-[10px] uppercase font-black mb-1">{secondaryLabel}</div>
          <div className="text-3xl font-h2 font-black">{secondaryValue}</div>
        </div>
        <div className={`border-4 border-neo-black p-4 shadow-neo-sm ${isOps ? 'bg-[#f0f0f0]' : 'bg-primary-yellow'}`}>
          <div className="text-[10px] uppercase font-black mb-1">Conversion</div>
          <div className="text-3xl font-h2 font-black">{conversionRate}%</div>
        </div>
      </div>
    </article>
  );
};
