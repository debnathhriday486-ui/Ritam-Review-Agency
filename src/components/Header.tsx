import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { BRAND_CONFIG } from '../../shared/types.ts';
import {
  Sun,
  Moon,
  Wallet as WalletIcon,
  Shield,
  User as UserIcon,
  LogOut,
  PhoneCall,
  MessageSquare,
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  walletBalance?: number;
}

export const Header: React.FC<HeaderProps> = ({ setCurrentView, walletBalance = 0 }) => {
  const { user, admin, role, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setCurrentView(role === 'admin' ? 'admin-dashboard' : 'dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-zinc-200 to-zinc-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[12px] flex items-center justify-center text-white font-black tracking-wider text-sm group-hover:scale-105 transition-transform">
              RRA
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                {BRAND_CONFIG.name}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-zinc-800 border border-zinc-700/80 text-zinc-300">
                SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden md:block">
              {BRAND_CONFIG.subtitle}
            </p>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-3">
          {/* Support Phone & Message WhatsApp Action */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-300 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {BRAND_CONFIG.supportWhatsApp}
            </span>
            <a
              href={BRAND_CONFIG.whatsappDirectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-900/30 transition-all cursor-pointer group"
              title="Message on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
              <span>Message WhatsApp</span>
            </a>
          </div>

          {/* Quick role or wallet stats */}
          {role === 'user' && user && (
            <button
              onClick={() => setCurrentView('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-600 transition-all text-xs cursor-pointer shadow-inner"
            >
              <WalletIcon className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] text-zinc-400 block leading-tight">Simulated Wallet</span>
                <span className="font-bold text-white font-mono">₹{walletBalance.toFixed(2)}</span>
              </div>
            </button>
          )}

          {role === 'admin' && admin && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200">
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              <span className="font-semibold text-white">Admin: {admin.username}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User / Login state */}
          {role ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView(role === 'admin' ? 'admin-dashboard' : 'profile')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                  {role === 'admin' ? 'A' : (user?.whatsapp_number?.slice(-2) || 'U')}
                </div>
                <span className="hidden sm:inline font-medium">
                  {role === 'admin' ? admin?.name : `+91 ${user?.whatsapp_number}`}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="py-1.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
