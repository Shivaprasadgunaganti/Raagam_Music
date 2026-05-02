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
