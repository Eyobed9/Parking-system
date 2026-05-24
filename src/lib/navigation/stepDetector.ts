type StepCallback = () => void;

const MIN_STEP_INTERVAL_MS = 350;
const PEAK_THRESHOLD = 11.5;
const VALLEY_THRESHOLD = 9.8;

export class StepDetector {
  private lastStepAt = 0;
  private lastMagnitude = 0;
  private rising = false;
  private callback: StepCallback;

  constructor(callback: StepCallback) {
    this.callback = callback;
  }

  handleMotion(event: DeviceMotionEvent): void {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const magnitude = Math.hypot(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
    const now = Date.now();

    if (magnitude > PEAK_THRESHOLD && this.lastMagnitude <= PEAK_THRESHOLD) {
      this.rising = true;
    }

    if (this.rising && magnitude < VALLEY_THRESHOLD) {
      this.rising = false;
      if (now - this.lastStepAt >= MIN_STEP_INTERVAL_MS) {
        this.lastStepAt = now;
        this.callback();
      }
    }

    this.lastMagnitude = magnitude;
  }
}

export function createStepListener(callback: StepCallback): {
  start: () => void;
  stop: () => void;
} {
  const detector = new StepDetector(callback);

  const onMotion = (event: DeviceMotionEvent) => {
    detector.handleMotion(event);
  };

  return {
    start: () => {
      window.addEventListener("devicemotion", onMotion);
    },
    stop: () => {
      window.removeEventListener("devicemotion", onMotion);
    },
  };
}
