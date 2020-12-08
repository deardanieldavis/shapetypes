import {
  approximatelyEqual,
  Circle,
  inRayRange,
  Line,
  Ray,
  RayRange,
  shapetypesSettings,
  Vector
} from '../../index';

/**
 * The number of intersections between a line and a circle. Used in [[Intersection.lineCircle]].
 */
export enum LineCircleIntersection {
  none,
  single,
  multiple
}

/**
 * Calculates the points of intersection between a line and a circle.
 * @param line      The line to intersect with the circle.
 * @param circle    The circle to intersect with the line.
 *
 * @module  Intersection
 */
export function lineCircle(
  line: Line,
  circle: Circle
): {
  /** The number of times the line intersects the circle. */
  readonly intersects: LineCircleIntersection;
  /** The parameters along the line where the intersections occur. Use [[Line.pointAt]] to get the actual points. */
  readonly u: readonly number[];
} {
  // Based on: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
  const d = line.direction;
  const f = Vector.fromPoints(circle.center, line.from);
  const r = circle.radius;

  const a = d.dotProduct(d);
  const b = 2 * f.dotProduct(d);
  const c = f.dotProduct(f) - r * r;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // Line never crosses circle
    return { intersects: LineCircleIntersection.none, u: [] };
  }

  const discriminantSqrt = Math.sqrt(discriminant);
  const t1 = (-b - discriminantSqrt) / (2 * a);
  const t2 = (-b + discriminantSqrt) / (2 * a);

  if (t1 >= 0 && t1 <= 1) {
    if (t2 >= 0 && t2 <= 1) {
      if (approximatelyEqual(t1, t2, shapetypesSettings.absoluteTolerance)) {
        // Line is tangent to circle
        return { intersects: LineCircleIntersection.single, u: [t1] };
      } else {
        // Line went through both sides
        return { intersects: LineCircleIntersection.multiple, u: [t1, t2] };
      }
    } else {
      // Line crossed once but ended before making it through to other side
      return { intersects: LineCircleIntersection.single, u: [t1] };
    }
  }

  if (t2 >= 0 && t2 <= 1) {
    // Line started inside and exited in one place
    return { intersects: LineCircleIntersection.single, u: [t2] };
  }

  // Line is either completely inside the circle or completely outside.
  return { intersects: LineCircleIntersection.none, u: [] };
}

/**
 * Calculates the points of intersection between a ray and a circle.
 * @param ray     The ray to intersect with the circle.
 * @param circle  The circle to intersect with the ray.
 * @param range   The extent of the ray. Specifies whether the ray is
 *                 shooting both forwards and backwards, or only forwards.
 *
 * @module Intersection
 */
export function rayCircle(
  ray: Ray,
  circle: Circle,
  range: RayRange = RayRange.both
): {
  /** The number of times the ray intersects the circle. */
  readonly intersects: LineCircleIntersection;
  /** The parameters along the ray where the intersections occur. Use [[Ray.pointAt]] to get the actual points. */
  readonly u: readonly number[];
} {
  // Based on: https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
  const d = ray.direction;
  const f = Vector.fromPoints(circle.center, ray.from);
  const r = circle.radius;

  const a = d.dotProduct(d);
  const b = 2 * f.dotProduct(d);
  const c = f.dotProduct(f) - r * r;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // Ray never crosses circle
    return { intersects: LineCircleIntersection.none, u: [] };
  }

  const discriminantSqrt = Math.sqrt(discriminant);
  const t1 = (-b - discriminantSqrt) / (2 * a);
  const t2 = (-b + discriminantSqrt) / (2 * a);

  if(range !== RayRange.both) {
    // If the range isn't set to `both`, there can be intersections that happen on
    // the ray that fall outside the allowed range. These should be discarded.
    if(inRayRange(t1, range)) {
      if(! inRayRange(t2, range)) {
        // Of the two intersections, t1 was in range but t2 wasn't
        return { intersects: LineCircleIntersection.single, u: [t1] };
      }
      // If here, both intersections were in range so skip to end.
    } else {
      if(inRayRange(t2, range)) {
        // Of the two intersections, t2 was in range but t1 wasn't
        return { intersects: LineCircleIntersection.single, u: [t2] };
      } else {
        // Of the two intersections, neither was in range
        return { intersects: LineCircleIntersection.none, u: [] };
      }
    }
  }

  if (approximatelyEqual(t1, t2, shapetypesSettings.absoluteTolerance)) {
    // Both intersections are in the same place because the ray is tangent to the circle
    return { intersects: LineCircleIntersection.single, u: [t1] };
  } else {
    // Ray went through both sides
    return { intersects: LineCircleIntersection.multiple, u: [t1, t2] };
  }
}
