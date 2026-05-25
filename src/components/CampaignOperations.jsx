'use client';

import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { isAssignedCampaign } from '@/lib/permissions';

const STATUS_STYLES = {
  Active: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  Planning: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  Completed: 'text-slate-400 border-slate-500/20 bg-slate-500/10',
  Paused: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
};

const CAMPAIGN_TYPES = ['Performance Marketing', 'Brand Awareness', 'Product Launch', 'Social Growth', 'Influencer', 'Content Production'];
const CAMPAIGN_STATUSES = ['Planning', 'Active', 'Paused', 'Completed'];

function defaultCampaignForm(clients, team) {
  return {
    name: '',
    client_id: clients[0]?.id ?? '',
    type: CAMPAIGN_TYPES[0],
    status: 'Planning',
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    progress: 0,
    budget: '',
    assignee_id: team[0]?.id ?? '',
  };
}

function ganttPosition(startDate, endDate, windowStart, windowDays) {
  const startOffset = Math.max(0, (new Date(startDate) - windowStart) / 86400000);
  const endOffset = Math.min(windowDays, (new Date(endDate) - windowStart) / 86400000);
  return [(startOffset / windowDays) * 100, ((endOffset - startOffset) / windowDays) * 100];
}

function monthLabels(windowStart, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(windowStart);
    date.setMonth(date.getMonth() + index);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  });
}

export default function CampaignOperations({ clients, campaigns, setCampaigns, team, session, access, triggerToast }) {
  const [view, setView] = useState('gantt');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [clientFilter, setClientFilter] = useState('all');
  const [form, setForm] = useState(() => defaultCampaignForm(clients, team));

  const campaignAccess = access?.campaigns ?? { create: false, edit: false, scope: 'none' };
  const visibleCampaigns = useMemo(
    () =>
      campaignAccess.scope === 'all'
        ? campaigns
        : campaigns.filter((campaign) => isAssignedCampaign(campaign, session)),
    [campaignAccess.scope, campaigns, session]
  );

  const windowStart = useMemo(() => new Date('2026-04-01'), []);
  const windowDays = 183;
  const months = useMemo(() => monthLabels(windowStart, 6), [windowStart]);

  const filteredCampaigns = useMemo(
    () => (clientFilter === 'all' ? visibleCampaigns : visibleCampaigns.filter((campaign) => campaign.client_id === clientFilter)),
    [clientFilter, visibleCampaigns]
  );

  const canEditCampaign = (campaign) =>
    campaignAccess.edit && (campaignAccess.scope === 'all' || isAssignedCampaign(campaign, session));

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultCampaignForm(clients, team));
    setModalOpen(true);
  };

  const openEditModal = (campaign) => {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      client_id: campaign.client_id,
      type: campaign.type,
      status: campaign.status || 'Planning',
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      progress: campaign.progress ?? 0,
      budget: campaign.budget?.toString() ?? '',
      assignee_id: campaign.assignee_id || team[0]?.id || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultCampaignForm(clients, team));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      triggerToast('Campaign name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      client_id: form.client_id,
      status: form.status,
      type: form.type,
      start_date: form.start_date,
      end_date: form.end_date,
      progress: Math.max(0, Math.min(100, parseInt(form.progress, 10) || 0)),
      budget: parseFloat(form.budget) || 0,
      assignee_id: form.assignee_id,
    };

    if (editingId) {
      setCampaigns((current) =>
        current.map((campaign) => (campaign.id === editingId ? { ...campaign, ...payload } : campaign))
      );
      triggerToast(`Campaign updated: ${payload.name}`);
    } else {
      const campaign = { id: `cmp-${Date.now()}`, ...payload };
      setCampaigns((current) => [...current, campaign]);
      triggerToast(`Campaign launched: ${campaign.name}`);
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">CAMPAIGN OPERATIONS</h2>
          <p className="text-xs text-slate-400 mt-1">Manage timelines, assignees, budgets, status, and progress across campaigns.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Client Filter</label>
            <select
              value={clientFilter}
              onChange={(event) => setClientFilter(event.target.value)}
              className="min-w-44 bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="view-switcher flex bg-[#121820]/80 p-1.5 rounded-lg border border-[#212C3B]/60">
            {['list', 'gantt'].map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  view === mode ? 'view-switcher-active bg-[#1F2A38] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'list' ? 'List' : 'Gantt'}
              </button>
            ))}
          </div>
          {campaignAccess.create && (
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
              <PlusIcon /> Add Campaign
            </button>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} eyebrow="Campaign Operations" title={editingId ? 'Edit Campaign' : 'Add Campaign'}>
        <form onSubmit={handleSave} className="space-y-4">
          <span className="text-xs font-black uppercase text-amber-500 tracking-widest block mb-4 font-mono">
            {editingId ? 'Edit Campaign' : 'Add Campaign'}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Campaign Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Q3 Brand Push"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Client</label>
              <select value={form.client_id} onChange={(event) => updateForm('client_id', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Type</label>
              <select value={form.type} onChange={(event) => updateForm('type', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                {CAMPAIGN_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Status</label>
              <select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                {CAMPAIGN_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Start Date</label>
              <input type="date" value={form.start_date} onChange={(event) => updateForm('start_date', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">End Date</label>
              <input type="date" value={form.end_date} onChange={(event) => updateForm('end_date', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Assignee</label>
              <select value={form.assignee_id} onChange={(event) => updateForm('assignee_id', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                {team.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Budget (MYR)</label>
              <input type="number" placeholder="e.g. 15000" value={form.budget} onChange={(event) => updateForm('budget', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Progress (%)</label>
              <input type="number" min="0" max="100" value={form.progress} onChange={(event) => updateForm('progress', event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>
          <button type="submit" className="mt-4 ml-auto block bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors">
            {editingId ? 'Save Campaign' : 'Launch Campaign'}
          </button>
        </form>
      </Modal>

      {view === 'gantt' ? (
        <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="grid border-b border-[#1C2634] bg-[#121820]/40" style={{ gridTemplateColumns: '260px 1fr' }}>
            <div className="text-[9px] text-slate-500 font-bold uppercase p-3 border-r border-[#1C2634]">Campaign</div>
            <div className="grid text-[9px] text-slate-500 font-bold uppercase" style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}>
              {months.map((month) => (
                <div key={month} className="p-3 text-center border-r border-[#1C2634]/40 last:border-r-0">
                  {month}
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#151D27]">
            {filteredCampaigns.map((campaign) => {
              const client = clients.find((item) => item.id === campaign.client_id);
              const assignee = team.find((person) => person.id === campaign.assignee_id);
              const [left, width] = ganttPosition(campaign.start_date, campaign.end_date, windowStart, windowDays);
              return (
                <div key={campaign.id} className="campaign-row flex items-center hover:bg-white/[0.01]" style={{ minHeight: '62px' }}>
                  <div className="w-[260px] flex-shrink-0 p-4 border-r border-[#1C2634]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white leading-tight truncate">{campaign.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {client?.name ?? '-'} / {assignee?.name ?? '-'}
                        </p>
                      </div>
                      {canEditCampaign(campaign) && (
                        <button onClick={() => openEditModal(campaign)} className="text-[9px] text-amber-500 hover:underline font-bold uppercase">
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 h-full relative py-3 px-2">
                    <div className="relative h-8 w-full">
                      {width > 0 && (
                        <div
                          className="absolute top-0 h-full rounded bg-gradient-to-r from-amber-500/25 to-yellow-600/25 border border-amber-500/40 flex items-center px-2 overflow-hidden"
                          style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        >
                          <span className="campaign-gantt-label text-[9px] font-bold text-amber-200 truncate whitespace-nowrap">
                            {campaign.progress}% / RM {campaign.budget.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
                <th className="py-3 px-5">Campaign</th>
                <th className="py-3 px-5">Client</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Assignee</th>
                <th className="py-3 px-5">Dates</th>
                <th className="py-3 px-5">Budget</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Progress</th>
                {campaignAccess.edit && <th className="py-3 px-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151D27] text-slate-300">
              {filteredCampaigns.map((campaign) => {
                const client = clients.find((item) => item.id === campaign.client_id);
                const assignee = team.find((person) => person.id === campaign.assignee_id);
                return (
                  <tr key={campaign.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-5 font-bold text-white max-w-[180px] truncate">{campaign.name}</td>
                    <td className="py-3 px-5 text-slate-400">{client?.name ?? '-'}</td>
                    <td className="py-3 px-5 text-slate-400">{campaign.type}</td>
                    <td className="py-3 px-5 text-slate-400">{assignee?.name ?? '-'}</td>
                    <td className="py-3 px-5 font-mono text-slate-400 whitespace-nowrap text-[10px]">
                      {campaign.start_date} - {campaign.end_date}
                    </td>
                    <td className="py-3 px-5 font-mono">RM {campaign.budget.toLocaleString()}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_STYLES[campaign.status] ?? STATUS_STYLES.Planning}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-[#18212D] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${campaign.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">{campaign.progress}%</span>
                      </div>
                    </td>
                    {campaignAccess.edit && (
                      <td className="py-3 px-5 text-right">
                        {canEditCampaign(campaign) && (
                          <button onClick={() => openEditModal(campaign)} className="text-[10px] text-amber-500 hover:underline font-bold uppercase">
                            Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
