/**
 * Riona AI Enterprise Service Worker
 * Provides offline functionality, caching, and background sync
 * 
 * @version 1.0.0
 */

'use strict';

// Cache configuration
const CACHE_NAME = 'riona-ai-v1.0.0';
const STATIC_CACHE = 'riona-ai-static-v1.0.0';
const DYNAMIC_CACHE = 'riona-ai-dynamic-v1.0.0';
const API_CACHE = 'riona-ai-api-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/css/main.css',
  '/js/app.js',
  '/manifest.json',
  '/icons/favicon.svg',
  '/icons/favicon.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/status',
  '/health',
  '/api/system/metrics',
  '/api/instagram/status',
  '/api/ai/status'
];

// Cache duration (in milliseconds)
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000,    // 1 day
  API: 5 * 60 * 1000               // 5 minutes
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on request type
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  
  if (isStaticResource(url)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (isAPIRequest(url)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  } else if (isImageRequest(url)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  event.respondWith(handleRequest(request, strategy));
});

/**
 * Background Sync Event
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-data-sync') {
    event.waitUntil(syncData());
  }
});

/**
 * Push Notification Event
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung von Riona AI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Dashboard öffnen',
        icon: '/icons/action-dashboard.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Riona AI Enterprise', options)
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Handle different cache strategies
 */
async function handleRequest(request, strategy) {
  const cacheName = getCacheName(request);
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
      
    default:
      return networkFirst(request, cacheName);
  }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || createOfflineResponse();
  }
}

/**
 * Network First Strategy
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Network first failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || createOfflineResponse();
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.error('[SW] Network update failed:', error);
  });
  
  return cachedResponse || networkResponsePromise || createOfflineResponse();
}

/**
 * Determine cache name based on request type
 */
function getCacheName(request) {
  const url = new URL(request.url);
  
  if (isStaticResource(url)) {
    return STATIC_CACHE;
  } else if (isAPIRequest(url)) {
    return API_CACHE;
  } else {
    return DYNAMIC_CACHE;
  }
}

/**
 * Check if URL is a static resource
 */
function isStaticResource(url) {
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/);
}

/**
 * Check if URL is an API request
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname === '/health';
}

/**
 * Check if URL is an image request
 */
function isImageRequest(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/);
}

/**
 * Check if cached response is expired
 */
function isExpired(response) {
  const cachedDate = new Date(response.headers.get('date'));
  const now = new Date();
  const age = now.getTime() - cachedDate.getTime();
  
  // Different expiration times based on content type
  if (response.url.includes('/api/')) {
    return age > CACHE_DURATION.API;
  } else if (isStaticResource(new URL(response.url))) {
    return age > CACHE_DURATION.STATIC;
  } else {
    return age > CACHE_DURATION.DYNAMIC;
  }
}

/**
 * Create offline response
 */
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'OFFLINE',
        message: 'Keine Internetverbindung verfügbar'
      },
      offline: true
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => {
      console.log('[SW] Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    });
  
  return Promise.all(deletePromises);
}

/**
 * Background data synchronization
 */
async function syncData() {
  try {
    console.log('[SW] Starting background data sync');
    
    // Sync critical API endpoints
    const syncPromises = API_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(API_CACHE);
          await cache.put(endpoint, response.clone());
          console.log('[SW] Synced:', endpoint);
        }
      } catch (error) {
        console.error('[SW] Sync failed for:', endpoint, error);
      }
    });
    
    await Promise.all(syncPromises);
    console.log('[SW] Background sync completed');
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  return Promise.all(deletePromises);
}

console.log('[SW] Service Worker loaded successfully'); 