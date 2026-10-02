import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  Activity, 
  Filter,
  CheckCircle,
  FileText
} from 'lucide-react';
import { AuditLog } from '../../../shared/types.ts';
import { formatDateTime } from '../../lib/api.ts';

interface AdminAuditLogsPanelProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AdminAuditLogsPanel: React.FC<AdminAuditLogsPanelProps> = ({ logs, onRefresh }) => {
  const [filterAction, setFilterAction] = useState('');

  const filtered = logs.filter((log) => {
    if (!filterAction) return true;
    return (
      log.action.toLowerCase().includes(filterAction.toLowerCase()) ||
      log.description.toLowerCase().includes(filterAction.toLowerCase()) ||
      (log.admin_username && log.admin_username.toLowerCase().includes(filterAction.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-xl backdrop-blur-xl">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            SYSTEM ACCOUNTABILITY & AUDIT TRAIL
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Security & Action Audit Logs
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable tracking of administrator logins, task changes, comment assignments, and withdrawal decisions.
          </p>
        </div>

        <input
          type="text"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          placeholder="Filter audit actions..."
          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 w-full sm:w-64"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="pb-3 px-3">Log ID</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Actor</th>
                <th className="pb-3 px-3">Target</th>
                <th className="pb-3 px-3">Description</th>
                <th className="pb-3 px-3">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {filtered.map((l) => {
                const dt = formatDateTime(l.created_at);
                return (
                  <tr key={l.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-3 px-3 text-zinc-500">#{l.id.slice(-8)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-zinc-300 font-semibold">
                      {l.admin_username || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {l.target_type} ({l.target_id.slice(-6)})
                    </td>
                    <td className="py-3 px-3 font-sans text-zinc-300 max-w-md">
                      {l.description}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      {dt.date} {dt.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No audit records found matching query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
