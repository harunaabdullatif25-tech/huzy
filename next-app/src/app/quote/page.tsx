'use client';

// src/app/quote/page.tsx
// Request a Custom Box Quote — allows customers to either provide exact dimensions
// or describe what the box will contain so the Blossom&Box vendor decides the dimensions.

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-pink-50/30 to-amber-50/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-200 text-xs font-bold text-purple-700 uppercase tracking-wider">
            ✨ Custom Packaging Studio · Order From 1 Unit
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-5xl bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600 bg-clip-text text-transparent">
            Request a Custom Box Quote
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your box style, specify custom dimensions or let our team engineer the size around what goes inside.
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 shadow-2xs">
              ⚡ Min. Order: 1 Unit
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold flex items-center gap-1 shadow-2xs">
              🎨 Tailored Color Shades
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 shadow-2xs">
              📐 Vendor Sizing Available
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-1 shadow-2xs">
              🚀 24h Response Guarantee
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white/90 backdrop-blur-md border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Quote Request Received!</h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-8 text-base leading-relaxed">
              Thank you, <span className="font-bold text-gray-900">{formData.fullName}</span>! Our commercial packaging team has received your request for{' '}
              <span className="font-bold text-purple-700">{formData.boxType}</span>.
              {formData.sizingMode === 'vendor_decides' ? (
                <>
                  {' '}We will calculate the optimal snug-fit dimensions for your contents:{' '}
                  <span className="font-semibold text-pink-600 italic">"{formData.contentsDescription}"</span>{' '}
                  and present proposed dimensions along with our quote.
                </>
              ) : (
                <>
                  {' '}with dimensions{' '}
                  <span className="font-semibold text-purple-700">
                    {formData.length} × {formData.width} × {formData.height} {formData.unit}
                  </span>.
                </>
              )}
              <br />
              We will reply to <span className="font-semibold text-indigo-600">{formData.email}</span> within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
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
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Submit Another Quote
              </button>
              <Link
                href="/products"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition"
              >
                Browse Standard Boxes →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/60 p-6 sm:p-10 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Full Name <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Haruna Abdul Latif"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Email Address <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="blossomandboxgh@company.com"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+233 24 000 0000"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Company / Brand (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Blossom Cosmetics"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Box Style & Sizing */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Box Style &amp; Sizing
                </h3>
              </div>

              {/* Box style & quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Box Style <span className="text-pink-500">*</span>
                  </label>
                  <select
                    name="boxType"
                    value={formData.boxType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-medium"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Target Quantity <span className="text-pink-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
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
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-semibold"
                  />
                </div>
              </div>

              {/* Sizing Method Switcher */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  How would you like to set the box dimensions? <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSizingModeChange('custom_dimensions')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      formData.sizingMode === 'custom_dimensions'
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-300 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-gray-50/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold transition-colors ${
                        formData.sizingMode === 'custom_dimensions'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      📏
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">
                        I know my box dimensions
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-normal">
                        Specify exact length, width, and height in cm or inches.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSizingModeChange('vendor_decides')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      formData.sizingMode === 'vendor_decides'
                        ? 'border-pink-600 bg-pink-50/80 ring-2 ring-pink-300 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-gray-50/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold transition-colors ${
                        formData.sizingMode === 'vendor_decides'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      🎁
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">
                        Let vendor decide dimensions
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-normal">
                        Describe what goes inside; our team engineers the snug fit.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Sizing Input */}
              {formData.sizingMode === 'custom_dimensions' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Dimensions (Length × Width × Height) <span className="text-pink-500">*</span>
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
                      className="px-3 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 text-center font-medium"
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
                      className="px-3 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 text-center font-medium"
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
                      className="px-3 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 text-center font-medium"
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="px-3 py-2.5 bg-purple-50 border border-purple-200 text-purple-800 font-bold rounded-xl focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="cm">cm</option>
                      <option value="inches">inches</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>What will the box contain? <span className="text-pink-500">*</span></span>
                      <span className="text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md">
                        Vendor will calculate dimensions
                      </span>
                    </label>
                    <textarea
                      name="contentsDescription"
                      required
                      rows={3}
                      value={formData.contentsDescription}
                      onChange={handleChange}
                      placeholder="Describe the items that need to fit inside (e.g. '1 bottle of wine and 2 glasses with tissue padding', or '3 jars of honey and wooden spoon', or 'Women&#39;s sneaker pair, size 39')..."
                      className="w-full px-4 py-2.5 bg-gray-50/50 border border-pink-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm text-gray-900 leading-relaxed font-medium placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-amber-50/80 border border-pink-200/90 flex items-start gap-3 text-xs text-purple-950">
                    <span className="text-xl shrink-0">💡</span>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">
                        Hassle-Free Vendor Sizing Service
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        Don't know the exact measurements? No problem. Our packaging engineers will calculate optimal interior clearance, padding buffer, and carton proportions so your items fit safely and beautifully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Color & Custom Specifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Color &amp; Custom Specifications
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Color Preference &amp; Box Features
                </label>
                <textarea
                  name="printingRequirements"
                  rows={3}
                  value={formData.printingRequirements}
                  onChange={handleChange}
                  placeholder="Specify desired exterior color shade (e.g. Blossom Pink, Natural Kraft, Snow White, Lavender), clear window cutout preference, or ribbon tie closure..."
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Additional Notes or Target Delivery Date
                </label>
                <textarea
                  name="additionalNotes"
                  rows={2}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="e.g. Need samples by next Friday, weight capacity requirements, special inserts..."
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/products" className="text-sm font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1.5">
                ← Back to Box Catalog
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Submit Custom Quote Request →'}
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      }
    >
      <QuoteFormContent />
    </Suspense>
  );
}
