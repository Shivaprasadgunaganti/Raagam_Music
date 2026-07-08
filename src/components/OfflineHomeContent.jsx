// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getAllCachedTracks } from "../utils/offlineCache";
// import { useAudio } from "../context/AudioContext";
// import LazyImage from "./LazyImage";


// export default function OfflineHomeContent() {
//     const nav = useNavigate();
// const { setNewQueue } = useAudio();

// const [songs, setSongs] = useState([]);
// const [loading, setLoading] = useState(true);

// useEffect(() => {
//   async function loadSongs() {
//     try {
//       const tracks = await getAllCachedTracks();

//       tracks.sort((a, b) => b.cachedAt - a.cachedAt);

//       setSongs(tracks.slice(0, 6));
//     } catch (err) {
//       console.error("Offline songs:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   loadSongs();
// }, []);
//   return (
//     <main>
//         <div className="offline-section-header">
//   <h3>Offline Songs</h3>

//   <button onClick={() => nav("/offline")}>
//     See all
//   </button>
// </div>
//         <div className="horizontal-row">
//   {songs.map((track, index) => (
//     <div
//       key={track.id}
//       className="album-card"
//       onClick={() => setNewQueue(songs, index)}
//     >
//       <div className="album-img-shell">
//         <LazyImage
//           src={track.cover_url || "/covers/default.jpg"}
//           alt={track.title}
//         />
//       </div>

//       <div className="album-title">
//         {track.title}
//       </div>
//     </div>
//   ))}
// </div>
//     </main>
//     // <main className="homepage page-safe">
//     //   <div className="offline-home">
//     //     <h2>You're offline</h2>
//     //     <p>Showing your downloaded music and cached content.</p>

//     //     {/* We'll add Offline Songs, Cached Playlists, etc. in the next step */}
//     //   </div>
//     // </main>
//   );
// }



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import LazyImage from "./LazyImage";
import "./OfflineHomeContent.css";
import {
  getAllCachedTracks,
  getPlaylists,
  getLikedTrackIds,
} from "../utils/offlineCache";

export default function OfflineHomeContent() {
  const nav = useNavigate();
  const { setNewQueue } = useAudio();

  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOfflineData() {
      try {
        setLoading(true);

        const [cachedSongs, cachedPlaylists, cachedLiked] =
          await Promise.all([
            getAllCachedTracks(),
            getPlaylists(),
            getLikedTrackIds(),
          ]);

        cachedSongs.sort((a, b) => b.cachedAt - a.cachedAt);

        setSongs(cachedSongs.slice(0, 6));
        setPlaylists(cachedPlaylists || []);
        setLikedIds(cachedLiked || []);
      } catch (err) {
        console.error("Offline dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOfflineData();
  }, []);

  const playSong = (index) => {
    setNewQueue(songs, index);
  };

  const getPlaylistCover = (playlist) => {
    if (!playlist.playlist_tracks) {
      return "/covers/default.jpg";
    }

    const firstCover = playlist.playlist_tracks.find(
      (track) => track?.tracks?.cover_url
    );

    return firstCover?.tracks?.cover_url || "/covers/default.jpg";
  };

  if (loading) {
    return (
      <main className="offline-home">
        <h2>Loading offline library...</h2>
      </main>
    );
  }

  return (
    // <main className="offline-home">
    //   {/* Header */}

    //   <section>
    //     <h2>📶 You're Offline</h2>

    //     <p>
    //       Showing your downloaded music and cached library.
    //     </p>
    //   </section>

    //   <hr />

    //   {/* Offline Songs */}

    //   <section>
    //     <div
    //       style={{
    //         display: "flex",
    //         justifyContent: "space-between",
    //         alignItems: "center",
    //       }}
    //     >
    //       <h3>Offline Songs</h3>

    //       <button onClick={() => nav("/offline")}>
    //         See all
    //       </button>
    //     </div>

    //     {songs.length === 0 ? (
    //       <p>No offline songs available.</p>
    //     ) : (
    //       <div
    //         style={{
    //           display: "flex",
    //           gap: "16px",
    //           overflowX: "auto",
    //         }}
    //       >
    //         {songs.map((track, index) => (
    //           <div
    //             key={track.id}
    //             style={{
    //               cursor: "pointer",
    //               minWidth: "120px",
    //             }}
    //             onClick={() => playSong(index)}
    //           >
    //             <LazyImage
    //               src={
    //                 track.cover_url ||
    //                 "/covers/default.jpg"
    //               }
    //               alt={track.title}
    //             />

    //             <p>{track.title}</p>

    //             <small>
    //               {track.artist || "Unknown Artist"}
    //             </small>
    //           </div>
    //         ))}
    //       </div>
    //     )}
    //   </section>

    //   <hr />

    //   {/* Liked Songs */}

    //   <section>
    //     <h3>Liked Songs</h3>

    //     <div
    //       style={{
    //         cursor: "pointer",
    //       }}
    //       onClick={() => nav("/liked")}
    //     >
    //       <p>❤️ {likedIds.length} liked songs</p>

    //       <small>
    //         View your cached favourites
    //       </small>
    //     </div>
    //   </section>

    //   <hr />

    //   {/* Cached Playlists */}

    //   <section>
    //     <div
    //       style={{
    //         display: "flex",
    //         justifyContent: "space-between",
    //         alignItems: "center",
    //       }}
    //     >
    //       <h3>Cached Playlists</h3>

    //       <button
    //         onClick={() => nav("/playlists")}
    //       >
    //         See all
    //       </button>
    //     </div>

    //     {playlists.length === 0 ? (
    //       <p>No cached playlists.</p>
    //     ) : (
    //       <div
    //         style={{
    //           display: "flex",
    //           gap: "16px",
    //           overflowX: "auto",
    //         }}
    //       >
    //         {playlists.map((playlist) => (
    //           <div
    //             key={playlist.id}
    //             style={{
    //               cursor: "pointer",
    //               minWidth: "140px",
    //             }}
    //             onClick={() =>
    //               nav(`/playlist/${playlist.id}`)
    //             }
    //           >
    //             <LazyImage
    //               src={getPlaylistCover(playlist)}
    //               alt={playlist.name}
    //             />

    //             <p>{playlist.name}</p>

    //             <small>
    //               {playlist.playlist_tracks?.length || 0} songs
    //             </small>
    //           </div>
    //         ))}
    //       </div>
    //     )}
    //   </section>

    //   <hr />

    //   {/* Footer */}

    //   <section>
    //     <p>
    //       Connect to the internet to discover
    //       recommendations, search for songs and sync
    //       your latest playlists.
    //     </p>
    //   </section>
    // </main>
    <main className="offline-home">
  <section className="offline-hero">
    <h2>📶 You're Offline</h2>
    <p>Showing your downloaded music and cached library.</p>
  </section>

  <hr />

  <section>
    <div className="section-row-header">
      <h3>Offline Songs</h3>
      <button onClick={() => nav("/offline")}>See all</button>
    </div>

    {songs.length === 0 ? (
      <p className="offline-empty">No offline songs available.</p>
    ) : (
      <div className="horizontal-row">
        {songs.map((track, index) => (
          <div
            key={track.id}
            className="album-card"
            onClick={() => playSong(index)}
          >
            <div className="album-img-shell">
              <LazyImage
                src={track.cover_url || "/covers/default.jpg"}
                alt={track.title}
              />
            </div>
            <p className="album-title">{track.title}</p>
            <small className="album-subtitle">
              {track.artist || "Unknown Artist"}
            </small>
          </div>
        ))}
      </div>
    )}
  </section>

  <hr />

  <section>
    <h3>Liked Songs</h3>
    <div className="liked-songs-card" onClick={() => nav("/liked")}>
      <p>❤️ {likedIds.length} liked songs</p>
      <small>View your cached favourites</small>
    </div>
  </section>

  <hr />

  <section>
    <div className="section-row-header">
      <h3>Cached Playlists</h3>
      <button onClick={() => nav("/playlists")}>See all</button>
    </div>

    {playlists.length === 0 ? (
      <p className="offline-empty">No cached playlists.</p>
    ) : (
      <div className="horizontal-row">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="playlist-card"
            onClick={() => nav(`/playlist/${playlist.id}`)}
          >
            <div className="playlist-cover">
              <LazyImage src={getPlaylistCover(playlist)} alt={playlist.name} />
            </div>
            <p className="playlist-title">{playlist.name}</p>
            <small className="album-subtitle">
              {playlist.playlist_tracks?.length || 0} songs
            </small>
          </div>
        ))}
      </div>
    )}
  </section>

  <hr />

  <section className="offline-footer">
    <p>
      Connect to the internet to discover recommendations, search for songs
      and sync your latest playlists.
    </p>
  </section>
</main>
  );
}