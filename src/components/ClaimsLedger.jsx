'use client';

import React, { useState, useMemo } from 'react';

const CLAIM_TYPES = ['Staff Expense', 'Client Pass-through'];

export default function ClaimsLedger({ clients, claims, setClaims, session, triggerToast }) {
  const [item,      setItem]      = useState('');
  const [amount,    setAmount]    = useState('');
  const [claimType, setClaimType] = useState('Staff Expense');
  const [clientId,  setClientId]  = useState('');
  const [date,      setDate]      = useState('2026-05-23');
  const [syncing,   setSyncing]   = useState(false);
  const [filter,    setFilter]    = useState('All');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!item.trim() || !amount) return;
    const claim = {
      id:               'clm-' + Date.now(),
      profile_name:     session.user.full_name,
      role:             session.user.role,
      type:             claimType,
      client_id:        claimType === 'Client Pass-through' ? clientId : null,
      item_description: item.trim(),
      amount:           parseFloat(amount),
      transaction_date: date,
      sheet_logged:     false,
    };
    setClaims(prev => [claim, ...prev]);
    setItem(''); setAmount('');
    triggerToast('Claim voucher saved locally.');
  };

  const pushToSheet = () => {
    setSyncing(true);
    setTimeout(() => {
      setClaims(prev => prev.map(c => ({ ...c, sheet_logged: true })));
      setSyncing(false);
      triggerToast('All claims pushed to Finance Sheet.');
    }, 1400);
  };

  const filtered = useMemo(() => {
    if (filter === 'All')    return claims;
    if (filter === 'Pending') return claims.filter(c => !c.sheet_logged);
    return claims.filter(c => c.type === filter);
  }, [claims, filter]);

  const pendingTotal = useMemo(() => claims.filter(c => !c.sheet_logged).reduce((a, c) => a + c.amount, 0), [claims]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">CLAIMS LEDGER</h2>
          <p className="text-xs text-slate-400 mt-1">Log staff expenses and client pass-throughs. Currency: MYR.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Pending: <span className="text-amber-400 font-mono font-bold">RM {pendingTotal.toFixed(2)}</span>
          </span>
          <button
            onClick={pushToSheet}
            disabled={syncing}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-1.5 rounded-lg text-xs font-bold uppercase hover:brightness-110 transition-all disabled:opacity-60"
          >
            {syncing ? 'Syncing...' : 'Push to Finance Sheet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Submit form */}
        <form onSubmit={handleAdd} className="lg:col-span-4 bg-[#0D1219]/90 border border-[#1C2634]/60 p-5 rounded-xl space-y-4 backdrop-blur-md">
          <span className="text-xs font-black uppercase text-amber-500 block font-mono">Submit Voucher</span>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Claim Type</label>
            <select value={claimType} onChange={e => setClaimType(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none">
              {CLAIM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {claimType === 'Client Pass-through' && (
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none">
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Description</label>
            <input required type="text" placeholder="e.g. Studio shoot catering" value={item} onChange={e => setItem(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Amount (MYR)</label>
            <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none" />
          </div>

          <button type="submit" className="w-full bg-amber-500 text-black font-bold uppercase text-xs py-2 rounded-lg hover:bg-amber-600 transition-colors">
            Log Claim
          </button>
        </form>

        {/* Ledger table */}
        <div className="lg:col-span-8 space-y-3">

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Pending', 'Staff Expense', 'Client Pass-through'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase px-3 py-1 rounded border transition-all ${filter === f ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'border-[#212C3B]/60 text-slate-500 hover:text-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 tracking-widest font-bold">
                  <th className="py-3 px-5">Submitter</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D27] text-slate-300">
                {filtered.map(claim => {
                  const client = claim.client_id ? clients.find(c => c.id === claim.client_id) : null;
                  return (
                    <tr key={claim.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-5 font-bold text-white">{claim.profile_name}</td>
                      <td className="py-3 px-5">
                        <span className="text-[9px] font-bold uppercase text-slate-400">
                          {claim.type}
                          {client && <span className="text-amber-400 ml-1">· {client.name}</span>}
                        </span>
                      </td>
                      <td className="py-3 px-5 max-w-[180px] truncate">{claim.item_description}</td>
                      <td className="py-3 px-5 text-amber-400 font-bold font-mono">RM {claim.amount.toFixed(2)}</td>
                      <td className="py-3 px-5 text-slate-500 font-mono">{claim.transaction_date}</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${claim.sheet_logged ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                          {claim.sheet_logged ? 'Synced' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
