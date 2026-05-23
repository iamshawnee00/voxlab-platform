'use client';

import React, { useState, useMemo } from 'react';

const QUOTE_STATUS_STYLES = {
  Approved: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  Pending:  'text-amber-400   border-amber-500/20   bg-amber-500/10',
  Rejected: 'text-rose-400    border-rose-500/20    bg-rose-500/10',
  Draft:    'text-slate-400   border-slate-500/20   bg-slate-500/10',
};

function calcTotals(items, discount, tax) {
  const sub  = items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const disc = sub * (discount / 100);
  const total = (sub - disc) * (1 + tax / 100);
  return { sub, disc, total };
}

function nextQuoteNumber(quotes) {
  const nums = quotes.map(q => {
    const m = q.quote_number?.match(/VL-\d{4}-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
  return `VL-2026-${next}`;
}

const BLANK_ITEMS = () => [{ description: '', qty: 1, unitPrice: 0 }];

export default function QuotationBuilder({ clients, quotes, setQuotes, triggerToast }) {
  const [activeView,  setActiveView]  = useState('list'); // 'list' | 'new' | 'preview'
  const [viewingId,   setViewingId]   = useState(null);

  // Form state for new quote
  const [qClientId,  setQClientId]  = useState('c1');
  const [qItems,     setQItems]     = useState(BLANK_ITEMS());
  const [qDiscount,  setQDiscount]  = useState(0);
  const [qTax,       setQTax]       = useState(8);

  const { sub, disc, total } = useMemo(() => calcTotals(qItems, qDiscount, qTax), [qItems, qDiscount, qTax]);

  const addLine    = () => setQItems(prev => [...prev, { description: '', qty: 1, unitPrice: 0 }]);
  const removeLine = (idx) => setQItems(prev => prev.filter((_, i) => i !== idx));
  const updateLine = (idx, field, val) => setQItems(prev => {
    const next = [...prev];
    next[idx] = { ...next[idx], [field]: val };
    return next;
  });

  const saveQuote = (status = 'Draft') => {
    const quote = {
      id:           'q' + Date.now(),
      quote_number: nextQuoteNumber(quotes),
      client_id:    qClientId,
      status,
      created_at:   '2026-05-23',
      items:        qItems.filter(i => i.description.trim()),
      discount:     qDiscount,
      tax:          qTax,
    };
    setQuotes(prev => [quote, ...prev]);
    setQItems(BLANK_ITEMS()); setQDiscount(0); setQTax(8);
    setActiveView('list');
    triggerToast(`Quote ${quote.quote_number} saved as ${status}.`);
  };

  const viewingQuote = viewingId ? quotes.find(q => q.id === viewingId) : null;

  // ── Preview panel ──────────────────────────────────────────────────────────
  if (activeView === 'preview' && viewingQuote) {
    const vClient = clients.find(c => c.id === viewingQuote.client_id);
    const { sub: vs, disc: vd, total: vt } = calcTotals(viewingQuote.items, viewingQuote.discount, viewingQuote.tax);
    return (
      <div className="space-y-4">
        <button onClick={() => { setActiveView('list'); setViewingId(null); }} className="text-xs text-amber-500 hover:underline font-bold">
          ← Back to Quote History
        </button>
        <div className="bg-white text-slate-900 rounded-xl p-8 max-w-2xl mx-auto shadow-2xl space-y-6 print:shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-black">VOXLAB</h1>
              <p className="text-xs text-slate-400 mt-0.5">Creative Agency</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800">{viewingQuote.quote_number}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{viewingQuote.created_at}</p>
              <span className={`mt-1 inline-block text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${QUOTE_STATUS_STYLES[viewingQuote.status]}`}>
                {viewingQuote.status}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Bill To</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{vClient?.name ?? '—'}</p>
            <p className="text-xs text-slate-500">{vClient?.representative}</p>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-[9px] uppercase font-bold text-slate-400">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {viewingQuote.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2.5 font-medium text-slate-800">{item.description}</td>
                  <td className="py-2.5 text-center">{item.qty}</td>
                  <td className="py-2.5 text-right font-mono">RM {item.unitPrice.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono font-bold">RM {(item.qty * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col items-end text-xs space-y-1.5 text-slate-500 pt-2 border-t">
            <p>Subtotal: <span className="text-slate-800 font-mono ml-2">RM {vs.toLocaleString()}</span></p>
            {vd > 0 && <p>Discount ({viewingQuote.discount}%): <span className="text-rose-500 font-mono ml-2">-RM {vd.toLocaleString()}</span></p>}
            <p>Tax ({viewingQuote.tax}%): <span className="text-slate-800 font-mono ml-2">RM {(vt - (vs - vd)).toLocaleString()}</span></p>
            <p className="text-base font-black text-amber-600 mt-1">Total: RM {vt.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MYR</p>
          </div>

          <p className="text-[10px] text-slate-400 border-t pt-4">
            This quotation is valid for 30 days from the issue date. VOXLAB Creative Agency.
          </p>
        </div>
      </div>
    );
  }

  // ── New quote form ─────────────────────────────────────────────────────────
  if (activeView === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveView('list')} className="text-xs text-amber-500 hover:underline font-bold">
            ← Back to Quote History
          </button>
          <span className="text-[10px] text-slate-500 font-mono">{nextQuoteNumber(quotes)}</span>
        </div>

        <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#1C2634] pb-5">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Client</label>
              <select value={qClientId} onChange={e => setQClientId(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none">
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Discount (%)</label>
              <input type="number" value={qDiscount} onChange={e => setQDiscount(parseFloat(e.target.value) || 0)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Tax (%)</label>
              <input type="number" value={qTax} onChange={e => setQTax(parseFloat(e.target.value) || 0)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="grid grid-cols-12 text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2 px-1">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3">Unit Price (MYR)</span>
              <span className="col-span-1" />
            </div>
            <div className="space-y-2">
              {qItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" placeholder="Service / deliverable description" value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} className="col-span-6 bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500" />
                  <input type="number" min="1" value={item.qty} onChange={e => updateLine(idx, 'qty', parseInt(e.target.value) || 0)} className="col-span-2 bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white text-center focus:outline-none" />
                  <input type="number" min="0" value={item.unitPrice} onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="col-span-3 bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none" />
                  <button type="button" onClick={() => removeLine(idx)} className="col-span-1 text-slate-500 hover:text-rose-400 text-lg leading-none text-center transition-colors">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addLine} className="mt-3 text-xs text-amber-500 hover:underline font-bold">
              + Add Line Item
            </button>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end text-xs space-y-1.5 text-slate-400 pt-4 border-t border-[#1C2634]">
            <p>Subtotal: <span className="text-white font-mono ml-2">RM {sub.toLocaleString()}</span></p>
            <p>Discount: <span className="text-rose-400 font-mono ml-2">-RM {disc.toLocaleString()}</span></p>
            <p className="text-base font-black text-amber-500">
              Total: RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-[#1C2634]">
            <button onClick={() => saveQuote('Draft')} className="bg-[#121820]/80 border border-[#212C3B]/60 text-slate-300 hover:text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">
              Save as Draft
            </button>
            <button onClick={() => saveQuote('Pending')} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded text-xs font-bold uppercase hover:brightness-110 transition-all">
              Send to Client
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quote list ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex items-center justify-between backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">QUOTATION BUILDER</h2>
          <p className="text-xs text-slate-400 mt-1">Create, track, and version client proposals. Currency: MYR.</p>
        </div>
        <button onClick={() => setActiveView('new')} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:brightness-110 transition-all">
          + New Quote
        </button>
      </div>

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Quote #</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">Total (MYR)</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {quotes.map(q => {
              const client  = clients.find(c => c.id === q.client_id);
              const { total } = calcTotals(q.items, q.discount, q.tax);
              return (
                <tr key={q.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-white">{q.quote_number}</td>
                  <td className="py-3.5 px-5">{client?.name ?? '—'}</td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono">{q.created_at}</td>
                  <td className="py-3.5 px-5 font-mono font-bold">
                    RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${QUOTE_STATUS_STYLES[q.status] ?? QUOTE_STATUS_STYLES.Draft}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => { setViewingId(q.id); setActiveView('preview'); }}
                      className="text-[10px] text-amber-500 hover:underline font-bold uppercase"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
