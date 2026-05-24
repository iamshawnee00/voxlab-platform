'use client';

import React, { useMemo, useState } from 'react';
import { SERVICE_CATEGORIES } from '@/data/serviceCatalog';
import Modal from './Modal';

const emptyService = {
  name: '',
  category: SERVICE_CATEGORIES[0],
  description: '',
  unit: 'Project',
  defaultPrice: '',
};

const fmt = (n) =>
  'RM ' + Number(n || 0).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ServicesManagement({ services, setServices, triggerToast }) {
  const [form, setForm] = useState(emptyService);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = category === 'All' || service.category === category;
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.unit.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [category, search, services]);

  const resetForm = () => {
    setForm(emptyService);
    setEditingId(null);
    setModalOpen(false);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      triggerToast('Service name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      unit: form.unit.trim() || 'Project',
      defaultPrice: parseFloat(form.defaultPrice) || 0,
      sstExempt: false,
    };

    if (editingId) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingId ? { ...service, ...payload } : service
        )
      );
      triggerToast(`Service updated: ${payload.name}`);
    } else {
      setServices((current) => [
        { id: `svc-${Date.now()}`, ...payload },
        ...current,
      ]);
      triggerToast(`Service added: ${payload.name}`);
    }

    resetForm();
  };

  const editService = (service) => {
    setEditingId(service.id);
    setModalOpen(true);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      unit: service.unit,
      defaultPrice: service.defaultPrice,
    });
  };

  const deleteService = (serviceId) => {
    const service = services.find((item) => item.id === serviceId);
    setServices((current) => current.filter((item) => item.id !== serviceId));
    triggerToast(`Service deleted: ${service?.name ?? 'service'}`);
    if (editingId === serviceId) resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">VOXLAB SERVICES</h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain reusable work scopes, descriptions, UOM, and base pricing for quotations.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-amber-400">{services.length}</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Services</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm(emptyService); setModalOpen(true); }} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
          <PlusIcon /> Add Service
        </button>
      </div>

      <Modal open={modalOpen} onClose={resetForm} eyebrow="VOXLAB Services" title={editingId ? 'Edit Service' : 'Add Service'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase text-amber-500 tracking-widest font-mono">
            {editingId ? 'Edit Service' : 'Create Service'}
          </span>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-[10px] text-slate-400 hover:text-white uppercase font-bold">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Service / Work Name</label>
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="e.g. Brand & Campaign Strategy"
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Category</label>
            <select
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              {SERVICE_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">UOM</label>
            <input
              value={form.unit}
              onChange={(event) => updateForm('unit', event.target.value)}
              placeholder="Package, Month, Event, Project"
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Basic Pricing (MYR)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={form.defaultPrice}
              onChange={(event) => updateForm('defaultPrice', event.target.value)}
              placeholder="3500"
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-slate-400">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => updateForm('description', event.target.value)}
            placeholder="Describe the service, deliverables, inclusions, and usage notes."
            className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
          />
        </div>

        <button type="submit" className="ml-auto block bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors">
          {editingId ? 'Save Service' : 'Add Service'}
        </button>
      </form>
      </Modal>

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-[#1C2634] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services..."
            className="md:w-72 bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="bg-[#121820]/80 border border-[#212C3B]/60 rounded px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option>All</option>
            {SERVICE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Service</th>
              <th className="py-3 px-5">Description</th>
              <th className="py-3 px-5">UOM</th>
              <th className="py-3 px-5">Basic Price</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {filteredServices.map((service) => (
              <tr key={service.id} className="hover:bg-white/[0.01] transition-colors align-top">
                <td className="py-3.5 px-5">
                  <p className="font-bold text-white">{service.name}</p>
                  <p className="text-[10px] text-amber-500/80 mt-1">{service.category}</p>
                </td>
                <td className="py-3.5 px-5 text-slate-400 max-w-md leading-relaxed">{service.description}</td>
                <td className="py-3.5 px-5 font-mono text-slate-400">{service.unit}</td>
                <td className="py-3.5 px-5 font-mono font-bold">{fmt(service.defaultPrice)}</td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button onClick={() => editService(service)} className="text-[10px] text-amber-500 hover:underline font-bold uppercase mr-3">
                    Edit
                  </button>
                  <button onClick={() => deleteService(service.id)} className="text-[10px] text-rose-400 hover:underline font-bold uppercase">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
