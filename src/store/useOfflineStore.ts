import { create } from "zustand";

interface OfflineState {
  isOnline: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  setOnline: (online: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSynced: (date: string) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: true,
  lastSyncedAt: null,
  pendingCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setLastSynced: (date) => set({ lastSyncedAt: date }),
}));
