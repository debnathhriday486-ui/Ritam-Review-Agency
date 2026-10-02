import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { 
  Wallet as WalletType, 
  WalletTransaction, 
  WithdrawalRequest, 
  UserFinancialStats,
  BRAND_CONFIG 
} from '../../../shared/types.ts';
import { apiFetch, formatCurrency, formatDate, formatDateTime } from '../../lib/api.ts';

interface WalletViewProps {
  wallet: WalletType | null;
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  stats: UserFinancialStats | null;
  onRefresh: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallet,
  transactions,
  withdrawals,
  stats,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'transactions'>('overview');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const currentBalance = stats?.currentBalance ?? wallet?.current_balance ?? 0;
  const totalEarned = stats?.totalEarned ?? wallet?.total_earned ?? 0;
  const totalWithdrawn = stats?.totalWithdrawn ?? wallet?.total_withdrawn ?? 0;
  const pendingAmount = stats?.pendingAmount ?? 0;

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (numAmount > currentBalance) {
      setErrorNotice('Insufficient wallet balance.');
      return;
    }

    if (numAmount < BRAND_CONFIG.minWithdrawalAmount) {
      setErrorNotice(`Minimum withdrawal is ${formatCurrency(BRAND_CONFIG.minWithdrawalAmount)}.`);
      return;
    }

    setLoading(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      await apiFetch('/api/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({
          upi_id: upiId,
          amount: numAmount
        })
      });

      setSuccessNotice('Withdrawal request registered! Admin will review and record the simulation payment.');
      setAmount('');
      setUpiId('');
      onRefresh();
      setActiveTab('overview');
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to request withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              SIMULATED WALLET LEDGER
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Available Simulation Balance</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('withdraw')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-xs hover:bg-white transition-all shadow-lg active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              REQUEST WITHDRAWAL
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
            >
              View Ledger
            </button>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400">Total Earned</div>
            <div className="text-lg font-bold text-zinc-100 mt-1">{formatCurrency(totalEarned)}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400">Total Withdrawn</div>
            <div className="text-lg font-bold text-zinc-100 mt-1">{formatCurrency(totalWithdrawn)}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400">Pending Amount</div>
            <div className="text-lg font-bold text-amber-400 mt-1">{formatCurrency(pendingAmount)}</div>
          </div>
          <div className="p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400">Withdrawals Count</div>
            <div className="text-lg font-bold text-zinc-100 mt-1">{stats?.withdrawalCount ?? 0} requests</div>
          </div>
        </div>
      </div>

      {errorNotice && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-zinc-200 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Withdrawal Requests ({withdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'withdraw'
              ? 'border-zinc-200 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Request Withdrawal
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-zinc-200 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Ledger Transactions ({transactions.length})
        </button>
      </div>

      {/* 1. WITHDRAWAL FORM */}
      {activeTab === 'withdraw' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-2">Request Simulated Withdrawal</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Enter your UPI ID to request a simulated payout record. The platform does not automatically wire real funds;
            records are approved and verified manually by the simulator administrator.
          </p>

          <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-zinc-400">Available Balance:</span>
              <div className="text-base font-bold text-white mt-0.5">{formatCurrency(currentBalance)}</div>
            </div>
            <div className="text-right">
              <span className="text-zinc-400">Minimum Withdrawal:</span>
              <div className="text-base font-bold text-zinc-300 mt-0.5">{formatCurrency(BRAND_CONFIG.minWithdrawalAmount)}</div>
            </div>
          </div>

          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <input
                type="number"
                required
                min={BRAND_CONFIG.minWithdrawalAmount}
                max={currentBalance}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${BRAND_CONFIG.minWithdrawalAmount}`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || currentBalance < BRAND_CONFIG.minWithdrawalAmount}
                className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Submitting Request...' : 'CONFIRM WITHDRAWAL REQUEST'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. WITHDRAWAL RESULTS LIST */}
      {activeTab === 'overview' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-100">Withdrawal History & Results</h3>
            <span className="text-xs text-zinc-400">Total: {withdrawals.length}</span>
          </div>

          <div className="space-y-3">
            {withdrawals.map((w) => {
              const dt = formatDateTime(w.created_at);
              return (
                <div
                  key={w.id}
                  className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        {formatCurrency(w.amount)}
                      </span>
                      {w.status === 'PENDING' && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ⏳ Withdrawal Pending
                        </span>
                      )}
                      {w.status === 'APPROVED' && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          ✓ Successful Withdrawal
                        </span>
                      )}
                      {w.status === 'REJECTED' && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          ✕ Withdrawal Rejected
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400">
                      UPI ID: <span className="text-zinc-200 font-mono">{w.upi_id}</span> • ID: #{w.id.slice(-8)}
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      Requested: {dt.date} at {dt.time}
                    </div>

                    {w.rejection_reason && (
                      <div className="mt-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                        <strong>Admin Rejection Reason:</strong> {w.rejection_reason}
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <div className="text-xs text-zinc-400">Record Status</div>
                    <div className="text-xs font-semibold text-zinc-200 capitalize mt-0.5">
                      {w.status.toLowerCase()}
                    </div>
                  </div>
                </div>
              );
            })}

            {withdrawals.length === 0 && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No withdrawal requests recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TRANSACTION LEDGER TABLE */}
      {activeTab === 'transactions' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-100">Immutable Ledger Records</h3>
            <span className="text-xs text-zinc-500">Every balance change requires a transaction</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="pb-3 px-3">Transaction ID</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Balance After</th>
                  <th className="pb-3 px-3">Date & Time</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                {transactions.map((tx) => {
                  const dt = formatDateTime(tx.created_at);
                  const isCredit = tx.type === 'CREDIT' || tx.type === 'REVERSAL';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3 px-3 text-zinc-400">#{tx.id.slice(-8)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-300 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className={`py-3 px-3 font-bold ${isCredit ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-bold">
                        {formatCurrency(tx.balance_after)}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {dt.date} {dt.time}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-zinc-400 uppercase text-[10px]">{tx.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No ledger transactions found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
