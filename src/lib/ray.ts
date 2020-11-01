import { Geometry, Point, Transform, Vector } from '../index';

/**
 * A ray is a line of infinite length. It has a start point ([[from]]) and a direction ([[direction]]) but no end point.
 */
export class Ray extends Geometry{
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a new ray that starts at the `from` point and continues through `pointOnRay`.
   * @category Create
   * @param from        The start of the ray.
   * @param pointOnRay  A point in the direction of the ray.
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

  /**
   * A ray is a line of infinite length. It has a start point (`from`) and a direction (`direction`) but no end point.
   * @param from        The start of the ray.
   * @param direction   The direction of the ray.
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
   * Returns the direction of the ray. Will always be a unit vector.
   */
  get direction(): Vector {
    return this._direction;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns the parameter of the closest point on the ray.
   * @param testPoint     Finds the parameter of the closest point relative to this point.
   * @param onlyForward   If true, the ray is shooting forward and the parameter will be
   *                      for a point in front of [[from]] (in other words, the
   *                      parameter will be a value equal to or greater than zero).
   *                      If false, the ray is treated as an infinite line and the parameter
   *                      could be a for a point in either direction (it could be either positive or negative).
   */
  public closestParameter(
    testPoint: Point,
    onlyForward: boolean = false
  ): number {
    const xDelta = this._direction.x;
    const yDelta = this._direction.y;
    const u =
      ((testPoint.x - this._from.x) * xDelta +
        (testPoint.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    if (onlyForward) {
      if (u < 0) {
        return 0;
      }
    }
    return u;
  }

  /**
   * Returns the closest point on the ray relative to a given point.
   * @param testPoint         Finds the closest point relative to this point.
   * @param onlyPositive      If true, the ray is shooting forward and the point will be
   *                          for a point in front of [[from]]. If false, the ray is
   *                          treated as an infinite line and the point could be a for a point in either direction.
   */
  public closestPoint(testPoint: Point, onlyPositive: boolean = false): Point {
    return this.pointAt(this.closestParameter(testPoint, onlyPositive));
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
   * @param newFrom   New point to use as the [[from]] point.
   */
  public withFrom(newFrom: Point): Ray {
    return new Ray(newFrom, this._direction);
  }

  /**
   * Returns a copy of the ray with a different [[direction]] vector.
   * @param newDirection    New direction for the ray.
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
   * const mover = Tranform.translate(new Vector(3,4));
   * const moved = ray.transform(mover);
   * console.log(moved.from);
   * // => [5,6]
   *
   * // Direct method
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
