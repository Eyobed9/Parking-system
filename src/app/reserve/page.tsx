"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { RESERVATION_HOLD_OPTIONS } from "@/lib/constants";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useReservationStore } from "@/store/useReservationStore";
import { isReservationActive } from "@/services/reservationService";
import { ActiveReservationCard } from "@/features/reservation/ActiveReservationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ParkingMap = dynamic(
  () => import("@/features/parking/ParkingMap").then((m) => m.ParkingMap),
  { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-xl bg-muted" /> }
);

export default function ReservePage() {
  const t = useTranslations("reserve");
  const tm = useTranslations("map");
  const spots = useParkingStore((s) => s.spots);
  const selectedSpotId = useParkingStore((s) => s.selectedSpotId);
  const setSelectedSpot = useParkingStore((s) => s.setSelectedSpot);
  const currentFloor = useParkingStore((s) => s.currentFloor);
  const setCurrentFloor = useParkingStore((s) => s.setCurrentFloor);
  const reserveSpot = useParkingStore((s) => s.reserveSpot);
  const releaseSpot = useParkingStore((s) => s.releaseSpot);
  const activeSession = useSessionStore((s) => s.activeSession);
  const activeReservation = useReservationStore((s) => s.activeReservation);
  const createReservation = useReservationStore((s) => s.createReservation);
  const cancelReservation = useReservationStore((s) => s.cancelReservation);
  const expireIfNeeded = useReservationStore((s) => s.expireIfNeeded);
  const releaseSpot = useParkingStore((s) => s.releaseSpot);

  const [floor, setFloor] = useState(currentFloor);
  const [holdMinutes, setHoldMinutes] = useState<number>(RESERVATION_HOLD_OPTIONS[1].minutes);

  useEffect(() => {
    const expired = expireIfNeeded();
    if (expired) releaseSpot(expired.spotId);
  }, [expireIfNeeded, releaseSpot]);

  const reservation = activeReservation && isReservationActive(activeReservation)
    ? activeReservation
    : null;

  const floors = [...new Set(spots.map((s) => s.floor))].sort();

  const handleCancel = () => {
    const cancelled = cancelReservation();
    if (cancelled) releaseSpot(cancelled.spotId);
    toast.success(t("cancelled"));
  };

  const handleConfirm = () => {
    if (!selectedSpotId) {
      toast.error(t("selectSpot"));
      return;
    }
    const spot = spots.find((s) => s.id === selectedSpotId);
    if (!spot || spot.status !== "free") {
      toast.error(t("spotUnavailable"));
      return;
    }

    const reservationResult = createReservation(spot, holdMinutes);
    if (!reservationResult) {
      toast.error(t("alreadyReserved"));
      return;
    }

    reserveSpot(spot.id);
    toast.success(t("confirmed", { spot: spot.name }));
  };

  if (activeSession) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("sessionActive")}</p>
        <Link href="/session">
          <Button size="lg">{t("goToSession")}</Button>
        </Link>
      </div>
    );
  }

  if (reservation) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <ActiveReservationCard reservation={reservation} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-5 w-5 text-emerald-600" aria-hidden />
            {t("holdTime")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">{t("holdTimeHint")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RESERVATION_HOLD_OPTIONS.map((option) => (
              <Button
                key={option.minutes}
                type="button"
                variant={holdMinutes === option.minutes ? "default" : "outline"}
                onClick={() => setHoldMinutes(option.minutes)}
              >
                {t(`duration.${option.labelKey}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("pickSpot")}</h2>
        <div className="flex gap-2" role="tablist" aria-label={tm("floor")}>
          {floors.map((f) => (
            <Button
              key={f}
              variant={floor === f ? "default" : "outline"}
              size="sm"
              role="tab"
              aria-selected={floor === f}
              onClick={() => {
                setFloor(f);
                setCurrentFloor(f);
              }}
            >
              {tm("floor")} {f}
            </Button>
          ))}
        </div>
      </div>

      <ParkingMap
        spots={spots}
        floor={floor}
        selectedSpotId={selectedSpotId}
        onSelectSpot={setSelectedSpot}
      />

      <Button size="lg" className="w-full" disabled={!selectedSpotId} onClick={handleConfirm}>
        {selectedSpotId
          ? t("confirm", { spot: spots.find((s) => s.id === selectedSpotId)?.name ?? selectedSpotId })
          : t("selectSpot")}
      </Button>
    </div>
  );
}
