import React from "react";

export default function PlaylistModal({
  show,
  playlists,
  onClose,
  onSelect,
}) {
  if (!show) return null;

  return (
    <div className="playlist-modal">
      <div className="playlist-modal-content">
        <h3>Select Playlist</h3>

        {playlists.length > 0 ? (
          playlists.map((pl) => (
            <div
              key={pl.id}
              className="playlist-option"
              onClick={() => {
                onSelect(pl.id);
                onClose();
              }}
            >
              📁 {pl.name}
            </div>
          ))
        ) : (
          <p>No playlists found</p>
        )}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}