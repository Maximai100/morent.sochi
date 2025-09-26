// Service Worker для MORENT PWA
const CACHE_NAME = 'morent-v4-stable'; // Стабильная версия кэша
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

// Обработка fetch запросов - простая стратегия network-first для HTML
self.addEventListener('fetch', event => {
  // Для HTML страниц используем network-first
  if (event.request.destination === 'document' ||
    event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Если успешно загружено, возвращаем
          if (response.ok) {
            return response;
          }
          // Если ошибка, пытаемся взять из кэша
          return caches.match(event.request) || response;
        })
        .catch(() => {
          // Если сеть недоступна, берем из кэша или главную страницу
          return caches.match(event.request) || caches.match('/');
        })
    );
  } else {
    // Для остальных ресурсов - cache-first
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Предотвращение горизонтальных свайпов в браузере
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

