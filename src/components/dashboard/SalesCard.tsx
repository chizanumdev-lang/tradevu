import React, { useState } from 'react';
import { ShoppingCart, Edit2 } from 'lucide-react';
import { SalesMarketingMetric } from '@/types/dashboard';

interface SalesCardProps {
  metrics: SalesMarketingMetric[];
  userRole?: string;
  editMode?: boolean;
  onEdit?: () => void;
}

export const SalesCard: React.FC<SalesCardProps> = ({
  metrics,
  userRole,
  editMode,
  onEdit,
}) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [touchpointFilter, setTouchpointFilter] = useState<'all' | 'LinkedIn' | 'Website' | 'X'>('all');

  // Aggregate by touchpoint to handle multiple historical rows per touchpoint
  const aggregatedMap = new Map<string, { touchpoint: string; leadsGenerated: number; conversions: number }>();
  for (const m of metrics) {
    if (m.period !== timeFilter) continue;
    if (touchpointFilter !== 'all' && m.touchpoint !== touchpointFilter) continue;
    const existing = aggregatedMap.get(m.touchpoint);
    if (existing) {
      existing.leadsGenerated += m.leadsGenerated;
      existing.conversions += m.conversions;
    } else {
      aggregatedMap.set(m.touchpoint, { touchpoint: m.touchpoint, leadsGenerated: m.leadsGenerated, conversions: m.conversions });
    }
  }
  const filteredMetrics = Array.from(aggregatedMap.values());

  const totalLeads = filteredMetrics.reduce((sum, m) => sum + m.leadsGenerated, 0);
  const totalConversions = filteredMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const conversionRate = totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0;

  const canEdit = userRole === 'CEO' || userRole === 'MARKETING';

  return (
    <div className="card h-full flex flex-col relative group">
      {editMode && onEdit && canEdit && (
        <button 
          onClick={onEdit}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-transform z-10 animate-in zoom-in"
        >
          <Edit2 size={14} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
            <ShoppingCart size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-black text-slate-900 leading-none">Tradevu Sales</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Marketing</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${timeFilter === 'week' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${timeFilter === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            This Month
          </button>
        </div>

        <select 
          value={touchpointFilter}
          onChange={(e) => setTouchpointFilter(e.target.value as any)}
          className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 focus:outline-none border-none cursor-pointer"
        >
          <option value="all">All Touchpoints</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Website">Website</option>
          <option value="X">X</option>
        </select>
      </div>

      {/* Main Metrics */}
      <div className="space-y-6">
        <div>
          <div className="text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Leads Generated</div>
          <div className="text-[32px] font-black text-slate-900 leading-none">{totalLeads}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div>
            <div className="text-[12px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Conversions</div>
            <div className="text-[28px] font-black text-slate-900 leading-none">{totalConversions}</div>
          </div>
          <div>
            <div className="text-[12px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Conv. Rate</div>
            <div className="text-[28px] font-black text-primary leading-none">{conversionRate}%</div>
          </div>
        </div>
      </div>

      {/* Touchpoint Breakdown if 'all' is selected */}
      {touchpointFilter === 'all' && (
        <div className="mt-auto pt-6 space-y-3">
          {filteredMetrics.map(m => (
            <div key={m.touchpoint} className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-widest">{m.touchpoint}</span>
              <span className="text-slate-900">{m.conversions} conv. ({m.leadsGenerated} leads)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
