import {
  approximatelyEqual,
  Geometry,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

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

export class Point extends Geometry {
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

  /***
   * Creates a two dimensional point.
   * @param x   Coordinate on the x-axis.
   * @param y   Coordinate on the y-axis.
   */
  constructor(x: number, y: number) {
    super();
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
   * @param addend  Point or vector to add to the point
   */
  public add(addend: Point | Vector): Point;
  /**
   * Returns a copy of this point with an x and y value added.
   * @param x       Value to add to the x coordinate
   * @param y       Value to add to the y coordinate
   */
  public add(x: number, y: number): Point;
  public add(addendOrX: Point | Vector | number, y?: number): Point {
    if (addendOrX instanceof Point || addendOrX instanceof Vector) {
      return new Point(this._x + addendOrX.x, this._y + addendOrX.y);
    }
    if (y === undefined) {
      /* istanbul ignore next */
      return new Point(this._x + addendOrX, this._y + addendOrX);
    }
    return new Point(this._x + addendOrX, this._y + y);
  }

  /***
   * Returns the distance to another point.
   * @param point Point to measure distance to.
   */
  public distanceTo(point: Point): number {
    const vector = Vector.fromPoints(this, point);
    return vector.length;
  }

  /**
   * Returns a copy of this point where the coordinates have been divided by a set amount.
   * @param denominator Amount to divide the point by
   */
  public divide(denominator: number): Point;
  /**
   * Returns a copy of this point where the coordinates have been divided by a set amount.
   * @param denominatorX    Amount to divide the x coordinate by
   * @param denominatorY    Amount to divide the y coordinate by
   */
  // tslint:disable-next-line:unified-signatures
  public divide(denominatorX: number, denominatorY: number): Point;
  public divide(denominatorX: number, denominatorY?: number): Point {
    if (denominatorY === undefined) {
      return new Point(this._x / denominatorX, this._y / denominatorX);
    }
    return new Point(this._x / denominatorX, this._y / denominatorY);
  }

  /***
   * Returns true if the other point has the same [[x]] and [[y]] values.
   *
   * @param comparison  Point to compare against.
   * @param tolerance   The amount that the [[x]] and [[y]] values of the points can differ and still be considered equal.
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
  public multiply(factor: number): Point;
  /**
   * Returns a copy of this point where the coordinates have been multiplied by a set amount.
   * @param factorX   Amount to multiply x coordinate by
   * @param factorY   Amount to multiply y coordinate by
   */
  // tslint:disable-next-line:unified-signatures
  public multiply(factorX: number, factorY: number): Point;
  public multiply(factorX: number, factorY?: number): Point {
    if (factorY === undefined) {
      return new Point(this._x * factorX, this._y * factorX);
    }
    return new Point(this._x * factorX, this._y * factorY);
  }

  /**
   * Returns a copy of this point with another point or vector subtracted from it.
   * @param subtrahend Point or vector to subtract from the point
   */
  public subtract(subtrahend: Point | Vector): Point;
  /**
   * Returns a copy of this point with an x and y value subtracted.
   * @param x       Value to subtract from the x coordinate
   * @param y       Value to subtract from the y coordinate
   */
  public subtract(x: number, y: number): Point;
  public subtract(subtrahendOrX: Point | Vector | number, y?: number): Point {
    if (subtrahendOrX instanceof Point || subtrahendOrX instanceof Vector) {
      return new Point(this._x - subtrahendOrX.x, this._y - subtrahendOrX.y);
    }
    if (y === undefined) {
      /* istanbul ignore next */
      return new Point(this._x - subtrahendOrX, this._y - subtrahendOrX);
    }
    return new Point(this._x - subtrahendOrX, this._y - y);
  }

  /***
   * Returns the point as a string in the format `(x,y)`.
   */
  public toString(): string {
    return '(' + this._x + ',' + this._y + ')';
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

  /***
   * Returns a copy of the point transformed by a [[transform]] matrix.
   *
   * ### Example
   * ```js
   * const p = new Point(3, 4);
   *
   * // Using a transform matrix
   * const matrix = Transform.translate(new Vector(10, 20));
   * const transformed = p.transform(matrix);
   * console.log(transformed.toString());
   * // => (13,24)
   *
   * // Using the direct method
   * const direct = p.translate(new Vector(10, 20));
   * console.log(p.toString());
   * // => (13,24)
   * ```
   *
   * @note  Note: If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the point.
   */
  public transform(change: Transform): this {
    // @ts-ignore
    return change.transformPoint(this);
  }
}
