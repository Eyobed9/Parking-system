"use client";

import { useCallback, useMemo } from "react";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
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
import { GateMarkerNode } from "./GateMarkerNode";
import { UserLocationNode } from "./UserLocationNode";
import type { ParkingSpot } from "@/types";
import { ENTRANCE_POSITION, EXIT_POSITION } from "@/lib/constants";
import { useNavigationStore } from "@/store/useNavigationStore";

const nodeTypes = {
  parkingSpot: ParkingSpotNode,
  gateMarker: GateMarkerNode,
  userLocation: UserLocationNode,
};

function subscribe() {
  return () => {};
}

interface ParkingMapProps {
  spots: ParkingSpot[];
  floor: number;
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
  showRoute?: boolean;
  showGates?: boolean;
}

export function ParkingMap({
  spots,
  floor,
  selectedSpotId,
  onSelectSpot,
  showRoute = false,
  showGates = true,
}: ParkingMapProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const colorMode = mounted && resolvedTheme === "dark" ? "dark" : "light";

  const isVisible = useNavigationStore((s) => s.isVisible);
  const position = useNavigationStore((s) => s.position);
  const heading = useNavigationStore((s) => s.heading);
  const isOffRoute = useNavigationStore((s) => s.isOffRoute);
  const routeAnchor = useNavigationStore((s) => s.routeAnchor);
  const navFloor = useNavigationStore((s) => s.floor);
  const targetSpotId = useNavigationStore((s) => s.targetSpotId);

  const floorSpots = useMemo(
    () => spots.filter((s) => s.floor === floor),
    [spots, floor]
  );

  const routeTargetId = targetSpotId ?? selectedSpotId;

  const nodes: Node[] = useMemo(() => {
    const spotNodes: Node<SpotNodeData>[] = floorSpots.map((s) => ({
      id: s.id,
      type: "parkingSpot",
      position: { x: s.x, y: s.y },
      data: {
        label: s.name,
        status: s.status,
        selected: s.id === selectedSpotId || s.id === routeTargetId,
        hasEV: s.hasEV,
        handicap: s.handicap,
      },
      selectable: s.status === "free",
      draggable: false,
      zIndex: 1,
    }));

    const gateNodes: Node[] = showGates
      ? [
          {
            id: "entrance",
            type: "gateMarker",
            position: { x: ENTRANCE_POSITION.x - 20, y: ENTRANCE_POSITION.y - 36 },
            data: { label: "Entrance", variant: "entrance" },
            draggable: false,
            selectable: false,
            zIndex: 5,
          },
          {
            id: "exit",
            type: "gateMarker",
            position: { x: EXIT_POSITION.x - 20, y: EXIT_POSITION.y - 36 },
            data: { label: "Exit", variant: "exit" },
            draggable: false,
            selectable: false,
            zIndex: 5,
          },
        ]
      : [];

    const navNodes: Node[] = [];
    if (isVisible && floor === navFloor) {
      navNodes.push({
        id: "user-location",
        type: "userLocation",
        position: { x: position.x - 4, y: position.y - 4 },
        data: { heading, offRoute: isOffRoute },
        draggable: false,
        selectable: false,
        zIndex: 20,
      });

      if (isOffRoute && routeAnchor) {
        navNodes.push({
          id: "route-anchor",
          type: "default",
          position: { x: routeAnchor.x - 4, y: routeAnchor.y - 4 },
          data: { label: "" },
          style: {
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#f59e0b",
            border: "2px solid #fff",
          },
          draggable: false,
          selectable: false,
          zIndex: 10,
        });
      }
    }

    return [...spotNodes, ...gateNodes, ...navNodes];
  }, [
    floorSpots,
    selectedSpotId,
    routeTargetId,
    showGates,
    isVisible,
    floor,
    navFloor,
    position,
    heading,
    isOffRoute,
    routeAnchor,
  ]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];

    if (showRoute && routeTargetId) {
      const spot = floorSpots.find((s) => s.id === routeTargetId);
      if (spot) {
        result.push({
          id: "route",
          source: "entrance",
          target: routeTargetId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#3b82f6", strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
          zIndex: 2,
        });
      }
    }

    if (isVisible && isOffRoute && routeAnchor && floor === navFloor) {
      result.push({
        id: "off-route",
        source: "user-location",
        target: "route-anchor",
        type: "straight",
        style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "6 4" },
        zIndex: 3,
      });
    }

    return result;
  }, [showRoute, routeTargetId, floorSpots, isVisible, isOffRoute, routeAnchor, floor, navFloor]);

  const flowKey = `${floor}-${routeTargetId ?? "none"}-${showRoute}-${position.x}-${position.y}-${isOffRoute}`;

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id === "entrance" || node.id === "exit" || node.id === "user-location") return;
      const spot = floorSpots.find((s) => s.id === node.id);
      if (spot?.status === "free") onSelectSpot(node.id);
    },
    [floorSpots, onSelectSpot]
  );

  const miniMapColor = (n: Node) => {
    if (n.id === "entrance") return "#3b82f6";
    if (n.id === "exit") return "#f97316";
    if (n.id === "user-location") return "#0ea5e9";
    return "#10b981";
  };

  return (
    <div className="h-[420px] w-full rounded-xl border border-border md:h-[520px]">
      <ReactFlow
        key={flowKey}
        colorMode={colorMode}
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
        <MiniMap nodeColor={miniMapColor} />
      </ReactFlow>
    </div>
  );
}
