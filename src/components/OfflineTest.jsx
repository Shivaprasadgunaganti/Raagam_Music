// import React from "react";
// import { saveTrack } from "../utils/offlineCache";

// export default function OfflineTest() {
//   const handleTest = async () => {
//     try {
//       const songUrl =
//         "https://cxgnppogmhtagctqcgdp.supabase.co/storage/v1/object/public/songs/Untitled%20folder/Cheliya%20Cheliya-SenSongsMp3.Co-target.mp3";

//       const response = await fetch(songUrl);

//       const blob = await response.blob();

//       await saveTrack(999, blob);

//       console.log("TEST SONG SAVED");
//       alert("TEST SONG SAVED");
//     } catch (err) {
//       console.error(err);
//       alert("FAILED");
//     }
//   };

//   return (
//     <button
//       onClick={handleTest}
//       style={{
//         position: "fixed",
//         top: 20,
//         right: 20,
//         zIndex: 9999,
//       }}
//     >
//       Test Offline Save
//     </button>
//   );
// }



import React from "react";
import { saveTrack, getTrack } from "../utils/offlineCache";

export default function OfflineTest() {
  const SONG_ID = 999;

  const handleSave = async () => {
    try {
      const songUrl =
        "https://cxgnppogmhtagctqcgdp.supabase.co/storage/v1/object/public/songs/Untitled%20folder/02%20-%20Naa%20Manasukemayindi%20%20-%20SenSongsMp3.co-target.mp3";

      const response = await fetch(songUrl);
      const blob = await response.blob();

      await saveTrack(SONG_ID, blob);

      console.log("SONG SAVED");
      alert("SONG SAVED");
    } catch (err) {
      console.error(err);
      alert("SAVE FAILED");
    }
  };

  const handlePlay = async () => {
    try {
      const blob = await getTrack(SONG_ID);

      if (!blob) {
        alert("No cached song found");
        return;
      }

      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);

      await audio.play();

      console.log("PLAYING FROM INDEXEDDB");
    } catch (err) {
      console.error(err);
      alert("PLAY FAILED");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        gap: "10px"
      }}
    >
      <button onClick={handleSave}>
        Save Song
      </button>

      <button onClick={handlePlay}>
        Play Cached Song
      </button>
    </div>
  );
}