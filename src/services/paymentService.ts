import type { PaymentMethod, PaymentRecord, PaymentStatus } from "@/types";
import { generateId } from "@/lib/utils";
import { queuePayment, clearPendingPayment, getPendingPayments } from "@/lib/idb";

export async function processPayment(
  sessionId: string,
  method: PaymentMethod,
  amount: number,
  isOnline: boolean
): Promise<{ success: boolean; payment: PaymentRecord; queued: boolean }> {
  const payment: PaymentRecord = {
    id: generateId(),
    sessionId,
    method,
    amount,
    status: isOnline ? "paid" : "queued",
    createdAt: new Date().toISOString(),
  };

  if (!isOnline) {
    await queuePayment(payment);
    return { success: true, payment, queued: true };
  }

  await new Promise((r) => setTimeout(r, 800));
  return { success: true, payment: { ...payment, status: "paid" }, queued: false };
}

export async function syncPendingPayments(): Promise<PaymentRecord[]> {
  const pending = await getPendingPayments();
  const synced: PaymentRecord[] = [];

  for (const p of pending) {
    await clearPendingPayment(p.id);
    synced.push({ ...p, status: "paid" as PaymentStatus });
  }

  return synced;
}
