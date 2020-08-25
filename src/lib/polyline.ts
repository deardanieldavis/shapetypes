// tslint:disable:no-let
// tslint:disable:readonly-array
import { BoundingBox } from './boundingBox';
import { Intersection } from './intersection';
import { Line } from './line';
import { Point } from './point';
import { fromGeoJSON, Polygon } from './polygon';
import { shapetypesSettings } from './settings';
import { isNumberArray, isPointArray } from './utilities';
import { Vector } from './vector';

import * as PolygonClipping from 'polygon-clipping';
// tslint:disable-next-line:no-duplicate-imports
import { Pair, Ring } from 'polygon-clipping';

export enum PointContainment {
  unset,
  inside,
  outside,
  coincident
}

export enum CurveOrientation {
  undefined,
  clockwise,
  counterclockwise
}

export class Polyline {
  private _boundingBox: BoundingBox | undefined;
  private _points: Point[];
  private _cacheGeoJSON: Ring | undefined;

  /**
   * Polyline can either be constructed from:
   * 1. a list of points [p1, p2, p3]
   * 2. or from a list of x-y coordinates in this format: [x1,y1,x2,y2,x3,y3]
   *
   * @param points
   */
  constructor(points: readonly Point[] | readonly number[]) {
    if (isNumberArray(points)) {
      const newPoints = new Array<Point>();
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        newPoints.push(new Point(x, y));
      }
      this._points = newPoints;
    } else if (isPointArray(points)) {
      this._points = points;
    } else {
      throw new Error("Couldn't cast point constructor");
    }
  }

  // -----------------------
  // GET & SET
  // -----------------------

  /**
   * List of points that make the corners of this polyline.
   */
  get points(): readonly Point[] {
    return this._points;
  }

  /**
   * @returns: True if end point is the same as the start point.
   */
  get isClosed(): boolean {
    if (this._points[0].equals(this._points[this._points.length - 1])) {
      return true;
    }
    return false;
  }

  get segmentCount(): number {
    return this._points.length - 1;
  }

  /**
   * Generates a list of edges that makeup this polyline.
   */
  public getSegments(): readonly Line[] {
    const lines = new Array<Line>(this._points.length - 1);

    for (let i = 0; i < this.points.length - 1; i++) {
      const next = i + 1;
      const line = new Line(this.points[i], this.points[next]);
      lines[i] = line;
    }
    return lines;
  }

  /**
   * Area of the polyline
   * Uses formula from: https://stackoverflow.com/questions/451426/how-do-i-calculate-the-area-of-a-2d-polygon
   */
  get area(): number {
    if (this.isClosed === false) {
      return 0;
    }

    const points = this.points;
    let area = 0;
    for (let i = 1; i + 1 < points.length; i++) {
      const a = Vector.fromPoints(points[0], points[i]);
      const b = Vector.fromPoints(points[0], points[i + 1]);
      area += a.x * b.y - a.y * b.x;
    }
    return Math.abs(area / 2.0);
  }

  /**
   * Calculates the bounding box of the polyline
   */
  get boundingBox(): BoundingBox {
    if (this._boundingBox === undefined) {
      this._boundingBox = BoundingBox.fromPoints(this.points);
    }
    return this._boundingBox;
  }

  /**
   * Checks whether the points in the polyline are in a clockwise order
   *
   * Based on: https://stackoverflow.com/questions/46763647/how-to-reverse-the-array-in-typescript-for-the-following-data
   * @returns: CurveOrientation.clockwise if the points in the polyline are in a clockwise order
   */
  get orientation(): CurveOrientation {
    if (this.isClosed === false) {
      // Curve must be closed to have an orientation
      return CurveOrientation.undefined;
    }

    let result = 0;
    for (const edge of this.getSegments()) {
      result += (edge.to.x - edge.from.x) * (edge.to.y + edge.from.y);
    }
    if (shapetypesSettings.invertY) {
      // When the y-axis is inverted, the rotation is opposite as well.
      if (result > 0) {
        return CurveOrientation.counterclockwise;
      }
      return CurveOrientation.clockwise;
    } else {
      if (result > 0) {
        return CurveOrientation.clockwise;
      }
      return CurveOrientation.counterclockwise;
    }
  }

  /**
   * Ensures the points in the polyline are in a clockwise order
   */
  set orientation(goal: CurveOrientation) {
    if (this.isClosed === false && goal !== CurveOrientation.undefined) {
      throw new Error('Polyline must be closed to have an orientation');
    }

    const current = this.orientation;
    if (current === goal || current === CurveOrientation.undefined) {
      return;
    }
    this.reverse();
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Creates a deep copy of this polyline.
   */
  public duplicate(): Polyline {
    const newPoints = Array<Point>(this._points.length);
    for (let i = 0; i < this._points.length; i++) {
      newPoints[i] = this._points[i].duplicate();
    }
    return new Polyline(newPoints);
  }

  /**
   * Closes the polyline by drawing a line between the end point and the start point.
   */
  public makeClosed(): void {
    if (this.isClosed) {
      return;
    }
    this._points.push(this._points[0].duplicate());
  }

  /**
   * Gets the point at the parameter on the polyline
   * The integer is the segment, and the fraction is the normalized paramter of the segment.
   *
   * Eg.
   * pointAt(2.5)
   * Will get the point in the middle of the second line segment (or segmentAt(2))
   *
   * @param u
   */
  public pointAt(u: number): Point | undefined {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);
    if (segment === undefined) {
      return undefined;
    }

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
  public segmentAt(index: number): Line | undefined {
    const i = Math.floor(index);

    if (i >= this.points.length) {
      return undefined;
    }

    const next = i + 1;
    const line = new Line(this.points[i], this.points[next]);
    return line;
  }

  /**
   * Finds the closest point on the polyline from a given point
   * @param point: Point to search from
   * @return The closest point on the polyline.
   */
  public closestPoint(point: Point): Point {
    let closestLength: number | undefined;
    let closestPoint: Point = point;

    for (const line of this.getSegments()) {
      const test = line.closestPoint(point);
      const length = point.distanceTo(test);

      if (closestLength === undefined || length < closestLength) {
        closestLength = length;
        closestPoint = test;
      }
    }

    return closestPoint;
  }

  /**
   * Gets the parameter of the point closest to a given point.
   *
   * @param point
   * @return: The parameter of the closest point. Undefined if no point is found.
   */
  public closestParameter(point: Point): number {
    let closestLength: number | undefined;
    let closestParameter = 0;

    const edges = this.getSegments();
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const test = edge.closestParameter(point);
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
   * Returns the normal to the polyline at a given parameter.
   * If the polyline is closed, will always return the normal that points towards the inside.
   * If the polyline is open, will always return the normal that points towards the right of the polyline.
   * @param u: Disance along polyline to take the normal
   */
  public normalAt(u: number): Vector | undefined {
    const index = Math.floor(u);
    const segment = this.segmentAt(index);
    if (segment === undefined) {
      return undefined;
    }

    if (this.isClosed) {
      if (this.orientation === CurveOrientation.clockwise) {
        return segment.unitTangent;
      } else {
        const normal = segment.unitTangent;
        normal.reverse();
        return normal;
      }
    }

    return segment.unitTangent;
  }

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
  public contains(point: Point): PointContainment {
    if (this.isClosed === false) {
      throw new Error('Polyline must be closed to test for containment');
    }

    const tolerance = 0.01;

    // 1. Before running any of the expensive calculations, quickly check to see if the point is even close to polyline
    const bb = this.boundingBox.duplicate();
    bb.inflate(tolerance); // Need to inflate the bounding box slightly to account for points that are coincident but just slightly outside
    if (!bb.contains(point)) {
      return PointContainment.outside;
    }

    // 2. Check to see if the point is coincident with an edge of the polygon
    const closest = this.closestPoint(point);
    if (point.distanceTo(closest) < tolerance) {
      return PointContainment.coincident;
    }

    // 3. Check to see if point is inside polyline using raycasting method
    const intersections = Intersection.HorizontalRayPolyline(point, this);
    const oddOrEven = intersections.length % 2;
    if (oddOrEven === 1) {
      // If the ray crosses the boundary of the polygon an odd amount of times, the point must be inside
      return PointContainment.inside;
    }

    return PointContainment.outside;
  }

  /**
   * @returns: True if the polyline is fully within or touching the bounds of this polyline
   * @param polyline
   * TODO: Doesn't check for intersections between the polyline edges
   */
  public containsPolyline(polyline: Polyline): boolean {
    if (this.isClosed === false) {
      throw new Error('Polyline must be closed to test for containment');
    }

    for (const point of polyline.points) {
      const result = this.contains(point);
      if (result === PointContainment.outside) {
        return false;
      }
    }
    return true;
  }

  /**
   * Offsets a polyline a set distance
   *
   * Basic algorithm, doesn't account for edges that might get eliminated in offset
   * TODO: Make algorithm more robust to deal with edge cases, such as short edges or ones that get removed.
   * @param distance
   */
  public offset(distance: number): Polyline {
    const points = this.points;
    const offsetPoints = new Array<Point>();

    for (let i = 0; i < points.length; i++) {
      let before = i - 1;
      if (before < 0) {
        before = points.length - 2;
      } // use -2 rather than -1 because last point is same as first point, so we want the second last point
      let after = i + 1;
      if (after >= points.length) {
        after = 1;
      } // use 1 rather than 0 because start and end are the same, so want the second point

      const pointBefore = points[before];
      const pointCenter = points[i];
      const pointAfter = points[after];

      const v1 = Vector.fromPoints(pointBefore, pointCenter);
      const v2 = Vector.fromPoints(pointAfter, pointCenter);

      v1.unitize();
      v2.unitize();

      // The offset point must lie on the bisector between the two lines that join this point
      const bisector = Vector.add(v1, v2);

      // Want to offset the point the [distance] parallel to the edges
      // This can be calculated by finding the angle between the bisector and the edge
      // removing 90 degrees, so it's the angle between a perpendicular line the the bisector
      // Then using tri to move point along the bisector
      v1.reverse();
      let angle = Vector.vectorAngle(v1, bisector);
      angle = angle - Math.PI / 2;

      const length = distance / Math.cos(angle);

      const offsetPoint = pointCenter.duplicate();
      offsetPoint.translate(bisector, length);
      offsetPoints.push(offsetPoint);
    }
    return new Polyline(offsetPoints);
  }

  /**
   * Reverses the order the points are in.
   */
  public reverse(): void {
    this._points.reverse();
  }

  public toString(): string {
    let string = '';
    for (const p of this._points) {
      string += '[' + p.toString() + '], ';
    }
    return string;
  }

  /**************************************
   * BOOLEAN
   **************************************/
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

    const result = PolygonClipping.union(
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

    const result = PolygonClipping.intersection(
      [this.asGeoJSON()],
      [intersector.asGeoJSON()]
    );
    return fromGeoJSON(result);
  }

  public difference(subtractor: Polyline): ReadonlyArray<Polyline | Polygon> {
    if (this.isClosed === false || subtractor.isClosed === false) {
      throw new Error('Both polylines must be closed');
    }

    const result = PolygonClipping.difference(
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
}
