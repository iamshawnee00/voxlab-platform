'use client';

import React from 'react';

export default function Modal({ open, title, eyebrow, children, onClose, width = 'max-w-3xl' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal backdrop"
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className={`modal-panel relative max-h-[88vh] w-full ${width} overflow-y-auto rounded-2xl border border-white/10 bg-[#090D13] shadow-2xl shadow-black/70`}>
        <div className="modal-header sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#090D13]/95 px-5 py-4 backdrop-blur-xl">
          <div>
            {eyebrow && (
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-500/80">{eyebrow}</p>
            )}
            <h3 className="mt-1 text-lg font-black uppercase tracking-wide text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:text-white"
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
