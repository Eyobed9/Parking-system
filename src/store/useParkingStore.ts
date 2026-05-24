import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ParkingSpot } from "@/types";
import { createInitialData } from "@/lib/mock-data";
import { updateSpotStatus } from "@/services/spotService";

interface ParkingState {
  spots: ParkingSpot[];
  selectedSpotId: string | null;
  currentFloor: number;
  initialized: boolean;
  init: () => void;
  setSelectedSpot: (id: string | null) => void;
  setCurrentFloor: (floor: number) => void;
  occupySpot: (spotId: string) => void;
  freeSpot: (spotId: string) => void;
  getSpot: (id: string) => ParkingSpot | undefined;
}

export const useParkingStore = create<ParkingState>()(
  persist(
    (set, get) => ({
      spots: [],
      selectedSpotId: null,
      currentFloor: 1,
      initialized: false,
      init: () => {
        if (get().initialized && get().spots.length > 0) return;
        const { spots } = createInitialData();
        set({ spots, initialized: true });
      },
      setSelectedSpot: (id) => set({ selectedSpotId: id }),
      setCurrentFloor: (floor) => set({ currentFloor: floor }),
      occupySpot: (spotId) =>
        set((s) => ({
          spots: updateSpotStatus(s.spots, spotId, "occupied"),
        })),
      freeSpot: (spotId) =>
        set((s) => ({
          spots: updateSpotStatus(s.spots, spotId, "free"),
        })),
      getSpot: (id) => get().spots.find((s) => s.id === id),
    }),
    { name: "parking-spots", partialize: (s) => ({ spots: s.spots, initialized: s.initialized }) }
  )
);
