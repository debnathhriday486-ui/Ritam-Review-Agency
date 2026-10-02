import React from 'react';
import { 
  Users, 
  Layers, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Building2,
  FileCheck
} from 'lucide-react';
import { AdminDashboardStats } from '../../../shared/types.ts';
import { formatCurrency } from '../../lib/api.ts';

interface AdminDashboardViewProps {
  stats: AdminDashboardStats | null;
  onNavigate: (tab: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ stats, onNavigate }) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-zinc-500 text-xs">
        Loading administrative metrics...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      sub: `${stats.activeUsers} active participants`,
      icon: Users,
      action: () => onNavigate('users')
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      sub: `${stats.totalSlots} total slots configured`,
      icon: Layers,
      action: () => onNavigate('tasks')
    },
    {
      title: 'Claimed Slots',
      value: stats.claimedSlots,
      sub: `${stats.availableSlots} slots still open`,
      icon: Building2,
      action: () => onNavigate('comments')
    },
    {
      title: 'Completed Simulations',
      value: stats.completedSimulations,
      sub: `${stats.pendingSimulations} awaiting verification`,
      icon: FileCheck,
      action: () => onNavigate('submissions')
    },
    {
      title: 'Total Wallet Credits',
      value: formatCurrency(stats.totalWalletCredits),
      sub: 'Simulated task earnings issued',
      icon: Wallet,
      action: () => onNavigate('transactions')
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      sub: 'Requests awaiting admin decision',
      icon: Clock,
      highlight: stats.pendingWithdrawals > 0,
      action: () => onNavigate('withdrawals')
    },
    {
      title: 'Total Withdrawn',
      value: formatCurrency(stats.totalWithdrawn),
      sub: 'Historical paid out ledger sum',
      icon: CheckCircle,
      action: () => onNavigate('withdrawals')
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-xl">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            ADMINISTRATIVE COMMAND CENTRE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Simulator Operations Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time atomic slot control, unique comment pool allocation, and simulated ledger audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs hover:bg-white transition-all shadow-md active:scale-95"
          >
            + Create New Task
          </button>
        </div>
      </div>

      {/* Grid of Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`bg-zinc-900/80 border ${
                card.highlight ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-700'
              } rounded-3xl p-5 sm:p-6 transition-all shadow-xl backdrop-blur-xl cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {card.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-800">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Activity Chart Visualization */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Daily Activity (Last 7 Days)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Simulations executed, user registrations, and financial balance movement.
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
            Real-time Database Queries
          </span>
        </div>

        {/* CSS Bar Chart representation */}
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
            {stats.dailyStats.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl h-36 flex flex-col justify-end p-1.5 sm:p-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-700 text-zinc-200 text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-xl">
                    {day.date}: {day.simulations} sims | {formatCurrency(day.walletCredits)} cr
                  </div>

                  <div
                    className="w-full bg-zinc-200 rounded-lg transition-all duration-500"
                    style={{
                      height: `${Math.min(100, Math.max(12, day.simulations * 30 + day.registrations * 20))}%`
                    }}
                  />
                </div>
                <span className="text-[11px] text-zinc-400">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
