import React from "react";
import { MdOfflineBolt, MdClose } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import { PiPlaylistFill } from "react-icons/pi";
import { FaPlay } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./offlineGuidePopup.css";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function OfflineGuidePopup({ onClose }) {
  const nav = useNavigate();
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();

  //   function handleOpenOffline() {
  //     onClose();
  //     nav("/offline");
  //   }

  function handleOpenOffline() {
    if (!user || isGuest) {
      showToast("Sign in to use Offline Music");
      return;
    }

    onClose();
    nav("/offline");
  }

  return (
    <div className="offline-guide-overlay" onClick={onClose}>
      <div className="offline-guide-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="offline-guide-header">
          <div className="offline-guide-title">
            <div className="offline-guide-icon">
              <MdOfflineBolt />
            </div>

            <div>
              <h3>Listen Offline</h3>
              <p>Your music, even without internet</p>
            </div>
          </div>

          <button
            className="offline-guide-close"
            onClick={onClose}
            aria-label="Close"
          >
            <MdClose />
          </button>
        </div>

        {/* Description */}
        <p className="offline-guide-description">
          Raagam can save songs for offline listening while you use the app.
        </p>

        {/* Ways */}
        <div className="offline-guide-options">
          <div className="offline-guide-option">
            <div className="offline-option-icon">
              <FaPlay />
            </div>

            <div>
              <strong>Play a song</strong>
              <span>Played songs can become available offline.</span>
            </div>
          </div>

          <div className="offline-guide-option">
            <div className="offline-option-icon">
              <FaHeart />
            </div>

            <div>
              <strong>Like a song</strong>
              <span>Liked songs can become available offline.</span>
            </div>
          </div>

          <div className="offline-guide-option">
            <div className="offline-option-icon">
              <PiPlaylistFill />
            </div>

            <div>
              <strong>Add to a playlist</strong>
              <span>Playlist songs can become available offline.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="offline-guide-footer">
          {/* <button
            className="offline-guide-button"
            onClick={handleOpenOffline}
          >
            View Offline Music
          </button> */}

          <button className="offline-guide-button" onClick={handleOpenOffline}>
            {user && !isGuest
              ? "View Offline Music"
              : "Sign in to use Offline Music"}
          </button>
        </div>
      </div>
    </div>
  );
}
