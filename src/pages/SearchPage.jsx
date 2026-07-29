import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./search.css";
import { useAudio } from "../context/AudioContext";

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

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    if (!debounced) {
      setTracks([]);
      setMovies([]);
      setPlaylists([]);
      return;
    }

    async function searchAll() {
      const searchTerm = `%${debounced}%`;

      const { data: songData } = await supabase
        .from("tracks")
        .select("*")
        .or(`title.ilike.${searchTerm},artist.ilike.${searchTerm}`);

      const { data: movieData } = await supabase
        .from("movies")
        .select("*")
        .ilike("title", searchTerm);

      const { data: playlistData } = await supabase
        .from("playlists")
        .select("*")
        .ilike("name", searchTerm);

      setTracks(songData || []);
      setMovies(movieData || []);
      setPlaylists(playlistData || []);
    }

    searchAll();
  }, [debounced]);

  const saveSearch = (item) => {
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
  return (
    <main className="search-page page-safe">
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
              saveSearch(query); // ✅ correct
              setShowDropdown(false);
            }
          }}
        />

        {/* {showDropdown && ( */}
        {showDropdown && query.trim().length > 0 && (
          <div className="search-dropdown">
            {query.trim().length > 0 ? (
              suggestionList.length > 0 ? (
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

                      if (item.type === "song") nav(`/track/${item.id}`);
                      if (item.type === "album") nav(`/movie/${item.id}`);
                      if (item.type === "playlist") nav(`/playlist/${item.id}`);
                    }}
                  >
                    <img
                      src={item.cover_url || "/covers/default.jpg"}
                      className="dropdown-img"
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
                // <div className="dropdown-empty">No results found</div>
                <div className="dropdown-loading">
  <div className="search-spinner"></div>
</div>
              )
            ) : null  }
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
                    setShowDropdown(false);

                    if (h.type === "song") {
                      setNewQueue(
                        filteredSongs,
                        filteredSongs.findIndex((x) => x.id === h.id),
                      );
                      nav(`/track/${h.id}`);
                    }

                    if (h.type === "album") {
                      nav(`/movie/${h.id}`);
                    }

                    if (h.type === "playlist") {
                      nav(`/playlist/${h.id}`);
                    }
                  }}
                >
                  <img
                    src={h.cover_url || "/covers/default.jpg"}
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
                    onClick={() => nav(`/track/${t.id}`)}
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

          <section className="albums-section">
            {/* <h3 className="section-title">Albums</h3> */}

            <div className="search-albums-list">
              {filteredAlbums.map((m) => (
                <div
                  key={m.id}
                  className="search-album-row"
                  onClick={() => nav(`/movie/${m.id}`)}
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
        </>
      )}
    </main>
  );
}
