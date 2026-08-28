export function register() {
  // Never register during development
  if (process.env.NODE_ENV !== "production") {
    console.log("[SW] Development mode - Service Worker disabled");
    return;
  }

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
      });

      console.log("[SW] Registered:", registration.scope);

      // Explicitly check for a new Service Worker
      await registration.update();

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




// export function register() {
//   // Never register during development
//   if (process.env.NODE_ENV !== "production") {
//     console.log("[SW] Development mode - Service Worker disabled");
//     return;
//   }

//   if (!("serviceWorker" in navigator)) return;

//   window.addEventListener("load", async () => {
//     try {
//       const registration = await navigator.serviceWorker.register("/sw.js");

//       console.log("[SW] Registered:", registration.scope);

//       registration.onupdatefound = () => {
//         const worker = registration.installing;
//         if (!worker) return;

//         worker.onstatechange = () => {
//           console.log("[SW] State:", worker.state);
//         };
//       };
//     } catch (err) {
//       console.error("[SW] Registration failed:", err);
//     }
//   });
// }
