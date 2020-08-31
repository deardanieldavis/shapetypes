// tslint:disable:readonly-array
// tslint:disable:no-let

import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';
import { Line } from './line';
import { Point } from './point';
import { Polyline } from './polyline';
import { Transform } from './transform';

/**
 * A BoundingBox is a rectangle aligned to the X-Y axis. It is defined by two intervals, which give the dimensions of the rectangle along the x and y axis.
 *
 * ### Example
 * ```js
 * import { BoundingBox } from 'shapetypes'
 *
 * TODO:
 * const interval = new Interval(5, 10);
 * console.log(interval.length);
 * // => 5
 * console.log(interval.mid);
 * // => 7.5
 * console.log(interval.contains(8));
 * // => True
 * console.log(interval.isIncreasing);
 * // => True
 *
 * const interval = new Interval(10, 5);
 * console.log(interval.length);
 * // => -5
 * console.log(interval.contains(8));
 * // => True
 * console.log(interval.isIncreasing);
 * // => False
 * ```
 */

export class BoundingBox {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a new BoundingBox from two corner points.
   * @param cornerA One of the corner points
   * @param cornerB The corner diagonally opposite [[cornerA]]
   */
  public static fromCorners(cornerA: Point, cornerB: Point): BoundingBox {
    const xRange = new IntervalSorted(cornerA.x, cornerB.x);
    const yRange = new IntervalSorted(cornerA.y, cornerB.y);
    return new BoundingBox(xRange, yRange);
  }

  /**
   * Creates the smallest BoundingBox that encapsulates all the points.
   * @param points  List of points to encapsulate in bounding box.
   */
  public static fromPoints(points: readonly Point[]): BoundingBox {
    const x: number[] = new Array<number>(points.length);
    const y: number[] = new Array<number>(points.length);

    for (let i = 0; i < points.length; i++) {
      x[i] = points[i].x;
      y[i] = points[i].y;
    }

    const xRange = IntervalSorted.fromValues(x);
    const yRange = IntervalSorted.fromValues(y);

    return new BoundingBox(xRange, yRange);
  }

  /**
   * Creates a new BoundingBox by copying an existing one.
   * @param boundingBox
   */
  public static fromExisting(boundingBox: BoundingBox): BoundingBox {
    return new BoundingBox(IntervalSorted.fromExisting(boundingBox._xRange), IntervalSorted.fromExisting(boundingBox._yRange));
  }

  /**
   * Creates a new BoundingBox that encapsulates these two BoundingBoxes.
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
   * Calculates overlap between two BoundingBoxes.
   * @param a First BoundingBox to intersect
   * @param b Second BoundingBox to intersect
   * @returns: A BoundingBox representing the overlap between these two boxes. If no overlap exists, returns undefined.
   */
  public static intersection(a: BoundingBox, b: BoundingBox): BoundingBox | undefined {
    const xRange = IntervalSorted.intersection(a._xRange, b._xRange);
    if(xRange === undefined) {
      return undefined
    }

    const yRange = IntervalSorted.intersection(a._yRange, b._yRange);
    if(yRange === undefined) {
      return undefined
    }

    return new BoundingBox(xRange, yRange);
  }

  // -----------------------
  // VARS
  // -----------------------

  private _xRange: IntervalSorted;
  private _yRange: IntervalSorted;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * A BoundingBox is a rectangle aligned to the X-Y axis.
   * @param xRange: The dimensions of the BoundingBox along the x-axis. Eg. the box will be drawn from xRange.min to xRange.max.
   * @param yRange: The dimensions of the BoundingBox along the y-axis.
   */
  constructor(xRange: IntervalSorted | Interval, yRange: IntervalSorted | Interval) {
    // tslint:disable-next-line:prefer-conditional-expression
    if(xRange instanceof Interval) {
      this._xRange = IntervalSorted.fromExisting(xRange);
    } else {
      this._xRange = xRange;
    }

    // tslint:disable-next-line:prefer-conditional-expression
    if(yRange instanceof Interval) {
      this._yRange = IntervalSorted.fromExisting(yRange);
    } else {
      this._yRange = yRange;
    }
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * The area of the BoundingBox.
   */
  get area(): number {
    return this._xRange.length * this._yRange.length;
  }

  /**
   * The point in the center of the BoundingBox.
   */
  get center(): Point {
    return new Point(this._xRange.mid, this._yRange.mid);
  }

  /**
   * The corner of the BoundingBox that has the smallest x and y values.
   */
  get min(): Point {
    return new Point(this._xRange.min, this._yRange.min);
  }

  /**
   * The corner of the BoundingBox that has the largest x and y values.
   */
  get max(): Point {
    return new Point(this._xRange.max, this._yRange.max);
  }

  /**
   * The dimension of the BoundingBox along the x-axis.
   */
  get xRange(): IntervalSorted {
    return this._xRange;
  }
  set xRange(value: IntervalSorted) {
    this._xRange = value;
  }

  /**
   * The dimension of the BoundingBox along the y-axis.
   */
  get yRange(): IntervalSorted {
    return this._yRange;
  }
  set yRange(value: IntervalSorted) {
    this._yRange = value;
  }





  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Gets the closest point on the BoundingBox relative to given point.
   * @param point Will find the point on the BoundingBox that is closest to this point.
   * @param includeInterior If true, the closest point can be within the BoundingBox. If false, the closest point can only be on the BoundingBox's outer edge.
   */
  public closestPoint(point: Point, includeInterior: boolean = true): Point {
    if(includeInterior) {
      if(this.contains(point)) {
        return point;
      }
    }
    return this.toPolyline().closestPoint(point);
  }

  /**
   * True if the point is within the BoundingBox.
   * @param point Point to test for containment
   * @param strict  If true, points coincident with the edge of the box won't be counted as contained
   */
  public contains(point: Point, strict: boolean = false): boolean {
    if (this._xRange.contains(point.x, strict)) {
      if (this._yRange.contains(point.y, strict)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets one of the four corner points of the BoundingBox.
   * @param minX  If true, point will be at the min x value. If false, will be at max.
   * @param minY  If true, point will be at the min y value. If false, will be at max.
   */
  public corner(minX: boolean, minY: boolean): Point {
    if(minX) {
      if(minY) {
        return new Point(this._xRange.min, this._yRange.min);
      } else {
        return new Point(this._xRange.min, this._yRange.max);
      }
    }else {
      if(minY) {
        return new Point(this._xRange.max, this._yRange.min);
      } else {
        return new Point(this._xRange.max, this._yRange.max);
      }
    }
  }

  /**
   * Gets the four corners of the BoundingBox.
   * Order is: [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
   */
  public getCorners(): Point[] {
    return [ new Point(this._xRange.min, this._yRange.min),
      new Point(this._xRange.max, this._yRange.min),
      new Point(this._xRange.max, this._yRange.max),
      new Point(this._xRange.min, this._yRange.max)
    ];
  }

  /**
   * Gets the four edges of the BoundingBox.
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
   * Evenly increases the size of the BoundingBox in all directions.
   * @param amount
   */
  public inflate(amount: number): void
  // tslint:disable-next-line:unified-signatures
  public inflate(amountX: number, amountY: number): void
  public inflate(amount: number, amountY?: number): void {
    this._xRange.inflate(amount);

    if(amountY === undefined) {
      this._yRange.inflate(amount);
    } else {
      this._yRange.inflate(amountY);
    }
  }

  /**
   * Gets point at a normalized distance along the x-y axis of the BoundingBox.
   * @param u   Normalized distance along x-axis of BoundingBox. A number between 0 & 1.
   * @param v   Normalized distance along y-axis of BoundingBox. A number between 0 & 1.
   */
  public pointAt(u: number, v: number): Point {
    return new Point(this._xRange.valueAt(u), this._yRange.valueAt(v));
  }

  /**
   * Converts a point to the uv space of the BoundingBox. This is the opposite of [[pointAt]].
   * @param point Point to remap
   */
  public remapToBox(point: Point): { u: number; v: number } {
    return {u: this._xRange.remapToInterval(point.x), v: this._yRange.remapToInterval(point.y)};
  }

  /**
   * Converts the edge of the BoundingBox to a Polyline.
   */
  public toPolyline(): Polyline {
    const poly = new Polyline(this.getCorners());
    poly.makeClosed();
    return poly;
  }

  /**
   * Transforms the BoundingBox.
   * If the transformation involves a rotation, the BoundingBox will stay aligned to the x-y axis and will be the smallest bounding box that encapsulates the rotated corners of the old box.
   * @param change
   */
  public transform(change: Transform): void {
    const corners = change.transform(this.getCorners());
    const bb = BoundingBox.fromPoints(corners);
    this._xRange = bb._xRange;
    this._yRange = bb._yRange;
  }


}
