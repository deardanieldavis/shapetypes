import {
  BoundingBox,
  Circle,
  Geometry,
  Intersection,
  Line,
  Point,
  Polygon,
  Polyline,
  Rectangle,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * The extent of a ray.
 * A ray can be limited to only shooting forward (either [[positive]] or [[positiveAndZero]]),
 * or the ray can shoot both forward and backward ([[both]]).
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
 * Checks whether the value is in the range specified. Returns true if it is.
 * @ignore
 */
export function inRayRange(distance: number, range: RayRange): boolean {
  if (range === RayRange.both) {
    return true;
  } else if (range === RayRange.positive) {
    if (distance > 0) {
      return true;
    }
  } else if (range === RayRange.positiveAndZero) {
    if (distance >= 0) {
      return true;
    }
  }
  return false;
}

/**
 * A line of infinite length. A ray has a start point ([[from]]) and a direction ([[direction]]) but no end point.
 *
 * In general, the ray is considered infinite in both directions, meaning it shoots
 * both forward and back. Certain methods accept [[RayRange]] as a parameter,
 * which allows you to specify whether the ray should shoot in both directions or only forward.
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
   * Creates a new ray from two points.
   * @category Create
   * @param from        The start of the ray.
   * @param pointOnRay  A point on the ray. The [[direction]] of the ray will start at `from` and point towards `pointOnRay`.
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
   * @param from        The start of the ray.
   * @param direction   The direction the ray shoots.
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
   * Gets the start point of the ray.
   */
  get from(): Point {
    return this._from;
  }

  /**
   * Gets the direction that the ray shoots. Is always a unit vector.
   */
  get direction(): Vector {
    return this._direction;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Finds the closest point on the ray and returns the parameter for the point.
   * @param testPoint     The target to get closest to.
   * @param range         The extent of the ray. Specifies whether the ray is
   *                      shooting both forward and backward, or only forward.
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

    if (inRayRange(u, range)) {
      return u;
    }
    return 0;
  }

  /***
   * Finds the closest point on the ray and returns the point.
   * @param testPoint         The target to get closest to.
   * @param range             The extent of the ray. Specifies whether the ray is
   *                          shooting both forward and backward, or only forward.
   */
  public closestPoint(
    testPoint: Point,
    range: RayRange = RayRange.both
  ): Point {
    return this.pointAt(this.closestParameter(testPoint, range));
  }

  /***
   * Checks whether another ray has the same [[from]] point and [[direction]]. Returns true if it does.
   * @param otherRay    The ray to compare against.
   * @param tolerance   The amount the point and vector can differ and still be considered equal.
   */
  public equals(
    otherRay: Ray,
    tolerance = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (
      this._from.equals(otherRay.from, tolerance) &&
      this._direction.equals(otherRay.direction, tolerance)
    ) {
      return true;
    }
    return false;
  }

  /***
   * Calculates where the ray intersects other geometry and returns the parameters
   * for these points of intersection.
   *
   * @note              This is an alias for the [[Intersection.ray]] function.
   * @note              Only accounts for crossings, not coincident overlaps.
   *
   * @param otherGeom   The geometry to intersect.
   * @param range       The extent of the ray. Specifies whether the ray is
   *                    shooting both forward and backward, or only forward.
   * @returns           The parameters of the intersection points.
   *                    The array is always sorted from the smallest to largest parameter.
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
   * Finds the point a given distance from the ray's start ([[from]]). Returns the point.
   * @param distance  The distance from the [[from]] point.
   *                  If positive, it will be in the direction of [[direction]].
   *                  If negative, it will be in the inverse.
   */
  public pointAt(distance: number): Point {
    return new Point(
      this._from.x + distance * this._direction.x,
      this._from.y + distance * this._direction.y
    );
  }

  /***
   * Gets the ray as a string in the format: `[from,direction]`.
   */
  public toString(): string {
    return '[' + this._from.toString() + ',' + this._direction.toString() + ']';
  }

  /**
   * Creates a copy of the ray with a different [[from]] point.
   * @param newFrom   The new location of the [[from]] point.
   */
  public withFrom(newFrom: Point): Ray {
    return new Ray(newFrom, this._direction);
  }

  /**
   * Creates a copy of the ray with a different [[direction]] vector.
   * @param newDirection    The new [[direction]] of the ray.
   */
  public withDirection(newDirection: Vector): Ray {
    return new Ray(this._from, newDirection);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Transforms the ray by a [[Transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   * const ray = new Ray(new Point(2,2), Vector.worldX());
   * console.log(ray.from.toString());
   * // => (2,2)
   *
   * // Using a transform matrix
   * const matrix = Transform.translate(new Vector(3,4));
   * const moved = ray.transform(matrix);
   * console.log(moved.from.toString());
   * // => (5,6)
   *
   * // Using the direct method
   * const otherMoved = ray.translate(new Vector(3,4));
   * console.log(otherMoved.from.toString());
   * // => (5,6)
   * ```
   *
   * @note  If you're applying the same transformation to a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the ray.
   */
  public transform(change: Transform): this {
    const from = change.transformPoint(this._from);
    const direction = change.transformVector(this._direction);
    // @ts-ignore
    return new Ray(from, direction);
  }
}
