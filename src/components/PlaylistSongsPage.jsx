// own
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAudio } from "../context/AudioContext";
import "./playlistDetail.css";
import { IoArrowBack } from "react-icons/io5";
import PlaylistPicker from "./PlaylistPicker";
import { likeSong, unlikeSong, isSongLiked, getLikedSongsMap } from "../utils/likeHelpers";
import { FaHeart } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { useLikes } from "../context/LikeContext";
import { useToast } from "../context/ToastContext";


export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const nav = useNavigate();
  // ✅ Added addToQueue
  const { setNewQueue, playNextInsert, currentTrack, addToQueue } = useAudio();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ snack as string
  const [snack, setSnack] = useState("");
  // ✅ bottom sheet
  const [selectedSong, setSelectedSong] = useState(null);
  // ✅ playlist picker
  const [showPicker, setShowPicker] = useState(false);
  // ✅ per-song liked map
  const [likedMap, setLikedMap] = useState({});
  const [pickerTrackId, setPickerTrackId] = useState(null);
    const { showToast } = useToast();

  useEffect(() => {
    async function loadPlaylist() {
      setLoading(true);

      const { data: pl } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", playlistId)
        .single();

      const { data: rows } = await supabase
        .from("playlist_tracks")
        // .select(
        //   `
        //   track:tracks (
        //     id,
        //     title,
        //     artist,
        //     cover_url,
        //     external_url,
        //     storage_path
        //   )
        // `
        // )
        .select(`
  id,
  position,
  track:tracks (
    id,
    title,
    artist,
    cover_url,
    external_url,
    storage_path
  )
`)
        .eq("playlist_id", playlistId)
        // .order("created_at");
        .order("position", { ascending: true });

      setPlaylist(pl);
      // ✅ Filter out null tracks to fix the crash
      // setSongs(rows ? rows.map((r) => r.track).filter(Boolean) : []);
      setSongs(
  rows
    ? rows.map((r) => ({
        ...r.track,
        pt_id: r.id,         // 🔥 needed for update
        position: r.position // 🔥 needed for swap
      })).filter(Boolean)
    : []
);
      setLoading(false);
    }

    loadPlaylist();
  }, [playlistId]);

  // ✅ Load liked state for all songs
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

  async function removeSong(trackId) {
    await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("track_id", trackId);

    setSongs(songs.filter((s) => s.id !== trackId));
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (!playlist) return <div>Playlist not found</div>;

  // ✅ Fixed: filter(Boolean) prevents null crash
  const coverUrls = songs
    .filter((s) => s && s.cover_url)
    .slice(0, 4)
    .map((s) => s.cover_url);


    async function moveSong(index, direction) {
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= songs.length) return;

  const current = songs[index];
  const target = songs[newIndex];

  // swap positions
  await supabase
    .from("playlist_tracks")
    .update({ position: target.position })
    .eq("id", current.pt_id);

  await supabase
    .from("playlist_tracks")
    .update({ position: current.position })
    .eq("id", target.pt_id);

  // reload
  const updated = [...songs];
  [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
  setSongs(updated);
}

  return (
    <main className="pd-page page-safe">
      {/* HERO */}
      <div className="pd-hero">
        <button className="pd-back-btn" onClick={() => nav(-1)}>
          <IoArrowBack />
        </button>

        {/* Collage or single cover */}
        <div className="pd-collage">
          {coverUrls.length >= 4 ? (
            coverUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="pd-collage-img" />
            ))
          ) : (
            <img
              src={coverUrls[0] || "/covers/default.jpg"}
              alt={playlist.name}
              className="pd-collage-single"
            />
          )}
        </div>

        {/* Info */}
        <div className="pd-hero-info">
          <h1 className="pd-title">{playlist.name}</h1>
          <p className="pd-subtitle">Playlist</p>
          <p className="pd-count">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </p>
        </div>

        {songs.length > 0 && (
          <button className="pd-play-btn" onClick={() => setNewQueue(songs, 0)}>
            ▶
          </button>
        )}
      </div>

      {/* EMPTY */}
      {songs.length === 0 && (
        <p className="pd-empty">No songs in this playlist yet.</p>
      )}

      {/* SONG LIST */}
      <ul className="pd-list">
        {songs.map((song, index) => {
          const isActive = currentTrack?.id === song.id;
          return (
            <li key={song.id} className={`pd-row ${isActive ? "active" : ""}`}>
              {/* ✅ row-main only — no icons inside */}
              <div
                className="pd-row-main"
                onClick={() => setNewQueue(songs, index)}
              >
                <img
                  className="pd-cover"
                  src={song.cover_url || "/covers/default.jpg"}
                  alt={song.title}
                />
                <div className="pd-meta">
                  <div className="pd-song-title">{song.title}</div>
                  <div className="pd-song-artist">
                    {song.artist || "Unknown Artist"}
                  </div>
                </div>
              </div>

              {/* ✅ Like button */}
              <button
                className="pd-heart-btn"
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

              {/* ✅ Three dots OUTSIDE row-main */}
              <button
                className="pd-row-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSong(song);
                }}
              >
                ⋮
              </button>
              {/* <button onClick={() => moveSong(index, -1)}>⬆</button>
<button onClick={() => moveSong(index, 1)}>⬇</button> */}
<button
  disabled={index === 0}
  onClick={() => moveSong(index, -1)}
>
  ⬆
</button>

<button
  disabled={index === songs.length - 1}
  onClick={() => moveSong(index, 1)}
>
  ⬇
</button>
            </li>
          );
        })}
      </ul>

      {/* ✅ Dynamic snackbar */}
      {snack && <div className="pd-snackbar">{snack}</div>}

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
            {/* <button
              onClick={() => {
                setSelectedSong(null);
                setShowPicker(true);
              }}
            > */}
            <button
              onClick={() => {
                setPickerTrackId(selectedSong.id); // save id BEFORE clearing
                setSelectedSong(null);
                setShowPicker(true);
              }}
            >
              📂 Add to Playlist
            </button>
            <button
              onClick={() => {
                removeSong(selectedSong.id);
                setSelectedSong(null);
                // showSnack("Removed from playlist");
                showToast("Removed from Playlist");
              }}
            >
              🗑️ Remove from Playlist
            </button>
          </div>
        </div>
      )}

      {/* ✅ Playlist picker */}
      {/* {showPicker && (
       
        <PlaylistPicker
          trackId={pickerTrackId}
          onClose={() => {
            setShowPicker(false);
            setPickerTrackId(null);
          }}
        />
      )} */}
      {showPicker && (
  <PlaylistPicker
    trackId={pickerTrackId}
    onClose={(status) => {
      setShowPicker(false);
      setPickerTrackId(null);

      if (status === "added") {
        // showSnack("added to playlist");.
        showToast("Added to Playlist");
      } else if (status === "exists") {
        // showSnack("already in playlist");
        showToast("Already in Playlist");
      }
    }}
  />
)}
    </main>
  );
}

// Base
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";
// import "./playlistDetail.css";
// import { IoArrowBack } from "react-icons/io5";

// export default function PlaylistDetailPage() {
//   const { playlistId } = useParams();
//   const nav = useNavigate();
//   const { setNewQueue, playNextInsert, currentTrack } = useAudio();

//   const [playlist, setPlaylist] = useState(null);
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [snack, setSnack] = useState(false);

//   useEffect(() => {
//     async function loadPlaylist() {
//       setLoading(true);

//       const { data: pl } = await supabase
//         .from("playlists")
//         .select("*")
//         .eq("id", playlistId)
//         .single();

//       const { data: rows } = await supabase
//         .from("playlist_tracks")
//         .select(
//           `
//           track:tracks (
//             id,
//             title,
//             artist,
//             cover_url,
//             external_url,
//             storage_path
//           )
//         `
//         )
//         .eq("playlist_id", playlistId)
//         .order("created_at");

//       setPlaylist(pl);
//       setSongs(rows ? rows.map((r) => r.track) : []);
//       setLoading(false);
//     }

//     loadPlaylist();
//   }, [playlistId]);

//   async function removeSong(trackId) {
//     await supabase
//       .from("playlist_tracks")
//       .delete()
//       .eq("playlist_id", playlistId)
//       .eq("track_id", trackId);

//     setSongs(songs.filter((s) => s.id !== trackId));
//   }

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
//   if (!playlist) return <div>Playlist not found</div>;

//   const coverUrls = songs
//     .filter((s) => s.cover_url)
//     .slice(0, 4)
//     .map((s) => s.cover_url);

//   return (
//     <main className="pd-page page-safe">
//       <div className="pd-hero">
//         <button className="pd-back-btn" onClick={() => nav(-1)}>
//           <IoArrowBack />
//         </button>

//         <div className="pd-collage">
//           {coverUrls.length >= 4 ? (
//             coverUrls.map((url, i) => (
//               <img key={i} src={url} alt="" className="pd-collage-img" />
//             ))
//           ) : (
//             <img
//               src={coverUrls[0] || "/covers/default.jpg"}
//               alt={playlist.name}
//               className="pd-collage-single"
//             />
//           )}
//         </div>

//         <div className="pd-hero-info">
//           <h1 className="pd-title">{playlist.name}</h1>
//           <p className="pd-subtitle">Playlist</p>
//           <p className="pd-count">
//             {songs.length} {songs.length === 1 ? "song" : "songs"}
//           </p>
//         </div>

//         {songs.length > 0 && (
//           <button className="pd-play-btn" onClick={() => setNewQueue(songs, 0)}>
//             ▶
//           </button>
//         )}
//       </div>

//       {songs.length === 0 && (
//         <p className="pd-empty">No songs in this playlist yet.</p>
//       )}

//       <ul className="pd-list">
//         {songs.map((song, index) => {
//           const isActive = currentTrack?.id === song.id;
//           return (
//             <li key={song.id} className={`pd-row ${isActive ? "active" : ""}`}>
//               <div
//                 className="pd-row-main"
//                 onClick={() => setNewQueue(songs, index)}
//               >
//                 <img
//                   className="pd-cover"
//                   src={song.cover_url || "/covers/default.jpg"}
//                   alt={song.title}
//                 />
//                 <div className="pd-meta">
//                   <div className="pd-song-title">{song.title}</div>
//                   <div className="pd-song-artist">
//                     {song.artist || "Unknown Artist"}
//                   </div>
//                 </div>
//               </div>

//               <button
//                 className="pd-row-menu"
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

//       {snack && <div className="pd-snackbar">Song added to playnext</div>}
//     </main>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";
// import "./playlistDetail.css";
// import { IoArrowBack } from "react-icons/io5";

// export default function PlaylistDetailPage() {
//   const { playlistId } = useParams();
//   const { setNewQueue, playNextInsert } = useAudio();

//   const [playlist, setPlaylist] = useState(null);
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [snack, setSnack] = useState(false);

//   useEffect(() => {
//     async function loadPlaylist() {
//       setLoading(true);

//       const { data: pl } = await supabase
//         .from("playlists")
//         .select("*")
//         .eq("id", playlistId)
//         .single();

//       const { data: rows } = await supabase
//         .from("playlist_tracks")
//         .select(
//           `
//           track:tracks (
//             id,
//             title,
//             artist,
//             cover_url,
//             external_url,
//             storage_path
//           )
//         `
//         )
//         .eq("playlist_id", playlistId)
//         .order("created_at");

//       setPlaylist(pl);
//       setSongs(rows ? rows.map((r) => r.track) : []);
//       setLoading(false);
//     }

//     loadPlaylist();
//   }, [playlistId]);

//   async function removeSong(trackId) {
//     await supabase
//       .from("playlist_tracks")
//       .delete()
//       .eq("playlist_id", playlistId)
//       .eq("track_id", trackId);

//     setSongs(songs.filter((s) => s.id !== trackId));
//   }

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
//   if (!playlist) return <div>Playlist not found</div>;

//   return (
//     <main className="playlist-detail page-safe">
//       <div className="playlist-header">
//         <button className="liked-back-btn" onClick={() => nav("/")}>
//           <IoArrowBack />
//         </button>
//         <div>
//           <h1>{playlist.name}</h1>
//           <p>{songs.length} songs</p>
//         </div>

//         {songs.length > 0 && (
//           <button
//             className="play-all-btn"
//             onClick={() => setNewQueue(songs, 0)}
//           >
//             ▶ Play All
//           </button>
//         )}
//       </div>

//       <ul className="playlist-song-list">
//         {songs.map((song, index) => (
//           <li key={song.id} className="playlist-song">
//             <div className="row-main" onClick={() => setNewQueue(songs, index)}>
//               <img
//                 src={song.cover_url || "/covers/default.jpg"}
//                 alt={song.title}
//               />

//               <div className="song-info">
//                 <div className="song-title">{song.title}</div>
//                 <div className="song-artist">{song.artist}</div>
//               </div>
//             </div>

//             <button
//               className="playlist-row-menu"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 playNextInsert(song);
//                 setSnack(true);
//                 setTimeout(() => setSnack(false), 2500);
//               }}
//             >
//               ⋮
//             </button>
//           </li>
//         ))}
//       </ul>
//       {snack && <div className="playlist-snackbar">Song added to queue</div>}
//     </main>
//   );
// }
