// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// export default function useTracks() {
//   const [tracks, setTracks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchTracks() {
//       const { data, error } = await supabase
//         .from("tracks")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (error) {
//         setError(error);
//         setLoading(false);
//         return;
//       }

//       const mapped = data.map((row) => ({
//         ...row,
//         playable_url: row.external_url,
//       }));
//       console.log(mapped, "mapped");
//       setTracks(mapped);
//       setLoading(false);
//     }

//     fetchTracks();
//   }, []);

//   return { tracks, loading, error };
// }

// base
// import { supabase } from "../supabaseClient";
// import { useEffect, useState } from "react";

// export default function useTracks(movieId = null) {
//   const [tracks, setTracks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);

//     let query = supabase.from("tracks").select("*");

//     if (movieId) {
//       query = query.eq("movie_id", movieId);
//     }

//     query.then(({ data }) => {
//       setTracks(data || []);
//       setLoading(false);
//     });
//   }, [movieId]);

//   return { tracks, loading };
// }

import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function useTracks(movieId = null) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTracks() {
      try {
        setLoading(true);

        let query = supabase.from("tracks").select("*");

        if (movieId) {
          query = query.eq("movie_id", movieId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Tracks error:", error);
        }

        setTracks(data || []);
      } catch (err) {
        console.error("Tracks fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTracks();
  }, [movieId]);

  return { tracks, loading };
}
