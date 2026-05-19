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
        salesMarketing,
        pay,
        finance,
        engineering,
        lastUpdateTimestamp,
        settings,
        users,
      ] = await Promise.all([
        queries.fetchCustomerMetrics(supabase),
        queries.fetchRevenueAnnual(supabase),
        queries.fetchLaunchStatus(supabase),
        queries.fetchSalesMarketing(supabase),
        queries.fetchPay(supabase),
        queries.fetchFinance(supabase),
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
        salesMarketing,
        pay,
        finance,
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
    salesMarketing: async () => {
      const supabase = await createClient();
      return queries.fetchSalesMarketing(supabase);
    },
    pay: async () => {
      const supabase = await createClient();
      return queries.fetchPay(supabase);
    },
    finance: async () => {
      const supabase = await createClient();
      return queries.fetchFinance(supabase);
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

    updateSales: async (_: unknown, { metrics }: { metrics: any[] }) => {
      const supabase = await createClient();
      await queries.updateSalesMarketing(supabase, metrics);
      return queries.fetchSalesMarketing(supabase);
    },

    updatePay: async (_: unknown, { metrics }: { metrics: any[] }) => {
      const supabase = await createClient();
      await queries.updatePay(supabase, metrics);
      return queries.fetchPay(supabase);
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

    updateFinance: async (_: unknown, { metrics, exchangeRates }: { metrics: any[], exchangeRates: any[] }) => {
      const supabase = await createClient();
      await queries.updateFinance(supabase, metrics, exchangeRates);
      return queries.fetchFinance(supabase);
    },

    updateEngineering: async (_: unknown, { projects, health }: { projects: any[], health: any[] }) => {
      const supabase = await createClient();
      
      // Update projects
      if (projects) {
        // 1. Get the list of all IDs sent by the client that are valid UUIDs
        const incomingIds = projects
          .map(p => p.id)
          .filter(id => id && id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/));

        // 2. Delete any projects in the database that are NOT in the incoming IDs
        if (incomingIds.length > 0) {
          await supabase
            .from('engineering_projects')
            .delete()
            .not('id', 'in', `(${incomingIds.join(',')})`);
        } else {
          await supabase
            .from('engineering_projects')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        }

        // 3. Insert or update projects
        for (const p of projects) {
          const isNew = !p.id || !p.id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
          
          const row: any = {
            name: p.title,
            status: p.status,
            date_label: p.dateLabel,
            date_value: p.dateValue,
            description: p.description || '',
            completion_percentage: p.progress || 0,
            impact_score: p.impactScore || 0,
            updated_at: new Date().toISOString()
          };

          if (isNew) {
            await supabase.from('engineering_projects').insert(row);
          } else {
            await supabase
              .from('engineering_projects')
              .update(row)
              .eq('id', p.id);
          }
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

    updateSettings: async (_: unknown, args: { scrollSpeed: number, scrollEnabled: boolean, dashboardTitle?: string, launchStatusTitle?: string, departments?: any[] }) => {
      const supabase = await createClient();
      await queries.updateDashboardSettings(supabase, {
        scrollSpeed: args.scrollSpeed,
        scrollEnabled: args.scrollEnabled,
        dashboardTitle: args.dashboardTitle || "FY'26 Operating Dashboard",
        launchStatusTitle: args.launchStatusTitle || "Launch Readiness",
        departments: args.departments || []
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
