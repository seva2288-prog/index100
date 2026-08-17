// ================================================================
// SERVICE WORKER ДЛЯ КВАНТУМ v8.0
// ================================================================

const CACHE_NAME = 'quantum-v8.0';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Установка
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Кэширование ресурсов...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    // Пропускаем запросы к API
    if (event.request.url.includes('api-football.com') || 
        event.request.url.includes('openweathermap.org')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    return cached;
                }

                return fetch(event.request)
                    .then(response => {
                        // Кэшируем успешные ответы
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Офлайн-режим
                        return new Response('Офлайн-режим', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Уведомления
self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230b0e14"/%3E%3Ctext x="50" y="72" font-size="60" text-anchor="middle" font-family="Arial"%3E%E2%9A%9B%3C/text%3E%3C/svg%3E',
        badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230b0e14"/%3E%3Ctext x="50" y="72" font-size="60" text-anchor="middle" font-family="Arial"%3E%E2%9A%9B%3C/text%3E%3C/svg%3E',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('⚛️ Service Worker для Квантум v8.0 активен');
