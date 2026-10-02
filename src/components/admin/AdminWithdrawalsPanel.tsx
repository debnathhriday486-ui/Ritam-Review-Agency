import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { WithdrawalRequest, WithdrawalStatus } from '../../../shared/types.ts';
import { apiFetch, formatCurrency, formatDateTime } from '../../lib/api.ts';

interface AdminWithdrawalsPanelProps {
  withdrawals: WithdrawalRequest[];
  onRefresh: () => void;
}

export const AdminWithdrawalsPanel: React.FC<AdminWithdrawalsPanelProps> = ({
  withdrawals,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [selectedForApprove, setSelectedForApprove] = useState<WithdrawalRequest | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filtered = withdrawals.filter((w) => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      w.whatsapp_number.includes(q) ||
      w.upi_id.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q) ||
      w.user_id.toLowerCase().includes(q)
    );
  });

  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;

  const handleApprove = async () => {
    if (!selectedForApprove) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/withdrawals/${selectedForApprove.id}/approve`, {
        method: 'POST'
      });
      setNotification(`Withdrawal #${selectedForApprove.id.slice(-8)} marked as APPROVED and recorded.`);
      setSelectedForApprove(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForReject) return;
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/api/admin/withdrawals/${selectedForReject.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejection_reason: rejectionReason.trim() })
      });
      setNotification(`Withdrawal #${selectedForReject.id.slice(-8)} REJECTED. Reserved funds restored to user.`);
      setSelectedForReject(null);
      setRejectionReason('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reject withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-xl backdrop-blur-xl">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            PAYMENT SETTLEMENT LEDGER
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Withdrawal Requests
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manual simulation payment recording. No automated money transfers are conducted.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs font-mono">
            Pending Requests: <strong className="text-amber-400 text-sm">{pendingCount}</strong>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search WhatsApp, UPI, ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                filterStatus === st
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="pb-3 px-3">Withdrawal ID</th>
                <th className="pb-3 px-3">WhatsApp Number</th>
                <th className="pb-3 px-3">UPI ID</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Request Date & Time</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {filtered.map((w) => {
                const dt = formatDateTime(w.created_at);
                return (
                  <tr key={w.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3 px-3 text-zinc-400">#{w.id.slice(-8)}</td>
                    <td className="py-3 px-3 text-white font-sans font-bold">
                      +91 {w.whatsapp_number}
                    </td>
                    <td className="py-3 px-3 text-zinc-200">{w.upi_id}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {formatCurrency(w.amount)}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {dt.date} {dt.time}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                        w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedForApprove(w)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedForReject(w)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs font-sans">Decided</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No withdrawal records matching current filters.
            </div>
          )}
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {selectedForApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Approve / Mark As Paid</h3>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">User:</span>
                <span className="text-zinc-200 font-bold">+91 {selectedForApprove.whatsapp_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">UPI ID:</span>
                <span className="text-zinc-200 font-mono">{selectedForApprove.upi_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Amount:</span>
                <span className="text-emerald-400 font-bold text-sm">{formatCurrency(selectedForApprove.amount)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium">
              "Have you manually completed the payment?"
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForApprove(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold shadow-lg"
              >
                CONFIRM PAYMENT RECORDED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {selectedForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleReject} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">REJECTION REASON</h3>
            <p className="text-xs text-zinc-400">
              Please enter the specific reason for rejecting the withdrawal of {formatCurrency(selectedForReject.amount)} to {selectedForReject.upi_id}.
              The funds will be instantly restored to the user's wallet.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Rejection Reason (Required)
              </label>
              <input
                type="text"
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incorrect UPI ID or verification incomplete"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setSelectedForReject(null); setRejectionReason(''); }}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                CONFIRM REJECTION
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
