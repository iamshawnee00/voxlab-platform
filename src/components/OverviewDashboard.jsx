'use client';

import React, { useMemo } from 'react';

const fmt = (n) => `RM ${Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function quoteTotals(q) {
  const sub = q.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  return sub * (1 - q.discount / 100) * (1 + q.tax / 100);
}

export default function OverviewDashboard({ clients, campaigns, quotes, claims, team, triggerToast }) {
  const today = new Date('2026-05-23');

  // Monthly income = sum of Approved quotes
  const monthlyIncome = useMemo(
    () => quotes.filter(q => q.status === 'Approved').reduce((a, q) => a + quoteTotals(q), 0),
    [quotes]
  );

  // Upcoming deadlines in next 7 days
  const upcoming = useMemo(() => {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 7);
    return campaigns
      .filter(c => {
        const end = new Date(c.end_date);
        return end >= today && end <= cutoff;
      })
      .sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
  }, [campaigns]);

  // Pending claims
  const pendingClaimsTotal = useMemo(
    () => claims.filter(c => !c.sheet_logged).reduce((a, c) => a + c.amount, 0),
    [claims]
  );

  const pendingQuotes = quotes.filter(q => q.status === 'Pending');

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');

  const handleLarkSync = () => triggerToast('Lark Base sync triggered from dashboard.');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">SYSTEM WORKSPACE OVERVIEW</h2>
          <p className="text-xs text-slate-400 mt-1">Agency KPIs updated from active workspace data.</p>
        </div>
        <button
          onClick={handleLarkSync}
          className="self-start md:self-auto bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:brightness-110 transition-all"
        >
          Sync Lark Base
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Income',      value: fmt(monthlyIncome),               sub: 'from approved quotes'    },
          { label: 'Active Campaigns',     value: `${activeCampaigns.length}`,      sub: `of ${campaigns.length} total` },
          { label: 'Pending Claims',       value: fmt(pendingClaimsTotal),          sub: `${claims.filter(c=>!c.sheet_logged).length} unsynced vouchers` },
          { label: 'Quotes Awaiting',      value: `${pendingQuotes.length}`,        sub: 'pending client approval' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-5 rounded-xl backdrop-blur-md">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">{label}</span>
            <p className="text-xl font-bold text-white mt-1 leading-tight">{value}</p>
            <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Upcoming deadlines */}
        <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-[#1C2634] pb-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">UPCOMING DEADLINES (7 DAYS)</span>
            <span className="text-[10px] text-amber-500 font-bold font-mono">{upcoming.length} DUE</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No deadlines in the next 7 days.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(cmp => {
                const client = clients.find(c => c.id === cmp.client_id);
                const daysLeft = Math.ceil((new Date(cmp.end_date) - today) / 86400000);
                return (
                  <div key={cmp.id} className="flex items-center justify-between p-3 bg-[#111720]/80 border border-[#1E2A3A]/50 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-white">{cmp.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{client?.name} // {cmp.type}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${daysLeft <= 2 ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                      {daysLeft}d left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team capacity */}
        <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-[#1C2634] pb-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">TEAM CAPACITY</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Bandwidth %</span>
          </div>
          <div className="space-y-4">
            {team.map(member => (
              <div key={member.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="text-xs font-bold text-white">{member.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{member.role}</span>
                  </div>
                  <span className={`text-xs font-bold ${member.capacity >= 80 ? 'text-rose-400' : member.capacity >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {member.capacity}%
                  </span>
                </div>
                <div className="w-full bg-[#18212D] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${member.capacity >= 80 ? 'bg-rose-500' : member.capacity >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${member.capacity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active campaign progress */}
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl p-5 backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-[#1C2634] pb-3 mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-white">ACTIVE CAMPAIGN PROGRESS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeCampaigns.map(cmp => {
            const client = clients.find(c => c.id === cmp.client_id);
            return (
              <div key={cmp.id} className="p-3 bg-[#111720]/80 border border-[#1E2A3A]/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] uppercase bg-slate-800 text-slate-400 font-mono tracking-widest px-1.5 py-0.5 rounded">
                      {client?.name ?? '—'}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5">{cmp.name}</h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-500">{cmp.progress}%</span>
                </div>
                <div className="w-full bg-[#18212D] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-600 h-full" style={{ width: `${cmp.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
