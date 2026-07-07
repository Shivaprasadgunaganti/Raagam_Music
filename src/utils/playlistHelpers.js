// //new
// import { supabase } from "../supabaseClient";
// export async function addTrackToPlaylist(playlistId, trackId) {
//   const { data: existing } = await supabase
//     .from("playlist_tracks")
//     .select("position")
//     .eq("playlist_id", playlistId)
//     .order("position", { ascending: false })
//     .limit(1);

//   const nextPosition = existing?.[0]?.position + 1 || 0;

//   const { error } = await supabase.from("playlist_tracks").insert([
//     {
//       playlist_id: playlistId,
//       track_id: trackId,
//       position: nextPosition, // 🔥 IMPORTANT
//     },
//   ]);

//   if (error && error.code !== "23505") {
//     console.error(error);
//   }
// }

import { supabase } from "../supabaseClient";
import { cacheTrack } from "./cacheTrack";

export async function addTrackToPlaylist(playlistId, track) {
    console.log("addTrackToPlaylist received:", track);

  const { data: existing } = await supabase
    .from("playlist_tracks")
    .select("position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing?.[0]?.position + 1 || 0;

  const { error } = await supabase.from("playlist_tracks").insert([
    {
      playlist_id: playlistId,
      track_id: track.id,
      position: nextPosition,
    },
  ]);

  if (!error) {
    cacheTrack(track).catch((err) => {
      console.error("Background cache failed:", err);
    });

    return "added";
  }

  if (error.code === "23505") {
    return "exists";
  }

  console.error(error);
  return "error";
}