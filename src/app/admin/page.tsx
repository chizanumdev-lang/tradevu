'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, RefreshCcw, Lock, LogOut, TrendingUp, 
  Activity, Layers, CreditCard, LayoutDashboard,
  ArrowRight, CheckCircle2, Globe, Target, MessageSquare, 
  DollarSign, Edit3, X, Save, Plus, Trash2, Settings, Key, Shield, UserPlus, Check, Eye, EyeOff
} from 'lucide-react';
import Image from 'next/image';
import { DashboardData, EngineeringProject, Role, User, LaunchStatus as LaunchStatusType, DeptTarget as DeptTargetType } from '@/types/dashboard';
import { LaunchStatus } from '@/components/dashboard/LaunchStatus';

import { RevenueRing } from '@/components/dashboard/RevenueRing';
import { CustomerCard } from '@/components/dashboard/CustomerCard';
import { OpsCard } from '@/components/dashboard/OpsCard';
import { FinanceCard } from '@/components/dashboard/FinanceCard';
import { EngineeringCard } from '@/components/dashboard/EngineeringCard';

const AUTHORIZED_USERS: User[] = [
  { email: 'nkiru@tradevu.africa', name: 'Nkiru', role: 'CEO', password: 'password123' },
  { email: 'tola@tradevu.co', name: 'Tola', role: 'HR', password: 'password123' },
  { email: 'kene@tradevu.co', name: 'Kene', role: 'PM', password: 'password123' },
];

const INITIAL_PERMISSIONS: Record<string, string[]> = {
  CEO: ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings'],
  PM: ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings'],
  HR: ['launch', 'users', 'settings', 'ops', 'pay'],
};

const ROLE_LABELS: Record<string, string> = {
  CEO: 'Chief Executive Officer',
  HR: 'Human Resources',
  PM: 'Project Manager',
};

const ALL_ROLES: Role[] = ['CEO', 'HR', 'PM'];
const ALL_PERMISSIONS = ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings'];

export default function AdminPage() {
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


  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    // Check user-specific permissions first
    if (currentUser.permissions && currentUser.permissions.length > 0) {
      return currentUser.permissions.includes(permission);
    }
    // Fallback to role-based permissions
    return INITIAL_PERMISSIONS[currentUser.role]?.includes(permission) || false;
  };

  const fetchDashboard = () => {
    setLoading(true);
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if ('error' in data) {
          setError(data.error);
        } else {
          setMetrics(data);
          if (data.users) setUsers(data.users);
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
    fetchDashboard();
    setMounted(true);
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
      
      // Persist to DB
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: updatedUsers })
      }).then(res => {
        if (res.ok) {
          setUsers(updatedUsers);
          // Log them in after password change
          const updatedUser = { ...passwordChangeUser, password: passwordChangeForm.newPassword, requiresPasswordChange: false };
          setCurrentUser(updatedUser);
          setIsLoggedIn(true);
          setPasswordChangeUser(null);
          setPasswordChangeForm({ newPassword: '', confirmPassword: '' });
          setPasswordChangeError(null);
        } else {
          setPasswordChangeError('Failed to save new password to database.');
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
    if (!currentUser) return false;
    // Check if user has explicit permissions assigned
    if (currentUser.permissions) {
      return currentUser.permissions.includes(section);
    }
    // Fallback to role-based permissions for legacy users
    return permissions[currentUser.role]?.includes(section) || false;
  };

  const handleOpenEdit = (section: string) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingSection || !metrics) return;
    setSavingSection(editingSection);
    try {
      const headers = { 'Content-Type': 'application/json' };
      let res;
      if (editingSection === 'revenue') {
        res = await fetch('/api/metrics/revenue/annual', {
          method: 'POST', headers, body: JSON.stringify({ goal: metrics.revenueAnnual.goal, current: metrics.revenueAnnual.current })
        });
      } else if (editingSection === 'customers') {
        res = await fetch('/api/metrics/customers/monthly', {
          method: 'POST', headers, body: JSON.stringify({
            totalCustomers: metrics.customersMonthly.current,
            monthlyGoal: metrics.customersMonthly.goal,
            activeMonthly: metrics.customersMonthly.activeMonthly
          })
        });
      } else if (editingSection === 'ops') {
        res = await fetch('/api/ops/weekly', {
          method: 'POST', headers, body: JSON.stringify({
            weeklyGoal: metrics.opsWeekly.weeklyGoal,
            visits: metrics.opsWeekly.visits,
            conversations: metrics.opsWeekly.conversations,
            usersConverted: metrics.opsWeekly.usersConverted || 0
          })
        });
      } else if (editingSection === 'pay') {
        res = await fetch('/api/pay/weekly', {
          method: 'POST', headers, body: JSON.stringify({
            weeklyGoal: metrics.payWeekly.weeklyGoal,
            conversations: metrics.payWeekly.conversations,
            usersConverted: metrics.payWeekly.usersConverted || 0,
            lcyTransfers: metrics.payWeekly.transfers[0]?.current || 0,
            lcyGoal: metrics.payWeekly.transfers[0]?.goal || 0,
            fcyTransfers: metrics.payWeekly.transfers[1]?.current || 0,
            fcyGoal: metrics.payWeekly.transfers[1]?.goal || 0
          })
        });
      } else if (editingSection === 'launch') {
        const phases = [
          { phase: metrics.launchStatus.phase, label: metrics.launchStatus.label || 'Current', deptTargets: metrics.launchStatus.deptTargets },
          ...(metrics.launchHistory || []).map(h => ({ phase: h.phase, label: h.label, deptTargets: h.deptTargets }))
        ];
        res = await fetch('/api/launch/status', {
          method: 'POST', headers, body: JSON.stringify({ phases })
        });

      } else if (editingSection === 'finance') {
        res = await fetch('/api/finance/weekly', {
          method: 'POST', headers, body: JSON.stringify({
            loanDisbursementValue: metrics.financeWeekly.loanDisbursementValue,
            loanDisbursementTrend: metrics.financeWeekly.loanDisbursementTrend,
            loansDisbursed: metrics.financeWeekly.loansDisbursed,
            loansDisbursedTrend: metrics.financeWeekly.loansDisbursedTrend,
            defaultRate: metrics.financeWeekly.defaultRate,
            defaultRateTrend: metrics.financeWeekly.defaultRateTrend
          })
        });
      } else if (editingSection === 'engineering') {
        res = await fetch('/api/engineering/milestone', {
          method: 'POST', headers, body: JSON.stringify({
            projects: metrics.engineering.projects,
            health: metrics.engineering.health
          })
        });
      } else if (editingSection === 'settings') {
        res = await fetch('/api/settings', {
          method: 'POST', headers, body: JSON.stringify({
            scrollSpeed: metrics.settings.scrollSpeed,
            scrollEnabled: metrics.settings.scrollEnabled
          })
        });
      }
      
      if (res && !res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save');
      }

      setMessage({ type: 'success', text: `${editingSection.toUpperCase()} updated successfully.` });
      setIsModalOpen(false);
      fetchDashboard();
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to update ${editingSection}.` });
    } finally {
      setSavingSection(null);
      setTimeout(() => setMessage(null), 3000);
    }
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
      <main className="max-w-[1440px] mx-auto px-10 pt-28 pb-20 relative">
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
            <p className="text-[13px] font-semibold text-slate-400">
              Last updated: {displayDate}
            </p>
          </div>
        </header>

        {/* ── Mirror Grid ─────────────────────── */}
        {metrics && (
          <div className="grid grid-cols-12 gap-6">

            {/* ── Top Row (3 cards, each 4 cols) ── */}
            <div className="col-span-12 md:col-span-4">
              <RevenueRing
                goal={metrics.revenueAnnual.goal}
                current={metrics.revenueAnnual.current}
                percentage={metrics.revenueAnnual.percentage}
                editMode={editMode && canEdit('revenue')}
                onEdit={() => handleOpenEdit('revenue')}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <CustomerCard
                total={metrics.customersMonthly.current}
                goal={metrics.customersMonthly.goal}
                activeMonthly={metrics.customersMonthly.activeMonthly}
                trend={metrics.customersMonthly.percentageChange}
                editMode={editMode && canEdit('customers')}
                onEdit={() => handleOpenEdit('customers')}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
               <LaunchStatus
                current={metrics.launchStatus}
                history={metrics.launchHistory}
                editMode={editMode && canEdit('launch')}
                onEdit={() => handleOpenEdit('launch')}
              />
            </div>


            {/* ── Bottom Row (4 cards, each 3 cols) ── */}
            <div className="col-span-12 md:col-span-3">
              <OpsCard
                type="OPS"
                mainMetric={{
                  label: 'Visits',
                  current: metrics.opsWeekly.visits,
                  goal: metrics.opsWeekly.weeklyGoal,
                }}
                subMetric={{
                  label: 'Conversions',
                  value: metrics.opsWeekly.usersConverted || 0,
                  trend: 25,
                }}
                conversion={{
                  label: 'Conversion Rate',
                  value: metrics.opsWeekly.conversionRate,
                }}
                editMode={editMode && canEdit('ops')}
                onEdit={() => handleOpenEdit('ops')}
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <OpsCard
                type="PAY"
                mainMetric={{
                  label: 'Conversations',
                  current: metrics.payWeekly.conversations,
                  goal: metrics.payWeekly.weeklyGoal,
                }}
                conversion={{
                  label: 'Conversation → Conversion Rate',
                  value: metrics.payWeekly.conversionRate,
                }}
                listMetrics={metrics.payWeekly.transfers}
                editMode={editMode && canEdit('pay')}
                onEdit={() => handleOpenEdit('pay')}
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <FinanceCard 
                data={metrics.financeWeekly} 
                editMode={editMode && canEdit('finance')}
                onEdit={() => handleOpenEdit('finance')}
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <EngineeringCard
                projects={metrics.engineering.projects}
                health={metrics.engineering.health}
                scrollSpeed={metrics.settings.scrollSpeed}
                scrollEnabled={metrics.settings.scrollEnabled}
                editMode={editMode && canEdit('engineering')}
                onEdit={() => handleOpenEdit('engineering')}
              />
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
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
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

                {editingSection === 'ops' && (
                  <>
                    <InputGroup label="Weekly Visits Goal" value={metrics.opsWeekly.weeklyGoal} onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, weeklyGoal: Number(v)}})} disabled={currentUser?.role !== 'CEO'} />
                    <InputGroup label="Current Visits" value={metrics.opsWeekly.visits} onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, visits: Number(v)}})} />
                    <InputGroup label="Users Converted" value={metrics.opsWeekly.usersConverted || 0} onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, usersConverted: Number(v)}})} />
                  </>
                )}

                {editingSection === 'pay' && (
                  <>
                    <InputGroup label="Engagement Goal" value={metrics.payWeekly.weeklyGoal} onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, weeklyGoal: Number(v)}})} disabled={currentUser?.role !== 'CEO'} />
                    <InputGroup label="Total Conversations" value={metrics.payWeekly.conversations} onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, conversations: Number(v)}})} />
                    <InputGroup label="Users Converted" value={metrics.payWeekly.usersConverted || 0} onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, usersConverted: Number(v)}})} />
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transfer Channels</p>
                      <div className="space-y-4">
                        {metrics.payWeekly.transfers.map((t, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-600 w-20">{t.label}</span>
                            <input 
                              type="number" 
                              value={t.current} 
                              onChange={(e) => {
                                const updated = [...metrics.payWeekly.transfers];
                                updated[i].current = Number(e.target.value);
                                setMetrics({...metrics, payWeekly: {...metrics.payWeekly, transfers: updated}});
                              }}
                              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {editingSection === 'finance' && (
                  <>
                    <InputGroup label="Loan Disbursement Value ($)" value={metrics.financeWeekly.loanDisbursementValue} onChange={(v) => setMetrics({...metrics, financeWeekly: {...metrics.financeWeekly, loanDisbursementValue: Number(v)}})} />
                    <InputGroup label="Disbursement Trend (%)" value={metrics.financeWeekly.loanDisbursementTrend} onChange={(v) => setMetrics({...metrics, financeWeekly: {...metrics.financeWeekly, loanDisbursementTrend: Number(v)}})} />
                    <InputGroup label="Loans Disbursed" value={metrics.financeWeekly.loansDisbursed} onChange={(v) => setMetrics({...metrics, financeWeekly: {...metrics.financeWeekly, loansDisbursed: Number(v)}})} />
                    <InputGroup label="Loans Disbursed Trend (%)" value={metrics.financeWeekly.loansDisbursedTrend} onChange={(v) => setMetrics({...metrics, financeWeekly: {...metrics.financeWeekly, loansDisbursedTrend: Number(v)}})} />
                    <InputGroup label="Default Rate (%)" value={metrics.financeWeekly.defaultRate} onChange={(v) => setMetrics({...metrics, financeWeekly: {...metrics.financeWeekly, defaultRate: Number(v)}})} />
                    <InputGroup label="Default Rate Trend (%)" value={metrics.financeWeekly.defaultRateTrend} onChange={(v) => setMetrics({...metrics, financeWeekly: {...metrics.financeWeekly, defaultRateTrend: Number(v)}})} />
                  </>
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
                            {metrics.launchStatus.deptTargets.map((d, i) => (
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
                                    updated[i].progress = Number(e.target.value);
                                    setMetrics({...metrics, launchStatus: {...metrics.launchStatus, deptTargets: updated}});
                                  }}
                                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]" 
                                />
                              </div>
                            ))}
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
                                  {currentUser?.email !== u.email && (
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                          const updatedUsers = users.filter((_, index) => index !== i);
                                          fetch('/api/users', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ users: updatedUsers })
                                          }).then(res => {
                                            if (res.ok) {
                                              setUsers(updatedUsers);
                                              setMessage({ type: 'success', text: `User ${u.name} deleted.` });
                                            } else {
                                              setMessage({ type: 'error', text: 'Failed to delete user from database.' });
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
                              description: 'Core infrastructure expansion'
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
                          <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
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
                            <div className="pr-10">
                              <InputGroup label="Project Title" value={p.title || p.name || ''} onChange={(v) => {
                                const updated = [...metrics.engineering.projects];
                                updated[i].title = v;
                                updated[i].name = v;
                                setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                              }} />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                                <select value={p.status || 'In Development'} onChange={(e) => {
                                  const updated = [...metrics.engineering.projects];
                                  updated[i].status = e.target.value as "Live" | "In Development" | "Testing";
                                  setMetrics({...metrics, engineering: {...metrics.engineering, projects: updated}});
                                }} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold mt-1">
                                  <option value="Live">Live</option>
                                  <option value="In Development">In Development</option>
                                  <option value="Testing">Testing</option>
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
                  onClick={() => setIsModalOpen(false)}
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
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Invite Member</h2>
                  <p className="text-slate-500 font-medium text-sm">Step {inviteStep} of 2</p>
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
                      setInviteStep(2);
                    }}
                    disabled={!inviteForm.role || inviteForm.permissions.length === 0}
                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 disabled:grayscale disabled:scale-100 transition-all"
                  >
                    Next Step
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
                        
                        fetch('/api/users', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ users: updatedUsers })
                        }).then(res => {
                          if (res.ok) {
                            setUsers(updatedUsers);
                            setIsInviteModalOpen(false);
                            setMessage({ type: 'success', text: `Invitation sent to ${inviteForm.email}` });
                          } else {
                            setMessage({ type: 'error', text: 'Failed to save new user to database.' });
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

function InputGroup({ label, value, onChange, type = 'text', disabled = false }: { label: string, value: string | number, onChange: (v: string) => void, type?: string, disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {disabled && (
          <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter bg-rose-50 px-1.5 py-0.5 rounded">CEO ONLY</span>
        )}
      </div>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-900 transition-all ${disabled ? 'opacity-50 grayscale cursor-not-allowed border-dashed' : ''}`}
      />
    </div>
  );
}
