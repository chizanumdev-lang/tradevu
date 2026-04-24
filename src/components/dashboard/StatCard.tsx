import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: number;
    label: string;
    isUp: boolean;
  };
  tag?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, trend, tag }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center border-b-4 border-neo-black pb-2">
        <span className="text-xs font-black uppercase tracking-widest text-primary-crimson">{title}</span>
        {tag && (
          <div className="border-4 border-neo-black bg-white p-2 scale-75 inline-flex items-center justify-center font-black uppercase text-[10px]">
            {tag}
          </div>
        )}
      </div>
      <div className="py-4">
        <div className="font-h2 text-7xl font-extrabold brutal-text-shadow text-primary-blue tracking-tighter">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {trend && (
          <div className="flex items-center mt-4 bg-primary-yellow border-4 border-neo-black px-3 py-1 w-fit shadow-neo-sm">
            {trend.isUp ? <ArrowUpRight size={14} strokeWidth={4} className="mr-1" /> : <ArrowDownRight size={14} strokeWidth={4} className="mr-1" />}
            <span className="text-xs font-black uppercase">
              {trend.isUp ? '+' : ''}{trend.value}% VS {trend.label}
            </span>
          </div>
        )}
        {subtext && (
          <div className="text-xs font-black text-neo-black mt-2 uppercase underline decoration-4 decoration-primary-yellow">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
