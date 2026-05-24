import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  preferredFloor: number;
  setPreferredFloor: (floor: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferredFloor: 1,
      setPreferredFloor: (floor) => set({ preferredFloor: floor }),
    }),
    { name: "parking-settings" }
  )
);
