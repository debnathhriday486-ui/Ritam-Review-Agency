import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { TaskComment, Task } from '../../../shared/types.ts';
import {
  MessageSquare,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  CheckCheck,
  X,
  AlertCircle,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export const AdminCommentPool: React.FC = () => {
  const { admin, role, openLoginModal } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add Comment Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (role !== 'admin' || !admin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [commRes, tasksRes] = await Promise.all([
        api.getCommentPool(),
        api.getTasks(),
      ]);
      setComments(commRes.comments || []);
      setTasks(tasksRes.tasks || []);
      if (tasksRes.tasks && tasksRes.tasks.length > 0 && !selectedTaskId) {
        setSelectedTaskId(tasksRes.tasks[0].id);
      }
    } catch (err: any) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin' && admin) {
      loadData();
    } else {
      setComments([]);
      setLoading(false);
    }
  }, [admin, role]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !newCommentText.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await api.addCommentToPool(selectedTaskId, newCommentText);
      setSuccess('Sample comment added to pool with status AVAILABLE.');
      setNewCommentText('');
      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add comment.');
    } finally {
      setSaving(false);
    }
  };

  const filteredComments = comments.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in with administrator credentials to manage simulation comment pools.
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
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Comment Pool Management
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
              1 USER = 1 COMMENT
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Pool of fictional comments atomically allocated to participants upon claiming simulation slots.
          </p>
        </div>

        <button
          onClick={() => { setIsAddModalOpen(true); setError(null); }}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>ADD SAMPLE COMMENT</span>
        </button>
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

      {/* Status Transition Visual Banner */}
      <div className="p-4 rounded-[18px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 font-bold text-white">AVAILABLE</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800 font-bold text-amber-400">ASSIGNED</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 font-bold text-emerald-400">COMPLETED</span>
        </div>
        <p className="text-[11px] text-zinc-400 font-mono">
          Rule: Completed comments NEVER return to the available pool.
        </p>
      </div>

      {/* Table Card */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Comment Pool Records ({filteredComments.length})
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
            {['ALL', 'AVAILABLE', 'ASSIGNED', 'COMPLETED'].map(status => (
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
            Querying comment pool...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No sample comments match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">Comment ID</th>
                  <th className="pb-3">Task Name</th>
                  <th className="pb-3 max-w-sm">Sample Comment Text</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Assigned User</th>
                  <th className="pb-3">WhatsApp Number</th>
                  <th className="pb-3">Assigned Date</th>
                  <th className="pb-3 pr-2">Assigned Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {filteredComments.map(c => {
                  const assignedDateObj = c.assigned_at ? new Date(c.assigned_at) : null;
                  const isAvailable = c.status === 'AVAILABLE';
                  const isAssigned = c.status === 'ASSIGNED';
                  const isCompleted = c.status === 'COMPLETED';

                  return (
                    <tr key={c.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3 pl-2 text-zinc-400 text-[11px]">
                        #{c.id.slice(-8)}
                      </td>
                      <td className="py-3 font-sans font-medium text-white max-w-[160px] truncate">
                        {(c as any).task_name || 'Task'}
                      </td>
                      <td className="py-3 text-zinc-300 max-w-xs truncate font-sans text-xs">
                        "{c.comment_text}"
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAvailable
                            ? 'bg-zinc-800 text-zinc-300'
                            : isAssigned
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300">
                        {c.assigned_to_user_id ? `#${c.assigned_to_user_id.slice(-8)}` : '—'}
                      </td>
                      <td className="py-3 text-zinc-200 font-semibold">
                        {c.assigned_whatsapp ? `+91 ${c.assigned_whatsapp}` : '—'}
                      </td>
                      <td className="py-3 text-zinc-400 text-[11px]">
                        {assignedDateObj ? assignedDateObj.toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-2 text-zinc-400 text-[11px]">
                        {assignedDateObj ? assignedDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD SAMPLE COMMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-zinc-300" />
                <h3 className="text-base font-bold text-white">Add Sample Comment to Pool</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Select Task
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 font-sans"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.mock_location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Sample Comment Text
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter realistic educational review comment text..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono leading-relaxed text-zinc-100 focus:outline-none focus:border-zinc-500"
                ></textarea>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Will be placed in the AVAILABLE pool and locked to the first user claiming a slot.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'ADD TO POOL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
