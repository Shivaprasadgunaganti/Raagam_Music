import { useEffect, useState } from "react";

export default function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function goOnline() {
      setIsOffline(false);
    }

    function goOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return {
    isOffline,
    isOnline: !isOffline,
  };
}