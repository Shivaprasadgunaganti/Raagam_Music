// // //own
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAudio } from "../context/AudioContext";
import "./movieSongs.css";
import { FaShuffle } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import PlaylistPicker from "./PlaylistPicker";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
import { FaHeart } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { useLikes } from "../context/LikeContext";
import { getLikedSongsMap } from "../utils/likeHelpers";
import { useToast } from "../context/ToastContext";
import ColorThief from "color-thief-browser";
import { HiMiniPlay } from "react-icons/hi2";
import { MdOutlineQueueMusic, MdQueue } from "react-icons/md";
import { PiPlaylistFill } from "react-icons/pi";
import SEO from "./SEO";
import { useAuth } from "../context/AuthContext";

export default function MovieSongsPage() {
  const { movieId } = useParams();
  const {
    playAll,
    shufflePlay,
    setNewQueue,
    currentTrack,
    playNextInsert,
    addToQueue,
  } = useAudio();

  const [movie, setMovie] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  // const [snack, setSnack] = useState(false);
  const [snack, setSnack] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  // const [pickerTrackId, setPickerTrackId] = useState(null);
  const [pickerTrack, setPickerTrack] = useState(null);
  const { showToast } = useToast();
  const [bgColor, setBgColor] = useState("#2a2a2a");
  const { isGuest } = useAuth();

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase
        .from("movies")
        .select("*")
        .eq("id", movieId)
        .single();

      const { data: s } = await supabase
        .from("tracks")
        .select("*")
        .eq("movie_id", movieId)
        .order("id");

      setMovie(m);
      setSongs(s || []);
      setLoading(false);
    }

    load();
  }, [movieId]);

  useEffect(() => {
    if (!movie?.cover_url) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = movie.cover_url;

    img.onload = () => {
      const colorThief = new ColorThief();
      const rgb = colorThief.getColor(img);

      setBgColor(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
    };
  }, [movie]);

  useEffect(() => {
    async function loadLikes() {
      const map = await getLikedSongsMap();
      setLikedMap(map);
    }

    loadLikes();
  }, [songs]);

  function showSnack(msg) {
    setSnack(msg);
    setTimeout(() => setSnack(""), 2500);
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (!movie) return <div>Movie not found</div>;

  // seo

  //   const movieTitle = movie.title || "Movie";

  // const movieUrl = `https://www.myraagam.com/movie/${movie.id}`;

  // const movieDescription =
  //   songs.length > 0
  //     ? `Listen to ${songs.length} songs from ${movieTitle} on MyRaagam.`
  //     : `Explore ${movieTitle} on MyRaagam.`;

  // const movieJsonLd = {
  //   "@context": "https://schema.org",
  //   "@type": "Movie",
  //   name: movieTitle,
  //   url: movieUrl,
  //   image: movie.cover_url || undefined,
  //   dateCreated: movie.year
  //     ? `${movie.year}-01-01`
  //     : undefined,
  // };

  const movieTitle = movie.title || "Movie";

  const movieUrl = `https://www.myraagam.com/movie/${movie.id}`;

  // const movieDescription =
  //   songs.length > 0
  //     ? `Listen to ${songs.length} songs from ${movieTitle} on MyRaagam.`
  //     : `Explore ${movieTitle} on MyRaagam.`;

  const movieDescription =
  songs.length > 0
    ? `Listen to ${movieTitle} Telugu movie songs on MyRaagam. Explore ${songs.length} songs from the movie and play them online.`
    : `Explore ${movieTitle} Telugu movie songs and soundtrack on MyRaagam.`;

  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movieTitle,
    url: movieUrl,
    image: movie.cover_url || undefined,
  };

  return (
    <main className="songspage-main">
      {/* seo */}
      {/* <SEO
  title={`${movieTitle} Songs | MyRaagam`}
  description={movieDescription}
  image={movie.cover_url}
  url={movieUrl}
  type="video.movie"
  jsonLd={movieJsonLd}
/> */}

      <SEO
        // title={`${movieTitle} Songs | MyRaagam`}
          title={`${movieTitle} Telugu Movie Songs | MyRaagam`}
        description={movieDescription}
        image={movie.cover_url}
        url={movieUrl}
        type="video.movie"
        jsonLd={movieJsonLd}
      />
      {/* <div className="sp-album"> */}
      <div className="sp-album" style={{ "--background-color": bgColor }}>
        <button className="sp-back-btn" onClick={() => nav("/")}>
          {" "}
          <IoArrowBack />
        </button>

        {/* <img src={movie.cover_url} alt={movie.title} /> */}
        <img
          src={movie.cover_url}
          loading="eager"
          fetchPriority="high"
          alt={movie.title}
        />
        <div className="sp-album-section">
          <h1>{movie.title}</h1>
          <p>
            {movie.year} • {songs.length} songs
          </p>
          <div className="sp-album-play">
            <button
              className="sp-album-shuffle-btn"
              onClick={() => shufflePlay(songs)}
            >
              <FaShuffle />
            </button>
            <button
              className="sp-album-play-btn"
              onClick={() => playAll(songs)}
            >
              <FaPlay />
            </button>
          </div>
        </div>
      </div>
      <div className="sp-album-list">
        {songs.map((song, index) => {
          const isActive = currentTrack?.id === song.id;
          return (
            <div
              key={song.id}
              className={`sp-album-row ${isActive ? "active" : ""}`}
            >
              <div
                className="sp-row-main"
                onClick={() => setNewQueue(songs, index)}
              >
                {/* <div className="sp-song-meta">
               
                  <p className="sp-song-title">{song.title}</p>
                  
                  <p className="sp-song-artist">
                    {song.artist || "Unknown Artist"}
                  </p>
                </div> */}
                <div className="sp-song-meta">
  <div className="sp-song-title-row">
    <p className="sp-song-title">{song.title}</p>

    {isActive && (
      <div className="playing-bars">
        <span />
        <span />
        <span />
      </div>
    )}
  </div>

  <p className="sp-song-artist">
    {song.artist || "Unknown Artist"}
  </p>
</div>

              </div>
              {/* Like/Unlike button */}
              <button
                className="liked-heart-btn"
                onClick={async (e) => {
                  e.stopPropagation();

                  if (likedMap[song.id]) {
                    await unlikeSong(song.id);
                    setLikedMap((prev) => ({ ...prev, [song.id]: false }));
                    showToast("Removed from Liked Songs");
                    // } else {
                    //   await likeSong(song);
                    //   setLikedMap((prev) => ({ ...prev, [song.id]: true }));
                    //   showToast("Added to Liked Songs");
                    // }
                  } else {
                    const result = await likeSong(song);

                    if (result?.guest) {
                      showToast("Sign in to add songs to your Liked Songs");
                      return;
                    }

                    if (result?.error) {
                      showToast("Unable to add song to Liked Songs");
                      return;
                    }

                    setLikedMap((prev) => ({ ...prev, [song.id]: true }));
                    showToast("Added to Liked Songs");
                  }
                }}
              >
                {likedMap[song.id] ? (
                  <FaHeart color="var(--accent-purple)" />
                  // <FaHeart color="#1db954" />
                ) : (
                  <FaRegHeart color="var(--accent-purple)"/>
                )}
              </button>

              <button
                className="sp-row-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSong(song);
                }}
              >
                ⋮
              </button>
            </div>
          );
        })}
      </div>
      {snack && <div className="sp-snackbar">Song {snack}</div>}

      {selectedSong && (
        <div
          className="song-menu-overlay"
          onClick={() => setSelectedSong(null)}
        >
          <div className="song-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-song-info">
              <img
                src={selectedSong.cover_url || "/covers/default.jpg"}
                alt={selectedSong.title}
                className="sheet-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div>
                <div className="sheet-title">{selectedSong.title}</div>
                <div className="sheet-artist">
                  {selectedSong.artist || "Unknown Artist"}
                </div>
              </div>
            </div>

            <div className="sheet-divider" />

            {/* <button
              onClick={() => {
                addToQueue(selectedSong);
                setSelectedSong(null);
                // showSnack("Added to queue");
                showToast("Added to Queue");
              }}
            >
              ➕ Add to Queue
            </button>

            <button
              onClick={() => {
                playNextInsert(selectedSong);
                setSelectedSong(null);
                // showSnack("Added to Play Next");
                showToast("Added to Play Next");
              }}
            >
              ▶ Play Next
            </button>

            <button
              onClick={() => {
                setSelectedSong(null);
                nav("/queue");
              }}
            >
              🎵 View Queue
            </button>

            <button
              onClick={() => {
                // setPickerTrackId(selectedSong.id); 
                setPickerTrack(selectedSong);

                setSelectedSong(null);
                setShowPicker(true);
              }}
            >
              📂 Add to Playlist
            </button> */}
            <button
              onClick={() => {
                playNextInsert(selectedSong);
                setSelectedSong(null);
                showToast("Added to Play Next");
              }}
            >
              <span className="sheet-icon">
                <HiMiniPlay />
              </span>{" "}
              Play Next
              {/* <span className="sheet-icon"><FaPlay/></span> Play Next */}
            </button>
            <button
              onClick={() => {
                setSelectedSong(null);
                nav("/queue");
              }}
            >
              <span className="sheet-icon">
                <MdOutlineQueueMusic />
              </span>{" "}
              View Queue
              {/* <span className="sheet-icon">🎵</span> View Queue */}
            </button>
            <button
              onClick={() => {
                addToQueue(selectedSong);
                setSelectedSong(null);
                showToast("Added to Queue");
              }}
            >
              {/* <span className="sheet-icon">➕</span> Add to Queue */}
              <span className="sheet-icon">
                <MdQueue />
              </span>{" "}
              Add to Queue
            </button>

            {/* <button
              onClick={() => {
                setPickerTrack(selectedSong);
                setSelectedSong(null);
                setShowPicker(true);
              }}
            >
              <span className="sheet-icon">
                <PiPlaylistFill />
              </span>{" "}
              Add to Playlist
            </button> */}
            <button
  onClick={() => {
    if (isGuest) {
      setSelectedSong(null);
      showToast("Sign in to create and manage your playlists");
      return;
    }

    setPickerTrack(selectedSong);
    setSelectedSong(null);
    setShowPicker(true);
  }}
>
  <span className="sheet-icon">
    <PiPlaylistFill />
  </span>{" "}
  Add to Playlist
</button>
          </div>
        </div>
      )}

      {showPicker && (
        // <PlaylistPicker
        //   trackId={pickerTrackId}
        <PlaylistPicker
          // track={selectedSong}
          track={pickerTrack}
          // onClose={() => {
          //   setShowPicker(false);
          //   setPickerTrackId(null);
          // }}
          onClose={(status) => {
            setShowPicker(false);
            // setPickerTrackId(null);
            setPickerTrack(null);

            if (status === "added") {
              // showSnack("added to playlist");
              showToast("Added to Playlist");
            } else if (status === "exists") {
              // showSnack("already in playlist");
              showToast("Already in  Playlist");
            }
          }}
        />
      )}
    </main>
  );
}
