'use client';

import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { USER_GRADES } from '@/lib/permissions';

const DAY_MS = 24 * 60 * 60 * 1000;

const emptyPerson = {
  name: '',
  role: '',
  grade: 'G3 - Executive',
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

function monthRange(value) {
  const [year, month] = value.split('-').map(Number);
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59),
  };
}

function weekRange(value) {
  const [yearPart, weekPart] = value.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - jan4Day + 1 + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function campaignOverlaps(campaign, range) {
  const start = new Date(campaign.start_date);
  const end = new Date(campaign.end_date);
  return start <= range.end && end >= range.start;
}

function campaignLoad(campaign, range) {
  const campaignStart = new Date(campaign.start_date);
  const campaignEnd = new Date(campaign.end_date);
  const start = new Date(Math.max(campaignStart, range.start));
  const end = new Date(Math.min(campaignEnd, range.end));
  const overlapDays = Math.max(0, Math.floor((end - start) / DAY_MS) + 1);
  const rangeDays = Math.max(1, Math.floor((range.end - range.start) / DAY_MS) + 1);
  return Math.round((overlapDays / rangeDays) * 100);
}

export default function InternalManagement({ team, setTeam, campaigns, triggerToast }) {
  const [form, setForm] = useState(emptyPerson);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [capacityMode, setCapacityMode] = useState('month');
  const [capacityMonth, setCapacityMonth] = useState('2026-05');
  const [capacityWeek, setCapacityWeek] = useState('2026-W21');

  const selectedRange = useMemo(
    () => (capacityMode === 'month' ? monthRange(capacityMonth) : weekRange(capacityWeek)),
    [capacityMode, capacityMonth, capacityWeek]
  );

  const personnelRows = useMemo(
    () =>
      team.map((person) => {
        const assignedCampaigns = campaigns.filter(
          (campaign) => campaign.assignee_id === person.id && campaignOverlaps(campaign, selectedRange)
        );
        const calculatedCapacity = Math.min(
          100,
          assignedCampaigns.reduce((sum, campaign) => sum + campaignLoad(campaign, selectedRange), 0)
        );

        return { ...person, assignedCampaigns, calculatedCapacity };
      }),
    [team, campaigns, selectedRange]
  );

  const resetForm = () => {
    setForm(emptyPerson);
    setEditingId(null);
    setModalOpen(false);
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
      grade: form.grade || 'G3 - Executive',
      date_joined: form.date_joined || new Date().toISOString().slice(0, 10),
      capacity: Math.max(0, Math.min(100, parseInt(form.capacity, 10) || 0)),
    };

    if (editingId) {
      setTeam((current) =>
        current.map((person) => (person.id === editingId ? { ...person, ...payload } : person))
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
    setModalOpen(true);
    setForm({
      name: person.name,
      role: person.role,
      grade: person.grade || 'G3 - Executive',
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
      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">INTERNAL MANAGEMENT</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage personnel grades and review calculated campaign capacity by week or month.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Capacity Range</label>
            <div className="view-switcher flex bg-[#121820]/80 p-1.5 rounded-lg border border-[#212C3B]/60">
              {['month', 'week'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCapacityMode(mode)}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                    capacityMode === mode ? 'view-switcher-active bg-[#1F2A38] text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <input
            type={capacityMode === 'month' ? 'month' : 'week'}
            value={capacityMode === 'month' ? capacityMonth : capacityWeek}
            onChange={(event) =>
              capacityMode === 'month' ? setCapacityMonth(event.target.value) : setCapacityWeek(event.target.value)
            }
            className="bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          />

          <div className="text-right min-w-20">
            <p className="text-2xl font-black text-amber-400">{team.length}</p>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Personnel</p>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyPerson);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <PlusIcon /> Add Personnel
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={resetForm} eyebrow="Internal Management" title={editingId ? 'Edit Personnel' : 'Add Personnel'}>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="text-[9px] uppercase font-bold text-slate-400">Grade</label>
              <select
                value={form.grade}
                onChange={(event) => updateForm('grade', event.target.value)}
                className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                {USER_GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
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
              <label className="text-[9px] uppercase font-bold text-slate-400">Base Capacity (%)</label>
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
      </Modal>

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2634] bg-[#121820]/40 text-[9px] uppercase text-slate-500 font-bold tracking-widest">
              <th className="py-3 px-5">Name</th>
              <th className="py-3 px-5">Grade</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5">Date Joined</th>
              <th className="py-3 px-5">Tenure</th>
              <th className="py-3 px-5">Campaign Load</th>
              <th className="py-3 px-5">Campaigns</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151D27] text-slate-300">
            {personnelRows.map((person) => (
              <tr key={person.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3.5 px-5 font-bold text-white">{person.name}</td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                    {person.grade || 'G3 - Executive'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-slate-400">{person.role}</td>
                <td className="py-3.5 px-5 font-mono text-slate-500">{person.date_joined || '-'}</td>
                <td className="py-3.5 px-5 text-slate-400">{tenure(person.date_joined)}</td>
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 rounded bg-[#1C2634] overflow-hidden">
                      <div
                        className={`h-full ${
                          person.calculatedCapacity > 85
                            ? 'bg-rose-500'
                            : person.calculatedCapacity > 65
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${person.calculatedCapacity}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-400">{person.calculatedCapacity}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-slate-400">
                  <span className="font-bold text-white">{person.assignedCampaigns.length}</span>
                  <span className="ml-1 text-slate-500">assigned</span>
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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
