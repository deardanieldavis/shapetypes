import { BoundingBox } from './boundingBox';
import { Plane } from './plane';
import { Point } from './point';
import { shapetypesSettings } from './settings';
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
    const to = from.translate(direction, length);
    return new Line(from, to);
  }

  // -----------------------
  // VARS
  // -----------------------

  private readonly _from: Point;
  private readonly _to: Point;
  private _cacheVector: Vector | undefined;
  private _cahceBoundingBox: BoundingBox | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /**
   * A line is a straight edge between two points.
   * @param from  The start of the line
   * @param to:   The end of the line
   */
  constructor(from: Point, to: Point) {
    this._from = from;
    this._to = to;
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  /**
   * Returns the smallest bounding box that contains the line.
   */
  get boundingBox(): BoundingBox {
    if (this._cahceBoundingBox === undefined) {
      this._cahceBoundingBox = BoundingBox.fromCorners(this._from, this._to);
    }
    return this._cahceBoundingBox;
  }

  /**
   * Returns the vector between [[from]] and [[to]]. The length of the vector is the length of the line.
   */
  get direction(): Vector {
    if (this._cacheVector === undefined) {
      this._cacheVector = Vector.fromPoints(this._from, this._to);
    }
    return this._cacheVector;
  }

  /**
   * Returns the start point of the line.
   */
  get from(): Point {
    return this._from;
  }

  /**
   * Returns the end point of the line.
   */
  get to(): Point {
    return this._to;
  }

  /**
   * Returns the length of the line.
   */
  get length(): number {
    return this.direction.length;
  }

  /**
   * Returns the line's tangent vector. This vector is perpendicular to [[direction]].
   * It is always has a length of 1.
   * If shapetypesSettings.invertY is true, will be on the right side of the Line if looking [[from]] -> [[to]].
   * If shapetypesSettings.invertY is false (the default), will be on the left side of the Line.
   */
  get unitTangent(): Vector {
    const t = this.direction.perpendicular();
    return t.unitize();
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns the parameter of the closest point on the line.
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
   * Returns the closest point on the line relative to a given point.
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
   * Returns the smallest distance between this line and a given point or line.
   * @param geometry              Line or point to measure the distance to
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
   * Returns true if this line and another have identical [[from]] and [[to]] points.
   * @param otherLine   The line to compare against
   * @param tolerance   The distance the points can be apart and still considered identical
   */
  public equals(
    otherLine: Line,
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this._from.equals(otherLine.from, tolerance)) {
      if (this._to.equals(otherLine.to, tolerance)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns a copy of this Line where the ends have been moved to increase or decrease the length of the line.
   * @param fromDistance  Distance to move [[from]] point. If 0, [[from]] will remain in place. If greater than 0, the line will lengthen.
   * @param toDistance    Distance to move [[to]] point. If 0, [[to]] will remain in place. If greater than 0, the line will lengthen.
   */
  public extend(fromDistance: number, toDistance: number): Line {
    const extendedFrom = this._from.translate(this.direction, -fromDistance);

    const extendedTo = this._from.translate(
      this.direction,
      this.length + toDistance
    );

    return new Line(extendedFrom, extendedTo);
  }

  /**
   * Returns a copy of this Line where [[from]] and [[to]] have been swapped.
   */
  public flip(): Line {
    return new Line(this._to, this._from);
  }

  /**
   * Returns the point at a normalized parameter along the line.
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
   * Returns the point a set distance from the start of the line.
   * @param distance              Distance along the line from the [[from]] point.
   * @param limitToFiniteSegment  If true, will only return points within the bounds of the line. If false, the line is treated as infinite.
   */
  public pointAtLength(
    distance: number,
    limitToFiniteSegment: boolean = true
  ): Point {
    const u = distance / this.direction.length;
    return this.pointAt(u, limitToFiniteSegment);
  }

  /**
   * Returns the line as a string in the format '((x,y),(x,y))'
   */
  public toString(): string {
    return '(' + this._from.toString() + ',' + this._to.toString() + ')';
  }

  /**
   * Returns a copy of this Line with a different [[from]] point.
   * @param newFrom
   */
  public withFrom(newFrom: Point): Line {
    return new Line(newFrom, this._to);
  }

  /**
   * Returns a copy of this Line where the [[to]] point has been moved to make the line a certain length.
   * @param distance  New length for the line. Note: if the length is set to a negative number, the line will be reversed but the length will remain positive.
   */
  public withLength(distance: number): Line {
    const to = this._from.translate(this.direction, distance);
    return new Line(this._from, to);
  }

  /**
   * Returns a copy of this Line with a different [[to]] point.
   * @param newTo
   */
  public withTo(newTo: Point): Line {
    return new Line(this._from, newTo);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the Line transformed by a [[transform]] matrix.
   *
   * ### Example
   * ```js
   * const line = new Line(new Point(0,0), new Point(10,0));
   * console.log(line.toString());
   * // => '((0,0),(10,0))'
   *
   * const moved = line.transform(Transform.translate(new Vector(5, 4)));
   * console.log(moved.toString());
   * // => '((5,4),(15,4))'
   *
   * // Direct method
   * const otherMoved = line.translate(5, 4);
   * console.log(otherMoved.toString());
   * // => '((5,4),(15,4))'
   * ```
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the Line
   */
  public transform(change: Transform): Line {
    return new Line(change.transform(this._from), change.transform(this._to));
  }

  /**
   * Returns a rotated copy of the Line
   * @param angle   Angle to rotate the BLine in radians.
   * @param pivot   Point to pivot the Line about. Defaults to 0,0.
   */
  public rotate(angle: number, pivot?: Point | undefined): Line {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the Line
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   */
  public scale(x: number, y?: number, center?: Point): Line {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the Line transferred from one plane to another.
   * @param planeFrom   The plane the Line is currently in.
   * @param planeTo     The plane the Line will move to.
   * @returns           A copy of the Line in the same relative position on [[planeTo]] as it was on [[planeFrom]].
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): Line {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a translated copy of the Line
   * @param move      Direction to move the Line.
   * @param distance  Distance to move the Line. If not specified, will use length of move vector.
   */
  public translate(move: Vector, distance?: number | undefined): Line {
    // This is faster than creating a translation matrix
    return new Line(
      this._from.translate(move, distance),
      this._to.translate(move, distance)
    );
  }
}
