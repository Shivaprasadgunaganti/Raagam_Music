// src/hooks/useRecent.js
import { useEffect, useState } from "react";

const STORAGE_KEY = "recent_tracks_v1";
const MAX_RECENT = 10;

export default function useRecent() {
  const [recent, setRecent] = useState([]);

  /* -------- LOAD FROM STORAGE -------- */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored)) {
        setRecent(stored);
      }
    } catch {
      setRecent([]);
    }
  }, []);

  /* -------- SAVE TO STORAGE -------- */
  const persist = (list) => {
    setRecent(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  /* -------- ADD RECENT TRACK -------- */
  const addRecent = (track) => {
    if (!track || !track.id) return;

    setRecent((prev) => {
      // Remove existing occurrence
      const filtered = prev.filter((t) => t.id !== track.id);

      // Add to top
      const updated = [track, ...filtered];

      // Limit size
      const trimmed = updated.slice(0, MAX_RECENT);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {}

      return trimmed;
    });
  };

  /* -------- CLEAR (OPTIONAL, FUTURE USE) -------- */
  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recent,
    addRecent,
    clearRecent, // not used now, but useful later
  };
}








// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// const MAX_RECENT = 10;

// export default function useRecent() {
//   const [recent, setRecent] = useState([]);
//   const [storageKey, setStorageKey] = useState(null);

//   /* -------- INIT: GET USER + STORAGE KEY -------- */
//   useEffect(() => {
//     async function init() {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       const key = user
//         ? `recent_tracks_${user.id}`
//         : "recent_tracks_guest";

//       setStorageKey(key);

//       try {
//         const stored = JSON.parse(localStorage.getItem(key));
//         if (Array.isArray(stored)) {
//           setRecent(stored);
//         }
//       } catch {
//         setRecent([]);
//       }
//     }

//     init();
//   }, []);

//   /* -------- SAVE TO STORAGE -------- */
//   const persist = async (list) => {
//     setRecent(list);

//     if (!storageKey) return;

//     try {
//       localStorage.setItem(storageKey, JSON.stringify(list));
//     } catch {}
//   };

//   /* -------- ADD RECENT TRACK -------- */
//   const addRecent = async (track) => {
//     if (!track || !track.id || !storageKey) return;

//     const filtered = recent.filter((t) => t.id !== track.id);
//     const updated = [track, ...filtered];
//     const trimmed = updated.slice(0, MAX_RECENT);

//     await persist(trimmed);
//   };

//   /* -------- CLEAR RECENTS -------- */
//   const clearRecent = async () => {
//     if (!storageKey) return;

//     setRecent([]);

//     try {
//       localStorage.removeItem(storageKey);
//     } catch {}
//   };

//   return {
//     recent,
//     addRecent,
//     clearRecent,
//   };
// }

























