import {
  Geometry,
  Point,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * A Plane is a 2d frame with a center point ([[origin]]) and two perpendicular axes ([[xAxis]] and [[yAxis]]).
 *
 * ### Example
 * ```js
 * import { Plane } from 'shapetypes'
 *
 * const plane = new Plane(new Point(3,4), Vector.worldX());
 * const worldPoint = plane.pointAt(2,2);
 * console.log(worldPoint.toString());
 * // => [5,6]
 *
 * const planePoint = plane.remapToPlaneSpace(worldPoint);
 * console.log(planePoint.toString());
 * // => [2,2]
 * ```
 */
export class Plane extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns the world's base plane. This plane has an [[origin]] of [0,0], an [[xAxis]] of [1,0], and a [[yAxis]] of [0,1].
   * @category Create
   */
  public static worldXY(): Plane {
    return Plane._worldXY;
  }

  /**
   * Returns a new plane centered on the `origin` point and with the [[xAxis]] aligned to `axisPoint`.
   * @category Create
   * @param origin      The center of the plane.
   * @param axisPoint   A point on the xAxis.
   */
  public static fromPoints(origin: Point, axisPoint: Point): Plane {
    const axis = Vector.fromPoints(origin, axisPoint);
    return new Plane(origin, axis);
  }

  // -----------------------
  // VARS
  // -----------------------

  private static readonly _worldXY: Plane = new Plane(
    Point.origin(),
    Vector.worldX()
  );

  private readonly _origin: Point;
  private readonly _xAxis: Vector;

  private _cacheYAxis: Vector | undefined;
  private _cacheRemap: Transform | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * Creates a plane from a center point and x-axis.
   * @param origin    The center of the plane.
   * @param xAxis     The direction of the [[xAxis]]. If not specified, will use [[Vector.worldX]]. The yAxis will be automatically generated perpendicular to this axis.
   */
  constructor(origin: Point, xAxis?: Vector) {
    super();
    this._origin = origin;
    this._xAxis = xAxis === undefined ? Vector.worldX() : xAxis.unitize();
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * Returns the point at the center of this plane.
   */
  get origin(): Point {
    return this._origin;
  }

  /**
   * Returns the vector representing the direction of the plane's xAxis.
   */
  get xAxis(): Vector {
    return this._xAxis;
  }

  /**
   * Returns the vector representing the direction of the plane's yAxis.
   * This vector will always be perpendicular to the plane's [[xAxis]].
   * If [[shapetypesSettings.invertY]] is true, the yAxis will be on right side of the xAxis.
   * If [[shapetypesSettings.invertY]] is false, the yAxis will be on the left side of the xAxis.
   */
  get yAxis(): Vector {
    // We don't always need the yAxis, so it isn't generated in the constructor.
    // When this function is called, the first time, it generates the yAxis and caches it.
    if (this._cacheYAxis === undefined) {
      this._cacheYAxis = this._xAxis.perpendicular();
    }
    return this._cacheYAxis;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Returns true if the other plane has the same [[origin]] and [[xAxis]].
   * @param plane       The plane to compare against.
   * @param tolerance   The amount the [[origin]] points can differ and to still be considered equal.
   */
  public equals(
    plane: Plane,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this.origin.equals(plane.origin, tolerance)) {
      if (this.xAxis.equals(plane.xAxis, shapetypesSettings.angleTolerance)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Remaps a point from the u-v space of the plane to the global coordinate system.
   * This is the opposite of [[remapToPlaneSpace]].
   *
   * ### Example
   * ```js
   * const plane = new Plane(new Point(3,4), Vector.worldX());
   * const worldPoint = plane.pointAt(2,2);
   * console.log(worldPoint.toString());
   * // => [5,6]
   *
   * const planePoint = plane.remapToPlaneSpace(worldPoint);
   * console.log(planePoint.toString());
   * // => [2,2]
   * ```
   *
   * @param u   The location of the point measured as a distance along the plane's [[xAxis]].
   * @param v   The location of the point measured as a distance along the plane's [[yAxis]].
   * @returns   The point at uv remapped to the global coordinate system.
   */
  public pointAt(u: number, v: number): Point;
  /**
   * Remaps a point from the u-v space of the plane to the global coordinate system.
   * This is the opposite of [[remapToPlaneSpace]].
   * @param uvPoint   The location of the point in the plane's coordinate system.
   *                  The x coordinate of this point is the location of the point measured as a distance along the plane's [[xAxis]].
   *                  The y coordinate of this point is the location of the point measured as a distance along the plane's [[yAxis]].
   * @returns         The point at uv remapped to the global coordinate system.
   */
  public pointAt(uvPoint: Point): Point;
  public pointAt(uvPointorU: Point | number, v?: number): Point {
    // Sort out what inputs we were given
    const realU = uvPointorU instanceof Point ? uvPointorU.x : uvPointorU;
    const realV = uvPointorU instanceof Point ? uvPointorU.y : v;
    if (realV === undefined) {
      /* istanbul ignore next */
      throw new Error("Shouldn't be possible");
    }

    // equals: origin + xAxis * u + yAxis * v
    // Can assume that the xAxis and yAxis will always be a unit vector
    const x = this.origin.x + this._xAxis.x * realU + this.yAxis.x * realV;
    const y = this.origin.y + this._xAxis.y * realU + this.yAxis.y * realV;
    return new Point(x, y);

    /*
    Can also do this by inverting the remap matrix. But this doesn't seem efficient
    since you need to generate the matrix and then run the inversion calculation.

    if(uvPointorU instanceof Point) {
      return this.getRemapInvert().transformPoint(uvPointorU);
    }
    if(v === undefined) {
      throw new Error("Shouldn't be possible");
    }
    return this.getRemapInvert().transformPoint(new Point(uvPointorU, v));*/
  }

  /**
   * Remaps a point to the u-v space of the plane.
   * This is the opposite of [[pointAt]].
   * @param point   Point to remap.
   * @returns       A point in the u-v coordinates of the plane. See [[pointAt]] for more details.
   */
  public remapToPlaneSpace(point: Point): Point {
    return this.getRemapTransform().transformPoint(point);
  }

  /**
   * Returns a copy of this plane with a different [[origin]] point.
   * @param newOrigin   The origin point of the new plane.
   */
  public withOrigin(newOrigin: Point): Plane {
    return new Plane(newOrigin, this._xAxis);
  }

  /**
   * Returns a copy of this plane with a different [[xAxis]].
   * @param newXAxis    The xAxis of the new plane.
   */
  public withXAxis(newXAxis: Vector): Plane {
    return new Plane(this._origin, newXAxis);
  }

  /***
   * Returns the plane as a string in the format: `[origin,xAxis]`.
   */
  public toString(): string {
    return '[' + this._origin.toString() + ',' + this._xAxis.toString() + ']';
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Returns a copy of the plane transformed by a [[Transform]] matrix.
   *
   * ### Example
   * ```js
   * const plane = new Plane(new Point(2,2), Vector.worldX());
   * console.log(plane.origin.toString());
   * // => (2,2)
   *
   * // Using a transform matrix
   * const mover = Tranform.translate(new Vector(3,4));
   * const moved = plane.transform(mover);
   * console.log(moved.origin.toString());
   * // => (5,6)
   *
   * // The direct method
   * const otherMoved = plane.translate(new Vector(3,4));
   * console.log(otherMoved.origin.toString);
   * // => (5,6)
   * ```
   *
   * @note  Note: If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the plane.
   */
  public transform(change: Transform): this {
    const origin = change.transformPoint(this._origin);
    const axis = change.transformVector(this._xAxis);
    // @ts-ignore
    return new Plane(origin, axis);
  }

  // -----------------------
  // PRIVATE
  // -----------------------

  private getRemapTransform(): Transform {
    if (this._cacheRemap === undefined) {
      this._cacheRemap = Transform.changeBasis(Plane.worldXY(), this);
    }
    return this._cacheRemap;
  }
}
