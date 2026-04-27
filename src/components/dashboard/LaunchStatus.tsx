'use client';

import React from 'react';
import { Edit2 } from 'lucide-react';

interface DeptTarget {
  name: string;
  progress: number;
}

interface LaunchStatusProps {
  phase: string;
  overallProgress: number;
  deptTargets: DeptTarget[];
  editMode?: boolean;
  onEdit?: () => void;
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ 
  phase, 
  overallProgress, 
  deptTargets,
  editMode,
  onEdit
}) => {
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
      
      <div className="section-label mb-4">Launch Readiness</div>

      <h3 className="text-[22px] font-black text-slate-900 mb-4">{phase} targets</h3>

      <div className="progress-track h-2.5 mb-8">
        <div className="progress-fill h-full" style={{ width: `${overallProgress}%` }} />
      </div>

      <div className="flex flex-col gap-5 mt-auto">
        {deptTargets.map((dept) => (
          <div key={dept.name} className="flex items-center gap-4">
            <span className="text-[15px] font-semibold text-slate-700 w-28">{dept.name}</span>
            <div className="flex-1 progress-track h-1.5">
              <div className="progress-fill h-full" style={{ width: `${dept.progress}%` }} />
            </div>
            <span className="text-[13px] font-bold text-slate-400 w-8 text-right">{dept.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
