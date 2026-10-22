import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QuoteModel } from '@/models/Quote.model';

// ─── GET /api/quotes ──────────────────────────────────────────────────────────

export async function GET() {
  try {
    await dbConnect();
    const quotes = await QuoteModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(quotes, { status: 200 });
  } catch (error) {
    console.error('[GET /api/quotes]', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

// ─── POST /api/quotes ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const quote = await QuoteModel.create(body);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('[POST /api/quotes]', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
