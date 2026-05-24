"use client";

import { useEffect } from "react";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useReservationStore } from "@/store/useReservationStore";
import { initializeOfflineCache } from "@/services/syncService";

export function DataInitializer() {
  const init = useParkingStore((s) => s.init);
  const initMockSessions = useSessionStore((s) => s.initMockSessions);
  const spots = useParkingStore((s) => s.spots);
  const releaseSpot = useParkingStore((s) => s.releaseSpot);
  const expireIfNeeded = useReservationStore((s) => s.expireIfNeeded);

  useEffect(() => {
    init();
    initMockSessions();
  }, [init, initMockSessions]);

  useEffect(() => {
    const syncExpiry = () => {
      const expired = expireIfNeeded();
      if (expired) releaseSpot(expired.spotId);
    };
    syncExpiry();
    const id = window.setInterval(syncExpiry, 30_000);
    return () => window.clearInterval(id);
  }, [expireIfNeeded, releaseSpot]);

  useEffect(() => {
    if (spots.length > 0) {
      void initializeOfflineCache(spots);
    }
  }, [spots]);

  return null;
}
