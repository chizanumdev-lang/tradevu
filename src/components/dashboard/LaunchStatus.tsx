'use client';

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
    if (allSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [allSlides.length]);

  const slide = allSlides[currentIndex];
  if (!slide) return null;

  return (
    <div className="card h-full flex flex-col relative group overflow-hidden">
      {editMode && onEdit && (
        <button 
          onClick={onEdit}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-transform z-[100] animate-in zoom-in"
        >
          <Edit2 size={14} />
        </button>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="section-label">Launch Readiness</div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${currentIndex === 0 ? 'bg-purple-100 text-purple-600' : 'bg-slate-50 text-slate-300'}`}>
          {slide.label || (currentIndex === 0 ? 'Current' : `Past ${currentIndex}`)}
        </div>
      </div>

      <div key={currentIndex} className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col flex-1">
        <h3 className="text-[22px] font-black text-slate-900 mb-4">{slide.phase} targets</h3>

        <div className="progress-track h-2.5 mb-8">
          <div 
            className={`progress-fill h-full transition-all duration-1000 ease-out ${currentIndex === 0 ? 'bg-[#8B5CF6]' : 'bg-primary'}`} 
            style={{ width: `${slide.progress}%` }} 
          />
        </div>


        <div className="flex flex-col gap-4 mt-auto mb-6">
          {slide.deptTargets.map((dept) => (
            <div key={dept.name} className="flex items-center gap-4">
              <span className="text-[13px] font-bold text-slate-600 w-28 truncate">{dept.name}</span>
              <div className="flex-1 progress-track h-1.5 bg-slate-50">
                <div 
                  className={`progress-fill h-full transition-all duration-1000 ease-out ${currentIndex === 0 ? 'bg-[#8B5CF6]' : 'bg-slate-300'}`} 
                  style={{ width: `${dept.progress}%` }} 
                />
              </div>
              <span className={`text-[12px] font-black w-8 text-right ${currentIndex === 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                {dept.progress}%
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Pagination Dots */}
      {allSlides.length > 1 && (
        <div className="flex gap-1.5 mt-auto pt-2">
          {allSlides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-6' : 'bg-slate-100 w-2'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

