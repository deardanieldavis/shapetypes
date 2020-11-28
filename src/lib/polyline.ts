/* tslint:disable:no-let */
import { Ring } from 'polygon-clipping';
import { horizontalRayPolyline } from './intersection/horizontalRay';
import { CurveOrientation, PointContainment } from './utilities';

import {
  BoundingBox,
  Circle,
  Geometry,
  Intersection,
  Interval,
  IntervalSorted,
  Line,
  Point,
  Polygon,
  Ray,
  Rectangle,
  shapetypesSettings,
  Transform,
  Vector
} from '../index';

/**
 * A polyline is a continuous line made from a series of straight [[segments]].
 * The corners of the polyline are defined by an array of [[points]].
 *
 * Polylines can either be open (the polyline starts and ends in a different place)
 * or closed (the polyline starts and ends in the same place). This can be checked with [[isClosed]].
 * Some operations, such as [[contains]] and [[union]] only work with closed polylines.
 *
 * ### Example
 * ```js
 * import { Polyline } from 'shapetypes'
 *
 * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
 * console.log(triangle.area);
 * // => 1
 * console.log(triangle.contains(new Point(1, 0.5));
 * // => True
 * console.log(triangle.from.toString());
 * // => [0,0]
 *
 * const shifted = triangle.translate(new Vector(3, 4));
 * console.log(shifted.contains(new Point(1, 0.5));
 * // => False
 * console.log(shifted.from.toString());
 * // => [3,4]
 * ```
 *
 *
 */
export class Polyline extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Returns a new polyline from a list of coordinates (in the GeoJSON format).
   * @category Create
   * @param coordinates  List of points in the format `[[x1,y1],[x2,y2],[x3,y3]]`
   * @param makeClosed    If true, checks whether the resulting polyline [[isClosed]] and if it isn't, adds another point ensuring the polyline ends the same place it starts.
   */
  public static fromCoords(
    coordinates: Ring,
    makeClosed: boolean = false
  ): Polyline {
    const points = coordinates.map(pair => new Point(pair[0], pair[1]));
    if (makeClosed) {
      if (!points[0].equals(points[points.length - 1])) {
        points.push(points[0]);
      }
    }
    return new Polyline(points, false);
  }

  // -----------------------
  // VARS
  // -----------------------

  private readonly _points: readonly Point[];

  // Cache
  private _cacheBoundingBox: BoundingBox | undefined;
  private _cacheGeoJSON: Ring | undefined;
  private _cacheArea: number | undefined;
  private _cacheClosed: boolean | undefined;
  private _cacheLength: number | undefined;
  private _cacheOrientationYUp: CurveOrientation | undefined;
  private _cacheOrientationYDown: CurveOrientation | undefined;
  private _cacheSegments: readonly Line[] | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------
  /***
   * Creates a polyline from a set of corner points.
   *
   * @note  Doesn't check for self-intersection or invalid segments.
   * @param points        The points defining the corners of the polyline.
   * @param makeClosed    If true, checks whether the resulting polyline [[isClosed]] and if it isn't, adds another point ensuring the polyline ends the same place it starts.
   */
  constructor(points: readonly Point[], makeClosed: boolean = false) {
    super();
    if (makeClosed) {
      if (!points[0].equals(points[points.length - 1])) {
        // If the start point is different from the final point
        // add the start point to the end
        const finalPoints = points.concat(points[0]);
        this._points = finalPoints;
        return;
      }
    }
    this._points = points;
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Returns area enclosed by polyline. If polyline isn't closed, returns 0.
   */
  get area(): number {
    if (this.isClosed === false) {
      return 0;
    }

    if (this._cacheArea === undefined) {
      // Based on: https://stackoverflow.com/questions/451426/how-do-i-calculate-the-area-of-a-2d-polygon
      let area = 0;
      for (let i = 1; i < this._points.length - 1; i++) {
        const a = Vector.fromPoints(this._points[0], this._points[i]);
        const b = Vector.fromPoints(this._points[0], this._points[i + 1]);
        area += a.x * b.y - a.y * b.x;
      }
      this._cacheArea = Math.abs(area / 2.0);
    }

    return this._cacheArea;
  }

  /***
   * Returns the smallest bounding box that contains the polyline.
   */
  get boundingBox(): BoundingBox {
    if (this._cacheBoundingBox === undefined) {
      this._cacheBoundingBox = BoundingBox.fromPoints(this.points);
    }
    return this._cacheBoundingBox;
  }

  /**
   * Returns number of points in the polyline.
   */
  get count(): number {
    return this._points.length;
  }

  /**
   * Returns starting point of polyline.
   */
  get from(): Point {
    return this._points[0];
  }

  /**
   * Returns true if the polyline starts and ends in the same place
   * (if [[from]] is in the same position as [[to]]).
   */
  get isClosed(): boolean {
    if (this._cacheClosed === undefined) {
      this._cacheClosed = this.from.equals(this.to);
    }
    return this._cacheClosed;
  }

  /**
   * Returns the length of the polyline.
   */
  get length(): number {
    if (this._cacheLength === undefined) {
      const length = this.segments.reduce((accumulator, segment) => accumulator + segment.length, 0);
      this._cacheLength = length;
    }
    return this._cacheLength;
  }

  /**
   * Returns the list of points that define the corners of the polyline.
   */
  get points(): readonly Point[] {
    return this._points;
  }

  /**
   * Returns the number of segments that makeup the polyline.
   */
  get segmentCount(): number {
    return this._points.length - 1;
  }

  /**
   * Returns the list of segments that makeup the edges of the polyline.
   */
  get segments(): readonly Line[] {
    if (this._cacheSegments === undefined) {
      const lines = new Array<Line>(this._points.length - 1);

      for (let i = 0; i < this.points.length - 1; i++) {
        const next = i + 1;
        const line = new Line(this.points[i], this.points[next]);
        // tslint:disable-next-line:no-object-mutation
        lines[i] = line;
      }
      this._cacheSegments = lines;
    }
    return this._cacheSegments;
  }

  /**
   * Returns the end of the polyline.
   */
  get to(): Point {
    return this._points[this._points.length - 1];
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Returns the weighted average of all segments.
   */
  public center(): Point {
    let x = 0;
    let y = 0;

    for (const segment of this.segments) {
      const mid = segment.pointAt(0.5);
      x += mid.x * segment.length;
      y += mid.y * segment.length;
    }

    x = x / this.length;
    y = y / this.length;

    return new Point(x, y);
  }

  /**
   * Returns the index of the point in the list of [[points]] that is nearest to `testPoint`.
   * @param testPoint   The target to measure distance from.
   */
  public closestIndex(testPoint: Point): number {
    let bestIndex: number = 0;
    let bestDistance: number | undefined;

    for (let i = 0; i < this._points.length; i++) {
      const distance = testPoint.distanceTo(this._points[i]);
      if (bestDistance === undefined || distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  /***
   * Returns the parameter of the closest point on the polyline.
   *
   * @param testPoint   Finds the parameter of the closest point relative to this point.
   * @returns           The parameter of the closest point. Entering the parameter into [[pointAt]] will return the closest point.
   */
  public closestParameter(testPoint: Point): number {
    let closestLength: number | undefined;
    let closestParameter = 0;

    for (let i = 0; i < this.segments.length; i++) {
      const edge = this.segments[i];
      const test = edge.closestParameter(testPoint, true);
      const p = edge.pointAt(test);
      const length = testPoint.distanceTo(p);

      if (closestLength === undefined || length < closestLength) {
        closestLength = length;
        closestParameter = i + test;
      }
    }

    return closestParameter;
  }

  /***
   * Returns the closest point on the polyline.
   * @param testPoint     Finds the closest point relative to this point.
   * @param includeInterior If false, the closest point must lie on the edge of the polyline.
   *                        If true, the closest point can also be a point on the interior of the polyline (if it is closed and has an interior).
   */
  public closestPoint(
    testPoint: Point,
    includeInterior: boolean = false
  ): Point {
    if (includeInterior) {
      if (this.isClosed) {
        if (this.contains(testPoint)) {
          return testPoint;
        }
      }
    }

    let closestLength: number | undefined;
    let closestPoint: Point = testPoint;

    for (const line of this.segments) {
      const test = line.closestPoint(testPoint, true);
      const distance = line.distanceTo(testPoint, true);

      if (closestLength === undefined || distance < closestLength) {
        closestLength = distance;
        closestPoint = test;
      }
    }

    return closestPoint;
  }

  /**
   * Returns a copy of the polyline with short segments removed. This is achieved by
   * traveling along the polyline and removing any point closer to the previous
   * point than `minimumSegmentSize`. Does not remove [[from]] or [[to]] points.
   * @param minimumSegmentSize   Shortest allowable segment.
   */
  public deleteShortSegments(
    minimumSegmentSize: number = shapetypesSettings.absoluteTolerance
  ): Polyline {
    const points = Array<Point>();
    points.push(this.from);

    // Start at 1 and end at -1 because the `from` and `to` points are added separately.
    for (let i = 1; i < this._points.length - 1; i++) {
      const last = points[points.length - 1]; // last point added
      const next = this._points[i];
      const distance = last.distanceTo(next);
      if (distance > minimumSegmentSize) {
        const distanceToEnd = this.to.distanceTo(next);
        if (distanceToEnd > minimumSegmentSize) {
          points.push(next);
        }
      }
    }

    points.push(this.to);
    return new Polyline(points);
  }

  /***
   * Returns true if the other polyline has the same points.
   * @param otherPolyline   Polyline to compare against.
   * @param tolerance       The amount the points can differ and still be considered equal.
   */
  public equals(otherPolyline: Polyline, tolerance = shapetypesSettings.absoluteTolerance): boolean {
    if (this._points.length !== otherPolyline.points.length) {
      return false;
    }

    const isEqual = this._points.every((point, index) => point.equals(otherPolyline.points[index], tolerance));
    return isEqual;
  }

  /**
   * Returns the parameters where this polyline intersects with other geometry.
   *
   * Note: This is an alias for the [[Intersection.polyline]] function.
   *
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
    return Intersection.polyline(this, otherGeom);
  }

  /**
   * Returns a closed copy of the polyline.
   * If the polyline is already closed, returns itself.
   * If the polyline is open, closes it by adding a segment between [[to]] and [[from]].
   */
  public makeClosed(): Polyline {
    if (this.isClosed) {
      return this;
    }
    const points = this._points.concat(this.from);
    return new Polyline(points);
  }

  /**
   * Returns a copy of the polyline with any colinear segments merged together.
   * @param angleTolerance  The minimum angle at which segments are no longer colinear, in radians.
   * @param includeSeam     If true, will also test seam on closed polylines for colinearity. If they are colinear, will move [[from]] and [[to]] points.
   */
  public mergeColinearSegments(
    angleTolerance: number = shapetypesSettings.angleTolerance,
    includeSeam: boolean = true
  ): Polyline {
    const points = Array<Point>();
    points.push(this.from);

    for (let i = 1; i < this._points.length - 1; i++) {
      const last = points[points.length - 1]; // last point added
      const current = this._points[i];
      const next = this._points[i + 1];
      if (
        !Vector.fromPoints(last, current).isParallelTo(
          Vector.fromPoints(current, next),
          angleTolerance
        )
      ) {
        points.push(current);
      }
    }

    if (includeSeam) {
      if (this.isClosed) {
        const last = points[points.length - 1];
        const current = this.to;
        const next = points[1];
        if (
          Vector.fromPoints(last, current).isParallelTo(
            Vector.fromPoints(current, next),
            angleTolerance
          )
        ) {
          // The start and end point are colinear
          points.shift(); // Remove the start point
          points.push(next); // Finish at the next point rather than the true end.
          return new Polyline(points);
        }
      }
    }

    points.push(this.to);
    return new Polyline(points);
  }

  /**
   * Returns the normal to the polyline at a given parameter.
   * If the polyline is closed, will always return the normal that points towards the inside.
   * If the polyline is open, vector will be on the left side of the segment (which is the right side if the environment's y-axis points downwards).
   * @param u   Position on the polyline to calculate the normal (see [[pointAt]] for explanation)
   * @returns   A unit vector
   */
  public normalAt(u: number): Vector {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);

    const unit = segment.unitTangent;
    if (this.isClosed) {
      if (this.orientation() === CurveOrientation.clockwise) {
        return unit.reverse();
      } else {
        return unit;
      }
    }
    return unit;
  }

  /**
   * Returns whether a closed polyline is in a clockwise or counterclockwise orientation.
   * If the polyline is not closed, returns [[CurveOrientation.undefined]].
   *
   * @param isYDown If the environment's y-axis points downwards, this should be set to `true`. Otherwise clockwise and counterclockwise will be inverted.
   */
  public orientation(isYDown: boolean = false): CurveOrientation {
    if (this.isClosed === false) {
      // Curve must be closed to have an orientation
      return CurveOrientation.undefined;
    }

    // Based on: https://stackoverflow.com/questions/46763647/how-to-reverse-the-array-in-typescript-for-the-following-data
    if(isYDown) {
      if (this._cacheOrientationYDown === undefined) {
        const result = this.segments.reduce((accumulator, segment) => accumulator + ((segment.to.x - segment.from.x) * (segment.to.y + segment.from.y)), 0);
        this._cacheOrientationYDown =
          result > 0
            ? CurveOrientation.counterclockwise
            : CurveOrientation.clockwise;
      }
      return this._cacheOrientationYDown;
    } else {
      if (this._cacheOrientationYUp === undefined) {
        const result = this.segments.reduce((accumulator, segment) => accumulator + ((segment.to.x - segment.from.x) * (segment.to.y + segment.from.y)), 0);
        this._cacheOrientationYUp =
          result > 0
            ? CurveOrientation.clockwise
            : CurveOrientation.counterclockwise;
      }
      return this._cacheOrientationYUp;
    }
  }

  /**
   * Returns the point at a given parameter along the polyline. The integer represents
   * the segment and the fraction represents the position on that segment (similar to [[Line.pointAt]]).
   *
   * ### Example
   * ```js
   * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
   *
   * // The start point of the polyline
   * console.log(triangle.pointAt(0).toString());
   * // => (0,0)
   *
   * // The first point of the polyline
   * console.log(triangle.pointAt(1).toString());
   * // => (1,1)
   *
   * // The second point of the polyline
   * console.log(triangle.pointAt(2).toString());
   * // => (2,0)
   *
   * // The point midway between the polyline's first and second point.
   * console.log(triangle.pointAt(1.5).toString());
   * // => (1.5,0.5)
   * ```
   *
   * @param u   Position on the polyline
   */
  public pointAt(u: number): Point {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);
    const parameter = u - index;
    return segment.pointAt(parameter);
  }

  /**
   * Returns a segment of the polyline.
   *
   * @param index   An integer representing the index of the segment.
   * segmentAt(0) will return the line between points[0] and points[1]
   * segmentAt(3) will return the line between points[3] and points[4]
   */
  public segmentAt(index: number): Line {
    const i = Math.floor(index);

    if (i < 0) {
      throw new RangeError('Index must be greater than 0');
    } else if (i >= this.points.length) {
      throw new RangeError('Index must be less than points.length');
    }

    return new Line(this.points[i], this.points[i + 1]);
  }

  /**
   * Returns a copy of the polyline trimmed to the sub-domain.
   * @param domain  The section of the polyline to return. domain.min will be the
   * start of the new polyline, domain.max will be the end of the new polyline.
   * Positions are calculated using same method as [[pointAt]].
   */
  public trim(domain: IntervalSorted | Interval): Polyline {
    const points = Array<Point>();

    // Start point, if not added in mid points
    if (domain.min !== Math.ceil(domain.min)) {
      points.push(this.pointAt(domain.min));
    }

    // Mid points
    for (let i = Math.ceil(domain.min); i < Math.ceil(domain.max); i++) {
      points.push(this._points[i]);
    }

    // End point
    points.push(this.pointAt(domain.max));

    if (domain instanceof Interval) {
      if (domain.isDecreasing) {
        points.reverse();
      }
    }
    return new Polyline(points);
  }

  /**
   * Returns a copy of the polyline with the points in a reverse order.
   */
  public reverse(): Polyline {
    const points = this._points.concat().reverse();
    return new Polyline(points);
  }

  /**
   * Returns the polyline as a string in the format `[(x1,y1),(x2,y2),(x3,y3)]`
   */
  public toString(): string {
    const strings = new Array<string>();
    for (const p of this._points) {
      strings.push(p.toString());
    }
    return '[' + strings.join(',') + ']';
  }

  // -----------------------
  // CLOSED ONLY
  // -----------------------

  /**
   * Returns the relationship between a point and a polyline.
   *
   * Note: This method only works with closed polylines. It will throw an error if applied to an open polyline.
   *
   * @category Closed
   * @param point       Point to test for containment.
   * @param tolerance   Distance the point can be from the edge of the polyline and still considered coincident.
   */
  public contains(
    point: Point,
    tolerance = shapetypesSettings.absoluteTolerance
  ): PointContainment {
    if (!this.isClosed) {
      throw new Error('Polyline must be closed to test for containment');
    }

    // Uses this ray-tracing method: https://en.wikipedia.org/wiki/Point_in_polygon
    // TODO: Switch to winding method since each polyline is ordered already?

    // 1. Before running any of the expensive calculations, quickly check to see if the point is even close to polyline
    if (!this.boundingBox.contains(point, false, tolerance)) {
      return PointContainment.outside;
    }

    // 2. Check to see if the point is coincident with an edge of the polygon
    const closest = this.closestPoint(point);
    if (point.distanceTo(closest) < tolerance) {
      return PointContainment.coincident;
    }

    // 3. Check to see if point is inside polyline using ray casting method
    const intersections = horizontalRayPolyline(point, this);
    const oddOrEven = intersections % 2;
    if (oddOrEven === 1) {
      // If the ray crosses the boundary of the polygon an odd amount of times, the point must be inside
      return PointContainment.inside;
    }

    return PointContainment.outside;
  }

  /**
   * Returns a copy of the polyline with a given [[CurveOrientation]].
   * If the polyline already has that orientation, returns self.
   *
   * Note: This method only works with closed polylines. It may throw an error if applied to an open polyline.
   *
   * @category Closed
   * @param goal      The new [[CurveOrientation]] of the polyline.
   */
  public withOrientation(goal: CurveOrientation, isYDown: boolean = false): Polyline {
    if (this.isClosed === false && goal !== CurveOrientation.undefined) {
      throw new Error('Polyline must be closed to have an orientation');
    }

    const current = this.orientation(isYDown);
    if (current === goal || current === CurveOrientation.undefined) {
      return this;
    }
    return this.reverse();
  }

  /**
   * Returns the polyline in the GeoJSON format.
   */
  public asGeoJSON(): Ring {
    // Converts polyline into specific format needed by the PolygonClipping library.
    // see: https://github.com/mfogel/polygon-clipping/issues/76
    if (this._cacheGeoJSON === undefined) {
      const ring : Ring = this.points.map(point => [point.x, point.y]);
      this._cacheGeoJSON = ring;
    }
    return this._cacheGeoJSON;
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the polyline transformed by a [[transform]] matrix.
   *
   * ### Example
   * ```js
   *
   * import { Polyline } from 'shapetypes'
   *
   * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
   * console.log(shifted.from.toString());
   * // => [0,0]
   *
   * const tran = Transform.translate(new Vector(3,4);
   * const shifted = triangle.transform(tran);
   * console.log(shifted.from.toString());
   * // => [3,4]
   *
   * // Direct method
   * const otherShifted = triangle.translate(new Vector(3, 4));
   * console.log(otherShifted.from.toString());
   * // => [3,4]
   * ```
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @category Transform
   * @param change  A [[transform]] matrix to apply to the polyline
   */
  public transform(change: Transform): this {
    const corners = change.transformPoints(this.points);

    // @ts-ignore
    return new Polyline(corners);
  }
}
