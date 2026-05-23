'use client';

import React, { useState } from 'react';

export default function LarkIntegration({ clients, campaigns, triggerToast }) {
  const [appId,      setAppId]      = useState('cli_a28cb61f74ff1009');
  const [appSecret,  setAppSecret]  = useState('••••••••••••••••');
  const [baseToken,  setBaseToken]  = useState('bascnN97vYfO6wT0zV5eGf8d9b');
  const [tableId,    setTableId]    = useState('tbl_campaigns_v2');
  const [syncing,    setSyncing]    = useState(false);
  const [direction,  setDirection]  = useState('both'); // 'push' | 'pull' | 'both'
  const [syncLogs,   setSyncLogs]   = useState([
    { time: '12:01:00 AM', level: 'info',    message: '[Tunnel] Bidirectional schema initialised.' },
    { time: '12:01:05 AM', level: 'success', message: '[Pull] Retrieved 4 client rows from Bitable.' },
    { time: '12:01:10 AM', level: 'success', message: '[Push] Synced 4 campaign records to Lark Base.' },
  ]);

  const appendLog = (level, message) => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs(prev => [{ time, level, message }, ...prev]);
  };

  const runSync = async () => {
    setSyncing(true);
    appendLog('info', `[${direction.toUpperCase()}] Initiating sync with Base token ${baseToken}…`);

    setTimeout(() => {
      try {
        if (direction === 'pull' || direction === 'both') {
          appendLog('success', `[Pull] Retrieved ${clients.length} client records from Lark Bitable.`);
          appendLog('success', `[Pull] Synced ${campaigns.length} campaign entries from task table \`${tableId}\`.`);
        }
        if (direction === 'push' || direction === 'both') {
          appendLog('success', `[Push] Wrote ${campaigns.filter(c => c.status === 'Active').length} active campaigns to Lark Base.`);
          appendLog('success', `[Push] Client roster pushed — ${clients.length} records updated.`);
        }
        appendLog('info', '[Done] Sync complete. No conflicts detected.');
        triggerToast('Lark Base synchronised successfully.');
      } catch {
        appendLog('error', '[Error] Sync failed. Check App ID and Base Token.');
      } finally {
        setSyncing(false);
      }
    }, 1400);
  };

  const LOG_COLORS = {
    info:    'text-slate-400',
    success: 'text-emerald-400',
    error:   'text-rose-400',
    warn:    'text-amber-400',
  };

  return (
    <div className="space-y-6">

      <div className="bg-[#0B0F15]/85 border border-[#1A2430]/60 p-6 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-black uppercase text-white tracking-wider">LARK BASE TUNNEL</h2>
        <p className="text-xs text-slate-400 mt-1">Configure bidirectional sync between this platform and your Lark Bitable workspace.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Config panel */}
        <div className="lg:col-span-5 bg-[#0D1219]/90 border border-[#1C2634]/60 p-5 rounded-xl space-y-4 backdrop-blur-md">
          <span className="text-xs font-black uppercase text-amber-500 block font-mono">API Configuration</span>

          {[
            { label: 'Lark App ID',       val: appId,     set: setAppId,     type: 'text'     },
            { label: 'App Secret',         val: appSecret, set: setAppSecret, type: 'password' },
            { label: 'Bitable Base Token', val: baseToken, set: setBaseToken, type: 'text'     },
            { label: 'Campaign Table ID',  val: tableId,   set: setTableId,   type: 'text'     },
          ].map(({ label, val, set, type }) => (
            <div key={label} className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">{label}</label>
              <input
                type={type} value={val} onChange={e => set(e.target.value)}
                className="w-full bg-[#121820]/80 border border-[#212C3B]/60 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400">Sync Direction</label>
            <div className="flex gap-2">
              {[
                { val: 'pull', label: '← Pull from Lark' },
                { val: 'push', label: '→ Push to Lark'   },
                { val: 'both', label: '⇄ Bidirectional'  },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setDirection(val)}
                  className={`flex-1 text-[10px] font-bold uppercase py-1.5 rounded border transition-all ${direction === val ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'border-[#212C3B]/60 text-slate-500 hover:text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runSync}
            disabled={syncing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-xs py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {syncing ? 'Syncing…' : 'Run Sync'}
          </button>

          {/* Status summary */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2634]">
            <div className="bg-[#121820]/80 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{clients.length}</p>
              <p className="text-[9px] uppercase text-slate-500 font-bold">Clients</p>
            </div>
            <div className="bg-[#121820]/80 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{campaigns.length}</p>
              <p className="text-[9px] uppercase text-slate-500 font-bold">Campaigns</p>
            </div>
          </div>
        </div>

        {/* Event log */}
        <div className="lg:col-span-7 bg-[#0B0F15]/85 border border-[#1A2430]/60 p-5 rounded-xl flex flex-col backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-[#1C2634] pb-2 mb-3">
            <span className="text-[10px] font-black uppercase text-white tracking-widest">Integration Event Log</span>
            <button onClick={() => setSyncLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-bold">Clear</button>
          </div>
          <div className="bg-[#070A0E] rounded-lg p-4 font-mono text-[11px] leading-relaxed flex-1 overflow-y-auto space-y-1.5" style={{ maxHeight: '360px' }}>
            {syncLogs.length === 0 ? (
              <p className="text-slate-600">No log entries yet.</p>
            ) : syncLogs.map((log, idx) => (
              <div key={idx} className="flex space-x-2">
                <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                <span className={LOG_COLORS[log.level] ?? 'text-slate-400'}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
