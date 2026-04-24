import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DashboardData } from '@/types/dashboard';

export async function GET() {
  const supabase = await createClient();

  // In a real app, you'd fetch this from Supabase
  // const { data, error } = await supabase.from('metrics').select('*');

  const mockData: DashboardData = {
    customersMonthly: {
      current: 342,
      previous: 305,
      percentageChange: 12
    },
    customersOverview: {
      totalCustomers: 8901,
      verifiedUsers: 8901,
      activeTrialUsers: 1240
    },
    revenueAnnual: {
      goal: 1000000,
      current: 750000,
      percentage: 75
    },
    launchStatus: {
      phase: "Q3 Launch Verified",
      progress: 80
    },
    opsWeekly: {
      weeklyGoal: 10,
      unitsCompleted: 10,
      visits: 89,
      conversionRate: 45
    },
    payWeekly: {
      weeklyGoal: 10,
      conversions: 10,
      conversations: 28,
      conversionRate: 32
    },
    engineeringMilestone: {
      title: "Integration & Partner Dashboard",
      status: "IN_PROGRESS",
      environment: "LIVE",
      currencyPair: "NGN-USD",
      estimatedDelivery: "2024-05-01"
    }
  };

  return NextResponse.json(mockData);
}
