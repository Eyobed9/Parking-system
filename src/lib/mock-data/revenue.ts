import type { RevenueDataPoint } from "@/types";

export function generateRevenueData(): RevenueDataPoint[] {
  const data: RevenueDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      revenue: Math.floor(8000 + Math.random() * 6000),
    });
  }
  return data;
}

export const MOCK_TODAY_REVENUE = 12500;
