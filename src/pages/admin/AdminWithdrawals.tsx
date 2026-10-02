import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { WithdrawalRequest, WithdrawalStatus } from '../../../shared/types.ts';
import {
  ArrowDownToLine,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  AlertTriangle,
  X,
  CreditCard,
  AlertCircle,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export const AdminWithdrawals: React.FC = () => {
  const { admin, role, openLoginModal } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [summary, setSummary] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    pendingCount: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Approve modal state
  const [approvingReq, setApprovingReq] = useState<WithdrawalRequest | null>(null);
  const [approvingUserExtra, setApprovingUserExtra] = useState<{
    balance: number;
    withdrawalCount: number;
    totalWithdrawn: number;
  } | null>(null);

  // Reject modal state
  const [rejectingReq, setRejectingReq] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWithdrawals = async () => {
    if (role !== 'admin' || !admin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getAdminWithdrawals(
        statusFilter === 'ALL' ? undefined : (statusFilter as WithdrawalStatus),
        searchQuery || undefined
      );
      setWithdrawals(res.withdrawals || []);
      setSummary(res.summary || { totalPending: 0, totalApproved: 0, totalRejected: 0, pendingCount: 0 });
    } catch (err: any) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin' && admin) {
      loadWithdrawals();
    } else {
      setWithdrawals([]);
      setLoading(false);
    }
  }, [statusFilter, admin, role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadWithdrawals();
  };

  // Open approve modal & fetch user extra details
  const handleOpenApprove = async (req: WithdrawalRequest) => {
    setApprovingReq(req);
    setError(null);
    try {
      const userProf = await api.getAdminUserProfile(req.user_id);
      setApprovingUserExtra({
        balance: userProf.financial.currentBalance,
        withdrawalCount: userProf.financial.withdrawalCount,
        totalWithdrawn: userProf.financial.totalWithdrawn
      });
    } catch {
      setApprovingUserExtra({
        balance: 0,
        withdrawalCount: 0,
        totalWithdrawn: 0
      });
    }
  };

  const handleConfirmApprove = async () => {
    if (!approvingReq) return;
    try {
      setProcessing(true);
      setError(null);
      await api.approveWithdrawal(approvingReq.id);
      setSuccess(`Withdrawal #${approvingReq.id.slice(-8)} approved and recorded. Ledger updated.`);
      setApprovingReq(null);
      await loadWithdrawals();
    } catch (err: any) {
      setError(err.message || 'Approval failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await api.rejectWithdrawal(rejectingReq.id, rejectionReason.trim());
      setSuccess(`Withdrawal #${rejectingReq.id.slice(-8)} rejected. Reserved funds restored to user.`);
      setRejectingReq(null);
      setRejectionReason('');
      await loadWithdrawals();
    } catch (err: any) {
      setError(err.message || 'Rejection failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in with administrator credentials to manage member withdrawal requests, record settlements, and process queues.
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
          Withdrawal Requests & Payout Settlement
        </h1>
        <p className="text-xs text-zinc-400">
          Review participant withdrawal requests, record manual payment confirmations, or reject with audit reasons.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboard Card: Pending Requests Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[18px] bg-gradient-to-r from-amber-950/40 to-zinc-900 border border-amber-800/80 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
              Pending Requests
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {summary.pendingCount}
          </div>
          <p className="text-[11px] text-amber-200/80 mt-1">
            Totaling ₹{summary.totalPending.toFixed(2)} in pending settlements
          </p>
        </div>

        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
              Approved Payouts
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            ₹{summary.totalApproved.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Manually paid and recorded
          </p>
        </div>

        <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
              Rejected Payouts
            </span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-400">
            ₹{summary.totalRejected.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Funds restored via ledger reversals
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search WhatsApp, User ID, UPI ID, or Req ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
          />
          <button
            type="submit"
            className="absolute inset-y-1.5 right-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg"
          >
            Find
          </button>
        </form>

        <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`py-1 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Querying withdrawal records...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No withdrawal requests match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">Withdrawal ID</th>
                  <th className="pb-3">User ID</th>
                  <th className="pb-3">WhatsApp Number</th>
                  <th className="pb-3">UPI ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Request Date & Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Settlement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {withdrawals.map(req => {
                  const dateObj = new Date(req.created_at);
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr key={req.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3.5 pl-2 text-zinc-400 text-[11px]">
                        #{req.id.slice(-8)}
                      </td>
                      <td className="py-3.5 text-zinc-400 text-[11px]">
                        #{req.user_id.slice(-8)}
                      </td>
                      <td className="py-3.5 font-semibold text-white">
                        +91 {req.whatsapp_number}
                      </td>
                      <td className="py-3.5 text-zinc-200">
                        {req.upi_id}
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        ₹{req.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-400 text-[11px] font-sans">
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPending
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : isApproved
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right font-sans">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenApprove(req)}
                              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                            >
                              Approve / Pay
                            </button>
                            <button
                              onClick={() => { setRejectingReq(req); setRejectionReason(''); }}
                              className="py-1 px-2.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : isRejected ? (
                          <span className="text-[11px] text-zinc-500" title={req.rejection_reason || ''}>
                            Reason: {req.rejection_reason?.slice(0, 20)}...
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400">
                            ✓ Payment Recorded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADMIN APPROVE MODAL (With explicit confirmation) */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Approve & Mark Payout as Paid</h3>
              </div>
              <button onClick={() => setApprovingReq(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Requested fields from brief: User, WhatsApp, UPI ID, Amount, Wallet Balance, Previous Withdrawal Count, Previous Total Withdrawn */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">User ID:</span>
                <span className="text-white">#{approvingReq.user_id.slice(-8)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">WhatsApp Number:</span>
                <span className="text-white font-bold">+91 {approvingReq.whatsapp_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">UPI ID (Target):</span>
                <span className="text-emerald-400 font-bold">{approvingReq.upi_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">Payout Amount:</span>
                <span className="text-base font-bold text-white">₹{approvingReq.amount.toFixed(2)}</span>
              </div>
              {approvingUserExtra && (
                <>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Wallet Balance:</span>
                    <span className="text-zinc-300">₹{approvingUserExtra.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Previous Withdrawal Count:</span>
                    <span className="text-zinc-300">{approvingUserExtra.withdrawalCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Previous Total Withdrawn:</span>
                    <span className="text-zinc-300">₹{approvingUserExtra.totalWithdrawn.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Confirmation Box */}
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Have you manually completed the payment?</p>
                <p className="text-[11px] text-amber-300/90 mt-0.5">
                  Confirming will record this transaction as WITHDRAWAL (-₹{approvingReq.amount.toFixed(2)}) and update participant totals.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingReq(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmApprove}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Recording...' : 'CONFIRM PAYMENT RECORDED'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REJECT MODAL (Required Reason) */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">Reject Withdrawal Request</h3>
              </div>
              <button onClick={() => setRejectingReq(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono space-y-1">
                <div className="text-zinc-400">Withdrawal: #{rejectingReq.id.slice(-8)} (₹{rejectingReq.amount.toFixed(2)})</div>
                <div className="text-zinc-400">User: +91 {rejectingReq.whatsapp_number}</div>
                <div className="text-zinc-400">UPI: {rejectingReq.upi_id}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                  REJECTION REASON (Required)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incorrect UPI ID / Unreachable bank handle"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  This reason will be displayed in the participant's portal. Reserved balance will be refunded immediately.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'CONFIRM REJECTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
