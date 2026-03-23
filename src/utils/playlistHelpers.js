//new 
import { supabase } from "../supabaseClient";

export async function addTrackToPlaylist(playlistId, trackId) {
  const { error } = await supabase.from("playlist_tracks").insert([
    {
      playlist_id: playlistId,
      track_id: trackId,
    },
  ]);

  if (error) {
    if (error.code === "23505") {
      return "exists"; // duplicate
    }

    console.error("Add to playlist failed:", error);
    return "error";
  }

  return "added"; // success
}



// import { supabase } from "../supabaseClient";

// export async function addTrackToPlaylist(playlistId, trackId) {
//   const { error } = await supabase.from("playlist_tracks").insert([
//     {
//       playlist_id: playlistId,
//       track_id: trackId,
//     },
//   ]);

//   if (error && error.code !== "23505") {
//     console.error("Add to playlist failed:", error);
//   }
// }







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
