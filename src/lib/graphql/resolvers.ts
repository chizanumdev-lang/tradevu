import { createClient } from '@/utils/supabase/server';
import * as queries from '@/lib/queries';

export const resolvers = {
  Query: {
    dashboard: async () => {
      const supabase = await createClient();
      const [
        customersMonthly,
        revenueAnnual,
        launchStatus,
        opsWeekly,
        payWeekly,
        financeWeekly,
        engineering,
        lastUpdateTimestamp,
        settings,
        users,
      ] = await Promise.all([
        queries.fetchCustomerMetrics(supabase),
        queries.fetchRevenueAnnual(supabase),
        queries.fetchLaunchStatus(supabase),
        queries.fetchOpsWeekly(supabase),
        queries.fetchPayWeekly(supabase),
        queries.fetchFinanceWeekly(supabase),
        queries.fetchEngineering(supabase),
        queries.fetchLastUpdateTimestamp(supabase),
        queries.fetchDashboardSettings(supabase),
        queries.fetchDashboardUsers(supabase),
      ]);

      return {
        customersMonthly,
        revenueAnnual,
        launchStatus: launchStatus.current,
        launchHistory: launchStatus.history,
        opsWeekly,
        payWeekly,
        financeWeekly,
        engineering,
        engineeringRoadmap: engineering.projects,
        lastUpdateTimestamp,
        settings,
        users,
        serverTime: new Date().toISOString(),
      };
    },
    revenueAnnual: async () => {
      const supabase = await createClient();
      return queries.fetchRevenueAnnual(supabase);
    },
    customersMonthly: async () => {
      const supabase = await createClient();
      return queries.fetchCustomerMetrics(supabase);
    },
    launchStatus: async () => {
      const supabase = await createClient();
      const { current, history } = await queries.fetchLaunchStatus(supabase);
      return [current, ...history];
    },
    opsWeekly: async () => {
      const supabase = await createClient();
      return queries.fetchOpsWeekly(supabase);
    },
    payWeekly: async () => {
      const supabase = await createClient();
      return queries.fetchPayWeekly(supabase);
    },
    financeWeekly: async () => {
      const supabase = await createClient();
      return queries.fetchFinanceWeekly(supabase);
    },
    engineering: async () => {
      const supabase = await createClient();
      return queries.fetchEngineering(supabase);
    },
    settings: async () => {
      const supabase = await createClient();
      return queries.fetchDashboardSettings(supabase);
    },
    users: async () => {
      const supabase = await createClient();
      return queries.fetchDashboardUsers(supabase);
    },
  },

  Mutation: {
    updateRevenue: async (_: unknown, { goal, current, fiscalYear }: { goal: number, current: number, fiscalYear?: number }) => {
      const supabase = await createClient();
      const year = fiscalYear ?? new Date().getFullYear();

      const { data: existing } = await supabase
        .from('revenue_annual')
        .select('id')
        .eq('fiscal_year', year)
        .limit(1);

      let data, error;
      if (existing && existing.length > 0) {
        const result = await supabase
          .from('revenue_annual')
          .update({
            goal,
            current,
            recorded_at: new Date().toISOString(),
          })
          .eq('id', existing[0].id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('revenue_annual')
          .insert({
            fiscal_year: year,
            goal,
            current,
            recorded_at: new Date().toISOString(),
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw new Error(error.message);
      
      const goalNum = Number(data.goal);
      const currentNum = Number(data.current);
      return {
        goal: goalNum,
        current: currentNum,
        percentage: goalNum > 0 ? Math.min(100, Math.round((currentNum / goalNum) * 100)) : 0
      };
    },

    updateCustomers: async (_: unknown, { totalCustomers, monthlyGoal, activeMonthly }: { totalCustomers: number, monthlyGoal: number, activeMonthly: number }) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from('customer_metrics')
        .insert({
          total_customers: totalCustomers,
          monthly_goal: monthlyGoal,
          active_monthly: activeMonthly,
          period_start: new Date().toISOString().substring(0, 7) + '-01',
          recorded_at: new Date().toISOString()
        });

      if (error) throw new Error(error.message);
      return queries.fetchCustomerMetrics(supabase);
    },

    updateOps: async (_: unknown, { weeklyGoal, visits, conversations, usersConverted }: { weeklyGoal: number, visits: number, conversations: number, usersConverted: number }) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from('ops_weekly')
        .insert({
          weekly_goal: weeklyGoal,
          visits,
          conversations,
          users_converted: usersConverted,
          week_start: new Date().toISOString(),
          recorded_at: new Date().toISOString()
        });

      if (error) throw new Error(error.message);
      return queries.fetchOpsWeekly(supabase);
    },

    updatePay: async (_: unknown, { weeklyGoal, conversations, usersConverted, lcyTransfers, lcyGoal, fcyTransfers, fcyGoal }: { weeklyGoal: number, conversations: number, usersConverted: number, lcyTransfers: number, lcyGoal: number, fcyTransfers: number, fcyGoal: number }) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from('pay_weekly')
        .insert({
          weekly_goal: weeklyGoal,
          conversations,
          users_converted: usersConverted,
          lcy_transfers: lcyTransfers,
          lcy_goal: lcyGoal,
          fcy_transfers: fcyTransfers,
          fcy_goal: fcyGoal,
          week_start: new Date().toISOString(),
          recorded_at: new Date().toISOString()
        });

      if (error) throw new Error(error.message);
      return queries.fetchPayWeekly(supabase);
    },

    updateLaunchStatus: async (_: unknown, { phases }: { phases: any[] }) => {
      const supabase = await createClient();
      const recordedAt = new Date().toISOString();
      
      const rows = [];
      for (const p of phases) {
        for (const dt of p.deptTargets) {
          rows.push({
            phase: p.phase,
            dept_name: dt.name,
            progress: dt.progress,
            recorded_at: recordedAt
          });
        }
      }

      const { error } = await supabase.from('launch_readiness').insert(rows);
      if (error) throw new Error(error.message);
      
      const { current, history } = await queries.fetchLaunchStatus(supabase);
      return [current, ...history];
    },

    updateFinance: async (_: unknown, args: { loanDisbursementValue: number, loanDisbursementTrend: number, loansDisbursed: number, loansDisbursedTrend: number, defaultRate: number, defaultRateTrend: number }) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from('finance_weekly')
        .insert({
          loan_disbursement_value: args.loanDisbursementValue,
          loan_disbursement_trend: args.loanDisbursementTrend,
          loans_disbursed: args.loansDisbursed,
          loans_disbursed_trend: args.loansDisbursedTrend,
          default_rate: args.defaultRate,
          default_rate_trend: args.defaultRateTrend,
          week_start: new Date().toISOString(),
          recorded_at: new Date().toISOString()
        });

      if (error) throw new Error(error.message);
      return queries.fetchFinanceWeekly(supabase);
    },

    updateEngineering: async (_: unknown, { projects, health }: { projects: any[], health: any[] }) => {
      const supabase = await createClient();
      
      // Update projects
      if (projects && projects.length > 0) {
        // Simple strategy: deactivate all then insert new ones or update existing
        // For simplicity here, we'll assume we update existing ones by ID
        for (const p of projects) {
          await supabase
            .from('engineering_projects')
            .update({
              name: p.title,
              status: p.status,
              date_label: p.dateLabel,
              date_value: p.dateValue,
              updated_at: new Date().toISOString()
            })
            .eq('id', p.id);
        }
      }

      // Update health
      if (health && health.length > 0) {
        for (const h of health) {
          await supabase
            .from('engineering_health')
            .update({
              value: h.value,
              is_good: h.isGood,
              updated_at: new Date().toISOString()
            })
            .eq('label', h.label);
        }
      }

      return queries.fetchEngineering(supabase);
    },

    updateSettings: async (_: unknown, args: { scrollSpeed: number, scrollEnabled: boolean, dashboardTitle?: string, launchStatusTitle?: string }) => {
      const supabase = await createClient();
      await queries.updateDashboardSettings(supabase, {
        scrollSpeed: args.scrollSpeed,
        scrollEnabled: args.scrollEnabled,
        dashboardTitle: args.dashboardTitle || "FY'26 Operating Dashboard",
        launchStatusTitle: args.launchStatusTitle || "Launch Readiness"
      });
      return queries.fetchDashboardSettings(supabase);
    },

    upsertUser: async (_: unknown, { user }: { user: any }) => {
      const supabase = await createClient();
      await queries.upsertSingleUser(supabase, {
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        password: user.password,
        requiresPasswordChange: user.requiresPasswordChange
      });
      const users = await queries.fetchDashboardUsers(supabase);
      return users.find(u => u.email === user.email)!;
    },

    updateUserPermissions: async (_: unknown, { email, role, permissions }: { email: string, role: string, permissions: string[] }) => {
      const supabase = await createClient();
      await queries.updateUserPermissions(supabase, email, role, permissions);
      const users = await queries.fetchDashboardUsers(supabase);
      return users.find(u => u.email === email)!;
    },

    deleteUser: async (_: unknown, { email }: { email: string }) => {
      const supabase = await createClient();
      const { error } = await supabase.from('dashboard_users').delete().eq('email', email);
      if (error) throw new Error(error.message);
      return true;
    },
  },
};
