// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// const LikeContext = createContext();

// export function LikeProvider({ children }) {
//   const [likedIds, setLikedIds] = useState([]);
//   const [loadingLikes, setLoadingLikes] = useState(true);

//   useEffect(() => {
//     async function loadLikes() {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data } = await supabase
//         .from("liked_songs")
//         .select("track_id")
//         .eq("user_id", user.id);

//       if (data) {
//         setLikedIds(data.map((row) => row.track_id));
//       }

//       setLoadingLikes(false);
//     }

//     loadLikes();
//   }, []);

//   async function toggleLike(trackId) {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (!user) return;

//     if (likedIds.includes(trackId)) {
//       await supabase
//         .from("liked_songs")
//         .delete()
//         .eq("track_id", trackId)
//         .eq("user_id", user.id);

//       setLikedIds((prev) => prev.filter((id) => id !== trackId));
//     } else {
//       await supabase.from("liked_songs").insert({
//         track_id: trackId,
//         user_id: user.id,
//       });

//       setLikedIds((prev) => [...prev, trackId]);
//     }
//   }

//   return (
//     <LikeContext.Provider value={{ likedIds, toggleLike, loadingLikes }}>
//       {children}
//     </LikeContext.Provider>
//   );
// }

// export function useLikes() {
//   return useContext(LikeContext);
// }
