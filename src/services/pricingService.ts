import {
  HOURLY_RATE_ETB,
  VAT_RATE,
  SERVICE_FEE_ETB,
  PEAK_MULTIPLIER,
  PEAK_HOURS,
} from "@/lib/constants";
import type { PriceBreakdown } from "@/types";

export function isPeakHour(date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= PEAK_HOURS.start && hour < PEAK_HOURS.end;
}

export function calculatePrice(
  startTime: string,
  endTime?: string
): PriceBreakdown {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const durationMs = end - start;
  const hours = Math.max(1, Math.ceil(durationMs / 3600000));
  const peak = isPeakHour(endTime ? new Date(endTime) : new Date());
  const rate = peak ? HOURLY_RATE_ETB * PEAK_MULTIPLIER : HOURLY_RATE_ETB;
  const subtotal = hours * rate;
  const peakSurcharge = peak ? subtotal - hours * HOURLY_RATE_ETB : 0;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat + SERVICE_FEE_ETB;

  return {
    durationMs,
    hours,
    ratePerHour: rate,
    subtotal,
    isPeak: peak,
    peakSurcharge,
    vat,
    serviceFee: SERVICE_FEE_ETB,
    total,
  };
}

export function getRunningEstimate(startTime: string): number {
  return calculatePrice(startTime).total;
}
