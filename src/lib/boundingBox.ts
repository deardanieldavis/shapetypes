import {
  Geometry,
  Interval,
  IntervalSorted,
  Line,
  Point,
  Polyline,
  shapetypesSettings,
  Transform
} from '../index';

/**
 * A rectangle aligned to the environment's x- and y-axis ([[Vector.xAxis]].
 * A bounding box is defined by two [[IntervalSorted]]s, which give the dimensions of the rectangle along the x- and y-axis.
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

export class BoundingBox extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a bounding box from two corner points.
   * @category Create
   * @param cornerA One corner of the bounding box.
   * @param cornerB The opposite corner of the bounding box.
   */
  public static fromCorners(cornerA: Point, cornerB: Point): BoundingBox {
    const xRange = new IntervalSorted(cornerA.x, cornerB.x);
    const yRange = new IntervalSorted(cornerA.y, cornerB.y);
    return new BoundingBox(xRange, yRange);
  }

  /**
   * Returns the smallest bounding box that contains all the points.
   * @category Create
   * @param points  The points to encapsulate in a bounding box.
   */
  public static fromPoints(points: readonly Point[]): BoundingBox {
    const x = points.map(item => item.x); // gets all x locations of points
    const y = points.map(item => item.y);

    const xRange = IntervalSorted.fromValues(x);
    const yRange = IntervalSorted.fromValues(y);

    return new BoundingBox(xRange, yRange);
  }

  /**
   * Returns the smallest bounding box that contains two other bounding boxes.
   * @category Create
   * @param a   The first bounding box to encapsulate.
   * @param b   The second bounding box to encapsulate.
   */
  public static union(a: BoundingBox, b: BoundingBox): BoundingBox {
    const xRange = IntervalSorted.union(a._xRange, b._xRange);
    const yRange = IntervalSorted.union(a._yRange, b._yRange);
    return new BoundingBox(xRange, yRange);
  }

  /**
   * Finds the overlapping portion of two bounding boxes and returns it as a new bounding box.
   * @category Create
   * @param a   The first bounding box to intersect
   * @param b   The second bounding box to intersect
   * @returns: A bounding box representing the overlap between these two boxes. If no overlap exists, returns undefined.
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
   * Create a bounding box from two intervals.
   * @param xRange  The dimensions of the bounding box along the environment's x-axis ([[Vector.xAxis]]). The box will be from xRange.min to xRange.max.
   * @param yRange  The dimensions of the bounding box along the environment's y-axis.
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
   * Gets the area of the bounding box.
   */
  get area(): number {
    return this._xRange.length * this._yRange.length;
  }

  /**
   * Gets the point at the center of the bounding box.
   */
  get center(): Point {
    return new Point(this._xRange.mid, this._yRange.mid);
  }

  /**
   * Gets the corner of the bounding box that has the smallest x and y values.
   */
  get min(): Point {
    return new Point(this._xRange.min, this._yRange.min);
  }

  /**
   * Gets the corner of the bounding box that has the largest x and y values.
   */
  get max(): Point {
    return new Point(this._xRange.max, this._yRange.max);
  }

  /**
   * Gets the position of the bounding box along the environment's x-axis ([[Vector.xAxis]]).
   */
  get xRange(): IntervalSorted {
    return this._xRange;
  }

  /**
   * Gets the position of the bounding box along the environment's x-axis ([[Vector.xAxis]]).
   */
  get yRange(): IntervalSorted {
    return this._yRange;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Finds the closest point on the bounding box and returns the point.
   * @param testPoint       Target to get closest to.
   * @param includeInterior If true, the closest point can be within the bounding box. If false, the closest point can only be on the bounding box's outer edge.
   */
  public closestPoint(
    testPoint: Point,
    includeInterior: boolean = true
  ): Point {
    const x = closestInterval(this._xRange, testPoint.x, includeInterior);
    const y = closestInterval(this._yRange, testPoint.y, includeInterior);

    // Workout if point is outside the bounding box, return nearest point on edge
    if (!x.contained && !y.contained) {
      return new Point(x.value, y.value);
    } else if (x.contained && !y.contained) {
      return new Point(testPoint.x, y.value);
    } else if (!x.contained && y.contained) {
      return new Point(x.value, testPoint.y);
    }

    // Point must be inside bounding box.
    if (includeInterior) {
      return testPoint;
    }

    // Since interior isn't included, find closest edge and move to it.
    const distanceX = Math.abs(testPoint.x - x.value);
    const distanceY = Math.abs(testPoint.y - y.value);
    if (distanceX < distanceY) {
      return new Point(x.value, testPoint.y);
    } else {
      return new Point(testPoint.x, y.value);
    }
  }

  /**
   * Checks whether a point is inside the bounding box.
   * @param testPoint   Point to test for containment
   * @param strict      If true, the point needs to be entirely inside the bounding box
   *                    and can't be coincident with the edge.
   * @param tolerance   The distance the point can be outside the box and still considered inside.
   */
  public contains(
    testPoint: Point,
    strict: boolean = false,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this._xRange.contains(testPoint.x, strict, tolerance)) {
      if (this._yRange.contains(testPoint.y, strict, tolerance)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets one of the bounding box's four corners.
   * @param minX  If true, point will be at the min x value. If false, it will be at max.
   * @param minY  If true, point will be at the min y value. If false, it will be at max.
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

  /***
   * Gets the four corners of the bounding box.
   * The order is: [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]].
   */
  public getCorners(): readonly Point[] {
    return [
      new Point(this._xRange.min, this._yRange.min),
      new Point(this._xRange.min, this._yRange.max),
      new Point(this._xRange.max, this._yRange.max),
      new Point(this._xRange.max, this._yRange.min)
    ];
  }

  /**
   * Gets the four edges of the bounding box. Follows the order in [[getCorners]].
   */
  public getEdges(): readonly Line[] {
    const corners = this.getCorners();
    return [
      new Line(corners[0], corners[1]),
      new Line(corners[1], corners[2]),
      new Line(corners[2], corners[3]),
      new Line(corners[3], corners[0])
    ];
  }

  /**
   * Evenly increases the size of the bounding box in all directions. Returns the enlarged bounding box.
   * @param amount  The amount to inflate each side of the bounding box.
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
   * Checks whether the bounding box overlaps another. Returns true if it does.
   * @param otherBox    The box to check for overlap.
   */
  public overlaps(otherBox: BoundingBox): boolean {
    const xRange = IntervalSorted.intersection(this._xRange, otherBox._xRange);
    if (xRange === undefined) {
      return false;
    }

    const yRange = IntervalSorted.intersection(this._yRange, otherBox._yRange);
    if (yRange === undefined) {
      return false;
    }

    return true;
  }

  /***
   * Remaps a point from the u-v space of the bounding box to the global coordinate system.
   * This is the opposite of [[remapToBox]].
   *
   * @param u         The normalized distance along the x-axis of the bounding box.
   * @param v         The normalized distance along the y-axis of the bounding box.
   * @returns         The uvPoint remapped to the global coordinate system.
   */
  public pointAt(u: number, v: number): Point;
  /**
   * Remaps a point from the u-v space of the bounding box to the global coordinate system.
   * This is the opposite of [[remapToBox]].
   * @param uvPoint   A point in the u-v coordinates of the bounding box.
   *                  The point's x value is the normalized distance along the x-axis of the bounding box (u-direction).
   *                  The point's y value is the normalized distance along the y-axis of the bounding box (v-direction).
   * @returns         The uvPoint remapped to the global coordinate system.
   */
  public pointAt(uvPoint: Point): Point;
  public pointAt(uvPointorU: Point | number, v?: number): Point {
    if (uvPointorU instanceof Point) {
      return new Point(
        this._xRange.valueAt(uvPointorU.x),
        this._yRange.valueAt(uvPointorU.y)
      );
    }
    if (v === undefined) {
      /* istanbul ignore next */
      throw new Error("Shouldn't be possible");
    }
    return new Point(this._xRange.valueAt(uvPointorU), this._yRange.valueAt(v));
  }

  /***
   * Remaps a point to the u-v space of the bounding box.
   * This is the opposite of [[pointAt]].
   * @param point   Point to remap.
   * @returns       A point in the u-v coordinates of the bounding box. See [[pointAt]] for more details.
   */
  public remapToBox(point: Point): Point {
    return new Point(
      this._xRange.remapToInterval(point.x),
      this._yRange.remapToInterval(point.y)
    );
  }

  /***
   * Checks whether another bounding box has the same [[xRange]] and [[yRange]]. Returns true if it does.
   * @param otherBoundingBox  The bounding box to compare against.
   */
  public equals(otherBoundingBox: BoundingBox): boolean {
    return (
      this._xRange.equals(otherBoundingBox._xRange) &&
      this._yRange.equals(otherBoundingBox._yRange)
    );
  }

  /***
   * Gets the edge of the bounding box as a closed polyline.
   */
  public toPolyline(): Polyline {
    const poly = new Polyline(this.getCorners(), true);
    return poly;
  }

  /***
   * Gets the bounding box as a string in the format: `[xRange,yRange]`.
   */
  public toString(): string {
    return '[' + this._xRange.toString() + ',' + this._yRange.toString() + ']';
  }

  /**
   * Creates a copy of the bounding box with a different [[xRange]].
   * @param newXRange The xRange of the new bounding box.
   */
  public withXRange(newXRange: IntervalSorted): BoundingBox {
    return new BoundingBox(newXRange, this._yRange);
  }

  /**
   * Creates a copy of the bounding box with a different [[yRange]].
   * @param newYRange The yRange of the new bounding box.
   */
  public withYRange(newYRange: IntervalSorted): BoundingBox {
    return new BoundingBox(this._xRange, newYRange);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Transforms the bounding box by a [[transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   * const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
   * console.log(bb.area);
   * // => 200
   *
   * // Using a transform matrix
   * const matrix = Transform.scale(2);
   * const scaled = bb.transform(matrix);
   * console.log(scaled.area);
   * // => 800
   *
   * // Using the direct method
   * const otherScaled = bb.scale(2);
   * console.log(otherScaled.area);
   * // => 800
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the bounding box.
   */
  public transform(change: Transform): this {
    const corners = change.transformPoints(this.getCorners());
    // @ts-ignore
    return BoundingBox.fromPoints(corners);
  }
}

/**
 * Returns the value in the interval that is nearest to `targetValue`.
 *
 * @ignore
 * @param interval        The interval to find the value within.
 * @param targetValue     The value to get nearest to.
 * @param includeInterior If false, the value will either be [[min]] or [[max]].
 *                        If true, the value may be any number between [[min]] and [[max]].
 */
function closestInterval(
  interval: IntervalSorted,
  targetValue: number,
  includeInterior: boolean = true
): { readonly value: number; readonly contained: boolean } {
  // Check to see if value is off ends
  if (targetValue <= interval.min) {
    return { value: interval.min, contained: false };
  } else if (interval.max <= targetValue) {
    return { value: interval.max, contained: false };
  }

  // Must be within the range
  if (includeInterior) {
    return { value: targetValue, contained: true };
  }

  const distanceToMin = targetValue - interval.min;
  const distanceToMax = interval.max - targetValue;
  if (distanceToMin < distanceToMax) {
    return { value: interval.min, contained: true };
  }
  return { value: interval.max, contained: true };
}
