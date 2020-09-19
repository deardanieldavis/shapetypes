import { BoundingBox } from './boundingBox';
import { Point } from './point';
import { Transform } from './transform';
import { Vector } from './vector';

/**
 * A Line is a straight edge between two points.
 *
 * ### Example
 * ```js
 * import { Line } from 'shapetypes'
 *
 * const diagonal = new Line(new Point(3,4), new Point(6,9));
 * console.log(diagonal.length);
 * // -> 5
 * console.log(line.pointAt(0.5));
 *
 * console.log(line.closestPoint(new Point(4,5));
 *
 * console.log(line.unitTangent());
 *
 * TODO:
 * ```
 */

export class Line {
  // -----------------------
  // STATIC
  // -----------------------
  /**
   * Creates a new line from a start point and a vector.
   * @param from      The start point for the line.
   * @param direction The direction of the line.
   * @param length    The length of the line. If undefined, will use length of direction vector.
   */
  public static fromVector(
    from: Point,
    direction: Vector,
    length?: number
  ): Line {
    const to = from.duplicate();
    to.translate(direction, length);
    return new Line(from, to);
  }

  /**
   * Creates a new line by copying an existing one.
   * @param existing
   */
  public static fromExisting(existing: Line): Line {
    return new Line(existing.from.duplicate(), existing.to.duplicate());
  }

  // -----------------------
  // VARS
  // -----------------------

  // @ts-ignore - set with this.changePoints
  private _from: Point;
  // @ts-ignore - set with this.changePoints
  private _to: Point;
  private _internalCacheVector: Vector | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * A line is a straight edge between two points.
   * @param from  The start of the line
   * @param to:   The end of the line
   */
  constructor(from: Point, to: Point) {
    this.changePoints(from, to);
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  /**
   * The smallest bounding box that contains the line.
   */
  get boundingBox(): BoundingBox {
    return BoundingBox.fromCorners(this._from, this._to);
  }

  /**
   * The vector between [[from]] and [[to]]. The length of the vector is the length of the line.
   */
  get direction(): Vector {
    if (this._internalCacheVector === undefined) {
      this._internalCacheVector = Vector.fromPoints(this._from, this._to);
    }
    return this._internalCacheVector;
  }

  /**
   * The start point of the line.
   */
  get from(): Point {
    return this._from;
  }
  set from(point: Point) {
    this.changePoints(point, this._to);
  }

  /**
   * The end point of the line.
   */
  get to(): Point {
    return this._to;
  }
  set to(point: Point) {
    this.changePoints(this._from, point);
  }

  /**
   * The length of the line.
   */
  get length(): number {
    return this.direction.length;
  }
  /**
   * @param distance  Changing the length of the line by moving the [[to]] point. If the length is set to a negative number, the line will be reversed but the length will remain positive.
   */
  set length(distance: number) {
    const to = this._from.duplicate();
    to.translate(this.direction, distance);
    this.changePoints(this._from, to);
  }

  /**
   * The line's tangent vector. This vector is perpendicular to [[direction]]. It is always has a length of 1. It is always points to the right side of the line if looking [[from]] -> [[to]].
   */
  get unitTangent(): Vector {
    const t = this.direction.perpendicular();
    t.unitize();
    return t;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Finds the parameter of the closest point on the line.
   * @param testPoint                     Finds the parameter of the closest point relative to this point.
   * @param limitToFiniteSegment      If true, the parameter must be for a point within the bounds of the line. If false, the line is treated as infinite.
   * @return                          The normalized parameter of the closest point. To understand this value, see: [[pointAt]].
   */
  public closestParameter(
    testPoint: Point,
    limitToFiniteSegment: boolean = true
  ): number {
    // Based on: http://paulbourke.net/geometry/pointlineplane/
    const xDelta = this.direction.x;
    const yDelta = this.direction.y;
    const u =
      ((testPoint.x - this._from.x) * xDelta +
        (testPoint.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    if (limitToFiniteSegment) {
      if (u < 0) {
        return 0;
      } else if (u > 1) {
        return 1;
      }
    }
    return u;
  }

  /**
   * Finds the closest point on the line.
   * @param testPoint                 Finds the closest point relative to this point.
   * @param limitToFiniteSegment  If true, the closest point must be within the bounds of the line. If false, the line is treated as infinite.
   */
  public closestPoint(
    testPoint: Point,
    limitToFiniteSegment: boolean = true
  ): Point {
    return this.pointAt(
      this.closestParameter(testPoint, limitToFiniteSegment),
      limitToFiniteSegment
    );
  }

  /**
   * The smallest distance between this line and a given point or line.
   * @param geometry
   * @param limitToFiniteSegment  If false, the line is treated as infinite.
   */
  public distanceTo(
    geometry: Point | Line,
    limitToFiniteSegment: boolean = true
  ): number {
    if (geometry instanceof Point) {
      const closest = this.closestPoint(geometry, limitToFiniteSegment);
      return closest.distanceTo(geometry);
    } else {
      // This is a naive calculation
      const a = this.distanceTo(geometry.to, limitToFiniteSegment);
      const b = this.distanceTo(geometry.from, limitToFiniteSegment);
      const c = geometry.distanceTo(this._to, limitToFiniteSegment);
      const d = geometry.distanceTo(this._from, limitToFiniteSegment);

      return Math.min(a, b, c, d);
    }
  }

  /**
   * Two lines are equal if [[from]] and [[to]] are identical in both lines.
   * @param otherLine   The line to compare against
   * @param tolerance   The distance the points can be apart and still considered identical
   */
  public equals(otherLine: Line, tolerance: number = 0): boolean {
    if (this._from.equals(otherLine.from, tolerance)) {
      if (this._to.equals(otherLine.to, tolerance)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Increases or decreases the length of the line on either end. Moves end points to accommodate.
   * @param fromDistance  Distance to move [[from]] point. If 0, [[from]] will remain in place. If greater than 0, the line will lengthen.
   * @param toDistance    Distance to move [[to]] point. If 0, [[to]] will remain in place. If greater than 0, the line will lengthen.
   */
  public extend(fromDistance: number, toDistance: number): void {
    const extendedFrom = this._from.duplicate();
    extendedFrom.translate(this.direction, -fromDistance);

    const extendedTo = this._from.duplicate();
    extendedTo.translate(this.direction, this.length + toDistance);

    this.changePoints(extendedFrom, extendedTo);
  }

  /**
   * Swaps [[from]] and [[to]].
   */
  public flip(): void {
    this.changePoints(this._to, this._from);
  }

  /**
   * Gets the point at a normalized parameter along the line.
   *
   * ### Example
   * ```js
   * let line = new Line(new Point(0, 0), new Point(10, 0));
   * console.log(line.pointAt(0));
   * // => 0,0
   * console.log(line.pointAt(0.5));
   * // => 5,0
   * console.log(line.pointAt(1));
   * // => 10,0
   * ```
   * @param u                     The normalized parameter. The parameter ranges from 0, which is the start of the line ([[from]]), through to 1, which is the end of the line ([[to]]). So 0.5 returns the mid point of the line. Values less than 0 or greater than 1 are outside the bounds of the line.
   * @param limitToFiniteSegment  If true, will only return points within the bounds of the line. If false, the line is treated as infinite.
   */
  public pointAt(u: number, limitToFiniteSegment: boolean = true): Point {
    if (limitToFiniteSegment) {
      if (u <= 0) {
        return this._from;
      } else if (u >= 1) {
        return this._to;
      }
    }
    const xDelta = this.direction.x;
    const yDelta = this.direction.y;
    return new Point(this._from.x + u * xDelta, this._from.y + u * yDelta);
  }

  /**
   * Gets point a set distance from the start of the line.
   * @param distance:
   * @param limitToFiniteSegment  If true, will only return points within the bounds of the line. If false, the line is treated as infinite.
   */
  public pointAtLength(
    distance: number,
    limitToFiniteSegment: boolean = true
  ): Point {
    const u = distance / this.direction.length;
    return this.pointAt(u, limitToFiniteSegment);
  }

  public toString(): string {
    return 'from: ' + this._from.toString() + ', to:' + this._to.toString();
  }

  /**
   * Transforms the location of the line by moving the line's endpoints.
   * @param change
   */
  public transform(change: Transform): void {
    this.changePoints(change.transform(this._from), change.transform(this._to));
  }

  // -----------------------
  // PRIVATE
  // -----------------------
  private changePoints(from: Point, to: Point): void {
    this._from = from;
    this._to = to;
    this._internalCacheVector = undefined;
  }
}
