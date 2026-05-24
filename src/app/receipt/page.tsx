"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ReceiptCard } from "@/features/payment/ReceiptCard";
import { Button } from "@/components/ui/button";

function ReceiptContent() {
  const t = useTranslations("receipt");
  const tp = useTranslations("payment");
  const searchParams = useSearchParams();

  const amount = Number(searchParams.get("amount") ?? 0);
  const spot = searchParams.get("spot") ?? "—";
  const method = searchParams.get("method") ?? "cash";
  const tx = searchParams.get("tx") ?? "—";

  return (
    <div className="space-y-6">
      <ReceiptCard
        title={t("title")}
        thankYou={t("thankYou")}
        spotName={spot}
        amount={amount}
        method={tp(method as "cash")}
        transactionId={tx}
        paidWithLabel={t("paidWith")}
        transactionLabel={t("transactionId")}
      />
      <div className="no-print flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={() => window.print()}>
          {t("print")}
        </Button>
        <Link href="/dashboard">
          <Button className="w-full sm:w-auto">{t("backHome")}</Button>
        </Link>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted p-8" />}>
      <ReceiptContent />
    </Suspense>
  );
}
