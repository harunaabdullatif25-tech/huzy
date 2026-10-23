// src/app/page.tsx
// Homepage — Server Component with rotating background product showcase.

import Link from 'next/link';
import HomeSearchWrapper from './HomeSearchWrapper';
import HeroBackgroundSlider from '@/components/HeroBackgroundSlider';
import {
  Ruler,
  Zap,
  Palette,
  MessageCircle,
  Shirt,
  UtensilsCrossed,
  Sparkles,
  Package,
  Gift,
  Watch,
  Flame,
  Play,
  ArrowRight,
} from 'lucide-react';

const TIKTOK_HANDLE =
  process.env.NEXT_PUBLIC_TIKTOK_HANDLE ?? '@yourbrand';

const FEATURED_CATEGORIES = [
  {
    name: 'Apparel & Fashion',
    icon: Shirt,
    category: 'Apparel & Clothing',
    description: 'Peel-and-seal mailers & garment boxes',
  },
  {
    name: 'Food & Bakery',
    icon: UtensilsCrossed,
    category: 'Food & Bakery',
    description: 'Grease-resistant cake & treat display boxes',
  },
  {
    name: 'Cosmetics & Beauty',
    icon: Sparkles,
    category: 'Cosmetics & Beauty',
    description: 'Premium subscription & makeup containers',
  },
  {
    name: 'E-Commerce Shipping',
    icon: Package,
    category: 'E-Commerce Shipping',
    description: 'Rigid corrugated mailers & crush-proof cartons',
  },
  {
    name: 'Gift & Luxury',
    icon: Gift,
    category: 'Gift & Luxury',
    description: 'Magnetic closing presentation boxes',
  },
  {
    name: 'Watch & Jewelry',
    icon: Watch,
    category: 'Watch & Jewelry Boxes',
    description: 'Velvet-lined luxury display cases',
  },
];

function TikTokLogoSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6 text-white"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.72a8.2 8.2 0 004.79 1.52V6.79a4.85 4.85 0 01-1.02-.1z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* ── Hero Section with Changing Product Backgrounds ── */}
      <HeroBackgroundSlider>
        <div className="mx-auto max-w-5xl px-4 flex flex-col items-center text-center gap-6">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-900/80 border border-amber-500/40 px-4 py-1.5 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-serif italic">Blossom &amp; Box Gh</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-200">
              Where Every Gift Blooms
            </span>
            <span className="hidden sm:inline text-stone-400">·</span>
            <span className="hidden sm:inline text-stone-300 font-normal">
              From 1 Unit
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl text-white">
            100% Made-To-Order Packaging,{' '}
            <span className="text-amber-400">
              Crafted to Any Size
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-stone-300 max-w-2xl font-normal leading-relaxed">
            No premade boxes. Choose your exact dimensions (Length × Width × Height) and exterior color shade — manufactured on demand starting from just 1 box.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-8 py-3.5 font-bold text-stone-950 shadow-lg shadow-amber-950/20 hover:scale-105 active:scale-95 transition-all text-base"
            >
              <span>Configure Your Box Now</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </Link>
            <Link
              href="/quote"
              className="rounded-xl border border-amber-500/50 bg-stone-900/60 hover:bg-stone-900/90 hover:border-amber-400 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-all text-base"
            >
              Request Custom Quote
            </Link>
          </div>

          {/* Voice-enabled Search Bar Island */}
          <div className="w-full max-w-2xl mt-3">
            <HomeSearchWrapper />
          </div>
        </div>
      </HeroBackgroundSlider>

      {/* ── 4 Value Highlights ── */}
      <section className="mx-auto w-full max-w-6xl px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 flex items-start gap-3.5 transition duration-200">
            <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5 text-stone-900 dark:text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">Not Premade — 100% Custom</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                Choose any custom dimensions and color shade. Order starting from 1 unit!
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 flex items-start gap-3.5 transition duration-200">
            <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-stone-900 dark:text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">Same-Day Urgent Delivery</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                Dynamic pricing matrix with same-day and next-day express delivery options.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 flex items-start gap-3.5 transition duration-200">
            <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-stone-900 dark:text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">Curated Box Colors</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                Choose from seasonal luxury shades or request your custom exterior Pantone tone.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-500/40 flex items-start gap-3.5 transition duration-200">
            <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-stone-900 dark:text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">Instant WhatsApp Help</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                Connect directly with packaging engineers for live dimensions and assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Categories Section ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold tracking-widest text-stone-900 dark:text-stone-100 uppercase bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 rounded-full">
            Collections &amp; Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
            Find the Perfect Packaging for Your Industry
          </h2>
          <p className="text-stone-600 dark:text-stone-400 max-w-xl mx-auto text-sm sm:text-base">
            Every style is crafted to deliver exceptional unboxing experiences.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_CATEGORIES.map(({ name, icon: Icon, category }) => (
            <Link
              key={name}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:shadow-md hover:border-amber-500/50 transition-all duration-200 text-center transform hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                <Icon className="w-7 h-7 stroke-[2] text-stone-900 dark:text-white group-hover:text-stone-950 transition-colors" />
              </div>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-auto bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-amber-500/20 group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TikTok Showcase ── */}
      <section className="bg-stone-950 text-white py-16 sm:py-20 relative overflow-hidden border-t border-stone-800">
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col items-center text-center mb-12 gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-white text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-white" />
              Trending Unboxings
            </div>
            <div className="flex items-center gap-2.5">
              <TikTokLogoSVG />
              <h2 className="text-3xl sm:text-4xl font-black">
                See Our Boxes in Action
              </h2>
            </div>
            <p className="text-stone-400 max-w-md text-sm sm:text-base">
              Follow our viral packaging videos, assembly tips, and customer unboxing reactions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={`https://tiktok.com/${TIKTOK_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 px-6 py-2.5 text-sm font-bold shadow-md hover:scale-105 transition-all"
              >
                <TikTokLogoSVG />
                Follow on TikTok · {TIKTOK_HANDLE}
              </a>
              <Link
                href="/videos"
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 px-5 py-2.5 text-sm font-semibold text-white transition-all"
              >
                Watch Video Gallery →
              </Link>
            </div>
          </div>

          {/* Styled Video Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Fast-Seal Mailer Assembly in 3s',
                views: '48.2K views',
                tag: 'Mailer Boxes',
                icon: Zap,
              },
              {
                title: 'Metallic Gold Foil Unboxing Test',
                views: '92.5K views',
                tag: 'Luxury Gift Box',
                icon: Sparkles,
              },
              {
                title: 'Drop Test: 15kg Heavy-Duty Storage',
                views: '24.1K views',
                tag: 'Shipping Boxes',
                icon: Package,
              },
            ].map((video, idx) => {
              const Icon = video.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between rounded-2xl bg-stone-900 border border-stone-800 p-6 aspect-[4/5] overflow-hidden hover:border-amber-500/50 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full bg-stone-800 text-[11px] font-bold text-stone-300">
                      {video.tag}
                    </span>
                    <span className="text-xs font-bold text-stone-300">
                      {video.views}
                    </span>
                  </div>

                  <div className="my-auto flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-stone-950 text-stone-950 ml-0.5" />
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                      <Icon className="w-3.5 h-3.5 text-white" />
                      <span>Packaging Highlight</span>
                    </div>
                    <h3 className="font-bold text-white text-base sm:text-lg leading-snug px-2">
                      {video.title}
                    </h3>
                  </div>

                  <Link
                    href="/videos"
                    className="text-center text-xs font-bold text-stone-300 hover:text-white underline underline-offset-4"
                  >
                    Watch in video gallery →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
