import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { LaunchStatus as LaunchStatusType } from '@/types/dashboard';

interface LaunchStatusProps {
  current: LaunchStatusType;
  history?: LaunchStatusType[];
  editMode?: boolean;
  onEdit?: () => void;
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ 
  current, 
  history = [],
  editMode,
  onEdit
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
    }, 10000); // Slower cycle
    return () => clearInterval(interval);
  }, [allSlides.length]);

  const slide = allSlides[currentIndex];
  if (!slide) return null;

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

      <div className="section-label mb-8 uppercase tracking-widest text-[12px] font-bold text-slate-400">Quarterly Targets</div>

      <div key={currentIndex} className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col flex-1">
        <h3 className="text-[24px] font-black text-slate-900 mb-6">{slide.phase} targets</h3>

        <div className="progress-track h-2 mb-10 bg-slate-50">
          <div 
            className="progress-fill h-full bg-[#7C3AED] transition-all duration-1000 ease-out" 
            style={{ width: `${slide.progress}%` }} 
          />
        </div>

        <div className="flex flex-col gap-6 mt-auto mb-4">
          {slide.deptTargets.map((dept) => (
            <div key={dept.name} className="flex items-center gap-4">
              <span className="text-[13px] font-bold text-slate-600 w-24 uppercase tracking-tight">{dept.name}</span>
              <div className="flex-1 progress-track h-1.5 bg-slate-50">
                <div 
                  className="progress-fill h-full bg-[#7C3AED] transition-all duration-1000 ease-out" 
                  style={{ width: `${dept.progress}%` }} 
                />
              </div>
              <span className="text-[12px] font-black w-8 text-right text-slate-400">
                {dept.progress}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {allSlides.length > 1 && (
        <div className="flex gap-1.5 mt-auto pt-4">
          {allSlides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#7C3AED] w-6' : 'bg-slate-100 w-2'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

