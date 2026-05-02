import React from "react";

function QueueItem({
  song,
  index,
  isCurrent,
  isUpNext,
  onClick,
  onRemove,
  itemRef,
}) {
  return (
    <div
      ref={itemRef}
      className={`queue-item ${isCurrent ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="queue-index">{isCurrent ? "▶" : index + 1}</div>

      <img src={song.cover_url || "/covers/default.jpg"} alt={song.title} />

      <div className="info">
        <div className="title">
          {song.title}
          {isUpNext && <span className="up-next">Up next</span>}
        </div>
        <div className="artist">{song.artist || "Unknown Artist"}</div>
      </div>

      <button
        className="remove-btn"
        disabled={isCurrent}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default React.memo(QueueItem);
