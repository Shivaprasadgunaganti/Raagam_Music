// import "./profile.css";

// import { useNavigate } from "react-router-dom";

// import { supabase } from "../supabaseClient";

// import { useAudio } from "../context/AudioContext";
// import { useAuth } from "../context/AuthContext";

// import useRecent from "../hooks/useRecent";
// import useTracks from "../hooks/useTracks";

// import {
//   FaHeart,
//   FaMusic,
//   FaSearch,
// } from "react-icons/fa";

// import {
//   MdQueueMusic,
// } from "react-icons/md";

// import {
//   IoChevronForward,
// } from "react-icons/io5";

// export default function ProfilePage() {
//   const nav = useNavigate();

//   const { user } = useAuth();
//   const { clearQueue } = useAudio();

//   const { recent } = useRecent();
//   const { tracks } = useTracks();

//   const username =
//     user?.email?.split("@")[0] || "Listener";

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

//   return (
//     <main className="profile-page page-safe">
//       {/* HERO */}
//       <section className="profile-hero">
//         <div className="hero-overlay" />

//         <div className="profile-avatar">
//           {username.charAt(0).toUpperCase()}
//         </div>

//         <div className="profile-info">
//           <p className="profile-subtitle">
//             Music Lover
//           </p>

//           <h1>{username}</h1>

//           <div className="profile-mini-stats">
//             <span>{tracks?.length || 0} Tracks</span>

//             <span>•</span>

//             <span>{recent?.length || 0} Recent</span>
//           </div>
//         </div>
//       </section>

//       {/* QUICK ACTIONS */}
//       <section className="profile-actions-scroll">
//         <button
//           className="profile-pill"
//           onClick={() => nav("/liked")}
//         >
//           <FaHeart />
//           Liked
//         </button>

//         <button
//           className="profile-pill"
//           onClick={() => nav("/playlists")}
//         >
//           <FaMusic />
//           Playlists
//         </button>

//         <button
//           className="profile-pill"
//           onClick={() => nav("/queue")}
//         >
//           <MdQueueMusic />
//           Queue
//         </button>

//         <button
//           className="profile-pill"
//           onClick={() => nav("/search")}
//         >
//           <FaSearch />
//           Search
//         </button>
//       </section>

//       {/* RECENTLY PLAYED */}
//       {recent?.length > 0 && (
//         <section className="profile-section">
//           <div className="profile-section-header">
//             <h3>Recently Played</h3>

//             <button
//               onClick={() => nav("/all-songs")}
//             >
//               See all
//             </button>
//           </div>

//           <div className="profile-recent-list">
//             {recent.slice(0, 6).map((track) => (
//               <div
//                 key={track.id}
//                 className="profile-recent-row"
//                 onClick={() =>
//                   nav(`/track/${track.id}`)
//                 }
//               >
//                 <img
//                   src={
//                     track.cover_url ||
//                     "/covers/default.jpg"
//                   }
//                   alt={track.title}
//                 />

//                 <div className="recent-meta">
//                   <div className="recent-title">
//                     {track.title}
//                   </div>

//                   <div className="recent-artist">
//                     {track.artist ||
//                       "Unknown Artist"}
//                   </div>
//                 </div>

//                 <IoChevronForward className="recent-arrow" />
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* SETTINGS */}
//       <section className="profile-section">
//         <div className="profile-section-header">
//           <h3>Settings</h3>
//         </div>

//         <div className="settings-list">
//           <button className="settings-row">
//             <span>Account</span>
//             <IoChevronForward />
//           </button>

//           <button className="settings-row">
//             <span>Storage</span>
//             <IoChevronForward />
//           </button>

//           <button
//             className="settings-row logout-row"
//             onClick={handleLogout}
//           >
//             <span>Logout</span>
//             <IoChevronForward />
//           </button>
//         </div>
//       </section>
//     </main>
//   );
// }

// import "./profile.css";

// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// import { supabase } from "../supabaseClient";

// import { useAudio } from "../context/AudioContext";
// import { useAuth } from "../context/AuthContext";

// import useRecent from "../hooks/useRecent";
// import useTracks from "../hooks/useTracks";

// import { FaHeart } from "react-icons/fa";
// import { IoMusicalNotes } from "react-icons/io5";
// import { MdQueueMusic } from "react-icons/md";
// import { IoChevronForward } from "react-icons/io5";
// import { FiSettings } from "react-icons/fi";
// import { HiOutlinePlus } from "react-icons/hi";

// export default function ProfilePage() {
//   const nav = useNavigate();

//   const { clearQueue, shufflePlay } = useAudio();
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

//   const firstLetter =
//     username.charAt(0).toUpperCase();

//   const likedCount = useMemo(() => {
//     return tracks?.length || 0;
//   }, [tracks]);

//   return (
//     <main className="library-page page-safe">
//       {/* HEADER */}
//       <section className="library-header">
//         <div>
//           <h1>Your Library</h1>
//         </div>

//         <div className="library-header-actions">
//           <button>
//             <FiSettings />
//           </button>

//           <button>
//             <HiOutlinePlus />
//           </button>
//         </div>
//       </section>

//       {/* USER ROW */}
//       <section className="library-user-row">
//         <div className="library-avatar">
//           {firstLetter}
//         </div>

//         <div className="library-user-info">
//           <h3>{username}</h3>
//           <p>Music Lover</p>
//         </div>

//         <button
//           className="library-edit-btn"
//           onClick={() => nav("/account/settings")}
//         >
//           Edit
//         </button>
//       </section>

//       {/* FILTER PILLS */}
//       <section className="library-pills">
//         <button>Playlists</button>
//         <button>Albums</button>
//         <button>Artists</button>
//         <button>Downloaded</button>
//       </section>

//       {/* LIBRARY LIST */}
//       <section className="library-list">
//         <div
//           className="library-row"
//           onClick={() => nav("/liked")}
//         >
//           <div className="library-row-left">
//             <FaHeart />

//             <span>Liked Songs</span>
//           </div>

//           <div className="library-row-right">
//             <p>{likedCount}</p>

//             <IoChevronForward />
//           </div>
//         </div>

//         <div
//           className="library-row"
//           onClick={() => nav("/playlists")}
//         >
//           <div className="library-row-left">
//             <IoMusicalNotes />

//             <span>Playlists</span>
//           </div>

//           <div className="library-row-right">
//             <p>2</p>

//             <IoChevronForward />
//           </div>
//         </div>

//         <div
//           className="library-row"
//           onClick={() => nav("/queue")}
//         >
//           <div className="library-row-left">
//             <MdQueueMusic />

//             <span>Queue</span>
//           </div>

//           <div className="library-row-right">
//             <IoChevronForward />
//           </div>
//         </div>
//       </section>

//       {/* CREATE PLAYLIST */}
//       <button className="create-playlist-btn">
//         + Create Playlist
//       </button>

//       {/* SHUFFLE */}
//       {tracks?.length > 0 && (
//         <button
//           className="shuffle-btn"
//           onClick={() => shufflePlay(tracks)}
//         >
//           🔀 Shuffle All
//         </button>
//       )}

//       {/* HISTORY */}
//       {recent?.length > 0 && (
//         <section className="history-section">
//           <div className="history-header">
//             <h2>History</h2>

//             <button>Clear</button>
//           </div>

//           <div className="history-list">
//             {recent.slice(0, 8).map((track) => (
//               <div
//                 key={track.id}
//                 className="history-row"
//                 onClick={() =>
//                   nav(`/track/${track.id}`)
//                 }
//               >
//                 <img
//                   src={
//                     track.cover_url ||
//                     "/covers/default.jpg"
//                   }
//                   alt={track.title}
//                 />

//                 <div className="history-info">
//                   <h4>{track.title}</h4>

//                   <p>
//                     {track.artist ||
//                       "Unknown Artist"}
//                   </p>
//                 </div>

//                 <button className="history-more">
//                   ⋮
//                 </button>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* FOOTER ACTIONS */}
//       <section className="library-footer">
//         <button
//           onClick={() =>
//             nav("/account/settings")
//           }
//         >
//           Manage Account
//         </button>

//         <button onClick={handleLogout}>
//           Logout
//         </button>
//       </section>
//     </main>
//   );
// }

// ProfilePage.jsx

import "./profile.css";

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../supabaseClient";

import { useAudio } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";

import useRecent from "../hooks/useRecent";
import useTracks from "../hooks/useTracks";

import { FaHeart, FaPlus, FaRandom } from "react-icons/fa";

import { IoChevronForward, IoSettingsOutline } from "react-icons/io5";

import { MdQueueMusic, MdHistory } from "react-icons/md";

import { BiSearch } from "react-icons/bi";

export default function ProfilePage() {
  const nav = useNavigate();

  const { clearQueue, shufflePlay } = useAudio();

  const { user } = useAuth();

  const { recent } = useRecent();

  const { tracks } = useTracks();
   const [displayName, setDisplayName] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  // const username = user?.email?.split("@")[0] || "Listener";
const username =
  displayName ||
  user?.email?.split("@")[0] ||
  "Listener";

  const [likedCount, setLikedCount] = useState(0);

  const [playlistCount, setPlaylistCount] = useState(0);
  const [moviesCount, setMoviesCount] = useState(0);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);

 

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤";
    return "Good Evening 🌙";
  }, []);

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

  useEffect(() => {
    async function loadLikedCount() {
      const { count } = await supabase.from("liked_songs").select("*", {
        count: "exact",
        head: true,
      });

      setLikedCount(count || 0);
    }

    loadLikedCount();
  }, []);

  useEffect(() => {
    async function loadPlaylistCount() {
      const { count } = await supabase.from("playlists").select("*", {
        count: "exact",
        head: true,
      });

      setPlaylistCount(count || 0);
    }

    loadPlaylistCount();
  }, []);


   useEffect(() => {
    async function loadMoviesCount() {
      const { count } = await supabase.from("movies").select("*", {
        count: "exact",
        head: true,
      });

      setMoviesCount(count || 0);
    }

    loadMoviesCount();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles_data")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setDisplayName(data.display_name || "");
      }
    }

    loadProfile();
  }, [user]);

  const libraryItems = [
    {
      title: "Liked Songs",
      // count: tracks?.length || 0,
      count: likedCount,
      icon: <FaHeart />,
      path: "/liked",
    },

    {
      title: "Playlists",
      // count:  0,
      count: playlistCount,
      icon: <MdQueueMusic />,
      path: "/playlists",
    },

     {
      title: "Albums",
      count: moviesCount,
      icon: <MdQueueMusic />,
      path: "/movies",
    }

    // {
    //   title: "Queue",
    //   count: tracks?.length || 0,
    //   icon: <MdQueueMusic />,
    //   path: "/queue",
    // },

    // {
    //   title: "Recently Played",
    //   count: recent?.length || 0,
    //   icon: <MdHistory />,
    //   path: "/all-songs",
    // },
  ];

  const loadPlaylists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
      id,
      name,
      playlist_tracks (
        track_id,
        tracks (cover_url)
      )
    `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch playlist error:", error);
      return;
    }

    setPlaylists(data || []);
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;

    const { error } = await supabase.from("playlists").insert({
      name: newPlaylistName.trim(),
      user_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        alert("Playlist with this name already exists!");
      } else {
        console.log("Error creating playlist:", error);
      }
      return;
    }

    setNewPlaylistName("");
    setShowCreatePopup(false); // close popup
    loadPlaylists();
    showToast("Playlist created");
  };

  return (
    <main className="library-page page-safe">
      {/* HEADER */}
      <section className="library-header">
        <div>
          <p className="library-greeting">{greeting}</p>

          {/* <h1>Your Library</h1> */}
        </div>

        <button className="library-settings-btn">
          <IoSettingsOutline />
        </button>
      </section>

      {/* USER ROW */}
      <section className="library-user-row">
        <div className="library-user-left">
          <div className="library-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="library-username">{username}</div>

            <div className="library-subtitle">Music Lover</div>
          </div>
        </div>

        <button className="library-edit-btn" onClick={() => nav("/edit-info")}>
          Edit
        </button>
      </section>

      {/* FILTERS */}
      {/* <section className="library-filters">
        {[
          "All",
          "Playlists",
          "Albums",
          "Artists",
          "Liked",
        ].map((item) => (
          <button
            key={item}
            className={
              activeFilter === item
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter(item)
            }
          >
            {item}
          </button>
        ))}
      </section> */}

      {/* LIBRARY LIST */}
      <section className="library-list">
        {libraryItems.map((item) => (
          <div
            key={item.title}
            className="library-row"
            onClick={() => nav(item.path)}
          >
            <div className="library-row-left">
              <div className="library-row-icon">{item.icon}</div>

              <div>
                <div className="library-row-title">{item.title}</div>

                <div className="library-row-sub">{item.count} items</div>
              </div>
            </div>

            <IoChevronForward />
          </div>
        ))}
      </section>

      {/* ACTION BUTTONS */}
      <section className="library-actions">
        <button
          className="create-playlist-btn"
          // onClick={() => nav("/playlists")}
          onClick={() => setShowCreatePopup(true)}
        >
          <FaPlus />
          Create Playlist
        </button>

        <button
          className="shuffle-btn"
          onClick={() => shufflePlay(recent || [])}
        >
          <FaRandom />
          Shuffle All
        </button>
      </section>

      {/* HISTORY */}
      {/* {recent?.length > 0 && (
        <section className="library-history">
          <div className="section-top">
            <h2>History</h2>

            <button>Clear</button>
          </div>

          <div className="history-list">
            {recent.slice(0, 5).map((track) => (
              <div
                key={track.id}
                className="history-row"
                onClick={() => nav(`/track/${track.id}`)}
              >
                <img
                  src={track.cover_url || "/covers/default.jpg"}
                  alt={track.title}
                />

                <div className="history-info">
                  <div className="history-title">{track.title}</div>

                  <div className="history-artist">
                    {track.artist || "Unknown Artist"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )} */}
      {/* <button onClick={() => setShowCreatePopup(true)}>
  + Create Playlist
</button> */}

      {showCreatePopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowCreatePopup(false)}
        >
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create Playlist</h3>

            <input
              type="text"
              placeholder="New Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />

            <div className="popup-actions">
              <button onClick={() => setShowCreatePopup(false)}>Cancel</button>

              <button onClick={createPlaylist}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <section className="library-footer">
        <button onClick={handleLogout}>Logout</button>
      </section>
    </main>
  );
}
