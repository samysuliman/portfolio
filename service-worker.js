const CACHE_VERSION = 'samy-portfolio-v6.4-final-sharing';
const STATIC_CACHE = CACHE_VERSION + '-static';
const CORE_ASSETS = [
  './',
  './index.html',
  './articles.html',
  './a/02.html',
  './articles/articles-data.js?v=6.4',
  './assets/articles.css?v=6.4',
  './assets/articles-common.js?v=6.4',
  './assets/pwa.css',
  './assets/pwa.js',
  './assets/tour.css?v=3.3',
  './assets/tour.js?v=3.3',
  './assets/favicon.png',
  './assets/publications-collage.webp',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => !key.startsWith(CACHE_VERSION)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isFreshContent = request.mode === 'navigate' ||
    url.pathname.endsWith('/articles/articles-data.js') ||
    url.pathname.endsWith('.html');

  if (isFreshContent) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
