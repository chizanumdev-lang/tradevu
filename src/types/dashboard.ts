export type Role = 'CEO' | 'HR' | 'PM' | 'ENGINEERING_LEAD' | 'PAY_LEAD' | 'OPS_LEAD' | 'GUEST';

export interface User {
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  password?: string;
  requiresPasswordChange?: boolean;
}

// ─── Customer Metrics ─────────────────────────────────────────────────────────
export interface CustomerMetrics {
  /** Total customers this period */
  current: number;
  /** Monthly goal (from DB) */
  goal: number;
  /** Monthly active customers */
  activeMonthly: number;
  /** % change vs previous period (positive = growth) */
  percentageChange: number;
}

// ─── Revenue ──────────────────────────────────────────────────────────────────
export interface RevenueMetrics {
  goal: number;
  current: number;
  /** 0-100 */
  percentage: number;
}

// ─── Launch / Quarter Readiness ───────────────────────────────────────────────
export interface DeptTarget {
  name: string;
  /** 0-100 */
  progress: number;
}

export interface LaunchStatus {
  /** e.g. "Q2" */
  phase: string;
  /** Overall (average) progress 0-100 */
  progress: number;
  deptTargets: DeptTarget[];
  /** Optional label for history/slideshow */
  label?: string;
}

// ─── Ops Weekly ───────────────────────────────────────────────────────────────

export interface WeeklyOps {
  weeklyGoal: number;
  /** Total visits this week */
  visits: number;
  /** Conversations (engaged subset of visits) */
  conversations: number;
  /** Users who actually used the product */
  usersConverted: number;
  /**
   * Conversion rate: conversations that led to actual product use.
   * Stored as a percentage (0-100).
   */
  conversionRate: number;
  activePilots: number;
}

// ─── Pay Weekly ───────────────────────────────────────────────────────────────
export interface TransferMetric {
  label: string;
  current: number;
  value?: number; // Alias for current used in some UI parts
  goal: number;
}

export interface WeeklyPay {
  weeklyGoal: number;
  /** Total conversations this week */
  conversations: number;
  /** Users who actually used the product */
  usersConverted: number;
  /**
   * Conversion rate: conversations that led to actual product use.
   * Stored as a percentage (0-100).
   */
  conversionRate: number;
  transfers: TransferMetric[];
}

// ─── Finance Weekly ───────────────────────────────────────────────────────────
export interface WeeklyFinance {
  loanDisbursementValue: number;
  loanDisbursementTrend: number;
  loansDisbursed: number;
  loansDisbursedTrend: number;
  defaultRate: number;
  defaultRateTrend: number;
}

// ─── Engineering ──────────────────────────────────────────────────────────────
export interface EngineeringProject {
  id: string;
  title: string;
  description: string;
  name?: string; // Legacy
  status: 'Live' | 'In Development' | 'Testing';
  dateLabel: string;
  dateValue: string;
  progress?: number;
  eta?: string;
}

export interface EngineeringHealthMetric {
  label: string;
  value: string;
  isGood: boolean;
}

export interface EngineeringData {
  projects: EngineeringProject[];
  health: EngineeringHealthMetric[];
}

// ─── Aggregated dashboard payload ─────────────────────────────────────────────
export interface DashboardData {
  customersMonthly: CustomerMetrics;
  revenueAnnual: RevenueMetrics;
  launchStatus: LaunchStatus;
  launchHistory?: LaunchStatus[];
  opsWeekly: WeeklyOps;
  payWeekly: WeeklyPay;
  financeWeekly: WeeklyFinance;
  engineering: EngineeringData;
  engineeringRoadmap: EngineeringProject[];
  settings: {
    scrollSpeed: number;
    scrollEnabled: boolean;
    dashboardTitle: string;
    launchStatusTitle: string;
  };
  users: User[];
  lastUpdateTimestamp?: string;
  serverTime?: string;
}
