"use client";

import { ArrowUp } from "lucide-react";
import { type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { mapHeadingToIconRotation } from "@/lib/navigation/pathGeometry";

/** Marker size — keep in sync with ParkingMap USER_MARKER_OFFSET */
export const USER_MARKER_SIZE = 56;
export const USER_MARKER_OFFSET = USER_MARKER_SIZE / 2;

export interface UserLocationData {
  heading: number;
  ghost?: boolean;
  [key: string]: unknown;
}

export function UserLocationNode({
  data,
}: NodeProps & { data: UserLocationData }) {
  const heading = typeof data.heading === "number" ? data.heading : 0;
  const isGhost = Boolean(data.ghost);
  const rotation = mapHeadingToIconRotation(heading);

  return (
    <div
      className={cn(
        "pointer-events-none relative flex items-center justify-center",
        isGhost && "opacity-40"
      )}
      style={{ width: USER_MARKER_SIZE, height: USER_MARKER_SIZE }}
      aria-label="Your location"
    >
      {!isGhost ? (
        <span className="absolute inset-0 rounded-full bg-sky-400 opacity-40 animate-ping" />
      ) : null}

      <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sky-500 shadow-lg">
        <ArrowUp
          className="h-6 w-6 shrink-0 text-white drop-shadow-md"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
