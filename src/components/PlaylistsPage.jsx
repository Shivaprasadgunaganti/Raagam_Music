import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./playlists.css";

export default function PlaylistsPage() {
  const nav = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaylists() {
      setLoading(true);

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setPlaylists(data || []);
      }

      setLoading(false);
    }

    loadPlaylists();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <main className="playlists-page">
      <h1>Your Playlists</h1>

      {playlists.length === 0 && <p>No playlists created</p>}

      <div className="playlists-grid">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            className="playlist-card"
            onClick={() => nav(`/playlist/${pl.id}`)}
          >
            <div className="playlist-cover">
              <img src={pl.cover_url} />
              {/* 🎵 */}
            </div>

            <div className="playlist-info">
              <h3>{pl.name}</h3>
              <p>{pl.description || "Playlist"}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
