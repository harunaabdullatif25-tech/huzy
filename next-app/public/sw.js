const CACHE_NAME = 'blossom-box-cache-v1';
const OFFLINE_FALLBACK_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/logo.png',
  '/logo-transparent.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/favicon.ico',
];

// Install: pre-cache shell and offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Pre-caching warning:', err);
      }
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip API routes, admin mutations, or Next data actions from offline cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return;
  }

  // 1. Navigation requests (HTML pages) -> Network first, fallback to cached or offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const offlineFallback = await caches.match(OFFLINE_FALLBACK_URL);
          if (offlineFallback) return offlineFallback;
          return new Response('You are offline. Please check your internet connection.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            status: 503,
          });
        })
    );
    return;
  }

  // 2. Static assets (_next/static, images, icons, fonts) -> Stale-while-revalidate or Cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico|css|js|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. All other requests -> Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || Promise.reject('no-match');
      })
  );
});

// Listen for messages from client (e.g. skipWaiting trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
