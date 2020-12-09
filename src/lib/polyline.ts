/* tslint:disable:no-let */
import { Ring } from 'polygon-clipping';
import { horizontalRayPolyline } from './intersection/horizontalRay';
import {
  approximatelyEqual,
  CurveOrientation,
  PointContainment
} from './utilities';

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
 * A continuous line made from a series of straight [[segments]].
 * An array of [[points]] defines the corners of the polyline.
 *
 * If the polyline's start and end point are the same, it is considered closed.
 * This can be checked with [[isClosed]].
 * Some operations, such as [[contains]], only work with closed polylines.
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
   * Creates a polyline from a list of corner coordinates (in the GeoJSON format).
   * @category Create
   * @param coordinates   List of points in the format `[[x1,y1],[x2,y2],[x3,y3],...]`
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
   * @note  Doesn't verify that this is a valid polyline. It is possible to
   * create a polyline with self-intersection or zero-length segments, which may cause problems in some functions.
   *
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
   * Gets the area enclosed by the polyline. If the polyline isn't closed, returns 0.
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
   * Gets the smallest bounding box that contains the polyline.
   */
  get boundingBox(): BoundingBox {
    if (this._cacheBoundingBox === undefined) {
      this._cacheBoundingBox = BoundingBox.fromPoints(this.points);
    }
    return this._cacheBoundingBox;
  }

  /**
   * Gets the number of points in the polyline.
   */
  get count(): number {
    return this._points.length;
  }

  /**
   * Gets the starting point of the polyline.
   */
  get from(): Point {
    return this._points[0];
  }

  /**
   * Checks whether the polyline starts and ends in the same place (that [[from]] equals [[to]]).
   * Returns true if it does.
   */
  get isClosed(): boolean {
    if (this._cacheClosed === undefined) {
      this._cacheClosed = this.from.equals(this.to);
    }
    return this._cacheClosed;
  }

  /**
   * Gets the length of the polyline.
   */
  get length(): number {
    if (this._cacheLength === undefined) {
      const length = this.segments.reduce((accumulator, segment) => accumulator + segment.length, 0);
      this._cacheLength = length;
    }
    return this._cacheLength;
  }

  /**
   * Gets the points that define the corners of the polyline.
   */
  get points(): readonly Point[] {
    return this._points;
  }

  /**
   * Gets the number of segments in the polyline.
   */
  get segmentCount(): number {
    return this._points.length - 1;
  }

  /**
   * Gets the segments (or edges) of the polyline.
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
   * Gets the end of the polyline.
   */
  get to(): Point {
    return this._points[this._points.length - 1];
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Calculates the weighted average of all segments and returns the result.
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
   * Finds the closest point in the list of [[points]] and returns its index.
   * @param testPoint   The target to get closest to.
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
   * Finds the closest point on the polyline and returns the parameter for the point.
   *
   * @param testPoint   The target to get closest to.
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
   * Finds the closest point on the polyline and returns the point.
   * @param testPoint       Target to get closest to.
   * @param includeInterior If false, the closest point must lie on a segment of the polyline.
   *                        If true, the closest point can also be a point on the polyline's interior (if it is closed and has an interior).
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
   * Creates a copy of the polyline with short segments removed. This is achieved by
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
   * Checks whether another polyline has the same points. Returns true if it does.
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

  /***
   * Calculates where the polyline intersects other geometry and returns the parameters
   * for these points of intersection.
   *
   * @note              This is an alias for the [[Intersection.polyline]] function.
   * @note              Only accounts for crossings, not coincident overlaps.
   *
   * @param otherGeom   The geometry to intersect.
   * @returns           The parameters of the intersection points.
   *                    The array is always sorted from the smallest to largest parameter.
   *                    Entering the parameter into [[pointAt]] will return the intersection point.
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
   * Creates a copy of the polyline with colinear segments merged together.
   * This is achieved by traveling along the polyline and merging any segments that travel in the same direction.
   * @param angleTolerance  The minimum angle at which segments are no longer colinear (in radians).
   * @param includeSeam     If true, it will also test seam on closed polylines for colinearity. If they are colinear, will move [[from]] and [[to]] points.
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
      const angle = Vector.fromPoints(last, current).angleSigned(Vector.fromPoints(current, next));
      if(! approximatelyEqual(angle, 0, angleTolerance)) {
        points.push(current);
      }
    }

    if (includeSeam) {
      if (this.isClosed) {
        const last = points[points.length - 1];
        const current = this.to;
        const next = points[1];
        const angle = Vector.fromPoints(last, current).angleSigned(Vector.fromPoints(current, next));
        if(approximatelyEqual(angle, 0, angleTolerance)) {
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
   * Calculates the normal to the polyline at a given parameter.
   *
   * If the polyline is closed, it will always return the normal that points towards the inside.
   * If the polyline is open, the vector will be on the left side of the segment (which is the right side if the environment's y-axis points downwards).
   *
   * @note  At corners where two segments join, returns the normal to the segment with the smallest index.
   *
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
   * Calculates whether a polyline is in a clockwise or counter-clockwise orientation and returns the result.
   * If the polyline is not closed, it can't have an orientation, so the function returns [[CurveOrientation.undefined]].
   *
   * @param isYDown   The function assumes that the environment's y-axis points upwards.
   *                  In environments where the y-axis points downwards, `isYDown` should be set to `true`.
   *                  This inverts clockwise and counter-clockwise to ensure that
   *                  they are in the correct orientation for how you're viewing them.
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
   * Finds the point a normalized parameter along the polyline. Returns the point.
   *
   * Each segment of the polyline is parameterized from 0 to 1 (like [[Line.pointAt]]).
   * So `0` is the start of the first segment, and `1` is the end.
   * `0.5` is the mid point of the first segment, and `1.5` is the mid point of the second segment.
   *
   * ### Example
   * ```js
   * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
   *
   * // The start of first segment
   * console.log(triangle.pointAt(0).toString());
   * // => (0,0)
   *
   * // Mid point of first segment
   * console.log(triangle.pointAt(0.5).toString());
   * // => (0.5,0.5)
   *
   * // The end of first segment / start of second segment
   * console.log(triangle.pointAt(1).toString());
   * // => (1,1)
   *
   * // Mid point of second segment
   * console.log(triangle.pointAt(1.5).toString());
   * // => (1.5,0.5)
   *
   * ```
   *
   * @param u   The normalized parameter.
   */
  public pointAt(u: number): Point {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);
    const parameter = u - index;
    return segment.pointAt(parameter);
  }

  /**
   * Gets a segment of the polyline.
   *
   * @param index   The index of the segment.
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
   * Extracts a section of the polyline. Returns the resulting polyline.
   * @param domain  The section of the polyline to extract. The domain contains
   * two numbers, the `min`, which is the parameter for the start of the new polyline.
   * And the `max`, which will be the end. Everything between these two points is included
   * in the new polyline. The position of the domain is calculated using the same method as [[pointAt]].
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
   * Creates a copy of the polyline with the points in reverse order.
   */
  public reverse(): Polyline {
    const points = this._points.concat().reverse();
    return new Polyline(points);
  }

  /**
   * Gets the polyline as a string in the format: `[(x1,y1),(x2,y2),(x3,y3)]`.
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

  /***
   * Checks whether a point is inside, outside, or on the edge of a polyline.
   *
   * @note This method only works with closed polylines. It will throw an error if applied to an open polyline.
   *
   * @category Closed
   * @param point       The point to test for containment.
   * @param tolerance   The distance the point can be from the edge of the polyline and still considered coincident.
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
   * @note This method only works with closed polylines. It may throw an error if applied to an open polyline.
   *
   * @category Closed
   * @param goal      The desired orientation of the new polyline.
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
   * Gets the polyline in the GeoJSON format: `[[x1,y1],[x2,y2],...]`.
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

  /***
   * Transforms the polyline by a [[transform]] matrix and returns the result.
   *
   * ### Example
   * ```js
   *
   * import { Polyline } from 'shapetypes'
   *
   * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
   * console.log(shifted.from.toString());
   * // => (0,0)
   *
   * // Using a transform matrix
   * const matrix = Transform.translate(new Vector(3,4);
   * const shifted = triangle.transform(matrix);
   * console.log(shifted.from.toString());
   * // => (3,4)
   *
   * // Using direct method
   * const otherShifted = triangle.translate(new Vector(3, 4));
   * console.log(otherShifted.from.toString());
   * // => (3,4)
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the polyline.
   */
  public transform(change: Transform): this {
    const corners = change.transformPoints(this.points);

    // @ts-ignore
    return new Polyline(corners);
  }
}
