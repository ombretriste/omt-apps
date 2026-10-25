// Cambia la versión al modificar archivos para que los móviles descarguen la nueva versión
const CACHE = 'omtapps-v35';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'apps.js',
  'app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/apps/underctrl.svg',
  'icons/apps/payctrl.svg',
  'icons/apps/docctrl.svg',
  'icons/apps/taskctrl.svg',
  'icons/apps/upto40.svg',
  'icons/apps/tripctrl.svg',
  'icons/apps/randomit.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Red primero (para recibir actualizaciones); caché si no hay conexión
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
