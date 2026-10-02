import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  ArrowDownToLine,
  User,
  Users,
  MessageSquare
} from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setCurrentView }) => {
  const { role } = useAuth();

  const userItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'withdrawals', label: 'Withdraw', icon: ArrowDownToLine },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'admin-comment-pool', label: 'Comments', icon: MessageSquare },
    { id: 'admin-withdrawals', label: 'Payouts', icon: ArrowDownToLine },
  ];

  const items = role === 'admin' ? adminItems : userItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 safe-area-pb">
      <div className="grid grid-cols-5 gap-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-white bg-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-zinc-100 scale-105' : 'text-zinc-500'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
