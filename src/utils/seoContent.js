// src/utils/seoContent.js
//
// Single source of truth for page titles, descriptions and JSON-LD.
// Used by the React pages (via <SEO />) AND by scripts/prerender.js, so the
// HTML Google receives first is identical to what React sets afterwards.
// CommonJS on purpose (see slug.js).

const {
  SITE_URL,
  moviePath,
  trackPath,
  absoluteUrl,
} = require("./slug");

const SITE_NAME = "MyRaagam";

function clip(text, max = 158) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, "") + "…";
}

function splitArtists(artist) {
  if (!artist) return [];
  return String(artist)
    .split(/\s*(?:,|&|\band\b|\/|;)\s*/i)
    .map((a) => a.trim())
    .filter(Boolean);
}

/* ---------------- MOVIE PAGE ---------------- */

function movieSeo(movie, songs = []) {
  const title = movie.title || movie.id;
  const path = moviePath(movie.id);
  const canonical = absoluteUrl(path);
  const year = movie.year ? ` (${movie.year})` : "";

  const names = songs.slice(0, 4).map((s) => s.title);
  const description = clip(
    songs.length > 0
      ? `Listen to all ${songs.length} songs from the Telugu movie ${title}${year} online on ${SITE_NAME}: ${names.join(", ")}${songs.length > names.length ? " and more" : ""}.`
      : `Listen to ${title}${year} Telugu movie songs and soundtrack online on ${SITE_NAME}.`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicAlbum",
        "@id": `${canonical}#album`,
        name: `${title} (Telugu Movie Songs)`,
        url: canonical,
        image: movie.cover_url || undefined,
        inLanguage: "te",
        datePublished: movie.year ? String(movie.year) : undefined,
        numTracks: songs.length || undefined,
        track: songs.map((s, i) => ({
          "@type": "MusicRecording",
          position: i + 1,
          name: s.title,
          url: absoluteUrl(trackPath(s)),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Movies", item: `${SITE_URL}/movies` },
          { "@type": "ListItem", position: 3, name: title, item: canonical },
        ],
      },
    ],
  };

  return {
    title: `${title} Telugu Movie Songs | ${SITE_NAME}`,
    description,
    path,
    canonical,
    image: movie.cover_url || undefined,
    type: "music.album",
    jsonLd,
  };
}

/* ---------------- SONG PAGE ---------------- */

// `movieName` is optional (we only have the track's movie_id, which is the
// movie name in your data).
function trackSeo(track, movieName) {
  const title = track.title || "Song";
  const artist = track.artist && track.artist !== "Unknown Artist" ? track.artist : "";
  const path = trackPath(track);
  const canonical = absoluteUrl(path);

  const description = clip(
    `Listen to ${title}${artist ? ` by ${artist}` : ""}${movieName ? ` from the Telugu movie ${movieName}` : ""} on ${SITE_NAME}. Stream this Telugu song online.`,
  );

  const artists = splitArtists(artist);

  const graph = [
    {
      "@type": "MusicRecording",
      "@id": `${canonical}#song`,
      name: title,
      url: canonical,
      image: track.cover_url || undefined,
      inLanguage: "te",
      byArtist: artists.length
        ? artists.map((name) => ({ "@type": "Person", name }))
        : undefined,
      inAlbum: movieName
        ? {
            "@type": "MusicAlbum",
            name: `${movieName} (Telugu Movie Songs)`,
            url: absoluteUrl(moviePath(track.movie_id || movieName)),
          }
        : undefined,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        ...(movieName
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: movieName,
                item: absoluteUrl(moviePath(track.movie_id || movieName)),
              },
            ]
          : []),
        { "@type": "ListItem", position: movieName ? 3 : 2, name: title, item: canonical },
      ],
    },
  ];

  return {
    // movie name keeps titles unique when two movies share a song title
    title: movieName
      ? `${title} – ${movieName} Telugu Song | ${SITE_NAME}`
      : `${title} Telugu Song${artist ? ` by ${artist}` : ""} | ${SITE_NAME}`,
    description,
    path,
    canonical,
    image: track.cover_url || undefined,
    type: "music.song",
    jsonLd: { "@context": "https://schema.org", "@graph": graph },
  };
}

module.exports = { SITE_NAME, clip, splitArtists, movieSeo, trackSeo };
