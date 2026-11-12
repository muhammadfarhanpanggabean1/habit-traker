// Nama cache tetap: tidak perlu dinaikkan lagi.
// Jaringan dulu, jadi file baru selalu terambil saat ada internet.
const CACHE = 'dasbor';
const ASET = [
  './',
  './index.html',
  './baca_buku.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  // Tiap file disimpan sendiri-sendiri: file yang belum ada tidak menggagalkan pemasangan
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASET.map(function (a) { return c.add(a).catch(function () {}); }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Jaringan dulu (supaya update cepat), cache sebagai cadangan offline
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) { var salin = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, salin); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
