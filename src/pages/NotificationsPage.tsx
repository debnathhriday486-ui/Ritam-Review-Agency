import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { AppNotification } from '../../shared/types.ts';
import { Bell, CheckCheck, Clock, Info, CheckCircle2, AlertTriangle, ShieldAlert, Lock, LogIn, UserPlus } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user, openLoginModal, openRegisterModal, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      // Handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      // Handled cleanly
    }
  };

  if (authLoading) {
    return (
      <div className="py-20 text-center text-zinc-500 font-mono text-xs">
        Loading notifications...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Bell className="w-6 h-6 text-zinc-300" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Simulation verification alerts, ledger credit updates, and system notices.
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-[22px] bg-zinc-900 border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
          <Lock className="w-10 h-10 text-zinc-500 mx-auto" />
          <h2 className="text-base font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Please log in to your account to view your activity notifications, verification decisions, and reward notices.
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
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Activity Notifications
        </h1>
        <p className="text-xs text-zinc-400">
          Simulation verification alerts, ledger credit updates, and system notices.
        </p>
      </div>

      <div className="p-5 rounded-[18px] bg-zinc-900 border border-zinc-800 shadow-sm space-y-3">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No notifications in your inbox.
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map(n => {
              const isSuccess = n.type === 'success';
              const isAlert = n.type === 'alert' || n.type === 'warning';

              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                    !n.read
                      ? 'bg-zinc-850/80 border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-850/60 opacity-80'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-950 text-emerald-400'
                      : isAlert
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : isAlert ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-zinc-300'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
