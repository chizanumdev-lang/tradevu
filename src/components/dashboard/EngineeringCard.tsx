import React from 'react';
import { Terminal, CheckCircle2, Clock, Edit2 } from 'lucide-react';

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
  scrollSpeed?: number;
  scrollEnabled?: boolean;
}

export const EngineeringCard: React.FC<EngineeringCardProps> = ({
  projects,
  health,
  editMode,
  onEdit,
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
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Terminal size={20} />
        </div>
        <span className="text-[18px] font-black text-slate-900 leading-none">Engineering</span>
      </div>

      {/* Project statuses */}
      <div
        ref={scrollRef}
        className="space-y-6 flex-1 max-h-[160px] overflow-y-auto no-scrollbar"
      >
        {projects.map((project, idx) => (
          <div key={idx} className="flex justify-between items-start pt-4 border-t border-slate-50 first:border-t-0 first:pt-0">
            <div className="space-y-2">
              <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{project.title}</div>
              <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
                {project.status === 'Live'
                  ? <CheckCircle2 size={16} className="text-mint-dark" />
                  : <Clock size={16} className="text-amber-500" />
                }
                <span>{project.status}</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {project.dateLabel}
              </div>
              <div className="text-[13px] font-bold text-slate-500">{project.dateValue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="mt-auto pt-6 border-t border-slate-50">
        <div className="section-label mb-5 uppercase tracking-widest text-[11px] font-black text-slate-400">System Health</div>
        <div className="space-y-4">
          {health.map((item) => (
            <div key={item.label} className="flex justify-between items-baseline">
              <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <span className={`text-[18px] font-black ${item.isGood ? 'text-mint-dark' : 'text-slate-900'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
