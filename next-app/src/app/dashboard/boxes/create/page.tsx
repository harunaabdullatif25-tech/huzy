// src/app/dashboard/boxes/create/page.tsx
// 'use client' — Full product creation form
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BoxType,
  MaterialType,
  FluteType,
  FinishType,
  BoxColor,
  UseCaseCategory,
} from '@/types/box.types';
import ImageUploader from '@/components/ImageUploader';
import { X } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

const CM_TO_IN = 0.393701;

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── types ────────────────────────────────────────────────────────────────────

interface DimCm { length: string; width: string; height: string; }

interface BulkTierDraft {
  minQty: string;
  unitPrice: string;
  discountPercentage: string;
}

interface VariantDraft {
  sku: string;
  variantName: string;
  images: string[];
  outerCm: DimCm;
  innerCm: DimCm;
  wallThicknessMm: string;
  fluteType: FluteType;
  finishType: FinishType;
  colorName: BoxColor;
  colorHex: string;
  loadKg: string;
  loadLbs: string;
  tareWeightGrams: string;
  burstStrengthPsi: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  minOrderQuantity: string;
  isAvailable: boolean;
  bulkPricingTiers: BulkTierDraft[];
}

function emptyVariant(): VariantDraft {
  return {
    sku: '',
    variantName: '',
    images: [],
    outerCm: { length: '', width: '', height: '' },
    innerCm: { length: '', width: '', height: '' },
    wallThicknessMm: '',
    fluteType: FluteType.C_FLUTE,
    finishType: FinishType.UNCOATED,
    colorName: BoxColor.KRAFT_NATURAL,
    colorHex: '',
    loadKg: '',
    loadLbs: '',
    tareWeightGrams: '',
    burstStrengthPsi: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    minOrderQuantity: '',
    isAvailable: true,
    bulkPricingTiers: [],
  };
}

// ── component ────────────────────────────────────────────────────────────────

export default function CreateBoxPage() {
  const router = useRouter();

  // product-level fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [boxType, setBoxType] = useState<BoxType>(BoxType.SHIPPING_BOX);
  const [materialType, setMaterialType] = useState<MaterialType>(MaterialType.SINGLE_WALL);
  const [useCaseCategories, setUseCaseCategories] = useState<UseCaseCategory[]>([]);
  const [brand, setBrand] = useState('');
  const [isRecyclable, setIsRecyclable] = useState(false);
  const [isCompostable, setIsCompostable] = useState(false);
  const [recycledContentPercentage, setRecycledContentPercentage] = useState('0');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [tags, setTags] = useState('');

  // variants
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);

  // form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // auto-generate slug from title
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  // toggle use-case category
  const toggleCategory = (cat: UseCaseCategory) => {
    setUseCaseCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  // variant helpers
  const updateVariant = useCallback(
    <K extends keyof VariantDraft>(index: number, key: K, value: VariantDraft[K]) => {
      setVariants((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [key]: value };
        return next;
      });
    },
    [],
  );

  const updateDim = useCallback(
    (
      vIdx: number,
      side: 'outerCm' | 'innerCm',
      axis: keyof DimCm,
      value: string,
    ) => {
      setVariants((prev) => {
        const next = [...prev];
        next[vIdx] = {
          ...next[vIdx],
          [side]: { ...next[vIdx][side], [axis]: value },
        };
        return next;
      });
    },
    [],
  );

  const addVariant = () => setVariants((p) => [...p, emptyVariant()]);
  const removeVariant = (i: number) => setVariants((p) => p.filter((_, idx) => idx !== i));

  const addBulkTier = (vIdx: number) => {
    setVariants((prev) => {
      const next = [...prev];
      next[vIdx] = {
        ...next[vIdx],
        bulkPricingTiers: [...next[vIdx].bulkPricingTiers, { minQty: '', unitPrice: '', discountPercentage: '' }],
      };
      return next;
    });
  };

  const updateBulkTier = (vIdx: number, tIdx: number, key: keyof BulkTierDraft, value: string) => {
    setVariants((prev) => {
      const next = [...prev];
      const tiers = [...next[vIdx].bulkPricingTiers];
      tiers[tIdx] = { ...tiers[tIdx], [key]: value };
      next[vIdx] = { ...next[vIdx], bulkPricingTiers: tiers };
      return next;
    });
  };

  const removeBulkTier = (vIdx: number, tIdx: number) => {
    setVariants((prev) => {
      const next = [...prev];
      next[vIdx] = {
        ...next[vIdx],
        bulkPricingTiers: next[vIdx].bulkPricingTiers.filter((_, i) => i !== tIdx),
      };
      return next;
    });
  };

  const updateVariantImages = useCallback((vIdx: number, newImages: string[]) => {
    setVariants((prev) => {
      const next = [...prev];
      next[vIdx] = { ...next[vIdx], images: newImages };
      return next;
    });
  }, []);

  // build payload
  function buildPayload() {
    return {
      title,
      slug,
      description,
      boxType,
      materialType,
      useCaseCategories,
      brand,
      ecoFriendlyAttributes: {
        isRecyclable,
        isCompostable,
        recycledContentPercentage: parseFloat(recycledContentPercentage) || 0,
      },
      minOrderQuantity: minOrderQuantity ? parseInt(minOrderQuantity) : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      variants: variants.map((v) => {
        const toCmObj = (d: DimCm) => ({
          length: parseFloat(d.length) || 0,
          width: parseFloat(d.width) || 0,
          height: parseFloat(d.height) || 0,
        });
        const toInObj = (d: DimCm) => ({
          length: (parseFloat(d.length) || 0) * CM_TO_IN,
          width: (parseFloat(d.width) || 0) * CM_TO_IN,
          height: (parseFloat(d.height) || 0) * CM_TO_IN,
        });
        return {
          sku: v.sku,
          variantName: v.variantName,
          images: v.images || [],
          dimensions: {
            outer: { cm: toCmObj(v.outerCm), inches: toInObj(v.outerCm) },
            inner: { cm: toCmObj(v.innerCm), inches: toInObj(v.innerCm) },
          },
          wallThicknessMm: parseFloat(v.wallThicknessMm) || 0,
          fluteType: v.fluteType,
          finishType: v.finishType,
          colorName: v.colorName,
          colorHex: v.colorHex || undefined,
          loadCapacity: {
            kg: parseFloat(v.loadKg) || 0,
            lbs: parseFloat(v.loadLbs) || 0,
          },
          tareWeightGrams: parseFloat(v.tareWeightGrams) || 0,
          burstStrengthPsi: v.burstStrengthPsi ? parseFloat(v.burstStrengthPsi) : undefined,
          price: parseFloat(v.price) || 0,
          costPrice: v.costPrice ? parseFloat(v.costPrice) : undefined,
          stockQuantity: parseInt(v.stockQuantity) || 0,
          minOrderQuantity: v.minOrderQuantity ? parseInt(v.minOrderQuantity) : undefined,
          isAvailable: v.isAvailable,
          bulkPricingTiers: v.bulkPricingTiers
            .filter((t) => t.minQty && t.unitPrice)
            .map((t) => ({
              minQuantity: parseInt(t.minQty),
              unitPrice: parseFloat(t.unitPrice),
              discountPercentage: t.discountPercentage ? parseFloat(t.discountPercentage) : undefined,
            })),
        };
      }),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!title) { setErrors({ title: 'Title is required' }); return; }
    if (!slug) { setErrors({ slug: 'Slug is required' }); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/boxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ form: data?.message ?? 'Failed to create product' });
        return;
      }
      router.push('/dashboard/boxes');
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const labelCls = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1';
  const inputCls =
    'block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-xs focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors';
  const sectionCls = 'rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4';

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Create New Product</h1>
        <Link href="/dashboard/boxes" className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
          ← Cancel
        </Link>
      </div>

      {errors.form && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Product Info ── */}
        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">Product Information</h2>

          <div>
            <label className={labelCls}>Title *</label>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premium Mailer Box"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className={labelCls}>Slug *</label>
            <input
              className={inputCls}
              value={slug}
              onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
              placeholder="auto-generated-from-title"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} min-h-[100px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Box Type</label>
              <select className={inputCls} value={boxType} onChange={(e) => setBoxType(e.target.value as BoxType)}>
                {Object.values(BoxType).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Material Type</label>
              <select className={inputCls} value={materialType} onChange={(e) => setMaterialType(e.target.value as MaterialType)}>
                {Object.values(MaterialType).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Brand</label>
            <input className={inputCls} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Blossom&Box" />
          </div>

          <div>
            <label className={labelCls}>Min Order Quantity</label>
            <input className={inputCls} type="number" min="1" value={minOrderQuantity} onChange={(e) => setMinOrderQuantity(e.target.value)} placeholder="1" />
          </div>

          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mailer, eco, custom" />
          </div>
        </section>

        {/* ── Use Case Categories ── */}
        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">Use Case Categories</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.values(UseCaseCategory).map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCaseCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500"
                />
                {cat}
              </label>
            ))}
          </div>
        </section>

        {/* ── Eco Attributes ── */}
        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">Eco-Friendly Attributes</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
              <input type="checkbox" checked={isRecyclable} onChange={(e) => setIsRecyclable(e.target.checked)} className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500" />
              Is Recyclable
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
              <input type="checkbox" checked={isCompostable} onChange={(e) => setIsCompostable(e.target.checked)} className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500" />
              Is Compostable
            </label>
          </div>
          <div className="max-w-xs">
            <label className={labelCls}>Recycled Content (%)</label>
            <input className={inputCls} type="number" min="0" max="100" value={recycledContentPercentage} onChange={(e) => setRecycledContentPercentage(e.target.value)} />
          </div>
        </section>

        {/* ── Variants ── */}
        <section className={sectionCls}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">Variants</h2>
            <button type="button" onClick={addVariant} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition">
              + Add Variant
            </button>
          </div>

          {variants.map((v, vIdx) => (
            <div key={vIdx} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">Variant #{vIdx + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(vIdx)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 transition">Remove</button>
                )}
              </div>

              {/* Basic */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>SKU *</label>
                  <input className={inputCls} value={v.sku} onChange={(e) => updateVariant(vIdx, 'sku', e.target.value)} placeholder="BOX-001-L" />
                </div>
                <div>
                  <label className={labelCls}>Variant Name *</label>
                  <input className={inputCls} value={v.variantName} onChange={(e) => updateVariant(vIdx, 'variantName', e.target.value)} placeholder="Large – Kraft Natural" />
                </div>
              </div>

              {/* Variant Images */}
              <ImageUploader
                images={v.images}
                onChange={(imgs) => updateVariantImages(vIdx, imgs)}
                label={`Variant #${vIdx + 1} Images & Photos`}
              />

              {/* Outer dimensions */}
              <div>
                <p className={`${labelCls} mb-2`}>Outer Dimensions (cm)</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['length', 'width', 'height'] as const).map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{axis}</label>
                      <input
                        className={inputCls}
                        type="number"
                        step="0.1"
                        value={v.outerCm[axis]}
                        onChange={(e) => updateDim(vIdx, 'outerCm', axis, e.target.value)}
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        {v.outerCm[axis] ? `${(parseFloat(v.outerCm[axis]) * CM_TO_IN).toFixed(2)} in` : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inner dimensions */}
              <div>
                <p className={`${labelCls} mb-2`}>Inner Dimensions (cm)</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['length', 'width', 'height'] as const).map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{axis}</label>
                      <input
                        className={inputCls}
                        type="number"
                        step="0.1"
                        value={v.innerCm[axis]}
                        onChange={(e) => updateDim(vIdx, 'innerCm', axis, e.target.value)}
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        {v.innerCm[axis] ? `${(parseFloat(v.innerCm[axis]) * CM_TO_IN).toFixed(2)} in` : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material & finish */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Wall Thickness (mm)</label>
                  <input className={inputCls} type="number" step="0.1" value={v.wallThicknessMm} onChange={(e) => updateVariant(vIdx, 'wallThicknessMm', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Flute Type</label>
                  <select className={inputCls} value={v.fluteType} onChange={(e) => updateVariant(vIdx, 'fluteType', e.target.value as FluteType)}>
                    {Object.values(FluteType).map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Finish Type</label>
                  <select className={inputCls} value={v.finishType} onChange={(e) => updateVariant(vIdx, 'finishType', e.target.value as FinishType)}>
                    {Object.values(FinishType).map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Color Name</label>
                  <select className={inputCls} value={v.colorName} onChange={(e) => updateVariant(vIdx, 'colorName', e.target.value as BoxColor)}>
                    {Object.values(BoxColor).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Color Hex (optional)</label>
                  <input className={inputCls} value={v.colorHex} onChange={(e) => updateVariant(vIdx, 'colorHex', e.target.value)} placeholder="#FFFFFF" />
                </div>
              </div>

              {/* Load capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Load Capacity (kg)</label>
                  <input className={inputCls} type="number" step="0.1" value={v.loadKg} onChange={(e) => updateVariant(vIdx, 'loadKg', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Load Capacity (lbs)</label>
                  <input className={inputCls} type="number" step="0.1" value={v.loadLbs} onChange={(e) => updateVariant(vIdx, 'loadLbs', e.target.value)} />
                </div>
              </div>

              {/* Weight & burst */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tare Weight (g)</label>
                  <input className={inputCls} type="number" value={v.tareWeightGrams} onChange={(e) => updateVariant(vIdx, 'tareWeightGrams', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Burst Strength (PSI)</label>
                  <input className={inputCls} type="number" value={v.burstStrengthPsi} onChange={(e) => updateVariant(vIdx, 'burstStrengthPsi', e.target.value)} />
                </div>
              </div>

              {/* Pricing & stock */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className={labelCls}>Price *</label>
                  <input className={inputCls} type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(vIdx, 'price', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Cost Price</label>
                  <input className={inputCls} type="number" step="0.01" value={v.costPrice} onChange={(e) => updateVariant(vIdx, 'costPrice', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Stock Qty</label>
                  <input className={inputCls} type="number" value={v.stockQuantity} onChange={(e) => updateVariant(vIdx, 'stockQuantity', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Min Order Qty</label>
                  <input className={inputCls} type="number" value={v.minOrderQuantity} onChange={(e) => updateVariant(vIdx, 'minOrderQuantity', e.target.value)} />
                </div>
              </div>

              {/* Available */}
              <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={v.isAvailable}
                  onChange={(e) => updateVariant(vIdx, 'isAvailable', e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500"
                />
                Available for purchase
              </label>

              {/* Bulk pricing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className={labelCls}>Bulk Pricing Tiers</p>
                  <button type="button" onClick={() => addBulkTier(vIdx)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold">
                    + Add Tier
                  </button>
                </div>
                {v.bulkPricingTiers.map((t, tIdx) => (
                  <div key={tIdx} className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                      <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Min Qty</label>
                      <input className={inputCls} type="number" value={t.minQty} onChange={(e) => updateBulkTier(vIdx, tIdx, 'minQty', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Unit Price</label>
                      <input className={inputCls} type="number" step="0.01" value={t.unitPrice} onChange={(e) => updateBulkTier(vIdx, tIdx, 'unitPrice', e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Discount %</label>
                      <input className={inputCls} type="number" value={t.discountPercentage} onChange={(e) => updateBulkTier(vIdx, tIdx, 'discountPercentage', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeBulkTier(vIdx, tIdx)} className="mb-0.5 text-red-400 hover:text-red-600 text-xs p-1" aria-label="Remove tier"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Product'}
          </button>
          <Link
            href="/dashboard/boxes"
            className="rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
