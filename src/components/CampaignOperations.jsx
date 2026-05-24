'use client';

import React, { useState, useMemo } from 'react';
import Modal from './Modal';

const STATUS_STYLES = {
  Active:    'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  Planning:  'text-blue-400    border-blue-500/20    bg-blue-500/10',
  Completed: 'text-slate-400   border-slate-500/20   bg-slate-500/10',
  Paused:    'text-amber-400   border-amber-500/20   bg-amber-500/10',
};

const CAMPAIGN_TYPES = ['Performance Marketing', 'Brand Awareness', 'Product Launch', 'Social Growth', 'Influencer', 'Content Production'];

// Returns [colStart%, width%] relative to a 6-month window starting at windowStart
function ganttPosition(startDate, endDate, windowStart, windowDays) {
  const s = Math.max(0, (new Date(startDate) - windowStart) / 86400000);
  const e = Math.min(windowDays, (new Date(endDate) - windowStart) / 86400000);
  return [(s / windowDays) * 100, ((e - s) / windowDays) * 100];
}

function monthLabels(windowStart, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(windowStart);
    d.setMonth(d.getMonth() + i);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  });
}

export default function CampaignOperations({ clients, campaigns, setCampaigns, team, triggerToast }) {
  const [view, setView] = useState('gantt');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [cName,       setCName]       = useState('');
  const [cClientId,   setCClientId]   = useState('c1');
  const [cType,       setCType]       = useState(CAMPAIGN_TYPES[0]);
  const [cStart,      setCStart]      = useState('2026-06-01');
  const [cEnd,        setCEnd]        = useState('2026-08-31');
  const [cBudget,     setCBudget]     = useState('');
  const [cAssigneeId, setCAssigneeId] = useState('t1');

  const windowStart = useMemo(() => new Date('2026-04-01'), []);
  const windowDays  = 183; // ~6 months
  const months      = useMemo(() => monthLabels(windowStart, 6), [windowStart]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!cName.trim()) return;
    const campaign = {
      id:          'cmp-' + Date.now(),
      name:        cName.trim(),
      client_id:   cClientId,
      status:      'Planning',
      type:        cType,
      start_date:  cStart,
      end_date:    cEnd,
      progress:    0,
      budget:      parseFloat(cBudget) || 0,
      assignee_id: cAssigneeId,
    };
    setCampaigns(prev => [...prev, campaign]);
    setCName(''); setCBudget('');
    setModalOpen(false);
    triggerToast(`Campaign launched: ${campaign.name}`);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex items-center justify-between backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">CAMPAIGN OPERATIONS</h2>
          <p className="text-xs text-slate-400 mt-1">Manage timelines, assignees, and budgets across all active campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
        <div className="view-switcher flex bg-[#121820]/80 p-1.5 rounded-lg border border-[#212C3B]/60">
          {['list', 'gantt'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${view === v ? 'view-switcher-active bg-[#1F2A38] text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {v === 'list' ? 'List' : 'Gantt'}
            </button>
          ))}
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
          <PlusIcon /> Add Campaign
        </button>
        </div>
      </div>

      {/* Add campaign form */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} eyebrow="Campaign Operations" title="Add Campaign">
      <form onSubmit={handleAdd} className="space-y-4">
        <span className="text-xs font-black uppercase text-amber-500 tracking-widest block mb-4 font-mono">Add Campaign</span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Campaign Name</label>
            <input required type="text" placeholder="e.g. Q3 Brand Push" value={cName} onChange={e => setCName(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Client</label>
            <select value={cClientId} onChange={e => setCClientId(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Type</label>
            <select value={cType} onChange={e => setCType(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
              {CAMPAIGN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Start Date</label>
            <input type="date" value={cStart} onChange={e => setCStart(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">End Date</label>
            <input type="date" value={cEnd} onChange={e => setCEnd(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Assignee</label>
            <select value={cAssigneeId} onChange={e => setCAssigneeId(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
              {team.map(t => <option key={t.id} value={t.id}>{t.name} — {t.role}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Budget (MYR)</label>
            <input type="number" placeholder="e.g. 15000" value={cBudget} onChange={e => setCBudget(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
        </div>
        <button type="submit" className="mt-4 ml-auto block bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors">
          Launch Campaign
        </button>
      </form>
      </Modal>

      {/* Views */}
      {view === 'gantt' ? (
        <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Month headers */}
          <div className="grid border-b border-[#1C2634] bg-[#121820]/40" style={{ gridTemplateColumns: '240px 1fr' }}>
            <div className="text-[9px] text-slate-500 font-bold uppercase p-3 border-r border-[#1C2634]">Campaign</div>
            <div className="grid text-[9px] text-slate-500 font-bold uppercase" style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}>
              {months.map(m => <div key={m} className="p-3 text-center border-r border-[#1C2634]/40 last:border-r-0">{m}</div>)}
            </div>
          </div>

          <div className="divide-y divide-[#151D27]">
            {campaigns.map(cmp => {
              const client   = clients.find(c => c.id === cmp.client_id);
              const assignee = team.find(t => t.id === cmp.assignee_id);
              const [left, width] = ganttPosition(cmp.start_date, cmp.end_date, windowStart, windowDays);
              return (
                <div key={cmp.id} className="campaign-row flex items-center hover:bg-white/[0.01]" style={{ minHeight: '56px' }}>
                  <div className="w-60 flex-shrink-0 p-4 border-r border-[#1C2634]">
                    <h4 className="text-xs font-bold text-white leading-tight truncate">{cmp.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{client?.name} · {assignee?.name ?? '—'}</p>
                  </div>
                  <div className="flex-1 h-full relative py-3 px-2">
                    <div className="relative h-8 w-full">
                      {width > 0 && (
                        <div
                          className="absolute top-0 h-full rounded bg-gradient-to-r from-amber-500/25 to-yellow-600/25 border border-amber-500/40 flex items-center px-2 overflow-hidden"
                          style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        >
                          <span className="campaign-gantt-label text-[9px] font-bold text-amber-200 truncate whitespace-nowrap">
                            {cmp.progress}% · RM {cmp.budget.toLocaleString()}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151D27] text-slate-300">
              {campaigns.map(cmp => {
                const client   = clients.find(c => c.id === cmp.client_id);
                const assignee = team.find(t => t.id === cmp.assignee_id);
                return (
                  <tr key={cmp.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-5 font-bold text-white max-w-[180px] truncate">{cmp.name}</td>
                    <td className="py-3 px-5 text-slate-400">{client?.name ?? '—'}</td>
                    <td className="py-3 px-5 text-slate-400">{cmp.type}</td>
                    <td className="py-3 px-5 text-slate-400">{assignee?.name ?? '—'}</td>
                    <td className="py-3 px-5 font-mono text-slate-400 whitespace-nowrap text-[10px]">
                      {cmp.start_date} → {cmp.end_date}
                    </td>
                    <td className="py-3 px-5 font-mono">RM {cmp.budget.toLocaleString()}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_STYLES[cmp.status] ?? STATUS_STYLES.Planning}`}>
                        {cmp.status}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-[#18212D] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${cmp.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">{cmp.progress}%</span>
                      </div>
                    </td>
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
