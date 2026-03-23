// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { addTrackToPlaylist } from "../utils/playlistHelpers";
// import "./playlistPicker.css";

// export default function PlaylistPicker({ trackId, onClose }) {
//   const [playlists, setPlaylists] = useState([]);

//   useEffect(() => {
//     supabase
//       .from("playlists")
//       // .select("*")
//       .select(`
//   id,
//   name,
//   playlist_tracks (
//     track_id,
//     tracks (cover_url)
//   )
// `)
//       .order("created_at", { ascending: false })
//       .then(({ data }) => setPlaylists(data || []));
//   }, []);

//   async function handleAdd(playlistId) {
//     // await addTrackToPlaylist(playlistId, trackId);
//       const status = await addTrackToPlaylist(playlistId, trackId);
//   onClose(status); // pass result
//     onClose();
//   }

//   function getPlaylistCovers(playlist) {
//   if (!playlist.playlist_tracks) return [];

//   return playlist.playlist_tracks
//     .slice(0, 4)
//     .map((pt) => pt.tracks?.cover_url)
//     .filter(Boolean);
// }

//   return (
//     <div className="playlist-picker-overlay">
//       <div className="playlist-picker">
//         <h3>Add to playlist</h3>

//         {playlists.map((pl) => (
//           // <button
//           //   key={pl.id}
//           //   onClick={() => handleAdd(pl.id)}
//           //   className="playlist-item"
//           // >
//           //   {pl.name}
//           // </button>

//           <div
//   key={pl.id}
//   className="playlist-item"
//   onClick={() => handleAdd(pl.id)}
// >
//   <div className="playlist-cover-mini">
//     {getPlaylistCovers(pl).length > 0 ? (
//       <div className="cover-grid">
//         {getPlaylistCovers(pl).map((c, i) => (
//           <img key={i} src={c} alt="cover" />
//         ))}
//       </div>
//     ) : (
//       <img src="/covers/default.jpg" alt="default" />
//     )}
//   </div>

//   <div className="playlist-name">{pl.name}</div>
// </div>
//         ))}

//         <button className="close-btn" onClick={onClose}>
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { addTrackToPlaylist } from "../utils/playlistHelpers";
import "./playlistPicker.css";

export default function PlaylistPicker({ trackId, onClose }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    supabase
      .from("playlists")
      .select(`
        id,
        name,
        playlist_tracks (
          track_id,
          tracks (cover_url)
        )
      `)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPlaylists(data || []));
  }, []);

  async function handleAdd(playlistId) {
    const status = await addTrackToPlaylist(playlistId, trackId);
    onClose(status);
    // onClose();
  }

  function getPlaylistCovers(playlist) {
    if (!playlist.playlist_tracks) return [];
    return playlist.playlist_tracks
      .slice(0, 4)
      .map((pt) => pt.tracks?.cover_url)
      .filter(Boolean);
  }

  return (
    <div className="playlist-picker-overlay" onClick={onClose}>
      <div className="playlist-picker" onClick={(e) => e.stopPropagation()}>

        <h3>Add to playlist</h3>

        {/* ✅ Scrollable list wrapper */}
        <div className="playlist-picker-list">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="playlist-item"
              onClick={() => handleAdd(pl.id)}
            >
              <div className="playlist-cover-mini">
                {getPlaylistCovers(pl).length > 0 ? (
                  <div className="cover-grid">
                    {getPlaylistCovers(pl).map((c, i) => (
                      <img key={i} src={c} alt="cover" />
                    ))}
                  </div>
                ) : (
                  <img src="/covers/default.jpg" alt="default" />
                )}
              </div>

              <div className="playlist-name">{pl.name}</div>
            </div>
          ))}
        </div>

        <button className="close-btn" onClick={onClose}>
          Cancel
        </button>

      </div>
    </div>
  );
}
