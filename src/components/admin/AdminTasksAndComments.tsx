import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  Users,
  Trash2
} from 'lucide-react';
import { Task, TaskComment } from '../../../shared/types.ts';
import { apiFetch, formatCurrency, formatDate } from '../../lib/api.ts';
import { AiSampleGenerator } from '../common/AiSampleGenerator.tsx';

interface AdminTasksAndCommentsProps {
  tasks: Task[];
  comments: any[];
  onRefresh: () => void;
  onViewMockMap: (taskId: string) => void;
}

export const AdminTasksAndComments: React.FC<AdminTasksAndCommentsProps> = ({
  tasks,
  comments,
  onRefresh,
  onViewMockMap
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'comments' | 'create_task'>('tasks');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // New task form state
  const [name, setName] = useState('');
  const [mockBusinessName, setMockBusinessName] = useState('');
  const [mockLocation, setMockLocation] = useState('Agartala, Tripura');
  const [description, setDescription] = useState('');
  const [totalSlots, setTotalSlots] = useState('3');
  const [payment, setPayment] = useState('10');
  const [commentsInput, setCommentsInput] = useState('');
  const [showAiInTaskCreate, setShowAiInTaskCreate] = useState(false);

  // Add individual comment state
  const [targetTaskId, setTargetTaskId] = useState('');
  const [singleCommentText, setSingleCommentText] = useState('');
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (selectedTaskFilter !== 'all' && c.task_id !== selectedTaskFilter) return false;
    if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) return false;
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const commentList = commentsInput
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    if (commentList.length === 0) {
      alert('Please enter at least one sample comment (one per line).');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          name,
          mock_business_name: mockBusinessName,
          mock_location: mockLocation,
          description,
          total_slots: Number(totalSlots),
          payment_per_completion: Number(payment),
          comments: commentList
        })
      });

      setMessage('Simulation task created successfully with initialized comment pool!');
      // Reset form
      setName('');
      setMockBusinessName('');
      setDescription('');
      setCommentsInput('');
      onRefresh();
      setActiveSubTab('tasks');
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskId || !singleCommentText.trim()) return;

    try {
      await apiFetch('/api/admin/comments', {
        method: 'POST',
        body: JSON.stringify({
          task_id: targetTaskId,
          comment_text: singleCommentText.trim()
        })
      });

      setSingleCommentText('');
      setShowAddCommentModal(false);
      onRefresh();
      setMessage('New sample comment added to pool!');
    } catch (err: any) {
      alert(err.message || 'Failed to add comment');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            SIMULATION TASK & POOL GOVERNANCE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Tasks & Atomic Comment Pool
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enforcing the atomic One Comment = One User allocation invariant. Completed comments never return to pool.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'tasks' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'comments' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            Comment Pool ({comments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('create_task')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'create_task' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. TASKS LIST VIEW */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Payment: <strong className="text-emerald-400">{formatCurrency(t.payment_per_completion)}</strong>
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {t.claimed_slots} / {t.total_slots} Slots Claimed
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">{t.name}</h3>

                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-200">{t.mock_business_name}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t.mock_location}</span>
                </div>

                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">{t.description}</p>

                <div className="mt-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs flex justify-between items-center font-mono">
                  <span>Comments in Pool: <strong className="text-zinc-100">{t.comments_count || 0}</strong></span>
                  <span>Completed: <strong className="text-emerald-400">{t.completed_slots}</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewMockMap(t.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Inspect Mock Map
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm(`Permanently delete simulation task "${t.name}" and its mock review link?`)) {
                        try {
                          await apiFetch(`/api/tasks/${t.id}`, { method: 'DELETE' });
                          onRefresh();
                        } catch (err: any) {
                          alert(err.message || 'Failed to delete task.');
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors ml-2"
                    title="Delete task and mock review link"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Delete
                  </button>
                </div>

                <button
                  onClick={() => {
                    setTargetTaskId(t.id);
                    setShowAddCommentModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                >
                  + Add Comment to Pool
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ADMIN COMMENT POOL TABLE */}
      {activeSubTab === 'comments' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Comment Pool (One Comment = One User)</h3>
              <p className="text-xs text-zinc-400">
                Status progression: AVAILABLE → ASSIGNED → COMPLETED. Completed comments NEVER return to pool.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="pb-3 px-3">Comment ID</th>
                  <th className="pb-3 px-3">Task Name</th>
                  <th className="pb-3 px-3">Sample Comment Text</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Assigned User</th>
                  <th className="pb-3 px-3">Assigned Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                {filteredComments.map((c) => {
                  return (
                    <tr key={c.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3 px-3 text-zinc-400">#{c.id.slice(-8)}</td>
                      <td className="py-3 px-3 text-zinc-200 font-sans font-medium max-w-[140px] truncate">
                        {c.task_name}
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-sans max-w-sm leading-relaxed">
                        "{c.comment_text}"
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' :
                          c.status === 'ASSIGNED' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-300">
                        {c.assigned_whatsapp ? `+91 ${c.assigned_whatsapp}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {c.assigned_at ? new Date(c.assigned_at).toLocaleString('en-IN') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredComments.length === 0 && (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No comments matching the selected filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CREATE TASK FORM */}
      {activeSubTab === 'create_task' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Create Educational Simulation Task</h3>
            <button
              type="button"
              onClick={() => setShowAiInTaskCreate(!showAiInTaskCreate)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAiInTaskCreate ? 'Hide AI Helper' : 'Open AI Helper'}
            </button>
          </div>

          {showAiInTaskCreate && (
            <div className="mb-6">
              <AiSampleGenerator
                businessName={mockBusinessName || 'ABC Enterprises'}
                onSelectSample={(sample) => {
                  setCommentsInput((prev) => (prev ? `${prev}\n${sample}` : sample));
                }}
              />
            </div>
          )}

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Task Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ABC Business Educational Simulation"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Mock Business Name</label>
                <input
                  type="text"
                  required
                  value={mockBusinessName}
                  onChange={(e) => setMockBusinessName(e.target.value)}
                  placeholder="e.g. ABC Enterprises"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Mock Location</label>
                <input
                  type="text"
                  required
                  value={mockLocation}
                  onChange={(e) => setMockLocation(e.target.value)}
                  placeholder="e.g. Agartala, Tripura"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Total Slots</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Payment Per Completion (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description & Educational Scope</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the simulation scenario..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Fictional Sample Comments (One per line — exactly matches slots)
                </label>
                <span className="text-[11px] text-zinc-500">
                  {commentsInput.split('\n').filter(Boolean).length} comments entered
                </span>
              </div>
              <textarea
                required
                rows={5}
                value={commentsInput}
                onChange={(e) => setCommentsInput(e.target.value)}
                placeholder="Comment 1&#10;Comment 2&#10;Comment 3"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Publishing Task & Generating Pool...' : 'CREATE SIMULATION TASK'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Single Comment Modal */}
      {showAddCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleAddSingleComment} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Add Sample Comment to Task Pool</h3>
            <p className="text-xs text-zinc-400">
              This comment will be added with status AVAILABLE and assigned uniquely upon a user claim.
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Sample Comment Text</label>
              <textarea
                required
                rows={4}
                value={singleCommentText}
                onChange={(e) => setSingleCommentText(e.target.value)}
                placeholder="Enter sample comment text..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCommentModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold"
              >
                Add to Pool
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
