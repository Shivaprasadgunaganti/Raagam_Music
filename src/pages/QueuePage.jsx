import React, { useEffect, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import "./queue.css";

export default function QueuePage() {
  const nav = useNavigate();
  const {
    queue,
    currentIndex,
    currentTrack,
    removeFromQueue,
    clearQueue,
    setNewQueue,
  } = useAudio();

  const itemRefs = useRef([]);

  /* 🔹 Auto-scroll to current song */
  useEffect(() => {
    if (currentIndex < 0) return;
    const node = itemRefs.current[currentIndex];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex]);

  if (!queue.length) {
    return (
      <main className="queue-page">
        <h2>Queue</h2>
        <p>No songs in queue</p>
      </main>
    );
  }

  return (
    <main className="queue-page page-safe">
      {/* HEADER */}
      <div className="queue-header">
        {/* <button onClick={() => nav(-1)}>← Back</button> */}
        <button onClick={() => nav(-1)}>
          {" "}
          <IoArrowBack />
        </button>
        <h2>Playing Queue</h2>
        <button className="clear-btn" onClick={clearQueue}>
          Clear
        </button>
      </div>

      {/* NOW PLAYING */}
      {currentTrack && (
        <div className="queue-now">
          <span>Now Playing</span>
        </div>
      )}

      {/* QUEUE LIST */}
      <div className="queue-list">
        {queue.map((song, index) => {
          const isCurrent = index === currentIndex;
          const isUpNext = index === currentIndex + 1;

          return (
            <div
              key={song.id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`queue-item ${isCurrent ? "active" : ""}`}
              onClick={() => setNewQueue(queue, index)}
            >
              {/* INDEX */}
              <div className="queue-index">{isCurrent ? "▶" : index + 1}</div>

              <img
                src={song.cover_url || "/covers/default.jpg"}
                alt={song.title}
              />

              <div className="info">
                <div className="title">
                  {song.title}
                  {isUpNext && <span className="up-next">Up next</span>}
                </div>
                <div className="artist">{song.artist || "Unknown Artist"}</div>
              </div>

              {/* REMOVE BUTTON */}
              <button
                className="remove-btn"
                disabled={isCurrent}
                title={
                  isCurrent
                    ? "Cannot remove currently playing song"
                    : "Remove from queue"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromQueue(song.id);
                }}
                style={{
                  opacity: isCurrent ? 0.4 : 1,
                  cursor: isCurrent ? "not-allowed" : "pointer",
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}

// import React, { useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAudio } from "../context/AudioContext";
// import "./queue.css";

// export default function QueuePage() {
//   const nav = useNavigate();
//   const {
//     queue,
//     currentIndex,
//     currentTrack,
//     removeFromQueue,
//     clearQueue,
//     setNewQueue,
//   } = useAudio();

//   // 🔹 refs for each queue item
//   const itemRefs = useRef([]);

//   /* ================= AUTO SCROLL ================= */
//   useEffect(() => {
//     if (currentIndex < 0) return;

//     const node = itemRefs.current[currentIndex];
//     if (node) {
//       node.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });
//     }
//   }, [currentIndex]);
//   /* =============================================== */

//   if (!queue.length) {
//     return (
//       <main className="queue-page">
//         <h2>Queue</h2>
//         <p>No songs in queue</p>
//       </main>
//     );
//   }

//   return (
//     <main className="queue-page">
//       {/* HEADER */}
//       <div className="queue-header">
//         <button onClick={() => nav(-1)}>← Back</button>
//         <h2>Playing Queue</h2>
//         <button className="clear-btn" onClick={clearQueue}>
//           Clear
//         </button>
//       </div>

//       {/* NOW PLAYING */}
//       {currentTrack && (
//         <div className="queue-now">
//           <span>Now Playing</span>
//         </div>
//       )}

//       {/* QUEUE LIST */}
//       <div className="queue-list">
//         {queue.map((song, index) => (
//           <div
//             key={song.id}
//             ref={(el) => (itemRefs.current[index] = el)} // 👈 IMPORTANT
//             className={`queue-item ${
//               index === currentIndex ? "active" : ""
//             }`}
//             onClick={() => setNewQueue(queue, index)}
//           >
//             <img
//               src={song.cover_url || "/covers/default.jpg"}
//               alt={song.title}
//             />

//             <div className="info">
//               <div className="title">{song.title}</div>
//               <div className="artist">
//                 {song.artist || "Unknown Artist"}
//               </div>
//             </div>

//             <button
//               className="remove-btn"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 removeFromQueue(song.id);
//               }}
//             >
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAudio } from "../context/AudioContext";
// import "./queue.css";

// export default function QueuePage() {
//   const nav = useNavigate();
//   const {
//     queue,
//     currentIndex,
//     currentTrack,
//     removeFromQueue,
//     clearQueue,
//     setNewQueue,
//   } = useAudio();

//   if (!queue.length) {
//     return (
//       <main className="queue-page">
//         <h2>Queue</h2>
//         <p>No songs in queue</p>
//       </main>
//     );
//   }

//   return (
//     <main className="queue-page">
//       {/* HEADER */}
//       <div className="queue-header">
//         <button onClick={() => nav(-1)}>← Back</button>
//         <h2>Playing Queue</h2>
//         <button className="clear-btn" onClick={clearQueue}>
//           Clear
//         </button>
//       </div>

//       {/* CURRENT TRACK */}
//       {currentTrack && (
//         <div className="queue-now">
//           <span>Now Playing</span>
//           <div className="queue-item active">
//             <img
//               src={currentTrack.cover_url || "/covers/default.jpg"}
//               alt={currentTrack.title}
//             />
//             <div>
//               <div className="title">{currentTrack.title}</div>
//               <div className="artist">
//                 {currentTrack.artist || "Unknown Artist"}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* UPCOMING */}
//       <div className="queue-list">
//         {queue.map((song, index) => {
//           if (index === currentIndex) return null;

//           return (
//             <div
//               key={song.id}
//               className="queue-item"
//               onClick={() => setNewQueue(queue, index)}
//             >
//               <img
//                 src={song.cover_url || "/covers/default.jpg"}
//                 alt={song.title}
//               />

//               <div className="info">
//                 <div className="title">{song.title}</div>
//                 <div className="artist">
//                   {song.artist || "Unknown Artist"}
//                 </div>
//               </div>

//               <button
//                 className="remove-btn"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   removeFromQueue(song.id);
//                 }}
//               >
//                 ✕
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </main>
//   );
// }

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAudio } from "../context/AudioContext";
// import "./queue.css";

// export default function QueuePage() {
//   const nav = useNavigate();
//   const {
//     queue,
//     currentIndex,
//     playTrack,
//     resetPlayer,
//   } = useAudio();

//   if (!queue.length) {
//     return (
//       <main className="queue-page">
//         <h1>Queue</h1>
//         <p>No songs in queue</p>
//       </main>
//     );
//   }

//   return (
//     <main className="queue-page">
//       <header className="queue-header">
//         <button onClick={() => nav(-1)}>← Back</button>
//         <h1>Up Next</h1>
//         <button className="clear-btn" onClick={resetPlayer}>
//           Clear
//         </button>
//       </header>

//       <ul className="queue-list">
//         {queue.map((song, index) => {
//           const isCurrent = index === currentIndex;

//           return (
//             <li
//               key={song.id}
//               className={`queue-item ${isCurrent ? "active" : ""}`}
//               onClick={() => playTrack(song)}
//             >
//               <img
//                 src={song.cover_url || "/covers/default.jpg"}
//                 alt={song.title}
//               />

//               <div className="queue-info">
//                 <div className="queue-title">{song.title}</div>
//                 <div className="queue-artist">
//                   {song.artist || "Unknown Artist"}
//                 </div>
//               </div>

//               {isCurrent && <span className="now-playing">▶</span>}
//             </li>
//           );
//         })}
//       </ul>
//     </main>
//   );
// }
