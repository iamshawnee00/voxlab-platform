import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { claimId, personnel, item, amount, date } = await request.json();
    const webhookUrl = process.env.FINANCE_SHEET_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ success: false, error: 'Google Sheet webhook configuration missing' }, { status: 500 });
    }

    // Post to Google Apps Script Deployment URL
    const sheetResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "appendRow",
        sheetName: "Claims Ledger",
        row: [claimId, personnel, item, amount, date, new Date().toISOString()]
      })
    });

    return NextResponse.json({
      success: true,
      message: 'Claim dispatched securely to Finance Google Sheets link successfully.'
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
