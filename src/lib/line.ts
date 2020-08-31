import { BoundingBox } from './boundingBox';
import { Point } from './point';
import { Transform } from './transform';
import { Vector } from './vector';

export class Line {
  // -----------------------
  // STATIC
  // -----------------------
  /**
   * Creates a new line from a start point and a vector.
   * @param from  The start point for the line
   * @param direction The direction of the line
   * @param length  The length of the line. If undefined, will use length of vector.
   */
  public static fromVector(from: Point, direction: Vector, length?: number): Line {
    const to = from.duplicate();
    to.translate(direction, length);
    return new Line(from, to);
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
   * A line is defined as a straight edge between two points.
   * @param from  The start point of the line
   * @param to: The end point of the line
   */
  constructor(from: Point, to: Point) {
    this.changePoints(from.duplicate(), to.duplicate());
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  /**
   * The minimum bounding box around the line.
   */
  get boundingBox(): BoundingBox {
    return BoundingBox.fromCorners(this._from, this._to);
  }

  /**
   * Direction of line going [[from]] -> [[to]]. The length of the vector is the length of the line.
   */
  get direction(): Vector {
    if(this._internalCacheVector === undefined) {
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
   * @param distance  Will adjust the end point to make the line this distance.
   * If the distance is set to a negative number, the end point will travel past the start point and the direciton of the line will be reversed, but the resulting length will still be a postive number.
   */
  set length(distance: number) {
    const to = this._from.duplicate();
    to.translate(this.direction, distance);
    this.changePoints(this._from, to);
  }

  /**
   * A vector tangent to the line. This is the vector perpendicular to [[direction]]. Will always have a length of 1.
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
   * Finds the parameter for the closest point on the line.
   * @param point Will find the parameter for the point that is closest to this point.
   * @param limitToFiniteSegment  If false, treats the line as infinite. If true, only considers points within the bounds of the line.
   * @return The normalized parameter of the closest point. See: [[pointAt]].
   */
  public closestParameter(point: Point, limitToFiniteSegment: boolean = true): number {
    // Based on: http://paulbourke.net/geometry/pointlineplane/
    const xDelta = this.direction.x;
    const yDelta = this.direction.y;
    const u =
      ((point.x - this._from.x) * xDelta + (point.y - this._from.y) * yDelta) /
      (xDelta * xDelta + yDelta * yDelta);

    if(limitToFiniteSegment) {
      if (u < 0) {
        return 0;
      } else if (u > 1) {
        return 1;
      }
    }
    return u;
  }

  /**
   * Finds the closest point on the line to a given point.
   * @param point Will find the point on the Line that is closest to this point.
   * @param limitToFiniteSegment  If false, treats the line as infinite. If true, only returns points within the bounds of the line.
   */
  public closestPoint(point: Point, limitToFiniteSegment: boolean = true): Point {
    return this.pointAt(this.closestParameter(point, limitToFiniteSegment));
  }

  /**
   * The smallest distance between this line and a given point.
   * @param point
   */
  public distanceTo(point: Point): number {
    const closest = this.closestPoint(point, true);
    return closest.distanceTo(point);
  }

  /**
   *
   * @param fromDistance
   * @param toDistance
   */
  public extend(fromDistance: number, toDistance: number): void {
    const extendedFrom = this._from.duplicate();
    extendedFrom.translate(this.direction, -fromDistance);

    const extendedTo = this._from.duplicate();
    extendedTo.translate(this.direction, this.length + toDistance);

    this.changePoints(extendedFrom, extendedTo);
  }

  public flip(): void {
    this.changePoints(this._to, this._from);
  }

  public maximumDistanceTo(geometry: Point | Line): number {
    if(geometry instanceof Point) {
      const from = geometry.distanceTo(this._from);
      const to = geometry.distanceTo(this._to);
      if(from > to) {
        return from;
      }
      return to;
    } else {
      const from = this.maximumDistanceTo(geometry.from);
      const to = this.maximumDistanceTo(geometry.from);
      if(from > to) {
        return from;
      }
      return to;
    }
  }

  public minimumDistanceTo(geometry: Point | Line): number {
    if(geometry instanceof Point) {
      return this.distanceTo(geometry);
    } else {
      // This is a naive calculation
      const a = this.distanceTo(geometry.to);
      const b = this.distanceTo(geometry.from);
      const c = geometry.distanceTo(this._to);
      const d = geometry.distanceTo(this._from);

      return Math.min(a,b,c,d);
    }
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
      const xDelta = this.direction.x;
      const yDelta = this.direction.y;
      return new Point(this._from.x + u * xDelta, this._from.y + u * yDelta);
    }
  }

  /**
   * Gets point a set distance from the start of the line
   * @param distance: distance in world units, greater than 0 and less than length of line
   */
  public pointAtLength(distance: number): Point {
    const u = distance / this.direction.length;
    return this.pointAt(u);
  }

  public toString(): string {
    return "from: " + this._from.toString() + ", to:" + this._to.toString();
  }

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
