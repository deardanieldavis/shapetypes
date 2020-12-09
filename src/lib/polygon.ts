/* tslint:disable:readonly-array no-let */

import {
  difference as pcDifference,
  intersection as pcIntersection,
  MultiPolygon,
  Polygon as pcPolygon,
  Ring,
  union as pcUnion
} from 'polygon-clipping';
import { isPolygonArray, isPolylineArray } from './utilities';

import {
  BoundingBox,
  CurveOrientation,
  Geometry,
  Point,
  PointContainment,
  Polyline,
  shapetypesSettings,
  Transform
} from '../index';

/**
 * A two-dimensional shape with an outer [[boundary]] and a set of interior [[holes]] (optional).
 *
 * The boundary is always in a counter-clockwise orientation, and the holes are always clockwise.
 * If the environment's y-axis points downwards, the boundary will appear to be clockwise, and the
 * holes will appear to be counter-clockwise.
 *
 * ### Example
 * ```js
 * import { Polygon } from 'shapetypes'
 *
 * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
 * const polygon = new Polygon(triangle);
 * console.log(polygon.area);
 * // => 1
 *
 * console.log(polygon.contains(new Point(1, 0.5));
 * // => True
 * console.log(polygon.boundary.from.toString());
 * // => [0,0]
 *
 *
 * const outer = new Rectangle(Plane.worldXY(), 10, 10).toPolyline();
 * const outerPolygon = new Polygon(polyline);
 * console.log(outerPolygon.area);
 * // => 100
 *
 * const subtracted = outerPolygon.difference(triangle);
 * console.log(subtracted[0].area);
 * // => 99
 *
 * console.log(subtracted.contains(new Point(1, 0.5));
 * // => False
 *
 * ```
 *
 *
 */
export class Polygon extends Geometry {
  // -----------------------
  // STATIC
  // -----------------------

  /**
   * Creates a polygon from a list polylines (in the GeoJSON format).
   * The first polyline is the boundary and any subsequent polylines are the holes.
   *
   * @note  May throw an error if coordinates do not form a closed polyline.
   * @category Create
   * @param coordinates   List of points in the format `[[[b_x1,b_y1],[b_x2,b_y2],...], [[h_x1,h_y1],[h_x2,h_y2],...],...]`.
   */
  public static fromCoords(coordinates: pcPolygon): Polygon {
    if (coordinates.length === 0) {
      throw new RangeError('Coordiante of polygon must have a length');
    } else if (coordinates.length === 1) {
      const boundary = Polyline.fromCoords(coordinates[0]);
      return new Polygon(boundary);
    } else {
      const boundary = Polyline.fromCoords(coordinates[0]);
      const holes = new Array<Polyline>();
      for (let i = 1; i < coordinates.length; i++) {
        holes.push(Polyline.fromCoords(coordinates[i]));
      }
      return new Polygon(boundary, holes);
    }
  }

  // -----------------------
  // VARS
  // -----------------------
  private readonly _boundary: Polyline;
  private readonly _holes: readonly Polyline[];

  /***
   * Creates a polygon from an outer boundary and a list of holes.
   *
   * @note  Doesn't verify that this is a valid polygon. It is possible to
   * create a polygon with self-intersection, zero-length segments, or holes in weird places.
   * This may cause problems in some functions.
   *
   * @note  Will throw an error if the boundary or holes aren't closed.
   *
   * @param boundary  The outer edge of the polygon (must be a closed polyline).
   * @param holes     An optional list of holes cut from the interior of the polygon (must be closed polylines).
   */
  constructor(boundary: Polyline, holes?: readonly Polyline[] | undefined) {
    super();
    if (boundary.isClosed === false) {
      throw new Error('Boundary must be closed to turn into polygon');
    }
    this._boundary = boundary.withOrientation(
      CurveOrientation.counterclockwise
    );

    if (holes === undefined) {
      this._holes = new Array<Polyline>();
    } else {
      const newHoles = new Array<Polyline>();
      for (const hole of holes) {
        if (hole.isClosed === false) {
          throw new Error('Hole must be closed to turn into polygon');
        }
        newHoles.push(hole.withOrientation(CurveOrientation.clockwise));
      }
      this._holes = newHoles;
    }
  }

  // -----------------------
  // GET
  // -----------------------

  /**
   * Gets the area of the polygon. Holes are not included in the area.
   */
  get area(): number {
    const area = this._holes.reduce(
      (accumulator, hole) => accumulator - hole.area,
      this._boundary.area
    );
    return area;
  }

  /**
   * Gets the polyline that defines the outer edge of the polygon.
   */
  get boundary(): Polyline {
    return this._boundary;
  }

  /***
   * Gets the smallest bounding box that contains the boundary of the polygon.
   *
   */
  get boundingBox(): BoundingBox {
    return this._boundary.boundingBox;
  }

  /**
   * Gets the list of holes (if any) that define the subtracted regions of the polygon.
   */
  get holes(): readonly Polyline[] {
    return this._holes;
  }

  // -----------------------
  // PUBLIC
  // -----------------------

  /**
   * Finds the closest boundary or hole. Returns the polyline defining the closest boundary or hole.
   *
   * @param testPoint  The target to get closest to.
   */
  public closestLoop(testPoint: Point): Polyline {
    let closestLength: number | undefined;
    let closestLoop: Polyline = this._boundary;

    for (const polyline of [this.boundary, ...this.holes]) {
      const test = polyline.closestPoint(testPoint);
      const length = testPoint.distanceTo(test);

      if (closestLength === undefined || length < closestLength) {
        closestLength = length;
        closestLoop = polyline;
      }
    }

    return closestLoop;
  }

  /***
   * Finds the closest point on the polygon and returns the point. This point could
   * be on the edge of the [[boundary]] or one of the [[holes]],
   * or it could be a point within the interior of the polygon.
   *
   * @param testPoint  The target to get closest to.
   */
  public closestPoint(testPoint: Point): Point {
    if (this.contains(testPoint) === PointContainment.inside) {
      return testPoint;
    }

    let closestLength: number | undefined;
    let closestPoint: Point = testPoint;

    for (const polyline of [this._boundary, ...this._holes]) {
      if (closestLength !== undefined) {
        // Rather than running closest point on every polyline, quickly check to see
        // if the polyline's bounding box is close. If it's not, there is no way the polyline
        // can be close.
        const closestBB = polyline.boundingBox.closestPoint(testPoint, true);
        const lengthBB = testPoint.distanceTo(closestBB);
        if (lengthBB > closestLength) {
          continue;
        }
      }
      const test = polyline.closestPoint(testPoint);
      const length = testPoint.distanceTo(test);

      if (closestLength === undefined || length < closestLength) {
        closestLength = length;
        closestPoint = test;
      }
    }

    return closestPoint;
  }

  /***
   * Checks whether a point is inside, outside, or on the edge of a polygon.
   *
   * @param point       The point to test for containment.
   * @param tolerance   The distance the point can be from the edge of the polygon and still considered coincident.
   */
  public contains(
    point: Point,
    tolerance = shapetypesSettings.absoluteTolerance
  ): PointContainment {
    const boundaryContainment = this._boundary.contains(point, tolerance);
    if (boundaryContainment !== PointContainment.inside) {
      return boundaryContainment;
    }

    for (const hole of this._holes) {
      const holeContainment = hole.contains(point, tolerance);
      if (holeContainment === PointContainment.inside) {
        // Because we're inside a hole
        return PointContainment.outside;
      } else if (holeContainment === PointContainment.coincident) {
        return PointContainment.coincident;
      }
    }

    // If we go to here, the point is inside the boundary,
    // and not inside or on edge of a hole
    return PointContainment.inside;
  }

  /***
   * Checks whether another polygon has the same [[boundary]] and [[holes]]. Returns true if it does.
   * @param otherPolygon  Polygon to compare against.
   * @param tolerance     The amount the points can differ and still be considered equal.
   */
  public equals(
    otherPolygon: Polygon,
    tolerance = shapetypesSettings.absoluteTolerance
  ): boolean {
    if (this._holes.length !== otherPolygon.holes.length) {
      return false;
    }
    if (!this._boundary.equals(otherPolygon.boundary)) {
      return false;
    }

    const isEqual = this._holes.every((hole, index) =>
      hole.equals(otherPolygon.holes[index], tolerance)
    );
    return isEqual;
  }

  /***
   * Gets the polygon as a string in the format: `[boundary, ...holes]`.
   */
  public toString(): string {
    const strings = new Array<string>();
    for (const loop of [this._boundary, ...this._holes]) {
      strings.push(loop.toString());
    }
    return '[' + strings.join(',') + ']';
  }

  // -----------------------
  // BOOLEAN
  // -----------------------

  /**
   * Joins this polygon with another polygon or closed polyline. Returns the result.
   * @param joiner  Either a closed polyline, polygon, or a list of the two.
   * @returns      The polygon created when the two objects were joined.
   *                In some cases, this may return multiple polygons if the objects don't overlap.
   */
  public union(
    joiner: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ReadonlyArray<Polygon> {
    const result = pcUnion(this.asGeoJSON(), toMulti(joiner));
    return fromGeoJSON(result);
  }

  /**
   * Intersects this polygon with another polygon or closed polyline. Returns the overlapping portion.
   * @param intersector   Either a closed polyline, polygon, or a list of the two.
   * @returns       The overlapping portion of the two objects.
   *                In some cases, this may return an empty list if the polygons don't overlap.
   */
  public intersection(
    intersector: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ReadonlyArray<Polygon> {
    const result = pcIntersection(this.asGeoJSON(), toMulti(intersector));
    return fromGeoJSON(result);
  }

  /**
   * Subtracts a polygon or closed polyline from this polygon. Returns the part left over.
   * @param subtractor    Either a closed polyline, polygon, or a list of the two.
   * @returns       The part left over.
   */
  public difference(
    subtractor: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ReadonlyArray<Polygon> {
    const result = pcDifference(this.asGeoJSON(), toMulti(subtractor));
    return fromGeoJSON(result);
  }

  /**
   * Gets the polygon in the GeoJSON format: `[[[b_x1,b_y1],[b_x2,b_y2],...], [[h_x1,h_y1],[h_x2,h_y2],...],...]`.
   */
  public asGeoJSON(): pcPolygon {
    // This is the format needed for the clipping library
    // see: https://github.com/mfogel/polygon-clipping/issues/76
    const rings = new Array<Ring>();

    rings.push(this._boundary.asGeoJSON());

    for (const hole of this._holes) {
      rings.push(hole.asGeoJSON());
    }

    return rings;
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
   * import { Polygon } from 'shapetypes'
   *
   * const triangle = new Polyline([new Point(0, 0), new Point(1, 1), new Point(2, 0)], true);
   * const polygon = new Polygon(triangle);
   * console.log(polygon.boundary.from.toString());
   * // => (0,0)
   *
   * // Using a transform matrix
   * const matrix = Transform.translate(new Vector(3,4);
   * const shifted = polygon.transform(matrix);
   * console.log(shifted.boundary.from.toString());
   * // => (3,4)
   *
   * // Using the direct method
   * const otherShifted = polygon.translate(new Vector(3, 4));
   * console.log(otherShifted.boundary.from.toString());
   * // => (3,4)
   * ```
   *
   * @note If you're applying the same transformation a lot of geometry,
   * creating the [[Transform]] matrix once and calling this function is faster
   * than using the direct methods.
   *
   * @category Transform
   * @param change  The [[transform]] matrix to apply to the polygon.
   */
  public transform(change: Transform): this {
    const newBoundary = this._boundary.transform(change);
    const newHoles = this._holes.map(hole => hole.transform(change));

    // @ts-ignore
    return new Polygon(newBoundary, newHoles);
  }
}

// -----------------------
// HELPERS
// -----------------------

/**
 * @ignore
 * @param input
 */
/* istanbul ignore next */
function toMulti(
  input: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
): pcPolygon | pcPolygon[] {
  if (input instanceof Polyline) {
    return [input.asGeoJSON()];
  } else if (input instanceof Polygon) {
    return input.asGeoJSON();
  } else if (isPolylineArray(input)) {
    const geometry = new Array<pcPolygon>();
    for (const polyline of input) {
      geometry.push([polyline.asGeoJSON()]);
    }
    return geometry;
  } else if (isPolygonArray(input)) {
    const geometry = new Array<pcPolygon>();
    for (const polyline of input) {
      geometry.push(polyline.asGeoJSON());
    }
    return geometry;
  }
  throw new Error("Couldn't convert geometry for boolean");
}

/**
 * Converts the results of the PolygonClipping library into an array of Polyline's and Polygons
 *
 * @ignore
 *
 * @param multi
 * @return: A list of polygons and polylines.
 *              - If the operation didn't split the original geometry into pieces, this array will have only one item in it.
 *              - If the resulting object doesn't have any hole it'll be returned as a polyline. If it has holes, it'll be returned as a polygon.
 */
function fromGeoJSON(multi: MultiPolygon): ReadonlyArray<Polygon> {
  const outputs = new Array<Polygon>();

  for (const polygon of multi) {
    if (polygon.length === 0) {
      /* istanbul ignore next */
      continue;
    } else {
      outputs.push(Polygon.fromCoords(polygon));
    }
  }
  return outputs;
}
