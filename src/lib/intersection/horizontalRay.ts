import { Line, Point, Polyline, shapetypesSettings } from '../../index';

/**
 * Returns the number of times a horizontal ray intersects with a polyline.
 *
 * This is a more efficient version of [[Intersection.ray]] used for [[polyline.contains]].
 * Assumes point has already been tested for inclusion within the polyline's bounding box.
 *
 *
 * @param start       The start of the ray. The ray will be shot with a vector of 1,0
 * @param polyline    The polyline to test for intersection
 * @returns           The number of times the ray intersects with the polyline
 *
 * @private
 */
export function horizontalRayPolyline(
  start: Point,
  polyline: Polyline
): number {
  // https://medium.com/poka-techblog/simplify-your-javascript-use-map-reduce-and-filter-bd02c593cc2d
  const count = polyline.segments.reduce((accumulator, edge) => {
    const result = horizontalRayLine(start, edge);
    if (result) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);

  return count;
}

/**
 * Calculates the intersection between a horizontal ray starting at [start] and intersecting with [line].
 *
 * This is more efficient than the LineLineInfinite algorithm because it can identify whether a line will intersect with
 * the ray prior to running the intersection calculation. This allows many lines to be discarded early.
 *
 * @param start: The start point for the ray, which will run in the [1,0] direction
 * @param line: The line to test the intersection with
 *
 * @private
 */
export function horizontalRayLine(start: Point, line: Line): boolean {
  if (line.from.y < start.y && line.to.y < start.y) {
    // Line is fully below the ray
    return false;
  } else if (line.from.y > start.y && line.to.y > start.y) {
    // Line is fully above the ray
    return false;
  } else if (line.from.x < start.x && line.to.x < start.x) {
    // Line is fully to the left of the ray
    return false;
  }

  // If we get to here, one end must be above and another below the ray, so likely to be an intersection
  // Use an optimized version of Intersection.rayLine for horizontal lines
  // Based on:
  // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
  // const aX = 1;
  // const aY = 0;
  const bX = line.direction.x;
  const bY = line.direction.y;

  // const denominator = -bX * aY + aX * bY;
  const denominator = bY;
  if (denominator === 0) {
    return false;
  }

  const diffX = start.x - line.from.x;
  const diffY = start.y - line.from.y;

  // const s = (-aY * diffX + aX * diffY) / denominator;
  // const t = (bX * diffY - bY * diffX) / denominator;
  const s = diffY / denominator;
  const t = (bX * diffY - bY * diffX) / denominator;

  if (0 <= s && s <= 1) {
    // The ray intersects the line
    if (shapetypesSettings.absoluteTolerance <= t) {
      // Intersection of forward of start point
      return true;
    }
  }
  return false;
}
