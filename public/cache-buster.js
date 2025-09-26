// Скрипт для принудительной очистки кэша
(function() {
  'use strict';
  
  // Очистка всех кэшей браузера
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName.startsWith('morent-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Old caches cleared');
    });
  }
  
  // Принудительная перезагрузка Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister().then(function() {
          console.log('Service Worker unregistered');
        });
      }
    });
  }
  
  // Очистка localStorage и sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Storage cleared');
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
  
  // Добавляем timestamp к URL для предотвращения кэширования
  const currentUrl = new URL(window.location.href);
  if (!currentUrl.searchParams.has('_t')) {
    currentUrl.searchParams.set('_t', Date.now().toString());
    window.history.replaceState({}, '', currentUrl.toString());
  }
})();