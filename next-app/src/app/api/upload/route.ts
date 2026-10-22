// src/app/api/upload/route.ts
// Handles local file and base64 uploads, saving images into public/uploads

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.gif',
]);

function sanitizeExtension(filename: string, mimeType?: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) return ext;
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/svg+xml') return '.svg';
  if (mimeType === 'image/gif') return '.gif';
  return '.jpg';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // 1. Multipart Form Data Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { error: 'No file provided in form data' },
          { status: 400 }
        );
      }

      const blob = file as File;
      const mime = blob.type;
      const originalName = blob.name || 'image.jpg';
      const ext = sanitizeExtension(originalName, mime);

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Max 10MB limit
      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds 10MB limit' },
          { status: 400 }
        );
      }

      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const uniqueFilename = `box-${Date.now()}-${randomSuffix}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFilename}`,
        filename: uniqueFilename,
        size: buffer.length,
      });
    }

    // 2. JSON Base64 or URL Upload
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, filename = 'image.jpg' } = body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json(
          { error: 'Missing dataUrl in request body' },
          { status: 400 }
        );
      }

      // If it's a data URL: data:image/png;base64,iVBORw0...
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const base64Data = matches[2];
        const ext = sanitizeExtension(filename, mime);
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size exceeds 10MB limit' },
            { status: 400 }
          );
        }

        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const uniqueFilename = `box-${Date.now()}-${randomSuffix}${ext}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        await fs.writeFile(filePath, buffer);

        return NextResponse.json({
          success: true,
          url: `/uploads/${uniqueFilename}`,
          filename: uniqueFilename,
          size: buffer.length,
        });
      }

      // If it's already a web URL, return it directly
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/')) {
        return NextResponse.json({
          success: true,
          url: dataUrl,
          filename,
        });
      }

      return NextResponse.json(
        { error: 'Unsupported dataUrl format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unsupported Content-Type. Use multipart/form-data or application/json' },
      { status: 415 }
    );
  } catch (err: any) {
    console.error('Image upload failed:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
