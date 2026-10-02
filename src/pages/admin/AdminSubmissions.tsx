import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { SimulatedSubmission } from '../../../shared/types.ts';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  X,
  AlertCircle,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export const AdminSubmissions: React.FC = () => {
  const { admin, role, openLoginModal } = useAuth();
  const [submissions, setSubmissions] = useState<SimulatedSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review modal state
  const [reviewingSub, setReviewingSub] = useState<SimulatedSubmission | null>(null);
  const [decision, setDecision] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = async () => {
    if (role !== 'admin' || !admin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getAdminSubmissions();
      setSubmissions(res.submissions || []);
    } catch (err: any) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin' && admin) {
      loadSubmissions();
    } else {
      setSubmissions([]);
      setLoading(false);
    }
  }, [admin, role]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSub) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.reviewSubmission(reviewingSub.id, decision, notes);
      setSuccess(`Simulation submission #${reviewingSub.id.slice(-8)} marked as ${decision}. Ledger updated.`);
      setReviewingSub(null);
      setNotes('');
      await loadSubmissions();
    } catch (err: any) {
      setError(err.message || 'Verification update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = submissions.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in with administrator credentials to audit and verify simulation submissions.
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
          Simulated Submission Verifications
        </h1>
        <p className="text-xs text-zinc-400">
          Internal administrative check verifying participant feedback submissions and authorizing simulated wallet credits.
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

      {/* Table Card */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Submissions Queue ({filtered.length})
          </h2>

          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
            {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(status => (
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

        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Querying submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No submissions found under this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">ID</th>
                  <th className="pb-3">WhatsApp Number</th>
                  <th className="pb-3">Task Name</th>
                  <th className="pb-3 max-w-sm">Submitted Feedback</th>
                  <th className="pb-3">Submitted At</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {filtered.map(sub => {
                  const dateObj = new Date(sub.submitted_at);
                  const isPending = sub.status === 'PENDING';
                  const isVerified = sub.status === 'VERIFIED';

                  return (
                    <tr key={sub.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3 pl-2 text-zinc-400 text-[11px]">
                        #{sub.id.slice(-8)}
                      </td>
                      <td className="py-3 font-semibold text-white">
                        +91 {sub.whatsapp_number}
                      </td>
                      <td className="py-3 text-zinc-300 font-sans">
                        {sub.task_name}
                      </td>
                      <td className="py-3 text-zinc-200 max-w-xs truncate font-sans text-xs">
                        "{sub.submitted_comment}"
                      </td>
                      <td className="py-3 text-zinc-400 text-[11px] font-sans">
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPending
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : isVerified
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {isPending ? (
                          <button
                            onClick={() => { setReviewingSub(sub); setDecision('VERIFIED'); setNotes(''); }}
                            className="py-1 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-sm font-sans transition-all cursor-pointer"
                          >
                            Review & Verify
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-sans">
                            {sub.verification_notes || 'Processed'}
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

      {/* REVIEW SUBMISSION MODAL */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-zinc-300" />
                <h3 className="text-base font-bold text-white">Review Simulation Submission</h3>
              </div>
              <button onClick={() => setReviewingSub(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono">
              <div>
                <span className="text-zinc-500">Participant:</span> +91 {reviewingSub.whatsapp_number}
              </div>
              <div>
                <span className="text-zinc-500">Task:</span> {reviewingSub.task_name}
              </div>
              <div className="pt-2 border-t border-zinc-900">
                <span className="text-zinc-500 block mb-1">Submitted Feedback:</span>
                <p className="text-zinc-100 font-sans leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850">
                  "{reviewingSub.submitted_comment}"
                </p>
              </div>
              {reviewingSub.proof_notes && (
                <div className="pt-1">
                  <span className="text-zinc-500">Proof Notes:</span> {reviewingSub.proof_notes}
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Verification Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('VERIFIED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      decision === 'VERIFIED'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    VERIFY (CREDIT WALLET)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      decision === 'REJECTED'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    REJECT SUBMISSION
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Verification Notes / Audit Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Content validated against assigned guidelines."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingSub(null)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'CONFIRM DECISION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
