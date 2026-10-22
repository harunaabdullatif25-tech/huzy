// src/app/admin/orders/page.tsx
// Server component — orders list with inline status updater client component

import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { OrderModel, IOrder, OrderStatus } from '@/models/Order.model';
import StatusUpdater from './_components/StatusUpdater';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border dark:border-yellow-800/80',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-800/80',
  processing: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 dark:border dark:border-orange-800/80',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border dark:border-indigo-800/80',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300 dark:border dark:border-green-800/80',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 dark:border dark:border-red-800/80',
};

function fmt(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  let rawOrders: any[] = [];
  try {
    await dbConnect();
    rawOrders = await OrderModel.find().sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.warn('Orders page DB unavailable:', err);
  }

  // Serialize for client boundary crossing
  const orders = rawOrders.map((o) => ({
    id: String(o._id),
    orderNumber: o.orderNumber,
    customerName: o.customer?.fullName ?? '—',
    itemCount: o.items?.length ?? 0,
    total: o.total,
    deliveryTier: o.deliveryTier,
    status: (o.status as OrderStatus) || 'pending',
    createdAt: o.createdAt ? o.createdAt.toISOString() : '',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Orders</h1>
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{orders.length} total</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-sm">
          <thead className="bg-stone-50 dark:bg-stone-800/60">
            <tr>
              {['Order #', 'Customer', 'Items', 'Total', 'Delivery Tier', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone-400 dark:text-stone-500">No orders yet.</td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-stone-700 dark:text-stone-300 whitespace-nowrap font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3 text-stone-900 dark:text-stone-100 whitespace-nowrap font-medium">{o.customerName}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-center">{o.itemCount}</td>
                <td className="px-4 py-3 text-stone-900 dark:text-stone-100 whitespace-nowrap font-bold">GH₵{o.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">{o.deliveryTier.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400 whitespace-nowrap">{fmt(o.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusUpdater orderId={o.id} currentStatus={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
