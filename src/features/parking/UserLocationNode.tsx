"use client";

import { Navigation2 } from "lucide-react";
import { type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

/** Marker size — keep in sync with ParkingMap USER_MARKER_OFFSET */
export const USER_MARKER_SIZE = 56;
export const USER_MARKER_OFFSET = USER_MARKER_SIZE / 2;

export interface UserLocationData {
  heading: number;
  offRoute?: boolean;
  ghost?: boolean;
  [key: string]: unknown;
}

export function UserLocationNode({
  data,
}: NodeProps & { data: UserLocationData }) {
  const heading = typeof data.heading === "number" ? data.heading : 0;
  const isGhost = Boolean(data.ghost);

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
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-40 animate-ping",
            data.offRoute ? "bg-amber-400" : "bg-sky-400"
          )}
        />
      ) : null}

      <div
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg",
          data.offRoute ? "bg-amber-500" : "bg-sky-500"
        )}
      >
        <Navigation2
          className="h-6 w-6 shrink-0 fill-white text-white drop-shadow-md"
          style={{
            transform: `rotate(${heading - 45}deg)`,
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
