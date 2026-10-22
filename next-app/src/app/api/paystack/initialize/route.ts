import { NextRequest, NextResponse } from 'next/server';

// ─── POST /api/paystack/initialize ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Paystack secret key is not configured' },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { email, amount, metadata } = body as {
      email: string;
      amount: number;
      metadata?: Record<string, unknown>;
    };

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'email and amount are required' },
        { status: 400 },
      );
    }

    // Paystack expects amount in pesewas (smallest currency unit: 1 GHS = 100 pesewas)
    const amountInPesewas = Math.round(amount * 100);

    const paystackRes = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountInPesewas,
          currency: 'GHS',
          metadata,
        }),
      },
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok) {
      return NextResponse.json(
        { error: data.message ?? 'Paystack initialization failed' },
        { status: paystackRes.status },
      );
    }

    // data.data contains { authorization_url, access_code, reference }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[POST /api/paystack/initialize]', error);
    return NextResponse.json(
      { error: 'Internal server error during payment initialization' },
      { status: 500 },
    );
  }
}
