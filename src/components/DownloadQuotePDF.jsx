'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';

/**
 * Thin wrapper around PDFDownloadLink so we can dynamically import this entire
 * module (including @react-pdf/renderer) with { ssr: false } in
 * QuotationBuilder without touching the rest of the component tree.
 */
export default function DownloadQuotePDF({ quote, client, projectTitle }) {
  const filename = `${quote.quote_number} — VOXLAB Quotation.pdf`;

  return (
    <PDFDownloadLink
      document={
        <QuotePDF
          quote={quote}
          client={client}
          projectTitle={projectTitle || quote.projectTitle || ''}
        />
      }
      fileName={filename}
      style={{ textDecoration: 'none' }}
    >
      {({ loading, error }) => (
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all cursor-pointer select-none ${
            error
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              : loading
              ? 'bg-[#121820]/80 border border-[#212C3B]/60 text-slate-500 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:brightness-110'
          }`}
        >
          {error ? '✕ PDF Error' : loading ? 'Building PDF…' : '↓ Download PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
}
