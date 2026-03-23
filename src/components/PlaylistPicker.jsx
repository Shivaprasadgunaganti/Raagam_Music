import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { addTrackToPlaylist } from "../utils/playlistHelpers";
import "./playlistPicker.css";

export default function PlaylistPicker({ trackId, onClose }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPlaylists(data || []));
  }, []);

  async function handleAdd(playlistId) {
    await addTrackToPlaylist(playlistId, trackId);
    onClose();
  }

  return (
    <div className="playlist-picker-overlay">
      <div className="playlist-picker">
        <h3>Add to playlist</h3>

        {playlists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => handleAdd(pl.id)}
            className="playlist-item"
          >
            {pl.name}
          </button>
        ))}

        <button className="close-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
