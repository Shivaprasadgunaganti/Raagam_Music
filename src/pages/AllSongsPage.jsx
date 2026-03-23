import React from "react";
import { useNavigate } from "react-router-dom";
import useTracks from "../hooks/useTracks";
import { Card } from "react-bootstrap";
import "../components/collection.css";

export default function AllSongsPage() {
  const { tracks, loading } = useTracks();
  const nav = useNavigate();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading songs…</div>;
  }

  return (
    <main style={{ padding: 20 }}>
      {/* HEADER */}
      <header style={{ marginBottom: 16 }}>
        <button onClick={() => nav(-1)}>← Back</button>
        <h2 style={{ marginTop: 8 }}>All Songs</h2>
        <p style={{ opacity: 0.7 }}>{tracks.length} songs</p>
      </header>

      {/* GRID */}
      <div className="music-grid">
        {tracks.map((t) => (
          <Card
            key={t.id}
            className="music-card"
            onClick={() => nav(`/track/${t.id}`)}
          >
            <div className="music-card-cover">
              <Card.Img
                className="music-card-img"
                src={t.cover_url || "/covers/default.jpg"}
              />
            </div>

            <Card.Body className="music-card-body">
              <h2 className="music-card-title-below">{t.title}</h2>
              <p className="music-card-artist-below">
                {t.artist || "Unknown Artist"}
              </p>
            </Card.Body>
          </Card>
        ))}
      </div>
    </main>
  );
}
