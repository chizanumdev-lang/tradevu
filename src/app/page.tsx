'use client';

import React, { useEffect, useState } from 'react';
import { LaunchStatus } from '@/components/dashboard/LaunchStatus';
import { RevenueRing } from '@/components/dashboard/RevenueRing';
import { CustomerCard } from '@/components/dashboard/CustomerCard';
import { OpsCard } from '@/components/dashboard/OpsCard';
import { EngineeringCard } from '@/components/dashboard/EngineeringCard';
import { DashboardData } from '@/types/dashboard';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [liveTime, setLiveTime] = useState<Date | null>(null);

  // Derive last updated date for the small text
  const currentDate = data?.lastUpdateTimestamp 
    ? new Date(data.lastUpdateTimestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }) 
    : 'Loading...';

  const fetchDashboard = () => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => { 
        if (d.serverTime) {
          const serverMs = new Date(d.serverTime).getTime();
          const localMs = new Date().getTime();
          setTimeOffset(serverMs - localMs);
        }
        setData(d); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  // Run initial fetch and setup polling
  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  // Global auto-scroll to reveal everything slowly
  useEffect(() => {
    if (loading || !data) return;

    let animationId: number;
    let lastTime = 0;
    let direction = 1;
    let isPausing = false;
    let currentY = window.scrollY;

    const animate = (time: number) => {
      if (!lastTime) {
        lastTime = time;
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll <= 10) return;

      currentY += 8 * delta; // Constant slow speed (8px/s)

      if (currentY >= maxScroll) {
        currentY = 0; // Immediate reset to top for a constant loop
      }

      window.scrollTo(0, currentY);
      animationId = requestAnimationFrame(animate);
    };

    const startTimeout = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 3000);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationId);
    };
  }, [data, loading]);

  // Robust greeting derived from live calibrated time
  const greeting = React.useMemo(() => {
    if (!liveTime) return 'Good morning';
    const hour = liveTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [liveTime]);

  const liveTimeString = liveTime?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos' // Force UTC+1 to match user's local time
  }) || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-2xl font-black animate-pulse text-primary">Loading Scoreboard...</div>
      </div>
    );
  }

  if (!data || ('error' in data)) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-10 text-center">
        <div className="text-xl font-bold text-red-500 mb-4">Database Setup Required</div>
        <p className="text-slate-600 mb-6 font-mono text-sm max-w-lg">
          {(data as any)?.error || 'Unable to connect to the database.'}
        </p>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left mb-6 max-w-2xl">
          <h3 className="font-bold mb-2">How to fix this:</h3>
          <p className="text-sm text-slate-600 mb-4">The Supabase tables haven't been created yet. You need to run the schema script.</p>
          <code className="block bg-slate-900 text-slate-100 p-4 rounded text-xs overflow-x-auto whitespace-pre">
            {`# Option 1: Run the Node script (requires Service Role key)
export SUPABASE_SERVICE_KEY="your_service_role_key"
node scripts/create-tables.mjs

# Option 2: Run SQL manually
1. Go to Supabase Dashboard -> SQL Editor
2. Copy the contents of supabase/schema.sql
3. Run the script`}
          </code>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg shadow hover:opacity-90">
          Refresh Dashboard
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-10">
      {/* ── Header ────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[13px] font-semibold text-slate-400">✳ {greeting}, Team!</p>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900 tracking-tight tabular-nums">{liveTimeString}</p>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">
            FY&apos;26 Operating Scoreboard
          </h1>
          <p className="text-[11px] font-semibold text-slate-400 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
            Last updated: {currentDate}
          </p>
        </div>
      </header>

      {/* ── Scoreboard border ─────────────────────── */}
      <div className="scoreboard-wrap">
        <div className="grid grid-cols-3 gap-6">

          {/* ── Row 1 ── */}
          <LaunchStatus
            phase={data.launchStatus.phase}
            overallProgress={data.launchStatus.progress}
            deptTargets={data.launchStatus.deptTargets}
          />

          <RevenueRing
            goal={data.revenueAnnual.goal}
            current={data.revenueAnnual.current}
            percentage={data.revenueAnnual.percentage}
          />

          <CustomerCard
            total={data.customersMonthly.current}
            goal={data.customersMonthly.goal}
            activeMonthly={data.customersMonthly.activeMonthly}
            trend={data.customersMonthly.percentageChange}
          />

          {/* ── Row 2 ── */}
          <OpsCard
            type="OPS"
            mainMetric={{
              label: 'Visits',
              current: data.opsWeekly.visits,
              goal: data.opsWeekly.weeklyGoal,
            }}
            subMetric={{
              label: 'Conversions',
              value: data.opsWeekly.conversations,
              trend: 0, // week-over-week trend calculated server-side if needed
            }}
            conversion={{
              label: 'Visits → Conversion Rate',
              value: data.opsWeekly.conversionRate,
            }}
          />

          <OpsCard
            type="PAY"
            mainMetric={{
              label: 'Conversations',
              current: data.payWeekly.conversations,
              goal: data.payWeekly.weeklyGoal,
            }}
            conversion={{
              label: 'Conversation → Conversion Rate',
              value: data.payWeekly.conversionRate,
            }}
            listMetrics={data.payWeekly.transfers}
          />

          <EngineeringCard
            projects={data.engineering.projects}
            health={data.engineering.health}
          />

        </div>
      </div>
    </main>
  );
}
