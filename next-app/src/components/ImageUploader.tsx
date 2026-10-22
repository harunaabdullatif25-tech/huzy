// src/components/ImageUploader.tsx
// Component for uploading, adding via URL, previewing, and reordering product/variant images.
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Package, X, Sparkles, Check, ImageIcon, Upload, Plus, Trash2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

const PRESET_PACKAGING_IMAGES = [
  {
    name: 'Pastel Pink Mailer Box',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
    category: 'Mailer',
  },
  {
    name: 'Natural Kraft Corrugated Box',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
    category: 'Shipping',
  },
  {
    name: 'Crisp White Gift Box',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    category: 'Gift',
  },
  {
    name: 'Midnight Noir Rigid Box',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    category: 'Luxury',
  },
  {
    name: 'Lavender Bloom Box',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&q=80',
    category: 'Apparel',
  },
  {
    name: 'Sunshine Yellow Box',
    url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80',
    category: 'Gift',
  },
  {
    name: 'Eco Kraft Bakery Box',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    category: 'Food',
  },
  {
    name: 'Sturdy Shipping Carton',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    category: 'Corrugated',
  },
];

export default function ImageUploader({
  images,
  onChange,
  label = 'Product Images',
  maxImages = 8,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      setUploadError('This image URL is already added.');
      return;
    }
    if (images.length >= maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed.`);
      return;
    }
    setUploadError(null);
    onChange([...images, trimmed]);
    setUrlInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange([...images, data.url]);
    } catch (err: any) {
      setUploadError(err.message || 'File upload error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const cover = images[indexToCover];
    const remaining = images.filter((_, idx) => idx !== indexToCover);
    onChange([cover, ...remaining]);
  };

  const handleAddPreset = (presetUrl: string) => {
    if (images.includes(presetUrl)) return;
    if (images.length >= maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed.`);
      return;
    }
    onChange([...images, presetUrl]);
  };

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-stone-900 dark:text-white">{label}</label>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {images.length} of {maxImages} images added (first image is cover)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowPresets((p) => !p)}
          className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 transition-colors flex items-center gap-1.5 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 shadow-2xs"
        >
          <Package className="w-3.5 h-3.5 text-stone-900 dark:text-white" />
          <span>{showPresets ? 'Hide Packaging Presets' : 'Preset Photos Library'}</span>
        </button>
      </div>

      {uploadError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Preset Library Drawer */}
      {showPresets && (
        <div className="rounded-xl bg-white dark:bg-stone-800 p-3.5 border border-stone-200 dark:border-stone-700 shadow-2xs space-y-2.5">
          <p className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stone-900 dark:text-white" /> One-Click High-Res Packaging Photography
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_PACKAGING_IMAGES.map((preset) => {
              const isAdded = images.includes(preset.url);
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handleAddPreset(preset.url)}
                  disabled={isAdded || images.length >= maxImages}
                  className={`group relative rounded-lg border p-1 text-left transition-all ${
                    isAdded
                      ? 'border-emerald-500 bg-emerald-500/10 opacity-75 cursor-default'
                      : 'border-stone-200 dark:border-stone-700 hover:border-amber-500 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded overflow-hidden bg-stone-100 dark:bg-stone-800 mb-1.5">
                    <Image
                      src={preset.url}
                      alt={preset.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {isAdded && (
                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-700 px-1.5 py-0.5 rounded shadow">
                          <Check className="w-3 h-3" /> Added
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 truncate leading-tight">
                    {preset.name}
                  </p>
                  <span className="text-[9px] text-stone-400 block">{preset.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of already added images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((imgUrl, idx) => (
            <div
              key={imgUrl}
              className={`group relative aspect-square rounded-xl overflow-hidden border transition-all ${
                idx === 0
                  ? 'border-amber-500 ring-2 ring-amber-400/20'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900'
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Product image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />

              {/* Cover badge */}
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-bold shadow-xs">
                  Cover
                </span>
              )}

              {/* Action overlays */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs shadow-xs"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="w-full py-1 text-center rounded bg-white text-stone-900 text-[10px] font-bold shadow-xs hover:bg-amber-500 hover:text-stone-950 transition"
                  >
                    Set as Cover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 text-center">
          <ImageIcon className="w-8 h-8 text-stone-400 mb-1" />
          <p className="text-xs font-bold text-stone-700 dark:text-stone-300">No images attached yet</p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
            Upload from computer, enter an image URL, or choose from our preset photo library.
          </p>
        </div>
      )}

      {/* Upload and URL input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* File upload input */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <button
            type="button"
            disabled={isUploading || images.length >= maxImages}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-200 shadow-2xs hover:border-amber-500 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <span>Uploading Image...</span>
            ) : (
              <>
                <Upload className="w-4 h-4 text-stone-900 dark:text-white" />
                <span>Upload Image from Computer</span>
              </>
            )}
          </button>
        </div>

        {/* URL input */}
        <div className="flex gap-1.5">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Paste image web URL..."
            className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 bg-white dark:bg-stone-800 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAddUrl()}
            disabled={!urlInput.trim() || images.length >= maxImages}
            className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-stone-950 shadow-2xs hover:bg-amber-400 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
