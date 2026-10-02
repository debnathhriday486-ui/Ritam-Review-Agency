import React, { useState } from 'react';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Building2,
  ExternalLink
} from 'lucide-react';
import { SimulatedSubmission } from '../../../shared/types.ts';
import { apiFetch, formatDateTime } from '../../lib/api.ts';

interface AdminSubmissionsPanelProps {
  submissions: SimulatedSubmission[];
  onRefresh: () => void;
  onViewMockMap: (taskId: string) => void;
}

export const AdminSubmissionsPanel: React.FC<AdminSubmissionsPanelProps> = ({
  submissions,
  onRefresh,
  onViewMockMap
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<SimulatedSubmission | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filtered = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleReview = async (decision: 'VERIFIED' | 'REJECTED') => {
    if (!selectedSub) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/submissions/${selectedSub.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          notes: notes.trim()
        })
      });
      setNotification(`Simulation submission marked as ${decision}. Ledger credits updated if verified.`);
      setSelectedSub(null);
      setNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to review submission');
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
            INTERNAL VERIFICATION ENGINE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Simulation Submissions Review
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Verify submitted practice feedback against assigned criteria. Verification automatically logs a wallet credit ledger entry.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {['all', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                filter === st
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.map((sub) => {
          const dt = formatDateTime(sub.submitted_at);
          return (
            <div
              key={sub.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {sub.task_name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sub.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      sub.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Participant: <strong className="text-zinc-200">+91 {sub.whatsapp_number}</strong> • Submitted: {dt.date} at {dt.time}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewMockMap(sub.task_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                  >
                    View Mock Map
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </button>

                  {sub.status === 'PENDING' && (
                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="px-4 py-1.5 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Review & Decide
                    </button>
                  )}
                </div>
              </div>

              {/* Submitted text preview */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Submitted Simulated Review Text:
                </span>
                <p className="text-zinc-200 font-sans leading-relaxed">
                  "{sub.submitted_comment}"
                </p>
                {sub.proof_notes && (
                  <div className="text-zinc-400 pt-1 text-[11px]">
                    Proof / Ref Notes: <span className="text-zinc-300">{sub.proof_notes}</span>
                  </div>
                )}
              </div>

              {sub.verification_notes && (
                <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                  <span className="font-semibold text-zinc-300">Admin Verification Notes:</span> {sub.verification_notes}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-zinc-500 text-xs">
            No submissions found under "{filter}".
          </div>
        )}
      </div>

      {/* REVIEW DECISION MODAL */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Review Simulation Submission</h3>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <div className="text-zinc-400">
                Task: <strong className="text-white">{selectedSub.task_name}</strong>
              </div>
              <div className="text-zinc-400">
                User: <strong className="text-zinc-200">+91 {selectedSub.whatsapp_number}</strong>
              </div>
              <p className="text-zinc-300 italic pt-2 border-t border-zinc-800/80">
                "{selectedSub.submitted_comment}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Verification / Feedback Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Accurate simulated review quality; criteria satisfied."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleReview('REJECTED')}
                className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold"
              >
                Reject Simulation
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleReview('VERIFIED')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold shadow-lg"
              >
                Verify & Credit Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
