import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { X, Lock, Phone, UserCheck, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, openRegisterModal, loginUser, loginAdmin } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);

  // User form states
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');

  // Admin form states
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = whatsapp.replace(/\D/g, '');

    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.login(cleanNumber, password);
      loginUser(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      setError('Admin username and password are required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(adminUsername, adminPassword);
      loginAdmin(res.admin, res.token);
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-[18px] shadow-2xl p-6 sm:p-8 text-zinc-100 overflow-hidden">
        {/* Subtle silver top glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 mb-3 shadow-inner">
            {isAdminMode ? <ShieldCheck className="w-6 h-6 text-zinc-300" /> : <UserCheck className="w-6 h-6 text-zinc-300" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {isAdminMode ? 'Administrator Portal' : 'Simulation Portal Login'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isAdminMode ? 'Control panel access for review verification' : 'Access your educational review simulation work and wallet'}
          </p>
        </div>

        {/* Primary Tab Switch: User vs Admin */}
        <div className="flex p-1 mb-5 bg-zinc-950/80 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isAdminMode ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isAdminMode ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Admin Panel
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!isAdminMode ? (
          /* --- USER LOGIN: NUMBER + PASSWORD DIRECT --- */
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">WhatsApp Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <span className="text-xs font-mono text-zinc-500 mr-1">+91</span>
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-16 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* --- ADMIN LOGIN FORM --- */
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Admin Username</label>
              <input
                type="text"
                required
                placeholder="Username (e.g. ritam or admin)"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'LOGIN AS ADMIN'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Register footer */}
        {!isAdminMode && (
          <div className="mt-5 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { closeLoginModal(); openRegisterModal(); }}
              className="text-white font-semibold underline hover:text-zinc-200 transition-colors"
            >
              Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
