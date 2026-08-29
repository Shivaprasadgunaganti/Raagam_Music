import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./search.css";
// import "../components/playlistpicker.css";
import { useAudio } from "../context/AudioContext";
import SEO from "../components/SEO";
import { cleanSongTitle } from "../utils/cleanTitle";

export default function SearchPage() {
  const nav = useNavigate();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  const [tracks, setTracks] = useState([]);
  const [movies, setMovies] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [activeTab, setActiveTab] = useState("all"); // 🔥 DEFAULT ALL
  const [showDropdown, setShowDropdown] = useState(false);
  const [history, setHistory] = useState([]);
  const { setNewQueue } = useAudio();
  const [loading, setLoading] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState([]);

  /* ---------------- DEBOUNCE ---------------- */
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(query.trim());
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  /* ---------------- SAFE NORMALIZE ---------------- */
  function normalize(str) {
    if (!str) return "";
    return String(str).toLowerCase().replace(/\s+/g, "");
  }

  function fuzzyMatch(text, q) {
    const t = normalize(text);
    const queryNorm = normalize(q);

    if (!queryNorm) return true;
    if (t.includes(queryNorm)) return true;

    let ti = 0;
    for (let qi = 0; qi < queryNorm.length; qi++) {
      ti = t.indexOf(queryNorm[qi], ti);
      if (ti === -1) return false;
      ti++;
    }

    return true;
  }

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("search_history")) || [];
    setHistory(saved);
  }, []);

  function getPlaylistCovers(playlist) {
    if (!playlist.playlist_tracks) return [];

    return playlist.playlist_tracks
      .slice(0, 4)
      .map((pt) => pt.tracks?.cover_url)
      .filter(Boolean);
  }

  /* ---------------- FETCH ---------------- */
  // useEffect(() => {
  //   if (!debounced) {
  //     setTracks([]);
  //     setMovies([]);
  //     setPlaylists([]);
  //     return;
  //   }

  //   async function searchAll() {
  //     setLoading(true);

  //     try {
  //       const searchTerm = `%${debounced}%`;

  //       const { data: songData } = await supabase
  //         .from("tracks")
  //         .select("*")
  //         .or(`title.ilike.${searchTerm},artist.ilike.${searchTerm}`);

  //       const { data: movieData } = await supabase
  //         .from("movies")
  //         .select("*")
  //         .ilike("title", searchTerm);

  //       const { data: playlistData } = await supabase
  //         .from("playlists")
  //         .select(
  //           `
  //   id,
  //   name,
  //   playlist_tracks (
  //     track_id,
  //     tracks (
  //       cover_url
  //     )
  //   )
  // `,
  //         )
  //         .ilike("name", searchTerm);

  //       console.log(playlistData, "playlistdata");

  //       setTracks(songData || []);
  //       setMovies(movieData || []);
  //       setPlaylists(playlistData || []);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   searchAll();
  // }, [debounced]);


  useEffect(() => {
    if (!debounced) {
      setTracks([]);
      setMovies([]);
      setPlaylists([]);
      setYoutubeResults([]);
      return;
    }

    async function searchAll() {
      setLoading(true);

      try {
        const searchTerm = `%${debounced}%`;

        const { data: songData } = await supabase
          .from("tracks")
          .select("*")
          .or(`title.ilike.${searchTerm},artist.ilike.${searchTerm}`);

        // Fallback to YouTube if nothing found in Supabase
        if (!songData || songData.length === 0) {
          try {
            // const searchRes = await fetch(
            //   `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
            //     debounced
            //   )}&key=AIzaSyA01snmp9lmAtBT7Zv4h_poy5Yhf0BUzMw`
            // );
            const searchRes = await fetch(
  `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=5&q=${encodeURIComponent(
    debounced
  )}&key=AIzaSyA01snmp9lmAtBT7Zv4h_poy5Yhf0BUzMw`
);
            const searchData = await searchRes.json();
            const videoIds = (searchData.items || [])
              .map((item) => item.id.videoId)
              .join(",");

            let durationsById = {};
            if (videoIds) {
              const detailsRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=AIzaSyA01snmp9lmAtBT7Zv4h_poy5Yhf0BUxxx`
              );
              const detailsData = await detailsRes.json();
              (detailsData.items || []).forEach((item) => {
                durationsById[item.id] = parseDurationToSeconds(
                  item.contentDetails.duration
                );
              });
            }

            // const candidates = (searchData.items || []).map((item) => ({
            //   videoId: item.id.videoId,
            //   title: cleanSongTitle(item.snippet.title),
            //   rawTitle: item.snippet.title,
            //   thumbnail:
            //     item.snippet.thumbnails?.high?.url ||
            //     item.snippet.thumbnails?.default?.url,
            //   channelTitle: item.snippet.channelTitle,
            //   durationSeconds: durationsById[item.id.videoId] || 0,
            // }));

            const candidates = (searchData.items || []).map((item) => ({
  videoId: item.id.videoId,
  title: cleanSongTitle(item.snippet.title),
  rawTitle: item.snippet.title,
  thumbnail:
    item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
  channelTitle: item.snippet.channelTitle,
  durationSeconds: durationsById[item.id.videoId] || 0,
  artist: "Unknown",
  movie_id: null,
}));

            console.log("YouTube candidates (cleaned):", candidates);
            setYoutubeResults(candidates);
          } catch (err) {
            console.error("YouTube fallback search failed:", err);
            setYoutubeResults([]);
          }
        } else {
          setYoutubeResults([]);
        }

        const { data: movieData } = await supabase
          .from("movies")
          .select("*")
          .ilike("title", searchTerm);

        const { data: playlistData } = await supabase
          .from("playlists")
          .select(
            `
    id,
    name,
    playlist_tracks (
      track_id,
      tracks (
        cover_url
      )
    )
  `,
          )
          .ilike("name", searchTerm);

        console.log(playlistData, "playlistdata");

        setTracks(songData || []);
        setMovies(movieData || []);
        setPlaylists(playlistData || []);
      } finally {
        setLoading(false);
      }
    }

    searchAll();
  }, [debounced]);

  const saveSearch = (item) => {
    console.log("Saving search:", item);
    if (!item) return;

    let updated = [
      item,
      ...history.filter((h) => h.id !== item.id), // avoid duplicates
    ];

    updated = updated.slice(0, 7);

    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const filteredSongs = useMemo(() => {
    return tracks.filter((t) => fuzzyMatch(t.title, debounced));
  }, [tracks, debounced]);

  const filteredAlbums = useMemo(() => {
    return movies.filter((m) => fuzzyMatch(m.title, debounced));
  }, [movies, debounced]);

  const filteredPlaylists = useMemo(() => {
    return playlists.filter((p) => fuzzyMatch(p.name, debounced));
  }, [playlists, debounced]);

  const suggestionList = useMemo(() => {
    return [
      ...filteredSongs.map((t) => ({ ...t, type: "song" })),
      ...filteredAlbums.map((m) => ({ ...m, type: "album" })),
      ...filteredPlaylists.map((p) => ({ ...p, type: "playlist" })),
    ].slice(0, 5);
  }, [filteredSongs, filteredAlbums, filteredPlaylists]);

  const removeHistoryItem = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };
  // console.log("PLAYLIST RAW:", playlists);


const playRecentSong = async (songId) => {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", songId)
      .single();

    if (error) {
      console.error("Failed to load recent song:", error);
      return;
    }

    if (!data) return;

    // Play only the clicked song
    setNewQueue([data], 0);

    setShowDropdown(false);
  } catch (error) {
    console.error("Error playing recent song:", error);
  }
};

function parseDurationToSeconds(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// function handlePlayYoutubeCandidate(candidate) {
//   // Step 6 will replace this with: insert into Supabase, get back track_id, then setNewQueue([track], 0)
//   console.log("User tapped a YouTube result, ready to save + play:", candidate);
// }

async function handlePlayYoutubeCandidate(candidate) {
  try {
    // Guard: has this exact video already been saved (by anyone)?
    const { data: existing } = await supabase
      .from("tracks")
      .select("*")
      .eq("youtube_video_id", candidate.videoId)
      .maybeSingle();

    if (existing) {
      setNewQueue([existing], 0);
      return;
    }

    const { data: savedTrack, error } = await supabase
      .from("tracks")
      .insert({
        title: candidate.title,
        artist: candidate.artist || "Unknown",
        movie_id: candidate.movie_id || null,
        cover_url: candidate.thumbnail,
        youtube_video_id: candidate.videoId,
        duration_seconds: candidate.durationSeconds || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save YouTube track:", error.message);
      return;
    }

    setNewQueue([savedTrack], 0);
  } catch (err) {
    console.error("Unexpected error saving YouTube track:", err);
  }
}

  return (
    <main className="search-page page-safe">
      {/* seo */}
      <SEO
        title="Offline Songs | MyRaagam"
        description="Access your offline songs on MyRaagam."
        robots="noindex, nofollow"
      />
      <div className="search-header">
        <input
          type="search"
          placeholder="Search songs, albums, playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // saveSearch(query);
              setShowDropdown(false);
            }
          }}
        />

        {showDropdown && query.trim().length > 0 && (
          <div className="search-dropdown">
            {loading ? (
              <div className="dropdown-loading">
                <div className="search-spinner"></div>
              </div>
            ) : suggestionList.length > 0 ? (
              suggestionList.map((item) => (
                <div
                  key={item.id}
                  className="dropdown-item"
                  onMouseDown={() => {
                    if (item.type === "song") {
                      setNewQueue(
                        filteredSongs,
                        filteredSongs.findIndex((x) => x.id === item.id),
                      );
                    }

                    saveSearch({
                      id: item.id,
                      title: item.title || item.name,
                      cover_url: item.cover_url,
                      type: item.type,
                    });

                    setShowDropdown(false);

                    // if (item.type === "song") nav(`/track/${item.id}`);
                    if (item.type === "album") nav(`/movie/${item.id}`);
                    if (item.type === "playlist") nav(`/playlist/${item.id}`);
                  }}
                >
                  <img
                    // src={item.cover_url || "/covers/default.jpg"}
                    src={
                      item.cover_url ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfj0yAzszjs4P-D7Bmibv09inT11Wq0am-ow72MgxEZ6v8e_WBcYVOdJ6m&s=10"
                    }
                    className="dropdown-img"
                    alt=""
                  />

                  <div className="dropdown-info">
                    <div className="dropdown-title">
                      {item.title || item.name}
                    </div>
                    <div className="dropdown-meta">{item.type}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dropdown-empty">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* TABS */}
      {debounced && (
        <div className="search-tabs">
          {["all", "songs", "albums", "playlists"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {!debounced && (
        <section>
          <h3 style={{ marginBottom: 10 }}>Recent Searches</h3>

          {history.length > 0 ? (
            <div>
              {history.map((h, i) => (
                <div
                  key={i}
                  className="dropdown-item"
                  // onMouseDown={() => {
                  //   setQuery(h.title);
                  //   setShowDropdown(false);
                  // }}

                  onMouseDown={() => {
  if (h.type === "song") {
    playRecentSong(h.id);
    return;
  }

  setShowDropdown(false);

  if (h.type === "album") {
    nav(`/movie/${h.id}`);
  }

  if (h.type === "playlist") {
    nav(`/playlist/${h.id}`);
  }
}}

                  // onMouseDown={() => {
                  //   setShowDropdown(false);

                  //   if (h.type === "song") {
                  //     setNewQueue(
                  //       filteredSongs,
                  //       filteredSongs.findIndex((x) => x.id === h.id),
                  //     );
                  //     nav(`/track/${h.id}`);
                  //   }

                  //   if (h.type === "album") {
                  //     nav(`/movie/${h.id}`);
                  //   }

                  //   if (h.type === "playlist") {
                  //     nav(`/playlist/${h.id}`);
                  //   }
                  // }}
                >
                  <img
                    // src={h.cover_url || "/covers/default.jpg"}
                    src={
                      h.cover_url ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfj0yAzszjs4P-D7Bmibv09inT11Wq0am-ow72MgxEZ6v8e_WBcYVOdJ6m&s=10"
                    }
                    className="dropdown-img"
                  />

                  <div className="dropdown-info">
                    <div className="dropdown-title">{h.title}</div>
                    <div className="dropdown-meta">{h.type}</div>
                  </div>

                  {/* ❌ REMOVE BUTTON */}
                  <button
                    className="history-remove"
                    onMouseDown={(e) => {
                      e.stopPropagation(); // 🔥 stops parent trigger
                      removeHistoryItem(h.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-placeholder">
              <p>No recent searches yet</p>
            </div>
          )}
        </section>
      )}

      {/* RESULTS */}
      {debounced && !showDropdown && (
        <>
          {/* SONGS */}
          {(activeTab === "all" || activeTab === "songs") &&
            filteredSongs.length > 0 && (
              <section>
                <h3>Songs</h3>
                {filteredSongs.map((t) => (
                  <div
                    key={t.id}
                    className="search-item"
                    // onClick={() => nav(`/track/${t.id}`)}
                    onClick={() => {
                      saveSearch({
                        id: t.id,
                        title: t.title,
                        cover_url: t.cover_url,
                        type: "song",
                      });

                      setNewQueue(
                        filteredSongs,
                        filteredSongs.findIndex((x) => x.id === t.id),
                      );

                      // nav(`/track/${t.id}`);
                    }}
                  >
                    <img src={t.cover_url} alt="" />
                    <div>
                      <div className="title">{t.title}</div>
                      {/* <div className="sub">{t.artist}</div> */}
                      <div className="album-meta">Song</div>
                    </div>
                  </div>
                ))}
              </section>
            )}

          {/* ALBUMS */}
          {(activeTab === "all" || activeTab === "albums") && (
            <section className="albums-section">
              {/* <h3 className="section-title">Albums</h3> */}

              <div className="search-albums-list">
                {filteredAlbums.map((m) => (
                  <div
                    key={m.id}
                    className="search-album-row"
                    // onClick={() => nav(`/movie/${m.id}`)}
                    onClick={() => {
                      saveSearch({
                        id: m.id,
                        title: m.title,
                        cover_url: m.cover_url,
                        type: "album",
                      });

                      nav(`/movie/${m.id}`);
                    }}
                  >
                    <img src={m.cover_url} alt={m.title} />

                    <div className="album-info">
                      <div className="album-title">{m.title}</div>
                      <div className="album-meta">Album</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(activeTab === "all" || activeTab === "playlists") &&
            filteredPlaylists.length > 0 && (
              <section>
                <h3>Playlists</h3>

                {filteredPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="search-item"
                    // onClick={() => nav(`/playlist/${playlist.id}`)}
                    onClick={() => {
                      saveSearch({
                        id: playlist.id,
                        title: playlist.name,
                        // cover_url: getPlaylistCovers(playlist)[0],
                        // cover_url:
                        //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfj0yAzszjs4P-D7Bmibv09inT11Wq0am-ow72MgxEZ6v8e_WBcYVOdJ6m&s=10",
                        type: "playlist",
                      });

                      nav(`/playlist/${playlist.id}`);
                    }}
                  >
                    <img
                      src={
                        playlist.cover_url ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfj0yAzszjs4P-D7Bmibv09inT11Wq0am-ow72MgxEZ6v8e_WBcYVOdJ6m&s=10"
                      }
                      alt=""
                    />

                    <div>
                      <div className="title">{playlist.name}</div>

                      <div className="album-meta">Playlist</div>
                    </div>
                  </div>
                ))}
              </section>
            )}
        </>
      )}

   {/* {youtubeResults.length > 0 && (
  <div className="youtube-results-section">
    <h3>From YouTube</h3>
    {youtubeResults.map((candidate) => (
      <div
        key={candidate.videoId}
        className="youtube-result-item"
        onClick={() => handlePlayYoutubeCandidate(candidate)}
      >
        <img src={candidate.thumbnail} alt={candidate.title} />
        <div>
          <p>{candidate.title}</p>
          <span>{candidate.channelTitle}</span>
        </div>
      </div>
    ))}
  </div>
)} */}

{youtubeResults.length > 0 && (
  <div className="albums-section">
    {/* <h3 className="section-title">From YouTube</h3> */}
    {youtubeResults.map((candidate) => (
      <div
        key={candidate.videoId}
        className="search-item"
        onClick={() => handlePlayYoutubeCandidate(candidate)}
      >
        <img src={candidate.thumbnail} alt={candidate.title} />
        <div>
          <div className="title">{candidate.title}</div>
          <div className="sub">{candidate.channelTitle}</div>
        </div>
      </div>
    ))}
  </div>
)}


    </main>
  );
}
