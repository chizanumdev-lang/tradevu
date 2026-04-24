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
    <article className="flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className={`border-4 border-neo-black p-2 inline-flex items-center justify-center ${isOps ? 'bg-primary-yellow' : 'bg-primary-blue text-white'}`}>
          {isOps ? <Settings size={24} strokeWidth={3} /> : <CreditCard size={24} strokeWidth={3} />}
        </div>
        <h3 className="font-h3 text-4xl text-neo-black font-black uppercase italic">{isOps ? 'Ops' : 'Pay'}</h3>
      </div>

      <div className="mb-8 font-body">
        <div className="text-xs text-primary-crimson uppercase font-black tracking-[0.2em] mb-2">Weekly Goal</div>
        <div className="text-9xl font-h2 font-black text-neo-black brutal-text-shadow leading-none">{weeklyGoal}</div>
        <p className="text-xs font-black uppercase mt-4 text-primary-blue">
          {isOps ? 'Units / Week' : 'Convs / Week'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`border-4 border-neo-black p-4 shadow-neo-sm ${isOps ? 'bg-primary-yellow' : 'bg-white'}`}>
          <div className="text-[10px] uppercase font-black mb-1">{secondaryLabel}</div>
          <div className="text-2xl font-black">{secondaryValue}</div>
        </div>
        <div className={`border-4 border-neo-black p-4 shadow-neo-sm ${isOps ? 'bg-white' : 'bg-primary-yellow'}`}>
          <div className="text-[10px] uppercase font-black mb-1">Conversion</div>
          <div className="text-2xl font-black">{conversionRate}%</div>
        </div>
      </div>
    </article>
  );
};
