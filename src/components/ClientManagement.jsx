'use client';

import React, { useState } from 'react';
import Modal from './Modal';

const STATUS_STYLES = {
  Active:     'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  Onboarding: 'text-amber-400   border-amber-500/20   bg-amber-500/10',
  Paused:     'text-slate-400   border-slate-500/20   bg-slate-500/10',
};

const GRADIENTS = [
  'from-[#10B981] to-[#059669]',
  'from-[#3B82F6] to-[#2563EB]',
  'from-[#EF4444] to-[#DC2626]',
  'from-[#D97706] to-[#F59E0B]',
  'from-[#8B5CF6] to-[#D946EF]',
];

export default function ClientManagement({ clients, setClients, triggerToast }) {
  const [name,     setName]     = useState('');
  const [rep,      setRep]      = useState('');
  const [budget,   setBudget]   = useState('');
  const [status,   setStatus]   = useState('Onboarding');
  const [industry, setIndustry] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const client = {
      id:             'c' + Date.now(),
      name:           name.trim(),
      status,
      budget:         parseFloat(budget) || 0,
      outcomes:       'Pending setup',
      representative: rep.trim() || 'Unassigned',
      industry:       industry.trim() || '—',
      logo_gradient:  GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    };
    setClients(prev => [...prev, client]);
    setName(''); setRep(''); setBudget(''); setIndustry('');
    setModalOpen(false);
    triggerToast(`Client added: ${client.name}`);
  };

  return (
    <div className="space-y-6">

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">CLIENT PORTFOLIO</h2>
          <p className="text-xs text-slate-400 mt-1">Manage partner brand accounts and their workspace records.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
          <PlusIcon /> Add Client
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} eyebrow="Client Management" title="Add Client">
      <form onSubmit={handleAdd} className="space-y-4">
        <span className="text-xs font-black uppercase text-amber-500 tracking-widest block mb-4 font-mono">Register New Account</span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Brand Name',     val: name,     set: setName,     ph: 'e.g. Arcane Wear', type: 'text'   },
            { label: 'Representative', val: rep,      set: setRep,      ph: 'e.g. Sarah Lin',   type: 'text'   },
            { label: 'Industry',       val: industry, set: setIndustry, ph: 'e.g. Fashion',     type: 'text'   },
            { label: 'Budget (MYR)',   val: budget,   set: setBudget,   ph: 'e.g. 45000',       type: 'number' },
          ].map(({ label, val, set, ph, type }) => (
            <div key={label} className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">{label}</label>
              <input
                type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)}
                className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
              <option>Onboarding</option>
              <option>Active</option>
              <option>Paused</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-4 ml-auto block bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors">
          Provision Account
        </button>
      </form>
      </Modal>

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Brand</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Budget (MYR)</th>
              <th className="py-3 px-5">Outcomes</th>
              <th className="py-3 px-5">Industry</th>
              <th className="py-3 px-5">Lead Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3.5 px-5 font-bold text-white">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-sm bg-gradient-to-br flex-shrink-0 ${c.logo_gradient}`} />
                    <span>{c.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_STYLES[c.status] ?? STATUS_STYLES.Paused}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-5 font-mono">RM {c.budget.toLocaleString()}</td>
                <td className="py-3.5 px-5 text-emerald-400 font-semibold">{c.outcomes}</td>
                <td className="py-3.5 px-5 text-slate-400">{c.industry ?? '—'}</td>
                <td className="py-3.5 px-5 text-slate-400">{c.representative}</td>
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
