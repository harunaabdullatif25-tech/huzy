import { NextRequest, NextResponse } from 'next/server';

// ─── POST /api/whatsapp/broadcast ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiToken || !phoneNumberId) {
      return NextResponse.json(
        { error: 'WhatsApp environment variables are not configured' },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { to, message } = body as { to: string[]; message: string };

    if (!Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { error: '"to" must be a non-empty array of phone numbers' },
        { status: 400 },
      );
    }
    if (!message) {
      return NextResponse.json({ error: '"message" is required' }, { status: 400 });
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    let sent = 0;
    let failed = 0;

    // Send messages concurrently for better performance
    await Promise.allSettled(
      to.map(async (recipient) => {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: recipient,
              type: 'text',
              text: { body: message },
            }),
          });

          if (res.ok) {
            sent += 1;
          } else {
            const errData = await res.json().catch(() => ({}));
            console.error(`[WhatsApp] Failed to send to ${recipient}:`, errData);
            failed += 1;
          }
        } catch (err) {
          console.error(`[WhatsApp] Network error for ${recipient}:`, err);
          failed += 1;
        }
      }),
    );

    return NextResponse.json({ sent, failed }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/whatsapp/broadcast]', error);
    return NextResponse.json(
      { error: 'Internal server error during WhatsApp broadcast' },
      { status: 500 },
    );
  }
}
