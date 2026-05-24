/** Convert device compass reading to map heading (0° = +x, 90° = +y). */
export function compassToMapHeading(compassDeg: number, offset: number): number {
  const heading = (compassDeg + offset) % 360;
  return heading < 0 ? heading + 360 : heading;
}

export function getCompassHeading(event: DeviceOrientationEvent): number | null {
  const iosHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
    .webkitCompassHeading;
  if (typeof iosHeading === "number" && !Number.isNaN(iosHeading)) {
    return iosHeading;
  }
  if (event.alpha != null && !Number.isNaN(event.alpha)) {
    return (360 - event.alpha) % 360;
  }
  return null;
}

export async function requestOrientationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const request = (
    DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    }
  ).requestPermission;

  if (typeof request === "function") {
    try {
      const result = await request();
      return result === "granted";
    } catch {
      return false;
    }
  }

  return true;
}

export function orientationSupported(): boolean {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

export function motionSupported(): boolean {
  return typeof window !== "undefined" && "DeviceMotionEvent" in window;
}
