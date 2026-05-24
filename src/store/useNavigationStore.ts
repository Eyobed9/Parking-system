import { create } from "zustand";
import {
  ENTRANCE_FLOOR,
  ENTRANCE_POSITION,
  MAP_BOUNDS,
  NAV_ARRIVAL_THRESHOLD,
  NAV_STEP_LENGTH,
  NAV_OFF_ROUTE_THRESHOLD,
  STAIRS_POSITION,
} from "@/lib/constants";
import {
  clampToBounds,
  headingToward,
  movePoint,
  nearestPointOnPolyline,
  segmentLength,
  type Point,
} from "@/lib/navigation/pathGeometry";
import {
  getActivePathPoints,
  initialPhase,
  isNearStairs,
  type NavPhase,
} from "@/lib/navigation/multiFloorRoute";

interface NavigationState {
  isVisible: boolean;
  isTracking: boolean;
  position: Point;
  heading: number;
  targetSpotId: string | null;
  targetSpotName: string | null;
  targetPosition: Point | null;
  targetFloor: number;
  userFloor: number;
  phase: NavPhase;
  isOffRoute: boolean;
  distanceToRoute: number;
  pathProgress: number;
  routeAnchor: Point | null;
  hasArrived: boolean;
  sensorsEnabled: boolean;
  atStairs: boolean;

  anchorAtEntrance: () => void;
  startNavigation: (
    spotId: string,
    spotName: string,
    spotX: number,
    spotY: number,
    floor: number
  ) => void;
  stopNavigation: () => void;
  setSensorsEnabled: (enabled: boolean) => void;
  setHeading: (heading: number) => void;
  applyStep: (headingDeg?: number) => void;
  stepBackward: () => void;
  resetToEntrance: () => void;
  advanceFloor: () => void;
  goToUserFloor: () => number;
}

function computeRouteMetrics(
  pos: Point,
  target: Point | null,
  userFloor: number,
  targetFloor: number,
  phase: NavPhase
) {
  if (!target) {
    return {
      isOffRoute: false,
      distanceToRoute: 0,
      pathProgress: 0,
      routeAnchor: null as Point | null,
      hasArrived: false,
      atStairs: false,
    };
  }

  const path = getActivePathPoints(userFloor, targetFloor, target, phase);
  const nearest = nearestPointOnPolyline(pos, path);
  const arrived =
    userFloor === targetFloor &&
    phase === "to_spot" &&
    segmentLength(pos, target) <= NAV_ARRIVAL_THRESHOLD;
  const nearStairs =
    userFloor < targetFloor && (phase === "to_stairs" || phase === "change_floor") && isNearStairs(pos);

  return {
    isOffRoute: nearest.distance > NAV_OFF_ROUTE_THRESHOLD && !arrived && !nearStairs,
    distanceToRoute: nearest.distance,
    pathProgress: nearest.progress,
    routeAnchor: nearest.point,
    hasArrived: arrived,
    atStairs: nearStairs,
  };
}

function updateAfterMove(
  next: Point,
  heading: number,
  state: Pick<
    NavigationState,
    "targetPosition" | "userFloor" | "targetFloor" | "phase" | "targetSpotName"
  >
) {
  let phase = state.phase;
  const userFloor = state.userFloor;

  if (
    state.targetFloor > ENTRANCE_FLOOR &&
    userFloor < state.targetFloor &&
    phase === "to_stairs" &&
    isNearStairs(next)
  ) {
    phase = "change_floor";
  }

  const metrics = computeRouteMetrics(
    next,
    state.targetPosition,
    userFloor,
    state.targetFloor,
    phase
  );

  const hasArrived = metrics.hasArrived;
  if (hasArrived) phase = "arrived";

  return { position: next, heading, phase, userFloor, ...metrics, hasArrived };
}

export const useNavigationStore = create<NavigationState>()((set, get) => ({
  isVisible: false,
  isTracking: false,
  position: { ...ENTRANCE_POSITION },
  heading: 0,
  targetSpotId: null,
  targetSpotName: null,
  targetPosition: null,
  targetFloor: ENTRANCE_FLOOR,
  userFloor: ENTRANCE_FLOOR,
  phase: "to_spot",
  isOffRoute: false,
  distanceToRoute: 0,
  pathProgress: 0,
  routeAnchor: null,
  hasArrived: false,
  sensorsEnabled: false,
  atStairs: false,

  anchorAtEntrance: () => {
    set({
      isVisible: true,
      isTracking: false,
      position: { ...ENTRANCE_POSITION },
      heading: 0,
      targetSpotId: null,
      targetSpotName: null,
      targetPosition: null,
      targetFloor: ENTRANCE_FLOOR,
      userFloor: ENTRANCE_FLOOR,
      phase: "to_spot",
      isOffRoute: false,
      distanceToRoute: 0,
      pathProgress: 0,
      routeAnchor: null,
      hasArrived: false,
      atStairs: false,
    });
  },

  startNavigation: (spotId, spotName, spotX, spotY, floor) => {
    const target: Point = { x: spotX, y: spotY };
    const pos = get().position;
    const phase = initialPhase(floor);
    const path = getActivePathPoints(ENTRANCE_FLOOR, floor, target, phase);
    const heading = headingToward(pos, path[path.length - 1] ?? target);
    const metrics = computeRouteMetrics(pos, target, ENTRANCE_FLOOR, floor, phase);

    set({
      isVisible: true,
      isTracking: true,
      targetSpotId: spotId,
      targetSpotName: spotName,
      targetPosition: target,
      targetFloor: floor,
      userFloor: ENTRANCE_FLOOR,
      phase,
      heading,
      sensorsEnabled: true,
      ...metrics,
    });
  },

  stopNavigation: () => {
    set({
      isVisible: false,
      isTracking: false,
      targetSpotId: null,
      targetSpotName: null,
      targetPosition: null,
      sensorsEnabled: false,
      isOffRoute: false,
      routeAnchor: null,
      hasArrived: false,
      atStairs: false,
      phase: "to_spot",
      userFloor: ENTRANCE_FLOOR,
    });
  },

  setSensorsEnabled: (enabled) => set({ sensorsEnabled: enabled }),

  setHeading: (heading) => set({ heading }),

  applyStep: (headingDeg) => {
    const state = get();
    if (!state.isTracking) return;

    const heading = headingDeg ?? state.heading;
    const next = clampToBounds(
      movePoint(state.position, heading, NAV_STEP_LENGTH),
      MAP_BOUNDS
    );

    set(
      updateAfterMove(next, heading, {
        targetPosition: state.targetPosition,
        userFloor: state.userFloor,
        targetFloor: state.targetFloor,
        phase: state.phase,
        targetSpotName: state.targetSpotName,
      })
    );
  },

  stepBackward: () => {
    const state = get();
    if (!state.isTracking) return;

    const backHeading = (state.heading + 180) % 360;
    const next = clampToBounds(
      movePoint(state.position, backHeading, NAV_STEP_LENGTH),
      MAP_BOUNDS
    );

    set(
      updateAfterMove(next, backHeading, {
        targetPosition: state.targetPosition,
        userFloor: state.userFloor,
        targetFloor: state.targetFloor,
        phase: state.phase,
        targetSpotName: state.targetSpotName,
      })
    );
  },

  resetToEntrance: () => {
    const state = get();
    const phase = initialPhase(state.targetFloor);
    const metrics = computeRouteMetrics(
      ENTRANCE_POSITION,
      state.targetPosition,
      ENTRANCE_FLOOR,
      state.targetFloor,
      phase
    );
    set({
      position: { ...ENTRANCE_POSITION },
      userFloor: ENTRANCE_FLOOR,
      phase,
      ...metrics,
      pathProgress: 0,
      hasArrived: false,
    });
  },

  advanceFloor: () => {
    const state = get();
    if (state.userFloor >= state.targetFloor) return;

    const nextFloor = state.userFloor + 1;
    const target = state.targetPosition!;
    const phase: NavPhase = nextFloor === state.targetFloor ? "to_spot" : "change_floor";
    const heading = headingToward(
      STAIRS_POSITION,
      phase === "to_spot" ? target : STAIRS_POSITION
    );
    const metrics = computeRouteMetrics(
      STAIRS_POSITION,
      target,
      nextFloor,
      state.targetFloor,
      phase
    );

    set({
      userFloor: nextFloor,
      position: { ...STAIRS_POSITION },
      phase,
      heading,
      ...metrics,
      atStairs: phase === "change_floor",
    });
  },

  goToUserFloor: () => get().userFloor,
}));
