const VERSI = 'acc-v3';
const INTI = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(VERSI).then(c => c.addAll(INTI))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSI).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const halaman = req.mode === 'navigate' || /\.(html|webmanifest|json)$/.test(url.pathname);
  if (halaman) {
    // jaringan dulu supaya versi baru langsung sampai; luring pakai simpanan
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSI).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok && (url.origin === location.origin || url.host.includes('fonts.g'))) { const c = res.clone(); caches.open(VERSI).then(x => x.put(req, c)); } return res; })));
  }
});
