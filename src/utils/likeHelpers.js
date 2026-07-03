import { supabase } from "../supabaseClient";
import { cacheTrack } from "./cacheTrack";

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

if (!error) {
  await cacheTrack(track);
}

return { data, error };
}

export async function unlikeSong(trackId) {
  return supabase.from("liked_songs").delete().eq("track_id", trackId);
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
