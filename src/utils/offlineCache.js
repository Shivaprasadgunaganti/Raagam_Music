// src/utils/offlineCache.js

const DB_NAME = "RaagamOfflineDB";
const STORE_NAME = "tracks";
const DB_VERSION = 1;

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

  return new Set(
    tracks.map((track) => track.id)
  );
}