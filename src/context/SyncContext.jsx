import { createContext, useContext, useState } from "react";

const SyncContext = createContext();

export function SyncProvider({ children }) {
  const [syncVersion, setSyncVersion] = useState(0);

  function triggerSync() {
    setSyncVersion((prev) => prev + 1);
  }

  return (
    <SyncContext.Provider
      value={{
        syncVersion,
        triggerSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}