import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('admin_session');

  if (!sessionCookie || !sessionCookie.value) {
    // Fallback to check customer_session if it belongs to an admin
    const customerCookie = req.cookies.get('customer_session');
    if (customerCookie && customerCookie.value) {
      const payload = verifyToken(customerCookie.value);
      if (
        payload &&
        (payload.role === 'admin' ||
          payload.email?.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase())
      ) {
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
    }
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
