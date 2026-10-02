import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Wallet,
  ArrowDownToLine,
  Bell,
  User,
  HelpCircle,
  Users,
  MessageSquare,
  FileCheck,
  Receipt,
  ShieldAlert,
  Settings,
  Layers,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  unreadCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, unreadCount = 0 }) => {
  const { role, loginUser, loginAdmin, openLoginModal } = useAuth();

  const userNav: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Simulation Tasks', icon: ClipboardList },
    { id: 'my-claims', label: 'My Tasks', icon: CheckSquare },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const adminNav: NavItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'admin-comment-pool', label: 'Comment Pool', icon: MessageSquare },
    { id: 'admin-submissions', label: 'Submissions', icon: FileCheck },
    { id: 'admin-withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
    { id: 'admin-transactions', label: 'Transactions', icon: Receipt },
    { id: 'admin-audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'support', label: 'Support & Info', icon: HelpCircle },
  ];

  const currentNav = role === 'admin' ? adminNav : userNav;

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-zinc-800/80 bg-zinc-950/60 p-4 min-h-[calc(100vh-4rem)]">
      {/* Mode Tag */}
      <div className="mb-4 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-mono">
          {role === 'admin' ? 'ADMIN VIEW' : 'USER SIMULATOR'}
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>

      {/* Nav List */}
      <nav className="space-y-1">
        {currentNav.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role switch helper box for testing demo */}
      <div className="mt-8 pt-4 border-t border-zinc-900">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 px-2">
          Simulator Switcher
        </p>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              if (role === 'admin') {
                setCurrentView('dashboard');
              } else {
                setCurrentView('admin-dashboard');
              }
            }}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between transition-colors"
          >
            <span>{role === 'admin' ? 'Switch to User View' : 'Switch to Admin View'}</span>
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};
