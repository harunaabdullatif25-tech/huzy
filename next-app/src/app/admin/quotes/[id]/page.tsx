// src/app/admin/quotes/[id]/page.tsx
// 'use client' — Quote detail with admin controls and direct customer WhatsApp button
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QuoteStatus } from '@/models/Quote.model';
import { MessageCircle } from 'lucide-react';

const ALL_STATUSES: QuoteStatus[] = ['new', 'reviewed', 'proposal_sent', 'accepted', 'rejected'];

interface QuoteData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  boxType: string;
  sizingMode?: 'custom_dimensions' | 'vendor_decides';
  contentsDescription?: string;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  quantity: number;
  materialType?: string;
  finishType?: string;
  printingRequirements?: string;
  additionalNotes?: string;
  status: QuoteStatus;
  adminNotes?: string;
  proposedPrice?: number;
  createdAt: string;
}

function Row({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex gap-2 py-2 border-b border-stone-100 dark:border-stone-800/80 last:border-0">
      <dt className="w-44 flex-shrink-0 text-sm font-medium text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="text-sm font-semibold text-stone-900 dark:text-stone-100">{String(value)}</dd>
    </div>
  );
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // admin controls
  const [status, setStatus] = useState<QuoteStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const q: QuoteData = data.quote ?? data;
        setQuote(q);
        setStatus(q.status);
        setAdminNotes(q.adminNotes ?? '');
        setProposedPrice(q.proposedPrice != null ? String(q.proposedPrice) : '');
      })
      .catch(() => setError('Failed to load quote'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes,
          proposedPrice: proposedPrice ? parseFloat(proposedPrice) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch {
      setSaveMsg('Error saving.');
    } finally {
      setSaving(false);
    }
  }

  // Generate direct WhatsApp link to customer's phone number with pre-filled message
  const waUrl = useMemo(() => {
    if (!quote?.phone) return null;
    let digits = quote.phone.replace(/\D/g, '');
    if (!digits) return null;
    // Normalize local Ghanaian 10-digit number (e.g. 024XXXXXXX -> 23324XXXXXXX)
    if (digits.startsWith('0') && digits.length === 10) {
      digits = '233' + digits.slice(1);
    }

    const price = proposedPrice ? `GH₵${proposedPrice}` : '';
    const sizingDetail =
      quote.sizingMode === 'vendor_decides'
        ? `sized to fit "${quote.contentsDescription || 'your items'}"`
        : quote.dimensions?.length
        ? `(${quote.dimensions.length}×${quote.dimensions.width}×${quote.dimensions.height} ${quote.dimensions.unit || 'cm'})`
        : '';

    let message = `Hello ${quote.fullName}, thank you for contacting Blossom&Box regarding your quote request for ${quote.boxType}`;
    if (sizingDetail) message += ` ${sizingDetail}`;
    message += ` (Qty: ${quote.quantity}).`;
    if (price) {
      message += ` Our proposed price is ${price}.`;
    }
    message += ` Please let us know if you would like to proceed or have any questions!`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }, [quote, proposedPrice]);

  const inputCls =
    'block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-xs focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <span className="ml-3 text-stone-600 dark:text-stone-300">Loading…</span>
      </div>
    );
  }

  if (error || !quote) {
    return <p className="text-red-600 dark:text-red-400 py-8">{error || 'Quote not found.'}</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Quote Detail</h1>
        <Link href="/admin/quotes" className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">← Back to Quotes</Link>
      </div>

      {/* ── Read-only customer details ── */}
      <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs">
        <h2 className="mb-4 text-base font-semibold text-stone-900 dark:text-white">Customer Information</h2>
        <dl>
          <Row label="Name" value={quote.fullName} />
          <Row label="Email" value={quote.email} />
          <div className="flex gap-2 py-2 border-b border-stone-100 dark:border-stone-800/80 last:border-0">
            <dt className="w-44 flex-shrink-0 text-sm font-medium text-stone-500 dark:text-stone-400">Phone / WhatsApp</dt>
            <dd className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <span>{quote.phone || 'Not provided'}</span>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </a>
              )}
            </dd>
          </div>
          <Row label="Company" value={quote.company} />
          <Row label="Submitted" value={new Date(quote.createdAt).toLocaleString()} />
        </dl>
      </section>

      {/* ── Quote details ── */}
      <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs">
        <h2 className="mb-4 text-base font-semibold text-stone-900 dark:text-white">Quote Details</h2>
        <dl>
          <Row label="Box Type" value={quote.boxType} />
          <Row
            label="Sizing Mode"
            value={
              quote.sizingMode === 'vendor_decides'
                ? 'Vendor to Decide (Customer Described Contents)'
                : 'Customer Specified Dimensions'
            }
          />
          {quote.sizingMode === 'vendor_decides' ? (
            <Row label="Contents to Fit" value={quote.contentsDescription || 'Not specified'} />
          ) : (
            <Row
              label="Dimensions"
              value={
                quote.dimensions?.length
                  ? `${quote.dimensions.length} × ${quote.dimensions.width} × ${quote.dimensions.height} ${quote.dimensions.unit || 'cm'}`
                  : 'Custom Dimensions'
              }
            />
          )}
          <Row label="Quantity" value={quote.quantity.toLocaleString()} />
          <Row label="Material Type" value={quote.materialType} />
          <Row label="Finish Type" value={quote.finishType} />
          <Row label="Color / Specifications" value={quote.printingRequirements} />
          <Row label="Additional Notes" value={quote.additionalNotes} />
        </dl>
      </section>

      {/* ── Admin controls ── */}
      <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">Admin Controls</h2>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Status</label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Admin Notes</label>
          <textarea
            className={`${inputCls} min-h-[100px]`}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes about this quote…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Proposed Price (GH₵)</label>
          <input
            className={inputCls}
            type="number"
            step="0.01"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:shadow transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:shadow flex items-center gap-2 transition"
              title={`Open WhatsApp chat with ${quote.phone}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on Customer&apos;s WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-lg bg-stone-200 dark:bg-stone-800 px-5 py-2.5 text-sm font-medium text-stone-400 dark:text-stone-500 flex items-center gap-2 cursor-not-allowed"
              title="Customer did not provide a phone number"
            >
              <MessageCircle className="w-4 h-4" />
              <span>No WhatsApp Number Provided</span>
            </button>
          )}

          {saveMsg && <span className="text-sm font-medium text-stone-600 dark:text-stone-300">{saveMsg}</span>}
        </div>
      </section>
    </div>
  );
}
