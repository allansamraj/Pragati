"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type NetworkMode = "online" | "low-data" | "offline";

export interface ConnectivityContextType {
  mode: NetworkMode;
  setMode: (mode: NetworkMode) => void;
  pendingSyncCount: number;
  syncData: () => Promise<void>;
  isSyncing: boolean;
  isOffline: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  mode: "online",
  setMode: () => {},
  pendingSyncCount: 0,
  syncData: async () => {},
  isSyncing: false,
  isOffline: false,
});

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<NetworkMode>("online");
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("pragati_network_mode") as NetworkMode;
    if (saved && ["online", "low-data", "offline"].includes(saved)) {
      setModeState(saved);
      if (saved === "offline") {
        setPendingSyncCount(2); // simulated pending items (e.g. offline token request, triage note)
      }
    }
  }, []);

  const setMode = (newMode: NetworkMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem("pragati_network_mode", newMode);
      if (newMode === "offline") {
        setPendingSyncCount((c) => (c === 0 ? 2 : c));
      }
    } catch {}
  };

  const syncData = async () => {
    if (mode === "offline") return;
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPendingSyncCount(0);
    setIsSyncing(false);
  };

  return (
    <ConnectivityContext.Provider
      value={{
        mode,
        setMode,
        pendingSyncCount,
        syncData,
        isSyncing,
        isOffline: mode === "offline",
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
