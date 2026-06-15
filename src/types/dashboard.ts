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

export interface Department {
  name: string;
  headEmail: string;
}

export interface DashboardSettings {
  scrollSpeed: number;
  scrollEnabled: boolean;
  dashboardTitle: string;
  launchStatusTitle: string;
  departments: Department[];
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

export interface SalesMarketingMetric {
  touchpoint: 'LinkedIn' | 'Website' | 'X';
  period: 'week' | 'month' | 'quarter';
  leadsGenerated: number;
  conversions: number;
}

// ─── Pay Weekly ───────────────────────────────────────────────────────────────
export interface TransferMetric {
  label: string;
  current: number;
  value?: number; // Alias for current used in some UI parts
  goal: number;
}

export interface PayMetric {
  period: 'week' | 'month' | 'quarter';
  weeklyGoal: number;
  conversations: number;
  usersConverted: number;
  lcyTransfers: number;
  lcyGoal: number;
  fcyTransfers: number;
  fcyGoal: number;
}

export interface PayData {
  metrics: PayMetric[];
}

export type LoanType = 'Payables' | 'Receivables' | 'Payment';
export type Currency = 'USD' | 'NGN' | 'USDT' | 'USDC';

export interface FinanceMetric {
  loanType: LoanType;
  currency: Currency;
  period: 'week' | 'month' | 'quarter';
  loanValue: number;
  loanCount: number;
  defaultRate: number;
}

export interface ExchangeRate {
  currency: Currency;
  rateToUsd: number;
}

export interface FinanceData {
  metrics: FinanceMetric[];
  exchangeRates: ExchangeRate[];
}

// ─── Engineering ──────────────────────────────────────────────────────────────
export interface EngineeringProject {
  id: string;
  title: string;
  description: string;
  name?: string; // Legacy
  status: 'Live' | 'In Development' | 'Testing' | 'Blocked';
  dateLabel: string;
  dateValue: string;
  progress?: number;
  impactScore?: number;
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
  salesMarketing: SalesMarketingMetric[];
  pay: PayData;
  finance: FinanceData;
  engineering: EngineeringData;
  engineeringRoadmap: EngineeringProject[];
  settings: DashboardSettings;
  users: User[];
  lastUpdateTimestamp?: string;
  serverTime?: string;
}
