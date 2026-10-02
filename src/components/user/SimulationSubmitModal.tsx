import React, { useState } from 'react';
import { 
  CheckCircle, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Send, 
  AlertCircle,
  Copy,
  Check,
  Building2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { apiFetch, formatCurrency } from '../../lib/api.ts';
import { TaskClaim } from '../../../shared/types.ts';
import { AiSampleGenerator } from '../common/AiSampleGenerator.tsx';

interface SimulationSubmitModalProps {
  claim: TaskClaim;
  onClose: () => void;
  onSuccess: () => void;
  onViewMockMap: (taskId: string) => void;
}

export const SimulationSubmitModal: React.FC<SimulationSubmitModalProps> = ({
  claim,
  onClose,
  onSuccess,
  onViewMockMap
}) => {
  const [submittedComment, setSubmittedComment] = useState(claim.comment_text || '');
  const [proofNotes, setProofNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);

  const handleCopyAssigned = () => {
    if (!claim.comment_text) return;
    navigator.clipboard.writeText(claim.comment_text);
    setCopiedComment(true);
    setTimeout(() => setCopiedComment(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittedComment.trim()) {
      setError('Please provide the simulated review text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          claim_id: claim.id,
          submitted_comment: submittedComment,
          proof_notes: proofNotes
        })
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Simulation verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
              EDUCATIONAL SIMULATION SUBMISSION
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              {claim.task_name || 'Simulation Task'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Target: <span className="text-zinc-200">{claim.mock_business_name}</span> | Reward: <span className="text-emerald-400 font-semibold">{formatCurrency(claim.payment_per_completion || 10)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-lg font-mono p-1 rounded-lg hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Assigned Comment Box (One Comment = One User Rule) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Your Exclusively Assigned Sample Comment:
            </span>
            <button
              type="button"
              onClick={handleCopyAssigned}
              className="text-zinc-400 hover:text-white inline-flex items-center gap-1 text-[11px] underline"
            >
              {copiedComment ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedComment ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-zinc-200 italic bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 leading-relaxed">
            "{claim.comment_text}"
          </p>
          <div className="text-[10px] text-zinc-500">
            Locked exclusively to your slot. No other simulation participant has access to this comment.
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-2xl">
          <button
            type="button"
            onClick={() => onViewMockMap(claim.task_id)}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-200 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700/60 hover:bg-zinc-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Inspect Internal Mock Map
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowAiHelper(!showAiHelper)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            {showAiHelper ? 'Hide AI Sample Generator' : 'Use AI Sample Generator'}
          </button>
        </div>

        {showAiHelper && (
          <div className="border border-zinc-700/60 rounded-2xl overflow-hidden p-2 bg-zinc-950/90">
            <AiSampleGenerator
              businessName={claim.mock_business_name}
              onSelectSample={(sample) => {
                setSubmittedComment(sample);
                setShowAiHelper(false);
              }}
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Simulated Review Text (Paste your assigned comment or polished practice feedback)
            </label>
            <textarea
              required
              rows={4}
              value={submittedComment}
              onChange={(e) => setSubmittedComment(e.target.value)}
              placeholder="Paste or review the educational feedback text here..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Simulation Verification Notes / Reference ID (Optional)
            </label>
            <input
              type="text"
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="e.g. Mock test completed on simulated checkout terminal 04"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
            Initial Status upon submit will be <strong>PENDING VERIFICATION</strong>.
            The internal system will verify the simulation against stored criteria and credit{' '}
            <strong className="text-zinc-200">{formatCurrency(claim.payment_per_completion || 10)}</strong> to your simulated wallet.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>Verifying Submission...</>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  SUBMIT SIMULATION
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
