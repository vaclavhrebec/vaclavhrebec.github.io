/* Offline support. Online, every file comes fresh from the network (so the page never mixes an old file with a new one);
   the copies kept here are used only when there is no connection. */
const CACHE = 'cantare-next-43';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c =>
    fetch(r, { cache: 'no-cache' })
      .then(res => { if (res.ok) c.put(r, res.clone()); return res; })
      .catch(() => c.match(r).then(hit => hit || Response.error()))));
});
