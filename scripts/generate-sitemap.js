const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const SITE_URL = "https://www.myraagam.com";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateSitemap() {
  console.log("Generating sitemap...");

  const { data: movies, error: moviesError } = await supabase
    .from("movies")
    .select("id");

  if (moviesError) {
    console.error("Movies fetch failed:", moviesError);
    process.exit(1);
  }

  const { data: tracks, error: tracksError } = await supabase
    .from("tracks")
    .select("id");

  if (tracksError) {
    console.error("Tracks fetch failed:", tracksError);
    process.exit(1);
  }

  const urls = new Set();

  // Public main pages
  urls.add(`${SITE_URL}/`);
  urls.add(`${SITE_URL}/movies`);

  // Public movie pages
  for (const movie of movies || []) {
    if (movie.id !== null && movie.id !== undefined) {
      urls.add(
        `${SITE_URL}/movie/${encodeURIComponent(String(movie.id))}`
      );
    }
  }

  // Public track pages
  for (const track of tracks || []) {
    if (track.id !== null && track.id !== undefined) {
      urls.add(
        `${SITE_URL}/track/${encodeURIComponent(String(track.id))}`
      );
    }
  }

  const sortedUrls = [...urls].sort();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sortedUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const outputPath = path.join(
    __dirname,
    "..",
    "public",
    "sitemap.xml"
  );

  fs.writeFileSync(outputPath, xml, "utf8");

  console.log(`Sitemap generated successfully.`);
  console.log(`URLs included: ${sortedUrls.length}`);
  console.log(`Output: ${outputPath}`);
}

generateSitemap().catch((error) => {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
});