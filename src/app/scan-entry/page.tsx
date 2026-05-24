"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { validateQRToken } from "@/services/qrService";
import {
  canClaimSpot,
  getEntryRecommendation,
  isReservationActive,
} from "@/services/reservationService";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useReservationStore } from "@/store/useReservationStore";
import { SpotRecommendationCard } from "@/features/qr/SpotRecommendationCard";
import { ScanVerifiedStep } from "@/features/qr/ScanVerifiedStep";

const QRScanner = dynamic(
  () => import("@/features/qr/QRScanner").then((m) => m.QRScanner),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted" /> }
);

type EntryStep = "scan" | "verified" | "choose";

const VERIFIED_DELAY_MS = 1600;

export default function ScanEntryPage() {
  const t = useTranslations("entry");
  const router = useRouter();
  const spots = useParkingStore((s) => s.spots);
  const occupySpot = useParkingStore((s) => s.occupySpot);
  const preferredFloor = useSettingsStore((s) => s.preferredFloor);
  const recommendation = useSessionStore((s) => s.recommendation);
  const setRecommendation = useSessionStore((s) => s.setRecommendation);
  const startSession = useSessionStore((s) => s.startSession);
  const activeReservation = useReservationStore((s) => s.activeReservation);
  const clearReservation = useReservationStore((s) => s.clearReservation);
  const expireIfNeeded = useReservationStore((s) => s.expireIfNeeded);
  const releaseSpot = useParkingStore((s) => s.releaseSpot);
  const anchorAtEntrance = useNavigationStore((s) => s.anchorAtEntrance);
  const startNavigation = useNavigationStore((s) => s.startNavigation);
  const [step, setStep] = useState<EntryStep>("scan");

  useEffect(() => {
    const expired = expireIfNeeded();
    if (expired) releaseSpot(expired.spotId);
  }, [expireIfNeeded, releaseSpot]);

  useEffect(() => {
    if (step !== "verified") return;
    const timer = window.setTimeout(() => setStep("choose"), VERIFIED_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [step]);

  const handleScan = useCallback(
    async (text: string): Promise<boolean> => {
      const token = await validateQRToken(text);
      if (!token || token.type !== "entry") {
        toast.error(t("invalidQR"));
        return false;
      }
      const reservation =
        activeReservation && isReservationActive(activeReservation) ? activeReservation : null;
      const reco = getEntryRecommendation(spots, preferredFloor, reservation);
      if (!reco) {
        toast.error(t("noSpots"));
        return false;
      }
      setRecommendation(reco);
      anchorAtEntrance();
      setStep("verified");
      return true;
    },
    [spots, preferredFloor, activeReservation, setRecommendation, anchorAtEntrance, t]
  );

  const startWithSpot = (spotId: string) => {
    const spot = spots.find((s) => s.id === spotId);
    const reservation =
      activeReservation && isReservationActive(activeReservation) ? activeReservation : null;
    if (!canClaimSpot(spot, reservation)) return;
    occupySpot(spotId);
    clearReservation();
    startSession(spotId, spot!.name, spot!.floor);
    startNavigation(spot!.id, spot!.name, spot!.x, spot!.y, spot!.floor);
    toast.success(`${spot!.name}`);
    router.push("/map?navigate=1");
  };

  const title = step === "choose" ? t("chooseTitle") : t("title");

  return (
    <motion.div
      layout
      className="mx-auto max-w-lg space-y-6"
    >
      <motion.h1 layout className="text-2xl font-bold">
        {title}
      </motion.h1>

      <AnimatePresence mode="wait">
        {step === "scan" ? (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <QRScanner onScan={handleScan} invalidMessage={t("invalidQR")} />
          </motion.div>
        ) : null}

        {step === "verified" ? <ScanVerifiedStep key="verified" /> : null}

        {step === "choose" && recommendation ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SpotRecommendationCard
              recommendation={recommendation}
              onAccept={() => startWithSpot(recommendation.recommended.id)}
              onChooseMap={() => router.push("/map?mode=select&navigate=1")}
              onSelectAlternative={(id) => {
                const alt = recommendation.alternatives.find((s) => s.id === id);
                if (alt) startWithSpot(alt.id);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
