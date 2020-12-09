import { inRayRange, Line, Ray, RayRange } from '../../index';

/**
 * Calculates the point of intersection between a ray and a line.
 *
 * @param ray   The ray that intersects the line.
 * @param line  The line that intersects the ray.
 * @param range The extent of the ray. Specifies whether the ray is
 *              shooting both forward and backward, or only forward.
 *
 * @module  Intersection
 */
export function rayLine(
  ray: Ray,
  line: Line,
  range: RayRange = RayRange.both
): {
  /** True if the ray and line intersect. */
  readonly intersects: boolean;
  /** The parameter along `ray` where the intersection occurs. Use [[Ray.pointAt]] to get the actual point. */
  readonly rayU: number;
  /** The parameter along `line` where the intersection occurs. Use [[Line.pointAt]] to get the actual point. */
  readonly lineU: number;
} {
  // Based on:
  // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
  const aX = ray.direction.x;
  const aY = ray.direction.y;
  const bX = line.direction.x;
  const bY = line.direction.y;

  const denominator = -bX * aY + aX * bY;
  if (denominator === 0) {
    return { intersects: false, rayU: 0, lineU: 0 };
  }

  const diffX = ray.from.x - line.from.x;
  const diffY = ray.from.y - line.from.y;

  const s = (-aY * diffX + aX * diffY) / denominator;
  const t = (bX * diffY - bY * diffX) / denominator;

  if (0 <= s && s <= 1) {
    // The ray intersects the line
    if (inRayRange(t, range)) {
      return { intersects: true, rayU: t, lineU: s };
    }
  }

  return { intersects: false, rayU: 0, lineU: 0 };
}

/**
 * Calculates the point of intersection between two rays.
 *
 * @param rayA      The first ray.
 * @param rayB      The second ray.
 * @param range     The extent of the ray. Specifies whether the ray is
 *                  shooting both forward and backward, or only forward.
 *
 * @module  Intersection
 */
export function rayRay(
  rayA: Ray,
  rayB: Ray,
  range: RayRange = RayRange.both
): {
  /** True if the two rays intersect. */
  readonly intersects: boolean;
  /** The parameter along `rayA` where the intersection occurs. Use [[Ray.pointAt]] to get the actual point. */
  readonly rayAU: number;
  /** The parameter along `rayB` where the intersection occurs. Use [[Ray.pointAt]] to get the actual point. */
  readonly rayBU: number;
} {
  // Based on:
  // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
  const aX = rayA.direction.x;
  const aY = rayA.direction.y;
  const bX = rayB.direction.x;
  const bY = rayB.direction.y;

  const denominator = -bX * aY + aX * bY;
  if (denominator === 0) {
    return { intersects: false, rayAU: 0, rayBU: 0 };
  }

  const diffX = rayA.from.x - rayB.from.x;
  const diffY = rayA.from.y - rayB.from.y;

  const s = (-aY * diffX + aX * diffY) / denominator;
  const t = (bX * diffY - bY * diffX) / denominator;

  if (inRayRange(s, range) && inRayRange(t, range)) {
    return { intersects: true, rayAU: t, rayBU: s };
  }
  return { intersects: false, rayAU: 0, rayBU: 0 };
}
