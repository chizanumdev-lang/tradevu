'use client';

import React from 'react';

interface DeptTarget {
  name: string;
  progress: number;
}

interface LaunchStatusProps {
  phase: string;
  overallProgress: number;
  deptTargets: DeptTarget[];
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ phase, overallProgress, deptTargets }) => {
  return (
    <div className="card h-full flex flex-col">
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
