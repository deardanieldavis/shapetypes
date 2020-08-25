// tslint:disable:readonly-array
// tslint:disable:no-let

import { Point } from './point';

/**
 * A bounding box is a rectangle aligned to the X Y axis
 * It is defined by two corner points (a min and a max)
 */

export class BoundingBox {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a new bounding box from two corners
   * @param cornerA
   * @param cornerB
   */
  public static fromCorners(cornerA: Point, cornerB: Point): BoundingBox {
    const xMin = Math.min(cornerA.x, cornerB.x);
    const xMax = Math.max(cornerA.x, cornerB.x);
    const yMin = Math.min(cornerA.y, cornerB.y);
    const yMax = Math.max(cornerA.y, cornerB.y);
    return new BoundingBox(xMin, xMax, yMin, yMax);
  }

  /**
   * Creates the smallest bounding box that encapsulates all the points
   * @param points
   */
  public static fromPoints(points: readonly Point[]): BoundingBox {
    const x: number[] = new Array<number>(points.length);
    const y: number[] = new Array<number>(points.length);

    for(let i = 0; i < points.length; i++) {
      x[i] = points[i].x;
      y[i] = points[i].y;
    }

    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);
    return new BoundingBox(xMin, xMax, yMin, yMax);
  }

  /**
   * Calculates overlap between two bounding boxes
   * @param a
   * @param b
   * @constructor
   * @returns: Undefined if they don't overlap. Or the bounding box of overlapping portion.
   */
  public static union(a: BoundingBox, b: BoundingBox): BoundingBox | undefined {
    const aMin = a.min;
    const aMax = a.max;
    const bMin = b.min;
    const bMax = b.max;

    // If aMax is greater than bMin and bMax is greater than aMin, then it overlaps
    if (
      aMax.x > bMin.x &&
      bMax.x > aMin.x &&
      aMax.y > bMin.y &&
      bMax.y > aMin.y
    ) {
      const xMin = Math.max(aMin.x, bMin.x);
      const xMax = Math.min(aMax.x, bMax.x);
      const yMin = Math.max(aMin.y, bMin.y);
      const yMax = Math.min(aMax.y, bMax.y);
      return new BoundingBox(xMin, xMax, yMin, yMax);
    }
    return undefined;
  }

  // -----------------------
  // VARS
  // -----------------------
  
  private _xMin: number;
  private _xMax: number;
  private _yMin: number;
  private _yMax: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * A [[BoundingBox]] is a rectangle in space defined by an x & y, min & max
   * @param xMin
   * @param xMax
   * @param yMin
   * @param yMax
   */
  constructor(xMin: number, xMax: number, yMin: number, yMax: number) {
    this._xMin = xMin;
    this._xMax = xMax;
    this._yMin = yMin;
    this._yMax = yMax;
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * The corner of this [[BoundingBox]] that has the smallest x and y values.
   */
  get min(): Point {
    return new Point(this._xMin, this._yMin);
  }

  /**
   * The corner of this [[BoundingBox]] that has the largest x and y values.
   */
  get max(): Point {
    return new Point(this._xMax, this._yMax);
  }

  /**
   * The point in the center of this [[BoundingBox]].
   */
  get center(): Point {
    return new Point(
      (this._xMin + this._xMax) / 2,
      (this._yMin + this._yMax) / 2
    );
  }

  /**
   * The area of the this [[BoundingBox]].
   */
  get area(): number {
    return (this._xMax - this._xMin) * (this._yMax - this._yMin);
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Creates a new copy of this [[BoundingBox]].
   */
  public duplicate(): BoundingBox {
    return new BoundingBox(this._xMin, this._xMax, this._yMin, this._yMax);
  }

  /**
   * Evenly increases the size of the [[BoundingBox]] in all directions.
   * @param amount
   */
  public inflate(amount: number): void {
    this._xMin -= amount;
    this._xMax += amount;
    this._yMin -= amount;
    this._yMax += amount;
  }

  /**
   * Calcultes whether the point is within the bounding box. Includes points that are on the edge.
   * @param point
   */
  public contains(point: Point): boolean {
    if (this._xMin <= point.x && point.x <= this._xMax) {
      if (this._yMin <= point.y && point.y <= this._yMax) {
        return true;
      }
    }
    return false;
  }
}
