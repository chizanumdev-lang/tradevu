import React from 'react';
import { Terminal, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Project {
  title: string;
  status: 'Live' | 'In Development' | 'Testing' | 'Blocked';
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
  scrollSpeed?: number;
  scrollEnabled?: boolean;
}

export const EngineeringCard: React.FC<EngineeringCardProps> = ({
  projects,
  health,
  scrollSpeed = 8,
  scrollEnabled = true
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el || projects.length <= 2 || !scrollEnabled) return;

    let animationId: number;
    let lastTime = 0;
    let currentScroll = el.scrollTop;
    const speed = scrollSpeed;

    const animate = (time: number) => {
      if (!lastTime) {
        lastTime = time;
        animationId = requestAnimationFrame(animate);
        return;
      }
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      currentScroll += speed * delta;

      if (currentScroll + el.clientHeight >= el.scrollHeight) {
        currentScroll = 0;
      }
      
      el.scrollTop = currentScroll;
      animationId = requestAnimationFrame(animate);
    };

    const startTimeout = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 2000);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationId);
    };
  }, [projects, scrollSpeed, scrollEnabled]);

  return (
    <div className="card h-full flex flex-col relative group">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
          <Terminal size={20} />
        </div>
        <span className="text-[14px] font-black text-slate-900 leading-none whitespace-nowrap">Engineering</span>
      </div>

      {/* Project statuses */}
      <div
        ref={scrollRef}
        className="space-y-5 flex-1 max-h-[220px] overflow-y-auto no-scrollbar"
      >
        {projects.map((project, idx) => (
          <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0">
            <div className="space-y-1">
              <div className="text-[12px] font-extrabold text-slate-800 tracking-tight leading-tight">{project.title}</div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                {project.status === 'Live' ? (
                  <CheckCircle2 size={13} className="text-emerald-500" strokeWidth={3} />
                ) : project.status === 'Blocked' ? (
                  <AlertCircle size={13} className="text-rose-500" strokeWidth={3} />
                ) : (
                  <Clock size={13} className="text-amber-500" strokeWidth={3} />
                )}
                <span className={
                  project.status === 'Live' ? 'text-emerald-500' :
                  project.status === 'Blocked' ? 'text-rose-500' :
                  'text-amber-500'
                }>{project.status}</span>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">
                {project.dateLabel}
              </div>
              <div className="text-[12px] font-extrabold text-slate-500 leading-none mt-1">{project.dateValue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="mb-4 uppercase tracking-widest text-[10px] font-bold text-slate-400 whitespace-nowrap">System Health</div>
        <div className="space-y-4">
          {health.map((item) => (
            <div key={item.label} className="flex justify-between items-baseline py-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{item.label}</span>
              <span className={`text-[16px] font-black ${item.isGood ? 'text-emerald-500' : 'text-slate-900'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

