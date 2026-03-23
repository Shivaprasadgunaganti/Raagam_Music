// src/components/CollectionPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTracks from "../hooks/useTracks";
import useRecent from "../hooks/useRecent";
import "./collection.css";
import { Card } from "react-bootstrap";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../supabaseClient";
import { useLikes } from "../context/LikeContext";
import { useAuth } from "../context/AuthContext";
import PlaylistModal from "../components/PlaylistModal";

export default function CollectionPage() {
  const { tracks, loading } = useTracks();
  const { recent } = useRecent();
  const nav = useNavigate();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { playAll, shufflePlay , setNewQueue, setResumeTime } = useAudio();

  // const { setNewQueue, setResumeTime } = useAudio();

// const playFromContinue = (track, startTime) => {
//   if (!track) return;

//   audioRef.current.src =
//     track.external_url || track.storage_path || "";

//   audioRef.current.currentTime = startTime || 0;
//   audioRef.current.play();
// };

const playFromContinue = (track, startTime) => {
  if (!track) return;

  setResumeTime(startTime || 0); // 🔥 set resume time
  setNewQueue([track], 0);       // 🔥 use queue system
};

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { user } = useAuth();
  const [continueTracks, setContinueTracks] = useState([]);

  // ❤️ Like state map
  const [likedMap, setLikedMap] = useState({});
  const [movies, setMovies] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  /* ---------------- INIT LIKES ---------------- */
  useEffect(() => {
    if (!tracks?.length) return;

    tracks.forEach((t) => {
      isSongLiked(t.id).then((liked) => {
        setLikedMap((prev) => ({ ...prev, [t.id]: liked }));
      });
    });
  }, [tracks]);

  useEffect(() => {
    async function loadMovies() {
      const { data } = await supabase
        .from("movies")
        .select("id, title, cover_url")
        .order("id", { ascending: false })
        .limit(8);

      setMovies(data || []);
    }

    loadMovies();
  }, []);

  const loadPlaylists = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("playlists")
    // .select("id, name, cover_url")
    .select(`
  id,
  name,
  playlist_tracks (
    track_id,
    tracks (cover_url)
  )
`)
    .eq("user_id", user.id) // 🔥 VERY IMPORTANT
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Fetch playlist error:", error);
    return;
  }

  setPlaylists(data || []);
};

useEffect(() => {
  loadPlaylists();
}, [user]);

  // useEffect(() => {
  //   async function loadPlaylists() {
  //     const { data } = await supabase
  //       .from("playlists")
  //       .select("id, name, cover_url")
  //       .eq("user_id", user.id)
  //       .order("created_at", { ascending: false });

  //     setPlaylists(data || []);
  //   }

  //   loadPlaylists();
  // }, []);

  useEffect(() => {
  fetchContinueListening();
}, [user]);


const getPlaylistCovers = (playlist) => {
  if (!playlist.playlist_tracks) return [];

  return playlist.playlist_tracks
    .slice(0, 4)
    .map((pt) => pt.tracks?.cover_url)
    .filter(Boolean);
};

  const filtered = useMemo(() => {
    if (!debounced) return tracks || [];
    const q = debounced.toLowerCase();
    return (tracks || []).filter((t) => {
      const title = (t.title || "").toLowerCase();
      const artist = (t.artist || "").toLowerCase();
      return title.includes(q) || artist.includes(q);
    });
  }, [tracks, debounced]);

  // const getProgress = (trackId) => {
  //   const progressMap =
  //     JSON.parse(localStorage.getItem("track_progress")) || {};

  //   return progressMap[trackId] || null;
  // };

  /* ---------------- RECENT MARQUEE ---------------- */
const fetchContinueListening = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("continue_listening")
    .select("track_id, last_position, duration, tracks(*)")
    .eq("user_id", user.id) // 🔥 IMPORTANT FILTER
    .order("updated_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  setContinueTracks(data || []);
};

//playlist 
// const createPlaylist = async () => {
//   if (!newPlaylistName.trim() || !user) return;

//   const { error } = await supabase.from("playlists").insert({
//     name: newPlaylistName,
//     user_id: user.id,
//   });

//   if (error) {
//     console.log("Error creating playlist:", error);
//     return;
//   }

//   setNewPlaylistName("");
//   loadPlaylists(); 
// };

const createPlaylist = async () => {
  if (!newPlaylistName.trim() || !user) return;

  const { error } = await supabase.from("playlists").insert({
    name: newPlaylistName.trim(),
    user_id: user.id,
  });

  if (error) {
    // 🔥 Handle duplicate error
    if (error.code === "23505") {
      alert("Playlist with this name already exists!");
    } else {
      console.log("Error creating playlist:", error);
    }
    return;
  }

  setNewPlaylistName("");
  loadPlaylists();
};

// add to playlist 
const addToPlaylist = async (playlistId, trackId) => {
  if (!playlistId || !trackId) return;

  const { error } = await supabase
    .from("playlist_tracks")
    .insert({
      playlist_id: playlistId,
      track_id: trackId,
    });

  if (error) {
    console.log("Error adding to playlist:", error);
  } else {
    alert("Added to playlist ✅");
  }
}; 

  // 
  const recentRowRef = useRef(null);

  useEffect(() => {
    const row = recentRowRef.current;
    if (!row) return;

    if (
      !Array.from(row.children).some((c) => c.classList.contains("original"))
    ) {
      Array.from(row.children).forEach((c) => c.classList.add("original"));
    }

    Array.from(row.querySelectorAll(".recent-track-card.clone")).forEach((c) =>
      c.remove()
    );

    const originals = Array.from(row.children).filter((c) =>
      c.classList.contains("original")
    );

    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.classList.remove("original");
      clone.classList.add("clone");
      row.appendChild(clone);
    });

    if (row.scrollWidth > row.clientWidth) {
      row.classList.add("marquee");
      row.style.animationDuration = `${Math.max(12, row.scrollWidth * 0.02)}s`;
    } else {
      row.classList.remove("marquee");
    }

    return () => {
      Array.from(row.querySelectorAll(".recent-track-card.clone")).forEach(
        (c) => c.remove()
      );
      row.classList.remove("marquee");
    };
  }, [recent]);

  if (loading) return <div style={{ padding: 20 }}>Loading tracks…</div>;

  return (
    <main style={{ padding: 20 }} className="page-safe">
      {/* ---------------- HEADER ---------------- */}
      <header style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Collection</h1>
        <p style={{ color: "#9aa4b2" }}>Browse songs & albums</p>
      </header>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <button onClick={() => playAll(filtered)}>▶ Play All</button>
        <button onClick={() => shufflePlay(filtered)}>🔀 Shuffle</button>
      </div>

      {/* ---------------- HOME SHORTCUTS (NEW) ---------------- */}
      <section className="home-shortcuts">
        {/* <div className="shortcut-card" onClick={() => nav("/liked")}>
          ❤️
          <span>Liked Songs</span>
        </div> */}

        <div className="shortcut-card" onClick={() => nav("/playlists")}>
          📂
          <span>Playlists</span>
        </div>

        <div className="shortcut-card" onClick={() => nav("/movies")}>
          🎬
          <span>Movies</span>
        </div>

        {/* Logout  */}
        <div onClick={() => nav("/logout")}>
          <span>Logout</span>
        </div>
      </section>

      {/* ---------------- SEARCH ---------------- */}
      <div style={{ marginBottom: 20 }}>
  <input
    type="text"
    placeholder="New Playlist Name"
    value={newPlaylistName}
    onChange={(e) => setNewPlaylistName(e.target.value)}
  />

  <button onClick={createPlaylist}>
    Create Playlist
  </button>
</div>
      {/* <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
      >
        <input
          type="search"
          placeholder="Search by title or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: 420,
            maxWidth: "92%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
            color: "inherit",
          }}
        />
      </div> */}

      {recent?.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Continue Listening</h3>

          <div className="horizontal-row">
            {
            // recent.slice(0, 4).map((track) => {
            //   const progress = getProgress(track.id);
            //   const percent =
            //     progress && progress.duration
            //       ? (progress.time / progress.duration) * 100
            //       : 0;
            continueTracks.slice(0, 4).map((item) => {
  const track = item.tracks;

  const percent =
    item.duration > 0
      ? (item.last_position / item.duration) * 100
      : 0;

              return (
                <div
                  key={track.id}
                  className="album-card"
                  // onClick={() => nav(`/track/${track.id}`)}
                  onClick={() =>
  playFromContinue(track, item.last_position)
}
                >
                  <img
                    src={track.cover_url || "/covers/default.jpg"}
                    alt={track.title}
                  />

                  {percent > 0 && (
                    <div className="card-progress">
                      <div
                        className="card-progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}

                  <div className="album-title">{track.title}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- RECENTLY PLAYED ---------------- */}
      {/* {recent?.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h3>Recently played</h3>
          <div className="recent-strip">
            <div className="recent-track-row" ref={recentRowRef}>
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="recent-track-card"
                  onClick={() => nav(`/track/${r.id}`)}
                >
                  <Card className="music-card">
                    <Card.Img
                      className="music-card-img"
                      src={r.cover_url || "/covers/default.jpg"}
                    />
                    <Card.Body className="music-card-body">
                      <div className="music-card-title-below">{r.title}</div>
                      <div className="music-card-artist-below">{r.artist}</div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {playlists.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Your Playlists</h3>

          {/* <div className="horizontal-row">
            {playlists.map((p) => (
              <div
                key={p.id}
                className="playlist-card"
                onClick={() => nav(`/playlist/${p.id}`)}
              >
                <div className="playlist-cover">
                  <img
                    src={p.cover_url || "/covers/default.jpg"}
                    alt={p.name}
                  /> 
                </div>

                <div className="playlist-title">{p.name}</div>
              </div>
            ))}
          </div> */}

          {/* <div className="horizontal-row">
  {playlists.map((p) => {
    const covers = getPlaylistCovers(p); // ✅ correct place

    return (
      <div
        key={p.id}
        className="playlist-card"
        onClick={() => nav(`/playlist/${p.id}`)}
      >
        <div className="playlist-cover">
          {covers.length > 0 ? (
            <div className="playlist-cover-grid">
              {covers.map((c, i) => (
                <img key={i} src={c} alt="cover" />
              ))}
            </div>
          ) : (
            <img src="/covers/default.jpg" alt={p.name} />
          )}
        </div>

        <div className="playlist-title">{p.name}</div>
      </div>
    );
  })}
</div> */}

<div className="horizontal-row">
  {playlists.map((p) => {
    const covers = getPlaylistCovers(p);

    return (
      <div
        key={p.id}
        className="playlist-card"
        onClick={() => nav(`/playlist/${p.id}`)}
      >
        <div className="playlist-cover">
          {covers.length > 0 ? (
            <div className={`playlist-cover-grid count-${covers.length}`}>
              {covers.map((c, i) => (
                <img key={i} src={c} alt="cover" />
              ))}
            </div>
          ) : (
            <img src="/covers/default.jpg" alt={p.name} />
          )}
        </div>

        <div className="playlist-title">{p.name}</div>
      </div>
    );
  })}
</div>
        </section>
      )}

      {movies.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Albums for you</h3>

          <div className="horizontal-row">
            {movies.map((m) => (
              <div
                key={m.id}
                className="album-card"
                onClick={() => nav(`/movie/${m.id}`)}
              >
                <img src={m.cover_url} alt={m.title} />
                <div className="album-title">{m.title}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- COLLECTION GRID ---------------- */}
      <div className="music-grid">
        {filtered.slice(0, 12).map((t) => (
          <Card
            key={t.id}
            className="music-card"
            onClick={() => nav(`/track/${t.id}`)}
          >
            <div className="music-card-cover">
              <Card.Img
                className="music-card-img"
                src={t.cover_url || "/covers/default.jpg"}
              />

              {/* ❤️ LIKE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (likedMap[t.id]) {
                    unlikeSong(t.id);
                  } else {
                    likeSong(t.id);
                  }
                  setLikedMap((prev) => ({
                    ...prev,
                    [t.id]: !prev[t.id],
                  }));
                }}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "transparent",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  color: likedMap[t.id] ? "#1db954" : "#9aa4b2",
                }}
              >
                ♥
              </button>
            </div>

            <Card.Body className="music-card-body">
              <h2 className="music-card-title-below">{t.title}</h2>
              <p className="music-card-artist-below">{t.artist}</p>
            </Card.Body>
          </Card>
        ))}
      </div>
      {filtered.length > 12 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => nav("/all-songs")}>View All Songs</button>
        </div>
      )}
    </main>
  );
}

// // src/components/CollectionPage.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import useTracks from "../hooks/useTracks";
// import useRecent from "../hooks/useRecent";
// import "./collection.css";
// import { Card } from "react-bootstrap";
// import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
// import { useAudio } from "../context/AudioContext";

// export default function CollectionPage() {
//   const { tracks, loading } = useTracks();
//   const { recent } = useRecent();
//   const nav = useNavigate();
//   const { playAll, shufflePlay } = useAudio();

//   const [query, setQuery] = useState("");
//   const [debounced, setDebounced] = useState("");

//   // ❤️ Like state map
//   const [likedMap, setLikedMap] = useState({});

//   /* ---------------- SEARCH ---------------- */
//   useEffect(() => {
//     const id = setTimeout(() => setDebounced(query.trim()), 300);
//     return () => clearTimeout(id);
//   }, [query]);

//   /* ---------------- INIT LIKES ---------------- */
//   useEffect(() => {
//     if (!tracks?.length) return;

//     tracks.forEach((t) => {
//       isSongLiked(t.id).then((liked) => {
//         setLikedMap((prev) => ({ ...prev, [t.id]: liked }));
//       });
//     });
//   }, [tracks]);

//   const filtered = useMemo(() => {
//     if (!debounced) return tracks || [];
//     const q = debounced.toLowerCase();
//     return (tracks || []).filter((t) => {
//       const title = (t.title || "").toLowerCase();
//       const artist = (t.artist || "").toLowerCase();
//       return title.includes(q) || artist.includes(q);
//     });
//   }, [tracks, debounced]);

//   /* ---------------- RECENT MARQUEE ---------------- */
//   const recentRowRef = useRef(null);

//   useEffect(() => {
//     const row = recentRowRef.current;
//     if (!row) return;

//     if (
//       !Array.from(row.children).some((c) => c.classList.contains("original"))
//     ) {
//       Array.from(row.children).forEach((c) => c.classList.add("original"));
//     }

//     Array.from(row.querySelectorAll(".recent-track-card.clone")).forEach((c) =>
//       c.remove()
//     );

//     const originals = Array.from(row.children).filter((c) =>
//       c.classList.contains("original")
//     );

//     originals.forEach((node) => {
//       const clone = node.cloneNode(true);
//       clone.classList.remove("original");
//       clone.classList.add("clone");
//       row.appendChild(clone);
//     });

//     if (row.scrollWidth > row.clientWidth) {
//       row.classList.add("marquee");
//       row.style.animationDuration = `${Math.max(
//         12,
//         row.scrollWidth * 0.02
//       )}s`;
//     } else {
//       row.classList.remove("marquee");
//     }

//     return () => {
//       Array.from(row.querySelectorAll(".recent-track-card.clone")).forEach(
//         (c) => c.remove()
//       );
//       row.classList.remove("marquee");
//     };
//   }, [recent]);

//   if (loading) return <div style={{ padding: 20 }}>Loading tracks…</div>;

//   return (
//     <main style={{ padding: 20 }}>
//       {/* ---------------- HEADER ---------------- */}
//       <header style={{ textAlign: "center", marginBottom: 12 }}>
//         <h1 style={{ margin: 0 }}>Collection</h1>
//         <p style={{ color: "#9aa4b2" }}>Browse songs & albums</p>
//       </header>
//       <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
//   <button onClick={() => playAll(filtered)}>▶ Play All</button>
//   <button onClick={() => shufflePlay(filtered)}>🔀 Shuffle</button>
// </div>

//       {/* ---------------- HOME SHORTCUTS (NEW) ---------------- */}
//       <section className="home-shortcuts">
//         <div className="shortcut-card" onClick={() => nav("/liked")}>
//           ❤️
//           <span>Liked Songs</span>
//         </div>

//         <div className="shortcut-card" onClick={() => nav("/playlists")}>
//           📂
//           <span>Playlists</span>
//         </div>

//         <div className="shortcut-card" onClick={() => nav("/movies")}>
//           🎬
//           <span>Movies</span>
//         </div>
//       </section>

//       {/* ---------------- SEARCH ---------------- */}
//       <div
//         style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
//       >
//         <input
//           type="search"
//           placeholder="Search by title or artist..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           style={{
//             width: 420,
//             maxWidth: "92%",
//             padding: "8px 12px",
//             borderRadius: 8,
//             border: "1px solid rgba(255,255,255,0.06)",
//             background: "transparent",
//             color: "inherit",
//           }}
//         />
//       </div>

//       {/* ---------------- RECENTLY PLAYED ---------------- */}
//       {recent?.length > 0 && (
//         <section style={{ marginBottom: 18 }}>
//           <h3>Recently played</h3>
//           <div className="recent-strip">
//             <div className="recent-track-row" ref={recentRowRef}>
//               {recent.map((r) => (
//                 <div
//                   key={r.id}
//                   className="recent-track-card"
//                   onClick={() => nav(`/track/${r.id}`)}
//                 >
//                   <Card className="music-card">
//                     <Card.Img
//                       className="music-card-img"
//                       src={r.cover_url || "/covers/default.jpg"}
//                     />
//                     <Card.Body className="music-card-body">
//                       <div className="music-card-title-below">{r.title}</div>
//                       <div className="music-card-artist-below">{r.artist}</div>
//                     </Card.Body>
//                   </Card>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* ---------------- COLLECTION GRID ---------------- */}
//       <div className="music-grid">
//         {filtered.map((t) => (
//           <Card
//             key={t.id}
//             className="music-card"
//             onClick={() => nav(`/track/${t.id}`)}
//           >
//             <div className="music-card-cover">
//               <Card.Img
//                 className="music-card-img"
//                 src={t.cover_url || "/covers/default.jpg"}
//               />

//               {/* ❤️ LIKE BUTTON */}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (likedMap[t.id]) {
//                     unlikeSong(t.id);
//                   } else {
//                     likeSong(t.id);
//                   }
//                   setLikedMap((prev) => ({
//                     ...prev,
//                     [t.id]: !prev[t.id],
//                   }));
//                 }}
//                 style={{
//                   position: "absolute",
//                   top: 12,
//                   right: 12,
//                   background: "transparent",
//                   border: "none",
//                   fontSize: 18,
//                   cursor: "pointer",
//                   color: likedMap[t.id] ? "#1db954" : "#9aa4b2",
//                 }}
//               >
//                 ♥
//               </button>
//             </div>

//             <Card.Body className="music-card-body">
//               <h2 className="music-card-title-below">{t.title}</h2>
//               <p className="music-card-artist-below">{t.artist}</p>
//             </Card.Body>
//           </Card>
//         ))}
//       </div>
//     </main>
//   );
// }
