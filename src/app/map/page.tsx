"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useParkingStore } from "@/store/useParkingStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useReservationStore } from "@/store/useReservationStore";
import { canClaimSpot, isReservationActive } from "@/services/reservationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationPanel } from "@/features/parking/NavigationPanel";
import { MultiFloorRouteGuide } from "@/features/parking/MultiFloorRouteGuide";

const ParkingMap = dynamic(
  () => import("@/features/parking/ParkingMap").then((m) => m.ParkingMap),
  { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-xl bg-muted" /> }
);

function MapContent() {
  const t = useTranslations("map");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectMode = searchParams.get("mode") === "select";
  const navigateMode = searchParams.get("navigate") === "1";

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
  const startNavigation = useNavigationStore((s) => s.startNavigation);
  const anchorAtEntrance = useNavigationStore((s) => s.anchorAtEntrance);
  const targetSpotId = useNavigationStore((s) => s.targetSpotId);
  const isVisible = useNavigationStore((s) => s.isVisible);
  const userFloor = useNavigationStore((s) => s.userFloor);
  const activeReservation = useReservationStore((s) => s.activeReservation);
  const clearReservation = useReservationStore((s) => s.clearReservation);

  const floorParam = searchParams.get("floor");
  const [floor, setFloor] = useState(() => {
    if (floorParam) return Number(floorParam);
    if (navigateMode) return 1;
    if (activeSession) return activeSession.floor;
    return currentFloor;
  });

  const navInitialized = useRef(false);

  useEffect(() => {
    if (selectMode && !navigateMode) {
      anchorAtEntrance();
    }
  }, [selectMode, navigateMode, anchorAtEntrance]);

  useEffect(() => {
    if (!navigateMode || !activeSession || navInitialized.current) return;
    const spot = spots.find((s) => s.id === activeSession.spotId);
    if (!spot) return;
    navInitialized.current = true;
    setSelectedSpot(spot.id);
    startNavigation(spot.id, spot.name, spot.x, spot.y, spot.floor);
  }, [navigateMode, activeSession, spots, startNavigation, setSelectedSpot]);

  const handleSelect = (spotId: string) => {
    setSelectedSpot(spotId);
    const spot = spots.find((s) => s.id === spotId);
    if (spot && spot.floor !== floor) {
      setFloor(spot.floor);
      setCurrentFloor(spot.floor);
    }
  };

  const confirmSpot = () => {
    if (!selectedSpotId) return;
    const spot = spots.find((s) => s.id === selectedSpotId);
    const reservation =
      activeReservation && isReservationActive(activeReservation) ? activeReservation : null;

    if (!canClaimSpot(spot, reservation)) {
      toast.error(t("spotUnavailable"));
      return;
    }

    if (selectMode || !activeSession) {
      occupySpot(spot!.id);
      clearReservation();
      startSession(spot!.id, spot!.name, spot!.floor);
      startNavigation(spot!.id, spot!.name, spot!.x, spot!.y, spot!.floor);
      toast.success(t("spotConfirmed", { spot: spot!.name }));
      router.push("/map?navigate=1");
    } else if (activeSession) {
      freeSpot(activeSession.spotId);
      occupySpot(spot!.id);
      changeSpot(spot!.id, spot!.name, spot!.floor);
      startNavigation(spot!.id, spot!.name, spot!.x, spot!.y, spot!.floor);
      router.push("/map?navigate=1");
    }
  };

  const floors = [...new Set(spots.map((s) => s.floor))].sort();
  const routeSpotId = targetSpotId ?? selectedSpotId;
  const showRoute = !!routeSpotId && (navigateMode || selectMode || !!selectedSpotId);
  const selectedSpot = selectedSpotId ? spots.find((s) => s.id === selectedSpotId) : null;
  const showConfirm = !!selectedSpotId && (selectMode || !navigateMode);

  const handleViewFloorChange = (f: number) => {
    setFloor(f);
    setCurrentFloor(f);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {navigateMode ? t("navigateTitle") : selectMode ? t("selectTitle") : t("title")}
        </h1>
        <div className="flex gap-2" role="tablist" aria-label={t("floor")}>
          {floors.map((f) => (
            <Button
              key={f}
              variant={floor === f ? "default" : "outline"}
              size="sm"
              role="tab"
              aria-selected={floor === f}
              onClick={() => handleViewFloorChange(f)}
            >
              {t("floor")} {f}
              {navigateMode && userFloor === f ? " •" : ""}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Badge className="border-blue-700 bg-blue-500">{t("legendEntrance")}</Badge>
        <Badge className="border-orange-700 bg-orange-500">{t("legendExit")}</Badge>
        <Badge className="border-violet-700 bg-violet-500">{t("legendStairs")}</Badge>
        {isVisible ? (
          <Badge className="border-sky-600 bg-sky-500">{t("legendYou")}</Badge>
        ) : null}
        <Badge variant="default">{t("legendFree")}</Badge>
        <Badge variant="destructive">{t("legendOccupied")}</Badge>
        <Badge variant="warning">{t("legendReserved")}</Badge>
        <Badge variant="info">{t("legendSelected")}</Badge>
      </div>

      {navigateMode ? <MultiFloorRouteGuide /> : null}

      <ParkingMap
        spots={spots}
        floor={floor}
        selectedSpotId={selectedSpotId}
        onSelectSpot={handleSelect}
        showRoute={showRoute}
        showGates
      />

      {navigateMode ? (
        <NavigationPanel viewFloor={floor} onViewFloorChange={handleViewFloorChange} />
      ) : null}

      {showConfirm ? (
        <Button size="lg" className="w-full" onClick={confirmSpot}>
          {selectMode
            ? t("confirmSpot", { spot: selectedSpot?.name ?? selectedSpotId })
            : `${t("navigate")} — ${selectedSpot?.name ?? selectedSpotId}`}
        </Button>
      ) : null}
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
