"use client";

import { useEffect } from "react";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { initializeOfflineCache } from "@/services/syncService";

export function DataInitializer() {
  const init = useParkingStore((s) => s.init);
  const initMockSessions = useSessionStore((s) => s.initMockSessions);
  const spots = useParkingStore((s) => s.spots);

  useEffect(() => {
    init();
    initMockSessions();
  }, [init, initMockSessions]);

  useEffect(() => {
    if (spots.length > 0) {
      void initializeOfflineCache(spots);
    }
  }, [spots]);

  return null;
}
