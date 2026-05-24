import { syncPendingPayments } from "./paymentService";
import { initQRCache } from "./qrService";
import { cacheSpots, getCachedSpots } from "@/lib/idb";
import type { ParkingSpot } from "@/types";

export async function initializeOfflineCache(spots: ParkingSpot[]): Promise<void> {
  await initQRCache();
  const existing = await getCachedSpots();
  if (!existing) {
    await cacheSpots(JSON.stringify(spots));
  }
}

export async function onBackOnline(
  onSynced?: (count: number) => void
): Promise<void> {
  const synced = await syncPendingPayments();
  if (synced.length > 0) onSynced?.(synced.length);
}

export function setupOnlineListener(
  callback: (online: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  callback(navigator.onLine);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
