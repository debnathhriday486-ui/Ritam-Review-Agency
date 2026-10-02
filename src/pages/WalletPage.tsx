import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Wallet, WalletTransaction, UserFinancialStats } from '../../shared/types.ts';
import {
  Wallet as WalletIcon,
  TrendingUp,
  ArrowDownToLine,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Receipt,
  Filter,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';

interface WalletPageProps {
  setCurrentView: (view: string) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ setCurrentView }) => {
  const { user, openLoginModal, openRegisterModal, isLoading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState<UserFinancialStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    if (!user) {
      setWallet(null);
      setTransactions([]);
      setStats(null);
      setLoading(false);
      return;
    }

    async function loadWallet() {
      try {
        setLoading(true);
        const res = await api.getMyWallet();
        setWallet(res.wallet);
        setTransactions(res.transactions || []);
        setStats(res.stats);
      } catch (err: any) {
        // Handled gracefully without console spam
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, [user]);

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  if (authLoading) {
    return (
      <div className="py-20 text-center text-zinc-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <span>Loading wallet ledger...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-zinc-300" />
            <span>Simulated Wallet Ledger</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Audit-backed balance ledger tracking every simulation credit, withdrawal, and reversal.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-[22px] bg-zinc-900 border border-zinc-800 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-inner">
            <Lock className="w-6 h-6 text-zinc-300" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Please sign in to your participant account to access your simulated balance, view credited review rewards, and track transaction history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-sm mx-auto">
            <button
              onClick={openLoginModal}
              className="w-full sm:w-auto flex-1 py-2.5 px-5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
            <button
              onClick={openRegisterModal}
              className="w-full sm:w-auto flex-1 py-2.5 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Simulated Wallet Ledger
          </h1>
          <p className="text-xs text-zinc-400">
            Audit-backed balance ledger tracking every simulation credit, withdrawal, and reversal.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('withdrawals')}
          className="self-start sm:self-auto py-2.5 px-5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>REQUEST WITHDRAWAL</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Balance */}
        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Current Balance</span>
            <WalletIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{wallet?.current_balance.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Available for simulated payout</p>
        </div>

        {/* Total Earned */}
        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Earned</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{wallet?.total_earned.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">From verified tasks</p>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Withdrawn</span>
            <ArrowDownToLine className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{wallet?.total_withdrawn.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">{stats?.withdrawalCount || 0} recorded transfers</p>
        </div>

        {/* Pending Amount */}
        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{stats?.pendingAmount.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">{stats?.pendingWithdrawals || 0} in review queue</p>
        </div>
      </div>

      {/* Ledger Transactions Section */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Ledger Transactions ({transactions.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
            {['ALL', 'CREDIT', 'WITHDRAWAL', 'REVERSAL'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="py-8 text-center text-zinc-500 font-mono text-xs">
            Loading ledger...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No transactions match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-medium font-mono text-[11px]">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Task / Description</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Balance After</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3 pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60 font-mono">
                {filteredTransactions.map(tx => {
                  const dateObj = new Date(tx.created_at);
                  const isCredit = tx.type === 'CREDIT';
                  const isReversal = tx.type === 'REVERSAL';

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3.5 pl-2 text-zinc-400 text-[11px]">
                        #{tx.id.slice(-8)}
                      </td>
                      <td className="py-3.5 font-sans font-medium text-white max-w-xs truncate">
                        {tx.task_name || tx.description}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                          isCredit
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                            : isReversal
                            ? 'bg-amber-950/70 text-amber-400 border border-amber-800/80'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {isCredit ? <ArrowUpRight className="w-3 h-3" /> : isReversal ? <RotateCcw className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 font-bold ${
                        isCredit ? 'text-emerald-400' : isReversal ? 'text-amber-400' : 'text-zinc-200'
                      }`}>
                        {isCredit ? '+' : isReversal ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-300">
                        ₹{tx.balance_after.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-400 text-[11px] font-sans">
                        {dateObj.toLocaleDateString()} · {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
