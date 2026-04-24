'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueRing } from '@/components/dashboard/RevenueRing';
import { LaunchStatus } from '@/components/dashboard/LaunchStatus';
import { OpsCard } from '@/components/dashboard/OpsCard';
import { EngineeringCard } from '@/components/dashboard/EngineeringCard';
import { DashboardData } from '@/types/dashboard';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="text-4xl font-black animate-pulse uppercase italic">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12 max-w-screen-2xl relative z-10 font-body antialiased min-h-screen">
      {/* Grid Background Effect moved to body via globals.css */}

      {/* Top Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
        {/* Monthly Customers + Launch Readiness */}
        <div className="flex flex-col gap-4">
          <StatCard 
            title="Monthly Customers"
            value={data.customersMonthly.current}
            tag="group"
            trend={{
              value: data.customersMonthly.percentageChange,
              label: "last mo",
              isUp: true
            }}
          />
          <LaunchStatus 
            phase={data.launchStatus.phase}
            progress={data.launchStatus.progress}
          />
        </div>

        {/* Annual Revenue Goal */}
        <RevenueRing 
          goal={data.revenueAnnual.goal}
          current={data.revenueAnnual.current}
          percentage={data.revenueAnnual.percentage}
        />

        {/* Total Customers + Active Trial */}
        <div className="flex flex-col gap-6">
          <StatCard 
            title="Total Customers"
            value={data.customersOverview.totalCustomers}
            subtext="Verified Platform Users"
            tag="public"
          />
          <div className="mt-12 pt-8 border-t-4 border-neo-black border-dashed">
            <div className="text-xs font-black uppercase tracking-widest mb-2 text-primary-crimson">Active Trial Users</div>
            <div className="text-5xl text-primary-blue font-h2 font-black brutal-text-shadow tracking-tighter">
              {data.customersOverview.activeTrialUsers.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Operations & Eng */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <OpsCard 
          type="OPS"
          weeklyGoal={data.opsWeekly.weeklyGoal}
          units={data.opsWeekly.unitsCompleted}
          secondaryLabel="Visits"
          secondaryValue={data.opsWeekly.visits}
          conversionRate={data.opsWeekly.conversionRate}
        />
        <OpsCard 
          type="PAY"
          weeklyGoal={data.payWeekly.weeklyGoal}
          units={data.payWeekly.conversions}
          secondaryLabel="Conversations"
          secondaryValue={data.payWeekly.conversations}
          conversionRate={data.payWeekly.conversionRate}
        />
        <EngineeringCard 
          milestone={{
            title: data.engineeringMilestone.title,
            status: data.engineeringMilestone.status,
            environment: data.engineeringMilestone.environment,
            currencyPair: data.engineeringMilestone.currencyPair,
            estimatedDelivery: data.engineeringMilestone.estimatedDelivery
          }}
        />
      </section>
    </main>
  );
}
