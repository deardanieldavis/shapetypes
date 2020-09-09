// tslint:disable:no-let
import { Point } from './point';
import { shapetypesSettings } from './settings';
import { approximatelyEqual } from './utilities';

export class Vector {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Constructs vector between two points
   * @param from
   * @param to
   */
  public static fromPoints(from: Point, to: Point): Vector {
    return new Vector(to.x - from.x, to.y - from.y);
  }

  public static worldX(): Vector {
    return new Vector(1, 0);
  }

  public static worldY(): Vector {
    return new Vector(0, 1);
  }

  public static add(a: Point | Vector, b: Point | Vector): Vector {
    return new Vector(a.x + b.x, a.y + b.y);
  }

  /**
   * Calculates the angle between two vectors
   * https://stackoverflow.com/questions/21483999/using-atan2-to-find-angle-between-two-vectors
   * @param a
   * @param b
   * @returns Angle in radians = number between 0 & Math.PI
   */
  public static vectorAngle(a: Vector, b: Vector): number {
    return Math.abs(
      Math.atan2(Vector.crossProduct(a, b), Vector.dotProduct(a, b))
    );
  }

  /**
   * Calculates the angle between two vectors, will be negative if the angle is in an anti-clockwise direction
   * @param a
   * @param b
   */
  public static vectorAngleSigned(a: Vector, b: Vector): number {
    let angle = Math.atan2(Vector.crossProduct(b, a), Vector.dotProduct(b, a));

    if (shapetypesSettings.invertY) {
      angle = -1 * angle;
    }

    return angle;
  }

  public static dotProduct(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }
  public static crossProduct(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  // -----------------------
  // VARS
  // -----------------------

  private _x: number;
  private _y: number;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   *
   * @param x
   * @param y
   */
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  /**
   * Gets length of vector
   */
  get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set length(length: number) {
    this.unitize();
    this._x = this._x * length;
    this._y = this._y * length;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Creates a deep copy of this vector
   */
  public duplicate(): Vector {
    return new Vector(this.x, this.y);
  }

  public isVertical(): boolean {
    return this.x === 0 && this.y !== 0;
  }

  public isHorizontal(): boolean {
    return this.x !== 0 && this.y === 0;
  }

  public isParallelTo(test: Vector): boolean {
    let angle = Vector.vectorAngle(this, test);
    angle = angle % Math.PI;

    if (approximatelyEqual(angle, 0, shapetypesSettings.angleTolerance)) {
      return true;
    }
    return false;
  }

  /**
   * Sets vector length to 1
   */
  public unitize(): void {
    const length = this.length;
    this._x = this._x / length;
    this._y = this._y / length;
  }

  /**
   * @returns new vector perpendicular to the original - will be to the right side of the vector
   */
  public perpendicular(): Vector {
    // https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
    if(shapetypesSettings.invertY) {
      return new Vector(-this.y, this.x);
    } else {
      return new Vector(this.y, -this.x);
    }

  }

  public equals(comparison: Vector, tolerance: number = 0): boolean {
    if (this.x === comparison.x && this.y === comparison.y) {
      return true;
    }

    if (tolerance === 0) {
      return false;
    }

    // Want to fail fast and exclude any points that are obviously too far away without running the distance calculation
    if (Math.abs(this.x - comparison.x) > tolerance) {
      return false;
    }

    if (Math.abs(this.y - comparison.y) > tolerance) {
      return false;
    }

    return true;
  }

  /**
   * Inverts the vector (1, 2) -> (-1, -2)
   */
  public reverse(): void {
    this._x = this._x * -1;
    this._y = this._y * -1;
  }

  /**
   * Rotates the vector about 0,0
   * @param angle: rotation in radians
   */
  public rotate(angle: number): void {
    let x: number;
    let y: number;

    if (shapetypesSettings.invertY) {
      x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
      y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    } else {
      x = this.x * Math.cos(angle) + this.y * Math.sin(angle);
      y = -1 * this.x * Math.sin(angle) + this.y * Math.cos(angle);
    }

    this._x = x;
    this._y = y;
  }

  public toString(): string {
    return this._x + ',' + this._y;
  }
}
