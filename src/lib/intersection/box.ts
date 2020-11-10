// tslint:disable:no-let no-object-mutation
import { BoundingBox, IntervalSorted, Line, Ray } from '../../index';

/**
 * Returns the parameters of an intersection between a line and a bounding box.
 * @param line      The line
 * @param box       The bounding box
 *
 * @module  Intersection
 */
export function lineBox(
  line: Line,
  box: BoundingBox
): {
  /** True if `line` intersects `box`. */
  readonly intersects: boolean;
  /** The portion of `line` within the `box`. Use [[Line.pointAt]] to get actual points. */
  readonly domain: IntervalSorted;
} {
  // Reject lines that obviously wont intersect
  if (line.from.x < box.xRange.min && line.to.x < box.xRange.min) {
    // Fully to left
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  } else if (line.from.x > box.xRange.max && line.to.x > box.xRange.max) {
    // Fully to right
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  } else if (line.from.y < box.yRange.min && line.to.y < box.yRange.min) {
    // Fully below box
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  } else if (line.from.y > box.yRange.max && line.to.y > box.yRange.max) {
    // Fully above box
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  }

  // Use Liang-Barsky's algorithm to find possible intersections
  // https://en.wikipedia.org/wiki/Liang–Barsky_algorithm

  // defining variables
  const p1 = -line.direction.x;
  const p2 = line.direction.x;
  const p3 = -line.direction.y;
  const p4 = line.direction.y;

  const q1 = line.from.x - box.xRange.min;
  const q2 = box.xRange.max - line.from.x;
  const q3 = line.from.y - box.yRange.min;
  const q4 = box.yRange.max - line.from.y;

  const posarr = new Array<number>(3);
  const negarr = new Array<number>(3);
  let posind = 1;
  let negind = 1;
  posarr[0] = 1;
  negarr[0] = 0;

  if (
    (p1 === 0 && q1 < 0) ||
    (p2 === 0 && q2 < 0) ||
    (p3 === 0 && q3 < 0) ||
    (p4 === 0 && q4 < 0)
  ) {
    // Line is parallel to box
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  }
  if (p1 !== 0) {
    const r1 = q1 / p1;
    const r2 = q2 / p2;
    if (p1 < 0) {
      negarr[negind++] = r1; // for negative p1, add it to negative array
      posarr[posind++] = r2; // and add p2 to positive array
    } else {
      negarr[negind++] = r2;
      posarr[posind++] = r1;
    }
  }
  if (p3 !== 0) {
    const r3 = q3 / p3;
    const r4 = q4 / p4;
    if (p3 < 0) {
      negarr[negind++] = r3;
      posarr[posind++] = r4;
    } else {
      negarr[negind++] = r4;
      posarr[posind++] = r3;
    }
  }

  const rn1 = maxi(negarr, negind, 0); // maximum of negative array
  const rn2 = mini(posarr, posind, 1); // minimum of positive array

  if (rn1 > rn2) {
    // reject
    // Line is outside the box
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  }
  return { intersects: true, domain: new IntervalSorted(rn1, rn2) };
}

/**
 * Returns the parameters of an intersection between a ray and a bounding box.
 * @param ray      The ray
 * @param box      The bounding box
 *
 * @module Intersection
 */
export function rayBox(
  ray: Ray,
  box: BoundingBox,
  onlyForward: boolean = false
): {
  /** True if `ray` intersects `box` */
  readonly intersects: boolean;
  /** The portion of `ray` within the `box`. Use [[Ray.pointAt]] to get actual points. */
  readonly domain: IntervalSorted;
} {
  // Use Liang-Barsky's algorithm to find possible intersections
  // https://en.wikipedia.org/wiki/Liang–Barsky_algorithm

  // defining variables
  const p1 = -ray.direction.x;
  const p2 = ray.direction.x;
  const p3 = -ray.direction.y;
  const p4 = ray.direction.y;

  const q1 = ray.from.x - box.xRange.min;
  const q2 = box.xRange.max - ray.from.x;
  const q3 = ray.from.y - box.yRange.min;
  const q4 = box.yRange.max - ray.from.y;

  const posarr = new Array<number>(3);
  const negarr = new Array<number>(3);
  let posind = 1;
  let negind = 1;
  posarr[0] = Number.POSITIVE_INFINITY;

  negarr[0] = onlyForward ? 0 : Number.NEGATIVE_INFINITY;

  if (
    (p1 === 0 && q1 < 0) ||
    (p2 === 0 && q2 < 0) ||
    (p3 === 0 && q3 < 0) ||
    (p4 === 0 && q4 < 0)
  ) {
    // Ray is parallel to box
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  }
  if (p1 !== 0) {
    const r1 = q1 / p1;
    const r2 = q2 / p2;
    if (p1 < 0) {
      negarr[negind++] = r1; // for negative p1, add it to negative array
      posarr[posind++] = r2; // and add p2 to positive array
    } else {
      negarr[negind++] = r2;
      posarr[posind++] = r1;
    }
  }
  if (p3 !== 0) {
    const r3 = q3 / p3;
    const r4 = q4 / p4;
    if (p3 < 0) {
      negarr[negind++] = r3;
      posarr[posind++] = r4;
    } else {
      negarr[negind++] = r4;
      posarr[posind++] = r3;
    }
  }

  const min = onlyForward ? 0 : Number.NEGATIVE_INFINITY;
  const rn1 = maxi(negarr, negind, min); // maximum of negative array
  const rn2 = mini(posarr, posind, Number.POSITIVE_INFINITY); // minimum of positive array

  if (rn1 > rn2) {
    // reject
    // Ray is outside the box
    return { intersects: false, domain: new IntervalSorted(0, 0) };
  }
  return { intersects: true, domain: new IntervalSorted(rn1, rn2) };
}

/**
 * Returns largest number in list that is greater than `minValue`.
 * @param arr       List of numbers
 * @param n         Only searches list to this point
 * @param minValue  The number must be larger than this. If it's not, returns this value.
 *
 * @private
 */
function maxi(arr: readonly number[], n: number, minValue: number): number {
  let m = minValue;
  for (let i = 0; i < n; ++i) {
    if (m < arr[i]) {
      m = arr[i];
    }
  }
  return m;
}

/**
 * Returns smallest number in list that is smaller than `maxValue`.
 * @param arr   List of numbers
 * @param n     Only searches list to this point
 * @param maxValue  The number must be smaller than this. If it's not, returns this value.
 */
function mini(arr: readonly number[], n: number, maxValue: number): number {
  let m = maxValue;
  for (let i = 0; i < n; ++i) {
    if (m > arr[i]) {
      m = arr[i];
    }
  }
  return m;
}
