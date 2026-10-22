import React from 'react';
import Link from 'next/link';
import { SHOWCASE_VIDEOS } from '@/data/showcaseVideos';
import VideoCard from '@/components/VideoCard';
import { Flame, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function VideoGalleryPage() {
  const tiktokHandle = process.env.NEXT_PUBLIC_TIKTOK_HANDLE || '@blossomandboxgh';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full mb-4">
            <Flame className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
            TikTok Video Showcase
          </div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight sm:text-5xl">
            Boxes in Action: Creative Unboxing &amp; Production
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-400">
            Watch custom packaging assembled, drop-tested, and unboxed in real time.
            Follow our official TikTok channel <span className="font-bold text-amber-600 dark:text-amber-400">{tiktokHandle}</span> for daily highlights.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`https://tiktok.com/${tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V8.9a8.28 8.28 0 0 0 4.84 1.56V7a4.85 4.85 0 0 1-.92-.31z" />
              </svg>
              <span>Follow on TikTok</span>
            </a>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition shadow-sm"
            >
              <span>Request Custom Sizing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Video Grid using Interactive VideoCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SHOWCASE_VIDEOS.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              tiktokHandle={tiktokHandle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
