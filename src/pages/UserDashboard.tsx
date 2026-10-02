import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Task, TaskClaim, UserFinancialStats, BRAND_CONFIG } from '../../shared/types.ts';
import {
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ClipboardList,
  Sparkles,
  ArrowDownToLine,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';

interface UserDashboardProps {
  setCurrentView: (view: string) => void;
  onSelectTask?: (task: Task) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ setCurrentView, onSelectTask }) => {
  const { user, openLoginModal } = useAuth();
  const [stats, setStats] = useState<UserFinancialStats>({
    currentBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    withdrawalCount: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    pendingAmount: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tasksRes, walletRes, claimsRes] = await Promise.all([
          api.getTasks().catch(() => ({ tasks: [] })),
          user ? api.getMyWallet().catch(() => ({ stats: null, wallet: null })) : Promise.resolve({ stats: null, wallet: null }),
          user ? api.getUserClaims().catch(() => ({ claims: [] })) : Promise.resolve({ claims: [] }),
        ]);

        if (tasksRes.tasks) setTasks(tasksRes.tasks);
        if (walletRes.stats) setStats(walletRes.stats);
        if (claimsRes.claims) setClaims(claimsRes.claims);
      } catch (err) {
        // Handled cleanly
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const availableSimulationsCount = tasks.filter(t => t.status === 'active' && t.claimed_slots < t.total_slots).length;
  const completedSimulationsCount = claims.filter(c => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>EDUCATIONAL SIMULATION PLATFORM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome{user ? `, +91 ${user.whatsapp_number}` : ' to Ritam Review Agency'}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Analyze mock business customer feedback, practice objective review writing, and experience internal simulation verification workflows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('tasks')}
              className="py-3 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02]"
            >
              <span>GET SIMULATION WORK</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentView('wallet')}
              className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Simulated Wallet</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core Dashboard Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Wallet Balance */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-[18px] p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{stats.currentBalance.toFixed(2)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Available to withdraw</p>
        </div>

        {/* 2. Available Simulations */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-[18px] p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Available Tasks</span>
            <ClipboardList className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {availableSimulationsCount}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Open slots in pool</p>
        </div>

        {/* 3. Completed Simulations */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-[18px] p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {completedSimulationsCount}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Verified simulations</p>
        </div>

        {/* 4. Pending Withdrawals */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-[18px] p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Pending Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats.pendingWithdrawals}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">₹{stats.pendingAmount.toFixed(2)} in queue</p>
        </div>

        {/* 5. Total Earned */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-[18px] p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Earned</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{stats.totalEarned.toFixed(2)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Lifetime simulation credits</p>
        </div>

        {/* 6. Total Withdrawn */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-[18px] p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Withdrawn</span>
            <ArrowDownToLine className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{stats.totalWithdrawn.toFixed(2)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">{stats.withdrawalCount} recorded payouts</p>
        </div>
      </div>

      {/* Available Educational Simulations Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Featured Simulation Modules
            </h2>
            <p className="text-xs text-zinc-400">
              Claim atomic slots to receive your individual sample comment for analysis
            </p>
          </div>
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All ({tasks.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.slice(0, 4).map(task => {
            const isFull = task.claimed_slots >= task.total_slots;
            return (
              <div
                key={task.id}
                className="bg-zinc-900 border border-zinc-800 rounded-[18px] p-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white">{task.name}</h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{task.mock_location}</span>
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-bold font-mono shrink-0">
                      ₹{task.payment_per_completion}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">
                    <span className="font-mono font-semibold text-zinc-200">
                      {task.total_slots - task.claimed_slots}
                    </span>{' '}
                    slots remaining ({task.total_slots} total)
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        openLoginModal();
                        return;
                      }
                      setCurrentView('tasks');
                    }}
                    disabled={isFull}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all ${
                      isFull
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-zinc-100 hover:bg-white text-zinc-900 cursor-pointer shadow-sm'
                    }`}
                  >
                    {isFull ? 'No slots left' : 'Claim Slot'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational Guidelines & Protocol Banner */}
      <div className="p-4 rounded-[18px] bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Educational Simulation Protocol
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All reviews, mock maps, and ratings are purely educational and restricted to this sandbox application. Never attempt to submit simulated exercises to real Google Maps pages or third-party review platforms.
          </p>
        </div>
      </div>
    </div>
  );
};
