export type SpotStatus = "free" | "occupied" | "reserved";
export type PaymentStatus = "pending" | "paid" | "queued";
export type PaymentMethod =
  | "telebirr"
  | "cbe_birr"
  | "chapa"
  | "cash"
  | "card";

export interface ParkingSpot {
  id: string;
  name: string;
  floor: number;
  status: SpotStatus;
  x: number;
  y: number;
  hasEV: boolean;
  handicap: boolean;
}

export interface ParkingSession {
  id: string;
  userId: string;
  spotId: string;
  spotName: string;
  floor: number;
  startTime: string;
  /** When set, parking duration and billing are counted from arrival at the spot */
  billingStartTime?: string;
  endTime?: string;
  totalPrice?: number;
  paymentStatus: PaymentStatus;
  qrSessionId: string;
}

export interface PaymentRecord {
  id: string;
  sessionId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface QRToken {
  token: string;
  type: "entry" | "exit";
}

export interface DashboardStats {
  totalSpots: number;
  occupied: number;
  free: number;
  reserved: number;
  pricePerHour: number;
  activeSessions: number;
}

export interface FloorStats {
  floor: number;
  total: number;
  occupied: number;
  free: number;
  reserved: number;
}

export interface ParkingReservation {
  id: string;
  userId: string;
  spotId: string;
  spotName: string;
  floor: number;
  holdMinutes: number;
  createdAt: string;
  expiresAt: string;
}

export interface RecommendationResult {
  recommended: ParkingSpot;
  alternatives: ParkingSpot[];
  reasons: string[];
}

export interface PriceBreakdown {
  durationMs: number;
  hours: number;
  ratePerHour: number;
  subtotal: number;
  isPeak: boolean;
  peakSurcharge: number;
  vat: number;
  serviceFee: number;
  total: number;
}
