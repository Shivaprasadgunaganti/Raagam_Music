// const CACHE_NAME = "raagam-shell-v1";

// const APP_SHELL = [
//   "/",
//   "/index.html",
//   "/manifest.json",
//   "/raagam_icon_v3.png"
// ];

// // Install
// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
//   );

//   self.skipWaiting();
// });

// // Activate
// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((keys) =>
//       Promise.all(
//         keys
//           .filter((key) => key !== CACHE_NAME)
//           .map((key) => caches.delete(key))
//       )
//     )
//   );

//   self.clients.claim();
// });

// // Fetch
// self.addEventListener("fetch", (event) => {
//   if (event.request.method !== "GET") return;

//   event.respondWith(
//     caches.match(event.request).then((cached) => {
//       return (
//         cached ||
//         fetch(event.request).catch(() => {
//           return caches.match("/index.html");
//         })
//       );
//     })
//   );
// });

const CACHE_NAME = "raagam-shell-v2";
// const CACHE_NAME = "raagam-shell-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/raagam_icon_v3.png",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignore Supabase requests completely.
  if (url.hostname.includes("supabase")) {
    return;
  }

  // Network First for HTML pages
  if (
    event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", copy);
          });

          return response;
        })
        .catch(() => caches.match("/index.html"))
    );

    return;
  }

  // Cache First for static assets
  // if (
  //   /\.(js|css|png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(url.pathname)
  // ) {
  if (
  /\.(js|css|png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(
    url.pathname
  )
) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(event.request).then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });

          return response;
        });
      })
    );

    return;
  }
});