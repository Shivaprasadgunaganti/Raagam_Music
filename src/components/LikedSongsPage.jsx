// own
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAudio } from "../context/AudioContext";
import { FcLike } from "react-icons/fc";
import { IoArrowBack } from "react-icons/io5";
import PlaylistPicker from "./PlaylistPicker";
import { FaPlay, FaShuffle } from "react-icons/fa6";
import "./liked.css";
import {
  likeSong,
  unlikeSong,
  isSongLiked,
  getLikedSongsMap,
} from "../utils/likeHelpers";
import { FaHeart } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { useLikes } from "../context/LikeContext";
import { useToast } from "../context/ToastContext";
// import { clearLikedTracks, saveLikedTracks } from "../utils/offlineCache";
import useOfflineMode from "../hooks/useOfflineMode";

import {
  saveLikedTracks,
  clearLikedTracks,
  getLikedTrackIds,
  getAllCachedTracks,
} from "../utils/offlineCache";
import { HiMiniPlay } from "react-icons/hi2";
import { MdOutlineQueueMusic, MdQueue } from "react-icons/md";
import { PiPlaylistFill } from "react-icons/pi";
import SEO from "./SEO";

export default function LikedSongsPage() {
  const nav = useNavigate();
  // ✅ Added addToQueue
  const { setNewQueue, playNextInsert, currentTrack, addToQueue, shufflePlay } =
    useAudio();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ Changed snack from boolean to string
  const [snack, setSnack] = useState("");
  // ✅ Added selectedSong for bottom sheet
  const [selectedSong, setSelectedSong] = useState(null);
  // ✅ Added showPicker
  const [showPicker, setShowPicker] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  // const [pickerTrackId, setPickerTrackId] = useState(null);
  const [pickerTrack, setPickerTrack] = useState(null);
  const { showToast } = useToast();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const { isOnline } = useOfflineMode();

  async function loadOnlineLikedSongs() {
    setLoading(true);

    const { data: likedRows, error: likedError } = await supabase
      .from("liked_songs")
      .select("track_id")
      .order("created_at", { ascending: false });

    // console.log("LIKED ROWS:", likedRows);
    // console.log("LIKED ERROR:", likedError);

    if (likedError || !likedRows || likedRows.length === 0) {
      setSongs([]);
      setLoading(false);
      return;
    }

    const trackIds = likedRows.map((r) => r.track_id);
    // console.log("TRACK IDS:", trackIds);

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
        `,
      )
      .in("id", trackIds);

    // console.log("TRACKS:", tracks);
    // console.log("TRACKS ERROR:", tracksError);

    if (!tracksError && tracks) {
      const ordered = trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter(Boolean);

      // console.log("ORDERED TRACKS:", ordered);
      setSongs(ordered);
      await clearLikedTracks();
      await saveLikedTracks(trackIds);
    } else {
      setSongs([]);
    }

    setLoading(false);

    // console.log("likedRows:", likedRows);
    // console.log("trackIds:", trackIds);
  }

  async function loadOfflineLikedSongs() {
    setLoading(true);

    try {
      const likedIds = await getLikedTrackIds();

      const cachedTracks = await getAllCachedTracks();

      const likedSongs = cachedTracks.filter((track) =>
        likedIds.includes(track.id),
      );

      setSongs(likedSongs);
    } catch (err) {
      console.error("Offline liked songs:", err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOnline) {
      loadOnlineLikedSongs();
    } else {
      loadOfflineLikedSongs();
    }
  }, [isOnline]);

  // useEffect(() => {
  //   // async function loadLikedSongs() {

  //   // loadLikedSongs();
  //   // loadOnlineLikedSongs();
  // }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 120);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
{/* seo */}
<SEO
  title="Liked Songs | MyRaagam"
  description="Your liked songs on MyRaagam."
  robots="noindex, nofollow"
/>

      {/* HERO */}
      <div className={`liked-sticky-header ${showStickyHeader ? "show" : ""}`}>
        <button onClick={() => nav(-1)}>
          <IoArrowBack />
        </button>

        <span>Liked Songs</span>
      </div>

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
          <div className="liked-action-buttons">
            <button
              className="liked-play-btn"
              onClick={() => setNewQueue(songs, 0)}
            >
              {/* ▶ */}
              <FaPlay />
            </button>

            <button
              className="liked-shuffle-btn"
              onClick={() => shufflePlay(songs)}
            >
              <FaShuffle />
            </button>
          </div>
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
                  {/* <div className="liked-song-title">{song.title}</div> */}
                  <div className="liked-song-title-row">
                    <div className="liked-song-title">{song.title}</div>

                    {isActive && (
                      <div className="playing-bars">
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
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
                    // await likeSong(song.id);
                    await likeSong(song);
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
          {/* <div className="song-menu-sheet" onClick={(e) => e.stopPropagation()}> */}
          <div
            className="song-menu-sheet slide-up-sheet"
            onClick={(e) => e.stopPropagation()}
          >
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

            {/* <button
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
              onClick={() => {
                // setPickerTrackId(selectedSong.id);
                setPickerTrack(selectedSong);

                setSelectedSong(null);
                setShowPicker(true);
              }}
            >
              📂 Add to Playlist
            </button> */}
              <button
                            onClick={() => {
                              playNextInsert(selectedSong);
                              setSelectedSong(null);
                              showToast("Added to Play Next");
                            }}
                          >
                            <span className="sheet-icon"><HiMiniPlay /></span> Play Next
                            {/* <span className="sheet-icon"><FaPlay/></span> Play Next */}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSong(null);
                              nav("/queue");
                            }}
                          >
                            <span className="sheet-icon"><MdOutlineQueueMusic /></span> View Queue
                            {/* <span className="sheet-icon">🎵</span> View Queue */}
                          </button>
                          <button
                            onClick={() => {
                              addToQueue(selectedSong);
                              setSelectedSong(null);
                              showToast("Added to Queue");
                            }}
                          >
                            {/* <span className="sheet-icon">➕</span> Add to Queue */}
                            <span className="sheet-icon"><MdQueue /></span> Add to Queue
                          </button>
            
                          <button
                            onClick={() => {
                              setPickerTrack(selectedSong);
                              setSelectedSong(null);
                              setShowPicker(true);
                            }}
                          >
                            <span className="sheet-icon"><PiPlaylistFill /></span> Add to Playlist
                            {/* <span className="sheet-icon">📂</span> Add to Playlist */}
                          </button>
          </div>
        </div>
      )}

      {/* ✅ Playlist picker */}
      {showPicker && (
        // <PlaylistPicker
        //   trackId={pickerTrackId}
        <PlaylistPicker
          // track={selectedSong}
          track={pickerTrack}
          onClose={(status) => {
            setShowPicker(false);
            // setPickerTrackId(null);
            setPickerTrack(null);
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
