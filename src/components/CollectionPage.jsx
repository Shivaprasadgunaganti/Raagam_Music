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
import { useToast } from "../context/ToastContext";
import LazyImage from "../components/LazyImage";
import SkeletonCard from "../components/SkeletonCard";

export default function CollectionPage() {
  const { tracks, loading } = useTracks();
  const { recent } = useRecent();
  const nav = useNavigate();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { playAll, shufflePlay, setNewQueue, setResumeTime } = useAudio();
  const [loadedImages, setLoadedImages] = useState({});

  const playFromContinue = (track, startTime) => {
    if (!track) return;

    setResumeTime(startTime || 0); // 🔥 set resume time
    // setNewQueue([track], 0);
    setNewQueue(
      recent,
      recent.findIndex((t) => t.id === track.id),
    );
  };

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { user } = useAuth();
  const [continueTracks, setContinueTracks] = useState([]);

  // ❤️ Like state map
  const [likedMap, setLikedMap] = useState({});
  const [movies, setMovies] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const { showToast } = useToast();

  const recentList = useMemo(() => {
    return recent.slice(0, 8).map((track, index) => ({
      ...track,
      index,
    }));
  }, [recent]);

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
      .select(
        `
  id,
  name,
  playlist_tracks (
    track_id,
    tracks (cover_url)
  )
`,
      )
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

  /* ---------------- RECENT MARQUEE ---------------- */
  const fetchContinueListening = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("continue_listening")
      .select("track_id, last_position, duration, tracks(*)")
      .eq("user_id", user.id) // 🔥 IMPORTANT FILTER
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.log(error);
      return;
    }

    setContinueTracks(data || []);
  };

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

    const { error } = await supabase.from("playlist_tracks").insert({
      playlist_id: playlistId,
      track_id: trackId,
    });

    if (error) {
      console.log("Error adding to playlist:", error);
    } else {
      // alert("Added to playlist ✅");
      showToast("Added to Playlist");
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
      c.remove(),
    );

    const originals = Array.from(row.children).filter((c) =>
      c.classList.contains("original"),
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
        (c) => c.remove(),
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

        <button onClick={createPlaylist}>Create Playlist</button>
      </div>

      {recent?.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Continue Listening</h3>

          <div className="horizontal-row">
            {continueTracks.slice(0, 4).map((item) => {
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
                  onClick={() => playFromContinue(track, item.last_position)}
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

      {recent?.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Recently Played</h3>

          <div className="horizontal-row">
            {recent?.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : recentList.map((track) => (
                  <div
                    key={track.id}
                    className="album-card"
                    onClick={() => setNewQueue(recent, track.index)}
                  >
                    <LazyImage
                      src={track.cover_url || "/covers/default.jpg"}
                      alt={track.title}
                    />
                    <div className="album-title">{track.title}</div>
                  </div>
                ))}
          </div>
        </section>
      )}

      {playlists.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Your Playlists</h3>

          <div className="horizontal-row">
            {playlists.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : playlists.map((p) => {
                  const covers = getPlaylistCovers(p);

                  return (
                    <div
                      key={p.id}
                      className="playlist-card"
                      onClick={() => nav(`/playlist/${p.id}`)}
                    >
                      <div className="playlist-cover">
                        {covers.length > 0 ? (
                          <div
                            className={`playlist-cover-grid count-${covers.length}`}
                          >
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
        </section>
      )}

      {movies.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3>Albums for you</h3>

          <div className="horizontal-row">
            {movies.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : movies.map((m) => (
                  <div
                    key={m.id}
                    className="album-card"
                    onClick={() => nav(`/movie/${m.id}`)}
                  >
                    <LazyImage
                      src={m.cover_url || "/covers/default.jpg"}
                      alt={m.title}
                    />
                    <div className="album-title">{m.title}</div>
                  </div>
                ))}
          </div>
        </section>
      )}

      {/* ---------------- COLLECTION GRID ---------------- */}

      <div className="music-grid">
        {filtered.length === 0
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.slice(0, 12).map((t) => (
              <Card
                key={t.id}
                className="music-card"
                onClick={() => nav(`/track/${t.id}`)}
              >
                <div className="music-card-cover">
                  <LazyImage
                    src={t.cover_url || "/covers/default.jpg"}
                    alt={t.title}
                    className="music-card-img"
                  />

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
                  >
                    ♥
                  </button>
                </div>

                <Card.Body>
                  <h2>{t.title}</h2>
                  <p>{t.artist}</p>
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
