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

const movieListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Telugu Movies and Songs",
  url: "https://www.myraagam.com/movies",
  itemListElement: movies.map((movie, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: movie.title,
    url: `https://www.myraagam.com/movie/${movie.id}`,
  })),
};

  return (
    <main>
      {/* <SEO
        title="Telugu Movies & Songs | MyRaagam"
        // description="Explore movies and discover their songs on MyRaagam."
        description="Explore Telugu movies and discover their songs, soundtracks and music on MyRaagam."
        url="https://www.myraagam.com/movies"
        type="website"
      /> */}

      <SEO
  title="Telugu Movies, Songs & Soundtracks | MyRaagam"
  description="Explore Telugu movies, songs and soundtracks on MyRaagam. Discover movie albums and listen to their songs online."
  url="https://www.myraagam.com/movies"
  type="website"
   jsonLd={movieListJsonLd}
/>

      {/* <h1>Movies & Songs</h1>
      <p>Explore movies and discover their songs on MyRaagam</p> */}
     <div className="moviespageheader">
       {/* <h1>Telugu Movies & Songs</h1> */}
       <h1>Movies & Songs</h1>
      {/* <p>
        Explore Telugu movies and discover their songs and soundtracks on
        MyRaagam.
      </p> */}
        {/* <p>
    Explore Telugu movies and discover their songs, soundtracks and music
    albums on MyRaagam.
  </p> */}
  <p>
  Explore movies, soundtracks and songs on MyRaagam.
</p>
     </div>
      {/* <h1>Albums</h1>
      <p>Browse all movie albums</p> */}

      <div className="movies-grid">
        {movies.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card">
            <div className="movie-img-wrap">
              <img
                src={movie.cover_url || "/covers/default.jpg"}
                alt={movie.title}
              />

              <div className="movie-overlay">▶</div>
            </div>

            <div className="movie-info">
              <h2>{movie.title}</h2>
              {/* <h3>{movie.title}</h3> */}
              <p>{movie.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
