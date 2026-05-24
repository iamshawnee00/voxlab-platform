'use client';

import React, { useState } from 'react';

const emptyPerson = {
  name: '',
  role: '',
  date_joined: '',
  capacity: 50,
};

function tenure(dateJoined) {
  if (!dateJoined) return 'Not set';
  const joined = new Date(dateJoined);
  const now = new Date('2026-05-24');
  const months = Math.max(0, (now.getFullYear() - joined.getFullYear()) * 12 + now.getMonth() - joined.getMonth());
  if (months < 1) return 'New joiner';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}

export default function InternalManagement({ team, setTeam, triggerToast }) {
  const [form, setForm] = useState(emptyPerson);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setForm(emptyPerson);
    setEditingId(null);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      triggerToast('Name and role are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      date_joined: form.date_joined || new Date().toISOString().slice(0, 10),
      capacity: Math.max(0, Math.min(100, parseInt(form.capacity) || 0)),
    };

    if (editingId) {
      setTeam((current) =>
        current.map((person) =>
          person.id === editingId ? { ...person, ...payload } : person
        )
      );
      triggerToast(`Personnel updated: ${payload.name}`);
    } else {
      setTeam((current) => [{ id: `t${Date.now()}`, ...payload }, ...current]);
      triggerToast(`Personnel added: ${payload.name}`);
    }

    resetForm();
  };

  const editPerson = (person) => {
    setEditingId(person.id);
    setForm({
      name: person.name,
      role: person.role,
      date_joined: person.date_joined || '',
      capacity: person.capacity ?? 50,
    });
  };

  const deletePerson = (personId) => {
    const person = team.find((item) => item.id === personId);
    setTeam((current) => current.filter((item) => item.id !== personId));
    triggerToast(`Personnel deleted: ${person?.name ?? 'person'}`);
    if (editingId === personId) resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">INTERNAL MANAGEMENT</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage VOXLAB personnel, roles, date joined, and working capacity.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-amber-400">{team.length}</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Personnel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0D1219]/90 border border-[#1C2634]/60 p-5 rounded-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase text-amber-500 tracking-widest font-mono">
            {editingId ? 'Edit Personnel' : 'Add Personnel'}
          </span>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-[10px] text-slate-400 hover:text-white uppercase font-bold">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Name</label>
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="e.g. Shawn Lee"
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Role</label>
            <input
              value={form.role}
              onChange={(event) => updateForm('role', event.target.value)}
              placeholder="e.g. Growth Principal"
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Date Joined</label>
            <input
              type="date"
              value={form.date_joined}
              onChange={(event) => updateForm('date_joined', event.target.value)}
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Capacity (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.capacity}
              onChange={(event) => updateForm('capacity', event.target.value)}
              className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <button type="submit" className="ml-auto block bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors">
          {editingId ? 'Save Personnel' : 'Add Personnel'}
        </button>
      </form>

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Name</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5">Date Joined</th>
              <th className="py-3 px-5">Tenure</th>
              <th className="py-3 px-5">Capacity</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {team.map((person) => (
              <tr key={person.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3.5 px-5 font-bold text-white">{person.name}</td>
                <td className="py-3.5 px-5 text-slate-400">{person.role}</td>
                <td className="py-3.5 px-5 font-mono text-slate-500">{person.date_joined || '-'}</td>
                <td className="py-3.5 px-5 text-slate-400">{tenure(person.date_joined)}</td>
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 rounded bg-[#1C2634] overflow-hidden">
                      <div
                        className={`h-full ${person.capacity > 85 ? 'bg-rose-500' : person.capacity > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, person.capacity ?? 0))}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-400">{person.capacity ?? 0}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button onClick={() => editPerson(person)} className="text-[10px] text-amber-500 hover:underline font-bold uppercase mr-3">
                    Edit
                  </button>
                  <button onClick={() => deletePerson(person.id)} className="text-[10px] text-rose-400 hover:underline font-bold uppercase">
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
