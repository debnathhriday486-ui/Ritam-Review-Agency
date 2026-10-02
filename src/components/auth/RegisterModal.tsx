import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { X, Lock, Phone, MapPin, Building, CheckCircle2, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, closeRegisterModal, openLoginModal, loginUser } = useAuth();

  const [whatsapp, setWhatsapp] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isRegisterModalOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = whatsapp.replace(/\D/g, '');

    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    if (!state.trim() || !city.trim() || !password || !confirmPassword) {
      setError('Please fill in all registration details.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.register({
        whatsapp_number: cleanNumber,
        state: state.trim(),
        city: city.trim(),
        password,
        confirm_password: confirmPassword
      });

      loginUser(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-[18px] shadow-2xl p-6 sm:p-8 text-zinc-100 overflow-hidden">
        {/* Top subtle silver glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={closeRegisterModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 mb-3 shadow-inner">
            <UserPlus className="w-6 h-6 text-zinc-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Create Simulation Account</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Instant registration with your WhatsApp phone number and password
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* WhatsApp Phone Number */}
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

          {/* State and City */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">State</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tripura"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">City</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agartala"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing account footer */}
        <div className="mt-5 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => { closeRegisterModal(); openLoginModal(); }}
            className="text-white font-semibold underline hover:text-zinc-200 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
