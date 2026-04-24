'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, ChevronRight } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    // In a real app, this would be a POST to the specific endpoint
    console.log(`Saving ${section}:`, data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    alert(`${section} updated successfully!`);
  };

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-4xl font-black animate-pulse uppercase italic">Loading Admin...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8 md:p-12 font-body text-neo-black">
      <header className="mb-16 border-b-8 border-neo-black pb-8 flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-8xl font-black uppercase italic tracking-tighter leading-none">
            Metrics <span className="text-primary-blue">Input</span>
          </h1>
          <p className="text-xl font-black mt-4 uppercase text-primary-crimson">Internal Control Panel v1.0</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="border-4 border-neo-black p-4 bg-primary-yellow hover:bg-white transition-colors shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <RefreshCcw size={32} strokeWidth={3} />
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Growth & Revenue Section */}
        <section className="border-4 border-neo-black p-8 shadow-neo bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary-yellow border-l-4 border-b-4 border-neo-black px-4 py-1 text-xs font-black uppercase">Section 01</div>
          <h2 className="font-h2 text-4xl font-black uppercase mb-12 flex items-center gap-4">
            <span className="w-12 h-12 bg-primary-yellow border-4 border-neo-black inline-flex items-center justify-center text-xl italic">G</span>
            Growth & Revenue
          </h2>

          <div className="space-y-12">
            {/* Monthly Customers */}
            <div>
              <h3 className="text-xs font-black uppercase text-primary-crimson mb-4 tracking-widest">Monthly Customers</h3>
              <div className="grid grid-cols-2 gap-6">
                <InputGroup 
                  label="Current Count" 
                  value={metrics.customersMonthly.current} 
                  onChange={(v) => setMetrics({...metrics, customersMonthly: {...metrics.customersMonthly, current: v}})}
                />
                <InputGroup 
                  label="Previous Count" 
                  value={metrics.customersMonthly.previous}
                  onChange={(v) => setMetrics({...metrics, customersMonthly: {...metrics.customersMonthly, previous: v}})}
                />
              </div>
            </div>

            {/* Total Overview */}
            <div>
              <h3 className="text-xs font-black uppercase text-primary-crimson mb-4 tracking-widest">Customer Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <InputGroup 
                  label="Total" 
                  value={metrics.customersOverview.totalCustomers}
                  onChange={(v) => setMetrics({...metrics, customersOverview: {...metrics.customersOverview, totalCustomers: v}})}
                />
                <InputGroup 
                  label="Verified" 
                  value={metrics.customersOverview.verifiedUsers}
                  onChange={(v) => setMetrics({...metrics, customersOverview: {...metrics.customersOverview, verifiedUsers: v}})}
                />
                <InputGroup 
                  label="Active Trial" 
                  value={metrics.customersOverview.activeTrialUsers}
                  onChange={(v) => setMetrics({...metrics, customersOverview: {...metrics.customersOverview, activeTrialUsers: v}})}
                />
              </div>
            </div>

            {/* Revenue */}
            <div>
              <h3 className="text-xs font-black uppercase text-primary-crimson mb-4 tracking-widest">Annual Revenue ($)</h3>
              <div className="grid grid-cols-2 gap-6">
                <InputGroup 
                  label="Goal" 
                  value={metrics.revenueAnnual.goal}
                  onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, goal: v}})}
                />
                <InputGroup 
                  label="Current" 
                  value={metrics.revenueAnnual.current}
                  onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, current: v}})}
                />
              </div>
            </div>

            <button 
              onClick={() => handleSave('Growth & Revenue', {
                monthly: metrics.customersMonthly,
                overview: metrics.customersOverview,
                revenue: metrics.revenueAnnual
              })}
              disabled={saving}
              className="w-full border-4 border-neo-black py-6 bg-primary-blue text-white font-black uppercase text-2xl shadow-neo hover:bg-primary-crimson transition-colors flex items-center justify-center gap-4 disabled:bg-gray-400"
            >
              {saving ? 'UPDATING...' : 'PUSH TO PRODUCTION'} <Save size={24} />
            </button>
          </div>
        </section>

        {/* Operational Section */}
        <section className="border-4 border-neo-black p-8 shadow-neo bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary-blue text-white border-l-4 border-b-4 border-neo-black px-4 py-1 text-xs font-black uppercase">Section 02</div>
          <h2 className="font-h2 text-4xl font-black uppercase mb-12 flex items-center gap-4">
            <span className="w-12 h-12 bg-primary-blue text-white border-4 border-neo-black inline-flex items-center justify-center text-xl italic">O</span>
            Operational Health
          </h2>

          <div className="space-y-12">
            {/* Launch Status */}
            <div>
              <h3 className="text-xs font-black uppercase text-primary-crimson mb-4 tracking-widest">Launch Readiness</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Current Phase</label>
                  <select 
                    value={metrics.launchStatus.phase}
                    onChange={(e) => setMetrics({...metrics, launchStatus: {...metrics.launchStatus, phase: e.target.value}})}
                    className="border-4 border-neo-black p-3 font-black focus:outline-none focus:bg-primary-yellow"
                  >
                    <option>Pre-Alpha</option>
                    <option>Alpha</option>
                    <option>Private Beta</option>
                    <option>Public Beta</option>
                    <option>Production Ready</option>
                  </select>
                </div>
                <InputGroup 
                  label="Progress (%)" 
                  value={metrics.launchStatus.progress}
                  onChange={(v) => setMetrics({...metrics, launchStatus: {...metrics.launchStatus, progress: v}})}
                />
              </div>
            </div>

            {/* Ops & Pay */}
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs font-black uppercase text-primary-crimson mb-4 tracking-widest italic underline">Ops Card</h3>
                <div className="space-y-4">
                  <InputGroup 
                    label="Weekly Goal" 
                    value={metrics.opsWeekly.weeklyGoal}
                    onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, weeklyGoal: v}})}
                  />
                  <InputGroup 
                    label="Units Done" 
                    value={metrics.opsWeekly.unitsCompleted}
                    onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, unitsCompleted: v}})}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-primary-blue mb-4 tracking-widest italic underline">Pay Card</h3>
                <div className="space-y-4">
                  <InputGroup 
                    label="Weekly Goal" 
                    value={metrics.payWeekly.weeklyGoal}
                    onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, weeklyGoal: v}})}
                  />
                  <InputGroup 
                    label="Conversions" 
                    value={metrics.payWeekly.conversions}
                    onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, conversions: v}})}
                  />
                </div>
              </div>
            </div>

            {/* Engineering */}
            <div className="border-t-4 border-neo-black pt-8">
              <h3 className="text-xs font-black uppercase text-primary-crimson mb-4 tracking-widest">Engineering Milestone</h3>
              <div className="space-y-4">
                <InputGroup 
                  label="Milestone Title" 
                  value={metrics.engineeringMilestone.title}
                  type="text"
                  onChange={(v) => setMetrics({...metrics, engineeringMilestone: {...metrics.engineeringMilestone, title: v}})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup 
                    label="Status" 
                    value={metrics.engineeringMilestone.status}
                    type="text"
                    onChange={(v) => setMetrics({...metrics, engineeringMilestone: {...metrics.engineeringMilestone, status: v}})}
                  />
                  <InputGroup 
                    label="ETA" 
                    value={metrics.engineeringMilestone.estimatedDelivery}
                    type="text"
                    onChange={(v) => setMetrics({...metrics, engineeringMilestone: {...metrics.engineeringMilestone, estimatedDelivery: v}})}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleSave('Operational Health', {
                launch: metrics.launchStatus,
                ops: metrics.opsWeekly,
                pay: metrics.payWeekly,
                engineering: metrics.engineeringMilestone
              })}
              disabled={saving}
              className="w-full border-4 border-neo-black py-6 bg-primary-yellow font-black uppercase text-2xl shadow-neo hover:bg-white transition-colors flex items-center justify-center gap-4 disabled:bg-gray-400"
            >
              {saving ? 'SYNCING...' : 'UPDATE CLUSTER'} <RefreshCcw size={24} />
            </button>
          </div>
        </section>
      </div>

      <footer className="mt-24 border-t-8 border-neo-black pt-8 flex justify-between items-center opacity-50 font-black uppercase text-xs">
        <div>Tradevu Internal Systems</div>
        <div className="flex gap-8">
          <a href="/" className="hover:underline">Dashboard View</a>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}

function InputGroup({ label, value, onChange, type = "number" }: { label: string, value: any, onChange: (v: any) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-neo-black/60">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="border-4 border-neo-black p-3 font-black text-xl focus:outline-none focus:bg-primary-yellow transition-colors placeholder:opacity-20"
        placeholder="0"
      />
    </div>
  );
}
