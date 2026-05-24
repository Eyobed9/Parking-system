import type { ParkingSpot, FloorStats, DashboardStats } from "@/types";
import { HOURLY_RATE_ETB } from "@/lib/constants";

export function getDashboardStats(
  spots: ParkingSpot[],
  activeSessions: number
): DashboardStats {
  return {
    totalSpots: spots.length,
    occupied: spots.filter((s) => s.status === "occupied").length,
    free: spots.filter((s) => s.status === "free").length,
    reserved: spots.filter((s) => s.status === "reserved").length,
    pricePerHour: HOURLY_RATE_ETB,
    activeSessions,
  };
}

export function getFloorStats(spots: ParkingSpot[]): FloorStats[] {
  const floors = [...new Set(spots.map((s) => s.floor))].sort();
  return floors.map((floor) => {
    const floorSpots = spots.filter((s) => s.floor === floor);
    return {
      floor,
      total: floorSpots.length,
      occupied: floorSpots.filter((s) => s.status === "occupied").length,
      free: floorSpots.filter((s) => s.status === "free").length,
      reserved: floorSpots.filter((s) => s.status === "reserved").length,
    };
  });
}

export function updateSpotStatus(
  spots: ParkingSpot[],
  spotId: string,
  status: ParkingSpot["status"]
): ParkingSpot[] {
  return spots.map((s) => (s.id === spotId ? { ...s, status } : s));
}

export function getSpotsByFloor(spots: ParkingSpot[], floor: number): ParkingSpot[] {
  return spots.filter((s) => s.floor === floor);
}
