const CACHE_NAME = 'jj-disc-golf-course-cache-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/aistudio/card_star_sync_8e893621.jpg',
  '/assets/aistudio/card_kc_pro_aviar_cotton_candy_v2_f322901a.jpg',
  '/assets/aistudio/card_star_aviar_ef73dd08.jpg',
  '/assets/aistudio/card_xt_glow_nova_cotton_candy_v2_90361134.jpg',
  '/assets/aistudio/card_pink_dx_alien_invoice_4fe78f83.jpg',
  '/assets/aistudio/card_star_toro_order_front_b7d093dc.jpg',
  '/assets/aistudio/card_classic_glow_roc_invoice_c493a3ba.jpg',
  '/assets/aistudio/card_glow_mako3_db46e7f1.jpg',
  '/assets/aistudio/card_dx_roc3_f562e170.jpg',
  '/assets/aistudio/card_star_jay_order_front_c57ddddd.jpg',
  '/assets/aistudio/card_star_rollo_7d7f53c4.jpg',
  '/assets/aistudio/card_purple_halo_it_abfe9cf2.jpg',
  '/assets/aistudio/card_champion_eagle_cotton_candy_v2_0f5474a8.jpg',
  '/assets/aistudio/card_dx_archangel_order_front_79dc09a3.jpg',
  '/assets/aistudio/card_gstar_roadrunner_order_front_832980e5.jpg',
  '/assets/aistudio/card_classic_glow_beast_invoice_92808f96.jpg',
  '/assets/aistudio/card_star_mamba_c3695bde.jpg',
  '/assets/aistudio/card_classic_glow_wraith_invoice_935bbe7c.jpg',
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
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first for collector card images and course map assets
  if (url.pathname.startsWith('/assets/aistudio/')) {
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
            return caches.match('/index.html');
          }
          return Response.error();
        })
      )
  );
});
