import { saveTrack, getTrack } from "./offlineCache";

export async function cacheTrack(track) {
  try {
    const existing = await getTrack(track.id);

    if (existing) {
      return;
    }

    const response = await fetch(track.external_url);

    const blob = await response.blob();

    // await saveTrack(track.id, blob);
    await saveTrack(track, blob);

    console.log("Cached:", track.title);
  } catch (err) {
    console.error("Cache failed:", err);
  }
}