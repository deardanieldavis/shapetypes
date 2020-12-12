import {
  approximatelyEqual,
  Geometry,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * A two-dimensional point. The point is defined by an [[x]] coordinate and a [[y]] coordinate.
 *
 * ### Example
 * ```js
 * import { Point, Vector } from 'shapetypes';
 *
 * // Create a point
 * const p = new Point(3, 4);
 *
 * // Get properties of the point
 * console.log(p.x);
 * // => 3
 *
 * // Copy the point and change a parameter
 * const other = p.withX(-1);
 * console.log(other.x);
 * // => -1
 *
 * // Measure distance between points
 * const distance = p.distanceTo(other);
 * console.log(distance);
 * // => 4
 *
 * // Translate the point
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
   * Returns the point at [0,0].
   *
   * Equivalent to `new Point(0,0)`.
   *
   * @category Create
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
   * @param x   Value of the x coordinate.
   * @param y   Value of the y coordinate.
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
   * Gets the x coordinate.
   */
  get x(): number {
    return this._x;
  }

  /**
   * Gets the y coordinate.
   */
  get y(): number {
    return this._y;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Adds x & y coordinates of another point or vector and returns the resulting point.
   * @param addend  Point or vector to add.
   */
  public add(addend: Point | Vector): Point;
  /**
   * Adds an x & y value to the point and returns the resulting point.
   * @param x       Value to add to the x coordinate.
   * @param y       Value to add to the y coordinate.
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
   * @param point Point to measure the distance to.
   */
  public distanceTo(point: Point): number {
    const vector = Vector.fromPoints(this, point);
    return vector.length;
  }

  /***
   * Divides the x & y coordinates by a value and returns the resulting point.
   *
   * @param denominator Amount to divide the coordinates by.
   */
  public divide(denominator: number): Point;
  /**
   * Divides the x & y coordinates by different amounts in the x- and y-direction. Returns the resulting point.
   * @param denominatorX    Amount to divide the x coordinate by.
   * @param denominatorY    Amount to divide the y coordinate by.
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
   * Checks whether another point has the same [[x]] and [[y]] values. Returns true if it does.
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

  /***
   * Multiplies the x & y coordinates by a value and returns the resulting point.
   *
   * @param factor  Amount to multiply by.
   */
  public multiply(factor: number): Point;
  /**
   * Multiplies the x & y coordinates by different amounts in the x- and y-direction. Returns the resulting point.
   * @param factorX   Amount to multiply the x coordinate by.
   * @param factorY   Amount to multiply the y coordinate by.
   */
  // tslint:disable-next-line:unified-signatures
  public multiply(factorX: number, factorY: number): Point;
  public multiply(factorX: number, factorY?: number): Point {
    if (factorY === undefined) {
      return new Point(this._x * factorX, this._y * factorX);
    }
    return new Point(this._x * factorX, this._y * factorY);
  }

  /***
   * Subtracts the x & y coordinates of another point or vector and returns the resulting point.
   * @param subtrahend Point or vector to subtract from the point.
   */
  public subtract(subtrahend: Point | Vector): Point;
  /**
   * Subtracts an x & y value from the point and returns the resulting point.
   * @param x       Value to subtract from the x coordinate.
   * @param y       Value to subtract from the y coordinate.
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
   * Gets the point as a string in the format: `(x,y)`.
   */
  public toString(): string {
    return '(' + this._x + ',' + this._y + ')';
  }

  /**
   * Creates a copy of the vector with a different x coordinate.
   * @param newX New x coordinate.
   */
  public withX(newX: number): Point {
    return new Point(newX, this._y);
  }

  /**
   * Creates a copy of the vector with a different y coordinate.
   * @param newY New y coordinate.
   */
  public withY(newY: number): Point {
    return new Point(this._x, newY);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Transforms the point by a [[transform]] matrix and returns the resulting point.
   *
   * ### Example
   * ```js
   * import { Point, Transform, Vector } from 'shapetypes';
   *
   * // Create a point
   * const p = new Point(3, 4);
   *
   * // Translate point using a transform matrix
   * const matrix = Transform.translate(new Vector(10, 20));
   * const transformed = p.transform(matrix);
   * console.log(transformed.toString());
   * // => (13,24)
   *
   * // Translate point using the direct method
   * const direct = p.translate(new Vector(10, 20));
   * console.log(direct.toString());
   * // => (13,24)
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
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
