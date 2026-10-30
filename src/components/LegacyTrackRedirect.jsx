// Old URLs looked like /track/57. They now live at /song/<title>-57.
// Prerendered redirect pages already cover every song that existed at build
// time; this component covers anything newer and in-app navigation.
import React from "react";
import { Navigate, useParams } from "react-router-dom";
import useTracks from "../hooks/useTracks";
import SEO from "./SEO";
import { trackPath } from "../utils/slug";

export default function LegacyTrackRedirect() {
  const { id } = useParams();
  const { tracks, loading } = useTracks();

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  const track = tracks.find((t) => String(t.id) === String(id));

  if (!track) {
    return (
      <div style={{ padding: 20 }}>
        <SEO
          title="Song not found | MyRaagam"
          description="This song could not be found on MyRaagam."
          robots="noindex, follow"
        />
        Track not found.
      </div>
    );
  }

  return <Navigate to={trackPath(track)} replace />;
}
