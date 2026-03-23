// import React, { useEffect, useRef, useState } from "react";

// function formatTime(seconds = 0) {
//   if (!isFinite(seconds) || seconds === 0) return "00:00";
//   const s = Math.floor(seconds % 60);
//   const m = Math.floor((seconds / 60) % 60);
//   const mm = m < 10 ? `0${m}` : `${m}`;
//   const ss = s < 10 ? `0${s}` : `${s}`;
//   return `${mm}:${ss}`;
// }

// export default function Player({ track, onNext, onPrev, hasNext, hasPrev }) {
//   const audioRef = useRef(new Audio());
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [seeking, setSeeking] = useState(false);

//   // Attach audio events only once
//   useEffect(() => {
//     const audio = audioRef.current;

//     const handleTime = () => {
//       if (!seeking) setCurrentTime(audio.currentTime);
//     };
//     const handleLoaded = () =>
//       setDuration(isFinite(audio.duration) ? audio.duration : 0);
//     const handleEnded = () => {
//       setIsPlaying(false);
//       setCurrentTime(0);
//       // auto-next if available
//       if (typeof onNext === "function" && hasNext) {
//         onNext();
//       }
//     };

//     audio.addEventListener("timeupdate", handleTime);
//     audio.addEventListener("loadedmetadata", handleLoaded);
//     audio.addEventListener("ended", handleEnded);

//     return () => {
//       audio.removeEventListener("timeupdate", handleTime);
//       audio.removeEventListener("loadedmetadata", handleLoaded);
//       audio.removeEventListener("ended", handleEnded);
//       // do not destroy audio here; we reuse it across renders
//     };
//   }, [seeking, onNext, hasNext]);

//   // When the track prop changes, load and attempt autoplay
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!track) {
//       audio.pause();
//       audio.src = "";
//       setIsPlaying(false);
//       setCurrentTime(0);
//       setDuration(0);
//       return;
//     }

//     // derive playable URL (support different field names)
//     const src =
//       track.playable_url ||
//       track.external_url ||
//       track.url ||
//       track.storage_path ||
//       "";
//     // if storage_path (from Supabase public bucket) convert to full URL if needed
//     const isPath = src && !src.startsWith("http");
//     const finalSrc =
//       isPath && track.storage_path
//         ? `${window.location.origin}/` + src // fallback; ideally use full public URL
//         : src;

//     audio.src = finalSrc;
//     audio.load();
//     setCurrentTime(0);
//     setDuration(0);

//     audio
//       .play()
//       .then(() => setIsPlaying(true))
//       .catch(() => setIsPlaying(false));
//   }, [track]);

//   const togglePlay = async () => {
//     const audio = audioRef.current;
//     if (!audio.src) return;
//     if (isPlaying) {
//       audio.pause();
//       setIsPlaying(false);
//     } else {
//       try {
//         await audio.play();
//         setIsPlaying(true);
//       } catch {
//         setIsPlaying(false);
//       }
//     }
//   };

//   const onSeekStart = () => setSeeking(true);
//   const onSeek = (e) => setCurrentTime(Number(e.target.value));
//   const onSeekEnd = (e) => {
//     const audio = audioRef.current;
//     const val = Number(e.target.value);
//     audio.currentTime = val;
//     setCurrentTime(val);
//     setSeeking(false);
//   };

//   // Inline styles — keep them simple and neutral
//   const barStyle = {
//     display: "flex",
//     gap: 12,
//     alignItems: "center",
//     padding: 12,
//     borderTop: "1px solid #e6e6e6",
//     background: "#fff",
//     width: "100%",
//     boxSizing: "border-box",
//   };

//   const infoStyle = { flex: 1, minWidth: 0 };
//   const titleStyle = {
//     fontWeight: 700,
//     marginBottom: 4,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };
//   const artistStyle = { color: "#666", fontSize: 13, marginBottom: 8 };

//   return (
//     <div style={barStyle}>
//       {track ? (
//         <>
//           <img
//             src={
//               track.cover_url ||
//               track.cover ||
//               `https://picsum.photos/seed/${track.id}/64/64`
//             }
//             alt="cover"
//             style={{
//               width: 64,
//               height: 64,
//               objectFit: "cover",
//               borderRadius: 6,
//             }}
//           />

//           <div style={infoStyle}>
//             <div style={titleStyle}>{track.title}</div>
//             <div style={artistStyle}>{track.artist}</div>

//             <input
//               type="range"
//               min={0}
//               max={duration || 0}
//               step="0.1"
//               value={currentTime}
//               onMouseDown={onSeekStart}
//               onTouchStart={onSeekStart}
//               onChange={onSeek}
//               onMouseUp={onSeekEnd}
//               onTouchEnd={onSeekEnd}
//               style={{ width: "100%", marginTop: 6 }}
//             />

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 marginTop: 6,
//                 fontSize: 12,
//                 color: "#444",
//               }}
//             >
//               <div>{formatTime(currentTime)}</div>
//               <div>{formatTime(duration)}</div>
//             </div>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <button
//               onClick={onPrev}
//               disabled={!hasPrev}
//               style={{
//                 padding: "8px 10px",
//                 borderRadius: 6,
//                 border: "1px solid #ccc",
//                 background: hasPrev ? "#fff" : "#f5f5f5",
//                 cursor: hasPrev ? "pointer" : "not-allowed",
//               }}
//             >
//               ◀ Prev
//             </button>

//             <button
//               onClick={togglePlay}
//               style={{
//                 padding: "8px 12px",
//                 borderRadius: 6,
//                 border: "1px solid #ccc",
//                 background: "#fff",
//                 cursor: "pointer",
//               }}
//             >
//               {isPlaying ? "Pause" : "Play"}
//             </button>

//             <button
//               onClick={onNext}
//               disabled={!hasNext}
//               style={{
//                 padding: "8px 10px",
//                 borderRadius: 6,
//                 border: "1px solid #ccc",
//                 background: hasNext ? "#fff" : "#f5f5f5",
//                 cursor: hasNext ? "pointer" : "not-allowed",
//               }}
//             >
//               Next ▶
//             </button>
//           </div>
//         </>
//       ) : (
//         <div style={{ color: "#666" }}>No track selected</div>
//       )}
//     </div>
//   );
// }
