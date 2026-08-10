// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import "./movies.css";

// export default function MoviesPage() {
//   const nav = useNavigate();
//   const [movies, setMovies] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadMovies() {
//       const { data } = await supabase
//         .from("movies")
//         .select("*")
//         .order("year", { ascending: false });

//       setMovies(data || []);
//       setLoading(false);
//     }

//     loadMovies();
//   }, []);

//   if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

//   return (
//     <main className="movies-page">
//       <div className="movies-header">
//         <h1>Albums</h1>
//         <p>Browse all movie albums</p>
//       </div>

//       <div className="movies-grid">
//         {movies.map((movie) => (
//           <div
//             key={movie.id}
//             className="movie-card"
//             onClick={() => nav(`/movie/${movie.id}`)}
//           >
//             <div className="movie-img-wrap">
//               <img
//                 src={movie.cover_url || "/covers/default.jpg"}
//                 alt={movie.title}
//               />
//               <div className="movie-overlay">▶</div>
//             </div>

//             <div className="movie-info">
//               <h3>{movie.title}</h3>
//               <p>{movie.year}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SEO from "./SEO";
import "./movies.css";

export default function MoviesPage() {
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

  if (loading) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  return (
    <main>
      <SEO
        title="Telugu Movies & Songs | MyRaagam"
        description="Explore movies and discover their songs on MyRaagam."
        url="https://www.myraagam.com/movies"
        type="website"
      />

      <h1>Movies & Songs</h1>
      <p>Explore movies and discover their songs on MyRaagam</p>
      {/* <h1>Albums</h1>
      <p>Browse all movie albums</p> */}

      <div className="movies-grid">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="movie-card"
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
          </Link>
        ))}
      </div>
    </main>
  );
}