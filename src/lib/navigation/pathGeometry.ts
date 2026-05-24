import { ENTRANCE_POSITION } from "@/lib/constants";

export interface Point {
  x: number;
  y: number;
}

/** L-shaped corridor path matching the smoothstep route (horizontal then vertical). */
export function buildRoutePath(from: Point, to: Point): Point[] {
  if (Math.abs(from.y - to.y) < 1) {
    return [from, to];
  }
  const corner: Point = { x: to.x, y: from.y };
  return [from, corner, to];
}

export function segmentLength(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function polylineLength(points: Point[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += segmentLength(points[i], points[i + 1]);
  }
  return total;
}

export function bearing(from: Point, to: Point): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

export function nearestPointOnPolyline(
  point: Point,
  polyline: Point[]
): { point: Point; distance: number; segmentIndex: number; progress: number } {
  if (polyline.length < 2) {
    return { point: polyline[0] ?? point, distance: Infinity, segmentIndex: 0, progress: 0 };
  }

  const totalLen = polylineLength(polyline);
  let bestDist = Infinity;
  let bestPoint = polyline[0];
  let bestSegment = 0;
  let bestProgress = 0;
  let walked = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];
    const segLen = segmentLength(a, b);
    const { point: projected, t } = projectOnSegment(point, a, b);
    const dist = segmentLength(point, projected);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = projected;
      bestSegment = i;
      bestProgress = totalLen > 0 ? (walked + t * segLen) / totalLen : 0;
    }
    walked += segLen;
  }

  return {
    point: bestPoint,
    distance: bestDist,
    segmentIndex: bestSegment,
    progress: Math.max(0, Math.min(1, bestProgress)),
  };
}

function projectOnSegment(p: Point, a: Point, b: Point): { point: Point; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { point: a, t: 0 };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return { point: { x: a.x + t * dx, y: a.y + t * dy }, t };
}

export function movePoint(origin: Point, headingDeg: number, distance: number): Point {
  const rad = (headingDeg * Math.PI) / 180;
  return {
    x: origin.x + distance * Math.cos(rad),
    y: origin.y + distance * Math.sin(rad),
  };
}

export function clampToBounds(
  point: Point,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): Point {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, point.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, point.y)),
  };
}

export function headingToward(from: Point, to: Point): number {
  return bearing(from, to);
}

export function entrancePathTo(spot: Point): Point[] {
  return buildRoutePath(ENTRANCE_POSITION, spot);
}

export function isHeadingWithPath(userHeading: number, pathBearingDeg: number): boolean {
  let diff = Math.abs(userHeading - pathBearingDeg) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff < 90;
}
