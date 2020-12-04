import {
  BoundingBox,
  Geometry,
  Interval,
  IntervalSorted,
  Line,
  Plane,
  Point,
  Polyline,
  shapetypesSettings,
  Transform
} from '../index';

export class Rectangle extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   *
   * @category Create
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
   *
   * @category Create
   */
  public static fromCenter(center: Plane, x: number, y: number): Rectangle {
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
   * @param plane   Position of rectangle's center and axes.
   * @param x       Width of rectangle along x-axis of plane.
   * @param y       Width of rectangle along y-axis of plane.
   */
  constructor(plane: Plane, x: number, y: number);
  /**
   * Creates a new rectangle on a plane.
   * @param plane   The coordinate system to generate rectangle relative to.
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

  get area(): number {
    return this._x.length * this._y.length;
  }

  /***
   * Gets the smallest bounding box that contains the rectangle.
   */
  get boundingBox(): BoundingBox {
    return BoundingBox.fromPoints(this.getCorners());
  }

  get center(): Point {
    return this._plane.pointAt(this._x.mid, this._y.mid);
  }

  get circumference(): number {
    return this._x.length * 2 + this._y.length * 2;
  }

  get plane(): Plane {
    return this._plane;
  }

  get widthX(): number {
    return this._x.length;
  }
  get widthY(): number {
    return this._y.length;
  }

  get x(): IntervalSorted {
    return this._x;
  }

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

  public contains(testPoint: Point, strict: boolean = false): boolean {
    const planePoint = this._plane.remapToPlaneSpace(testPoint);
    if (this._x.contains(planePoint.x, strict)) {
      if (this._y.contains(planePoint.y, strict)) {
        return true;
      }
    }
    return false;
  }

  /**
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
   * @param tolerance         The amount the locations can differ and still be considered equal.
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

  /**
   * Returns the four corners of the rectangle.
   * The order will always be: [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]].
   * If the y-axis is pointing up, this is a clockwise order. And if the y-axis is pointing down, this is an anti-clockwise order.
   */
  public getCorners(): readonly Point[] {
    return [
      this._plane.pointAt(this._x.min, this._y.min),
      this._plane.pointAt(this._x.min, this._y.max),
      this._plane.pointAt(this._x.max, this._y.max),
      this._plane.pointAt(this._x.max, this._y.min)
    ];
  }

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
   * Remaps a point from the u-v space of the BoundingBox to the global coordinate system.
   * This is the opposite of [[remapToBox]].
   * @param u         The normalized distance along the x-axis of the BoundingBox
   * @param v         The normalized distance along the y-axis of the BoundingBox
   * @returns         The uvPoint remapped to the global coordinate system
   */
  public pointAt(u: number, v: number): Point;
  /**
   * Remaps a point from the u-v space of the BoundingBox to the global coordinate system.
   * This is the opposite of [[remapToBox]].
   * @param uvPoint   A point in the u-v coordinates of the BoundingBox.
   *                  The point's x value is the normalized distance along the x-axis of the BoundingBox (u direction).
   *                  The point's y value is the normalized distance along the y-axis of the BoundingBox (y direction).
   * @returns         The uvPoint remapped to the global coordinate system
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

  public toPolyline(): Polyline {
    const poly = new Polyline(this.getCorners(), true);
    return poly;
  }

  public withPlane(newPlane: Plane): Rectangle {
    return new Rectangle(newPlane, this._x, this._y);
  }

  public withX(newX: IntervalSorted): Rectangle {
    return new Rectangle(this._plane, newX, this._y);
  }

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
