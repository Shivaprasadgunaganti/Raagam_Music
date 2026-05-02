//new
import { supabase } from "../supabaseClient";
export async function addTrackToPlaylist(playlistId, trackId) {
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
      track_id: trackId,
      position: nextPosition, // 🔥 IMPORTANT
    },
  ]);

  if (error && error.code !== "23505") {
    console.error(error);
  }
}
