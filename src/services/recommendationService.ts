import type { ParkingSpot, RecommendationResult } from "@/types";
import { ENTRANCE_POSITION, EXIT_POSITION } from "@/lib/constants";

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function scoreSpot(
  spot: ParkingSpot,
  preferredFloor?: number,
  history?: string[]
): number {
  const distEntrance = distance(spot.x, spot.y, ENTRANCE_POSITION.x, ENTRANCE_POSITION.y);
  const distExit = distance(spot.x, spot.y, EXIT_POSITION.x, EXIT_POSITION.y);
  const avgDist = (distEntrance + distExit) / 2;

  let score = 1000 - avgDist;

  if (preferredFloor && spot.floor === preferredFloor) score += 80;
  if (spot.handicap) score += 20;
  if (spot.hasEV) score += 10;
  if (history?.some((h) => h.startsWith(spot.name[0]))) score += 40;

  const lowTrafficZone = spot.y < 200 || spot.y > 350;
  if (lowTrafficZone) score += 30;

  return score;
}

export function getRecommendations(
  spots: ParkingSpot[],
  preferredFloor = 1,
  history: string[] = ["A-12", "B-04"]
): RecommendationResult | null {
  const free = spots.filter((s) => s.status === "free");
  if (free.length === 0) return null;

  const scored = free
    .map((spot) => ({
      spot,
      score: scoreSpot(spot, preferredFloor, history),
    }))
    .sort((a, b) => b.score - a.score);

  const recommended = scored[0].spot;
  const alternatives = scored.slice(1, 4).map((s) => s.spot);

  const reasons: string[] = [];
  if (recommended.floor === preferredFloor) reasons.push("preferredFloor");
  reasons.push("nearestAvailable");
  if (distance(recommended.x, recommended.y, EXIT_POSITION.x, EXIT_POSITION.y) < 300) {
    reasons.push("nearExit");
  }

  return { recommended, alternatives, reasons };
}
