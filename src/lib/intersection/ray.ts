import { Line, Ray } from '../../index';

/**
 * Calculates the intersection between a ray and a line
 *
 * Based on:
 * https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
 *
 * @param ray: Ray to shoot into line
 * @param line: Line to test intersection with
 * @param bothSides: If true, will include intersections that happen behind the start point (eg. a negative rayU)
 * @returns:    success: true if the lines intersect. eg. aren't parallel.
 *              rayU: parameter along ray where intersection occurs. U is the same as distance since the ray is normalized.
 *              lineU: parameter on the line where the ray intersects. Will always be between 0 & 1, the bounds of the line.
 *
 * @module  Intersection
 */
export function rayLine(
  ray: Ray,
  line: Line,
  onlyForward: boolean = false
): { readonly intersects: boolean; readonly rayU: number; readonly lineU: number } {
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
    if (onlyForward) {
      if (0 <= t) {
        // The intersection is forward of the ray's start
        return { intersects: true, rayU: t, lineU: s };
      }
    } else {
      return { intersects: true, rayU: t, lineU: s };
    }
  }

  return { intersects: false, rayU: 0, lineU: 0 };
}

/**
 *
 * @param rayA
 * @param rayB
 * @param bothSides
 *
 * @module  Intersection
 */
export function rayRay(
  rayA: Ray,
  rayB: Ray,
  onlyForward: boolean = false
): { readonly intersects: boolean; readonly rayAU: number; readonly rayBU: number } {
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

  if (onlyForward) {
    if (0 <= t && 0 <= s) {
      return { intersects: true, rayAU: t, rayBU: s };
    }
  } else {
    return { intersects: true, rayAU: t, rayBU: s };
  }
  return { intersects: false, rayAU: 0, rayBU: 0 };
}
