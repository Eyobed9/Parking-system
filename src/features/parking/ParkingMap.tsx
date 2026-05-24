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
import { StairsMarkerNode } from "./StairsMarkerNode";
import { UserLocationNode } from "./UserLocationNode";
import type { ParkingSpot } from "@/types";
import { ENTRANCE_FLOOR, ENTRANCE_POSITION, EXIT_POSITION, STAIRS_POSITION } from "@/lib/constants";
import { needsMultiFloor, stairsTargetFloor } from "@/lib/navigation/multiFloorRoute";
import { useNavigationStore } from "@/store/useNavigationStore";

const nodeTypes = {
  parkingSpot: ParkingSpotNode,
  gateMarker: GateMarkerNode,
  stairsMarker: StairsMarkerNode,
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
  const userFloor = useNavigationStore((s) => s.userFloor);
  const targetFloor = useNavigationStore((s) => s.targetFloor);
  const targetSpotId = useNavigationStore((s) => s.targetSpotId);
  const targetPosition = useNavigationStore((s) => s.targetPosition);
  const phase = useNavigationStore((s) => s.phase);
  const isTracking = useNavigationStore((s) => s.isTracking);
  const atStairs = useNavigationStore((s) => s.atStairs);

  const floorSpots = useMemo(
    () => spots.filter((s) => s.floor === floor),
    [spots, floor]
  );

  const routeTargetId = targetSpotId ?? selectedSpotId;
  const multiFloor = isTracking && needsMultiFloor(targetFloor);
  const nextStairsFloor = stairsTargetFloor(userFloor, targetFloor);

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

    const infraNodes: Node[] = [];
    if (multiFloor || (showRoute && floor === targetFloor && targetFloor > 1)) {
      const stairsActive =
        floor === userFloor &&
        (atStairs || phase === "change_floor") &&
        userFloor < targetFloor;
      infraNodes.push({
        id: "stairs",
        type: "stairsMarker",
        position: { x: STAIRS_POSITION.x - 40, y: STAIRS_POSITION.y - 28 },
        data: {
          active: stairsActive,
          nextFloor: floor === userFloor ? nextStairsFloor : floor < targetFloor ? floor + 1 : null,
        },
        draggable: false,
        selectable: false,
        zIndex: 6,
      });
    }

    const navNodes: Node[] = [];
    if (isVisible && floor === userFloor) {
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
    } else if (isVisible && isTracking && floor !== userFloor) {
      navNodes.push({
        id: "user-ghost",
        type: "userLocation",
        position: { x: STAIRS_POSITION.x - 4, y: STAIRS_POSITION.y - 4 },
        data: { heading: 0, offRoute: false, ghost: true },
        draggable: false,
        selectable: false,
        zIndex: 15,
        style: { opacity: 0.35 },
      });
    }

    return [...spotNodes, ...gateNodes, ...infraNodes, ...navNodes];
  }, [
    floorSpots,
    selectedSpotId,
    routeTargetId,
    showGates,
    multiFloor,
    showRoute,
    floor,
    targetFloor,
    userFloor,
    atStairs,
    phase,
    nextStairsFloor,
    isVisible,
    position,
    heading,
    isOffRoute,
    routeAnchor,
    isTracking,
  ]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];

    if (!showRoute || !routeTargetId || !targetPosition) return result;

    const spot = floorSpots.find((s) => s.id === routeTargetId);
    const isTargetFloorView = floor === targetFloor;
    const isUserFloorView = floor === userFloor;

    if (multiFloor) {
      if (isUserFloorView && userFloor < targetFloor && userFloor === ENTRANCE_FLOOR) {
        result.push({
          id: "route-to-stairs",
          source: "entrance",
          target: "stairs",
          type: "smoothstep",
          animated: phase === "to_stairs",
          style: { stroke: "#3b82f6", strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
          zIndex: 2,
        });
      }

      if (isTargetFloorView && userFloor < targetFloor) {
        result.push({
          id: "route-preview",
          source: "stairs",
          target: routeTargetId,
          type: "smoothstep",
          animated: false,
          style: { stroke: "#94a3b8", strokeWidth: 2, strokeDasharray: "8 6" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
          zIndex: 1,
        });
      }

      if (isUserFloorView && userFloor === targetFloor && spot) {
        result.push({
          id: "route-to-spot",
          source: "stairs",
          target: routeTargetId,
          type: "smoothstep",
          animated: phase === "to_spot",
          style: { stroke: "#3b82f6", strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
          zIndex: 2,
        });
      }
    } else if (spot && isUserFloorView) {
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

    if (isVisible && isOffRoute && routeAnchor && isUserFloorView) {
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
  }, [
    showRoute,
    routeTargetId,
    targetPosition,
    floorSpots,
    floor,
    targetFloor,
    userFloor,
    multiFloor,
    phase,
    isVisible,
    isOffRoute,
    routeAnchor,
  ]);

  const flowKey = `${floor}-${routeTargetId ?? "none"}-${userFloor}-${phase}-${position.x}-${position.y}`;

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (
        node.id === "entrance" ||
        node.id === "exit" ||
        node.id === "stairs" ||
        node.id === "user-location" ||
        node.id === "user-ghost"
      ) {
        return;
      }
      const spot = floorSpots.find((s) => s.id === node.id);
      if (spot?.status === "free") onSelectSpot(node.id);
    },
    [floorSpots, onSelectSpot]
  );

  const miniMapColor = (n: Node) => {
    if (n.id === "entrance") return "#3b82f6";
    if (n.id === "exit") return "#f97316";
    if (n.id === "stairs") return "#8b5cf6";
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
