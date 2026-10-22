import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { BoxProductModel } from '@/models/BoxProduct.model';
import { OrderModel } from '@/models/Order.model';
import { QuoteModel } from '@/models/Quote.model';
import { UserModel } from '@/models/User.model';
import {
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  Settings,
  ArrowRight,
  Plus,
  Clock,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    await dbConnect();
    const [totalProducts, totalOrders, newQuotes, pendingOrders, totalCustomers, allOrders] =
      await Promise.all([
        BoxProductModel.countDocuments(),
        OrderModel.countDocuments(),
        QuoteModel.countDocuments({ status: 'new' }),
        OrderModel.countDocuments({ status: 'pending' }),
        UserModel.countDocuments({ role: 'customer' }),
        OrderModel.find({}).select('total status').lean(),
      ]);

    const totalRevenue = allOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);

    const recentOrders = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentQuotes = await QuoteModel.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      totalProducts,
      totalOrders,
      newQuotes,
      pendingOrders,
      totalCustomers,
      totalRevenue,
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      recentQuotes: JSON.parse(JSON.stringify(recentQuotes)),
    };
  } catch (err) {
    console.warn('Dashboard DB stats unavailable:', err);
    return {
      totalProducts: 0,
      totalOrders: 0,
      newQuotes: 0,
      pendingOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      recentOrders: [],
      recentQuotes: [],
    };
  }
}

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  processing: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  shipped: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
};

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart },
    { label: 'Pending Fulfillment', value: stats.pendingOrders, icon: Clock },
    { label: 'New Custom Quotes', value: stats.newQuotes, icon: ClipboardList },
    { label: 'Registered Customers', value: stats.totalCustomers, icon: Users },
    { label: 'Gross Sales Volume', value: `GH₵${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp },
  ];

  const quickActions = [
    {
      href: '/admin/boxes/create',
      icon: Plus,
      label: 'Add Box Product',
      description: 'Create a new packaging box with MOQ, variants, and colors.',
      highlight: true,
    },
    {
      href: '/admin/boxes',
      icon: Package,
      label: 'Box Catalog',
      description: 'Manage active boxes, pricing matrices, and inventory.',
    },
    {
      href: '/admin/orders',
      icon: ShoppingCart,
      label: 'Orders & Fulfillment',
      description: 'View orders, update dispatch statuses, and check Paystack refs.',
    },
    {
      href: '/admin/quotes',
      icon: ClipboardList,
      label: 'Custom Quotes',
      description: 'Review dimensions, uploaded logos, and send bespoke proposals.',
    },
    {
      href: '/admin/customers',
      icon: Users,
      label: 'Customer Accounts',
      description: 'View registered client profiles and customer order history.',
    },
    {
      href: '/admin/settings',
      icon: Settings,
      label: 'Delivery & Settings',
      description: 'Configure baseline delivery rates and platform parameters.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-white">Admin Operations Panel</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Real-time control center for Blossom&amp;Box orders, inventory, quotes, and customers.
          </p>
        </div>
        <Link
          href="/admin/boxes/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Box Product</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {label}
              </p>
              <Icon className="w-4 h-4 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Operations &amp; Workflows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(({ href, icon: Icon, label, description, highlight }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all ${
                highlight
                  ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500 hover:shadow-md'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-500/40 hover:shadow-md'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-stone-900 dark:text-white flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {label}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders & Recent Quotes Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">Recent Customer Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3 text-stone-900 dark:text-white" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {stats.recentOrders.map((ord: any) => (
                <div key={ord._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-mono font-bold text-stone-900 dark:text-white">{ord.orderNumber}</p>
                    <p className="text-stone-500 dark:text-stone-400">
                      {ord.customer?.fullName || 'Customer'} &bull; {ord.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">GH₵{(ord.total || 0).toFixed(2)}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                        STATUS_BADGES[ord.status] || 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quotes */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">Recent Custom Quotes</h2>
            <Link
              href="/admin/quotes"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3 text-stone-900 dark:text-white" />
            </Link>
          </div>

          {stats.recentQuotes.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 py-6 text-center">No quotes requested yet.</p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {stats.recentQuotes.map((q: any) => (
                <div key={q._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">{q.fullName || 'Client'}</p>
                    <p className="text-stone-500 dark:text-stone-400">
                      {q.boxType || 'Custom Box'} &bull; {q.quantity} pcs
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 capitalize">
                      {q.status || 'new'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
