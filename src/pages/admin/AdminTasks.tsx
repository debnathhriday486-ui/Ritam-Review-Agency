import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { Task } from '../../../shared/types.ts';
import {
  ClipboardList,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface AdminTasksProps {
  onOpenMockMap: (taskId: string) => void;
}

export const AdminTasks: React.FC<AdminTasksProps> = ({ onOpenMockMap }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // New task form state
  const [name, setName] = useState('');
  const [mockBusinessName, setMockBusinessName] = useState('');
  const [mockLocation, setMockLocation] = useState('');
  const [description, setDescription] = useState('');
  const [totalSlots, setTotalSlots] = useState('3');
  const [payment, setPayment] = useState('10');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [commentsText, setCommentsText] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const fillDemoData = () => {
    setName('ABC Business Educational Simulation');
    setMockBusinessName('ABC Enterprises');
    setMockLocation('Agartala');
    setDescription('Fictional retail simulation module to evaluate customer service response, check cleanliness, and analyze billing speed.');
    setTotalSlots('3');
    setPayment('10');
    setCommentsText(
      'Sample 1: Prompt customer support and polite staff at the Agartala branch. The billing process was smooth and hassle-free.\nSample 2: Well-organized demo counter and knowledgeable team members. Appreciate the clear warranty guidelines provided.\nSample 3: Clean ambience, good parking arrangement, and genuine product catalog. A commendable local business experience.'
    );
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const commentsList = commentsText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (commentsList.length < Number(totalSlots)) {
      setError(`Please provide at least ${totalSlots} sample comments for the comment pool (currently ${commentsList.length}). Each slot requires 1 unique comment.`);
      return;
    }

    try {
      setSaving(true);
      await api.createTask({
        name,
        mock_business_name: mockBusinessName,
        mock_location: mockLocation,
        description,
        total_slots: Number(totalSlots),
        payment_per_completion: Number(payment),
        start_date: startDate,
        end_date: endDate,
        comments: commentsList,
      });

      setSuccess('Educational simulation task created successfully with comments pool!');
      setIsCreateModalOpen(false);
      setName('');
      setMockBusinessName('');
      setMockLocation('');
      setDescription('');
      setCommentsText('');
      await loadTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      await api.deleteTask(taskToDelete.id);
      setSuccess(`Simulation task "${taskToDelete.name}" and mock review link deleted successfully.`);
      setTaskToDelete(null);
      await loadTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to delete simulation task.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Task Management & Slot Control
          </h1>
          <p className="text-xs text-zinc-400">
            Create educational simulation tasks, configure mock businesses, and assign sample comments.
          </p>
        </div>

        <button
          onClick={() => { setIsCreateModalOpen(true); setError(null); }}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE TASK</span>
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

      {/* Tasks Table */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">
          Simulation Tasks ({tasks.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No simulation tasks configured. Click "CREATE TASK" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">Task Name</th>
                  <th className="pb-3">Mock Business</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Slots (Claimed / Total)</th>
                  <th className="pb-3">Reward</th>
                  <th className="pb-3">Comments Pool</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="py-3 pl-2 font-semibold text-white max-w-xs truncate font-sans">
                      {t.name}
                    </td>
                    <td className="py-3 text-zinc-300 font-sans">
                      {t.mock_business_name}
                    </td>
                    <td className="py-3 text-zinc-400 font-sans">
                      {t.mock_location}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-zinc-200">{t.claimed_slots}</span>
                      <span className="text-zinc-500"> / {t.total_slots}</span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      ₹{t.payment_per_completion}
                    </td>
                    <td className="py-3 text-zinc-300">
                      {t.comments_count || 0} sample comments
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenMockMap(t.id)}
                          className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans inline-flex items-center gap-1 transition-colors"
                          title="Open internal mock review link"
                        >
                          <span>Mock Map</span>
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(t)}
                          className="py-1 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-white text-xs font-sans inline-flex items-center gap-1 transition-colors"
                          title="Delete simulation task and mock review link"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-[18px] shadow-2xl p-6 text-zinc-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-zinc-300" />
                <h3 className="text-base font-bold text-white">Create Educational Simulation Task</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Pre-fill button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={fillDemoData}
                className="py-1 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span>Pre-fill "ABC Business" Demo</span>
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Task Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Business Educational Simulation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Mock Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Enterprises"
                    value={mockBusinessName}
                    onChange={(e) => setMockBusinessName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agartala"
                    value={mockLocation}
                    onChange={(e) => setMockLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Total Slots</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Payment Per Completion (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Task simulation objective and educational purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                ></textarea>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-300">
                    Sample Comments Pool (One per line)
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Rule: 1 User = 1 Unique Comment
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Comment 1 (for Slot 1)&#10;Comment 2 (for Slot 2)&#10;Comment 3 (for Slot 3)"
                  value={commentsText}
                  onChange={(e) => setCommentsText(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono leading-relaxed text-zinc-100 focus:outline-none focus:border-zinc-500"
                ></textarea>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Each line will be added as an available sample comment in the atomic pool.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Creating Task...' : 'CREATE TASK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-red-900/60 rounded-[18px] shadow-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Simulation Task</h3>
                <p className="text-xs text-zinc-400">Permanently delete task & map review link</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <p>
                Are you sure you want to delete <strong className="text-white">"{taskToDelete.name}"</strong>?
              </p>
              <div className="text-[11px] text-zinc-400 font-mono space-y-1">
                <div>Mock Link: <span className="text-amber-400">/mock-map/{taskToDelete.id}</span></div>
                <div>Slots: {taskToDelete.claimed_slots} / {taskToDelete.total_slots}</div>
                <div>Reward: ₹{taskToDelete.payment_per_completion}</div>
              </div>
              <p className="text-[11px] text-red-400 pt-1">
                Notice: All sample comments in the pool, submissions, and slot claim records for this task will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setTaskToDelete(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteTask}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
