export const HOURLY_RATE_ETB = 50;
export const VAT_RATE = 0.15;
export const SERVICE_FEE_ETB = 5;
export const PEAK_MULTIPLIER = 1.25;
export const PEAK_HOURS = { start: 8, end: 10 };
export const FLOOR_COUNT = 3;
export const SPOTS_PER_FLOOR = 34;
export const TOTAL_SPOTS = 100;
export const EXTEND_MINUTES = 30;

export const RESERVATION_HOLD_OPTIONS = [
  { minutes: 30, labelKey: "30min" },
  { minutes: 60, labelKey: "1hr" },
  { minutes: 120, labelKey: "2hr" },
  { minutes: 240, labelKey: "4hr" },
] as const;

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

export const ENTRANCE_FLOOR = 1;
export const ENTRANCE_POSITION = { x: 50, y: 400 };
export const EXIT_POSITION = { x: 750, y: 400 };
/** Stairs / elevator — same map position on every floor */
export const STAIRS_POSITION = { x: 400, y: 120 };

export const MAP_BOUNDS = { minX: 20, maxX: 820, minY: 20, maxY: 480 };
/** Map units per step — higher = faster cross-map movement */
export const NAV_STEP_LENGTH = 26;
export const NAV_OFF_ROUTE_THRESHOLD = 45;
export const NAV_ARRIVAL_THRESHOLD = 40;
export const NAV_STAIRS_THRESHOLD = 35;
/** Compass degrees offset so map +x (east) aligns with walking direction into the lot */
export const NAV_COMPASS_OFFSET = 90;
