import { Point } from './point';
import { Vector } from './vector';

export class Ray {
  private _from: Point;
  private _direction: Vector;

  constructor(from: Point, direction: Vector) {
    this._from = from;
    this._direction = direction.unitize();
  }

  /***************************
   * GET
   ***************************/

  get from(): Point {
    return this._from;
  }

  get direction(): Vector {
    return this._direction;
  }

  /***************************
   * PUBLIC
   ***************************/

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

  public closestParameter(point: Point): number {
    const xDelta = this._direction.x;
    const yDelta = this._direction.y;
    const u =
      ((point.x - this._from.x) * xDelta + (point.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    return u;
  }

  public closestPoint(point: Point): Point {
    return this.pointAt(this.closestParameter(point));
  }
}
