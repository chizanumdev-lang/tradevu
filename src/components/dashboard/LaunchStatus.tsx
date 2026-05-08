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
    }, 15000); // Increased duration to 15s
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

      {/* Circular Phase Badge & Pagination (Top Right) */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-3">
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[14px] font-black text-slate-900">{slide.phase}</span>
        </div>
        
        {/* Pagination Circles */}
        {allSlides.length > 1 && (
          <div className="flex gap-1.5">
            {allSlides.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#7C3AED] scale-125' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        )}
      </div>

      <div key={currentIndex} className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col flex-1">
        <h3 className="text-[24px] font-black text-slate-900 mb-6">Launch Readiness</h3>

        <div className="progress-track h-2 mb-10 bg-slate-50">
          <div 
            className={`progress-fill h-full transition-all duration-1000 ease-out ${currentIndex === 0 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} 
            style={{ width: `${slide.progress}%` }} 
          />
        </div>

        <div className="flex flex-col gap-6 mt-auto mb-4">
          {slide.deptTargets.map((dept) => (
            <div key={dept.name} className="flex items-center gap-4">
              <span className="text-[13px] font-bold text-slate-600 w-24 uppercase tracking-tight">{dept.name}</span>
              <div className="flex-1 progress-track h-1.5 bg-slate-50">
                <div 
                  className={`progress-fill h-full transition-all duration-1000 ease-out ${currentIndex === 0 ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} 
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


    </div>
  );
};

