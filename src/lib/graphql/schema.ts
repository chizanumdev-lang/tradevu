import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Role {
    name: String!
  }

  type User {
    email: String!
    name: String!
    role: String!
    permissions: [String]
    requiresPasswordChange: Boolean
  }

  type CustomerMetrics {
    current: Int!
    goal: Int!
    activeMonthly: Int!
    percentageChange: Int!
  }

  type RevenueMetrics {
    goal: Float!
    current: Float!
    percentage: Int!
  }

  type DeptTarget {
    name: String!
    progress: Int!
  }

  type LaunchStatus {
    phase: String!
    progress: Int!
    deptTargets: [DeptTarget!]!
    label: String
  }

  type WeeklyOps {
    weeklyGoal: Int!
    visits: Int!
    conversations: Int!
    usersConverted: Int!
    conversionRate: Int!
    activePilots: Int!
  }

  type TransferMetric {
    label: String!
    current: Float!
    value: Float
    goal: Float!
  }

  type WeeklyPay {
    weeklyGoal: Int!
    conversations: Int!
    usersConverted: Int!
    conversionRate: Int!
    transfers: [TransferMetric!]!
  }

  type WeeklyFinance {
    loanDisbursementValue: Float!
    loanDisbursementTrend: Float!
    loansDisbursed: Int!
    loansDisbursedTrend: Float!
    defaultRate: Float!
    defaultRateTrend: Float!
  }

  type EngineeringProject {
    id: ID!
    title: String!
    description: String!
    status: String!
    dateLabel: String!
    dateValue: String!
    progress: Int
    eta: String
  }

  type EngineeringHealthMetric {
    label: String!
    value: String!
    isGood: Boolean!
  }

  type EngineeringData {
    projects: [EngineeringProject!]!
    health: [EngineeringHealthMetric!]!
  }

  type DashboardSettings {
    scrollSpeed: Int!
    scrollEnabled: Boolean!
    dashboardTitle: String!
    launchStatusTitle: String!
  }

  type DashboardData {
    customersMonthly: CustomerMetrics!
    revenueAnnual: RevenueMetrics!
    launchStatus: LaunchStatus!
    launchHistory: [LaunchStatus!]
    opsWeekly: WeeklyOps!
    payWeekly: WeeklyPay!
    financeWeekly: WeeklyFinance!
    engineering: EngineeringData!
    engineeringRoadmap: [EngineeringProject!]!
    settings: DashboardSettings!
    users: [User!]!
    lastUpdateTimestamp: String
    serverTime: String
  }

  type Query {
    dashboard: DashboardData!
    revenueAnnual: RevenueMetrics!
    customersMonthly: CustomerMetrics!
    launchStatus: [LaunchStatus!]!
    opsWeekly: WeeklyOps!
    payWeekly: WeeklyPay!
    financeWeekly: WeeklyFinance!
    engineering: EngineeringData!
    settings: DashboardSettings!
    users: [User!]!
  }

  input DeptTargetInput {
    name: String!
    progress: Int!
  }

  input LaunchPhaseInput {
    phase: String!
    label: String
    deptTargets: [DeptTargetInput!]!
  }

  input EngineeringProjectInput {
    id: ID!
    title: String!
    description: String!
    status: String!
    dateLabel: String!
    dateValue: String!
  }

  input EngineeringHealthMetricInput {
    label: String!
    value: String!
    isGood: Boolean!
  }

  input UserInput {
    email: String!
    name: String!
    role: String!
    permissions: [String]
    password: String
    requiresPasswordChange: Boolean
  }

  type Mutation {
    updateRevenue(goal: Float!, current: Float!, fiscalYear: Int): RevenueMetrics!
    updateCustomers(totalCustomers: Int!, monthlyGoal: Int!, activeMonthly: Int!): CustomerMetrics!
    updateOps(weeklyGoal: Int!, visits: Int!, conversations: Int!, usersConverted: Int!): WeeklyOps!
    updatePay(
      weeklyGoal: Int!
      conversations: Int!
      usersConverted: Int!
      lcyTransfers: Float!
      lcyGoal: Float!
      fcyTransfers: Float!
      fcyGoal: Float!
    ): WeeklyPay!
    updateLaunchStatus(phases: [LaunchPhaseInput!]!): [LaunchStatus!]!
    updateFinance(
      loanDisbursementValue: Float!
      loanDisbursementTrend: Float!
      loansDisbursed: Int!
      loansDisbursedTrend: Float!
      defaultRate: Float!
      defaultRateTrend: Float!
    ): WeeklyFinance!
    updateEngineering(
      projects: [EngineeringProjectInput!]!
      health: [EngineeringHealthMetricInput!]!
    ): EngineeringData!
    updateSettings(
      scrollSpeed: Int!
      scrollEnabled: Boolean!
      dashboardTitle: String
      launchStatusTitle: String
    ): DashboardSettings!
    upsertUser(user: UserInput!): User!
    updateUserPermissions(email: String!, role: String!, permissions: [String!]!): User!
    deleteUser(email: String!): Boolean!
  }
`;
