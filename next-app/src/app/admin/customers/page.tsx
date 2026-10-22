'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Mail, Phone, Calendar, ShoppingBag, Search, ExternalLink } from 'lucide-react';

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

function fmtDate(d: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load customers');
        }
        return res.json();
      })
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message || 'Error loading customers.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Registered customer accounts, contact information, and packaging order lifetime values.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-500/20 self-start sm:self-auto">
          {customers.length} Registered Accounts
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-2xs border border-stone-200 dark:border-stone-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, email, or phone number..."
          className="w-full text-xs bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
        />
      </div>

      {/* Customer List Table */}
      {loading ? (
        <div className="bg-white dark:bg-stone-900 p-16 text-center rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs">Loading customer directory…</span>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-stone-900 p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/50 text-red-600 text-xs">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 p-12 text-center rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-xs font-medium">
            {customers.length === 0
              ? 'No registered customers yet. New signups from the website will appear here.'
              : 'No customers match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xs border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Email &amp; Phone</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-center">Orders</th>
                  <th className="px-6 py-3.5 text-right">Lifetime Value</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{c.name}</p>
                          <span className="text-[10px] text-stone-400 font-mono">ID: {c.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && c.phone !== '—' && (
                          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px]">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                      {fmtDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                        <ShoppingBag className="w-3 h-3 text-amber-500" />
                        <span>{c.orderCount}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-stone-900 dark:text-white whitespace-nowrap">
                      GH₵{(c.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders?email=${encodeURIComponent(c.email)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <span>View Orders</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
