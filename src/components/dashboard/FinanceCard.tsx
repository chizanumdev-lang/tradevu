'use client';

import React, { useState, useMemo } from 'react';
import { Database, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FinanceData, LoanType, Currency } from '@/types/dashboard';

interface FinanceCardProps {
  data: FinanceData;
  editMode?: boolean;
  onEdit?: () => void;
}

/**
 * Compute WoW / MoM trend %.
 * Strategy: week bucket vs implied weekly avg from month bucket (monthVal / 4.33).
 *
 * @param weekVal   - value for the 'week' period
 * @param monthVal  - value for the 'month' period
 * @param activePeriod - which filter is currently selected
 * @param invertSign - set true when *lower* is *better* (e.g. default rate)
 */
function calcTrend(
  weekVal: number,
  monthVal: number,
  activePeriod: 'week' | 'month',
  invertSign = false
): number {
  let trend = 0;
  if (activePeriod === 'week') {
    const impliedWeek = monthVal > 0 ? monthVal / 4.33 : 0;
    trend = impliedWeek > 0 ? Math.round(((weekVal - impliedWeek) / impliedWeek) * 100) : 0;
  } else {
    const impliedMonth = weekVal > 0 ? weekVal * 4.33 : 0;
    trend = impliedMonth > 0 ? Math.round(((monthVal - impliedMonth) / impliedMonth) * 100) : 0;
  }
  return invertSign ? -trend : trend;
}

function TrendBadge({
  value,
  vsLabel,
}: {
  value: number;
  vsLabel: string;
}) {
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

/** Aggregate finance totals for a given period filter combo */
function aggregateTotals(
  metrics: FinanceData['metrics'],
  rates: Record<string, number>,
  period: 'week' | 'month',
  typeFilter: LoanType | 'All',
  currencyFilter: Currency | 'All'
) {
  let valueUsd = 0;
  let count = 0;
  let weightedDefault = 0;

  for (const m of metrics) {
    if (m.period !== period) continue;
    if (typeFilter !== 'All' && m.loanType !== typeFilter) continue;
    if (currencyFilter !== 'All' && m.currency !== currencyFilter) continue;

    const rate = rates[m.currency] ?? 1;
    const valUsd = m.loanValue * rate;
    valueUsd += valUsd;
    count += m.loanCount;
    weightedDefault += (m.defaultRate || 0) * valUsd;
  }

  return {
    valueUsd,
    count,
    avgDefaultRate: valueUsd > 0 ? weightedDefault / valueUsd : 0,
  };
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  data,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month'>('week');
  const [typeFilter, setTypeFilter] = useState<LoanType | 'All'>('All');
  const [currencyFilter, setCurrencyFilter] = useState<Currency | 'All'>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Exchange rates map
  const rates = useMemo(() => {
    const map: Record<string, number> = {};
    data?.exchangeRates?.forEach(r => { map[r.currency] = r.rateToUsd; });
    return map;
  }, [data?.exchangeRates]);

  // Active period totals (what the card currently shows)
  const active = useMemo(
    () => aggregateTotals(data?.metrics ?? [], rates, periodFilter, typeFilter, currencyFilter),
    [data?.metrics, rates, periodFilter, typeFilter, currencyFilter]
  );

  // Complementary period totals (used to compute the trend delta)
  const weekTotals = useMemo(
    () => aggregateTotals(data?.metrics ?? [], rates, 'week', typeFilter, currencyFilter),
    [data?.metrics, rates, typeFilter, currencyFilter]
  );
  const monthTotals = useMemo(
    () => aggregateTotals(data?.metrics ?? [], rates, 'month', typeFilter, currencyFilter),
    [data?.metrics, rates, typeFilter, currencyFilter]
  );

  const vsLabel = periodFilter === 'week' ? 'vs wk avg' : 'vs wk avg';

  // Trends
  const valueTrend       = calcTrend(weekTotals.valueUsd,       monthTotals.valueUsd,       periodFilter);
  const countTrend       = calcTrend(weekTotals.count,          monthTotals.count,          periodFilter);
  // For default rate: lower = better, so invert the sign so green = rate went down
  const defaultTrend     = calcTrend(weekTotals.avgDefaultRate, monthTotals.avgDefaultRate, periodFilter, true);

  if (!data) return null;

  return (
    <div className="card h-full flex flex-col relative group">
      {/* Header with Period Select */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-[#7C3AED] shrink-0">
            <Database size={20} />
          </div>
          <span className="text-[14px] font-black text-slate-900 leading-none whitespace-nowrap">Tradevu Finance</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 transition-all focus:outline-none whitespace-nowrap shrink-0"
          >
            <span>{periodFilter === 'week' ? 'This week' : 'This month'}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setPeriodFilter('week'); setIsDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${periodFilter === 'week' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This week
                </button>
                <button
                  onClick={() => { setPeriodFilter('month'); setIsDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${periodFilter === 'month' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This month
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side-by-side Dropdown Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#64748B]">Loan type</label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as LoanType | 'All')}
              className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium text-black focus:outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none cursor-pointer pr-10"
            >
              <option value="All">All</option>
              <option value="Payables">Payables</option>
              <option value="Receivables">Receivables</option>
              <option value="Payment">Payment</option>
            </select>
            <ChevronDown size={14} className="text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#64748B]">Currencies</label>
          <div className="relative">
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value as Currency | 'All')}
              className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium text-black focus:outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none cursor-pointer pr-10"
            >
              <option value="All">All</option>
              <option value="USD">$ USD</option>
              <option value="NGN">₦ NGN</option>
              <option value="USDT">₮ USDT</option>
              <option value="USDC">USDC</option>
            </select>
            <ChevronDown size={14} className="text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Metrics Stack */}
      <div className="flex-1 flex flex-col justify-between mt-2">
        {/* Loan Disbursement Value */}
        <div className="py-2.5">
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Loan disbursement value</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[22px] font-semibold text-black leading-none tracking-tight whitespace-nowrap">
              ~ ${active.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <TrendBadge value={valueTrend} vsLabel={vsLabel} />
          </div>
        </div>

        <div className="border-t border-[#F1F5F9] my-1" />

        {/* Loans Disbursed */}
        <div className="py-2.5">
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Loans disbursed</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[22px] font-semibold text-black leading-none tracking-tight whitespace-nowrap">
              {active.count}
            </div>
            <TrendBadge value={countTrend} vsLabel={vsLabel} />
          </div>
        </div>

        <div className="border-t border-[#F1F5F9] my-1" />

        {/* Default Rate — lower is better, so trend is inverted */}
        <div className="py-2.5">
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Default rate</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[22px] font-semibold text-black leading-none tracking-tight whitespace-nowrap">
              {active.avgDefaultRate.toFixed(0)}%
            </div>
            <TrendBadge value={defaultTrend} vsLabel={vsLabel} />
          </div>
        </div>
      </div>
    </div>
  );
};
