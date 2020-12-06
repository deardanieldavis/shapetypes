import {
  BoundingBox,
  Geometry,
  Interval,
  IntervalSorted,
  Line,
  Plane,
  Point,
  PointContainment,
  Polyline,
  shapetypesSettings,
  Transform
} from '../index';

/**
 * A rectangular shape aligned to a plane.
 *
 * ### Example
 * ```js
 * import { Rectangle } from 'shapetypes'
 *
 * const rect = new Rectangle(Plane.worldXY(), 10, 20);
 * console.log(rect.area);
 * // => 200
 * console.log(rect.circumference);
 * // => 60
 * console.log(rect.center);
 * // => (0,0)
 *
 * const plane = new Plane(new Point(3,4), new Vector(1,1));
 * const angledRect = new Rectangle(plane, 10, 20);
 *  * console.log(rect.area);
 * // => 200
 * console.log(rect.circumference);
 * // => 60
 * console.log(rect.center);
 * // => (3,4)
 * ```
 */
export class Rectangle extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a rectangle from two corner points.
   * @category Create
   * @param cornerA   One corner of the rectangle.
   * @param cornerB   The opposite corner of the rectangle.
   * @param plane     The plane the rectangle is orientated to.
   *                  If unset, the rectangle will be aligned to the global xy axis.
   */
  public static fromCorners(
    cornerA: Point,
    cornerB: Point,
    plane: Plane = Plane.worldXY()
  ): Rectangle {
    const a = plane.remapToPlaneSpace(cornerA);
    const b = plane.remapToPlaneSpace(cornerB);
    const x = new IntervalSorted(a.x, b.x);
    const y = new IntervalSorted(a.y, b.y);
    return new Rectangle(plane, x, y);
  }

  /**
   * Creates a rectangle aligned to a plane. One corner of the rectangle will
   * sit on the plane's origin with the rest of the rectangle growing along the
   * plane's axes from that point.
   *
   * @category Create
   * @param x   The width of the rectangle along the plane's x-axis.
   * @param y   The width of the rectangle along the plane's y-axis.
   * @param center  The plane the rectangle is aligned to. The plane's origin will be one corner of the rectangle
   *                with the rest of the rectangle growing from that point.
   */
  public static fromCorner(center: Plane, x: number, y: number): Rectangle {
    return new Rectangle(
      center,
      IntervalSorted.fromCenter(0, x),
      IntervalSorted.fromCenter(0, y)
    );
  }

  // -----------------------
  // VARS
  // -----------------------
  private readonly _plane: Plane;
  private readonly _x: IntervalSorted;
  private readonly _y: IntervalSorted;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * Creates a rectangle centered and aligned to a plane.
   * @param plane   The position of rectangle's center and axes.
   * @param x       Width of rectangle along x-axis of plane (rectangle will be centered on the plane's origin).
   * @param y       Width of rectangle along y-axis of plane (rectangle will be centered on the plane's origin).
   */
  constructor(plane: Plane, x: number, y: number);
  /**
   * Creates a new rectangle on a plane.
   * @param plane   The position of rectangle and its axes.
   * @param x       Position of rectangle along x-axis of plane.
   * @param y       Position of rectangle along y-axis of plane.
   */
  constructor(
    plane: Plane,
    x: Interval | IntervalSorted,
    y: Interval | IntervalSorted
  );
  constructor(
    plane: Plane,
    x: Interval | IntervalSorted | number,
    y: Interval | IntervalSorted | number
  ) {
    super();
    this._plane = plane;

    if (x instanceof Interval) {
      this._x = x.asSorted();
    } else if (x instanceof IntervalSorted) {
      this._x = x;
    } else {
      this._x = new IntervalSorted(0, x);
    }

    if (y instanceof Interval) {
      this._y = y.asSorted();
    } else if (y instanceof IntervalSorted) {
      this._y = y;
    } else {
      this._y = new IntervalSorted(0, y);
    }
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Gets the area of the rectangle.
   */
  get area(): number {
    return this._x.length * this._y.length;
  }

  /***
   * Gets the smallest bounding box that contains the rectangle.
   */
  get boundingBox(): BoundingBox {
    return BoundingBox.fromPoints(this.getCorners());
  }

  /**
   * Gets the center of the rectangle.
   */
  get center(): Point {
    return this._plane.pointAt(this._x.mid, this._y.mid);
  }

  /**
   * Gets the total length of the rectangle's edges.
   */
  get circumference(): number {
    return this._x.length * 2 + this._y.length * 2;
  }

  /**
   * Gets the plane the rectangle is aligned to.
   *
   * Depending on how the rectangle is positioned on this plane
   * (using the intervals [[x]] and [[y]]), the plane's origin may or may not be
   * a corner or center of the rectangle.
   */
  get plane(): Plane {
    return this._plane;
  }

  /**
   * Gets the width of the rectangle along its x-axis.
   */
  get widthX(): number {
    return this._x.length;
  }

  /**
   * Gets the width of the rectangle along its y-axis.
   */
  get widthY(): number {
    return this._y.length;
  }

  /**
   * Gets the position of the rectangle relative to the [[plane]]'s x-axis.
   */
  get x(): IntervalSorted {
    return this._x;
  }

  /**
   * Gets the position of the rectangle relative to the [[plane]]'s y-axis.
   */
  get y(): IntervalSorted {
    return this._y;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Finds the closest point on the rectangle and returns the point.
   * @param testPoint       The target to get closest to.
   * @param includeInterior If false, the closest point must lie on the outer edge of the rectangle.
   *                        If true, the closest point can also be a point on the interior of the rectangle.
   */
  public closestPoint(
    testPoint: Point,
    includeInterior: boolean = false
  ): Point {
    if (includeInterior) {
      if (this.contains(testPoint)) {
        return testPoint;
      }
    }
    return this.toPolyline().closestPoint(testPoint);
  }

  /***
   * Checks whether a point is inside, outside, or on the edge of a rectangle.
   *
   * @param testPoint   The point to test for containment.
   * @param tolerance   The distance the point can be from the edge of the rectangle and still considered coincident.
   */
  public contains(testPoint: Point, tolerance = shapetypesSettings.absoluteTolerance): PointContainment {
    const planePoint = this._plane.remapToPlaneSpace(testPoint);

    const x = this._x.containsPoint(planePoint.x, tolerance);
    const y = this._y.containsPoint(planePoint.y, tolerance);

    if(x === PointContainment.coincident) {
      if(y === PointContainment.inside || y === PointContainment.coincident) {
        return PointContainment.coincident;
      }
    }

    if(y === PointContainment.coincident) {
      if(x === PointContainment.inside || x === PointContainment.coincident) {
        return PointContainment.coincident;
      }
    }

    if(x === PointContainment.inside && y === PointContainment.inside) {
      return PointContainment.inside;
    }
    return PointContainment.outside;
  }

  /**
   * Gets a corner of the rectangle.
   *
   * @param minX  If true, point will be at the min x value relative to recatngle's plane. If false, will be at max.
   * @param minY  If true, point will be at the min y value. If false, will be at max.
   */
  public corner(minX: boolean, minY: boolean): Point {
    if (minX) {
      if (minY) {
        return this._plane.pointAt(this._x.min, this._y.min);
      } else {
        return this._plane.pointAt(this._x.min, this._y.max);
      }
    } else {
      if (minY) {
        return this._plane.pointAt(this._x.max, this._y.min);
      } else {
        return this._plane.pointAt(this._x.max, this._y.max);
      }
    }
  }

  /***
   * Checks whether another rectangle has the same dimensions and location. Returns true if it does.
   * @param otherRectangle    Rectangle to compare against.
   * @param tolerance         The amount the dimensions can differ and still be considered equal.
   */
  public equals(
    otherRectangle: Rectangle,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this._plane.equals(otherRectangle.plane, tolerance)) {
      if (this._x.equals(otherRectangle.x)) {
        if (this._y.equals(otherRectangle.y)) {
          return true;
        }
      }
    }
    return false;
  }

  /***
   * Gets the four corners of the rectangle.
   * The order is: [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]].
   */
  public getCorners(): readonly Point[] {
    return [
      this._plane.pointAt(this._x.min, this._y.min),
      this._plane.pointAt(this._x.min, this._y.max),
      this._plane.pointAt(this._x.max, this._y.max),
      this._plane.pointAt(this._x.max, this._y.min)
    ];
  }

  /**
   * Gets the four edges of the rectangle. Follows the order in [[getCorners]].
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

  /***
   * Remaps a point from the u-v space of the rectangle to the global coordinate system.
   * @param u         The normalized distance along the x-axis of the rectangle.
   * @param v         The normalized distance along the y-axis of the rectangle.
   * @returns         The uvPoint remapped to the global coordinate system.
   */
  public pointAt(u: number, v: number): Point;
  /**
   * Remaps a point from the u-v space of the rectangle to the global coordinate system.
   * @param uvPoint   A point in the u-v coordinates of the rectangle.
   *                  The point's x value is the normalized distance along the x-axis of the rectangle (u direction).
   *                  The point's y value is the normalized distance along the y-axis of the rectangle (y direction).
   * @returns         The uvPoint remapped to the global coordinate system.
   */
  public pointAt(uvPoint: Point): Point;
  public pointAt(uvPointorU: Point | number, v?: number): Point {
    if (uvPointorU instanceof Point) {
      return this._plane.pointAt(
        this._x.valueAt(uvPointorU.x),
        this._y.valueAt(uvPointorU.y)
      );
    }
    if (v === undefined) {
      /* istanbul ignore next */
      throw new Error("Shouldn't be possible");
    }
    return this._plane.pointAt(this._x.valueAt(uvPointorU), this._y.valueAt(v));
  }

  /***
   * Gets the rectangle as a string in the format: `[plane,widthX,widthY]`.
   */
  public toString(): string {
    return (
      '[' + this._plane.toString() + ',' + this.widthX + ',' + this.widthY + ']'
    );
  }

  /***
   * Gets the rectangle as a closed polyline.
   */
  public toPolyline(): Polyline {
    const poly = new Polyline(this.getCorners(), true);
    return poly;
  }

  /**
   * Creates a copy of the rectangle with a different [[plane]].
   *
   * @param newPlane    The new plane for the rectangle. This will change the rectangle's location and orientation.
   */
  public withPlane(newPlane: Plane): Rectangle {
    return new Rectangle(newPlane, this._x, this._y);
  }

  /**
   * Creates a copy of the rectangle with a different [[x]] interval.
   * @param newX    The new position of the rectangle along the x-axis of the plane.
   */
  public withX(newX: IntervalSorted): Rectangle {
    return new Rectangle(this._plane, newX, this._y);
  }

  /**
   * Creates a copy of the rectangle with a different [[y]] interval.
   * @param newY    The new position of the rectangle along the y-axis of the plane.
   */
  public withY(newY: IntervalSorted): Rectangle {
    return new Rectangle(this._plane, this._x, newY);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Transforms the rectangle by a [[transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   * const rect = new Rectangle(Plane.worldXY(), 10, 20);
   * console.log(rect.area);
   * // => 200
   *
   * // Using a transform matrix
   * const matrix = Transform.scale(2);
   * const scaled = rect.transform(matrix);
   * console.log(scaled.area);
   * // => 800
   *
   * // Using a direct method
   * const otherScaled = rect.scale(2);
   * console.log(otherScaled.area);
   * // => 800
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the rectangle.
   */
  public transform(change: Transform): this {
    const cornerA = change.transformPoint(this.corner(true, true));
    const cornerB = change.transformPoint(this.corner(false, false));
    const plane = this._plane.transform(change);
    // @ts-ignore
    return Rectangle.fromCorners(cornerA, cornerB, plane);
  }
}
