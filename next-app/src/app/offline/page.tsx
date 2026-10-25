'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, ShoppingBag, MessageSquare } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none">
        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-6 text-amber-700 dark:text-amber-400">
          <WifiOff className="w-10 h-10" />
        </div>

        <span className="inline-block text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-3 py-1 rounded-full mb-3">
          Offline Mode
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-50 mb-3">
          No Internet Connection
        </h1>

        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-8">
          It looks like you're currently offline. Please check your network or Wi-Fi settings. Previously viewed pages may still be accessible.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleReload}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Home
          </Link>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Need quick help? WhatsApp us at +233 54 834 8121</span>
        </div>
      </div>
    </main>
  );
}
