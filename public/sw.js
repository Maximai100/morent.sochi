// Service Worker для MORENT PWA
const CACHE_NAME = 'morent-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/hero-image.jpg',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Установка service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Принудительно активируем новый SW
  );
});

// Активация service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Принудительно обновляем все открытые вкладки
      return self.clients.claim();
    })
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кешированную версию или загружаем из сети
        return response || fetch(event.request);
      }
    )
  );
});

// Предотвращение горизонтальных свайпов в браузере
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// PWA scrolling improvements
self.addEventListener('fetch', event => {
  // Add scrolling headers for better PWA experience
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        const newResponse = response.clone();
        newResponse.headers.set('X-Content-Type-Options', 'nosniff');
        newResponse.headers.set('X-Frame-Options', 'DENY');
        return newResponse;
      })
    );
  }
});