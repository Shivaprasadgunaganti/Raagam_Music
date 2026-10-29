// // console.log("cacheTrack received:", track);
// import { saveTrack, getTrack } from "./offlineCache";

// export async function cacheTrack(track) {
//   try {
//     const existing = await getTrack(track.id);  

//     if (existing) {
//       return;
//     }

//     const response = await fetch(track.external_url);

//     const blob = await response.blob();

//     // await saveTrack(track.id, blob);
//     await saveTrack(track, blob);

//     console.log("Cached:", track.title);
//   } catch (err) {
//     console.error("Cache failed:", err);
//   }
// }

// 
// src/utils/cacheTrack.js  (REPLACE THE WHOLE FILE)
import { saveTrack, getTrack } from "./offlineCache";

// Set to true if you want songs auto-saved for offline even on mobile data.
// Keeping it false means streaming always gets the full bandwidth on cellular.
const AUTO_CACHE_ON_CELLULAR = false;

function isCachingAllowed() {
  const c = navigator.connection;
  if (!c) return true; // iOS Safari has no Network Information API
  if (c.saveData) return false;
  if (!AUTO_CACHE_ON_CELLULAR && c.type === "cellular") return false;
  return true;
}

// Downloads one track into IndexedDB. Cancellable through `signal`.
export async function cacheTrack(track, signal) {
  try {
    if (!track?.external_url) return;
    if (await getTrack(track.id)) return;

    const response = await fetch(track.external_url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    if (signal?.aborted) return;

    await saveTrack(track, blob);
  } catch (err) {
    if (err?.name !== "AbortError") console.warn("Cache failed:", err);
  }
}

// Waits until the <audio> element has fully buffered the song (so streaming is
// never starved), then caches it. Aborting `signal` cancels the wait/download.
export function cacheWhenBuffered(track, audio, signal) {
  // Auto-cache is skipped on cellular/data-saver. Explicit saves (like,
  // playlist, offline button) still call cacheTrack() directly and always work.
  if (!track || !audio || !isCachingAllowed()) return;

  const timer = setInterval(() => {
    if (signal.aborted) return clearInterval(timer);

    const d = audio.duration;
    const b = audio.buffered;
    if (!d || !isFinite(d) || !b.length) return;

    if (b.end(b.length - 1) >= d - 1) {
      clearInterval(timer);
      cacheTrack(track, signal);
    }
  }, 2000);

  signal.addEventListener("abort", () => clearInterval(timer), { once: true });
}