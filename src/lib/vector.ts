import {
  approximatelyEqual,
  Geometry,
  Point,
  shapetypesSettings,
  Transform
} from '../index';

/**
 * A two-dimensional vector. The vector is defined by an [[x]] magnitude and a [[y]] magnitude.
 *
 * ### Example
 * ```js
 * import { Vector } from 'shapetypes'
 *
 * const v = new Vector(10, 0);
 * console.log(v.x);
 * // => 10
 * console.log(v.length);
 * // => 10
 *
 * const other = new Vector(0,1);
 * const angle = v.angle(other);
 * // => 1.57
 *
 * const rotated = v.rotate(Math.PI / 2);
 * console.log(v.toString());
 * // => [0, 10]
 * ```
 */
export class Vector extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a new vector from two points. The vector starts at `from` and ends at `to`.
   *
   * @category Create
   * @param from    Start of the vector.
   * @param to      End of the vector.
   */
  public static fromPoints(from: Point, to: Point): Vector {
    return new Vector(to.x - from.x, to.y - from.y);
  }

  /**
   * Returns the world's x-axis as a unit vector. Equivalent to `new Vector(1, 0)`.
   *
   * @category Create
   */
  public static worldX(): Vector {
    return Vector._worldX;
  }

  /**
   * Returns the world's y-axis as a unit vector. Equivalent to `new Vector(0, 1)`.
   *
   * @category Create
   */
  public static worldY(): Vector {
    return Vector._worldY;
  }

  // -----------------------
  // VARS
  // -----------------------

  private static readonly _worldX: Vector = new Vector(1, 0);
  private static readonly _worldY: Vector = new Vector(0, 1);

  private readonly _x: number;
  private readonly _y: number;
  private _cacheLength: number | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * @param x   Magnitude in the x-direction.
   * @param y   Magnitude in the y-direction.
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
   * Checks whether the vector's length is 1. Returns true if it is.
   */
  get isUnit(): boolean {
    return approximatelyEqual(this.length, 1);
  }

  /**
   * Checks whether the vector's length is 0. Returns true if it is.
   */
  get isZero(): boolean {
    return approximatelyEqual(this.length, 0);
  }

  /**
   * Gets the vector's length/magnitude.
   */
  get length(): number {
    if (this._cacheLength === undefined) {
      this._cacheLength = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    return this._cacheLength;
  }

  /**
   * Gets the vector's magnitude in the x-direction.
   */
  get x(): number {
    return this._x;
  }

  /**
   * Splits the vector into its x & y components and returns the x component.
   *
   * This is the same as [[worldX]] * [[x]].
   */
  get xAxis(): Vector {
    return Vector.worldX().withLength(this.x);
  }

  /**
   * Gets the vector's magnitude in the y-direction.
   */
  get y(): number {
    return this._y;
  }

  /**
   * Splits the vector into its x & y components and returns the y component.
   *
   * This is the same as [[worldY]] * [[y]].
   */
  get yAxis(): Vector {
    return Vector.worldY().withLength(this.y);
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Adds the x & y magnitudes of another vector and returns the resulting vector.
   * @param addend  Vector to add.
   */
  public add(addend: Vector): Vector;
  /**
   * Adds an x & y value to the vector and returns the resulting vector.
   * @param x       Value to add to the x magnitude.
   * @param y       Value to add to the y magnitude.
   */
  public add(x: number, y: number): Vector;
  public add(addendOrX: Vector | number, y?: number): Vector {
    if (addendOrX instanceof Vector) {
      return new Vector(this._x + addendOrX.x, this._y + addendOrX.y);
    }
    if (y === undefined) {
      /* istanbul ignore next */
      return new Vector(this._x + addendOrX, this._y + addendOrX);
    }
    return new Vector(this._x + addendOrX, this._y + y);
  }

  /**
   * Calculates the smallest angle between this vector and another vector.
   * The result is measured in radians and will be between 0 and Math.PI.
   *
   * @param other   The vector to measure angle between.
   * @returns       The smallest angle between the two vectors in radians.
   */
  public angle(other: Vector): number {
    // Based on: https://stackoverflow.com/questions/21483999/using-atan2-to-find-angle-between-two-vectors
    const cross = this._x * other.y - this._y * other.x;
    return Math.abs(Math.atan2(cross, this.dotProduct(other)));
  }

  /**
   * Calculates the signed angle between this vector and another vector.
   * The result is measured in radians.
   *
   * A positive value means that `other` is counter-clockwise from the vector
   * (assuming the environment's y-axis points upwards, otherwise it's clockwise).
   *
   * A negative value means that `other` is clockwise from the vector
   * (assuming the environment's y-axis points upwards, otherwise it's counter-clockwise).
   *
   * @param other   The vector to measure the angle between.
   * @returns       The signed angle in radians.
   */
  public angleSigned(other: Vector): number {
    const cross = other.x * this._y - other.y * this.x;
    const angle = Math.atan2(cross, other.dotProduct(this));
    return -1 * angle;
  }

  /***
   * Divides the x & y magnitudes by a value and returns the resulting vector.
   *
   * @param denominator Amount to divide the magnitudes by.
   */
  public divide(denominator: number): Vector;
  /**
   * Divides the x & y magnitudes by different amounts in the x- and y-direction. Returns the resulting vector.
   * @param denominatorX    Amount to divide the x magnitude by.
   * @param denominatorY    Amount to divide the y magnitude by.
   */
  // tslint:disable-next-line:unified-signatures
  public divide(denominatorX: number, denominatorY: number): Vector;
  public divide(denominatorX: number, denominatorY?: number): Vector {
    if (denominatorY === undefined) {
      return new Vector(this._x / denominatorX, this._y / denominatorX);
    }
    return new Vector(this._x / denominatorX, this._y / denominatorY);
  }

  /**
   * Calculates the dot product of this vector and another vector. Returns the resulting vector.
   * @param other Vector to calculate dot product with.
   */
  public dotProduct(other: Vector): number {
    return this._x * other.x + this._y * other.y;
  }

  /***
   * Checks whether another vector has the same [[x]] and [[y]] values. Returns true if it does.
   * @param otherVector   The vector to compare against.
   * @param tolerance     The amount that the [[x]] and [[y]] values of the
   *                      vectors can differ and still be considered equal.
   */
  public equals(
    otherVector: Vector,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this.x === otherVector.x && this.y === otherVector.y) {
      return true;
    }

    if (tolerance === 0) {
      // Since there is no tolerance, there is no way the vector can be equal
      return false;
    }

    if (approximatelyEqual(this._x, otherVector.x, tolerance)) {
      if (approximatelyEqual(this._y, otherVector.y, tolerance)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether another vector is parallel. Returns true if it is.
   * @param test              Vector to compare against.
   * @param angleTolerance    Acceptable deviation from parallel, measured as the angle between vectors (in radians).
   */
  public isParallelTo(
    test: Vector,
    angleTolerance: number = shapetypesSettings.angleTolerance
  ): boolean {
    const angle = this.angle(test);
    if (angle === 0) {
      return true;
    }

    // In some scenarios, the angle between vectors may be 179 degrees,
    // which means the vectors are only 1 degree apart, but running in opposite
    // directions. This calculation fixes that.
    const convexAngle = angle < Math.PI / 2 ? angle : Math.PI - angle;
    if (approximatelyEqual(convexAngle, 0, angleTolerance)) {
      return true;
    }
    return false;
  }

  /**
   * Checks whether another vector is perpendicular. Returns true if it is.
   * @param test              Vector to compare against.
   * @param angleTolerance    Acceptable deviation from perpendicular, measured as the angle between vectors (in radians).
   */
  public isPerpendicularTo(
    test: Vector,
    angleTolerance: number = shapetypesSettings.angleTolerance
  ): boolean {
    const angle = this.angle(test);
    if (approximatelyEqual(angle, Math.PI / 2, angleTolerance)) {
      return true;
    }
    return false;
  }

  /**
   * Checks whether the vector is parallel to [[worldX]]. Returns true if it is.
   */
  public isXAxis(): boolean {
    if (this.x !== 0 && this.y === 0) {
      return true;
    }
    return this.isParallelTo(Vector.worldX());
  }

  /**
   * Checks whether the vector is parallel to [[worldY]]. Returns true if it is.
   */
  public isYAxis(): boolean {
    if (this.x === 0 && this.y !== 0) {
      return true;
    }
    return this.isParallelTo(Vector.worldY());
  }

  /***
   * Multiplies the x & y magnitudes by a value and returns the resulting vector.
   *
   * @param factor  Amount to multiply the magnitudes by.
   */
  public multiply(factor: number): Vector;
  /**
   * Multiplies the x & y magnitudes by different amounts in the x- and y-direction. Returns the resulting vector.
   * @param factorX   Amount to multiply the x magnitude by.
   * @param factorY   Amount to multiply the y magnitude by.
   */
  // tslint:disable-next-line:unified-signatures
  public multiply(factorX: number, factorY: number): Vector;
  public multiply(factorX: number, factorY?: number): Vector {
    if (factorY === undefined) {
      return new Vector(this._x * factorX, this._y * factorX);
    }
    return new Vector(this._x * factorX, this._y * factorY);
  }

  /**
   * Creates a new vector that is perpendicular to this vector.
   *
   * The new vector will be on the left side of this vector if looking along [[from]]->[[to]]
   * (assuming the environment's y-axis points upwards, if it doesn't it will be on the right side).
   */
  public perpendicular(): Vector {
    return new Vector(-this.y, this.x);
  }

  /**
   * Inverts the direction of the vector and returns the inverted vector. This is the same as
   * multiplying the vector by -1.
   */
  public reverse(): Vector {
    return this.multiply(-1);
  }

  /***
   * Subtracts the x & y magnitudes of another vector and returns the resulting vector.
   * @param subtrahend Vector to subtract.
   */
  public subtract(subtrahend: Vector): Vector;
  /**
   * Subtracts an x & y value from the vector and returns the resulting vector.
   * @param x       Value to subtract from the x magnitude.
   * @param y       Value to subtract from the y magnitude.
   */
  public subtract(x: number, y: number): Vector;
  public subtract(subtrahendOrX: Vector | number, y?: number): Vector {
    if (subtrahendOrX instanceof Vector) {
      return new Vector(this._x - subtrahendOrX.x, this._y - subtrahendOrX.y);
    }
    if (y === undefined) {
      /* istanbul ignore next */
      return new Vector(this._x - subtrahendOrX, this._y - subtrahendOrX);
    }
    return new Vector(this._x - subtrahendOrX, this._y - y);
  }

  /***
   * Gets the vector as a string in the format: '⟨x,y⟩'.
   */
  public toString(): string {
    return '⟨' + this._x + ',' + this._y + '⟩';
  }

  /**
   * Creates a copy of the vector where the length is equal to 1.
   */
  public unitize(): Vector {
    const length = this.length;
    if (approximatelyEqual(length, 1)) {
      return this;
    }
    return new Vector(this._x / length, this._y / length);
  }

  /**
   * Creates a copy of the vector with the x and y magnitudes scaled to a given length.
   * @param newLength Length of new vector. If negative, the vector will be inverted but the resulting length will be positive.
   */
  public withLength(newLength: number): Vector {
    const oldLength = this.length;
    const factor = newLength / oldLength;
    return new Vector(this.x * factor, this.y * factor);
  }

  /**
   * Creates a copy of the vector with a different x magnitude.
   * @param newX New value for x.
   */
  public withX(newX: number): Vector {
    return new Vector(newX, this._y);
  }

  /**
   * Creates a copy of the vector with a different y magnitude.
   * @param newY New value for y.
   */
  public withY(newY: number): Vector {
    return new Vector(this._x, newY);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Transforms the vector by a [[Transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   * const vector = new Vector(3, 4);
   * console.log(vector.length);
   * // => 5
   *
   * // Using a transform matrix
   * const matrix = Transform.scale(2);
   * const scaled = vector.transform(matrix);
   * console.log(vector.length);
   * // => 10
   *
   * // Using a direct method
   * const otherScaled = vector.scale(2);
   * console.log(otherScaled.length);
   * // => 10
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the vector.
   */
  public transform(change: Transform): this {
    // @ts-ignore
    return change.transformVector(this);
  }
}
