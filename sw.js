const CACHE_NAME = 'caces-medprep-v21-threejs-faces';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo-hpta-caces.png',
  './assets/juego-puente-cristal.png',
  './assets/juego-ahorcado.png',
  './js/app.js',
  './js/exam-engine.js',
  './js/ai-tutor.js',
  './js/storage.js',
  './js/analytics.js',
  './js/calculators.js',
  './js/flashcards.js',
  './js/games.js',
  './js/pdf-importer.js',
  './js/supabase-config.js',
  './data/banco_inicial.json',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Pre-cache parcial advertencia:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isCodeOrMarkup =
    req.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  if (isCodeOrMarkup) {
    const cleanUrl = (url.pathname.endsWith('/games.js') || url.pathname.endsWith('/app.js'))
      ? `${url.origin}${url.pathname}?v=21`
      : req.url;

    event.respondWith(
      fetch(cleanUrl, { cache: 'no-store' })
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const respClone = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
          }
          return networkResp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResp) => {
      const fetchPromise = fetch(req).then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
        }
        return networkResp;
      }).catch(() => {});

      return cachedResp || fetchPromise;
    })
  );
});
