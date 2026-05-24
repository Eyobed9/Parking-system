"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { calculatePrice } from "@/services/pricingService";
import { processPayment } from "@/services/paymentService";
import { useSessionStore } from "@/store/useSessionStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { PaymentSummary } from "@/features/payment/PaymentSummary";
import { PaymentMethodSelector } from "@/features/payment/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import type { PaymentMethod, ParkingSession } from "@/types";

function PaymentContent() {
  const t = useTranslations("payment");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOfflineStore((s) => s.isOnline);
  const setLastPayment = useSessionStore((s) => s.setLastPayment);
  const [endedSession] = useState<ParkingSession | null>(() => {
    const stored = sessionStorage.getItem("endedSession");
    if (stored) return JSON.parse(stored) as ParkingSession;
    return null;
  });
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  const sessionId = searchParams.get("sessionId");
  const session = endedSession;

  if (!session) {
    return (
      <p className="text-center text-muted-foreground">
        No payment session. Complete exit scan first.
      </p>
    );
  }

  const breakdown = calculatePrice(
    session.billingStartTime ?? session.startTime,
    session.endTime ?? new Date().toISOString()
  );

  const handlePay = async () => {
    if (!method) return;
    setLoading(true);
    const result = await processPayment(
      sessionId ?? session.id,
      method,
      breakdown.total,
      isOnline
    );
    setLoading(false);

    if (result.queued) {
      toast.info(t("queued"));
    } else {
      toast.success(t("success"));
    }

    setLastPayment({
      sessionId: session.id,
      amount: breakdown.total,
      method: t(method),
    });

    router.push(
      `/receipt?amount=${breakdown.total}&spot=${session.spotName}&method=${method}&tx=${result.payment.id}`
    );
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <PaymentSummary
        title={t("title")}
        breakdown={breakdown}
        labels={{
          duration: t("duration"),
          pricePerHour: t("pricePerHour"),
          subtotal: t("subtotal"),
          vat: t("vat"),
          serviceFee: t("serviceFee"),
          total: t("total"),
          peakSurcharge: t("peakSurcharge"),
        }}
      />
      <div>
        <h2 className="mb-3 font-semibold">{t("selectMethod")}</h2>
        <PaymentMethodSelector selected={method} onSelect={setMethod} />
      </div>
      <Button
        size="lg"
        className="w-full"
        disabled={!method || loading}
        onClick={handlePay}
      >
        {loading ? "..." : t("pay")} — {breakdown.total} ETB
      </Button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted p-8" />}>
      <PaymentContent />
    </Suspense>
  );
}
