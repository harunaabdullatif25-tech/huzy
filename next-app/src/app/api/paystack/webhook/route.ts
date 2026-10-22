import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import { OrderModel } from '@/models/Order.model';

// ─── POST /api/paystack/webhook ──────────────────────────────────────────────
// Paystack requires raw body for HMAC verification — Next.js App Router
// provides the body as a ReadableStream which we read as text below.

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Read raw body text for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }

    // Verify HMAC-SHA512 signature
    const expectedHash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (expectedHash !== signature) {
      console.warn('[Paystack Webhook] Signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the verified payload
    const event = JSON.parse(rawBody) as {
      event: string;
      data: { reference: string; [key: string]: unknown };
    };

    // Handle successful charge events
    if (event.event === 'charge.success') {
      const { reference } = event.data;

      await dbConnect();

      const order = await OrderModel.findOne({ paystackReference: reference });
      if (order) {
        order.status = 'paid';
        await order.save();
        console.log(`[Paystack Webhook] Order ${order.orderNumber} marked as paid`);
      } else {
        console.warn(`[Paystack Webhook] No order found for reference: ${reference}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/paystack/webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
