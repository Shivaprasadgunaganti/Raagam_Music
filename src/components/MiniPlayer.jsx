import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import "./miniplayer.css";
import ColorThief from "color-thief-browser";
import { useEffect, useState, useRef } from "react";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
// import { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart, FaPlay } from "react-icons/fa6";
import { CiPause1 } from "react-icons/ci";
import { useLikes } from "../context/LikeContext";
import { useToast } from "../context/ToastContext";

export default function MiniPlayer() {
  const nav = useNavigate();
  const [bgColor, setBgColor] = useState("#0e3a47");
  const [liked, setLiked] = useState(false);
  const titleRef = useRef(null);
  const artistRef = useRef(null);
  const [fade, setFade] = useState(false);
  const { showToast } = useToast();

  const {
    currentTrack,
    playing,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    seekTo,
  } = useAudio();
  useEffect(() => {
    if (!currentTrack?.cover_url) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = currentTrack.cover_url;

    img.onload = () => {
      const colorThief = new ColorThief();
      const rgb = colorThief.getColor(img);
      // setBgColor(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
      const darker = `rgb(
        ${Math.max(rgb[0] - 30, 0)},
        ${Math.max(rgb[1] - 30, 0)},
        ${Math.max(rgb[2] - 30, 0)}
      )`;

      setBgColor(darker);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;

    setFade(true);
    const timer = setTimeout(() => setFade(false), 300);

    return () => clearTimeout(timer);
  }, [currentTrack]);

  useEffect(() => {
    function checkOverflow(ref) {
      if (!ref.current) return;

      const el = ref.current;
      const inner = el.querySelector(".mini-marquee-inner");

      if (inner.scrollWidth > el.clientWidth) {
        el.classList.add("scroll");
      } else {
        el.classList.remove("scroll");
      }
    }

    checkOverflow(titleRef);
    checkOverflow(artistRef);
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;
    isSongLiked(currentTrack.id).then(setLiked);
  }, [currentTrack]);

  if (!currentTrack) return null;

  const progressPct =
    duration > 0
      ? Math.min(Math.max((currentTime / duration) * 100, 0), 100)
      : 0;

  function handleSeek(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left;
    const percent = (clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  }

  function darkenColor(rgbString, amount = 40) {
    const nums = rgbString.match(/\d+/g);
    if (!nums) return rgbString;

    const [r, g, b] = nums.map(Number);
    return `rgb(${Math.max(r - amount, 0)}, ${Math.max(
      g - amount,
      0
    )}, ${Math.max(b - amount, 0)})`;
  }

  return (
    <div
      // className="mini-player"
      className={`mini-player ${fade ? "fade-in" : ""}`}
      style={{ "--background-color": bgColor }}
      onClick={() => nav(`/track/${currentTrack.id}`)}
    >
      {/* IMAGE */}
      <img
        className="mini-image"
        src={currentTrack.cover_url || "/covers/default.jpg"}
        alt=""
        onClick={() => nav(`/track/${currentTrack.id}`)}
      />

      {/* TITLES */}
      {/* <div className="mini-titles">
        <div className="mini-title">{currentTrack.title}</div>
        <div className="mini-artist">
          {currentTrack.artist || "Unknown Artist"}
        </div>
      </div> */}

      <div className="mini-marquee" ref={titleRef}>
        <div className="mini-marquee-inner">
          <span className="mini-title">{currentTrack.title}</span>
        </div>
      </div>

      <div className="mini-marquee small" ref={artistRef}>
        <div className="mini-marquee-inner">
          <span className="mini-artist">
            {currentTrack.artist || "Unknown Artist"}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mini-actions">
        <button
          className="mini-like"
          onClick={async (e) => {
            e.stopPropagation();

            // if (liked) {
            //   await unlikeSong(currentTrack.id);
            //   setLiked(false);
            // } else {
            //   await likeSong(currentTrack.id);
            //   setLiked(true);
            // }
            if (liked) {
  await unlikeSong(currentTrack.id);
  setLiked(false);
  showToast("Removed from Liked Songs");
} else {
  await likeSong(currentTrack.id);
  setLiked(true);
  showToast("Added to Liked Songs");
}
          }}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* <button className="mini-play" onClick={togglePlay}> */}
        <button
          className="mini-play"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          {playing ? <CiPause1 /> : <FaPlay />}
        </button>
      </div>

      {/* PROGRESS */}
      <div
        className="mini-progress"
        onMouseDown={handleSeek}
        onTouchStart={handleSeek}
      >
        <div
          className="mini-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

// import { useNavigate } from "react-router-dom";
// import { useAudio } from "../context/AudioContext";
// import "./miniplayer.css";
// import ColorThief from "color-thief-browser";
// import { useEffect, useState } from "react";
// import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
// // import { useEffect, useState } from "react";
// import { FaRegHeart } from "react-icons/fa";
// import { FaHeart, FaPlay } from "react-icons/fa6";
// import { CiPause1 } from "react-icons/ci";

// export default function MiniPlayer() {
//   const nav = useNavigate();
//   const [bgColor, setBgColor] = useState("#0e3a47");
//   const [liked, setLiked] = useState(false);
//   const {
//     currentTrack,
//     playing,
//     togglePlay,
//     playNext,
//     playPrev,
//     currentTime,
//     duration,
//     seekTo,
//   } = useAudio();
//   useEffect(() => {
//     if (!currentTrack?.cover_url) return;

//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.src = currentTrack.cover_url;

//     img.onload = () => {
//       const colorThief = new ColorThief();
//       const rgb = colorThief.getColor(img);
//       setBgColor(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
//     };
//   }, [currentTrack]);

//   useEffect(() => {
//     if (!currentTrack) return;
//     isSongLiked(currentTrack.id).then(setLiked);
//   }, [currentTrack]);

//   if (!currentTrack) return null;

//   const progressPct =
//     duration > 0
//       ? Math.min(Math.max((currentTime / duration) * 100, 0), 100)
//       : 0;

//   function handleSeek(e) {
//     e.stopPropagation();
//     const rect = e.currentTarget.getBoundingClientRect();
//     const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left;
//     const percent = (clientX - rect.left) / rect.width;
//     seekTo(percent * duration);
//   }

//   function darkenColor(rgbString, amount = 40) {
//     const nums = rgbString.match(/\d+/g);
//     if (!nums) return rgbString;

//     const [r, g, b] = nums.map(Number);
//     return `rgb(${Math.max(r - amount, 0)}, ${Math.max(
//       g - amount,
//       0
//     )}, ${Math.max(b - amount, 0)})`;
//   }

//   return (
//     <div className="mini-player" style={{ "--background-color": bgColor }}>
//       {/* IMAGE */}
//       <img
//         className="mini-image"
//         src={currentTrack.cover_url || "/covers/default.jpg"}
//         alt=""
//         onClick={() => nav(`/track/${currentTrack.id}`)}
//       />

//       {/* TITLES */}
//       <div className="mini-titles">
//         <div className="mini-title">{currentTrack.title}</div>
//         <div className="mini-artist">
//           {currentTrack.artist || "Unknown Artist"}
//         </div>
//       </div>

//       {/* ACTIONS */}
//       <div className="mini-actions">
//         {/* <button className="mini-like">＋</button> */}
//         <button
//           className="mini-like"
//           onClick={async (e) => {
//             e.stopPropagation();

//             if (liked) {
//               await unlikeSong(currentTrack.id);
//               setLiked(false);
//             } else {
//               await likeSong(currentTrack.id);
//               setLiked(true);
//             }
//           }}
//         >
//           {/* {liked ? "♥" : "＋"} */}
//           {liked ? <FaHeart /> : <FaRegHeart />}
//         </button>

//         <button className="mini-play" onClick={togglePlay}>
//           {/* {playing ? "❚❚" : "▶"} */}
//           {playing ? <CiPause1 /> : <FaPlay />}
//         </button>
//       </div>

//       {/* PROGRESS */}
//       <div
//         className="mini-progress"
//         onMouseDown={handleSeek}
//         onTouchStart={handleSeek}
//       >
//         <div
//           className="mini-progress-fill"
//           style={{ width: `${progressPct}%` }}
//         />
//       </div>
//     </div>

//   );
// }
