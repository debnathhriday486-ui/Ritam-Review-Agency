import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { TaskClaim, SimulatedSubmission } from '../../shared/types.ts';
import {
  CheckSquare,
  Sparkles,
  MapPin,
  ExternalLink,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RotateCw,
  Edit3
} from 'lucide-react';

interface MyClaimsPageProps {
  onOpenMockMap: (taskId: string) => void;
  selectedClaimId?: string | null;
}

export const MyClaimsPage: React.FC<MyClaimsPageProps> = ({ onOpenMockMap, selectedClaimId }) => {
  const { user, openLoginModal, openRegisterModal, isLoading: authLoading } = useAuth();
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeClaim, setActiveClaim] = useState<TaskClaim | null>(null);

  // Submission form state
  const [submissionComment, setSubmissionComment] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState<string | null>(null);
  const [aiDisclaimer, setAiDisclaimer] = useState<string | null>(null);

  const loadClaims = async () => {
    if (!user) {
      setClaims([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getUserClaims();
      setClaims(res.claims || []);
      if (res.claims && res.claims.length > 0) {
        if (selectedClaimId) {
          const match = res.claims.find(c => c.id === selectedClaimId);
          setActiveClaim(match || res.claims[0]);
        } else {
          setActiveClaim(res.claims[0]);
        }
      } else {
        setActiveClaim(null);
      }
    } catch (err: any) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadClaims();
    } else {
      setClaims([]);
      setActiveClaim(null);
      setLoading(false);
    }
  }, [user, selectedClaimId]);

  useEffect(() => {
    if (activeClaim) {
      setSubmissionComment(activeClaim.comment_text || '');
      setSubmitSuccess(null);
      setSubmitError(null);
      setAiGeneratedText(null);
    }
  }, [activeClaim]);

  const handleGenerateAi = async () => {
    if (!activeClaim) return;
    try {
      setAiGenerating(true);
      const res = await api.generateSampleComment(
        activeClaim.mock_business_name,
        'retail',
        'Customer satisfaction analysis simulation'
      );
      setAiGeneratedText(res.sample_comment);
      setAiDisclaimer(res.disclaimer);
    } catch (err: any) {
      console.error('AI generation error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUseAiSample = () => {
    if (aiGeneratedText) {
      setSubmissionComment(aiGeneratedText);
    }
  };

  const handleSubmitSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;
    if (!submissionComment.trim()) {
      setSubmitError('Please provide the simulated review text.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await api.submitSimulation({
        claim_id: activeClaim.id,
        submitted_comment: submissionComment,
        proof_notes: proofNotes
      });
      setSubmitSuccess('Simulation submitted! Status: PENDING VERIFICATION. An administrator will verify the submission.');
      await loadClaims();
    } catch (err: any) {
      setSubmitError(err.message || 'Simulation verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-xs">
        Loading task claims...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <CheckSquare className="w-10 h-10 text-zinc-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in to your participant account to access your claimed simulation tasks, submit review texts, and track verification status.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={openLoginModal}
            className="py-2.5 px-5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={openRegisterModal}
            className="py-2.5 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs border border-zinc-700 transition-all cursor-pointer"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-xs">
        Loading your task assignments...
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="p-12 rounded-[18px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto">
        <CheckSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-white mb-1">No Active Task Claims</h2>
        <p className="text-xs text-zinc-400 mb-6">
          You haven't claimed any simulation tasks yet. Head over to Simulation Tasks to lock an available slot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Simulation Workspace & My Tasks
        </h1>
        <p className="text-xs text-zinc-400">
          Work on your atomically assigned comments, inspect the mock map, and submit for simulated verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Claims List */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block px-1">
            Claimed Assignments ({claims.length})
          </span>
          <div className="space-y-2">
            {claims.map(claim => {
              const isSelected = activeClaim?.id === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setActiveClaim(claim)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-500 shadow-md ring-1 ring-zinc-500/50'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {claim.task_name}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{claim.payment_per_completion}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{new Date(claim.claimed_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                      claim.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : claim.status === 'SUBMITTED'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Claim Workspace */}
        {activeClaim && (
          <div className="lg:col-span-8 space-y-5">
            {/* Task Card Header */}
            <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{activeClaim.task_name}</h2>
                  <p className="text-xs text-zinc-400 font-medium">
                    {activeClaim.mock_business_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenMockMap(activeClaim.task_id)}
                    className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Mock Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs font-bold font-mono">
                    Reward: ₹{activeClaim.payment_per_completion}
                  </div>
                </div>
              </div>

              {/* Unique Assigned Comment Box */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    Your Unique Assigned Comment (1 User = 1 Comment)
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Locked to your account
                  </span>
                </div>
                <p className="text-xs text-zinc-100 font-mono leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-850 select-all">
                  "{activeClaim.comment_text}"
                </p>
                <p className="text-[11px] text-zinc-400">
                  This exact comment was allocated to you through the atomic transaction lock.
                </p>
              </div>
            </div>

            {/* AI Sample Generator Panel */}
            <div className="p-5 rounded-[18px] bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-300" />
                  <h3 className="text-sm font-bold text-white">AI Sample Generator</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Educational Writing Tool
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate fictional educational sample text to compare structure, tone, and objectivity against your assigned comment.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={aiGenerating}
                  className="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {aiGenerating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{aiGeneratedText ? 'REGENERATE' : 'GENERATE SAMPLE'}</span>
                </button>

                {aiGeneratedText && (
                  <button
                    type="button"
                    onClick={handleUseAiSample}
                    className="py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>USE IN SUBMISSION</span>
                  </button>
                )}
              </div>

              {aiGeneratedText && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 inline-block font-semibold">
                    {aiDisclaimer || 'SIMULATED SAMPLE — NOT FOR REAL-WORLD POSTING'}
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-mono">
                    "{aiGeneratedText}"
                  </p>
                </div>
              )}
            </div>

            {/* Submission Form */}
            {activeClaim.status === 'COMPLETED' ? (
              <div className="p-5 rounded-[18px] bg-emerald-950/40 border border-emerald-800/80 flex items-center gap-3 text-xs text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Simulation Verified & Completed</span>
                  <span>Payment has been credited to your simulated wallet ledger.</span>
                </div>
              </div>
            ) : activeClaim.status === 'SUBMITTED' ? (
              <div className="p-5 rounded-[18px] bg-blue-950/40 border border-blue-800/80 flex items-center gap-3 text-xs text-blue-200">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Internal Status: PENDING VERIFICATION</span>
                  <span>Your submission is under review in the internal administrative database.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSimulation} className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Submit Educational Simulation</span>
                </h3>

                {submitSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Simulation Review Text
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                    placeholder="Enter or paste the educational review sample..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Simulation Notes / Verification Proof (Optional)
                  </label>
                  <input
                    type="text"
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="e.g. Verified mock map location coordinates, checked service response criteria."
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting for Verification...' : '✓ I HAVE COMPLETED THIS TASK (SUBMIT)'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center mt-2 font-mono">
                    Status will update to PENDING VERIFICATION.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
