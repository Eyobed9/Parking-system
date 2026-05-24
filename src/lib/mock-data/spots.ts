import type { ParkingSpot } from "@/types";
import { FLOOR_COUNT, TOTAL_SPOTS } from "@/lib/constants";

const FLOOR_LETTERS = ["A", "B", "C"];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateParkingSpots(): ParkingSpot[] {
  const spots: ParkingSpot[] = [];
  let count = 0;

  for (let floor = 1; floor <= FLOOR_COUNT; floor++) {
    const letter = FLOOR_LETTERS[floor - 1] ?? "X";
    const perFloor = floor === FLOOR_COUNT ? TOTAL_SPOTS - count : Math.ceil(TOTAL_SPOTS / FLOOR_COUNT);
    const cols = 10;

    for (let i = 0; i < perFloor && count < TOTAL_SPOTS; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const num = (i + 1).toString().padStart(2, "0");
      const seed = floor * 100 + i;
      const rand = seededRandom(seed);

      let status: ParkingSpot["status"] = "free";
      if (rand < 0.08) status = "reserved";
      else if (rand < 0.68) status = "occupied";

      spots.push({
        id: `${letter}-${num}`,
        name: `${letter}-${num}`,
        floor,
        status,
        x: 80 + col * 70,
        y: 60 + row * 55 + (floor - 1) * 20,
        hasEV: rand > 0.92,
        handicap: rand > 0.88 && rand < 0.92,
      });
      count++;
    }
  }

  return spots;
}
