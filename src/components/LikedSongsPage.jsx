// own
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAudio } from "../context/AudioContext";
import { FcLike } from "react-icons/fc";
import { IoArrowBack } from "react-icons/io5";
import PlaylistPicker from "./PlaylistPicker";
import "./liked.css";
import { likeSong, unlikeSong, isSongLiked, getLikedSongsMap } from "../utils/likeHelpers";
import { FaHeart } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { useLikes } from "../context/LikeContext";

export default function LikedSongsPage() {
  const nav = useNavigate();
  // ✅ Added addToQueue
  const { setNewQueue, playNextInsert, currentTrack, addToQueue } = useAudio();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ Changed snack from boolean to string
  const [snack, setSnack] = useState("");
  // ✅ Added selectedSong for bottom sheet
  const [selectedSong, setSelectedSong] = useState(null);
  // ✅ Added showPicker
  const [showPicker, setShowPicker] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [pickerTrackId, setPickerTrackId] = useState(null);

  useEffect(() => {
    async function loadLikedSongs() {
      setLoading(true);

      const { data: likedRows, error: likedError } = await supabase
        .from("liked_songs")
        .select("track_id")
        .order("created_at", { ascending: false });

      console.log("LIKED ROWS:", likedRows);
      console.log("LIKED ERROR:", likedError);

      if (likedError || !likedRows || likedRows.length === 0) {
        setSongs([]);
        setLoading(false);
        return;
      }

      const trackIds = likedRows.map((r) => r.track_id);
      console.log("TRACK IDS:", trackIds);

      const { data: tracks, error: tracksError } = await supabase
        .from("tracks")
        .select(
          `
          id,
          title,
          artist,
          cover_url,
          external_url,
          storage_path
        `
        )
        .in("id", trackIds);

      console.log("TRACKS:", tracks);
      console.log("TRACKS ERROR:", tracksError);

      if (!tracksError && tracks) {
        const ordered = trackIds
          .map((id) => tracks.find((t) => t.id === id))
          .filter(Boolean);

        console.log("ORDERED TRACKS:", ordered);
        setSongs(ordered);
      } else {
        setSongs([]);
      }

      setLoading(false);
    }

    loadLikedSongs();
  }, []);

  // liked/unlike
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

  // ✅ Dynamic snack helper
  function showSnack(msg) {
    setSnack(msg);
    setTimeout(() => setSnack(""), 2500);
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <main className="liked-page page-safe">
      {/* HERO */}
      <div className="liked-hero">
        <button className="liked-back-btn" onClick={() => nav("/")}>
          <IoArrowBack />
        </button>

        <div className="liked-hero-content">
          <div className="liked-hero-icon">{/* <FcLike /> */}</div>
          <h1 className="liked-title">Liked Songs</h1>
          <p className="liked-count">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </p>
        </div>

        {songs.length > 0 && (
          <button
            className="liked-play-btn"
            onClick={() => setNewQueue(songs, 0)}
          >
            ▶
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {songs.length === 0 && <p className="liked-empty">No liked songs yet.</p>}

      {/* SONG LIST */}
      <ul className="liked-list">
        {songs.map((song, index) => {
          const isActive = currentTrack?.id === song.id;

          return (
            <li
              key={song.id}
              className={`liked-row ${isActive ? "active" : ""}`}
            >
              {/* ✅ row-main only wraps song info — not the dots */}
              <div
                className="liked-row-main"
                onClick={() => setNewQueue(songs, index)}
              >
                <img
                  className="liked-cover"
                  src={song.cover_url || "/covers/default.jpg"}
                  alt={song.title}
                />
                <div className="liked-meta">
                  <div className="liked-song-title">{song.title}</div>
                  <div className="liked-song-artist">
                    {song.artist || "Unknown Artist"}
                  </div>
                </div>
              </div>
              {/* Like/Unlike button */}
              <button
                className="liked-heart-btn"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (likedMap[song.id]) {
                    await unlikeSong(song.id);
                    setLikedMap((prev) => ({ ...prev, [song.id]: false }));
                  } else {
                    await likeSong(song.id);
                    setLikedMap((prev) => ({ ...prev, [song.id]: true }));
                  }
                }}
              >
                {likedMap[song.id] ? (
                  <FaHeart color="#1db954" />
                ) : (
                  <FaRegHeart />
                )}
              </button>

              {/* ✅ Dots OUTSIDE liked-row-main */}
              <button
                className="liked-row-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSong(song);
                }}
              >
                ⋮
              </button>
            </li>
          );
        })}
      </ul>

      {/* ✅ Dynamic snackbar */}
      {snack && <div className="liked-snackbar">{snack}</div>}

      {/* ✅ Bottom sheet */}
      {selectedSong && (
        <div
          className="song-menu-overlay"
          onClick={() => setSelectedSong(null)}
        >
          <div className="song-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-song-info">
              <img
                src={selectedSong.cover_url || "/covers/default.jpg"}
                alt={selectedSong.title}
                className="sheet-cover"
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
                showSnack("Added to queue");
              }}
            >
              ➕ Add to Queue
            </button>

            <button
              onClick={() => {
                playNextInsert(selectedSong);
                setSelectedSong(null);
                showSnack("Added to Play Next");
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

      {/* ✅ Playlist picker */}
      {showPicker && (
        // <PlaylistPicker
        //   trackId={selectedSong?.id}
        //   onClose={() => setShowPicker(false)}
        // />
        <PlaylistPicker
          trackId={pickerTrackId}
          onClose={() => {
            setShowPicker(false);
            setPickerTrackId(null);
          }}
        />
      )}
    </main>
  );
}

// base
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";
// import { FcLike } from "react-icons/fc";
// import { IoArrowBack } from "react-icons/io5";
// import "./liked.css";

// export default function LikedSongsPage() {
//   const nav = useNavigate();
//   const { setNewQueue, playNextInsert, currentTrack } = useAudio();
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [snack, setSnack] = useState(false);

//   useEffect(() => {
//     async function loadLikedSongs() {
//       setLoading(true);

//       const { data: likedRows, error: likedError } = await supabase
//         .from("liked_songs")
//         .select("track_id")
//         .order("created_at", { ascending: false });

//       console.log("LIKED ROWS:", likedRows);
//       console.log("LIKED ERROR:", likedError);

//       if (likedError || !likedRows || likedRows.length === 0) {
//         setSongs([]);
//         setLoading(false);
//         return;
//       }

//       const trackIds = likedRows.map((r) => r.track_id);
//       console.log("TRACK IDS:", trackIds);

//       const { data: tracks, error: tracksError } = await supabase
//         .from("tracks")
//         .select(
//           `
//           id,
//           title,
//           artist,
//           cover_url,
//           external_url,
//           storage_path
//         `
//         )
//         .in("id", trackIds);

//       console.log("TRACKS:", tracks);
//       console.log("TRACKS ERROR:", tracksError);

//       if (!tracksError && tracks) {
//         const ordered = trackIds
//           .map((id) => tracks.find((t) => t.id === id))
//           .filter(Boolean);

//         console.log("ORDERED TRACKS:", ordered);
//         setSongs(ordered);
//       } else {
//         setSongs([]);
//       }

//       setLoading(false);
//     }

//     loadLikedSongs();
//   }, []);

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

//   return (
//     <main className="liked-page page-safe">
//       <div className="liked-hero">
//         <button className="liked-back-btn" onClick={() => nav("/")}>
//           <IoArrowBack />
//         </button>

//         <div className="liked-hero-content">
//           <div className="liked-hero-icon">{/* <FcLike /> */}</div>
//           <h1 className="liked-title">Liked Songs</h1>
//           <p className="liked-count">
//             {songs.length} {songs.length === 1 ? "song" : "songs"}
//           </p>
//         </div>

//         {songs.length > 0 && (
//           <button
//             className="liked-play-btn"
//             onClick={() => setNewQueue(songs, 0)}
//           >
//             ▶
//           </button>
//         )}
//       </div>

//       {songs.length === 0 && <p className="liked-empty">No liked songs yet.</p>}

//       <ul className="liked-list">
//         {songs.map((song, index) => {
//           const isActive = currentTrack?.id === song.id;

//           return (
//             <li
//               key={song.id}
//               className={`liked-row ${isActive ? "active" : ""}`}
//             >
//               <div
//                 className="liked-row-main"
//                 onClick={() => setNewQueue(songs, index)}
//               >
//                 <img
//                   className="liked-cover"
//                   src={song.cover_url || "/covers/default.jpg"}
//                   alt={song.title}
//                 />
//                 <div className="liked-meta">
//                   <div className="liked-song-title">{song.title}</div>
//                   <div className="liked-song-artist">
//                     {song.artist || "Unknown Artist"}
//                   </div>
//                 </div>
//               </div>

//               <button
//                 className="liked-row-menu"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   playNextInsert(song);
//                   setSnack(true);
//                   setTimeout(() => setSnack(false), 2500);
//                 }}
//               >
//                 ⋮
//               </button>
//             </li>
//           );
//         })}
//       </ul>

//       {snack && <div className="liked-snackbar">Song added to playnext</div>}
//     </main>
//   );
// }
