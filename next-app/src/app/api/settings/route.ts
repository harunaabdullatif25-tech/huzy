// src/app/api/settings/route.ts
// Simple API to read/write platform-wide settings (e.g., base delivery rate)

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SettingsModel } from '@/models/Settings.model';

// GET /api/settings – returns the singleton settings document (creates if missing)
export async function GET() {
  try {
    await dbConnect();
    let settings = await SettingsModel.findOne().lean();
    if (!settings) {
      settings = await SettingsModel.create({}); // uses default baseDeliveryRate
    }
    return NextResponse.json(settings);
  } catch (err) {
    console.warn('GET /api/settings: DB connection pending, using default baseDeliveryRate (GH₵35.00)');
    return NextResponse.json({ baseDeliveryRate: 35.0, isDefault: true });
  }
}

// PUT /api/settings – update settings (expects JSON body, e.g., { baseDeliveryRate: 6 })
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const updated = await SettingsModel.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
