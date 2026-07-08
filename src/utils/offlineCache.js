// src/utils/offlineCache.js

const DB_NAME = "RaagamOfflineDB";
const STORE_NAME = "tracks";
// const DB_VERSION = 1;
// const DB_VERSION = 2;
const DB_VERSION = 3;
const LIKED_STORE = "liked_tracks";
const PLAYLIST_STORE = "playlists";
const PLAYLIST_TRACK_STORE = "playlist_tracks";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
      if (!db.objectStoreNames.contains("liked_tracks")) {
        db.createObjectStore("liked_tracks", {
          keyPath: "track_id",
        });
      }
      if (!db.objectStoreNames.contains("playlists")) {
  db.createObjectStore("playlists", {
    keyPath: "id",
  });
}

if (!db.objectStoreNames.contains("playlist_tracks")) {
  db.createObjectStore("playlist_tracks", {
    keyPath: "id",
  });
}
    };
  });
}

// export async function saveTrack(trackId, blob)
export async function saveTrack(track, blob) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request =
      // store.put({
      //   id: trackId,
      //   blob,
      //   cachedAt: Date.now(),
      // });
      store.put({
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover_url: track.cover_url,
        movie_id: track.movie_id,
        blob,
        cachedAt: Date.now(),
      });

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// export async function getTrack(trackId) {
//   const db = await openDB();

//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);

//     const request = store.get(trackId);

//     request.onsuccess = () => {
//       resolve(request.result?.blob || null);
//     };

//     request.onerror = () => reject(request.error);
//   });
// }

// export async function deleteTrack(trackId) {
//   const db = await openDB();

//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readwrite");
//     const store = tx.objectStore(STORE_NAME);

//     const request = store.delete(trackId);

//     request.onsuccess = () => resolve(true);
//     request.onerror = () => reject(request.error);
//   });
// }

export async function getTrack(trackId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.get(trackId);

    request.onsuccess = () => {
      resolve(request.result?.blob || null);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function hasTrack(trackId) {
  const blob = await getTrack(trackId);
  return !!blob;
}

// export async function deleteTrack(trackId) {
//   const db = await openDB();

//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readwrite");
//     const store = tx.objectStore(STORE_NAME);

//     const request = store.delete(trackId);

//     request.onsuccess = () => resolve(true);
//     request.onerror = () => reject(request.error);
//   });
// }

export async function clearCache() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function getCacheStats() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result || [];

      const count = records.length;

      const bytes = records.reduce((total, item) => {
        return total + (item.blob?.size || 0);
      }, 0);

      resolve({
        count,
        bytes,
      });
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getAllCachedTracks() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getCachedTrackIds() {
  const tracks = await getAllCachedTracks();

  return new Set(tracks.map((track) => track.id));
}

export async function saveLikedTracks(trackIds) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(LIKED_STORE, "readwrite");
    const store = tx.objectStore(LIKED_STORE);

    trackIds.forEach((trackId) => {
      store.put({
        track_id: trackId,
        cachedAt: Date.now(),
      });
//       request.onsuccess = () => {
//   console.log("Saved liked track:", trackId);
// };
    });

    

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLikedTrackIds() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(LIKED_STORE, "readonly");
    const store = tx.objectStore(LIKED_STORE);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result.map((item) => item.track_id));
    };

    request.onerror = () => reject(request.error);
  });
}

export async function clearLikedTracks() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(LIKED_STORE, "readwrite");
    const store = tx.objectStore(LIKED_STORE);

    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}


export async function savePlaylists(playlists) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readwrite");
    const store = tx.objectStore(PLAYLIST_STORE);

    playlists.forEach((playlist) => {
      store.put(playlist);
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPlaylists() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readonly");
    const store = tx.objectStore(PLAYLIST_STORE);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPlaylists() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readwrite");
    const store = tx.objectStore(PLAYLIST_STORE);

    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function savePlaylistTracks(rows) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_TRACK_STORE, "readwrite");
    const store = tx.objectStore(PLAYLIST_TRACK_STORE);

    rows.forEach((row) => {
      store.put(row);
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPlaylistTracks() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_TRACK_STORE, "readonly");
    const store = tx.objectStore(PLAYLIST_TRACK_STORE);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPlaylistTracks() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_TRACK_STORE, "readwrite");
    const store = tx.objectStore(PLAYLIST_TRACK_STORE);

    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}


export async function getPlaylistById(playlistId) {
  const playlists = await getPlaylists();

  return playlists.find((p) => p.id === playlistId) || null;
}

export async function getPlaylistTracksByPlaylistId(playlistId) {
  const rows = await getPlaylistTracks();

  return rows.filter(
    (row) => row.playlist_id === playlistId
  );
}
export async function savePlaylist(playlist) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_STORE, "readwrite");
    const store = tx.objectStore(PLAYLIST_STORE);

    const request = store.put(playlist);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}
export async function savePlaylistTrack(track) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PLAYLIST_TRACK_STORE, "readwrite");
    const store = tx.objectStore(PLAYLIST_TRACK_STORE);

    const request = store.put(track);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTrack(trackId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.delete(trackId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// export async function getAllCachedTracks() {
//   const db = await openDB();

//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);

//     const request = store.getAll();

//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// }