import { supabase } from "../supabaseClient";

export async function addTrackToPlaylist(playlistId, trackId) {
  const { error } = await supabase.from("playlist_tracks").insert([
    {
      playlist_id: playlistId,
      track_id: trackId,
    },
  ]);

  // Ignore duplicate error
  if (error && error.code !== "23505") {
    console.error("Add to playlist failed:", error);
  }
}







// import { supabase } from "../supabaseClient";

// export async function addTrackToPlaylist(playlistId, trackId) {
//   return await supabase
//     .from("playlist_tracks")
//     .insert([
//       {
//         playlist_id: playlistId,
//         track_id: trackId,
//       },
//     ]);
// }
