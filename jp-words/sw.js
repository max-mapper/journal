// sw.js

// Increment this version number to force the browser to refresh the cache
// when you update your dictionary or code.
const CACHE_NAME = "sudachi-cache-v1";

// List all files you want to work offline
const ASSETS_TO_CACHE = [
  "./grammar", // The main page
  "./grammar.html",
  "./grammar.css",
  "./grammar-engine.js",
  "./conjugations.js",
  "./grammar-rules.js",
  "./sudachi-wasm/sudachi.js",
  "./sudachi-wasm/resources/system.dic.gz", // ~40MB
  "./jmdict.json.gz", // ~4MB
];

// 1. INSTALL: Cache files and skip waiting
self.addEventListener("install", (event) => {
  // FORCE the SW to activate immediately, don't wait for tab close
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

// 2. ACTIVATE: Claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => {
        // FORCE the SW to take control of all open tabs immediately
        return self.clients.claim();
      }),
  );
});

// 3. FETCH: Serve from Cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      // Try to find the request in the cache
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Special handling for the root "/" to ensure it maps to index.html
      // (Browsers sometimes request "/" but we cached "./index.html" or "./")
      if (event.request.mode === "navigate") {
        const indexResponse = await caches.match("./index.html");
        if (indexResponse) {
          return indexResponse;
        }
      }

      // If not in cache, try the network
      try {
        return await fetch(event.request);
      } catch (error) {
        // If network fails (offline) and not in cache, we can't do anything
        console.error("Fetch failed:", error);
        throw error;
      }
    })(),
  );
});
