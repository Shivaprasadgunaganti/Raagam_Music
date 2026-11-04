// // // progress bar
// // import React, {
// //   createContext,
// //   useContext,
// //   useEffect,
// //   useRef,
// //   useState,
// //   useCallback,
// //   useMemo,
// // } from "react";
// // import useRecent from "../hooks/useRecent";
// // import { useAuth } from "./AuthContext";
// // import { supabase } from "../supabaseClient";
// // import { cacheWhenBuffered } from "../utils/cacheTrack";
// // import { getTrack } from "../utils/offlineCache";

// // const AudioContext = createContext(null);

// // // Tracks saved from the old YouTube integration have no audio source of
// // // their own. They can't be played anymore, so they are dropped when a
// // // saved queue is restored from localStorage.
// // const isLegacyYoutubeOnly = (t) =>
// //   !!t?.youtube_video_id && !t?.external_url && !t?.storage_path;

// // export function AudioProvider({ children }) {
// //   const { user } = useAuth();
// //   const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
// //   const audioRef = useRef(new Audio());
// //   const loadRequestRef = useRef(0);
// //   const playNextRef = useRef(() => {});
// //   const playPrevRef = useRef(() => {});
// //   const failedSkipsRef = useRef(0);
// //   const objectUrlRef = useRef(null); // current blob: URL (revoked when replaced)
// //   const stallTimerRef = useRef(null); // detects a stuck/buffering song
// //   const retryRef = useRef({ count: 0 }); // recovery attempts for current song
// //   const isSwitchingRef = useRef(false); // true while changing songs
// //   const { addRecent } = useRecent();
// //   const [resumeTime, setResumeTime] = useState(0);

// //   // Player states
// //   const [queue, setQueue] = useState([]);
// //   const [currentIndex, setCurrentIndex] = useState(-1);
// //   const [playing, setPlaying] = useState(false);
// //   const [loopOne, setLoopOne] = useState(false);
// //   const [shuffle, setShuffle] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);

// //   // NEW: States for shuffle order (prevents repeats within one loop)
// //   const [shuffleOrder, setShuffleOrder] = useState([]);
// //   const [shufflePointer, setShufflePointer] = useState(0);

// //   const saveProgress = async (trackId, position, duration) => {
// //     if (!user || !trackId) return;
// //     if (position < 5) return;

// //     await supabase.from("continue_listening").upsert(
// //       {
// //         user_id: user.id,
// //         track_id: trackId,
// //         last_position: Math.floor(position),
// //         duration: Math.floor(duration || 0),
// //         updated_at: new Date(),
// //       },
// //       {
// //         onConflict: "user_id,track_id",
// //       },
// //     );
// //   };

// //   const currentTrack =
// //     currentIndex >= 0 && currentIndex < queue.length
// //       ? queue[currentIndex]
// //       : null;

// //   // NEW: Fisher-Yates shuffle helper - creates one full order without repeats
// //   const buildShuffleOrder = useCallback((tracks, startIndex = 0) => {
// //     if (!tracks?.length) return { order: [], pointer: 0 };

// //     const indices = tracks.map((_, i) => i);
// //     const remaining = indices.filter((i) => i !== startIndex);

// //     // Fisher-Yates shuffle
// //     for (let i = remaining.length - 1; i > 0; i--) {
// //       const j = Math.floor(Math.random() * (i + 1));
// //       [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
// //     }

// //     const order = [startIndex, ...remaining];
// //     return { order, pointer: 0 };
// //   }, []);

// //   useEffect(() => {
// //     if (!STORAGE_KEY) return;

// //     const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

// //     if (!saved) return;

// //     let {
// //       queue: savedQueue,
// //       currentIndex: savedIndex,
// //       currentTime,
// //       wasPlaying,
// //       loopOne,
// //       shuffle,
// //       shuffleOrder,
// //       shufflePointer,
// //     } = saved;

// //     if (!savedQueue?.length) return;

// //     // Drop leftover YouTube-only tracks and remap the current index.
// //     const queue = savedQueue.filter((t) => !isLegacyYoutubeOnly(t));
// //     if (!queue.length) return;

// //     const removedCount = savedQueue.length - queue.length;
// //     let currentIndex = savedIndex;

// //     if (removedCount > 0) {
// //       const keptBefore = savedQueue
// //         .slice(0, Math.max(savedIndex, 0))
// //         .filter((t) => !isLegacyYoutubeOnly(t)).length;
// //       const currentWasKept =
// //         savedQueue[savedIndex] && !isLegacyYoutubeOnly(savedQueue[savedIndex]);

// //       currentIndex = Math.min(keptBefore, queue.length - 1);
// //       // The saved shuffle order refers to old indices, so reset it.
// //       shuffleOrder = [];
// //       shufflePointer = 0;
// //       if (!currentWasKept) {
// //         currentTime = 0;
// //         wasPlaying = false;
// //       }
// //     }

// //     setQueue(queue);
// //     setCurrentIndex(currentIndex);
// //     setLoopOne(loopOne);
// //     setShuffle(!!shuffle);
// //     setShuffleOrder(shuffleOrder || []);
// //     setShufflePointer(shufflePointer || 0);

// //     const audio = audioRef.current;

// //     setTimeout(() => {
// //       const track = queue[currentIndex];
// //       if (track) {
// //         audio.currentTime = currentTime || 0;

// //         if (wasPlaying) {
// //           audio.play().catch(() => {});
// //           setPlaying(true);
// //         }
// //       }
// //     }, 0);
// //   }, [STORAGE_KEY]);

// //   useEffect(() => {
// //     if (!currentTrack) return;

// //     const interval = setInterval(() => {
// //       if (!audioRef.current.paused) {
// //         saveProgress(
// //           currentTrack.id,
// //           audioRef.current.currentTime || 0,
// //           audioRef.current.duration || 0,
// //         );
// //       }
// //     }, 10000);

// //     return () => {
// //       clearInterval(interval);

// //       if (currentTrack) {
// //         saveProgress(
// //           currentTrack.id,
// //           audioRef.current.currentTime || 0,
// //           audioRef.current.duration || 0,
// //         );
// //       }
// //     };
// //   }, [currentTrack, user]);

// //   // FIXED: setNewQueue now also builds shuffle order if shuffle is on
// //   const setNewQueue = useCallback(
// //     (tracks, index) => {
// //       if (!tracks?.length) return;

// //       setQueue(tracks);
// //       setCurrentIndex(index);

// //       if (shuffle) {
// //         const { order, pointer } = buildShuffleOrder(tracks, index);
// //         setShuffleOrder(order);
// //         setShufflePointer(pointer);
// //       } else {
// //         setShuffleOrder([]);
// //         setShufflePointer(0);
// //       }
// //     },
// //     [shuffle, buildShuffleOrder],
// //   );

// //   // FIXED: playAll always uses original order, no shuffle
// //   const playAll = useCallback((tracks) => {
// //     if (!tracks?.length) return;

// //     setQueue(tracks);
// //     setCurrentIndex(0);
// //     setShuffle(false);
// //     setShuffleOrder([]);
// //     setShufflePointer(0);
// //   }, []);

// //   const shufflePlay = useCallback(
// //     (tracks) => {
// //       if (!tracks?.length) return;

// //       setQueue(tracks);
// //       setShuffle(true);

// //       const startIndex = Math.floor(Math.random() * tracks.length);

// //       const { order, pointer } = buildShuffleOrder(tracks, startIndex);

// //       setShuffleOrder(order);
// //       setShufflePointer(pointer);

// //       setCurrentIndex(order[pointer]);
// //     },
// //     [buildShuffleOrder],
// //   );

// //   const addToQueue = useCallback((track) => {
// //     if (!track) return;

// //     setQueue((prev) => {
// //       if (prev.some((t) => t.id === track.id)) return prev;
// //       return [...prev, track];
// //     });
// //   }, []);

// //   const playNextInsert = useCallback(
// //     (track) => {
// //       if (!track) return;

// //       setQueue((prev) => {
// //         if (!prev.length) {
// //           setCurrentIndex(0);
// //           return [track];
// //         }

// //         const newQueue = [...prev];
// //         newQueue.splice(currentIndex + 1, 0, track);
// //         return newQueue;
// //       });
// //     },
// //     [currentIndex],
// //   );

// //   const togglePlay = useCallback(() => {
// //     const audio = audioRef.current;
// //     if (!audio.src) return;

// //     if (audio.paused) {
// //       audio.play().then(() => setPlaying(true));
// //     } else {
// //       audio.pause();
// //       setPlaying(false);
// //     }
// //   }, []);

// //   // FIXED: playNext no longer picks random song, uses pre-built shuffle order
// //   const playNext = useCallback(() => {
// //     if (!queue.length) return;

// //     setCurrentIndex((current) => {
// //       if (shuffle) {
// //         // If no shuffle order exists yet, create one
// //         if (!shuffleOrder.length) {
// //           const { order, pointer } = buildShuffleOrder(
// //             queue,
// //             current >= 0 ? current : 0,
// //           );
// //           setShuffleOrder(order);
// //           setShufflePointer(pointer);
// //           return order[pointer];
// //         }

// //         const nextPointer = shufflePointer + 1;

// //         // If we haven't finished the loop yet, go to next song in shuffle order
// //         if (nextPointer < shuffleOrder.length) {
// //           setShufflePointer(nextPointer);
// //           return shuffleOrder[nextPointer];
// //         }

// //         // If we finished the loop, create a fresh shuffle order for the next cycle
// //         let nextStart = Math.floor(Math.random() * queue.length);

// //         // avoid immediate repeat of the just-finished last song
// //         const lastPlayed = shuffleOrder[shuffleOrder.length - 1];
// //         if (queue.length > 1) {
// //           while (nextStart === lastPlayed) {
// //             nextStart = Math.floor(Math.random() * queue.length);
// //           }
// //         }

// //         const { order, pointer } = buildShuffleOrder(queue, nextStart);
// //         setShuffleOrder(order);
// //         setShufflePointer(pointer);
// //         return order[pointer];
// //       }

// //       // Normal mode: go to next, and wrap to 0 at the end
// //       if (current + 1 < queue.length) {
// //         return current + 1;
// //       }

// //       return 0;
// //     });
// //   }, [queue, shuffle, shuffleOrder, shufflePointer, buildShuffleOrder]);

// //   // Keep a ref to the latest playNext so the load effect can skip a broken track.
// //   useEffect(() => {
// //     playNextRef.current = playNext;
// //   }, [playNext]);

// //   // FIXED: playPrev also uses shuffle order when shuffle is on
// //   const playPrev = useCallback(() => {
// //     if (!queue.length) return;

// //     setCurrentIndex((current) => {
// //       if (shuffle) {
// //         if (!shuffleOrder.length) return current;

// //         const prevPointer = shufflePointer - 1;

// //         if (prevPointer >= 0) {
// //           setShufflePointer(prevPointer);
// //           return shuffleOrder[prevPointer];
// //         }

// //         return shuffleOrder[0];
// //       }

// //       // Normal mode: go to previous, wrap to last song at beginning
// //       return current > 0 ? current - 1 : queue.length - 1;
// //     });
// //   }, [queue, shuffle, shuffleOrder, shufflePointer]);

// //   useEffect(() => {
// //     playPrevRef.current = playPrev;
// //   }, [playPrev]);

// //   const reorderQueue = useCallback((newQueue) => {
// //     setQueue(newQueue);
// //   }, []);

// //   const removeFromQueue = useCallback(
// //     (trackId) => {
// //       setQueue((prev) => {
// //         const updated = prev.filter((t) => t.id !== trackId);

// //         const removedIndex = prev.findIndex((t) => t.id === trackId);

// //         if (removedIndex < currentIndex) {
// //           setCurrentIndex((i) => i - 1);
// //         }

// //         return updated;
// //       });
// //     },
// //     [currentIndex],
// //   );

// //   // FIXED: clearQueue also clears shuffle states
// //   const clearQueue = useCallback(() => {
// //     setQueue([]);
// //     setCurrentIndex(-1);
// //     setShuffleOrder([]);
// //     setShufflePointer(0);
// //     audioRef.current.pause();
// //     audioRef.current.src = "";
// //     setPlaying(false);
// //   }, []);

// //   // ---------------------------------------------------------------------
// //   // LOAD + PLAY the selected song
// //   // ---------------------------------------------------------------------
// //   useEffect(() => {
// //     const requestId = ++loadRequestRef.current;
// //     let cancelled = false;
// //     const cacheAbort = new AbortController();

// //     const isCurrentRequest = () =>
// //       !cancelled && loadRequestRef.current === requestId;

// //     clearTimeout(stallTimerRef.current);
// //     retryRef.current = { count: 0 };

// //     const loadTrack = async () => {
// //       if (!currentTrack) return;

// //       const audio = audioRef.current;

// //       isSwitchingRef.current = true;
// //       audio.pause();

// //       try {
// //         // 1) Offline copy if we have one. A broken IndexedDB must NOT stop
// //         //    streaming, so errors here just fall through to the network URL.
// //         let src = "";
// //         try {
// //           const cachedBlob = await getTrack(currentTrack.id);
// //           if (!isCurrentRequest()) return;
// //           if (cachedBlob) src = URL.createObjectURL(cachedBlob);
// //         } catch (e) {
// //           console.warn("Offline lookup failed, streaming instead:", e);
// //         }

// //         // 2) Otherwise stream.
// //         if (!src) {
// //           src = currentTrack.external_url || currentTrack.storage_path || "";
// //         }
// //         if (!src) throw new Error("No playable audio source found.");

// //         const previousUrl = objectUrlRef.current;
// //         objectUrlRef.current = src.startsWith("blob:") ? src : null;

// //         audio.preload = "auto";
// //         audio.src = src;

// //         // Free the previous blob URL (it was leaking before).
// //         if (previousUrl) URL.revokeObjectURL(previousUrl);

// //         await audio.play();

// //         if (!isCurrentRequest()) return;

// //         isSwitchingRef.current = false;
// //         failedSkipsRef.current = 0;
// //         setPlaying(true);
// //         addRecent(currentTrack);

// //         // Cache for offline ONLY after the song is fully buffered, one at a
// //         // time, and cancel if the user changes song. Never competes with
// //         // streaming.
// //         if (!objectUrlRef.current) {
// //           cacheWhenBuffered(currentTrack, audio, cacheAbort.signal);
// //         }

// //         if (resumeTime > 0) {
// //           const timeToResume = resumeTime;
// //           setResumeTime(0);

// //           if (audio.readyState >= 1) {
// //             audio.currentTime = timeToResume;
// //           } else {
// //             audio.addEventListener(
// //               "loadedmetadata",
// //               () => {
// //                 if (isCurrentRequest()) {
// //                   audio.currentTime = Math.min(
// //                     timeToResume,
// //                     audio.duration || timeToResume,
// //                   );
// //                 }
// //               },
// //               { once: true },
// //             );
// //           }
// //         }

// //         saveProgress(currentTrack.id, 0, audio.duration);
// //       } catch (err) {
// //         if (!isCurrentRequest()) return;
// //         if (err.name === "AbortError") return;

// //         console.error("Audio playback failed:", err.name, err.message);
// //         isSwitchingRef.current = false;

// //         // Browser blocked play() (no user gesture / background). The song is
// //         // loaded, so just wait for the user to press play. Do not skip.
// //         if (err.name === "NotAllowedError") {
// //           setPlaying(false);
// //           return;
// //         }

// //         // Broken song: move on, but never loop more times than there are songs.
// //         if (failedSkipsRef.current < queue.length - 1) {
// //           failedSkipsRef.current += 1;
// //           playNextRef.current();
// //         } else {
// //           setPlaying(false);
// //         }
// //       }
// //     };

// //     loadTrack();

// //     return () => {
// //       cancelled = true;
// //       cacheAbort.abort(); // stop background caching of the previous song
// //     };
// //   }, [currentTrack]);

// //   // ---------------------------------------------------------------------
// //   // AUDIO ELEMENT EVENTS (progress, ended, stall/error recovery)
// //   // ---------------------------------------------------------------------
// //   useEffect(() => {
// //     const audio = audioRef.current;

// //     const clearStall = () => clearTimeout(stallTimerRef.current);

// //     // Try to revive a stuck/errored stream twice, then skip to next song.
// //     const recover = () => {
// //       if (!audio.getAttribute("src")) return;

// //       if (retryRef.current.count < 2) {
// //         retryRef.current.count += 1;
// //         const resumeAt = audio.currentTime || 0;

// //         audio.load();
// //         audio.addEventListener(
// //           "loadedmetadata",
// //           () => {
// //             if (resumeAt > 0) audio.currentTime = resumeAt;
// //             audio.play().catch(() => {});
// //           },
// //           { once: true },
// //         );
// //       } else if (failedSkipsRef.current < queue.length - 1) {
// //         failedSkipsRef.current += 1;
// //         playNextRef.current();
// //       } else {
// //         setPlaying(false);
// //       }
// //     };

// //     const onTime = () => {
// //       setCurrentTime(audio.currentTime);
// //       clearStall();
// //     };

// //     const onLoaded = () => setDuration(audio.duration || 0);

// //     const onPlaying = () => {
// //       isSwitchingRef.current = false;
// //       clearStall();
// //       setPlaying(true);
// //     };

// //     // Keeps UI correct when paused from lock screen / headset / notification.
// //     const onPause = () => {
// //       if (!isSwitchingRef.current && !audio.ended) setPlaying(false);
// //     };

// //     // Network hiccup: if nothing moves for 10s, kick the stream.
// //     const onWaiting = () => {
// //       clearStall();
// //       stallTimerRef.current = setTimeout(recover, 10000);
// //     };

// //     const onError = () => {
// //       clearStall();
// //       recover();
// //     };

// //     const onEnded = () => {
// //       if (loopOne || queue.length === 1) {
// //         // (a one-song queue never changes currentIndex, so restart it here)
// //         audio.currentTime = 0;
// //         audio.play().catch(() => {});
// //       } else {
// //         playNext();
// //       }
// //     };

// //     audio.addEventListener("timeupdate", onTime);
// //     audio.addEventListener("loadedmetadata", onLoaded);
// //     audio.addEventListener("playing", onPlaying);
// //     audio.addEventListener("pause", onPause);
// //     audio.addEventListener("waiting", onWaiting);
// //     audio.addEventListener("stalled", onWaiting);
// //     audio.addEventListener("error", onError);
// //     audio.addEventListener("ended", onEnded);

// //     return () => {
// //       clearStall();
// //       audio.removeEventListener("timeupdate", onTime);
// //       audio.removeEventListener("loadedmetadata", onLoaded);
// //       audio.removeEventListener("playing", onPlaying);
// //       audio.removeEventListener("pause", onPause);
// //       audio.removeEventListener("waiting", onWaiting);
// //       audio.removeEventListener("stalled", onWaiting);
// //       audio.removeEventListener("error", onError);
// //       audio.removeEventListener("ended", onEnded);
// //     };
// //   }, [loopOne, shuffle, playNext, queue.length]);

// //   // Coming back from lock screen / another app: resume if we should be playing.
// //   useEffect(() => {
// //     const onVisible = () => {
// //       const audio = audioRef.current;
// //       if (
// //         document.visibilityState === "visible" &&
// //         playing &&
// //         audio.paused &&
// //         !audio.ended &&
// //         audio.getAttribute("src")
// //       ) {
// //         audio.play().catch(() => {});
// //       }
// //     };
// //     document.addEventListener("visibilitychange", onVisible);
// //     return () => document.removeEventListener("visibilitychange", onVisible);
// //   }, [playing]);

// //   // ---------------------------------------------------------------------
// //   // MEDIA SESSION: lock-screen / notification controls (what Spotify and
// //   // JioSaavn use). Also marks this page as an active media player so
// //   // Android/iOS keep it alive when the screen is off.
// //   // ---------------------------------------------------------------------
// //   useEffect(() => {
// //     if (!("mediaSession" in navigator) || !currentTrack) return;

// //     navigator.mediaSession.metadata = new MediaMetadata({
// //       title: currentTrack.title || "",
// //       artist: currentTrack.artist || "",
// //       album: "Myraagam",
// //       artwork: currentTrack.cover_url
// //         ? [{ src: currentTrack.cover_url, sizes: "512x512" }]
// //         : [],
// //     });
// //   }, [currentTrack]);

// //   useEffect(() => {
// //     if (!("mediaSession" in navigator)) return;
// //     navigator.mediaSession.playbackState = playing ? "playing" : "paused";
// //   }, [playing]);

// //   useEffect(() => {
// //     if (!("mediaSession" in navigator)) return;
// //     const audio = audioRef.current;
// //     const ms = navigator.mediaSession;
// //     const set = (name, fn) => {
// //       try {
// //         ms.setActionHandler(name, fn);
// //       } catch {}
// //     };

// //     set("play", () => audio.play().catch(() => {}));
// //     set("pause", () => audio.pause());
// //     set("nexttrack", () => playNextRef.current());
// //     set("previoustrack", () => playPrevRef.current());
// //     set("seekto", (d) => {
// //       if (d.seekTime != null) audio.currentTime = d.seekTime;
// //     });

// //     return () => {
// //       ["play", "pause", "nexttrack", "previoustrack", "seekto"].forEach((a) =>
// //         set(a, null),
// //       );
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (!STORAGE_KEY) return;

// //     localStorage.setItem(
// //       STORAGE_KEY,
// //       JSON.stringify({
// //         queue,
// //         currentIndex,
// //         currentTime,
// //         wasPlaying: playing,
// //         loopOne,
// //         shuffle,
// //         shuffleOrder,
// //         shufflePointer,
// //       }),
// //     );
// //   }, [
// //     queue,
// //     currentIndex,
// //     currentTime,
// //     playing,
// //     loopOne,
// //     shuffle,
// //     shuffleOrder,
// //     shufflePointer,
// //     STORAGE_KEY,
// //   ]);

// //   const seekTo = (sec) => {
// //     const audio = audioRef.current;
// //     if (!audio) return;
// //     audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
// //   };

// //   const value = useMemo(
// //     () => ({
// //       audioRef,
// //       queue,
// //       currentTrack,
// //       currentIndex,
// //       playing,
// //       loopOne,
// //       shuffle,
// //       currentTime,
// //       duration,
// //       setNewQueue,
// //       setResumeTime,
// //       playAll,
// //       shufflePlay,
// //       addToQueue,
// //       playNextInsert,
// //       playNext,
// //       playPrev,
// //       togglePlay,
// //       setLoopOne,
// //       setShuffle,
// //       seekTo,
// //       removeFromQueue,
// //       clearQueue,
// //       reorderQueue,
// //       shuffleOrder,
// //       shufflePointer,
// //     }),
// //     [
// //       queue,
// //       currentTrack,
// //       currentIndex,
// //       playing,
// //       loopOne,
// //       shuffle,
// //       currentTime,
// //       duration,
// //       shuffleOrder,
// //       shufflePointer,
// //     ],
// //   );

// //   return (
// //     <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
// //   );
// // }

// // export function useAudio() {
// //   return useContext(AudioContext);
// // }


// // 
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useReducer,
//   useRef,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import useRecent from "../hooks/useRecent";
// import { useAuth } from "./AuthContext";
// import { supabase } from "../supabaseClient";
// import { cacheWhenBuffered } from "../utils/cacheTrack";
// import { getTrack } from "../utils/offlineCache";

// const AudioContext = createContext(null);

// // Only tracks with a real audio source can be played. Anything else left in a
// // saved queue (localStorage) from older versions is dropped when restoring.
// const isPlayable = (t) => !!(t?.external_url || t?.storage_path);

// // =========================================================================
// // QUEUE STATE (pure reducer)
// //
// // queue         : array of tracks (every id appears only once)
// // currentIndex  : index of the playing track in `queue`
// // shuffle       : shuffle on/off
// // shuffleOrder  : array of track IDS (not indexes!) in the order they will
// //                 play while shuffle is on. Because it stores ids, removing,
// //                 inserting or re-ordering songs can never leave it pointing
// //                 at a wrong / non-existent song.
// // shufflePointer: position of the current song inside shuffleOrder
// // =========================================================================
// // <reducer>
// const initialQueueState = {
//   queue: [],
//   currentIndex: -1,
//   shuffle: false,
//   shuffleOrder: [],
//   shufflePointer: 0,
// };

// const uniqueById = (tracks) => {
//   const seen = new Set();
//   return (tracks || []).filter((t) => {
//     if (!t || seen.has(t.id)) return false;
//     seen.add(t.id);
//     return true;
//   });
// };

// const shuffled = (arr) => {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// };

// // One full shuffled cycle that starts with `firstId`.
// const buildOrder = (queue, firstId) => [
//   firstId,
//   ...shuffled(queue.map((t) => t.id).filter((id) => id !== firstId)),
// ];

// const removeIdFromOrder = (order, pointer, id) => {
//   const at = order.indexOf(id);
//   if (at === -1) return { order, pointer };
//   const nextOrder = order.filter((x) => x !== id);
//   let nextPointer = at < pointer ? pointer - 1 : pointer;
//   nextPointer = Math.max(0, Math.min(nextPointer, nextOrder.length - 1));
//   return { order: nextOrder, pointer: nextPointer };
// };

// // Make sure shuffleOrder is valid for the current queue; rebuild if not.
// const normalizeShuffle = (state) => {
//   const { queue, currentIndex } = state;
//   const curId = queue[currentIndex]?.id ?? queue[0]?.id;
//   let { shuffleOrder: order, shufflePointer: pointer } = state;

//   const ids = new Set(queue.map((t) => t.id));
//   const valid =
//     order.length === queue.length &&
//     order.every((id) => ids.has(id)) &&
//     order[pointer] === curId;

//   if (!valid) {
//     order = buildOrder(queue, curId);
//     pointer = 0;
//   }
//   return { order, pointer };
// };

// function queueReducer(state, action) {
//   switch (action.type) {
//     case "RESTORE":
//       return action.state;

//     case "SET_QUEUE": {
//       const queue = uniqueById(action.tracks);
//       if (!queue.length) return state;

//       const wanted = action.tracks[action.index];
//       let index = queue.findIndex((t) => t.id === wanted?.id);
//       if (index < 0) index = 0;
//       const id = queue[index].id;

//       if (!state.shuffle) {
//         return {
//           ...state,
//           queue,
//           currentIndex: index,
//           shuffleOrder: [],
//           shufflePointer: 0,
//         };
//       }

//       // Same songs as before (e.g. tapping a song inside the Queue page):
//       // keep the existing shuffled order and just jump to that song.
//       const inOrder = new Set(state.shuffleOrder);
//       const sameSongs =
//         queue.length === state.shuffleOrder.length &&
//         queue.every((t) => inOrder.has(t.id));

//       if (sameSongs) {
//         return {
//           ...state,
//           queue,
//           currentIndex: index,
//           shufflePointer: state.shuffleOrder.indexOf(id),
//         };
//       }

//       return {
//         ...state,
//         queue,
//         currentIndex: index,
//         shuffleOrder: buildOrder(queue, id),
//         shufflePointer: 0,
//       };
//     }

//     case "PLAY_ALL": {
//       const queue = uniqueById(action.tracks);
//       if (!queue.length) return state;
//       return {
//         queue,
//         currentIndex: 0,
//         shuffle: false,
//         shuffleOrder: [],
//         shufflePointer: 0,
//       };
//     }

//     case "SHUFFLE_PLAY": {
//       const queue = uniqueById(action.tracks);
//       if (!queue.length) return state;
//       const start = Math.floor(Math.random() * queue.length);
//       return {
//         queue,
//         currentIndex: start,
//         shuffle: true,
//         shuffleOrder: buildOrder(queue, queue[start].id),
//         shufflePointer: 0,
//       };
//     }

//     case "ADD": {
//       const track = action.track;
//       if (!track || state.queue.some((t) => t.id === track.id)) return state;

//       const queue = [...state.queue, track];
//       if (!state.queue.length) {
//         return {
//           ...state,
//           queue,
//           currentIndex: 0,
//           shuffleOrder: state.shuffle ? [track.id] : [],
//           shufflePointer: 0,
//         };
//       }
//       return {
//         ...state,
//         queue,
//         // in shuffle mode the new song plays at the end of the current cycle
//         shuffleOrder: state.shuffle
//           ? [...state.shuffleOrder, track.id]
//           : state.shuffleOrder,
//       };
//     }

//     case "INSERT_NEXT": {
//       const track = action.track;
//       if (!track) return state;

//       if (!state.queue.length) {
//         return {
//           ...state,
//           queue: [track],
//           currentIndex: 0,
//           shuffleOrder: state.shuffle ? [track.id] : [],
//           shufflePointer: 0,
//         };
//       }

//       const existing = state.queue.findIndex((t) => t.id === track.id);
//       if (existing === state.currentIndex) return state; // already playing

//       const queue = [...state.queue];
//       let cur = state.currentIndex;
//       let order = state.shuffleOrder;
//       let pointer = state.shufflePointer;

//       // Already in the queue: move it instead of adding a duplicate.
//       if (existing >= 0) {
//         queue.splice(existing, 1);
//         if (existing < cur) cur -= 1;
//         if (state.shuffle) {
//           const r = removeIdFromOrder(order, pointer, track.id);
//           order = r.order;
//           pointer = r.pointer;
//         }
//       }

//       queue.splice(cur + 1, 0, track);

//       if (state.shuffle) {
//         order = [...order];
//         order.splice(pointer + 1, 0, track.id);
//       }

//       return {
//         ...state,
//         queue,
//         currentIndex: cur,
//         shuffleOrder: order,
//         shufflePointer: pointer,
//       };
//     }

//     case "REORDER": {
//       const queue = uniqueById(action.queue);
//       if (!queue.length) return state;
//       // keep playing the same song, wherever it moved to
//       const curId = state.queue[state.currentIndex]?.id;
//       const at = queue.findIndex((t) => t.id === curId);
//       return {
//         ...state,
//         queue,
//         currentIndex: at >= 0 ? at : Math.min(state.currentIndex, queue.length - 1),
//       };
//     }

//     case "REMOVE": {
//       const at = state.queue.findIndex((t) => t.id === action.id);
//       if (at === -1) return state;

//       const queue = state.queue.filter((t) => t.id !== action.id);
//       let cur = state.currentIndex;
//       if (at < cur) cur -= 1;
//       else if (at === cur) cur = Math.min(cur, queue.length - 1);
//       if (!queue.length) cur = -1;

//       let order = state.shuffleOrder;
//       let pointer = state.shufflePointer;
//       if (state.shuffle) {
//         const removingCurrent = at === state.currentIndex;
//         const r = removeIdFromOrder(order, pointer, action.id);
//         order = r.order;
//         pointer = r.pointer;

//         if (removingCurrent && queue.length) {
//           // The slot at `pointer` now holds the next song in shuffle order
//           // (wrap to the start of the cycle if the removed song was last).
//           if (state.shufflePointer >= order.length) pointer = 0;
//           cur = queue.findIndex((t) => t.id === order[pointer]);
//         }
//       }

//       return {
//         ...state,
//         queue,
//         currentIndex: cur,
//         shuffleOrder: order,
//         shufflePointer: pointer,
//       };
//     }

//     case "CLEAR":
//       return { ...initialQueueState, shuffle: state.shuffle };

//     case "SET_SHUFFLE": {
//       const next =
//         typeof action.value === "function"
//           ? action.value(state.shuffle)
//           : action.value;
//       if (!!next === state.shuffle) return state;

//       if (!next) {
//         return { ...state, shuffle: false, shuffleOrder: [], shufflePointer: 0 };
//       }
//       const curId = state.queue[state.currentIndex]?.id;
//       return {
//         ...state,
//         shuffle: true,
//         shuffleOrder: curId != null ? buildOrder(state.queue, curId) : [],
//         shufflePointer: 0,
//       };
//     }

//     case "NEXT": {
//       const n = state.queue.length;
//       if (!n) return state;

//       if (!state.shuffle) {
//         return { ...state, currentIndex: (state.currentIndex + 1) % n };
//       }

//       let { order, pointer } = normalizeShuffle(state);

//       if (pointer + 1 < order.length) {
//         pointer += 1;
//       } else {
//         // Cycle finished: new shuffled cycle, never starting with the song
//         // that just played.
//         const lastId = order[order.length - 1];
//         order = shuffled(state.queue.map((t) => t.id));
//         if (order.length > 1 && order[0] === lastId) {
//           [order[0], order[1]] = [order[1], order[0]];
//         }
//         pointer = 0;
//       }

//       const index = state.queue.findIndex((t) => t.id === order[pointer]);
//       return {
//         ...state,
//         currentIndex: index,
//         shuffleOrder: order,
//         shufflePointer: pointer,
//       };
//     }

//     case "PREV": {
//       const n = state.queue.length;
//       if (!n) return state;

//       if (!state.shuffle) {
//         const cur = state.currentIndex;
//         return { ...state, currentIndex: cur > 0 ? cur - 1 : n - 1 };
//       }

//       let { order, pointer } = normalizeShuffle(state);
//       if (pointer > 0) pointer -= 1;

//       const index = state.queue.findIndex((t) => t.id === order[pointer]);
//       return {
//         ...state,
//         currentIndex: index,
//         shuffleOrder: order,
//         shufflePointer: pointer,
//       };
//     }

//     default:
//       return state;
//   }
// }
// // </reducer>

// export function AudioProvider({ children }) {
//   const { user } = useAuth();
//   const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
//   const audioRef = useRef(new Audio());
//   const loadRequestRef = useRef(0);
//   const failedSkipsRef = useRef(0);
//   const objectUrlRef = useRef(null); // current blob: URL (revoked when replaced)
//   const stallTimerRef = useRef(null); // detects a stuck/buffering song
//   const retryRef = useRef({ count: 0 }); // recovery attempts for current song
//   const isSwitchingRef = useRef(false); // true while changing songs
//   const pendingSeekRef = useRef(0); // position to restore after a page refresh
//   const autoplayRef = useRef(true); // false only for the restored song
//   const persistRef = useRef(() => {});
//   const { addRecent } = useRecent();
//   const [resumeTime, setResumeTime] = useState(0);

//   // Queue state lives in ONE pure reducer (see top of file).
//   const [qs, dispatch] = useReducer(queueReducer, initialQueueState);
//   const { queue, currentIndex, shuffle, shuffleOrder, shufflePointer } = qs;

//   // Player states
//   const [playing, setPlaying] = useState(false);
//   const [loopOne, setLoopOne] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const saveProgress = async (trackId, position, duration) => {
//     if (!user || !trackId) return;
//     if (position < 5) return;

//     await supabase.from("continue_listening").upsert(
//       {
//         user_id: user.id,
//         track_id: trackId,
//         last_position: Math.floor(position),
//         duration: Math.floor(duration || 0),
//         updated_at: new Date(),
//       },
//       {
//         onConflict: "user_id,track_id",
//       },
//     );
//   };

//   const currentTrack =
//     currentIndex >= 0 && currentIndex < queue.length
//       ? queue[currentIndex]
//       : null;

//   // ---------------------------------------------------------------------
//   // Queue actions (all stable: they only dispatch)
//   // ---------------------------------------------------------------------
//   const setNewQueue = useCallback(
//     (tracks, index) => dispatch({ type: "SET_QUEUE", tracks, index }),
//     [],
//   );
//   const playAll = useCallback(
//     (tracks) => dispatch({ type: "PLAY_ALL", tracks }),
//     [],
//   );
//   const shufflePlay = useCallback(
//     (tracks) => dispatch({ type: "SHUFFLE_PLAY", tracks }),
//     [],
//   );
//   const addToQueue = useCallback(
//     (track) => dispatch({ type: "ADD", track }),
//     [],
//   );
//   const playNextInsert = useCallback(
//     (track) => dispatch({ type: "INSERT_NEXT", track }),
//     [],
//   );
//   const reorderQueue = useCallback(
//     (newQueue) => dispatch({ type: "REORDER", queue: newQueue }),
//     [],
//   );
//   const removeFromQueue = useCallback(
//     (id) => dispatch({ type: "REMOVE", id }),
//     [],
//   );
//   // accepts a boolean OR a function, like a normal useState setter
//   const setShuffle = useCallback(
//     (value) => dispatch({ type: "SET_SHUFFLE", value }),
//     [],
//   );
//   const playNext = useCallback(() => dispatch({ type: "NEXT" }), []);

//   // Like Spotify: after 3 seconds, "previous" restarts the song first.
//   const playPrev = useCallback(() => {
//     const audio = audioRef.current;
//     if (audio.getAttribute("src") && audio.currentTime > 3) {
//       audio.currentTime = 0;
//       return;
//     }
//     dispatch({ type: "PREV" });
//   }, []);

//   const clearQueue = useCallback(() => {
//     dispatch({ type: "CLEAR" });

//     const audio = audioRef.current;
//     audio.pause();
//     audio.removeAttribute("src");
//     audio.load();

//     if (objectUrlRef.current) {
//       URL.revokeObjectURL(objectUrlRef.current);
//       objectUrlRef.current = null;
//     }

//     setPlaying(false);
//     setCurrentTime(0);
//     setDuration(0);

//     if (STORAGE_KEY) {
//       try {
//         localStorage.removeItem(STORAGE_KEY);
//       } catch {}
//     }
//   }, [STORAGE_KEY]);

//   const togglePlay = useCallback(() => {
//     const audio = audioRef.current;
//     if (!audio.getAttribute("src")) return;

//     if (audio.paused) {
//       audio
//         .play()
//         .then(() => setPlaying(true))
//         .catch(() => {});
//     } else {
//       audio.pause();
//       setPlaying(false);
//     }
//   }, []);

//   // ---------------------------------------------------------------------
//   // RESTORE the saved queue after a refresh / re-login.
//   // The song comes back PAUSED at the saved position (browsers block
//   // autoplay on page load anyway, and it avoids surprise sound).
//   // ---------------------------------------------------------------------
//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     let saved = null;
//     try {
//       saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
//     } catch {
//       saved = null;
//     }
//     if (!saved?.queue?.length) return;

//     const restoredQueue = uniqueById(saved.queue.filter(isPlayable));
//     if (!restoredQueue.length) return;

//     const savedId = saved.queue[saved.currentIndex]?.id;
//     let index = restoredQueue.findIndex((t) => t.id === savedId);
//     const currentKept = index >= 0;
//     if (!currentKept) index = 0;

//     const shuffleOn = !!saved.shuffle;
//     let order = [];
//     let pointer = 0;

//     if (shuffleOn) {
//       const ids = new Set(restoredQueue.map((t) => t.id));
//       const savedOrder = Array.isArray(saved.shuffleOrder)
//         ? saved.shuffleOrder
//         : [];
//       const savedPointer = saved.shufflePointer || 0;
//       const valid =
//         savedOrder.length === restoredQueue.length &&
//         savedOrder.every((id) => ids.has(id)) &&
//         savedOrder[savedPointer] === restoredQueue[index].id;

//       if (valid) {
//         order = savedOrder;
//         pointer = savedPointer;
//       } else {
//         order = buildOrder(restoredQueue, restoredQueue[index].id);
//       }
//     }

//     pendingSeekRef.current = currentKept ? saved.currentTime || 0 : 0;
//     autoplayRef.current = false;

//     setLoopOne(!!saved.loopOne);
//     dispatch({
//       type: "RESTORE",
//       state: {
//         queue: restoredQueue,
//         currentIndex: index,
//         shuffle: shuffleOn,
//         shuffleOrder: order,
//         shufflePointer: pointer,
//       },
//     });
//   }, [STORAGE_KEY]);

//   useEffect(() => {
//     if (!currentTrack) return;

//     const interval = setInterval(() => {
//       if (!audioRef.current.paused) {
//         saveProgress(
//           currentTrack.id,
//           audioRef.current.currentTime || 0,
//           audioRef.current.duration || 0,
//         );
//       }
//     }, 10000);

//     return () => {
//       clearInterval(interval);

//       if (currentTrack) {
//         saveProgress(
//           currentTrack.id,
//           audioRef.current.currentTime || 0,
//           audioRef.current.duration || 0,
//         );
//       }
//     };
//   }, [currentTrack, user]);

//   // ---------------------------------------------------------------------
//   // LOAD + PLAY the selected song
//   // ---------------------------------------------------------------------
//   useEffect(() => {
//     const requestId = ++loadRequestRef.current;
//     let cancelled = false;
//     const cacheAbort = new AbortController();

//     const isCurrentRequest = () =>
//       !cancelled && loadRequestRef.current === requestId;

//     clearTimeout(stallTimerRef.current);
//     retryRef.current = { count: 0 };

//     const loadTrack = async () => {
//       if (!currentTrack) return;

//       const audio = audioRef.current;

//       isSwitchingRef.current = true;
//       audio.pause();

//       // Restored-after-refresh song: load it paused at the saved position.
//       const shouldAutoplay = autoplayRef.current;
//       const startAt = resumeTime > 0 ? resumeTime : pendingSeekRef.current;
//       autoplayRef.current = true;
//       pendingSeekRef.current = 0;

//       try {
//         // 1) Offline copy if we have one. A broken IndexedDB must NOT stop
//         //    streaming, so errors here just fall through to the network URL.
//         let src = "";
//         try {
//           const cachedBlob = await getTrack(currentTrack.id);
//           if (!isCurrentRequest()) return;
//           if (cachedBlob) src = URL.createObjectURL(cachedBlob);
//         } catch (e) {
//           console.warn("Offline lookup failed, streaming instead:", e);
//         }

//         // 2) Otherwise stream.
//         if (!src) {
//           src = currentTrack.external_url || currentTrack.storage_path || "";
//         }
//         if (!src) throw new Error("No playable audio source found.");

//         const previousUrl = objectUrlRef.current;
//         objectUrlRef.current = src.startsWith("blob:") ? src : null;

//         // A restored (paused) song only needs metadata, not the whole file.
//         audio.preload = shouldAutoplay ? "auto" : "metadata";
//         audio.src = src;

//         // Free the previous blob URL (it was leaking before).
//         if (previousUrl) URL.revokeObjectURL(previousUrl);

//         if (startAt > 0) {
//           if (resumeTime > 0) setResumeTime(0);
//           audio.addEventListener(
//             "loadedmetadata",
//             () => {
//               if (isCurrentRequest()) {
//                 audio.currentTime = Math.min(
//                   startAt,
//                   audio.duration || startAt,
//                 );
//               }
//             },
//             { once: true },
//           );
//         }

//         if (!shouldAutoplay) {
//           isSwitchingRef.current = false;
//           setPlaying(false);
//           return;
//         }

//         await audio.play();

//         if (!isCurrentRequest()) return;

//         isSwitchingRef.current = false;
//         failedSkipsRef.current = 0;
//         setPlaying(true);
//         addRecent(currentTrack);

//         // Cache for offline ONLY after the song is fully buffered, one at a
//         // time, and cancel if the user changes song. Never competes with
//         // streaming.
//         if (!objectUrlRef.current) {
//           cacheWhenBuffered(currentTrack, audio, cacheAbort.signal);
//         }

//         saveProgress(currentTrack.id, 0, audio.duration);
//       } catch (err) {
//         if (!isCurrentRequest()) return;
//         if (err.name === "AbortError") return;

//         console.error("Audio playback failed:", err.name, err.message);
//         isSwitchingRef.current = false;

//         // Browser blocked play() (no user gesture / background). The song is
//         // loaded, so just wait for the user to press play. Do not skip.
//         if (err.name === "NotAllowedError") {
//           setPlaying(false);
//           return;
//         }

//         // Broken song: move on, but never loop more times than there are songs.
//         if (failedSkipsRef.current < queue.length - 1) {
//           failedSkipsRef.current += 1;
//           playNext();
//         } else {
//           setPlaying(false);
//         }
//       }
//     };

//     loadTrack();

//     return () => {
//       cancelled = true;
//       cacheAbort.abort(); // stop background caching of the previous song
//     };
//   }, [currentTrack]);

//   // ---------------------------------------------------------------------
//   // AUDIO ELEMENT EVENTS (progress, ended, stall/error recovery)
//   // ---------------------------------------------------------------------
//   useEffect(() => {
//     const audio = audioRef.current;

//     const clearStall = () => clearTimeout(stallTimerRef.current);

//     // Try to revive a stuck/errored stream twice, then skip to next song.
//     const recover = () => {
//       if (!audio.getAttribute("src")) return;

//       if (retryRef.current.count < 2) {
//         retryRef.current.count += 1;
//         const resumeAt = audio.currentTime || 0;

//         audio.load();
//         audio.addEventListener(
//           "loadedmetadata",
//           () => {
//             if (resumeAt > 0) audio.currentTime = resumeAt;
//             audio.play().catch(() => {});
//           },
//           { once: true },
//         );
//       } else if (failedSkipsRef.current < queue.length - 1) {
//         failedSkipsRef.current += 1;
//         playNext();
//       } else {
//         setPlaying(false);
//       }
//     };

//     const onTime = () => {
//       setCurrentTime(audio.currentTime);
//       clearStall();
//     };

//     const onLoaded = () => setDuration(audio.duration || 0);

//     const onPlaying = () => {
//       isSwitchingRef.current = false;
//       clearStall();
//       setPlaying(true);
//     };

//     // Keeps UI correct when paused from lock screen / headset / notification.
//     const onPause = () => {
//       if (!isSwitchingRef.current && !audio.ended) setPlaying(false);
//     };

//     // Network hiccup: if nothing moves for 10s, kick the stream.
//     const onWaiting = () => {
//       clearStall();
//       stallTimerRef.current = setTimeout(recover, 10000);
//     };

//     const onError = () => {
//       clearStall();
//       recover();
//     };

//     const onEnded = () => {
//       if (loopOne) {
//         audio.currentTime = 0;
//         audio.play().catch(() => {});
//       } else if (queue.length === 1) {
//         // Nothing else to play: stop at the start of the song.
//         audio.pause();
//         audio.currentTime = 0;
//         setPlaying(false);
//       } else {
//         playNext();
//       }
//     };

//     audio.addEventListener("timeupdate", onTime);
//     audio.addEventListener("loadedmetadata", onLoaded);
//     audio.addEventListener("playing", onPlaying);
//     audio.addEventListener("pause", onPause);
//     audio.addEventListener("waiting", onWaiting);
//     audio.addEventListener("stalled", onWaiting);
//     audio.addEventListener("error", onError);
//     audio.addEventListener("ended", onEnded);

//     return () => {
//       clearStall();
//       audio.removeEventListener("timeupdate", onTime);
//       audio.removeEventListener("loadedmetadata", onLoaded);
//       audio.removeEventListener("playing", onPlaying);
//       audio.removeEventListener("pause", onPause);
//       audio.removeEventListener("waiting", onWaiting);
//       audio.removeEventListener("stalled", onWaiting);
//       audio.removeEventListener("error", onError);
//       audio.removeEventListener("ended", onEnded);
//     };
//   }, [loopOne, playNext, queue.length]);

//   // Coming back from lock screen / another app: resume if we should be playing.
//   useEffect(() => {
//     const onVisible = () => {
//       const audio = audioRef.current;
//       if (
//         document.visibilityState === "visible" &&
//         playing &&
//         audio.paused &&
//         !audio.ended &&
//         audio.getAttribute("src")
//       ) {
//         audio.play().catch(() => {});
//       }
//     };
//     document.addEventListener("visibilitychange", onVisible);
//     return () => document.removeEventListener("visibilitychange", onVisible);
//   }, [playing]);

//   // ---------------------------------------------------------------------
//   // MEDIA SESSION: lock-screen / notification controls (what Spotify and
//   // JioSaavn use). Also marks this page as an active media player so
//   // Android/iOS keep it alive when the screen is off.
//   // ---------------------------------------------------------------------
//   useEffect(() => {
//     if (!("mediaSession" in navigator) || !currentTrack) return;

//     navigator.mediaSession.metadata = new MediaMetadata({
//       title: currentTrack.title || "",
//       artist: currentTrack.artist || "",
//       album: "Myraagam",
//       artwork: currentTrack.cover_url
//         ? [{ src: currentTrack.cover_url, sizes: "512x512" }]
//         : [],
//     });
//   }, [currentTrack]);

//   useEffect(() => {
//     if (!("mediaSession" in navigator)) return;
//     navigator.mediaSession.playbackState = playing ? "playing" : "paused";
//   }, [playing]);

//   useEffect(() => {
//     if (!("mediaSession" in navigator)) return;
//     const audio = audioRef.current;
//     const ms = navigator.mediaSession;
//     const set = (name, fn) => {
//       try {
//         ms.setActionHandler(name, fn);
//       } catch {}
//     };

//     set("play", () => audio.play().catch(() => {}));
//     set("pause", () => audio.pause());
//     set("nexttrack", () => playNext());
//     set("previoustrack", () => playPrev());
//     set("seekto", (d) => {
//       if (d.seekTime != null) audio.currentTime = d.seekTime;
//     });

//     return () => {
//       ["play", "pause", "nexttrack", "previoustrack", "seekto"].forEach((a) =>
//         set(a, null),
//       );
//     };
//   }, [playNext, playPrev]);

//   // ---------------------------------------------------------------------
//   // SAVE the queue so it survives a refresh.
//   // The (big) queue is written only when it changes; the playback position
//   // is written every 5s, and when the tab is hidden/closed. (Before, the whole
//   // queue was re-saved ~4 times per second.)
//   // ---------------------------------------------------------------------
//   useEffect(() => {
//     persistRef.current = () => {
//       // Empty queue: nothing to save (clearQueue removes the key itself).
//       if (!STORAGE_KEY || !queue.length) return;
//       const audio = audioRef.current;
//       try {
//         localStorage.setItem(
//           STORAGE_KEY,
//           JSON.stringify({
//             queue,
//             currentIndex,
//             currentTime: isSwitchingRef.current ? 0 : audio.currentTime || 0,
//             wasPlaying: playing,
//             loopOne,
//             shuffle,
//             shuffleOrder,
//             shufflePointer,
//           }),
//         );
//       } catch {
//         // storage full / blocked: playback must never depend on it
//       }
//     };
//   });

//   useEffect(() => {
//     persistRef.current();
//   }, [qs, loopOne, playing, STORAGE_KEY]);

//   useEffect(() => {
//     const save = () => persistRef.current();
//     const onHide = () => {
//       if (document.visibilityState === "hidden") save();
//     };

//     const interval = setInterval(save, 5000);
//     window.addEventListener("pagehide", save);
//     document.addEventListener("visibilitychange", onHide);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("pagehide", save);
//       document.removeEventListener("visibilitychange", onHide);
//     };
//   }, []);

//   const seekTo = useCallback((sec) => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
//   }, []);

//   const value = useMemo(
//     () => ({
//       audioRef,
//       queue,
//       currentTrack,
//       currentIndex,
//       playing,
//       loopOne,
//       shuffle,
//       currentTime,
//       duration,
//       setNewQueue,
//       setResumeTime,
//       playAll,
//       shufflePlay,
//       addToQueue,
//       playNextInsert,
//       playNext,
//       playPrev,
//       togglePlay,
//       setLoopOne,
//       setShuffle,
//       seekTo,
//       removeFromQueue,
//       clearQueue,
//       reorderQueue,
//       shuffleOrder,
//       shufflePointer,
//     }),
//     [
//       queue,
//       currentTrack,
//       currentIndex,
//       playing,
//       loopOne,
//       shuffle,
//       currentTime,
//       duration,
//       shuffleOrder,
//       shufflePointer,
//       setNewQueue,
//       playAll,
//       shufflePlay,
//       addToQueue,
//       playNextInsert,
//       playNext,
//       playPrev,
//       togglePlay,
//       setShuffle,
//       seekTo,
//       removeFromQueue,
//       clearQueue,
//       reorderQueue,
//     ],
//   );

//   return (
//     <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
//   );
// }

// export function useAudio() {
//   return useContext(AudioContext);
// }


// 

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import useRecent from "../hooks/useRecent";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";
import { cacheWhenBuffered } from "../utils/cacheTrack";
import { getTrack } from "../utils/offlineCache";

const AudioContext = createContext(null);

// Only tracks with a real audio source can be played. Anything else left in a
// saved queue (localStorage) from older versions is dropped when restoring.
const isPlayable = (t) => !!(t?.external_url || t?.storage_path);

// =========================================================================
// QUEUE STATE (pure reducer)
//
// queue         : array of tracks (every id appears only once)
// currentIndex  : index of the playing track in `queue`
// shuffle       : shuffle on/off
// shuffleOrder  : array of track IDS (not indexes!) in the order they will
//                 play while shuffle is on. Because it stores ids, removing,
//                 inserting or re-ordering songs can never leave it pointing
//                 at a wrong / non-existent song.
// shufflePointer: position of the current song inside shuffleOrder
// =========================================================================
// <reducer>
const initialQueueState = {
  queue: [],
  currentIndex: -1,
  shuffle: false,
  shuffleOrder: [],
  shufflePointer: 0,
};

const uniqueById = (tracks) => {
  const seen = new Set();
  return (tracks || []).filter((t) => {
    if (!t || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
};

const shuffled = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// One full shuffled cycle that starts with `firstId`.
const buildOrder = (queue, firstId) => [
  firstId,
  ...shuffled(queue.map((t) => t.id).filter((id) => id !== firstId)),
];

const removeIdFromOrder = (order, pointer, id) => {
  const at = order.indexOf(id);
  if (at === -1) return { order, pointer };
  const nextOrder = order.filter((x) => x !== id);
  let nextPointer = at < pointer ? pointer - 1 : pointer;
  nextPointer = Math.max(0, Math.min(nextPointer, nextOrder.length - 1));
  return { order: nextOrder, pointer: nextPointer };
};

// Make sure shuffleOrder is valid for the current queue; rebuild if not.
const normalizeShuffle = (state) => {
  const { queue, currentIndex } = state;
  const curId = queue[currentIndex]?.id ?? queue[0]?.id;
  let { shuffleOrder: order, shufflePointer: pointer } = state;

  const ids = new Set(queue.map((t) => t.id));
  const valid =
    order.length === queue.length &&
    order.every((id) => ids.has(id)) &&
    order[pointer] === curId;

  if (!valid) {
    order = buildOrder(queue, curId);
    pointer = 0;
  }
  return { order, pointer };
};

function queueReducer(state, action) {
  switch (action.type) {
    case "RESTORE":
    case "REPLACE":
      return action.state;

    case "SET_QUEUE": {
      const queue = uniqueById(action.tracks);
      if (!queue.length) return state;

      const wanted = action.tracks[action.index];
      let index = queue.findIndex((t) => t.id === wanted?.id);
      if (index < 0) index = 0;
      const id = queue[index].id;

      if (!state.shuffle) {
        return {
          ...state,
          queue,
          currentIndex: index,
          shuffleOrder: [],
          shufflePointer: 0,
        };
      }

      // Same songs as before (e.g. tapping a song inside the Queue page):
      // keep the existing shuffled order and just jump to that song.
      const inOrder = new Set(state.shuffleOrder);
      const sameSongs =
        queue.length === state.shuffleOrder.length &&
        queue.every((t) => inOrder.has(t.id));

      if (sameSongs) {
        return {
          ...state,
          queue,
          currentIndex: index,
          shufflePointer: state.shuffleOrder.indexOf(id),
        };
      }

      return {
        ...state,
        queue,
        currentIndex: index,
        shuffleOrder: buildOrder(queue, id),
        shufflePointer: 0,
      };
    }

    case "PLAY_ALL": {
      const queue = uniqueById(action.tracks);
      if (!queue.length) return state;
      return {
        queue,
        currentIndex: 0,
        shuffle: false,
        shuffleOrder: [],
        shufflePointer: 0,
      };
    }

    case "SHUFFLE_PLAY": {
      const queue = uniqueById(action.tracks);
      if (!queue.length) return state;
      const start = Math.floor(Math.random() * queue.length);
      return {
        queue,
        currentIndex: start,
        shuffle: true,
        shuffleOrder: buildOrder(queue, queue[start].id),
        shufflePointer: 0,
      };
    }

    case "ADD": {
      const track = action.track;
      if (!track || state.queue.some((t) => t.id === track.id)) return state;

      const queue = [...state.queue, track];
      if (!state.queue.length) {
        return {
          ...state,
          queue,
          currentIndex: 0,
          shuffleOrder: state.shuffle ? [track.id] : [],
          shufflePointer: 0,
        };
      }
      return {
        ...state,
        queue,
        // in shuffle mode the new song plays at the end of the current cycle
        shuffleOrder: state.shuffle
          ? [...state.shuffleOrder, track.id]
          : state.shuffleOrder,
      };
    }

    case "INSERT_NEXT": {
      const track = action.track;
      if (!track) return state;

      if (!state.queue.length) {
        return {
          ...state,
          queue: [track],
          currentIndex: 0,
          shuffleOrder: state.shuffle ? [track.id] : [],
          shufflePointer: 0,
        };
      }

      const existing = state.queue.findIndex((t) => t.id === track.id);
      if (existing === state.currentIndex) return state; // already playing

      const queue = [...state.queue];
      let cur = state.currentIndex;
      let order = state.shuffleOrder;
      let pointer = state.shufflePointer;

      // Already in the queue: move it instead of adding a duplicate.
      if (existing >= 0) {
        queue.splice(existing, 1);
        if (existing < cur) cur -= 1;
        if (state.shuffle) {
          const r = removeIdFromOrder(order, pointer, track.id);
          order = r.order;
          pointer = r.pointer;
        }
      }

      queue.splice(cur + 1, 0, track);

      if (state.shuffle) {
        order = [...order];
        order.splice(pointer + 1, 0, track.id);
      }

      return {
        ...state,
        queue,
        currentIndex: cur,
        shuffleOrder: order,
        shufflePointer: pointer,
      };
    }

    case "REORDER": {
      const queue = uniqueById(action.queue);
      if (!queue.length) return state;
      // keep playing the same song, wherever it moved to
      const curId = state.queue[state.currentIndex]?.id;
      const at = queue.findIndex((t) => t.id === curId);
      return {
        ...state,
        queue,
        currentIndex: at >= 0 ? at : Math.min(state.currentIndex, queue.length - 1),
      };
    }

    case "REMOVE": {
      const at = state.queue.findIndex((t) => t.id === action.id);
      if (at === -1) return state;

      const queue = state.queue.filter((t) => t.id !== action.id);
      let cur = state.currentIndex;
      if (at < cur) cur -= 1;
      else if (at === cur) cur = Math.min(cur, queue.length - 1);
      if (!queue.length) cur = -1;

      let order = state.shuffleOrder;
      let pointer = state.shufflePointer;
      if (state.shuffle) {
        const removingCurrent = at === state.currentIndex;
        const r = removeIdFromOrder(order, pointer, action.id);
        order = r.order;
        pointer = r.pointer;

        if (removingCurrent && queue.length) {
          // The slot at `pointer` now holds the next song in shuffle order
          // (wrap to the start of the cycle if the removed song was last).
          if (state.shufflePointer >= order.length) pointer = 0;
          cur = queue.findIndex((t) => t.id === order[pointer]);
        }
      }

      return {
        ...state,
        queue,
        currentIndex: cur,
        shuffleOrder: order,
        shufflePointer: pointer,
      };
    }

    case "CLEAR":
      return { ...initialQueueState, shuffle: state.shuffle };

    case "SET_SHUFFLE": {
      const next =
        typeof action.value === "function"
          ? action.value(state.shuffle)
          : action.value;
      if (!!next === state.shuffle) return state;

      if (!next) {
        return { ...state, shuffle: false, shuffleOrder: [], shufflePointer: 0 };
      }
      const curId = state.queue[state.currentIndex]?.id;
      return {
        ...state,
        shuffle: true,
        shuffleOrder: curId != null ? buildOrder(state.queue, curId) : [],
        shufflePointer: 0,
      };
    }

    case "NEXT": {
      const n = state.queue.length;
      if (!n) return state;

      if (!state.shuffle) {
        return { ...state, currentIndex: (state.currentIndex + 1) % n };
      }

      let { order, pointer } = normalizeShuffle(state);

      if (pointer + 1 < order.length) {
        pointer += 1;
      } else {
        // Cycle finished: new shuffled cycle, never starting with the song
        // that just played.
        const lastId = order[order.length - 1];
        order = shuffled(state.queue.map((t) => t.id));
        if (order.length > 1 && order[0] === lastId) {
          [order[0], order[1]] = [order[1], order[0]];
        }
        pointer = 0;
      }

      const index = state.queue.findIndex((t) => t.id === order[pointer]);
      return {
        ...state,
        currentIndex: index,
        shuffleOrder: order,
        shufflePointer: pointer,
      };
    }

    case "PREV": {
      const n = state.queue.length;
      if (!n) return state;

      if (!state.shuffle) {
        const cur = state.currentIndex;
        return { ...state, currentIndex: cur > 0 ? cur - 1 : n - 1 };
      }

      let { order, pointer } = normalizeShuffle(state);
      if (pointer > 0) pointer -= 1;

      const index = state.queue.findIndex((t) => t.id === order[pointer]);
      return {
        ...state,
        currentIndex: index,
        shuffleOrder: order,
        shufflePointer: pointer,
      };
    }

    default:
      return state;
  }
}
// </reducer>

export function AudioProvider({ children }) {
  const { user } = useAuth();
  const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
  const audioRef = useRef(new Audio());
  const loadRequestRef = useRef(0);
  const failedSkipsRef = useRef(0);
  const objectUrlRef = useRef(null); // current blob: URL (revoked when replaced)
  const stallTimerRef = useRef(null); // detects a stuck/buffering song
  const retryRef = useRef({ count: 0 }); // recovery attempts for current song
  const isSwitchingRef = useRef(false); // true while changing songs
  const pendingSeekRef = useRef(0); // position to restore after a page refresh
  const autoplayRef = useRef(true); // false only for the restored song
  const persistRef = useRef(() => {});
  const qsRef = useRef(initialQueueState); // always the latest queue state
  const directPlayRef = useRef(null); // song already started by advance()
  const nextBlobRef = useRef(null); // offline copy of the NEXT song, ready
  const userPausedRef = useRef(false); // true when the USER paused
  const interruptedRef = useRef(false); // paused by the phone (call, WhatsApp)
  const { addRecent } = useRecent();
  const [resumeTime, setResumeTime] = useState(0);

  // Queue state lives in ONE pure reducer (see top of file).
  const [qs, dispatch] = useReducer(queueReducer, initialQueueState);
  const { queue, currentIndex, shuffle, shuffleOrder, shufflePointer } = qs;
  qsRef.current = qs;

  // Player states
  const [playing, setPlaying] = useState(false);
  const [loopOne, setLoopOne] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  // ---------------------------------------------------------------------
  // Queue actions (all stable: they only dispatch)
  // ---------------------------------------------------------------------
  const setNewQueue = useCallback(
    (tracks, index) => dispatch({ type: "SET_QUEUE", tracks, index }),
    [],
  );
  const playAll = useCallback(
    (tracks) => dispatch({ type: "PLAY_ALL", tracks }),
    [],
  );
  const shufflePlay = useCallback(
    (tracks) => dispatch({ type: "SHUFFLE_PLAY", tracks }),
    [],
  );
  const addToQueue = useCallback(
    (track) => dispatch({ type: "ADD", track }),
    [],
  );
  const playNextInsert = useCallback(
    (track) => dispatch({ type: "INSERT_NEXT", track }),
    [],
  );
  const reorderQueue = useCallback(
    (newQueue) => dispatch({ type: "REORDER", queue: newQueue }),
    [],
  );
  const removeFromQueue = useCallback(
    (id) => dispatch({ type: "REMOVE", id }),
    [],
  );
  // accepts a boolean OR a function, like a normal useState setter
  const setShuffle = useCallback(
    (value) => dispatch({ type: "SET_SHUFFLE", value }),
    [],
  );
  const playNext = useCallback(() => dispatch({ type: "NEXT" }), []);

  // Like Spotify: after 3 seconds, "previous" restarts the song first.
  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.getAttribute("src") && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    dispatch({ type: "PREV" });
  }, []);

  // ---------------------------------------------------------------------
  // advance(): switch to the next/previous song SYNCHRONOUSLY, straight from
  // the audio "ended" event (or the lock-screen button).
  //
  // Why: on a locked phone the browser may freeze the page the moment audio
  // stops. If we wait for React to render + an effect + IndexedDB before
  // calling play(), the page is already frozen / not allowed to start sound,
  // and the next song just sits at 0:00. Starting the next song inside the
  // event handler keeps the audio going without a gap.
  // ---------------------------------------------------------------------
  const advance = useCallback((type) => {
    const audio = audioRef.current;
    const current = qsRef.current;
    const next = queueReducer(current, { type });
    const track = next.queue[next.currentIndex];
    const playingTrack = current.queue[current.currentIndex];

    // Nothing different to play: use the normal path.
    if (!track || track.id === playingTrack?.id) {
      dispatch({ type });
      return;
    }

    // Prefer the offline copy if it was prepared; otherwise stream.
    let src = "";
    let blobUrl = null;
    const prepared = nextBlobRef.current;
    if (prepared && prepared.id === track.id) {
      src = prepared.url;
      blobUrl = prepared.url;
      nextBlobRef.current = null;
    } else if (navigator.onLine !== false) {
      src = track.external_url || track.storage_path || "";
    }

    // Offline and no prepared copy: normal (async, IndexedDB) path.
    if (!src) {
      dispatch({ type });
      return;
    }

    const previousUrl = objectUrlRef.current;
    objectUrlRef.current = blobUrl;

    userPausedRef.current = false;
    isSwitchingRef.current = true;
    clearTimeout(stallTimerRef.current);

    audio.preload = "auto";
    audio.src = src;
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const promise = audio.play();
    promise.catch(() => {}); // handled in the load effect
    directPlayRef.current = { id: track.id, promise };

    qsRef.current = next;
    dispatch({ type: "REPLACE", state: next });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: "CLEAR" });

    const audio = audioRef.current;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    userPausedRef.current = false;
    interruptedRef.current = false;
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (STORAGE_KEY) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, [STORAGE_KEY]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.getAttribute("src")) return;

    if (audio.paused) {
      userPausedRef.current = false;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      userPausedRef.current = true;
      interruptedRef.current = false;
      audio.pause();
      setPlaying(false);
    }
  }, []);

  // ---------------------------------------------------------------------
  // RESTORE the saved queue after a refresh / re-login.
  // The song comes back PAUSED at the saved position (browsers block
  // autoplay on page load anyway, and it avoids surprise sound).
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!STORAGE_KEY) return;

    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      saved = null;
    }
    if (!saved?.queue?.length) return;

    const restoredQueue = uniqueById(saved.queue.filter(isPlayable));
    if (!restoredQueue.length) return;

    const savedId = saved.queue[saved.currentIndex]?.id;
    let index = restoredQueue.findIndex((t) => t.id === savedId);
    const currentKept = index >= 0;
    if (!currentKept) index = 0;

    const shuffleOn = !!saved.shuffle;
    let order = [];
    let pointer = 0;

    if (shuffleOn) {
      const ids = new Set(restoredQueue.map((t) => t.id));
      const savedOrder = Array.isArray(saved.shuffleOrder)
        ? saved.shuffleOrder
        : [];
      const savedPointer = saved.shufflePointer || 0;
      const valid =
        savedOrder.length === restoredQueue.length &&
        savedOrder.every((id) => ids.has(id)) &&
        savedOrder[savedPointer] === restoredQueue[index].id;

      if (valid) {
        order = savedOrder;
        pointer = savedPointer;
      } else {
        order = buildOrder(restoredQueue, restoredQueue[index].id);
      }
    }

    pendingSeekRef.current = currentKept ? saved.currentTime || 0 : 0;
    autoplayRef.current = false;

    setLoopOne(!!saved.loopOne);
    dispatch({
      type: "RESTORE",
      state: {
        queue: restoredQueue,
        currentIndex: index,
        shuffle: shuffleOn,
        shuffleOrder: order,
        shufflePointer: pointer,
      },
    });
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!currentTrack) return;

    const interval = setInterval(() => {
      if (!audioRef.current.paused) {
        saveProgress(
          currentTrack.id,
          audioRef.current.currentTime || 0,
          audioRef.current.duration || 0,
        );
      }
    }, 10000);

    return () => {
      clearInterval(interval);

      if (currentTrack) {
        saveProgress(
          currentTrack.id,
          audioRef.current.currentTime || 0,
          audioRef.current.duration || 0,
        );
      }
    };
  }, [currentTrack, user]);

  // ---------------------------------------------------------------------
  // LOAD + PLAY the selected song
  // ---------------------------------------------------------------------
  useEffect(() => {
    const requestId = ++loadRequestRef.current;
    let cancelled = false;
    const cacheAbort = new AbortController();

    const isCurrentRequest = () =>
      !cancelled && loadRequestRef.current === requestId;

    clearTimeout(stallTimerRef.current);
    retryRef.current = { count: 0 };

    const loadTrack = async () => {
      if (!currentTrack) return;

      const audio = audioRef.current;

      // The song was already started synchronously by advance(): just finish
      // the bookkeeping (no reload, no pause, no gap).
      const direct = directPlayRef.current;
      directPlayRef.current = null;
      if (direct && direct.id === currentTrack.id) {
        try {
          await direct.promise;
          if (!isCurrentRequest()) return;

          isSwitchingRef.current = false;
          failedSkipsRef.current = 0;
          setPlaying(true);
          addRecent(currentTrack);
          if (!objectUrlRef.current) {
            cacheWhenBuffered(currentTrack, audio, cacheAbort.signal);
          }
          saveProgress(currentTrack.id, 0, audio.duration);
          return;
        } catch (err) {
          if (!isCurrentRequest()) return;
          if (err.name === "AbortError") return;
          if (err.name === "NotAllowedError") {
            // Blocked in the background: start as soon as the user is back.
            isSwitchingRef.current = false;
            interruptedRef.current = true;
            setPlaying(false);
            return;
          }
          // anything else: fall through to the normal loading path below
        }
      }

      isSwitchingRef.current = true;
      audio.pause();

      // Restored-after-refresh song: load it paused at the saved position.
      const shouldAutoplay = autoplayRef.current;
      const startAt = resumeTime > 0 ? resumeTime : pendingSeekRef.current;
      autoplayRef.current = true;
      pendingSeekRef.current = 0;

      try {
        // 1) Offline copy if we have one. A broken IndexedDB must NOT stop
        //    streaming, so errors here just fall through to the network URL.
        let src = "";
        try {
          const cachedBlob = await getTrack(currentTrack.id);
          if (!isCurrentRequest()) return;
          if (cachedBlob) src = URL.createObjectURL(cachedBlob);
        } catch (e) {
          console.warn("Offline lookup failed, streaming instead:", e);
        }

        // 2) Otherwise stream.
        if (!src) {
          src = currentTrack.external_url || currentTrack.storage_path || "";
        }
        if (!src) throw new Error("No playable audio source found.");

        const previousUrl = objectUrlRef.current;
        objectUrlRef.current = src.startsWith("blob:") ? src : null;

        // A restored (paused) song only needs metadata, not the whole file.
        audio.preload = shouldAutoplay ? "auto" : "metadata";
        audio.src = src;

        // Free the previous blob URL (it was leaking before).
        if (previousUrl) URL.revokeObjectURL(previousUrl);

        if (startAt > 0) {
          if (resumeTime > 0) setResumeTime(0);
          audio.addEventListener(
            "loadedmetadata",
            () => {
              if (isCurrentRequest()) {
                audio.currentTime = Math.min(
                  startAt,
                  audio.duration || startAt,
                );
              }
            },
            { once: true },
          );
        }

        if (!shouldAutoplay) {
          isSwitchingRef.current = false;
          setPlaying(false);
          return;
        }

        await audio.play();

        if (!isCurrentRequest()) return;

        isSwitchingRef.current = false;
        failedSkipsRef.current = 0;
        setPlaying(true);
        addRecent(currentTrack);

        // Cache for offline ONLY after the song is fully buffered, one at a
        // time, and cancel if the user changes song. Never competes with
        // streaming.
        if (!objectUrlRef.current) {
          cacheWhenBuffered(currentTrack, audio, cacheAbort.signal);
        }

        saveProgress(currentTrack.id, 0, audio.duration);
      } catch (err) {
        if (!isCurrentRequest()) return;
        if (err.name === "AbortError") return;

        console.error("Audio playback failed:", err.name, err.message);
        isSwitchingRef.current = false;

        // Browser blocked play() (no user gesture / background). The song is
        // loaded, so just wait for the user to press play. Do not skip.
        if (err.name === "NotAllowedError") {
          interruptedRef.current = true; // start when the user is back
          setPlaying(false);
          return;
        }

        // Broken song: move on, but never loop more times than there are songs.
        if (failedSkipsRef.current < queue.length - 1) {
          failedSkipsRef.current += 1;
          playNext();
        } else {
          setPlaying(false);
        }
      }
    };

    loadTrack();

    return () => {
      cancelled = true;
      cacheAbort.abort(); // stop background caching of the previous song
    };
  }, [currentTrack]);

  // ---------------------------------------------------------------------
  // AUDIO ELEMENT EVENTS (progress, ended, stall/error recovery)
  // ---------------------------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;

    const clearStall = () => clearTimeout(stallTimerRef.current);

    // Try to revive a stuck/errored stream twice, then skip to next song.
    const recover = () => {
      if (!audio.getAttribute("src")) return;

      if (retryRef.current.count < 2) {
        retryRef.current.count += 1;
        const resumeAt = audio.currentTime || 0;

        audio.load();
        audio.addEventListener(
          "loadedmetadata",
          () => {
            if (resumeAt > 0) audio.currentTime = resumeAt;
            audio.play().catch(() => {});
          },
          { once: true },
        );
      } else if (failedSkipsRef.current < queue.length - 1) {
        failedSkipsRef.current += 1;
        playNext();
      } else {
        setPlaying(false);
      }
    };

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      clearStall();
    };

    const onLoaded = () => setDuration(audio.duration || 0);

    const onPlaying = () => {
      isSwitchingRef.current = false;
      interruptedRef.current = false;
      clearStall();
      setPlaying(true);
    };

    // Keeps UI correct when paused from lock screen / headset / notification.
    // A pause the USER did not ask for (WhatsApp, a call, another app taking
    // the audio) is remembered so we can resume when the user comes back.
    const onPause = () => {
      if (isSwitchingRef.current || audio.ended) return;
      if (!userPausedRef.current) interruptedRef.current = true;
      setPlaying(false);
    };

    // Network hiccup: if nothing moves for 10s, kick the stream.
    const onWaiting = () => {
      clearStall();
      stallTimerRef.current = setTimeout(recover, 10000);
    };

    const onError = () => {
      clearStall();
      recover();
    };

    const onEnded = () => {
      if (loopOne) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (queue.length === 1) {
        // Nothing else to play: stop at the start of the song.
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
      } else {
        advance("NEXT");
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("stalled", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      clearStall();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("stalled", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, [loopOne, playNext, advance, queue.length]);

  // Coming back from the lock screen / WhatsApp / another app: resume if we
  // were playing, or if the phone (not the user) paused us.
  useEffect(() => {
    const resume = () => {
      const audio = audioRef.current;
      if (document.visibilityState !== "visible") return;
      if (!audio.getAttribute("src") || !audio.paused || audio.ended) return;
      if (userPausedRef.current) return;
      if (!playing && !interruptedRef.current) return;

      audio
        .play()
        .then(() => {
          interruptedRef.current = false;
        })
        .catch(() => {});
    };

    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    return () => {
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
    };
  }, [playing]);

  // Get the NEXT song's offline copy ready in memory, so advance() can start
  // it instantly (and without using mobile data) when the current one ends.
  useEffect(() => {
    if (!currentTrack || queue.length < 2) return;

    const preview = queueReducer(qsRef.current, { type: "NEXT" });
    const nextTrack = preview.queue[preview.currentIndex];
    if (!nextTrack || nextTrack.id === currentTrack.id) return;
    if (nextBlobRef.current?.id === nextTrack.id) return;

    let cancelled = false;
    (async () => {
      try {
        const blob = await getTrack(nextTrack.id);
        if (cancelled) return;

        if (nextBlobRef.current) {
          URL.revokeObjectURL(nextBlobRef.current.url);
          nextBlobRef.current = null;
        }
        if (blob) {
          nextBlobRef.current = {
            id: nextTrack.id,
            url: URL.createObjectURL(blob),
          };
        }
      } catch {
        // not cached / IndexedDB unavailable: advance() will stream instead
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentTrack, queue, shuffle, shuffleOrder, shufflePointer]);

  // ---------------------------------------------------------------------
  // MEDIA SESSION: lock-screen / notification controls (what Spotify and
  // JioSaavn use). Also marks this page as an active media player so
  // Android/iOS keep it alive when the screen is off.
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "",
      artist: currentTrack.artist || "",
      album: "Myraagam",
      artwork: currentTrack.cover_url
        ? [{ src: currentTrack.cover_url, sizes: "512x512" }]
        : [],
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const audio = audioRef.current;
    const ms = navigator.mediaSession;
    const set = (name, fn) => {
      try {
        ms.setActionHandler(name, fn);
      } catch {}
    };

    set("play", () => {
      userPausedRef.current = false;
      audio.play().catch(() => {});
    });
    set("pause", () => {
      userPausedRef.current = true;
      interruptedRef.current = false;
      audio.pause();
    });
    set("nexttrack", () => advance("NEXT"));
    set("previoustrack", () => {
      if (audio.currentTime > 3) audio.currentTime = 0;
      else advance("PREV");
    });
    set("seekto", (d) => {
      if (d.seekTime != null) audio.currentTime = d.seekTime;
    });

    return () => {
      ["play", "pause", "nexttrack", "previoustrack", "seekto"].forEach((a) =>
        set(a, null),
      );
    };
  }, [advance]);

  // ---------------------------------------------------------------------
  // SAVE the queue so it survives a refresh.
  // The (big) queue is written only when it changes; the playback position
  // is written every 5s, and when the tab is hidden/closed. (Before, the whole
  // queue was re-saved ~4 times per second.)
  // ---------------------------------------------------------------------
  useEffect(() => {
    persistRef.current = () => {
      // Empty queue: nothing to save (clearQueue removes the key itself).
      if (!STORAGE_KEY || !queue.length) return;
      const audio = audioRef.current;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            queue,
            currentIndex,
            currentTime: isSwitchingRef.current ? 0 : audio.currentTime || 0,
            wasPlaying: playing,
            loopOne,
            shuffle,
            shuffleOrder,
            shufflePointer,
          }),
        );
      } catch {
        // storage full / blocked: playback must never depend on it
      }
    };
  });

  useEffect(() => {
    persistRef.current();
  }, [qs, loopOne, playing, STORAGE_KEY]);

  useEffect(() => {
    const save = () => persistRef.current();
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };

    const interval = setInterval(save, 5000);
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  const seekTo = useCallback((sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
  }, []);

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
      setNewQueue,
      playAll,
      shufflePlay,
      addToQueue,
      playNextInsert,
      playNext,
      playPrev,
      togglePlay,
      setShuffle,
      seekTo,
      removeFromQueue,
      clearQueue,
      reorderQueue,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}