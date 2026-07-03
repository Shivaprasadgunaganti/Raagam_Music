export async function refreshPlaylists() {
  console.log("🔄 Refreshing Playlists...");
}

export async function refreshLikedSongs() {
  console.log("🔄 Refreshing Liked Songs...");
}

export async function refreshContinueListening() {
  console.log("🔄 Refreshing Continue Listening...");
}

export async function refreshProfile() {
  console.log("🔄 Refreshing Profile...");
}

export async function refreshAll() {
  await refreshPlaylists();
  await refreshLikedSongs();
  await refreshContinueListening();
  await refreshProfile();

  console.log("✅ Sync Complete");
}