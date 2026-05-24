"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, LocateFixed, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  enableNavigationSensors,
  useStepCompassNavigation,
} from "@/hooks/useStepCompassNavigation";
import { motionSupported, orientationSupported } from "@/lib/navigation/compass";
import { useNavigationStore } from "@/store/useNavigationStore";

export function NavigationPanel() {
  const t = useTranslations("map");
  const isTracking = useNavigationStore((s) => s.isTracking);
  const isOffRoute = useNavigationStore((s) => s.isOffRoute);
  const hasArrived = useNavigationStore((s) => s.hasArrived);
  const pathProgress = useNavigationStore((s) => s.pathProgress);
  const applyStep = useNavigationStore((s) => s.applyStep);
  const stepBackward = useNavigationStore((s) => s.stepBackward);
  const resetToEntrance = useNavigationStore((s) => s.resetToEntrance);

  useStepCompassNavigation();

  const sensorsAvailable = motionSupported() || orientationSupported();

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
        <Badge variant="outline">
          {t("routeProgress", { percent: Math.round(pathProgress * 100) })}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{t("navigationHint")}</p>

      {sensorsAvailable ? (
        <Button type="button" variant="secondary" className="w-full" onClick={handleEnableSensors}>
          <Radio className="h-4 w-4" aria-hidden />
          {t("enableSensors")}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">{t("sensorsUnavailable")}</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" onClick={stepBackward} aria-label={t("stepBack")}>
          <ArrowDown className="h-4 w-4 rotate-180" aria-hidden />
          {t("stepBack")}
        </Button>
        <Button type="button" variant="outline" onClick={() => applyStep()} aria-label={t("stepForward")}>
          <ArrowUp className="h-4 w-4" aria-hidden />
          {t("stepForward")}
        </Button>
        <Button type="button" variant="outline" onClick={resetToEntrance} aria-label={t("resetPosition")}>
          <LocateFixed className="h-4 w-4" aria-hidden />
          {t("resetPosition")}
        </Button>
      </div>
    </div>
  );
}
