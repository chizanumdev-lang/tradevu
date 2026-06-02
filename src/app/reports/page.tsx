'use client';
import { useEffect, useState, useMemo } from 'react';
import { Printer, ChevronLeft, TrendingUp, Users, DollarSign, Zap, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';

const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: '#64748b',
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, color }: { icon: any; title: string; color: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <h2 className="text-xl font-black text-slate-800">{title}</h2>
  </div>
);

const StatChip = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <span className="text-2xl font-black" style={{ color }}>{value}</span>
  </div>
);

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
  fontSize: '12px',
  fontWeight: 700,
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'correlations' | 'engineering'>('trends');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | 'all'>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  // Dynamically calculate the last 8 calendar weeks ending today
  const recentWeeks = useMemo(() => {
    const weeks = [];
    const current = new Date();
    
    // Find the previous Monday
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    const getISOWeek = (date: Date) => {
      const tempDate = new Date(date.valueOf());
      tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
      const yearStart = new Date(tempDate.getFullYear(), 0, 1);
      return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    for (let i = 0; i < 8; i++) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - (i * 7));
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      const label = `Week ${getISOWeek(start)} (${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      
      weeks.push({
        id: `${start.toISOString()}_${end.toISOString()}`,
        label,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
    }
    return weeks;
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = '/api/reports?module=all';
    
    if (selectedWeek !== 'all') {
      const [start, end] = selectedWeek.split('_');
      url += `&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
    }
    
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching weekly reports:', err);
        setLoading(false);
      });
  }, [selectedWeek]);

  // ── Build chronological time-series keyed by date ──────────────────
  const timeMap = new Map<string, any>();

  (data?.finance?.rawMetrics || []).forEach((m: any) => {
    const d = m.recorded_at?.split('T')[0];
    if (!d) return;
    if (!timeMap.has(d)) timeMap.set(d, { date: d });
    const entry = timeMap.get(d);
    const rate = m.historical_rate_to_usd || 1;
    const valUsd = (m.loan_value || 0) * rate;
    entry.loanValueUsd = (entry.loanValueUsd || 0) + valUsd;
    if (m.loan_type === 'Payables') entry.payables = (entry.payables || 0) + valUsd;
    if (m.loan_type === 'Receivables') entry.receivables = (entry.receivables || 0) + valUsd;
    if (m.loan_type === 'Payment') entry.payments = (entry.payments || 0) + valUsd;
  });

  (data?.sales || []).forEach((s: any) => {
    const d = s.recorded_at?.split('T')[0];
    if (!d) return;
    if (!timeMap.has(d)) timeMap.set(d, { date: d });
    const entry = timeMap.get(d);
    entry.leads = (entry.leads || 0) + (s.leads_generated || 0);
    entry.conversions = (entry.conversions || 0) + (s.conversions || 0);
  });

  (data?.pay || []).forEach((p: any) => {
    const d = p.recorded_at?.split('T')[0];
    if (!d) return;
    if (!timeMap.has(d)) timeMap.set(d, { date: d });
    const entry = timeMap.get(d);
    entry.payConversions = (entry.payConversions || 0) + (p.users_converted || 0);
    entry.payGoal = (entry.payGoal || 0) + (p.weekly_goal || 0);
    entry.lcyTransfers = (entry.lcyTransfers || 0) + (p.lcy_transfers || 0);
    entry.fcyTransfers = (entry.fcyTransfers || 0) + (p.fcy_transfers || 0);
  });

  const rawTimeSeries = Array.from(timeMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      convRate: d.leads > 0 ? +((d.conversions / d.leads) * 100).toFixed(1) : 0,
    }));

  // Dynamically filter timeSeries based on selected date range
  const timeSeries = useMemo(() => {
    if (dateFilter === 'all') return rawTimeSeries;

    const cutoffDate = new Date();
    if (dateFilter === '7d') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    } else if (dateFilter === '30d') {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    }

    // Set boundary to start of target day
    cutoffDate.setHours(0, 0, 0, 0);

    return rawTimeSeries.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  }, [rawTimeSeries, dateFilter]);

  // ── Correlation scatter data: Sales leads vs Loan value ─────────────
  const correlationData = timeSeries.filter(d => d.leads && d.loanValueUsd).map(d => ({
    x: d.leads,
    y: +(d.loanValueUsd / 1000).toFixed(1),
    z: d.convRate || 10,
  }));

  // ── Pay goal attainment trend ────────────────────────────────────────
  const payAttainment = timeSeries
    .filter(d => d.payGoal)
    .map(d => ({
      ...d,
      attainmentPct: d.payGoal > 0 ? +((d.payConversions / d.payGoal) * 100).toFixed(1) : 0,
    }));

  // ── Engineering projects ─────────────────────────────────────────────
  const engProjects = (data?.engineering?.projects || []).map((p: any) => ({
    name: p.name?.length > 18 ? p.name.slice(0, 18) + '…' : (p.name || 'Project'),
    completion: p.progress !== undefined ? p.progress : (p.completion_percentage || p.completion || 0),
    impact: p.impactScore !== undefined ? p.impactScore : (p.impact_score || 0),
  }));

  // ── Summary KPIs ─────────────────────────────────────────────────────
  const totalLoans = (data?.finance?.calculatedTotalsUsd?.total || 0);
  const totalLeads = timeSeries.reduce((s, d) => s + (d.leads || 0), 0);
  const avgConvRate = timeSeries.length
    ? (timeSeries.reduce((s, d) => s + (d.convRate || 0), 0) / timeSeries.length).toFixed(1)
    : '0';
  const totalTransfers = timeSeries.reduce((s, d) => s + (d.lcyTransfers || 0) + (d.fcyTransfers || 0), 0);

  const tabs = [
    { id: 'trends', label: 'Trendlines' },
    { id: 'correlations', label: 'Cross-Module Correlations' },
    { id: 'engineering', label: 'Engineering Impact' },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Activity size={28} className="text-white" />
          </div>
          <p className="text-slate-500 font-bold">Crunching historical data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-rose-500" />
          </div>
          <p className="text-slate-700 font-bold text-lg mb-2">Failed to load report</p>
          <p className="text-slate-400 font-medium text-sm mb-6">Could not fetch analytics data. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-10 py-6 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors">
              <ChevronLeft size={18} /> Back
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics Report</h1>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Generated {new Date(data.generatedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-end gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Database Week:</span>
                <select
                  id="weekFilterSelect"
                  value={selectedWeek}
                  onChange={(e: any) => setSelectedWeek(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-400 transition-colors cursor-pointer w-48"
                >
                  <option value="all">All Time Data</option>
                  {recentWeeks.map(w => (
                    <option key={w.id} value={w.id}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Display Period:</span>
                <select
                  id="dateFilterSelect"
                  value={dateFilter}
                  onChange={(e: any) => setDateFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-400 transition-colors cursor-pointer w-48"
                >
                  <option value="all">Full Range</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors h-fit self-center">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Loan Portfolio (USD)', value: `$${(totalLoans / 1000).toFixed(0)}K`, color: COLORS.emerald, icon: DollarSign },
            { label: 'Total Leads Generated', value: totalLeads.toLocaleString(), color: COLORS.blue, icon: TrendingUp },
            { label: 'Avg. Conversion Rate', value: `${avgConvRate}%`, color: COLORS.violet, icon: Users },
            { label: 'Total Pay Transfers', value: totalTransfers.toLocaleString(), color: COLORS.amber, icon: Zap },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex bg-white border border-slate-100 rounded-2xl p-1.5 gap-1 mb-8 w-fit shadow-sm print:hidden">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === t.id ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TRENDLINES TAB ── */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Loan Portfolio Over Time */}
            <Card>
              <SectionTitle icon={DollarSign} title="Loan Portfolio Breakdown Over Time (USD)" color={COLORS.emerald} />
              <div className="flex gap-8 mb-6">
                <StatChip label="Payables Trend" value={`$${((timeSeries.at(-1)?.payables || 0) / 1000).toFixed(0)}K`} color={COLORS.emerald} />
                <StatChip label="Receivables Trend" value={`$${((timeSeries.at(-1)?.receivables || 0) / 1000).toFixed(0)}K`} color={COLORS.blue} />
                <StatChip label="Payments Trend" value={`$${((timeSeries.at(-1)?.payments || 0) / 1000).toFixed(0)}K`} color={COLORS.violet} />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="payables" name="Payables" fill={`${COLORS.emerald}20`} stroke={COLORS.emerald} strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="receivables" name="Receivables" fill={`${COLORS.blue}20`} stroke={COLORS.blue} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="payments" name="Payments" stroke={COLORS.violet} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sales & Conversions */}
            <Card>
              <SectionTitle icon={TrendingUp} title="Sales Pipeline: Leads vs. Conversions Over Time" color={COLORS.blue} />
              <div className="flex gap-8 mb-6">
                <StatChip label="Latest Leads" value={(timeSeries.at(-1)?.leads || 0).toLocaleString()} color={COLORS.blue} />
                <StatChip label="Latest Conversions" value={(timeSeries.at(-1)?.conversions || 0).toString()} color={COLORS.violet} />
                <StatChip label="Latest Conv. Rate" value={`${timeSeries.at(-1)?.convRate || 0}%`} color={COLORS.emerald} />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar yAxisId="left" dataKey="leads" name="Leads" fill={`${COLORS.blue}30`} radius={[3,3,0,0]} maxBarSize={12} />
                    <Bar yAxisId="left" dataKey="conversions" name="Conversions" fill={COLORS.violet} radius={[3,3,0,0]} maxBarSize={12} />
                    <Line yAxisId="right" type="monotone" dataKey="convRate" name="Conv. Rate %" stroke={COLORS.emerald} strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pay Goal Attainment */}
            <Card>
              <SectionTitle icon={Zap} title="Pay Module: Goal Attainment Trend" color={COLORS.amber} />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={payAttainment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                    <ReferenceLine y={100} stroke={COLORS.rose} strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Target 100%', position: 'right', fontSize: 10, fill: COLORS.rose, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="attainmentPct" name="Goal Attainment %" fill={`${COLORS.amber}25`} stroke={COLORS.amber} strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="lcyTransfers" name="LCY Transfers" stroke={COLORS.slate} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── CORRELATIONS TAB ── */}
        {activeTab === 'correlations' && (
          <div className="space-y-6">
            {/* Sales → Loans Scatter */}
            <Card>
              <SectionTitle icon={Activity} title="Sales Leads vs. Loan Portfolio Size" color={COLORS.violet} />
              <p className="text-xs text-slate-400 font-bold mb-6 -mt-2">Each dot = one day. Bubble size = conversion rate. Shows whether higher sales activity correlates with larger loan books.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="x" name="Total Leads" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Total Leads', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis dataKey="y" name="Loan Value ($K)" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
                    <ZAxis dataKey="z" range={[60, 400]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n?: any) => [n === 'y' ? `$${v}K` : v, n === 'y' ? 'Loan Value' : n === 'x' ? 'Leads' : 'Conv. Rate %']} />
                    <Scatter name="Days" data={correlationData} fill={COLORS.violet} fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Loans Payables vs Receivables gap */}
            <Card>
              <SectionTitle icon={DollarSign} title="Payables vs. Receivables — Gap Analysis" color={COLORS.rose} />
              <p className="text-xs text-slate-400 font-bold mb-6 -mt-2">A positive gap (Receivables {'>'} Payables) indicates healthy cash flow. Negative gap signals liquidity risk.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar dataKey="receivables" name="Receivables" fill={COLORS.emerald} radius={[3,3,0,0]} maxBarSize={14} />
                    <Bar dataKey="payables" name="Payables" fill={COLORS.rose} radius={[3,3,0,0]} maxBarSize={14} />
                    <Line type="monotone" dataKey="payments" name="Payments Flow" stroke={COLORS.amber} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Conversion Rate vs Pay Activity */}
            <Card>
              <SectionTitle icon={Users} title="Sales Conversions vs. Pay Module Activity" color={COLORS.blue} />
              <p className="text-xs text-slate-400 font-bold mb-6 -mt-2">Are customers who convert from sales also activating Pay? This shows temporal alignment between the two modules.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar yAxisId="left" dataKey="payConversions" name="Pay Activations" fill={`${COLORS.blue}40`} radius={[3,3,0,0]} maxBarSize={14} />
                    <Line yAxisId="right" type="monotone" dataKey="convRate" name="Sales Conv. Rate %" stroke={COLORS.violet} strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── ENGINEERING TAB ── */}
        {activeTab === 'engineering' && (
          <div className="space-y-6">
            <Card>
              <SectionTitle icon={Zap} title="Engineering Projects: Completion vs. Business Impact" color={COLORS.violet} />
              <p className="text-xs text-slate-400 font-bold mb-6 -mt-2">
                {engProjects.length === 0
                  ? 'No engineering project data found. Add projects in the Admin Console to see impact analysis here.'
                  : 'Completion % vs estimated business impact score per project.'}
              </p>
              {engProjects.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={engProjects} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                      <Bar dataKey="completion" name="Completion %" fill={COLORS.violet} radius={[0,4,4,0]} maxBarSize={20} />
                      <Bar dataKey="impact" name="Impact Score %" fill={COLORS.emerald} radius={[0,4,4,0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <Zap size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">No engineering projects data yet</p>
                  </div>
                </div>
              )}
            </Card>

            {/* LCY vs FCY Transfers Over Time */}
            <Card>
              <SectionTitle icon={Activity} title="LCY vs. FCY Transfer Volume Over Time" color={COLORS.amber} />
              <p className="text-xs text-slate-400 font-bold mb-6 -mt-2">Local currency vs. foreign currency transfer trends — shows product adoption split between domestic and international users.</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="lcyTransfers" name="LCY Transfers" fill={`${COLORS.amber}25`} stroke={COLORS.amber} strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="fcyTransfers" name="FCY Transfers" fill={`${COLORS.blue}20`} stroke={COLORS.blue} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
