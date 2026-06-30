import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import useRecent from "../hooks/useRecent";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";
import { cacheTrack } from "../utils/cacheTrack";
import { getTrack } from "../utils/offlineCache";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const { user } = useAuth();
  const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
  const audioRef = useRef(new Audio());
  const { addRecent } = useRecent();
  const [resumeTime, setResumeTime] = useState(0);

  // Player states
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loopOne, setLoopOne] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // NEW: States for shuffle order (prevents repeats within one loop)
  const [shuffleOrder, setShuffleOrder] = useState([]);
  const [shufflePointer, setShufflePointer] = useState(0);

  const saveProgress = async (trackId, position, duration) => {
    if (!user || !trackId) return;
    if (position < 5) return;

    await supabase.from("continue_listening").upsert(
      {
        user_id: user.id,
        track_id: trackId,
        last_position: Math.floor(position),
        duration: Math.floor(duration || 0),
        updated_at: new Date(),
      },
      {
        onConflict: "user_id,track_id",
      },
    );
  };

  const currentTrack =
    currentIndex >= 0 && currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  // NEW: Fisher-Yates shuffle helper - creates one full order without repeats
  const buildShuffleOrder = useCallback((tracks, startIndex = 0) => {
    if (!tracks?.length) return { order: [], pointer: 0 };

    const indices = tracks.map((_, i) => i);
    const remaining = indices.filter((i) => i !== startIndex);

    // Fisher-Yates shuffle
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const order = [startIndex, ...remaining];
    return { order, pointer: 0 };
  }, []);

  useEffect(() => {
    if (!STORAGE_KEY) return;

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) return;

    const {
      queue,
      currentIndex,
      currentTime,
      wasPlaying,
      loopOne,
      shuffle,
      shuffleOrder,
      shufflePointer,
    } = saved;

    if (!queue?.length) return;

    setQueue(queue);
    setCurrentIndex(currentIndex);
    setLoopOne(loopOne);
    setShuffle(!!shuffle);
    setShuffleOrder(shuffleOrder || []);
    setShufflePointer(shufflePointer || 0);

    const audio = audioRef.current;

    setTimeout(() => {
      audio.currentTime = currentTime || 0;

      if (wasPlaying) {
        audio.play().catch(() => {});
        setPlaying(true);
      }
    }, 0);
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!currentTrack) return;

    const interval = setInterval(() => {
      const audio = audioRef.current;

      if (audio && !audio.paused) {
        saveProgress(currentTrack.id, audio.currentTime, audio.duration);
      }
    }, 10000);

    return () => {
      clearInterval(interval);

      const audio = audioRef.current;

      if (audio && currentTrack) {
        saveProgress(currentTrack.id, audio.currentTime, audio.duration);
      }
    };
  }, [currentTrack, user]);

  // FIXED: setNewQueue now also builds shuffle order if shuffle is on
  const setNewQueue = useCallback(
    (tracks, index) => {
      if (!tracks?.length) return;

      setQueue(tracks);
      setCurrentIndex(index);

      if (shuffle) {
        const { order, pointer } = buildShuffleOrder(tracks, index);
        setShuffleOrder(order);
        setShufflePointer(pointer);
      } else {
        setShuffleOrder([]);
        setShufflePointer(0);
      }
    },
    [shuffle, buildShuffleOrder],
  );

  // FIXED: playAll always uses original order, no shuffle
  const playAll = useCallback((tracks) => {
    if (!tracks?.length) return;

    setQueue(tracks);
    setCurrentIndex(0);
    setShuffle(false);
    setShuffleOrder([]);
    setShufflePointer(0);
  }, []);

  // FIXED: shufflePlay creates proper shuffle order without repeats
  // const shufflePlay = useCallback((tracks) => {
  //   if (!tracks?.length) return;

  //   setQueue(tracks);
  //   setShuffle(true);

  //   const startIndex = 0;
  //   const { order, pointer } = buildShuffleOrder(tracks, startIndex);

  //   setShuffleOrder(order);
  //   setShufflePointer(pointer);
  //   setCurrentIndex(order[pointer]);
  // }, [buildShuffleOrder]);

  const shufflePlay = useCallback(
    (tracks) => {
      if (!tracks?.length) return;

      setQueue(tracks);
      setShuffle(true);

      const startIndex = Math.floor(Math.random() * tracks.length);

      const { order, pointer } = buildShuffleOrder(tracks, startIndex);

      setShuffleOrder(order);
      setShufflePointer(pointer);

      setCurrentIndex(order[pointer]);
    },
    [buildShuffleOrder],
  );

  const addToQueue = useCallback((track) => {
    if (!track) return;

    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const playNextInsert = useCallback(
    (track) => {
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
    },
    [currentIndex],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.src) return;

    if (audio.paused) {
      audio.play().then(() => setPlaying(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  // FIXED: playNext no longer picks random song, uses pre-built shuffle order
  const playNext = useCallback(() => {
    if (!queue.length) return;

    setCurrentIndex((current) => {
      if (shuffle) {
        // If no shuffle order exists yet, create one
        if (!shuffleOrder.length) {
          const { order, pointer } = buildShuffleOrder(
            queue,
            current >= 0 ? current : 0,
          );
          setShuffleOrder(order);
          setShufflePointer(pointer);
          return order[pointer];
        }

        const nextPointer = shufflePointer + 1;

        // If we haven't finished the loop yet, go to next song in shuffle order
        if (nextPointer < shuffleOrder.length) {
          setShufflePointer(nextPointer);
          return shuffleOrder[nextPointer];
        }

        // If we finished the loop, create a new shuffle order and start over
        // const restartFrom = shuffleOrder[shuffleOrder.length - 1] ?? 0;
        // const { order, pointer } = buildShuffleOrder(queue, restartFrom);
        // setShuffleOrder(order);
        // setShufflePointer(pointer);
        // return order[pointer];

        // If we finished the loop, create a fresh shuffle order for the next cycle
        let nextStart = Math.floor(Math.random() * queue.length);

        // avoid immediate repeat of the just-finished last song
        const lastPlayed = shuffleOrder[shuffleOrder.length - 1];
        if (queue.length > 1) {
          while (nextStart === lastPlayed) {
            nextStart = Math.floor(Math.random() * queue.length);
          }
        }

        const { order, pointer } = buildShuffleOrder(queue, nextStart);
        setShuffleOrder(order);
        setShufflePointer(pointer);
        return order[pointer];
      }

      // Normal mode: go to next, and wrap to 0 at the end
      if (current + 1 < queue.length) {
        return current + 1;
      }

      return 0; // <-- THIS FIXES: now loops back to first song instead of stopping
    });
  }, [queue, shuffle, shuffleOrder, shufflePointer, buildShuffleOrder]);

  // FIXED: playPrev also uses shuffle order when shuffle is on
  const playPrev = useCallback(() => {
    if (!queue.length) return;

    setCurrentIndex((current) => {
      if (shuffle) {
        if (!shuffleOrder.length) return current;

        const prevPointer = shufflePointer - 1;

        if (prevPointer >= 0) {
          setShufflePointer(prevPointer);
          return shuffleOrder[prevPointer];
        }

        return shuffleOrder[0];
      }

      // Normal mode: go to previous, wrap to last song at beginning
      return current > 0 ? current - 1 : queue.length - 1;
    });
  }, [queue, shuffle, shuffleOrder, shufflePointer]);

  const reorderQueue = useCallback((newQueue) => {
    setQueue(newQueue);
  }, []);

  const removeFromQueue = useCallback(
    (trackId) => {
      setQueue((prev) => {
        const updated = prev.filter((t) => t.id !== trackId);

        const removedIndex = prev.findIndex((t) => t.id === trackId);

        if (removedIndex < currentIndex) {
          setCurrentIndex((i) => i - 1);
        }

        return updated;
      });
    },
    [currentIndex],
  );

  // FIXED: clearQueue also clears shuffle states
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    setShuffleOrder([]);
    setShufflePointer(0);
    audioRef.current.pause();
    audioRef.current.src = "";
    setPlaying(false);
  }, []);

  // useEffect(() => {
  //   const audio = audioRef.current;
  //   if (!currentTrack) return;

  //   audio.src = currentTrack.external_url || currentTrack.storage_path || "";

  //   audio
  //     .play()
  //     .then(() => {
  //       setPlaying(true);
  //       addRecent(currentTrack);
  //       cacheTrack(currentTrack);

  //       if (resumeTime > 0) {
  //         audio.currentTime = resumeTime;
  //         setResumeTime(0);
  //       }

  //       saveProgress(currentTrack.id, 0, audio.duration);
  //     })
  //     .catch(() => setPlaying(false));
  // }, [currentTrack]);

  useEffect(() => {
    const loadTrack = async () => {
      const audio = audioRef.current;

      if (!currentTrack) return;

      try {
        const cachedBlob = await getTrack(currentTrack.id);

        console.log("Cached Blob:", !!cachedBlob);
        console.log(
          "Track:",
          currentTrack.id,
          currentTrack.title,
          "Cached:",
          !!cachedBlob,
        );

        if (cachedBlob) {
          console.log("Playing from cache:", currentTrack.title);

          const blobUrl = URL.createObjectURL(cachedBlob);

          audio.src = blobUrl;
        } else {
          console.log("Playing from network:", currentTrack.title);

          audio.src =
            currentTrack.external_url || currentTrack.storage_path || "";
        }

        await audio.play();

        setPlaying(true);

        addRecent(currentTrack);

        cacheTrack(currentTrack);

        if (resumeTime > 0) {
          audio.currentTime = resumeTime;
          setResumeTime(0);
        }

        saveProgress(currentTrack.id, 0, audio.duration);
      } 
      // catch (err) {
      //   console.error(err);
      //   setPlaying(false);
      // }
      catch (err) {
  if (err.name === "AbortError") {
    return;
  }

  console.error(err);
  setPlaying(false);
}
    };

    loadTrack();
  }, [currentTrack]);

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
  }, [loopOne, shuffle, playNext]);

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
        shuffleOrder,
        shufflePointer,
      }),
    );
  }, [
    queue,
    currentIndex,
    currentTime,
    playing,
    loopOne,
    shuffle,
    shuffleOrder,
    shufflePointer,
    STORAGE_KEY,
  ]);

  const seekTo = (sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
  };

  const value = useMemo(
    () => ({
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
      reorderQueue,
      shuffleOrder,
      shufflePointer,
    }),
    [
      queue,
      currentTrack,
      currentIndex,
      playing,
      loopOne,
      shuffle,
      currentTime,
      duration,
      shuffleOrder,
      shufflePointer,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
