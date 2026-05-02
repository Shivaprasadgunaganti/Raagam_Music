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
