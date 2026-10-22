'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  Package,
  Zap,
  Sparkles,
  Play,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout, loading: authLoading } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in the Admin portal, hide the public storefront Navbar
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // On the signup and login pages: only show the logo, the home nav button, and the box catalog nav button
  if (pathname === '/signup' || pathname === '/login') {
    return (
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Package className="w-5 h-5 stroke-[2.2] text-stone-950" />
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white flex items-center">
                Blossom<span className="text-amber-500 font-extrabold">&amp;</span>Box
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1" />
              </span>
            </Link>

            {/* Nav: Home, Box Catalog, and Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-xs sm:text-sm font-bold transition shadow-2xs"
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Box Catalog</span>
                </Link>
              </nav>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle light and dark mode"
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900 text-stone-900 dark:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-white" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-900" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Package className="w-5 h-5 stroke-[2.2] text-stone-950" />
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white flex items-center">
              Blossom<span className="text-amber-500 font-extrabold">&amp;</span>Box
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1" />
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] font-bold text-stone-900 dark:text-white ml-1.5">
              <Zap className="w-3 h-3 text-stone-900 dark:text-white" />
              Min 1 Unit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600 dark:text-stone-300">
            <Link
              href="/products"
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Box Catalog
            </Link>
            <Link
              href="/quote"
              className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Request Quote</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-full shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-stone-950" />
                Custom
              </span>
            </Link>
            <Link
              href="/videos"
              className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5 text-stone-900 dark:text-white" />
              </span>
              TikTok Showcase
            </Link>
            <Link
              href="/account"
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Orders &amp; Reorder
            </Link>
          </nav>

          {/* Right Action: Auth Buttons, Theme Toggle & Cart */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Customer Auth State */}
            <div className="hidden sm:flex items-center gap-2">
              {!authLoading && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    title="Log Out"
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : !authLoading ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light and dark mode"
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900 text-stone-900 dark:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-white" />
              ) : (
                <Moon className="w-4 h-4 text-stone-900" />
              )}
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-white text-sm font-bold border border-stone-200 dark:border-stone-800 transition shadow-2xs group"
            >
              <ShoppingBag className="w-4 h-4 text-stone-900 dark:text-white group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-black bg-amber-500 text-stone-950 rounded-full shadow-2xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-900"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-stone-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-stone-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
            >
              Box Catalog
            </Link>
            <Link
              href="/quote"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
            >
              Request a Custom Quote
            </Link>
            <Link
              href="/videos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
            >
              TikTok Video Showcase
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
            >
              Order History &amp; Reorder
            </Link>

            {/* Customer Auth mobile options */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Signed in as {user.name}
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-900 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1 px-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white font-semibold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
