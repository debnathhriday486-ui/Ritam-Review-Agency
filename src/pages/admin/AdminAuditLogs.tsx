import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { AuditLog } from '../../../shared/types.ts';
import { ShieldAlert, Filter, Search, Clock, LogIn } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { admin, role, openLoginModal } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');

  const loadLogs = async (action?: string) => {
    if (role !== 'admin' || !admin) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getAuditLogs(action || undefined);
      setLogs(res.logs || []);
    } catch (err: any) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin' && admin) {
      loadLogs(filterAction);
    } else {
      setLogs([]);
      setLoading(false);
    }
  }, [filterAction, admin, role]);

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in with administrator credentials to view system audit logs.
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
          Administrative Audit Logs
        </h1>
        <p className="text-xs text-zinc-400">
          Immutable event stream capturing administrative actions, password resets, status overrides, and financial approvals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
        >
          <option value="">All Administrative Actions</option>
          <option value="ADMIN_LOGIN">Admin Logins</option>
          <option value="TASK_CREATED">Tasks Created</option>
          <option value="COMMENT_ADDED">Comments Added</option>
          <option value="COMMENT_ASSIGNED">Comments Assigned</option>
          <option value="USER_SUSPENDED">Users Suspended</option>
          <option value="USER_ACTIVATED">Users Activated</option>
          <option value="WITHDRAWAL_APPROVED">Withdrawals Approved</option>
          <option value="WITHDRAWAL_REJECTED">Withdrawals Rejected</option>
          <option value="ADMIN_PASSWORD_RESET">Password Resets</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Querying audit trail...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No audit records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Admin</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3 pr-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {logs.map(log => {
                  const dateObj = new Date(log.created_at);
                  return (
                    <tr key={log.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3 pl-2 text-zinc-400 text-[11px]">
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300">
                        {log.admin_username || 'admin'}
                      </td>
                      <td className="py-3 text-zinc-400">
                        <span className="text-[10px] font-bold text-zinc-500">{log.target_type}:</span> {log.target_id.slice(-8)}
                      </td>
                      <td className="py-3 pr-2 text-zinc-200 font-sans max-w-md">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
