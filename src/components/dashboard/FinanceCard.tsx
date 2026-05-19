'use client';

import React, { useState, useMemo } from 'react';
import { Database, ChevronDown, TrendingUp } from 'lucide-react';
import { FinanceData, LoanType, Currency } from '@/types/dashboard';

interface FinanceCardProps {
  data: FinanceData;
  editMode?: boolean;
  onEdit?: () => void;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ 
  data,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month'>('week');
  const [typeFilter, setTypeFilter] = useState<LoanType | 'All'>('All');
  const [currencyFilter, setCurrencyFilter] = useState<Currency | 'All'>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Exchange rates mapping
  const rates = useMemo(() => {
    const map: Record<string, number> = {};
    if (data?.exchangeRates) {
      data.exchangeRates.forEach(r => {
        map[r.currency] = r.rateToUsd;
      });
    }
    return map;
  }, [data?.exchangeRates]);

  // Compute filtered totals in USD
  const filteredMetrics = useMemo(() => {
    if (!data?.metrics) return [];
    return data.metrics.filter(m => {
      const matchPeriod = m.period === periodFilter;
      const matchType = typeFilter === 'All' || m.loanType === typeFilter;
      const matchCurrency = currencyFilter === 'All' || m.currency === currencyFilter;
      return matchPeriod && matchType && matchCurrency;
    });
  }, [data?.metrics, periodFilter, typeFilter, currencyFilter]);

  const totals = useMemo(() => {
    let valueUsd = 0;
    let count = 0;
    let weightedDefault = 0;

    filteredMetrics.forEach(m => {
      const rate = rates[m.currency] || 1;
      const valUsd = m.loanValue * rate;
      valueUsd += valUsd;
      count += m.loanCount;
      weightedDefault += (m.defaultRate || 0) * valUsd;
    });

    return {
      valueUsd,
      count,
      avgDefaultRate: valueUsd > 0 ? weightedDefault / valueUsd : 0
    };
  }, [filteredMetrics, rates]);

  if (!data) return null;

  return (
    <div className="card h-full flex flex-col relative group">
      {/* Header with Period Select to match Sales/Pay/Engineering exactly */}
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
                  onClick={() => {
                    setPeriodFilter('week');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase transition-colors ${periodFilter === 'week' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  This week
                </button>
                <button
                  onClick={() => {
                    setPeriodFilter('month');
                    setIsDropdownOpen(false);
                  }}
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
              onChange={(e) => setTypeFilter(e.target.value as any)}
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
              onChange={(e) => setCurrencyFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium text-black focus:outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none cursor-pointer pr-10"
            >
              <option value="All">All</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="NGN">🇳🇬 NGN</option>
              <option value="USDT">🪙 USDT</option>
              <option value="USDC">🪙 USDC</option>
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
              ~ ${totals.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 text-[13px] whitespace-nowrap shrink-0">
              <TrendingUp size={16} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
              <span className="text-[#10B981] font-semibold">+25%</span>
              <span className="text-[#64748B]">vs last week</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F1F5F9] my-1" />

        {/* Loans Disbursed */}
        <div className="py-2.5">
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Loans disbursed</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[22px] font-semibold text-black leading-none tracking-tight whitespace-nowrap">
              {totals.count}
            </div>
            <div className="flex items-center gap-1 text-[13px] whitespace-nowrap shrink-0">
              <TrendingUp size={16} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
              <span className="text-[#10B981] font-semibold">+25%</span>
              <span className="text-[#64748B]">vs last week</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F1F5F9] my-1" />

        {/* Default Rate */}
        <div className="py-2.5">
          <div className="text-[13px] font-medium text-[#64748B] mb-2">Default rate</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[22px] font-semibold text-black leading-none tracking-tight whitespace-nowrap">
              {totals.avgDefaultRate.toFixed(0)}%
            </div>
            <div className="flex items-center gap-1 text-[13px] whitespace-nowrap shrink-0">
              <TrendingUp size={16} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
              <span className="text-[#10B981] font-semibold">+25%</span>
              <span className="text-[#64748B]">vs last week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
