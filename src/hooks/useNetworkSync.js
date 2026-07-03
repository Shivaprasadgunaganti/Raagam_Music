import { useEffect, useRef } from "react";
import useOfflineMode from "./useOfflineMode";
import { refreshAll } from "../utils/sync/syncManager";
import { useSync } from "../context/SyncContext";

export default function useNetworkSync() {
  const { isOnline } = useOfflineMode();

  const wasOffline = useRef(false);
  const { triggerSync } = useSync();

//   useEffect(() => {
//     if (!isOnline) {
//       wasOffline.current = true;
//       return;
//     }

//     if (wasOffline.current) {
//       console.log("🌐 Network restored");

//       refreshAll();

//       wasOffline.current = false;
//     }
//   }, [isOnline]);

useEffect(() => {
  async function handleNetworkRestore() {
    if (!isOnline) {
      wasOffline.current = true;
      return;
    }

    if (wasOffline.current) {
      console.log("🌐 Network restored");

      await refreshAll();

      triggerSync();

      wasOffline.current = false;
    }
  }

  handleNetworkRestore();
}, [isOnline, triggerSync]);
}