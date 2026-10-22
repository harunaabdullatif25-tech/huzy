// src/app/products/[slug]/page.tsx
// Product detail page — Server Component with inline VariantSelector client island.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/mongodb';
import { BoxProductModel } from '@/models/BoxProduct.model';
import type { IBoxProduct, IBoxVariant } from '@/models/BoxProduct.model';
import VariantSelectorIsland from './VariantSelectorIsland';
import {
  Package,
  Sparkles,
  Zap,
  Palette,
  Recycle,
  Leaf,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  try {
    await dbConnect();
    const { slug } = await params;
    const product = await BoxProductModel.findOne({ slug, isActive: true })
      .select('title description')
      .lean();
    if (!product) return { title: 'Product not found' };
    return {
      title: (product as { title: string }).title,
      description: (product as { description?: string }).description ?? '',
    };
  } catch {
    return { title: 'Packaging Product' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let raw: any = null;
  try {
    await dbConnect();
    raw = await BoxProductModel.findOne({
      slug,
      isActive: true,
    }).lean();
  } catch (err) {
    console.warn('Product detail DB error:', err);
  }

  if (!raw) notFound();

  // Serialise Mongoose lean document (ObjectId → string, Date → string)
  const product = JSON.parse(JSON.stringify(raw)) as IBoxProduct & { _id: string };

  const {
    title,
    boxType,
    ecoFriendlyAttributes,
    variants,
    description,
    minOrderQuantity: productMOQ,
  } = product;

  const firstVariant = variants[0] ?? null;
  const firstImage = firstVariant?.images?.[0] ?? null;
  const moq = productMOQ ?? firstVariant?.minOrderQuantity ?? 1;

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
          <Link href="/products" className="hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
          <span className="text-stone-900 dark:text-white font-semibold truncate max-w-xs">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* ── Gallery & Features ── */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300 dark:text-stone-700">
                  <Package className="w-20 h-20 stroke-[1.2]" />
                </div>
              )}
            </div>

            {/* Quick Feature highlights */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-stone-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-stone-900 dark:text-white" /> Min 1 Unit
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">Sample friendly</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-stone-900 dark:text-white">
                  <Zap className="w-3.5 h-3.5 text-stone-900 dark:text-white" /> Fast Turnaround
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">Same-day available</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-stone-900 dark:text-white">
                  <Palette className="w-3.5 h-3.5 text-stone-900 dark:text-white" /> Custom Color
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">Any shade or tone</span>
              </div>
            </div>
          </div>

          {/* ── Product Info + Client Island ── */}
          <div className="flex flex-col gap-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
            {/* Title & badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-amber-500 text-stone-950 px-3 py-1 text-xs font-bold shadow-2xs inline-flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-stone-950" />
                  100% Made-To-Order
                </span>
                <span className="rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-bold text-stone-900 dark:text-white">
                  {boxType}
                </span>
                <span className="rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-bold text-stone-900 dark:text-white inline-flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-stone-900 dark:text-white" />
                  Min Order: 1 Unit
                </span>
                {ecoFriendlyAttributes.isRecyclable && (
                  <span className="rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-semibold text-stone-900 dark:text-white inline-flex items-center gap-1.5">
                    <Recycle className="w-3 h-3 text-stone-900 dark:text-white" />
                    100% Recyclable
                  </span>
                )}
                {ecoFriendlyAttributes.isCompostable && (
                  <span className="rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-semibold text-stone-900 dark:text-white inline-flex items-center gap-1.5">
                    <Leaf className="w-3 h-3 text-stone-900 dark:text-white" />
                    Compostable
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white leading-tight">
                {title}
              </h1>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 w-fit">
                Built on-demand: Tailor exact dimensions and color shade for your packaging needs.
              </p>
            </div>

            {/* Client island: variant selector, pricing, add-to-cart */}
            <VariantSelectorIsland
              variants={variants as IBoxVariant[]}
              productId={product._id}
              productTitle={title}
              productSlug={slug}
              defaultMoq={moq}
            />

            {/* Description */}
            {description && (
              <div className="mt-2 pt-5 border-t border-stone-100 dark:border-stone-800">
                <h2 className="font-bold text-stone-900 dark:text-white mb-2">About This Packaging</h2>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}

            {/* Custom quote link */}
            <div className="pt-2">
              <Link
                href={`/quote?boxType=${encodeURIComponent(boxType)}`}
                className="inline-flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/80 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-200 font-medium transition"
              >
                <span>Need vendor sizing, custom dimensions or bulk quantities?</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 shrink-0">
                  Request Quote <ArrowRight className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
