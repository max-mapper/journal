// sw.js

// 1. Define separate cache names and version numbers
const CACHE_NETWORK_FIRST = "grammar-html-v1";
const CACHE_CACHE_FIRST = "grammar-assets-v1";
console.log(CACHE_NETWORK_FIRST, CACHE_CACHE_FIRST);

// 2. Network-First Files (HTML pages that change often)
const NETWORK_FIRST_ASSETS = [
  "./",
  "./index.html",
  "./tense-detector.js",
  "./sample-sentences.js",
  "./iyaku-matcher.js",
  "./mappings.js",
  "./grammar.js",
  "./grammar.css",
  "./grammar-engine.js",
  "./grammar-rules.js",
];

// 3. Cache-First Files (Heavy assets and stable code)
const CACHE_FIRST_ASSETS = [
  "../sudachi-wasm/sudachi.js",
  "../sudachi-wasm/resources/system.dic.gz", // ~40MB
  "./jmdict.json.gz", // ~4MB
];

// --- HELPER FUNCTION ---
// Checks if the requested URL matches any of the relative paths in our Cache-First array
function shouldUseCacheFirst(requestUrl) {
  const url = new URL(requestUrl);
  return CACHE_FIRST_ASSETS.some((asset) => {
    // Strip leading ./ or ../ from the asset string for reliable matching
    const cleanAssetPath = asset.replace(/^(\.\/|\.\.\/)+/, "");
    return url.pathname.endsWith(cleanAssetPath);
  });
}

// --- 1. INSTALL: Cache all files into their respective caches ---
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    Promise.all([
      // Pre-cache the network-first assets
      caches.open(CACHE_NETWORK_FIRST).then((cache) => {
        return cache.addAll(NETWORK_FIRST_ASSETS);
      }),
      // Pre-cache the cache-first assets
      caches.open(CACHE_CACHE_FIRST).then((cache) => {
        return cache.addAll(CACHE_FIRST_ASSETS);
      }),
    ]).then(() => console.log("All assets cached successfully.")),
  );
});

// --- 2. ACTIVATE: Clean up old versions of BOTH caches ---
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NETWORK_FIRST, CACHE_CACHE_FIRST];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // If the cache name isn't in our current list, delete it
            if (!currentCaches.includes(cacheName)) {
              console.log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// --- 3. FETCH: Route requests to the correct strategy ---
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // ROUTE A: CACHE-FIRST STRATEGY
  if (shouldUseCacheFirst(event.request.url)) {
    event.respondWith(
      caches.open(CACHE_CACHE_FIRST).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          console.log("Returning cached", event.request.url);
          return cachedResponse; // Return instantly from cache
        }

        // Fallback: If for some reason it's not in the cache, get it from network
        try {
          const networkResponse = await fetch(event.request);
          // Optional: Add it to the cache for next time
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error("Cache-first fallback failed:", error);
          throw error;
        }
      }),
    );
    return; // Stop execution here for cache-first files
  }

  // ROUTE B: NETWORK-FIRST STRATEGY (For HTML and anything else)
  event.respondWith(
    caches.open(CACHE_NETWORK_FIRST).then(async (cache) => {
      try {
        // 1. Try the network to get the freshest content
        const networkResponse = await fetch(event.request);

        // 2. Save the fresh content to the cache in the background
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        // 3. If the network fails (offline), look in the cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Special handling for navigation requests (like going to "/")
        if (event.request.mode === "navigate") {
          const indexResponse = await cache.match("./index.html");
          if (indexResponse) return indexResponse;
        }

        console.error("Network-first failed and no cache available:", error);
        throw error;
      }
    }),
  );
});
