import {
  BoundingBox,
  Circle,
  Geometry,
  Intersection,
  Point,
  Polygon,
  Polyline,
  Ray,
  Rectangle,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * A Line is a straight edge between two points.
 *
 * ### Example
 * ```js
 * import { Line } from 'shapetypes'
 *
 * const line = new Line(new Point(1,1), new Point(4,5));
 *
 * console.log(line.from.toString());
 * // => (1,1)
 * console.log(line.to.toString());
 * // => (4,5)
 * console.log(line.length);
 * // => 5
 *
 * const mid = line.pointAt(0.5);
 * console.log(mid.toString());
 * // => (2.5,3)
 *
 * const closest = line.closestPoint(new Point(5,5));
 * console.log(closest.toString());
 * // => (4,5)
 *
 * const moved = line.transform(Transform.translate(new Vector(5, 0)));
 * console.log(moved.toString());
 * // => [(6,1),(9,5)]
 */

export class Line extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------
  /**
   * Creates a new line from a start point and a vector.
   *
   * @category Create
   * @param from      The start of the line.
   * @param direction The direction of the line.
   * @param length    The length of the line. If undefined, will use length of `direction` vector.
   */
  public static fromVector(
    from: Point,
    direction: Vector,
    length?: number
  ): Line {
    const to = from.translate(direction, length);
    return new Line(from, to);
  }

  /**
   * Creates a new line from a set of end point coordinates.
   *
   * @category Create
   * @param coords  End points of line in the format `[[x1,y1],[x2,y2]]`.
   */
  public static fromCoords(
    coords: readonly [readonly [number, number], readonly [number, number]]
  ): Line {
    return new Line(
      new Point(coords[0][0], coords[0][1]),
      new Point(coords[1][0], coords[1][1])
    );
  }

  // -----------------------
  // VARS
  // -----------------------

  private readonly _from: Point;
  private readonly _to: Point;
  private _cacheVector: Vector | undefined;
  private _cacheBoundingBox: BoundingBox | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------

  /***
   * Creates a new line.
   *
   * @param from  The start of the line.
   * @param to    The end of the line.
   */
  constructor(from: Point, to: Point) {
    super();
    this._from = from;
    this._to = to;
  }

  // -----------------------
  // GET AND SET
  // -----------------------

  /***
   * Returns the smallest bounding box that contains the line.
   */
  get boundingBox(): BoundingBox {
    if (this._cacheBoundingBox === undefined) {
      this._cacheBoundingBox = BoundingBox.fromCorners(this._from, this._to);
    }
    return this._cacheBoundingBox;
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
   * Returns the length of the line.
   */
  get length(): number {
    return this.direction.length;
  }

  /**
   * Returns the end point of the line.
   */
  get to(): Point {
    return this._to;
  }

  /**
   * Returns the line's tangent vector. Always a unit vector perpendicular to [[direction]].
   *
   * If the environment's y-axis points upwards, will be on the left side of the line if looking [[from]] -> [[to]].
   * If the environment's y-axis points downwards, will be on the right side of the line if looking [[from]] -> [[to]].
   */
  get unitTangent(): Vector {
    const t = this.direction.perpendicular();
    return t.unitize();
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /***
   * Returns the parameter of the closest point on the line.
   * @param testPoint                 Finds the parameter of the closest point relative to this point.
   * @param limitToFiniteSegment      If true, the closest point will always be within the bounds of the line. If false, the line is treated as infinite.
   * @return                          The normalized parameter of the closest point. Entering the parameter into [[pointAt]] will return the closest point.
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

  /***
   * Returns the closest point on the line.
   * @param testPoint                 Finds the closest point relative to this point.
   * @param limitToFiniteSegment      If true, the closest point will always be within the bounds of the line. If false, the line is treated as infinite.
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

  /***
   * Returns the smallest distance to a point or line.
   * @param geometry              Line or point to measure distance to.
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
      const result = Intersection.lineLine(this, geometry, limitToFiniteSegment);
      if(result.intersects) {
        return 0;
      } else {
        // One end of the line has to be the closest.
        const a = this.distanceTo(geometry.to, limitToFiniteSegment);
        const b = this.distanceTo(geometry.from, limitToFiniteSegment);
        const c = geometry.distanceTo(this._to, limitToFiniteSegment);
        const d = geometry.distanceTo(this._from, limitToFiniteSegment);
        return Math.min(a, b, c, d);
      }
    }
  }

  /***
   * Returns true if the other line has the same end points.
   * @param otherLine   The line to compare against.
   * @param tolerance   The amount that the line's end points can differ and still be considered equal.
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
   * Returns a copy of the line with the end points extended in the direction of the line.
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
   * Returns a copy of the line with [[from]] and [[to]] swapped.
   */
  public flip(): Line {
    return new Line(this._to, this._from);
  }

  /**
   * Returns the parameters where this line intersects with other geometry.
   *
   * @note              This is an alias for the [[Intersection.line]] function.
   * @param otherGeom   The geometry to intersect with.
   * @returns           The parameter(s) where the intersections occur. Use [[pointAt]] to get actual points.
   */
  public intersection(
    otherGeom:
      | Point
      | Line
      | Ray
      | BoundingBox
      | Circle
      | Rectangle
      | Polyline
      | Polygon
      | ReadonlyArray<
          | Point
          | Line
          | Ray
          | BoundingBox
          | Circle
          | Rectangle
          | Polyline
          | Polygon
        >
  ): readonly number[] {
    return Intersection.line(this, otherGeom);
  }

  /**
   * Returns the point at a normalized parameter along the line.
   *
   * ### Example
   * ```js
   * let line = new Line(new Point(0, 0), new Point(10, 0));
   * console.log(line.pointAt(0).toString());
   * // => (0,0)
   * console.log(line.pointAt(0.5).toString());
   * // => (5,0)
   * console.log(line.pointAt(1).toString());
   * // => (10,0)
   * ```
   * @param u                     The normalized parameter. The parameter ranges from 0, which is the start of the line ([[from]]), through to 1, which is the end of the line ([[to]]). The mid point of the line is 0.5.
   * @param limitToFiniteSegment  If true, the point will always be within the bounds of the line (u-values less than 0 and greater than 1 will be clipped). If false, the line is treated as infinite.
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
   * Returns the point on the line that is a given distance from [[from]].
   * @param distance              Distance between [[from]] and the new point.
   * @param limitToFiniteSegment  If true, the point will always be within the bounds of the line. If false, the line is treated as infinite.
   */
  public pointAtLength(
    distance: number,
    limitToFiniteSegment: boolean = true
  ): Point {
    const u = distance / this.direction.length;
    return this.pointAt(u, limitToFiniteSegment);
  }

  /***
   * Returns the line as a string in the format: `[(x,y),(x,y)]`.
   */
  public toString(): string {
    return '[' + this._from.toString() + ',' + this._to.toString() + ']';
  }

  /**
   * Returns a copy of the line with a different [[from]] point.
   * @param newFrom
   */
  public withFrom(newFrom: Point): Line {
    return new Line(newFrom, this._to);
  }

  /**
   * Returns a copy of the line with a different length. The [[from]] point will remain
   * fixed in place and the [[to]] point will be moved to make the line the right length.
   * @param distance  New length for the line. Note: if the length is set to a negative number, the line's [[direction]] will be reversed but the length will remain positive.
   */
  public withLength(distance: number): Line {
    const to = this._from.translate(this.direction, distance);
    return new Line(this._from, to);
  }

  /**
   * Returns a copy of the line with a different [[to]] point.
   * @param newTo
   */
  public withTo(newTo: Point): Line {
    return new Line(this._from, newTo);
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /***
   * Returns a copy of the line transformed by a [[transform]] matrix.
   *
   * ### Example
   * ```js
   * const line = new Line(new Point(0,0), new Point(10,0));
   * console.log(line.toString());
   * // => [(0,0),(10,0)]
   *
   * // Using a transform matrix
   * const matrix = Transform.translate(new Vector(5, 4));
   * const moved = line.transform(matrix);
   * console.log(moved.toString());
   * // => [(5,4),(15,4)]
   *
   * // Using a direct method
   * const otherMoved = line.translate(5, 4);
   * console.log(otherMoved.toString());
   * // => [(5,4),(15,4)]
   * ```
   *
   * @note  Note: If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the line.
   */
  public transform(change: Transform): this {
    // @ts-ignore
    return new Line(
      change.transformPoint(this._from),
      change.transformPoint(this._to)
    );
  }
}
