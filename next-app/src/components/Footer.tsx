'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Package, Zap, Rocket, Truck, MessageCircle, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890';
  const tiktokHandle = process.env.NEXT_PUBLIC_TIKTOK_HANDLE || '@packagingsolutions';

  // In the Admin portal, hide the public storefront Footer
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-amber-500/30 bg-amber-50 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Blossom & Box Gh Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white flex items-center leading-none">
                  Blossom<span className="text-amber-400">&amp;</span>Box&nbsp;<span className="text-amber-400 text-sm">Gh</span>
                </span>
                <span className="text-[11px] text-amber-200/80 italic font-serif mt-1">
                  Where every gift blooms.
                </span>
              </div>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Specialized packaging and bespoke boxes crafted to any custom size and color. Order from 1 unit with nationwide delivery in Ghana.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-stone-300">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Contact us: <a href="tel:0257724026" className="font-bold text-white hover:text-amber-400 transition-colors">0257724026</a></span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://tiktok.com/${tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center text-white transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V8.9a8.28 8.28 0 0 0 4.84 1.56V7a4.85 4.85 0 0 1-.92-.31z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Box Structures
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/products?category=E-Commerce+Shipping" className="hover:text-amber-400 transition-colors">
                  Shipping Boxes
                </Link>
              </li>
              <li>
                <Link href="/products?category=Apparel+%26+Clothing" className="hover:text-amber-400 transition-colors">
                  Mailer &amp; Apparel Boxes
                </Link>
              </li>
              <li>
                <Link href="/products?category=Food+%26+Bakery" className="hover:text-amber-400 transition-colors">
                  Bakery &amp; Cake Boxes
                </Link>
              </li>
              <li>
                <Link href="/products?category=Watch+%26+Jewelry+Boxes" className="hover:text-amber-400 transition-colors">
                  Rigid Luxury Gift Boxes
                </Link>
              </li>
              <li>
                <Link href="/products?category=Heavy+Industrial" className="hover:text-amber-400 transition-colors">
                  Heavy-Duty Storage
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Customer Portal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Customer Services
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/quote" className="hover:text-amber-400 transition-colors">
                  Request Custom Quote
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-amber-400 transition-colors">
                  TikTok Video Showcase
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-amber-400 transition-colors">
                  My Orders &amp; Reorder
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-amber-400 transition-colors">
                  Create Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Delivery & Guarantee */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Delivery Urgency Matrix
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-white shrink-0" />
                <span><strong className="text-stone-200">Same-Day Express:</strong> +100% surge</span>
              </li>
              <li className="flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-white shrink-0" />
                <span><strong className="text-stone-200">Next-Day Express:</strong> +50% surge</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-white shrink-0" />
                <span><strong className="text-stone-200">Priority (2–3 days):</strong> +20% surge</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-white shrink-0" />
                <span><strong className="text-stone-200">Standard (4+ days):</strong> Base rate</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-stone-500">
              Secure payments powered by Paystack. All cardboard products 100% recyclable.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-900 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} Blossom&amp;Box Packaging Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
