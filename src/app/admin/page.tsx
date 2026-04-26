'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Settings, ShieldCheck, ChevronRight, 
  Save, RefreshCcw, Lock, Trash2, UserPlus, Search, Bell, 
  HelpCircle, User as UserIcon, LogOut, TrendingUp, 
  Activity, Layers, CreditCard, LayoutDashboard, Database,
  ArrowRight, CheckCircle2, MoreVertical, Filter, Globe,
  Target, MessageSquare, DollarSign
} from 'lucide-react';
import { DashboardData, EngineeringProject, Role, User } from '@/types/dashboard';

const AUTHORIZED_USERS: User[] = [
  { email: 'kene@tradevu.co', name: 'Kene', role: 'PM', password: 'password123' },
  { email: 'tola@tradevu.co', name: 'Tola', role: 'HR', password: 'password123' },
  { email: 'nkiru@tradevu.africa', name: 'Nkiru', role: 'CEO', password: 'password123' },
  { email: 'habeeb@tradevu.co', name: 'Habeeb', role: 'ENGINEERING_LEAD', password: 'password123' },
  { email: 'chibueze@tradevu.co', name: 'Chibueze', role: 'PAY_LEAD', password: 'password123' },
  { email: 'adaora@tradevu.co', name: 'Adaora', role: 'OPS_LEAD', password: 'password123' },
];

const INITIAL_PERMISSIONS: Record<Role, string[]> = {
  CEO: ['revenue', 'launch', 'customers', 'ops', 'pay', 'engineering', 'users', 'settings'],
  PM: ['revenue', 'launch', 'customers', 'ops', 'pay', 'engineering', 'settings'],
  HR: ['launch', 'users', 'settings', 'ops', 'pay'],
  ENGINEERING_LEAD: ['engineering', 'settings'],
  PAY_LEAD: ['pay', 'settings'],
  OPS_LEAD: ['customers', 'ops', 'settings'],
  GUEST: ['settings'],
};

const ALL_PERMISSIONS = ['revenue', 'launch', 'customers', 'ops', 'pay', 'engineering', 'users', 'settings'];

const ROLE_LABELS: Record<Role, string> = {
  CEO: 'Chief Executive Officer',
  HR: 'Human Resources',
  PM: 'Project Manager',
  ENGINEERING_LEAD: 'Director of Technical Team',
  PAY_LEAD: 'Head of Pay Team',
  OPS_LEAD: 'Operations Lead',
  GUEST: 'Guest User',
};

// ── Admin Page Component ──────────────────────────────────────────────────────

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  // Governance States
  const [usersList, setUsersList] = useState<User[]>(AUTHORIZED_USERS);
  const [rolePermissions, setRolePermissions] = useState<Record<Role, string[]>>(INITIAL_PERMISSIONS);
  const [showPassword, setShowPassword] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', status: 'In Development', dateLabel: 'Target', dateValue: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const fetchDashboard = () => {
    setLoading(true);
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if ('error' in data) {
          setError(data.error);
        } else {
          setMetrics(data);
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
  }, []);

  const canView = (section: string) => {
    if (!currentUser) return false;
    return rolePermissions[currentUser.role]?.includes(section);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = AUTHORIZED_USERS.find(u => 
      u.email.toLowerCase() === loginForm.email.toLowerCase() && 
      u.password === loginForm.password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid credentials. Please use password123.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
  };

  const handleSave = async (payload: any, sectionName: string) => {
    setSavingSection(sectionName);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: `${sectionName} updated successfully.` });
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to update ${sectionName}.` });
    } finally {
      setSavingSection(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateProject = () => {
    if (!newProject.title || !metrics) return;
    
    const proj: EngineeringProject = {
      id: Math.random().toString(36).substr(2, 9),
      title: newProject.title,
      description: '', 
      status: newProject.status as any,
      dateLabel: newProject.dateLabel,
      dateValue: newProject.dateValue,
      name: newProject.title, // Legacy
    };

    setMetrics({
      ...metrics,
      engineeringRoadmap: [proj, ...metrics.engineeringRoadmap]
    });
    
    setIsProjectModalOpen(false);
    setNewProject({ title: '', status: 'In Development', dateLabel: 'Target', dateValue: '' });
    setMessage({ type: 'success', text: 'Project created successfully.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const canEditConversions = () => {
    if (!currentUser) return false;
    return ['CEO', 'PM', 'HR'].includes(currentUser.role);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center">
      <RefreshCcw className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-slate-500 font-bold tracking-tight">Syncing Operational Intelligence...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
        <Activity size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">System Sync Failed</h2>
      <p className="text-rose-600 font-medium max-w-md mb-8">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform"
      >
        Retry Connection
      </button>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-indigo-200/50 p-12 border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-600/20">T</div>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 text-center mb-2 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 text-center font-medium mb-10">Enter your credentials to access the scoreboard.</p>
          
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                />
              </div>
            </div>
            
            {loginError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center animate-shake">
                {loginError}
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tradevu Internal Governance System</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FE] text-slate-900 font-sans">
      
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-30">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl">T</div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Tradevu</h1>
          </div>

          {/* User Console Card */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <UserIcon size={20} />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">{currentUser?.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentUser ? ROLE_LABELS[currentUser.role] : ''}</div>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <SidebarGroup label="Main Menu">
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <SidebarItem icon={<BarChart3 size={20} />} label="Revenue" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} visible={canView('revenue')} />
            </SidebarGroup>

            <SidebarGroup label="Departments" className="mt-6">
              <SidebarItem icon={<Users size={20} />} label="Operations" active={activeTab === 'ops'} onClick={() => setActiveTab('ops')} visible={canView('ops')} />
              <SidebarItem icon={<CreditCard size={20} />} label="Pay Team" active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} visible={canView('pay')} />
              <SidebarItem icon={<Layers size={20} />} label="Engineering" active={activeTab === 'engineering'} onClick={() => setActiveTab('engineering')} visible={canView('engineering')} />
            </SidebarGroup>

            <SidebarGroup label="Governance" className="mt-6">
              <SidebarItem icon={<ShieldCheck size={20} />} label="Users & Access" active={activeTab === 'users'} onClick={() => setActiveTab('users')} visible={canView('users')} />
              <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </SidebarGroup>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <SidebarItem icon={<HelpCircle size={20} />} label="Support" onClick={() => {}} active={false} />
          <SidebarItem icon={<LogOut size={20} />} label="Sign Out" onClick={handleLogout} active={false} />
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-20 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search operations..." className="bg-transparent outline-none text-sm font-medium w-full" />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings size={22} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Profile" />
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                  System Active
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
              <p className="text-slate-500 font-medium mt-1">Real-time overview of Tradevu operational metrics and governance controls.</p>
            </div>
            
            {message && (
              <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <Activity size={18} />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}
          </div>

          {/* OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard 
                  title="Daily Active Users" 
                  value="24,592" 
                  subtext="Past 24 Hours" 
                  trend="+12%" 
                  icon={<Users size={24} />}
                  gradient="from-indigo-500 to-blue-600"
                />
                <MetricCard 
                  title="Weekly Transfers" 
                  value="1.2M" 
                  subtext="Volumetric Flow" 
                  trend="+5.4%" 
                  icon={<ArrowRight size={24} />}
                  gradient="from-violet-500 to-fuchsia-600"
                />
                <MetricCard 
                  title="Active Projects" 
                  value="348" 
                  subtext="In Deployment" 
                  trend="Stable" 
                  icon={<Layers size={24} />}
                  gradient="from-slate-700 to-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <QuickActionCard 
                  icon={<RefreshCcw size={28} className="text-indigo-600" />}
                  title="Update Weekly Metrics"
                  description="Force a manual sync of the data warehouse pipeline for Ops and Pay teams."
                  onClick={() => setActiveTab('ops')}
                  visible={canView('ops') || canView('pay')}
                />
                <QuickActionCard 
                  icon={<ShieldCheck size={28} className="text-violet-600" />}
                  title="Manage Governance"
                  description="Review pending access requests and platform compliance flags."
                  onClick={() => setActiveTab('users')}
                  visible={canView('users')}
                />
              </div>
            </div>
          )}

          {/* OPERATIONS MODULE */}
          {activeTab === 'ops' && canView('ops') && metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AdminCard title="Weekly Operations Metrics" description="Field-level configuration for weekly granular data." accent="bg-indigo-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    <InputGroup label="Weekly Goal" value={metrics.opsWeekly.weeklyGoal} onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, weeklyGoal: v}})} icon={<Target size={18} />} />
                    <InputGroup label="Total Visits" value={metrics.opsWeekly.visits} onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, visits: v}})} icon={<Globe size={18} />} />
                    <InputGroup label="Product Conversions" value={metrics.opsWeekly.usersConverted} onChange={(v) => setMetrics({...metrics, opsWeekly: {...metrics.opsWeekly, usersConverted: v}})} icon={<CheckCircle2 size={18} />} disabled={!canEditConversions()} />
                  </div>
                  <SaveButton onClick={() => handleSave(metrics.opsWeekly, 'Operations Data')} loading={savingSection === 'Operations Data'} accent="bg-indigo-600" />
                </AdminCard>
              </div>
              <div className="space-y-8">
                <AdminCard title="Revenue Data" description="Executive summary of financial performance." accent="bg-emerald-600">
                  <div className="space-y-6 mt-8">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Gross Revenue</div>
                      <div className="text-2xl font-black text-slate-900">$1,250,000</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Net Margin</div>
                      <div className="text-2xl font-black text-slate-900">24.2%</div>
                    </div>
                  </div>
                </AdminCard>
              </div>
            </div>
          )}

          {/* REVENUE MODULE */}
          {activeTab === 'revenue' && canView('revenue') && metrics && (
            <div className="space-y-12">
              <AdminCard title="Revenue Performance" description="Track and update annual financial targets." accent="bg-emerald-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                  <InputGroup label="Annual Goal ($)" value={metrics.revenueAnnual.goal} onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, goal: v}})} icon={<Target size={18} />} />
                  <InputGroup label="Current Revenue ($)" value={metrics.revenueAnnual.current} onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, current: v}})} icon={<DollarSign size={18} />} />
                  <InputGroup label="Achievement (%)" value={metrics.revenueAnnual.percentage} onChange={(v) => setMetrics({...metrics, revenueAnnual: {...metrics.revenueAnnual, percentage: v}})} icon={<TrendingUp size={18} />} />
                </div>
                <SaveButton onClick={() => handleSave(metrics.revenueAnnual, 'Revenue Performance')} loading={savingSection === 'Revenue Performance'} accent="bg-emerald-600" />
              </AdminCard>
            </div>
          )}

          {/* PAY TEAM MODULE */}
          {activeTab === 'pay' && canView('pay') && metrics && (
            <div className="space-y-12">
              <AdminCard title="Pay Team Operations" description="Manage transaction conversations and conversion metrics." accent="bg-violet-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                  <InputGroup label="Weekly Goal" value={metrics.payWeekly.weeklyGoal} onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, weeklyGoal: v}})} icon={<Target size={18} />} />
                  <InputGroup label="Total Conversations" value={metrics.payWeekly.conversations} onChange={(v) => setMetrics({...metrics, payWeekly: {...metrics.payWeekly, conversations: v}})} icon={<MessageSquare size={18} />} />
                </div>
                
                <div className="mt-12">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Transfer Metrics</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {metrics.payWeekly.transfers.map((transfer, idx) => (
                      <div key={idx} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-slate-900">{transfer.label}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal: {transfer.goal}</div>
                        </div>
                        <input 
                          type="number" 
                          value={transfer.current}
                          onChange={(e) => {
                            const newTransfers = [...metrics.payWeekly.transfers];
                            newTransfers[idx].current = Number(e.target.value);
                            setMetrics({...metrics, payWeekly: {...metrics.payWeekly, transfers: newTransfers}});
                          }}
                          className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <SaveButton onClick={() => handleSave(metrics.payWeekly, 'Pay Team Metrics')} loading={savingSection === 'Pay Team Metrics'} accent="bg-violet-600" />
              </AdminCard>
            </div>
          )}

          {/* ENGINEERING ROADMAP */}
          {activeTab === 'engineering' && canView('engineering') && metrics && (
            <AdminCard 
              title="Infrastructure Roadmap" 
              description="Overview of active engineering initiatives and delivery timelines." 
              accent="bg-orange-600"
              actions={
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-600/20 hover:scale-105 transition-transform"
                >
                  Add New Project
                </button>
              }
            >
              <div className="mt-10 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ETA</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.engineeringRoadmap.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-5 font-bold text-slate-900">{p.title}</td>
                        <td className="py-5 text-sm text-slate-500 font-medium max-w-xs truncate">{p.description}</td>
                        <td className="py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.status === 'Live' ? 'bg-emerald-100 text-emerald-600' : 
                            p.status === 'Testing' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-5 text-center text-sm font-bold text-slate-600">{p.dateValue}</td>
                        <td className="py-5 text-right">
                          <button 
                            onClick={() => setMetrics({...metrics, engineeringRoadmap: metrics.engineeringRoadmap.filter(proj => proj.id !== p.id)})}
                            className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <SaveButton onClick={() => handleSave(metrics.engineeringRoadmap, 'Engineering Roadmap')} loading={savingSection === 'Engineering Roadmap'} accent="bg-orange-600" />
            </AdminCard>
          )}

          {/* GOVERNANCE & ACCESS */}
          {activeTab === 'users' && canView('users') && (
            <div className="space-y-12">
              <AdminCard title="User Directory & Access" description="Define platform-wide visibility and administrative roles." accent="bg-rose-600">
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Permissions</th>
                        <th className="pb-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user, idx) => (
                        <tr key={user.email} className="border-b border-slate-50 last:border-0 group">
                          <td className="py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-900">{user.name}</div>
                                <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6">
                            <select 
                              value={user.role}
                              onChange={(e) => {
                                const newList = [...usersList];
                                newList[idx].role = e.target.value as Role;
                                setUsersList(newList);
                              }}
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {Object.keys(ROLE_LABELS).map(role => (
                                <option key={role} value={role}>{ROLE_LABELS[role as Role]}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-6">
                            <div className="flex flex-wrap gap-1.5">
                              {rolePermissions[user.role].map(perm => (
                                <span key={perm} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-6 text-right">
                            <button className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                  <UserPlus size={18} /> Invite New Member
                </button>
              </AdminCard>

              <AdminCard title="Role Permissions Matrix" description="Control cross-departmental visibility for every system role." accent="bg-violet-600">
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                        {ALL_PERMISSIONS.map(perm => (
                          <th key={perm} className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{perm}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.keys(ROLE_LABELS) as Role[]).map(role => (
                        <tr key={role} className="border-b border-slate-50 last:border-0">
                          <td className="py-6 text-sm font-black text-slate-900">{ROLE_LABELS[role]}</td>
                          {ALL_PERMISSIONS.map(perm => (
                            <td key={perm} className="py-6 text-center">
                              <button 
                                onClick={() => {
                                  const currentPerms = rolePermissions[role];
                                  const newPerms = currentPerms.includes(perm)
                                    ? currentPerms.filter(p => p !== perm)
                                    : [...currentPerms, perm];
                                  setRolePermissions({...rolePermissions, [role]: newPerms});
                                }}
                                className={`w-11 h-6 rounded-full relative transition-all ${rolePermissions[role].includes(perm) ? 'bg-violet-600' : 'bg-slate-200'}`}
                              >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${rolePermissions[role].includes(perm) ? 'translate-x-5' : ''}`} />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <SaveButton onClick={() => handleSave(rolePermissions, 'Permissions Matrix')} loading={savingSection === 'Permissions Matrix'} accent="bg-violet-600" />
              </AdminCard>
            </div>
          )}

          {/* SETTINGS PAGE */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="lg:col-span-3 space-y-8">
                <AdminCard title="Security & Credentials" description="Manage your access keys and update your account password." accent="bg-rose-600">
                  <div className="mt-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <InputGroup 
                        label="Current Password" 
                        type={showPassword ? 'text' : 'password'} 
                        value={passwordForm.current} 
                        onChange={(v) => setPasswordForm({...passwordForm, current: v})} 
                        icon={<Lock size={18} />} 
                      />
                      <InputGroup 
                        label="New Password" 
                        type={showPassword ? 'text' : 'password'} 
                        value={passwordForm.new} 
                        onChange={(v) => setPasswordForm({...passwordForm, new: v})} 
                        icon={<Lock size={18} />} 
                      />
                      <InputGroup 
                        label="Confirm New Password" 
                        type={showPassword ? 'text' : 'password'} 
                        value={passwordForm.confirm} 
                        onChange={(v) => setPasswordForm({...passwordForm, confirm: v})} 
                        icon={<Lock size={18} />} 
                      />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                      >
                        {showPassword ? 'Hide Characters' : 'Show Characters'}
                      </button>
                      <button className="px-6 py-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-rose-600/20 hover:scale-105 transition-transform">
                        Update Password
                      </button>
                    </div>
                  </div>
                </AdminCard>
              </div>
            </div>
          )}

          {/* ACCESS DENIED */}
          {!activeTab.includes('overview') && !activeTab.includes('settings') && !canView(activeTab) && (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-200 text-center shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-lg shadow-rose-500/10">
                <Lock size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Restricted Access</h2>
              <p className="text-slate-500 max-w-sm font-medium text-lg leading-relaxed">
                You do not have the necessary permissions to view or manage the <span className="text-indigo-600 font-bold capitalize">{activeTab}</span> department.
              </p>
              <button onClick={() => setActiveTab('overview')} className="mt-10 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-slate-900/20">
                Return to Overview
              </button>
            </div>
          )}

        </div>
      </main>

      {/* PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-orange-600" />
            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">New Engineering Initiative</h2>
                  <p className="text-slate-500 font-medium">Define the scope and timeline for a new platform project.</p>
                </div>
                <button onClick={() => setIsProjectModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Project Name" value={newProject.title} onChange={(v) => setNewProject({...newProject, title: v})} icon={<Layers size={18} />} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={newProject.status} 
                    onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value="In Development">In Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
                <InputGroup label="ETA (e.g. Q4 2024)" value={newProject.dateValue} onChange={(v) => setNewProject({...newProject, dateValue: v})} icon={<Bell size={18} />} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timeline Type</label>
                  <select 
                    value={newProject.dateLabel} 
                    onChange={(e) => setNewProject({...newProject, dateLabel: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value="Deployed">Deployed</option>
                    <option value="In Development">In Development</option>
                    <option value="Target">Target</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setIsProjectModalOpen(false)}
                  className="flex-1 py-5 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProject}
                  className="flex-1 py-5 bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-orange-600/20 hover:scale-[1.02] transition-all"
                >
                  Confirm & Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Sub-components ───────────────────────────────────────────────────

function SidebarGroup({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={className}>
      <div className="px-4 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, visible = true }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, visible?: boolean }) {
  if (!visible) return null;
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-400 transition-colors group-hover:text-indigo-600'}>{icon}</span>
      <span className="tracking-tight">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
    </button>
  );
}

function MetricCard({ title, value, subtext, trend, icon, gradient }: { title: string, value: string, subtext: string, trend: string, icon: React.ReactNode, gradient: string }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20`}>
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trend === 'Stable' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
          <div className="flex items-center gap-1">
            {trend !== 'Stable' && <TrendingUp size={10} />}
            {trend}
          </div>
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value}</div>
        <div className="text-sm font-bold text-slate-400 tracking-tight">{title}</div>
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">{subtext}</div>
      </div>
    </div>
  );
}

function AdminCard({ title, description, accent, children, actions }: { title: string, description: string, accent: string, children: React.ReactNode, actions?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className={`h-1.5 w-full ${accent}`} />
      <div className="p-10">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{title}</h2>
            <p className="text-slate-500 font-medium text-sm">{description}</p>
          </div>
          {actions}
        </header>
        {children}
      </div>
    </section>
  );
}

function InputGroup({ label, value, onChange, icon, type = "number", disabled = false }: { label: string, value: any, onChange: (v: any) => void, icon: React.ReactNode, type?: string, disabled?: boolean }) {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-70' : ''}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
        {label} {disabled && <span className="text-rose-500 normal-case font-bold ml-2">(HR Verification Required)</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          readOnly={disabled}
          onChange={(e) => !disabled && onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className={`w-full pl-12 pr-4 py-4 ${disabled ? 'bg-slate-50 cursor-not-allowed select-none' : 'bg-slate-50'} border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-900 transition-all`}
        />
      </div>
    </div>
  );
}

function SaveButton({ onClick, loading, accent }: { onClick: () => void, loading: boolean, accent: string }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`mt-10 w-full py-5 ${accent} text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-indigo-600/10 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50`}
    >
      {loading ? (
        <RefreshCcw size={20} className="animate-spin" />
      ) : (
        <>Update System Parameters <Save size={18} /></>
      )}
    </button>
  );
}

function QuickActionCard({ icon, title, description, onClick, visible }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, visible: boolean }) {
  if (!visible) return null;
  return (
    <button 
      onClick={onClick}
      className="bg-white p-10 rounded-[32px] border border-slate-100 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-indigo-50 transition-colors -rotate-12 translate-x-4 -translate-y-4">
        {icon}
      </div>
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">{description}</p>
      <div className="mt-8 flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
        Execute Task <ArrowRight size={14} />
      </div>
    </button>
  );
}
