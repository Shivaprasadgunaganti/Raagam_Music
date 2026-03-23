import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./movies.css";

export default function MoviesPage() {
  const nav = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      const { data } = await supabase
        .from("movies")
        .select("*")
        .order("year", { ascending: false });

      setMovies(data || []);
      setLoading(false);
    }

    loadMovies();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <main className="movies-page">
      <div className="movies-header">
        <h1>Albums</h1>
        <p>Browse all movie albums</p>
      </div>

      <div className="movies-grid">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => nav(`/movie/${movie.id}`)}
          >
            <div className="movie-img-wrap">
              <img
                src={movie.cover_url || "/covers/default.jpg"}
                alt={movie.title}
              />
              <div className="movie-overlay">▶</div>
            </div>

            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.year}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

//  src/components/MoviesPage.jsx
// import React from "react";
// import { useNavigate } from "react-router-dom";
// import useTracks from "../hooks/useTracks";
// import "./movies.css";

// export default function MoviesPage() {
//   const { tracks, loading } = useTracks();
//   const nav = useNavigate();

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

//   // Group songs by movie_id
//   const moviesMap = {};
//   tracks.forEach((t) => {
//     if (!t.movie_id) return;
//     if (!moviesMap[t.movie_id]) {
//       moviesMap[t.movie_id] = t; // take first song as representative
//     }
//   });

//   const movies = Object.values(moviesMap);

//   return (
//     <main className="movies-page">
//       <h1 className="movies-title">Movies</h1>

//       <div className="movies-grid">
//         {movies.map((movie) => (
//           <div
//             key={movie.movie_id}
//             className="movie-card"
//             onClick={() => nav(`/movie/${encodeURIComponent(movie.movie_id)}`)}
//           >
//             <div className="movie-img-wrap">
//               <img
//                 src={movie.cover_url || "/covers/default.jpg"}
//                 alt={movie.movie_id}
//               />
//               <div className="movie-play-btn">▶</div>
//             </div>

//             <div className="movie-info">
//               <h3>{movie.movie_id}</h3>
//               <p>{movie.artist || "Various Artists"}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }
