export interface CustomerMetrics {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface CustomerOverview {
  totalCustomers: number;
  verifiedUsers: number;
  activeTrialUsers: number;
}

export interface RevenueMetrics {
  goal: number;
  current: number;
  percentage: number;
}

export interface LaunchStatus {
  phase: string;
  progress: number;
}

export interface WeeklyOps {
  weeklyGoal: number;
  unitsCompleted: number;
  visits: number;
  conversionRate: number;
}

export interface WeeklyPay {
  weeklyGoal: number;
  conversions: number;
  conversations: number;
  conversionRate: number;
}

export interface EngineeringMilestone {
  title: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  environment: 'LIVE' | 'STAGING' | 'DEV';
  currencyPair: string;
  estimatedDelivery: string;
}

export interface DashboardData {
  customersMonthly: CustomerMetrics;
  customersOverview: CustomerOverview;
  revenueAnnual: RevenueMetrics;
  launchStatus: LaunchStatus;
  opsWeekly: WeeklyOps;
  payWeekly: WeeklyPay;
  engineeringMilestone: EngineeringMilestone;
}
