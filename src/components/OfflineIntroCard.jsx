import React from "react";
import { MdOfflineBolt } from "react-icons/md";
import "./offlineIntroCard.css";

export default function OfflineIntroCard({ onOpen }) {
  return (
    <div className="offline-intro-card">
      <div className="offline-intro-icon">
        <MdOfflineBolt />
      </div>

      <div className="offline-intro-content">
        <h3>Listen Offline</h3>

        <p>
          Songs you listen to, like, or add to playlists can become available
          offline automatically.
        </p>

        <button onClick={onOpen}>
          View Offline Music
        </button>
      </div>
    </div>
  );
}