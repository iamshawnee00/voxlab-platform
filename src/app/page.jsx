'use client';

import React, { useState } from 'react';
import OverviewDashboard from '@/components/OverviewDashboard';
import ClientManagement from '@/components/ClientManagement';
import CampaignOperations from '@/components/CampaignOperations';
import LarkIntegration from '@/components/LarkIntegration';
import QuotationBuilder from '@/components/QuotationBuilder';
import ClaimsLedger from '@/components/ClaimsLedger';
import ServicesManagement from '@/components/ServicesManagement';
import InternalManagement from '@/components/InternalManagement';
import { SERVICE_CATALOG } from '@/data/serviceCatalog';

// ── Shared mock repositories ──────────────────────────────────────────────────

export const INITIAL_TEAM = [
  { id: 't1', name: 'Alex Mercer',   role: 'Creative Director',  date_joined: '2024-01-15', capacity: 85 },
  { id: 't2', name: 'Sarah Lin',     role: 'Account Manager',    date_joined: '2024-03-01', capacity: 60 },
  { id: 't3', name: 'Mark Vance',    role: 'Strategist',         date_joined: '2025-02-10', capacity: 40 },
  { id: 't4', name: 'Elena Rostova', role: 'Social Lead',        date_joined: '2025-06-18', capacity: 95 },
];

export const INITIAL_CLIENTS = [
  { id: 'c1', name: 'Aetheris Wear',  status: 'Active',     budget: 45000, outcomes: '14.2x ROAS',         representative: 'Sarah Lin',     logo_gradient: 'from-[#D97706] to-[#F59E0B]' },
  { id: 'c2', name: 'NeoCarbon Ltd',  status: 'Active',     budget: 82000, outcomes: '4.8% Conv Rate',     representative: 'Mark Vance',    logo_gradient: 'from-[#06B6D4] to-[#3B82F6]' },
  { id: 'c3', name: 'Solara Biotech', status: 'Onboarding', budget: 30000, outcomes: 'N/A',                representative: 'Elena Rostova', logo_gradient: 'from-[#8B5CF6] to-[#D946EF]' },
  { id: 'c4', name: 'Velo Dynamics',  status: 'Paused',     budget: 24000, outcomes: '1.2M Impressions',   representative: 'Alex Mercer',   logo_gradient: 'from-[#EF4444] to-[#F59E0B]' },
];

export const INITIAL_CAMPAIGNS = [
  { id: 'cmp-101', name: 'Cyberpunk Autumn Launch',     client_id: 'c1', status: 'Active',    type: 'Performance Marketing', start_date: '2026-05-01', end_date: '2026-07-31', progress: 78,  budget: 15000, assignee_id: 't2' },
  { id: 'cmp-102', name: 'Carbon Negative Brand Film',  client_id: 'c2', status: 'Active',    type: 'Brand Awareness',       start_date: '2026-05-15', end_date: '2026-06-30', progress: 45,  budget: 32000, assignee_id: 't1' },
  { id: 'cmp-103', name: 'Solara Launch Phase 1',       client_id: 'c3', status: 'Planning',  type: 'Product Launch',        start_date: '2026-06-01', end_date: '2026-09-30', progress: 12,  budget: 18000, assignee_id: 't4' },
  { id: 'cmp-104', name: 'Spring Micro-influencers',    client_id: 'c4', status: 'Completed', type: 'Social Growth',         start_date: '2026-04-01', end_date: '2026-05-31', progress: 100, budget: 12000, assignee_id: 't3' },
];

export const INITIAL_QUOTES = [
  {
    id: 'q1', quote_number: 'VL-2026-001', client_id: 'c2', status: 'Approved',
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
    id: 'q2', quote_number: 'VL-2026-002', client_id: 'c1', status: 'Pending',
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
  { id: 'clm-001', profile_name: 'Sarah Lin',     role: 'Account Manager',  type: 'Staff Expense',      client_id: null, item_description: 'Client Dinner (Aetheris Wear)',            amount: 245.50, transaction_date: '2026-05-18', sheet_logged: true  },
  { id: 'clm-002', profile_name: 'Mark Vance',    role: 'Strategist',       type: 'Client Pass-through', client_id: 'c2', item_description: 'Adobe Suite Server Licenses (NeoCarbon)',   amount: 89.99,  transaction_date: '2026-05-19', sheet_logged: true  },
  { id: 'clm-003', profile_name: 'Elena Rostova', role: 'Social Lead',      type: 'Staff Expense',      client_id: null, item_description: 'Micro-Influencer Gifting Logistics',        amount: 120.00, transaction_date: '2026-05-21', sheet_logged: false },
];

// ── Shell ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', label: 'Overview Grid'       },
  { key: 'clients',   icon: '🤝', label: 'Client Management'   },
  { key: 'services',  icon: '🧾', label: 'VOXLAB Services'      },
  { key: 'internal',  icon: '👥', label: 'Internal Management'  },
  { key: 'campaigns', icon: '🎯', label: 'Campaign Operations' },
  { key: 'lark',      icon: '🔗', label: 'Lark Base Tunnel'    },
  { key: 'quotation', icon: '📝', label: 'Quotation Builder'   },
  { key: 'claims',    icon: '💰', label: 'Claims Ledger'       },
];

export default function WorkspaceDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [team,       setTeam]        = useState(INITIAL_TEAM);
  const [services,   setServices]    = useState(SERVICE_CATALOG);
  const [clients,    setClients]     = useState(INITIAL_CLIENTS);
  const [campaigns,  setCampaigns]   = useState(INITIAL_CAMPAIGNS);
  const [quotes,     setQuotes]      = useState(INITIAL_QUOTES);
  const [claims,     setClaims]      = useState(INITIAL_CLAIMS);
  const [toast,      setToast]       = useState('');

  const session = { user: { id: 'usr-admin', email: 'admin@voxlab.co', full_name: 'Alex Mercer', role: 'admin' } };

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const sharedProps = { clients, setClients, services, setServices, campaigns, setCampaigns, quotes, setQuotes, claims, setClaims, team, setTeam, session, triggerToast };

  return (
    <div className="relative min-h-screen text-slate-200 antialiased overflow-x-hidden pb-16 font-sans">

      {/* Background gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#090b0e]" style={{
        backgroundImage: `
          radial-gradient(circle at 12% 15%, rgba(226,149,71,0.28) 0%, rgba(226,149,71,0.08) 35%, transparent 70%),
          radial-gradient(circle at 45% 10%, rgba(234,179,8,0.16)  0%, rgba(234,179,8,0.04)  40%, transparent 75%),
          radial-gradient(circle at 85% 25%, rgba(217,70,239,0.14)  0%, rgba(139,92,246,0.04) 35%, transparent 75%)`
      }} />

      {/* Film grain */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5 mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-[#0F1621] border border-amber-500/30 text-amber-100 px-4 py-3.5 rounded-xl shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
          <p className="text-xs font-semibold tracking-wide">{toast}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-3">
            <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md sticky top-8">

              {/* Logo */}
              <div className="mb-6">
                <svg viewBox="0 0 350 75" className="h-7 w-auto fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 10 20 L 28 58 L 38 58 L 56 20 L 44 20 L 33 46 L 22 20 Z" />
                  <path fillRule="evenodd" d="M 68 20 L 102 20 C 111 20,115 24,115 32 L 115 46 C 115 54,111 58,102 58 L 68 58 C 59 58,55 54,55 46 L 55 32 C 55 24,59 20,68 20 Z M 69 31 L 69 47 L 101 47 L 101 31 Z" />
                  <path d="M 125 20 L 138 20 L 151 38 L 164 20 L 177 20 L 158 44 L 177 58 L 164 58 L 151 40 L 138 58 L 125 58 L 144 44 Z" />
                  <path d="M 187 10 L 197 10 L 197 58 L 187 58 Z" />
                  <path d="M 207 32 C 207 24,211 20,220 20 L 244 20 L 244 58 L 235 58 L 235 52 C 232 56,228 58,222 58 C 213 58,207 54,207 46 Z M 218 31 L 218 47 C 218 51,220 53,225 53 L 234 53 L 234 31 Z" />
                  <path d="M 254 10 L 264 10 L 264 30 C 267 24,272 20,280 20 C 289 20,293 24,293 32 L 293 46 C 293 54,289 58,280 58 L 254 58 Z M 264 31 L 264 53 L 280 53 C 285 53,287 51,287 46 L 287 32 C 287 27,285 25,280 25 Z" />
                </svg>
                <span className="text-[8px] tracking-[0.25em] text-amber-500/80 font-black uppercase mt-2.5 block">Creative Operations System</span>
              </div>

              {/* User node */}
              <div className="p-3.5 bg-[#121820]/80 rounded-xl border border-[#212C3B]/70 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center font-black text-black text-xs">
                    {session.user.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{session.user.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#1C2634] pt-2 mt-2">
                  <span className="text-[9px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black font-mono">
                    {session.user.role}
                  </span>
                </div>
              </div>

              {/* Nav */}
              <div className="space-y-1">
                <span className="text-[9px] tracking-widest uppercase font-black text-slate-500 block px-2 mb-2">WORKSPACE PANELS</span>
                {NAV_ITEMS.map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTab(key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      currentTab === key
                        ? 'bg-[#1D2836] text-white border border-[#2E3E53]'
                        : 'text-slate-400 hover:bg-[#121820]/50 hover:text-slate-200'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="lg:col-span-9">
            {currentTab === 'dashboard' && <OverviewDashboard  {...sharedProps} />}
            {currentTab === 'clients'   && <ClientManagement   {...sharedProps} />}
            {currentTab === 'services'  && <ServicesManagement {...sharedProps} />}
            {currentTab === 'internal'  && <InternalManagement {...sharedProps} />}
            {currentTab === 'campaigns' && <CampaignOperations {...sharedProps} />}
            {currentTab === 'lark'      && <LarkIntegration    {...sharedProps} />}
            {currentTab === 'quotation' && <QuotationBuilder   {...sharedProps} />}
            {currentTab === 'claims'    && <ClaimsLedger       {...sharedProps} />}
          </div>

        </div>
      </div>
    </div>
  );
}
