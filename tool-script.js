// === LOCALSTORAGE AUTOSAVE ===
const inputs = document.querySelectorAll("textarea, input[type='text']");
inputs.forEach((input, index) => {
  const key = `${location.pathname}_tool_input_${index}`;
  input.value = localStorage.getItem(key) || "";
  input.addEventListener("input", () => {
    localStorage.setItem(key, input.value);
  });
});

// === SERVICE WORKER WITH SMART RUNTIME CACHING ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swBlob = new Blob([`
      const cacheName = 'tool-cache-v1';

      // Activate immediately after install
      self.addEventListener('install', e => {
        self.skipWaiting();
      });

      self.addEventListener('activate', e => {
        self.clients.claim();
      });

      // Smart fetch: only cache what user visits
      self.addEventListener('fetch', event => {
        event.respondWith(
          caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(networkRes => {
              return caches.open(cacheName).then(cache => {
                // Cache only same-origin GET requests (html, css, js, images)
                if (
                  event.request.method === 'GET' &&
                  event.request.url.startsWith(self.location.origin)
                ) {
                  cache.put(event.request, networkRes.clone());
                }
                return networkRes;
              });
            });
          }).catch(() => {
            // Optional: show fallback page when offline
            if (event.request.destination === 'document') {
              return caches.match('./offline.html');
            }
          })
        );
      });
    `], { type: 'application/javascript' });

    const swURL = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swURL)
      .then(() => console.log('✅ Service Worker ready'))
      .catch(err => console.error('❌ SW Error:', err));
  });
}
