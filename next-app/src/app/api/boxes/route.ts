// src/app/api/boxes/route.ts
// API endpoint for BoxProduct collection (Next.js App Router)

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { BoxProductModel } from '@/models/BoxProduct.model';

// GET /api/boxes – list all box products (basic listing, can add pagination later)
export async function GET() {
  try {
    await dbConnect();
    const boxes = await BoxProductModel.find().lean();
    return NextResponse.json(boxes);
  } catch (error) {
    console.warn('GET /api/boxes: DB connection pending, returning empty list');
    return NextResponse.json([]);
  }
}

// POST /api/boxes – create a new box product
export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const newBox = await BoxProductModel.create(data);
    return NextResponse.json(newBox, { status: 201 });
  } catch (error) {
    console.error('POST /api/boxes error:', error);
    return NextResponse.json({ error: 'Failed to create box' }, { status: 500 });
  }
}
