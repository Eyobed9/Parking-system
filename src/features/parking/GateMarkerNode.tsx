"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GateMarkerData {
  label: string;
  variant: "entrance" | "exit";
  [key: string]: unknown;
}

export const GateMarkerNode = memo(function GateMarkerNode({
  data,
}: NodeProps & { data: GateMarkerData }) {
  const isEntrance = data.variant === "entrance";

  return (
    <div
      className={cn(
        "flex min-w-[88px] flex-col items-center gap-1 rounded-xl border-4 px-3 py-2 shadow-lg",
        isEntrance
          ? "border-blue-700 bg-blue-500 text-white"
          : "border-orange-700 bg-orange-500 text-white"
      )}
      aria-label={data.label}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      {isEntrance ? (
        <LogIn className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      ) : (
        <LogOut className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      )}
      <span className="text-xs font-extrabold tracking-wide">{data.label}</span>
      <span className="text-[10px] font-medium opacity-90">
        {isEntrance ? "ENTRY" : "EXIT"}
      </span>
    </div>
  );
});
