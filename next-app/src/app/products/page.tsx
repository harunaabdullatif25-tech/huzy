// src/app/products/page.tsx
// Product catalog — Server Component.

import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { BoxProductModel } from '@/models/BoxProduct.model';
import { UseCaseCategory } from '@/models/BoxProduct.model';
import ProductCard from '@/components/ProductCard';
import CatalogSearchWrapper from './CatalogSearchWrapper';
import { Sparkles, Package, X } from 'lucide-react';
import type { IBoxProduct } from '@/models/BoxProduct.model';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Utility: coerce Next.js searchParam value to a plain string or undefined. */
function asString(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

const ALL_CATEGORIES = Object.values(UseCaseCategory);

export const dynamic = 'force-dynamic'; // always fetch fresh data

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = asString(params?.q);
  const category = asString(params?.category);

  const filter: Record<string, any> = { isActive: true };
  if (q) {
    filter.title = { $regex: q, $options: 'i' };
  }
  if (category) {
    filter.useCaseCategories = category;
  }

  let rawProducts: any[] = [];
  try {
    await dbConnect();
    rawProducts = await BoxProductModel.find(filter)
      .select('title slug boxType variants ecoFriendlyAttributes minOrderQuantity')
      .lean()
      .limit(60);
  } catch (err) {
    console.warn('Products catalog DB connection unavailable:', err);
  }

  // Lean documents from Mongoose need _id serialised
  const products = JSON.parse(JSON.stringify(rawProducts)) as Pick<
    IBoxProduct,
    'title' | 'slug' | 'boxType' | 'variants' | 'ecoFriendlyAttributes' | 'minOrderQuantity'
  >[];

  const resultCount = products.length;
  const hasFilter = !!(q || category);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top search & filter bar */}
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-16 z-30 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CatalogSearchWrapper defaultValue={q} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-stone-900 border border-stone-800 text-white p-6 sm:p-8 relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 text-white border border-stone-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              100% Made-To-Order · Custom Sizing
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Choose Any Box Style &amp; Tailor Your Exact Dimensions
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Our boxes are not premade stock. Select any box structure and configure your custom Length × Width × Height and exterior color shade — starting from 1 unit!
            </p>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/products"
            className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all ${
              !category
                ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            All Packaging
          </Link>
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all ${
                category === cat
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Active filter summary */}
        {hasFilter && (
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>Filtering by:</span>
            {q && (
              <span className="inline-flex items-center gap-1 rounded-md bg-stone-200/80 dark:bg-stone-800 px-2 py-0.5 font-medium text-stone-800 dark:text-stone-200">
                Keyword: &ldquo;{q}&rdquo;
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 font-medium">
                {category}
              </span>
            )}
            <Link
              href="/products"
              className="inline-flex items-center gap-0.5 text-xs text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 underline ml-2"
            >
              <X className="w-3 h-3 text-stone-900 dark:text-white" />
              Clear filters
            </Link>
          </div>
        )}

        {/* Results grid */}
        {resultCount === 0 ? (
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              No products found
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {hasFilter
                ? 'Try broadening your search or clearing your active category filter.'
                : 'Products are currently being loaded. Check back shortly.'}
            </p>
            {hasFilter && (
              <Link
                href="/products"
                className="inline-block rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-bold text-stone-950 transition-colors"
              >
                View all products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
