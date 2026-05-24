"use client";

import { memo } from "react";
import { type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface UserLocationData {
  heading: number;
  offRoute?: boolean;
  [key: string]: unknown;
}

export const UserLocationNode = memo(function UserLocationNode({
  data,
}: NodeProps & { data: UserLocationData }) {
  return (
    <div
      className="relative flex h-0 w-0 items-center justify-center"
      aria-label="Your location"
    >
      <span
        className={cn(
          "absolute h-10 w-10 animate-ping rounded-full opacity-40",
          data.offRoute ? "bg-amber-400" : "bg-sky-400"
        )}
      />
      <div
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-md",
          data.offRoute ? "bg-amber-500" : "bg-sky-500"
        )}
      >
        <div
          className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-x-[7px] border-b-[14px] border-x-transparent border-b-white drop-shadow"
          style={{
            transform: `translate(-50%, -50%) rotate(${data.heading - 90}deg) translateY(-14px)`,
          }}
          aria-hidden
        />
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            data.offRoute ? "bg-amber-100" : "bg-sky-100"
          )}
        />
      </div>
    </div>
  );
});
