'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const C = {
  black: '#111111',
  ink: '#1f2937',
  muted: '#64748b',
  line: '#d9dde3',
  soft: '#f4f4f2',
  amber: '#d97706',
  white: '#ffffff',
};

const s = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.ink,
    backgroundColor: C.white,
  },
  coverBand: {
    backgroundColor: C.black,
    color: C.white,
    padding: '16 18',
    marginBottom: 14,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    letterSpacing: 4,
  },
  titleBlock: {
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 17,
    color: C.black,
  },
  subtitle: {
    color: C.muted,
    marginTop: 4,
    lineHeight: 1.4,
  },
  grid3: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  box: {
    flex: 1,
    border: `1 solid ${C.line}`,
    padding: 9,
    minHeight: 70,
  },
  boxLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: C.amber,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  metaRow: {
    marginBottom: 4,
  },
  metaLabel: {
    color: C.muted,
    fontSize: 6.5,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    marginTop: 1,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingTop: 8,
    borderTop: `1 solid ${C.line}`,
  },
  paragraph: {
    color: C.ink,
    lineHeight: 1.45,
    marginBottom: 10,
  },
  tableHead: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: C.black,
    color: C.white,
    padding: '6 5',
  },
  tableHeadText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    textTransform: 'uppercase',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: `1 solid ${C.line}`,
    padding: '7 5',
    minHeight: 32,
  },
  altRow: {
    backgroundColor: C.soft,
  },
  noCol: { width: '5%' },
  scopeCol: { width: '18%' },
  descCol: { width: '27%' },
  qtyCol: { width: '6%', textAlign: 'center' },
  unitCol: { width: '9%' },
  priceCol: { width: '11%', textAlign: 'right' },
  discCol: { width: '10%', textAlign: 'right' },
  amountCol: { width: '14%', textAlign: 'right' },
  remarksCol: { width: '18%' },
  cellBold: {
    fontFamily: 'Helvetica-Bold',
    color: C.black,
    lineHeight: 1.35,
  },
  cell: {
    lineHeight: 1.35,
    color: C.ink,
  },
  totals: {
    width: 190,
    alignSelf: 'flex-end',
    marginTop: 10,
    border: `1 solid ${C.line}`,
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '6 8',
    borderBottom: `1 solid ${C.line}`,
  },
  grandRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '8 8',
    backgroundColor: C.black,
  },
  grandText: {
    color: C.white,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  grandValue: {
    color: '#fbbf24',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  note: {
    marginTop: 10,
    padding: 8,
    backgroundColor: C.soft,
    color: C.muted,
    lineHeight: 1.4,
  },
  detailTableHead: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: C.black,
    color: C.white,
    padding: '6 5',
    marginTop: 6,
  },
  phaseCol: { width: '16%' },
  workCol: { width: '18%' },
  faceCol: { width: '29%' },
  deliverCol: { width: '22%' },
  inputCol: { width: '15%' },
  payMilestoneCol: { width: '24%' },
  payTriggerCol: { width: '30%' },
  payPctCol: { width: '12%', textAlign: 'right' },
  payAmountCol: { width: '18%', textAlign: 'right' },
  payDueCol: { width: '16%' },
  termsRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: `1 solid ${C.line}`,
    padding: '6 5',
  },
  termsNo: { width: '6%', fontFamily: 'Helvetica-Bold' },
  termsTitle: { width: '24%', fontFamily: 'Helvetica-Bold' },
  termsBody: { width: '70%', lineHeight: 1.35 },
  signatureGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    marginTop: 18,
  },
  signatureBox: {
    flex: 1,
    minHeight: 76,
    border: `1 solid ${C.line}`,
    padding: 10,
  },
  signatureLine: {
    marginTop: 24,
    borderTop: `1 solid ${C.black}`,
    paddingTop: 5,
    color: C.muted,
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 28,
    right: 28,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: C.muted,
    fontSize: 7,
    borderTop: `1 solid ${C.line}`,
    paddingTop: 6,
  },
});

const fmt = (n) =>
  'RM ' + Number(n || 0).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-GB');
}

function calcTotals(items, tax) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const discount = items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = taxable * ((parseFloat(tax) || 0) / 100);
  return { subtotal, discount, taxAmount, total: taxable + taxAmount };
}

function paymentRows(total, createdAt) {
  return [
    { milestone: 'Deposit', trigger: 'Upon quotation approval / project start', pct: 30, amount: total * 0.3, due: createdAt },
    { milestone: 'First Month', trigger: 'End of first month work', pct: 30, amount: total * 0.3, due: addDays(createdAt, 30) },
    { milestone: 'Balance', trigger: 'Final milestone / handover', pct: 40, amount: total * 0.4, due: addDays(createdAt, 90) },
  ];
}

const scopeDetails = [
  ['Marketing Restructure', 'Discovery & Direction', 'Understand the brand, market position, audience, campaign goal, and conversion path.', 'Brand brief, campaign angle, content pillars', 'Brand assets, references'],
  ['Marketing Restructure', 'Campaign Curation', 'Translate campaign direction into a branded storyline executed by phase.', 'Moodboard, visual reference, sample direction', 'Approval on direction'],
  ['Asset Management', 'Creative Production', 'Plan and produce approved photo, video, short-form, and design assets.', 'Shot list, raw capture, edited assets', 'Products, venue, spokesperson'],
  ['Ads Management', 'Ads & Growth', 'Set up, monitor, and optimise paid campaigns based on approved budget and audience.', 'Campaign setup, testing, optimisation notes', 'Ad account access, budget approval'],
  ['Reporting', 'Performance Snapshot', 'Summarise campaign activity, learnings, and next-step recommendation.', 'Campaign recap and report', 'Review session'],
];

const terms = [
  ['Quotation Validity', 'This quotation is valid until the date stated in the quote snapshot. Pricing and availability may be revised after expiry.'],
  ['Scope Control', 'Any work outside the approved scope will be quoted separately or confirmed as an add-on before execution.'],
  ['Revision Policy', 'Two rounds of revision are included for each major creative deliverable unless stated otherwise. Additional revisions may affect timeline and cost.'],
  ['Third-Party Cost', 'Media spend, venue rental, printing, talent, KOL, props, travel, licensing, and other third-party costs are excluded unless specifically listed.'],
  ['Payment Terms', 'Project commencement requires the first payment milestone. Final files and campaign handover are released after the balance milestone.'],
  ['Approval Timeline', 'Client approval delays may shift the agreed timeline. VOXLAB will advise impact when changes occur.'],
  ['Usage & Ownership', 'Final approved creative assets are available for the agreed campaign use. Raw files, working files, and unused concepts remain VOXLAB property unless purchased separately.'],
];

export default function QuotePDF({ quote, client, projectTitle }) {
  const totals = calcTotals(quote.items, quote.tax);
  const validUntil = addDays(quote.created_at, 30);
  const versionLabel = quote.version ? `V${quote.version}` : 'V1';

  return (
    <Document
      title={`${quote.quote_number} ${versionLabel} - ${client?.name ?? 'Client'}`}
      author="VOXLAB"
      creator="VOXLAB Platform"
    >
      <Page size="A4" style={s.page}>
        <View style={s.coverBand}>
          <View>
            <Text style={s.logo}>VOXLAB</Text>
            <Text style={{ color: '#fbbf24', letterSpacing: 2, marginTop: 4 }}>CREATIVE AGENCY</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11 }}>CLIENT QUOTATION</Text>
            <Text style={{ color: '#d1d5db', marginTop: 4 }}>{quote.quote_number} / {versionLabel}</Text>
          </View>
        </View>

        <View style={s.titleBlock}>
          <Text style={s.title}>{projectTitle || quote.projectTitle || 'Marketing Campaign'}</Text>
          <Text style={s.subtitle}>
            A clear proposal-style quotation for scope alignment, campaign approval, and next-step commitment.
          </Text>
        </View>

        <View style={s.grid3}>
          <View style={s.box}>
            <Text style={s.boxLabel}>Client Details</Text>
            <Meta label="Client / Brand" value={client?.name || '-'} />
            <Meta label="Contact Person" value={client?.representative || '-'} />
            <Meta label="Prepared By" value={quote.preparedBy || 'VOXLAB'} />
          </View>
          <View style={s.box}>
            <Text style={s.boxLabel}>Project Details</Text>
            <Meta label="Project Type" value={quote.projectType || 'Marketing Campaign'} />
            <Meta label="Campaign Period" value={quote.campaignPeriod || '-'} />
            <Meta label="Primary Platform" value={quote.primaryPlatform || '-'} />
          </View>
          <View style={s.box}>
            <Text style={s.boxLabel}>Quote Snapshot</Text>
            <Meta label="Prepared Date" value={quote.created_at} />
            <Meta label="Valid Until" value={validUntil} />
            <Meta label="Version" value={versionLabel} />
            <Meta label="Payment Terms" value="30% / 30% / 40%" />
          </View>
        </View>

        <Text style={s.sectionTitle}>Concept Direction</Text>
        <Text style={s.paragraph}>{quote.conceptDirection || 'VOXLAB connects creative concept with commercial scope so the client understands what will be done, what will be delivered, and how the investment is structured.'}</Text>

        <Text style={s.sectionTitle}>Scope & Investment</Text>
        <View style={s.tableHead}>
          <Text style={[s.tableHeadText, s.noCol]}>No.</Text>
          <Text style={[s.tableHeadText, s.scopeCol]}>Scope</Text>
          <Text style={[s.tableHeadText, s.descCol]}>Description</Text>
          <Text style={[s.tableHeadText, s.qtyCol]}>Qty</Text>
          <Text style={[s.tableHeadText, s.unitCol]}>Unit</Text>
          <Text style={[s.tableHeadText, s.priceCol]}>Unit Price</Text>
          <Text style={[s.tableHeadText, s.discCol]}>Discount</Text>
          <Text style={[s.tableHeadText, s.amountCol]}>Amount</Text>
        </View>

        {quote.items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={[s.row, index % 2 === 1 ? s.altRow : {}]} wrap={false}>
            <Text style={[s.cell, s.noCol]}>{index + 1}</Text>
            <Text style={[s.cellBold, s.scopeCol]}>{item.name}</Text>
            <Text style={[s.cell, s.descCol]}>{item.description}</Text>
            <Text style={[s.cell, s.qtyCol]}>{item.qty}</Text>
            <Text style={[s.cell, s.unitCol]}>{item.unit}</Text>
            <Text style={[s.cell, s.priceCol]}>{fmt(item.unitPrice)}</Text>
            <Text style={[s.cell, s.discCol]}>{fmt(item.discount || 0)}</Text>
            <Text style={[s.cellBold, s.amountCol]}>{fmt(item.qty * item.unitPrice - (item.discount || 0))}</Text>
          </View>
        ))}

        <View style={s.totals}>
          <View style={s.totalRow}><Text>Subtotal</Text><Text>{fmt(totals.subtotal)}</Text></View>
          <View style={s.totalRow}><Text>Discount</Text><Text>- {fmt(totals.discount)}</Text></View>
          <View style={s.totalRow}><Text>SST / Tax ({quote.tax || 0}%)</Text><Text>{fmt(totals.taxAmount)}</Text></View>
          <View style={s.grandRow}><Text style={s.grandText}>Total Investment</Text><Text style={s.grandValue}>{fmt(totals.total)}</Text></View>
        </View>

        <Text style={s.note}>
          Approval note: This quotation becomes active once approved and the first payment milestone is received. Detailed scope notes, payment schedule, and terms are included on the following page.
        </Text>

        <Footer left="VOXLAB - Client Quotation" right="Page 1 of 2" />
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.coverBand}>
          <Text style={s.logo}>VOXLAB</Text>
          <Text style={{ color: '#fbbf24', fontFamily: 'Helvetica-Bold' }}>Scope Details / Terms / Acceptance</Text>
        </View>

        <Text style={s.sectionTitle}>Scope Details</Text>
        <View style={s.detailTableHead}>
          <Text style={[s.tableHeadText, s.phaseCol]}>Phase</Text>
          <Text style={[s.tableHeadText, s.workCol]}>Workstream</Text>
          <Text style={[s.tableHeadText, s.faceCol]}>Client-Facing Description</Text>
          <Text style={[s.tableHeadText, s.deliverCol]}>Key Deliverables</Text>
          <Text style={[s.tableHeadText, s.inputCol]}>Client Input</Text>
        </View>
        {scopeDetails.map((row, index) => (
          <View key={row[1]} style={[s.row, index % 2 === 1 ? s.altRow : {}]} wrap={false}>
            <Text style={[s.cellBold, s.phaseCol]}>{row[0]}</Text>
            <Text style={[s.cell, s.workCol]}>{row[1]}</Text>
            <Text style={[s.cell, s.faceCol]}>{row[2]}</Text>
            <Text style={[s.cell, s.deliverCol]}>{row[3]}</Text>
            <Text style={[s.cell, s.inputCol]}>{row[4]}</Text>
          </View>
        ))}

        <Text style={s.sectionTitle}>Timeline & Payment</Text>
        <View style={s.detailTableHead}>
          <Text style={[s.tableHeadText, s.payMilestoneCol]}>Milestone</Text>
          <Text style={[s.tableHeadText, s.payTriggerCol]}>Payment Trigger</Text>
          <Text style={[s.tableHeadText, s.payPctCol]}>%</Text>
          <Text style={[s.tableHeadText, s.payAmountCol]}>Amount</Text>
          <Text style={[s.tableHeadText, s.payDueCol]}>Due Date</Text>
        </View>
        {paymentRows(totals.total, quote.created_at).map((row, index) => (
          <View key={row.milestone} style={[s.row, index % 2 === 1 ? s.altRow : {}]} wrap={false}>
            <Text style={[s.cellBold, s.payMilestoneCol]}>{row.milestone}</Text>
            <Text style={[s.cell, s.payTriggerCol]}>{row.trigger}</Text>
            <Text style={[s.cell, s.payPctCol]}>{row.pct}%</Text>
            <Text style={[s.cellBold, s.payAmountCol]}>{fmt(row.amount)}</Text>
            <Text style={[s.cell, s.payDueCol]}>{row.due}</Text>
          </View>
        ))}

        <Text style={s.sectionTitle}>Terms & Acceptance</Text>
        {terms.map((term, index) => (
          <View key={term[0]} style={s.termsRow} wrap={false}>
            <Text style={s.termsNo}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={s.termsTitle}>{term[0]}</Text>
            <Text style={s.termsBody}>{term[1]}</Text>
          </View>
        ))}

        <View style={s.signatureGrid}>
          <View style={s.signatureBox}>
            <Text style={s.boxLabel}>Client Acceptance</Text>
            <Meta label="Client / Company Name" value={client?.name || '-'} />
            <Text style={s.signatureLine}>Signature / Name / Date</Text>
          </View>
          <View style={s.signatureBox}>
            <Text style={s.boxLabel}>VOXLAB Representative</Text>
            <Meta label="Prepared By" value={quote.preparedBy || 'VOXLAB'} />
            <Text style={s.signatureLine}>Signature / Name / Date</Text>
          </View>
        </View>

        <Footer left="VOXLAB - Scope Details / Terms & Acceptance" right="Page 2 of 2" />
      </Page>
    </Document>
  );
}

function Meta({ label, value }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function Footer({ left, right }) {
  return (
    <View style={s.footer}>
      <Text>{left}</Text>
      <Text>{right}</Text>
    </View>
  );
}
