import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User.model';
import { verifyToken, signToken, ADMIN_CREDENTIALS } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('customer_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const payload = verifyToken(sessionCookie.value);
    if (!payload || !payload.userId) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    await dbConnect();
    const user = await UserModel.findById(payload.userId).select('-password').lean();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const isAdmin =
      user.role === 'admin' ||
      user.email?.toLowerCase().trim() === ADMIN_CREDENTIALS.email;

    const response = NextResponse.json(
      {
        authenticated: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: isAdmin ? 'admin' : 'customer',
          address: user.address,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    // If user is an admin, ensure admin_session is also active so they can access /admin immediately
    if (isAdmin) {
      const adminCookie = req.cookies.get('admin_session');
      if (!adminCookie || !adminCookie.value) {
        const adminToken = signToken({
          userId: String(user._id),
          email: user.email,
          name: user.name,
          role: 'admin',
        });
        response.cookies.set('admin_session', adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    }

    return response;
  } catch (error: any) {
    console.error('[GET /api/auth/me]', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
