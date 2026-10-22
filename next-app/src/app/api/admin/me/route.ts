import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('admin_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false, admin: null }, { status: 200 });
  }

  // Handle both JWT token format and legacy '1' format
  if (sessionCookie.value === '1') {
    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          email: process.env.ADMIN_EMAIL || 'admin@blossomandbox.com',
          name: 'Administrator',
          role: 'admin',
        },
      },
      { status: 200 }
    );
  }

  const payload = verifyToken(sessionCookie.value);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ authenticated: false, admin: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      admin: {
        email: payload.email,
        name: payload.name || 'Administrator',
        role: 'admin',
      },
    },
    { status: 200 }
  );
}
