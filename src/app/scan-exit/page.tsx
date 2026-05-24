"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { QR_TOKENS } from "@/lib/constants";
import { validateQRToken } from "@/services/qrService";
import { useSessionStore } from "@/store/useSessionStore";
import { useParkingStore } from "@/store/useParkingStore";
import { Button } from "@/components/ui/button";

const QRScanner = dynamic(
  () => import("@/features/qr/QRScanner").then((m) => m.QRScanner),
  { ssr: false }
);

export default function ScanExitPage() {
  const t = useTranslations("exit");
  const router = useRouter();
  const activeSession = useSessionStore((s) => s.activeSession);
  const endSession = useSessionStore((s) => s.endSession);
  const freeSpot = useParkingStore((s) => s.freeSpot);

  const handleScan = useCallback(
    async (text: string): Promise<boolean> => {
      const token = await validateQRToken(text);
      if (!token || token.type !== "exit") {
        toast.error(t("invalidQR"));
        return false;
      }
      if (!activeSession) {
        toast.error(t("noSession"));
        return false;
      }
      const ended = endSession();
      if (ended) {
        freeSpot(ended.spotId);
        sessionStorage.setItem("endedSession", JSON.stringify(ended));
        router.push(`/payment?sessionId=${ended.id}`);
      }
      return true;
    },
    [activeSession, endSession, freeSpot, router, t]
  );

  if (!activeSession) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("noSession")}</p>
        <Link href="/scan-entry">
          <Button size="lg">{t("goToEntry")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">
        {activeSession.spotName} — {activeSession.qrSessionId}
      </p>
      <QRScanner
        onScan={handleScan}
        simulateLabel={t("simulateScan")}
        simulateToken={QR_TOKENS.EXIT}
        invalidMessage={t("invalidQR")}
      />
    </div>
  );
}
