import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Task, TaskClaim } from '../../shared/types.ts';
import {
  ClipboardList,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
  Copy,
  Check,
  RotateCw,
  MessageSquare
} from 'lucide-react';

interface TasksPageProps {
  setCurrentView: (view: string) => void;
  onOpenMockMap: (taskId: string) => void;
  onOpenClaim: (claimId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ setCurrentView, onOpenMockMap, onOpenClaim }) => {
  const { user, openLoginModal } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myClaims, setMyClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Claim success / active slot modal
  const [claimSuccess, setClaimSuccess] = useState<{
    claim: TaskClaim & { comment_text: string };
    task: Task;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, claimsRes] = await Promise.all([
        api.getTasks(),
        user ? api.getUserClaims().catch(() => ({ claims: [] })) : Promise.resolve({ claims: [] }),
      ]);
      setTasks(tasksRes.tasks || []);
      setMyClaims(claimsRes.claims || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCopyComment = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleClaim = async (task: Task) => {
    if (!user) {
      openLoginModal();
      return;
    }

    // Check if user has an active, uncompleted slot on this task
    const activeClaim = myClaims.find(c => c.task_id === task.id && c.status === 'CLAIMED');
    if (activeClaim) {
      // Prompt user with active slot & "I have completed this task"
      setClaimSuccess({
        claim: {
          ...activeClaim,
          comment_text: activeClaim.comment_text || ''
        },
        task
      });
      return;
    }

    if (task.claimed_slots >= task.total_slots) {
      setError('All slots for this task have been claimed.');
      return;
    }

    try {
      setClaimingTaskId(task.id);
      setError(null);
      const res = await api.claimTask(task.id);
      setClaimSuccess({
        claim: res.claim,
        task
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to claim task slot.');
    } finally {
      setClaimingTaskId(null);
    }
  };

  const handleCompleteAndGetNext = async (taskId: string) => {
    if (!user) {
      openLoginModal();
      return;
    }

    try {
      setCompletingTaskId(taskId);
      setError(null);
      const res = await api.completeAndClaimNext(taskId);
      await loadData();

      if (res.nextClaim) {
        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask) {
          setClaimSuccess({
            claim: res.nextClaim,
            task: currentTask
          });
        }
      } else {
        // All slots completed
        setClaimSuccess(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete task and get next slot.');
    } finally {
      setCompletingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Simulation Tasks
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
              MULTI-SLOT PER USER
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Claim a slot to receive a unique comment. Once you post and click &ldquo;I have completed this task&rdquo;, you can claim the next comment for the same link!
          </p>
        </div>

        <button
          onClick={() => setCurrentView('my-claims')}
          className="self-start sm:self-auto py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          <span>My Claimed Tasks ({myClaims.length})</span>
        </button>
      </div>

      {/* Global alert error if any */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-mono text-xs">
          Loading simulation slots...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 rounded-[18px] bg-zinc-900/60 border border-zinc-800 text-center">
          <ClipboardList className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-300">No simulation tasks active</p>
          <p className="text-xs text-zinc-500 mt-1">Check back soon as administrative batches are released.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(task => {
            const isFull = task.claimed_slots >= task.total_slots;
            const activeClaim = myClaims.find(c => c.task_id === task.id && c.status === 'CLAIMED');
            const completedClaimsCount = myClaims.filter(c => c.task_id === task.id && (c.status === 'COMPLETED' || c.status === 'SUBMITTED')).length;
            const remaining = Math.max(0, task.total_slots - task.claimed_slots);
            const slotPercentage = Math.round((task.claimed_slots / task.total_slots) * 100);

            return (
              <div
                key={task.id}
                className="bg-zinc-900 border border-zinc-800 rounded-[18px] p-5 shadow-sm hover:border-zinc-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Name & Reward */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-white tracking-tight">
                        {task.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                        {task.mock_business_name}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 text-sm font-extrabold font-mono shrink-0 shadow-inner">
                      ₹{task.payment_per_completion}
                    </div>
                  </div>

                  {/* Location & Dates */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-3.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {task.mock_location}
                    </span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Until {task.end_date}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                    {task.description}
                  </p>

                  {/* Slot progress bar */}
                  <div className="space-y-1.5 mb-4 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Total Slots</span>
                      <span className="font-mono text-zinc-200 font-semibold">
                        {task.claimed_slots} / {task.total_slots} Claimed ({remaining} remaining)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isFull ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${slotPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* If user previously completed slots for this task */}
                  {completedClaimsCount > 0 && (
                    <div className="mb-4 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        You completed {completedClaimsCount} slot(s) for this link
                      </span>
                      <span className="font-mono font-bold text-white">+₹{completedClaimsCount * task.payment_per_completion}</span>
                    </div>
                  )}

                  {/* If user has an active slot in progress right now on this task */}
                  {activeClaim && (
                    <div className="mb-4 p-3.5 rounded-xl bg-zinc-950 border border-amber-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          Active Slot In Progress:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyComment(activeClaim.comment_text || '')}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedText === activeClaim.comment_text ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>COPY COMMENT</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono leading-relaxed select-all">
                        &ldquo;{activeClaim.comment_text}&rdquo;
                      </div>

                      {/* Underneath: "I have completed this task" button */}
                      <button
                        type="button"
                        disabled={completingTaskId === task.id}
                        onClick={() => handleCompleteAndGetNext(task.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {completingTaskId === task.id ? (
                          <span>Completing & Fetching Next Comment...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>I HAVE COMPLETED THIS TASK → GET NEXT COMMENT</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenMockMap(task.id)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View Mock Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {!activeClaim && (
                    <button
                      onClick={() => handleClaim(task)}
                      disabled={isFull || claimingTaskId === task.id}
                      className={`py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isFull
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-100 hover:bg-white text-zinc-950 cursor-pointer shadow-md hover:scale-[1.02]'
                      }`}
                    >
                      {claimingTaskId === task.id ? (
                        <span>Locking Slot...</span>
                      ) : isFull ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>No slots left</span>
                        </>
                      ) : completedClaimsCount > 0 ? (
                        <>
                          <span>CLAIM ANOTHER SLOT ({remaining} left)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>CLAIM SIMULATION</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim / Next Comment Modal */}
      {claimSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white">Review Slot Assigned!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Post this comment on the link, then click <strong className="text-white">&ldquo;I have completed this task&rdquo;</strong> to receive the next comment for this link!
              </p>
            </div>

            {/* Assigned Comment Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 mb-4">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                <span>Your Assigned Fictional Comment:</span>
                <button
                  type="button"
                  onClick={() => handleCopyComment(claimSuccess.claim.comment_text)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedText === claimSuccess.claim.comment_text ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>COPY COMMENT</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-mono select-all">
                &ldquo;{claimSuccess.claim.comment_text}&rdquo;
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-900">
                <span>Task: <strong className="text-white">{claimSuccess.task.name}</strong></span>
                <span className="text-emerald-400 font-bold font-mono">Reward: ₹{claimSuccess.task.payment_per_completion}</span>
              </div>
            </div>

            {/* Underneath: "I Have Completed This Task" Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={completingTaskId === claimSuccess.task.id}
                onClick={() => handleCompleteAndGetNext(claimSuccess.task.id)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {completingTaskId === claimSuccess.task.id ? (
                  <span>Saving & Fetching Next Comment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I HAVE COMPLETED THIS TASK → GET NEXT COMMENT</span>
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const taskId = claimSuccess.task.id;
                    onOpenMockMap(taskId);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Mock Map Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClaimSuccess(null)}
                  className="py-2 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
