import { BoundingBox } from './boundingBox';
import { Interval } from './interval';
import { IntervalSorted } from './intervalSorted';
import { Line } from './line';
import { Plane } from './plane';
import { Point } from './point';
import { Polyline } from './polyline';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { Vector } from './vector';

export class Rectangle {
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

  constructor(plane: Plane, x: number, y: number);
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
   * @param minX  If true, point will be at the min x value. If false, will be at max.
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
   * Returns an array of the Rectangle's four corners.
   * Order is: [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
   */
  public getCorners(): readonly Point[] {
    return [
      this._plane.pointAt(this._x.min, this._y.min),
      this._plane.pointAt(this._x.max, this._y.min),
      this._plane.pointAt(this._x.max, this._y.max),
      this._plane.pointAt(this._x.min, this._y.max)
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

  public toString(): string {
    return (
      '[' + this._plane.toString() + ',' + this.widthX + ',' + this.widthY + ']'
    );
  }

  public toPolyline(): Polyline {
    const poly = new Polyline(this.getCorners());
    poly.makeClosed();
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

  /**
   * Returns a copy of the BoundingBox transformed by a [[transform]] matrix.
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
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the BoundingBox
   */
  public transform(change: Transform): Rectangle {
    const cornerA = change.transformPoint(this.corner(true, true));
    const cornerB = change.transformPoint(this.corner(false, false));
    const plane = this._plane.transform(change);
    return Rectangle.fromCorners(cornerA, cornerB, plane);
  }

  /**
   * Returns a rotated copy of the BoundingBox
   * @param angle   Angle to rotate the BoundingBox in radians.
   * @param pivot   Point to pivot the BoundingBox about. Defaults to 0,0.
   */
  public rotate(angle: number, pivot?: Point | undefined): Rectangle {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the BoundingBox
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   */
  public scale(x: number, y?: number, center?: Point): Rectangle {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the BoundingBox transferred from one coordinate system to another.
   * @param planeFrom   The plane the BoundingBox is currently in.
   * @param planeTo     The plane the BoundingBox will move to.
   * @returns           A copy of the BoundingBox in the same relative position on [[planeTo]] as it was on [[planeFrom]].
   */
  public changeBasis(planeFrom: Plane, planeTo: Plane): Rectangle {
    const tran = Transform.changeBasis(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a translated copy of the BoundingBox
   * @param move      Direction to move the BoundingBox.
   * @param distance  Distance to move the BoundingBox. If not specified, will use length of move vector.
   */
  public translate(move: Vector, distance?: number | undefined): Rectangle {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);
  }
}
