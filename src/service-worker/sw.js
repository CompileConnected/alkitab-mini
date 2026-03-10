// Service Worker — PWA installability + Kokoro voice file caching + API caching

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Cache Kokoro voice .bin files from HuggingFace so they survive page reloads
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // ── HuggingFace assets: cache-first ──
  if (url.includes('huggingface.co')) {
    event.respondWith(
      caches.open('kokoro-v1').then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Google Fonts / external assets: let the browser handle natively ──
  // Calling fetch() from a SW context subjects the request to the SW's own
  // connect-src CSP, which doesn't cover fonts.googleapis.com / fonts.gstatic.com.
  // Returning without respondWith() lets the browser handle it unimpeded.
  if (
    url.startsWith('https://fonts.googleapis.com') ||
    url.startsWith('https://fonts.gstatic.com')
  ) {
    return;
  }

  // ── Everything else: network only ──
  event.respondWith(fetch(event.request));
});
