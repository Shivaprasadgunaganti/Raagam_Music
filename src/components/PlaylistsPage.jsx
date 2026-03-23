// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import "./playlists.css";

// export default function PlaylistsPage() {
//   const nav = useNavigate();
//   const [playlists, setPlaylists] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadPlaylists() {
//       setLoading(true);

//       const { data, error } = await supabase
//         .from("playlists")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error(error);
//       } else {
//         setPlaylists(data || []);
//       }

//       setLoading(false);
//     }

//     loadPlaylists();
//   }, []);

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

//   return (
//     <main className="playlists-page">
//       <h1>Your Playlists</h1>

//       {playlists.length === 0 && <p>No playlists created</p>}

//       <div className="playlists-grid">
//         {playlists.map((pl) => (
//           <div
//             key={pl.id}
//             className="playlist-card"
//             onClick={() => nav(`/playlist/${pl.id}`)}
//           >
//             <div className="playlist-cover">
//               <img src={pl.cover_url} />
//               {/* 🎵 */}
//             </div>

//             <div className="playlist-info">
//               <h3>{pl.name}</h3>
//               <p>{pl.description || "Playlist"}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "./playlists.css";

export default function PlaylistsPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Helper to get covers
  const getPlaylistCovers = (playlist) => {
    if (!playlist.playlist_tracks) return [];

    return playlist.playlist_tracks
      .slice(0, 4)
      .map((pt) => pt.tracks?.cover_url)
      .filter(Boolean);
  };

  // ✅ Load playlists with tracks
  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("playlists")
        .select(`
          id,
          name,
          description,
          playlist_tracks (
            track_id,
            tracks (cover_url)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setPlaylists(data || []);
      }

      setLoading(false);
    };

    loadPlaylists();
  }, [user]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <main className="playlists-page">
      <h1>Your Playlists</h1>

      {playlists.length === 0 && <p>No playlists created</p>}

      {/* <div className="playlists-grid">
        {playlists.map((pl) => {
          const covers = getPlaylistCovers(pl);

          return (
            <div
              key={pl.id}
              className="playlist-card"
              onClick={() => nav(`/playlist/${pl.id}`)}
            >
              <div className="playlist-cover">
                {covers.length > 0 ? (
                  <div className="playlist-cover-grid">
                    {covers.map((c, i) => (
                      <img key={i} src={c} alt="cover" />
                    ))}
                  </div>
                ) : (
                  <img src="/covers/default.jpg" alt={pl.name} />
                )}
              </div>

              <div className="playlist-info">
                <h3>{pl.name}</h3>
                <p>{pl.description || "Playlist"}</p>
              </div>
            </div>
          );
        })}
      </div> */}
      <div className="playlists-grid">
  {playlists.map((pl) => {
    const covers = getPlaylistCovers(pl);

    return (
      <div
        key={pl.id}
        className="playlist-card"
        onClick={() => nav(`/playlist/${pl.id}`)}
      >
        <div className="playlist-cover">
          {covers.length > 0 ? (
            <div className={`playlist-cover-grid count-${covers.length}`}>
              {covers.map((c, i) => (
                <img key={i} src={c} alt="cover" />
              ))}
            </div>
          ) : (
            <img src="/covers/default.jpg" alt={pl.name} />
          )}
        </div>

        <div className="playlist-info">
          <h3>{pl.name}</h3>
          <p>{pl.description || "Playlist"}</p>
        </div>
      </div>
    );
  })}
</div>
    </main>
  );
}