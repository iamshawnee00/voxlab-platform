'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';

export default function DownloadQuotePDF({ quote, client, projectTitle }) {
  const version = quote.version ? `-V${quote.version}` : '';
  const safeClient = (client?.name || 'Client')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
  const filename = `${quote.quote_number}${version}-VOXLAB-Quotation-${safeClient}.pdf`;

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
          {error ? 'PDF Error' : loading ? 'Building PDF...' : 'Download PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
}
