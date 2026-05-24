"use client";

import { useTranslations } from "next-intl";
import { Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildFloorRouteSteps, needsMultiFloor } from "@/lib/navigation/multiFloorRoute";
import { useNavigationStore } from "@/store/useNavigationStore";

export function MultiFloorRouteGuide() {
  const t = useTranslations("map");
  const isTracking = useNavigationStore((s) => s.isTracking);
  const targetFloor = useNavigationStore((s) => s.targetFloor);
  const targetSpotName = useNavigationStore((s) => s.targetSpotName);
  const userFloor = useNavigationStore((s) => s.userFloor);
  const phase = useNavigationStore((s) => s.phase);

  if (!isTracking || !targetSpotName) return null;

  const steps = buildFloorRouteSteps(targetFloor, targetSpotName, userFloor, phase);
  const multi = needsMultiFloor(targetFloor);

  if (!multi && steps.length === 1) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{t("multiFloorTitle")}</h2>
      <ol className="space-y-0">
        {steps.map((step, index) => (
          <li key={step.floor} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-[20px]",
                    step.status === "completed" ? "bg-emerald-500" : "bg-border"
                  )}
                />
              ) : null}
            </div>
            <div className="pb-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t("floor")} {step.floor}
              </p>
              <p className="text-sm font-semibold">
                {step.fromLabel} → {step.toLabel}
              </p>
              {step.status === "current" ? (
                <p className="text-xs text-violet-600 dark:text-violet-400">{t("currentStep")}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StepIcon({ status }: { status: "completed" | "current" | "upcoming" }) {
  if (status === "completed") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white">
        <CircleDot className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/40">
      <Circle className="h-3 w-3 text-muted-foreground/50" aria-hidden />
    </span>
  );
}
