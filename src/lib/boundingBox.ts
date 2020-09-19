// tslint:disable:readonly-array

import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';
import { Line } from './line';
import { Point } from './point';
import { Polyline } from './polyline';
import { Transform } from './transform';
import { Transformable } from './transformable';

/**
 * A BoundingBox is a rectangle aligned to the X-Y axis. It is defined by two [[IntervalSorted]]s, which give the dimensions of the rectangle along the x and y axis.
 *
 * ### Example
 * ```js
 * import { BoundingBox } from 'shapetypes'
 *
 * const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
 * console.log(bb.area);
 * // => 200
 * console.log(bb.center);
 * // => x: 5, y: 15
 * console.log(bb.contains(new Point(5, 15));
 * // => True
 *
 * const shifted = bb.withXRange(new IntervalSorted(0, 20));
 * console.log(shifted.area);
 * // => 400
 *
 * const scaled = bb.scale(2);
 * console.log(scaled.area);
 * // => 800
 * ```
 */

export class BoundingBox extends Transformable {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a BoundingBox defined by two corner points.
   * @param cornerA One of the BoundingBox
   * @param cornerB The corner diagonally opposite [[cornerA]]
   */
  public static fromCorners(cornerA: Point, cornerB: Point): BoundingBox {
    const xRange = new IntervalSorted(cornerA.x, cornerB.x);
    const yRange = new IntervalSorted(cornerA.y, cornerB.y);
    return new BoundingBox(xRange, yRange);
  }

  /**
   * Returns the smallest BoundingBox that encapsulates all the points.
   * @param points  List of points to encapsulate in a BoundingBox.
   */
  public static fromPoints(points: readonly Point[]): BoundingBox {
    const x = points.map(item => item.x); // gets all x locations of points
    const y = points.map(item => item.y);

    const xRange = IntervalSorted.fromValues(x);
    const yRange = IntervalSorted.fromValues(y);

    return new BoundingBox(xRange, yRange);
  }

  /**
   * Returns a BoundingBox that encapsulates two BoundingBoxes.
   * @param a First BoundingBox to encapsulate
   * @param b Second BoundingBox to encapsulate
   * @constructor
   */
  public static union(a: BoundingBox, b: BoundingBox): BoundingBox {
    const xRange = IntervalSorted.union(a._xRange, b._xRange);
    const yRange = IntervalSorted.union(a._yRange, b._yRange);
    return new BoundingBox(xRange, yRange);
  }

  /**
   * Returns a BoundingBox that represents the overlapping portion of two BoundingBoxes.
   * @param a First BoundingBox to intersect
   * @param b Second BoundingBox to intersect
   * @returns: A BoundingBox representing the overlap between these two boxes. If no overlap exists, returns undefined.
   */
  public static intersection(
    a: BoundingBox,
    b: BoundingBox
  ): BoundingBox | undefined {
    const xRange = IntervalSorted.intersection(a._xRange, b._xRange);
    if (xRange === undefined) {
      return undefined;
    }

    const yRange = IntervalSorted.intersection(a._yRange, b._yRange);
    if (yRange === undefined) {
      return undefined;
    }

    return new BoundingBox(xRange, yRange);
  }

  // -----------------------
  // VARS
  // -----------------------

  private readonly _xRange: IntervalSorted;
  private readonly _yRange: IntervalSorted;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * A BoundingBox is a rectangle aligned to the X-Y axis. It is defined by two [[IntervalSorted]]s, which give the dimensions of the rectangle along the x and y axis.
   * @param xRange: The dimensions of the BoundingBox along the x-axis. Eg. the box will be drawn from xRange.min to xRange.max.
   * @param yRange: The dimensions of the BoundingBox along the y-axis.
   */
  constructor(
    xRange: IntervalSorted | Interval,
    yRange: IntervalSorted | Interval
  ) {
    super();
    this._xRange =
      xRange instanceof IntervalSorted ? xRange : xRange.asSorted();
    this._yRange =
      yRange instanceof IntervalSorted ? yRange : yRange.asSorted();
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * Returns the area of the BoundingBox.
   */
  get area(): number {
    return this._xRange.length * this._yRange.length;
  }

  /**
   * Returns the point at the center of the BoundingBox.
   */
  get center(): Point {
    return new Point(this._xRange.mid, this._yRange.mid);
  }

  /**
   * Returns the corner of the BoundingBox that has the smallest x and y values.
   */
  get min(): Point {
    return new Point(this._xRange.min, this._yRange.min);
  }

  /**
   * Returns the corner of the BoundingBox that has the largest x and y values.
   */
  get max(): Point {
    return new Point(this._xRange.max, this._yRange.max);
  }

  /**
   * Returns the position of the BoundingBox along the x-axis.
   */
  get xRange(): IntervalSorted {
    return this._xRange;
  }

  /**
   * Returns the position of the BoundingBox along the y-axis.
   */
  get yRange(): IntervalSorted {
    return this._yRange;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns the closest point on the BoundingBox relative to given point.
   * @param testPoint Will find the point on the BoundingBox that is closest to this point.
   * @param includeInterior If true, the closest point can be within the BoundingBox. If false, the closest point can only be on the BoundingBox's outer edge.
   */
  public closestPoint(
    testPoint: Point,
    includeInterior: boolean = true
  ): Point {
    if (includeInterior) {
      if (this.contains(testPoint)) {
        return testPoint;
      }
    }
    return this.toPolyline().closestPoint(testPoint);
  }

  /**
   * Returns true if the point is within the BoundingBox.
   * @param testPoint Point to test for containment
   * @param strict  If true, points coincident with the edge of the box won't be counted as contained
   */
  public contains(testPoint: Point, strict: boolean = false): boolean {
    if (this._xRange.contains(testPoint.x, strict)) {
      if (this._yRange.contains(testPoint.y, strict)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns one of the BoundingBox's four corner points.
   * @param minX  If true, point will be at the min x value. If false, will be at max.
   * @param minY  If true, point will be at the min y value. If false, will be at max.
   */
  public corner(minX: boolean, minY: boolean): Point {
    if (minX) {
      if (minY) {
        return new Point(this._xRange.min, this._yRange.min);
      } else {
        return new Point(this._xRange.min, this._yRange.max);
      }
    } else {
      if (minY) {
        return new Point(this._xRange.max, this._yRange.min);
      } else {
        return new Point(this._xRange.max, this._yRange.max);
      }
    }
  }

  /**
   * Returns an array of the BoundingBox's four corners.
   * Order is: [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
   */
  public getCorners(): Point[] {
    return [
      new Point(this._xRange.min, this._yRange.min),
      new Point(this._xRange.max, this._yRange.min),
      new Point(this._xRange.max, this._yRange.max),
      new Point(this._xRange.min, this._yRange.max)
    ];
  }

  /**
   * Returns an array of the BoundingBox's four edges.
   */
  public getEdges(): Line[] {
    const corners = this.getCorners();
    return [
      new Line(corners[0], corners[1]),
      new Line(corners[1], corners[2]),
      new Line(corners[2], corners[3]),
      new Line(corners[3], corners[0])
    ];
  }

  /**
   * Returns a copy of this BoundingBox where the size has been evenly increased in all directions.
   * @param amount
   */
  public inflate(amount: number): BoundingBox;
  // tslint:disable-next-line:unified-signatures
  public inflate(amountX: number, amountY: number): BoundingBox;
  public inflate(amount: number, amountY?: number): BoundingBox {
    const xRange = this._xRange.inflate(amount);
    const yRange =
      amountY === undefined
        ? this._yRange.inflate(amount)
        : this._yRange.inflate(amountY);

    return new BoundingBox(xRange, yRange);
  }

  /**
   * Remaps a point from the u-v space of the BoundingBox to the global coordinate system.
   * This is the opposite of [[remapToBox]].
   * @param uvPoint   A point in the u-v coordinates of the BoundingBox.
   *                  The point's x value is the normalized distance along the x-axis of the BoundingBox (u direction).
   *                  The point's y value is the normalized distance along the y-axis of the BoundingBox (y direction).
   * @returns         The uvPoint remapped to the global coordinate system
   */
  public pointAt(uvPoint: Point): Point {
    return new Point(
      this._xRange.valueAt(uvPoint.x),
      this._yRange.valueAt(uvPoint.y)
    );
  }

  /**
   * Remaps a point to the u-v space of the BoundingBox.
   * This is the opposite of [[pointAt]].
   * @param point   Point to remap
   * @returns       A point in the u-v coordinates of the BoundingBox. See [[pointAt]] for more details.
   */
  public remapToBox(point: Point): Point {
    return new Point(
      this._xRange.remapToInterval(point.x),
      this._yRange.remapToInterval(point.y)
    );
  }

  /**
   * Returns true if the two BoundingBoxes have identical xRanges and yRanges.
   * @param otherBoundingBox  The BoundingBox to compare against
   */
  public equals(otherBoundingBox: BoundingBox): boolean {
    return (
      this._xRange.equals(otherBoundingBox._xRange) &&
      this._yRange.equals(otherBoundingBox._yRange)
    );
  }

  /**
   * Returns a [[Polyline]] representing the outer edge of the BoundingBox
   */
  public toPolyline(): Polyline {
    const poly = new Polyline(this.getCorners());
    poly.makeClosed();
    return poly;
  }

  /**
   * Returns a copy of the BoundingBox transformed in specified way.
   * Note: BoundingBox extends [[transformable]] and also be directly transformed using those methods
   *
   * ### Example
   * ```js
   * const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
   * console.log(bb.area);
   * // => 200
   *
   * const scaled = bb.transform(Transform.scale(2));
   * console.log(scaled.area);
   * // => 800
   *
   * // Direct method
   * const otherScaled = bb.scale(2);
   * console.log(otherScaled.area);
   * // => 800
   * ```
   *
   * @param change  A [[transform]] matrix to apply to the BoundingBox
   */
  // @ts-ignore - I don't know why returning 'this' throws an error
  public transform(change: Transform): BoundingBox {
    const corners = change.transform(this.getCorners());
    return BoundingBox.fromPoints(corners);
  }

  /**
   * Returns a copy of the BoundingBox with a different xRange
   * @param newXRange The xRagne of the new BoundingBox
   */
  public withXRange(newXRange: IntervalSorted): BoundingBox {
    return new BoundingBox(newXRange, this._yRange);
  }

  /**
   * Returns a copy of the BoundingBox with a different yRange
   * @param newYRange The yRange of the new BoundingBox
   */
  public withYRange(newYRange: IntervalSorted): BoundingBox {
    return new BoundingBox(this._xRange, newYRange);
  }
}
