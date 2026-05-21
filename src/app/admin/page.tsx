'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, RefreshCcw, Lock, LogOut, 
  Activity, LayoutDashboard,
  ArrowRight, CheckCircle2, 
  Edit3, Edit2, ChevronDown, X, Save, Plus, Trash2, Settings, Key, Shield, UserPlus, Check, Eye, EyeOff, ArrowDownUp, ArrowLeftRight
} from 'lucide-react';
import Image from 'next/image';
import { DashboardData, EngineeringProject, Role, User, LaunchStatus as LaunchStatusType, Department, LoanType, Currency, ExchangeRate } from '@/types/dashboard';
import { LaunchStatus } from '@/components/dashboard/LaunchStatus';

import { RevenueRing } from '@/components/dashboard/RevenueRing';
import { CustomerCard } from '@/components/dashboard/CustomerCard';
import { SalesCard } from '@/components/dashboard/SalesCard';
import { PayCard } from '@/components/dashboard/PayCard';
import { FinanceCard } from '@/components/dashboard/FinanceCard';
import { EngineeringCard } from '@/components/dashboard/EngineeringCard';

const AUTHORIZED_USERS: User[] = [
  { email: 'nkiru@tradevu.africa', name: 'Nkiru', role: 'CEO', password: 'password123' },
  { email: 'tola@tradevu.co', name: 'Tola', role: 'HR', password: 'password123' },
  { email: 'kene@tradevu.co', name: 'Kene', role: 'PM', password: 'password123' },
];

const INITIAL_PERMISSIONS: Record<string, string[]> = {
  CEO: ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings', 'marketing'],
  PM: ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings'],
  HR: ['launch', 'users', 'settings', 'ops', 'pay'],
  MARKETING: ['marketing'],
};

const ROLE_LABELS: Record<string, string> = {
  CEO: 'Chief Executive Officer',
  HR: 'Human Resources',
  PM: 'Project Manager',
  MARKETING: 'Marketing Lead',
};

const ALL_ROLES: (Role | 'MARKETING')[] = ['CEO', 'HR', 'PM', 'MARKETING'];
const ALL_PERMISSIONS = ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings', 'marketing'];

export default function AdminPage() {
  // Dynamically calculate default start and end dates (Sunday and Friday of current week)
  const getDefaultDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const currentSunday = new Date(today.getFullYear(), today.getMonth(), diff);
    const currentFriday = new Date(currentSunday.getFullYear(), currentSunday.getMonth(), currentSunday.getDate() + 5);

    const formatISODate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      start: formatISODate(currentSunday),
      end: formatISODate(currentFriday),
    };
  };

  const { start: defaultStart, end: defaultEnd } = getDefaultDates();

  const [users, setUsers] = useState<User[]>(AUTHORIZED_USERS);
  const [permissions, setPermissions] = useState<Record<string, string[]>>(INITIAL_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // UI States
  const [editMode, setEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);
  const [inviteForm, setInviteForm] = useState<{email: string, password: string, role: string, permissions: string[]}>({
    email: '',
    password: '',
    role: '',
    permissions: ['settings']
  });
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [passwordChangeForm, setPasswordChangeForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [isRatesCollapsed, setIsRatesCollapsed] = useState(true);

  // Modal selector states
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'NGN' | 'USDT' | 'USDC'>('NGN');
  const [selectedMonth, setSelectedMonth] = useState<'May'>('May');
  const [selectedStartDate, setSelectedStartDate] = useState<string>(defaultStart);
  const [selectedEndDate, setSelectedEndDate] = useState<string>(defaultEnd);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');


  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    // Check user-specific permissions first
    if (currentUser.permissions && currentUser.permissions.length > 0) {
      return currentUser.permissions.includes(permission);
    }
    // Fallback to role-based permissions
    return permissions[currentUser.role]?.includes(permission) || false;
  };

  const fetchDashboard = () => {
    setLoading(true);
    const query = `
      query GetDashboard {
        dashboard {
          customersMonthly {
            current
            goal
            activeMonthly
            percentageChange
          }
          revenueAnnual {
            goal
            current
            percentage
          }
          launchStatus {
            phase
            progress
            deptTargets {
              name
              progress
            }
            label
          }
          launchHistory {
            phase
            progress
            deptTargets {
              name
              progress
            }
            label
          }
          salesMarketing {
            touchpoint
            period
            leadsGenerated
            conversions
          }
          pay {
            metrics {
              period
              weeklyGoal
              conversations
              usersConverted
              lcyTransfers
              lcyGoal
              fcyTransfers
              fcyGoal
            }
          }
          finance {
            metrics {
              loanType
              currency
              period
              loanValue
              loanCount
              defaultRate
            }
            exchangeRates {
              currency
              rateToUsd
            }
          }
          engineering {
            projects {
              id
              title
              description
              status
              dateLabel
              dateValue
            }
            health {
              label
              value
              isGood
            }
          }
          settings {
            scrollSpeed
            scrollEnabled
            dashboardTitle
            launchStatusTitle
            departments {
              name
              headEmail
            }
          }
          users {
            email
            name
            role
            permissions
            password
            requiresPasswordChange
          }
          lastUpdateTimestamp
          serverTime
        }
      }
    `;

    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
      .then(res => res.json())
      .then(({ data, errors }) => {
        if (errors) {
          setError(errors[0].message);
        } else {
          const dashboard = data.dashboard;
          setMetrics(dashboard);
          if (dashboard.users) setUsers(dashboard.users);
          setError(null);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard();
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => 
      u.email.toLowerCase() === loginForm.email.toLowerCase() && 
      u.password === loginForm.password
    );
    
    if (user) {
      if (user.requiresPasswordChange) {
        setPasswordChangeUser(user);
        setLoginError(null);
      } else {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setLoginError(null);
      }
    } else {
      setLoginError('Invalid credentials.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      setPasswordChangeError('Passwords do not match.');
      return;
    }
    if (passwordChangeForm.newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters.');
      return;
    }

    if (passwordChangeUser) {
      const updatedUsers = users.map(u => 
        u.email === passwordChangeUser.email 
          ? { ...u, password: passwordChangeForm.newPassword, requiresPasswordChange: false } 
          : u
      );
      
      const updatedUser = { ...passwordChangeUser, password: passwordChangeForm.newPassword, requiresPasswordChange: false };
      
      // Persist to DB
      const query = `
        mutation UpsertUser($user: UserInput!) {
          upsertUser(user: $user) {
            email
            name
            role
            permissions
            requiresPasswordChange
          }
        }
      `;
      const variables = { user: updatedUser };

      fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      }).then(res => res.json())
      .then(({ errors }) => {
        if (!errors) {
          setUsers(updatedUsers);
          // Log them in after password change
          setCurrentUser(updatedUser);
          setIsLoggedIn(true);
          setPasswordChangeUser(null);
          setPasswordChangeForm({ newPassword: '', confirmPassword: '' });
          setPasswordChangeError(null);
        } else {
          setPasswordChangeError(errors[0].message || 'Failed to save new password to database.');
        }
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
  };

  const canEdit = (section: string) => {
    return hasPermission(section);
  };

  const handleOpenEdit = (section: string, dept?: string) => {
    setSelectedCurrency('NGN');
    setSelectedMonth('May');
    setSelectedStartDate(defaultStart);
    setSelectedEndDate(defaultEnd);
    setSelectedPeriod('week');
    setEditingSection(section);
    setEditingDept(dept || null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingSection || !metrics) return;
    setSavingSection(editingSection);
    try {
      const headers = { 'Content-Type': 'application/json' };
      let query = '';
      let variables = {};

      if (editingSection === 'revenue') {
        query = `
          mutation UpdateRevenue($goal: Float!, $current: Float!) {
            updateRevenue(goal: $goal, current: $current) {
              goal
              current
              percentage
            }
          }
        `;
        variables = { goal: metrics.revenueAnnual.goal, current: metrics.revenueAnnual.current };
      } else if (editingSection === 'customers') {
        query = `
          mutation UpdateCustomers($totalCustomers: Int!, $monthlyGoal: Int!, $activeMonthly: Int!) {
            updateCustomers(totalCustomers: $totalCustomers, monthlyGoal: $monthlyGoal, activeMonthly: $activeMonthly) {
              current
              goal
              activeMonthly
            }
          }
        `;
        variables = {
          totalCustomers: metrics.customersMonthly.current,
          monthlyGoal: metrics.customersMonthly.goal,
          activeMonthly: metrics.customersMonthly.activeMonthly
        };
      } else if (editingSection === 'sales') {
        query = `
          mutation UpdateSales($metrics: [SalesMarketingInput!]!) {
            updateSales(metrics: $metrics) {
              touchpoint
              period
              leadsGenerated
              conversions
            }
          }
        `;
        variables = {
          metrics: metrics.salesMarketing.map(m => ({
            touchpoint: m.touchpoint,
            period: m.period,
            leadsGenerated: m.leadsGenerated,
            conversions: m.conversions
          }))
        };
      } else if (editingSection === 'pay') {
        query = `
          mutation UpdatePay($metrics: [PayInput!]!) {
            updatePay(metrics: $metrics) {
              metrics { period }
            }
          }
        `;
        variables = {
          metrics: metrics.pay.metrics.map(m => ({
            period: m.period,
            weeklyGoal: m.weeklyGoal,
            conversations: m.conversations,
            usersConverted: m.usersConverted || 0,
            lcyTransfers: m.lcyTransfers || 0,
            lcyGoal: m.lcyGoal || 0,
            fcyTransfers: m.fcyTransfers || 0,
            fcyGoal: m.fcyGoal || 0
          }))
        };
      } else if (editingSection === 'launch') {
        query = `
          mutation UpdateLaunchStatus($phases: [LaunchPhaseInput!]!) {
            updateLaunchStatus(phases: $phases) {
              phase
            }
          }
        `;
        variables = {
          phases: [
            { phase: metrics.launchStatus.phase, label: metrics.launchStatus.label || 'Current', deptTargets: metrics.launchStatus.deptTargets },
            ...(metrics.launchHistory || []).map(h => ({ phase: h.phase, label: h.label, deptTargets: h.deptTargets }))
          ]
        };
      } else if (editingSection === 'finance') {
        query = `
          mutation UpdateFinance($metrics: [FinanceMetricInput!]!, $exchangeRates: [ExchangeRateInput!]!) {
            updateFinance(metrics: $metrics, exchangeRates: $exchangeRates) {
              metrics { loanType }
            }
          }
        `;
        variables = {
          metrics: metrics.finance.metrics.map(m => ({
            loanType: m.loanType,
            currency: m.currency,
            period: m.period,
            loanValue: m.loanValue,
            loanCount: m.loanCount,
            defaultRate: m.defaultRate
          })),
          exchangeRates: metrics.finance.exchangeRates.map(r => ({
            currency: r.currency,
            rateToUsd: r.rateToUsd
          }))
        };
      } else if (editingSection === 'engineering') {
        query = `
          mutation UpdateEngineering($projects: [EngineeringProjectInput!]!, $health: [EngineeringHealthMetricInput!]!) {
            updateEngineering(projects: $projects, health: $health) {
              projects { id }
            }
          }
        `;
        variables = {
          projects: metrics.engineering.projects.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            status: p.status,
            dateLabel: p.dateLabel,
            dateValue: p.dateValue,
            progress: Number(p.progress) || 0,
            impactScore: Number(p.impactScore) || 0
          })),
          health: metrics.engineering.health.map(h => ({
            label: h.label,
            value: h.value,
            isGood: h.isGood
          }))
        };
      } else if (editingSection === 'settings') {
        query = `
          mutation UpdateSettings($scrollSpeed: Int!, $scrollEnabled: Boolean!, $dashboardTitle: String, $launchStatusTitle: String, $departments: [DepartmentInput!]) {
            updateSettings(scrollSpeed: $scrollSpeed, scrollEnabled: $scrollEnabled, dashboardTitle: $dashboardTitle, launchStatusTitle: $launchStatusTitle, departments: $departments) {
              scrollSpeed
            }
          }
        `;
        variables = {
          scrollSpeed: metrics.settings.scrollSpeed,
          scrollEnabled: metrics.settings.scrollEnabled,
          dashboardTitle: metrics.settings.dashboardTitle,
          launchStatusTitle: metrics.settings.launchStatusTitle,
          departments: metrics.settings.departments?.map((d: Department) => ({ name: d.name, headEmail: d.headEmail }))
        };
      }

      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables })
      });
      
      const result = await res.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message || 'Failed to save');
      }

      setMessage({ type: 'success', text: `${editingSection.toUpperCase()} updated successfully.` });
      setIsModalOpen(false);
      setEditingDept(null);
      fetchDashboard();
    } catch {
      setMessage({ type: 'error', text: `Failed to update ${editingSection}.` });
    } finally {
      setSavingSection(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDownloadReport = () => {
    window.open('/reports', '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
      <div className="text-2xl font-black animate-pulse text-primary">Syncing Console...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 text-center">
      <Activity className="text-rose-600 mb-4" size={48} />
      <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Failed</h2>
      <p className="text-rose-600 mb-8 max-w-md">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary px-8">Retry</button>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-primary/5 rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/10 border border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image src="/main-icon.svg" alt="Tradevu" width={48} height={48} className="relative z-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 text-center mb-2 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 text-center font-medium mb-10">Access the Tradevu Operating Scoreboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@tradevu.co"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {loginError && (
              <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold text-center rounded-xl animate-shake">
                {loginError}
              </div>
            )}
            
            <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
              Sign In <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Forced Password Change Modal */}
        {passwordChangeUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 border border-slate-100 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">Change Password</h2>
              <p className="text-slate-500 text-center font-medium mb-10">This is your first time signing in. You must change your password to proceed.</p>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      value={passwordChangeForm.newPassword}
                      onChange={(e) => setPasswordChangeForm({...passwordChangeForm, newPassword: e.target.value})}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      value={passwordChangeForm.confirmPassword}
                      onChange={(e) => setPasswordChangeForm({...passwordChangeForm, confirmPassword: e.target.value})}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>

                {passwordChangeError && (
                  <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold text-center rounded-xl animate-shake">
                    {passwordChangeError}
                  </div>
                )}

                <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  Update Password <Check size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const displayDate = mounted ? 
    (metrics?.lastUpdateTimestamp 
      ? new Date(metrics.lastUpdateTimestamp).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
        }) 
      : 'Loading...') 
    : 'Loading...';

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ── Fixed Admin Header ────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-[100] px-10 flex items-center justify-between border-b border-slate-800 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Image src="/white-icon.svg" alt="Tradevu" width={24} height={24} />
            </div>
            <span className="font-black text-lg tracking-tight uppercase">Admin Console</span>
          </div>
          
          <div className="h-6 w-px bg-slate-700" />
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Edit Mode</span>
            <button 
              onClick={() => setEditMode(!editMode)}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${editMode ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${editMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <button 
            onClick={() => handleOpenEdit('settings')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
          >
            <Settings size={14} className="text-slate-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">Settings</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-black leading-none">{currentUser?.name}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{currentUser ? ROLE_LABELS[currentUser.role] : ''}</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Mirror View ───────────────────────────────────────────── */}
      <main className="max-w-[1680px] mx-auto px-6 pt-28 pb-20 relative">
        {message && (
          <div className={`fixed top-20 right-10 z-[110] px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <Activity size={18} />}
            <span className="text-sm font-black uppercase tracking-tight">{message.text}</span>
          </div>
        )}

        {/* ── Header ────────────────────────────────── */}
        <header className="mb-8">
          <p className="text-[13px] font-black text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
            <Image src="/main-icon.svg" alt="Tradevu" width={14} height={14} /> Command Center View
          </p>
          <div className="flex justify-between items-end">
            <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">
              FY&apos;26 Operating Scoreboard
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[13px] font-semibold text-slate-400">
                Last updated: {displayDate}
              </p>
              <button 
                onClick={handleDownloadReport}
                className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hover:bg-primary/20 transition-colors"
              >
                View Graphical Report
              </button>
            </div>
          </div>
        </header>

        {/* ── Mirror Grid ─────────────────────── */}
        {metrics && (
          <div className="scoreboard-wrap bg-white/50 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-12 gap-4">

              {/* ── Top Row (3 cards, each 4 cols) ── */}
              <div className="col-span-12 md:col-span-4 relative group">
                <RevenueRing
                  goal={metrics.revenueAnnual.goal}
                  current={metrics.revenueAnnual.current}
                  percentage={metrics.revenueAnnual.percentage}
                  editMode={editMode && canEdit('revenue')}
                  onEdit={() => handleOpenEdit('revenue')}
                />
              </div>

              <div className="col-span-12 md:col-span-4 relative group">
                <CustomerCard
                  total={metrics.customersMonthly.current}
                  goal={metrics.customersMonthly.goal}
                  activeMonthly={metrics.customersMonthly.activeMonthly}
                  trend={metrics.customersMonthly.percentageChange}
                />
                {editMode && (
                  <button 
                    onClick={() => handleOpenEdit('customers')}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-10 animate-in zoom-in"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="col-span-12 md:col-span-4 relative group">
                 <LaunchStatus
                  current={metrics.launchStatus}
                  history={metrics.launchHistory}
                  editMode={editMode && canEdit('launch')}
                  onEdit={(dept) => handleOpenEdit('launch', dept)}
                  userRole={currentUser?.role}
                  userEmail={currentUser?.email}
                  departments={metrics.settings.departments}
                />
              </div>


              {/* ── Bottom Row (4 cards, each 3 cols) ── */}
              <div className="col-span-12 md:col-span-3 relative group">
                <SalesCard
                  metrics={metrics.salesMarketing}
                  userRole={currentUser?.role}
                />
                {editMode && (canEdit('marketing') || currentUser?.role === 'CEO') && (
                  <button 
                    onClick={() => handleOpenEdit('sales')}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-10 animate-in zoom-in"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="col-span-12 md:col-span-3 relative group">
                <PayCard
                  data={metrics.pay}
                />
                {editMode && canEdit('pay') && (
                  <button 
                    onClick={() => handleOpenEdit('pay')}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-10 animate-in zoom-in"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="col-span-12 md:col-span-3 relative group">
                <FinanceCard 
                  data={metrics.finance}
                />
                {editMode && canEdit('finance') && (
                  <button 
                    onClick={() => handleOpenEdit('finance')}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-10 animate-in zoom-in"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="col-span-12 md:col-span-3 relative group">
                <EngineeringCard
                  projects={metrics.engineering.projects}
                  health={metrics.engineering.health}
                  scrollSpeed={metrics.settings.scrollSpeed}
                  scrollEnabled={metrics.settings.scrollEnabled}
                />
                {editMode && canEdit('engineering') && (
                  <button 
                    onClick={() => handleOpenEdit('engineering')}
                    className="absolute top-4 right-4 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-lg hover:scale-110 hover:bg-slate-50 transition-all z-10 animate-in zoom-in"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ── Edit Modal ────────────────────────────────────────────────── */}
      {isModalOpen && metrics && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-primary" />
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Update {editingSection}</h2>
                  <p className="text-slate-500 font-medium">Modify operational parameters for this department.</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingDept(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto px-1 pr-4">
                {editingSection === 'revenue' && (
                  <>
                    <InputGroup label="Annual Goal ($)" value={metrics.revenueAnnual.goal} onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, goal: Number(v)}})} disabled={currentUser?.role !== 'CEO'} />
                    <InputGroup label="Current Revenue ($)" value={metrics.revenueAnnual.current} onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, current: Number(v)}})} />
                  </>
                )}
                
                {editingSection === 'customers' && (
                  <>
                    <InputGroup label="Monthly Goal" value={metrics.customersMonthly.goal} onChange={(v) => setMetrics({...metrics, customersMonthly: {...metrics.customersMonthly, goal: Number(v)}})} disabled={currentUser?.role !== 'CEO'} />
                    <InputGroup label="Total Customers" value={metrics.customersMonthly.current} onChange={(v) => setMetrics({...metrics, customersMonthly: {...metrics.customersMonthly, current: Number(v)}})} />
                    <InputGroup label="Active Monthly" value={metrics.customersMonthly.activeMonthly} onChange={(v) => setMetrics({...metrics, customersMonthly: {...metrics.customersMonthly, activeMonthly: Number(v)}})} />
                  </>
                )}

                {editingSection === 'sales' && (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <DropdownSelect
                        label="Month Period"
                        value={selectedMonth}
                        options={['May']}
                        onChange={(v) => {
                          setSelectedMonth(v);
                          setSelectedPeriod('month');
                        }}
                        active={selectedPeriod === 'month'}
                      />
                      <DateRangeDropdown
                        label="Day Range"
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        onStartChange={(v) => {
                          setSelectedStartDate(v);
                          setSelectedPeriod('week');
                        }}
                        onEndChange={(v) => {
                          setSelectedEndDate(v);
                          setSelectedPeriod('week');
                        }}
                        active={selectedPeriod === 'week'}
                      />
                    </div>

                    <div className="bg-[#F8F9FD] border border-[#ECEFF6] rounded-[28px] p-6 space-y-6">
                      {['Website', 'X', 'LinkedIn'].map(touchpoint => {
                        const idx = metrics.salesMarketing.findIndex(m => m.period === selectedPeriod && m.touchpoint === touchpoint);
                        const metric = metrics.salesMarketing[idx] || { leadsGenerated: 0, conversions: 0 };
                        
                        const updateVal = (field: 'leadsGenerated' | 'conversions', val: number) => {
                          const updated = [...metrics.salesMarketing];
                          if (idx > -1) {
                            updated[idx] = { ...updated[idx], [field]: val };
                          } else {
                            updated.push({
                              period: selectedPeriod,
                              touchpoint: touchpoint as 'LinkedIn' | 'Website' | 'X',
                              leadsGenerated: field === 'leadsGenerated' ? val : 0,
                              conversions: field === 'conversions' ? val : 0
                            });
                          }
                          setMetrics({ ...metrics, salesMarketing: updated });
                        };

                        const isCeoOrPm = currentUser?.role === 'CEO' || currentUser?.role === 'PM';

                        return (
                          <div key={touchpoint} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                              {touchpoint === 'X' ? 'X (Twitter)' : touchpoint}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <InputGroup 
                                label="Target (Leads)" 
                                value={metric.leadsGenerated} 
                                onChange={(v) => updateVal('leadsGenerated', Number(v))}
                                disabled={!isCeoOrPm}
                                isTarget={true}
                              />
                              <InputGroup 
                                label="Actual (Conversions)" 
                                value={metric.conversions} 
                                onChange={(v) => updateVal('conversions', Number(v))}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editingSection === 'pay' && (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <DropdownSelect
                        label="Month Period"
                        value={selectedMonth}
                        options={['May']}
                        onChange={(v) => {
                          setSelectedMonth(v);
                          setSelectedPeriod('month');
                        }}
                        active={selectedPeriod === 'month'}
                      />
                      <DateRangeDropdown
                        label="Day Range"
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        onStartChange={(v) => {
                          setSelectedStartDate(v);
                          setSelectedPeriod('week');
                        }}
                        onEndChange={(v) => {
                          setSelectedEndDate(v);
                          setSelectedPeriod('week');
                        }}
                        active={selectedPeriod === 'week'}
                      />
                    </div>

                    <div className="bg-[#F8F9FD] border border-[#ECEFF6] rounded-[28px] p-6 space-y-6">
                      {(() => {
                        const metric = metrics.pay.metrics.find(m => m.period === selectedPeriod) || {
                          period: selectedPeriod, weeklyGoal: 0, conversations: 0, usersConverted: 0, lcyTransfers: 0, lcyGoal: 0, fcyTransfers: 0, fcyGoal: 0
                        };
                        const updatePayMetric = (field: string, val: number) => {
                          const newMetrics = [...metrics.pay.metrics];
                          const idx = newMetrics.findIndex(m => m.period === selectedPeriod);
                          if (idx > -1) {
                            newMetrics[idx] = { ...newMetrics[idx], [field]: val };
                          } else {
                            newMetrics.push({ 
                              period: selectedPeriod, weeklyGoal: 0, conversations: 0, usersConverted: 0, 
                              lcyTransfers: 0, lcyGoal: 0, fcyTransfers: 0, fcyGoal: 0, [field]: val 
                            });
                          }
                          setMetrics({ ...metrics, pay: { ...metrics.pay, metrics: newMetrics } });
                        };

                        const isCeoOrPm = currentUser?.role === 'CEO' || currentUser?.role === 'PM';

                        return (
                          <div className="space-y-6">
                            {/* Conversations: Target & Actual */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                              <div className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                                Conversations
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <InputGroup 
                                  label="Conversations Goal (Target)" 
                                  value={metric.weeklyGoal} 
                                  onChange={(v) => updatePayMetric('weeklyGoal', Number(v))} 
                                  disabled={!isCeoOrPm} 
                                  isTarget={true}
                                />
                                <InputGroup 
                                  label="Total Conversations (Actual)" 
                                  value={metric.conversations} 
                                  onChange={(v) => updatePayMetric('conversations', Number(v))} 
                                />
                              </div>
                            </div>

                            {/* LCY: Target & Actual */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                              <div className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                                LCY Transfers
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <InputGroup 
                                  label="LCY Goal (Target)" 
                                  value={metric.lcyGoal} 
                                  onChange={(v) => updatePayMetric('lcyGoal', Number(v))} 
                                  disabled={!isCeoOrPm}
                                  isTarget={true}
                                />
                                <InputGroup 
                                  label="LCY Transfers (Actual)" 
                                  value={metric.lcyTransfers} 
                                  onChange={(v) => updatePayMetric('lcyTransfers', Number(v))} 
                                />
                              </div>
                            </div>

                            {/* FCY: Target & Actual */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                              <div className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                                FCY Transfers
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <InputGroup 
                                  label="FCY Goal (Target)" 
                                  value={metric.fcyGoal} 
                                  onChange={(v) => updatePayMetric('fcyGoal', Number(v))} 
                                  disabled={!isCeoOrPm}
                                  isTarget={true}
                                />
                                <InputGroup 
                                  label="FCY Transfers (Actual)" 
                                  value={metric.fcyTransfers} 
                                  onChange={(v) => updatePayMetric('fcyTransfers', Number(v))} 
                                />
                              </div>
                            </div>

                            {/* Additional conversions count */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                              <div className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                                Users Converted
                              </div>
                              <InputGroup 
                                label="Users Converted" 
                                value={metric.usersConverted} 
                                onChange={(v) => updatePayMetric('usersConverted', Number(v))} 
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {editingSection === 'finance' && (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Collapsible Exchange Rates Section */}
                    <div className="p-6 bg-[#F4F6FB] rounded-3xl border border-slate-100/50 mb-6">
                      <button 
                        onClick={() => setIsRatesCollapsed(!isRatesCollapsed)}
                        className="w-full flex items-center justify-between focus:outline-none"
                      >
                        <h3 className="text-sm font-bold text-slate-800">Exchange rate</h3>
                        <ChevronDown 
                          size={18} 
                          className={`text-slate-400 transition-transform duration-200 ${isRatesCollapsed ? '' : 'rotate-180'}`} 
                        />
                      </button>
                      
                      {!isRatesCollapsed && (
                        <div className="flex flex-col gap-5 mt-6 animate-in fade-in duration-200">
                          {['NGN'].map(ccy => {
                            const storedRate = metrics.finance.exchangeRates.find(r => r.currency === ccy)?.rateToUsd ?? 0;
                            return (
                              <ExchangeRateInput
                                key={ccy}
                                currency={ccy}
                                value={storedRate}
                                onCommit={(num) => {
                                  const newRates = [...metrics.finance.exchangeRates];
                                  const idx = newRates.findIndex(r => r.currency === ccy);
                                  if (idx > -1) newRates[idx] = { ...newRates[idx], rateToUsd: num };
                                  else newRates.push({ currency: ccy as Currency, rateToUsd: num });
                                  setMetrics({ ...metrics, finance: { ...metrics.finance, exchangeRates: newRates } });
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <DropdownSelect
                        label="Currency"
                        value={selectedCurrency}
                        options={['NGN', 'USD', 'USDT', 'USDC']}
                        onChange={(v) => setSelectedCurrency(v)}
                        getIcon={getCcyIcon}
                      />
                      <DropdownSelect
                        label="Month Period"
                        value={selectedMonth}
                        options={['May']}
                        onChange={(v) => {
                          setSelectedMonth(v);
                          setSelectedPeriod('month');
                        }}
                        active={selectedPeriod === 'month'}
                      />
                      <DateRangeDropdown
                        label="Day Range"
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        onStartChange={(v) => {
                          setSelectedStartDate(v);
                          setSelectedPeriod('week');
                        }}
                        onEndChange={(v) => {
                          setSelectedEndDate(v);
                          setSelectedPeriod('week');
                        }}
                        active={selectedPeriod === 'week'}
                      />
                    </div>

                    <div className="bg-[#F8F9FD] border border-[#ECEFF6] rounded-[28px] p-8 space-y-10">
                      {['Payables', 'Receivables', 'Payment'].map(type => {
                        const metric = metrics.finance.metrics.find(m => m.period === selectedPeriod && m.loanType === type && m.currency === selectedCurrency) || { loanValue: 0, loanCount: 0, defaultRate: 0 };
                        
                        const updateMetric = (field: string, val: number) => {
                          const newMetrics = [...metrics.finance.metrics];
                          const idx = newMetrics.findIndex(m => m.period === selectedPeriod && m.loanType === type && m.currency === selectedCurrency);
                          if (idx > -1) {
                            newMetrics[idx] = { ...newMetrics[idx], [field]: val };
                          } else {
                            newMetrics.push({ 
                              period: selectedPeriod, 
                              loanType: type as LoanType, 
                              currency: selectedCurrency, 
                              loanValue: field === 'loanValue' ? val : 0, 
                              loanCount: field === 'loanCount' ? val : 0, 
                              defaultRate: field === 'defaultRate' ? val : 0, 
                              [field]: val 
                            });
                          }
                          setMetrics({ ...metrics, finance: { ...metrics.finance, metrics: newMetrics } });
                        };

                        const rateToUsd = selectedCurrency === 'USD' ? 1 : (metrics.finance.exchangeRates.find(r => r.currency === selectedCurrency)?.rateToUsd ?? 0);
                        const usdEquivalent = metric.loanValue * rateToUsd;
                        const symbol = getCcySymbol(selectedCurrency);

                        // Format with commas, drop the decimals to display them separately
                        const formattedValue = metric.loanValue ? metric.loanValue.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '';

                        return (
                          <div key={type} className="flex flex-col gap-4">
                            <div className="font-bold text-slate-700 text-[15px]">
                              {type === 'Payment' ? 'Payment finance' : `${type} finance`}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Amount disbursed */}
                              <div className="flex flex-col gap-2">
                                <label className="text-[14px] text-slate-500 font-medium">Amount disbursed</label>
                                <div className="relative flex items-center bg-white border border-slate-200/60 rounded-[14px] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                  <span className="font-medium text-slate-800 mr-1 text-[15px]">{symbol}</span>
                                  <input 
                                    type="text"
                                    value={formattedValue || (metric.loanValue === 0 ? '0' : '')}
                                    onChange={(e) => updateMetric('loanValue', Number(e.target.value.replace(/[^0-9.]/g, '')))}
                                    className="w-full bg-transparent outline-none font-medium text-slate-800 text-[15px]"
                                    placeholder="0"
                                  />
                                  <span className="text-indigo-400/80 font-medium text-[15px] ml-2">.00</span>
                                </div>
                                {selectedCurrency !== 'USD' && (
                                  <div className="text-slate-500 text-[13px]">
                                    ~ ${usdEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                )}
                              </div>

                              {/* No. of loans */}
                              <div className="flex flex-col gap-2">
                                <label className="text-[14px] text-slate-500 font-medium">No. of loans</label>
                                <div className="relative flex items-center bg-white border border-slate-200/60 rounded-[14px] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                  <input 
                                    type="text"
                                    value={metric.loanCount || ''}
                                    onChange={(e) => updateMetric('loanCount', Number(e.target.value.replace(/[^0-9.]/g, '')))}
                                    className="w-full bg-transparent outline-none font-medium text-slate-800 text-[15px]"
                                    placeholder="--"
                                  />
                                </div>
                              </div>

                              {/* Default rate */}
                              <div className="flex flex-col gap-2">
                                <label className="text-[14px] text-slate-500 font-medium">Default rate</label>
                                <div className="relative flex items-center bg-white border border-slate-200/60 rounded-[14px] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                  <input 
                                    type="text"
                                    value={metric.defaultRate || ''}
                                    onChange={(e) => updateMetric('defaultRate', Number(e.target.value.replace(/[^0-9.]/g, '')))}
                                    className="w-full bg-transparent outline-none font-medium text-slate-800 text-[15px]"
                                    placeholder="--"
                                  />
                                  <span className="text-indigo-400/80 font-medium text-[15px] ml-2">%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-2 text-[15px] text-slate-500 font-medium">
                        Last updated on <span className="font-bold text-slate-700">--</span> by <span className="font-bold text-slate-700">--</span>
                      </div>
                    </div>
                  </div>
                )}

                {editingSection === 'launch' && (
                  <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Multi-Quarter Launch</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Configure history & current roadmap</p>
                      </div>
                      <button 
                        onClick={() => {
                          const baseDepts = (metrics.launchStatus.deptTargets && metrics.launchStatus.deptTargets.length > 0)
                            ? metrics.launchStatus.deptTargets 
                            : [
                                { name: 'Operations', progress: 0 }, 
                                { name: 'Pay', progress: 0 }, 
                                { name: 'Engineering', progress: 0 }
                              ];
                          
                          const newQ: LaunchStatusType = { 
                            phase: `New Phase`, 
                            label: `Historical Quarter`, 
                            progress: 0, 
                            deptTargets: baseDepts.map(d => ({ name: d.name, progress: 0 })) 
                          };
                          
                          setMetrics({ 
                            ...metrics, 
                            launchHistory: [newQ, ...(metrics.launchHistory || [])] 
                          });
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
                      >
                        Add Quarter
                      </button>


                    </div>

                    <div className="space-y-12 pb-10">
                      {/* Current Quarter Section */}
                      <div className="p-8 bg-purple-50/50 rounded-[40px] border border-purple-100 relative group">
                        <div className="absolute -top-3 left-8 px-3 py-1 bg-[#8B5CF6] text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-purple-200">Current Active</div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <InputGroup label="Phase Name" value={metrics.launchStatus.phase} onChange={(v) => setMetrics({...metrics, launchStatus: {...metrics.launchStatus, phase: v}})} />
                          <InputGroup label="Visual Label" value={metrics.launchStatus.label || 'Current'} onChange={(v) => setMetrics({...metrics, launchStatus: {...metrics.launchStatus, label: v}})} />
                        </div>

                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept Progress (%)</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {metrics.launchStatus.deptTargets.filter(d => !editingDept || d.name === editingDept).map((d, i) => {
                              const originalIndex = metrics.launchStatus.deptTargets.findIndex(orig => orig.name === d.name);
                              return (
                                <div key={i} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{d.name}</span>
                                    <span className="text-[11px] font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-lg">{d.progress}%</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="100" 
                                    value={d.progress} 
                                    onChange={(e) => {
                                      const updated = [...metrics.launchStatus.deptTargets];
                                      updated[originalIndex].progress = Number(e.target.value);
                                      setMetrics({...metrics, launchStatus: {...metrics.launchStatus, deptTargets: updated}});
                                    }}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]" 
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* History Quarters */}
                      {(metrics.launchHistory || []).map((q, idx) => (
                        <div key={idx} className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm relative group">
                          <div className="absolute -top-3 left-8 px-3 py-1 bg-slate-400 text-white text-[9px] font-black rounded-full uppercase tracking-widest">History #{idx + 1}</div>

                          
                          <div className="absolute -top-3 right-8 flex gap-2">
                            {deleteConfirmIndex === idx ? (
                              <div className="flex items-center gap-2 animate-in slide-in-from-right-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-tight">Are you sure?</span>
                                <div className="flex gap-1 ml-1">
                                  <button 
                                    onClick={() => {
                                      const currentHistory = metrics.launchHistory || [];
                                      const updated = currentHistory.filter((_, i) => i !== idx);
                                      setMetrics({ ...metrics, launchHistory: updated });
                                      setDeleteConfirmIndex(null);
                                    }}
                                    className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    title="Confirm Delete"
                                  >
                                    <Check size={10} strokeWidth={4} />
                                  </button>
                                  <button 
                                    onClick={() => setDeleteConfirmIndex(null)}
                                    className="w-5 h-5 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
                                    title="Cancel"
                                  >
                                    <X size={10} strokeWidth={4} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    const oldCurrent = metrics.launchStatus;
                                    const newCurrent = metrics.launchHistory![idx];
                                    const newHistory = [...metrics.launchHistory!];
                                    newHistory[idx] = oldCurrent;
                                    setMetrics({ ...metrics, launchStatus: newCurrent, launchHistory: newHistory });
                                  }}
                                  className="px-3 py-1 bg-white border border-slate-100 text-slate-400 hover:text-purple-600 hover:border-purple-100 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-all"
                                >
                                  Set as Current
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteConfirmIndex(idx);
                                  }}
                                  className="px-3 py-1 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-all"
                                >
                                  Delete Quarter
                                </button>
                              </>
                            )}
                          </div>




                          <div className="grid grid-cols-2 gap-6 mb-8">
                            <InputGroup label="Phase Name" value={q.phase} onChange={(v) => {
                              const updated = [...(metrics.launchHistory || [])];
                              updated[idx].phase = v;
                              setMetrics({...metrics, launchHistory: updated});
                            }} />
                            <InputGroup label="Visual Label" value={q.label || q.phase} onChange={(v) => {
                              const updated = [...(metrics.launchHistory || [])];
                              updated[idx].label = v;
                              setMetrics({...metrics, launchHistory: updated});
                            }} />
                          </div>

                          <div className="space-y-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept Progress (%)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 opacity-80 group-hover:opacity-100 transition-opacity">
                              {(q.deptTargets || []).map((d, i) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{d.name}</span>
                                    <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{d.progress}%</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="100" 
                                    value={d.progress} 
                                    onChange={(e) => {
                                      const updated = [...(metrics.launchHistory || [])];
                                      const updatedDepts = [...updated[idx].deptTargets];
                                      updatedDepts[i] = { ...updatedDepts[i], progress: Number(e.target.value) };
                                      updated[idx] = { ...updated[idx], deptTargets: updatedDepts };
                                      setMetrics({...metrics, launchHistory: updated});
                                    }}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400" 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                )}




                {editingSection === 'settings' && (
                  <div className="space-y-10">
                    {/* Security Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Key size={18} className="text-primary" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Security & Account</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Full Name" value={currentUser?.name || ''} onChange={(v) => {
                          if (currentUser) {
                            const updated = users.map(u => u.email === currentUser.email ? {...u, name: v} : u);
                            setUsers(updated);
                            setCurrentUser({...currentUser, name: v});
                          }
                        }} />
                        <InputGroup label="Email Address" value={currentUser?.email || ''} onChange={() => {}} />
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Password</p>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="New Password" 
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold pr-10" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Behavior Section - CEO/HR ONLY */}
                    {hasPermission('settings') && (
                      <div className="pt-10 border-t border-slate-100 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <LayoutDashboard size={18} className="text-primary" />
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dashboard Behavior</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Auto-Scroll</label>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setMetrics({...metrics, settings: {...metrics.settings, scrollEnabled: !metrics.settings.scrollEnabled}})}
                                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${metrics.settings.scrollEnabled ? 'bg-mint-dark' : 'bg-slate-300'}`}
                              >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${metrics.settings.scrollEnabled ? 'translate-x-7' : ''}`} />
                              </button>
                              <span className="text-sm font-bold text-slate-700">
                                {metrics.settings.scrollEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                              When enabled, the dashboard will slowly reveal all metrics via a continuous loop.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scroll Speed</label>
                              <span className="text-xs font-black text-primary">{metrics.settings.scrollSpeed} px/s</span>
                            </div>
                            <input 
                              type="range" 
                              min="2" 
                              max="30" 
                              step="2"
                              value={metrics.settings.scrollSpeed}
                              onChange={(e) => setMetrics({...metrics, settings: {...metrics.settings, scrollSpeed: Number(e.target.value)}})}
                              className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                              <span>Slower</span>
                              <span>Faster</span>
                            </div>
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-4 pt-6 border-t border-slate-200">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard Main Heading</label>
                            <input 
                              type="text"
                              value={metrics.settings.dashboardTitle}
                              onChange={(e) => setMetrics({...metrics, settings: {...metrics.settings, dashboardTitle: e.target.value}})}
                              placeholder="e.g. FY'26 Operating Dashboard"
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                              This text will appear as the main title at the top of the dashboard.
                            </p>
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-4 pt-6 border-t border-slate-200">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quarterly Targets Heading</label>
                            <input 
                              type="text"
                              value={metrics.settings.launchStatusTitle}
                              onChange={(e) => setMetrics({...metrics, settings: {...metrics.settings, launchStatusTitle: e.target.value}})}
                              placeholder="e.g. Launch Readiness"
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                              Change the title of the Quarterly Targets / Launch Status card.
                            </p>
                          </div>

                          {currentUser?.role === 'CEO' && (
                            <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-200">
                              <div className="flex justify-between items-center mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departments & Heads</label>
                                <button 
                                  onClick={() => {
                                    const newDepts = [...(metrics.settings.departments || []), { name: 'New Department', headEmail: '' }];
                                    setMetrics({...metrics, settings: {...metrics.settings, departments: newDepts}});
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 transition-all"
                                >
                                  <Plus size={12} /> Add Dept
                                </button>
                              </div>
                              <div className="space-y-4">
                                {(metrics.settings.departments || []).map((dept: Department, i: number) => (
                                  <div key={i} className="grid grid-cols-2 gap-4 p-4 bg-white border border-slate-100 rounded-xl relative group">
                                    <button 
                                      onClick={() => {
                                        const updated = metrics.settings.departments!.filter((_: Department, idx: number) => idx !== i);
                                        setMetrics({...metrics, settings: {...metrics.settings, departments: updated}});
                                      }}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase">Name</label>
                                      <input 
                                        type="text" 
                                        value={dept.name} 
                                        onChange={(v) => {
                                          const updated = [...metrics.settings.departments!];
                                          updated[i].name = v.target.value;
                                          setMetrics({...metrics, settings: {...metrics.settings, departments: updated}});
                                        }} 
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold text-slate-400 uppercase">Dept Head</label>
                                      <select 
                                        value={dept.headEmail || ''} 
                                        onChange={(e) => {
                                          const updated = [...metrics.settings.departments!];
                                          updated[i].headEmail = e.target.value;
                                          setMetrics({...metrics, settings: {...metrics.settings, departments: updated}});
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold focus:outline-none"
                                      >
                                        <option value="">Select Head</option>
                                        {users.map(u => (
                                          <option key={u.email} value={u.email}>{u.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Governance Section - Only for CEO, HR, PM */}
                    {hasPermission('users') && (
                      <div className="pt-10 border-t border-slate-100 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield size={18} className="text-primary" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Governance & Teams</h3>
                          </div>
                          <button 
                            onClick={() => {
                              setInviteStep(1);
                              setEditingUserEmail(null);
                              setIsInviteModalOpen(true);
                              setInviteForm({ email: '', password: '', role: '', permissions: ['settings'] });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 transition-all"
                          >
                            <UserPlus size={14} />
                            Invite Member
                          </button>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissions by Role</p>
                          <div className="grid grid-cols-1 gap-3">
                            {ALL_ROLES.map(role => (
                              <div key={role} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <p className="text-xs font-black text-slate-900">{role}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{ROLE_LABELS[role]}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {ALL_PERMISSIONS.map(perm => {
                                    const hasPerm = permissions[role]?.includes(perm);
                                    return (
                                      <button
                                        key={perm}
                                        onClick={() => {
                                          const currentPerms = permissions[role] || [];
                                          const newPerms = hasPerm 
                                            ? currentPerms.filter(p => p !== perm)
                                            : [...currentPerms, perm];
                                          setPermissions({...permissions, [role]: newPerms});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 ${
                                          hasPerm 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                            : 'bg-white text-slate-400 border border-slate-200 hover:border-primary/30'
                                        }`}
                                      >
                                        {hasPerm && <Check size={10} />}
                                        {perm}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Users</p>
                          <div className="divide-y divide-slate-100">
                            {users.map((u, i) => (
                              <div key={i} className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black text-[10px]">{u.name[0]}</div>
                                  <div>
                                    <p className="text-xs font-black text-slate-900">{u.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight bg-slate-100 px-2 py-1 rounded-md">{u.role}</p>
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => {
                                        setEditingUserEmail(u.email);
                                        setInviteForm({
                                          email: u.email,
                                          password: '', // Password not editable here for security
                                          role: u.role,
                                          permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : (permissions[u.role] || ['settings'])
                                        });
                                        setInviteStep(1);
                                        setIsInviteModalOpen(true);
                                      }}
                                      className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                      title="Edit Permissions"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    {currentUser?.email !== u.email && (
                                      <button 
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                            const updatedUsers = users.filter((_, index) => index !== i);
                                            const query = `
                                              mutation DeleteUser($email: String!) {
                                                deleteUser(email: $email)
                                              }
                                            `;
                                            const variables = { email: u.email };

                                            fetch('/api/graphql', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ query, variables })
                                            }).then(res => res.json())
                                            .then(({ errors }) => {
                                              if (!errors) {
                                                setUsers(updatedUsers);
                                                setMessage({ type: 'success', text: `User ${u.name} deleted.` });
                                              } else {
                                                setMessage({ type: 'error', text: errors[0].message || 'Failed to delete user from database.' });
                                              }
                                              setTimeout(() => setMessage(null), 3000);
                                            });
                                          }
                                        }}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        title="Delete User"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {editingSection === 'engineering' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engineering Projects</p>
                        <button 
                          onClick={() => {
                            const newProject: EngineeringProject = { 
                              id: `proj-${Date.now()}`,
                              title: 'New Project', 
                              name: 'New Project',
                              status: 'In Development', 
                              dateValue: 'Q2 2026',
                              dateLabel: 'Target',
                              description: 'Core infrastructure expansion',
                              progress: 0,
                              impactScore: 50
                            };
                            setMetrics({...metrics, engineering: {...metrics.engineering, projects: [...metrics.engineering.projects, newProject]}});
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 transition-all"
                        >
                          <Plus size={12} />
                          Add Project
                        </button>
                      </div>
                      <div className="space-y-4">
                        {metrics.engineering.projects.map((p, i) => (
                          <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group">
                            <button 
                              onClick={() => {
                                const updated = metrics.engineering.projects.filter((_, index) => index !== i);
                                setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                              }}
                              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                              title="Remove Project"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="pr-10 space-y-3">
                              <InputGroup label="Project Title" value={p.title || p.name || ''} onChange={(v) => {
                                const updated = [...metrics.engineering.projects];
                                updated[i].title = v;
                                updated[i].name = v;
                                setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                              }} />
                              <InputGroup label="Project Description" value={p.description || ''} onChange={(v) => {
                                const updated = [...metrics.engineering.projects];
                                updated[i].description = v;
                                setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                              }} />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                                <select value={p.status || 'In Development'} onChange={(e) => {
                                  const updated = [...metrics.engineering.projects];
                                  updated[i].status = e.target.value as "Live" | "In Development" | "Testing" | "Blocked";
                                  setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                                }} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold mt-1">
                                  <option value="Live">Live</option>
                                  <option value="In Development">In Development</option>
                                  <option value="Testing">Testing</option>
                                  <option value="Blocked">Blocked</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Date Label (Target/Deployed)</label>
                                <input type="text" value={p.dateLabel || ''} onChange={(e) => {
                                  const updated = [...metrics.engineering.projects];
                                  updated[i].dateLabel = e.target.value;
                                  setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                                }} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold mt-1" placeholder="e.g. TARGET" />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Date Value</label>
                                <input type="text" value={p.dateValue || ''} onChange={(e) => {
                                  const updated = [...metrics.engineering.projects];
                                  updated[i].dateValue = e.target.value;
                                  setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                                }} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold mt-1" placeholder="e.g. May 2026" />
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Completion Progress (%)</label>
                                <input type="number" min="0" max="100" value={p.progress !== undefined ? p.progress : 0} onChange={(e) => {
                                  const updated = [...metrics.engineering.projects];
                                  updated[i].progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                                }} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold mt-1" placeholder="e.g. 75" />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Impact Score (0-100)</label>
                                <input type="number" min="0" max="100" value={p.impactScore !== undefined ? p.impactScore : 50} onChange={(e) => {
                                  const updated = [...metrics.engineering.projects];
                                  updated[i].impactScore = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                                }} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold mt-1" placeholder="e.g. 90" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">System Health</p>
                      <div className="space-y-4">
                        {metrics.engineering.health.map((h, i) => (
                          <div key={i} className="flex gap-3 items-end">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Metric Label</label>
                              <input type="text" value={h.label || ''} onChange={(e) => {
                                const updated = [...metrics.engineering.health];
                                updated[i].label = e.target.value;
                                setMetrics({...metrics, engineering: {...metrics.engineering, health: updated}});
                              }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>
                            <div className="w-24">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Value</label>
                              <input type="text" value={h.value || ''} onChange={(e) => {
                                const updated = [...metrics.engineering.health];
                                updated[i].value = e.target.value;
                                setMetrics({...metrics, engineering: {...metrics.engineering, health: updated}});
                              }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>
                            <div className="w-24">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                              <select value={h.isGood ? 'good' : 'bad'} onChange={(e) => {
                                const updated = [...metrics.engineering.health];
                                updated[i].isGood = e.target.value === 'good';
                                setMetrics({...metrics, engineering: {...metrics.engineering, health: updated}});
                              }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold">
                                <option value="good">Good</option>
                                <option value="bad">Warning</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingDept(null); }}
                  className="flex-1 py-5 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!!savingSection}
                  className="flex-1 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {savingSection ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                  Confirm Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-primary" />
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">{editingUserEmail ? 'Edit Member' : 'Invite Member'}</h2>
                  <p className="text-slate-500 font-medium text-sm">Step {inviteStep} of {editingUserEmail ? '1' : '2'}</p>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {inviteStep === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Role/Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Operations Lead"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_PERMISSIONS.map(perm => (
                        <button
                          key={perm}
                          disabled={perm === 'settings'}
                          onClick={() => {
                            if (perm === 'settings') return;
                            const newPerms = inviteForm.permissions.includes(perm)
                              ? inviteForm.permissions.filter(p => p !== perm)
                              : [...inviteForm.permissions, perm];
                            setInviteForm({...inviteForm, permissions: newPerms});
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${inviteForm.permissions.includes(perm) ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 border-slate-100 text-slate-400'} ${perm === 'settings' ? 'opacity-80' : ''}`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${inviteForm.permissions.includes(perm) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                            {(inviteForm.permissions.includes(perm) || perm === 'settings') && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tight">{perm}</span>
                          {perm === 'settings' && <span className="text-[8px] font-black text-primary/50 ml-auto">REQUIRED</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                    <button 
                      onClick={() => {
                        if (!inviteForm.role || inviteForm.permissions.length === 0) return;
                        if (editingUserEmail) {
                          // Save changes for existing user
                          const updatedUsers = users.map(u => 
                            u.email === editingUserEmail 
                              ? { ...u, role: inviteForm.role, permissions: inviteForm.permissions }
                              : u
                          );
                          
                          const query = `
                            mutation UpdateUserPermissions($email: String!, $role: String!, $permissions: [String!]!) {
                              updateUserPermissions(email: $email, role: $role, permissions: $permissions) {
                                email
                                role
                                permissions
                              }
                            }
                          `;
                          const variables = {
                            email: editingUserEmail,
                            role: inviteForm.role,
                            permissions: inviteForm.permissions
                          };
                          
                          fetch('/api/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query, variables })
                          }).then(res => res.json())
                          .then(({ errors }) => {
                            if (!errors) {
                              setUsers(updatedUsers);
                              if (currentUser && currentUser.email === editingUserEmail) {
                                const updatedSelf = updatedUsers.find(u => u.email === editingUserEmail);
                                if (updatedSelf) setCurrentUser(updatedSelf);
                              }
                              setIsInviteModalOpen(false);
                              setMessage({ type: 'success', text: `User ${editingUserEmail} updated.` });
                            } else {
                              setMessage({ type: 'error', text: errors[0].message || 'Failed to update user in database.' });
                            }
                            setTimeout(() => setMessage(null), 3000);
                          });
                        } else {
                          setInviteStep(2);
                        }
                      }}
                      disabled={!inviteForm.role || inviteForm.permissions.length === 0}
                      className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 disabled:grayscale disabled:scale-100 transition-all"
                    >
                      {editingUserEmail ? 'Save Changes' : 'Next Step'}
                    </button>
                  </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="email@tradevu.co"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporary Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        value={inviteForm.password}
                        onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setInviteStep(1)}
                      className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!inviteForm.email || !inviteForm.password) return;
                        const newUser: User = { 
                          name: inviteForm.email.split('@')[0], 
                          email: inviteForm.email, 
                          role: inviteForm.role, 
                          permissions: inviteForm.permissions,
                          password: inviteForm.password,
                          requiresPasswordChange: true
                        };
                        const updatedUsers = [...users, newUser];
                        
                        const query = `
                          mutation UpsertUser($user: UserInput!) {
                            upsertUser(user: $user) {
                              email
                              name
                              role
                              permissions
                              requiresPasswordChange
                            }
                          }
                        `;
                        const variables = { user: newUser };

                        fetch('/api/graphql', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ query, variables })
                        }).then(res => res.json())
                        .then(({ errors }) => {
                          if (!errors) {
                            setUsers(updatedUsers);
                            setIsInviteModalOpen(false);
                            setMessage({ type: 'success', text: `Invitation sent to ${inviteForm.email}` });
                          } else {
                            setMessage({ type: 'error', text: errors[0].message || 'Failed to save new user to database.' });
                          }
                          setTimeout(() => setMessage(null), 3000);
                        });
                      }}
                      className="flex-2 px-6 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                      Send Invitation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputGroup({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  disabled = false, 
  isTarget = false 
}: { 
  label: string, 
  value: string | number, 
  onChange: (v: string) => void, 
  type?: string, 
  disabled?: boolean, 
  isTarget?: boolean 
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {disabled && (
          <span className="text-[8px] font-black text-[#7C3AED] uppercase tracking-tighter bg-purple-50 px-1.5 py-0.5 rounded">
            {isTarget ? 'CEO/PM ONLY' : 'CEO ONLY'}
          </span>
        )}
      </div>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold transition-all ${
          disabled 
            ? isTarget
              ? 'bg-[#F5F3FF] text-[#6B21A8] border-[#EDE9FE] cursor-not-allowed font-extrabold'
              : 'bg-slate-50 text-slate-400 border-slate-100 opacity-50 grayscale cursor-not-allowed border-dashed' 
            : 'bg-slate-50 text-slate-900 border-slate-100'
        }`}
      />
    </div>
  );
}

function ExchangeRateInput({ currency, value, onCommit }: { currency: string; value: number; onCommit: (n: number) => void }) {
  const [prevValue, setPrevValue] = useState(value);
  const [raw, setRaw] = useState(value === 0 ? '' : String(value));

  if (value !== prevValue) {
    setPrevValue(value);
    setRaw(value === 0 ? '' : String(value));
  }

  return (
    <div className="flex items-center gap-3">
      {/* Base USD Input (Disabled) */}
      <div className="flex-1 space-y-1">
        <div className="px-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{`USD`}</label>
        </div>
        <div className="w-full px-5 py-4 bg-[#F0F2FA] text-slate-800 border border-slate-100 rounded-2xl font-bold text-sm select-none h-[54px] flex items-center">
          1
        </div>
      </div>

      {/* Exchange Icon */}
      <div className="pt-5 text-slate-400 flex-shrink-0 flex items-center justify-center">
        <ArrowLeftRight size={16} />
      </div>

      {/* Target Currency Input (Editable) */}
      <div className="flex-1 space-y-1">
        <div className="px-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{currency}</label>
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => {
            const num = parseFloat(raw);
            if (!isNaN(num)) onCommit(num);
          }}
          placeholder="0.00"
          className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] outline-none font-bold text-slate-900 transition-all text-sm shadow-sm hover:border-slate-200 h-[54px]"
        />
      </div>
    </div>
  );
}

// Helper utilities for flag icons and currency symbols
const getCcyFlag = (ccy: string) => {
  switch (ccy) {
    case 'NGN': return '🇳🇬';
    case 'USD': return '🇺🇸';
    case 'USDT': return '🪙';
    case 'USDC': return '🪙';
    default: return '🪙';
  }
};

const getCcySymbol = (ccy: string) => {
  switch (ccy) {
    case 'NGN': return '₦';
    case 'USD': return '$';
    case 'USDT': return '₮';
    case 'USDC': return '$';
    default: return '$';
  }
};

const getCcyIcon = (ccy: string) => {
  return (
    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] shadow-sm border border-slate-100 flex-shrink-0 select-none">
      {getCcyFlag(ccy)}
    </div>
  );
};

// Premium Custom Date Range Dropdown Component
function DateRangeDropdown({
  label,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  active = false
}: {
  label: string;
  startDate: string;
  endDate: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  active?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateRangeLabel = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 'Select Date Range';
    const parseDate = (str: string) => {
      const parts = str.split('-');
      if (parts.length !== 3) return new Date();
      const [y, m, d] = parts.map(Number);
      return new Date(y, m - 1, d);
    };
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startDay = start.getDate();
    const startMonth = months[start.getMonth()];
    const endDay = end.getDate();
    const endMonth = months[end.getMonth()];
    
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[140px]">
      <div className="px-1 mb-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-2xl transition-all outline-none font-bold text-xs ${
          active 
            ? 'border-slate-200 bg-white text-slate-800 ring-2 ring-slate-50 shadow-sm' 
            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
        }`}
      >
        <span className="truncate">{formatDateRangeLabel(startDate, endDate)}</span>
        <ChevronDown size={14} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/80 p-5 z-50 w-72 space-y-4 origin-top-right transition-all duration-200 ease-out">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Customize Range
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  onStartChange(e.target.value);
                }}
                className="w-full px-2.5 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:border-[#7C3AED] focus:bg-white transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  onEndChange(e.target.value);
                }}
                className="w-full px-2.5 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:border-[#7C3AED] focus:bg-white transition-all cursor-pointer"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/10 active:scale-[0.98] transition-all"
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
}

// Premium Custom Dropdown Picker Component
function DropdownSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  active = false,
  getIcon,
  getLabel
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (val: T) => void;
  active?: boolean;
  getIcon?: (opt: T) => React.ReactNode;
  getLabel?: (opt: T) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = getLabel ? getLabel(value) : value;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[100px]">
      <div className="px-1 mb-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-2xl transition-all outline-none font-bold text-xs ${
          active 
            ? 'border-slate-200 bg-white text-slate-800 ring-2 ring-slate-50 shadow-sm' 
            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {getIcon && getIcon(value)}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold transition-colors ${
                value === opt
                  ? 'bg-slate-50 text-slate-900 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {getIcon && getIcon(opt)}
                <span>{getLabel ? getLabel(opt) : opt}</span>
              </div>
              {value === opt && <Check size={12} className="text-slate-900 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Disbursed Loan input with live USD equivalent calculation
function DisbursedLoanInput({
  label,
  value,
  currency,
  exchangeRates,
  onChange
}: {
  label: string;
  value: number;
  currency: 'USD' | 'NGN' | 'USDT' | 'USDC';
  exchangeRates: ExchangeRate[];
  onChange: (val: number) => void;
}) {
  const symbol = getCcySymbol(currency);
  const rateToUsd = currency === 'USD' ? 1 : (exchangeRates.find(r => r.currency === currency)?.rateToUsd ?? 0);
  const usdEquivalent = value * rateToUsd;

  return (
    <div className="space-y-2 flex-1">
      <div className="px-1 flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {currency !== 'USD' && value > 0 && (
          <span className="text-[9px] font-bold text-indigo-500 transition-all animate-pulse truncate max-w-[120px]">
            ~ ${usdEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <span className="absolute left-4 font-extrabold text-slate-400 select-none text-sm">
          {symbol}
        </span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full pl-8 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all text-sm animate-in fade-in duration-200"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}

