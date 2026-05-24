'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SERVICE_CATEGORIES, SERVICE_CATALOG } from '@/data/serviceCatalog';

// Dynamically import the PDF downloader so @react-pdf/renderer is never
// evaluated on the server (it requires browser APIs like Canvas/Blob).
const DownloadQuotePDF = dynamic(
  () => import('./DownloadQuotePDF'),
  {
    ssr: false,
    loading: () => (
      <span className="px-4 py-2 text-xs text-slate-500 animate-pulse">
        Loading PDF engine…
      </span>
    ),
  }
);

// ── Status badge styles ────────────────────────────────────────────────────
const QUOTE_STATUS_STYLES = {
  Approved: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  Pending:  'text-amber-400   border-amber-500/20   bg-amber-500/10',
  Rejected: 'text-rose-400    border-rose-500/20    bg-rose-500/10',
  Draft:    'text-slate-400   border-slate-500/20   bg-slate-500/10',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function calcTotals(items, discount, tax) {
  const sub   = items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const disc  = sub * (discount / 100);
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

const fmt = (n) =>
  'RM ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Each line item carries: name, description, qty, unit, unitPrice
const BLANK_ITEM = () => ({ name: '', description: '', qty: 1, unitPrice: 0, unit: '' });
const BLANK_ITEMS = () => [BLANK_ITEM()];

// ── Component ──────────────────────────────────────────────────────────────
export default function QuotationBuilder({ clients, quotes, setQuotes, triggerToast }) {
  const [activeView,  setActiveView]  = useState('list'); // 'list' | 'new' | 'preview'
  const [viewingId,   setViewingId]   = useState(null);

  // ── New-quote form state ───────────────────────────────────────────────
  const [qClientId,     setQClientId]     = useState(clients[0]?.id ?? '');
  const [qProjectTitle, setQProjectTitle] = useState('');
  const [qItems,        setQItems]        = useState(BLANK_ITEMS());
  const [qDiscount,     setQDiscount]     = useState(0);
  const [qTax,          setQTax]          = useState(8);

  // ── Service catalog panel state ───────────────────────────────────────
  const [catalogOpen,   setCatalogOpen]   = useState(false);
  const [catalogCat,    setCatalogCat]    = useState('All');
  const [catalogSearch, setCatalogSearch] = useState('');

  // ── Computed totals for live preview ──────────────────────────────────
  const { sub, disc, total } = useMemo(
    () => calcTotals(qItems, qDiscount, qTax),
    [qItems, qDiscount, qTax]
  );

  // ── Filtered services ─────────────────────────────────────────────────
  const filteredServices = useMemo(() => {
    const q = catalogSearch.toLowerCase();
    return SERVICE_CATALOG.filter(svc => {
      const matchCat    = catalogCat === 'All' || svc.category === catalogCat;
      const matchSearch = !q ||
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [catalogCat, catalogSearch]);

  // ── Line-item helpers ─────────────────────────────────────────────────
  const addLine    = () => setQItems(prev => [...prev, BLANK_ITEM()]);
  const removeLine = (idx) => setQItems(prev => prev.filter((_, i) => i !== idx));
  const updateLine = (idx, field, val) =>
    setQItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });

  const addFromCatalog = (svc) => {
    setQItems(prev => {
      const cleaned = prev.filter(i => i.name.trim() || i.description.trim());
      return [
        ...cleaned,
        {
          name:        svc.name,
          description: svc.description,
          qty:         1,
          unitPrice:   svc.defaultPrice,
          unit:        svc.unit,
        },
      ];
    });
    triggerToast(`"${svc.name}" added to quote.`);
  };

  // ── Save quote ────────────────────────────────────────────────────────
  const saveQuote = (status = 'Draft') => {
    const validItems = qItems.filter(i => i.name.trim() || i.description.trim());
    if (validItems.length === 0) {
      triggerToast('Add at least one line item before saving.');
      return;
    }
    const quote = {
      id:           'q' + Date.now(),
      quote_number: nextQuoteNumber(quotes),
      client_id:    qClientId,
      projectTitle: qProjectTitle.trim(),
      status,
      created_at:   new Date().toISOString().slice(0, 10),
      items:        validItems,
      discount:     qDiscount,
      tax:          qTax,
    };
    setQuotes(prev => [quote, ...prev]);
    // Reset form
    setQItems(BLANK_ITEMS());
    setQDiscount(0);
    setQTax(8);
    setQProjectTitle('');
    setCatalogOpen(false);
    setActiveView('list');
    triggerToast(`Quote ${quote.quote_number} saved as ${status}.`);
  };

  // ── Preview helpers ───────────────────────────────────────────────────
  const viewingQuote  = viewingId ? quotes.find(q => q.id === viewingId) : null;
  const viewingClient = viewingQuote ? clients.find(c => c.id === viewingQuote.client_id) : null;

  // ════════════════════════════════════════════════════════════════════════
  // PREVIEW VIEW
  // ════════════════════════════════════════════════════════════════════════
  if (activeView === 'preview' && viewingQuote) {
    const { sub: vs, disc: vd, total: vt } =
      calcTotals(viewingQuote.items, viewingQuote.discount, viewingQuote.tax);
    const sstAmt = vt - (vs - vd);

    return (
      <div className="space-y-4">
        {/* Top action bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => { setActiveView('list'); setViewingId(null); }}
            className="text-xs text-amber-500 hover:underline font-bold"
          >
            ← Back to Quote History
          </button>
          <DownloadQuotePDF
            quote={viewingQuote}
            client={viewingClient}
            projectTitle={viewingQuote.projectTitle || ''}
          />
        </div>

        {/* White-paper document preview */}
        <div className="bg-white text-slate-900 rounded-xl p-8 max-w-2xl mx-auto shadow-2xl space-y-6 print:shadow-none">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-black tracking-widest">VOXLAB</h1>
              <p className="text-xs text-slate-400 mt-0.5 tracking-widest uppercase">Creative Agency</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800 font-mono">{viewingQuote.quote_number}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{viewingQuote.created_at}</p>
              <span
                className={`mt-1 inline-block text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
                  QUOTE_STATUS_STYLES[viewingQuote.status] ?? QUOTE_STATUS_STYLES.Draft
                }`}
              >
                {viewingQuote.status}
              </span>
            </div>
          </div>

          {/* Bill to */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-widest mb-1">Bill To</p>
              <p className="text-sm font-bold text-slate-800">{viewingClient?.name ?? '—'}</p>
              {viewingClient?.representative && (
                <p className="text-xs text-slate-500">{viewingClient.representative}</p>
              )}
              {viewingClient?.industry && (
                <p className="text-xs text-slate-400">{viewingClient.industry}</p>
              )}
            </div>
            {viewingQuote.projectTitle && (
              <div>
                <p className="text-[9px] uppercase text-slate-400 font-bold tracking-widest mb-1">Project</p>
                <p className="text-sm font-bold text-slate-800">{viewingQuote.projectTitle}</p>
              </div>
            )}
          </div>

          {/* Items table */}
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                <th className="py-2 w-2/5">Service</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-center w-10">Qty</th>
                <th className="py-2 text-right w-24">Unit Price</th>
                <th className="py-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {viewingQuote.items.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50/50">
                  <td className="py-2.5 font-bold text-slate-800 pr-3">
                    {item.name || item.description}
                    {item.unit && (
                      <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                        {item.unit}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-500 text-[10px] pr-3 leading-relaxed">
                    {item.name ? item.description : ''}
                  </td>
                  <td className="py-2.5 text-center">{item.qty}</td>
                  <td className="py-2.5 text-right font-mono">
                    RM {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold">
                    RM {(item.qty * item.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex flex-col items-end text-xs space-y-1.5 text-slate-500 pt-2 border-t">
            <p>
              Subtotal:{' '}
              <span className="text-slate-800 font-mono ml-2">RM {vs.toLocaleString()}</span>
            </p>
            {vd > 0 && (
              <p>
                Discount ({viewingQuote.discount}%):{' '}
                <span className="text-rose-500 font-mono ml-2">
                  -RM {vd.toLocaleString()}
                </span>
              </p>
            )}
            <p>
              SST ({viewingQuote.tax}%):{' '}
              <span className="text-slate-800 font-mono ml-2">RM {sstAmt.toLocaleString()}</span>
            </p>
            <p className="text-base font-black text-amber-600 mt-1">
              Total: {fmt(vt)} MYR
            </p>
          </div>

          <p className="text-[10px] text-slate-400 border-t pt-4">
            This quotation is valid for 30 days from the issue date. VOXLAB Creative Agency ·
            hello@voxlab.co · voxlab.co
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // NEW QUOTE FORM
  // ════════════════════════════════════════════════════════════════════════
  if (activeView === 'new') {
    const nonEmptyCount = qItems.filter(i => i.name.trim() || i.description.trim()).length;

    return (
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setActiveView('list')}
            className="text-xs text-amber-500 hover:underline font-bold"
          >
            ← Back to Quote History
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono">
              {nextQuoteNumber(quotes)}
            </span>
            <button
              onClick={() => setCatalogOpen(o => !o)}
              className={`text-xs px-3 py-1.5 rounded border font-bold uppercase tracking-wide transition-all ${
                catalogOpen
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-[#121820]/80 border-[#212C3B]/60 text-slate-400 hover:text-white'
              }`}
            >
              {catalogOpen ? '✕ Close Catalog' : '⊞ Browse Services'}
            </button>
          </div>
        </div>

        {/* Two-panel layout: form + optional catalog */}
        <div className={`flex gap-5 items-start ${catalogOpen ? 'flex-col lg:flex-row' : ''}`}>

          {/* ── Main form ─────────────────────────────────────────────── */}
          <div className={catalogOpen ? 'lg:flex-1 w-full' : 'w-full'}>
            <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md space-y-6">

              {/* Client + Project Title + Discount + SST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#1C2634] pb-5">

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                    Client
                  </label>
                  <select
                    value={qClientId}
                    onChange={e => setQClientId(e.target.value)}
                    className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                    Project Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q2 Brand Campaign 2026"
                    value={qProjectTitle}
                    onChange={e => setQProjectTitle(e.target.value)}
                    className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={qDiscount}
                    onChange={e => setQDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                    SST (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={qTax}
                    onChange={e => setQTax(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* ── Scope of Work ────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                    Scope of Work
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {nonEmptyCount} service{nonEmptyCount !== 1 ? 's' : ''} added
                  </span>
                </div>

                <div className="space-y-3">
                  {qItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0D1219]/70 border border-[#1E2A3A]/60 rounded-lg p-4 space-y-2.5"
                    >
                      {/* Row 1: Service Name | Unit | Remove */}
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                            Service Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Brand Film — Full Production"
                            value={item.name}
                            onChange={e => updateLine(idx, 'name', e.target.value)}
                            className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                            Unit
                          </label>
                          <input
                            type="text"
                            placeholder="Project"
                            value={item.unit}
                            onChange={e => updateLine(idx, 'unit', e.target.value)}
                            className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          title="Remove line"
                          className="mb-0.5 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-rose-400 text-lg leading-none transition-colors rounded hover:bg-rose-500/10"
                        >
                          ×
                        </button>
                      </div>

                      {/* Row 2: Description */}
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe scope, deliverables, and inclusions for this service…"
                          value={item.description}
                          onChange={e => updateLine(idx, 'description', e.target.value)}
                          className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Row 3: Qty | Unit Price | Line Total */}
                      <div className="flex gap-3 items-end pt-1">
                        <div className="w-20 space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => updateLine(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white text-center focus:outline-none"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                            Unit Price (RM)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="text-right pb-1.5 shrink-0">
                          <span className="text-[9px] text-slate-500 block mb-0.5">Line Total</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            RM {(item.qty * item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addLine}
                  className="mt-3 text-xs text-amber-500 hover:text-amber-400 hover:underline font-bold transition-colors"
                >
                  + Add Line Item
                </button>
              </div>

              {/* ── Live Totals ──────────────────────────────────────── */}
              <div className="flex flex-col items-end text-xs space-y-1.5 text-slate-400 pt-4 border-t border-[#1C2634]">
                <p>
                  Subtotal:{' '}
                  <span className="text-white font-mono ml-2">RM {sub.toLocaleString()}</span>
                </p>
                {disc > 0 && (
                  <p>
                    Discount ({qDiscount}%):{' '}
                    <span className="text-rose-400 font-mono ml-2">
                      -RM {disc.toLocaleString()}
                    </span>
                  </p>
                )}
                <p>
                  SST ({qTax}%):{' '}
                  <span className="text-white font-mono ml-2">
                    RM {(total - (sub - disc)).toLocaleString()}
                  </span>
                </p>
                <p className="text-base font-black text-amber-500">
                  Total: {fmt(total)}
                </p>
              </div>

              {/* ── Actions ──────────────────────────────────────────── */}
              <div className="flex gap-3 justify-end pt-2 border-t border-[#1C2634]">
                <button
                  onClick={() => saveQuote('Draft')}
                  className="bg-[#121820]/80 border border-[#212C3B]/60 text-slate-300 hover:text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => saveQuote('Pending')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded text-xs font-bold uppercase hover:brightness-110 transition-all"
                >
                  Send to Client
                </button>
              </div>
            </div>
          </div>

          {/* ── Service Catalog Panel ──────────────────────────────────── */}
          {catalogOpen && (
            <div className="lg:w-80 xl:w-96 shrink-0 w-full">
              <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl backdrop-blur-md overflow-hidden sticky top-6">

                {/* Panel header + search */}
                <div className="p-4 border-b border-[#1C2634] space-y-2">
                  <p className="text-[9px] uppercase font-bold text-amber-400 tracking-widest">
                    Service Catalog
                  </p>
                  <input
                    type="text"
                    placeholder="Search services…"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                {/* Category filter pills */}
                <div className="flex gap-1.5 flex-wrap p-3 border-b border-[#1C2634]">
                  {['All', ...SERVICE_CATEGORIES].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCatalogCat(cat)}
                      className={`text-[8px] px-2 py-1 rounded font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                        catalogCat === cat
                          ? 'bg-amber-500 text-black'
                          : 'bg-[#121820]/80 border border-[#212C3B]/60 text-slate-400 hover:text-white hover:border-amber-500/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Services list */}
                <div className="overflow-y-auto max-h-[58vh] divide-y divide-[#151D27]">
                  {filteredServices.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">
                      No services match.
                    </p>
                  ) : (
                    filteredServices.map(svc => (
                      <div
                        key={svc.id}
                        className="p-3.5 hover:bg-white/[0.025] transition-colors group cursor-pointer"
                        onClick={() => addFromCatalog(svc)}
                        title={`Add "${svc.name}" to quote`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white leading-tight">
                              {svc.name}
                            </p>
                            <p className="text-[9px] text-amber-500/70 mt-0.5 font-mono uppercase tracking-wide">
                              {svc.unit}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-bold text-amber-400 font-mono">
                              {svc.defaultPrice > 0
                                ? `RM ${svc.defaultPrice.toLocaleString()}`
                                : 'Custom'}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                          {svc.description}
                        </p>
                        <p className="mt-2 text-[9px] font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          + Add to Quote →
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-[#1C2634] text-center">
                  <p className="text-[9px] text-slate-600">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} · click to add
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // QUOTE LIST
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex items-center justify-between backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">
            QUOTATION BUILDER
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, track, and version client proposals. Currency: MYR.
          </p>
        </div>
        <button
          onClick={() => setActiveView('new')}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:brightness-110 transition-all"
        >
          + New Quote
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Quote #</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Project</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">Total (MYR)</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                  No quotes yet. Click <span className="text-amber-500 font-bold">+ New Quote</span> to create one.
                </td>
              </tr>
            ) : (
              quotes.map(q => {
                const client = clients.find(c => c.id === q.client_id);
                const { total: qt } = calcTotals(q.items, q.discount, q.tax);
                return (
                  <tr key={q.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-white">
                      {q.quote_number}
                    </td>
                    <td className="py-3.5 px-5">{client?.name ?? '—'}</td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-[160px] truncate">
                      {q.projectTitle || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono">{q.created_at}</td>
                    <td className="py-3.5 px-5 font-mono font-bold">{fmt(qt)}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          QUOTE_STATUS_STYLES[q.status] ?? QUOTE_STATUS_STYLES.Draft
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => { setViewingId(q.id); setActiveView('preview'); }}
                        className="text-[10px] text-amber-500 hover:underline font-bold uppercase"
                      >
                        View / PDF
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
