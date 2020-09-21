import { Plane } from './plane';
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { approximatelyEqual } from './utilities';

export class Vector {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns the vector between two points. The length of the vector is the
   * distance between the points.
   * @param from    Point at the start of the vector
   * @param to      Point at the end of the vector
   */
  public static fromPoints(from: Point, to: Point): Vector {
    return new Vector(to.x - from.x, to.y - from.y);
  }

  /**
   * Returns a unit vector of the world's x-axis. Equal to Vector(1, 0).
   */
  public static worldX(): Vector {
    return Vector._worldX;
  }

  /**
   * Returns a unit vector of the world's y-axis. Equal to Vector(0, 1).
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

  /**
   * Creates a two dimensional Euclidean vector. Has two components, a magnitude
   * in the x direction, and a magnitude in the y direction.
   * @param x   Magnitude of vector in x direction
   * @param y   Magnitude of vector in x direction
   */
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Returns true if the length of the vector is 1
   */
  get isUnit(): boolean {
    return approximatelyEqual(this.length, 1);
  }

  /**
   * Returns true if the length of the vector is 0
   */
  get isZero(): boolean {
    return approximatelyEqual(this.length, 0);
  }

  /**
   * Returns the length of the vector
   */
  get length(): number {
    if (this._cacheLength === undefined) {
      this._cacheLength = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    return this._cacheLength;
  }

  /**
   * Returns the x dimension of the vector
   */
  get x(): number {
    return this._x;
  }

  /**
   * Returns component of the vector in the world's x-axis
   */
  get xAxis(): Vector {
    return Vector.worldX().withLength(this.x);
  }

  /**
   * Returns the y dimension of the vector
   */
  get y(): number {
    return this._y;
  }

  /**
   * Returns component of the vector in the world's y-axis
   */
  get yAxis(): Vector {
    return Vector.worldY().withLength(this.y);
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns a copy of this vector added to another vector.
   * @param addend  Vector to add
   */
  public add(addend: Vector): Vector {
    return new Vector(this._x + addend.x, this._y + addend.y);
  }

  /**
   * Returns the angle between this vector an another vector. Measured in radians.
   * Will always be the smallest angle between the vector,
   * so will be between 0 and Math.PI.
   *
   * @param other   The vector to measure against
   * @returns       The smallest angle in radians
   */
  public angle(other: Vector): number {
    // https://stackoverflow.com/questions/21483999/using-atan2-to-find-angle-between-two-vectors
    return Math.abs(
      Math.atan2(this.crossProduct(other), this.dotProduct(other))
    );
  }

  /**
   * Returns the angle between this vector and another vector. Measured in radians.
   * Angle will be positive if the second vector is clockwise form this vector.
   * Will be negative if the second vector is anti-clockwise from this vector.
   * @param other   The vetor to measure against.
   * @returns       The smallest angle in radians
   */
  public angleSigned(other: Vector): number {
    const angle = Math.atan2(other.crossProduct(this), other.dotProduct(this));

    if (shapetypesSettings.invertY) {
      return -1 * angle;
    }
    return angle;
  }

  /**
   * Returns the cross product between this vector and another vector.
   * @param other Vector to calculate cross product with
   */
  public crossProduct(other: Vector): number {
    return this._x * other.y - this._y * other.x;
  }

  /**
   * Returns a copy of this vector divided by a set amount.
   * @param denominator Amount to divide the vector by
   */
  public divide(denominator: number): Vector {
    return new Vector(this._x / denominator, this._y / denominator);
  }

  /**
   * Returns the dot product between this vector and another vector.
   * @param other Vector to calculate dot product with
   */
  public dotProduct(other: Vector): number {
    return this._x * other.x + this._y * other.y;
  }

  /**
   * Returns true if this Vector and another contain identical x and y values.
   * @param comparison    Vector to compare to
   * @param tolerance     Amount of error that is acceptable
   */
  public equals(
    comparison: Vector,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this.x === comparison.x && this.y === comparison.y) {
      return true;
    }

    if (tolerance === 0) {
      // Since there is no tolerance, there is no way the vector can be equal
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
   * Returns true if this vector is parallel to another vector
   * @param test              Vector to compare against
   * @param angleTolerance    Acceptable deviation from parallel, measured as the angle between vectors, in radians.
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
   * Returns true if this vector is perpendicular to another vector
   * @param test              Vector to compare against
   * @param angleTolerance    Acceptable deviation from perpendicular, measured as the angle between vectors, in radians.
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
   * Returns true if the vector is parallel to the [[worldX]].
   */
  public isXAxis(): boolean {
    if (this.x !== 0 && this.y === 0) {
      return true;
    }
    return this.isParallelTo(Vector.worldX());
  }

  /**
   * Returns true if the vector is parallel to the [[worldY]].
   */
  public isYAxis(): boolean {
    if (this.x === 0 && this.y !== 0) {
      return true;
    }
    return this.isParallelTo(Vector.worldY());
  }

  /**
   * Returns a copy of this vector multiplied by a set amount.
   * @param factor Amount to multiple the vector by
   */
  public multiply(factor: number): Vector {
    return new Vector(this._x * factor, this._y * factor);
  }

  /**
   * Returns a new Vector perpendicular to this one.
   * If shapetypesSettings.invertY is true, will be on the right side of the Vector.
   * If shapetypesSettings.invertY is false (the default value), will be on the left side of the Vector.
   */
  public perpendicular(): Vector {
    return new Vector(-this.y, this.x);
  }

  /**
   * Returns a copy of this Vector where all components have been multiplied by -1.
   *
   * (1, 2) -> (-1, -2)
   */
  public reverse(): Vector {
    return this.multiply(-1);
  }

  /**
   * Returns a copy of this vector with another vector subtracted from it.
   * @param subtrahend  Vector to take away
   */
  public subtract(subtrahend: Vector): Vector {
    return new Vector(this._x - subtrahend.x, this._y - subtrahend.y);
  }

  /**
   * Returns a string in the format '⟨x,y⟩'
   */
  public toString(): string {
    return '⟨' + this._x + ',' + this._y + '⟩';
  }

  /**
   * Returns a copy of this vector where the length is equal to 1.
   */
  public unitize(): Vector {
    const length = this.length;
    if (approximatelyEqual(length, 1)) {
      return this;
    }
    return new Vector(this._x / length, this._y / length);
  }

  /**
   * Returns a copy of this vector with the x and y components scaled to a given length.
   * @param newLength Length of new vector. If negative, the vector will be inverted but the resulting length will be positive.
   */
  public withLength(newLength: number): Vector {
    const oldLength = this.length;
    const factor = newLength / oldLength;
    return new Vector(this.x * factor, this.y * factor);
  }

  /**
   * Returns a copy of this vector a difference x value.
   * @param newX New value for x.
   */
  public withX(newX: number): Vector {
    return new Vector(newX, this._y);
  }

  /**
   * Returns a copy of this vector a difference y value.
   * @param newY New value for y.
   */
  public withY(newY: number): Vector {
    return new Vector(this._x, newY);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the Vector transformed by a [[transform]] matrix.
   * Since the vector doesn't have a position in space, transformations that involve
   * moving, such as translate, have no affect.
   *
   * ### Example
   * ```js
   * const vector = new Vector(3, 4);
   * console.log(vector.length);
   * // => 5
   *
   * const scaled = vector.transform(Transform.scale(2));
   * console.log(vector.length);
   * // => 10
   *
   * // Direct method
   * const otherScaled = vector.scale(2);
   * console.log(otherScaled.length);
   * // => 10
   * ```
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the Vector
   */
  public transform(change: Transform): Vector {
    return change.transformVector(this);
  }

  /**
   * Returns a rotated copy of the Vector
   * @param angle   Angle to rotate the Vector in radians.
   */
  public rotate(angle: number): Vector {
    const tran = Transform.rotate(angle);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the Vector
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   */
  public scale(x: number, y?: number): Vector {
    const tran = Transform.scale(x, y);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the Vector transferred from one plane to another.
   * @param planeFrom   The plane the Vector is currently in.
   * @param planeTo     The plane the Vector will move to.
   * @returns           A copy of the Vector in the same relative angle on [[planeTo]] as it was on [[planeFrom]].
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): Vector {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }
}
