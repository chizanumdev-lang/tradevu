'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingCart, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SalesMarketingMetric } from '@/types/dashboard';

interface SalesCardProps {
  metrics: SalesMarketingMetric[];
  userRole?: string;
  editMode?: boolean;
  onEdit?: () => void;
}

/** Compute period totals (leads + conversions) for a given period key */
function periodTotals(metrics: SalesMarketingMetric[], period: 'week' | 'month') {
  let leads = 0;
  let conversions = 0;
  for (const m of metrics) {
    if (m.period !== period) continue;
    leads += m.leadsGenerated;
    conversions += m.conversions;
  }
  return { leads, conversions };
}

/**
 * Compute WoW % change for a metric.
 *
 * Strategy: we have one `week` bucket and one `month` bucket.
 * The implied average week within a month = monthValue / 4.33 (avg weeks/mo).
 * WoW = (weekValue / impliedWeek - 1) * 100
 *
 * If switching to month view, compare month vs (week * 4.33) as baseline.
 */
function calcTrend(weekVal: number, monthVal: number, activeFilter: 'week' | 'month'): number {
  if (activeFilter === 'week') {
    const impliedWeek = monthVal > 0 ? monthVal / 4.33 : 0;
    if (impliedWeek === 0) return 0;
    return Math.round(((weekVal - impliedWeek) / impliedWeek) * 100);
  } else {
    const impliedMonth = weekVal > 0 ? weekVal * 4.33 : 0;
    if (impliedMonth === 0) return 0;
    return Math.round(((monthVal - impliedMonth) / impliedMonth) * 100);
  }
}

function TrendBadge({ value, vsLabel }: { value: number; vsLabel: string }) {
  const isPos = value > 0;
  const isNeg = value < 0;
  const color = isPos ? '#10B981' : isNeg ? '#EF4444' : '#94A3B8';
  const label = isPos ? `+${value}%` : value === 0 ? '0%' : `${value}%`;
  const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
  return (
    <div className="flex items-center gap-1 text-[13px] whitespace-nowrap shrink-0">
      <Icon size={16} style={{ color }} className="shrink-0" strokeWidth={2.5} />
      <span style={{ color }} className="font-semibold">{label}</span>
      <span className="text-[#64748B]">{vsLabel}</span>
    </div>
  );
}

export const SalesCard: React.FC<SalesCardProps> = ({
  metrics,
}) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Aggregate by touchpoint for the active filter
  const aggregatedMap = new Map<string, { touchpoint: string; leadsGenerated: number; conversions: number }>();
  for (const m of metrics) {
    if (m.period !== timeFilter) continue;
    const existing = aggregatedMap.get(m.touchpoint);
    if (existing) {
      existing.leadsGenerated += m.leadsGenerated;
      existing.conversions += m.conversions;
    } else {
      aggregatedMap.set(m.touchpoint, {
        touchpoint: m.touchpoint,
        leadsGenerated: m.leadsGenerated,
        conversions: m.conversions
      });
    }
  }
  const filteredMetrics = Array.from(aggregatedMap.values());

  const weekTotals  = useMemo(() => periodTotals(metrics, 'week'),  [metrics]);
  const monthTotals = useMemo(() => periodTotals(metrics, 'month'), [metrics]);

  const totalLeads       = timeFilter === 'week' ? weekTotals.leads       : monthTotals.leads;
  const totalConversions = timeFilter === 'week' ? weekTotals.conversions : monthTotals.conversions;
  const conversionRate   = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

  // Goals: use actual data from month row as a proxy for goal if available
  const leadsGoal = timeFilter === 'week'
    ? (monthTotals.leads > 0 ? Math.round(monthTotals.leads / 4.33) : 0)
    : (monthTotals.leads > 0 ? monthTotals.leads : 0);
  const progress = leadsGoal > 0 ? Math.min(Math.round((totalLeads / leadsGoal) * 100), 100) : 0;

  // WoW / MoM trend for conversions
  const conversionTrend = calcTrend(weekTotals.conversions, monthTotals.conversions, timeFilter);
  const vsLabel = timeFilter === 'week' ? 'vs wk avg' : 'vs wk avg';

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm flex flex-col relative group h-full justify-between">
      {/* Header with inline dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-[#7C3AED] shrink-0">
            <ShoppingCart size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-slate-900 leading-none whitespace-nowrap">Tradevu Sales</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 whitespace-nowrap">Marketing</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 transition-all focus:outline-none whitespace-nowrap shrink-0"
          >
            <span>{timeFilter === 'week' ? 'This week' : 'This month'}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setTimeFilter('week'); setIsDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${timeFilter === 'week' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This week
                </button>
                <button
                  onClick={() => { setTimeFilter('month'); setIsDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${timeFilter === 'month' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This month
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leads Generated Section */}
      <div className="mb-5">
        <div className="text-[13px] font-medium text-[#64748B] mb-2">Leads Generated</div>
        <div className="flex items-baseline gap-1.5 mb-3.5">
          <span className="text-[26px] font-semibold text-black leading-none">{totalLeads}</span>
          <span className="text-[16px] font-medium text-[#94A3B8]">/ {leadsGoal}</span>
        </div>
        <div className="h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full bg-[#7C3AED] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F1F5F9] my-1" />

      {/* Grid of conversions and rate */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div>
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Conversions</div>
          <div className="text-[26px] font-semibold text-black leading-none">{totalConversions}</div>
          <div className="mt-2">
            <TrendBadge value={conversionTrend} vsLabel={vsLabel} />
          </div>
        </div>
        <div>
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Conversion Rate</div>
          <div className="text-[26px] font-semibold text-[#7C3AED] leading-none">
            {conversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F1F5F9] my-1" />

      {/* Touchpoint Breakdown */}
      <div className="pt-4 space-y-3.5">
        {filteredMetrics.map(m => (
          <div
            key={m.touchpoint}
            className="flex justify-between items-center text-[13px] font-medium relative group/row py-0.5 cursor-help"
          >
            <span className="text-[#64748B]">
              {m.touchpoint === 'X' ? 'X(Twitter)' : m.touchpoint}
            </span>
            <span className="text-black font-semibold">
              {m.conversions} <span className="text-[#94A3B8] font-medium">({m.leadsGenerated})</span>
            </span>

            {/* Custom Tooltip */}
            <div className="opacity-0 pointer-events-none group-hover/row:opacity-100 absolute -top-8 right-0 bg-slate-950 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl transition-all duration-150 whitespace-nowrap z-30 font-black tracking-wide">
              {m.conversions} conversions, {m.leadsGenerated} leads
              <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-950 rotate-45" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
