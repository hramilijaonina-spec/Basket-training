/* Détente PWA — service worker (network-first, tolérant) */
const CACHE = "detente-m1-v7";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg",
                "./hero.jpg", "./ex-squat.jpg", "./ex-souleve.jpg", "./ex-fente.jpg"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // cache chaque fichier séparément : un fichier manquant ne casse pas l'install
    await Promise.all(ASSETS.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{}); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
