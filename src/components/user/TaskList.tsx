import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Task, TaskClaim } from '../../../shared/types.ts';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api.ts';

interface TaskListProps {
  tasks: Task[];
  myClaims: TaskClaim[];
  onClaimSuccess: () => void;
  onOpenSubmit: (claim: TaskClaim) => void;
  onViewMockMap: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  myClaims,
  onClaimSuccess,
  onOpenSubmit,
  onViewMockMap
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Map of claims by taskId
  const claimMap = new Map(myClaims.map(c => [c.task_id, c]));

  const handleClaim = async (taskId: string) => {
    setClaimingId(taskId);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const res = await apiFetch<{
        success: boolean;
        claim: TaskClaim;
        message: string;
      }>(`/api/tasks/${taskId}/claim`, {
        method: 'POST'
      });

      setSuccessNotice(res.message);
      onClaimSuccess();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to claim simulation slot.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            SIMULATION TASK INVENTORY
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Available Educational Simulations
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Each task allocates an atomic slot with an exclusive sample comment.
            Claim a task to receive your assigned sample, evaluate the mock business profile, and submit your simulated review.
          </p>
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

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => {
          const userClaim = claimMap.get(task.id);
          const isFull = task.claimed_slots >= task.total_slots;
          const slotsLeft = Math.max(0, task.total_slots - task.claimed_slots);

          return (
            <div
              key={task.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all shadow-xl backdrop-blur-xl group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800">
                    Slot Reward: <span className="text-emerald-400 font-bold">{formatCurrency(task.payment_per_completion)}</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${slotsLeft > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className="font-semibold text-zinc-300">
                      {slotsLeft} / {task.total_slots} Slots Free
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                  {task.name}
                </h3>

                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-200 font-medium">{task.mock_business_name}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{task.mock_location}</span>
                </div>

                <p className="text-xs text-zinc-400 mt-3.5 leading-relaxed line-clamp-3">
                  {task.description}
                </p>

                {/* Progress bar of slot claims */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Participation Progress</span>
                    <span>{Math.round((task.claimed_slots / task.total_slots) * 100)}% Claimed</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-zinc-300 transition-all duration-500"
                      style={{ width: `${(task.claimed_slots / task.total_slots) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onViewMockMap(task.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  View Mock Map
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </button>

                {userClaim ? (
                  <div className="flex items-center gap-2">
                    {userClaim.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed & Paid
                      </span>
                    ) : userClaim.status === 'SUBMITTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        Pending Verification
                      </span>
                    ) : (
                      <button
                        onClick={() => onOpenSubmit(userClaim)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        Submit Simulation
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(task.id)}
                    disabled={isFull || claimingId === task.id}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                      isFull
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                        : 'bg-zinc-100 text-zinc-950 hover:bg-white'
                    }`}
                  >
                    {claimingId === task.id ? (
                      'Locking Slot...'
                    ) : isFull ? (
                      'Slots Full'
                    ) : (
                      <>
                        CLAIM SIMULATION
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

      {tasks.length === 0 && (
        <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <p className="text-zinc-400 text-sm">No active educational simulations available right now.</p>
        </div>
      )}
    </div>
  );
};
