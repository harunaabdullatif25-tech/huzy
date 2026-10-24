'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl = rawRedirect || '/account';

  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        // If logged in as admin and not explicitly requesting a specific storefront page, take to /admin
        if (result.user?.role === 'admin' && (!rawRedirect || rawRedirect === '/account')) {
          router.push('/admin');
        } else {
          router.push(redirectUrl);
        }
        router.refresh();
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-8 sm:p-10">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group mb-2">
          <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200 ring-1 ring-amber-500/20 bg-amber-50 dark:bg-stone-900 shrink-0">
            <Image
              src="/logo.png"
              alt="Blossom & Box Gh Logo"
              width={44}
              height={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-stone-900 dark:text-white flex items-center leading-none">
              Blossom<span className="text-amber-500">&amp;</span>Box
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">Gh</span>
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium tracking-tight block mt-0.5">
              Where every gift blooms.
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">Customer Sign In</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Sign in to your account to review orders and reorder custom packaging.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-700 dark:text-red-300 font-medium">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800/60 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800/60 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
              <span>Signing In…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Don&apos;t have a Blossom&amp;Box account?{' '}
          <Link
            href={`/signup${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ''}`}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-stone-400 dark:text-stone-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Secure 256-bit Login
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Fast Reorder
        </span>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <main className="min-h-[85vh] bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 py-12 transition-colors">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-10 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-stone-500 mt-3">Loading login...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
