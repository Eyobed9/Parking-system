import { generateParkingSpots } from "./spots";
import { generateMockSessions } from "./sessions";
import { generateRevenueData, MOCK_TODAY_REVENUE } from "./revenue";

export function createInitialData() {
  const spots = generateParkingSpots();
  const sessions = generateMockSessions(spots);
  const revenue = generateRevenueData();
  return { spots, sessions, revenue, todayRevenue: MOCK_TODAY_REVENUE };
}

export { generateParkingSpots, generateMockSessions, generateRevenueData, MOCK_TODAY_REVENUE };
