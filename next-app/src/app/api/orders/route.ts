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

    // The checkout page sends "shippingAddress" but the Order model expects "deliveryAddress".
    // Map it here so both field names work.
    const shippingAddress = body.shippingAddress || body.deliveryAddress || {};
    const customerFullName = body.customer?.fullName || '';

    const deliveryAddress = {
      fullName: shippingAddress.fullName || customerFullName,
      streetAddress: shippingAddress.streetAddress || '',
      apartmentOrUnit: shippingAddress.apartmentOrUnit || '',
      landmarkOrInstructions: shippingAddress.landmarkOrInstructions || '',
      city: shippingAddress.city || 'Not specified',
      stateOrProvince: shippingAddress.stateOrProvince || '',
      postalCode: shippingAddress.postalCode || '',
      countryCode: shippingAddress.countryCode || 'GH',
      digitalAddressGps: shippingAddress.digitalAddressGps || '',
    };

    // Determine delivery tier from the request or default to STANDARD
    const deliveryTier = body.deliveryTier || 'STANDARD';
    const baseDeliveryRate = body.baseDeliveryRate ?? 0;
    const deliveryMultiplier = body.deliveryMultiplier ?? 1;

    const orderData = {
      orderNumber,
      customer: body.customer,
      deliveryAddress,
      items: body.items || [],
      subtotal: body.subtotal ?? 0,
      deliveryFee: body.deliveryFee ?? 0,
      total: body.total ?? 0,
      deliveryTier,
      baseDeliveryRate,
      deliveryMultiplier,
      preferredDeliveryDate: body.preferredDeliveryDate || undefined,
      status: 'pending' as const,
    };

    const order = await OrderModel.create(orderData);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
