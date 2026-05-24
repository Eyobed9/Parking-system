import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ParkingReservation, ParkingSpot } from "@/types";
import { generateId } from "@/lib/utils";
import { isReservationActive } from "@/services/reservationService";

interface ReservationState {
  activeReservation: ParkingReservation | null;
  createReservation: (spot: ParkingSpot, holdMinutes: number) => ParkingReservation | null;
  cancelReservation: () => ParkingReservation | null;
  clearReservation: () => void;
  expireIfNeeded: () => ParkingReservation | null;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      activeReservation: null,
      createReservation: (spot, holdMinutes) => {
        const existing = get().activeReservation;
        if (existing && isReservationActive(existing)) return null;

        const createdAt = new Date();
        const reservation: ParkingReservation = {
          id: generateId(),
          userId: "demo-user",
          spotId: spot.id,
          spotName: spot.name,
          floor: spot.floor,
          holdMinutes,
          createdAt: createdAt.toISOString(),
          expiresAt: new Date(createdAt.getTime() + holdMinutes * 60_000).toISOString(),
        };

        set({ activeReservation: reservation });
        return reservation;
      },
      cancelReservation: () => {
        const reservation = get().activeReservation;
        set({ activeReservation: null });
        return reservation;
      },
      clearReservation: () => set({ activeReservation: null }),
      expireIfNeeded: () => {
        const reservation = get().activeReservation;
        if (!reservation || isReservationActive(reservation)) return null;
        set({ activeReservation: null });
        return reservation;
      },
    }),
    {
      name: "parking-reservation",
      partialize: (s) => ({ activeReservation: s.activeReservation }),
    }
  )
);
