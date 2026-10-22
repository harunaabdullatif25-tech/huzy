import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QuoteModel, QuoteStatus } from '@/models/Quote.model';

const ALLOWED_STATUSES: QuoteStatus[] = [
  'new',
  'reviewed',
  'proposal_sent',
  'accepted',
  'rejected',
];

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/quotes/[id] ─────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const { id } = await params;
    const quote = await QuoteModel.findById(id).lean();
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(quote, { status: 200 });
  } catch (error) {
    console.error('[GET /api/quotes/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

// ─── PUT /api/quotes/[id] ─────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    // Only allow updating specific fields to avoid accidental overwrites
    const { status, adminNotes, proposedPrice } = body as {
      status?: QuoteStatus;
      adminNotes?: string;
      proposedPrice?: number;
    };

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const updatePayload: Partial<{ status: QuoteStatus; adminNotes: string; proposedPrice: number }> =
      {};
    if (status !== undefined) updatePayload.status = status;
    if (adminNotes !== undefined) updatePayload.adminNotes = adminNotes;
    if (proposedPrice !== undefined) updatePayload.proposedPrice = proposedPrice;

    const updated = await QuoteModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/quotes/[id]]', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

// ─── DELETE /api/quotes/[id] ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await QuoteModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Quote deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/quotes/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
