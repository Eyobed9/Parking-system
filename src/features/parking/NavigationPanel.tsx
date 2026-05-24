"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Layers, LocateFixed, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  enableNavigationSensors,
  useStepCompassNavigation,
} from "@/hooks/useStepCompassNavigation";
import { motionSupported, orientationSupported } from "@/lib/navigation/compass";
import { needsMultiFloor, stairsTargetFloor } from "@/lib/navigation/multiFloorRoute";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useSessionStore } from "@/store/useSessionStore";

interface NavigationPanelProps {
  viewFloor: number;
  onViewFloorChange: (floor: number) => void;
}

export function NavigationPanel({ viewFloor, onViewFloorChange }: NavigationPanelProps) {
  const t = useTranslations("map");
  const isTracking = useNavigationStore((s) => s.isTracking);
  const isOffRoute = useNavigationStore((s) => s.isOffRoute);
  const hasArrived = useNavigationStore((s) => s.hasArrived);
  const pathProgress = useNavigationStore((s) => s.pathProgress);
  const userFloor = useNavigationStore((s) => s.userFloor);
  const targetFloor = useNavigationStore((s) => s.targetFloor);
  const phase = useNavigationStore((s) => s.phase);
  const atStairs = useNavigationStore((s) => s.atStairs);
  const applyStep = useNavigationStore((s) => s.applyStep);
  const stepBackward = useNavigationStore((s) => s.stepBackward);
  const resetToEntrance = useNavigationStore((s) => s.resetToEntrance);
  const advanceFloor = useNavigationStore((s) => s.advanceFloor);
  const beginBillingAtSpot = useSessionStore((s) => s.beginBillingAtSpot);
  const billingStarted = useRef(false);

  useStepCompassNavigation();

  useEffect(() => {
    if (!hasArrived) {
      billingStarted.current = false;
      return;
    }
    if (billingStarted.current) return;
    billingStarted.current = true;
    beginBillingAtSpot();
    toast.success(t("billingStarted"));
  }, [hasArrived, beginBillingAtSpot, t]);

  const sensorsAvailable = motionSupported() || orientationSupported();
  const multiFloor = needsMultiFloor(targetFloor);
  const nextFloor = stairsTargetFloor(userFloor, targetFloor);
  const showFloorChange =
    multiFloor && (phase === "change_floor" || atStairs) && nextFloor != null;
  const onWrongFloor = viewFloor !== userFloor;

  const handleEnableSensors = async () => {
    await enableNavigationSensors();
  };

  if (!isTracking) return null;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        {hasArrived ? (
          <Badge variant="default">{t("arrived")}</Badge>
        ) : isOffRoute ? (
          <Badge variant="warning">{t("offRoute")}</Badge>
        ) : (
          <Badge variant="info">{t("onRoute")}</Badge>
        )}
        <Badge variant="secondary">
          {t("routeProgress", { percent: Math.round(pathProgress * 100) })}
        </Badge>
        <Badge variant="secondary">
          {t("yourFloor", { floor: userFloor })}
        </Badge>
        {multiFloor ? (
          <Badge variant="secondary">
            {t("targetFloor", { floor: targetFloor })}
          </Badge>
        ) : null}
      </div>

      {onWrongFloor ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950/40">
          <span>{t("viewingOtherFloor", { floor: userFloor })}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => onViewFloorChange(userFloor)}>
            {t("goToYourFloor")}
          </Button>
        </div>
      ) : null}

      {showFloorChange && nextFloor != null ? (
        <Button type="button" className="w-full" onClick={() => {
          advanceFloor();
          onViewFloorChange(nextFloor);
        }}>
          <Layers className="h-4 w-4" aria-hidden />
          {t("takeStairsToFloor", { floor: nextFloor })}
        </Button>
      ) : null}

      <p className="text-sm text-muted-foreground">{t("navigationHint")}</p>

      {sensorsAvailable ? (
        <Button type="button" variant="secondary" className="w-full" onClick={handleEnableSensors}>
          <Radio className="h-4 w-4" aria-hidden />
          {t("enableSensors")}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">{t("sensorsUnavailable")}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={stepBackward} aria-label={t("stepBack")}>
          <ArrowDown className="h-4 w-4 rotate-180" aria-hidden />
          {t("stepBack")}
        </Button>
        <Button type="button" variant="outline" onClick={() => applyStep()} aria-label={t("stepForward")}>
          <ArrowUp className="h-4 w-4" aria-hidden />
          {t("stepForward")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="col-span-2 min-h-12 gap-2 px-6 py-3"
          onClick={() => {
            resetToEntrance();
            onViewFloorChange(1);
          }}
          aria-label={t("resetPosition")}
        >
          <LocateFixed className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-center">{t("resetPosition")}</span>
        </Button>
      </div>
    </div>
  );
}
