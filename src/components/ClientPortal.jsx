import React from 'react';

export default function ClientPortal({ sessionUser }) {
  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-amber-500/15 to-yellow-600/5 border border-amber-500/30 p-8 rounded-2xl relative overflow-hidden">
        <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          Partner outcomes cockpit
        </span>
        <h2 className="text-2xl font-black text-white uppercase mt-4">Campaign Performance telemetry</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
          Welcome back. Review ROAS optimization records, campaign assets status, and budget allocations in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Consolidated Performance</span>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">14.2x ROAS</h3>
        </div>
        <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Active Ad Spend</span>
          <h3 className="text-xl font-bold text-white mt-1">$45,000 SGD</h3>
        </div>
        <div className="bg-[#0B0F15]/90 border border-[#1A2430] p-5 rounded-xl">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Deliverable Assets</span>
          <h3 className="text-xl font-bold text-amber-500 mt-1">12 / 15 Variations</h3>
        </div>
      </div>
    </div>
  );
}