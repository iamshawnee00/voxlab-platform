'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import OverviewDashboard from '@/components/OverviewDashboard';
import ClientManagement from '@/components/ClientManagement';
import CampaignOperations from '@/components/CampaignOperations';
import LarkIntegration from '@/components/LarkIntegration';
import QuotationBuilder from '@/components/QuotationBuilder';
import ClaimsLedger from '@/components/ClaimsLedger';
import ServicesManagement from '@/components/ServicesManagement';
import InternalManagement from '@/components/InternalManagement';
import { SERVICE_CATALOG } from '@/data/serviceCatalog';
import { getAccessForGrade } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';

export const INITIAL_TEAM = [
  { id: 't1', name: 'Alex Mercer', role: 'Creative Director', grade: 'G1 - Lead', date_joined: '2024-01-15', capacity: 85 },
  { id: 't2', name: 'Sarah Lin', role: 'Account Manager', grade: 'G2 - Senior', date_joined: '2024-03-01', capacity: 60 },
  { id: 't3', name: 'Mark Vance', role: 'Strategist', grade: 'G3 - Executive', date_joined: '2025-02-10', capacity: 40 },
  { id: 't4', name: 'Elena Rostova', role: 'Social Lead', grade: 'G4 - Support', date_joined: '2025-06-18', capacity: 95 },
];

export const INITIAL_CLIENTS = [
  { id: 'c1', name: 'Aetheris Wear', status: 'Active', budget: 45000, outcomes: '14.2x ROAS', representative: 'Sarah Lin', logo_gradient: 'from-[#D97706] to-[#F59E0B]' },
  { id: 'c2', name: 'NeoCarbon Ltd', status: 'Active', budget: 82000, outcomes: '4.8% Conv Rate', representative: 'Mark Vance', logo_gradient: 'from-[#06B6D4] to-[#3B82F6]' },
  { id: 'c3', name: 'Solara Biotech', status: 'Onboarding', budget: 30000, outcomes: 'N/A', representative: 'Elena Rostova', logo_gradient: 'from-[#8B5CF6] to-[#D946EF]' },
  { id: 'c4', name: 'Velo Dynamics', status: 'Paused', budget: 24000, outcomes: '1.2M Impressions', representative: 'Alex Mercer', logo_gradient: 'from-[#EF4444] to-[#F59E0B]' },
];

export const INITIAL_CAMPAIGNS = [
  { id: 'cmp-101', name: 'Cyberpunk Autumn Launch', client_id: 'c1', status: 'Active', type: 'Performance Marketing', start_date: '2026-05-01', end_date: '2026-07-31', progress: 78, budget: 15000, assignee_id: 't2' },
  { id: 'cmp-102', name: 'Carbon Negative Brand Film', client_id: 'c2', status: 'Active', type: 'Brand Awareness', start_date: '2026-05-15', end_date: '2026-06-30', progress: 45, budget: 32000, assignee_id: 't1' },
  { id: 'cmp-103', name: 'Solara Launch Phase 1', client_id: 'c3', status: 'Planning', type: 'Product Launch', start_date: '2026-06-01', end_date: '2026-09-30', progress: 12, budget: 18000, assignee_id: 't4' },
  { id: 'cmp-104', name: 'Spring Micro-influencers', client_id: 'c4', status: 'Completed', type: 'Social Growth', start_date: '2026-04-01', end_date: '2026-05-31', progress: 100, budget: 12000, assignee_id: 't3' },
];

export const INITIAL_QUOTES = [
  {
    id: 'q1',
    quote_number: 'VL-2026-001',
    client_id: 'c2',
    status: 'Approved',
    created_at: '2026-04-10',
    projectTitle: 'Carbon Negative Brand Film',
    projectType: 'Marketing Campaign',
    campaignPeriod: '10/04/2026 - 31/05/2026',
    primaryPlatform: 'YouTube / Meta',
    preparedBy: 'VOXLAB',
    conceptDirection: 'A polished brand film system to sharpen NeoCarbon positioning and support campaign launch assets.',
    items: [
      { name: 'Brand Film - Full Production', description: 'Concept, pre-production, filming, colour grade, sound design, and final campaign export.', qty: 1, unit: 'Project', unitPrice: 28000, discount: 1200, remarks: 'Includes kickoff and direction deck' },
      { name: 'Monthly Account Retainer', description: 'Weekly check-ins, campaign oversight, reporting, and strategic advisory.', qty: 3, unit: 'Month', unitPrice: 2000, discount: 0, remarks: 'April to June retainer' },
    ],
    tax: 0,
  },
  {
    id: 'q2',
    quote_number: 'VL-2026-002',
    client_id: 'c1',
    status: 'Pending',
    created_at: '2026-05-02',
    projectTitle: 'Aetheris Performance Creative Sprint',
    projectType: 'Performance Marketing',
    campaignPeriod: '02/05/2026 - 30/06/2026',
    primaryPlatform: 'Meta / TikTok',
    preparedBy: 'VOXLAB',
    conceptDirection: 'A short sprint to test campaign messaging, refresh ad creative, and improve performance learning velocity.',
    items: [
      { name: 'Performance Creative Assets', description: 'Production of static and short-video ad variants for platform testing.', qty: 1, unit: 'Batch', unitPrice: 4500, discount: 0, remarks: '15 creative variants' },
      { name: 'Meta Ads Management', description: 'Campaign setup, audience testing, optimisation, budget pacing, and reporting.', qty: 1, unit: 'Month', unitPrice: 3000, discount: 0, remarks: 'Ad spend excluded unless stated' },
    ],
    tax: 0,
  },
];

export const INITIAL_CLAIMS = [
  { id: 'clm-001', claim_number: 'CLM-2026-001', profile_name: 'Sarah Lin', role: 'Account Manager', type: 'Staff Expense', category: 'Meals & Entertainment', client_id: 'c1', project_id: 'cmp-101', item_description: 'Client Dinner (Aetheris Wear)', currency: 'MYR', original_amount: 245.50, amount_myr: 245.50, conversion_rate: 1, conversion_attachment: '', attachment_name: 'aetheris-dinner-receipt.pdf', transaction_date: '2026-05-18', sheet_logged: true },
  { id: 'clm-002', claim_number: 'CLM-2026-002', profile_name: 'Mark Vance', role: 'Strategist', type: 'Client Pass-through', category: 'Software & Subscriptions', client_id: 'c2', project_id: 'cmp-102', item_description: 'Adobe Suite Server Licenses', currency: 'USD', original_amount: 89.99, amount_myr: 422.95, conversion_rate: 4.7, conversion_attachment: 'usd-myr-bank-conversion.png', attachment_name: 'adobe-invoice.pdf', transaction_date: '2026-05-19', sheet_logged: true },
  { id: 'clm-003', claim_number: 'CLM-2026-003', profile_name: 'Elena Rostova', role: 'Social Lead', type: 'Staff Expense', category: 'Production & Props', client_id: 'c3', project_id: 'cmp-103', item_description: 'Micro-Influencer Gifting Logistics', currency: 'SGD', original_amount: 120.00, amount_myr: 420.00, conversion_rate: 3.5, conversion_attachment: 'sgd-myr-wise-conversion.pdf', attachment_name: 'gift-logistics-receipt.pdf', transaction_date: '2026-05-21', sheet_logged: false },
];

const NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard', label: 'Overview Grid', sub: 'Agency pulse' },
  { key: 'clients', icon: 'clients', label: 'Client Management', sub: 'Accounts' },
  { key: 'services', icon: 'services', label: 'VOXLAB Services', sub: 'Rate card' },
  { key: 'internal', icon: 'team', label: 'Internal Management', sub: 'Personnel' },
  { key: 'campaigns', icon: 'campaigns', label: 'Campaign Operations', sub: 'Timeline' },
  { key: 'lark', icon: 'sync', label: 'Lark Base Tunnel', sub: 'Sync' },
  { key: 'quotation', icon: 'quotes', label: 'Quotation Builder', sub: 'Proposals' },
  { key: 'claims', icon: 'claims', label: 'Claims Ledger', sub: 'Expenses' },
];

export default function WorkspaceDashboard() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [services, setServices] = useState(SERVICE_CATALOG);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const authSession = sessionData?.session;

      if (!authSession?.user) {
        router.replace('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, grade, role, personnel_id, status')
        .eq('id', authSession.user.id)
        .single();

      if (!active) return;

      if (profileError || profile?.status === 'disabled') {
        await supabase.auth.signOut();
        router.replace('/login');
        return;
      }

      setSession({
        user: {
          id: authSession.user.id,
          personnel_id: profile?.personnel_id || authSession.user.id,
          email: authSession.user.email,
          full_name: profile?.full_name || authSession.user.email,
          role: profile?.role || 'staff',
          grade: profile?.grade || 'External',
        },
      });
      setLoadingSession(false);
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login');
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const access = useMemo(() => getAccessForGrade(session?.user?.grade), [session?.user?.grade]);
  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => access.nav.includes(item.key)),
    [access.nav]
  );
  const activeTab = access.nav.includes(currentTab) ? currentTab : 'dashboard';

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const sharedProps = {
    clients,
    setClients,
    services,
    setServices,
    campaigns,
    setCampaigns,
    quotes,
    setQuotes,
    claims,
    setClaims,
    team,
    setTeam,
    session,
    access,
    triggerToast,
  };

  const activePanel = NAV_ITEMS.find((item) => item.key === activeTab) ?? NAV_ITEMS[0];
  const isLight = theme === 'light';

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090b0e] text-slate-400">
        <div className="text-center">
          <img src="/voxlab-logo-white.png" alt="VOXLAB" className="mx-auto h-8 w-auto object-contain" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.28em]">Loading workspace access</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-${theme} relative min-h-screen overflow-x-hidden antialiased ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
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

      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-5 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-xl border border-amber-500/30 bg-[#0F1621] px-4 py-3.5 text-amber-100 shadow-2xl">
          <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-amber-400" />
          <p className="text-xs font-semibold tracking-wide">{toast}</p>
        </div>
      )}

      <div className="relative z-10 min-h-screen w-full px-4 py-4 sm:px-5 lg:px-6 xl:px-8">
        <div className="min-h-[calc(100vh-2rem)]">
          <aside className="mb-5 lg:fixed lg:left-6 lg:top-4 lg:bottom-4 lg:z-30 lg:mb-0 lg:w-[280px] xl:left-8 xl:w-[300px]">
            <div className="platform-sidebar flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080B10]/82 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl">
              <div className="mb-3 shrink-0">
                <img
                  src={isLight ? '/voxlab-logo-black.png' : '/voxlab-logo-white.png'}
                  alt="VOXLAB"
                  className="h-7 w-auto object-contain"
                />
                <span className="mt-2 block text-[8px] font-black uppercase tracking-[0.25em] text-amber-500/80">
                  Creative Operations System
                </span>
              </div>

              <div className="sidebar-profile-card mb-3 shrink-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-xs font-black text-black shadow-lg shadow-amber-950/40">
                    {session.user.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{session.user.full_name}</p>
                    <p className="truncate text-[10px] text-slate-400">{session.user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="sidebar-role rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-400">
                    {session.user.grade}
                  </span>
                  <span className="font-mono text-[9px] uppercase text-emerald-400">online</span>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-1 overflow-hidden">
                <span className="mb-2 block px-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Workspace</span>
                {visibleNavItems.map(({ key, icon, label, sub }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTab(key)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left transition-all ${
                      activeTab === key
                        ? 'border border-amber-500/30 bg-amber-500/12 text-white shadow-lg shadow-amber-950/15'
                        : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.035] hover:text-slate-100'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                        activeTab === key
                          ? 'border-amber-500/40 bg-amber-500 text-black'
                          : 'border-white/10 bg-[#111720] text-slate-500 group-hover:text-slate-200'
                      }`}
                    >
                      <NavIcon name={icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-bold tracking-wide">{label}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">{sub}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-auto shrink-0 border-t border-white/10 pt-3">
                <button
                  onClick={() => router.push('/account/password')}
                  className="mb-2 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 transition-all hover:border-amber-500/30 hover:text-white"
                >
                  <span>Password</span>
                  <span className="font-mono text-[9px] text-slate-500">Change</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="mb-2 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 transition-all hover:border-rose-500/30 hover:text-white"
                >
                  <span>Sign Out</span>
                  <span className="font-mono text-[9px] text-slate-500">Exit</span>
                </button>
                <button
                  onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-300 transition-all hover:border-amber-500/30 hover:text-white"
                >
                  <span>{isLight ? 'Light Mode' : 'Dark Mode'}</span>
                  <span className={`relative h-5 w-10 rounded-full border transition-colors ${
                    isLight
                      ? 'border-slate-300 bg-white'
                      : 'border-amber-500/45 bg-[#111827]'
                  }`}>
                    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-transform ${
                      isLight
                        ? 'translate-x-0 bg-slate-800'
                        : 'translate-x-5 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.65)]'
                    }`} />
                  </span>
                </button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 lg:pl-[300px] xl:pl-[324px]">
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#080B10]/72 px-5 py-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500/80">VOXLAB Workspace</p>
                <h1 className="mt-1 truncate text-2xl font-black tracking-wide text-white">{activePanel.label}</h1>
              </div>
              <div className="grid grid-cols-3 gap-2 text-right">
                <HeaderMetric label="Clients" value={clients.length} />
                <HeaderMetric label="Quotes" value={quotes.length} />
                <HeaderMetric label="Claims" value={claims.length} />
              </div>
            </div>

            <div className="workspace-content min-w-0 pb-10">
              {activeTab === 'dashboard' && <OverviewDashboard {...sharedProps} />}
              {activeTab === 'clients' && <ClientManagement {...sharedProps} />}
              {activeTab === 'services' && <ServicesManagement {...sharedProps} />}
              {activeTab === 'internal' && <InternalManagement {...sharedProps} />}
              {activeTab === 'campaigns' && <CampaignOperations {...sharedProps} />}
              {activeTab === 'lark' && <LarkIntegration {...sharedProps} />}
              {activeTab === 'quotation' && <QuotationBuilder {...sharedProps} />}
              {activeTab === 'claims' && <ClaimsLedger {...sharedProps} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    clients: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    services: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
        <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      </>
    ),
    team: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    campaigns: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4" />
        <path d="M22 12h-4" />
      </>
    ),
    sync: (
      <>
        <path d="M21 12a9 9 0 0 0-15-6.7L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 15 6.7L21 16" />
        <path d="M16 16h5v5" />
      </>
    ),
    quotes: (
      <>
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v5h4" />
        <path d="M10 12h6" />
        <path d="M10 16h6" />
      </>
    ),
    claims: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 10h10" />
        <path d="M7 14h6" />
        <path d="M17 14h.01" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? paths.dashboard}</svg>;
}

function HeaderMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}
