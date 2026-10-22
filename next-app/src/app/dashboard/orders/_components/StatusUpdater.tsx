// src/app/dashboard/orders/_components/StatusUpdater.tsx
// 'use client' — inline order status dropdown that PUTs to the API
'use client';

import React, { useState } from 'react';
import { OrderStatus } from '@/models/Order.model';

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function StatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Update failed');
      setStatus(next);
    } catch {
      setError('Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-2.5 py-1 text-xs text-stone-800 dark:text-stone-200 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none disabled:opacity-50 capitalize shadow-2xs transition-colors"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{s}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-stone-400">…</span>}
      {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
}
