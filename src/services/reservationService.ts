import type { ParkingReservation, ParkingSpot, RecommendationResult } from "@/types";
import { getRecommendations } from "@/services/recommendationService";

export function isReservationActive(
  reservation: ParkingReservation | null | undefined,
  now = Date.now()
): reservation is ParkingReservation {
  if (!reservation) return false;
  return new Date(reservation.expiresAt).getTime() > now;
}

export function getReservationTimeLeftMs(
  reservation: ParkingReservation,
  now = Date.now()
): number {
  return Math.max(0, new Date(reservation.expiresAt).getTime() - now);
}

export function formatReservationCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getEntryRecommendation(
  spots: ParkingSpot[],
  preferredFloor: number,
  reservation: ParkingReservation | null
): RecommendationResult | null {
  if (reservation && isReservationActive(reservation)) {
    const reservedSpot = spots.find((s) => s.id === reservation.spotId);
    if (
      reservedSpot &&
      (reservedSpot.status === "reserved" || reservedSpot.status === "free")
    ) {
      const alternatives = spots
        .filter((s) => s.status === "free" && s.id !== reservedSpot.id)
        .slice(0, 3);

      return {
        recommended: reservedSpot,
        alternatives,
        reasons: ["yourReservation"],
      };
    }
  }

  return getRecommendations(spots, preferredFloor);
}

export function canClaimSpot(
  spot: ParkingSpot | undefined,
  reservation: ParkingReservation | null
): boolean {
  if (!spot) return false;
  if (spot.status === "free") return true;
  if (
    spot.status === "reserved" &&
    reservation &&
    isReservationActive(reservation) &&
    reservation.spotId === spot.id
  ) {
    return true;
  }
  return false;
}
