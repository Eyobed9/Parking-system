"use client";

import { useEffect } from "react";
import { useOfflineStore } from "@/store/useOfflineStore";
import { setupOnlineListener, onBackOnline } from "@/services/syncService";
import { toast } from "sonner";

export function useOnlineStatus() {
  const { setOnline, setLastSynced, setPendingCount } = useOfflineStore();

  useEffect(() => {
    const cleanup = setupOnlineListener(async (online) => {
      setOnline(online);
      if (online) {
        const synced = await onBackOnline((count) => {
          setPendingCount(0);
          setLastSynced(new Date().toISOString());
          if (count > 0) toast.success(`Synced ${count} payment(s)`);
        });
        void synced;
      }
    });
    return cleanup;
  }, [setOnline, setLastSynced, setPendingCount]);
}
