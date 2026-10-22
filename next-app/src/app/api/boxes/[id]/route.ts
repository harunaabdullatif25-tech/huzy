import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BoxProductModel from '@/models/BoxProduct.model';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/boxes/[id]
 * Returns a single box product by its MongoDB ObjectId.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    const box = await BoxProductModel.findById(id).lean();

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json(box, { status: 200 });
  } catch (error) {
    console.error('[GET /api/boxes/:id]', error);
    return NextResponse.json(
      { error: 'Failed to fetch box' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/boxes/[id]
 * Updates a single box product by its MongoDB ObjectId.
 * Only fields present in the request body are updated ($set).
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    const body: Record<string, unknown> = await request.json();

    const updated = await BoxProductModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/boxes/:id]', error);
    return NextResponse.json(
      { error: 'Failed to update box' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/boxes/[id]
 * Deletes a single box product by its MongoDB ObjectId.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await BoxProductModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Box deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE /api/boxes/:id]', error);
    return NextResponse.json(
      { error: 'Failed to delete box' },
      { status: 500 },
    );
  }
}
