'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SERVICE_CATEGORIES } from '@/data/serviceCatalog';

const DownloadQuotePDF = dynamic(() => import('./DownloadQuotePDF'), {
  ssr: false,
  loading: () => (
    <span className="px-4 py-2 text-xs text-slate-500 animate-pulse">Loading PDF engine...</span>
  ),
});

const STATUS_OPTIONS = ['Pending', 'Rejected', 'Approved'];

const QUOTE_STATUS_STYLES = {
  Approved: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  Pending: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
  Rejected: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
  Draft: 'text-slate-400 border-slate-500/20 bg-slate-500/10',
};

const emptyItem = () => ({
  service_id: '',
  name: '',
  description: '',
  qty: 1,
  unit: 'Package',
  unitPrice: 0,
  discount: 0,
  remarks: '',
});

const emptyForm = (clientId = '') => ({
  client_id: clientId,
  projectTitle: '',
  projectType: 'Marketing Campaign',
  campaignPeriod: '',
  primaryPlatform: 'Instagram / TikTok / Meta',
  preparedBy: 'VOXLAB',
  conceptDirection:
    'VOXLAB structures creative energy into a clear campaign system: positioning, content rhythm, launch assets, and performance support.',
  status: 'Pending',
  tax: 0,
  items: [emptyItem()],
});

const fmt = (n) =>
  'RM ' + Number(n || 0).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function calcTotals(items, tax) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const discount = items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = taxable * ((parseFloat(tax) || 0) / 100);
  return { subtotal, discount, taxAmount, total: taxable + taxAmount };
}

function nextQuoteNumber(quotes) {
  const nums = quotes.map((quote) => {
    const match = quote.quote_number?.match(/VL-\d{4}-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
  return `VL-2026-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
}

function quoteFamilyKey(quote) {
  return quote.parent_quote_id || quote.id;
}

function withVersionMetadata(quotes) {
  const groups = new Map();
  quotes.forEach((quote) => {
    const key = quoteFamilyKey(quote);
    groups.set(key, [...(groups.get(key) || []), quote]);
  });

  return quotes.map((quote) => {
    const family = [...(groups.get(quoteFamilyKey(quote)) || [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    const version = family.findIndex((item) => item.id === quote.id) + 1;
    return { ...quote, version, versionCount: family.length };
  });
}

function normalizeQuoteToForm(quote) {
  return {
    client_id: quote.client_id,
    projectTitle: quote.projectTitle || '',
    projectType: quote.projectType || 'Marketing Campaign',
    campaignPeriod: quote.campaignPeriod || '',
    primaryPlatform: quote.primaryPlatform || 'Instagram / TikTok / Meta',
    preparedBy: quote.preparedBy || 'VOXLAB',
    conceptDirection:
      quote.conceptDirection ||
      'VOXLAB structures creative energy into a clear campaign system: positioning, content rhythm, launch assets, and performance support.',
    status: quote.status === 'Draft' ? 'Pending' : quote.status,
    tax: quote.tax || 0,
    items: quote.items?.length ? quote.items.map((item) => ({ ...emptyItem(), ...item })) : [emptyItem()],
  };
}

export default function QuotationBuilder({ clients, services, quotes, setQuotes, triggerToast }) {
  const [activeView, setActiveView] = useState('list');
  const [viewingId, setViewingId] = useState(null);
  const [editingSourceId, setEditingSourceId] = useState(null);
  const [form, setForm] = useState(emptyForm(clients[0]?.id ?? ''));
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState('All');

  const quotesWithVersions = useMemo(() => withVersionMetadata(quotes), [quotes]);
  const viewingQuote = viewingId ? quotesWithVersions.find((quote) => quote.id === viewingId) : null;
  const viewingClient = viewingQuote ? clients.find((client) => client.id === viewingQuote.client_id) : null;

  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = serviceCategory === 'All' || service.category === serviceCategory;
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [serviceCategory, serviceSearch, services]);

  const formTotals = useMemo(() => calcTotals(form.items, form.tax), [form.items, form.tax]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => {
    setForm((current) => {
      const nextItems = [...current.items];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...current, items: nextItems };
    });
  };

  const selectService = (index, serviceId) => {
    const service = services.find((item) => item.id === serviceId);
    if (!service) {
      updateItem(index, 'service_id', '');
      return;
    }

    setForm((current) => {
      const nextItems = [...current.items];
      nextItems[index] = {
        ...nextItems[index],
        service_id: service.id,
        name: service.name,
        description: service.description,
        unit: service.unit,
        unitPrice: service.defaultPrice,
      };
      return { ...current, items: nextItems };
    });
  };

  const addServiceToQuote = (service) => {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items.filter((item) => item.name.trim() || item.description.trim()),
        {
          ...emptyItem(),
          service_id: service.id,
          name: service.name,
          description: service.description,
          unit: service.unit,
          unitPrice: service.defaultPrice,
        },
      ],
    }));
    triggerToast(`${service.name} added to quotation.`);
  };

  const startNewQuote = () => {
    setEditingSourceId(null);
    setForm(emptyForm(clients[0]?.id ?? ''));
    setActiveView('edit');
  };

  const startEditQuote = (quote) => {
    setEditingSourceId(quote.id);
    setForm(normalizeQuoteToForm(quote));
    setViewingId(null);
    setActiveView('edit');
  };

  const saveQuote = () => {
    const cleanItems = form.items.filter((item) => item.name.trim() || item.description.trim());
    if (!form.client_id || cleanItems.length === 0) {
      triggerToast('Select a client and add at least one service.');
      return;
    }

    const sourceQuote = editingSourceId ? quotes.find((quote) => quote.id === editingSourceId) : null;
    const parentId = sourceQuote ? quoteFamilyKey(sourceQuote) : null;
    const quoteNumber = sourceQuote ? sourceQuote.quote_number : nextQuoteNumber(quotes);

    const savedQuote = {
      id: `q${Date.now()}`,
      quote_number: quoteNumber,
      parent_quote_id: parentId,
      client_id: form.client_id,
      projectTitle: form.projectTitle.trim(),
      projectType: form.projectType.trim(),
      campaignPeriod: form.campaignPeriod.trim(),
      primaryPlatform: form.primaryPlatform.trim(),
      preparedBy: form.preparedBy.trim(),
      conceptDirection: form.conceptDirection.trim(),
      status: form.status,
      created_at: new Date().toISOString().slice(0, 10),
      tax: parseFloat(form.tax) || 0,
      items: cleanItems.map((item) => ({
        ...item,
        qty: Math.max(1, parseFloat(item.qty) || 1),
        unitPrice: parseFloat(item.unitPrice) || 0,
        discount: parseFloat(item.discount) || 0,
      })),
    };

    setQuotes((current) => [savedQuote, ...current]);
    setActiveView('list');
    setEditingSourceId(null);
    setForm(emptyForm(clients[0]?.id ?? ''));
    triggerToast(
      sourceQuote
        ? `New version saved for ${quoteNumber}.`
        : `Quote ${quoteNumber} created.`
    );
  };

  const changeStatus = (quoteId, status) => {
    setQuotes((current) =>
      current.map((quote) => (quote.id === quoteId ? { ...quote, status } : quote))
    );
    triggerToast(`Quotation status changed to ${status}.`);
  };

  const familyHistory = (quote) =>
    quotesWithVersions
      .filter((item) => quoteFamilyKey(item) === quoteFamilyKey(quote))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (activeView === 'preview' && viewingQuote) {
    const totals = calcTotals(viewingQuote.items, viewingQuote.tax);
    const history = familyHistory(viewingQuote);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => { setActiveView('list'); setViewingId(null); }} className="text-xs text-amber-500 hover:underline font-bold">
            Back to Quote History
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => startEditQuote(viewingQuote)} className="bg-[#121820]/80 border border-[#212C3B]/60 text-slate-300 hover:text-white px-4 py-2 rounded text-xs font-bold uppercase">
              Edit as New Version
            </button>
            <DownloadQuotePDF quote={viewingQuote} client={viewingClient} projectTitle={viewingQuote.projectTitle || ''} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 bg-white text-slate-900 rounded-xl p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-5">
              <div>
                <h1 className="text-2xl font-black tracking-widest text-black">VOXLAB</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Client Quotation</p>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Client / Brand</p>
                  <p className="font-bold">{viewingClient?.name ?? '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Quotation Number</p>
                  <p className="font-mono font-bold">{viewingQuote.quote_number} / V{viewingQuote.version}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Project Type</p>
                  <p>{viewingQuote.projectType || '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Campaign Period</p>
                  <p>{viewingQuote.campaignPeriod || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-2">Concept Direction</p>
              <p className="text-xs leading-relaxed text-slate-600">{viewingQuote.conceptDirection}</p>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-y text-[9px] uppercase font-bold text-slate-500 tracking-widest">
                  <th className="py-2 w-8">No.</th>
                  <th className="py-2">Scope</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2">Unit</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Discount</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {viewingQuote.items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-b align-top">
                    <td className="py-2.5 text-slate-400">{index + 1}</td>
                    <td className="py-2.5 font-bold pr-3">{item.name}</td>
                    <td className="py-2.5 text-slate-500 pr-3 leading-relaxed">{item.description}</td>
                    <td className="py-2.5 text-center">{item.qty}</td>
                    <td className="py-2.5 text-slate-500">{item.unit}</td>
                    <td className="py-2.5 text-right font-mono">{fmt(item.unitPrice)}</td>
                    <td className="py-2.5 text-right font-mono">{fmt(item.discount)}</td>
                    <td className="py-2.5 text-right font-mono font-bold">{fmt(item.qty * item.unitPrice - (item.discount || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-72 text-xs space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{fmt(totals.subtotal)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span className="font-mono text-rose-500">- {fmt(totals.discount)}</span></div>
                <div className="flex justify-between"><span>SST / Tax ({viewingQuote.tax || 0}%)</span><span className="font-mono">{fmt(totals.taxAmount)}</span></div>
                <div className="flex justify-between border-t pt-2 font-black text-base text-amber-600"><span>Total Investment</span><span>{fmt(totals.total)}</span></div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Status</p>
              <select value={viewingQuote.status} onChange={(event) => changeStatus(viewingQuote.id, event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none">
                {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>

            <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Version History</p>
              <div className="space-y-2">
                {history.map((quote) => {
                  const totalsForQuote = calcTotals(quote.items, quote.tax);
                  return (
                    <button key={quote.id} onClick={() => setViewingId(quote.id)} className={`w-full text-left border rounded-lg p-3 ${quote.id === viewingQuote.id ? 'border-amber-500/40 bg-amber-500/10' : 'border-[#212C3B]/60 bg-[#121820]/60 hover:border-slate-500/50'}`}>
                      <div className="flex justify-between gap-3">
                        <span className="font-bold text-white text-xs">V{quote.version}</span>
                        <span className="font-mono text-[10px] text-slate-400">{quote.created_at}</span>
                      </div>
                      <div className="flex justify-between gap-3 mt-1">
                        <span className="text-[10px] text-slate-500">{quote.items.length} services</span>
                        <span className="text-[10px] text-amber-400 font-mono">{fmt(totalsForQuote.total)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'edit') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => setActiveView('list')} className="text-xs text-amber-500 hover:underline font-bold">
            Back to Quote History
          </button>
          <span className="text-[10px] text-slate-500 font-mono">
            {editingSourceId ? 'Saving changes as a new version' : nextQuoteNumber(quotes)}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div className="xl:col-span-8 bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Client">
                <select value={form.client_id} onChange={(event) => updateForm('client_id', event.target.value)} className="field">
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="field">
                  {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Project Title">
                <input value={form.projectTitle} onChange={(event) => updateForm('projectTitle', event.target.value)} placeholder="e.g. Q3 Campaign Launch" className="field" />
              </Field>
              <Field label="Project Type">
                <input value={form.projectType} onChange={(event) => updateForm('projectType', event.target.value)} className="field" />
              </Field>
              <Field label="Campaign Period">
                <input value={form.campaignPeriod} onChange={(event) => updateForm('campaignPeriod', event.target.value)} placeholder="e.g. 01/06/2026 - 31/08/2026" className="field" />
              </Field>
              <Field label="Primary Platform">
                <input value={form.primaryPlatform} onChange={(event) => updateForm('primaryPlatform', event.target.value)} className="field" />
              </Field>
              <Field label="Prepared By">
                <input value={form.preparedBy} onChange={(event) => updateForm('preparedBy', event.target.value)} className="field" />
              </Field>
              <Field label="SST / Tax (%)">
                <input type="number" min="0" value={form.tax} onChange={(event) => updateForm('tax', event.target.value)} className="field" />
              </Field>
            </div>

            <Field label="Concept Direction">
              <textarea rows={3} value={form.conceptDirection} onChange={(event) => updateForm('conceptDirection', event.target.value)} className="field resize-none leading-relaxed" />
            </Field>

            <div className="space-y-3 border-t border-[#1C2634] pt-5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Scope of Work</span>
                <button type="button" onClick={() => updateForm('items', [...form.items, emptyItem()])} className="text-xs text-amber-500 hover:underline font-bold">
                  + Add Blank Line
                </button>
              </div>

              {form.items.map((item, index) => (
                <div key={index} className="bg-[#0D1219]/80 border border-[#1E2A3A]/60 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Select Main Frame / Service">
                      <select value={item.service_id || ''} onChange={(event) => selectService(index, event.target.value)} className="field">
                        <option value="">Custom service</option>
                        {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Scope Name">
                      <input value={item.name} onChange={(event) => updateItem(index, 'name', event.target.value)} className="field" />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea rows={2} value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} className="field resize-none leading-relaxed" />
                  </Field>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Field label="Qty">
                      <input type="number" min="1" value={item.qty} onChange={(event) => updateItem(index, 'qty', event.target.value)} className="field" />
                    </Field>
                    <Field label="UOM">
                      <input value={item.unit} onChange={(event) => updateItem(index, 'unit', event.target.value)} className="field" />
                    </Field>
                    <Field label="Unit Price">
                      <input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} className="field" />
                    </Field>
                    <Field label="Discount">
                      <input type="number" min="0" value={item.discount} onChange={(event) => updateItem(index, 'discount', event.target.value)} className="field" />
                    </Field>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[8px] uppercase text-slate-500 font-bold mb-1">Amount</p>
                        <p className="text-xs text-amber-400 font-mono font-bold">{fmt(item.qty * item.unitPrice - (parseFloat(item.discount) || 0))}</p>
                      </div>
                      <button type="button" onClick={() => updateForm('items', form.items.filter((_, itemIndex) => itemIndex !== index))} className="text-rose-400 text-[10px] uppercase font-bold hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>

                  <Field label="Remarks">
                    <input value={item.remarks || ''} onChange={(event) => updateItem(index, 'remarks', event.target.value)} placeholder="e.g. Ad spend excluded unless stated" className="field" />
                  </Field>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end text-xs space-y-1.5 text-slate-400 pt-4 border-t border-[#1C2634]">
              <p>Subtotal <span className="text-white font-mono ml-2">{fmt(formTotals.subtotal)}</span></p>
              <p>Discount <span className="text-rose-400 font-mono ml-2">- {fmt(formTotals.discount)}</span></p>
              <p>SST / Tax <span className="text-white font-mono ml-2">{fmt(formTotals.taxAmount)}</span></p>
              <p className="text-base font-black text-amber-500">Total: {fmt(formTotals.total)}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={saveQuote} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-5 py-2 rounded text-xs font-bold uppercase hover:brightness-110 transition-all">
                {editingSourceId ? 'Save New Version' : 'Create Quotation'}
              </button>
            </div>
          </div>

          <div className="xl:col-span-4 bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl backdrop-blur-md overflow-hidden sticky top-6">
            <div className="p-4 border-b border-[#1C2634] space-y-3">
              <p className="text-[9px] uppercase font-bold text-amber-400 tracking-widest">VOXLAB Service Library</p>
              <input value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} placeholder="Search services..." className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none" />
              <select value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-1.5 text-xs text-white focus:outline-none">
                <option>All</option>
                {SERVICE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-[#151D27]">
              {filteredServices.map((service) => (
                <button key={service.id} onClick={() => addServiceToQuote(service)} className="w-full text-left p-3.5 hover:bg-white/[0.025] transition-colors">
                  <div className="flex justify-between gap-3">
                    <p className="text-xs font-bold text-white leading-tight">{service.name}</p>
                    <p className="text-[10px] font-bold text-amber-400 font-mono whitespace-nowrap">{fmt(service.defaultPrice)}</p>
                  </div>
                  <p className="text-[9px] text-amber-500/70 mt-1 font-mono uppercase tracking-wide">{service.unit}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{service.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl flex items-center justify-between backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">QUOTATION BUILDER</h2>
          <p className="text-xs text-slate-400 mt-1">Create, edit, version, approve, reject, and export VOXLAB quotations.</p>
        </div>
        <button onClick={startNewQuote} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:brightness-110 transition-all">
          + New Quote
        </button>
      </div>

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Quote #</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Project</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">No. of Services</th>
              <th className="py-3 px-5">Total (MYR)</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {quotesWithVersions.map((quote) => {
              const client = clients.find((item) => item.id === quote.client_id);
              const totals = calcTotals(quote.items, quote.tax);
              return (
                <tr key={quote.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-white">
                    {quote.quote_number}
                    <span className="ml-2 text-[9px] text-amber-400">V{quote.version}</span>
                  </td>
                  <td className="py-3.5 px-5">{client?.name ?? '-'}</td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-[160px] truncate">{quote.projectTitle || '-'}</td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono">{quote.created_at}</td>
                  <td className="py-3.5 px-5 font-mono">{quote.items?.length ?? 0}</td>
                  <td className="py-3.5 px-5 font-mono font-bold">{fmt(totals.total)}</td>
                  <td className="py-3.5 px-5">
                    <select value={quote.status} onChange={(event) => changeStatus(quote.id, event.target.value)} className={`px-2 py-1 rounded text-[9px] font-bold uppercase border bg-[#121820] ${QUOTE_STATUS_STYLES[quote.status] ?? QUOTE_STATUS_STYLES.Pending}`}>
                      {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button onClick={() => { setViewingId(quote.id); setActiveView('preview'); }} className="text-[10px] text-amber-500 hover:underline font-bold uppercase mr-3">
                      View / PDF
                    </button>
                    <button onClick={() => startEditQuote(quote)} className="text-[10px] text-slate-400 hover:text-white hover:underline font-bold uppercase">
                      Edit
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

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">{label}</label>
      {children}
    </div>
  );
}
