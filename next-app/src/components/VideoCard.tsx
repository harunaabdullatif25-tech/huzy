'use client';

// src/components/VideoCard.tsx
// Interactive video card supporting direct MP4 video playback, TikTok embeds,
// YouTube Shorts, or styled fallback previews.

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShowcaseVideo, parseVideoSource } from '@/data/showcaseVideos';
import { Play, X, ArrowRight, Eye } from 'lucide-react';

interface VideoCardProps {
  video: ShowcaseVideo;
  tiktokHandle: string;
}

export default function VideoCard({ video, tiktokHandle }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const source = parseVideoSource(video);

  const handlePlayClick = () => {
    if (source.type === 'none') {
      setShowHelper(true);
    } else {
      setIsPlaying(true);
    }
  };

  const directTikTokLink =
    video.tiktokUrl ||
    `https://tiktok.com/${tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`}`;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* ── 9:16 Vertical Video Screen ── */}
      <div className="relative aspect-[9/16] max-h-[440px] bg-stone-950 overflow-hidden flex flex-col justify-between text-white">
        {/* State A: Playing MP4 Video */}
        {isPlaying && source.type === 'mp4' && (
          <div className="absolute inset-0 bg-black z-20 flex items-center justify-center">
            <video
              src={source.src}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition"
              title="Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State B: Playing TikTok Embed */}
        {isPlaying && source.type === 'tiktok' && (
          <div className="absolute inset-0 bg-black z-20 flex flex-col">
            <div className="flex justify-between items-center p-2 bg-black/80 z-30">
              <span className="text-[11px] font-semibold text-stone-300">TikTok Embed</span>
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs hover:bg-white/30 inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Close
              </button>
            </div>
            <iframe
              src={source.embedUrl}
              className="w-full flex-1 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {/* State C: Playing YouTube Embed */}
        {isPlaying && source.type === 'youtube' && (
          <div className="absolute inset-0 bg-black z-20 flex flex-col">
            <div className="flex justify-between items-center p-2 bg-black/80 z-30">
              <span className="text-[11px] font-semibold text-stone-300">YouTube Player</span>
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs hover:bg-white/30 inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Close
              </button>
            </div>
            <iframe
              src={source.embedUrl}
              className="w-full flex-1 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Poster thumbnail (if not playing) */}
        {!isPlaying && video.thumbnailUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/30" />
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="relative z-10 p-4 flex justify-between items-start">
          <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-[11px] font-bold text-stone-200 border border-stone-800">
            {video.category}
          </span>
          {video.views && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/70 backdrop-blur-md text-stone-200 text-xs font-bold">
              <Eye className="w-3 h-3 text-white" />
              <span>{video.views}</span>
            </span>
          )}
        </div>

        {/* Centered Play Button (if not currently playing) */}
        {!isPlaying && (
          <div className="relative z-10 flex flex-col items-center justify-center my-auto cursor-pointer" onClick={handlePlayClick}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform active:scale-95"
              aria-label={`Play video: ${video.title}`}
            >
              <Play className="w-7 h-7 fill-stone-950 ml-0.5" />
            </button>
            <span className="text-xs font-bold text-stone-200 mt-2 bg-stone-950/60 px-3 py-1 rounded-full backdrop-blur-md">
              Watch Demo
            </span>
          </div>
        )}

        {/* Bottom overlay inside video window */}
        <div className="relative z-10 p-4 space-y-2 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent">
          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {video.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-medium text-amber-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper modal/drawer if video file is not yet uploaded */}
      {showHelper && (
        <div className="p-4 bg-amber-500/10 border-t border-amber-500/30 text-xs space-y-2">
          <div className="flex justify-between items-center font-bold text-stone-900 dark:text-white">
            <span>Video Preview Ready</span>
            <button
              type="button"
              onClick={() => setShowHelper(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            Drop your local MP4 into <code className="bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400">public/videos/</code> or paste the embed link to activate in-browser playback.
          </p>
          <a
            href={directTikTokLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 hover:underline"
          >
            <Play className="w-3 h-3 fill-current text-stone-900 dark:text-white" />
            Watch this packaging clip on TikTok
          </a>
        </div>
      )}

      {/* ── Card Bottom Meta & Actions ── */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <h3 className="font-bold text-stone-900 dark:text-white text-lg mb-1 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Channel: <span className="font-semibold text-stone-700 dark:text-stone-300">{tiktokHandle}</span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <a
            href={directTikTokLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white inline-flex items-center gap-1 font-semibold"
          >
            <span>Open in TikTok</span>
            <ArrowRight className="w-3 h-3 text-stone-900 dark:text-white" />
          </a>

          <Link
            href="/quote"
            className="font-bold text-amber-800 dark:text-amber-300 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition inline-flex items-center gap-1"
          >
            <span>Order This Box Style</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
