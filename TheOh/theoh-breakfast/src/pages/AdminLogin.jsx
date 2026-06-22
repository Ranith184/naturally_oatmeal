import React, { useState } from 'react';
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.adminLogin(password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theoh-beige flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-md p-8 sm:p-10 rounded-[32px] border border-theoh-border/60 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-[#004700]" />
          </div>
          <h2 className="text-3xl font-black text-theoh-brown tracking-tight">
            Naturally Eat & Fit Admin
          </h2>
          <p className="mt-2 text-sm text-theoh-muted font-medium">
            Please enter your administrator password to proceed to the dashboard.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-theoh-brown uppercase tracking-wider block">
              Admin Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theoh-muted">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-theoh-border bg-white text-theoh-text placeholder-theoh-muted/65 outline-none focus:border-[#004700] focus:ring-2 focus:ring-[#E8F5E9] transition-all text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004700] hover:bg-[#003300] text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Verifying...' : 'Access Dashboard'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
