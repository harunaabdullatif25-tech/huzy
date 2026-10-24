import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User.model';
import { verifyPassword, hashPassword, signToken, ADMIN_CREDENTIALS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both email and password.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = email.toLowerCase().trim();
    let user = await UserModel.findOne({ email: normalizedEmail });

    let isMatch = false;

    // Check if matching configured admin credentials in .env.local
    const isAdminEnv =
      normalizedEmail === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password;

    if (isAdminEnv) {
      isMatch = true;
      if (!user) {
        const hashedPassword = await hashPassword(password);
        user = await UserModel.create({
          name: 'Administrator',
          email: normalizedEmail,
          password: hashedPassword,
          role: 'admin',
        });
      } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    } else if (user && user.password) {
      isMatch = await verifyPassword(password, user.password);
    }

    if (!isMatch || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isAdmin = user.role === 'admin' || normalizedEmail === ADMIN_CREDENTIALS.email;

    // Generate JWT token
    const token = signToken({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      role: isAdmin ? 'admin' : 'customer',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully!',
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: isAdmin ? 'admin' : 'customer',
          address: user.address,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only customer session cookie
    response.cookies.set('customer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // If user is an admin, also set admin_session cookie
    if (isAdmin) {
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
