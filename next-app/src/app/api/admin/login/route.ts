import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User.model';
import { ADMIN_CREDENTIALS, hashPassword, verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const inputEmail = email.toLowerCase().trim();
    const configuredEmail = ADMIN_CREDENTIALS.email;
    const configuredPassword = ADMIN_CREDENTIALS.password;

    let isMatch = false;
    let adminName = 'Administrator';

    // 1. Direct environment variable check
    if (inputEmail === configuredEmail && password === configuredPassword) {
      isMatch = true;
    } else {
      // 2. Check in database for an admin role user
      try {
        await dbConnect();
        const dbAdmin = await UserModel.findOne({ email: inputEmail, role: 'admin' });
        if (dbAdmin && dbAdmin.password) {
          const passValid = await verifyPassword(password, dbAdmin.password);
          if (passValid) {
            isMatch = true;
            adminName = dbAdmin.name || 'Administrator';
          }
        }
      } catch (dbErr) {
        console.warn('DB check for admin skipped/failed:', dbErr);
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid admin email or password.' },
        { status: 401 }
      );
    }

    // Ensure admin user exists in DB for foreign key / tracking if possible
    try {
      await dbConnect();
      const existing = await UserModel.findOne({ email: inputEmail });
      if (!existing) {
        const hashedPassword = await hashPassword(password);
        await UserModel.create({
          name: adminName,
          email: inputEmail,
          password: hashedPassword,
          role: 'admin',
        });
      }
    } catch (e) {
      // Ignore background sync errors
    }

    const token = signToken({
      userId: 'admin-root',
      email: inputEmail,
      name: adminName,
      role: 'admin',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Admin authentication successful.',
        admin: {
          email: inputEmail,
          name: adminName,
          role: 'admin',
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only admin session cookie
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[POST /api/admin/login]', error);
    return NextResponse.json(
      { error: error?.message || 'Admin login failed.' },
      { status: 500 }
    );
  }
}
