// src/components/ProductCard.tsx
// Server-compatible product card shown in the catalog grid with luxury gold aesthetics.

import Link from 'next/link';
import Image from 'next/image';
import { Package, Recycle, Leaf, Zap, ArrowRight } from 'lucide-react';
import type { IBoxProduct } from '@/models/BoxProduct.model';

interface ProductCardProps {
  product: Pick<
    IBoxProduct,
    | 'title'
    | 'slug'
    | 'boxType'
    | 'variants'
    | 'ecoFriendlyAttributes'
    | 'minOrderQuantity'
  >;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { title, slug, boxType, variants, ecoFriendlyAttributes } = product;

  // Cheapest available variant for price display
  const availableVariants = variants.filter((v) => v.isAvailable);
  const lowestPrice =
    availableVariants.length > 0
      ? Math.min(...availableVariants.map((v) => v.price))
      : null;

  const firstImage = availableVariants[0]?.images?.[0] ?? null;

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-lg hover:border-amber-500/50 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      {/* Product image */}
      <div className="relative aspect-square bg-stone-100 dark:bg-stone-800/60 overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400 dark:text-stone-600">
            <Package className="w-16 h-16 stroke-[1.2] text-stone-400 dark:text-stone-600" />
          </div>
        )}

        {/* Floating Top Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-stone-200/80 dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white shadow-2xs backdrop-blur-md">
            {boxType}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-amber-500 text-stone-950 shadow-2xs">
            Made-To-Order
          </span>
        </div>

        {/* Quick MOQ pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white border border-stone-200/80 dark:border-stone-700 shadow-2xs backdrop-blur-md flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-stone-900 dark:text-white" />
            Min 1 Unit
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 gap-2.5">
        <h3 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Eco & Feature badges */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {ecoFriendlyAttributes.isRecyclable && (
            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 text-[11px] text-stone-800 dark:text-stone-200 font-medium">
              <Recycle className="w-3 h-3 text-stone-900 dark:text-white" />
              100% Recyclable
            </span>
          )}
          {ecoFriendlyAttributes.isCompostable && (
            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 text-[11px] text-stone-800 dark:text-stone-200 font-medium">
              <Leaf className="w-3 h-3 text-stone-900 dark:text-white" />
              Compostable
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block leading-none">Starting at</span>
            <span className="text-lg font-black text-stone-900 dark:text-white">
              {lowestPrice !== null ? `GH₵${lowestPrice.toFixed(2)}` : 'Custom Quote'}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-900 dark:text-stone-100 text-xs font-bold transition-all shadow-2xs">
            <span>View Box</span>
            <ArrowRight className="w-3 h-3 text-stone-900 dark:text-white group-hover:text-stone-950" />
          </span>
        </div>
      </div>
    </Link>
  );
}
