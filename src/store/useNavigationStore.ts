import { create } from "zustand";
import {
  ENTRANCE_POSITION,
  MAP_BOUNDS,
  NAV_ARRIVAL_THRESHOLD,
  NAV_STEP_LENGTH,
  NAV_OFF_ROUTE_THRESHOLD,
} from "@/lib/constants";
import {
  buildRoutePath,
  clampToBounds,
  headingToward,
  movePoint,
  nearestPointOnPolyline,
  segmentLength,
  type Point,
} from "@/lib/navigation/pathGeometry";

interface NavigationState {
  isVisible: boolean;
  isTracking: boolean;
  position: Point;
  heading: number;
  targetSpotId: string | null;
  targetPosition: Point | null;
  floor: number;
  isOffRoute: boolean;
  distanceToRoute: number;
  pathProgress: number;
  routeAnchor: Point | null;
  hasArrived: boolean;
  sensorsEnabled: boolean;

  anchorAtEntrance: () => void;
  startNavigation: (spotId: string, spotX: number, spotY: number, floor: number) => void;
  stopNavigation: () => void;
  setSensorsEnabled: (enabled: boolean) => void;
  setHeading: (heading: number) => void;
  applyStep: (headingDeg?: number) => void;
  stepBackward: () => void;
  resetToEntrance: () => void;
}

function computeRouteMetrics(pos: Point, target: Point | null) {
  if (!target) {
    return {
      isOffRoute: false,
      distanceToRoute: 0,
      pathProgress: 0,
      routeAnchor: null as Point | null,
      hasArrived: false,
    };
  }

  const path = buildRoutePath(ENTRANCE_POSITION, target);
  const nearest = nearestPointOnPolyline(pos, path);
  const arrived = segmentLength(pos, target) <= NAV_ARRIVAL_THRESHOLD;

  return {
    isOffRoute: nearest.distance > NAV_OFF_ROUTE_THRESHOLD && !arrived,
    distanceToRoute: nearest.distance,
    pathProgress: nearest.progress,
    routeAnchor: nearest.point,
    hasArrived: arrived,
  };
}

export const useNavigationStore = create<NavigationState>()((set, get) => ({
  isVisible: false,
  isTracking: false,
  position: { ...ENTRANCE_POSITION },
  heading: 0,
  targetSpotId: null,
  targetPosition: null,
  floor: 1,
  isOffRoute: false,
  distanceToRoute: 0,
  pathProgress: 0,
  routeAnchor: null,
  hasArrived: false,
  sensorsEnabled: false,

  anchorAtEntrance: () => {
    set({
      isVisible: true,
      isTracking: false,
      position: { ...ENTRANCE_POSITION },
      heading: 0,
      targetSpotId: null,
      targetPosition: null,
      isOffRoute: false,
      distanceToRoute: 0,
      pathProgress: 0,
      routeAnchor: null,
      hasArrived: false,
    });
  },

  startNavigation: (spotId, spotX, spotY, floor) => {
    const target: Point = { x: spotX, y: spotY };
    const pos = get().position;
    const heading = headingToward(pos, target);
    const metrics = computeRouteMetrics(pos, target);

    set({
      isVisible: true,
      isTracking: true,
      targetSpotId: spotId,
      targetPosition: target,
      floor,
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
      targetPosition: null,
      sensorsEnabled: false,
      isOffRoute: false,
      routeAnchor: null,
      hasArrived: false,
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
    const metrics = computeRouteMetrics(next, state.targetPosition);

    set({
      position: next,
      heading,
      ...metrics,
    });
  },

  stepBackward: () => {
    const state = get();
    if (!state.isTracking) return;

    const backHeading = (state.heading + 180) % 360;
    const next = clampToBounds(
      movePoint(state.position, backHeading, NAV_STEP_LENGTH),
      MAP_BOUNDS
    );
    const metrics = computeRouteMetrics(next, state.targetPosition);

    set({
      position: next,
      heading: backHeading,
      ...metrics,
    });
  },

  resetToEntrance: () => {
    const target = get().targetPosition;
    const metrics = computeRouteMetrics(ENTRANCE_POSITION, target);
    set({
      position: { ...ENTRANCE_POSITION },
      pathProgress: 0,
      hasArrived: false,
      ...metrics,
    });
  },
}));
