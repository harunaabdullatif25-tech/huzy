// src/lib/currency.ts
// Standard Ghanaian Cedi currency constants and helper formatter

export const CURRENCY_CODE = 'GHS';
export const CURRENCY_SYMBOL = 'GH₵';

export function formatGHS(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }
  return `${CURRENCY_SYMBOL}${Number(amount).toFixed(2)}`;
}

export default formatGHS;
