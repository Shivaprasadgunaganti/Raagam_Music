import { supabase } from "../supabaseClient";
import { cacheTrack } from "./cacheTrack";
import {
  clearLikedTracks,
  saveLikedTracks,
} from "./offlineCache";


async function refreshLikedSnapshot() {
  const { data, error } = await supabase
    .from("liked_songs")
    .select("track_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to refresh liked snapshot:", error);
    return;
  }

  const trackIds = (data || []).map((row) => row.track_id);

  await clearLikedTracks();
  await saveLikedTracks(trackIds);
}
// export async function likeSong(trackId) {
export async function likeSong(track) {
   console.log("likeSong received:", track);
     console.log("cacheTrack received:", track);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("LIKE USER:", user);

  if (userError || !user) {
    console.error("User not logged in");
    return;
  }

//   const { data, error } = await supabase.from("liked_songs").insert([
//     {
//       // track_id: trackId,
//       track_id: track.id,
//       user_id: user.id,
//     },
//   ]);

//   console.log("LIKE INSERT:", data, error);

//   return { data, error };
// }

const { data, error } = await supabase.from("liked_songs").insert([
  {
    track_id: track.id,
    user_id: user.id,
  },
]);

// if (!error) {
//   await cacheTrack(track);
// }

if (!error) {
  await cacheTrack(track);
  await refreshLikedSnapshot();
}

return { data, error };
}

// export async function unlikeSong(trackId) {
//   return supabase.from("liked_songs").delete().eq("track_id", trackId);
// }

export async function unlikeSong(trackId) {
  const result = await supabase
    .from("liked_songs")
    .delete()
    .eq("track_id", trackId);

  if (!result.error) {
    await refreshLikedSnapshot();
  }
  const db = await import("./offlineCache");
const tracks = await db.getLikedTrackIds();

console.log("Liked tracks after refresh:", tracks);

  return result;
}

export async function isSongLiked(trackId) {
  const { data } = await supabase
    .from("liked_songs")
    .select("id")
    .eq("track_id", trackId)
    .maybeSingle();

  return !!data;
}

export async function getLikedSongsMap() {
  const { data, error } = await supabase.from("liked_songs").select("track_id");

  if (error) {
    console.error(error);
    return {};
  }

  const map = {};
  data.forEach((item) => {
    map[item.track_id] = true;
  });

  return map;
}
