import {
  BoundingBox,
  Circle,
  Geometry,
  Intersection,
  Line,
  Point,
  Polygon,
  Polyline,
  Rectangle, shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * Specifies a ray's range.
 * A ray can be limited to only shooting forwards (a range that is either [[positive]] or [[positiveAndZero]])
 * or the ray can shoot forwards and backwards (a range that is [[both]]).
 */
export enum RayRange {
  /** The ray shoots in one direction from the start point to infinity but doesn't include the start point.  */
  positive,

  /** The ray shoots in one direction from the start point to infinity and includes the start point.  */
  positiveAndZero,

  /** The ray shoots in two directions: from the start point to infinity, and in the opposite direction to negative infinity.  */
  both
}

/**
 * Returns true if a value is in the range specified.
 * @ignore
 */
export function inRayRange(distance: number, range: RayRange): boolean {
  if(range === RayRange.both) {
    return true;
  }else if(range === RayRange.positive) {
    if(distance > 0) {
      return true;
    }
  }else if(range === RayRange.positiveAndZero) {
    if(distance >= 0) {
      return true;
    }
  }
  return false;
}

/**
 * A ray is a line of infinite length. It has a start point ([[from]]) and a direction ([[direction]]) but no end point.
 *
 * ### Example
 * ```js
 * import { Ray } from 'shapetypes'
 *
 * const ray = new Ray(new Point(3,4), new Vector(1,0));
 * console.log(ray.from);
 * // -> [3,4]
 *
 * console.log(ray.direction);
 * // -> ⟨1,0⟩
 *
 * console.log(ray.pointAt(5));
 * // -> [8,4]
 *
 * console.log(ray.intersection(new Point(8,4)));
 * // -> [5]
 *
 * const transformed = ray.translate(new Vector(3,4));
 * console.log(transformed.from);
 * // => [6,8]
 * ```
 */
export class Ray extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a new ray that starts at `from` and continues through `pointOnRay`.
   * @category Create
   * @param from        The start of the ray.
   * @param pointOnRay  A point on the ray.
   */
  public static fromPoints(from: Point, pointOnRay: Point): Ray {
    const direction = Vector.fromPoints(from, pointOnRay);
    return new Ray(from, direction);
  }

  // -----------------------
  // VARS
  // -----------------------

  private readonly _from: Point;
  private readonly _direction: Vector;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * Creates a ray.
   * @param from        Location of the ray.
   * @param direction   Direction of the ray.
   */
  constructor(from: Point, direction: Vector) {
    super();
    this._from = from;
    this._direction = direction.unitize();
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Returns the start point of the ray.
   */
  get from(): Point {
    return this._from;
  }

  /**
   * Returns the direction that the ray shoots. Will always be a unit vector.
   */
  get direction(): Vector {
    return this._direction;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Returns the parameter of the closest point on the ray.
   * @param testPoint     Finds the parameter of the closest point relative to this point.
   * @param range         Specifies whether the ray is shooting both forwards and backwards, or only forwards.
   * @returns             The parameter of the closest point. The parameter is the
   *                      distance between [[from]] and the closest point.
   *                      If the value is negative, it means the closest point is in the
   *                      opposite direction to the [[direction]] vector.
   *                      Entering the parameter into [[pointAt]] will return the closest point.
   */
  public closestParameter(
    testPoint: Point,
    range: RayRange = RayRange.both
  ): number {
    const xDelta = this._direction.x;
    const yDelta = this._direction.y;
    const u =
      ((testPoint.x - this._from.x) * xDelta +
        (testPoint.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    if(inRayRange(u, range)) {
      return u;
    }
    return 0;
  }

  /***
   * Returns the closest point on the ray.
   * @param testPoint         Finds the closest point relative to this point.
   * @param range             Specifies whether the ray is shooting both forwards and backwards, or only forwards.
   */
  public closestPoint(testPoint: Point, range: RayRange = RayRange.both): Point {
    return this.pointAt(this.closestParameter(testPoint, range));
  }

  /***
   * Returns true if the other ray has the same [[from]] point and [[direction]].
   * @param otherRay    The ray to compare against.
   * @param tolerance   The amount the point and vector can differ and still be considered equal.
   */
  public equals(otherRay: Ray, tolerance = shapetypesSettings.absoluteTolerance): boolean {
    if(this._from.equals(otherRay.from, tolerance) && this._direction.equals(otherRay.direction, tolerance)) {
      return true;
    }
    return false;
  }

  /**
   * Returns the parameters where this ray intersects with other geometry.
   *
   * Note: This is an alias for the [[Intersection.ray]] function.
   *
   * @param otherGeom   The geometry to intersect with.
   * @param range       Specifies whether the ray is shooting both forwards and backwards, or only forwards.
   * @returns           The parameter(s) where the intersections occur.
   *                    The parameter is the distance between [[from]] and the intersection point.
   *                    If the value is negative, it means the point of intersection is in the
   *                    opposite direction to the [[direction]] vector.
   *                    Entering the parameter into [[pointAt]] will return the intersection point.
   */
  public intersection(
    otherGeom:
      | Point
      | Line
      | Ray
      | BoundingBox
      | Circle
      | Rectangle
      | Polyline
      | Polygon
      | ReadonlyArray<
          | Point
          | Line
          | Ray
          | BoundingBox
          | Circle
          | Rectangle
          | Polyline
          | Polygon
        >,
    range = RayRange.both
  ): readonly number[] {
    return Intersection.ray(this, otherGeom, range);
  }

  /**
   * Returns the point on the ray that is a given distance from the start of the ray ([[from]]).
   * @param distance  Distance along the ray from the [[from]] point. If positive, will be in the direction of [[direction]]. If negative, will be in the opposite direction.
   */
  public pointAt(distance: number): Point {
    return new Point(
      this._from.x + distance * this._direction.x,
      this._from.y + distance * this._direction.y
    );
  }

  /**
   * Returns a copy of the ray with a different [[from]] point.
   * @param newFrom   New [[from]] point for the ray.
   */
  public withFrom(newFrom: Point): Ray {
    return new Ray(newFrom, this._direction);
  }

  /**
   * Returns a copy of the ray with a different [[direction]] vector.
   * @param newDirection    New [[direction]] for the ray.
   */
  public withDirection(newDirection: Vector): Ray {
    return new Ray(this._from, newDirection);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the ray transformed by a [[Transform]] matrix.
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * ### Example
   * ```js
   * const ray = new Ray(new Point(2,2), Vector.worldX());
   * console.log(ray.from);
   * // => [2,2]
   *
   * // Using a transform matrix
   * const mover = Tranform.translate(new Vector(3,4));
   * const moved = ray.transform(mover);
   * console.log(moved.from);
   * // => [5,6]
   *
   * // Using the direct method
   * const otherMoved = ray.translate(new Vector(3,4));
   * console.log(otherMoved.from);
   * // => [5,6]
   * ```
   *
   * @category Transform
   * @param change  A [[transform]] matrix to apply to the ray.
   */
  public transform(change: Transform): this {
    const from = change.transformPoint(this._from);
    const direction = change.transformVector(this._direction);
    // @ts-ignore
    return new Ray(from, direction);
  }
}
