// src/serviceWorkerRegistration.js

// export function register() {
//   if ("serviceWorker" in navigator) {
//     window.addEventListener("load", () => {
//       navigator.serviceWorker
//         .register("/sw.js")
//         .then((registration) => {
//           console.log("✅ Service Worker registered:", registration.scope);
//         })
//         .catch((error) => {
//           console.error("❌ Service Worker registration failed:", error);
//         });
//     });
//   }
// }


export function register() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      console.log("[SW] Registered:", registration.scope);

      registration.onupdatefound = () => {
        const worker = registration.installing;

        if (!worker) return;

        worker.onstatechange = () => {
          console.log("[SW] State:", worker.state);
        };
      };
    } catch (err) {
      console.error("[SW] Registration failed:", err);
    }
  });
}