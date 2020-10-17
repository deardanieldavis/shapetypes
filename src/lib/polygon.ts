// tslint:disable:no-let

import { BoundingBox } from './boundingBox';
import { Point } from './point';
import { Polyline } from './polyline';
import { isPolygonArray, isPolylineArray } from './utilities';

import * as PolygonClipping from 'polygon-clipping';
// tslint:disable-next-line:no-duplicate-imports
import { MultiPolygon, Polygon as ClipPolygon, Ring } from 'polygon-clipping';

// TODO: Orientation on creation

export class Polygon {

  // -----------------------
  // VARS
  // -----------------------
  private readonly _boundary: Polyline;
  private readonly _holes: readonly Polyline[];

  constructor(boundary: Polyline, holes?: readonly Polyline[] | undefined) {
    if (boundary.isClosed === false) {
      throw new Error('Boundary must be closed to turn into polygon');
    }
    this._boundary = boundary;

    if (holes === undefined) {
      this._holes = new Array<Polyline>();
    } else {
      for (const hole of holes) {
        if (hole.isClosed === false) {
          throw new Error('Polyline must be closed to test for containment');
        }
      }
      this._holes = holes;
    }
  }


  // -----------------------
  // GET
  // -----------------------

  get area(): number {
    let area = this._boundary.area;
    for(const hole of this._holes) {
      area -= hole.area;
    }
    return area;
  }

  get boundary(): Polyline {
    return this._boundary;
  }

  get boundingBox(): BoundingBox {
    return this._boundary.boundingBox;
  }

  get holes(): readonly Polyline[] {
    return this._holes;
  }







  /*******************************
   * PUBLIC
   *******************************/



  public closestPoint(point: Point): Point {
    let closestLength: number | undefined;
    let closestPoint: Point = point;

    for (const polyline of [this.boundary, ...this.holes]) {
      const test = polyline.closestPoint(point);
      const length = point.distanceTo(test);

      if (closestLength === undefined || length < closestLength) {
        closestLength = length;
        closestPoint = test;
      }
    }

    return closestPoint;
  }

  /*******************************
   * BOOLEAN
   *******************************/

  /**
   * Joins this polygon with another polyline or polygon.
   * @param joiner: Either a polyline, polygon, or a list of the two.
   * @returns:    A polyline or polygon representing the two objects joined together.
   *              Note: may return two objects if the original objects don't overlap
   */
  public union(
    joiner: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ReadonlyArray<Polyline | Polygon> {
    const result = PolygonClipping.union(
      this.asGeoJSON(),
      this.toMulti(joiner)
    );
    return fromGeoJSON(result);
  }

  public intersection(
    intersector: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ReadonlyArray<Polyline | Polygon> {
    const result = PolygonClipping.intersection(
      this.asGeoJSON(),
      this.toMulti(intersector)
    );
    return fromGeoJSON(result);
  }

  public difference(
    subtractor: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ReadonlyArray<Polyline | Polygon> {
    const result = PolygonClipping.difference(
      this.asGeoJSON(),
      this.toMulti(subtractor)
    );
    return fromGeoJSON(result);
  }

  /**
   *  Converts polygon into specific format needed by the PolygonClipping library.
   * (see: https://github.com/mfogel/polygon-clipping/issues/76)
   */
  public asGeoJSON(): ClipPolygon {
    const rings = new Array<Ring>();

    rings.push(this._boundary.asGeoJSON());

    for (const hole of this._holes) {
      rings.push(hole.asGeoJSON());
    }

    return rings;
  }

  private toMulti(
    input: Polyline | Polygon | readonly Polyline[] | readonly Polygon[]
  ): ClipPolygon | ClipPolygon[] {
    if (input instanceof Polyline) {
      return [input.asGeoJSON()];
    } else if (input instanceof Polygon) {
      return input.asGeoJSON();
    } else if (isPolylineArray(input)) {
      const geometry = new Array<ClipPolygon>();
      for (const polyline of input) {
        geometry.push([polyline.asGeoJSON()]);
      }
      return geometry;
    } else if (isPolygonArray(input)) {
      const geometry = new Array<ClipPolygon>();
      for (const polyline of input) {
        geometry.push(polyline.asGeoJSON());
      }
      return geometry;
    }
    throw new Error("Couldn't convert geometry for boolean");
  }
}

/**
 * Converts the results of the PolygonClipping library into an array of Polyline's and Polygons
 * @param multi
 * @return: A list of polygons and polylines.
 *              - If the operation didn't split the original geometry into pieces, this array will have only one item in it.
 *              - If the resulting object doesn't have any hole it'll be returned as a polyline. If it has holes, it'll be returned as a polygon.
 */
export function fromGeoJSON(
  multi: MultiPolygon
): ReadonlyArray<Polyline | Polygon> {
  const outputs = new Array<Polyline | Polygon>();

  for (const polygon of multi) {
    if (polygon.length < 1) {
      continue;
    }

    const boundary = Polyline.fromCoords(polygon[0]);

    if (polygon.length === 1) {
      outputs.push(boundary);
    } else {
      const holes = new Array<Polyline>();
      for (let i = 1; i < polygon.length; i++) {
        holes.push(Polyline.fromCoords(polygon[i]));
      }
      outputs.push(new Polygon(boundary, holes));
    }
  }
  return outputs;
}


