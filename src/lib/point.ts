import { Plane } from './plane';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual } from './utilities';
import { Vector } from './vector';

/**
 * A two dimensional point.
 *
 * ### Example
 * ```js
 * import { Point } from 'shapetypes'
 *
 * const p = new Point(3, 4);
 * console.log(p.x);
 * // => 3
 * console.log(p.distanceTo(new Point(0,0)));
 * // => 5
 *
 * const shifted = p.translate(new Vector(10, 20));
 * console.log(shifted.toString());
 * // => '(13,24)'
 * ```
 */

export class Point {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns the point at 0,0.
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

  /**
   * Creates a two dimensional point
   * @param x   Coordinate of the point on the x-axis
   * @param y   Coordinate of the point on the y-axis
   */
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Returns the x coordinate of the point
   */
  get x(): number {
    return this._x;
  }

  /**
   * Returns the y coordinate of the point
   */
  get y(): number {
    return this._y;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns a copy of this point added to another point or vector.
   * @param addend  Point or vector to add
   */
  public add(addend: Point | Vector): Point {
    return new Point(this._x + addend.x, this._y + addend.y);
  }

  /**
   * Returns the distance from this point to another.
   * @param point
   */
  public distanceTo(point: Point): number {
    const vector = Vector.fromPoints(this, point);
    return vector.length;
  }

  /**
   * Returns a copy of this point where the coordinates have been divided by a set amount.
   * @param denominator Amount to divide the vector by
   */
  public divide(denominator: number): Point {
    return new Point(this._x / denominator, this._y / denominator);
  }

  /**
   * Returns true if this Point and another contain identical x and y values.
   *
   * @param comparison  Point to compare to
   * @param tolerance   Amount of error that is acceptable for either coordinate
   */
  public equals(
    comparison: Point,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
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

  /**
   * Returns a copy of this point where the coordinates have been multiplied by a set amount.
   * @param factor  Amount to multiply by
   */
  public multiply(factor: number): Point {
    return new Point(this._x * factor, this._y * factor);
  }

  /**
   * Returns a copy of this point with another point or vector subtracted from it.
   * @param subtrahend  Point or vector to take away
   */
  public subtract(subtrahend: Point | Vector): Point {
    return new Point(this._x - subtrahend.x, this._y - subtrahend.y);
  }

  /**
   * Returns a string in the format '(x,y)'
   */
  public toString(): string {
    return '(' + this._x + ',' + this._y + ')';
  }

  /**
   * Returns a copy of this point with another value added to the x coordinate.
   * @param addX  Value to add to x coordinate
   */
  public withAddX(addX: number): Point {
    return new Point(this._x + addX, this._y);
  }

  /**
   * Returns a copy of this point with another value added to the y coordinate.
   * @param addY  Value to add to y coordinate
   */
  public withAddY(addY: number): Point {
    return new Point(this._x, this._y + addY);
  }

  /**
   * Returns a copy of this point a difference x value.
   * @param newX New value for x.
   */
  public withX(newX: number): Point {
    return new Point(newX, this._y);
  }

  /**
   * Returns a copy of this point a difference y value.
   * @param newY New value for y.
   */
  public withY(newY: number): Point {
    return new Point(this._x, newY);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the Point transformed by a [[transform]] matrix.
   *
   * ### Example
   * ```js
   * const p = new Point(3, 4);
   *
   * const transformed = p.transform(Transform.translate(new Vector(10, 20)));
   * console.log(transformed.toString());
   * // => '(13,24)'
   *
   * // Direct method
   * const direct = p.translate(new Vector(10, 20));
   * console.log(p.toString());
   * // => '(13,24)'
   * ```
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the Point
   */
  public transform(change: Transform): Point {
    return change.transform(this);
  }

  /**
   * Returns a rotated copy of the Point
   * @param angle   Angle to rotate the Point in radians.
   * @param pivot   Point to pivot the Point about. Defaults to 0,0.
   */
  public rotate(angle: number, pivot?: Point | undefined): Point {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the Point
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   */
  public scale(x: number, y?: number, center?: Point): Point {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the Point transferred from one plane to another.
   * @param planeFrom   The plane the Point is currently in.
   * @param planeTo     The plane the Point will move to.
   * @returns           A copy of the Point in the same relative position on [[planeTo]] as it was on [[planeFrom]].
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): Point {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a translated copy of the Point
   * @param move      Direction to move the Point.
   * @param distance  Distance to move the Point. If not specified, will use length of move vector.
   */
  public translate(move: Vector, distance?: number | undefined): Point {
    // This is faster than using the translate matrix
    const actualMove =
      distance === undefined ? move : move.withLength(distance);
    return new Point(this._x + actualMove.x, this._y + actualMove.y);
  }
}
