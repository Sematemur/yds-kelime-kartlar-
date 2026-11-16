/* Service worker: uygulamayı çevrimdışı çalıştırır.
   Dosyaları değiştirirsen VERSION'ı artır ki telefonlar yeni sürümü alsın. */
const VERSION = "v5";
const CACHE = "yds-kartlar-" + VERSION;
const SHELL = ["./", "index.html", "app.js", "data.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith("yds-kartlar-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Önce önbellek, arkada güncelle (stale-while-revalidate). Fontlar da ilk açılışta önbelleğe girer.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
