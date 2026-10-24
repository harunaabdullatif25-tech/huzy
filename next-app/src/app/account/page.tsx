'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart, CartItem } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  RotateCcw,
  Package,
  ArrowRight,
  User,
  Mail,
  Phone,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  Clock,
  CheckCircle,
  Truck,
  Box,
  ShieldCheck,
} from 'lucide-react';

interface OrderItemData {
  productId: string;
  variantSku: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItemData[];
  total: number;
  status: string;
  deliveryTier?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30',
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  processing: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  shipped: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
  delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30',
};

function fmt(d: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AccountPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, loading: authLoading, logout } = useCustomerAuth();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');

  // Guest lookup state
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupResult, setLookupResult] = useState<OrderData | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.email) {
      setLoadingOrders(true);
      fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
        .then((r) => r.json())
        .then((data) => {
          setOrders(Array.isArray(data) ? data : (data.orders ?? []));
        })
        .catch(() => setError('Failed to load your orders.'))
        .finally(() => setLoadingOrders(false));
    }
  }, [user, authLoading]);

  const handleReorder = (order: OrderData) => {
    order.items.forEach((item) => {
      const cartItem: CartItem = {
        productId: item.productId,
        variantSku: item.variantSku,
        variantName: item.variantName,
        title: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      };
      addItem(cartItem);
    });
    router.push('/cart');
  };

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    if (!lookupOrderNumber.trim()) {
      setLookupError('Please enter an order number.');
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(lookupOrderNumber.trim())}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLookupResult(data[0]);
      } else {
        setLookupError(`No order found matching "${lookupOrderNumber}".`);
      }
    } catch {
      setLookupError('Could not verify order. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <span className="ml-3 text-stone-600 dark:text-stone-400 text-sm">Loading your account…</span>
      </div>
    );
  }

  // If user is not logged in, show login prompt & guest order lookup
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 transition-colors">
        <div className="mx-auto max-w-4xl px-4 space-y-10">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-stone-900 dark:text-white flex items-center justify-center mx-auto border border-amber-500/30">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white">Customer Account &amp; Orders</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Sign in to access your order history, save delivery addresses, and reorder custom packaging in one click.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/login?redirect=/account"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup?redirect=/account"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create an Account</span>
              </Link>
            </div>
          </div>

          {/* Guest Order Lookup Card */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-2xs max-w-xl mx-auto">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-amber-500" />
              <span>Track Guest Order</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Placed an order as a guest? Enter your Order Number below to check the real-time fulfillment status.
            </p>

            <form onSubmit={handleGuestLookup} className="flex gap-2 mb-4">
              <input
                type="text"
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value)}
                placeholder="e.g. ORD-1729000000"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {lookupLoading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {lookupError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-3">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="mt-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{lookupResult.orderNumber}</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[lookupResult.status] ?? 'bg-stone-100 text-stone-700'}`}>
                    {lookupResult.status}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Date: {fmt(lookupResult.createdAt)}</span>
                  <span>Items: {lookupResult.items?.length || 0}</span>
                  <span className="font-bold text-stone-900 dark:text-white">Total: GH₵{lookupResult.total.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReorder(lookupResult)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 text-stone-950 font-bold flex items-center justify-center gap-1.5 hover:bg-amber-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder This Packaging</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User is logged in: show Customer Dashboard
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 transition-colors">
      <div className="mx-auto max-w-5xl px-4 space-y-8">
        {/* Customer / Admin Profile Banner */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">{user.name}</h1>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-2xs'
                      : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20'
                  }`}
                >
                  {isAdmin ? 'Administrator' : 'Customer'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 mt-1">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition shadow-sm w-full sm:w-auto justify-center"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Go to Admin Panel</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition w-full sm:w-auto justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Administrator Callout Banner if user is Admin */}
        {isAdmin && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-black text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Administrator Workspace Access</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                You are currently viewing the customer order history. To manage the box catalog, process customer orders, review quotes, or update store settings, switch to the Admin Control Panel.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-black hover:bg-amber-500 hover:text-stone-950 dark:hover:bg-amber-400 transition shrink-0 shadow-sm"
            >
              <span>Launch Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Orders Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">Your Orders &amp; Reorders</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Review your packaging orders and reorder your configurations with one click.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-300">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {loadingOrders ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <span className="ml-2.5 text-stone-500 text-xs">Loading orders…</span>
          </div>
        ) : error ? (
          <p className="py-8 text-center text-red-600 text-sm">{error}</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-stone-600 dark:text-stone-300 font-medium">No previous orders found for {user.email}.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-bold text-stone-950 transition-colors shadow-sm"
            >
              <span>Explore Box Catalog</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-sm">
              <thead className="bg-stone-100/60 dark:bg-stone-800/60">
                <tr>
                  {['Order #', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">{fmt(o.createdAt)}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-center">{o.items.length}</td>
                    <td className="px-4 py-3 font-bold text-stone-900 dark:text-white whitespace-nowrap">GH₵{o.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[o.status] ?? 'bg-stone-100 text-stone-700'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleReorder(o)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500 hover:text-stone-950 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
