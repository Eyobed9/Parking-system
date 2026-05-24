export const HOURLY_RATE_ETB = 50;
export const VAT_RATE = 0.15;
export const SERVICE_FEE_ETB = 5;
export const PEAK_MULTIPLIER = 1.25;
export const PEAK_HOURS = { start: 8, end: 10 };
export const FLOOR_COUNT = 3;
export const SPOTS_PER_FLOOR = 34;
export const TOTAL_SPOTS = 100;
export const EXTEND_MINUTES = 30;

export const QR_TOKENS = {
  ENTRY: "entry-demo",
  EXIT: "exit-demo",
} as const;

export const PAYMENT_METHODS = [
  "telebirr",
  "cbe_birr",
  "chapa",
  "cash",
  "card",
] as const;

export const ENTRANCE_POSITION = { x: 50, y: 400 };
export const EXIT_POSITION = { x: 750, y: 400 };
