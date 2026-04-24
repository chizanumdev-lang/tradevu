import React from 'react';
import { Star } from 'lucide-react';

interface LaunchStatusProps {
  phase: string;
  progress: number;
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ phase, progress }) => {
  return (
    <div className="mt-8 border-l-8 border-primary-yellow pl-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-primary-blue">Launch Readiness</span>
        <div className="text-primary-crimson">
          <Star size={16} fill="currentColor" />
        </div>
      </div>
      <div className="font-h3 text-2xl font-black brutal-text-shadow text-white bg-neo-black px-2 py-1 inline-block uppercase">
        {phase}
      </div>
      <div className="w-full border-4 border-neo-black h-6 bg-white mt-6 relative overflow-hidden">
        <div 
          className="bg-primary-crimson h-full border-r-4 border-neo-black transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
