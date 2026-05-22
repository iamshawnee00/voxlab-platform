import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { campaignId, campaignName, budget, status } = await request.json();

    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;

    // 1. Fetch Auth Tenant Token from Lark Open Platform APIs
    const authResponse = await fetch('[https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal](https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal)', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret
      })
    });
    const authData = await authResponse.json();

    if (authData.code !== 0) {
      return NextResponse.json({ success: false, error: 'Lark Authentication Failure' }, { status: 401 });
    }

    const token = authData.tenant_access_token;

    // 2. Mock base write payload targeting your specified multidimensional table
    const targetTableId = 'tbl_c009A8F'; // Mapped Table ID
    const targetBaseToken = 'bascnN97vYfO6wT0zV5eGf8d9b'; // Map Base Token

    const syncResponse = await fetch(`https://open.larksuite.com/open-apis/bitable/v1/apps/${targetBaseToken}/tables/${targetTableId}/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          "Campaign_ID": campaignId,
          "Campaign_Name": campaignName,
          "Budget_Allocated": parseFloat(budget.replace(/[^0-9.]/g, '')) || 0,
          "Status_Tag": status
        }
      })
    });

    const syncData = await syncResponse.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Successfully synchronized campaign ${campaignId} into Lark Bitable.`,
      larkResponse: syncData
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
