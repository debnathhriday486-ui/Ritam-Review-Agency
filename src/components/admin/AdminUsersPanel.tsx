import React, { useState } from 'react';
import { 
  Search, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Eye, 
  ShieldAlert, 
  Wallet,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import { User, UserFinancialStats, UserTaskStats } from '../../../shared/types.ts';
import { apiFetch, formatCurrency, formatDateTime } from '../../lib/api.ts';

interface AdminUsersPanelProps {
  users: any[];
  onRefresh: () => void;
}

export const AdminUsersPanel: React.FC<AdminUsersPanelProps> = ({ users, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userProfileData, setUserProfileData] = useState<{
    user: User;
    financial: UserFinancialStats;
    taskStats: UserTaskStats;
    recentClaims: any[];
    recentWithdrawals: any[];
    recentTransactions: any[];
  } | null>(null);
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      u.whatsapp_number.includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  const handleOpenProfile = async (userId: string) => {
    setLoadingProfile(true);
    setActionMessage(null);
    try {
      const data = await apiFetch<{
        user: User;
        financial: UserFinancialStats;
        taskStats: UserTaskStats;
        recentClaims: any[];
        recentWithdrawals: any[];
        recentTransactions: any[];
      }>(`/api/admin/users/${userId}`);

      setUserProfileData(data);
      setSelectedUser(data.user);
    } catch (err: any) {
      alert(err.message || 'Failed to load user profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
      setActionMessage(`User status successfully changed to ${newStatus}.`);
      onRefresh();
      if (selectedUser?.id === userId) {
        handleOpenProfile(userId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await apiFetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPasswordInput })
      });
      setActionMessage(`Password updated for user ${selectedUser.whatsapp_number}.`);
      setShowPasswordResetModal(false);
      setNewPasswordInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Participant Directory</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Search by WhatsApp number, State, City, or User ID. Note: Passwords & hashes are cryptographically protected and never exposed.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-full font-mono">
            {filteredUsers.length} Users Found
          </span>
        </div>

        {/* Large Search Box as requested */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH WHATSAPP NUMBER, USER ID, STATE OR CITY..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-zinc-100 uppercase tracking-wider placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="pb-3 px-3">User ID</th>
                <th className="pb-3 px-3">WhatsApp Number</th>
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3">Registered Date</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Wallet Balance</th>
                <th className="pb-3 px-3">Total Earned</th>
                <th className="pb-3 px-3">Withdrawn</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {filteredUsers.map((u) => {
                const dt = formatDateTime(u.created_at);
                return (
                  <tr key={u.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3 px-3 text-zinc-400">#{u.id.slice(-8)}</td>
                    <td className="py-3 px-3 text-white font-bold font-sans">
                      +91 {u.whatsapp_number}
                    </td>
                    <td className="py-3 px-3 text-zinc-300 font-sans">
                      {u.city}, {u.state}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {dt.date} {dt.time}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-100 font-bold">
                      {formatCurrency(u.wallet_balance || 0)}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {formatCurrency(u.total_earned || 0)}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {formatCurrency(u.total_withdrawn || 0)} ({u.withdrawal_count || 0})
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => handleOpenProfile(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No matching users found for query "{searchTerm}".
            </div>
          )}
        </div>
      </div>

      {/* USER PROFILE ADMIN VIEW MODAL */}
      {selectedUser && userProfileData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  USER PROFILE (ADMIN VIEW)
                </span>
                <h2 className="text-2xl font-black text-white mt-2">
                  +91 {selectedUser.whatsapp_number}
                </h2>
                <div className="text-xs text-zinc-400 mt-1">
                  Location: {selectedUser.city}, {selectedUser.state} • Status: <span className="uppercase font-bold text-zinc-200">{selectedUser.status}</span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedUser(null); setUserProfileData(null); }}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Financial Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Current Balance</div>
                  <div className="text-base font-bold text-white mt-0.5">{formatCurrency(userProfileData.financial.currentBalance)}</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Total Earned</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{formatCurrency(userProfileData.financial.totalEarned)}</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Total Withdrawn</div>
                  <div className="text-base font-bold text-zinc-200 mt-0.5">{formatCurrency(userProfileData.financial.totalWithdrawn)}</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Pending Amount</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{formatCurrency(userProfileData.financial.pendingAmount)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-2 text-xs font-mono text-zinc-400">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  Approved WDs: <strong className="text-emerald-400">{userProfileData.financial.approvedWithdrawals}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  Pending WDs: <strong className="text-amber-400">{userProfileData.financial.pendingWithdrawals}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  Rejected WDs: <strong className="text-red-400">{userProfileData.financial.rejectedWithdrawals}</strong>
                </div>
              </div>
            </div>

            {/* Task Participation Stats */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Simulation Task Stats</h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Claimed</div>
                  <div className="text-lg font-bold text-white mt-0.5">{userProfileData.taskStats.totalClaimed}</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Completed</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{userProfileData.taskStats.completed}</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Pending</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{userProfileData.taskStats.pending}</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Rejected</div>
                  <div className="text-lg font-bold text-red-400 mt-0.5">{userProfileData.taskStats.rejected}</div>
                </div>
              </div>
            </div>

            {/* Admin Management Controls */}
            <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowPasswordResetModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                <KeyRound className="w-4 h-4 text-zinc-400" />
                Reset Password
              </button>

              <button
                onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedUser.status === 'active'
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {selectedUser.status === 'active' ? 'Suspend Account' : 'Re-Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleAdminResetPassword} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white">Reset User Password</h3>
            <p className="text-xs text-zinc-400">
              Set a new secure password for user +91 {selectedUser?.whatsapp_number}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
