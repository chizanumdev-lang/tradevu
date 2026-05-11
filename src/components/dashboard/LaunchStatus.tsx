import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { LaunchStatus as LaunchStatusType } from '@/types/dashboard';

interface LaunchStatusProps {
  current: LaunchStatusType;
  history?: LaunchStatusType[];
  editMode?: boolean;
  onEdit?: () => void;
  title?: string;
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ 
  current, 
  history = [],
  editMode,
  onEdit,
}) => {
  const allSlides = [current, ...history];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [current, history.length]);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [allSlides.length]);

  const slide = allSlides[currentIndex];
  if (!slide) return null;

  return (
    <div className="card h-full flex flex-col relative group transition-all duration-500 overflow-hidden">
      {editMode && onEdit && (
        <button 
          onClick={onEdit}
          className="absolute -top-1 -right-1 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-transform z-20"
        >
          <Edit2 size={14} />
        </button>
      )}

      {/* Header Row */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
          QUARTERLY TARGETS
        </div>
        
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'bg-[#7C3AED]' 
                  : 'bg-[#E2E8F0]'
              }`} 
            />
          ))}
        </div>
      </div>

      <div key={currentIndex} className="animate-in fade-in slide-in-from-right-2 duration-500 flex flex-col flex-1">
        <h3 className="text-[28px] font-bold text-[#0F172A] mb-4 tracking-tight leading-none">
          {slide.phase} targets
        </h3>

        {/* Main Progress Bar */}
        <div className="progress-track h-[6px] mb-12 bg-[#F1F5F9]">
          <div 
            className={`progress-fill h-full transition-all duration-1000 ${currentIndex === 0 ? 'bg-[#7C3AED]' : 'bg-[#94A3B8]'}`} 
            style={{ width: `${slide.progress || 64}%` }} 
          />
        </div>

        {/* Sub Metrics */}
        <div className="flex flex-col gap-6 mt-auto">
          {slide.deptTargets.map((dept) => (
            <div key={dept.name} className="flex items-center gap-6">
              <span className="text-[17px] font-semibold text-[#0F172A] w-[110px] shrink-0">
                {dept.name}
              </span>
              <div className="flex-1 progress-track h-[7px] bg-[#F1F5F9]">
                <div 
                  className={`progress-fill h-full transition-all duration-1000 ${currentIndex === 0 ? 'bg-[#7C3AED]' : 'bg-[#94A3B8]'}`} 
                  style={{ width: `${dept.progress}%` }} 
                />
              </div>
              <span className="text-[16px] font-semibold text-[#94A3B8] w-[45px] text-right">
                {dept.progress}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

