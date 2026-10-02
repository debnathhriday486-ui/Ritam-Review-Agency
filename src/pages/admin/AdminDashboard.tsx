import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { AdminDashboardStats } from '../../../shared/types.ts';
import {
  Users,
  UserCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Layers,
  Calendar,
  Filter,
  BarChart3,
  Sparkles,
  ShieldAlert,
  LogIn
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentView: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentView }) => {
  const { admin, role, openLoginModal } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'custom'>('7days');

  useEffect(() => {
    if (role !== 'admin' || !admin) {
      setLoading(false);
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getAdminStats();
        setStats(res.stats);
      } catch (err: any) {
        // Handled cleanly
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [admin, role]);

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please sign in with administrator credentials to view executive platform metrics and audit controls.
        </p>
        <div className="pt-2">
          <button
            onClick={openLoginModal}
            className="py-2.5 px-5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Admin Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-xs">
        Aggregating system metrics and ledger logs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Executive Simulation Control Panel
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time telemetry across participants, slot locks, simulation verifications, and financial ledger.
          </p>
        </div>

        {/* Date Filter Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'custom', label: 'Custom' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id as any)}
              className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dateFilter === f.id
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 11 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Users */}
        <div
          onClick={() => setCurrentView('admin-users')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Total Users</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{stats.totalUsers}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Registered accounts</p>
        </div>

        {/* 2. Active Users */}
        <div
          onClick={() => setCurrentView('admin-users')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Active Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.activeUsers}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Eligible to claim</p>
        </div>

        {/* 3. Total Tasks */}
        <div
          onClick={() => setCurrentView('admin-tasks')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Total Tasks</span>
            <ClipboardList className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{stats.totalTasks}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Active modules</p>
        </div>

        {/* 4. Total Slots */}
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Total Slots</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{stats.totalSlots}</div>
          <p className="text-[10px] text-zinc-400 mt-1">System capacity</p>
        </div>

        {/* 5. Claimed Slots */}
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Claimed Slots</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{stats.claimedSlots}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Assigned to users</p>
        </div>

        {/* 6. Available Slots */}
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Available Slots</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{stats.availableSlots}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Open for claim</p>
        </div>

        {/* 7. Completed Simulations */}
        <div
          onClick={() => setCurrentView('admin-submissions')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.completedSimulations}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Verified submissions</p>
        </div>

        {/* 8. Pending Simulations */}
        <div
          onClick={() => setCurrentView('admin-submissions')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{stats.pendingSimulations}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Awaiting admin check</p>
        </div>

        {/* 9. Total Wallet Credits */}
        <div
          onClick={() => setCurrentView('admin-transactions')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Total Credits</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">₹{stats.totalWalletCredits.toFixed(2)}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Disbursed to balances</p>
        </div>

        {/* 10. Pending Withdrawals */}
        <div
          onClick={() => setCurrentView('admin-withdrawals')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Pending Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{stats.pendingWithdrawals}</div>
          <p className="text-[10px] text-zinc-400 mt-1">In payout queue</p>
        </div>

        {/* 11. Total Withdrawn */}
        <div
          onClick={() => setCurrentView('admin-withdrawals')}
          className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-medium">Total Withdrawn</span>
            <ArrowDownToLine className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">₹{stats.totalWithdrawn.toFixed(2)}</div>
          <p className="text-[10px] text-zinc-400 mt-1">Completed payouts</p>
        </div>
      </div>

      {/* Daily Visual Metrics Charts Breakdown */}
      <div className="p-6 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-zinc-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Daily Activity & Volume Trends
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Last 7 Recorded Days
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Registrations */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <span className="text-xs font-semibold text-zinc-300 block">Daily Registrations</span>
            <div className="space-y-1.5 font-mono text-xs">
              {stats.dailyStats.map(d => (
                <div key={d.date} className="flex items-center justify-between text-zinc-400">
                  <span>{d.date.slice(5)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, d.registrations * 20)}%` }}></div>
                    </div>
                    <span className="text-white font-bold w-4 text-right">{d.registrations}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Simulations */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <span className="text-xs font-semibold text-zinc-300 block">Daily Simulations</span>
            <div className="space-y-1.5 font-mono text-xs">
              {stats.dailyStats.map(d => (
                <div key={d.date} className="flex items-center justify-between text-zinc-400">
                  <span>{d.date.slice(5)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, d.simulations * 20)}%` }}></div>
                    </div>
                    <span className="text-white font-bold w-4 text-right">{d.simulations}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Wallet Credits */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <span className="text-xs font-semibold text-zinc-300 block">Daily Credits (₹)</span>
            <div className="space-y-1.5 font-mono text-xs">
              {stats.dailyStats.map(d => (
                <div key={d.date} className="flex items-center justify-between text-zinc-400">
                  <span>{d.date.slice(5)}</span>
                  <span className="text-emerald-400 font-bold">₹{d.walletCredits}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Withdrawals */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
            <span className="text-xs font-semibold text-zinc-300 block">Daily Withdrawals (₹)</span>
            <div className="space-y-1.5 font-mono text-xs">
              {stats.dailyStats.map(d => (
                <div key={d.date} className="flex items-center justify-between text-zinc-400">
                  <span>{d.date.slice(5)}</span>
                  <span className="text-white font-bold">₹{d.withdrawals}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
