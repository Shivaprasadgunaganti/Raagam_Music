/**
 * scripts/prerender.js
 *
 * Runs AFTER `react-scripts build` (see package.json "build").
 *
 * Problem it solves: a Create-React-App site ships ONE empty HTML file
 * (<div id="root"></div>) for every URL, so Google sees ~300 identical, empty
 * pages. This script reads your movies/tracks from Supabase and writes a real
 * HTML file for every public page, each with its own <title>, description,
 * canonical, Open Graph tags, JSON-LD, an <h1> and crawlable <a href> links.
 * React still loads on top of it exactly as before.
 *
 * It also (re)generates build/sitemap.xml with <lastmod>.
 *
 * Output (inside build/):
 *   index.html                    home (prerendered)
 *   app-shell.html                the untouched SPA shell: fallback for every
 *                                 non-prerendered route (login, search, ...), noindex
 *   movies/index.html
 *   overall/index.html            "All songs" hub that links to every song
 *   privacy-policy/index.html, terms-of-service/index.html
 *   movie/<slug>/index.html
 *   song/<slug>-<id>/index.html
 *   track/<id>/index.html         legacy /track/<id> URLs -> redirect to the new URL
 *   sitemap.xml
 *
 * Usage:
 *   node scripts/prerender.js                      (needs REACT_APP_SUPABASE_* env vars)
 *   node scripts/prerender.js --data=sample.json   (offline test: {movies:[],tracks:[]})
 */

const fs = require("fs");
const path = require("path");

try {
  require("dotenv").config();
} catch {
  /* dotenv is optional on CI where env vars are already set */
}

const {
  SITE_URL,
  movieSlug,
  moviePath,
  trackPath,
  absoluteUrl,
} = require("../src/utils/slug");
const {
  SITE_NAME,
  movieSeo,
  trackSeo,
  splitArtists,
} = require("../src/utils/seoContent");

const ROOT = path.join(__dirname, "..");
const BUILD_DIR = path.join(ROOT, "build");
const DEFAULT_IMAGE = `${SITE_URL}/raagam_icon_v3.png`;

const HOME_TITLE = "Stream Telugu Movie Songs & Soundtracks Online | MyRaagam";
const HOME_DESCRIPTION =
  "Listen to Telugu songs, movie soundtracks and albums online on MyRaagam. Discover Telugu movie music, songs and albums and play them online.";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonForHtml(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function fail(message) {
  console.error(`\n[prerender] ERROR: ${message}\n`);
  process.exit(1);
}

function numericOrString(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}

function isoDate(value) {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null;
}

function maxDate(dates) {
  const valid = dates.filter(Boolean).sort();
  return valid.length ? valid[valid.length - 1] : null;
}

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

async function fetchAll(supabase, table, columns) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);

    if (error) fail(`Supabase "${table}" fetch failed: ${error.message}`);

    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function loadData() {
  const dataArg = process.argv.find((a) => a.startsWith("--data="));

  if (dataArg) {
    const file = path.resolve(dataArg.slice("--data=".length));
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    return { movies: json.movies || [], tracks: json.tracks || [] };
  }

  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    fail("Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY.");
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(url, key);

  const [movies, tracks] = await Promise.all([
    fetchAll(supabase, "movies", "*"),
    fetchAll(supabase, "tracks", "id,title,artist,cover_url,movie_id,created_at"),
  ]);

  return { movies, tracks };
}

/* ------------------------------------------------------------------ */
/* <head> rewriting                                                    */
/* ------------------------------------------------------------------ */

function buildHead({ title, description, canonical, image, type, robots, jsonLd }) {
  const img = image || DEFAULT_IMAGE;
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}"/>`,
    `<meta name="robots" content="${esc(robots || "index, follow")}"/>`,
  ];

  if (canonical) {
    tags.push(`<link rel="canonical" href="${esc(canonical)}"/>`);
    tags.push(`<meta property="og:url" content="${esc(canonical)}"/>`);
  }

  tags.push(
    `<meta property="og:site_name" content="${SITE_NAME}"/>`,
    `<meta property="og:locale" content="en_IN"/>`,
    `<meta property="og:type" content="${esc(type || "website")}"/>`,
    `<meta property="og:title" content="${esc(title)}"/>`,
    `<meta property="og:description" content="${esc(description)}"/>`,
    `<meta property="og:image" content="${esc(img)}"/>`,
    `<meta name="twitter:card" content="summary"/>`,
    `<meta name="twitter:title" content="${esc(title)}"/>`,
    `<meta name="twitter:description" content="${esc(description)}"/>`,
    `<meta name="twitter:image" content="${esc(img)}"/>`,
  );

  if (jsonLd) {
    tags.push(
      `<script type="application/ld+json" data-myraagam-seo="jsonld">${jsonForHtml(jsonLd)}</script>`,
    );
  }

  return tags.join("");
}

function stripOldHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");
}

function renderPage(template, head, bodyHtml, extraHead = "") {
  let html = stripOldHead(template);
  const block = buildHead(head) + extraHead;

  if (html.includes('<link rel="manifest"')) {
    html = html.replace('<link rel="manifest"', `${block}<link rel="manifest"`);
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", `${block}</head>`);
  } else {
    fail("Could not find a place to inject <head> tags in build/index.html");
  }

  const emptyRoot = '<div id="root"></div>';
  if (!html.includes(emptyRoot)) {
    fail('build/index.html no longer contains <div id="root"></div>.');
  }

  return html.replace(emptyRoot, `<div id="root">${bodyHtml}</div>`);
}

/* ------------------------------------------------------------------ */
/* <body> content (what Google reads before any JavaScript runs)       */
/* ------------------------------------------------------------------ */

const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;

function songItem(track) {
  const artist = track.artist ? ` &ndash; ${esc(track.artist)}` : "";
  return `<li>${link(trackPath(track), track.title)}${artist}</li>`;
}

function movieItem(movie) {
  const year = movie.year ? ` (${esc(movie.year)})` : "";
  return `<li>${link(moviePath(movie.id), movie.title || movie.id)}${year}</li>`;
}

const siteNav = `<nav aria-label="Main">${link("/", "Home")} | ${link("/movies", "Telugu movies")} | ${link("/overall", "All songs")}</nav>`;

function homeBody(movies) {
  return `<main id="prerendered">
${siteNav}
<h1>MyRaagam &ndash; Telugu Movie Songs &amp; Soundtracks</h1>
<p>${esc(HOME_DESCRIPTION)}</p>
<h2>Telugu movies</h2>
<ul>${movies.map(movieItem).join("")}</ul>
<p>${link("/movies", "Browse all Telugu movies")} or ${link("/overall", "see every song")}.</p>
</main>`;
}

function moviesBody(movies) {
  return `<main id="prerendered">
${siteNav}
<h1>Telugu Movies, Songs &amp; Soundtracks</h1>
<p>Explore Telugu movies and listen to their songs online on ${SITE_NAME}.</p>
<ul>${movies.map(movieItem).join("")}</ul>
</main>`;
}

function allSongsBody(tracks) {
  return `<main id="prerendered">
${siteNav}
<h1>All Telugu Songs</h1>
<p>Browse and listen to all ${tracks.length} Telugu songs available on ${SITE_NAME}.</p>
<ol>${tracks.map(songItem).join("")}</ol>
</main>`;
}

function legalBody(title, description) {
  return `<main id="prerendered">
${siteNav}
<h1>${esc(title)}</h1>
<p>${esc(description)}</p>
</main>`;
}

function relatedMovies(movie, movies, limit = 8) {
  const sameYear = movies.filter(
    (m) => m.id !== movie.id && movie.year && String(m.year) === String(movie.year),
  );
  const idx = movies.findIndex((m) => m.id === movie.id);
  const rotated = [...movies.slice(idx + 1), ...movies.slice(0, idx)];
  const seen = new Set();
  return [...sameYear, ...rotated]
    .filter((m) => (seen.has(m.id) ? false : seen.add(m.id)))
    .slice(0, limit);
}

function movieBody(movie, songs, movies) {
  const seo = movieSeo(movie, songs);
  const title = movie.title || movie.id;
  const year = movie.year ? ` (${esc(movie.year)})` : "";

  return `<main id="prerendered">
<nav aria-label="Breadcrumb">${link("/", "Home")} &rsaquo; ${link("/movies", "Movies")} &rsaquo; ${esc(title)}</nav>
<h1>${esc(title)} Telugu Movie Songs</h1>
${movie.cover_url ? `<img src="${esc(movie.cover_url)}" alt="${esc(title)} Telugu movie songs" width="300" height="300"/>` : ""}
<p>${esc(seo.description)}</p>
<h2>${esc(title)}${year} songs list</h2>
<ol>${songs.map(songItem).join("")}</ol>
<h2>More Telugu movie songs</h2>
<ul>${relatedMovies(movie, movies).map(movieItem).join("")}</ul>
</main>`;
}

function trackBody(track, movie, movieTracks, artistIndex) {
  const movieName = movie ? movie.title || movie.id : track.movie_id || "";
  const seo = trackSeo(track, movieName);

  const sameMovie = movieTracks
    .filter((t) => String(t.id) !== String(track.id))
    .slice(0, 10);

  const sameMovieIds = new Set(movieTracks.map((t) => String(t.id)));
  const byArtist = [];
  const seen = new Set([String(track.id)]);
  for (const name of splitArtists(track.artist)) {
    for (const t of artistIndex.get(name.toLowerCase()) || []) {
      if (!seen.has(String(t.id)) && !sameMovieIds.has(String(t.id))) {
        seen.add(String(t.id));
        byArtist.push(t);
      }
    }
  }

  return `<main id="prerendered">
<nav aria-label="Breadcrumb">${link("/", "Home")}${
    movieName ? ` &rsaquo; ${link(moviePath(track.movie_id || movieName), movieName)}` : ""
  } &rsaquo; ${esc(track.title)}</nav>
<h1>${esc(track.title)}</h1>
${track.artist ? `<p>Artist: ${esc(track.artist)}</p>` : ""}
${track.cover_url ? `<img src="${esc(track.cover_url)}" alt="${esc(track.title)} Telugu song" width="300" height="300"/>` : ""}
<p>${esc(seo.description)}</p>
${
  movieName
    ? `<p>From the movie ${link(moviePath(track.movie_id || movieName), movieName)}.</p>
<h2>More songs from ${esc(movieName)}</h2>
<ol>${sameMovie.map(songItem).join("")}</ol>`
    : ""
}
${
  byArtist.length
    ? `<h2>More songs by ${esc(track.artist)}</h2>
<ul>${byArtist.slice(0, 8).map(songItem).join("")}</ul>`
    : ""
}
</main>`;
}

/* ------------------------------------------------------------------ */
/* files                                                               */
/* ------------------------------------------------------------------ */

function writePage(urlPath, html) {
  const rel = urlPath === "/" ? "index.html" : path.join(urlPath, "index.html");
  const target = path.join(BUILD_DIR, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

function legacyStub(newPath) {
  // canonical is absolute (what Google needs); the actual redirect is relative
  // so it also works on Vercel preview deployments.
  const newUrl = absoluteUrl(newPath);
  const head = `<title>Redirecting… | ${SITE_NAME}</title>
<meta name="robots" content="noindex, follow"/>
<link rel="canonical" href="${esc(newUrl)}"/>
<meta http-equiv="refresh" content="0;url=${esc(newPath)}"/>
<script>location.replace(${jsonForHtml(newPath)});</script>`;
  // Minimal page, deliberately not the SPA, so it redirects immediately.
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>${head}</head><body><p>This page moved to <a href="${esc(newPath)}">${esc(newUrl)}</a>.</p></body></html>`;
}

function sitemapXml(entries) {
  const body = entries
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  // build/app-shell.html is the pristine CRA shell saved by a previous run of
  // this script. Using it as the template makes the script safe to re-run on
  // the same build folder (a fresh `react-scripts build` recreates the folder).
  const shellPath = path.join(BUILD_DIR, "app-shell.html");
  const templatePath = fs.existsSync(shellPath)
    ? shellPath
    : path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(templatePath)) {
    fail("build/index.html not found. Run `react-scripts build` first.");
  }

  const { movies: rawMovies, tracks: rawTracks } = await loadData();

  if (!rawMovies.length || !rawTracks.length) {
    fail(
      `Got ${rawMovies.length} movies and ${rawTracks.length} tracks. Refusing to deploy an empty site.`,
    );
  }

  const movies = [...rawMovies].sort((a, b) =>
    String(a.title || a.id).localeCompare(String(b.title || b.id)),
  );
  const tracks = [...rawTracks].sort((a, b) => numericOrString(a.id, b.id));

  /* ---- sanity checks: slugs must be unique ---- */
  const movieSlugs = new Map();
  for (const m of movies) {
    const s = movieSlug(m.id);
    if (movieSlugs.has(s)) {
      fail(
        `Two movies produce the same slug "${s}": "${movieSlugs.get(s)}" and "${m.id}". Rename one.`,
      );
    }
    movieSlugs.set(s, m.id);
  }
  const trackPaths = new Set();
  for (const t of tracks) {
    const p = trackPath(t);
    if (trackPaths.has(p)) fail(`Duplicate song URL ${p}`);
    trackPaths.add(p);
  }

  /* ---- lookups ---- */
  const moviesById = new Map(movies.map((m) => [String(m.id), m]));
  const tracksByMovie = new Map();
  const artistIndex = new Map();
  for (const t of tracks) {
    const key = String(t.movie_id);
    if (!tracksByMovie.has(key)) tracksByMovie.set(key, []);
    tracksByMovie.get(key).push(t);
    for (const name of splitArtists(t.artist)) {
      const k = name.toLowerCase();
      if (!artistIndex.has(k)) artistIndex.set(k, []);
      artistIndex.get(k).push(t);
    }
  }

  const template = fs.readFileSync(templatePath, "utf8");

  // 1) keep the untouched SPA shell as the fallback for non-prerendered routes
  if (!fs.existsSync(shellPath)) {
    fs.writeFileSync(shellPath, template, "utf8");
  }

  const sitemap = [];
  let pageCount = 0;
  const addPage = (urlPath, head, body, lastmod) => {
    writePage(urlPath, renderPage(template, head, body));
    sitemap.push({ loc: absoluteUrl(urlPath === "/" ? "/" : urlPath), lastmod });
    pageCount += 1;
  };

  const overallLastmod = maxDate(tracks.map((t) => isoDate(t.created_at)));

  /* ---- static public pages ---- */
  addPage(
    "/",
    {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      canonical: `${SITE_URL}/`,
      type: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: SITE_NAME,
            url: `${SITE_URL}/`,
            description: HOME_DESCRIPTION,
            inLanguage: "en",
          },
          {
            "@type": "Organization",
            name: SITE_NAME,
            url: `${SITE_URL}/`,
            logo: DEFAULT_IMAGE,
          },
        ],
      },
    },
    homeBody(movies),
    overallLastmod,
  );

  addPage(
    "/movies",
    {
      title: "Telugu Movies, Songs & Soundtracks | MyRaagam",
      description:
        "Explore Telugu movies, songs and soundtracks on MyRaagam. Discover movie albums and listen to their songs online.",
      canonical: `${SITE_URL}/movies`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Telugu Movies and Songs",
        url: `${SITE_URL}/movies`,
        itemListElement: movies.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: m.title || m.id,
          url: absoluteUrl(moviePath(m.id)),
        })),
      },
    },
    moviesBody(movies),
    overallLastmod,
  );

  addPage(
    "/overall",
    {
      title: "All Telugu Songs – Listen Online | MyRaagam",
      description: `Browse and listen to all ${tracks.length} Telugu songs on MyRaagam, from classic hits to new movie soundtracks.`,
      canonical: `${SITE_URL}/overall`,
    },
    allSongsBody(tracks),
    overallLastmod,
  );

  const legal = [
    [
      "/privacy-policy",
      "Privacy Policy | MyRaagam",
      "Learn how MyRaagam handles account, music library, feedback, and usage information.",
    ],
    [
      "/terms-of-service",
      "Terms of Service | MyRaagam",
      "Read the terms that apply when using the MyRaagam music application.",
    ],
  ];
  for (const [p, title, description] of legal) {
    addPage(
      p,
      { title, description, canonical: absoluteUrl(p) },
      legalBody(title.replace(" | MyRaagam", ""), description),
      null,
    );
  }

  /* ---- movie pages ---- */
  for (const movie of movies) {
    const songs = tracksByMovie.get(String(movie.id)) || [];
    const seo = movieSeo(movie, songs);
    addPage(
      seo.path,
      {
        title: seo.title,
        description: seo.description,
        canonical: seo.canonical,
        image: seo.image,
        type: seo.type,
        jsonLd: seo.jsonLd,
      },
      movieBody(movie, songs, movies),
      maxDate(songs.map((s) => isoDate(s.created_at))),
    );
  }

  /* ---- song pages (+ legacy /track/<id> redirect stubs) ---- */
  for (const track of tracks) {
    const movie = moviesById.get(String(track.movie_id));
    const movieName = movie ? movie.title || movie.id : track.movie_id || "";
    const seo = trackSeo(track, movieName);
    const movieTracks = tracksByMovie.get(String(track.movie_id)) || [];

    addPage(
      seo.path,
      {
        title: seo.title,
        description: seo.description,
        canonical: seo.canonical,
        image: seo.image,
        type: seo.type,
        jsonLd: seo.jsonLd,
      },
      trackBody(track, movie, movieTracks, artistIndex),
      isoDate(track.created_at),
    );

    writePage(`/track/${track.id}`, legacyStub(seo.path));
  }

  /* ---- sitemap ---- */
  fs.writeFileSync(path.join(BUILD_DIR, "sitemap.xml"), sitemapXml(sitemap), "utf8");

  console.log("[prerender] done");
  console.log(`  movies: ${movies.length}`);
  console.log(`  songs : ${tracks.length}`);
  console.log(`  pages written: ${pageCount} (+${tracks.length} legacy /track/ redirects)`);
  console.log(`  sitemap URLs : ${sitemap.length}`);
}

main().catch((err) => fail(err && err.stack ? err.stack : String(err)));
