'use client';

// src/app/cart/page.tsx
// Shopping cart page — Client Component.

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, effectiveUnitPrice } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import {
  ShoppingCart,
  Package,
  Ruler,
  Palette,
  Tag,
  AlertTriangle,
  Trash2,
  Zap,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-5 text-center px-4 max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-10 h-10 stroke-[1.8] text-stone-900 dark:text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Your cart is empty</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            Looks like you haven&apos;t configured any boxes yet. Browse our catalog to tailor your custom packaging.
          </p>
          <Link
            href="/products"
            className="rounded-xl bg-amber-500 hover:bg-amber-600 px-7 py-3 font-bold text-stone-950 transition-colors shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white">Your Shopping Cart</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Review your custom packaging items and quantities</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
            Min Order: 1 Unit
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart table */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartRow
                key={item.variantSku}
                item={item}
                onQtyChange={(qty) => updateQty(item.variantSku, qty)}
                onRemove={() => removeItem(item.variantSku)}
              />
            ))}
          </div>

          {/* Order summary sidebar */}
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} boxes)</span>
                <span className="font-bold text-stone-900 dark:text-white">GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 dark:text-stone-400">
                <span>Estimated Delivery</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-xs font-semibold">
                <span>Low Minimum MOQ</span>
                <span>Active (from 1 unit)</span>
              </div>
            </div>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 flex justify-between font-black text-stone-900 dark:text-white text-xl">
              <span>Subtotal</span>
              <span className="text-amber-600 dark:text-amber-400">
                GH₵{subtotal.toFixed(2)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 text-center font-bold text-stone-950 shadow-md shadow-amber-500/20 transition-all text-base"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-1.5 w-full text-center text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Individual cart row with qty controls, MOQ check, and bulk badge. */
function CartRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const moq = item.minOrderQuantity ?? 1;
  const belowMoq = item.quantity < moq;

  // Determine if a bulk tier is active
  const activeTier = (() => {
    const tiers = item.bulkPricingTiers ?? [];
    const applicable = tiers
      .filter((t) => item.quantity >= t.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity);
    return applicable.length > 0 ? applicable[0] : null;
  })();

  const unitPrice = effectiveUnitPrice(item);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-300 dark:text-stone-700">
              <Package className="w-8 h-8 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-stone-900 dark:text-white leading-tight truncate max-w-xs">
                {item.title}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{item.variantName}</p>

              {/* Custom Made-To-Order Details */}
              {item.customDimensions && (
                <div className="mt-1.5 flex flex-wrap gap-1 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium border border-stone-200 dark:border-stone-700">
                    <Ruler className="w-3 h-3 text-stone-900 dark:text-white" />
                    {item.customDimensions.length} × {item.customDimensions.width} × {item.customDimensions.height} {item.customDimensions.unit}
                  </span>
                  {item.customColor && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium border border-stone-200 dark:border-stone-700">
                      <Palette className="w-3 h-3 text-stone-900 dark:text-white" />
                      {item.customColor}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove item"
              className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk discount badge */}
          {activeTier && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2.5 py-0.5 text-xs font-bold text-stone-900 dark:text-white">
              <Tag className="w-3 h-3 text-stone-900 dark:text-white" />
              Volume discount active!
            </span>
          )}

          {/* MOQ warning */}
          {belowMoq && (
            <p className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
              Minimum order is {moq} unit{moq > 1 ? 's' : ''}.
            </p>
          )}

          {/* Qty + price row */}
          <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
            {/* Quantity controls */}
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => onQtyChange(Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-sm font-black text-stone-900 dark:text-white hover:bg-amber-500 hover:text-stone-950 transition disabled:opacity-40 flex items-center justify-center shadow-2xs"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => onQtyChange(Math.max(1, Number(e.target.value)))}
                className="w-12 text-center text-sm font-black text-stone-900 dark:text-white bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onQtyChange(item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 text-sm font-black hover:bg-amber-400 transition flex items-center justify-center shadow-2xs"
              >
                +
              </button>
            </div>

            {/* Price info */}
            <div className="text-right">
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">GH₵{unitPrice.toFixed(2)} each</p>
              <p className="font-black text-stone-900 dark:text-white text-base">GH₵{lineTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
