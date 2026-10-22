// src/app/dashboard/quotes/page.tsx
// Server component — quotes list

import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { QuoteModel, QuoteStatus } from '@/models/Quote.model';

const STATUS_STYLES: Record<QuoteStatus, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-800/80',
  reviewed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border dark:border-yellow-800/80',
  proposal_sent: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/80',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300 dark:border dark:border-green-800/80',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 dark:border dark:border-red-800/80',
};

function fmt(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  let rawQuotes: any[] = [];
  try {
    await dbConnect();
    rawQuotes = await QuoteModel.find().sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.warn('Quotes page DB unavailable:', err);
  }

  const quotes = rawQuotes.map((q) => ({
    id: String(q._id),
    fullName: q.fullName,
    company: q.company ?? '—',
    boxType: q.boxType,
    quantity: q.quantity,
    status: (q.status as QuoteStatus) || 'new',
    createdAt: q.createdAt ? q.createdAt.toISOString() : '',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Quote Requests</h1>
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{quotes.length} total</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-sm">
          <thead className="bg-stone-50 dark:bg-stone-800/60">
            <tr>
              {['Name', 'Company', 'Box Type', 'Qty', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {quotes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-400 dark:text-stone-500">No quote requests yet.</td>
              </tr>
            )}
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">{q.fullName}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">{q.company}</td>
                <td className="px-4 py-3 text-stone-700 dark:text-stone-300 whitespace-nowrap">{q.boxType}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-center">{q.quantity.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[q.status]}`}>
                    {q.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400 whitespace-nowrap">{fmt(q.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/dashboard/quotes/${q.id}`}
                    className="inline-flex items-center rounded-md border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
