'use client';

import { useCallback, useState } from 'react';
import {
  ALL_TIERS,
  calculateDeliveryFee,
  DeliveryTier,
  tierLabel,
} from '@/lib/deliveryPricing';
import { formatGHS } from '@/lib/currency';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeliveryFeeResult {
  fee: number;
  tier: DeliveryTier;
  multiplier: number;
  leadDays: number;
}

export interface DeliveryFeeCalculatorProps {
  baseRate?: number;
  baseDeliveryRate?: number;
  onFeeCalculated?: (result: DeliveryFeeResult) => void;
  onFeeChange?: (fee: number) => void;
  onDateChange?: (date: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return formatGHS(value);
}

/** Returns today's date as a YYYY-MM-DD string for the <input type="date"> min attribute */
function todayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeliveryFeeCalculator({
  baseRate,
  baseDeliveryRate,
  onFeeCalculated,
  onFeeChange,
  onDateChange,
}: DeliveryFeeCalculatorProps) {
  const effectiveBaseRate = baseRate ?? baseDeliveryRate ?? 35.0;
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [result, setResult] = useState<DeliveryFeeResult | null>(null);
  const today = todayDateString();

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateStr = e.target.value;
      setSelectedDate(dateStr);
      onDateChange?.(dateStr);

      if (!dateStr) {
        setResult(null);
        onFeeChange?.(0);
        return;
      }

      // Parse date string as local time (avoid UTC offset issues)
      const [year, month, day] = dateStr.split('-').map(Number);
      const preferredDate = new Date(year, month - 1, day);
      const calculated = calculateDeliveryFee(effectiveBaseRate, preferredDate);
      setResult(calculated);
      onFeeCalculated?.(calculated);
      onFeeChange?.(calculated.fee);
    },
    [effectiveBaseRate, onFeeCalculated, onFeeChange, onDateChange]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-stone-900 dark:text-white">Delivery Fee Calculator</h2>
      <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
        Select your preferred delivery date to see the applicable fee.
      </p>

      {/* Date picker */}
      <label className="mb-4 flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Preferred Delivery Date</span>
        <input
          type="date"
          value={selectedDate}
          min={today}
          onChange={handleDateChange}
          className="w-full max-w-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
        />
      </label>

      {/* Tier breakdown table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            <tr>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Lead Time</th>
              <th className="px-4 py-3">Multiplier</th>
              <th className="px-4 py-3 text-right">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {ALL_TIERS.map(({ tier, label, multiplier }) => {
              const isSelected = result?.tier === tier;
              const fee = Number((effectiveBaseRate * multiplier).toFixed(2));

              return (
                <tr
                  key={tier}
                  className={
                    isSelected
                      ? 'bg-amber-500/10 font-semibold text-amber-900 dark:text-amber-200'
                      : 'text-stone-700 dark:text-stone-300 even:bg-stone-50 dark:even:bg-stone-800/40'
                  }
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {isSelected && (
                        <span
                          className="inline-block h-2 w-2 rounded-full bg-amber-500"
                          aria-hidden="true"
                        />
                      )}
                      {tierLabel(tier)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{label}</td>
                  <td className="px-4 py-3">×{multiplier.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(fee)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Result summary */}
      {result && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-500 px-5 py-3 text-stone-950 font-bold shadow">
          <div>
            <p className="text-xs font-medium opacity-80">Delivery fee for selected date</p>
            <p className="text-sm font-semibold">{tierLabel(result.tier)}</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(result.fee)}</p>
        </div>
      )}

      {/* Informational note */}
      {!result && (
        <p className="mt-4 text-center text-xs text-stone-400 italic">
          Select your preferred delivery date to see the applicable fee.
        </p>
      )}
    </div>
  );
}
