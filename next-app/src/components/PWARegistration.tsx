'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / in standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(Boolean(isStandaloneMode));

    // 2. Register Service Worker in production or local environments supporting it
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered successfully:', registration.scope);

            // Handle updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (!installingWorker) return;
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available! Reload to update.');
                }
              };
            };
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Check if user dismissed prompt recently (e.g., within 7 days)
      const dismissedUntil = localStorage.getItem('bb_pwa_dismissed_until');
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] Blossom & Box Gh was installed successfully');
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[PWA] User accepted installation prompt');
      } else {
        console.log('[PWA] User dismissed installation prompt');
      }
    } catch (err) {
      console.error('[PWA] Error showing install prompt:', err);
    } finally {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('bb_pwa_dismissed_until', nextWeek.toString());
  };

  if (isStandalone || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-amber-200/60 dark:border-amber-900/40 text-stone-900 dark:text-stone-100 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-stone-800 p-1 flex-shrink-0 border border-amber-100 dark:border-stone-700 overflow-hidden flex items-center justify-center">
          <Image
            src="/icons/icon-192x192.png"
            alt="Blossom & Box App Icon"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <h2 className="text-sm font-semibold tracking-tight leading-tight">
            Install Blossom & Box
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-2">
            Add to your home screen for instant quotes, fast checkout, and offline access.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 -mr-1 -mt-1 rounded-md transition-colors cursor-pointer"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
