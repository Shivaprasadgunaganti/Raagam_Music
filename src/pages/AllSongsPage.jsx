import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTracks from "../hooks/useTracks";
import "../components/collection.css";
import "../components/allsongspage.css";
import { IoArrowBack } from "react-icons/io5";
import { useAudio } from "../context/AudioContext";
import { getCachedTrackIds } from "../utils/offlineCache";
import SEO from "../components/SEO";

export default function AllSongsPage() {
  const { tracks, loading } = useTracks();
  const nav = useNavigate();

  const { setNewQueue, currentTrack } = useAudio();

  const [cachedIds, setCachedIds] = useState(new Set());

  useEffect(() => {
    async function loadCachedIds() {
      const ids = await getCachedTrackIds();
      setCachedIds(ids);
    }

    loadCachedIds();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading songs…</div>;
  }

  return (
    <main className="all-songs-page">
      <SEO
  title="All Songs | MyRaagam"
  description={`Explore ${tracks.length} songs on MyRaagam. Discover Telugu songs, movie soundtracks and music and listen online.`}
  url="https://www.myraagam.com/overall"
  type="website"
/>
      <div className="all-songs-hero">
        <header className="all-songs-header">
          <button className="icon" onClick={() => nav("/")}>
            <IoArrowBack />
          </button>

          <div className="all-songs-header-text">
            <h1>All Songs</h1>
            <p>{tracks.length} songs</p>
          </div>
        </header>
      </div>

      <div className="all-songs-list">
        {tracks.map((t, index) => {
          const isActive = currentTrack?.id === t.id;

          return (
            <div
              key={t.id}
              className="song-row"
              onClick={() => {
                setNewQueue(tracks, index);
                // nav(`/track/${t.id}`);
              }}
            >
              <img
                src={t.cover_url || "/covers/default.jpg"}
                alt={t.title}
                className="song-cover"
              />

              <div className="song-info">
                <div className="song-title-row">
                  <h2 className="song-title">{t.title}</h2>
                  {/* <h3 className="song-title">{t.title}</h3> */}

                  {isActive && (
                    <div className="playing-bars">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}

                  {cachedIds.has(t.id) && (
                    <span className="offline-badge">⬇ Offline</span>
                  )}
                </div>

                <p className="song-artist">{t.artist || "Unknown Artist"}</p>
              </div>

              {/* <div className="song-arrow">›</div> */}
            </div>
          );
        })}
      </div>
    </main>
  );
}
