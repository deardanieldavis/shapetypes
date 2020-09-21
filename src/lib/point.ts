import { Plane } from './plane';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

export class Point {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns point at 0,0.
   */
  public static origin(): Point {
    return Point._origin;
  }

  // -----------------------
  // VARS
  // -----------------------

  private static readonly _origin: Point = new Point(0, 0);

  private readonly _x: number;
  private readonly _y: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  // -----------------------
  // GET
  // -----------------------

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  public add(addend: Point | Vector): Point {
    return new Point(this._x + addend.x, this._y + addend.y);
  }

  public distanceTo(point: Point): number {
    const vector = Vector.fromPoints(this, point);
    return vector.length;
  }

  public divide(denominator: number): Point {
    return new Point(this._x / denominator, this._y / denominator);
  }

  /**
   * Returns true if two points are in the same location.
   *
   * @param comparison
   * @param tolerance: Optional. If set, will include points within this tolerance of each other.
   */
  public equals(comparison: Point, tolerance: number = shapetypesSettings.absoluteTolerance): boolean {
    if (this.x === comparison.x && this.y === comparison.y) {
      return true;
    }

    if (tolerance === 0) {
      // Since there is no tolerance, there is no way the points can be equal
      return false;
    }

    if (approximatelyEqual(this._x, comparison.x, tolerance)) {
      if (approximatelyEqual(this._y, comparison.y, tolerance)) {
        return true;
      }
    }

    return false;
  }

  public multiply(factor: number): Point {
    return new Point(this._x * factor, this._y * factor);
  }

  public subtract(subtrahend: Point | Vector): Point {
    return new Point(this._x - subtrahend.x, this._y - subtrahend.y);
  }

  public toString(): string {
    return '(' + this._x + ',' + this._y + ')';
  }

  public withX(newX: number): Point {
    return new Point(newX, this._y);
  }
  public withY(newY: number): Point {
    return new Point(this._x, newY);
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
  public transform(change: Transform): Point {
    return change.transform(this);
  }

  /**
   * Returns a rotated copy of the BoundingBox
   * @param angle   Angle to rotate the BoundingBox in radians.
   * @param pivot   Point to pivot the BoundingBox about. Defaults to 0,0.
   */
  public rotate(angle: number, pivot?: Point | undefined): Point {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the BoundingBox
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   */
  public scale(x: number, y?: number, center?: Point): Point {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the BoundingBox transferred from one plane to another.
   * @param planeFrom   The plane the BoundingBox is currently in.
   * @param planeTo     The plane the BoundingBox will move to.
   * @returns           A copy of the BoundingBox in the same relative position on [[planeTo]] as it was on [[planeFrom]].
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): Point {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a translated copy of the BoundingBox
   * @param move      Direction to move the BoundingBox.
   * @param distance  Distance to move the BoundingBox. If not specified, will use length of move vector.
   */
  public translate(move: Vector, distance?: number | undefined): Point {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);

    // TODO: Is this faster?
    /*const actualMove =
      distance === undefined ? move : move.withLength(distance);
    this._x += actualMove.x;
    this._y += actualMove.y;*/
  }
}
