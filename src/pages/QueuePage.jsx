import React, { useEffect, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import "./queue.css";
import QueueItem from "./QueueItem";

export default function QueuePage() {
  const nav = useNavigate();
  const {
    queue,
    currentIndex,
    currentTrack,
    removeFromQueue,
    clearQueue,
    setNewQueue,
    reorderQueue,
  } = useAudio();

  const itemRefs = useRef([]);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  /* 🔹 Auto-scroll to current song */
  useEffect(() => {
    if (currentIndex < 0) return;
    const node = itemRefs.current[currentIndex];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex]);

  if (!queue.length) {
    return (
      <main className="queue-page">
        <h2>Queue</h2>
        <p>No songs in queue</p>
      </main>
    );
  }

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    const newQueue = [...queue];

    const draggedItem = newQueue.splice(dragItem.current, 1)[0];
    newQueue.splice(dragOverItem.current, 0, draggedItem);

    reorderQueue(newQueue);

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleTouchStartX = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMoveX = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEndX = (song, isCurrent) => {
    const diff = touchStartX.current - touchEndX.current;

    // swipe left threshold
    if (diff > 80) {
      if (!isCurrent) {
        removeFromQueue(song.id);
      }
    }
  };

  return (
    <main className="queue-page page-safe">
      {/* HEADER */}
      <div className="queue-header">
        {/* <button onClick={() => nav(-1)}>← Back</button> */}
        <button onClick={() => nav(-1)}>
          {" "}
          <IoArrowBack />
        </button>
        <h2 id="playing-queue">Playing Queue</h2>
        <button className="clear-btn" onClick={clearQueue}>
          Clear
        </button>
      </div>

      {/* NOW PLAYING */}
      {currentTrack && (
        <div className="queue-now-card">
          <img src={currentTrack.cover_url} alt={currentTrack.title} />

          <div>
            <div className="now-title">{currentTrack.title}</div>
            <div className="now-artist">
              {currentTrack.artist || "Unknown Artist"}
            </div>
          </div>
        </div>
      )}

      {/* QUEUE LIST */}
      <div className="queue-list">
        {queue.map((song, index) => {
          const isCurrent = index === currentIndex;
          const isUpNext = index === currentIndex + 1;

          return (
            <QueueItem
              key={song.id}
              song={song}
              index={index}
              isCurrent={isCurrent}
              isUpNext={isUpNext}
              itemRef={(el) => (itemRefs.current[index] = el)}
              onClick={() => setNewQueue(queue, index)}
              onRemove={() => removeFromQueue(song.id)}
            />
          );
        })}
      </div>
    </main>
  );
}
