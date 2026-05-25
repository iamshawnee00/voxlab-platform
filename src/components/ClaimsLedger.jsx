'use client';

import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { isAssignedCampaign, isOwnClaim } from '@/lib/permissions';

const CLAIM_TYPES = ['Staff Expense', 'Client Pass-through'];
const CURRENCIES = ['MYR', 'USD', 'SGD'];
const CLAIM_CATEGORIES = [
  'Meals & Entertainment',
  'Travel & Transport',
  'Production & Props',
  'Software & Subscriptions',
  'Media Spend',
  'Printing & Materials',
  'KOL / Talent',
  'Venue & Activation',
  'Others',
];

const fmt = (n) =>
  'RM ' + Number(n || 0).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function nextClaimNumber(claims) {
  const numbers = claims.map((claim) => {
    const match = claim.claim_number?.match(/CLM-\d{4}-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
  return `CLM-2026-${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`;
}

function monthKey(dateStr) {
  return dateStr?.slice(0, 7);
}

function monthName(dateStr) {
  return new Date(`${dateStr}-01T00:00:00`).toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });
}

function buildCalendarDays(month, claims) {
  const first = new Date(`${month}-01T00:00:00`);
  const startOffset = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    cells.push({
      day,
      date,
      claims: claims.filter((claim) => claim.transaction_date === date),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function ClaimsLedger({ clients, campaigns, claims, setClaims, session, access, triggerToast }) {
  const claimAccess = access?.claims ?? { create: false, edit: false, sync: false, scope: 'none' };
  const campaignAccess = access?.campaigns ?? { scope: 'none' };
  const [form, setForm] = useState({
    type: 'Staff Expense',
    client_id: clients[0]?.id ?? '',
    project_id: '',
    category: CLAIM_CATEGORIES[0],
    transaction_date: '2026-05-24',
    item_description: '',
    currency: 'MYR',
    original_amount: '',
    amount_myr: '',
    conversion_rate: '',
    attachment_name: '',
    conversion_attachment: '',
  });
  const [tableFilters, setTableFilters] = useState({
    claim: '',
    client: '',
    category: '',
    currency: '',
    date: '',
    status: '',
  });
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedDate, setSelectedDate] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const visibleClaims = useMemo(
    () => (claimAccess.scope === 'all' ? claims : claims.filter((claim) => isOwnClaim(claim, session))),
    [claimAccess.scope, claims, session]
  );

  const visibleCampaigns = useMemo(
    () =>
      campaignAccess.scope === 'all'
        ? campaigns
        : campaigns.filter((campaign) => isAssignedCampaign(campaign, session)),
    [campaignAccess.scope, campaigns, session]
  );

  const availableProjects = useMemo(() => {
    if (!form.client_id) return visibleCampaigns;
    return visibleCampaigns.filter((campaign) => campaign.client_id === form.client_id);
  }, [form.client_id, visibleCampaigns]);

  const filteredClaims = useMemo(() => {
    return visibleClaims.filter((claim) => {
      const client = clients.find((item) => item.id === claim.client_id);
      const project = campaigns.find((item) => item.id === claim.project_id);
      const status = claim.sheet_logged ? 'Synced' : 'Pending';
      const q = tableFilters.claim.toLowerCase();
      const matchesClaim =
        !q ||
        claim.claim_number.toLowerCase().includes(q) ||
        claim.item_description.toLowerCase().includes(q);
      const matchesClient =
        !tableFilters.client ||
        claim.client_id === tableFilters.client ||
        claim.project_id === tableFilters.client ||
        client?.name.toLowerCase().includes(tableFilters.client.toLowerCase()) ||
        project?.name.toLowerCase().includes(tableFilters.client.toLowerCase());
      const matchesCategory = !tableFilters.category || claim.category === tableFilters.category || claim.type === tableFilters.category;
      const matchesCurrency = !tableFilters.currency || claim.currency === tableFilters.currency;
      const matchesStatus = !tableFilters.status || status === tableFilters.status;
      const matchesFilterDate = !tableFilters.date || claim.transaction_date === tableFilters.date;
      const matchesMonth = monthKey(claim.transaction_date) === selectedMonth;
      const matchesDate = !selectedDate || claim.transaction_date === selectedDate;
      return matchesClaim && matchesClient && matchesCategory && matchesCurrency && matchesStatus && matchesFilterDate && matchesMonth && matchesDate;
    });
  }, [campaigns, clients, selectedDate, selectedMonth, tableFilters, visibleClaims]);

  const monthlyClaims = useMemo(
    () => visibleClaims.filter((claim) => monthKey(claim.transaction_date) === selectedMonth),
    [selectedMonth, visibleClaims]
  );

  const analytics = useMemo(() => {
    const total = monthlyClaims.reduce((sum, claim) => sum + (claim.amount_myr || claim.amount || 0), 0);
    const pending = monthlyClaims.filter((claim) => !claim.sheet_logged);
    const categoryTotals = CLAIM_CATEGORIES.map((category) => {
      const categoryClaims = monthlyClaims.filter((claim) => claim.category === category);
      return {
        category,
        count: categoryClaims.length,
        total: categoryClaims.reduce((sum, claim) => sum + (claim.amount_myr || claim.amount || 0), 0),
      };
    }).filter((item) => item.count > 0);

    const currencyTotals = CURRENCIES.map((currency) => ({
      currency,
      count: monthlyClaims.filter((claim) => claim.currency === currency).length,
    })).filter((item) => item.count > 0);

    return {
      total,
      count: monthlyClaims.length,
      pendingCount: pending.length,
      pendingTotal: pending.reduce((sum, claim) => sum + (claim.amount_myr || claim.amount || 0), 0),
      categoryTotals,
      currencyTotals,
    };
  }, [monthlyClaims]);

  const calendarDays = useMemo(
    () => buildCalendarDays(selectedMonth, visibleClaims),
    [selectedMonth, visibleClaims]
  );

  const updateForm = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'client_id') {
        next.project_id = '';
      }
      if (field === 'currency' && value === 'MYR') {
        next.amount_myr = next.original_amount;
        next.conversion_rate = 1;
        next.conversion_attachment = '';
      }
      if (field === 'original_amount' && current.currency === 'MYR') {
        next.amount_myr = value;
        next.conversion_rate = 1;
      }
      return next;
    });
  };

  const updateTableFilter = (field, value) => {
    setTableFilters((current) => ({ ...current, [field]: value }));
  };

  const setAttachmentName = (field, fileList) => {
    const file = fileList?.[0];
    updateForm(field, file?.name || '');
  };

  const handleAdd = (event) => {
    event.preventDefault();

    if (!form.client_id || !form.project_id || !form.item_description.trim() || !form.original_amount) {
      triggerToast('Client, project, description, and amount are required.');
      return;
    }

    if (form.currency !== 'MYR' && (!form.amount_myr || !form.conversion_attachment)) {
      triggerToast('Foreign currency claims require MYR conversion amount and conversion attachment.');
      return;
    }

    const originalAmount = parseFloat(form.original_amount) || 0;
    const amountMyr =
      form.currency === 'MYR'
        ? originalAmount
        : parseFloat(form.amount_myr) || 0;

    const claim = {
      id: `clm-${Date.now()}`,
      claim_number: nextClaimNumber(claims),
      user_id: session.user.id,
      profile_name: session.user.full_name,
      role: session.user.role,
      type: form.type,
      client_id: form.client_id,
      project_id: form.project_id,
      category: form.category,
      item_description: form.item_description.trim(),
      currency: form.currency,
      original_amount: originalAmount,
      amount_myr: amountMyr,
      conversion_rate:
        form.currency === 'MYR'
          ? 1
          : parseFloat(form.conversion_rate) || amountMyr / originalAmount,
      attachment_name: form.attachment_name,
      conversion_attachment: form.currency === 'MYR' ? '' : form.conversion_attachment,
      transaction_date: form.transaction_date,
      sheet_logged: false,
    };

    setClaims((current) => [claim, ...current]);
    setForm((current) => ({
      ...current,
      project_id: '',
      item_description: '',
      original_amount: '',
      amount_myr: current.currency === 'MYR' ? '' : '',
      conversion_rate: current.currency === 'MYR' ? 1 : '',
      attachment_name: '',
      conversion_attachment: '',
    }));
    setSelectedMonth(monthKey(claim.transaction_date));
    setModalOpen(false);
    triggerToast(`Claim ${claim.claim_number} saved.`);
  };

  const pushToSheet = () => {
    setSyncing(true);
    setTimeout(() => {
      setClaims((current) => current.map((claim) => ({ ...claim, sheet_logged: true })));
      setSyncing(false);
      triggerToast('All claims pushed to Finance Sheet.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">CLAIMS LEDGER</h2>
          <p className="text-xs text-slate-400 mt-1">
            Log client/project claims, support multi-currency conversion, and review monthly claim activity.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Metric label="Month Total" value={fmt(analytics.total)} />
          <Metric label="Pending" value={fmt(analytics.pendingTotal)} />
          {claimAccess.create && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <PlusIcon /> Add Claim
            </button>
          )}
          {claimAccess.sync && (
            <button
              onClick={pushToSheet}
              disabled={syncing}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:brightness-110 transition-all disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Push to Finance Sheet'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} eyebrow="Claims Ledger" title="Create Claim" width="max-w-4xl">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-500 block font-mono">Create Claim</span>
            <span className="text-[10px] text-slate-500 font-mono">{nextClaimNumber(claims)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
            <Field label="Claim Type">
              <select value={form.type} onChange={(event) => updateForm('type', event.target.value)} className="field">
                {CLAIM_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>

            <Field label="Category">
              <select value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="field">
                {CLAIM_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>

            <Field label="Client">
              <select value={form.client_id} onChange={(event) => updateForm('client_id', event.target.value)} className="field">
                <option value="">Select client...</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </Field>

            <Field label="Project / Campaign">
              <select value={form.project_id} onChange={(event) => updateForm('project_id', event.target.value)} className="field">
                <option value="">Select project...</option>
                {availableProjects.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
              </select>
            </Field>

            <Field label="Claim Date">
              <input type="date" value={form.transaction_date} onChange={(event) => updateForm('transaction_date', event.target.value)} className="field" />
            </Field>

            <Field label="Currency">
              <select value={form.currency} onChange={(event) => updateForm('currency', event.target.value)} className="field">
                {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <input value={form.item_description} onChange={(event) => updateForm('item_description', event.target.value)} placeholder="e.g. Location rental for campaign shoot" className="field" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`Original Amount (${form.currency})`}>
              <input type="number" min="0" step="0.01" value={form.original_amount} onChange={(event) => updateForm('original_amount', event.target.value)} className="field" />
            </Field>

            <Field label="Converted Amount (MYR)">
              <input type="number" min="0" step="0.01" value={form.amount_myr} onChange={(event) => updateForm('amount_myr', event.target.value)} disabled={form.currency === 'MYR'} className="field disabled:opacity-60" />
            </Field>
          </div>

          {form.currency !== 'MYR' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Conversion Rate">
                <input type="number" min="0" step="0.0001" value={form.conversion_rate} onChange={(event) => updateForm('conversion_rate', event.target.value)} placeholder="e.g. 4.70" className="field" />
              </Field>
              <FileField label="Conversion Attachment" value={form.conversion_attachment} onChange={(files) => setAttachmentName('conversion_attachment', files)} />
            </div>
          )}

          <FileField label="Receipt / Claim Attachment" value={form.attachment_name} onChange={(files) => setAttachmentName('attachment_name', files)} />

          <button type="submit" className="w-full bg-amber-500 text-black font-bold uppercase text-xs py-2 rounded-lg hover:bg-amber-600 transition-colors">
            Log Claim
          </button>
        </form>
        </Modal>

        <div className="xl:col-span-12 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <AnalyticsCard label="Claims This Month" value={analytics.count} sub={monthName(selectedMonth)} />
            <AnalyticsCard label="Pending Claims" value={analytics.pendingCount} sub={fmt(analytics.pendingTotal)} />
            <AnalyticsCard label="Top Category" value={analytics.categoryTotals[0]?.category || '-'} sub={analytics.categoryTotals[0] ? fmt(analytics.categoryTotals[0].total) : 'No claims'} />
            <AnalyticsCard label="Currencies" value={analytics.currencyTotals.map((item) => item.currency).join(' / ') || '-'} sub="Original currencies used" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(260px,1fr)] gap-6">
            <div className="claims-calendar-panel bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
              <div className="p-4 border-b border-[#1C2634] flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Claims Calendar</p>
                  <p className="text-sm font-bold text-white mt-1">{monthName(selectedMonth)}</p>
                </div>
                <input type="month" value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setSelectedDate(''); }} className="field max-w-40" />
              </div>

              <div className="claims-calendar-weekdays grid grid-cols-7 border-b border-[#1C2634] text-center text-[9px] uppercase text-slate-500 font-bold">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-2 border-r border-[#1C2634] last:border-r-0">{day}</div>
                ))}
              </div>

              <div className="claims-calendar-grid grid grid-cols-7 gap-2 p-3">
                {calendarDays.map((cell, index) => (
                  <button
                    key={cell?.date || `empty-${index}`}
                    disabled={!cell}
                    onClick={() => setSelectedDate((current) => current === cell.date ? '' : cell.date)}
                    className={`claims-calendar-cell min-h-32 rounded-lg border border-[#1C2634] p-2 text-left transition-colors ${
                      cell?.date === selectedDate ? 'bg-amber-500/10' : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    {cell && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">{cell.day}</span>
                          {cell.claims.length > 0 && (
                            <span className="text-[9px] text-amber-400 font-mono">{cell.claims.length}</span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {cell.claims.slice(0, 2).map((claim) => (
                            <div key={claim.id} className="claims-calendar-claim rounded bg-[#121820]/80 border border-[#212C3B]/60 px-1.5 py-1">
                              <p className="text-[9px] text-white truncate">{claim.claim_number}</p>
                              <p className="text-[9px] text-amber-400 font-mono truncate">{fmt(claim.amount_myr || claim.amount)}</p>
                            </div>
                          ))}
                          {cell.claims.length > 2 && (
                            <p className="text-[9px] text-slate-500">+{cell.claims.length - 2} more</p>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="claims-analysis-panel bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl p-5 backdrop-blur-md space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Category Analysis</p>
                <div className="space-y-3">
                  {analytics.categoryTotals.length === 0 ? (
                    <p className="text-xs text-slate-500">No claims in this month.</p>
                  ) : (
                    analytics.categoryTotals.map((item) => {
                      const pct = analytics.total ? (item.total / analytics.total) * 100 : 0;
                      return (
                        <div key={item.category}>
                          <div className="flex justify-between gap-3 mb-1">
                            <span className="text-xs text-slate-300">{item.category}</span>
                            <span className="text-xs font-mono text-amber-400">{fmt(item.total)}</span>
                          </div>
                          <div className="h-1.5 rounded bg-[#1C2634] overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[9px] text-slate-500 mt-1">{item.count} claim{item.count !== 1 ? 's' : ''}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="currency-mix-panel border-t border-[#1C2634] pt-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Currency Mix</p>
                <div className="flex gap-2 flex-wrap">
                  {analytics.currencyTotals.map((item) => (
                    <span key={item.currency} className="text-[10px] border border-[#212C3B]/60 bg-[#121820]/70 rounded px-2 py-1 text-slate-300 font-mono">
                      {item.currency}: {item.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-[10px] font-bold uppercase px-3 py-1 rounded border border-rose-500/30 text-rose-400">
                Clear Date: {selectedDate}
              </button>
            )}

            <div className="claims-table-panel bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 tracking-widest font-bold">
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Client / Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Original</th>
                    <th className="py-3 px-4">MYR</th>
                    <th className="py-3 px-4">Attachments</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                  <tr className="claims-filter-row border-b border-[#1C2634] bg-[#0D1219]/70">
                    <th className="py-2 px-4">
                      <input value={tableFilters.claim} onChange={(event) => updateTableFilter('claim', event.target.value)} placeholder="Search..." className="claims-filter-input field" />
                    </th>
                    <th className="py-2 px-4">
                      <select value={tableFilters.client} onChange={(event) => updateTableFilter('client', event.target.value)} className="claims-filter-input field">
                        <option value="">All</option>
                        {clients
                          .filter((client) => visibleCampaigns.some((campaign) => campaign.client_id === client.id))
                          .map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                      </select>
                    </th>
                    <th className="py-2 px-4">
                      <select value={tableFilters.category} onChange={(event) => updateTableFilter('category', event.target.value)} className="claims-filter-input field">
                        <option value="">All</option>
                        {CLAIM_TYPES.map((type) => <option key={type}>{type}</option>)}
                        {CLAIM_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </th>
                    <th className="py-2 px-4">
                      <select value={tableFilters.currency} onChange={(event) => updateTableFilter('currency', event.target.value)} className="claims-filter-input field">
                        <option value="">All</option>
                        {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
                      </select>
                    </th>
                    <th className="py-2 px-4" />
                    <th className="py-2 px-4" />
                    <th className="py-2 px-4">
                      <input type="date" value={tableFilters.date} onChange={(event) => updateTableFilter('date', event.target.value)} className="claims-filter-input field" />
                    </th>
                    <th className="py-2 px-4">
                      <select value={tableFilters.status} onChange={(event) => updateTableFilter('status', event.target.value)} className="claims-filter-input field">
                        <option value="">All</option>
                        <option>Synced</option>
                        <option>Pending</option>
                      </select>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151D27] text-slate-300">
                  {filteredClaims.map((claim) => {
                    const client = clients.find((item) => item.id === claim.client_id);
                    const project = campaigns.find((item) => item.id === claim.project_id);
                    return (
                      <tr key={claim.id} className="hover:bg-white/[0.01] transition-colors align-top">
                        <td className="py-3 px-4 font-mono font-bold text-white">{claim.claim_number}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{client?.name ?? '-'}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{project?.name ?? '-'}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{claim.item_description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-300">{claim.category}</p>
                          <p className="text-[9px] text-amber-400 uppercase font-bold mt-1">{claim.type}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {claim.currency} {Number(claim.original_amount ?? claim.amount ?? 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          {claim.currency !== 'MYR' && (
                            <p className="text-[9px] text-slate-500 mt-1">Rate: {Number(claim.conversion_rate || 0).toFixed(4)}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-amber-400 font-bold font-mono">{fmt(claim.amount_myr || claim.amount)}</td>
                        <td className="py-3 px-4 max-w-[160px]">
                          <p className="truncate text-slate-400">{claim.attachment_name || '-'}</p>
                          {claim.conversion_attachment && (
                            <p className="truncate text-[10px] text-emerald-400 mt-1">FX: {claim.conversion_attachment}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{claim.transaction_date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${claim.sheet_logged ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                            {claim.sheet_logged ? 'Synced' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredClaims.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-slate-500">
                        No claims match this month/filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function FileField({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">{label}</label>
      <label className="block cursor-pointer rounded-lg border border-[#212C3B]/60 bg-[#121820]/80 px-3 py-2 text-xs text-slate-400 hover:border-amber-500/40 hover:text-slate-200 transition-colors">
        <input type="file" className="hidden" onChange={(event) => onChange(event.target.files)} />
        <span className="truncate block">{value || 'Attach file...'}</span>
      </label>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 min-w-36">
      <p className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">{label}</p>
      <p className="text-xs text-white font-mono font-bold mt-1">{value}</p>
    </div>
  );
}

function AnalyticsCard({ label, value, sub }) {
  return (
    <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-4 rounded-xl backdrop-blur-md">
      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">{label}</span>
      <p className="text-lg font-bold text-white mt-1 leading-tight truncate">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1 truncate">{sub}</p>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
