'use client';

// src/app/quote/page.tsx
// Request a Custom Box Quote — allows customers to either provide exact dimensions
// or describe what the box will contain so the Blossom&Box vendor decides the dimensions.

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Zap,
  Palette,
  Ruler,
  Rocket,
  Package,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

function QuoteFormContent() {
  const searchParams = useSearchParams();
  const initialBoxType = searchParams.get('boxType') || searchParams.get('style') || 'Custom Mailer Box';
  const initialMode = searchParams.get('mode') === 'vendor_decides' ? 'vendor_decides' : 'custom_dimensions';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    boxType: initialBoxType,
    sizingMode: initialMode as 'custom_dimensions' | 'vendor_decides',
    length: '',
    width: '',
    height: '',
    unit: 'cm',
    contentsDescription: '',
    quantity: '1',
    printingRequirements: '',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSizingModeChange = (mode: 'custom_dimensions' | 'vendor_decides') => {
    setFormData((prev) => ({ ...prev, sizingMode: mode }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate based on selected sizing mode
    if (formData.sizingMode === 'custom_dimensions') {
      if (!formData.length || !formData.width || !formData.height) {
        setError('Please enter length, width, and height for your custom box.');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.contentsDescription.trim()) {
        setError('Please describe what the box will contain so our vendor team can calculate the appropriate dimensions.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload: Record<string, any> = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        boxType: formData.boxType,
        sizingMode: formData.sizingMode,
        quantity: Math.max(1, Number(formData.quantity) || 1),
        printingRequirements: formData.printingRequirements || undefined,
        additionalNotes: formData.additionalNotes || undefined,
      };

      if (formData.sizingMode === 'custom_dimensions') {
        payload.dimensions = {
          length: Number(formData.length) || 0,
          width: Number(formData.width) || 0,
          height: Number(formData.height) || 0,
          unit: formData.unit,
        };
      } else {
        payload.contentsDescription = formData.contentsDescription.trim();
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to submit quote request. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
            Custom Packaging Studio · Order From 1 Unit
          </div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight sm:text-5xl">
            Request a Custom Box Quote
          </h1>
          <p className="mt-2 text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Choose your box style, specify custom dimensions or let our team engineer the size around what goes inside.
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Zap className="w-3 h-3 text-stone-900 dark:text-white" /> Min. Order: 1 Unit
            </span>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Palette className="w-3 h-3 text-stone-900 dark:text-white" /> Tailored Color Shades
            </span>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Ruler className="w-3 h-3 text-stone-900 dark:text-white" /> Vendor Sizing Available
            </span>
            <span className="px-3 py-1 rounded-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Rocket className="w-3 h-3 text-stone-900 dark:text-white" /> 24h Response Guarantee
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 sm:p-12 text-center shadow-md">
            <div className="w-16 h-16 bg-amber-500 text-stone-950 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white mb-2">Quote Request Received!</h2>
            <p className="text-stone-600 dark:text-stone-400 max-w-lg mx-auto text-sm leading-relaxed mb-6">
              Thank you, <strong className="text-stone-900 dark:text-white">{formData.fullName}</strong>. We have logged your request for{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400">{formData.boxType}</span>.
            </p>

            <div className="p-4 bg-stone-100 dark:bg-stone-800/60 rounded-2xl max-w-md mx-auto text-left text-xs text-stone-600 dark:text-stone-300 space-y-1 mb-8">
              <p>
                <strong>Sizing method:</strong>{' '}
                {formData.sizingMode === 'custom_dimensions'
                  ? `Custom dimensions (${formData.length} × ${formData.width} × ${formData.height} ${formData.unit})`
                  : 'Vendor calculates fit from contents description'}
              </p>
              <p>
                <strong>Target quantity:</strong> {formData.quantity} unit(s)
              </p>
              <p>
                We will reply to <span className="font-semibold text-amber-600 dark:text-amber-400">{formData.email}</span> with a custom quote within 24 hours.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    company: '',
                    boxType: 'Custom Mailer Box',
                    sizingMode: 'custom_dimensions',
                    length: '',
                    width: '',
                    height: '',
                    unit: 'cm',
                    contentsDescription: '',
                    quantity: '1',
                    printingRequirements: '',
                    additionalNotes: '',
                  });
                }}
                className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                Submit Another Quote
              </button>
              <Link
                href="/products"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-sm transition"
              >
                Browse Standard Boxes →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Full Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Kwame Mensah"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="kwame@company.com"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+233 24 000 0000"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Company / Brand (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Blossom Studio"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Box Style & Sizing */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Box Style &amp; Sizing
                </h3>
              </div>

              {/* Box style & quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Box Style <span className="text-amber-500">*</span>
                  </label>
                  <select
                    name="boxType"
                    value={formData.boxType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition font-medium"
                  >
                    <option value="Shipping Box">Shipping Box (Heavy-duty &amp; Corrugated)</option>
                    <option value="Mailer Box">Mailer Box (Fast-fold &amp; Vibrant)</option>
                    <option value="Gift Box">Gift Box (Luxury &amp; Keepsake)</option>
                    <option value="Rigid Box">Rigid Box (Premium Unboxing)</option>
                    <option value="Folding Carton">Folding Carton (Retail &amp; Cosmetics)</option>
                    <option value="Bakery & Cake Box">Bakery &amp; Cake Box</option>
                    <option value="Jewelry & Small Gift Box">Jewelry &amp; Small Gift Box</option>
                    <option value="Apparel & Clothing Box">Apparel &amp; Clothing Box</option>
                    <option value="Watch Box">Watch Box</option>
                    <option value="Custom Structure">Other / Bespoke Structure</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                      Target Quantity <span className="text-amber-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Min order: 1 unit
                    </span>
                  </div>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="1"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition font-semibold"
                  />
                </div>
              </div>

              {/* Sizing Method Switcher */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  How would you like to set the box dimensions? <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSizingModeChange('custom_dimensions')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      formData.sizingMode === 'custom_dimensions'
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-400/30'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-500/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold transition-colors ${
                        formData.sizingMode === 'custom_dimensions'
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                      }`}
                    >
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-stone-900 dark:text-white leading-tight">
                        I know my box dimensions
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal">
                        Specify exact length, width, and height in cm or inches.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSizingModeChange('vendor_decides')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      formData.sizingMode === 'vendor_decides'
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-400/30'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-500/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold transition-colors ${
                        formData.sizingMode === 'vendor_decides'
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-stone-900 dark:text-white leading-tight">
                        Let vendor decide dimensions
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal">
                        Describe what goes inside; our team engineers the snug fit.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Sizing Input */}
              {formData.sizingMode === 'custom_dimensions' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Dimensions (Length × Width × Height) <span className="text-amber-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <input
                      type="number"
                      name="length"
                      required
                      step="0.1"
                      min="1"
                      value={formData.length}
                      onChange={handleChange}
                      placeholder="Length"
                      className="px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 text-center font-medium"
                    />
                    <input
                      type="number"
                      name="width"
                      required
                      step="0.1"
                      min="1"
                      value={formData.width}
                      onChange={handleChange}
                      placeholder="Width"
                      className="px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 text-center font-medium"
                    />
                    <input
                      type="number"
                      name="height"
                      required
                      step="0.1"
                      min="1"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="Height"
                      className="px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 text-center font-medium"
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="px-3 py-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-amber-400/20"
                    >
                      <option value="cm">cm</option>
                      <option value="inches">inches</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>What will the box contain? <span className="text-amber-500">*</span></span>
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        Vendor will calculate dimensions
                      </span>
                    </label>
                    <textarea
                      name="contentsDescription"
                      required
                      rows={3}
                      value={formData.contentsDescription}
                      onChange={handleChange}
                      placeholder="Describe the items that need to fit inside (e.g. '1 bottle of perfume and 2 candles with satin padding', or 'Women&#39;s sneaker pair, size 39')..."
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-400/60 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition text-sm leading-relaxed font-medium"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
                    <Lightbulb className="w-5 h-5 text-stone-900 dark:text-white shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-stone-900 dark:text-white">
                        Hassle-Free Vendor Sizing Service
                      </p>
                      <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                        Don&apos;t know the exact measurements? No problem. Our packaging engineers will calculate optimal interior clearance, padding buffer, and carton proportions so your items fit safely and beautifully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Color & Custom Specifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Color &amp; Custom Specifications
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Color Preference &amp; Box Features
                </label>
                <textarea
                  name="printingRequirements"
                  rows={3}
                  value={formData.printingRequirements}
                  onChange={handleChange}
                  placeholder="Specify desired exterior color shade (e.g. Royal Gold, Natural Kraft, Crisp White, Midnight Noir), clear window cutout preference, or ribbon tie closure..."
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Additional Notes or Target Delivery Date
                </label>
                <textarea
                  name="additionalNotes"
                  rows={2}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="e.g. Need samples by next Friday, weight capacity requirements, special inserts..."
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 transition text-sm"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <ArrowLeft className="w-4 h-4 text-stone-900 dark:text-white" />
                Back to Box Catalog
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-md shadow-amber-500/20 transition disabled:opacity-50"
              >
                <span>{loading ? 'Sending Request...' : 'Submit Custom Quote Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RequestQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <QuoteFormContent />
    </Suspense>
  );
}
