import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { LaunchStatus as LaunchStatusType } from '@/types/dashboard';

interface LaunchStatusProps {
  current: LaunchStatusType;
  history?: LaunchStatusType[];
  editMode?: boolean;
  onEdit?: (dept?: string) => void;
  title?: string;
  userRole?: string;
  userEmail?: string;
  departments?: { name: string; headEmail: string }[];
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ 
  current, 
  history = [],
  editMode,
  onEdit,
  userRole,
  userEmail,
  departments
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
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, [allSlides.length]);

  const slide = allSlides[currentIndex];
  if (!slide) return null;

  return (
    <div className="card h-full flex flex-col relative group transition-all duration-500 overflow-hidden">
      {editMode && onEdit && userRole === 'CEO' && (
        <button 
          onClick={() => onEdit()}
          className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-20 animate-in zoom-in"
        >
          <Edit2 size={14} />
        </button>
      )}

      {/* Header Row */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] whitespace-nowrap">
          QUARTERLY TARGETS
        </div>
        
        <div className="flex gap-2">
          {allSlides.slice(0, 3).map((_, i) => (
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
          {slide.deptTargets.map((dept) => {
            const isDeptHead = departments?.find(d => d.name === dept.name)?.headEmail === userEmail;
            const canEditThisDept = userRole === 'CEO' || isDeptHead;

            return (
              <div key={dept.name} className="flex items-center gap-6 group/dept">
                <span className="text-[17px] font-semibold text-[#0F172A] w-[110px] shrink-0">
                  {dept.name}
                </span>
                <div className="flex-1 progress-track h-[7px] bg-[#F1F5F9] relative">
                  <div 
                    className={`progress-fill h-full transition-all duration-1000 ${currentIndex === 0 ? 'bg-[#7C3AED]' : 'bg-[#94A3B8]'}`} 
                    style={{ width: `${dept.progress}%` }} 
                  />
                  {editMode && onEdit && canEditThisDept && (
                    <button 
                      onClick={() => onEdit(dept.name)}
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-primary shadow-sm opacity-0 group-hover/dept:opacity-100 transition-opacity z-10"
                    >
                      <Edit2 size={10} />
                    </button>
                  )}
                </div>
                <span className="text-[16px] font-semibold text-[#94A3B8] w-[45px] text-right">
                  {dept.progress}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

