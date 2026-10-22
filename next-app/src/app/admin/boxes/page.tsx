'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, Filter, Trash2, Edit3, ExternalLink } from 'lucide-react';

interface Variant {
  sku: string;
  variantName: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  fluteType?: string;
  finishType?: string;
}

interface BoxProduct {
  _id: string;
  title: string;
  slug: string;
  boxType: string;
  materialType: string;
  isActive: boolean;
  minOrderQuantity?: number;
  variants: Variant[];
  createdAt: string;
}

export default function AdminBoxesPage() {
  const [boxes, setBoxes] = useState<BoxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/boxes');
      if (res.ok) {
        const data = await res.json();
        setBoxes(data);
      }
    } catch (err) {
      console.error('Failed to load boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/boxes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBoxes((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert('Failed to delete packaging box.');
      }
    } catch {
      alert('Error connecting to server.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBoxes = boxes.filter((box) => {
    const matchesFilter = filterType === 'ALL' || box.boxType === filterType;
    const matchesSearch =
      box.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      box.boxType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      box.variants.some((v) => v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
            Box Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure boxes, dimensional variants, flute specifications, stock levels, and MOQ rules.
          </p>
        </div>
        <Link
          href="/admin/boxes/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Box</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-2xs border border-stone-200 dark:border-stone-800">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, box type, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none transition"
          >
            <option value="ALL">All Box Types</option>
            <option value="Shipping Box">Shipping Box</option>
            <option value="Mailer Box">Mailer Box</option>
            <option value="Gift Box">Gift Box</option>
            <option value="Heavy-Duty Storage">Heavy-Duty Storage</option>
            <option value="Rigid Box">Rigid Box</option>
            <option value="Folding Carton">Folding Carton</option>
            <option value="Balloon Box">Balloon Box</option>
            <option value="Bakery & Cake Box">Bakery &amp; Cake Box</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-stone-900 p-16 text-center rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs">Loading box catalog…</span>
        </div>
      ) : filteredBoxes.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 p-12 text-center rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
          <p className="text-stone-500 dark:text-stone-400 text-xs">No packaging boxes found matching your filter.</p>
          <Link
            href="/admin/boxes/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs hover:bg-amber-400 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Box</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xs border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Product Name &amp; Slug</th>
                  <th className="px-6 py-3.5">Structure &amp; Material</th>
                  <th className="px-6 py-3.5">Variants &amp; SKUs</th>
                  <th className="px-6 py-3.5">Price Range</th>
                  <th className="px-6 py-3.5">Stock Status</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredBoxes.map((box) => {
                  const prices = box.variants.map((v) => v.price).filter((p) => typeof p === 'number');
                  const minPrice = prices.length ? Math.min(...prices) : 0;
                  const maxPrice = prices.length ? Math.max(...prices) : 0;
                  const totalStock = box.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
                  const isLowStock = totalStock > 0 && totalStock < 50;
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={box._id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-900 dark:text-white">{box.title}</div>
                        <div className="text-[11px] text-stone-400 font-mono">/{box.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 rounded-md font-semibold text-[10px] mr-1 mb-1">
                          {box.boxType}
                        </span>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">{box.materialType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-800 dark:text-stone-200">
                          {box.variants.length} {box.variants.length === 1 ? 'Variant' : 'Variants'}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono truncate max-w-[140px]">
                          {box.variants.slice(0, 2).map((v) => v.sku).join(', ')}
                          {box.variants.length > 2 && '…'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-900 dark:text-white">
                        {minPrice === maxPrice
                          ? `GH₵${minPrice.toFixed(2)}`
                          : `GH₵${minPrice.toFixed(2)} – GH₵${maxPrice.toFixed(2)}`}
                        {box.minOrderQuantity ? (
                          <div className="text-[10px] text-stone-400 font-normal">MOQ: {box.minOrderQuantity}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 rounded-full font-bold text-[10px]">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 rounded-full font-bold text-[10px]">
                            Low Stock ({totalStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                            In Stock ({totalStock})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                            box.isActive ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                          }`}
                        />
                        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                          {box.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/products/${box.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-white font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/admin/boxes/${box._id}`}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(box._id, box.title)}
                          disabled={deletingId === box._id}
                          className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{deletingId === box._id ? 'Deleting…' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
