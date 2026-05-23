'use client';

import React, { useState } from 'react';

// ============================================================================
// ⚠️ PRODUCTION IMPORTS (FOR YOUR LOCAL VS CODE)
// Uncomment these two lines when pasting into your local project:
// ============================================================================
// import { useRouter } from 'next/navigation';
// import { supabase } from '../../lib/supabase';

// ============================================================================
// 🛑 CANVAS SANDBOX MOCKS (DELETE THIS BLOCK IN VS CODE)
// These mocks prevent compilation crashes in the browser preview environment.
// Using standard window.location.href ensures routing works even without Next.js router.
// ============================================================================
const useRouter = () => ({
  push: (path) => {
    window.location.href = path; // Forces a real browser redirect to your main page
  }
});

const supabase = {
  auth: {
    signInWithPassword: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { error: null };
    },
    signUp: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { error: null };
    }
  }
};
// ============================================================================

export default function LoginPage() {
  const router = useRouter();
  
  // State variables for Auth flow
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('staff');
  
  // Status & Error handlers
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Secure Supabase Authentication Router
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        
        // Real Next.js router navigation trigger
        router.push('/'); 
      } else {
        if (!fullName) {
          setErrorMsg('Full Name is required to provision your workspace profile.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role,
            }
          }
        });

        if (error) throw error;

        triggerToast('Account provisioned! Check your email or try logging in.');
        setAuthMode('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An authentication error occurred. Please verify your keys.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoPreFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo-master-password');
    setAuthMode('login');
  };

  return (
    // Note: No background colors here. Global gradient & grain are handled by layout.js
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-[#0F1621] border border-amber-500/30 text-amber-100 px-4 py-3 rounded-xl shadow-2xl animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <p className="text-xs font-semibold tracking-wide">{toastMessage}</p>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mb-6 flex justify-center">
          {/* Custom SVG Geometric Logo */}
          <svg viewBox="0 0 350 75" className="h-8 w-auto text-white fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 20 L 28 58 L 38 58 L 56 20 L 44 20 L 33 46 L 22 20 Z" />
            <path fillRule="evenodd" d="M 68 20 L 102 20 C 111 20, 115 24, 115 32 L 115 46 C 115 54, 111 58, 102 58 L 68 58 C 59 58, 55 54, 55 46 L 55 32 C 55 24, 59 20, 68 20 Z M 69 31 L 69 47 L 101 47 L 101 31 Z" />
            <path d="M 125 20 L 138 20 L 151 38 L 164 20 L 177 20 L 158 44 L 177 58 L 164 58 L 151 40 L 138 58 L 125 58 L 144 44 Z" />
            <path d="M 187 10 L 197 10 L 197 58 L 187 58 Z" />
            <path d="M 207 32 C 207 24, 211 20, 220 20 L 244 20 L 244 58 L 235 58 L 235 52 C 232 56, 228 58, 222 58 C 213 58, 207 54, 207 46 Z M 218 31 L 218 47 C 218 51, 220 53, 225 53 L 234 53 L 234 31 Z" />
            <path d="M 254 10 L 264 10 L 264 30 C 267 24, 272 20, 280 20 C 289 20, 293 24, 293 32 L 293 46 C 293 54, 289 58, 280 58 L 254 58 Z M 264 31 L 264 53 L 280 53 C 285 53, 287 51, 287 46 L 287 32 C 287 27, 285 25, 280 25 Z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold tracking-widest text-slate-400 uppercase">
          Unified Platform Gateway
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Secure, direct authorization synced with Supabase Auth instances & internal role management filters.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B0F15]/60 backdrop-blur-xl border border-[#1A2430] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          {/* Subtle neon glowing header strip */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Sarah Lin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email"
                required
                placeholder="e.g. billing@voxlab.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secure Access Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Profile Workspace Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="staff">Normal Staff</option>
                  <option value="manager">Account Manager</option>
                  <option value="admin">System Admin</option>
                  <option value="client">External Client Partner</option>
                </select>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-400 leading-relaxed font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-amber-950/20 mt-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Credentials...' : authMode === 'login' ? 'Authenticate Access Token' : 'Provision Profile'}
            </button>
            
            <button 
              type="button" 
              onClick={() => router.push('/')}
              className="w-full bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all mt-3 cursor-pointer"
            >
              Skip Login (Dev Mode)
            </button>
          </form>

          <div className="mt-5 text-center">
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setErrorMsg('');
              }}
              className="text-[11px] text-slate-400 hover:text-white underline transition-colors"
            >
              {authMode === 'login' ? 'Need to register a new profile?' : 'Already have a secure key? Return to login'}
            </button>
          </div>

          {/* Quick Sandbox Evaluator Shortcodes */}
          <div className="mt-6 pt-5 border-t border-[#1C2634] space-y-2">
            <p className="text-[9px] uppercase font-black tracking-widest text-slate-500 text-center">Quick Profile Pre-fills</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => quickDemoPreFill('admin@voxlab.co')}
                className="p-2 bg-[#121820] border border-[#212C3B] hover:border-amber-500/30 rounded text-center text-[10px] text-slate-300 transition-colors"
              >
                🚀 Admin
              </button>
              <button 
                onClick={() => quickDemoPreFill('partner@aetheris.com')}
                className="p-2 bg-[#121820] border border-[#212C3B] hover:border-amber-500/30 rounded text-center text-[10px] text-slate-300 transition-colors"
              >
                🤝 Client Partner
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}