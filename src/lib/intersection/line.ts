import { Line, shapetypesSettings } from '../../index';

/**
 * Calculates the point of intersection between two lines.
 *
 * @param lineA                 The first line.
 * @param lineB                 The second line.
 * @param limitToFiniteSegment  If true, an intersection only counts if it falls within the bounds of the lines. If false, the lines will be treated as infinite.
 * @return
 *
 * @module Intersection
 */
export function lineLine(
  lineA: Line,
  lineB: Line,
  limitToFiniteSegment: boolean = true
): {
  /** True if the two lines intersect. */
  readonly intersects: boolean;
  /** The parameter along `lineA` where the intersection occurs. Use [[Line.pointAt]] to get the actual point. */
  readonly lineAU: number;
  /** The parameter along `lineB` where the intersection occurs. Use [[Line.pointAt]] to get the actual point. */
  readonly lineBU: number;
} {
  // Based on:
  // https://github.com/davidfig/pixi-intersects/blob/master/src/shape.js
  const aX = lineA.direction.x;
  const aY = lineA.direction.y;
  const bX = lineB.direction.x;
  const bY = lineB.direction.y;

  const denominator = -bX * aY + aX * bY;
  if (denominator === 0) {
    return { intersects: false, lineAU: 0, lineBU: 0 };
  }

  const diffX = lineA.from.x - lineB.from.x;
  const diffY = lineA.from.y - lineB.from.y;
  const s = (-aY * diffX + aX * diffY) / denominator;
  const t = (bX * diffY - bY * diffX) / denominator;

  if (limitToFiniteSegment) {
    if (
      -shapetypesSettings.absoluteTolerance <= s &&
      s <= 1 + shapetypesSettings.absoluteTolerance &&
      -shapetypesSettings.absoluteTolerance <= t &&
      t <= 1 + shapetypesSettings.absoluteTolerance
    ) {
      return { intersects: true, lineAU: t, lineBU: s };
    }
  } else {
    return { intersects: true, lineAU: t, lineBU: s };
  }

  return { intersects: false, lineAU: 0, lineBU: 0 };
}
