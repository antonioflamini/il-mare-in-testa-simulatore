// Funzionamento senza rete. Le pagine si chiedono sempre prima alla rete (così gli aggiornamenti arrivano subito)
// e, se la rete manca, si servono dalla copia salvata. Icone e immagini si servono dalla copia salvata.
const CACHE = 'mare-in-testa-2026-11-13f';
const FILES = ['./', 'index.html', 'simulatore.html', 'manifest.webmanifest', 'anteprima.jpg',
  'icone/favicon.svg', 'icone/favicon-32.png', 'icone/apple-touch-icon.png', 'icone/icona-192.png', 'icone/icona-512.png', 'icone/icona-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE && n !== CACHE + '-font').map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const isPage = req.mode === 'navigate' || /\.(html|webmanifest)$|\/$/.test(url.pathname);
    if (isPage) {
      e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match('simulatore.html'))));
    } else {
      e.respondWith(caches.match(req, { ignoreSearch: true }).then(h => h || fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })));
    }
  } else if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(CACHE + '-font').then(async c => (await c.match(req)) || fetch(req).then(r => { c.put(req, r.clone()); return r; })));
  }
});
