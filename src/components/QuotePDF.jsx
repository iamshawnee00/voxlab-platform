'use client';

import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from '@react-pdf/renderer';

// ── Colour tokens ──────────────────────────────────────────────────────────
const C = {
  black:      '#09090b',
  dark:       '#0f1218',
  panel:      '#161c26',
  border:     '#1e2a3a',
  amber:      '#f59e0b',
  amberLight: '#fcd34d',
  white:      '#ffffff',
  offWhite:   '#f8f8f6',
  muted:      '#64748b',
  mutedLight: '#94a3b8',
  emerald:    '#10b981',
  text:       '#1e293b',
  textLight:  '#475569',
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.offWhite,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.text,
  },

  // Cover
  coverPage: {
    backgroundColor: C.dark,
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
  },
  coverTop: {
    backgroundColor: C.black,
    padding: '48 48 36',
    borderBottom: `3 solid ${C.amber}`,
  },
  coverWordmark: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 4,
  },
  coverTagline: {
    fontSize: 7,
    color: C.amber,
    letterSpacing: 4,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  coverBody: {
    padding: '48 48 36',
    flex: 1,
  },
  coverQuoteLabel: {
    fontSize: 7,
    color: C.mutedLight,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coverProjectTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    lineHeight: 1.3,
    marginBottom: 6,
  },
  coverClientName: {
    fontSize: 13,
    color: C.amberLight,
    marginBottom: 32,
  },
  coverMeta: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  coverMetaItem: {
    flex: 1,
  },
  coverMetaLabel: {
    fontSize: 7,
    color: C.mutedLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  coverMetaValue: {
    fontSize: 9,
    color: C.white,
    fontFamily: 'Helvetica-Bold',
  },
  coverFooter: {
    backgroundColor: C.panel,
    padding: '20 48',
    borderTop: `1 solid ${C.border}`,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterText: {
    fontSize: 7,
    color: C.muted,
  },

  // Detail page
  detailPage: {
    backgroundColor: C.offWhite,
    padding: '40 48 32',
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 16,
    borderBottom: `2 solid ${C.amber}`,
  },
  logoSmall: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    letterSpacing: 2,
  },
  logoTagSmall: {
    fontSize: 6,
    color: C.amber,
    letterSpacing: 2,
    marginTop: 3,
  },
  pageHeaderRight: {
    textAlign: 'right',
  },
  quoteNumLabel: {
    fontSize: 7,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  quoteNum: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
  },

  // Bill-to / meta block
  metaRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  metaBox: {
    flex: 1,
    backgroundColor: C.white,
    border: `1 solid #e2e8f0`,
    borderRadius: 4,
    padding: '12 14',
  },
  metaBoxLabel: {
    fontSize: 6.5,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  metaBoxValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginBottom: 2,
  },
  metaBoxSub: {
    fontSize: 8,
    color: C.textLight,
  },

  // Table
  tableLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.muted,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  tableHead: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: C.black,
    padding: '7 10',
    borderRadius: 3,
    marginBottom: 1,
  },
  tableHeadCell: {
    fontSize: 7,
    color: C.amber,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottom: `1 solid #f1f5f9`,
    padding: '9 10',
    alignItems: 'flex-start',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  colService: { width: '32%' },
  colDesc:    { width: '38%' },
  colQty:     { width: '8%',  textAlign: 'center' },
  colUnit:    { width: '9%' },
  colPrice:   { width: '13%', textAlign: 'right' },
  cellService: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    lineHeight: 1.35,
  },
  cellDesc: {
    fontSize: 7.5,
    color: C.textLight,
    lineHeight: 1.4,
  },
  cellText: {
    fontSize: 8.5,
    color: C.text,
    lineHeight: 1.35,
  },
  cellPrice: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    textAlign: 'right',
  },

  // Totals
  totalsSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginBottom: 20,
  },
  totalsBox: {
    width: '42%',
    backgroundColor: C.white,
    border: `1 solid #e2e8f0`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '7 12',
    borderBottom: `1 solid #f1f5f9`,
  },
  totalLabel: {
    fontSize: 8,
    color: C.textLight,
  },
  totalValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
  },
  totalGrandRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '10 12',
    backgroundColor: C.black,
  },
  totalGrandLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  totalGrandValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.amber,
  },

  // Payment schedule
  paySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.muted,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  payRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 10,
  },
  payDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.amber,
  },
  payText: {
    fontSize: 8.5,
    color: C.text,
    flex: 1,
  },
  payAmt: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
  },

  // Page footer
  pageFooter: {
    borderTop: `1 solid #e2e8f0`,
    paddingTop: 10,
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: C.muted,
  },

  // Terms page
  termsPage: {
    backgroundColor: C.offWhite,
    padding: '40 48 32',
  },
  termsTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginBottom: 6,
  },
  termsSub: {
    fontSize: 8,
    color: C.muted,
    marginBottom: 24,
  },
  termsSection: {
    marginBottom: 14,
  },
  termsSectionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginBottom: 4,
  },
  termsBody: {
    fontSize: 8,
    color: C.textLight,
    lineHeight: 1.55,
  },
  signatureBlock: {
    marginTop: 28,
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
  },
  sigBox: {
    flex: 1,
    borderTop: `1 solid ${C.border}`,
    paddingTop: 8,
  },
  sigLabel: {
    fontSize: 7,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  sigName: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginBottom: 2,
  },
  sigSub: {
    fontSize: 7.5,
    color: C.muted,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  'RM ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Payment schedule calculation ───────────────────────────────────────────
function buildPaySchedule(total, schedule) {
  return schedule.map(({ label, pct }) => ({
    label,
    amount: total * (pct / 100),
  }));
}

const DEFAULT_SCHEDULE = [
  { label: 'Upon signing — project kick-off deposit', pct: 50 },
  { label: 'Mid-project milestone delivery',          pct: 25 },
  { label: 'Final delivery & handover',              pct: 25 },
];

// ── PDF Document ────────────────────────────────────────────────────────────
export default function QuotePDF({ quote, client, projectTitle }) {
  const sub   = quote.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const disc  = sub * (quote.discount / 100);
  const afterDisc = sub - disc;
  const sst   = afterDisc * (quote.tax / 100);
  const total = afterDisc + sst;

  const paySchedule = buildPaySchedule(total, DEFAULT_SCHEDULE);
  const validUntil  = addDays(quote.created_at, 30);
  const issueDate   = fmtDate(quote.created_at);

  return (
    <Document
      title={`${quote.quote_number} — ${client?.name ?? 'Client'}`}
      author="VOXLAB Creative Agency"
      creator="VOXLAB Platform"
    >

      {/* ── PAGE 1: COVER ─────────────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.coverPage]}>

        <View style={s.coverTop}>
          <Text style={s.coverWordmark}>VOXLAB</Text>
          <Text style={s.coverTagline}>Creative Agency · Kuala Lumpur</Text>
        </View>

        <View style={s.coverBody}>
          <Text style={s.coverQuoteLabel}>Quotation Document</Text>
          <Text style={s.coverProjectTitle}>
            {projectTitle || quote.items[0]?.name || 'Creative Services Proposal'}
          </Text>
          <Text style={s.coverClientName}>Prepared for {client?.name ?? '—'}</Text>

          <View style={s.coverMeta}>
            <View style={s.coverMetaItem}>
              <Text style={s.coverMetaLabel}>Quote Reference</Text>
              <Text style={s.coverMetaValue}>{quote.quote_number}</Text>
            </View>
            <View style={s.coverMetaItem}>
              <Text style={s.coverMetaLabel}>Issue Date</Text>
              <Text style={s.coverMetaValue}>{issueDate}</Text>
            </View>
            <View style={s.coverMetaItem}>
              <Text style={s.coverMetaLabel}>Valid Until</Text>
              <Text style={s.coverMetaValue}>{validUntil}</Text>
            </View>
            <View style={s.coverMetaItem}>
              <Text style={s.coverMetaLabel}>Total (incl. SST)</Text>
              <Text style={[s.coverMetaValue, { color: C.amber }]}>{fmt(total)}</Text>
            </View>
          </View>

          {client?.representative && (
            <View style={{ marginTop: 24 }}>
              <Text style={[s.coverMetaLabel, { marginBottom: 3 }]}>Account Manager</Text>
              <Text style={[s.coverMetaValue]}>{client.representative}</Text>
            </View>
          )}
        </View>

        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>Confidential — prepared exclusively for {client?.name ?? 'the client'}</Text>
          <Text style={s.coverFooterText}>voxlab.co · hello@voxlab.co</Text>
        </View>
      </Page>

      {/* ── PAGE 2: SCOPE OF WORK ─────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.detailPage]}>

        {/* Header */}
        <View style={s.pageHeader}>
          <View>
            <Text style={s.logoSmall}>VOXLAB</Text>
            <Text style={s.logoTagSmall}>CREATIVE AGENCY</Text>
          </View>
          <View style={s.pageHeaderRight}>
            <Text style={s.quoteNumLabel}>Quotation</Text>
            <Text style={s.quoteNum}>{quote.quote_number}</Text>
          </View>
        </View>

        {/* Bill-to + meta */}
        <View style={s.metaRow}>
          <View style={s.metaBox}>
            <Text style={s.metaBoxLabel}>Bill To</Text>
            <Text style={s.metaBoxValue}>{client?.name ?? '—'}</Text>
            <Text style={s.metaBoxSub}>{client?.representative ?? ''}</Text>
            {client?.industry && <Text style={s.metaBoxSub}>{client.industry}</Text>}
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaBoxLabel}>Issue Date</Text>
            <Text style={s.metaBoxValue}>{issueDate}</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaBoxLabel}>Valid Until</Text>
            <Text style={s.metaBoxValue}>{validUntil}</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaBoxLabel}>Currency</Text>
            <Text style={s.metaBoxValue}>MYR (Malaysian Ringgit)</Text>
            <Text style={s.metaBoxSub}>SST {quote.tax}% applicable</Text>
          </View>
        </View>

        {/* Line items table */}
        <Text style={s.tableLabel}>Scope of Work</Text>

        <View style={s.tableHead}>
          <Text style={[s.tableHeadCell, s.colService]}>Service</Text>
          <Text style={[s.tableHeadCell, s.colDesc]}>Description</Text>
          <Text style={[s.tableHeadCell, s.colQty]}>Qty</Text>
          <Text style={[s.tableHeadCell, s.colUnit]}>Unit</Text>
          <Text style={[s.tableHeadCell, s.colPrice]}>Amount</Text>
        </View>

        {quote.items.map((item, idx) => (
          <View key={idx} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
            <View style={s.colService}>
              <Text style={s.cellService}>{item.name || item.description}</Text>
            </View>
            <View style={s.colDesc}>
              <Text style={s.cellDesc}>{item.description}</Text>
            </View>
            <View style={s.colQty}>
              <Text style={[s.cellText, { textAlign: 'center' }]}>{item.qty}</Text>
            </View>
            <View style={s.colUnit}>
              <Text style={s.cellText}>{item.unit || '—'}</Text>
            </View>
            <View style={s.colPrice}>
              <Text style={s.cellPrice}>{fmt(item.qty * item.unitPrice)}</Text>
            </View>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{fmt(sub)}</Text>
            </View>
            {disc > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Discount ({quote.discount}%)</Text>
                <Text style={[s.totalValue, { color: '#ef4444' }]}>- {fmt(disc)}</Text>
              </View>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>SST ({quote.tax}%)</Text>
              <Text style={s.totalValue}>{fmt(sst)}</Text>
            </View>
            <View style={s.totalGrandRow}>
              <Text style={s.totalGrandLabel}>TOTAL DUE</Text>
              <Text style={s.totalGrandValue}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment schedule */}
        <View style={s.paySection}>
          <Text style={s.sectionLabel}>Payment Schedule</Text>
          {paySchedule.map((p, i) => (
            <View key={i} style={s.payRow}>
              <View style={s.payDot} />
              <Text style={s.payText}>{p.label}</Text>
              <Text style={s.payAmt}>{fmt(p.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={s.pageFooter}>
          <Text style={s.footerText}>VOXLAB Creative Agency · hello@voxlab.co · voxlab.co</Text>
          <Text style={s.footerText}>{quote.quote_number} · Page 2 of 3</Text>
        </View>
      </Page>

      {/* ── PAGE 3: TERMS & SIGNATURE ─────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.termsPage]}>

        <View style={s.pageHeader}>
          <View>
            <Text style={s.logoSmall}>VOXLAB</Text>
            <Text style={s.logoTagSmall}>CREATIVE AGENCY</Text>
          </View>
          <View style={s.pageHeaderRight}>
            <Text style={s.quoteNumLabel}>Terms & Conditions</Text>
            <Text style={s.quoteNum}>{quote.quote_number}</Text>
          </View>
        </View>

        <Text style={s.termsTitle}>Terms & Conditions</Text>
        <Text style={s.termsSub}>
          This quotation is valid for 30 days from the issue date. Acceptance of this quotation constitutes agreement to the following terms.
        </Text>

        {[
          {
            title: '1. Scope of Work',
            body: 'The services outlined in this quotation are based on the information provided at the time of quoting. Any changes to the agreed scope may result in revised pricing. All additional work will be agreed in writing prior to commencement.',
          },
          {
            title: '2. Payment Terms',
            body: 'Invoices are due within 14 days of issuance. Late payments may incur a 1.5% monthly interest charge. Work will not commence until the initial deposit (50% of total) has been received. VOXLAB reserves the right to pause work if invoices remain unpaid beyond 30 days.',
          },
          {
            title: '3. Revisions',
            body: 'Each deliverable includes two (2) rounds of revisions unless otherwise specified in the scope. Additional revision rounds will be billed at RM 350 per hour. Revisions must be submitted in writing within 7 days of receiving a draft.',
          },
          {
            title: '4. Intellectual Property',
            body: 'All creative assets, source files, and deliverables become the property of the client upon receipt of full payment. VOXLAB retains the right to display completed work in its portfolio unless the client requests confidentiality in writing.',
          },
          {
            title: '5. Cancellation',
            body: 'Cancellation within 72 hours of project kick-off will incur a 25% cancellation fee. Cancellation after work has commenced will be billed for all work completed to date, plus a 15% administrative fee on the remaining balance.',
          },
          {
            title: '6. Confidentiality',
            body: 'Both parties agree to keep all proprietary information, strategies, and business data shared during the engagement strictly confidential. This obligation survives the termination of this agreement.',
          },
          {
            title: '7. Force Majeure',
            body: 'VOXLAB shall not be liable for delays caused by circumstances beyond its reasonable control, including natural disasters, government actions, or third-party platform outages.',
          },
          {
            title: '8. Governing Law',
            body: 'This agreement is governed by the laws of Malaysia. Any disputes shall be resolved in the courts of Kuala Lumpur, Malaysia.',
          },
        ].map(({ title, body }) => (
          <View key={title} style={s.termsSection}>
            <Text style={s.termsSectionTitle}>{title}</Text>
            <Text style={s.termsBody}>{body}</Text>
          </View>
        ))}

        {/* Signature block */}
        <View style={s.signatureBlock}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Authorised — VOXLAB Creative Agency</Text>
            <Text style={s.sigName}>_______________________________</Text>
            <Text style={s.sigSub}>Signature / Date</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Accepted by — {client?.name ?? 'Client'}</Text>
            <Text style={s.sigName}>_______________________________</Text>
            <Text style={s.sigSub}>Signature / Name / Date</Text>
          </View>
        </View>

        <View style={[s.pageFooter, { marginTop: 20 }]}>
          <Text style={s.footerText}>VOXLAB Creative Agency · hello@voxlab.co · voxlab.co</Text>
          <Text style={s.footerText}>{quote.quote_number} · Page 3 of 3</Text>
        </View>
      </Page>

    </Document>
  );
}
