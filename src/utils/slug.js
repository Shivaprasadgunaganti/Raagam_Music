// src/utils/slug.js
//
// Shared by the React app (src/) AND the Node build script (scripts/prerender.js),
// so it is written in CommonJS and must not import anything.
//
// URL scheme
//   Movie : /movie/<slug-of-movie-id>            e.g. /movie/athadu
//   Song  : /song/<slug-of-title>-<track id>     e.g. /song/pillaa-raa-57
//
// The track id is kept at the end of the song slug on purpose: it makes every
// URL unique and lets the app find the song without loading a lookup table.

const SITE_URL = "https://www.myraagam.com";

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "") // don't -> dont
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- movies ---------- */

function movieSlug(movieId) {
  return slugify(movieId) || encodeURIComponent(String(movieId ?? ""));
}

function moviePath(movieId) {
  return `/movie/${movieSlug(movieId)}`;
}

/* ---------- songs ---------- */

function trackSlug(track) {
  const base = slugify(track?.title) || "song";
  return `${base}-${track?.id}`;
}

function trackPath(track) {
  return `/song/${trackSlug(track)}`;
}

// "pillaa-raa-57" -> "57"
function parseTrackId(slug) {
  const match = /-([^-]+)$/.exec(String(slug ?? ""));
  return match ? match[1] : String(slug ?? "");
}

function absoluteUrl(path) {
  return `${SITE_URL}${path}`;
}

module.exports = {
  SITE_URL,
  slugify,
  movieSlug,
  moviePath,
  trackSlug,
  trackPath,
  parseTrackId,
  absoluteUrl,
};
