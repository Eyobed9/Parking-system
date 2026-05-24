"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StairsMarkerData {
  active?: boolean;
  nextFloor?: number | null;
  [key: string]: unknown;
}

export const StairsMarkerNode = memo(function StairsMarkerNode({
  data,
}: NodeProps & { data: StairsMarkerData }) {
  return (
    <div
      className={cn(
        "flex min-w-[80px] flex-col items-center gap-1 rounded-xl border-4 px-2 py-2 shadow-lg",
        data.active
          ? "border-violet-700 bg-violet-500 text-white ring-2 ring-violet-300"
          : "border-violet-600 bg-violet-400/90 text-white"
      )}
      aria-label="Stairs and elevator"
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <ArrowUpDown className="h-5 w-5" strokeWidth={2.5} aria-hidden />
      <span className="text-[10px] font-extrabold tracking-wide">STAIRS</span>
      {data.nextFloor != null ? (
        <span className="text-[9px] font-medium opacity-90">↑ Floor {data.nextFloor}</span>
      ) : null}
    </div>
  );
});
