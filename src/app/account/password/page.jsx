'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Unable to update password.');
      return;
    }

    setMessage('Password updated. Redirecting to the platform...');
    setTimeout(() => router.push('/'), 900);
  };

  return (
    <div className="theme-dark relative min-h-screen overflow-hidden bg-[#090b0e] px-4 py-12 text-slate-200">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 15%, rgba(226,149,71,0.28) 0%, rgba(226,149,71,0.08) 35%, transparent 70%),
            radial-gradient(circle at 85% 25%, rgba(217,70,239,0.14) 0%, rgba(139,92,246,0.04) 35%, transparent 75%),
            linear-gradient(180deg, rgba(9,11,14,0.2) 0%, rgba(9,11,14,0.78) 58%, rgba(9,11,14,0.96) 100%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex justify-center">
          <img src="/voxlab-logo-white.png" alt="VOXLAB" className="h-8 w-auto object-contain" />
        </div>

        <div className="rounded-2xl border border-[#1A2430] bg-[#0B0F15]/70 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500/80">Account Security</p>
          <h1 className="mt-2 text-xl font-black uppercase tracking-wider text-white">Change Password</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Set a new password after receiving a reset link or while signed in.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[#212C3B] bg-[#121820] px-3 py-2.5 text-xs text-white placeholder-slate-600 transition-all focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-[#212C3B] bg-[#121820] px-3 py-2.5 text-xs text-white placeholder-slate-600 transition-all focus:border-amber-500 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-[11px] font-semibold leading-relaxed text-rose-400">
                {errorMsg}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] font-semibold leading-relaxed text-emerald-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-linear-to-r from-amber-500 to-yellow-600 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-md shadow-amber-950/20 transition-all hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
