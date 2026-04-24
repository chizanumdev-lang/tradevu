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
    <article className="flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="border-4 border-neo-black bg-primary-crimson text-white p-2 inline-flex items-center justify-center">
          <Code size={24} strokeWidth={3} />
        </div>
        <h3 className="font-h3 text-4xl text-neo-black font-black uppercase italic">Eng</h3>
      </div>

      <div className="mb-8 p-6 border-4 border-neo-black bg-neo-black text-white shadow-neo font-body">
        <div className="text-xs text-primary-yellow uppercase font-black tracking-[0.2em] mb-4">Next Milestone</div>
        <div className="text-2xl font-h2 font-black tracking-tight leading-tight mb-4">
          {milestone.title}
        </div>
        <p className="text-[11px] font-black uppercase flex items-center text-primary-yellow">
          <Clock size={14} className="mr-2" />
          Estimated Delivery {milestone.estimatedDelivery}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-4 border-neo-black p-4 bg-white shadow-neo-sm">
          <div className="text-[10px] uppercase font-black mb-1 text-primary-blue">{milestone.currencyPair}</div>
          <div className="text-sm font-black uppercase border-b-2 border-primary-crimson inline-block">
            {milestone.environment}
          </div>
        </div>
        <div className="border-4 border-neo-black p-4 bg-white shadow-neo-sm">
          <div className="text-[10px] uppercase font-black mb-1 text-primary-blue">Status</div>
          <div className="text-sm font-black uppercase border-b-2 border-primary-yellow inline-block">
            {milestone.status}
          </div>
        </div>
      </div>
    </article>
  );
};
