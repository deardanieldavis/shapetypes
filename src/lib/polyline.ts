/* tslint:disable:no-let */
import { difference as pcDifference, intersection as pcIntersection, Pair, Ring, union as pcUnion } from 'polygon-clipping';
import { BoundingBox } from './boundingBox';
import { Intersection } from './intersection';
import { IntervalSorted } from './intervalSorted';
import { Line } from './line';
import { Plane } from './plane';
import { Point } from './point';
import { fromGeoJSON, Polygon } from './polygon';
import { shapetypesSettings } from './settings';
import { Transform } from './transform';
import { CurveOrientation, PointContainment } from './utilities';
import { Vector } from './vector';

export class Polyline {
  // -----------------------
  // STATIC
  // -----------------------
  public static fromCoords(
    points: readonly number[],
    makeClosed: boolean = false
  ): Polyline {
    const newPoints = new Array<Point>();
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      newPoints.push(new Point(x, y));
    }
    if (makeClosed) {
      if (!newPoints[0].equals(newPoints[newPoints.length - 1])) {
        newPoints.push(newPoints[0]);
      }
    }
    return new Polyline(newPoints, false);
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
  private _cacheOrientation: CurveOrientation | undefined;
  private _cacheSegments: readonly Line[] | undefined;

  // -----------------------
  // CONSTRUCTOR
  // -----------------------
  /**
   * Polyline can either be constructed from:
   * 1. a list of points [p1, p2, p3]
   * 2. or from a list of x-y coordinates in this format: [x1,y1,x2,y2,x3,y3]
   *
   * @param points
   */
  constructor(points: readonly Point[], makeClosed: boolean = false) {
    if (makeClosed) {
      if (!points[0].equals(points[points.length - 1])) {
        // If the start point is different from the final point
        let finalPoints = new Array<Point>();
        finalPoints = points.concat();
        finalPoints.push(points[0]);
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
   * Returns area of closed polyline. If polyline isn't closed, returns 0.
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

  /**
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
   * Returns true if [[from]] is the same as [[to]].
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
      let length = 0;
      for (const segment of this.segments) {
        length += segment.length;
      }
      this._cacheLength = length;
    }
    return this._cacheLength;
  }

  /**
   * Returns whether a closed polyline is in a clockwise or counterclockwise orientation.
   * If the polyline is not closed, returns CurveOrientation.undefined.
   */
  get orientation(): CurveOrientation {
    if (this.isClosed === false) {
      // Curve must be closed to have an orientation
      return CurveOrientation.undefined;
    }

    if (this._cacheOrientation === undefined) {
      // Based on: https://stackoverflow.com/questions/46763647/how-to-reverse-the-array-in-typescript-for-the-following-data
      let result = 0;
      for (const segment of this.segments) {
        result +=
          (segment.to.x - segment.from.x) * (segment.to.y + segment.from.y);
      }
      // tslint:disable-next-line:prefer-conditional-expression
      if (shapetypesSettings.invertY) {
        // When the y-axis is inverted, the rotation is opposite as well.
        this._cacheOrientation =
          result > 0
            ? CurveOrientation.counterclockwise
            : CurveOrientation.clockwise;
      } else {
        this._cacheOrientation =
          result > 0
            ? CurveOrientation.clockwise
            : CurveOrientation.counterclockwise;
      }
    }

    return this._cacheOrientation;
  }

  /**
   * Returns the list of points that make the corners of this polyline.
   */
  get points(): readonly Point[] {
    return this._points;
  }

  /**
   * Returns the number of segments (edges between corners) that makeup this polyline.
   */
  get segmentCount(): number {
    return this._points.length - 1;
  }

  /**
   * Returns the list of segments that makeup the edges of this polyline.
   */
  get segments(): readonly Line[] {
    if (this._cacheSegments === undefined) {
      const lines = new Array<Line>(this._points.length - 1);

      for (let i = 0; i < this.points.length - 1; i++) {
        const next = i + 1;
        const line = new Line(this.points[i], this.points[next]);
        lines[i] = line;
      }
      this._cacheSegments = lines;
    }
    return this._cacheSegments;
  }

  /**
   * Returns final point of the polyline.
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
   * Returns the index of closest point in the list of [[points]].
   * @param testPoint   The point to get closest to.
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

  /**
   * Returns the parameter of the closest point on the polyline. Parameter can
   * be used in [[pointAt]] to return the point.
   *
   * @param point   The point to get closest to.
   */
  public closestParameter(point: Point): number {
    let closestLength: number | undefined;
    let closestParameter = 0;

    for (let i = 0; i < this.segments.length; i++) {
      const edge = this.segments[i];
      const test = edge.closestParameter(point, true);
      const p = edge.pointAt(test);
      const length = point.distanceTo(p);

      if (closestLength === undefined || length < closestLength) {
        closestLength = length;
        closestParameter = i + test;
      }
    }

    return closestParameter;
  }

  /**
   * Returns the closest point on the edge of the polyline
   * @param point  The point to get closest to.
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
   * Returns a copy of the polyline with short segments removed. Moves along length
   * of polyline and removes any point closer to the previous point than the
   * `tolerance`. Does not remove start or end points.
   * @param tolerance   The minimum allowable distance between points
   */
  public deleteShortSegments(
    tolerance: number = shapetypesSettings.absoluteTolerance
  ): Polyline {
    const points = Array<Point>();
    points.push(this.from);

    // Start at 1 and end at -1 because the `from` and `to` points are added separately.
    for (let i = 1; i < this._points.length - 1; i++) {
      const last = points[points.length - 1]; // last point added
      const next = this._points[i];
      const distance = last.distanceTo(next);
      if (distance > tolerance) {
        const distanceToEnd = this.to.distanceTo(next);
        if (distanceToEnd > tolerance) {
          points.push(next);
        }
      }
    }

    points.push(this.to);
    return new Polyline(points);
  }

  /**
   * Returns true if two polylines have the equal number of points in the same position.
   * @param otherPolyline
   */
  public equals(otherPolyline: Polyline): boolean {
    if (this._points.length !== otherPolyline.points.length) {
      return false;
    }

    for (let i = 0; i < this._points.length; i++) {
      const mine = this._points[i];
      const other = otherPolyline.points[i];
      if (!mine.equals(other)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a closed copy of this polyline. If the polyline is already closed, returns itself.
   * If the polyline is open, closes it by adding a segment from the end point [[to]]
   * and the start point [[from]].
   */
  public makeClosed(): Polyline {
    if (this.isClosed) {
      return this;
    }
    let points = new Array<Point>();
    points = this._points.concat();
    points.push(this.from);
    return new Polyline(points);
  }

  /**
   * Returns a copy of this polyline with any colinear segments merged together.
   * @param angleTolerance  The minimum angle at which segments are no longer colinear. In radians.
   */
  public mergeColinearSegments(
    angleTolerance: number = shapetypesSettings.angleTolerance
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
    points.push(this.to);
    return new Polyline(points);
  }

  /**
   * Returns the normal to the polyline at a given parameter.
   * If the polyline is closed, will always return the normal that points towards the inside.
   * If the polyline is open and if shapetypesSettings.invertY is true, will be on the right side of the segment.
   * If the polyline is open and if shapetypesSettings.invertY is false (the default), will be on the left side of the segment.
   * @param u: Distance along polyline to take the normal
   * @returns   A unit vector
   */
  public normalAt(u: number): Vector {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);

    const unit = segment.unitTangent;
    if (this.isClosed) {
      if (this.orientation === CurveOrientation.clockwise) {
        if (shapetypesSettings.invertY) {
          return unit;
        }
        return unit.reverse();
      } else {
        if (shapetypesSettings.invertY) {
          return unit.reverse();
        }
        return unit;
      }
    }
    return unit;
  }

  /**
   * Gets the point at the parameter on the polyline
   * The integer is the segment, and the fraction is the normalized parameter of the segment.
   *
   * Eg.
   * pointAt(2.5)
   * Will get the point in the middle of the second line segment (or segmentAt(2))
   *
   * @param u
   */
  public pointAt(u: number): Point {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);
    const parameter = u - index;
    return segment.pointAt(parameter);
  }

  /**
   * Gets a segment of the polyline
   *
   * Eg.
   * segmentAt(0) will return the line between point[0] and point[1]
   * segmentAt(3) will return the line between point[3] and point[4]
   * @param index: An integer representing the index of the segment
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

  public trim(domain: IntervalSorted): Polyline {
    const points = Array<Point>();
    points.push(this.pointAt(domain.min));

    for (let i = Math.ceil(domain.min); i < Math.ceil(domain.max); i++) {
      points.push(this._points[i]);
    }
    points.push(this.pointAt(domain.max));
    return new Polyline(points);
  }

  /**
   * Reverses the order the points are in.
   */
  public reverse(): Polyline {
    let points = Array<Point>();
    points = this._points.concat();
    points.reverse();
    return new Polyline(points);
  }

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
   * Calculates whether a point is inside the polyline
   *
   * Uses this ray-tracing method: https://en.wikipedia.org/wiki/Point_in_polygon
   * TODO: Optimizaiton: Don't need to run the closest point test. Could get this data from the line intersection u values
   *          eg. if the u value is ~0, the line intersected near the point and is coincident.
   *          Need to be careful of horizontal lines that run parallel to the intersection ray as they might not be picked up.
   *
   * @param point
   */
  public contains(
    point: Point,
    tolerance = shapetypesSettings.absoluteTolerance
  ): PointContainment {
    if (!this.isClosed) {
      throw new Error('Polyline must be closed to test for containment');
    }

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
    const intersections = Intersection.HorizontalRayPolyline(point, this);
    const oddOrEven = intersections.length % 2;
    if (oddOrEven === 1) {
      // If the ray crosses the boundary of the polygon an odd amount of times, the point must be inside
      return PointContainment.inside;
    }

    return PointContainment.outside;
  }

  /**
   * Returns a copy of the polyline in the correct [[CurveOrientation]]. If the
   * polyline is already in correct orientation, returns self. If polyline is in
   * wrong orientation, returns the reverse. If polyline isn't closed, throws an error.
   * @param goal  The
   */
  public withOrientation(goal: CurveOrientation): Polyline {
    if (this.isClosed === false && goal !== CurveOrientation.undefined) {
      throw new Error('Polyline must be closed to have an orientation');
    }

    const current = this.orientation;
    if (current === goal || current === CurveOrientation.undefined) {
      return this;
    }
    return this.reverse();
  }

  // -----------------------
  // BOOLEAN
  // -----------------------

  // Boolean functions use this library, which seems to be pretty fast and handles all edge cases:
  // https://github.com/mfogel/polygon-clipping

  // Help with typescript:
  // https://github.com/mfogel/polygon-clipping/issues/76

  /**
   * Joins this polyline with another polyline.
   * @param joiner
   * @returns:    A new polyline representing the two polylines joined together.
   *              Note: may return two polylines if the original polylines don't overlap
   */
  public union(joiner: Polyline): ReadonlyArray<Polyline | Polygon> {
    if (this.isClosed === false || joiner.isClosed === false) {
      throw new Error('Both polylines must be closed');
    }

    const result = pcUnion(
      [this.asGeoJSON()],
      [joiner.asGeoJSON()]
    );
    return fromGeoJSON(result);
  }

  public intersection(
    intersector: Polyline
  ): ReadonlyArray<Polyline | Polygon> {
    if (this.isClosed === false || intersector.isClosed === false) {
      throw new Error('Both polylines must be closed');
    }

    const result = pcIntersection(
      [this.asGeoJSON()],
      [intersector.asGeoJSON()]
    );
    return fromGeoJSON(result);
  }

  public difference(subtractor: Polyline): ReadonlyArray<Polyline | Polygon> {
    if (this.isClosed === false || subtractor.isClosed === false) {
      throw new Error('Both polylines must be closed');
    }

    const result = pcDifference(
      [this.asGeoJSON()],
      [subtractor.asGeoJSON()]
    );
    return fromGeoJSON(result);
  }

  /**
   * Converts polyline into specific format needed by the PolygonClipping library.
   * (see: https://github.com/mfogel/polygon-clipping/issues/76)
   *
   */
  public asGeoJSON(): Ring {
    if (this._cacheGeoJSON === undefined) {
      const ring = new Array<Pair>(this.points.length);
      for (let i = 0; i < this.points.length; i++) {
        ring[i] = [this.points[i].x, this.points[i].y];
      }
      this._cacheGeoJSON = ring;
    }
    return this._cacheGeoJSON;
  }

  // -----------------------
  // TRANSFORMABLE
  // -----------------------

  /**
   * Returns a copy of the BoundingBox transformed by a [[transform]] matrix.
   *
   * ### Example
   * ```js
   * const bb = new BoundingBox(new IntervalSorted(0, 10), new IntervalSorted(5, 25));
   * console.log(bb.area);
   * // => 200
   *
   * const scaled = bb.transform(Transform.scale(2));
   * console.log(scaled.area);
   * // => 800
   *
   * // Direct method
   * const otherScaled = bb.scale(2);
   * console.log(otherScaled.area);
   * // => 800
   * ```
   *
   * Note: If you're applying the same transformation a lot of geometry,
   * creating the matrix and calling this function is faster than using the direct methods.
   *
   * @param change  A [[transform]] matrix to apply to the BoundingBox
   */
  public transform(change: Transform): Polyline {
    const corners = change.transformPoints(this.points);
    return new Polyline(corners);
  }

  /**
   * Returns a copy of the BoundingBox transferred from one coordinate system to another.
   * @param planeFrom   The plane the BoundingBox is currently in.
   * @param planeTo     The plane the BoundingBox will move to.
   * @returns           A copy of the BoundingBox in the same relative position on [[planeTo]] as it was on [[planeFrom]].
   */
  public changeBasis(planeFrom: Plane, planeTo: Plane): Polyline {
    const tran = Transform.changeBasis(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a copy of the BoundingBox transferred from one coordinate system to another.
   * @param planeFrom   The plane the BoundingBox is currently in.
   * @param planeTo     The plane the BoundingBox will move to.
   * @returns           A copy of the BoundingBox in the same relative position on [[planeTo]] as it was on [[planeFrom]].
   */
  public planeToPlane(planeFrom: Plane, planeTo: Plane): Polyline {
    const tran = Transform.planeToPlane(planeFrom, planeTo);
    return this.transform(tran);
  }

  /**
   * Returns a rotated copy of the BoundingBox
   * @param angle   Angle to rotate the BoundingBox in radians.
   * @param pivot   Point to pivot the BoundingBox about. Defaults to 0,0.
   */
  public rotate(angle: number, pivot?: Point | undefined): Polyline {
    const tran = Transform.rotate(angle, pivot);
    return this.transform(tran);
  }

  /**
   * Returns a scaled copy of the BoundingBox
   * @param x       Magnitude to scale in x direction
   * @param y       Magnitude to scale in y direction. If not specified, will use x.
   * @param center  Center of scaling. Everything will shrink or expand away from this point.
   */
  public scale(x: number, y?: number, center?: Point): Polyline {
    const tran = Transform.scale(x, y, center);
    return this.transform(tran);
  }

  /**
   * Returns a translated copy of the BoundingBox
   * @param move      Direction to move the BoundingBox.
   * @param distance  Distance to move the BoundingBox. If not specified, will use length of move vector.
   */
  public translate(move: Vector, distance?: number | undefined): Polyline {
    const tran = Transform.translate(move, distance);
    return this.transform(tran);
  }
}
