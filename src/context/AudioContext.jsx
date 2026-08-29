// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import useRecent from "../hooks/useRecent";
// import { useAuth } from "./AuthContext";
// import { supabase } from "../supabaseClient";
// import { cacheTrack } from "../utils/cacheTrack";
// import { getTrack } from "../utils/offlineCache";

// const AudioContext = createContext(null);

// export function AudioProvider({ children }) {
//   const { user } = useAuth();
//   const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
//   const audioRef = useRef(new Audio());
//   const { addRecent } = useRecent();
//   const [resumeTime, setResumeTime] = useState(0);

//   // Player states
//   const [queue, setQueue] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [playing, setPlaying] = useState(false);
//   const [loopOne, setLoopOne] = useState(false);
//   const [shuffle, setShuffle] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // NEW: States for shuffle order (prevents repeats within one loop)
//   const [shuffleOrder, setShuffleOrder] = useState([]);
//   const [shufflePointer, setShufflePointer] = useState(0);

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

//   // NEW: Fisher-Yates shuffle helper - creates one full order without repeats
//   const buildShuffleOrder = useCallback((tracks, startIndex = 0) => {
//     if (!tracks?.length) return { order: [], pointer: 0 };

//     const indices = tracks.map((_, i) => i);
//     const remaining = indices.filter((i) => i !== startIndex);

//     // Fisher-Yates shuffle
//     for (let i = remaining.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
//     }

//     const order = [startIndex, ...remaining];
//     return { order, pointer: 0 };
//   }, []);

//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

//     if (!saved) return;

//     const {
//       queue,
//       currentIndex,
//       currentTime,
//       wasPlaying,
//       loopOne,
//       shuffle,
//       shuffleOrder,
//       shufflePointer,
//     } = saved;

//     if (!queue?.length) return;

//     setQueue(queue);
//     setCurrentIndex(currentIndex);
//     setLoopOne(loopOne);
//     setShuffle(!!shuffle);
//     setShuffleOrder(shuffleOrder || []);
//     setShufflePointer(shufflePointer || 0);

//     const audio = audioRef.current;

//     setTimeout(() => {
//       audio.currentTime = currentTime || 0;

//       if (wasPlaying) {
//         audio.play().catch(() => {});
//         setPlaying(true);
//       }
//     }, 0);
//   }, [STORAGE_KEY]);

//   useEffect(() => {
//     if (!currentTrack) return;

//     const interval = setInterval(() => {
//       const audio = audioRef.current;

//       if (audio && !audio.paused) {
//         saveProgress(currentTrack.id, audio.currentTime, audio.duration);
//       }
//     }, 10000);

//     return () => {
//       clearInterval(interval);

//       const audio = audioRef.current;

//       if (audio && currentTrack) {
//         saveProgress(currentTrack.id, audio.currentTime, audio.duration);
//       }
//     };
//   }, [currentTrack, user]);

//   // new suggestions
//   const buildAutoQueue = useCallback(async (track) => {
//     if (!track?.id) return [track];

//     try {
//       const collected = [];
//       const seenIds = new Set([track.id]);

//       // 1. Same movie
//       if (track.movie_id) {
//         const { data: movieTracks, error: movieError } = await supabase
//           .from("tracks")
//           .select("*")
//           .eq("movie_id", track.movie_id)
//           .neq("id", track.id)
//           .order("created_at", { ascending: true })
//           .limit(5);

//         if (movieError) {
//           console.error("Failed to fetch same-movie songs:", movieError);
//         }

//         (movieTracks || []).forEach((song) => {
//           if (!seenIds.has(song.id)) {
//             seenIds.add(song.id);
//             collected.push(song);
//           }
//         });
//       }

//       // 2. Same artist
//       if (track.artist) {
//         const { data: artistTracks, error: artistError } = await supabase
//           .from("tracks")
//           .select("*")
//           .eq("artist", track.artist)
//           .neq("id", track.id)
//           .order("created_at", { ascending: false })
//           .limit(5);

//         if (artistError) {
//           console.error("Failed to fetch same-artist songs:", artistError);
//         }

//         (artistTracks || []).forEach((song) => {
//           if (!seenIds.has(song.id)) {
//             seenIds.add(song.id);
//             collected.push(song);
//           }
//         });
//       }

//       // 3. General fallback
//       if (collected.length < 5) {
//         const { data: fallbackTracks, error: fallbackError } = await supabase
//           .from("tracks")
//           .select("*")
//           .neq("id", track.id)
//           .order("created_at", { ascending: false })
//           .limit(10);

//         if (fallbackError) {
//           console.error("Failed to fetch fallback songs:", fallbackError);
//         }

//         (fallbackTracks || []).forEach((song) => {
//           if (!seenIds.has(song.id)) {
//             seenIds.add(song.id);
//             collected.push(song);
//           }
//         });
//       }

//       // Keep the queue reasonably small
//       return [track, ...collected.slice(0, 9)];
//     } catch (error) {
//       console.error("Failed to build automatic queue:", error);

//       return [track];
//     }
//   }, []);

//   const setNewQueue = useCallback(
//     async (tracks, index) => {
//       if (!tracks?.length) return;

//       // Single-song selection:
//       // automatically build an Up Next queue.
//       if (tracks.length === 1) {
//         const selectedTrack = tracks[0];

//         const autoQueue = await buildAutoQueue(selectedTrack);

//         setQueue(autoQueue);
//         setCurrentIndex(0);

//         if (shuffle) {
//           const { order, pointer } = buildShuffleOrder(autoQueue, 0);

//           setShuffleOrder(order);
//           setShufflePointer(pointer);
//         } else {
//           setShuffleOrder([]);
//           setShufflePointer(0);
//         }

//         return;
//       }

//       // Existing behavior for multi-song queues
//       setQueue(tracks);
//       setCurrentIndex(index);

//       if (shuffle) {
//         const { order, pointer } = buildShuffleOrder(tracks, index);

//         setShuffleOrder(order);
//         setShufflePointer(pointer);
//       } else {
//         setShuffleOrder([]);
//         setShufflePointer(0);
//       }
//     },
//     [shuffle, buildShuffleOrder, buildAutoQueue],
//   );

//   // FIXED: playAll always uses original order, no shuffle
//   const playAll = useCallback((tracks) => {
//     if (!tracks?.length) return;

//     setQueue(tracks);
//     setCurrentIndex(0);
//     setShuffle(false);
//     setShuffleOrder([]);
//     setShufflePointer(0);
//   }, []);

//   const shufflePlay = useCallback(
//     (tracks) => {
//       if (!tracks?.length) return;

//       setQueue(tracks);
//       setShuffle(true);

//       const startIndex = Math.floor(Math.random() * tracks.length);

//       const { order, pointer } = buildShuffleOrder(tracks, startIndex);

//       setShuffleOrder(order);
//       setShufflePointer(pointer);

//       setCurrentIndex(order[pointer]);
//     },
//     [buildShuffleOrder],
//   );

//   const addToQueue = useCallback((track) => {
//     if (!track) return;

//     setQueue((prev) => {
//       if (prev.some((t) => t.id === track.id)) return prev;
//       return [...prev, track];
//     });
//   }, []);

//   const playNextInsert = useCallback(
//     (track) => {
//       if (!track) return;

//       setQueue((prev) => {
//         if (!prev.length) {
//           setCurrentIndex(0);
//           return [track];
//         }

//         const newQueue = [...prev];
//         newQueue.splice(currentIndex + 1, 0, track);
//         return newQueue;
//       });
//     },
//     [currentIndex],
//   );

//   const togglePlay = useCallback(() => {
//     const audio = audioRef.current;
//     if (!audio.src) return;

//     if (audio.paused) {
//       audio.play().then(() => setPlaying(true));
//     } else {
//       audio.pause();
//       setPlaying(false);
//     }
//   }, []);

//   // FIXED: playNext no longer picks random song, uses pre-built shuffle order
//   const playNext = useCallback(() => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         // If no shuffle order exists yet, create one
//         if (!shuffleOrder.length) {
//           const { order, pointer } = buildShuffleOrder(
//             queue,
//             current >= 0 ? current : 0,
//           );
//           setShuffleOrder(order);
//           setShufflePointer(pointer);
//           return order[pointer];
//         }

//         const nextPointer = shufflePointer + 1;

//         // If we haven't finished the loop yet, go to next song in shuffle order
//         if (nextPointer < shuffleOrder.length) {
//           setShufflePointer(nextPointer);
//           return shuffleOrder[nextPointer];
//         }

//         // If we finished the loop, create a fresh shuffle order for the next cycle
//         let nextStart = Math.floor(Math.random() * queue.length);

//         // avoid immediate repeat of the just-finished last song
//         const lastPlayed = shuffleOrder[shuffleOrder.length - 1];
//         if (queue.length > 1) {
//           while (nextStart === lastPlayed) {
//             nextStart = Math.floor(Math.random() * queue.length);
//           }
//         }

//         const { order, pointer } = buildShuffleOrder(queue, nextStart);
//         setShuffleOrder(order);
//         setShufflePointer(pointer);
//         return order[pointer];
//       }

//       if (current + 1 < queue.length) {
//         return current + 1;
//       }

//       if (queue.length === 1) {
//         setPlaying(false);
//         return current;
//       }

//       return 0;
//     });
//   }, [queue, shuffle, shuffleOrder, shufflePointer, buildShuffleOrder]);

//   // FIXED: playPrev also uses shuffle order when shuffle is on
//   const playPrev = useCallback(() => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         if (!shuffleOrder.length) return current;

//         const prevPointer = shufflePointer - 1;

//         if (prevPointer >= 0) {
//           setShufflePointer(prevPointer);
//           return shuffleOrder[prevPointer];
//         }

//         return shuffleOrder[0];
//       }

//       // Normal mode: go to previous, wrap to last song at beginning
//       return current > 0 ? current - 1 : queue.length - 1;
//     });
//   }, [queue, shuffle, shuffleOrder, shufflePointer]);

//   const reorderQueue = useCallback((newQueue) => {
//     setQueue(newQueue);
//   }, []);

//   const removeFromQueue = useCallback(
//     (trackId) => {
//       setQueue((prev) => {
//         const updated = prev.filter((t) => t.id !== trackId);

//         const removedIndex = prev.findIndex((t) => t.id === trackId);

//         if (removedIndex < currentIndex) {
//           setCurrentIndex((i) => i - 1);
//         }

//         return updated;
//       });
//     },
//     [currentIndex],
//   );

//   // FIXED: clearQueue also clears shuffle states
//   const clearQueue = useCallback(() => {
//     setQueue([]);
//     setCurrentIndex(-1);
//     setShuffleOrder([]);
//     setShufflePointer(0);
//     audioRef.current.pause();
//     audioRef.current.src = "";
//     setPlaying(false);
//   }, []);

//   useEffect(() => {
//     const loadTrack = async () => {
//       const audio = audioRef.current;

//       if (!currentTrack) return;

//       try {
//         const cachedBlob = await getTrack(currentTrack.id);

//         console.log("Cached Blob:", !!cachedBlob);
//         console.log(
//           "Track:",
//           currentTrack.id,
//           currentTrack.title,
//           "Cached:",
//           !!cachedBlob,
//         );

//         if (cachedBlob) {
//           console.log("Playing from cache:", currentTrack.title);

//           const blobUrl = URL.createObjectURL(cachedBlob);

//           audio.src = blobUrl;
//         } else {
//           console.log("Playing from network:", currentTrack.title);

//           audio.src =
//             currentTrack.external_url || currentTrack.storage_path || "";
//         }

//         await audio.play();

//         setPlaying(true);

//         addRecent(currentTrack);

//         cacheTrack(currentTrack);

//         if (resumeTime > 0) {
//           audio.currentTime = resumeTime;
//           setResumeTime(0);
//         }

//         saveProgress(currentTrack.id, 0, audio.duration);
//       } catch (err) {
//         // catch (err) {
//         //   console.error(err);
//         //   setPlaying(false);
//         // }
//         if (err.name === "AbortError") {
//           return;
//         }

//         console.error(err);
//         setPlaying(false);
//       }
//     };

//     loadTrack();
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
//   }, [loopOne, shuffle, playNext]);

//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({
//         queue,
//         currentIndex,
//         currentTime,
//         wasPlaying: playing,
//         loopOne,
//         shuffle,
//         shuffleOrder,
//         shufflePointer,
//       }),
//     );
//   }, [
//     queue,
//     currentIndex,
//     currentTime,
//     playing,
//     loopOne,
//     shuffle,
//     shuffleOrder,
//     shufflePointer,
//     STORAGE_KEY,
//   ]);

//   const seekTo = (sec) => {
//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
//   };

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
//     ],
//   );
//   // console.log(currentTrack);
//   return (
//     <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
//   );
// }

// export function useAudio() {
//   return useContext(AudioContext);
// }





// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import useRecent from "../hooks/useRecent";
// import { useAuth } from "./AuthContext";
// import { supabase } from "../supabaseClient";
// import { cacheTrack } from "../utils/cacheTrack";
// import { getTrack } from "../utils/offlineCache";


// const AudioContext = createContext(null);

// // --- NEW: YouTube IFrame API loader -----------------------------------
// // Loads the YouTube IFrame API script once and resolves with window.YT
// // when it's ready. Safe to call multiple times; only loads the script once.
// function loadYouTubeIframeAPI() {
//   return new Promise((resolve) => {
//     if (window.YT && window.YT.Player) {
//       resolve(window.YT);
//       return;
//     }
//     const existingCallback = window.onYouTubeIframeAPIReady;
//     window.onYouTubeIframeAPIReady = () => {
//       if (existingCallback) existingCallback();
//       resolve(window.YT);
//     };
//     if (!document.getElementById("youtube-iframe-api-script")) {
//       const tag = document.createElement("script");
//       tag.id = "youtube-iframe-api-script";
//       tag.src = "https://www.youtube.com/iframe_api";
//       document.body.appendChild(tag);
//     }
//   });
// }
// // ------------------------------------------------------------------------

// export function AudioProvider({ children }) {
//   const { user } = useAuth();
//   const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
//   const audioRef = useRef(new Audio());
//   const { addRecent } = useRecent();
//   const [resumeTime, setResumeTime] = useState(0);

//   // Player states
//   const [queue, setQueue] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [playing, setPlaying] = useState(false);
//   const [loopOne, setLoopOne] = useState(false);
//   const [shuffle, setShuffle] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // NEW: States for shuffle order (prevents repeats within one loop)
//   const [shuffleOrder, setShuffleOrder] = useState([]);
//   const [shufflePointer, setShufflePointer] = useState(0);

//   // --- NEW: YouTube player refs -----------------------------------------
//   const ytPlayerRef = useRef(null);
//   const ytReadyPromiseRef = useRef(null);
//     // const ytContainerRef = useRef(null);
//   const loopOneRef = useRef(loopOne);
//   const playNextRef = useRef(() => {});
//   // ------------------------------------------------------------------------

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

//   // NEW: is the currently loaded track a YouTube-sourced track?
//   const isYoutubeTrack = !!currentTrack?.youtube_video_id;

//   // NEW: unified getters so progress-saving / UI code doesn't need to
//   // know which underlying player is active.
//   const getPlaybackTime = useCallback(() => {
//     if (isYoutubeTrack && ytPlayerRef.current?.getCurrentTime) {
//       return ytPlayerRef.current.getCurrentTime() || 0;
//     }
//     return audioRef.current.currentTime || 0;
//   }, [isYoutubeTrack]);

//   const getPlaybackDuration = useCallback(() => {
//     if (isYoutubeTrack && ytPlayerRef.current?.getDuration) {
//       return ytPlayerRef.current.getDuration() || 0;
//     }
//     return audioRef.current.duration || 0;
//   }, [isYoutubeTrack]);

//   // NEW: Fisher-Yates shuffle helper - creates one full order without repeats
//   const buildShuffleOrder = useCallback((tracks, startIndex = 0) => {
//     if (!tracks?.length) return { order: [], pointer: 0 };

//     const indices = tracks.map((_, i) => i);
//     const remaining = indices.filter((i) => i !== startIndex);

//     // Fisher-Yates shuffle
//     for (let i = remaining.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
//     }

//     const order = [startIndex, ...remaining];
//     return { order, pointer: 0 };
//   }, []);

//   // --- NEW: keep refs in sync so the YT event handler (created once on
//   // mount) always sees the latest loopOne / playNext without re-creating
//   // the player. -------------------------------------------------------
//   useEffect(() => {
//     loopOneRef.current = loopOne;
//   }, [loopOne]);

//   // --- NEW: create the hidden YouTube player once on mount --------------
//   useEffect(() => {
//     ytReadyPromiseRef.current = new Promise((resolve) => {
//       loadYouTubeIframeAPI().then((YT) => {
//         const player = new YT.Player("yt-audio-player", {
//           height: "0",
//           width: "0",
//           playerVars: { controls: 0, disablekb: 1 },
//           events: {
//             onReady: () => {
//               ytPlayerRef.current = player;
//               resolve(player);
//             },
//             onStateChange: (event) => {
//               if (event.data === window.YT.PlayerState.ENDED) {
//                 if (loopOneRef.current) {
//                   player.seekTo(0, true);
//                   player.playVideo();
//                 } else {
//                   playNextRef.current();
//                 }
//               }
//             },
//           },
//         });
//       });
//     });
//   }, []);

//     // --- NEW: create the hidden YouTube player once on mount --------------
//   // useEffect(() => {
//   //   ytReadyPromiseRef.current = new Promise((resolve) => {
//   //     loadYouTubeIframeAPI().then((YT) => {
//   //       const player = new YT.Player("yt-audio-player", {
//   //         height: "0",
//   //         width: "0",
//   //         playerVars: { controls: 0, disablekb: 1 },
//   //         events: {
//   //           onReady: () => {
//   //             ytPlayerRef.current = player;
//   //             resolve(player);
//   //           },
//   //           onStateChange: (event) => {
//   //             if (event.data === window.YT.PlayerState.ENDED) {
//   //               if (loopOneRef.current) {
//   //                 player.seekTo(0, true);
//   //                 player.playVideo();
//   //               } else {
//   //                 playNextRef.current();
//   //               }
//   //             }
//   //           },
//   //         },
//   //       });
//   //     });
//   //   });
//   // }, []);
//   // ------------------------------------------------------------------------

//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

//     if (!saved) return;

//     const {
//       queue,
//       currentIndex,
//       currentTime,
//       wasPlaying,
//       loopOne,
//       shuffle,
//       shuffleOrder,
//       shufflePointer,
//     } = saved;

//     if (!queue?.length) return;

//     setQueue(queue);
//     setCurrentIndex(currentIndex);
//     setLoopOne(loopOne);
//     setShuffle(!!shuffle);
//     setShuffleOrder(shuffleOrder || []);
//     setShufflePointer(shufflePointer || 0);

//     const audio = audioRef.current;

//     setTimeout(() => {
//       // NEW: only resume native audio's currentTime here; YouTube tracks
//       // resume via resumeTime in the loadTrack effect below instead,
//       // since the YT player may not be ready yet at this point.
//       const track = queue[currentIndex];
//       if (track && !track.youtube_video_id) {
//         audio.currentTime = currentTime || 0;

//         if (wasPlaying) {
//           audio.play().catch(() => {});
//           setPlaying(true);
//         }
//       } else if (track && wasPlaying) {
//         setPlaying(true);
//       }
//     }, 0);
//   }, [STORAGE_KEY]);

//   useEffect(() => {
//     if (!currentTrack) return;

//     const interval = setInterval(() => {
//       // CHANGED: use the unified getter instead of reading audioRef directly,
//       // so progress saves correctly for YouTube tracks too.
//       const isPlayingNow = isYoutubeTrack
//         ? ytPlayerRef.current?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING
//         : !audioRef.current.paused;

//       if (isPlayingNow) {
//         saveProgress(currentTrack.id, getPlaybackTime(), getPlaybackDuration());
//       }
//     }, 10000);

//     return () => {
//       clearInterval(interval);

//       if (currentTrack) {
//         saveProgress(currentTrack.id, getPlaybackTime(), getPlaybackDuration());
//       }
//     };
//   }, [currentTrack, user, isYoutubeTrack]);

//   // FIXED: setNewQueue now also builds shuffle order if shuffle is on
//   const setNewQueue = useCallback(
//     (tracks, index) => {
//       if (!tracks?.length) return;

//       setQueue(tracks);
//       setCurrentIndex(index);

//       if (shuffle) {
//         const { order, pointer } = buildShuffleOrder(tracks, index);
//         setShuffleOrder(order);
//         setShufflePointer(pointer);
//       } else {
//         setShuffleOrder([]);
//         setShufflePointer(0);
//       }
//     },
//     [shuffle, buildShuffleOrder],
//   );

//   // FIXED: playAll always uses original order, no shuffle
//   const playAll = useCallback((tracks) => {
//     if (!tracks?.length) return;

//     setQueue(tracks);
//     setCurrentIndex(0);
//     setShuffle(false);
//     setShuffleOrder([]);
//     setShufflePointer(0);
//   }, []);

//   const shufflePlay = useCallback(
//     (tracks) => {
//       if (!tracks?.length) return;

//       setQueue(tracks);
//       setShuffle(true);

//       const startIndex = Math.floor(Math.random() * tracks.length);

//       const { order, pointer } = buildShuffleOrder(tracks, startIndex);

//       setShuffleOrder(order);
//       setShufflePointer(pointer);

//       setCurrentIndex(order[pointer]);
//     },
//     [buildShuffleOrder],
//   );

//   const addToQueue = useCallback((track) => {
//     if (!track) return;

//     setQueue((prev) => {
//       if (prev.some((t) => t.id === track.id)) return prev;
//       return [...prev, track];
//     });
//   }, []);

//   const playNextInsert = useCallback(
//     (track) => {
//       if (!track) return;

//       setQueue((prev) => {
//         if (!prev.length) {
//           setCurrentIndex(0);
//           return [track];
//         }

//         const newQueue = [...prev];
//         newQueue.splice(currentIndex + 1, 0, track);
//         return newQueue;
//       });
//     },
//     [currentIndex],
//   );

//   // CHANGED: togglePlay now branches on source type
//   const togglePlay = useCallback(() => {
//     if (isYoutubeTrack) {
//       const yt = ytPlayerRef.current;
//       if (!yt || !window.YT) return;

//       const state = yt.getPlayerState();
//       if (state === window.YT.PlayerState.PLAYING) {
//         yt.pauseVideo();
//         setPlaying(false);
//       } else {
//         yt.playVideo();
//         setPlaying(true);
//       }
//       return;
//     }

//     const audio = audioRef.current;
//     if (!audio.src) return;

//     if (audio.paused) {
//       audio.play().then(() => setPlaying(true));
//     } else {
//       audio.pause();
//       setPlaying(false);
//     }
//   }, [isYoutubeTrack]);

//   // FIXED: playNext no longer picks random song, uses pre-built shuffle order
//   const playNext = useCallback(() => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         // If no shuffle order exists yet, create one
//         if (!shuffleOrder.length) {
//           const { order, pointer } = buildShuffleOrder(
//             queue,
//             current >= 0 ? current : 0,
//           );
//           setShuffleOrder(order);
//           setShufflePointer(pointer);
//           return order[pointer];
//         }

//         const nextPointer = shufflePointer + 1;

//         // If we haven't finished the loop yet, go to next song in shuffle order
//         if (nextPointer < shuffleOrder.length) {
//           setShufflePointer(nextPointer);
//           return shuffleOrder[nextPointer];
//         }

//         // If we finished the loop, create a fresh shuffle order for the next cycle
//         let nextStart = Math.floor(Math.random() * queue.length);

//         // avoid immediate repeat of the just-finished last song
//         const lastPlayed = shuffleOrder[shuffleOrder.length - 1];
//         if (queue.length > 1) {
//           while (nextStart === lastPlayed) {
//             nextStart = Math.floor(Math.random() * queue.length);
//           }
//         }

//         const { order, pointer } = buildShuffleOrder(queue, nextStart);
//         setShuffleOrder(order);
//         setShufflePointer(pointer);
//         return order[pointer];
//       }

//       // Normal mode: go to next, and wrap to 0 at the end
//       if (current + 1 < queue.length) {
//         return current + 1;
//       }

//       return 0;
//     });
//   }, [queue, shuffle, shuffleOrder, shufflePointer, buildShuffleOrder]);

//   // NEW: keep a ref to the latest playNext for the YT onStateChange handler
//   useEffect(() => {
//     playNextRef.current = playNext;
//   }, [playNext]);

//   // FIXED: playPrev also uses shuffle order when shuffle is on
//   const playPrev = useCallback(() => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         if (!shuffleOrder.length) return current;

//         const prevPointer = shufflePointer - 1;

//         if (prevPointer >= 0) {
//           setShufflePointer(prevPointer);
//           return shuffleOrder[prevPointer];
//         }

//         return shuffleOrder[0];
//       }

//       // Normal mode: go to previous, wrap to last song at beginning
//       return current > 0 ? current - 1 : queue.length - 1;
//     });
//   }, [queue, shuffle, shuffleOrder, shufflePointer]);

//   const reorderQueue = useCallback((newQueue) => {
//     setQueue(newQueue);
//   }, []);

//   const removeFromQueue = useCallback(
//     (trackId) => {
//       setQueue((prev) => {
//         const updated = prev.filter((t) => t.id !== trackId);

//         const removedIndex = prev.findIndex((t) => t.id === trackId);

//         if (removedIndex < currentIndex) {
//           setCurrentIndex((i) => i - 1);
//         }

//         return updated;
//       });
//     },
//     [currentIndex],
//   );

//   // FIXED: clearQueue also clears shuffle states
//   const clearQueue = useCallback(() => {
//     setQueue([]);
//     setCurrentIndex(-1);
//     setShuffleOrder([]);
//     setShufflePointer(0);
//     audioRef.current.pause();
//     audioRef.current.src = "";
//     // NEW: stop YouTube playback too, if a YT track was playing
//     if (ytPlayerRef.current?.stopVideo) {
//       try {
//         ytPlayerRef.current.stopVideo();
//       } catch {
//         // player may not be ready; safe to ignore
//       }
//     }
//     setPlaying(false);
//   }, []);

//   // CHANGED: loadTrack now branches at the top on source type.
//   // Everything below "---- existing native-audio logic ----" is
//   // completely unchanged from before, for all of your existing 300 tracks.
//   useEffect(() => {
//     const loadTrack = async () => {
//       if (!currentTrack) return;

//       // --- NEW: YouTube-sourced track path ---------------------------
//       if (currentTrack.youtube_video_id) {
//         // Make sure native audio isn't also playing underneath
//         audioRef.current.pause();

//         const yt = ytPlayerRef.current || (await ytReadyPromiseRef.current);
//         if (!yt) return;

//         yt.loadVideoById(currentTrack.youtube_video_id);
//         setPlaying(true);
//         addRecent(currentTrack);
//         // Deliberately no cacheTrack()/offline caching for YouTube tracks.

//         if (resumeTime > 0) {
//           // give the player a moment to actually load before seeking
//           setTimeout(() => {
//             try {
//               yt.seekTo(resumeTime, true);
//             } catch {
//               // ignore if not ready yet
//             }
//           }, 500);
//           setResumeTime(0);
//         }

//         saveProgress(currentTrack.id, 0, 0);
//         return;
//       }
//       // ------------------------------------------------------------------

//       // ---- existing native-audio logic (unchanged) ----
//       const audio = audioRef.current;

//       // NEW: stop any YouTube playback first, in case the previous track was one
//       if (ytPlayerRef.current?.stopVideo) {
//         try {
//           ytPlayerRef.current.stopVideo();
//         } catch {
//           // ignore
//         }
//       }

//       try {
//         const cachedBlob = await getTrack(currentTrack.id);

//         if (cachedBlob) {
//           const blobUrl = URL.createObjectURL(cachedBlob);
//           audio.src = blobUrl;
//         } else {
//           audio.src =
//             currentTrack.external_url || currentTrack.storage_path || "";
//         }

//         await audio.play();

//         setPlaying(true);

//         addRecent(currentTrack);

//         cacheTrack(currentTrack);

//         if (resumeTime > 0) {
//           audio.currentTime = resumeTime;
//           setResumeTime(0);
//         }

//         saveProgress(currentTrack.id, 0, audio.duration);
//       } catch (err) {
//         if (err.name === "AbortError") {
//           return;
//         }

//         console.error(err);
//         setPlaying(false);
//       }
//     };

//     loadTrack();
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
//   }, [loopOne, shuffle, playNext]);

//   // --- NEW: poll currentTime/duration for YouTube tracks, since the
//   // IFrame API has no timeupdate event like <audio> does. ---------------
//   useEffect(() => {
//     if (!isYoutubeTrack) return;

//     const interval = setInterval(() => {
//       const yt = ytPlayerRef.current;
//       if (!yt || !yt.getCurrentTime) return;
//       setCurrentTime(yt.getCurrentTime() || 0);
//       setDuration(yt.getDuration() || 0);
//     }, 500);

//     return () => clearInterval(interval);
//   }, [isYoutubeTrack, currentTrack]);
//   // ------------------------------------------------------------------------

//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({
//         queue,
//         currentIndex,
//         currentTime,
//         wasPlaying: playing,
//         loopOne,
//         shuffle,
//         shuffleOrder,
//         shufflePointer,
//       }),
//     );
//   }, [
//     queue,
//     currentIndex,
//     currentTime,
//     playing,
//     loopOne,
//     shuffle,
//     shuffleOrder,
//     shufflePointer,
//     STORAGE_KEY,
//   ]);

//   // CHANGED: seekTo now branches on source type
//   const seekTo = (sec) => {
//     if (isYoutubeTrack) {
//       const yt = ytPlayerRef.current;
//       if (!yt) return;
//       yt.seekTo(Math.max(0, sec), true);
//       return;
//     }

//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
//   };

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
//       isYoutubeTrack, // NEW: exposed in case UI wants to show a YouTube badge/icon
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
//       isYoutubeTrack,
//     ],
//   );

//   return (
//     <AudioContext.Provider value={value}>
//       {children}
//       {/* NEW: hidden target div the YouTube IFrame API attaches its player to.
//           Kept off-screen rather than display:none, since some browsers throttle
//           or fail to init iframes with display:none. */}
//       <div
//         id="yt-audio-player"
//         style={{ position: "absolute", top: -9999, left: -9999, width: 1, height: 1 }}
//       />

//             {/* <div
//         ref={ytContainerRef}
//         style={{ position: "absolute", top: -9999, left: -9999, width: 1, height: 1 }}
//       /> */}
//     </AudioContext.Provider>
//   );
// }

// export function useAudio() {
//   return useContext(AudioContext);
// }


// progress bar
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

// --- NEW: YouTube IFrame API loader -----------------------------------
// Loads the YouTube IFrame API script once and resolves with window.YT
// when it's ready. Safe to call multiple times; only loads the script once.
function loadYouTubeIframeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      resolve(window.YT);
    };
    if (!document.getElementById("youtube-iframe-api-script")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
}
// ------------------------------------------------------------------------

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

  // --- NEW: YouTube player refs -----------------------------------------
  const ytPlayerRef = useRef(null);
  const ytReadyPromiseRef = useRef(null);
  const loopOneRef = useRef(loopOne);
  const playNextRef = useRef(() => {});
  // ------------------------------------------------------------------------

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

  // NEW: is the currently loaded track a YouTube-sourced track?
  const isYoutubeTrack = !!currentTrack?.youtube_video_id;

  // NEW: unified getters so progress-saving / UI code doesn't need to
  // know which underlying player is active.
  const getPlaybackTime = useCallback(() => {
    if (isYoutubeTrack && ytPlayerRef.current?.getCurrentTime) {
      return ytPlayerRef.current.getCurrentTime() || 0;
    }
    return audioRef.current.currentTime || 0;
  }, [isYoutubeTrack]);

  const getPlaybackDuration = useCallback(() => {
    if (isYoutubeTrack && ytPlayerRef.current?.getDuration) {
      return ytPlayerRef.current.getDuration() || 0;
    }
    return audioRef.current.duration || 0;
  }, [isYoutubeTrack]);

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

  // --- NEW: keep refs in sync so the YT event handler (created once on
  // mount) always sees the latest loopOne / playNext without re-creating
  // the player. -------------------------------------------------------
  useEffect(() => {
    loopOneRef.current = loopOne;
  }, [loopOne]);

  // --- NEW: create the hidden YouTube player once on mount --------------
  // IMPORTANT: the container div is created with plain DOM APIs and
  // appended directly to document.body, OUTSIDE of React's rendering.
  // The YouTube IFrame API replaces this div with a real <iframe> internally;
  // if React also tried to render/reconcile this same node, the two would
  // fight over it and throw "insertBefore" / "not a child of this node"
  // errors. Keeping it fully outside JSX avoids that entirely.
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "yt-audio-player-container";
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    // 200x200 rather than 0x0/1x1 -- very small player sizes are known to
    // cause flaky internal behavior (duration/quality calc glitches) in
    // the YouTube IFrame API.
    container.style.width = "200px";
    container.style.height = "200px";
    document.body.appendChild(container);

    ytReadyPromiseRef.current = new Promise((resolve) => {
      loadYouTubeIframeAPI().then((YT) => {
        const player = new YT.Player(container, {
          height: "200",
          width: "200",
          playerVars: { controls: 0, disablekb: 1 },
          events: {
            onReady: () => {
              ytPlayerRef.current = player;
              resolve(player);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                if (loopOneRef.current) {
                  player.seekTo(0, true);
                  player.playVideo();
                } else {
                  playNextRef.current();
                }
              }
            },
          },
        });
      });
    });

    return () => {
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);
  // ------------------------------------------------------------------------

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
      // NEW: only resume native audio's currentTime here; YouTube tracks
      // resume via resumeTime in the loadTrack effect below instead,
      // since the YT player may not be ready yet at this point.
      const track = queue[currentIndex];
      if (track && !track.youtube_video_id) {
        audio.currentTime = currentTime || 0;

        if (wasPlaying) {
          audio.play().catch(() => {});
          setPlaying(true);
        }
      } else if (track && wasPlaying) {
        setPlaying(true);
      }
    }, 0);
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!currentTrack) return;

    const interval = setInterval(() => {
      // CHANGED: use the unified getter instead of reading audioRef directly,
      // so progress saves correctly for YouTube tracks too.
      const isPlayingNow = isYoutubeTrack
        ? ytPlayerRef.current?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING
        : !audioRef.current.paused;

      if (isPlayingNow) {
        saveProgress(currentTrack.id, getPlaybackTime(), getPlaybackDuration());
      }
    }, 10000);

    return () => {
      clearInterval(interval);

      if (currentTrack) {
        saveProgress(currentTrack.id, getPlaybackTime(), getPlaybackDuration());
      }
    };
  }, [currentTrack, user, isYoutubeTrack]);

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

  // CHANGED: togglePlay now branches on source type
  const togglePlay = useCallback(() => {
    if (isYoutubeTrack) {
      const yt = ytPlayerRef.current;
      if (!yt || !window.YT) return;

      const state = yt.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        yt.pauseVideo();
        setPlaying(false);
      } else {
        yt.playVideo();
        setPlaying(true);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio.src) return;

    if (audio.paused) {
      audio.play().then(() => setPlaying(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [isYoutubeTrack]);

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

      return 0;
    });
  }, [queue, shuffle, shuffleOrder, shufflePointer, buildShuffleOrder]);

  // NEW: keep a ref to the latest playNext for the YT onStateChange handler
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

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
    // NEW: stop YouTube playback too, if a YT track was playing
    if (ytPlayerRef.current?.stopVideo) {
      try {
        ytPlayerRef.current.stopVideo();
      } catch {
        // player may not be ready; safe to ignore
      }
    }
    setPlaying(false);
  }, []);

  // CHANGED: loadTrack now branches at the top on source type.
  // Everything below "---- existing native-audio logic ----" is
  // completely unchanged from before, for all of your existing 300 tracks.
  useEffect(() => {
    const loadTrack = async () => {
      if (!currentTrack) return;

      // --- NEW: YouTube-sourced track path ---------------------------
      if (currentTrack.youtube_video_id) {
        // Make sure native audio isn't also playing underneath
        audioRef.current.pause();

        const yt = ytPlayerRef.current || (await ytReadyPromiseRef.current);
        if (!yt) return;

        yt.loadVideoById(currentTrack.youtube_video_id);
        setPlaying(true);
        addRecent(currentTrack);
        // Deliberately no cacheTrack()/offline caching for YouTube tracks.

        if (resumeTime > 0) {
          // give the player a moment to actually load before seeking
          setTimeout(() => {
            try {
              yt.seekTo(resumeTime, true);
            } catch {
              // ignore if not ready yet
            }
          }, 500);
          setResumeTime(0);
        }

        saveProgress(currentTrack.id, 0, 0);
        return;
      }
      // ------------------------------------------------------------------

      // ---- existing native-audio logic (unchanged) ----
      const audio = audioRef.current;

      // NEW: stop any YouTube playback first, in case the previous track was one
      if (ytPlayerRef.current?.stopVideo) {
        try {
          ytPlayerRef.current.stopVideo();
        } catch {
          // ignore
        }
      }

      try {
        const cachedBlob = await getTrack(currentTrack.id);

        if (cachedBlob) {
          const blobUrl = URL.createObjectURL(cachedBlob);
          audio.src = blobUrl;
        } else {
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
      } catch (err) {
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

  // --- NEW: poll currentTime/duration for YouTube tracks, since the
  // IFrame API has no timeupdate event like <audio> does. ---------------
  useEffect(() => {
    if (!isYoutubeTrack) return;

    const interval = setInterval(() => {
      const yt = ytPlayerRef.current;
      if (
        !yt ||
        typeof yt.getCurrentTime !== "function" ||
        typeof yt.getDuration !== "function"
      ) {
        return;
      }
      setCurrentTime(yt.getCurrentTime() || 0);
      setDuration(yt.getDuration() || 0);
    }, 500);

    return () => clearInterval(interval);
  }, [isYoutubeTrack, currentTrack]);
  // ------------------------------------------------------------------------

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

  // CHANGED: seekTo now branches on source type
  const seekTo = (sec) => {
    if (isYoutubeTrack) {
      const yt = ytPlayerRef.current;
      if (!yt) return;
      yt.seekTo(Math.max(0, sec), true);
      return;
    }

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
      isYoutubeTrack, // NEW: exposed in case UI wants to show a YouTube badge/icon
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
      isYoutubeTrack,
    ],
  );

  // NOTE: the YouTube player's container div is created and managed with
  // plain DOM APIs in the effect above -- it is intentionally NOT rendered
  // here via JSX, to avoid React and the YouTube IFrame API fighting over
  // the same DOM node (see comment above).
  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}

// switching tabs
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import useRecent from "../hooks/useRecent";
// import { useAuth } from "./AuthContext";
// import { supabase } from "../supabaseClient";
// import { cacheTrack } from "../utils/cacheTrack";
// import { getTrack } from "../utils/offlineCache";

// const AudioContext = createContext(null);

// // --- NEW: YouTube IFrame API loader -----------------------------------
// // Loads the YouTube IFrame API script once and resolves with window.YT
// // when it's ready. Safe to call multiple times; only loads the script once.
// function loadYouTubeIframeAPI() {
//   return new Promise((resolve) => {
//     if (window.YT && window.YT.Player) {
//       resolve(window.YT);
//       return;
//     }
//     const existingCallback = window.onYouTubeIframeAPIReady;
//     window.onYouTubeIframeAPIReady = () => {
//       if (existingCallback) existingCallback();
//       resolve(window.YT);
//     };
//     if (!document.getElementById("youtube-iframe-api-script")) {
//       const tag = document.createElement("script");
//       tag.id = "youtube-iframe-api-script";
//       tag.src = "https://www.youtube.com/iframe_api";
//       document.body.appendChild(tag);
//     }
//   });
// }
// // ------------------------------------------------------------------------

// export function AudioProvider({ children }) {
//   const { user } = useAuth();
//   const STORAGE_KEY = user ? `audio_state_${user.id}` : null;
//   const audioRef = useRef(new Audio());
//   const { addRecent } = useRecent();
//   const [resumeTime, setResumeTime] = useState(0);

//   // Player states
//   const [queue, setQueue] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [playing, setPlaying] = useState(false);
//   const [loopOne, setLoopOne] = useState(false);
//   const [shuffle, setShuffle] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // NEW: States for shuffle order (prevents repeats within one loop)
//   const [shuffleOrder, setShuffleOrder] = useState([]);
//   const [shufflePointer, setShufflePointer] = useState(0);

//   // --- NEW: YouTube player refs -----------------------------------------
//   const ytPlayerRef = useRef(null);
//   const ytReadyPromiseRef = useRef(null);
//   const loopOneRef = useRef(loopOne);
//   const playNextRef = useRef(() => {});
//   // ------------------------------------------------------------------------

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

//   // NEW: is the currently loaded track a YouTube-sourced track?
//   const isYoutubeTrack = !!currentTrack?.youtube_video_id;

//   // NEW: unified getters so progress-saving / UI code doesn't need to
//   // know which underlying player is active.
//   const getPlaybackTime = useCallback(() => {
//     if (isYoutubeTrack && ytPlayerRef.current?.getCurrentTime) {
//       return ytPlayerRef.current.getCurrentTime() || 0;
//     }
//     return audioRef.current.currentTime || 0;
//   }, [isYoutubeTrack]);

//   const getPlaybackDuration = useCallback(() => {
//     if (isYoutubeTrack && ytPlayerRef.current?.getDuration) {
//       return ytPlayerRef.current.getDuration() || 0;
//     }
//     return audioRef.current.duration || 0;
//   }, [isYoutubeTrack]);

//   // NEW: Fisher-Yates shuffle helper - creates one full order without repeats
//   const buildShuffleOrder = useCallback((tracks, startIndex = 0) => {
//     if (!tracks?.length) return { order: [], pointer: 0 };

//     const indices = tracks.map((_, i) => i);
//     const remaining = indices.filter((i) => i !== startIndex);

//     // Fisher-Yates shuffle
//     for (let i = remaining.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
//     }

//     const order = [startIndex, ...remaining];
//     return { order, pointer: 0 };
//   }, []);

//   // --- NEW: keep refs in sync so the YT event handler (created once on
//   // mount) always sees the latest loopOne / playNext without re-creating
//   // the player. -------------------------------------------------------
//   useEffect(() => {
//     loopOneRef.current = loopOne;
//   }, [loopOne]);

//   // --- NEW: create the hidden YouTube player once on mount --------------
//   // IMPORTANT: the container div is created with plain DOM APIs and
//   // appended directly to document.body, OUTSIDE of React's rendering.
//   // The YouTube IFrame API replaces this div with a real <iframe> internally;
//   // if React also tried to render/reconcile this same node, the two would
//   // fight over it and throw "insertBefore" / "not a child of this node"
//   // errors. Keeping it fully outside JSX avoids that entirely.
//   useEffect(() => {
//     const container = document.createElement("div");
//     container.id = "yt-audio-player-container";
//     // CHANGED: kept within the viewport (top:0/left:0) instead of far
//     // off-screen (-9999px). Some browsers auto-pause video/iframe content
//     // that is never within the visible viewport, as a background resource
//     // saver -- that heuristic doesn't know this is audio-only usage.
//     // Hidden instead via opacity + z-index + pointer-events.
//     container.style.position = "fixed";
//     container.style.top = "0";
//     container.style.left = "0";
//     container.style.width = "200px";
//     container.style.height = "200px";
//     container.style.opacity = "0";
//     container.style.zIndex = "-1";
//     container.style.pointerEvents = "none";
//     document.body.appendChild(container);

//     ytReadyPromiseRef.current = new Promise((resolve) => {
//       loadYouTubeIframeAPI().then((YT) => {
//         const player = new YT.Player(container, {
//           height: "200",
//           width: "200",
//           playerVars: { controls: 0, disablekb: 1 },
//           events: {
//             onReady: () => {
//               ytPlayerRef.current = player;
//               resolve(player);
//             },
//             onStateChange: (event) => {
//               if (event.data === window.YT.PlayerState.ENDED) {
//                 if (loopOneRef.current) {
//                   player.seekTo(0, true);
//                   player.playVideo();
//                 } else {
//                   playNextRef.current();
//                 }
//               }
//             },
//           },
//         });
//       });
//     });

//     return () => {
//       if (ytPlayerRef.current?.destroy) {
//         try {
//           ytPlayerRef.current.destroy();
//         } catch {
//           // ignore
//         }
//       }
//       if (container.parentNode) {
//         container.parentNode.removeChild(container);
//       }
//     };
//   }, []);
//   // ------------------------------------------------------------------------

//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

//     if (!saved) return;

//     const {
//       queue,
//       currentIndex,
//       currentTime,
//       wasPlaying,
//       loopOne,
//       shuffle,
//       shuffleOrder,
//       shufflePointer,
//     } = saved;

//     if (!queue?.length) return;

//     setQueue(queue);
//     setCurrentIndex(currentIndex);
//     setLoopOne(loopOne);
//     setShuffle(!!shuffle);
//     setShuffleOrder(shuffleOrder || []);
//     setShufflePointer(shufflePointer || 0);

//     const audio = audioRef.current;

//     setTimeout(() => {
//       // NEW: only resume native audio's currentTime here; YouTube tracks
//       // resume via resumeTime in the loadTrack effect below instead,
//       // since the YT player may not be ready yet at this point.
//       const track = queue[currentIndex];
//       if (track && !track.youtube_video_id) {
//         audio.currentTime = currentTime || 0;

//         if (wasPlaying) {
//           audio.play().catch(() => {});
//           setPlaying(true);
//         }
//       } else if (track && wasPlaying) {
//         setPlaying(true);
//       }
//     }, 0);
//   }, [STORAGE_KEY]);

//   useEffect(() => {
//     if (!currentTrack) return;

//     const interval = setInterval(() => {
//       // CHANGED: use the unified getter instead of reading audioRef directly,
//       // so progress saves correctly for YouTube tracks too.
//       const isPlayingNow = isYoutubeTrack
//         ? ytPlayerRef.current?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING
//         : !audioRef.current.paused;

//       if (isPlayingNow) {
//         saveProgress(currentTrack.id, getPlaybackTime(), getPlaybackDuration());
//       }
//     }, 10000);

//     return () => {
//       clearInterval(interval);

//       if (currentTrack) {
//         saveProgress(currentTrack.id, getPlaybackTime(), getPlaybackDuration());
//       }
//     };
//   }, [currentTrack, user, isYoutubeTrack]);

//   // FIXED: setNewQueue now also builds shuffle order if shuffle is on
//   const setNewQueue = useCallback(
//     (tracks, index) => {
//       if (!tracks?.length) return;

//       setQueue(tracks);
//       setCurrentIndex(index);

//       if (shuffle) {
//         const { order, pointer } = buildShuffleOrder(tracks, index);
//         setShuffleOrder(order);
//         setShufflePointer(pointer);
//       } else {
//         setShuffleOrder([]);
//         setShufflePointer(0);
//       }
//     },
//     [shuffle, buildShuffleOrder],
//   );

//   // FIXED: playAll always uses original order, no shuffle
//   const playAll = useCallback((tracks) => {
//     if (!tracks?.length) return;

//     setQueue(tracks);
//     setCurrentIndex(0);
//     setShuffle(false);
//     setShuffleOrder([]);
//     setShufflePointer(0);
//   }, []);

//   const shufflePlay = useCallback(
//     (tracks) => {
//       if (!tracks?.length) return;

//       setQueue(tracks);
//       setShuffle(true);

//       const startIndex = Math.floor(Math.random() * tracks.length);

//       const { order, pointer } = buildShuffleOrder(tracks, startIndex);

//       setShuffleOrder(order);
//       setShufflePointer(pointer);

//       setCurrentIndex(order[pointer]);
//     },
//     [buildShuffleOrder],
//   );

//   const addToQueue = useCallback((track) => {
//     if (!track) return;

//     setQueue((prev) => {
//       if (prev.some((t) => t.id === track.id)) return prev;
//       return [...prev, track];
//     });
//   }, []);

//   const playNextInsert = useCallback(
//     (track) => {
//       if (!track) return;

//       setQueue((prev) => {
//         if (!prev.length) {
//           setCurrentIndex(0);
//           return [track];
//         }

//         const newQueue = [...prev];
//         newQueue.splice(currentIndex + 1, 0, track);
//         return newQueue;
//       });
//     },
//     [currentIndex],
//   );

//   // CHANGED: togglePlay now branches on source type
//   const togglePlay = useCallback(() => {
//     if (isYoutubeTrack) {
//       const yt = ytPlayerRef.current;
//       if (!yt || !window.YT) return;

//       const state = yt.getPlayerState();
//       if (state === window.YT.PlayerState.PLAYING) {
//         yt.pauseVideo();
//         setPlaying(false);
//       } else {
//         yt.playVideo();
//         setPlaying(true);
//       }
//       return;
//     }

//     const audio = audioRef.current;
//     if (!audio.src) return;

//     if (audio.paused) {
//       audio.play().then(() => setPlaying(true));
//     } else {
//       audio.pause();
//       setPlaying(false);
//     }
//   }, [isYoutubeTrack]);

//   // FIXED: playNext no longer picks random song, uses pre-built shuffle order
//   const playNext = useCallback(() => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         // If no shuffle order exists yet, create one
//         if (!shuffleOrder.length) {
//           const { order, pointer } = buildShuffleOrder(
//             queue,
//             current >= 0 ? current : 0,
//           );
//           setShuffleOrder(order);
//           setShufflePointer(pointer);
//           return order[pointer];
//         }

//         const nextPointer = shufflePointer + 1;

//         // If we haven't finished the loop yet, go to next song in shuffle order
//         if (nextPointer < shuffleOrder.length) {
//           setShufflePointer(nextPointer);
//           return shuffleOrder[nextPointer];
//         }

//         // If we finished the loop, create a fresh shuffle order for the next cycle
//         let nextStart = Math.floor(Math.random() * queue.length);

//         // avoid immediate repeat of the just-finished last song
//         const lastPlayed = shuffleOrder[shuffleOrder.length - 1];
//         if (queue.length > 1) {
//           while (nextStart === lastPlayed) {
//             nextStart = Math.floor(Math.random() * queue.length);
//           }
//         }

//         const { order, pointer } = buildShuffleOrder(queue, nextStart);
//         setShuffleOrder(order);
//         setShufflePointer(pointer);
//         return order[pointer];
//       }

//       // Normal mode: go to next, and wrap to 0 at the end
//       if (current + 1 < queue.length) {
//         return current + 1;
//       }

//       return 0;
//     });
//   }, [queue, shuffle, shuffleOrder, shufflePointer, buildShuffleOrder]);

//   // NEW: keep a ref to the latest playNext for the YT onStateChange handler
//   useEffect(() => {
//     playNextRef.current = playNext;
//   }, [playNext]);

//   // FIXED: playPrev also uses shuffle order when shuffle is on
//   const playPrev = useCallback(() => {
//     if (!queue.length) return;

//     setCurrentIndex((current) => {
//       if (shuffle) {
//         if (!shuffleOrder.length) return current;

//         const prevPointer = shufflePointer - 1;

//         if (prevPointer >= 0) {
//           setShufflePointer(prevPointer);
//           return shuffleOrder[prevPointer];
//         }

//         return shuffleOrder[0];
//       }

//       // Normal mode: go to previous, wrap to last song at beginning
//       return current > 0 ? current - 1 : queue.length - 1;
//     });
//   }, [queue, shuffle, shuffleOrder, shufflePointer]);

//   const reorderQueue = useCallback((newQueue) => {
//     setQueue(newQueue);
//   }, []);

//   const removeFromQueue = useCallback(
//     (trackId) => {
//       setQueue((prev) => {
//         const updated = prev.filter((t) => t.id !== trackId);

//         const removedIndex = prev.findIndex((t) => t.id === trackId);

//         if (removedIndex < currentIndex) {
//           setCurrentIndex((i) => i - 1);
//         }

//         return updated;
//       });
//     },
//     [currentIndex],
//   );

//   // FIXED: clearQueue also clears shuffle states
//   const clearQueue = useCallback(() => {
//     setQueue([]);
//     setCurrentIndex(-1);
//     setShuffleOrder([]);
//     setShufflePointer(0);
//     audioRef.current.pause();
//     audioRef.current.src = "";
//     // NEW: stop YouTube playback too, if a YT track was playing
//     if (ytPlayerRef.current?.stopVideo) {
//       try {
//         ytPlayerRef.current.stopVideo();
//       } catch {
//         // player may not be ready; safe to ignore
//       }
//     }
//     setPlaying(false);
//   }, []);

//   // CHANGED: loadTrack now branches at the top on source type.
//   // Everything below "---- existing native-audio logic ----" is
//   // completely unchanged from before, for all of your existing 300 tracks.
//   useEffect(() => {
//     const loadTrack = async () => {
//       if (!currentTrack) return;

//       // --- NEW: YouTube-sourced track path ---------------------------
//       if (currentTrack.youtube_video_id) {
//         // Make sure native audio isn't also playing underneath
//         audioRef.current.pause();

//         const yt = ytPlayerRef.current || (await ytReadyPromiseRef.current);
//         if (!yt) return;

//         yt.loadVideoById(currentTrack.youtube_video_id);
//         setPlaying(true);
//         addRecent(currentTrack);
//         // Deliberately no cacheTrack()/offline caching for YouTube tracks.

//         if (resumeTime > 0) {
//           // give the player a moment to actually load before seeking
//           setTimeout(() => {
//             try {
//               yt.seekTo(resumeTime, true);
//             } catch {
//               // ignore if not ready yet
//             }
//           }, 500);
//           setResumeTime(0);
//         }

//         saveProgress(currentTrack.id, 0, 0);
//         return;
//       }
//       // ------------------------------------------------------------------

//       // ---- existing native-audio logic (unchanged) ----
//       const audio = audioRef.current;

//       // NEW: stop any YouTube playback first, in case the previous track was one
//       if (ytPlayerRef.current?.stopVideo) {
//         try {
//           ytPlayerRef.current.stopVideo();
//         } catch {
//           // ignore
//         }
//       }

//       try {
//         const cachedBlob = await getTrack(currentTrack.id);

//         if (cachedBlob) {
//           const blobUrl = URL.createObjectURL(cachedBlob);
//           audio.src = blobUrl;
//         } else {
//           audio.src =
//             currentTrack.external_url || currentTrack.storage_path || "";
//         }

//         await audio.play();

//         setPlaying(true);

//         addRecent(currentTrack);

//         cacheTrack(currentTrack);

//         if (resumeTime > 0) {
//           audio.currentTime = resumeTime;
//           setResumeTime(0);
//         }

//         saveProgress(currentTrack.id, 0, audio.duration);
//       } catch (err) {
//         if (err.name === "AbortError") {
//           return;
//         }

//         console.error(err);
//         setPlaying(false);
//       }
//     };

//     loadTrack();
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
//   }, [loopOne, shuffle, playNext]);

//   // --- NEW: poll currentTime/duration for YouTube tracks, since the
//   // IFrame API has no timeupdate event like <audio> does. ---------------
//   useEffect(() => {
//     if (!isYoutubeTrack) return;

//     const interval = setInterval(() => {
//       const yt = ytPlayerRef.current;
//       if (
//         !yt ||
//         typeof yt.getCurrentTime !== "function" ||
//         typeof yt.getDuration !== "function"
//       ) {
//         return;
//       }
//       setCurrentTime(yt.getCurrentTime() || 0);
//       setDuration(yt.getDuration() || 0);
//     }, 500);

//     return () => clearInterval(interval);
//   }, [isYoutubeTrack, currentTrack]);
//   // ------------------------------------------------------------------------

//   useEffect(() => {
//     if (!STORAGE_KEY) return;

//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({
//         queue,
//         currentIndex,
//         currentTime,
//         wasPlaying: playing,
//         loopOne,
//         shuffle,
//         shuffleOrder,
//         shufflePointer,
//       }),
//     );
//   }, [
//     queue,
//     currentIndex,
//     currentTime,
//     playing,
//     loopOne,
//     shuffle,
//     shuffleOrder,
//     shufflePointer,
//     STORAGE_KEY,
//   ]);

//   // CHANGED: seekTo now branches on source type
//   const seekTo = (sec) => {
//     if (isYoutubeTrack) {
//       const yt = ytPlayerRef.current;
//       if (!yt) return;
//       yt.seekTo(Math.max(0, sec), true);
//       return;
//     }

//     const audio = audioRef.current;
//     if (!audio) return;
//     audio.currentTime = Math.max(0, Math.min(sec, audio.duration || 0));
//   };

//   // --- NEW: Media Session API ---------------------------------------------
//   // Tells the browser (and OS) that this tab has active, deliberate media
//   // playback. This is the standard way music apps register lock-screen /
//   // notification controls, and it also signals to the browser not to
//   // aggressively throttle playback when the tab is backgrounded --
//   // something native <audio> gets automatically but embedded video iframes
//   // (which is what the YouTube player technically is) don't always get.
//   useEffect(() => {
//     if (!("mediaSession" in navigator) || !currentTrack) return;

//     navigator.mediaSession.metadata = new window.MediaMetadata({
//       title: currentTrack.title || "",
//       artist: currentTrack.artist || "",
//       album: currentTrack.movie_id || "",
//       artwork: currentTrack.cover_url
//         ? [
//             { src: currentTrack.cover_url, sizes: "96x96", type: "image/jpeg" },
//             { src: currentTrack.cover_url, sizes: "512x512", type: "image/jpeg" },
//           ]
//         : [],
//     });

//     navigator.mediaSession.setActionHandler("play", () => togglePlay());
//     navigator.mediaSession.setActionHandler("pause", () => togglePlay());
//     navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
//     navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
//     navigator.mediaSession.setActionHandler("seekto", (details) => {
//       if (details.seekTime != null) seekTo(details.seekTime);
//     });

//     return () => {
//       // Clear handlers when the track changes/unmounts to avoid stale closures
//       navigator.mediaSession.setActionHandler("play", null);
//       navigator.mediaSession.setActionHandler("pause", null);
//       navigator.mediaSession.setActionHandler("previoustrack", null);
//       navigator.mediaSession.setActionHandler("nexttrack", null);
//       navigator.mediaSession.setActionHandler("seekto", null);
//     };
//   }, [currentTrack, togglePlay, playPrev, playNext]);

//   // Keep the OS-level playback indicator (playing/paused) in sync
//   useEffect(() => {
//     if (!("mediaSession" in navigator)) return;
//     navigator.mediaSession.playbackState = playing ? "playing" : "paused";
//   }, [playing]);
//   // ------------------------------------------------------------------------

//   // --- NEW: auto-resume when the tab becomes visible again ---------------
//   // We can't prevent YouTube's own iframe content from pausing itself when
//   // the tab is backgrounded (see conversation context) -- but we CAN make
//   // coming back less annoying by resuming automatically, instead of making
//   // the user hunt for the play button every time.
//   const isYoutubeTrackRef = useRef(isYoutubeTrack);
//   useEffect(() => {
//     isYoutubeTrackRef.current = isYoutubeTrack;
//   }, [isYoutubeTrack]);

//   const playingRef = useRef(playing);
//   useEffect(() => {
//     playingRef.current = playing;
//   }, [playing]);

//   useEffect(() => {
//     function handleVisibilityChange() {
//       if (document.visibilityState !== "visible") return;
//       if (!isYoutubeTrackRef.current || !playingRef.current) return;

//       const yt = ytPlayerRef.current;
//       if (yt?.playVideo) {
//         try {
//           yt.playVideo();
//         } catch {
//           // ignore -- worst case, user just taps play manually as before
//         }
//       }
//     }

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () =>
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);
//   // ------------------------------------------------------------------------

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
//       isYoutubeTrack, // NEW: exposed in case UI wants to show a YouTube badge/icon
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
//       isYoutubeTrack,
//     ],
//   );

//   // NOTE: the YouTube player's container div is created and managed with
//   // plain DOM APIs in the effect above -- it is intentionally NOT rendered
//   // here via JSX, to avoid React and the YouTube IFrame API fighting over
//   // the same DOM node (see comment above).
//   return (
//     <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
//   );
// }

// export function useAudio() {
//   return useContext(AudioContext);
// }