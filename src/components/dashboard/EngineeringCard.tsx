'use client';

import React from 'react';
import { Activity, CheckCircle2, Clock, Edit2 } from 'lucide-react';

interface Project {
  title: string;
  status: 'Live' | 'In Development' | 'Testing';
  dateLabel: string;
  dateValue: string;
}

interface HealthMetric {
  label: string;
  value: string;
  isGood: boolean;
}

interface EngineeringCardProps {
  projects: Project[];
  health: HealthMetric[];
  editMode?: boolean;
  onEdit?: () => void;
}

export const EngineeringCard: React.FC<EngineeringCardProps> = ({ 
  projects, 
  health,
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
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Activity size={18} />
        </div>
        <span className="text-[17px] font-extrabold text-slate-800">Engineering</span>
      </div>

      {/* Project statuses */}
      <div className="space-y-7 flex-1">
        {projects.map((project) => (
          <div key={project.title} className="flex justify-between items-start">
            <div>
              <div className="text-[14px] font-semibold text-slate-400 mb-2">{project.title}</div>
              <div className={project.status === 'Live' ? 'badge-live' : 'badge-dev'}>
                {project.status === 'Live'
                  ? <CheckCircle2 size={16} />
                  : <Clock size={16} />
                }
                {project.status}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                {project.dateLabel}
              </div>
              <div className="text-[14px] font-black text-slate-700">{project.dateValue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="section-label mb-4">System Health</div>
        <div className="space-y-3">
          {health.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[15px] font-semibold text-slate-700">{item.label}</span>
              <span className={`text-[15px] font-black ${item.isGood ? 'text-mint-dark' : 'text-slate-800'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
