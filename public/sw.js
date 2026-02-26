// SweeneySnap Service Worker — minimal install + activate + fetch passthrough
// Offline caching is handled by Feature 86 (IndexedDB queue)

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
