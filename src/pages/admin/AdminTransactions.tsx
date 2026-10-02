import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { WalletTransaction } from '../../../shared/types.ts';
import { Receipt, ArrowUpRight, ArrowDownRight, RotateCcw, ShieldAlert, LogIn } from 'lucide-react';

export const AdminTransactions: React.FC = () => {
  const { admin, role, openLoginModal } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== 'admin' || !admin) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    async function loadTx() {
      try {
        setLoading(true);
        const res = await api.getAllTransactions();
        setTransactions(res.transactions || []);
      } catch (err: any) {
        // Handled cleanly
      } finally {
        setLoading(false);
      }
    }
    loadTx();
  }, [admin, role]);

  if (role !== 'admin' || !admin) {
    return (
      <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please log in with administrator credentials to view system-wide wallet transaction ledgers.
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Master Wallet Ledger
        </h1>
        <p className="text-xs text-zinc-400">
          Complete double-entry accounting records across all simulation payouts, credits, and balance reversals.
        </p>
      </div>

      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">
          All Ledger Entries ({transactions.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Querying ledger entries...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No ledger transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-3 pl-2">Tx ID</th>
                  <th className="pb-3">User ID</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Balance After</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3 pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {transactions.map(tx => {
                  const dateObj = new Date(tx.created_at);
                  const isCredit = tx.type === 'CREDIT';
                  const isReversal = tx.type === 'REVERSAL';

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="py-3.5 pl-2 text-zinc-400 text-[11px]">
                        #{tx.id.slice(-8)}
                      </td>
                      <td className="py-3.5 text-zinc-400 text-[11px]">
                        #{tx.user_id.slice(-8)}
                      </td>
                      <td className="py-3.5 font-sans font-medium text-white max-w-xs truncate">
                        {tx.task_name || tx.description}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                          isCredit
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                            : isReversal
                            ? 'bg-amber-950/70 text-amber-400 border border-amber-800/80'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {isCredit ? <ArrowUpRight className="w-3 h-3" /> : isReversal ? <RotateCcw className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 font-bold ${
                        isCredit ? 'text-emerald-400' : isReversal ? 'text-amber-400' : 'text-zinc-200'
                      }`}>
                        {isCredit ? '+' : isReversal ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-300">
                        ₹{tx.balance_after.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-400 text-[11px] font-sans">
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                          {tx.status}
                        </span>
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
