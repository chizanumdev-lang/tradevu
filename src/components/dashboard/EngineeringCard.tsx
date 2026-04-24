import React from 'react';
import { Code, Clock } from 'lucide-react';

interface EngineeringCardProps {
  milestone: {
    title: string;
    status: string;
    environment: string;
    currencyPair: string;
    estimatedDelivery: string;
  };
}

export const EngineeringCard: React.FC<EngineeringCardProps> = ({ milestone }) => {
  return (
    <article className="flex flex-col border-4 border-neo-black p-8 shadow-neo-sm relative bg-white">
      <div className="absolute -top-5 -right-5 border-4 border-neo-black bg-primary-crimson text-white p-3 shadow-neo-sm">
        <Code size={28} strokeWidth={3} />
      </div>
      
      <div className="flex items-center gap-4 mb-10">
        <h3 className="font-h3 text-5xl text-neo-black font-black uppercase italic tracking-tighter">Eng</h3>
      </div>

      <div className="mb-10 p-6 border-4 border-neo-black bg-neo-black text-white shadow-neo font-body">
        <div className="text-xs text-primary-yellow uppercase font-black tracking-[0.2em] mb-4">Next Milestone</div>
        <div className="text-3xl font-h2 font-black tracking-tight leading-tight mb-6">
          {milestone.title}
        </div>
        <p className="text-[11px] font-black uppercase flex items-center text-primary-yellow mt-4 border-t border-primary-yellow/30 pt-4">
          <Clock size={16} className="mr-2" />
          ETA: {milestone.estimatedDelivery}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="border-4 border-neo-black p-4 bg-[#f0f0f0] shadow-neo-sm">
          <div className="text-[10px] uppercase font-black mb-1 text-primary-blue">{milestone.currencyPair}</div>
          <div className="text-xs font-black uppercase bg-primary-crimson text-white px-2 py-0.5 inline-block">
            {milestone.environment}
          </div>
        </div>
        <div className="border-4 border-neo-black p-4 bg-[#f0f0f0] shadow-neo-sm">
          <div className="text-[10px] uppercase font-black mb-1 text-primary-blue">Status</div>
          <div className="text-xs font-black uppercase bg-primary-yellow text-neo-black px-2 py-0.5 inline-block">
            {milestone.status}
          </div>
        </div>
      </div>
    </article>
  );
};
