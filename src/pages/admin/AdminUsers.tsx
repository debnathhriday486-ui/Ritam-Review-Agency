import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { User, UserFinancialStats, TaskClaim, WithdrawalRequest, WalletTransaction } from '../../../shared/types.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Users,
  Search,
  KeyRound,
  Ban,
  CheckCircle,
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  LogIn
} from 'lucide-react';

interface EnrichedUser extends User {
  wallet_balance: number;
  total_earned: number;
  total_withdrawn: number;
  withdrawal_count: number;
  completed_tasks: number;
}

export const AdminUsers: React.FC = () => {
  const { admin, role, openLoginModal } = useAuth();
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile modal state
  const [selectedProfile, setSelectedProfile] = useState<{
    user: User;
    financial: UserFinancialStats;
    taskStats: { totalClaimed: number; completed: number; pending: number; rejected: number };
    recentClaims: TaskClaim[];
    recentWithdrawals: WithdrawalRequest[];
    recentTransactions: WalletTransaction[];
  } | null>(null);

  // Password reset modal state
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = async (q?: string) => {
    if (role !== 'admin' || !admin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getAdminUsers(q);
      setUsers(res.users || []);
    } catch (err: any) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin' && admin) {
      loadUsers(searchQuery);
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [admin, role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(searchQuery);
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change user ${user.whatsapp_number} to ${nextStatus}?`)) return;

    try {
      await api.toggleUserStatus(user.id, nextStatus);
      setActionSuccess(`User status successfully changed to ${nextStatus}.`);
      loadUsers(searchQuery);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status.');
    }
  };

  const handleOpenProfile = async (userId: string) => {
    try {
      const res = await api.getAdminUserProfile(userId);
      setSelectedProfile(res);
    } catch (err: any) {
      alert(err.message || 'Failed to load user profile.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || newPassword.length < 6) return;

    try {
      await api.adminResetPassword(resettingUser.id, newPassword);
      setActionSuccess(`Password successfully reset for user ${resettingUser.whatsapp_number}.`);
      setResettingUser(null);
      setNewPassword('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to reset password.');
    }
  };

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in with administrator credentials to manage user accounts and view private member information.
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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Registered Participants & Accounts
        </h1>
        <p className="text-xs text-zinc-400">
          Search, manage statuses, audit financial balances, and administer participant access.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Large Search Box */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="SEARCH WHATSAPP NUMBER, User ID, State, or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 bg-zinc-900 border border-zinc-800 rounded-[18px] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 shadow-md font-mono"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
          >
            SEARCH
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Users Database ({users.length})
          </h2>
          <span className="text-[11px] text-zinc-400 font-mono">
            Passwords & Hashes Strictly Hidden
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Querying users directory...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No participants found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">User ID</th>
                  <th className="pb-3">WhatsApp Number</th>
                  <th className="pb-3">State / City</th>
                  <th className="pb-3">Reg Date / Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Wallet Balance</th>
                  <th className="pb-3">Total Earned</th>
                  <th className="pb-3">Total Withdrawn</th>
                  <th className="pb-3">Withdrawals</th>
                  <th className="pb-3">Tasks</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {users.map(u => {
                  const regDate = new Date(u.created_at);
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3 pl-2 text-zinc-400 text-[11px]">
                        #{u.id.slice(-8)}
                      </td>
                      <td className="py-3 font-semibold text-white">
                        +91 {u.whatsapp_number}
                      </td>
                      <td className="py-3 text-zinc-300 font-sans">
                        {u.city}, {u.state}
                      </td>
                      <td className="py-3 text-zinc-400 text-[11px] font-sans">
                        {regDate.toLocaleDateString()} · {regDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isSuspended
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white">
                        ₹{u.wallet_balance.toFixed(2)}
                      </td>
                      <td className="py-3 text-emerald-400 font-bold">
                        ₹{u.total_earned.toFixed(2)}
                      </td>
                      <td className="py-3 text-zinc-300">
                        ₹{u.total_withdrawn.toFixed(2)}
                      </td>
                      <td className="py-3 text-zinc-400 text-center">
                        {u.withdrawal_count}
                      </td>
                      <td className="py-3 text-zinc-200 text-center">
                        {u.completed_tasks}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => handleOpenProfile(u.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setResettingUser(u); setNewPassword(''); }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSuspended
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900'
                                : 'bg-red-950/60 border-red-800 text-red-400 hover:bg-red-900'
                            }`}
                            title={isSuspended ? 'Activate User' : 'Suspend User'}
                          >
                            {isSuspended ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER PROFILE ADMIN VIEW MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-zinc-400" />
                <h3 className="text-base font-bold text-white">
                  USER PROFILE: +91 {selectedProfile.user.whatsapp_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono">Location</span>
                <span className="font-semibold text-white">{selectedProfile.user.city}, {selectedProfile.user.state}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono">Registered</span>
                <span className="font-mono text-zinc-300">{new Date(selectedProfile.user.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono">Last Login</span>
                <span className="font-mono text-zinc-300">{selectedProfile.user.last_login ? new Date(selectedProfile.user.last_login).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-mono">Account Status</span>
                <span className="font-mono font-bold text-emerald-400 uppercase">{selectedProfile.user.status}</span>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Financial Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-mono">Current Balance</span>
                  <span className="text-base font-bold font-mono text-white">₹{selectedProfile.financial.currentBalance.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-mono">Total Earned</span>
                  <span className="text-base font-bold font-mono text-emerald-400">₹{selectedProfile.financial.totalEarned.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-mono">Total Withdrawn</span>
                  <span className="text-base font-bold font-mono text-zinc-200">₹{selectedProfile.financial.totalWithdrawn.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-mono">Payout Count</span>
                  <span className="text-base font-bold font-mono text-white">{selectedProfile.financial.withdrawalCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/80 text-center font-mono">
                  <span className="text-[10px] text-amber-300 block">Pending Payouts</span>
                  <span className="font-bold text-amber-400">{selectedProfile.financial.pendingWithdrawals}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/80 text-center font-mono">
                  <span className="text-[10px] text-emerald-300 block">Approved Payouts</span>
                  <span className="font-bold text-emerald-400">{selectedProfile.financial.approvedWithdrawals}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/80 text-center font-mono">
                  <span className="text-[10px] text-red-300 block">Rejected Payouts</span>
                  <span className="font-bold text-red-400">{selectedProfile.financial.rejectedWithdrawals}</span>
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Simulation Task Stats
              </h4>
              <div className="grid grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block">Claimed</span>
                  <span className="font-bold text-white">{selectedProfile.taskStats.totalClaimed}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block">Completed</span>
                  <span className="font-bold text-emerald-400">{selectedProfile.taskStats.completed}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block">Pending</span>
                  <span className="font-bold text-amber-400">{selectedProfile.taskStats.pending}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block">Rejected</span>
                  <span className="font-bold text-red-400">{selectedProfile.taskStats.rejected}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedProfile(null)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN RESET PASSWORD MODAL */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-white">Reset Password for +91 {resettingUser.whatsapp_number}</h3>
              </div>
              <button onClick={() => setResettingUser(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Enter New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="flex-1 py-2 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-xl"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
