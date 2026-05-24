import { generateParkingSpots } from "./spots";
import { generateMockSessions } from "./sessions";

export function createInitialData() {
  const spots = generateParkingSpots();
  const sessions = generateMockSessions(spots);
  return { spots, sessions };
}

export { generateParkingSpots, generateMockSessions };
