import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useRecent from "../hooks/useRecent";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";

// const STORAGE_KEY = "audio_state_v1";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const { user } = useAuth();
  const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
  const audioRef = useRef(new Audio());
  const { addRecent } = useRecent();
  const [resumeTime, setResumeTime] = useState(0);

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loopOne, setLoopOne] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const saveProgress = async (trackId, position, duration) => {
  if (!user || !trackId) return;

  // await supabase.from("continue_listening").upsert({
  //   user_id: user.id,
  //   track_id: trackId,
  //   last_position: Math.floor(position),
  //   duration: Math.floor(duration || 0),
  //   updated_at: new Date(),
  // });
  await supabase
  .from("continue_listening")
  .upsert(
    {
      user_id: user.id,
      track_id: trackId,
      last_position: Math.floor(position),
      duration: Math.floor(duration || 0),
      updated_at: new Date(),
    },
    {
      onConflict: "user_id,track_id", // 🔥 THIS FIXES 409 ERROR
    }
  );
};

  const currentTrack =
    currentIndex >= 0 && currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  useEffect(() => {
    if (!STORAGE_KEY) return;

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) return;

    const { queue, currentIndex, currentTime, wasPlaying, loopOne } = saved;

    if (!queue?.length) return;

    setQueue(queue);
    setCurrentIndex(currentIndex);
    setLoopOne(loopOne);

    const audio = audioRef.current;

    setTimeout(() => {
      audio.currentTime = currentTime || 0;

      if (wasPlaying) {
        audio.play().catch(() => {});
        setPlaying(true);
      }
    }, 0);
  }, [STORAGE_KEY]);

  // useEffect(() => {
  //   if (!STORAGE_KEY) return;

  //   const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

  //   if (!saved) return;

  //   const { queue, currentIndex, currentTime, wasPlaying, loopOne } = saved;

  //   if (!queue?.length) return;

  //   setQueue(queue);
  //   setCurrentIndex(currentIndex);
  //   setLoopOne(loopOne);

  //   const audio = audioRef.current;
  //   audio.currentTime = currentTime || 0;

  //   if (wasPlaying) {
  //     audio.play().catch(() => {});
  //     setPlaying(true);
  //   }
  // }, [user]);


  useEffect(() => {
  if (!currentTrack) return;

  const interval = setInterval(() => {
    const audio = audioRef.current;

    if (audio && !audio.paused) {
      saveProgress(
        currentTrack.id,
        audio.currentTime,
        audio.duration
      );
    }
  }, 10000);

  return () => clearInterval(interval);
}, [currentTrack, user]);

  const setNewQueue = (tracks, startIndex = 0) => {
    if (!tracks?.length) return;
    setQueue(tracks);
    setCurrentIndex(startIndex);
  };

  const playAll = (tracks) => {
    if (!tracks?.length) return;
    setQueue(tracks);
    setCurrentIndex(0);
  };

  const shufflePlay = (tracks) => {
    if (!tracks?.length) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
  };

  const addToQueue = (track) => {
    if (!track) return;

    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const playNextInsert = (track) => {
    if (!track) return;

    setQueue((prev) => {
      if (!prev.length) {
        setCurrentIndex(0);
        return [track];
      }

      const newQueue = [...prev];
      newQueue.splice(currentIndex + 1, 0, track);
      return newQueue;
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio.src) return;

    if (audio.paused) {
      audio.play().then(() => setPlaying(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const playNext = () => {
    if (!queue.length) return;

    setCurrentIndex((current) => {
      if (shuffle) {
        if (queue.length === 1) return current;

        let next;
        do {
          next = Math.floor(Math.random() * queue.length);
        } while (next === current);

        return next;
      }

      if (current + 1 < queue.length) {
        return current + 1;
      }

      return current;
    });
  };

  const playPrev = () => {
    if (!queue.length) return;

    setCurrentIndex((current) => {
      if (shuffle) {
        if (queue.length === 1) return current;

        let prev;
        do {
          prev = Math.floor(Math.random() * queue.length);
        } while (prev === current);

        return prev;
      }

      return current > 0 ? current - 1 : 0;
    });
  };


  useEffect(() => {
  const audio = audioRef.current;
  if (!currentTrack) return;

  audio.src =
    currentTrack.external_url || currentTrack.storage_path || "";

  // 🔥 APPLY RESUME BEFORE PLAY
  setTimeout(() => {
    if (resumeTime > 0) {
      audio.currentTime = resumeTime;
      setResumeTime(0); // reset
    }
  }, 200);

  audio
    .play()
    .then(() => {
      setPlaying(true);
      addRecent(currentTrack);

      saveProgress(currentTrack.id, 0, audio.duration);
    })
    .catch(() => setPlaying(false));
}, [currentTrack]);

  // useEffect(() => {
  //   const audio = audioRef.current;
  //   if (!currentTrack) return;

  //   audio.src = currentTrack.external_url || currentTrack.storage_path || "";

  
  //   audio
  // .play()
  // .then(() => {
  //   setPlaying(true);
  //   addRecent(currentTrack);

  //   saveProgress(currentTrack.id, 0, audio.duration);
  //     })
  //     .catch(() => setPlaying(false));
  // }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoaded = () => setDuration(audio.duration || 0);

    const onEnded = () => {
      if (loopOne) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [loopOne, shuffle]);

  useEffect(() => {
    if (!STORAGE_KEY) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        queue,
        currentIndex,
        currentTime,
        wasPlaying: playing,
        loopOne,
        shuffle,
      })
    );
  }, [
    queue,
    currentIndex,
    currentTime,
    playing,
    loopOne,
    shuffle,
    STORAGE_KEY,
  ]);

  const seekTo = (sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
  };

  const removeFromQueue = (trackId) => {
    setQueue((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);

      const removedIndex = prev.findIndex((t) => t.id === trackId);

      if (removedIndex < currentIndex) {
        setCurrentIndex((i) => i - 1);
      }

      return updated;
    });
  };
  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
    audioRef.current.pause();
    audioRef.current.src = "";
    setPlaying(false);
  };

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        queue,
        currentTrack,
        currentIndex,
        playing,
        loopOne,
        shuffle,
        currentTime,
        duration,
        setNewQueue,
        setResumeTime,
        playAll,
        shufflePlay,
        addToQueue,
        playNextInsert,
        playNext,
        playPrev,
        togglePlay,
        setLoopOne,
        setShuffle,
        seekTo,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import useRecent from "../hooks/useRecent";

// const STORAGE_KEY = "audio_state_v1";
// const AudioContext = createContext(null);

// export function AudioProvider({ children }) {
//   const audioRef = useRef(new Audio());
//   const { addRecent } = useRecent();

//   const [queue, setQueue] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [playing, setPlaying] = useState(false);
//   const [loopOne, setLoopOne] = useState(false);
//   const [shuffle, setShuffle] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const currentTrack =
//     currentIndex >= 0 && currentIndex < queue.length
//       ? queue[currentIndex]
//       : null;

//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
//     if (!saved) return;

//     const { queue, currentIndex, currentTime, wasPlaying, loopOne } = saved;

//     if (!queue?.length) return;

//     setQueue(queue);
//     setCurrentIndex(currentIndex);
//     setLoopOne(loopOne);

//     const audio = audioRef.current;
//     audio.currentTime = currentTime || 0;

//     if (wasPlaying) {
//       audio.play().catch(() => {});
//       setPlaying(true);
//     }
//   }, []);

//   const setNewQueue = (tracks, startIndex = 0) => {
//     if (!tracks?.length) return;
//     setQueue(tracks);
//     setCurrentIndex(startIndex);
//   };

//   const playAll = (tracks) => {
//     if (!tracks?.length) return;
//     setQueue(tracks);
//     setCurrentIndex(0);
//   };

//   const shufflePlay = (tracks) => {
//     if (!tracks?.length) return;
//     const shuffled = [...tracks].sort(() => Math.random() - 0.5);
//     setQueue(shuffled);
//     setCurrentIndex(0);
//   };

//   const addToQueue = (track) => {
//     if (!track) return;

//     setQueue((prev) => {
//       if (prev.some((t) => t.id === track.id)) return prev;
//       return [...prev, track];
//     });
//   };

//   const playNextInsert = (track) => {
//     if (!track) return;

//     setQueue((prev) => {
//       if (!prev.length) {
//         setCurrentIndex(0);
//         return [track];
//       }

//       const newQueue = [...prev];
//       newQueue.splice(currentIndex + 1, 0, track);
//       return newQueue;
//     });
//   };

//   const togglePlay = () => {
//     const audio = audioRef.current;
//     if (!audio.src) return;

//     if (audio.paused) {
//       audio.play().then(() => setPlaying(true));
//     } else {
//       audio.pause();
//       setPlaying(false);
//     }
//   };

//   const playNext = () => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         if (queue.length === 1) return current;

//         let next;
//         do {
//           next = Math.floor(Math.random() * queue.length);
//         } while (next === current);

//         return next;
//       }

//       if (current + 1 < queue.length) {
//         return current + 1;
//       }

//       return current;
//     });
//   };

//   const playPrev = () => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         if (queue.length === 1) return current;

//         let prev;
//         do {
//           prev = Math.floor(Math.random() * queue.length);
//         } while (prev === current);

//         return prev;
//       }

//       return current > 0 ? current - 1 : 0;
//     });
//   };

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!currentTrack) return;

//     audio.src = currentTrack.external_url || currentTrack.storage_path || "";

//     audio
//       .play()
//       .then(() => {
//         setPlaying(true);
//         addRecent(currentTrack);
//       })
//       .catch(() => setPlaying(false));
//   }, [currentTrack]);

//   useEffect(() => {
//     const audio = audioRef.current;

//     const onTime = () => {
//       setCurrentTime(audio.currentTime);
//     };

//     const onLoaded = () => setDuration(audio.duration || 0);

//     const onEnded = () => {
//       if (loopOne) {
//         audio.currentTime = 0;
//         audio.play();
//       } else {
//         playNext();
//       }
//     };

//     audio.addEventListener("timeupdate", onTime);
//     audio.addEventListener("loadedmetadata", onLoaded);
//     audio.addEventListener("ended", onEnded);

//     return () => {
//       audio.removeEventListener("timeupdate", onTime);
//       audio.removeEventListener("loadedmetadata", onLoaded);
//       audio.removeEventListener("ended", onEnded);
//     };
//   }, [loopOne, shuffle]);

//   useEffect(() => {
//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({
//         queue,
//         currentIndex,
//         currentTime,
//         wasPlaying: playing,
//         loopOne,
//         shuffle,
//       })
//     );
//   }, [queue, currentIndex, playing, loopOne, shuffle]);

//   const seekTo = (sec) => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
//   };

//   const removeFromQueue = (trackId) => {
//     setQueue((prev) => {
//       const updated = prev.filter((t) => t.id !== trackId);

//       const removedIndex = prev.findIndex((t) => t.id === trackId);

//       if (removedIndex < currentIndex) {
//         setCurrentIndex((i) => i - 1);
//       }

//       return updated;
//     });
//   };
//   const clearQueue = () => {
//     setQueue([]);
//     setCurrentIndex(-1);
//     audioRef.current.pause();
//     audioRef.current.src = "";
//     setPlaying(false);
//   };

//   return (
//     <AudioContext.Provider
//       value={{
//         audioRef,
//         queue,
//         currentTrack,
//         currentIndex,
//         playing,
//         loopOne,
//         shuffle,
//         currentTime,
//         duration,
//         setNewQueue,
//         playAll,
//         shufflePlay,
//         addToQueue,
//         playNextInsert,
//         playNext,
//         playPrev,
//         togglePlay,
//         setLoopOne,
//         setShuffle,
//         seekTo,
//         removeFromQueue,
//         clearQueue,
//       }}
//     >
//       {children}
//     </AudioContext.Provider>
//   );
// }

// export function useAudio() {
//   return useContext(AudioContext);
// }
