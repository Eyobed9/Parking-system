import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ParkingSession, RecommendationResult } from "@/types";
import { generateId } from "@/lib/utils";
import { EXTEND_MINUTES } from "@/lib/constants";
import { calculatePrice } from "@/services/pricingService";
import { createInitialData } from "@/lib/mock-data";

interface SessionState {
  activeSession: ParkingSession | null;
  mockSessions: ParkingSession[];
  recommendation: RecommendationResult | null;
  lastPayment: { sessionId: string; amount: number; method: string } | null;
  initMockSessions: () => void;
  setRecommendation: (r: RecommendationResult | null) => void;
  startSession: (spotId: string, spotName: string, floor: number) => ParkingSession;
  endSession: () => ParkingSession | null;
  extendSession: () => void;
  changeSpot: (spotId: string, spotName: string, floor: number) => void;
  setLastPayment: (data: SessionState["lastPayment"]) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      mockSessions: [],
      recommendation: null,
      lastPayment: null,
      initMockSessions: () => {
        if (get().mockSessions.length > 0) return;
        const { sessions } = createInitialData();
        set({ mockSessions: sessions });
      },
      setRecommendation: (r) => set({ recommendation: r }),
      startSession: (spotId, spotName, floor) => {
        const session: ParkingSession = {
          id: generateId(),
          userId: "demo-user",
          spotId,
          spotName,
          floor,
          startTime: new Date().toISOString(),
          paymentStatus: "pending",
          qrSessionId: `QR-${spotName.replace("-", "")}`,
          extendedMinutes: 0,
        };
        set({ activeSession: session, recommendation: null });
        return session;
      },
      endSession: () => {
        const session = get().activeSession;
        if (!session) return null;
        const ended: ParkingSession = {
          ...session,
          endTime: new Date().toISOString(),
          totalPrice: calculatePrice(
            session.startTime,
            new Date().toISOString(),
            session.extendedMinutes ?? 0
          ).total,
        };
        set({ activeSession: null });
        return ended;
      },
      extendSession: () => {
        const s = get().activeSession;
        if (!s) return;
        set({
          activeSession: {
            ...s,
            extendedMinutes: (s.extendedMinutes ?? 0) + EXTEND_MINUTES,
          },
        });
      },
      changeSpot: (spotId, spotName, floor) => {
        const s = get().activeSession;
        if (!s) return;
        set({
          activeSession: { ...s, spotId, spotName, floor },
        });
      },
      setLastPayment: (data) => set({ lastPayment: data }),
    }),
    {
      name: "parking-session",
      partialize: (s) => ({
        activeSession: s.activeSession,
        lastPayment: s.lastPayment,
      }),
    }
  )
);
