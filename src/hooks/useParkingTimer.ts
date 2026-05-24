"use client";

import { useEffect, useState } from "react";
import { getRunningEstimate } from "@/services/pricingService";
import { formatDuration } from "@/lib/utils";

export function useParkingTimer(startTime: string | undefined) {
  const [elapsed, setElapsed] = useState(0);
  const [estimate, setEstimate] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const tick = () => {
      const ms = Date.now() - new Date(startTime).getTime();
      setElapsed(ms);
      setEstimate(getRunningEstimate(startTime));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return {
    elapsed,
    formatted: formatDuration(elapsed),
    estimate,
  };
}
