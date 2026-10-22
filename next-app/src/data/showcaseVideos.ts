// src/data/showcaseVideos.ts
// Showcase and TikTok Video configuration for Blossom&Box.
//
// HOW TO ADD YOUR OWN VIDEOS:
// ─────────────────────────────────────────────────────────────────────────────
// METHOD 1: LOCAL MP4 / WEBM VIDEO FILES (Recommended for fastest playback)
//   1. Drop your video file (e.g. unboxing.mp4) into the "public/videos/" folder.
//   2. Set `videoUrl: '/videos/unboxing.mp4'` below.
//
// METHOD 2: TIKTOK VIDEOS
//   1. Copy the full link to your TikTok video, e.g.:
//      'https://www.tiktok.com/@blossomandboxgh/video/7391823791238912345'
//   2. Set `tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/video/...'`
//      The player will automatically embed and play the TikTok clip!
//
// METHOD 3: YOUTUBE SHORTS OR VIDEOS
//   1. Copy the YouTube link (e.g. 'https://www.youtube.com/shorts/AbCdEf123')
//   2. Set `youtubeUrl: 'https://www.youtube.com/shorts/AbCdEf123'`
//
// METHOD 4: EXTERNAL CLOUD VIDEO URL
//   1. Set `videoUrl: 'https://your-storage-bucket.com/video.mp4'`
// ─────────────────────────────────────────────────────────────────────────────

export interface ShowcaseVideo {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl?: string;      // e.g. '/videos/my-box-video.mp4' or web MP4 link
  tiktokUrl?: string;     // e.g. 'https://www.tiktok.com/@blossomandboxgh/video/1234567890'
  youtubeUrl?: string;    // e.g. 'https://www.youtube.com/shorts/xyz'
  thumbnailUrl?: string;  // optional cover image preview
  views?: string;
  likes?: string;
  date?: string;
  tags?: string[];
  productLink?: string;   // optional link to a specific product or /quote
}

export const SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: 'video-1',
    title: 'Custom Packaging & Unboxing by Blossom&Box',
    category: 'Featured Video',
    description: 'Watch our custom crafted boxes assembled, packed, and showcased on our official TikTok channel.',
    tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/video/7695619390695394578',
    views: 'Trending',
    likes: 'Viral',
    date: 'Latest',
    tags: ['#BlossomAndBox', '#GhanaPackaging', '#CustomBoxes'],
    productLink: '/products',
  },
  {
    id: 'video-2',
    title: 'Creative Box Assembly & Structural Crafting',
    category: 'Craftsmanship',
    description: 'Precision box folding, seamless corner assembly, and elegant presentation on TikTok.',
    tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/video/7684300806274796807',
    views: '112.9K',
    likes: '14.5K',
    date: 'Popular',
    tags: ['#LuxuryPackaging', '#BoxAssembly', '#BlossomAndBox'],
    productLink: '/products',
  },
  {
    id: 'video-3',
    title: 'Packaging Presentation & Product Gallery',
    category: 'Product Spotlight',
    description: 'Explore our latest packaging finishes, structural box samples, and presentation styles.',
    tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/photo/7680396412177206536',
    views: '88.1K',
    likes: '9.2K',
    date: 'Showcase',
    tags: ['#PackagingDesign', '#PhotoShowcase', '#BlossomAndBox'],
    productLink: '/products',
  },
  {
    id: 'video-4',
    title: 'Custom Packaging Creations & Highlights',
    category: 'Packaging In Action',
    description: 'See the latest custom boxes in action — crafted for beauty, protection, and premium unboxing.',
    tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/video/7696888711216106768',
    views: 'Trending',
    likes: 'Viral',
    date: 'New',
    tags: ['#CustomPackaging', '#BlossomAndBox', '#GhanaBoxes'],
    productLink: '/products',
  },
  {
    id: 'video-5',
    title: 'Surprise Unboxing & Special Celebration Boxes',
    category: 'Celebration Boxes',
    description: 'Watch the reveal and unboxing magic of our celebration & surprise gift boxes.',
    tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/video/7695938366549839122',
    views: '240.6K',
    likes: '38.4K',
    date: 'Trending',
    tags: ['#UnboxingMagic', '#GiftBox', '#BlossomAndBox'],
    productLink: '/products',
  },
  {
    id: 'video-6',
    title: 'Fast-Fold & Secure Packaging Assembly',
    category: 'Speed Packing',
    description: 'Watch our durable on-demand boxes assembled with speed and ease on our official TikTok channel.',
    tiktokUrl: 'https://www.tiktok.com/@blossomandboxgh/video/7695578558512565511',
    views: 'Popular',
    likes: 'Trending',
    date: 'Featured',
    tags: ['#FastPacking', '#BlossomAndBox', '#GhanaPackaging'],
    productLink: '/products',
  },
];

// ── Helpers to parse various video formats ───────────────────────────────────

export type VideoSourceType =
  | { type: 'mp4'; src: string }
  | { type: 'tiktok'; videoId: string; embedUrl: string; directUrl: string }
  | { type: 'youtube'; videoId: string; embedUrl: string }
  | { type: 'none' };

export function parseVideoSource(video: ShowcaseVideo): VideoSourceType {
  // 1. Direct video file (mp4, webm, etc.)
  if (video.videoUrl && video.videoUrl.trim()) {
    return { type: 'mp4', src: video.videoUrl.trim() };
  }

  // 2. TikTok URL or ID
  if (video.tiktokUrl && video.tiktokUrl.trim()) {
    const raw = video.tiktokUrl.trim();
    // Match ID from https://www.tiktok.com/@username/video/123... or /photo/123... or raw ID
    const match = raw.match(/(?:video|photo)\/(\d+)/) || raw.match(/(\d{15,22})/);
    const videoId = match ? match[1] : '';
    if (videoId) {
      return {
        type: 'tiktok',
        videoId,
        embedUrl: `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed&autoplay=1`,
        directUrl: raw.startsWith('http') ? raw : `https://www.tiktok.com/@blossomandboxgh/video/${videoId}`,
      };
    }
  }

  // 3. YouTube URL or Shorts
  if (video.youtubeUrl && video.youtubeUrl.trim()) {
    const raw = video.youtubeUrl.trim();
    const match =
      raw.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';
    if (videoId) {
      return {
        type: 'youtube',
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      };
    }
  }

  return { type: 'none' };
}
