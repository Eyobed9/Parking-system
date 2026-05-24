"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ParkingMap = dynamic(
  () => import("@/features/parking/ParkingMap").then((m) => m.ParkingMap),
  { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-xl bg-muted" /> }
);

function MapContent() {
  const t = useTranslations("map");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectMode = searchParams.get("mode") === "select";

  const spots = useParkingStore((s) => s.spots);
  const currentFloor = useParkingStore((s) => s.currentFloor);
  const setCurrentFloor = useParkingStore((s) => s.setCurrentFloor);
  const selectedSpotId = useParkingStore((s) => s.selectedSpotId);
  const setSelectedSpot = useParkingStore((s) => s.setSelectedSpot);
  const occupySpot = useParkingStore((s) => s.occupySpot);
  const startSession = useSessionStore((s) => s.startSession);
  const activeSession = useSessionStore((s) => s.activeSession);
  const changeSpot = useSessionStore((s) => s.changeSpot);
  const freeSpot = useParkingStore((s) => s.freeSpot);

  const [floor, setFloor] = useState(currentFloor);

  const handleSelect = (spotId: string) => {
    setSelectedSpot(spotId);
  };

  const confirmSpot = () => {
    if (!selectedSpotId) return;
    const spot = spots.find((s) => s.id === selectedSpotId);
    if (!spot || spot.status !== "free") return;

    if (selectMode || !activeSession) {
      occupySpot(spot.id);
      startSession(spot.id, spot.name, spot.floor);
      router.push("/session");
    } else if (activeSession) {
      freeSpot(activeSession.spotId);
      occupySpot(spot.id);
      changeSpot(spot.id, spot.name, spot.floor);
      router.push("/session");
    }
  };

  const floors = [...new Set(spots.map((s) => s.floor))].sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex gap-2" role="tablist" aria-label={t("floor")}>
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
              {t("floor")} {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Badge variant="default">{t("legendFree")}</Badge>
        <Badge variant="destructive">{t("legendOccupied")}</Badge>
        <Badge variant="warning">{t("legendReserved")}</Badge>
        <Badge variant="info">{t("legendSelected")}</Badge>
      </div>

      <ParkingMap
        spots={spots}
        floor={floor}
        selectedSpotId={selectedSpotId}
        onSelectSpot={handleSelect}
        showRoute={!!selectedSpotId}
      />

      {selectedSpotId && (
        <Button size="lg" className="w-full" onClick={confirmSpot}>
          {selectMode ? t("navigate") : t("navigate")} — {selectedSpotId}
        </Button>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <MapContent />
    </Suspense>
  );
}
