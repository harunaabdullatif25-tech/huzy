import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { OrderModel } from '@/models/Order.model';

// ─── GET /api/orders ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const orderNumber = searchParams.get('orderNumber');

    const query: Record<string, any> = {};

    if (email) {
      query['customer.email'] = { $regex: new RegExp(`^${email.trim()}$`, 'i') };
    }

    if (orderNumber) {
      query.orderNumber = orderNumber.trim();
    }

    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ─── POST /api/orders ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Auto-generate a unique order number based on current timestamp
    const orderNumber = `ORD-${Date.now()}`;

    const order = await OrderModel.create({ ...body, orderNumber });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
