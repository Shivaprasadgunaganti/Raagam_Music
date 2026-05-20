// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";

// export default function ProfilePage() {
//   const { clearQueue } = useAudio();

//   async function handleLogout() {
//     await supabase.auth.signOut();

//     clearQueue();
//     // localStorage.removeItem("audio_state_v1");
// Object.keys(localStorage).forEach((key) => {
//   if (key.startsWith("audio_state_")) {
//     localStorage.removeItem(key);
//   }
// });

//     window.location.href = "/login";
//   }

//   return (
//     <div>
//       <h2>Profile</h2>
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// }




// import "./profile.css";

// import { supabase } from "../supabaseClient";
// import { useAudio } from "../context/AudioContext";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// import useRecent from "../hooks/useRecent";
// import useTracks from "../hooks/useTracks";

// import { FaHeart } from "react-icons/fa";
// import { IoMusicalNotes } from "react-icons/io5";
// import { MdQueueMusic } from "react-icons/md";
// import { BiSearch } from "react-icons/bi";

// export default function ProfilePage() {
//   const nav = useNavigate();

//   const { clearQueue } = useAudio();
//   const { user } = useAuth();

//   const { recent } = useRecent();
//   const { tracks } = useTracks();

//   async function handleLogout() {
//     await supabase.auth.signOut();

//     clearQueue();

//     Object.keys(localStorage).forEach((key) => {
//       if (key.startsWith("audio_state_")) {
//         localStorage.removeItem(key);
//       }
//     });

//     window.location.href = "/login";
//   }

//   const username =
//     user?.email?.split("@")[0] || "Listener";

//   return (
//     <main className="profile-page page-safe">
//       {/* HERO */}
//       <section className="profile-hero">
//         <div className="profile-avatar">
//           {username.charAt(0).toUpperCase()}
//         </div>

//         <h1>{username}</h1>

//         <p>Free Listener</p>
//       </section>

//       {/* STATS */}
//       <section className="profile-stats">
//         <div className="profile-stat-card">
//           <span>{tracks?.length || 0}</span>
//           <p>Songs</p>
//         </div>

//         <div className="profile-stat-card">
//           <span>{recent?.length || 0}</span>
//           <p>Recently Played</p>
//         </div>

//         <div className="profile-stat-card">
//           <span>∞</span>
//           <p>Music Vibes</p>
//         </div>
//       </section>

//       {/* LIBRARY */}
//       <section className="profile-section">
//         <div className="profile-section-header">
//           <h3>Your Library</h3>
//         </div>

//         <div className="profile-library-grid">
//           <button
//             className="profile-library-card"
//             onClick={() => nav("/liked")}
//           >
//             <FaHeart />
//             <span>Liked Songs</span>
//           </button>

//           <button
//             className="profile-library-card"
//             onClick={() => nav("/playlists")}
//           >
//             <IoMusicalNotes />
//             <span>Playlists</span>
//           </button>

//           <button
//             className="profile-library-card"
//             onClick={() => nav("/queue")}
//           >
//             <MdQueueMusic />
//             <span>Queue</span>
//           </button>

//           <button
//             className="profile-library-card"
//             onClick={() => nav("/search")}
//           >
//             <BiSearch />
//             <span>Search</span>
//           </button>
//         </div>
//       </section>

//       {/* RECENT */}
//       {recent?.length > 0 && (
//         <section className="profile-section">
//           <div className="profile-section-header">
//             <h3>Recently Played</h3>
//           </div>

//           <div className="profile-recent-list">
//             {recent.slice(0, 4).map((track) => (
//               <div
//                 key={track.id}
//                 className="profile-recent-row"
//                 onClick={() => nav(`/track/${track.id}`)}
//               >
//                 <img
//                   src={
//                     track.cover_url ||
//                     "/covers/default.jpg"
//                   }
//                   alt={track.title}
//                 />

//                 <div>
//                   <div className="recent-title">
//                     {track.title}
//                   </div>

//                   <div className="recent-artist">
//                     {track.artist || "Unknown Artist"}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* LOGOUT */}
//       <button
//         className="profile-logout-btn"
//         onClick={handleLogout}
//       >
//         Logout
//       </button>
//     </main>
//   );
// }


import "./profile.css";

import { useNavigate } from "react-router-dom";

import { supabase } from "../supabaseClient";

import { useAudio } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";

import useRecent from "../hooks/useRecent";
import useTracks from "../hooks/useTracks";

import {
  FaHeart,
  FaMusic,
  FaSearch,
} from "react-icons/fa";

import {
  MdQueueMusic,
} from "react-icons/md";

import {
  IoChevronForward,
} from "react-icons/io5";

export default function ProfilePage() {
  const nav = useNavigate();

  const { user } = useAuth();
  const { clearQueue } = useAudio();

  const { recent } = useRecent();
  const { tracks } = useTracks();

  const username =
    user?.email?.split("@")[0] || "Listener";

  async function handleLogout() {
    await supabase.auth.signOut();

    clearQueue();

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("audio_state_")) {
        localStorage.removeItem(key);
      }
    });

    window.location.href = "/login";
  }

  return (
    <main className="profile-page page-safe">
      {/* HERO */}
      <section className="profile-hero">
        <div className="hero-overlay" />

        <div className="profile-avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="profile-info">
          <p className="profile-subtitle">
            Music Lover
          </p>

          <h1>{username}</h1>

          <div className="profile-mini-stats">
            <span>{tracks?.length || 0} Tracks</span>

            <span>•</span>

            <span>{recent?.length || 0} Recent</span>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="profile-actions-scroll">
        <button
          className="profile-pill"
          onClick={() => nav("/liked")}
        >
          <FaHeart />
          Liked
        </button>

        <button
          className="profile-pill"
          onClick={() => nav("/playlists")}
        >
          <FaMusic />
          Playlists
        </button>

        <button
          className="profile-pill"
          onClick={() => nav("/queue")}
        >
          <MdQueueMusic />
          Queue
        </button>

        <button
          className="profile-pill"
          onClick={() => nav("/search")}
        >
          <FaSearch />
          Search
        </button>
      </section>

      {/* RECENTLY PLAYED */}
      {recent?.length > 0 && (
        <section className="profile-section">
          <div className="profile-section-header">
            <h3>Recently Played</h3>

            <button
              onClick={() => nav("/all-songs")}
            >
              See all
            </button>
          </div>

          <div className="profile-recent-list">
            {recent.slice(0, 6).map((track) => (
              <div
                key={track.id}
                className="profile-recent-row"
                onClick={() =>
                  nav(`/track/${track.id}`)
                }
              >
                <img
                  src={
                    track.cover_url ||
                    "/covers/default.jpg"
                  }
                  alt={track.title}
                />

                <div className="recent-meta">
                  <div className="recent-title">
                    {track.title}
                  </div>

                  <div className="recent-artist">
                    {track.artist ||
                      "Unknown Artist"}
                  </div>
                </div>

                <IoChevronForward className="recent-arrow" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SETTINGS */}
      <section className="profile-section">
        <div className="profile-section-header">
          <h3>Settings</h3>
        </div>

        <div className="settings-list">
          <button className="settings-row">
            <span>Account</span>
            <IoChevronForward />
          </button>

          <button className="settings-row">
            <span>Storage</span>
            <IoChevronForward />
          </button>

          <button
            className="settings-row logout-row"
            onClick={handleLogout}
          >
            <span>Logout</span>
            <IoChevronForward />
          </button>
        </div>
      </section>
    </main>
  );
}