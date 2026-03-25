import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useTracks from "../hooks/useTracks";
import { useAudio } from "../context/AudioContext";
import "./details.css";
import { BiShuffle } from "react-icons/bi";
import { PiRepeatOnce } from "react-icons/pi";
import PlaylistPicker from "./PlaylistPicker";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
import { FaRegHeart, FaStepBackward, FaStepForward } from "react-icons/fa";
// import { FaHeart } from "react-icons/fa6";
import { FaHeart, FaPlay, FaShuffle } from "react-icons/fa6";
import { CiPause1 } from "react-icons/ci";
import { IoIosPause, IoIosShuffle } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { SlOptionsVertical } from "react-icons/sl";
import { IoArrowBack } from "react-icons/io5";
import ColorThief from "color-thief-browser";
import { useLikes } from "../context/LikeContext";


function formatTime(sec = 0) {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function SongDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { tracks = [], loading } = useTracks();

  const progressRef = useRef(null);
  const titleRef = useRef(null);
  const artistRef = useRef(null);
  const albumRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [liked, setLiked] = useState(false);
  const [time, setTime] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [bgColor, setBgColor] = useState("#0e3a47");
  const [snack, setSnack] = useState("");

  // const index = tracks.findIndex((t) => String(t.id) === String(id));
  // const track = index >= 0 ? tracks[index] : null;

//   const track = currentTrack; 
// const index = tracks.findIndex(
//   (t) => String(t.id) === String(currentTrack?.id)
// );

  // const {
  //   currentTrack,
  //   playing,
  //   togglePlay,
  //   playNext,
  //   playPrev,
  //   setNewQueue,
  //   loopOne,
  //   shuffle,
  //   setLoopOne,
  //   setShuffle,
  //   audioRef,
  //   addToQueue,
  //   playNextInsert,
  //   currentTime,
  // } = useAudio();


  // ✅ FIRST get from context
const {
  currentTrack,
  playing,
  togglePlay,
  playNext,
  playPrev,
  setNewQueue,
  loopOne,
  shuffle,
  setLoopOne,
  setShuffle,
  audioRef,
  addToQueue,
  playNextInsert,
  currentTime,
} = useAudio();

// ✅ THEN use it
const track = currentTrack;

const index = tracks.findIndex(
  (t) => String(t.id) === String(currentTrack?.id)
);

  /* ---------------- TIME SYNC (READ-ONLY) ---------------- */
function showSnack(msg) {
  setSnack(msg);
  setTimeout(() => setSnack(""), 2500);
}

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setTime(audio.currentTime || 0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [audioRef]);

  /*---------------content overflow -------- */
  useEffect(() => {
    function checkOverflow(ref) {
      if (!ref.current) return;

      const el = ref.current;
      const inner = el.querySelector(".marquee-inner");

      if (inner.scrollWidth > el.clientWidth) {
        el.classList.add("scroll");
      } else {
        el.classList.remove("scroll");
      }
    }

    checkOverflow(titleRef);
    checkOverflow(artistRef);
    checkOverflow(albumRef);
  }, [track]);

  /* ---------------- dynamic bg color ----------- */

  useEffect(() => {
    if (!track?.cover_url) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = track.cover_url;

    img.onload = () => {
      const colorThief = new ColorThief();
      const rgb = colorThief.getColor(img);

      const r = Math.min(rgb[0], 180);
      const g = Math.min(rgb[1], 180);
      const b = Math.min(rgb[2], 180);

      setBgColor(`rgb(${r}, ${g}, ${b})`);
    };
  }, [track]);

  /* ---------------- LIKE STATE ---------------- */
  useEffect(() => {
    if (!track) return;
    isSongLiked(track.id).then(setLiked);
  }, [track]);


  useEffect(() => {
  setTime(currentTime || 0);
}, [currentTime]);

useEffect(() => {
  if (currentTrack?.id && String(id) !== String(currentTrack.id)) {
    nav(`/track/${currentTrack.id}`, { replace: true });
  }
}, [currentTrack]);

  /* ---------------- GUARDS ---------------- */
  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  if (!track) {
    return (
      <div style={{ padding: 20 }}>
        Track not found. <button onClick={() => nav(-1)}>Back</button>
      </div>
    );
  }

  const duration = audioRef.current?.duration || 0;
  const progressPct = duration ? (time / duration) * 100 : 0;

  /* ---------------- SEEK ---------------- */
  function handleSeek(e) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !audio.duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX ?? e.touches?.[0]?.clientX;
    const percent = Math.min(Math.max((clickX - rect.left) / rect.width, 0), 1);

    audio.currentTime = percent * audio.duration;
    setTime(audio.currentTime);
  }

  /* ---------------- LIKE / UNLIKE ---------------- */
  async function toggleLike() {
    if (!track) return;

    if (liked) {
      await unlikeSong(track.id);
      setLiked(false);
    } else {
      await likeSong(track.id);
      setLiked(true);
    }
  }

  return (
    <main
      className="page-safe detials-page-main"
      style={{
        "--background-color": bgColor,
      }}
    >
      <div className="song-detail-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <IoArrowBack />
        </button>

        <h3>Song details</h3>

        <span className="menu-dots" onClick={() => setShowMenu((v) => !v)}>
          <SlOptionsVertical />
        </span>
      </div>

      <div className="song-detail-card">
        <div className="song-art-wrapper">
          <div
            className="song-art"
            role="presentation"
            style={{
              backgroundImage: `url(${
                track.cover_url || "/covers/default.jpg"
              })`,
            }}
          ></div>
        </div>

        <div className="song-meta">
          <div className="song-title-row">
            <div className="song-title-marquee" ref={titleRef}>
              <div className="marquee-inner">{track.title}</div>
            </div>

            <button className="song-like-btn" onClick={toggleLike}>
              {liked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="song-artist-marquee" ref={artistRef}>
            <div className="marquee-inner small">
              {track.artist || "Unknown Artist"}
            </div>
          </div>
        </div>

        <div className="song-time-row">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div
          className="song-progress"
          ref={progressRef}
          onMouseDown={handleSeek}
          onTouchStart={handleSeek}
        >
          <div
            className="song-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="song-main-controls">
          <button
            onClick={() => setShuffle((v) => !v)}
            // style={{ color: shuffle ? "#4de08a" : "#9aa4b2" }}
            style={{ color: shuffle ? "#4de08a" : "#f7fcf7" }}
          >
            <IoIosShuffle />
          </button>

          <button onClick={playPrev}>
            <FaStepBackward />
          </button>

          <button
            className="song-play-btn"
            onClick={() => {
              if (currentTrack?.id === track.id) {
                togglePlay();
              } else {
                setNewQueue(tracks, index);
              }
            }}
          >
            {playing && currentTrack?.id === track.id ? (
              // <CiPause1 />
              <IoIosPause />
            ) : (
              <FaPlay />
            )}
          </button>

          <button onClick={playNext}>
            <FaStepForward />
          </button>

          <button
            onClick={() => setLoopOne((v) => !v)}
            // style={{ color: loopOne ? "#4de08a" : "#9aa4b2" }}
            style={{ color: loopOne ? "#4de08a" : "#f7fcf7" }}
          >
            <PiRepeatOnce />
          </button>
        </div>
      </div>

      {/* {showPicker && (
        <PlaylistPicker
          trackId={track.id}
          onClose={() => setShowPicker(false)}
        />
      )} */}

      {showPicker && (
  <PlaylistPicker
    trackId={track.id}
    onClose={(status) => {
      setShowPicker(false);

      if (status === "added") {
        showSnack("added to playlist");
      } else if (status === "exists") {
        showSnack("already in playlist");
      }
    }}
  />
)}
      {showMenu && (
        <div className="song-menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="song-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                playNextInsert(track);
                setShowMenu(false);
              }}
            >
              ▶ Play Next
            </button>
            <button
              onClick={() => {
                addToQueue(track); // 🔥 THIS IS MISSING
                setShowMenu(false);
                nav("/queue"); // optional (you can remove if you want)
              }}
            >
              ➕ Add to Queue
            </button>

            <button onClick={() => nav("/queue")}>
              {" "}
              <RxHamburgerMenu /> View Queue
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                setShowPicker(true);
              }}
            >
              📂 Add to Playlist
            </button>
          </div>
        </div>
      )}
      {snack && <div className="sp-snackbar">Song {snack}</div>}
    </main>
  );
}
