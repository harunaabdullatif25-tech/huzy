// src/app/dashboard/page.tsx
// Admin dashboard home — Server Component

import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { BoxProductModel } from '@/models/BoxProduct.model';
import { OrderModel } from '@/models/Order.model';
import { QuoteModel } from '@/models/Quote.model';
import { Package, ShoppingCart, ClipboardList, Settings, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    await dbConnect();
    const [totalProducts, totalOrders, newQuotes, pendingOrders] = await Promise.all([
      BoxProductModel.countDocuments(),
      OrderModel.countDocuments(),
      QuoteModel.countDocuments({ status: 'new' }),
      OrderModel.countDocuments({ status: 'pending' }),
    ]);
    return { totalProducts, totalOrders, newQuotes, pendingOrders };
  } catch (err) {
    console.warn('Dashboard DB stats unavailable (check MONGODB_URI):', err);
    return { totalProducts: 0, totalOrders: 0, newQuotes: 0, pendingOrders: 0 };
  }
}

const quickActions = [
  {
    href: '/dashboard/boxes',
    icon: Package,
    label: 'Manage Products',
    description: 'Add, edit, or remove box products and variants.',
  },
  {
    href: '/dashboard/orders',
    icon: ShoppingCart,
    label: 'View Orders',
    description: 'Track and manage customer orders.',
  },
  {
    href: '/dashboard/quotes',
    icon: ClipboardList,
    label: 'Review Quotes',
    description: 'Respond to custom packaging quote requests.',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Platform Settings',
    description: 'Configure delivery rates, branding, and more.',
  },
];

export default async function DashboardPage() {
  const { totalProducts, totalOrders, newQuotes, pendingOrders } = await getStats();

  const statCards = [
    { label: 'Total Products', value: totalProducts },
    { label: 'Total Orders', value: totalOrders },
    { label: 'New Quotes', value: newQuotes },
    { label: 'Pending Orders', value: pendingOrders },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-stone-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Monitor orders, packaging catalog, quotes, and delivery configurations.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs"
          >
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-2 text-3xl font-black text-stone-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col justify-between rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:border-amber-500/50 hover:shadow-md transition-all"
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
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
