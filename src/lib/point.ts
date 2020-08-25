import { Transform } from './transform';
import { Vector } from './vector';

export class Point {
  public static add(a: Point | Vector, b: Point | Vector): Point {
    return new Point(a.x + b.x, a.y + b.y);
  }

  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a deep copy of this point.
   */
  public duplicate(): Point {
    return new Point(this.x, this.y);
  }

  get x(): number {
    return this._x;
  }

  set x(x: number) {
    this._x = x;
  }

  get y(): number {
    return this._y;
  }

  set y(y: number) {
    this._y = y;
  }

  /***************************
   * PUBLIC
   ***************************/

  public distanceTo(point: Point): number {
    const vector = Vector.fromPoints(this, point);
    return vector.length;
  }

  public transform(change: Transform): Point {
    return change.transform(this);
  }

  /**
   * Moves point along a given vector
   * @param move: Direction to move point
   * @param distance: Distance to move point. If undefined, will use distance from [move] vector.
   */
  public translate(move: Vector, distance?: number | undefined): void {
    const actualMove = move.duplicate();
    if (distance !== undefined) {
      actualMove.length = distance;
    }
    this._x += actualMove.x;
    this._y += actualMove.y;
  }

  /**
   * Returns true if two points are in the same location.
   *
   * @param comparison
   * @param tolerance: Optional. If set, will include points within this tolerance of each other.
   */
  public equals(comparison: Point, tolerance: number = 0): boolean {
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

    if (this.distanceTo(comparison) > tolerance) {
      return false;
    }

    return true;
  }

  public toString(): string {
    return this._x + ',' + this._y;
  }
}
