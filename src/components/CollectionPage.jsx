// // src/components/CollectionPage.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import useTracks from "../hooks/useTracks";
// import useRecent from "../hooks/useRecent";
// import "./collection.css";
// import { Card } from "react-bootstrap";
// import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
// import { useAudio } from "../context/AudioContext";
// import { supabase } from "../supabaseClient";
// import { useLikes } from "../context/LikeContext";
// import { useAuth } from "../context/AuthContext";
// import PlaylistModal from "../components/PlaylistModal";
// import { useToast } from "../context/ToastContext";
// import LazyImage from "../components/LazyImage";
// import SkeletonCard from "../components/SkeletonCard";

// export default function CollectionPage() {
//   const { tracks, loading } = useTracks();
//   const { recent } = useRecent();
//   const nav = useNavigate();
//   const [newPlaylistName, setNewPlaylistName] = useState("");
//   const { playAll, shufflePlay, setNewQueue, setResumeTime } = useAudio();
//   const [loadedImages, setLoadedImages] = useState({});

//   const playFromContinue = (track, startTime) => {
//     if (!track) return;

//     setResumeTime(startTime || 0); // 🔥 set resume time
//     // setNewQueue([track], 0);
//     setNewQueue(
//       recent,
//       recent.findIndex((t) => t.id === track.id),
//     );
//   };

//   const [query, setQuery] = useState("");
//   const [debounced, setDebounced] = useState("");
//   const { user } = useAuth();
//   const [continueTracks, setContinueTracks] = useState([]);

//   // ❤️ Like state map
//   const [likedMap, setLikedMap] = useState({});
//   const [movies, setMovies] = useState([]);
//   const [playlists, setPlaylists] = useState([]);
//   const { showToast } = useToast();

//   const recentList = useMemo(() => {
//     return recent.slice(0, 8).map((track, index) => ({
//       ...track,
//       index,
//     }));
//   }, [recent]);

//   const trendingTracks = useMemo(() => {
//   if (!tracks?.length) return [];

//   // newest first
//   const sorted = [...tracks].sort(
//     (a, b) => new Date(b.created_at) - new Date(a.created_at)
//   );

//   // take latest 20
//   const latest = sorted.slice(0, 20);

//   // slight shuffle for dynamic feel
//   return latest.sort(() => Math.random() - 0.5).slice(0, 10);
// }, [tracks]);

// // Made for you
// const madeForYou = useMemo(() => {
//   if (!tracks?.length) return [];

//   // recent artists
//   const recentArtists = recent.map((t) => t.artist).filter(Boolean);

//   // liked song ids
//   const likedIds = Object.keys(likedMap).filter((id) => likedMap[id]);

//   // liked tracks
//   const likedTracks = tracks.filter((t) =>
//     likedIds.includes(String(t.id))
//   );

//   // liked artists
//   const likedArtists = likedTracks
//     .map((t) => t.artist)
//     .filter(Boolean);

//   // combine preference artists
//   const favoriteArtists = [
//     ...new Set([...recentArtists, ...likedArtists]),
//   ];

//   // recommendation candidates
//   const recommended = tracks.filter((track) => {
//     return favoriteArtists.includes(track.artist);
//   });

//   // remove duplicates already in recent
//   const recentIds = recent.map((t) => t.id);

//   const filtered = recommended.filter(
//     (t) => !recentIds.includes(t.id)
//   );

//   // shuffle for dynamic feel
//   return [...filtered]
//     .sort(() => Math.random() - 0.5)
//     .slice(0, 10);
// }, [tracks, recent, likedMap]);

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

//   useEffect(() => {
//     async function loadMovies() {
//       const { data } = await supabase
//         .from("movies")
//         .select("id, title, cover_url")
//         .order("id", { ascending: false })
//         .limit(8);

//       setMovies(data || []);
//     }

//     loadMovies();
//   }, []);

//   const loadPlaylists = async () => {
//     if (!user) return;

//     const { data, error } = await supabase
//       .from("playlists")
//       // .select("id, name, cover_url")
//       .select(
//         `
//   id,
//   name,
//   playlist_tracks (
//     track_id,
//     tracks (cover_url)
//   )
// `,
//       )
//       .eq("user_id", user.id) // 🔥 VERY IMPORTANT
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.log("Fetch playlist error:", error);
//       return;
//     }

//     setPlaylists(data || []);
//   };

//   useEffect(() => {
//     loadPlaylists();
//   }, [user]);

//   useEffect(() => {
//     fetchContinueListening();
//   }, [user]);

//   const getPlaylistCovers = (playlist) => {
//     if (!playlist.playlist_tracks) return [];

//     return playlist.playlist_tracks
//       .slice(0, 4)
//       .map((pt) => pt.tracks?.cover_url)
//       .filter(Boolean);
//   };

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
//   const fetchContinueListening = async () => {
//     if (!user) return;

//     const { data, error } = await supabase
//       .from("continue_listening")
//       .select("track_id, last_position, duration, tracks(*)")
//       .eq("user_id", user.id) // 🔥 IMPORTANT FILTER
//       .order("updated_at", { ascending: false })
//       .limit(10);

//     if (error) {
//       console.log(error);
//       return;
//     }

//     setContinueTracks(data || []);
//   };

//   const createPlaylist = async () => {
//     if (!newPlaylistName.trim() || !user) return;

//     const { error } = await supabase.from("playlists").insert({
//       name: newPlaylistName.trim(),
//       user_id: user.id,
//     });

//     if (error) {
//       // 🔥 Handle duplicate error
//       if (error.code === "23505") {
//         alert("Playlist with this name already exists!");
//       } else {
//         console.log("Error creating playlist:", error);
//       }
//       return;
//     }

//     setNewPlaylistName("");
//     loadPlaylists();
//   };

//   // add to playlist
//   const addToPlaylist = async (playlistId, trackId) => {
//     if (!playlistId || !trackId) return;

//     const { error } = await supabase.from("playlist_tracks").insert({
//       playlist_id: playlistId,
//       track_id: trackId,
//     });

//     if (error) {
//       console.log("Error adding to playlist:", error);
//     } else {
//       // alert("Added to playlist ✅");
//       showToast("Added to Playlist");
//     }
//   };

//   //
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
//       c.remove(),
//     );

//     const originals = Array.from(row.children).filter((c) =>
//       c.classList.contains("original"),
//     );

//     originals.forEach((node) => {
//       const clone = node.cloneNode(true);
//       clone.classList.remove("original");
//       clone.classList.add("clone");
//       row.appendChild(clone);
//     });

//     if (row.scrollWidth > row.clientWidth) {
//       row.classList.add("marquee");
//       row.style.animationDuration = `${Math.max(12, row.scrollWidth * 0.02)}s`;
//     } else {
//       row.classList.remove("marquee");
//     }

//     return () => {
//       Array.from(row.querySelectorAll(".recent-track-card.clone")).forEach(
//         (c) => c.remove(),
//       );
//       row.classList.remove("marquee");
//     };
//   }, [recent]);

//   if (loading) return <div style={{ padding: 20 }}>Loading tracks…</div>;

//   return (
//     <main style={{ padding: 20 }} className="page-safe">
//       {/* ---------------- HEADER ---------------- */}
//       <header style={{ textAlign: "center", marginBottom: 12 }}>
//         <h1 style={{ margin: 0 }}>Collection</h1>
//         <p style={{ color: "#9aa4b2" }}>Browse songs & albums</p>
//       </header>
//       <div
//         style={{
//           display: "flex",
//           gap: 12,
//           justifyContent: "center",
//           marginBottom: 16,
//         }}
//       >
//         <button onClick={() => playAll(filtered)}>▶ Play All</button>
//         <button onClick={() => shufflePlay(filtered)}>🔀 Shuffle</button>
//       </div>

//       {/* ---------------- HOME SHORTCUTS (NEW) ---------------- */}
//       <section className="home-shortcuts">
//         {/* <div className="shortcut-card" onClick={() => nav("/liked")}>
//           ❤️
//           <span>Liked Songs</span>
//         </div> */}

//         <div className="shortcut-card" onClick={() => nav("/playlists")}>
//           📂
//           <span>Playlists</span>
//         </div>

//         <div className="shortcut-card" onClick={() => nav("/movies")}>
//           🎬
//           <span>Movies</span>
//         </div>

//         {/* Logout  */}
//         <div onClick={() => nav("/logout")}>
//           <span>Logout</span>
//         </div>
//       </section>

//       {/* ---------------- SEARCH ---------------- */}
//       <div style={{ marginBottom: 20 }}>
//         <input
//           type="text"
//           placeholder="New Playlist Name"
//           value={newPlaylistName}
//           onChange={(e) => setNewPlaylistName(e.target.value)}
//         />

//         <button onClick={createPlaylist}>Create Playlist</button>
//       </div>

//         {/* continue listing */}
//       {recent?.length > 0 && (
//         <section style={{ marginBottom: 20 }}>
//           <h3>Continue Listening</h3>

//           <div className="horizontal-row">
//             {continueTracks.slice(0, 4).map((item) => {
//               const track = item.tracks;

//               const percent =
//                 item.duration > 0
//                   ? (item.last_position / item.duration) * 100
//                   : 0;

//               return (
//                 <div
//                   key={track.id}
//                   className="album-card"
//                   // onClick={() => nav(`/track/${track.id}`)}
//                   onClick={() => playFromContinue(track, item.last_position)}
//                 >
//                   <img
//                     src={track.cover_url || "/covers/default.jpg"}
//                     alt={track.title}
//                   />

//                   {percent > 0 && (
//                     <div className="card-progress">
//                       <div
//                         className="card-progress-fill"
//                         style={{ width: `${percent}%` }}
//                       />
//                     </div>
//                   )}

//                   <div className="album-title">{track.title}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </section>
//       )}

//       {/* trending songs  */}
// {trendingTracks.length > 0 && (
//   <section style={{ marginBottom: 24 }}>
//     <h3>Trending Now</h3>

//     <div className="horizontal-row">
//       {trendingTracks.map((track, index) => (
//         <div
//           key={track.id}
//           className="album-card"
//           onClick={() => setNewQueue(trendingTracks, index)}
//         >
//           <LazyImage
//             src={track.cover_url || "/covers/default.jpg"}
//             alt={track.title}
//           />

//           <div className="album-title">
//             {track.title}
//           </div>
         
//         </div>
//       ))}
//     </div>
//   </section>
// )}

// {/* Made for you  */}
// {madeForYou.length > 0 && (
//   <section style={{ marginBottom: 24 }}>
//     <h3>Made For You</h3>

//     <div className="horizontal-row">
//       {madeForYou.map((track, index) => (
//         <div
//           key={track.id}
//           className="album-card"
//           onClick={() => setNewQueue(madeForYou, index)}
//         >
//           <LazyImage
//             src={track.cover_url || "/covers/default.jpg"}
//             alt={track.title}
//           />

//           <div className="album-title">
//             {track.title}
//           </div>

//           <div className="album-subtitle">
//             {track.artist || "Unknown Artist"}
//           </div>
//         </div>
//       ))}
//     </div>
//   </section>
// )}
    

//       {/* ---------------- RECENTLY PLAYED ---------------- */}

//       {recent?.length > 0 && (
//         <section style={{ marginBottom: 20 }}>
//           <h3>Recently Played</h3>

//           <div className="horizontal-row">
//             {recent?.length === 0
//               ? Array.from({ length: 6 }).map((_, i) => (
//                   <SkeletonCard key={i} />
//                 ))
//               : recentList.map((track) => (
//                   <div
//                     key={track.id}
//                     className="album-card"
//                     onClick={() => setNewQueue(recent, track.index)}
//                   >
//                     <LazyImage
//                       src={track.cover_url || "/covers/default.jpg"}
//                       alt={track.title}
//                     />
//                     <div className="album-title">{track.title}</div>
//                   </div>
//                 ))}
//           </div>
//         </section>
//       )}

//       {playlists.length > 0 && (
//         <section style={{ marginBottom: 20 }}>
//           <h3>Your Playlists</h3>

//           <div className="horizontal-row">
//             {playlists.length === 0
//               ? Array.from({ length: 6 }).map((_, i) => (
//                   <SkeletonCard key={i} />
//                 ))
//               : playlists.map((p) => {
//                   const covers = getPlaylistCovers(p);

//                   return (
//                     <div
//                       key={p.id}
//                       className="playlist-card"
//                       onClick={() => nav(`/playlist/${p.id}`)}
//                     >
//                       <div className="playlist-cover">
//                         {covers.length > 0 ? (
//                           <div
//                             className={`playlist-cover-grid count-${covers.length}`}
//                           >
//                             {covers.map((c, i) => (
//                               <LazyImage key={i} src={c} alt="cover" />
//                             ))}
//                           </div>
//                         ) : (
//                           <LazyImage src="/covers/default.jpg" alt={p.name} />
//                         )}
//                       </div>

//                       <div className="playlist-title">{p.name}</div>
//                     </div>
//                   );
//                 })}
//           </div>
//         </section>
//       )}

//       {movies.length > 0 && (
//         <section style={{ marginBottom: 20 }}>
//           <h3>Albums for you</h3>

//           <div className="horizontal-row">
//             {movies.length === 0
//               ? Array.from({ length: 6 }).map((_, i) => (
//                   <SkeletonCard key={i} />
//                 ))
//               : movies.map((m) => (
//                   <div
//                     key={m.id}
//                     className="album-card"
//                     onClick={() => nav(`/movie/${m.id}`)}
//                   >
//                     <LazyImage
//                       src={m.cover_url || "/covers/default.jpg"}
//                       alt={m.title}
//                     />
//                     <div className="album-title">{m.title}</div>
//                   </div>
//                 ))}
//           </div>
//         </section>
//       )}

//       {/* ---------------- COLLECTION GRID ---------------- */}

//       <div className="music-grid">
//         {filtered.length === 0
//           ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
//           : filtered.slice(0, 12).map((t) => (
//               <Card
//                 key={t.id}
//                 className="music-card"
//                 onClick={() => nav(`/track/${t.id}`)}
//               >
//                 <div className="music-card-cover">
//                   <LazyImage
//                     src={t.cover_url || "/covers/default.jpg"}
//                     alt={t.title}
//                     className="music-card-img"
//                   />

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (likedMap[t.id]) {
//                         unlikeSong(t.id);
//                       } else {
//                         likeSong(t.id);
//                       }
//                       setLikedMap((prev) => ({
//                         ...prev,
//                         [t.id]: !prev[t.id],
//                       }));
//                     }}
//                   >
//                     ♥
//                   </button>
//                 </div>

//                 <Card.Body>
//                   <h2>{t.title}</h2>
//                   <p>{t.artist}</p>
//                 </Card.Body>
//               </Card>
//             ))}
//       </div>
//       {filtered.length > 12 && (
//         <div style={{ textAlign: "center", marginTop: 12 }}>
//           <button onClick={() => nav("/all-songs")}>View All Songs</button>
//         </div>
//       )}
//     </main>
//   );
// }



// src/components/CollectionPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import useTracks from "../hooks/useTracks";
import useRecent from "../hooks/useRecent";
import "./collection.css";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LazyImage from "../components/LazyImage";
import SkeletonCard from "../components/SkeletonCard";

export default function CollectionPage() {
  const { tracks, loading } = useTracks();
  const { recent } = useRecent();
  const nav = useNavigate();
  const { playAll, shufflePlay, setNewQueue, setResumeTime } = useAudio();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [likedMap, setLikedMap] = useState({});
  const [movies, setMovies] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [continueTracks, setContinueTracks] = useState([]);
  const [activeTab, setActiveTab] = useState("continue");
  const [heroIndex, setHeroIndex] = useState(() => Math.floor(Math.random() * 2));
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  const username =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

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
      .select(`
        id,
        name,
        playlist_tracks (
          track_id,
          tracks (cover_url)
        )
      `)
      .eq("user_id", user.id)
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

  const fetchContinueListening = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("continue_listening")
      .select("track_id, last_position, duration, tracks(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.log(error);
      return;
    }

    setContinueTracks(data || []);
  };

  useEffect(() => {
    fetchContinueListening();
  }, [user]);

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;

    const { error } = await supabase.from("playlists").insert({
      name: newPlaylistName.trim(),
      user_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        alert("Playlist with this name already exists!");
      } else {
        console.log("Error creating playlist:", error);
      }
      return;
    }

    setNewPlaylistName("");
    loadPlaylists();
    showToast("Playlist created");
  };

  const playFromContinue = (track, startTime) => {
    if (!track) return;
    setResumeTime(startTime || 0);
    setNewQueue(
      recent,
      recent.findIndex((t) => t.id === track.id)
    );
  };

  const addToLiked = (e, trackId) => {
    e.stopPropagation();
    if (likedMap[trackId]) {
      unlikeSong(trackId);
    } else {
      likeSong(trackId);
    }
    setLikedMap((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const getPlaylistCovers = (playlist) => {
    if (!playlist.playlist_tracks) return [];
    return playlist.playlist_tracks
      .slice(0, 4)
      .map((pt) => pt.tracks?.cover_url)
      .filter(Boolean);
  };

  const recentList = useMemo(() => {
    return recent.slice(0, 8).map((track, index) => ({
      ...track,
      index,
    }));
  }, [recent]);

  const trendingTracks = useMemo(() => {
    if (!tracks?.length) return [];
    const sorted = [...tracks].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const latest = sorted.slice(0, 20);
    return latest.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [tracks]);

  const madeForYou = useMemo(() => {
    if (!tracks?.length) return [];

    const recentArtists = recent.map((t) => t.artist).filter(Boolean);
    const likedIds = Object.keys(likedMap).filter((id) => likedMap[id]);
    const likedTracks = tracks.filter((t) =>
      likedIds.includes(String(t.id))
    );
    const likedArtists = likedTracks.map((t) => t.artist).filter(Boolean);

    const favoriteArtists = [...new Set([...recentArtists, ...likedArtists])];

    const recommended = tracks.filter((track) =>
      favoriteArtists.includes(track.artist)
    );

    const recentIds = recent.map((t) => t.id);

    return recommended
      .filter((t) => !recentIds.includes(t.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  }, [tracks, recent, likedMap]);

  const filtered = useMemo(() => {
    if (!debounced) return tracks || [];
    const q = debounced.toLowerCase();
    return (tracks || []).filter((t) => {
      const title = (t.title || "").toLowerCase();
      const artist = (t.artist || "").toLowerCase();
      return title.includes(q) || artist.includes(q);
    });
  }, [tracks, debounced]);

  const heroSlides = useMemo(() => {
    const base = [trendingTracks[0], madeForYou[0]].filter(Boolean);
    return base.slice(0, 2).map((track, index) => ({
      id: track.id,
      title: track.title,
      artist: track.artist || "Unknown Artist",
      description: "A fresh pick based on your recent listening.",
      image: track.cover_url || "/covers/default.jpg",
      onClick: () => setNewQueue(base, index),
    }));
  }, [trendingTracks, madeForYou, setNewQueue]);

  const switchTabs = [
    { key: "continue", label: "Continue Listening" },
    { key: "trending", label: "Trending" },
    { key: "recent", label: "Recently Played" },
    { key: "playlists", label: "Your Playlists" },
    { key: "albums", label: "Albums for You" },
  ];

  const renderSectionHeader = (title, onClick) => (
    <div className="section-row-header">
      <h3>{title}</h3>
      <button onClick={onClick}>See all</button>
    </div>
  );

  const renderTrackRail = (items, queueSource, isContinue = false) => {
    if (!items?.length) return null;

    return (
      <div className="horizontal-row">
        {items.map((item, index) => {
          const track = isContinue ? item.tracks : item;
          if (!track) return null;

          const percent =
            isContinue && item.duration > 0
              ? (item.last_position / item.duration) * 100
              : 0;

          return (
            <div
              key={`${track.id}-${index}`}
              className="album-card"
              onClick={() =>
                isContinue
                  ? playFromContinue(track, item.last_position)
                  : setNewQueue(queueSource, index)
              }
            >
              <div className="album-img-shell">
                <LazyImage
                  src={track.cover_url || "/covers/default.jpg"}
                  alt={track.title}
                />
                {isContinue && percent > 0 && (
                  <div className="card-progress overlay-progress">
                    <div
                      className="card-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="album-title">{track.title}</div>
              <div className="album-subtitle">
                {track.artist || "Unknown Artist"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPlaylistsRail = () => {
    if (!playlists.length) return null;

    return (
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
                      <LazyImage key={i} src={c} alt="cover" />
                    ))}
                  </div>
                ) : (
                  <LazyImage src="/covers/default.jpg" alt={p.name} />
                )}
              </div>
              <div className="playlist-title">{p.name}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMoviesRail = () => {
    if (!movies.length) return null;

    return (
      <div className="horizontal-row">
        {movies.map((m) => (
          <div
            key={m.id}
            className="album-card"
            onClick={() => nav(`/movie/${m.id}`)}
          >
            <div className="album-img-shell">
              <LazyImage
                src={m.cover_url || "/covers/default.jpg"}
                alt={m.title}
              />
            </div>
            <div className="album-title">{m.title}</div>
            <div className="album-subtitle">Album pick</div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "continue":
        return renderTrackRail(continueTracks.slice(0, 6), continueTracks, true);
      case "trending":
        return renderTrackRail(trendingTracks.slice(0, 8), trendingTracks);
      case "recent":
        return renderTrackRail(recentList.slice(0, 8), recent);
      case "playlists":
        return renderPlaylistsRail();
      case "albums":
        return renderMoviesRail();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="homepage page-safe">
        <div className="loading-state">Loading tracks…</div>
      </main>
    );
  }

  return (
    <main className="homepage page-safe">
      <div className="home-bg-orb home-bg-orb-1" />
      <div className="home-bg-orb home-bg-orb-2" />

      <header className="home-header">
        <div>
          <p className="home-greeting">Hi, {username}</p>
          <h1 className="home-title">Welcome back</h1>
        </div>

        <div className="home-actions">
          <button onClick={() => nav("/search")} aria-label="Search">
            🔍
          </button>
          <button onClick={() => nav("/profile")} aria-label="Profile">
            👤
          </button>
        </div>
      </header>

      {heroSlides.length > 0 && (
        <section className="home-section featured-carousel-section">
          <div className="featured-carousel-shell">
            <div
              className="featured-carousel-track"
              style={{ transform: `translateX(-${heroIndex * 100}%)` }}
            >
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="featured-slide"
                  onClick={slide.onClick}
                >
                  <LazyImage src={slide.image} alt={slide.title} />
                  <div className="featured-overlay" />
                  <div className="featured-content">
                    <span className="featured-badge">NEW RELEASE</span>
                    <h2>{slide.title}</h2>
                    <h4>{slide.artist}</h4>
                    <p>{slide.description}</p>
                    <div className="featured-buttons">
                      <button
                        className="play-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          slide.onClick();
                        }}
                      >
                        ▶ Play
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={heroIndex === index ? "active" : ""}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="switch-tabs">
          {switchTabs.map((tab) => (
            <button
              key={tab.key}
              className={`switch-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        {renderSectionHeader(
          switchTabs.find((t) => t.key === activeTab)?.label || "Browse",
          activeTab === "continue"
            ? () => nav("/continue-listening")
            : activeTab === "trending"
              ? () => nav("/trending")
              : activeTab === "recent"
                ? () => nav("/recent")
                : activeTab === "playlists"
                  ? () => nav("/playlists")
                  : () => nav("/movies")
        )}
        {renderActiveTabContent()}
      </section>

      {madeForYou.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Made for You", () => nav("/recommended"))}
          {renderTrackRail(madeForYou.slice(0, 8), madeForYou)}
        </section>
      )}

      {recentList.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Recently Played", () => nav("/recent"))}
          {renderTrackRail(recentList.slice(0, 8), recent)}
        </section>
      )}

      {playlists.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Your Playlists", () => nav("/playlists"))}
          {renderPlaylistsRail()}
        </section>
      )}

      {movies.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Albums for You", () => nav("/movies"))}
          {renderMoviesRail()}
        </section>
      )}

      <section className="home-section">
        {renderSectionHeader("Songs", () => nav("/all-songs"))}

        <div className="songs-list">
          {filtered.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.slice(0, 3).map((t, index) => (
                <Card
                  key={t.id}
                  className="song-list-card"
                  onClick={() => setNewQueue(filtered, index)}
                >
                  <div className="song-list-left">
                    <LazyImage
                      src={t.cover_url || "/covers/default.jpg"}
                      alt={t.title}
                      className="song-list-img"
                    />
                    <div className="song-list-meta">
                      <h4>{t.title}</h4>
                      <p>{t.artist || "Unknown Artist"}</p>
                    </div>
                  </div>

                  <div className="song-list-actions">
                    <button
                      className={`like-btn ${likedMap[t.id] ? "liked" : ""}`}
                      onClick={(e) => addToLiked(e, t.id)}
                      aria-label="Like song"
                    >
                      ♥
                    </button>
                    <button
                      className="play-inline-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewQueue(filtered, index);
                      }}
                      aria-label="Play song"
                    >
                      ▶
                    </button>
                  </div>
                </Card>
              ))}
        </div>
      </section>

      <section className="home-section utility-bar">
        <div className="utility-search">
          <input
            type="text"
            placeholder="Search songs or artists"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="utility-buttons">
          <button onClick={() => playAll(filtered)}>▶ Play All</button>
          <button onClick={() => shufflePlay(filtered)}>🔀 Shuffle</button>
        </div>
      </section>

      <section className="home-section create-playlist-card">
        <div className="create-playlist-head">
          <h3>Create Playlist</h3>
          <p>Save your mood, mixes, and favorite tracks.</p>
        </div>

        <div className="create-playlist-form">
          <input
            type="text"
            placeholder="New Playlist Name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button onClick={createPlaylist}>Create</button>
        </div>
      </section>
    </main>
  );
}
