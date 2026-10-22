'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function DashboardBoxesPage() {
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
        setBoxes(prev => prev.filter(b => b._id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting box:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBoxes = boxes.filter(box => {
    const matchesType = filterType === 'ALL' || box.boxType === filterType;
    const matchesSearch =
      box.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      box.boxType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      box.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Box &amp; Packaging Catalog</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage structural designs, material specifications, variant flutes, and bulk tier thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/boxes/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium rounded-lg shadow-xs transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Box Product
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by title, box type, or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-stone-600 dark:text-stone-300 whitespace-nowrap">Filter Type:</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none transition-colors"
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
        <div className="bg-white dark:bg-stone-900 p-12 text-center rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
          Loading packaging products...
        </div>
      ) : filteredBoxes.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 p-12 text-center rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-stone-500 dark:text-stone-400 mb-4">No packaging products found matching your filter.</p>
          <Link
            href="/dashboard/boxes/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 shadow-xs"
          >
            Create First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Product Name &amp; Slug</th>
                  <th className="px-6 py-3">Structure / Material</th>
                  <th className="px-6 py-3">Variants &amp; SKUs</th>
                  <th className="px-6 py-3">Price Range</th>
                  <th className="px-6 py-3">Stock Status</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredBoxes.map(box => {
                  const prices = box.variants.map(v => v.price).filter(p => typeof p === 'number');
                  const minPrice = prices.length ? Math.min(...prices) : 0;
                  const maxPrice = prices.length ? Math.max(...prices) : 0;
                  const totalStock = box.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
                  const isLowStock = totalStock > 0 && totalStock < 50;
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={box._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{box.title}</div>
                        <div className="text-xs text-stone-400 dark:text-stone-500 font-mono">/{box.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 rounded text-xs font-medium mr-1 mb-1">
                          {box.boxType}
                        </span>
                        <div className="text-xs text-stone-500 dark:text-stone-400">{box.materialType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-800 dark:text-stone-200">
                          {box.variants.length} {box.variants.length === 1 ? 'Variant' : 'Variants'}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                          {box.variants.slice(0, 2).map(v => v.sku).join(', ')}
                          {box.variants.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-stone-900 dark:text-stone-100">
                        {minPrice === maxPrice
                          ? `GH₵${minPrice.toFixed(2)}`
                          : `GH₵${minPrice.toFixed(2)} – GH₵${maxPrice.toFixed(2)}`}
                        {box.minOrderQuantity ? (
                          <div className="text-xs text-stone-400 dark:text-stone-500 font-normal">MOQ: {box.minOrderQuantity}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 dark:border dark:border-red-800/70 text-xs font-semibold rounded-full">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 dark:border dark:border-amber-800/70 text-xs font-semibold rounded-full">
                            Low Stock ({totalStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300 dark:border dark:border-green-800/70 text-xs font-semibold rounded-full">
                            In Stock ({totalStock})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                            box.isActive ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-600'
                          }`}
                        />
                        <span className="text-xs font-medium text-stone-600 dark:text-stone-400">{box.isActive ? 'Active' : 'Draft'}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/products/${box.slug}`}
                          target="_blank"
                          className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/boxes/${box._id}`}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(box._id, box.title)}
                          disabled={deletingId === box._id}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-semibold disabled:opacity-50 transition-colors"
                        >
                          {deletingId === box._id ? 'Deleting...' : 'Delete'}
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
