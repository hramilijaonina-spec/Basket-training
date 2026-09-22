/* Détente PWA — service worker (network-first, HTML jamais mis en cache HTTP) */
const CACHE = "detente-m1-1.19";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./hero.jpg",
  "./ex-squat.jpg", "./ex-fente.jpg", "./ex-souleve.jpg", "./ex-mollets.jpg",
  "./ex-drop.jpg", "./ex-pogos.jpg", "./ex-planche.jpg", "./ex-pompes.jpg",
  "./ex-rowing.jpg", "./ex-epaules.jpg", "./ex-stepup.jpg", "./ex-deadbug.jpg",
  "./ex-gainlat.jpg", "./ex-wallsit.jpg", "./ex-squatjump.jpg", "./ex-broadjump.jpg",
  "./ex-skips.jpg", "./ex-fentesaut.jpg", "./ex-molletiso.jpg", "./ex-hollow.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
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

  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  // HTML : on force le réseau SANS cache HTTP (sinon iOS ressert une vieille page)
  e.respondWith(
    fetch(req, isHTML ? { cache: "no-store" } : {})
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{}); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
