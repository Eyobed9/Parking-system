"use client";

import { useEffect, useRef } from "react";
import { NAV_COMPASS_OFFSET } from "@/lib/constants";
import {
  compassToMapHeading,
  getCompassHeading,
  motionSupported,
  orientationSupported,
  requestOrientationPermission,
} from "@/lib/navigation/compass";
import { createStepListener } from "@/lib/navigation/stepDetector";
import { useNavigationStore } from "@/store/useNavigationStore";

export function useStepCompassNavigation() {
  const isTracking = useNavigationStore((s) => s.isTracking);
  const sensorsEnabled = useNavigationStore((s) => s.sensorsEnabled);
  const applyStep = useNavigationStore((s) => s.applyStep);
  const setHeading = useNavigationStore((s) => s.setHeading);
  const headingRef = useRef(0);

  useEffect(() => {
    headingRef.current = useNavigationStore.getState().heading;
  });

  useEffect(() => {
    if (!isTracking || !sensorsEnabled) return;
    if (!motionSupported() && !orientationSupported()) return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      const compass = getCompassHeading(event);
      if (compass == null) return;
      const mapHeading = compassToMapHeading(compass, NAV_COMPASS_OFFSET);
      headingRef.current = mapHeading;
      setHeading(mapHeading);
    };

    window.addEventListener("deviceorientation", onOrientation);

    let stepListener: ReturnType<typeof createStepListener> | null = null;
    if (motionSupported()) {
      stepListener = createStepListener(() => {
        applyStep(headingRef.current);
      });
      stepListener.start();
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      stepListener?.stop();
    };
  }, [isTracking, sensorsEnabled, applyStep, setHeading]);
}

export async function enableNavigationSensors(): Promise<boolean> {
  const granted = await requestOrientationPermission();
  useNavigationStore.getState().setSensorsEnabled(granted);
  return granted;
}
