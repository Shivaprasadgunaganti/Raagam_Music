import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "./playlists.css";
import useOfflineMode from "../hooks/useOfflineMode";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

import {
  savePlaylists,
  clearPlaylists,
  getPlaylists,
  savePlaylistTracks,
  clearPlaylistTracks,
  getPlaylistById,
  getPlaylistTracksByPlaylistId,
} from "../utils/offlineCache";
import { useToast } from "../context/ToastContext";
import SEO from "./SEO";


export default function PlaylistsPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useOfflineMode();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [renamePlaylist, setRenamePlaylist] = useState(null);
  const [deletePlaylist, setDeletePlaylist] = useState(null);
  const [renameText, setRenameText] = useState("");
  const { showToast } = useToast();

  // ✅ Helper to get covers
  // const getPlaylistCovers = (playlist) => {
  //   if (!playlist.playlist_tracks) return [];

  //   return playlist.playlist_tracks
  //     .slice(0, 4)
  //     .map((pt) => pt.tracks?.cover_url)
  //     .filter(Boolean);
  // };
  const getPlaylistCovers = (playlist) => {
    if (!playlist.playlist_tracks) return [];

    return playlist.playlist_tracks
      .slice(0, 4)
      .map((pt) => pt.track?.cover_url)
      .filter(Boolean);

      
  };

  const loadOnlinePlaylists = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("playlists")
      // .select(
      //   `
      //   id,
      //   name,
      //   description,
      //   playlist_tracks (
      //     track_id,
      //     tracks (cover_url)
      //   )
      // `
      // )

      .select(
        `
  id,
  name,
  description,
  playlist_tracks (
    id,
    playlist_id,
    track_id,
    position,
    track:tracks (
      id,
      title,
      artist,
      cover_url,
      external_url,
      storage_path,
      movie_id
    )
  )
`,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPlaylists(data || []);

      // Offline snapshot
      await clearPlaylists();
      await savePlaylists(data || []);
      const allPlaylistTracks = (data || []).flatMap(
        (playlist) => playlist.playlist_tracks || [],
      );

      await clearPlaylistTracks();
      await savePlaylistTracks(allPlaylistTracks);
    }

    setLoading(false);
  };

  const loadOfflinePlaylists = async () => {
    setLoading(true);

    try {
      const data = await getPlaylists();

      setPlaylists(data || []);
    } catch (err) {
      console.error(err);

      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline) {
      loadOnlinePlaylists();
    } else {
      loadOfflinePlaylists();
    }
  }, [user, isOnline]);

  // ✅ Load playlists with tracks
  // useEffect(() => {
  //   const loadPlaylists = async () => {
  //     if (!user) return;

  //     setLoading(true);

  //     const { data, error } = await supabase
  //       .from("playlists")
  //       .select(
  //         `
  //         id,
  //         name,
  //         description,
  //         playlist_tracks (
  //           track_id,
  //           tracks (cover_url)
  //         )
  //       `,
  //       )
  //       .eq("user_id", user.id)
  //       .order("created_at", { ascending: false });

  //     if (error) {
  //       console.error(error);
  //     } else {
  //       setPlaylists(data || []);
  //     }

  //     setLoading(false);
  //   };

  //   loadPlaylists();
  // }, [user]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  const renameCurrentPlaylist = async () => {
    const newName = renameText.trim();

    if (!newName) {
      alert("Playlist name cannot be empty.");
      return;
    }

    try {
      const { error } = await supabase
        .from("playlists")
        .update({
          name: newName,
        })
        .eq("id", renamePlaylist.id);

      if (error) {
        console.error(error);
        alert("Unable to rename playlist.");
        return;
      }

      // Update UI immediately
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === renamePlaylist.id
            ? {
                ...playlist,
                name: newName,
              }
            : playlist,
        ),
      );

      // Refresh offline snapshot
      const updatedPlaylists = playlists.map((playlist) =>
        playlist.id === renamePlaylist.id
          ? {
              ...playlist,
              name: newName,
            }
          : playlist,
      );

      await clearPlaylists();
      await savePlaylists(updatedPlaylists);

      setRenamePlaylist(null);
      setRenameText("");

      // We'll replace this with Toast later
      // alert("Playlist renamed successfully.");
      showToast("Playlist renamed");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCurrentPlaylist = async () => {
    if (!deletePlaylist) return;

    try {
      // Delete child rows first
      const { error: tracksError } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", deletePlaylist.id);

      if (tracksError) {
        console.error(tracksError);
        showToast("Unable to delete playlist");
        return;
      }

      // Delete playlist
      const { error: playlistError } = await supabase
        .from("playlists")
        .delete()
        .eq("id", deletePlaylist.id);

      if (playlistError) {
        console.error(playlistError);
        showToast("Unable to delete playlist");
        return;
      }

      // Update UI immediately
      const updatedPlaylists = playlists.filter(
        (p) => p.id !== deletePlaylist.id,
      );

      setPlaylists(updatedPlaylists);

      // Refresh offline cache
      await clearPlaylists();
      await savePlaylists(updatedPlaylists);

      const updatedPlaylistTracks = updatedPlaylists.flatMap(
        (playlist) => playlist.playlist_tracks || [],
      );

      await clearPlaylistTracks();
      await savePlaylistTracks(updatedPlaylistTracks);

      showToast("Playlist deleted");

      setDeletePlaylist(null);
    } catch (err) {
      console.error(err);
      showToast("Something went wrong");
    }
  };

  return (
    <main className="playlists-page">
{/* seo */}
 <SEO
      title="Your Playlists | MyRaagam"
      description="Manage your personal playlists on MyRaagam."
      robots="noindex, nofollow"
    />

      <h1>Your Playlists</h1>

      {playlists.length === 0 && <p>No playlists created</p>}

      <div className="playlists-grid">
        {playlists.map((pl) => {
          const covers = getPlaylistCovers(pl);

          return (
            <div
              key={pl.id}
              className="playlist-card"
              onClick={() => nav(`/playlist/${pl.id}`)}
            >
              <div className="playlist-cover">
                {covers.length > 0 ? (
                  <div className={`playlist-cover-grid count-${covers.length}`}>
                    {covers.map((c, i) => (
                      <img key={i} src={c} alt="cover" />
                    ))}
                  </div>
                ) : (
                  <img src="/covers/default.jpg" alt={pl.name} />
                )}
              </div>

              {/* <div className="playlist-info">
                <h3>{pl.name}</h3>
                <p>{pl.description || "Playlist"}</p>
              </div> */}

              <div className="playlist-info">
                <div className="playlist-actions">
                  {/* <button
                    className="playlist-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();

                      setActiveMenu(activeMenu === pl.id ? null : pl.id);
                    }}
                  >
                    <FiMoreVertical />
                  </button> */}
                 <div
                    className="playlist-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();

                      setActiveMenu(activeMenu === pl.id ? null : pl.id);
                    }}
                  >
                    <FiMoreVertical />
                  
                  </div>

                  {activeMenu === pl.id && (
                    <div
                      className="playlist-menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        // onClick={() => {
                        //   setRenamePlaylist(pl);
                        //   setActiveMenu(null);
                        // }}
                        onClick={() => {
                          setRenamePlaylist(pl);
                          setRenameText(pl.name);
                          setActiveMenu(null);
                        }}
                      >
                        <FiEdit2 />
                        Rename
                      </button>

                      <button
                        className="danger"
                        onClick={() => {
                          setDeletePlaylist(pl);
                          setActiveMenu(null);
                        }}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <h3>{pl.name}</h3>

                <p>{pl.description || "Playlist"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {renamePlaylist && (
        <div className="modal-overlay" onClick={() => setRenamePlaylist(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Rename Playlist</h3>

            {/* <input
        defaultValue={renamePlaylist.name}
      /> */}

            <input
              type="text"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              placeholder="Playlist name"
            />

            <div className="modal-actions">
              <button
                // onClick={() => setRenamePlaylist(null)}
                onClick={() => {
                  setRenamePlaylist(null);
                  setRenameText("");
                }}
              >
                Cancel
              </button>

              {/* <button>
          Save
        </button> */}
              <button onClick={renameCurrentPlaylist}>Save</button>
            </div>
          </div>
        </div>
      )}
      {deletePlaylist && (
        <div className="modal-overlay" onClick={() => setDeletePlaylist(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            {/* <h3>Delete Playlist?</h3>
             */}
            <h3>Delete "{deletePlaylist?.name}"?</h3>

            {/* <p>This action cannot be undone.</p>
             */}
            <p>
              This playlist and all of its songs will be removed. This action
              cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                // onClick={() => setDeletePlaylist(null)}
                onClick={() => {
                  setDeletePlaylist(null);
                }}
              >
                Cancel
              </button>

              {/* <button className="danger">Delete</button>
               */}
              <button className="danger" onClick={deleteCurrentPlaylist}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>

  );
}
