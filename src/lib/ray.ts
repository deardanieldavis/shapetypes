import { Plane } from './plane';
import { Point } from './point';
import { Transform } from './transform';
import { Vector } from './vector';

/**
 * A ray is a [[Line]] of infinite length. It has a start point ([[from]]) and a direction ([[direction]]) but no end point.
 */
export class Ray {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a new plane centered on the `origin` point and with the [[xAxis]] aligned to `axisPoint`.
   * @category Create
   * @param origin      The center of the plane.
   * @param axisPoint   A point on the xAxis.
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

  constructor(from: Point, direction: Vector) {
    this._from = from;
    this._direction = direction.unitize();
  }

  // -----------------------
  // GET
  // -----------------------

  get from(): Point {
    return this._from;
  }

  get direction(): Vector {
    return this._direction;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Gets point a set distance from the start of the ray.
   * Note: Since this.direction is normalized, there is no difference between the u value and the distance (like there is for a line)
   * @param distance: distance in world units
   */
  public pointAt(distance: number): Point {
    return new Point(
      this._from.x + distance * this._direction.x,
      this._from.y + distance * this._direction.y
    );
  }

  public closestParameter(point: Point, onlyPositive: boolean = false): number {
    const xDelta = this._direction.x;
    const yDelta = this._direction.y;
    const u =
      ((point.x - this._from.x) * xDelta + (point.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    if(onlyPositive) {
      if(u < 0) {
        return 0;
      }
    }
    return u;
  }

  public closestPoint(point: Point, onlyPositive: boolean = false): Point {
    return this.pointAt(this.closestParameter(point, onlyPositive));
  }

  public withFrom(newFrom: Point): Ray {
    return new Ray(newFrom, this._direction);
  }

  public withDirection(newDirection: Vector): Ray {
    return new Ray(this._from, newDirection);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the plane transformed by a [[Transform]] matrix.
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * ### Example
   * ```js
   * const plane = new Plane(new Point(2,2), Vector.worldX());
   * console.log(plane.origin);
   * // => [2,2]
   *
   * const mover = Tranform.translate(new Vector(3,4));
   * const moved = plane.transform(mover);
   * console.log(moved.origin);
   * // => [5,6]
   *
   * // Direct method
   * const otherMoved = plane.translate(new Vector(3,4));
   * console.log(otherMoved.origin);
   * // => [5,6]
   * ```
   *
   * @category Transform
   * @param change  A [[transform]] matrix to apply to the BoundingBox.
   */
  public transform(change: Transform): Ray {
    const from = change.transformPoint(this._from);
    const direction = change.transformVector(this._direction);
    return new Ray(from, direction);
  }

  /**
   * Returns a copy of the plane rotated about a point.
   * @category Transform
   * @param angle   Angle of rotation, in radians. If positive, rotates clockwise. If negative, rotates counter clockwise.
   * @param pivot   Pivot point for rotation. If undefined, the object will be rotated about 0,0.
   */
  public rotate(angle: number, pivot?: Point | undefined): Ray {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the plane translated from one planar coordinate system to another.
   * In other words, if the plane is described relative to `planeFrom`, after
   * translation, it will be described relative to `planeTo`.
   * @category Transform
   * @param planeFrom   The coordinate system the plane is currently described relative to.
   * @param planeTo     The coordinate system to describe the plane relative to.
   */
  public changeBasis(planeFrom: Plane, planeTo: Plane): Ray {
    const tran = Transform.changeBasis(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a copy of this plane translated in a certain direction.
   * @category Transform
   * @param move      Direction to move the Plane.
   * @param distance  Distance to move the Plane. If undefined, will use length of `move` vector.
   */
  public translate(move: Vector, distance?: number | undefined): Ray {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);
  }
}
