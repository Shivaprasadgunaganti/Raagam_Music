// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";
// import "./movieSongs.css";
// import { FaShuffle } from "react-icons/fa6";
// import { FaPlay } from "react-icons/fa";
// import { IoArrowBack } from "react-icons/io5";
// import PlaylistPicker from "./PlaylistPicker";

// export default function MovieSongsPage() {
//   const { movieId } = useParams();
//   const {
//     playAll,
//     shufflePlay,
//     setNewQueue,
//     currentTrack,
//     playNextInsert,
//     addToQueue,
//   } = useAudio();

//   const [movie, setMovie] = useState(null);
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const nav = useNavigate();
//   const [snack, setSnack] = useState("");
//   const [selectedSong, setSelectedSong] = useState(null);
//   const [showPicker, setShowPicker] = useState(false);

//   useEffect(() => {
//     async function load() {
//       const { data: m } = await supabase
//         .from("movies")
//         .select("*")
//         .eq("id", movieId)
//         .single();

//       const { data: s } = await supabase
//         .from("tracks")
//         .select("*")
//         .eq("movie_id", movieId)
//         .order("id");

//       setMovie(m);
//       setSongs(s || []);
//       setLoading(false);
//     }

//     load();
//   }, [movieId]);

//   function showSnack(msg) {
//     setSnack(msg);
//     setTimeout(() => setSnack(""), 2500);
//   }

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
//   if (!movie) return <div>Movie not found</div>;

//   return (
//     <main className="songspage-main">
//       <div className="sp-album">
//         <button className="sp-back-btn" onClick={() => nav("/")}>
//           <IoArrowBack />
//         </button>

//         <img src={movie.cover_url} alt={movie.title} />
//         <div className="sp-album-section">
//           <h1>{movie.title}</h1>
//           <p>
//             {movie.year} • {songs.length} songs
//           </p>
//           <div className="sp-album-play">
//             <button
//               className="sp-album-shuffle-btn"
//               onClick={() => shufflePlay(songs)}
//             >
//               <FaShuffle />
//             </button>
//             <button
//               className="sp-album-play-btn"
//               onClick={() => playAll(songs)}
//             >
//               <FaPlay />
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="sp-album-list">
//         {songs.map((song, index) => {
//           const isActive = currentTrack?.id === song.id;
//           return (
//             <div
//               key={song.id}
//               className={`sp-album-row ${isActive ? "active" : ""}`}
//             >
//               <div
//                 className="sp-row-main"
//                 onClick={() => setNewQueue(songs, index)}
//               >
//                 <div className="sp-song-meta">
//                   <div className="sp-song-title">{song.title}</div>
//                   <div className="sp-song-artist">
//                     {song.artist || "Unknown Artist"}
//                   </div>
//                 </div>
//               </div>

//               <button
//                 className="sp-row-menu"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSelectedSong(song);
//                 }}
//               >
//                 ⋮
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {snack && <div className="sp-snackbar">{snack}</div>}

//       {selectedSong && (
//         <div
//           className="song-menu-overlay"
//           onClick={() => setSelectedSong(null)}
//         >
//           <div className="song-menu-sheet" onClick={(e) => e.stopPropagation()}>
//             <div className="sheet-song-info">
//               <img
//                 src={selectedSong.cover_url || "/covers/default.jpg"}
//                 alt={selectedSong.title}
//                 className="sheet-cover"
//               />
//               <div>
//                 <div className="sheet-title">{selectedSong.title}</div>
//                 <div className="sheet-artist">
//                   {selectedSong.artist || "Unknown Artist"}
//                 </div>
//               </div>
//             </div>

//             <div className="sheet-divider" />

//             <button
//               onClick={() => {
//                 addToQueue(selectedSong);
//                 setSelectedSong(null);
//                 showSnack("Added to queue");
//               }}
//             >
//               ➕ Add to Queue
//             </button>

//             <button
//               onClick={() => {
//                 playNextInsert(selectedSong);
//                 setSelectedSong(null);
//                 showSnack("Added to Play Next");
//               }}
//             >
//               ▶ Play Next
//             </button>

//             <button
//               onClick={() => {
//                 setSelectedSong(null);
//                 nav("/queue");
//               }}
//             >
//               🎵 View Queue
//             </button>

//             <button
//               onClick={() => {
//                 setSelectedSong(null);
//                 setShowPicker(true);
//               }}
//             >
//               📂 Add to Playlist
//             </button>
//           </div>
//         </div>
//       )}

//       {showPicker && (
//         <PlaylistPicker
//           trackId={selectedSong?.id}
//           onClose={() => setShowPicker(false)}
//         />
//       )}
//     </main>
//   );
// }

// // //own
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAudio } from "../context/AudioContext";
import "./movieSongs.css";
import { FaShuffle } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import PlaylistPicker from "./PlaylistPicker";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
import { FaHeart } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { useLikes } from "../context/LikeContext";
import { getLikedSongsMap } from "../utils/likeHelpers";
import { useToast } from "../context/ToastContext";

export default function MovieSongsPage() {
  const { movieId } = useParams();
  const {
    playAll,
    shufflePlay,
    setNewQueue,
    currentTrack,
    playNextInsert,
    addToQueue,
  } = useAudio();

  const [movie, setMovie] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  // const [snack, setSnack] = useState(false);
  const [snack, setSnack] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [pickerTrackId, setPickerTrackId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase
        .from("movies")
        .select("*")
        .eq("id", movieId)
        .single();

      const { data: s } = await supabase
        .from("tracks")
        .select("*")
        .eq("movie_id", movieId)
        .order("id");

      setMovie(m);
      setSongs(s || []);
      setLoading(false);
    }

    load();
  }, [movieId]);

  // like and unlike
  // useEffect(() => {
  //   if (!songs.length) return;
  //   songs.forEach(async (song) => {
  //     const isLiked = await isSongLiked(song.id);
  //     setLikedMap((prev) => ({ ...prev, [song.id]: isLiked }));
  //   });
  // }, [songs]);

  useEffect(() => {
    async function loadLikes() {
      const map = await getLikedSongsMap();
      setLikedMap(map);
    }

    loadLikes();
  }, [songs]);

  function showSnack(msg) {
    setSnack(msg);
    setTimeout(() => setSnack(""), 2500);
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (!movie) return <div>Movie not found</div>;

  return (
    <main className="songspage-main">
      <div className="sp-album">
        <button className="sp-back-btn" onClick={() => nav("/")}>
          {" "}
          <IoArrowBack />
        </button>

        {/* <img src={movie.cover_url} alt={movie.title} /> */}
        <img
          src={movie.cover_url}
          loading="eager"
          fetchPriority="high"
          alt={movie.title}
        />
        <div className="sp-album-section">
          <h1>{movie.title}</h1>
          <p>
            {movie.year} • {songs.length} songs
          </p>
          <div className="sp-album-play">
            <button
              className="sp-album-shuffle-btn"
              onClick={() => shufflePlay(songs)}
            >
              <FaShuffle />
            </button>
            <button
              className="sp-album-play-btn"
              onClick={() => playAll(songs)}
            >
              <FaPlay />
            </button>
          </div>
        </div>
      </div>
      <div className="sp-album-list">
        {songs.map((song, index) => {
          const isActive = currentTrack?.id === song.id;
          return (
            <div
              key={song.id}
              className={`sp-album-row ${isActive ? "active" : ""}`}
            >
              <div
                className="sp-row-main"
                onClick={() => setNewQueue(songs, index)}
              >
                <div className="sp-song-meta">
                  <div className="sp-song-title">{song.title}</div>
                  <div className="sp-song-artist">
                    {song.artist || "Unknown Artist"}
                  </div>
                </div>
              </div>
              {/* Like/Unlike button */}
              <button
                className="liked-heart-btn"
                onClick={async (e) => {
                  e.stopPropagation();
                  // if (likedMap[song.id]) {
                  //   await unlikeSong(song.id);
                  //   setLikedMap((prev) => ({ ...prev, [song.id]: false }));
                  // } else {
                  //   await likeSong(song.id);
                  //   setLikedMap((prev) => ({ ...prev, [song.id]: true }));
                  // }
                  if (likedMap[song.id]) {
                    await unlikeSong(song.id);
                    setLikedMap((prev) => ({ ...prev, [song.id]: false }));
                    showToast("Removed from Liked Songs");
                  } else {
                    await likeSong(song.id);
                    setLikedMap((prev) => ({ ...prev, [song.id]: true }));
                    showToast("Added to Liked Songs");
                  }
                }}
              >
                {likedMap[song.id] ? (
                  <FaHeart color="#1db954" />
                ) : (
                  <FaRegHeart />
                )}
              </button>

              <button
                className="sp-row-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSong(song);
                }}
              >
                ⋮
              </button>
            </div>
          );
        })}
      </div>
      {snack && <div className="sp-snackbar">Song {snack}</div>}

      {selectedSong && (
        <div
          className="song-menu-overlay"
          onClick={() => setSelectedSong(null)}
        >
          <div className="song-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-song-info">
              {/* <img
                src={selectedSong.cover_url || "/covers/default.jpg"}
                alt={selectedSong.title}
                className="sheet-cover"
              /> */}
              <img
                src={selectedSong.cover_url || "/covers/default.jpg"}
                alt={selectedSong.title}
                className="sheet-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div>
                <div className="sheet-title">{selectedSong.title}</div>
                <div className="sheet-artist">
                  {selectedSong.artist || "Unknown Artist"}
                </div>
              </div>
            </div>

            <div className="sheet-divider" />

            <button
              onClick={() => {
                addToQueue(selectedSong);
                setSelectedSong(null);
                // showSnack("Added to queue");
                showToast("Added to Queue");
              }}
            >
              ➕ Add to Queue
            </button>

            <button
              onClick={() => {
                playNextInsert(selectedSong);
                setSelectedSong(null);
                // showSnack("Added to Play Next");
                showToast("Added to Play Next");
              }}
            >
              ▶ Play Next
            </button>

            <button
              onClick={() => {
                setSelectedSong(null);
                nav("/queue");
              }}
            >
              🎵 View Queue
            </button>

            <button
              // onClick={() => {
              //   setSelectedSong(null);
              //   setShowPicker(true);
              // }}
              onClick={() => {
                setPickerTrackId(selectedSong.id); // ← save BEFORE clearing
                setSelectedSong(null);
                setShowPicker(true);
              }}
            >
              📂 Add to Playlist
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        // <PlaylistPicker
        //   trackId={selectedSong?.id}
        //   onClose={() => setShowPicker(false)}
        // />
        <PlaylistPicker
          trackId={pickerTrackId}
          // onClose={() => {
          //   setShowPicker(false);
          //   setPickerTrackId(null);
          // }}
          onClose={(status) => {
            setShowPicker(false);
            setPickerTrackId(null);

            if (status === "added") {
              // showSnack("added to playlist");
              showToast("Added to Playlist");
            } else if (status === "exists") {
              // showSnack("already in playlist");
              showToast("Already in  Playlist");
            }
          }}
        />
      )}
    </main>
  );
}

/* Base */
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";
// import "./movieSongs.css";
// import { FaShuffle } from "react-icons/fa6";
// import { FaPlay } from "react-icons/fa";
// import { IoArrowBack } from "react-icons/io5";

// export default function MovieSongsPage() {
//   const { movieId } = useParams();
//   const { playAll, shufflePlay, setNewQueue, currentTrack, playNextInsert } =
//     useAudio();

//   const [movie, setMovie] = useState(null);
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const nav = useNavigate();
//   const [snack, setSnack] = useState(false);

//   useEffect(() => {
//     async function load() {
//       const { data: m } = await supabase
//         .from("movies")
//         .select("*")
//         .eq("id", movieId)
//         .single();

//       const { data: s } = await supabase
//         .from("tracks")
//         .select("*")
//         .eq("movie_id", movieId)
//         .order("id");

//       setMovie(m);
//       setSongs(s || []);
//       setLoading(false);
//     }

//     load();
//   }, [movieId]);

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
//   if (!movie) return <div>Movie not found</div>;

//   return (
//     <main className="songspage-main">
//       <div className="sp-album">
//         <button className="sp-back-btn" onClick={() => nav("/")}>
//           {" "}
//           <IoArrowBack />
//         </button>

//         <img src={movie.cover_url} alt={movie.title} />
//         <div className="sp-album-section">
//           <h1>{movie.title}</h1>
//           <p>
//             {movie.year} • {songs.length} songs
//           </p>
//           <div className="sp-album-play">
//             <button
//               className="sp-album-shuffle-btn"
//               onClick={() => shufflePlay(songs)}
//             >
//               <FaShuffle />
//             </button>
//             <button
//               className="sp-album-play-btn"
//               onClick={() => playAll(songs)}
//             >
//               <FaPlay />
//             </button>
//           </div>
//         </div>
//       </div>
//       <div className="sp-album-list">
//         {songs.map((song, index) => {
//           const isActive = currentTrack?.id === song.id;
//           return (
//             <div
//               key={song.id}
//               className={`sp-album-row ${isActive ? "active" : ""}`}
//             >
//               <div
//                 className="sp-row-main"
//                 onClick={() => setNewQueue(songs, index)}
//               >
//                 <div className="sp-song-meta">
//                   <div className="sp-song-title">{song.title}</div>
//                   <div className="sp-song-artist">
//                     {song.artist || "Unknown Artist"}
//                   </div>
//                 </div>
//                 <div>
//                   <button
//                     className="sp-row-menu"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       playNextInsert(song);
//                       setSnack(true);
//                       setTimeout(() => setSnack(false), 2500);
//                     }}
//                   >
//                     ⋮
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {snack && <div className="sp-snackbar">Song added to playnext</div>}
//     </main>
//   );
// }
