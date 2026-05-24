import type { ParkingSession, ParkingSpot } from "@/types";
import { generateId } from "@/lib/utils";

export function generateMockSessions(
  spots: ParkingSpot[],
  count = 20
): ParkingSession[] {
  const occupied = spots.filter((s) => s.status === "occupied");
  const sessions: ParkingSession[] = [];

  for (let i = 0; i < Math.min(count, occupied.length); i++) {
    const spot = occupied[i];
    const hoursAgo = Math.random() * 4 + 0.5;
    const start = new Date(Date.now() - hoursAgo * 3600000);

    sessions.push({
      id: generateId(),
      userId: "demo-user",
      spotId: spot.id,
      spotName: spot.name,
      floor: spot.floor,
      startTime: start.toISOString(),
      paymentStatus: "pending",
      qrSessionId: `QR-${spot.name.replace("-", "")}`,
    });
  }

  return sessions;
}
