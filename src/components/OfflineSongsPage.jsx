import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import { getAllCachedTracks } from "../utils/offlineCache";
import { deleteTrack } from "../utils/offlineCache";
import { useToast } from "../context/ToastContext";
import "./OfflineSongsPage.css";
import { MdOutlineQueueMusic, MdQueue } from "react-icons/md";
import { FaPlay, FaShuffle } from "react-icons/fa6";
import { MdOutlineDeleteOutline } from "react-icons/md";

import SEO from "./SEO";

export default function OfflineSongsPage() {
  const nav = useNavigate();

  const { currentTrack, setNewQueue } = useAudio();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadOfflineSongs() {
      try {
        setLoading(true);

        const tracks = await getAllCachedTracks();

        tracks.sort((a, b) => b.cachedAt - a.cachedAt);

        setSongs(tracks);
      } catch (err) {
        console.error("Offline songs error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOfflineSongs();
  }, []);

  //   if (loading) {
  //     return <div style={{ padding: 20 }}>Loading...</div>;
  //   }
  if (!loading && songs.length === 0) {
    return (
      <div className="offline-screen">
        <div className="offline-topbar">
          <button className="offline-back-btn" onClick={() => nav(-1)}>
            <IoArrowBack />
          </button>

          <h2 className="offline-title">Offline Songs</h2>
        </div>

        <div className="offline-empty-state">
          <h3>No Offline Songs Yet</h3>

          <p>Play songs online to make them available offline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offline-screen">
      <SEO
        title="Offline Songs | MyRaagam"
        description="Access your offline songs on MyRaagam."
        robots="noindex, nofollow"
      />
      <div className="offline-topbar">
        <button className="offline-back-btn" onClick={() => nav(-1)}>
          <IoArrowBack />
        </button>

        <h2>Offline Songs</h2>
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        {songs.length} Songs Available Offline
      </div>

      <ul className="liked-list">
        {songs.map((song, index) => {
          const isActive = currentTrack?.id === song.id;

          return (
            <li
              key={song.id}
              className={`liked-row ${isActive ? "active" : ""}`}
            >
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
      {selectedSong && (
        <div
          className="song-menu-overlay"
          onClick={() => setSelectedSong(null)}
        >
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

            <button
              onClick={() => {
                playNextInsert(selectedSong);

                setSelectedSong(null);

                showToast("Added to Play Next");
              }}
            >
              <FaPlay /> Play Next
              {/* ▶ Play Next */}
            </button>

            <button
              onClick={() => {
                setSelectedSong(null);

                nav("/queue");
              }}
            >
              <span className="sheet-icon">
                <MdOutlineQueueMusic />
              </span>{" "}
              View Queue
              {/* 🎵 View Queue */}
            </button>

            <button
              onClick={() => {
                addToQueue(selectedSong);

                setSelectedSong(null);

                showToast("Added to Queue");
              }}
            >
              {/* ➕ Add to Queue */}
              <span className="sheet-icon">
                <MdQueue />
              </span>{" "}
              Add to Queue
            </button>

            <button
              onClick={async () => {
                await deleteTrack(selectedSong.id);

                setSongs((prev) =>
                  prev.filter((s) => s.id !== selectedSong.id),
                );

                setSelectedSong(null);

                showToast("Offline copy removed");
              }}
            >
              <MdOutlineDeleteOutline /> Remove Offline Copy
              {/* 🗑 Remove Offline Copy */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
