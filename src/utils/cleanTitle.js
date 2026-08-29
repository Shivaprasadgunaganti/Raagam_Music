/**
 * cleanSongTitle
 *
 * Turns a messy YouTube video title like:
 *   "MALLEPOOLA PALLAKI 8K VIDEO | RAVI TEJA | GV PRAKASH | DAPPU SRINU | IRUMUDI | AYYAPPA SONG"
 * into a clean, music-app-style title:
 *   "Mallepoola Pallaki"
 */
export function cleanSongTitle(rawTitle) {
  if (!rawTitle) return "";

  // The real song name is almost always the first "|" or " - " separated segment
  let title = rawTitle.split("|")[0].split(" - ")[0];

  // Strip common upload-noise words
  const noiseWords =
    /\b(8K|4K|HD|FULL|VIDEO|SONG|AUDIO|LYRICAL|LYRIC|OFFICIAL|TEASER|PROMO|JUKEBOX|MOVIE|TRAILER|STATUS)\b/gi;
  title = title
    .replace(noiseWords, "")
    .replace(/[()[\]]/g, "")
    .trim()
    .replace(/\s{2,}/g, " ");

  // If it was ALL CAPS, convert to Title Case for a cleaner look
  const isAllCaps = title === title.toUpperCase() && /[A-Z]/.test(title);
  if (isAllCaps) {
    title = title
      .toLowerCase()
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  return title.trim();
}