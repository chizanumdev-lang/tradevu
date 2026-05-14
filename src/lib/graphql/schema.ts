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
    password: String
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

  type SalesMarketingMetric {
    touchpoint: String!
    period: String!
    leadsGenerated: Int!
    conversions: Int!
  }

  type TransferMetric {
    label: String!
    current: Float!
    value: Float
    goal: Float!
  }

  type PayMetric {
    period: String!
    weeklyGoal: Int!
    conversations: Int!
    usersConverted: Int!
    lcyTransfers: Int!
    lcyGoal: Int!
    fcyTransfers: Int!
    fcyGoal: Int!
  }

  type PayData {
    metrics: [PayMetric!]!
  }

  type FinanceMetric {
    loanType: String!
    currency: String!
    period: String!
    loanValue: Float!
    loanCount: Int!
    defaultRate: Float!
  }

  type ExchangeRate {
    currency: String!
    rateToUsd: Float!
  }

  type FinanceData {
    metrics: [FinanceMetric!]!
    exchangeRates: [ExchangeRate!]!
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

  type Department {
    name: String!
    headEmail: String
  }

  type DashboardSettings {
    scrollSpeed: Int!
    scrollEnabled: Boolean!
    dashboardTitle: String!
    launchStatusTitle: String!
    departments: [Department!]
  }

  type DashboardData {
    customersMonthly: CustomerMetrics!
    revenueAnnual: RevenueMetrics!
    launchStatus: LaunchStatus!
    launchHistory: [LaunchStatus!]
    salesMarketing: [SalesMarketingMetric!]!
    pay: PayData!
    finance: FinanceData!
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
    salesMarketing: [SalesMarketingMetric!]!
    pay: PayData!
    finance: FinanceData!
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

  input SalesMarketingInput {
    touchpoint: String!
    period: String!
    leadsGenerated: Int!
    conversions: Int!
  }

  input PayInput {
    period: String!
    weeklyGoal: Int!
    conversations: Int!
    usersConverted: Int!
    lcyTransfers: Int!
    lcyGoal: Int!
    fcyTransfers: Int!
    fcyGoal: Int!
  }

  input FinanceMetricInput {
    loanType: String!
    currency: String!
    period: String!
    loanValue: Float!
    loanCount: Int!
    defaultRate: Float!
  }

  input ExchangeRateInput {
    currency: String!
    rateToUsd: Float!
  }

  type Mutation {
    updateRevenue(goal: Float!, current: Float!, fiscalYear: Int): RevenueMetrics!
    updateCustomers(totalCustomers: Int!, monthlyGoal: Int!, activeMonthly: Int!): CustomerMetrics!
    updateSales(metrics: [SalesMarketingInput!]!): [SalesMarketingMetric!]!
    updatePay(metrics: [PayInput!]!): PayData!
    updateLaunchStatus(phases: [LaunchPhaseInput!]!): [LaunchStatus!]!
    updateFinance(
      metrics: [FinanceMetricInput!]!
      exchangeRates: [ExchangeRateInput!]!
    ): FinanceData!
    updateEngineering(
      projects: [EngineeringProjectInput!]!
      health: [EngineeringHealthMetricInput!]!
    ): EngineeringData!
    updateSettings(
      scrollSpeed: Int!
      scrollEnabled: Boolean!
      dashboardTitle: String
      launchStatusTitle: String
      departments: [DepartmentInput!]
    ): DashboardSettings!
    upsertUser(user: UserInput!): User!
    updateUserPermissions(email: String!, role: String!, permissions: [String!]!): User!
    deleteUser(email: String!): Boolean!
  }

  input DepartmentInput {
    name: String!
    headEmail: String
  }
`;
