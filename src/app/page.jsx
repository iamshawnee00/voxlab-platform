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

export const INITIAL_TEAM = [
  { id: 't1', name: 'Alex Mercer', role: 'Creative Director', date_joined: '2024-01-15', capacity: 85 },
  { id: 't2', name: 'Sarah Lin', role: 'Account Manager', date_joined: '2024-03-01', capacity: 60 },
  { id: 't3', name: 'Mark Vance', role: 'Strategist', date_joined: '2025-02-10', capacity: 40 },
  { id: 't4', name: 'Elena Rostova', role: 'Social Lead', date_joined: '2025-06-18', capacity: 95 },
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
  { key: 'dashboard', code: 'OV', label: 'Overview Grid', sub: 'Agency pulse' },
  { key: 'clients', code: 'CL', label: 'Client Management', sub: 'Accounts' },
  { key: 'services', code: 'SV', label: 'VOXLAB Services', sub: 'Rate card' },
  { key: 'internal', code: 'TM', label: 'Internal Management', sub: 'Personnel' },
  { key: 'campaigns', code: 'CP', label: 'Campaign Operations', sub: 'Timeline' },
  { key: 'lark', code: 'LK', label: 'Lark Base Tunnel', sub: 'Sync' },
  { key: 'quotation', code: 'QT', label: 'Quotation Builder', sub: 'Proposals' },
  { key: 'claims', code: 'EX', label: 'Claims Ledger', sub: 'Expenses' },
];

export default function WorkspaceDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [services, setServices] = useState(SERVICE_CATALOG);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [toast, setToast] = useState('');

  const session = {
    user: {
      id: 'usr-admin',
      email: 'admin@voxlab.co',
      full_name: 'Alex Mercer',
      role: 'admin',
    },
  };

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
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
    triggerToast,
  };

  const activePanel = NAV_ITEMS.find((item) => item.key === currentTab) ?? NAV_ITEMS[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-200 antialiased">
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-[#090b0e]"
        style={{
          backgroundImage: `
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
        <div className="grid min-h-[calc(100vh-2rem)] grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <div className="platform-sidebar flex h-full flex-col rounded-2xl border border-white/10 bg-[#080B10]/82 p-5 shadow-2xl shadow-black/35 backdrop-blur-xl">
              <div className="mb-5">
                <svg viewBox="0 0 350 75" className="h-7 w-auto fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 10 20 L 28 58 L 38 58 L 56 20 L 44 20 L 33 46 L 22 20 Z" />
                  <path fillRule="evenodd" d="M 68 20 L 102 20 C 111 20,115 24,115 32 L 115 46 C 115 54,111 58,102 58 L 68 58 C 59 58,55 54,55 46 L 55 32 C 55 24,59 20,68 20 Z M 69 31 L 69 47 L 101 47 L 101 31 Z" />
                  <path d="M 125 20 L 138 20 L 151 38 L 164 20 L 177 20 L 158 44 L 177 58 L 164 58 L 151 40 L 138 58 L 125 58 L 144 44 Z" />
                  <path d="M 187 10 L 197 10 L 197 58 L 187 58 Z" />
                  <path d="M 207 32 C 207 24,211 20,220 20 L 244 20 L 244 58 L 235 58 L 235 52 C 232 56,228 58,222 58 C 213 58,207 54,207 46 Z M 218 31 L 218 47 C 218 51,220 53,225 53 L 234 53 L 234 31 Z" />
                  <path d="M 254 10 L 264 10 L 264 30 C 267 24,272 20,280 20 C 289 20,293 24,293 32 L 293 46 C 293 54,289 58,280 58 L 254 58 Z M 264 31 L 264 53 L 280 53 C 285 53,287 51,287 46 L 287 32 C 287 27,285 25,280 25 Z" />
                </svg>
                <span className="mt-2.5 block text-[8px] font-black uppercase tracking-[0.25em] text-amber-500/80">
                  Creative Operations System
                </span>
              </div>

              <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
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
                  <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-400">
                    {session.user.role}
                  </span>
                  <span className="font-mono text-[9px] uppercase text-emerald-400">online</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="mb-2 block px-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Workspace</span>
                {NAV_ITEMS.map(({ key, code, label, sub }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTab(key)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                      currentTab === key
                        ? 'border border-amber-500/30 bg-amber-500/12 text-white shadow-lg shadow-amber-950/15'
                        : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.035] hover:text-slate-100'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${
                        currentTab === key
                          ? 'border-amber-500/40 bg-amber-500 text-black'
                          : 'border-white/10 bg-[#111720] text-slate-500 group-hover:text-slate-200'
                      }`}
                    >
                      {code}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold tracking-wide">{label}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">{sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0">
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
              {currentTab === 'dashboard' && <OverviewDashboard {...sharedProps} />}
              {currentTab === 'clients' && <ClientManagement {...sharedProps} />}
              {currentTab === 'services' && <ServicesManagement {...sharedProps} />}
              {currentTab === 'internal' && <InternalManagement {...sharedProps} />}
              {currentTab === 'campaigns' && <CampaignOperations {...sharedProps} />}
              {currentTab === 'lark' && <LarkIntegration {...sharedProps} />}
              {currentTab === 'quotation' && <QuotationBuilder {...sharedProps} />}
              {currentTab === 'claims' && <ClaimsLedger {...sharedProps} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}
