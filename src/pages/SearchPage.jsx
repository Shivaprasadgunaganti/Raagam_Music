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

    // async function searchAll() {
    //   const { data: songData } = await supabase
    //     .from("tracks")
    //     .select("*")
    //     .limit(30);

    //   const { data: movieData } = await supabase
    //     .from("movies")
    //     .select("*")
    //     .limit(30);

    //   const { data: playlistData } = await supabase
    //     .from("playlists")
    //     .select("*")
    //     .limit(30);

    //   setTracks(songData || []);
    //   setMovies(movieData || []);
    //   setPlaylists(playlistData || []);
    // }

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

  /* ---------------- FILTERED RESULTS ---------------- */
  //   const filteredSongs = useMemo(() => {
  //     return tracks.filter(
  //       (t) => fuzzyMatch(t.title, debounced) || fuzzyMatch(t.artist, debounced)
  //     );
  //   }, [tracks, debounced]);

  const saveSearch = (term) => {
  if (!term) return;

  let updated = [term, ...history.filter((h) => h !== term)];
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

  return (
    <main className="search-page page-safe">
      {/* SEARCH INPUT */}
      {/* <div className="search-header">
        <input
          type="search"
          placeholder="Search songs, albums, playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          
        />
      </div> */}
<div className="search-header">
  {/* <input
    type="search"
    placeholder="Search songs, albums, playlists..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="search-input"
    onFocus={() => setShowDropdown(true)}
    // onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
    onMouseDown={() => {
  setNewQueue(filteredSongs, filteredSongs.findIndex(x => x.id === t.id));
  setShowDropdown(false);
  nav(`/track/${t.id}`);
}}
    onKeyDown={(e) => {
  if (e.key === "Enter") {
    
    saveSearch(t.title);
  }
}}
  /> */}

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

  {/* {showDropdown && (
    <div className="search-dropdown">
      {query
        ? filteredSongs.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="dropdown-item"
              // onClick={() => {
              //   nav(`/track/${t.id}`);
              //   setShowDropdown(false);
              // }}

              onClick={() => {
  setNewQueue(filteredSongs, filteredSongs.findIndex(x => x.id === t.id));
  setShowDropdown(false);
  nav(`/track/${t.id}`);
}}
            >
              {t.title}
            </div>
          ))
        : history.map((h, i) => (
            <div
              key={i}
              className="dropdown-item"
              onClick={() => setQuery(h)}
            >
              🕘 {h}
            </div>
          ))}
    </div>
  )} */}

  {/* {showDropdown && (
  <div className="search-dropdown">
    {query
      ? filteredSongs.slice(0, 5).map((t) => (
          <div
            key={t.id}
            className="dropdown-item"
            onMouseDown={() => {
              setNewQueue(
                filteredSongs,
                filteredSongs.findIndex(x => x.id === t.id)
              );
              saveSearch(t.title); // ✅ save here
              setShowDropdown(false);
              nav(`/track/${t.id}`);
            }}
          >
            {t.title}
          </div>
        ))
      : history.map((h, i) => (
          <div
            key={i}
            className="dropdown-item"
            onMouseDown={() => {
              setQuery(h);
              setShowDropdown(false);
            }}
          >
            🕘 {h}
          </div>
        ))}
  </div>
)} */}

{/* {showDropdown && (
  <div className="search-dropdown">
    {query.trim().length > 0
      ? 
      // filteredSongs.slice(0, 5).map((t) => (
        filteredSongs?.slice(0, 5) || [].map((t) => (
          // <div
          //   key={t.id}
          //   className="dropdown-item"
          //   onMouseDown={() => {
          //     setNewQueue(
          //       filteredSongs,
          //       filteredSongs.findIndex(x => x.id === t.id)
          //     );
          //     saveSearch(t.title);
          //     setShowDropdown(false);
          //     nav(`/track/${t.id}`);
          //   }}
          // >
          //   {t.title}
          // </div>
          <div className="dropdown-item">
  <img
    src={t.cover_url || "/covers/default.jpg"}
    alt=""
    className="dropdown-img"
  />

  <div className="dropdown-info">
    <div className="dropdown-title">{t.title}</div>
    <div className="dropdown-meta">Song</div>
  </div>
</div>
        ))
      : history.map((h, i) => (
          <div
            key={i}
            className="dropdown-item"
            // onMouseDown={() => {
            //   setQuery(h);
            //   setShowDropdown(false);
            // }}
            onMouseDown={() => {
  setNewQueue(
    filteredSongs,
    filteredSongs.findIndex(x => x.id === t.id)
  );
  saveSearch(t.title);
  setShowDropdown(false);

  setTimeout(() => {
    nav(`/track/${t.id}`);
  }, 50); // smoother transition
}}
          >
            🕘 {h}
          </div>
        ))}
  </div>
)} */}
{showDropdown && (
  <div className="search-dropdown">
    {query.trim().length > 0 ? (
      filteredSongs.length > 0 ? (
        filteredSongs.slice(0, 5).map((t) => (
          <div
            key={t.id}
            className="dropdown-item"
            onMouseDown={() => {
              setNewQueue(
                filteredSongs,
                filteredSongs.findIndex(x => x.id === t.id)
              );
              saveSearch(t.title);
              setShowDropdown(false);
              nav(`/track/${t.id}`);
            }}
          >
            <img
              src={t.cover_url || "/covers/default.jpg"}
              alt=""
              className="dropdown-img"
            />

            <div className="dropdown-info">
              <div className="dropdown-title">{t.title}</div>
              <div className="dropdown-meta">Song</div>
            </div>
          </div>
        ))
      ) : (
        // 🔥 THIS IS THE "NO RESULTS"
        <div className="dropdown-empty">No results found</div>
      )
    ) : history.length > 0 ? (
      history.map((h, i) => (
        <div
          key={i}
          className="dropdown-item"
          onMouseDown={() => {
            setQuery(h);
            setShowDropdown(false);
          }}
        >
          🕘 {h}
        </div>
      ))
    ) : (
      // 🔥 Optional: no history
      <div className="dropdown-empty">No recent searches</div>
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

      {/* NO INPUT */}
      {!debounced && (
        <div className="search-placeholder">
          <h2>Search your music</h2>
          <p>Find songs, albums and playlists</p>
        </div>
      )}

      {/* RESULTS */}
      {debounced && (
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

          {/* PLAYLISTS */}
          {/* {(activeTab === "all" || activeTab === "playlists") &&
            filteredPlaylists.length > 0 && (
              <section>
                <h3>Playlists</h3>
                <div className="search-albums-grid">
                  {filteredPlaylists.map((p) => (
                    <div
                      key={p.id}
                      className="search-album-card"
                      onClick={() => nav(`/playlist/${p.id}`)}
                    >
                      <img src={p.cover_url} alt="" />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )} */}
          {(activeTab === "all" || activeTab === "playlists") &&
            filteredPlaylists.length > 0 && (
              <section className="albums-section">
                <h3 className="section-title">Playlists</h3>

                <div className="search-albums-list">
                  {filteredPlaylists.map((p) => (
                    <div
                      key={p.id}
                      className="search-album-row"
                      onClick={() => nav(`/playlist/${p.id}`)}
                    >
                      <img src={p.cover_url} alt={p.name} />

                      <div className="album-info">
                        <div className="album-title">{p.name}</div>
                        <div className="album-meta">Playlist</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </>
      )}
    </main>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import "./search.css";

// export default function SearchPage() {
//   const nav = useNavigate();

//   const [query, setQuery] = useState("");
//   const [debounced, setDebounced] = useState("");

//   const [tracks, setTracks] = useState([]);
//   const [movies, setMovies] = useState([]);
//   const [playlists, setPlaylists] = useState([]);

// //   const [activeTab, setActiveTab] = useState("songs");
// const [activeTab, setActiveTab] = useState("all");

//   /* ---------------- DEBOUNCE ---------------- */
//   useEffect(() => {
//     const id = setTimeout(() => setDebounced(query.trim()), 300);
//     return () => clearTimeout(id);
//   }, [query]);

// function normalize(str) {
//     return String(str || "")
//       .toLowerCase()
//       .replace(/\s+/g, "");
//   }

// function fuzzyMatch(text, q) {
//     if (!text || !q) return false;

//     const t = normalize(text);
//     const queryNorm = normalize(q);

//     if (t.includes(queryNorm)) return true;

//     let ti = 0;
//     for (let qi = 0; qi < queryNorm.length; qi++) {
//       ti = t.indexOf(queryNorm[qi], ti);
//       if (ti === -1) return false;
//       ti++;
//     }

//     return true;
//   }

//   /* ---------------- DATABASE SEARCH ---------------- */
//   useEffect(() => {
//     if (!debounced) {
//       setTracks([]);
//       setMovies([]);
//       setPlaylists([]);
//       return;
//     }

//     async function searchAll() {
//       const { data: songData } = await supabase
//         .from("tracks")
//         .select("*")
//         .or(`title.ilike.%${debounced}%,artist.ilike.%${debounced}%`)
//         .limit(20);

//       const { data: movieData } = await supabase
//         .from("movies")
//         .select("*")
//         .ilike("title", `%${debounced}%`)
//         .limit(12);

//       const { data: playlistData } = await supabase
//         .from("playlists")
//         .select("*")
//         .ilike("name", `%${debounced}%`)
//         .limit(12);

//       setTracks(songData || []);
//       setMovies(movieData || []);
//       setPlaylists(playlistData || []);
//     }

//     searchAll();
//   }, [debounced]);

//   <div className="search-tabs">
//   <button
//     className={activeTab === "all" ? "active" : ""}
//     onClick={() => setActiveTab("all")}
//   >
//     All
//   </button>

//   <button
//     className={activeTab === "songs" ? "active" : ""}
//     onClick={() => setActiveTab("songs")}
//   >
//     Songs
//   </button>

//   <button
//     className={activeTab === "albums" ? "active" : ""}
//     onClick={() => setActiveTab("albums")}
//   >
//     Albums
//   </button>

//   <button
//     className={activeTab === "playlists" ? "active" : ""}
//     onClick={() => setActiveTab("playlists")}
//   >
//     Playlists
//   </button>
// </div>

//   /* ---------------- FILTERED (FUZZY LAYER) ---------------- */
//   const songResults = useMemo(() => {
//     if (!debounced) return [];
//     return tracks.filter(
//       (t) =>
//         fuzzyMatch(t.title, debounced) ||
//         fuzzyMatch(t.artist, debounced)
//     );
//   }, [tracks, debounced]);

//   const albumResults = useMemo(() => {
//     if (!debounced) return [];
//     return movies.filter((m) =>
//       fuzzyMatch(m.title, debounced)
//     );
//   }, [movies, debounced]);

//   const playlistResults = useMemo(() => {
//     if (!debounced) return [];
//     return playlists.filter((p) =>
//       fuzzyMatch(p.name, debounced)
//     );
//   }, [playlists, debounced]);

//   return (
//     <main className="search-page page-safe">
//       {/* SEARCH INPUT */}
//       <div className="search-header">
//         <input
//           type="search"
//           placeholder="Search songs, albums, playlists..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="search-input"
//         />
//       </div>

//       {!debounced && (
//         <div className="search-placeholder">
//           <h2>Search your music</h2>
//           <p>Find songs, albums and playlists</p>
//         </div>
//       )}

//       {debounced && (
//   <>
//     {/* TABS */}
//     <div className="search-tabs">
//       <button
//         className={activeTab === "all" ? "active" : ""}
//         onClick={() => setActiveTab("all")}
//       >
//         All
//       </button>

//       <button
//         className={activeTab === "songs" ? "active" : ""}
//         onClick={() => setActiveTab("songs")}
//       >
//         Songs
//       </button>

//       <button
//         className={activeTab === "albums" ? "active" : ""}
//         onClick={() => setActiveTab("albums")}
//       >
//         Albums
//       </button>

//       <button
//         className={activeTab === "playlists" ? "active" : ""}
//         onClick={() => setActiveTab("playlists")}
//       >
//         Playlists
//       </button>
//     </div>

//     {/* ===== ALL TAB ===== */}
//     {activeTab === "all" && (
//       <>
//         {/* SONGS PREVIEW */}
//         {songResults.slice(0, 5).length > 0 && (
//           <section>
//             <h3>Songs</h3>
//             {songResults.slice(0, 5).map((t) => (
//               <div
//                 key={t.id}
//                 className="search-item"
//                 onClick={() => nav(`/track/${t.id}`)}
//               >
//                 <img src={t.cover_url} alt="" />
//                 <div>
//                   <div className="title">{t.title}</div>
//                   <div className="sub">{t.artist}</div>
//                 </div>
//               </div>
//             ))}
//           </section>
//         )}

//         {/* ALBUMS PREVIEW */}

// {albumResults.slice(0, 4).length > 0 && (
//   <section className="search-section">
//     <h3>Albums</h3>
//     <div className="search-album-list">
//       {albumResults.slice(0, 4).map((m) => (
//         <div
//           key={m.id}
//           className="album-row"
//           onClick={() => nav(`/movie/${m.id}`)}
//         >
//           <img src={m.cover_url} alt={m.title} />
//           <div className="album-info">
//             <span className="album-title">{m.title}</span>
//             <span className="album-artist">
//               Album • {m.artist_name}
//             </span>
//           </div>
//         </div>
//       ))}
//     </div>
//   </section>
// )}

//         {/* PLAYLISTS PREVIEW */}
//         {playlistResults.slice(0, 4).length > 0 && (
//           <section>
//             <h3>Playlists</h3>
//             <div className="search-album-grid">
//               {playlistResults.slice(0, 4).map((p) => (
//                 <div
//                   key={p.id}
//                   className="album-card-small"
//                   onClick={() => nav(`/playlist/${p.id}`)}
//                 >
//                   <img src={p.cover_url} alt="" />
//                   <span>{p.name}</span>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}
//       </>
//     )}

//     {/* ===== SONGS ONLY TAB ===== */}
//     {activeTab === "songs" &&
//       songResults.map((t) => (
//         <div
//           key={t.id}
//           className="search-item"
//           onClick={() => nav(`/track/${t.id}`)}
//         >
//           <img src={t.cover_url} alt="" />
//           <div>
//             <div className="title">{t.title}</div>
//             <div className="sub">{t.artist}</div>
//           </div>
//         </div>
//       ))}

//     {/* ===== ALBUMS ONLY TAB ===== */}
//     {activeTab === "albums" && (
//       <div className="search-album-grid">
//         {albumResults.map((m) => (
//           <div
//             key={m.id}
//             className="album-card-small"
//             onClick={() => nav(`/movie/${m.id}`)}
//           >
//             <img src={m.cover_url} alt="" />
//             <span>{m.title}</span>
//           </div>
//         ))}
//       </div>
//     )}

//     {/* ===== PLAYLISTS ONLY TAB ===== */}
//     {activeTab === "playlists" && (
//       <div className="search-album-grid">
//         {playlistResults.map((p) => (
//           <div
//             key={p.id}
//             className="album-card-small"
//             onClick={() => nav(`/playlist/${p.id}`)}
//           >
//             <img src={p.cover_url} alt="" />
//             <span>{p.name}</span>
//           </div>
//         ))}
//       </div>
//     )}
//   </>
// )}

//     </main>
//   );
// }
