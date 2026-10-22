// src/app/dashboard/boxes/[id]/page.tsx
// 'use client' — Edit existing box product, with delete support
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Trash2, X } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

const CM_TO_IN = 0.393701;

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
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

// Flatten a fetched variant from API into our draft shape
function variantToForm(v: Record<string, unknown>): VariantDraft {
  const dim = (side: 'outer' | 'inner') => {
    const d = (v.dimensions as Record<string, Record<string, Record<string, number>>>)?.[side]?.cm ?? { length: 0, width: 0, height: 0 };
    return { length: String(d.length ?? ''), width: String(d.width ?? ''), height: String(d.height ?? '') };
  };
  const lc = v.loadCapacity as Record<string, number> | undefined;
  const bulk = (v.bulkPricingTiers as Array<Record<string, number>> | undefined) ?? [];
  const rawImages = Array.isArray(v.images) ? (v.images as string[]) : [];
  return {
    sku: String(v.sku ?? ''),
    variantName: String(v.variantName ?? ''),
    images: rawImages.filter((img) => typeof img === 'string' && img.trim().length > 0),
    outerCm: dim('outer'),
    innerCm: dim('inner'),
    wallThicknessMm: String(v.wallThicknessMm ?? ''),
    fluteType: (v.fluteType as FluteType) ?? FluteType.C_FLUTE,
    finishType: (v.finishType as FinishType) ?? FinishType.UNCOATED,
    colorName: (v.colorName as BoxColor) ?? BoxColor.KRAFT_NATURAL,
    colorHex: String(v.colorHex ?? ''),
    loadKg: String(lc?.kg ?? ''),
    loadLbs: String(lc?.lbs ?? ''),
    tareWeightGrams: String(v.tareWeightGrams ?? ''),
    burstStrengthPsi: String(v.burstStrengthPsi ?? ''),
    price: String(v.price ?? ''),
    costPrice: String(v.costPrice ?? ''),
    stockQuantity: String(v.stockQuantity ?? ''),
    minOrderQuantity: String(v.minOrderQuantity ?? ''),
    isAvailable: Boolean(v.isAvailable ?? true),
    bulkPricingTiers: bulk.map((t) => ({
      minQty: String(t.minQuantity ?? ''),
      unitPrice: String(t.unitPrice ?? ''),
      discountPercentage: String(t.discountPercentage ?? ''),
    })),
  };
}

// ── component ────────────────────────────────────────────────────────────────

export default function EditBoxPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
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
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing product
  useEffect(() => {
    fetch(`/api/boxes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product ?? data;
        setTitle(p.title ?? '');
        setSlug(p.slug ?? '');
        setDescription(p.description ?? '');
        setBoxType(p.boxType ?? BoxType.SHIPPING_BOX);
        setMaterialType(p.materialType ?? MaterialType.SINGLE_WALL);
        setUseCaseCategories(p.useCaseCategories ?? []);
        setBrand(p.brand ?? '');
        setIsRecyclable(p.ecoFriendlyAttributes?.isRecyclable ?? false);
        setIsCompostable(p.ecoFriendlyAttributes?.isCompostable ?? false);
        setRecycledContentPercentage(String(p.ecoFriendlyAttributes?.recycledContentPercentage ?? 0));
        setMinOrderQuantity(String(p.minOrderQuantity ?? ''));
        setTags((p.tags ?? []).join(', '));
        const raw = p.variants as Array<Record<string, unknown>> | undefined;
        if (raw && raw.length > 0) {
          setVariants(raw.map(variantToForm));
        }
      })
      .catch(() => setErrors({ form: 'Failed to load product' }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  const toggleCategory = (cat: UseCaseCategory) => {
    setUseCaseCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const updateVariant = useCallback(<K extends keyof VariantDraft>(index: number, key: K, value: VariantDraft[K]) => {
    setVariants((prev) => { const next = [...prev]; next[index] = { ...next[index], [key]: value }; return next; });
  }, []);

  const updateDim = useCallback((vIdx: number, side: 'outerCm' | 'innerCm', axis: keyof DimCm, value: string) => {
    setVariants((prev) => {
      const next = [...prev];
      next[vIdx] = { ...next[vIdx], [side]: { ...next[vIdx][side], [axis]: value } };
      return next;
    });
  }, []);

  const addVariant = () => setVariants((p) => [...p, emptyVariant()]);
  const removeVariant = (i: number) => setVariants((p) => p.filter((_, idx) => idx !== i));

  const addBulkTier = (vIdx: number) => {
    setVariants((prev) => {
      const next = [...prev];
      next[vIdx] = { ...next[vIdx], bulkPricingTiers: [...next[vIdx].bulkPricingTiers, { minQty: '', unitPrice: '', discountPercentage: '' }] };
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
      next[vIdx] = { ...next[vIdx], bulkPricingTiers: next[vIdx].bulkPricingTiers.filter((_, i) => i !== tIdx) };
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

  function buildPayload() {
    return {
      title, slug, description, boxType, materialType, useCaseCategories, brand,
      ecoFriendlyAttributes: { isRecyclable, isCompostable, recycledContentPercentage: parseFloat(recycledContentPercentage) || 0 },
      minOrderQuantity: minOrderQuantity ? parseInt(minOrderQuantity) : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      variants: variants.map((v) => {
        const toCmObj = (d: DimCm) => ({ length: parseFloat(d.length) || 0, width: parseFloat(d.width) || 0, height: parseFloat(d.height) || 0 });
        const toInObj = (d: DimCm) => ({ length: (parseFloat(d.length) || 0) * CM_TO_IN, width: (parseFloat(d.width) || 0) * CM_TO_IN, height: (parseFloat(d.height) || 0) * CM_TO_IN });
        return {
          sku: v.sku, variantName: v.variantName,
          images: v.images || [],
          dimensions: { outer: { cm: toCmObj(v.outerCm), inches: toInObj(v.outerCm) }, inner: { cm: toCmObj(v.innerCm), inches: toInObj(v.innerCm) } },
          wallThicknessMm: parseFloat(v.wallThicknessMm) || 0,
          fluteType: v.fluteType, finishType: v.finishType, colorName: v.colorName, colorHex: v.colorHex || undefined,
          loadCapacity: { kg: parseFloat(v.loadKg) || 0, lbs: parseFloat(v.loadLbs) || 0 },
          tareWeightGrams: parseFloat(v.tareWeightGrams) || 0,
          burstStrengthPsi: v.burstStrengthPsi ? parseFloat(v.burstStrengthPsi) : undefined,
          price: parseFloat(v.price) || 0, costPrice: v.costPrice ? parseFloat(v.costPrice) : undefined,
          stockQuantity: parseInt(v.stockQuantity) || 0,
          minOrderQuantity: v.minOrderQuantity ? parseInt(v.minOrderQuantity) : undefined,
          isAvailable: v.isAvailable,
          bulkPricingTiers: v.bulkPricingTiers.filter((t) => t.minQty && t.unitPrice).map((t) => ({
            minQuantity: parseInt(t.minQty), unitPrice: parseFloat(t.unitPrice),
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
    setSubmitting(true);
    try {
      const res = await fetch(`/api/boxes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ form: data?.message ?? 'Failed to update product' });
        return;
      }
      router.push('/dashboard/boxes');
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/boxes/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete product.'); return; }
      router.push('/dashboard/boxes');
    } catch {
      alert('Network error. Please try again.');
    }
  }

  const labelCls = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1';
  const inputCls =
    'block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-xs focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors';
  const sectionCls = 'rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <span className="ml-3 text-stone-600 dark:text-stone-300">Loading…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Edit Product</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
          <Link href="/dashboard/boxes" className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 self-center transition-colors">
            ← Cancel
          </Link>
        </div>
      </div>

      {errors.form && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">{errors.form}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Product Info ── */}
        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">Product Information</h2>
          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input className={inputCls} value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={`${inputCls} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
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
            <input className={inputCls} value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Min Order Quantity</label>
            <input className={inputCls} type="number" min="1" value={minOrderQuantity} onChange={(e) => setMinOrderQuantity(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </section>

        {/* ── Use Case Categories ── */}
        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">Use Case Categories</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.values(UseCaseCategory).map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                <input type="checkbox" checked={useCaseCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500" />
                {cat}
              </label>
            ))}
          </div>
        </section>

        {/* ── Eco ── */}
        <section className={sectionCls}>
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">Eco-Friendly Attributes</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
              <input type="checkbox" checked={isRecyclable} onChange={(e) => setIsRecyclable(e.target.checked)} className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500" /> Is Recyclable
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
              <input type="checkbox" checked={isCompostable} onChange={(e) => setIsCompostable(e.target.checked)} className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500" /> Is Compostable
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
            <button type="button" onClick={addVariant} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition">+ Add Variant</button>
          </div>

          {variants.map((v, vIdx) => (
            <div key={vIdx} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">Variant #{vIdx + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(vIdx)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 transition">Remove</button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label className={labelCls}>SKU</label><input className={inputCls} value={v.sku} onChange={(e) => updateVariant(vIdx, 'sku', e.target.value)} /></div>
                <div><label className={labelCls}>Variant Name</label><input className={inputCls} value={v.variantName} onChange={(e) => updateVariant(vIdx, 'variantName', e.target.value)} /></div>
              </div>

              {/* Variant Images */}
              <ImageUploader
                images={v.images}
                onChange={(imgs) => updateVariantImages(vIdx, imgs)}
                label={`Variant #${vIdx + 1} Images & Photos`}
              />

              {/* Outer dims */}
              <div>
                <p className={`${labelCls} mb-2`}>Outer Dimensions (cm)</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['length', 'width', 'height'] as const).map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{axis}</label>
                      <input className={inputCls} type="number" step="0.1" value={v.outerCm[axis]} onChange={(e) => updateDim(vIdx, 'outerCm', axis, e.target.value)} />
                      <p className="mt-1 text-xs text-gray-400">{v.outerCm[axis] ? `${(parseFloat(v.outerCm[axis]) * CM_TO_IN).toFixed(2)} in` : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inner dims */}
              <div>
                <p className={`${labelCls} mb-2`}>Inner Dimensions (cm)</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['length', 'width', 'height'] as const).map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{axis}</label>
                      <input className={inputCls} type="number" step="0.1" value={v.innerCm[axis]} onChange={(e) => updateDim(vIdx, 'innerCm', axis, e.target.value)} />
                      <p className="mt-1 text-xs text-gray-400">{v.innerCm[axis] ? `${(parseFloat(v.innerCm[axis]) * CM_TO_IN).toFixed(2)} in` : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div><label className={labelCls}>Wall Thickness (mm)</label><input className={inputCls} type="number" step="0.1" value={v.wallThicknessMm} onChange={(e) => updateVariant(vIdx, 'wallThicknessMm', e.target.value)} /></div>
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Color Name</label>
                  <select className={inputCls} value={v.colorName} onChange={(e) => updateVariant(vIdx, 'colorName', e.target.value as BoxColor)}>
                    {Object.values(BoxColor).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Color Hex</label><input className={inputCls} value={v.colorHex} onChange={(e) => updateVariant(vIdx, 'colorHex', e.target.value)} placeholder="#FFFFFF" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Load (kg)</label><input className={inputCls} type="number" step="0.1" value={v.loadKg} onChange={(e) => updateVariant(vIdx, 'loadKg', e.target.value)} /></div>
                <div><label className={labelCls}>Load (lbs)</label><input className={inputCls} type="number" step="0.1" value={v.loadLbs} onChange={(e) => updateVariant(vIdx, 'loadLbs', e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Tare Weight (g)</label><input className={inputCls} type="number" value={v.tareWeightGrams} onChange={(e) => updateVariant(vIdx, 'tareWeightGrams', e.target.value)} /></div>
                <div><label className={labelCls}>Burst Strength (PSI)</label><input className={inputCls} type="number" value={v.burstStrengthPsi} onChange={(e) => updateVariant(vIdx, 'burstStrengthPsi', e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><label className={labelCls}>Price</label><input className={inputCls} type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(vIdx, 'price', e.target.value)} /></div>
                <div><label className={labelCls}>Cost Price</label><input className={inputCls} type="number" step="0.01" value={v.costPrice} onChange={(e) => updateVariant(vIdx, 'costPrice', e.target.value)} /></div>
                <div><label className={labelCls}>Stock Qty</label><input className={inputCls} type="number" value={v.stockQuantity} onChange={(e) => updateVariant(vIdx, 'stockQuantity', e.target.value)} /></div>
                <div><label className={labelCls}>Min Order Qty</label><input className={inputCls} type="number" value={v.minOrderQuantity} onChange={(e) => updateVariant(vIdx, 'minOrderQuantity', e.target.value)} /></div>
              </div>

              <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                <input type="checkbox" checked={v.isAvailable} onChange={(e) => updateVariant(vIdx, 'isAvailable', e.target.checked)} className="rounded border-stone-300 dark:border-stone-700 text-amber-500 focus:ring-amber-500" />
                Available for purchase
              </label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className={labelCls}>Bulk Pricing Tiers</p>
                  <button type="button" onClick={() => addBulkTier(vIdx)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold">+ Add Tier</button>
                </div>
                {v.bulkPricingTiers.map((t, tIdx) => (
                  <div key={tIdx} className="flex gap-2 items-end mb-2">
                    <div className="flex-1"><label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Min Qty</label><input className={inputCls} type="number" value={t.minQty} onChange={(e) => updateBulkTier(vIdx, tIdx, 'minQty', e.target.value)} /></div>
                    <div className="flex-1"><label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Unit Price</label><input className={inputCls} type="number" step="0.01" value={t.unitPrice} onChange={(e) => updateBulkTier(vIdx, tIdx, 'unitPrice', e.target.value)} /></div>
                    <div className="flex-1"><label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Discount %</label><input className={inputCls} type="number" value={t.discountPercentage} onChange={(e) => updateBulkTier(vIdx, tIdx, 'discountPercentage', e.target.value)} /></div>
                    <button type="button" onClick={() => removeBulkTier(vIdx, tIdx)} className="mb-0.5 text-red-400 hover:text-red-600 text-xs p-1" aria-label="Remove tier"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href="/dashboard/boxes" className="rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
