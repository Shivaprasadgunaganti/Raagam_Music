// src/components/CollectionPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import useTracks from "../hooks/useTracks";
import useRecent from "../hooks/useRecent";
import "./collection.css";
import { likeSong, unlikeSong, isSongLiked } from "../utils/likeHelpers";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LazyImage from "../components/LazyImage";
import SkeletonCard from "../components/SkeletonCard";
import { FiSearch } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoIosShuffle } from "react-icons/io";

import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import AuthRequiredModal from "./AuthRequiredModal";

export default function CollectionPage() {
  const { tracks, loading } = useTracks();
  const { recent } = useRecent();
  const nav = useNavigate();
  const { playAll, shufflePlay, setNewQueue, setResumeTime } = useAudio();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [likedMap, setLikedMap] = useState({});
  const [movies, setMovies] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [continueTracks, setContinueTracks] = useState([]);
  const [activeTab, setActiveTab] = useState("continue");
  // const [heroIndex, setHeroIndex] = useState(() =>
  //   Math.floor(Math.random() * 2),
  // );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  const [displayName, setDisplayName] = useState("");

  // const username =
  //   user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  const { isGuest } = useAuth();

  const username = displayName || user?.email?.split("@")[0] || "Listener";
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!tracks?.length) return;
    tracks.forEach((t) => {
      isSongLiked(t.id).then((liked) => {
        setLikedMap((prev) => ({ ...prev, [t.id]: liked }));
      });
    });
  }, [tracks]);

  // useEffect(() => {
  //   async function loadMovies() {
  //     const { data } = await supabase
  //       .from("movies")
  //       .select("id, title, cover_url")
  //       .order("id", { ascending: false })
  //       .limit(8);

  //     setMovies(data || []);
  //   }

  //   loadMovies();
  // }, []);

  useEffect(() => {
    async function loadMovies() {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, cover_url")
        .order("id", { ascending: false })
        .limit(8);

      console.log("MOVIES DATA:", data);
      console.log("MOVIES ERROR:", error);

      setMovies(data || []);
    }

    loadMovies();
  }, []);

  const loadPlaylists = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id,
        name,
        playlist_tracks (
          track_id,
          tracks (cover_url)
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch playlist error:", error);
      return;
    }

    setPlaylists(data || []);
  };

  useEffect(() => {
    loadPlaylists();
  }, [user]);

  const fetchContinueListening = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("continue_listening")
      .select("track_id, last_position, duration, tracks(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.log(error);
      return;
    }

    setContinueTracks(data || []);
  };

  useEffect(() => {
    fetchContinueListening();
  }, [user]);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles_data")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setDisplayName(data.display_name || "");
      }
    }

    loadProfile();
  }, [user]);

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;

    const { error } = await supabase.from("playlists").insert({
      name: newPlaylistName.trim(),
      user_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        alert("Playlist with this name already exists!");
      } else {
        console.log("Error creating playlist:", error);
      }
      return;
    }

    setNewPlaylistName("");
    loadPlaylists();
    showToast("Playlist created");
  };

  // const playFromContinue = (track, startTime) => {
  //    console.log("CONTINUE TRACK", track);
  // console.log("START TIME", startTime);
  //   if (!track) return;
  //   setResumeTime(startTime || 0);
  //   setNewQueue(
  //     recent,
  //     recent.findIndex((t) => t.id === track.id),
  //   );
  // };

  const playFromContinue = (track, startTime) => {
  if (!track) return;

  setResumeTime(startTime || 0);

  setNewQueue([track], 0);
};

  const addToLiked = (e, trackId) => {
    e.stopPropagation();
    if (likedMap[trackId]) {
      unlikeSong(trackId);
    } else {
      likeSong(trackId);
    }
    setLikedMap((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const getPlaylistCovers = (playlist) => {
    if (!playlist.playlist_tracks) return [];
    return playlist.playlist_tracks
      .slice(0, 4)
      .map((pt) => pt.tracks?.cover_url)
      .filter(Boolean);
  };

  const recentList = useMemo(() => {
    return recent.slice(0, 8).map((track, index) => ({
      ...track,
      index,
    }));
  }, [recent]);

  const trendingTracks = useMemo(() => {
    if (!tracks?.length) return [];
    const sorted = [...tracks].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    const latest = sorted.slice(0, 20);
    return latest.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [tracks]);

  const madeForYou = useMemo(() => {
    if (!tracks?.length) return [];

    const recentArtists = recent.map((t) => t.artist).filter(Boolean);
    const likedIds = Object.keys(likedMap).filter((id) => likedMap[id]);
    const likedTracks = tracks.filter((t) => likedIds.includes(String(t.id)));
    const likedArtists = likedTracks.map((t) => t.artist).filter(Boolean);

    const favoriteArtists = [...new Set([...recentArtists, ...likedArtists])];

    const recommended = tracks.filter((track) =>
      favoriteArtists.includes(track.artist),
    );

    const recentIds = recent.map((t) => t.id);

    return recommended
      .filter((t) => !recentIds.includes(t.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  }, [tracks, recent, likedMap]);

  const filtered = useMemo(() => {
    if (!debounced) return tracks || [];
    const q = debounced.toLowerCase();
    return (tracks || []).filter((t) => {
      const title = (t.title || "").toLowerCase();
      const artist = (t.artist || "").toLowerCase();
      return title.includes(q) || artist.includes(q);
    });
  }, [tracks, debounced]);

  // const heroSlides = useMemo(() => {
  //   const base = [trendingTracks[0], madeForYou[0]].filter(Boolean);
  //   return base.slice(0, 2).map((track, index) => ({
  //     id: track.id,
  //     title: track.title,
  //     artist: track.artist || "Unknown Artist",
  //     description: "A fresh pick based on your recent listening.",
  //     image: track.cover_url || "/covers/default.jpg",
  //     onClick: () => setNewQueue(base, index),
  //   }));
  // }, [trendingTracks, madeForYou, setNewQueue]);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const heroSlides = useMemo(() => {
    const hour = new Date().getHours();

    let timeGreeting, timeMood;
    if (hour >= 5 && hour < 12) {
      timeGreeting = "Start your morning right";
      timeMood = "Morning Boost";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Power through your afternoon";
      timeMood = "Midday Energy";
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = "Wind down your evening";
      timeMood = "Evening Unwind";
    } else {
      timeGreeting = "Perfect for the night";
      timeMood = "Late Night Chill";
    }

    // Slide 3 — first letter of email matched tracks
    const emailInitial = user?.email?.[0]?.toLowerCase() || "";
    const matchedTracks = tracks.filter((t) =>
      t.title?.toLowerCase().startsWith(emailInitial),
    );
    const slide3Tracks = matchedTracks.length > 0 ? matchedTracks : tracks;
    const slide3Title =
      matchedTracks.length > 0
        ? `Tracks starting with "${emailInitial.toUpperCase()}"`
        : "Albums picked for you";

    return [
      {
        id: "slide-time",
        type: "time",
        title: timeGreeting,
        // artist: timeMood,
        description: "Browse songs that match your current vibe.",
        // image: trendingTracks[0]?.cover_url || "/covers/default.jpg",
        badge: timeMood,
        // onClick: () => nav("/all-songs"),
        onClick: () => shufflePlay(filtered),
      },
      {
        id: "slide-playlist",
        type: "playlist",
        title: "Build your perfect playlist",
        // artist: "Create · Customize",
        description: "Mix your favourite tracks into one place.",
        image:
          movies[0]?.cover_url ||
          trendingTracks[1]?.cover_url ||
          "/covers/default.jpg",
        badge: "FOR YOU",
        onClick: () => setShowPlaylistModal(true),
      },
      {
        id: "slide-personal",
        type: "personal",
        title: slide3Title,
        artist: `Just for ${emailInitial.toUpperCase()}`,
        description: "Personally picked based on your initial.",
        image: slide3Tracks[0]?.cover_url || "/covers/default.jpg",
        badge: "PERSONAL",
        onClick: () => setNewQueue(slide3Tracks, 0),
      },
    ];
  }, [tracks, trendingTracks, movies, user, nav, setNewQueue]);

  const switchTabs = [
    { key: "continue", label: "Continue Listening" },
    { key: "trending", label: "Trending" },
    { key: "madeforyou", label: "Made For You" },
    { key: "recent", label: "Recently Played" },
    { key: "playlists", label: "Your Playlists" },
    // { key: "albums", label: "Albums for You" },
  ];

  // const renderSectionHeader = (title, onClick) => (
  //   <div className="section-row-header">
  //     <h3>{title}</h3>
  //     <button onClick={onClick}>See all</button>
  //   </div>
  // );

  const renderSectionHeader = (title, onClick, showButton = false) => (
    <div className="section-row-header">
      <h3>{title}</h3>

      {showButton && <button onClick={onClick}>See all</button>}
    </div>
  );

  const renderTrackRail = (items, queueSource, isContinue = false) => {
    if (!items?.length) return null;

    return (
      <div className="horizontal-row">
        {items.map((item, index) => {
          const track = isContinue ? item.tracks : item;
          if (!track) return null;

          const percent =
            isContinue && item.duration > 0
              ? (item.last_position / item.duration) * 100
              : 0;

          return (
            <div
              key={`${track.id}-${index}`}
              className="album-card"
              onClick={() =>
                isContinue
                  ? playFromContinue(track, item.last_position)
                  : setNewQueue(queueSource, index)
              }
            >
              <div className="album-img-shell">
                <LazyImage
                  src={track.cover_url || "/covers/default.jpg"}
                  alt={track.title}
                />
                {/* {isContinue && percent > 0 && (
                  <div className="card-progress overlay-progress">
                    <div
                      className="card-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )} */}
              </div>
              <div className="album-title">{track.title}</div>
              {/* <div className="album-subtitle">
                {track.artist || "Unknown Artist"}
              </div> */}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPlaylistsRail = () => {
    if (!playlists.length) return null;

    return (
      <div className="horizontal-row">
        {playlists.map((p) => {
          const covers = getPlaylistCovers(p);

          return (
            <div
              key={p.id}
              className="playlist-card"
              onClick={() => nav(`/playlist/${p.id}`)}
            >
              <div className="playlist-cover">
                {covers.length > 0 ? (
                  <div className={`playlist-cover-grid count-${covers.length}`}>
                    {covers.map((c, i) => (
                      <LazyImage key={i} src={c} alt="cover" />
                    ))}
                  </div>
                ) : (
                  <LazyImage src="/covers/default.jpg" alt={p.name} />
                )}
              </div>
              <div className="playlist-title">{p.name}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMoviesRail = () => {
    if (!movies.length) return null;

    return (
      <div className="horizontal-row">
        {movies.map((m) => (
          <div
            key={m.id}
            className="album-card"
            onClick={() => nav(`/movie/${m.id}`)}
          >
            <div className="album-img-shell">
              <LazyImage
                src={m.cover_url || "/covers/default.jpg"}
                alt={m.title}
              />
            </div>
            <div className="album-title">{m.title}</div>
            <div className="album-subtitle">{m.artist}</div>
          </div>
        ))}
      </div>
    );
  };

  // profile icon
  const userName = user?.name || "User";

  const colors = [
    "#FF8A65",
    "#4DB6AC",
    "#9575CD",
    "#64B5F6",
    "#F06292",
    "#81C784",
  ];

  const profileColor = colors[userName.length % colors.length];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "continue":
        return renderTrackRail(
          continueTracks.slice(0, 6),
          continueTracks,
          true,
        );
      case "trending":
        return renderTrackRail(trendingTracks.slice(0, 8), trendingTracks);
      case "recent":
        return renderTrackRail(recentList.slice(0, 8), recent);
      case "playlists":
        return renderPlaylistsRail();
      // case "albums":
      //   return renderMoviesRail();
      case "madeforyou":
        return renderTrackRail(madeForYou.slice(0, 8), madeForYou);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="homepage page-safe">
        <div className="loading-state">Loading tracks…</div>
      </main>
    );
  }

  return (
    <main className="homepage page-safe">
      <div className="home-bg-orb home-bg-orb-1" />
      <div className="home-bg-orb home-bg-orb-2" />

      {/* <header className="home-header">
        <div>
          <h1 className="home-title">Hi, {username}</h1>
        </div>

        <div className="home-actions">
          
          <button onClick={() => nav("/search")} aria-label="Search">
            <FiSearch />
          </button>
         
          <button
            className="profile-btn"
            onClick={() => nav("/account")}
            aria-label="Profile"
            style={{
              background: profileColor,
            }}
          >
            {userName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </button>
        </div>
      </header> */}
      <header className="home-header">
        <div className="home-left">
          <p className="home-greeting">Hi,</p>
          <h1 className="home-title">{username}</h1>
        </div>

        <div className="home-actions">
          <button
            className="icon-btn"
            onClick={() => nav("/search")}
            aria-label="Search"
          >
            <FiSearch />
          </button>

          <button
            className="profile-btn"
            // onClick={() => nav("/account")}
            onClick={() => {
              if (isGuest) {
                setShowAuthModal(true);
                return;
              }

              nav("/account");
            }}
            aria-label="Profile"
            style={{ background: profileColor }}
          >
            {username.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* {heroSlides.length > 0 && (
        <section className="home-section featured-carousel-section">
          <div className="featured-carousel-shell">
            <div
              className="featured-carousel-track"
              style={{ transform: `translateX(-${heroIndex * 100}%)` }}
            >
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="featured-slide"
                  onClick={slide.onClick}
                >
                  <div className="featured-overlay" />
                  <div className="featured-content">
                    <span className="featured-badge">{slide.badge}</span>
                    <h2>{slide.title}</h2>
                    <h4>{slide.artist}</h4>
                    <p>{slide.description}</p>
                    <div className="featured-buttons">
                      <button
                        className="play-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          slide.onClick();
                        }}
                      >
                        {slide.type === "playlist" ? "+ Create" : "▶ Play"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={heroIndex === index ? "active" : ""}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )} */}

      <section className="home-section featured-carousel-section">
        <Swiper
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          spaceBetween={16}
        >
          {/* {heroSlides.map((slide) => (
      <SwiperSlide key={slide.id}>
        <div
          className="featured-slide"
          onClick={slide.onClick}
        >
          <div className="featured-overlay" />

          <div className="featured-content">
            <span className="featured-badge">
              {slide.badge}
            </span>

            <h2>{slide.title}</h2>

            <h4>{slide.artist}</h4>

            <p>{slide.description}</p>

            <div className="featured-buttons">
              <button
                className="play-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  slide.onClick();
                }}
              >
                {slide.type === "playlist"
                  ? "+ Create"
                  : "▶ Play"}
              </button>
            </div>
          </div>
        </div>
      </SwiperSlide>
    ))} */}
          {heroSlides.length > 0 && (
            <section className="home-section featured-carousel-section">
              <Swiper
                modules={[Autoplay, Pagination, EffectCoverflow]}
                effect="coverflow"
                centeredSlides
                slidesPerView={1.1}
                spaceBetween={16}
                loop
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 120,
                  modifier: 2,
                  slideShadows: false,
                }}
              >
                {heroSlides.map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <div className="featured-slide" onClick={slide.onClick}>
                      <div className="featured-overlay" />

                      <div className="featured-content">
                        <span className="featured-badge">{slide.badge}</span>

                        <h2>{slide.title}</h2>

                        <h4>{slide.artist}</h4>

                        <p>{slide.description}</p>

                        <div className="featured-buttons">
                          <button
                            className="play-pill"
                            onClick={(e) => {
                              e.stopPropagation();
                              slide.onClick();
                            }}
                          >
                            {slide.type === "playlist" ? "+ Create" : "▶ Play"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}
        </Swiper>
      </section>

      <section className="home-section">
        <div className="switch-tabs">
          {switchTabs.map((tab) => (
            <button
              key={tab.key}
              className={`switch-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        {renderSectionHeader(
          switchTabs.find((t) => t.key === activeTab)?.label || "Browse",
          activeTab === "continue"
            ? () => nav("/continue-listening")
            : activeTab === "trending"
              ? () => nav("/trending")
              : activeTab === "recent"
                ? () => nav("/recent")
                : activeTab === "playlists"
                  ? () => nav("/playlists")
                  : () => nav("/movies"),
        )}
        {renderActiveTabContent()}
      </section>

      {/* {madeForYou.length > 0 && (
        <section className="home-section made-for-you">
          {renderSectionHeader("Made for You", () => nav("/recommended"))}
          {renderTrackRail(madeForYou.slice(0, 8), madeForYou)}
        </section>
      )} */}

      {movies.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Albums For You", () => nav("/movies"), true)}

          {renderMoviesRail()}
        </section>
      )}

      {/* {recentList.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Recently Played", () => nav("/recent"))}
          {renderTrackRail(recentList.slice(0, 8), recent)}
        </section>
      )} */}

      {recentList.length > 0 && (
        <section className="home-section recently-played-section">
          {renderSectionHeader("Recently Played", () => nav("/recent"))}

          <div className="recently-played-wrapper">
            {renderTrackRail(recentList.slice(0, 8), recent)}
          </div>
        </section>
      )}

      {/* {playlists.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Your Playlists", () => nav("/playlists"))}
          {renderPlaylistsRail()}
        </section>
      )} */}

      {/* {movies.length > 0 && (
        <section className="home-section">
          {renderSectionHeader("Albums for You", () => nav("/movies"))}
          {renderMoviesRail()}
        </section>
      )} */}

      <section className="home-section">
        {/* {renderSectionHeader("Songs", () => nav("/all-songs"))} */}

        {renderSectionHeader("Songs", () => nav("/all-songs"), true)}

        <div className="songs-list">
          {filtered.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.slice(0, 3).map((t, index) => (
                <Card
                  key={t.id}
                  className="song-list-card"
                  onClick={() => setNewQueue(filtered, index)}
                >
                  <div className="song-list-left">
                    <LazyImage
                      src={t.cover_url || "/covers/default.jpg"}
                      alt={t.title}
                      className="song-list-img"
                    />
                    <div className="song-list-meta">
                      <h4>{t.title}</h4>
                      <p>{t.artist || "Unknown Artist"}</p>
                    </div>
                  </div>

                  <div className="song-list-actions">
                    <button
                      className={`like-btn ${likedMap[t.id] ? "liked" : ""}`}
                      onClick={(e) => addToLiked(e, t.id)}
                      aria-label="Like song"
                    >
                      ♥
                    </button>
                    <button
                      className="play-inline-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewQueue(filtered, index);
                      }}
                      aria-label="Play song"
                    >
                      ▶
                    </button>
                  </div>
                </Card>
              ))}
        </div>
      </section>

      <section className="home-section utility-bar">
        {/* <div className="utility-search">
          <input
            type="text"
            placeholder="Search songs or artists"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div> */}

        <div className="utility-buttons">
          <button onClick={() => playAll(filtered)}>▶ Play All</button>
          <button onClick={() => shufflePlay(filtered)}>
             Shuffle
          </button>

          {/* <button onClick={() => shufflePlay(filtered)}>🔀 Shuffle</button> */}
          {/* <button onClick={() => shufflePlay(filtered)}><IoIosShuffle /> Shuffle</button> */}
        </div>
      </section>

      {/* <section className="home-section create-playlist-card">
        <div className="create-playlist-head">
          <h3>Create Playlist</h3>
          <p>Save your mood, mixes, and favorite tracks.</p>
        </div>

        <div className="create-playlist-form">
          <input
            type="text"
            placeholder="New Playlist Name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button onClick={createPlaylist}>Create</button>
        </div>
      </section> */}

      {showPlaylistModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPlaylistModal(false)}
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Create Playlist</h3>
            <p>Save your mood, mixes, and favourite tracks.</p>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowPlaylistModal(false)}>
                Cancel
              </button>
              <button
                className="modal-confirm"
                onClick={async () => {
                  await createPlaylist();
                  setShowPlaylistModal(false);
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to access your library"
        description="Create playlists, save favorites and manage your profile."
      />
    </main>
  );
}
