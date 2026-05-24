"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ParkingSpotNode, type SpotNodeData } from "./ParkingSpotNode";
import type { ParkingSpot } from "@/types";
import { ENTRANCE_POSITION } from "@/lib/constants";

const nodeTypes = { parkingSpot: ParkingSpotNode };

interface ParkingMapProps {
  spots: ParkingSpot[];
  floor: number;
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
  showRoute?: boolean;
}

export function ParkingMap({
  spots,
  floor,
  selectedSpotId,
  onSelectSpot,
  showRoute = false,
}: ParkingMapProps) {
  const floorSpots = useMemo(
    () => spots.filter((s) => s.floor === floor),
    [spots, floor]
  );

  const nodes: Node[] = useMemo(() => {
    const spotNodes: Node<SpotNodeData>[] = floorSpots.map((s) => ({
      id: s.id,
      type: "parkingSpot",
      position: { x: s.x, y: s.y },
      data: {
        label: s.name,
        status: s.status,
        selected: s.id === selectedSpotId,
        hasEV: s.hasEV,
        handicap: s.handicap,
      },
      selectable: s.status === "free",
      draggable: false,
    }));

    const entranceNode: Node = {
      id: "entrance",
      type: "default",
      position: { x: ENTRANCE_POSITION.x, y: ENTRANCE_POSITION.y },
      data: { label: "IN" },
      style: {
        background: "#3b82f6",
        color: "#fff",
        border: "2px solid #1d4ed8",
        borderRadius: 8,
        padding: 8,
        fontSize: 12,
        fontWeight: 700,
      },
      draggable: false,
      selectable: false,
    };

    return [...spotNodes, entranceNode];
  }, [floorSpots, selectedSpotId]);

  const edges: Edge[] = useMemo(() => {
    if (!showRoute || !selectedSpotId) return [];
    const spot = floorSpots.find((s) => s.id === selectedSpotId);
    if (!spot) return [];
    return [
      {
        id: "route",
        source: "entrance",
        target: selectedSpotId,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
      },
    ];
  }, [showRoute, selectedSpotId, floorSpots]);

  const flowKey = `${floor}-${selectedSpotId ?? "none"}-${showRoute}`;

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id === "entrance") return;
      const spot = floorSpots.find((s) => s.id === node.id);
      if (spot?.status === "free") onSelectSpot(node.id);
    },
    [floorSpots, onSelectSpot]
  );

  return (
    <div className="h-[420px] w-full rounded-xl border border-border md:h-[520px]">
      <ReactFlow
        key={flowKey}
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        fitView
        minZoom={0.4}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={(n) => (n.id === "entrance" ? "#3b82f6" : "#10b981")} />
      </ReactFlow>
    </div>
  );
}
