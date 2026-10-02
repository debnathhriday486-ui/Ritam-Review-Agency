import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { WithdrawalRequest, BRAND_CONFIG } from '../../shared/types.ts';
import {
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Info,
  ShieldCheck,
  CreditCard,
  LogIn,
  UserPlus,
  Lock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const WithdrawalsPage: React.FC<{ onNavigateToAdmin?: () => void }> = ({ onNavigateToAdmin }) => {
  const { user, role, openLoginModal, openRegisterModal, isLoading: authLoading } = useAuth();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState({
    totalWithdrawn: 0,
    withdrawalCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    pendingAmount: 0
  });

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [walletRes, wdRes] = await Promise.all([
        api.getMyWallet(),
        api.getMyWithdrawals(),
      ]);
      setAvailableBalance(walletRes.wallet?.current_balance || 0);
      setWithdrawals(wdRes.withdrawals || []);
      if (wdRes.stats) {
        setStats(wdRes.stats);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to load withdrawals.';
      // Do not pollute console with expected auth transitions
      if (!errMsg.toLowerCase().includes('authentication') && !errMsg.toLowerCase().includes('log in')) {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setWithdrawals([]);
      setAvailableBalance(0);
      setLoading(false);
    }
  }, [user]);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }

    setError(null);
    setSuccess(null);

    const numericAmount = Number(amount);
    if (!upiId.trim() || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g., username@okhdfcbank or 9876543210@paytm).');
      return;
    }

    if (isNaN(numericAmount) || numericAmount < BRAND_CONFIG.minWithdrawalAmount) {
      setError(`Minimum withdrawal amount is ₹${BRAND_CONFIG.minWithdrawalAmount}.`);
      return;
    }

    if (numericAmount > availableBalance) {
      setError('Insufficient wallet balance.');
      return;
    }

    try {
      setSubmitting(true);
      await api.requestWithdrawal(upiId.trim(), numericAmount);
      setSuccess(`Withdrawal request of ₹${numericAmount} submitted successfully! Status: PENDING.`);
      setAmount('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  // If auth is still resolving
  if (authLoading) {
    return (
      <div className="py-20 text-center text-zinc-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <span>Verifying account session...</span>
      </div>
    );
  }

  // Unauthenticated view
  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2.5">
            <ArrowDownToLine className="w-6 h-6 text-zinc-300" />
            <span>Withdrawal Requests & Payouts</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Simulated payout ledger recording UPI settlement decisions with administrator confirmation.
          </p>
        </div>

        {/* Administrator Notice if logged in as Admin */}
        {role === 'admin' ? (
          <div className="p-6 rounded-[20px] bg-zinc-900 border border-zinc-800 space-y-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Administrator Session Active</h2>
                <p className="text-xs text-zinc-400">
                  You are signed in as an administrator. Member withdrawal approvals and queue processing take place in the Admin console.
                </p>
              </div>
            </div>
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Go to Admin Withdrawals Manager</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Participant Sign-In Required Card */
          <div className="p-6 sm:p-8 rounded-[22px] bg-zinc-900 border border-zinc-800 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-inner">
              <Lock className="w-6 h-6 text-zinc-300" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Authentication Required
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Please log in with your verified WhatsApp number to view your earnings ledger, available payout balance, and submit simulated UPI withdrawal requests.
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
        )}

        {/* Withdrawal Policy & Educational Guidelines */}
        <div className="p-6 rounded-[20px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Withdrawal Policy & Platform Guidelines</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-1.5">
              <span className="text-xs font-bold text-zinc-200 block">Manual Admin Review</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Every payout request is audited by an administrator before approval. No automatic external bank debits occur.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-1.5">
              <span className="text-xs font-bold text-zinc-200 block">Minimum ₹{BRAND_CONFIG.minWithdrawalAmount}</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Requests can be placed once your verified task balance reaches or exceeds the platform threshold of ₹{BRAND_CONFIG.minWithdrawalAmount}.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-1.5">
              <span className="text-xs font-bold text-zinc-200 block">Instant Reversal</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                If a request is rejected (e.g. invalid UPI handle), the reserved amount is immediately refunded back to your balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Withdrawal Requests & Payouts
        </h1>
        <p className="text-xs text-zinc-400">
          Simulated payout ledger recording UPI settlement decisions with administrator confirmation.
        </p>
      </div>

      {/* Auto-Calculated Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-[11px] text-zinc-400 font-medium block mb-1">Total Withdrawn</span>
          <span className="text-xl font-bold font-mono text-white">₹{stats.totalWithdrawn.toFixed(2)}</span>
        </div>
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-[11px] text-zinc-400 font-medium block mb-1">Withdrawal Count</span>
          <span className="text-xl font-bold font-mono text-white">{stats.withdrawalCount}</span>
        </div>
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-[11px] text-zinc-400 font-medium block mb-1">Approved Payouts</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{stats.approvedCount}</span>
        </div>
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
          <span className="text-[11px] text-zinc-400 font-medium block mb-1">Pending In Queue</span>
          <span className="text-xl font-bold font-mono text-amber-400">{stats.pendingCount}</span>
        </div>
        <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] text-zinc-400 font-medium block mb-1">Rejected Payouts</span>
          <span className="text-xl font-bold font-mono text-red-400">{stats.rejectedCount}</span>
        </div>
      </div>

      {/* Request Form + Rules Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              <span>Request Simulation Withdrawal</span>
            </h2>

            {/* Balances Display */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Available Balance</span>
                <span className="text-base font-bold font-mono text-white">₹{availableBalance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Minimum Payout</span>
                <span className="text-base font-bold font-mono text-zinc-300">₹{BRAND_CONFIG.minWithdrawalAmount}</span>
              </div>
            </div>

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  UPI ID (Virtual Payment Address)
                </label>
                <input
                  type="text"
                  required
                  placeholder="name@oksbi or 9876543210@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={BRAND_CONFIG.minWithdrawalAmount}
                  max={availableBalance}
                  placeholder={`Min ₹${BRAND_CONFIG.minWithdrawalAmount}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || availableBalance < BRAND_CONFIG.minWithdrawalAmount}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : 'SUBMIT WITHDRAWAL REQUEST'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Educational Guidelines */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Withdrawal Policy & Rules</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0 mt-1.5"></span>
                <span>
                  <strong>Manual Admin Approval:</strong> In this educational simulator, payments are reviewed and recorded manually by the administrator. No automatic UPI bank transfers occur.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0 mt-1.5"></span>
                <span>
                  <strong>Single Pending Queue:</strong> You can only have one active withdrawal request in the pending queue at a time to prevent duplicate ledger transactions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0 mt-1.5"></span>
                <span>
                  <strong>Full Refund On Rejection:</strong> If an administrator rejects a request (e.g., incorrect UPI handle), the reserved amount is immediately restored to your balance via a REVERSAL ledger entry.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Withdrawal Result Cards: Pending, Approved, Rejected */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white tracking-tight">
          Your Withdrawal History ({withdrawals.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">
            Loading your withdrawal history...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-8 rounded-[18px] bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {withdrawals.map(req => {
              const dateObj = new Date(req.created_at);
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-[18px] border transition-all ${
                    isPending
                      ? 'bg-amber-950/20 border-amber-800/80 shadow-sm'
                      : isApproved
                      ? 'bg-emerald-950/20 border-emerald-800/80 shadow-sm'
                      : 'bg-red-950/20 border-red-800/80 shadow-sm'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono">
                      {isPending && (
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <span>⏳ Withdrawal Pending</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Successful Withdrawal</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-red-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>✕ Withdrawal Rejected</span>
                        </span>
                      )}
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      ₹{req.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Detail Grid */}
                  <div className="space-y-1 text-xs text-zinc-300">
                    <div className="flex justify-between py-1 border-b border-zinc-850/60 font-mono text-[11px]">
                      <span className="text-zinc-500">Withdrawal ID:</span>
                      <span className="text-zinc-300">#{req.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-850/60 font-mono text-[11px]">
                      <span className="text-zinc-500">UPI ID:</span>
                      <span className="text-zinc-200">{req.upi_id}</span>
                    </div>
                    <div className="flex justify-between py-1 font-mono text-[11px]">
                      <span className="text-zinc-500">Date & Time:</span>
                      <span className="text-zinc-400">
                        {dateObj.toLocaleDateString()} · {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Admin Rejection Reason Display */}
                  {isRejected && req.rejection_reason && (
                    <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 space-y-1">
                      <span className="font-semibold block text-[11px] text-red-300 uppercase tracking-wider font-mono">
                        Admin Rejection Reason:
                      </span>
                      <p className="leading-relaxed font-mono">
                        "{req.rejection_reason}"
                      </p>
                    </div>
                  )}

                  {isApproved && (
                    <p className="mt-2.5 text-[11px] text-emerald-300 font-mono">
                      ✓ Administrator verified and recorded manual payment.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
