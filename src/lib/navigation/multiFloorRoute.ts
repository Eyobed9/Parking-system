import {
  ENTRANCE_FLOOR,
  ENTRANCE_POSITION,
  NAV_STAIRS_THRESHOLD,
  STAIRS_POSITION,
} from "@/lib/constants";
import { buildRoutePath, segmentLength, type Point } from "@/lib/navigation/pathGeometry";

export type NavPhase = "to_stairs" | "change_floor" | "to_spot" | "arrived";

export interface FloorRouteStep {
  floor: number;
  fromLabel: string;
  toLabel: string;
  status: "completed" | "current" | "upcoming";
}

export function needsMultiFloor(targetFloor: number): boolean {
  return targetFloor > ENTRANCE_FLOOR;
}

/** Walkable polyline on the user's current floor only. */
export function getActivePathPoints(
  userFloor: number,
  targetFloor: number,
  targetPosition: Point,
  phase: NavPhase
): Point[] {
  if (targetFloor === ENTRANCE_FLOOR) {
    return buildRoutePath(ENTRANCE_POSITION, targetPosition);
  }

  if (userFloor < targetFloor) {
    if (phase === "to_stairs" || phase === "change_floor") {
      if (userFloor === ENTRANCE_FLOOR) {
        return buildRoutePath(ENTRANCE_POSITION, STAIRS_POSITION);
      }
      return [STAIRS_POSITION, STAIRS_POSITION];
    }
  }

  if (userFloor === targetFloor && (phase === "to_spot" || phase === "arrived")) {
    return buildRoutePath(STAIRS_POSITION, targetPosition);
  }

  return buildRoutePath(ENTRANCE_POSITION, STAIRS_POSITION);
}

export function isNearStairs(position: Point): boolean {
  return segmentLength(position, STAIRS_POSITION) <= NAV_STAIRS_THRESHOLD;
}

export function buildFloorRouteSteps(
  targetFloor: number,
  targetSpotName: string,
  userFloor: number,
  phase: NavPhase
): FloorRouteStep[] {
  if (targetFloor === ENTRANCE_FLOOR) {
    return [
      {
        floor: ENTRANCE_FLOOR,
        fromLabel: "Entry",
        toLabel: targetSpotName,
        status: phase === "arrived" ? "completed" : "current",
      },
    ];
  }

  const steps: FloorRouteStep[] = [];

  for (let f = ENTRANCE_FLOOR; f <= targetFloor; f++) {
    const isLast = f === targetFloor;
    const fromLabel = f === ENTRANCE_FLOOR ? "Entry" : "Stairs";
    const toLabel = isLast ? targetSpotName : "Stairs";

    let status: FloorRouteStep["status"] = "upcoming";
    if (f < userFloor) status = "completed";
    else if (f === userFloor) {
      if (phase === "arrived" && isLast) status = "completed";
      else if (phase === "change_floor" && !isLast) status = "current";
      else if (phase === "to_stairs" || phase === "to_spot") status = "current";
      else if (phase === "arrived") status = "completed";
      else status = "current";
    } else if (f === userFloor + 1 && phase === "change_floor") {
      status = "upcoming";
    }

    steps.push({ floor: f, fromLabel, toLabel, status });
  }

  return steps;
}

export function initialPhase(targetFloor: number): NavPhase {
  return targetFloor === ENTRANCE_FLOOR ? "to_spot" : "to_stairs";
}

export function stairsTargetFloor(userFloor: number, targetFloor: number): number | null {
  if (userFloor >= targetFloor) return null;
  return userFloor + 1;
}
