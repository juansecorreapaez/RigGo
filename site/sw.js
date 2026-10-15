const CACHE='riggo-12.4.3-2026-10-14-1243-A1';
const CORE=['./assets/riggo-identity.3a87ba8373e8.js','./assets/riggo-storage.4deae6090fd6.js','./assets/riggo-i18n-catalog.3f534f793264.js','./assets/riggo-i18n.7938403ebd6f.js','./assets/riggo-language.dbd7ced8a5cb.js','./assets/riggo-language.2d02cfb3b11b.css','./assets/nabors-white.png','./assets/riggo-iso.png','./assets/riggo-logo.png','./assets/rig-hero-desktop.jpg','./assets/rig-hero-mobile.jpg','./assets/riggo-home-overhead.webp','./assets/riggo-home-night.webp','./assets/riggo-1241.612858e7db30.js','./assets/riggo-1241.6814b1a55019.css','./assets/vendor/supabase-js-2.117.3.min.js','./assets/vendor/html2pdf.js-0.10.1.min.js','./assets/vendor/html2canvas-1.4.1.min.js','./assets/vendor/jspdf-2.5.1.min.js','./assets/riggo-124.375ad70fae02.js','./assets/riggo-124.c9fb3b86ea11.css','./','./index.html','./manifest.webmanifest','./version.json','./assets/riggo-app.e1796d71fb18.js','./assets/riggo-1236-operational.442039d2033a.js','./assets/riggo-1217-field-integrity.d63194bc3a20.js','./assets/riggo-123-move-intelligence.cf6e0947a562.js','./assets/riggo-1237-field-ux.4d1cbcddbfe0.js','./assets/riggo-app.85bcb7b21566.css','./assets/RigGO_Move_Template.xlsx','./assets/loader/frame-01.webp','./assets/loader/frame-02.webp','./assets/loader/frame-03.webp','./assets/loader/frame-04.webp','./assets/loader/frame-05.webp','./assets/loader/frame-06.webp','./assets/loader/frame-07.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('riggo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Read only this release's cache. A still-running old worker can leave a late
// cache write behind during an update; it must never supply the new shell.
async function cached(request) {
  return (await caches.open(CACHE)).match(request);
}
function retain(event, key, response) {
  if (response.ok) {
    const copy = response.clone();
    event.waitUntil(caches.open(CACHE).then(cache => cache.put(key, copy)));
  }
  return response;
}
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(event.request, {cache:'no-store'})
      .then(response => retain(event, event.request, response))
      .catch(() => cached(event.request)));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache:'no-store'})
      .then(response => retain(event, './index.html', response))
      .catch(() => cached('./index.html')));
    return;
  }
  if (url.pathname.includes('/assets/')) {
    event.respondWith(cached(event.request).then(response => response ||
      fetch(event.request).then(fresh => retain(event, event.request, fresh))));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => cached(event.request)));
});
