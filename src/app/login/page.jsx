'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState('dark');
  const isLight = theme === 'light';

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setNotice('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Unable to sign in. Check the email and password.');
      return;
    }

    router.push('/');
  };

  const sendResetLink = async () => {
    if (!email.trim()) {
      setErrorMsg('Enter the user email first, then request a password reset link.');
      return;
    }

    setErrorMsg('');
    setNotice('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account/password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Unable to send password reset link.');
      return;
    }

    setNotice('Password reset link sent. Check the inbox for this email.');
  };

  return (
    <div className={`theme-${theme} min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      <div
        className={`fixed inset-0 z-0 pointer-events-none ${isLight ? 'bg-[#f5f7fb]' : 'bg-[#090b0e]'}`}
        style={{
          backgroundImage: isLight
            ? `
              radial-gradient(circle at 8% 10%, rgba(245,158,11,0.16) 0%, rgba(245,158,11,0.055) 34%, transparent 68%),
              radial-gradient(circle at 54% 0%, rgba(14,165,233,0.13) 0%, rgba(14,165,233,0.045) 38%, transparent 72%),
              radial-gradient(circle at 88% 22%, rgba(244,114,182,0.1) 0%, rgba(244,114,182,0.035) 36%, transparent 76%),
              linear-gradient(180deg, rgba(250,252,255,0.96) 0%, rgba(244,247,251,0.96) 54%, rgba(239,243,248,0.98) 100%)`
            : `
              radial-gradient(circle at 12% 15%, rgba(226,149,71,0.28) 0%, rgba(226,149,71,0.08) 35%, transparent 70%),
              radial-gradient(circle at 45% 10%, rgba(234,179,8,0.16) 0%, rgba(234,179,8,0.04) 40%, transparent 75%),
              radial-gradient(circle at 85% 25%, rgba(217,70,239,0.14) 0%, rgba(139,92,246,0.04) 35%, transparent 75%),
              linear-gradient(180deg, rgba(9,11,14,0.2) 0%, rgba(9,11,14,0.78) 58%, rgba(9,11,14,0.96) 100%)`,
        }}
      />

      <button
        type="button"
        onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        className="fixed right-5 top-5 z-20 rounded-xl border border-white/10 bg-[#0B0F15]/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-xl transition-colors hover:text-white"
      >
        {isLight ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mb-6 flex justify-center">
          <img
            src={isLight ? '/voxlab-logo-black.png' : '/voxlab-logo-white.png'}
            alt="VOXLAB"
            className="h-8 w-auto object-contain"
          />
        </div>
        <h2 className="text-lg font-bold tracking-widest text-slate-400 uppercase">
          Platform Access
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Sign in with the account created by VOXLAB admin. Grade access is loaded from Supabase.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B0F15]/60 backdrop-blur-xl border border-[#1A2430] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@voxlab.co"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-400 leading-relaxed font-semibold">
                {errorMsg}
              </div>
            )}

            {notice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400 leading-relaxed font-semibold">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-amber-950/20 mt-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={sendResetLink}
              disabled={loading}
              className="text-[11px] text-slate-400 hover:text-white underline transition-colors disabled:opacity-50"
            >
              Send password reset link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
