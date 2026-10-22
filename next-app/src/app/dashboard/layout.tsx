import React from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4 stroke-[2.4]" />
                </span>
                <span>Blossom&amp;Box</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 rounded-full border border-amber-500/30">
                  Admin
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/boxes"
                className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              >
                Products &amp; Variants
              </Link>
              <Link
                href="/dashboard/orders"
                className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              >
                Orders
              </Link>
              <Link
                href="/dashboard/quotes"
                className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              >
                Quotes &amp; Proposals
              </Link>
              <Link
                href="/dashboard/settings"
                className="px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              >
                Delivery &amp; Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <span>View Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
