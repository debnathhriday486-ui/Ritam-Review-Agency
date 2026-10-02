import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Lock, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  KeyRound,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { apiFetch, authStorage } from '../../lib/api.ts';
import { BRAND_CONFIG, User } from '../../../shared/types.ts';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'forgot' | 'admin';
  onSuccess: (data: { role: 'user' | 'admin'; user?: User }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin'>(initialMode);
  
  // Registration and Login state
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Admin Login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Forgot password new pass state
  const [newPassword, setNewPassword] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Send OTP handler
  const handleSendOtp = async (purpose: 'registration' | 'password_reset') => {
    if (!whatsapp || whatsapp.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiFetch<{
        success: boolean;
        message: string;
        cooldownSeconds: number;
        mock_otp?: string;
      }>('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ whatsapp_number: whatsapp, purpose })
      });

      setOtpSent(true);
      setCooldown(res.cooldownSeconds || 60);
      setSuccessMessage(res.message);
      if (res.mock_otp) {
        setMockOtpHint(res.mock_otp);
        setOtpCode(res.mock_otp); // Auto-fill demo OTP 123456 for convenience
      }

      // Start cooldown timer
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch<{
        success: boolean;
        user: User;
        token: string;
        message: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ whatsapp_number: whatsapp, password })
      });

      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      onSuccess({ role: 'user', user: res.user });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch<{
        success: boolean;
        admin: any;
        token: string;
      }>('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });

      authStorage.setToken(res.token);
      authStorage.setAdmin(res.admin);
      onSuccess({ role: 'admin' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!otpSent) {
      setErrorMessage('Please click Send OTP first and enter the verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch<{
        success: boolean;
        user: User;
        token: string;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          whatsapp_number: whatsapp,
          state,
          city,
          otp_code: otpCode,
          password,
          confirm_password: confirmPassword
        })
      });

      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      onSuccess({ role: 'user', user: res.user });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Forgot Password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await apiFetch<{ success: boolean; message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          whatsapp_number: whatsapp,
          otp_code: otpCode,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      setSuccessMessage('Password reset successfully! Please login with your new password.');
      setPassword(newPassword);
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-950 font-black text-xl mb-3 shadow-lg">
            R
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{BRAND_CONFIG.name}</h2>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
            {BRAND_CONFIG.subtitle}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800 mb-6 text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            REGISTER
          </button>
          <button
            onClick={() => { setMode('admin'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'admin' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ADMIN
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="10-digit WhatsApp number"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrorMessage(null); setSuccessMessage(null); }}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white transition-all shadow-lg active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'LOGIN'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM (WhatsApp -> Send OTP -> State -> City -> Password) */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                WhatsApp Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-xs">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleSendOtp('registration')}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-50"
                >
                  {cooldown > 0 ? `${cooldown}s` : 'Send OTP'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  6 Digit OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 text-center tracking-widest font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Tripura"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Agartala"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white transition-all shadow-lg active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD (Complete OTP reset system) */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200">Reset Password via OTP</h3>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Back to Login
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Registered WhatsApp Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-xs">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleSendOtp('password_reset')}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-50"
                >
                  {cooldown > 0 ? `${cooldown}s` : 'Send OTP'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                6 Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 text-center tracking-widest font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white transition-all shadow-lg active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}

        {/* 4. ADMIN LOGIN FORM */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
              Administrative portal for task creation, atomic comment pool management, and payment verification.
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Administrator Username
              </label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Administrator Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all shadow-lg active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Authenticating Admin...' : 'ADMIN LOGIN'}
            </button>
          </form>
        )}

        {/* Support Footer */}
        <div className="mt-8 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
          WhatsApp Support: <span className="text-zinc-300 font-medium">{BRAND_CONFIG.supportWhatsApp}</span>
        </div>
      </div>
    </div>
  );
};
