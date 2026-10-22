'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BackgroundSlide {
  url: string;
  title: string;
  category: string;
}

const HERO_SLIDES: BackgroundSlide[] = [
  {
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1920&q=85',
    title: 'Luxury Gift & Presentation Boxes',
    category: 'Rigid Presentation',
  },
  {
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1920&q=85',
    title: 'Custom Fast-Seal Mailer Packaging',
    category: 'E-Commerce Mailers',
  },
  {
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1920&q=85',
    title: 'Velvet & Gold-Accented Jewelry Cases',
    category: 'Fine Jewelry & Watch',
  },
  {
    url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=1920&q=85',
    title: 'Bespoke Retail & Apparel Cartons',
    category: 'Fashion & Apparel',
  },
  {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=85',
    title: 'Heavy-Duty Reinforced Corrugated Shipping',
    category: 'Industrial & Storage',
  },
];

interface HeroBackgroundSliderProps {
  children: React.ReactNode;
}

export default function HeroBackgroundSlider({ children }: HeroBackgroundSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-center text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Packaging Showcase Hero"
    >
      {/* ── Background Image Slideshow with Cross-Fade ── */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={slide.url}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.url}
                alt={slide.title}
                fill
                priority={idx === 0}
                className={`object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                sizes="100vw"
              />
            </div>
          );
        })}

        {/* ── Elegant Vignette & Scrim Overlays ── */}
        {/* Primary dark scrim for high contrast typography */}
        <div className="absolute inset-0 z-20 bg-stone-950/70 backdrop-blur-[1px]" />
        {/* Subtle warm gold ambient gradient from top */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/95" />
        <div className="absolute top-0 inset-x-0 h-40 z-20 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── Hero Foreground Content ── */}
      <div className="relative z-30 w-full py-16 sm:py-24">
        {children}
      </div>

      {/* ── Slider Navigation & Slide Indicator ── */}
      <div className="relative z-30 pb-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="p-1.5 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-white/10 transition"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIdx;
              return (
                <button
                  key={slide.url}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-8 bg-amber-500 shadow-md shadow-amber-500/40'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="p-1.5 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white border border-white/10 transition"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Active Slide Caption Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-stone-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-300 font-semibold">{HERO_SLIDES[currentIdx].category}:</span>
          <span>{HERO_SLIDES[currentIdx].title}</span>
        </div>
      </div>
    </section>
  );
}
