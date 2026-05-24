import { openDB, type IDBPDatabase } from "idb";
import type { PaymentRecord } from "@/types";

const DB_NAME = "smart-parking-db";
const DB_VERSION = 1;

interface ParkingDB {
  spots: { key: string; value: string };
  qrTokens: { key: string; value: string };
  pendingPayments: { key: string; value: PaymentRecord };
}

let dbPromise: Promise<IDBPDatabase<ParkingDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ParkingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("spots")) {
          db.createObjectStore("spots");
        }
        if (!db.objectStoreNames.contains("qrTokens")) {
          db.createObjectStore("qrTokens");
        }
        if (!db.objectStoreNames.contains("pendingPayments")) {
          db.createObjectStore("pendingPayments", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheSpots(data: string): Promise<void> {
  const db = await getDB();
  await db.put("spots", data, "layout");
}

export async function getCachedSpots(): Promise<string | undefined> {
  const db = await getDB();
  return db.get("spots", "layout");
}

export async function cacheQRTokens(tokens: string[]): Promise<void> {
  const db = await getDB();
  await db.put("qrTokens", JSON.stringify(tokens), "valid");
}

export async function getCachedQRTokens(): Promise<string[]> {
  const db = await getDB();
  const raw = await db.get("qrTokens", "valid");
  if (!raw) return [];
  return JSON.parse(raw as string) as string[];
}

export async function queuePayment(payment: PaymentRecord): Promise<void> {
  const db = await getDB();
  await db.put("pendingPayments", payment);
}

export async function getPendingPayments(): Promise<PaymentRecord[]> {
  const db = await getDB();
  return db.getAll("pendingPayments");
}

export async function clearPendingPayment(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("pendingPayments", id);
}
