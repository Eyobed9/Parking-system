"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { SpotStatus } from "@/types";

export interface SpotNodeData {
  label: string;
  status: SpotStatus;
  selected?: boolean;
  hasEV?: boolean;
  handicap?: boolean;
  [key: string]: unknown;
}

const statusColors: Record<SpotStatus, string> = {
  free: "bg-emerald-500 border-emerald-600",
  occupied: "bg-red-500 border-red-600",
  reserved: "bg-amber-400 border-amber-500",
};

export const ParkingSpotNode = memo(function ParkingSpotNode({
  data,
  selected,
}: NodeProps & { data: SpotNodeData }) {
  const isSelected = data.selected || selected;

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md border-2 text-[9px] font-bold text-white shadow-sm transition-transform",
        statusColors[data.status],
        isSelected && "ring-2 ring-blue-500 ring-offset-2 scale-110",
        data.status === "occupied" && "opacity-80"
      )}
      role="button"
      aria-label={`${data.label} ${data.status}`}
      aria-pressed={isSelected}
      tabIndex={0}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {data.label.split("-")[1]}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});
