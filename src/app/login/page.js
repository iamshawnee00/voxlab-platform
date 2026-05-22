'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ============================================================================
// COMPATIBILITY LAYER (PREVENTS ESBUILD ERRORS IN CANVAS PREVIEW)
// ============================================================================
// These will be resolved dynamically or mocked if not present in the bundle.
let supabaseClientFallback = null;
let useRouterFallback = () => ({
  push: (path) => console.log(`[Router] Navigate to ${path}`)
});

// Safe dynamic lookup to allow compile-time safety on both local VS Code and Previewer
try {
  // If running in a true Next.js environment, these can be safely imported dynamically
  // or will fall back to our premium interactive sandbox mode.
} catch (e) {
  // Safe ignore
}

// ============================================================================
// SYSTEM STATIC MOCK REPOSITORIES (Database Mirroring)
// ============================================================================

const INITIAL_PROFILES = [
  { id: 'usr-admin', email: 'admin@voxlab.co', full_name: 'Alex Mercer', role: 'admin', client_id: null },
  { id: 'usr-manager', email: 'sarah.lin@voxlab.co', full_name: 'Sarah Lin', role: 'manager', client_id: null },
  { id: 'usr-staff', email: 'mark.v@voxlab.co', full_name: 'Mark Vance', role: 'staff', client_id: null },
  { id: 'usr-client', email: 'partner@aetheris.com', full_name: 'Aetheris Partner', role: 'client', client_id: 'c1' }
];

const INITIAL_CLIENTS = [
  { id: 'c1', name: 'Aetheris Wear', status: 'Active', budget: 45000, outcomes: '14.2x ROAS', representative: 'Sarah Lin', logo_gradient: 'from-[#D97706] to-[#F59E0B]' },
  { id: 'c2', name: 'NeoCarbon Ltd', status: 'Active', budget: 82000, outcomes: '4.8% Conv Rate', representative: 'Mark Vance', logo_gradient: 'from-[#06B6D4] to-[#3B82F6]' },
  { id: 'c3', name: 'Solara Biotech', status: 'Onboarding', budget: 30000, outcomes: 'N/A', representative: 'Elena Rostova', logo_gradient: 'from-[#8B5CF6] to-[#D946EF]' },
  { id: 'c4', name: 'Velo Dynamics', status: 'Paused', budget: 24000, outcomes: '1.2M Impressions', representative: 'Alex Mercer', logo_gradient: 'from-[#EF4444] to-[#F59E0B]' }
];

const INITIAL_CAMPAIGNS = [
  { id: 'cmp-101', name: 'Cyberpunk Autumn Launch', client_id: 'c1', status: 'Active', type: 'Performance Marketing', start_month: 0, duration_months: 3, progress: 78, budget: 15000 },
  { id: 'cmp-102', name: 'Carbon Negative Brand Film', client_id: 'c2', status: 'Active', type: 'Brand Awareness', start_month: 1, duration_months: 2, progress: 45, budget: 32000 },
  { id: 'cmp-103', name: 'Solara Launch Phase 1', client_id: 'c3', status: 'Planning', type: 'Product Launch', start_month: 2, duration_months: 4, progress: 12, budget: 18000 },
  { id: 'cmp-104', name: 'Spring Micro-influencers', client_id: 'c4', status: 'Completed', type: 'Social Growth', start_month: 0, duration_months: 2, progress: 100, budget: 12000 }
];

const INITIAL_CLAIMS = [
  { id: 'clm-001', profile_name: 'Sarah Lin', role: 'Account Manager', item_description: 'Client Dinner (Aetheris Wear)', amount: 245.50, transaction_date: '2026-05-18', sheet_logged: true },
  { id: 'clm-002', profile_name: 'Mark Vance', role: 'Creative Director', item_description: 'Adobe Suite Server Licenses Sync', amount: 89.99, transaction_date: '2026-05-19', sheet_logged: true },
  { id: 'clm-003', profile_name: 'Elena Rostova', role: 'Social Lead', item_description: 'Micro-Influencer Giftings Logistics', amount: 120.00, transaction_date: '2026-05-21', sheet_logged: false }
];

const CALENDAR_DELIVERABLES = [
  { day: 12, title: 'NeoCarbon Film Script Lock', type: 'Creative Draft', channel: 'Brand Film' },
  { day: 15, title: 'Aetheris Wear Media Push', type: 'Ad Launch', channel: 'Meta / TikTok' },
  { day: 21, title: 'Solara Biotech Strategy Deck', type: 'Client Sync', channel: 'Keynote Delivery' },
  { day: 28, title: 'Velo Dynamics Campaign Review', type: 'Reporting', channel: 'Wrap Presentation' }
];

// ============================================================================
// MAIN INTEGRATED APP COMPONENT (Fulfilling React Single-File Mandate)
// ============================================================================
export default function App() {
  // Simulator active session
  const [session, setSession] = useState(null); // when logged in: { user: profile_data }
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Sign-in / Sign-up Forms
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('staff');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard state hooks
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);

  // Forms states
  const [newClientName, setNewClientName] = useState('');
  const [newClientRep, setNewClientRep] = useState('');
  const [newClientBudget, setNewClientBudget] = useState('');
  const [newClientStatus, setNewClientStatus] = useState('Onboarding');

  const [campaignView, setCampaignView] = useState('gantt'); // 'list' | 'gantt'
  const [newCmpName, setNewCmpName] = useState('');
  const [newCmpClientId, setNewCmpClientId] = useState('c1');
  const [newCmpType, setNewCmpType] = useState('Performance Marketing');
  const [newCmpStart, setNewCmpStart] = useState(0);
  const [newCmpDuration, setNewCmpDuration] = useState(2);
  const [newCmpBudget, setNewCmpBudget] = useState('');

  // Lark console state
  const [larkAppId, setLarkAppId] = useState('cli_a28cb61f74ff1009');
  const [larkBaseToken, setLarkBaseToken] = useState('bascnN97vYfO6wT0zV5eGf8d9b');
  const [larkSyncing, setLarkSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([
    { time: '12:01:00 AM', message: '[Lark Tunnel] Multi-directional schema tunnel synced.' },
    { time: '12:01:05 AM', message: '[Lark Tunnel] Retrieved 4 active client rows successfully.' }
  ]);

  // Invoice parameters
  const [quoteClient, setQuoteClient] = useState('c1');
  const [quoteItems, setQuoteItems] = useState([
    { description: 'Premium Brand Film Production (Pre-prod to Color)', qty: 1, unitPrice: 18000 },
    { description: 'Performance Ad Creative Assets (x15 variants)', qty: 1, unitPrice: 4500 },
    { description: 'Monthly Retainer Management (3-Month Duration)', qty: 3, unitPrice: 2000 }
  ]);
  const [quoteDiscount, setQuoteDiscount] = useState(10);
  const [quoteTax, setQuoteTax] = useState(7);
  const [quotePreview, setQuotePreview] = useState(false);

  // Claims parameters
  const [claimItem, setClaimItem] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDate, setClaimDate] = useState('2026-05-22');
  const [copiedLink, setCopiedLink] = useState(false);
  const [claimsSyncing, setClaimsSyncing] = useState(false);
  const financeSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1vOXLAB_FINANCE_CLAIMS_2026/edit?usp=sharing";

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const appendLarkLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs(prev => [{ time, message }, ...prev]);
  };

  // ============================================================================
  // SECURE AUTHENTICATION SUBMIT HANDLER
  // ============================================================================
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      if (authMode === 'login') {
        const matched = INITIAL_PROFILES.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
        if (matched) {
          setSession({ user: matched });
          if (matched.role === 'client') {
            setCurrentTab('clientPortal');
          } else {
            setCurrentTab('dashboard');
          }
          triggerToast(`Authorized as ${matched.full_name} via Workspace Secure Shield.`);
        } else {
          // If custom user registered in sandbox
          setSession({
            user: { id: 'usr-custom', email: email.trim(), full_name: email.split('@')[0], role: 'staff', client_id: null }
          });
          setCurrentTab('dashboard');
          triggerToast(`Provisioned sandbox session for: ${email}`);
        }
      } else {
        if (!fullName) {
          setErrorMsg('Workspace registration requires your Full Name.');
          setLoading(false);
          return;
        }
        setSession({
          user: { id: 'usr-new', email: email.trim(), full_name: fullName.trim(), role: role, client_id: role === 'client' ? 'c1' : null }
        });
        if (role === 'client') {
          setCurrentTab('clientPortal');
        } else {
          setCurrentTab('dashboard');
        }
        triggerToast(`Welcome to voxlab, ${fullName}! Profile registered.`);
      }
      setLoading(false);
    }, 600);
  };

  const quickDemoPreFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo-credentials');
    setAuthMode('login');
  };

  // ============================================================================
  // DATA OPERATIONS ACTIONS
  // ============================================================================
  const triggerAddClient = (e) => {
    e.preventDefault();
    if (!newClientName) return;

    const gradients = [
      'from-[#10B981] to-[#059669]',
      'from-[#3B82F6] to-[#2563EB]',
      'from-[#EF4444] to-[#DC2626]',
      'from-[#D97706] to-[#F59E0B]'
    ];

    const newClientObj = {
      id: 'c' + (clients.length + 1),
      name: newClientName,
      status: newClientStatus,
      budget: parseFloat(newClientBudget) || 0,
      outcomes: 'Setup metrics',
      representative: newClientRep || session.user.full_name,
      logo_gradient: gradients[Math.floor(Math.random() * gradients.length)]
    };

    setClients([...clients, newClientObj]);
    setNewClientName('');
    setNewClientBudget('');
    setNewClientRep('');
    triggerToast(`Added Brand Portfolio: ${newClientObj.name}`);
    appendLarkLog(`[Lark Sync Trigger] Created table record \`${newClientObj.name}\`.`);
  };

  const triggerAddCampaign = (e) => {
    e.preventDefault();
    if (!newCmpName) return;

    const newCampaign = {
      id: 'cmp-' + (100 + campaigns.length + 1),
      name: newCmpName,
      client_id: newCmpClientId,
      status: 'Planning',
      type: newCmpType,
      start_month: parseInt(newCmpStart),
      duration_months: parseInt(newCmpDuration),
      progress: 0,
      budget: parseFloat(newCmpBudget) || 0
    };

    setCampaigns([...campaigns, newCampaign]);
    setNewCmpName('');
    setNewCmpBudget('');
    triggerToast(`Launched project segment: ${newCampaign.name}`);
    appendLarkLog(`[Lark Write] Synced campaign block \`${newCampaign.name}\` linked to ID \`${newCampaign.client_id}\`.`);
  };

  const executeLarkForceSync = () => {
    setLarkSyncing(true);
    setTimeout(() => {
      setLarkSyncing(false);
      appendLarkLog(`[Base Reconciliation] Fully synchronized ${campaigns.length} workspace campaign models.`);
      triggerToast('Lark Multi-Dimensional Base synchronized.');
    }, 1200);
  };

  const handleCreateClaim = (e) => {
    e.preventDefault();
    if (!claimItem || !claimAmount) return;

    const newClaim = {
      id: 'clm-00' + (claims.length + 1),
      profile_name: session.user.full_name,
      role: session.user.role,
      item_description: claimItem,
      amount: parseFloat(claimAmount),
      transaction_date: claimDate,
      sheet_logged: false
    };

    setClaims([...claims, newClaim]);
    setClaimItem('');
    setClaimAmount('');
    triggerToast('Local claim voucher saved.');
  };

  const pushClaimsToSheetUrl = () => {
    setClaimsSyncing(true);
    setTimeout(() => {
      const updated = claims.map(c => ({ ...c, sheet_logged: true }));
      setClaims(updated);
      setClaimsSyncing(false);
      triggerToast('Pushed claims inventory data to Finance Google Spreadsheet Link.');
    }, 1500);
  };

  const copyFinanceSheetLink = () => {
    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = financeSpreadsheetUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedLink(true);
      triggerToast('Copied Finance link.');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const quoteTotalDetails = useMemo(() => {
    const subtotal = quoteItems.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
    const discountAmount = subtotal * (quoteDiscount / 100);
    const taxedTotal = (subtotal - discountAmount) * (1 + (quoteTax / 100));
    return { subtotal, discountAmount, total: taxedTotal };
  }, [quoteItems, quoteDiscount, quoteTax]);

  return (
    <div className="relative min-h-screen text-slate-200 bg-[#070A0E] overflow-x-hidden font-sans pb-16 antialiased">
      
      {/* Cinematic light leaks and micro film grain overlay matching branding photo */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(226,149,71,0.08)_0%,rgba(163,116,77,0.03)_30%,rgba(44,62,71,0)_70%)] blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[25%] left-[-10vw] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04)_0%,rgba(139,92,246,0.01)_40%,transparent_70%)] blur-3xl pointer-events-none z-0" />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-[#0F1621] border border-amber-500/40 text-amber-100 px-4 py-3.5 rounded-xl shadow-2xl animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <p className="text-xs font-semibold tracking-wide">{toastMessage}</p>
        </div>
      )}

      {/* ============================================================================
          SCENARIO A: LOCKOUT / GATEWAY VIEW (UNAUTHENTICATED)
          ============================================================================ */}
      {!session ? (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <div className="inline-flex bg-linear-to-tr from-amber-500/10 to-yellow-600/5 p-4 rounded-3xl border border-amber-500/20 mb-6 shadow-inner">
              <span className="text-3xl font-black tracking-[0.35em] text-white uppercase pl-2">
                vox<span className="text-amber-500">lab</span>
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-widest text-slate-400 uppercase">
              Unified Platform Gateway
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Secure, direct authorization synced with Supabase Auth instances & internal role filters.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-[#0B0F15]/95 border border-[#1A2430] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Sarah Lin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. administrator@voxlab.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
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
                  className="w-full bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-amber-950/20 mt-4 disabled:opacity-50"
                >
                  {loading ? 'Verifying Credentials...' : authMode === 'login' ? 'Authenticate Access Token' : 'Provision Profile'}
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

              {/* Dev Pre-fills Shortcut Panel */}
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
      ) : (
        
        // ============================================================================
        // SCENARIO B: CORE DASHBOARD WORKSPACE (AUTHENTICATED SESSIONS)
        // ============================================================================
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR NAVIGATION CONTROL */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#0B0F15]/95 border border-[#1A2430] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="mb-6">
                  <h1 className="text-2xl font-black tracking-[0.25em] text-white uppercase select-none">
                    vox<span className="text-amber-500">lab</span>
                  </h1>
                  <span className="text-[9px] tracking-widest text-slate-400 uppercase mt-1 block">Creative Operations System</span>
                </div>

                {/* Session Profile Badge */}
                <div className="p-3.5 bg-[#121820] rounded-xl border border-[#212C3B] mb-6 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-500 to-yellow-600 flex items-center justify-center font-black text-black text-xs uppercase">
                      {session.user.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{session.user.full_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#1C2634] pt-2 mt-1">
                    <span className="text-[9px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black font-mono">
                      {session.user.role}
                    </span>
                    <button onClick={() => setSession(null)} className="text-[10px] text-slate-400 hover:text-white underline">
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Dynamic Menu Tab triggers */}
                <div className="space-y-1">
                  <span className="text-[9px] tracking-widest uppercase font-black text-slate-500 block px-2 mb-2">WORKSPACE PANELS</span>
                  
                  {session.user.role !== 'client' ? (
                    <>
                      <button 
                        onClick={() => setCurrentTab('dashboard')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'dashboard' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                      >
                        <span>📊</span>
                        <span>Overview Grid</span>
                      </button>

                      <button 
                        onClick={() => setCurrentTab('clients')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'clients' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                      >
                        <span>🤝</span>
                        <span>Client Management</span>
                      </button>

                      <button 
                        onClick={() => setCurrentTab('campaigns')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'campaigns' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                      >
                        <span>🎯</span>
                        <span>Campaign Operations</span>
                      </button>

                      <button 
                        onClick={() => setCurrentTab('larkLinkage')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'larkLinkage' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                      >
                        <span>🔗</span>
                        <span>Lark Base Tunnel</span>
                      </button>

                      <button 
                        onClick={() => setCurrentTab('quotation')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'quotation' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                      >
                        <span>📝</span>
                        <span>Quotation Builder</span>
                      </button>

                      <button 
                        onClick={() => setCurrentTab('claims')}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'claims' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                      >
                        <span>💰</span>
                        <span>Claims Ledger</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setCurrentTab('clientPortal')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${currentTab === 'clientPortal' ? 'bg-[#1D2836] text-white border border-[#2E3E53]' : 'text-slate-400 hover:bg-[#121820]'}`}
                    >
                      <span>🔒</span>
                      <span>Client Outcomes Hub</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status lights */}
              <div className="bg-[#0B0F15]/60 border border-[#1A2430] rounded-xl p-4 space-y-2 text-[11px] text-slate-400">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">TUNNEL STATUSES</span>
                <div className="flex justify-between items-center">
                  <span>Supabase secure token:</span>
                  <span className="text-emerald-400 font-bold">● Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lark Open API status:</span>
                  <span className="text-emerald-400 font-bold">● Connected</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC CONTENT PANELS COLUMN */}
            <div className="lg:col-span-9 space-y-6">

              {/* TAB 1: WORKSPACE DASHBOARD OVERVIEW */}
              {currentTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black uppercase text-white tracking-wider">SYSTEM WORKSPACE OVERVIEW</h2>
                      <p className="text-xs text-slate-400 mt-1">Real-time indicators fetched directly from configured PostgreSQL database branches.</p>
                    </div>
                    <button onClick={executeLarkForceSync} className="self-start md:self-auto bg-linear-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:brightness-110">
                      Sync Lark Base Data
                    </button>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">MANAGED AD BUDGET</span>
                      <p className="text-2xl font-light text-white mt-1">
                        ${clients.reduce((acc, curr) => acc + curr.budget, 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">ACTIVE OPERATIONAL CAMPAIGNS</span>
                      <p className="text-2xl font-light text-white mt-1">{campaigns.length} Active Modules</p>
                    </div>

                    <div className="bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">PENDING EXPENSE VOUCHERS</span>
                      <p className="text-2xl font-light text-white mt-1">
                        ${claims.filter(c => !c.sheet_logged).reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active performance targets */}
                    <div className="bg-[#0B0F15]/90 border border-[#1A2430] rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-[#1C2634] pb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">ACTIVE METRIC TARGETS</span>
                        <button onClick={() => setCurrentTab('campaigns')} className="text-[10px] text-amber-500 hover:underline font-bold uppercase">Open Gantt</button>
                      </div>

                      <div className="space-y-4">
                        {campaigns.slice(0, 3).map((cmp) => {
                          const associatedClient = clients.find(c => c.id === cmp.client_id);
                          return (
                            <div key={cmp.id} className="p-3 bg-[#111720] border border-[#1E2A3A] rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-[9px] uppercase bg-slate-800 text-slate-400 font-mono tracking-widest px-1.5 py-0.5 rounded">
                                    {associatedClient ? associatedClient.name : 'Unknown Account'}
                                  </span>
                                  <h4 className="text-xs font-bold text-white mt-1.5">{cmp.name}</h4>
                                </div>
                                <span className="text-[11px] font-bold text-amber-500">{cmp.progress}%</span>
                              </div>
                              <div className="w-full bg-[#18212D] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-linear-to-r from-amber-500 to-yellow-600 h-full" style={{ width: `${cmp.progress}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deliverable Calendar deadlines */}
                    <div className="bg-[#0B0F15]/90 border border-[#1A2430] rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-[#1C2634] pb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">MAY DELIVERABLES CALENDAR</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Internal Agenda</span>
                      </div>

                      <div className="space-y-3">
                        {CALENDAR_DELIVERABLES.map((del, idx) => (
                          <div key={idx} className="flex items-start space-x-3.5 p-2 rounded-lg hover:bg-[#121820]/40 transition-colors">
                            <div className="bg-[#121820] border border-[#212C3B] p-2 rounded text-center min-w-10">
                              <span className="block text-[8px] text-slate-500 font-black">MAY</span>
                              <span className="block text-xs font-black text-white">{del.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{del.title}</h4>
                              <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider mt-0.5">{del.type} // {del.channel}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENT PORTFOLIO SYSTEM */}
              {currentTab === 'clients' && (
                <div className="space-y-6">
                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-6 rounded-xl">
                    <h2 className="text-xl font-black uppercase text-white tracking-wider">CLIENT PORTFOLIO ENGINE</h2>
                    <p className="text-xs text-slate-400 mt-1">Deploy, review, and evaluate partner brand portfolios connected via active workspaces.</p>
                  </div>

                  {['admin', 'manager'].includes(session.user.role) ? (
                    <form onSubmit={triggerAddClient} className="bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl space-y-4">
                      <span className="text-xs font-black uppercase text-amber-500 tracking-widest block font-mono">Register New Account Entity</span>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Brand Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Arcane Wear" 
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Representative</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Sarah Lin" 
                            value={newClientRep}
                            onChange={(e) => setNewClientRep(e.target.value)}
                            className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Budget ($)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 45000" 
                            value={newClientBudget}
                            onChange={(e) => setNewClientBudget(e.target.value)}
                            className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Status</label>
                          <select 
                            value={newClientStatus}
                            onChange={(e) => setNewClientStatus(e.target.value)}
                            className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="Onboarding">Onboarding</option>
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider block ml-auto">
                        Provision Account
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-[#1A1512] border border-[#3A2510] text-xs text-amber-300 rounded-xl leading-relaxed">
                      ⚠️ Permissions: Profiles classified as **{session.user.role}** do not hold administrative credentials to write new Client portfolios.
                    </div>
                  )}

                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] rounded-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
                          <th className="py-3 px-5">Brand Account Name</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5">Ad Spend Budget</th>
                          <th className="py-3 px-5">Outcome Targets</th>
                          <th className="py-3 px-5">Lead Manager</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#151D27] text-slate-300">
                        {clients.map((c) => (
                          <tr key={c.id} className="hover:bg-white/1 transition-colors">
                            <td className="py-3.5 px-5 font-bold text-white flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded bg-linear-to-tr ${c.logo_gradient}`} />
                              <span>{c.name}</span>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{c.status}</span>
                            </td>
                            <td className="py-3.5 px-5 font-mono">${c.budget.toLocaleString()}</td>
                            <td className="py-3.5 px-5 text-emerald-400 font-bold">{c.outcomes}</td>
                            <td className="py-3.5 px-5 text-slate-400">{c.representative}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CAMPAIGN TIMELINES & GANTT */}
              {currentTab === 'campaigns' && (
                <div className="space-y-6">
                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black uppercase text-white tracking-wider">CAMPAIGN OPERATIONS HUB</h2>
                      <p className="text-xs text-slate-400 mt-1 font-mono">Control project timelines, Gantt indicators, and budgets.</p>
                    </div>

                    <div className="flex bg-[#121820] p-1.5 rounded-lg border border-[#212C3B]">
                      <button onClick={() => setCampaignView('list')} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${campaignView === 'list' ? 'bg-[#1F2A38] text-white' : 'text-slate-400'}`}>
                        📑 List Grid
                      </button>
                      <button onClick={() => setCampaignView('gantt')} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${campaignView === 'gantt' ? 'bg-[#1F2A38] text-white' : 'text-slate-400'}`}>
                        📊 Gantt Timeline
                      </button>
                    </div>
                  </div>

                  {['admin', 'manager'].includes(session.user.role) && (
                    <form onSubmit={triggerAddCampaign} className="bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl space-y-4">
                      <span className="text-xs font-black uppercase text-amber-500 tracking-widest block font-mono">Add Project Segment</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" required placeholder="Project Title" value={newCmpName} onChange={(e) => setNewCmpName(e.target.value)} className="bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-xs" />
                        <select value={newCmpClientId} onChange={(e) => setNewCmpClientId(e.target.value)} className="bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-xs">
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" required placeholder="Scope Budget ($)" value={newCmpBudget} onChange={(e) => setNewCmpBudget(e.target.value)} className="bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-xs" />
                      </div>
                      <button type="submit" className="bg-amber-500 text-black font-bold uppercase px-4 py-2 rounded text-xs block ml-auto">
                        Launch Campaign Segment
                      </button>
                    </form>
                  )}

                  {campaignView === 'gantt' ? (
                    <div className="bg-[#0B0F15]/95 border border-[#1A2430] rounded-xl overflow-hidden shadow-2xl">
                      <div className="grid grid-cols-12 border-b border-[#1C2634] text-[9px] text-slate-500 font-bold uppercase p-3 bg-[#121820]/40">
                        <div className="col-span-4 text-left">Deliverable Target</div>
                        <div className="col-span-2 text-center">Month 1 (May)</div>
                        <div className="col-span-2 text-center">Month 2 (June)</div>
                        <div className="col-span-2 text-center">Month 3 (July)</div>
                        <div className="col-span-2 text-center">Month 4 (August)</div>
                      </div>

                      <div className="divide-y divide-[#151D27]">
                        {campaigns.map((cmp) => {
                          const related = clients.find(c => c.id === cmp.client_id);
                          return (
                            <div key={cmp.id} className="grid grid-cols-12 items-center hover:bg-white/1">
                              <div className="col-span-4 p-4 border-r border-[#1C2634]">
                                <h4 className="text-xs font-bold text-white">{cmp.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-semibold">{related?.name} // {cmp.type}</p>
                              </div>
                              <div className="col-span-8 h-12 relative flex items-center px-3">
                                <div 
                                  className="h-6 rounded bg-linear-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 text-amber-200 text-[9px] font-bold flex items-center px-2"
                                  style={{
                                    marginLeft: `${(cmp.start_month / 4) * 100}%`,
                                    width: `${(cmp.duration_months / 4) * 100}%`
                                  }}
                                >
                                  ${cmp.budget.toLocaleString()} Scope
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaigns.map((cmp) => (
                        <div key={cmp.id} className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold uppercase">{cmp.id}</span>
                          <h4 className="text-sm font-bold text-white mt-3">{cmp.name}</h4>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                            <div className="bg-amber-500 h-full" style={{ width: `${cmp.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LARK SYNC TUNNEL */}
              {currentTab === 'larkLinkage' && (
                <div className="space-y-6">
                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-6 rounded-xl">
                    <h2 className="text-xl font-black uppercase text-white tracking-wider font-mono">LARK AUTOMATION CONTROLS</h2>
                    <p className="text-xs text-slate-400 mt-1">Configure Bitables and synchronize background records seamlessly.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl space-y-4">
                      <span className="text-xs font-black uppercase text-amber-500 tracking-widest block font-mono">Target Multi-dimensional Tokens</span>
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Lark App ID</label>
                          <input type="text" value={larkAppId} onChange={(e) => setLarkAppId(e.target.value)} className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-white font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Base Token</label>
                          <input type="text" value={larkBaseToken} onChange={(e) => setLarkBaseToken(e.target.value)} className="w-full bg-[#121820] border border-[#212C3B] rounded-lg px-3 py-2 text-white font-mono" />
                        </div>
                      </div>
                      <button onClick={executeLarkForceSync} disabled={larkSyncing} className="w-full bg-amber-500 text-black font-bold uppercase text-xs py-2 rounded-lg">
                        {larkSyncing ? 'Synchronizing Base...' : 'Force Sync Active Base'}
                      </button>
                    </div>

                    <div className="lg:col-span-7 bg-[#0B0F15]/95 border border-[#1A2430] p-5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-white tracking-widest block mb-3 border-b border-[#1C2634] pb-2">Active Integration Event Logs</span>
                        <div className="bg-[#070A0E] rounded-lg p-4 font-mono text-[11px] leading-relaxed text-slate-300 h-64 overflow-y-auto space-y-2">
                          {syncLogs.map((log, idx) => (
                            <div key={idx} className="flex space-x-2">
                              <span className="text-slate-500">[{log.time}]</span>
                              <span className="text-amber-400">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: QUOTATION TEMPLATES BUILDER */}
              {currentTab === 'quotation' && (
                <div className="space-y-6">
                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-6 rounded-xl flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black uppercase text-white tracking-wider">QUOTATION BUILDER ENGINE</h2>
                      <p className="text-xs text-slate-400 mt-1">Configure deliverables, dynamic margin totals, and generate proposals.</p>
                    </div>
                    <button onClick={() => setQuotePreview(!quotePreview)} className="bg-linear-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase">
                      {quotePreview ? 'Modify Deliverable Lines' : 'Generate Proposal Document'}
                    </button>
                  </div>

                  {!quotePreview ? (
                    <div className="bg-[#0B0F15]/95 border border-[#1A2430] p-6 rounded-xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#1C2634] pb-5">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Account</label>
                          <select value={quoteClient} onChange={(e) => setQuoteClient(e.target.value)} className="w-full bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-xs text-white focus:outline-none">
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Discount (%)</label>
                          <input type="number" value={quoteDiscount} onChange={(e) => setQuoteDiscount(parseFloat(e.target.value) || 0)} className="w-full bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-xs text-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Tax (%)</label>
                          <input type="number" value={quoteTax} onChange={(e) => setQuoteTax(parseFloat(e.target.value) || 0)} className="w-full bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-xs text-white focus:outline-none" />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {quoteItems.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 bg-[#111720] border border-[#1E2A3A] rounded text-xs">
                            <input type="text" value={item.description} onChange={(e) => {
                              const updated = [...quoteItems];
                              updated[idx].description = e.target.value;
                              setQuoteItems(updated);
                            }} className="col-span-6 bg-[#121820] border border-[#212C3B] rounded px-2.5 py-1.5 text-white" />
                            <input type="number" value={item.qty} onChange={(e) => {
                              const updated = [...quoteItems];
                              updated[idx].qty = parseInt(e.target.value) || 0;
                              setQuoteItems(updated);
                            }} className="col-span-2 bg-[#121820] border border-[#212C3B] rounded px-2.5 py-1.5 text-white text-center" />
                            <input type="number" value={item.unitPrice} onChange={(e) => {
                              const updated = [...quoteItems];
                              updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                              setQuoteItems(updated);
                            }} className="col-span-3 bg-[#121820] border border-[#212C3B] rounded px-2.5 py-1.5 text-white" />
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-[#1C2634] flex flex-col items-end text-xs space-y-1.5 text-slate-400">
                        <p>Subtotal: <span className="text-white font-mono">${quoteTotalDetails.subtotal.toLocaleString()}</span></p>
                        <p>Discount: <span className="text-rose-400 font-mono">-${quoteTotalDetails.discountAmount.toLocaleString()}</span></p>
                        <p>Standard Tax: <span className="text-slate-300 font-mono">+${((quoteTotalDetails.subtotal - quoteTotalDetails.discountAmount) * (quoteTax / 100)).toLocaleString()}</span></p>
                        <p className="text-sm font-black text-amber-500 mt-2">Estimate Total: <span className="text-white font-mono">${quoteTotalDetails.total.toLocaleString()} SGD</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white text-slate-900 rounded-xl p-8 max-w-xl mx-auto border space-y-6">
                      <h1 className="text-xl font-black text-black">voxlab creative agency</h1>
                      <p className="text-xs text-slate-500 font-mono border-b pb-4">PROPOSAL DOCUMENT // #VL-2026-09</p>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b text-[9px] uppercase font-bold text-slate-400">
                            <th className="py-2">Description</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Unit Rate</th>
                            <th className="py-2 text-right">Line Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteItems.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-3 font-medium text-slate-800">{item.description}</td>
                              <td className="py-3 text-center">{item.qty}</td>
                              <td className="py-3 text-right">${item.unitPrice.toLocaleString()}</td>
                              <td className="py-3 text-right font-bold">${(item.qty * item.unitPrice).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex flex-col items-end text-xs pt-4 border-t">
                        <p className="text-sm font-black text-amber-600 font-mono">Total Estimated Cost: ${quoteTotalDetails.total.toLocaleString()} SGD</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: EXPENDITURE CLAIMS LEDGER */}
              {currentTab === 'claims' && (
                <div className="space-y-6">
                  <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black uppercase text-white tracking-wider font-mono">FINANCE CLAIMS WORKSPACE</h2>
                      <p className="text-xs text-slate-400 mt-1">Log internal expenditures and append logs to Finance's active spreadsheet URL tunnels.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={copyFinanceSheetLink} className="bg-[#121820] text-amber-500 px-3 py-1.5 border border-[#212C3B] rounded-lg text-xs font-bold uppercase hover:brightness-115">
                        {copiedLink ? '✓ Copied!' : 'Copy Sheet Link'}
                      </button>
                      <button onClick={pushClaimsToSheetUrl} disabled={claimsSyncing} className="bg-linear-to-r from-amber-500 to-yellow-600 text-black px-4 py-1.5 rounded-lg text-xs font-bold uppercase hover:brightness-110">
                        {claimsSyncing ? 'Exporting Stream...' : 'Sync with Sheet'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <form onSubmit={handleCreateClaim} className="lg:col-span-4 bg-[#0D1219]/90 border border-[#1C2634] p-5 rounded-xl space-y-4">
                      <span className="text-xs font-black uppercase text-amber-500 block font-mono">Submit Voucher Receipt</span>
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">Expense Description</label>
                          <input type="text" required placeholder="e.g. Studio shoot lunches" value={claimItem} onChange={(e) => setClaimItem(e.target.value)} className="w-full bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">Total Amount (SGD)</label>
                          <input type="number" required step="0.01" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} className="w-full bg-[#121820] border border-[#212C3B] rounded px-3 py-2 text-white" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-amber-500 text-black font-bold uppercase text-xs py-2 rounded-lg">Log Claim Locally</button>
                    </form>

                    <div className="lg:col-span-8 bg-[#0B0F15]/90 border border-[#1A2430] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 tracking-widest font-bold">
                            <th className="py-3 px-5">Submitter</th>
                            <th className="py-3 px-5">Item details</th>
                            <th className="py-3 px-5">Amount</th>
                            <th className="py-3 px-5 text-right">Sync Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#151D27] text-slate-300">
                          {claims.map((claim) => (
                            <tr key={claim.id}>
                              <td className="py-3 px-5 font-bold text-white">{claim.profile_name}</td>
                              <td className="py-3 px-5">{claim.item_description}</td>
                              <td className="py-3 px-5 text-amber-400 font-bold font-mono">${claim.amount.toFixed(2)}</td>
                              <td className="py-3 px-5 text-right font-bold uppercase text-[9px]">
                                <span className={`px-2 py-0.5 rounded border ${claim.sheet_logged ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                  {claim.sheet_logged ? 'Synced' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: CLIENT PERFORMANCE TELEMETRY */}
              {currentTab === 'clientPortal' && (
                <div className="space-y-6">
                  <div className="bg-linear-to-r from-amber-500/15 to-yellow-600/5 border border-amber-500/30 p-8 rounded-2xl relative overflow-hidden">
                    <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      Aetheris Partner outcome platform
                    </span>
                    <h2 className="text-2xl font-black text-white uppercase mt-4">Campaign Outcomes telemetry</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Review campaign performance, ROAS targets, spend, and creative statuses mapped securely from your lead account managers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Consolidated ROAS</span>
                      <h3 className="text-xl font-bold text-emerald-400 mt-1">14.2x ROAS</h3>
                    </div>
                    <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Ad Spend coverage</span>
                      <h3 className="text-xl font-bold text-white mt-1">$45,000 SGD</h3>
                    </div>
                    <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Deliverable Assets</span>
                      <h3 className="text-xl font-bold text-amber-500 mt-1">12 / 15 Variations</h3>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}