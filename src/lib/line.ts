import { Point } from './point';
import { Vector } from './vector';

export class Line {
  private _from: Point;
  private _to: Point;
  private _vector: Vector;

  /**
   * Constructs line between two points
   * @param from
   * @param to: Can either be the end point of the line, or a vector describing the line's length and direction.
   */
  constructor(from: Point, to: Point | Vector) {
    this._from = from.duplicate();

    if (to instanceof Point) {
      this._to = to.duplicate();
    } else {
      const end = from.duplicate();
      end.translate(to);
      this._to = end;
    }
    this._vector = Vector.fromPoints(this._from, this._to);
  }

  /***************************
   * GETS
   ***************************/

  /**
   * Length of line
   */
  get length(): number {
    return this._vector.length;
  }

  /**
   * Direction of line from start to end. The length of the vector is the length of the line.
   */
  get direction(): Vector {
    return this._vector;
  }

  get unitTangent(): Vector {
    const t = this._vector.perpendicular();
    t.unitize();
    return t;
  }

  get from(): Point {
    return this._from;
  }

  get to(): Point {
    return this._to;
  }

  /***************************
   * PUBLIC
   ***************************/

  /**
   * Finds the parameter for the closest point on the line
   * Based on: http://paulbourke.net/geometry/pointlineplane/
   * @param point
   * @return A value between 0 & 1
   */
  public closestParameter(point: Point): number {
    const xDelta = this._vector.x;
    const yDelta = this._vector.y;
    const u =
      ((point.x - this._from.x) * xDelta + (point.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    if (u < 0) {
      return 0;
    } else if (u > 1) {
      return 1;
    } else {
      return u;
    }
  }

  /**
   * Gets the closest point on the line to a given point.
   * @param point
   */
  public closestPoint(point: Point): Point {
    return this.pointAt(this.closestParameter(point));
  }

  /**
   * Gets the point at a normalized parameter along the line
   * @param u: a value between 0 & 1
   * @return
   */
  public pointAt(u: number): Point {
    if (u <= 0) {
      return this._from;
    } else if (u >= 1) {
      return this._to;
    } else {
      const xDelta = this._vector.x;
      const yDelta = this._vector.y;
      return new Point(this._from.x + u * xDelta, this._from.y + u * yDelta);
    }
  }

  /**
   * Gets point a set distance from the start of the line
   * @param distance: distance in world units, greater than 0 and less than length of line
   */
  public pointAtLength(distance: number): Point {
    const u = distance / this._vector.length;
    return this.pointAt(u);
  }
}
