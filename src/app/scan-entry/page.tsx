"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { QR_TOKENS } from "@/lib/constants";
import { validateQRToken } from "@/services/qrService";
import { getRecommendations } from "@/services/recommendationService";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SpotRecommendationCard } from "@/features/qr/SpotRecommendationCard";

const QRScanner = dynamic(
  () => import("@/features/qr/QRScanner").then((m) => m.QRScanner),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted" /> }
);

export default function ScanEntryPage() {
  const t = useTranslations("entry");
  const router = useRouter();
  const spots = useParkingStore((s) => s.spots);
  const occupySpot = useParkingStore((s) => s.occupySpot);
  const preferredFloor = useSettingsStore((s) => s.preferredFloor);
  const recommendation = useSessionStore((s) => s.recommendation);
  const setRecommendation = useSessionStore((s) => s.setRecommendation);
  const startSession = useSessionStore((s) => s.startSession);
  const [scanned, setScanned] = useState(false);

  const handleScan = useCallback(
    async (text: string): Promise<boolean> => {
      const token = await validateQRToken(text);
      if (!token || token.type !== "entry") {
        toast.error(t("invalidQR"));
        return false;
      }
      const reco = getRecommendations(spots, preferredFloor);
      if (!reco) {
        toast.error(t("noSpots"));
        return false;
      }
      setRecommendation(reco);
      setScanned(true);
      return true;
    },
    [spots, preferredFloor, setRecommendation, t]
  );

  const startWithSpot = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (!spot || spot.status !== "free") return;
    occupySpot(spotId);
    startSession(spotId, spot.name, spot.floor);
    toast.success(`${spot.name}`);
    router.push("/session");
  };

  if (scanned && recommendation) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <SpotRecommendationCard
          recommendation={recommendation}
          onAccept={() => startWithSpot(recommendation.recommended.id)}
          onChooseMap={() => router.push("/map?mode=select")}
          onSelectAlternative={(id) => {
            const alt = recommendation.alternatives.find((s) => s.id === id);
            if (alt) startWithSpot(alt.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <QRScanner
        onScan={handleScan}
        simulateLabel={t("simulateScan")}
        simulateToken={QR_TOKENS.ENTRY}
        invalidMessage={t("invalidQR")}
      />
    </div>
  );
}
