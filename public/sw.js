const CACHE_NAME = 'jj-disc-golf-course-cache-v20';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './assets/course_maps/udisc_sarko.jpg',
  './assets/course_maps/udisc_mize.jpg',
  './assets/course_maps/udisc_harmon.jpg',
  './assets/course_maps/udisc_blackhoof.jpg',
  './assets/course_maps/udisc_artnine.jpg',
  './assets/aistudio/card_xt_glow_nova_sugar_high_4204e372.jpg',
  './assets/aistudio/card_sugar_high_proto_glow_aviar.jpg',
  './assets/aistudio/card_sugar_high_yeti_pro_aviar.jpg',
  './assets/aistudio/card_kc_pro_aviar_sugar_high_06f196b2.jpg',
  './assets/aistudio/card_sugar_high_dx_glow_roc.jpg',
  './assets/aistudio/card_sugar_high_proto_glow_mako3.jpg',
  './assets/aistudio/card_sugar_high_star_rollo.jpg',
  './assets/aistudio/card_sugar_high_glow_leopard3.jpg',
  './assets/aistudio/card_sugar_high_glow_teebird.jpg',
  './assets/aistudio/card_champion_eagle_sugar_high_a806d919.jpg',
  './assets/aistudio/card_sugar_high_star_roadrunner.jpg',
  './assets/aistudio/card_sugar_high_luster_firebird.jpg',
  './assets/aistudio/card_sugar_high_halo_wraith.jpg',
  './assets/aistudio/card_sugar_high_halo_destroyer.jpg',
  './assets/aistudio/card_star_sync_halloween_pink.jpg',
  './assets/aistudio/card_pink_dx_alien_invoice_4fe78f83.jpg',
  './assets/aistudio/card_dx_archangel_hot_pink.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore individual asset failures during install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache local/cloud sync API calls or Vite HMR websockets
  if (url.pathname.includes('/api/')) return;

  // Cache-first for collector card images and course map assets
  if (
    url.pathname.includes('/assets/aistudio/') ||
    url.pathname.includes('/assets/course_maps/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Network-first with offline cache fallback for app shell, scripts, and styles
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return Response.error();
        })
      )
  );
});
