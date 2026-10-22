'use client';

// src/app/checkout/page.tsx
// Checkout page — Client Component.

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, effectiveUnitPrice } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import DeliveryFeeCalculator from '@/components/DeliveryFeeCalculator';
import {
  ShoppingCart,
  Package,
  Ruler,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  Lock,
} from 'lucide-react';

// ── Country options ──────────────────────────────────────────────────────────
const COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'GH', label: 'Ghana' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'Other', label: 'Other' },
];

// ── Form types ───────────────────────────────────────────────────────────────
interface AddressForm {
  fullName: string;
  email: string;
  streetAddress: string;
  apartmentOrUnit: string;
  landmarkOrInstructions: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  digitalAddressGps: string;
}

type FormErrors = Partial<Record<keyof AddressForm, string>>;

const INITIAL_FORM: AddressForm = {
  fullName: '',
  email: '',
  streetAddress: '',
  apartmentOrUnit: '',
  landmarkOrInstructions: '',
  city: '',
  stateOrProvince: '',
  postalCode: '',
  countryCode: 'GH',
  digitalAddressGps: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function validateForm(form: AddressForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address.';
  if (!form.city.trim()) errors.city = 'City is required.';
  if (!form.countryCode) errors.countryCode = 'Please select a country.';
  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useCustomerAuth();

  const [form, setForm] = useState<AddressForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [baseDeliveryRate, setBaseDeliveryRate] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [globalError, setGlobalError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Auto-fill logged-in customer info
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        streetAddress: prev.streetAddress || user.address?.streetAddress || '',
        apartmentOrUnit: prev.apartmentOrUnit || user.address?.apartmentOrUnit || '',
        city: prev.city || user.address?.city || '',
        countryCode: prev.countryCode || user.address?.countryCode || 'GH',
      }));
    }
  }, [user]);

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.baseDeliveryRate) {
          setBaseDeliveryRate(data.settings.baseDeliveryRate);
        }
      })
      .catch(() => {});
  }, []);

  // MOQ check across all items
  const moqViolations = items.filter(
    (item) => item.quantity < (item.minOrderQuantity ?? 1)
  );

  const total = subtotal + deliveryFee;

  // Handle address form change
  const handleField = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  // Submit order + initialize Paystack
  const handleSubmit = useCallback(async () => {
    setGlobalError('');

    if (moqViolations.length > 0) {
      setGlobalError(
        'Some items do not meet the minimum order quantity. Please update your cart.'
      );
      return;
    }

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGlobalError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order in MongoDB
      const orderPayload = {
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
        },
        shippingAddress: {
          streetAddress: form.streetAddress.trim(),
          apartmentOrUnit: form.apartmentOrUnit.trim(),
          landmarkOrInstructions: form.landmarkOrInstructions.trim(),
          city: form.city.trim(),
          stateOrProvince: form.stateOrProvince.trim(),
          postalCode: form.postalCode.trim(),
          countryCode: form.countryCode,
          digitalAddressGps: form.digitalAddressGps.trim(),
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: effectiveUnitPrice(i),
          subtotal: effectiveUnitPrice(i) * i.quantity,
        })),
        subtotal,
        deliveryFee,
        total,
        preferredDeliveryDate: preferredDate || undefined,
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to place order. Please try again.');
      }

      const orderData = await orderRes.json();
      const orderId: string = orderData.order?._id ?? orderData._id;

      // 2. Initialize Paystack transaction
      const paystackRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email: form.email.trim(),
          amount: total,
        }),
      });

      if (!paystackRes.ok) {
        const paystackErr = await paystackRes.json().catch(() => ({}));
        throw new Error(
          paystackErr.error ||
            'Could not initialize Paystack payment. Your order has been recorded — please contact support.'
        );
      }

      const paystackData = await paystackRes.json();
      const authorizationUrl: string =
        paystackData.data?.authorization_url ?? paystackData.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error('Payment authorization URL not returned.');
      }

      clearCart();
      window.location.href = authorizationUrl;
    } catch (err: unknown) {
      setGlobalError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    items,
    form,
    subtotal,
    deliveryFee,
    total,
    preferredDate,
    moqViolations.length,
    clearCart,
  ]);

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-5 text-center px-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white flex items-center justify-center">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">Your cart is empty</h1>
          <Link
            href="/products"
            className="rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2.5 font-bold text-stone-950 transition-colors shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">Checkout</h1>

        {/* Global error */}
        {globalError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {globalError}
          </div>
        )}

        {/* MOQ violations banner */}
        {moqViolations.length > 0 && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-stone-900 dark:text-white" />
            <span>
              <strong>MOQ not met for:</strong>{' '}
              {moqViolations.map((i) => `${i.title} (min ${i.minOrderQuantity})`).join(', ')}.{' '}
              <Link href="/cart" className="underline font-medium">
                Update cart
              </Link>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* ── Section 1: Order Summary ── */}
            <section className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3">
                1. Order Summary
              </h2>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {items.map((item) => {
                  const unitPrice = effectiveUnitPrice(item);
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <div key={item.variantSku} className="flex items-center gap-4 py-3">
                      {/* Image */}
                      <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stone-300 dark:text-stone-700">
                            <Package className="w-6 h-6 stroke-[1.5]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{item.variantName}</p>
                        {item.customDimensions && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 inline-flex items-center gap-1">
                            <Ruler className="w-3 h-3 text-stone-900 dark:text-white" />
                            {item.customDimensions.length}×{item.customDimensions.width}×{item.customDimensions.height} {item.customDimensions.unit}
                            {item.customColor && ` · ${item.customColor}`}
                          </p>
                        )}
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                          Qty: {item.quantity} × GH₵{unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-stone-900 dark:text-white flex-shrink-0">
                        GH₵{lineTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2 border-t border-stone-100 dark:border-stone-800 font-semibold text-stone-800 dark:text-stone-200">
                <span>Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
            </section>

            {/* ── Section 2: Delivery Address ── */}
            <section className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3">
                2. Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Full Name *"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleField}
                  error={errors.fullName}
                />
                <FormField
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleField}
                  error={errors.email}
                />
                <FormField
                  label="Street Address"
                  name="streetAddress"
                  value={form.streetAddress}
                  onChange={handleField}
                  className="sm:col-span-2"
                />
                <FormField
                  label="Apartment / Unit"
                  name="apartmentOrUnit"
                  value={form.apartmentOrUnit}
                  onChange={handleField}
                />
                <FormField
                  label="Landmark / Delivery Instructions"
                  name="landmarkOrInstructions"
                  value={form.landmarkOrInstructions}
                  onChange={handleField}
                />
                <FormField
                  label="City *"
                  name="city"
                  value={form.city}
                  onChange={handleField}
                  error={errors.city}
                />
                <FormField
                  label="State / Province"
                  name="stateOrProvince"
                  value={form.stateOrProvince}
                  onChange={handleField}
                />
                <FormField
                  label="Postal Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleField}
                />

                {/* Country selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    Country *
                  </label>
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleField}
                    className={`rounded-xl border px-3 py-2.5 text-stone-900 dark:text-white bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400/20 ${
                      errors.countryCode
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-stone-300 dark:border-stone-700 focus:border-amber-500'
                    }`}
                  >
                    <option value="">Select country…</option>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.countryCode && (
                    <p className="text-xs text-red-600">{errors.countryCode}</p>
                  )}
                </div>

                <FormField
                  label="Digital Address / GPS"
                  name="digitalAddressGps"
                  value={form.digitalAddressGps}
                  onChange={handleField}
                  placeholder="e.g. GH-123-456"
                />
              </div>
            </section>

            {/* ── Section 3: Delivery Date & Fee ── */}
            <section className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3">
                3. Preferred Delivery Date
              </h2>
              <DeliveryFeeCalculator
                baseDeliveryRate={baseDeliveryRate}
                onFeeChange={setDeliveryFee}
                onDateChange={setPreferredDate}
              />
            </section>
          </div>

          {/* Right: Payment Summary */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xs space-y-4 sticky top-24">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              4. Payment Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>Delivery fee</span>
                <span>GH₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 dark:text-white text-base border-t border-stone-100 dark:border-stone-800 pt-2">
                <span>Total</span>
                <span className="text-amber-600 dark:text-amber-400">GH₵{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || moqViolations.length > 0}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 font-bold text-stone-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Paystack</span>
                </>
              )}
            </button>

            <p className="text-xs text-center text-stone-400 dark:text-stone-500 inline-flex items-center justify-center gap-1 w-full">
              <Lock className="w-3 h-3 text-stone-900 dark:text-white" />
              <span>Redirected to Paystack for secure 256-bit payment.</span>
            </p>

            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-1.5 w-full text-center text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
              <span>Back to Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Reusable form field ───────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={name} className="text-sm font-semibold text-stone-700 dark:text-stone-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`rounded-xl border px-3 py-2.5 text-stone-900 dark:text-white bg-white dark:bg-stone-900 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 ${
          error
            ? 'border-red-400 focus:border-red-400'
            : 'border-stone-300 dark:border-stone-700 focus:border-amber-500'
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
