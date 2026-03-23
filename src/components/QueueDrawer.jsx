
































import { useAudio } from "../context/AudioContext";
import "./queue.css";

export default function QueueDrawer({ onClose }) {
  const { queue, currentIndex, setNewQueue } = useAudio();

  return (
    <div className="queue-overlay" onClick={onClose}>
      <div className="queue-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Up Next</h3>

        <ul className="queue-list">
          {queue.map((track, index) => (
            <li
              key={track.id}
              className={index === currentIndex ? "active" : ""}
              onClick={() => setNewQueue(queue, index)}
            >
              <img
                src={track.cover_url || "/covers/default.jpg"}
                alt={track.title}
              />
              <div>
                <div className="title">{track.title}</div>
                <div className="artist">
                  {track.artist || "Unknown Artist"}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
