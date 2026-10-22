import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/User.model';
import { OrderModel } from '@/models/Order.model';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Verify admin session
    const sessionCookie = req.cookies.get('admin_session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionCookie.value !== '1') {
      const payload = verifyToken(sessionCookie.value);
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await dbConnect();

    const customers = await UserModel.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch order counts and total spent for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await OrderModel.countDocuments({
          'customer.email': { $regex: new RegExp(`^${c.email}$`, 'i') },
        });

        const orders = await OrderModel.find({
          'customer.email': { $regex: new RegExp(`^${c.email}$`, 'i') },
        }).select('total');

        const totalSpent = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);

        return {
          id: String(c._id),
          name: c.name,
          email: c.email,
          phone: c.phone || '—',
          createdAt: c.createdAt,
          orderCount,
          totalSpent,
        };
      })
    );

    return NextResponse.json(customersWithOrders, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/customers]', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
