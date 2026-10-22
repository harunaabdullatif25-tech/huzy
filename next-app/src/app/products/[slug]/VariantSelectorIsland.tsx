'use client';

// src/app/products/[slug]/VariantSelectorIsland.tsx
// Interactive Custom Made-To-Order Box Configurator.

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { IBoxVariant } from '@/models/BoxProduct.model';
import {
  Package,
  Ruler,
  Palette,
  Percent,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  variants: IBoxVariant[];
  productId: string;
  productTitle: string;
  productSlug: string;
  defaultMoq: number;
}

interface ColorOption {
  name: string;
  hex: string;
}

const COLOR_PALETTE: ColorOption[] = [
  { name: 'Royal Gold', hex: '#d4af37' },
  { name: 'Natural Kraft', hex: '#d97706' },
  { name: 'Crisp White', hex: '#f8fafc' },
  { name: 'Midnight Noir', hex: '#18181b' },
  { name: 'Warm Terracotta', hex: '#c2410c' },
  { name: 'Champagne Sand', hex: '#e2d9cc' },
  { name: 'Forest Sage', hex: '#34d399' },
  { name: 'Pastel Blush', hex: '#f472b6' },
];

export default function VariantSelectorIsland({
  variants,
  productId,
  productTitle,
  productSlug,
  defaultMoq,
}: Props) {
  const { addItem } = useCart();

  // Initial defaults based on available variant or starter size
  const firstVariant = variants.find((v) => v.isAvailable) ?? variants[0];
  const initialOuter = firstVariant?.dimensions?.outer?.cm ?? { length: 25, width: 18, height: 8 };

  // ── Dimension State ────────────────────────────────────────────────────────
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [length, setLength] = useState<string>(String(initialOuter.length || 25));
  const [width, setWidth] = useState<string>(String(initialOuter.width || 18));
  const [height, setHeight] = useState<string>(String(initialOuter.height || 8));

  // ── Color State ────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PALETTE[0].name);
  const [customColorInput, setCustomColorInput] = useState<string>('');

  // ── Quantity & Add Feedback ────────────────────────────────────────────────
  const [qty, setQty] = useState<number>(Math.max(1, defaultMoq || 1));
  const [added, setAdded] = useState(false);

  // Quick preset sizes
  const STARTER_PRESETS = [
    { label: 'Small Gift / Jewelry', l: 18, w: 12, h: 5 },
    { label: 'Medium Apparel / Beauty', l: 26, w: 18, h: 8 },
    { label: 'Standard E-Commerce', l: 32, w: 22, h: 10 },
    { label: 'Large Shipping / Storage', l: 40, w: 30, h: 15 },
  ];

  const handleApplyPreset = (p: { l: number; w: number; h: number }) => {
    if (unit === 'cm') {
      setLength(String(p.l));
      setWidth(String(p.w));
      setHeight(String(p.h));
    } else {
      setLength((p.l * 0.3937).toFixed(1));
      setWidth((p.w * 0.3937).toFixed(1));
      setHeight((p.h * 0.3937).toFixed(1));
    }
  };

  // ── Dynamic Pricing Calculation ────────────────────────────────────────────
  const pricing = useMemo(() => {
    const numL = Math.max(1, Number(length) || 10);
    const numW = Math.max(1, Number(width) || 10);
    const numH = Math.max(1, Number(height) || 5);

    // Convert to cm for consistent volumetric formula
    const lCm = unit === 'inches' ? numL * 2.54 : numL;
    const wCm = unit === 'inches' ? numW * 2.54 : numW;
    const hCm = unit === 'inches' ? numH * 2.54 : numH;

    // Surface area in sq cm
    const surfaceArea = 2 * (lCm * wCm + lCm * hCm + wCm * hCm);
    // Base cost in Ghanaian Cedis (GH₵)
    const baseBoxCost = Math.max(18.0, 14.0 + surfaceArea * 0.0085);

    // Volume discount tiers
    let discountPercent = 0;
    if (qty >= 500) {
      discountPercent = 30;
    } else if (qty >= 100) {
      discountPercent = 20;
    } else if (qty >= 25) {
      discountPercent = 10;
    }

    const finalUnitPrice = baseBoxCost * (1 - discountPercent / 100);
    const lineTotal = finalUnitPrice * qty;

    const volumeLiters = ((lCm * wCm * hCm) / 1000).toFixed(2);

    return {
      baseUnitPrice: baseBoxCost,
      finalUnitPrice,
      discountPercent,
      lineTotal,
      volumeLiters,
    };
  }, [length, width, height, unit, qty]);

  const activeColorName = customColorInput.trim() ? customColorInput.trim() : selectedColor;

  const handleAddToCart = () => {
    const customSku = `CUSTOM-${productSlug.substring(0, 8).toUpperCase()}-${length}x${width}x${height}${unit.substring(0, 1).toUpperCase()}-${activeColorName.replace(/\s+/g, '').substring(0, 6).toUpperCase()}`;

    const customVariantName = `${length}×${width}×${height} ${unit} · ${activeColorName}`;

    addItem({
      productId,
      title: productTitle,
      variantSku: customSku,
      variantName: customVariantName,
      quantity: qty,
      unitPrice: pricing.finalUnitPrice,
      image: firstVariant?.images?.[0] ?? undefined,
      customDimensions: {
        length: Number(length) || 1,
        width: Number(width) || 1,
        height: Number(height) || 1,
        unit,
      },
      customColor: activeColorName,
      subtotal: pricing.lineTotal,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ── Made to order Guarantee Banner ── */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
              100% Made-To-Order Packaging
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                Min 1 Box
              </span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
              We do not stock premade generic boxes. Configure your exact dimensions (Length × Width × Height) and exterior color shade below — crafted to order starting from 1 unit!
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Custom Dimensions ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-500 text-stone-950 flex items-center justify-center text-[11px] font-bold">1</span>
            Box Dimensions (Length × Width × Height)
          </label>

          {/* Unit Toggle Switch */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                unit === 'cm'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                unit === 'inches'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              inches
            </button>
          </div>
        </div>

        {/* 3 Input Fields: L x W x H */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Length ({unit})
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-stone-900 dark:text-white text-center focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-sm sm:text-base outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Width ({unit})
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-stone-900 dark:text-white text-center focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-sm sm:text-base outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Height ({unit})
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-stone-900 dark:text-white text-center focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-sm sm:text-base outline-none"
            />
          </div>
        </div>

        {/* Quick Presets Chips */}
        <div className="pt-1">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block mb-1.5">
            Or pick a starter template to customize:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-500/10 hover:border-amber-500/40 text-[11px] font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition"
              >
                {p.label} ({p.l}×{p.w}×{p.h}cm)
              </button>
            ))}
          </div>
        </div>

        {/* Live Dimensional Card */}
        <div className="rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-stone-900 dark:text-white" />
            </div>
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 block">
                {length} × {width} × {height} {unit}
              </span>
              <span className="text-stone-500 dark:text-stone-400 font-medium text-[11px]">
                Calculated internal volume: ~{pricing.volumeLiters} Liters
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-[10px] font-bold border border-stone-200 dark:border-stone-700 shadow-2xs">
            Custom Fit
          </span>
        </div>

        {/* Not sure of dimensions? Let vendor decide */}
        <div className="rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-stone-900 dark:text-white shrink-0" />
            <span className="text-stone-700 dark:text-stone-300 font-medium text-[11px]">
              Not sure what measurements you need?
            </span>
          </div>
          <Link
            href={`/quote?boxType=${encodeURIComponent(productTitle)}&mode=vendor_decides`}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0"
          >
            Describe contents &amp; let vendor size it <ArrowRight className="w-3 h-3 text-stone-900 dark:text-white" />
          </Link>
        </div>
      </div>

      {/* ── Section 2: Exterior Color Palette ── */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-amber-500 text-stone-950 flex items-center justify-center text-[11px] font-bold">2</span>
          Choose Exterior Color
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLOR_PALETTE.map((c) => {
            const isSelected = selectedColor === c.name && !customColorInput;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setSelectedColor(c.name);
                  setCustomColorInput('');
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-400/30'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-500/40'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-stone-300 dark:border-stone-600 shadow-xs flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Color override text */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
            Or custom shade / Pantone:
          </span>
          <input
            type="text"
            value={customColorInput}
            onChange={(e) => setCustomColorInput(e.target.value)}
            placeholder="e.g. Pantone 18-1750, Warm Sand, Mint"
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Section 3: Live Bulk Discount Tiers ── */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4 bg-stone-100/60 dark:bg-stone-900">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
            Volume Discount Tiers (From 1 Box)
          </h4>
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">
            Save up to 30%
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { range: '1–24', discount: 'Base rate', active: qty < 25 },
            { range: '25–99', discount: '10% Off', active: qty >= 25 && qty < 100 },
            { range: '100–499', discount: '20% Off', active: qty >= 100 && qty < 500 },
            { range: '500+', discount: '30% Off', active: qty >= 500 },
          ].map((t) => (
            <div
              key={t.range}
              className={`p-2 rounded-xl text-center border transition-all ${
                t.active
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs font-bold'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
              }`}
            >
              <p className="text-[11px] font-bold opacity-90">{t.range}</p>
              <p className="text-xs font-black mt-0.5">{t.discount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Real-time Live Price Display ── */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Unit Price (Made-To-Order)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900 dark:text-white">
              GH₵{pricing.finalUnitPrice.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">/ box</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Estimated Batch Total</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
            GH₵{pricing.lineTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Section 5: Order Quantity Stepper ── */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
          Order Quantity
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-black text-lg transition flex items-center justify-center disabled:opacity-40"
              disabled={qty <= 1}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 text-center font-black text-stone-900 dark:text-white bg-transparent focus:outline-none text-base"
            />
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-lg transition flex items-center justify-center shadow-xs"
            >
              +
            </button>
          </div>

          <div className="text-xs text-amber-800 dark:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Order from 1 unit · Sample friendly!</span>
          </div>
        </div>
      </div>

      {/* ── Section 6: Add to Cart CTA ── */}
      <button
        type="button"
        onClick={handleAddToCart}
        className={`w-full rounded-2xl py-4 font-black text-base transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
          added
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {added ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Custom Box Added to Cart!</span>
          </>
        ) : (
          <>
            <span>Add {qty} Custom Box{qty > 1 ? 'es' : ''} to Cart (GH₵{pricing.lineTotal.toFixed(2)})</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
