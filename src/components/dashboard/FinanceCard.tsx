'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, Edit2, Landmark, Filter, DollarSign, Wallet, ArrowDownUp } from 'lucide-react';
import { FinanceData, LoanType, Currency } from '@/types/dashboard';

interface FinanceCardProps {
  data: FinanceData;
  editMode?: boolean;
  onEdit?: () => void;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ 
  data,
  editMode,
  onEdit
}) => {
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month'>('week');
  const [typeFilter, setTypeFilter] = useState<LoanType | 'All'>('All');
  const [currencyFilter, setCurrencyFilter] = useState<Currency | 'All'>('All');

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
      {editMode && onEdit && (
        <button 
          onClick={onEdit}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-transform z-10 animate-in zoom-in"
        >
          <Edit2 size={14} />
        </button>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Landmark size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-black text-slate-900 leading-none">Tradevu Finance</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Overview</span>
          </div>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={() => setPeriodFilter('week')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${periodFilter === 'week' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            WEEK
          </button>
          <button 
            onClick={() => setPeriodFilter('month')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${periodFilter === 'month' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            MONTH
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <ArrowDownUp size={12} className="text-slate-400" />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-transparent text-[11px] font-bold text-slate-600 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Payables">Payables</option>
            <option value="Receivables">Receivables</option>
            <option value="Payment">Payment</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Wallet size={12} className="text-slate-400" />
          <select 
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value as any)}
            className="bg-transparent text-[11px] font-bold text-slate-600 outline-none"
          >
            <option value="All">All CCY</option>
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="bg-gradient-to-br from-indigo-50/50 to-white p-4 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
             <Landmark size={80} />
          </div>
          <div className="text-[12px] font-bold text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={14} className="text-indigo-500" />
            Total Value (USD Equiv)
          </div>
          <div className="text-[32px] font-black text-slate-900 leading-none">
            ${totals.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Total Loans</div>
            <div className="text-[20px] font-black text-slate-900">
              {totals.count}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Avg Default</div>
            <div className="text-[20px] font-black text-slate-900">
              {totals.avgDefaultRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Computed using live exchange rates
        </div>
      </div>
    </div>
  );
};
